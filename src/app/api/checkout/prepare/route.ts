/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { Currency } from "@coinflowlabs/react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { validateEnv } from "@/lib/env";
import { canEnableCheckout } from "@/lib/validation/policies";
import { canPublish } from "@/lib/validation/catalog";
import { products } from "@/content/products";
import { createSessionKey, createCheckoutJwt } from "@/lib/coinflow/server";
import { createOrder, calculatePricing } from "@/lib/orders";
import { rateLimit, getRateLimitKey, Limiters } from "@/lib/rate-limit";
import type { PrepareCheckoutInput, PrepareCheckoutResponse } from "@/lib/coinflow/types";

const MAX_BODY_SIZE = 64 * 1024; // 64KB
const ATTEMPT_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Fail closed at module load: a prohibited secret in the environment must
// crash this module immediately (see validateEnv).
const envAtLoad = validateEnv();
if (!envAtLoad.valid) {
  console.warn(`[checkout/prepare] Environment issues at module load: ${envAtLoad.issues.join("; ")}`);
}

type OrderWithItems = Awaited<ReturnType<typeof createOrder>>;
type AttemptWithOrder = Prisma.CheckoutAttemptGetPayload<{
  include: { order: { include: { items: true } } };
}>;

/**
 * POST /api/checkout/prepare
 *
 * Server-authoritative checkout preparation. Fails closed — never test mode.
 * 1. Validates request schema
 * 2. Gates: environment (prod), policy readiness, catalog publish-readiness
 * 3. Idempotent replay when a clientIdempotencyKey matches an existing attempt
 * 4. Creates pending order with immutable snapshots
 * 5. Creates checkout attempt
 * 6. Generates Coinflow session key and checkout JWT
 * 7. Returns only safe checkout configuration
 */
export async function POST(request: NextRequest) {
  const correlationId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Rate limit
  const rlKey = getRateLimitKey(request);
  const { allowed } = await rateLimit(rlKey, Limiters.checkout.maxRequests, Limiters.checkout.windowMs);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please wait a moment.", correlationId },
      { status: 429 }
    );
  }

  // Read body once — needed in both try and catch scopes
  const rawText = await request.text();
  let body: PrepareCheckoutInput;
  try {
    body = JSON.parse(rawText) as PrepareCheckoutInput;
  } catch {
    return NextResponse.json({ error: "Invalid request body", correlationId }, { status: 400 });
  }

  try {
    // Validate body size
    if (rawText.length > MAX_BODY_SIZE) {
      return NextResponse.json({ error: "Request too large", correlationId }, { status: 413 });
    }

    // Validate required fields
    if (!body.items?.length || !body.customer?.email || !body.shippingAddress) {
      return NextResponse.json(
        { error: "Missing required fields: items, customer.email, shippingAddress", correlationId },
        { status: 400 }
      );
    }

    if (body.items.length > 20) {
      return NextResponse.json({ error: "Too many items", correlationId }, { status: 400 });
    }

    // ── Gates — run BEFORE creating an order ──────────────────────────────

    // 1. Environment gate: in production, checkout requires a fully valid
    //    configuration. Invalid → 503, never test mode.
    if ((process.env.COINFLOW_ENV || "sandbox") === "prod") {
      const env = validateEnv();
      if (!env.valid) {
        console.error(`[${correlationId}] Checkout blocked — invalid environment: ${env.issues.join("; ")}`);
        return NextResponse.json(
          { error: "Checkout temporarily unavailable", correlationId },
          { status: 503 }
        );
      }
    }

    // 2. Policy gate: checkout may only be enabled once all policies are ready.
    const policyCheck = canEnableCheckout();
    if (!policyCheck.allowed) {
      return NextResponse.json(
        { error: "Checkout not available", reasons: policyCheck.reasons, correlationId },
        { status: 503 }
      );
    }

    // 3. Catalog gate: every item must be publish-ready.
    for (const item of body.items) {
      const product = products.find((p) => p.handle === item.productId);
      if (!product || !canPublish(product)) {
        return NextResponse.json(
          { error: "Product not available", correlationId },
          { status: 400 }
        );
      }
    }

    // ── Idempotent replay ─────────────────────────────────────────────────
    // If the client retries with the same key, return the existing checkout
    // attempt and its order instead of creating a duplicate.
    const clientIdempotencyKey = body.clientIdempotencyKey?.trim();
    if (clientIdempotencyKey) {
      const existing = await prisma.checkoutAttempt.findUnique({
        where: { idempotencyKey: clientIdempotencyKey },
        include: { order: { include: { items: true } } },
      });
      if (existing) {
        return await replayCheckout(existing, correlationId);
      }
    }

    // Server-authoritative pricing (never trusts client prices)
    const pricing = await calculatePricing(
      body.items,
      body.shippingAddress as { country: string; state: string; postalCode: string },
      body.discountCode
    );

    // Get or create the NapFleet store
    let store = await prisma.store.findUnique({ where: { slug: "napfleet" } });
    if (!store) {
      store = await prisma.store.create({
        data: { slug: "napfleet", name: "NapFleet", legalName: "NapFleet Pet Co.", currency: "USD" },
      });
    }

    // Create pending order
    const order = await createOrder({
      items: body.items,
      customer: body.customer,
      shippingAddress: body.shippingAddress as unknown as Record<string, unknown>,
      discountCode: body.discountCode,
      storeId: store.id,
    });

    // Generate a stable payer ID (customer email hashed)
    const payerId = `napfleet_payer_${Buffer.from(body.customer.email.toLowerCase().trim()).toString("base64url").slice(0, 32)}`;

    // Create checkout attempt. The unique idempotencyKey guards against
    // concurrent duplicate submissions racing past the lookup above.
    const idempotencyKey = clientIdempotencyKey || `attempt_${order.id}_${Date.now()}`;
    let checkoutAttempt: Awaited<ReturnType<typeof prisma.checkoutAttempt.create>>;
    try {
      checkoutAttempt = await prisma.checkoutAttempt.create({
        data: {
          orderId: order.id,
          provider: "coinflow",
          payerId,
          amountCents: pricing.totalCents,
          currency: "USD",
          status: "CREATED",
          attemptNumber: 1,
          idempotencyKey,
          expiresAt: new Date(Date.now() + ATTEMPT_TTL_MS),
        },
      });
    } catch (err) {
      // Unique constraint on idempotencyKey — a concurrent duplicate request
      // with the same client key raced us. Replay the existing attempt.
      if ((err as { code?: string }).code === "P2002" && clientIdempotencyKey) {
        const existing = await prisma.checkoutAttempt.findUnique({
          where: { idempotencyKey: clientIdempotencyKey },
          include: { order: { include: { items: true } } },
        });
        if (existing) {
          return await replayCheckout(existing, correlationId);
        }
      }
      throw err;
    }

    // Generate Coinflow session key and checkout JWT. If Coinflow is
    // unavailable the checkout fails closed with 503 — never test mode.
    let sessionKey: string;
    let jwtToken: string | undefined;
    try {
      const sessionResult = await createSessionKey(payerId);
      sessionKey = sessionResult.sessionKey;

      const jwtResult = await createCheckoutJwt({
        subtotal: { cents: pricing.totalCents, currency: Currency.USD },
        customerInfo: {
          email: body.customer.email,
          firstName: body.customer.firstName,
          lastName: body.customer.lastName,
          address: body.shippingAddress.line1,
          city: body.shippingAddress.city,
          state: body.shippingAddress.state,
          zip: body.shippingAddress.postalCode,
          country: body.shippingAddress.country,
        },
        webhookInfo: {
          orderNumber: order.publicOrderNumber,
          orderId: order.id,
          checkoutAttemptId: checkoutAttempt.id,
          correlationId,
        },
        chargebackProtectionData: pricing.lineItems.map((li) => ({
          itemClass: "physical",
          name: li.title,
          sku: li.sku,
          quantity: li.quantity,
          unitPrice: { valueInCurrency: li.unitPriceCents / 100, currency: "USD" },
        })),
        settlementType: "USDC",
        sessionKey,
      });
      jwtToken = jwtResult;
    } catch (err) {
      console.error(`[${correlationId}] Coinflow session/JWT error:`, err);
      return NextResponse.json(
        { error: "Checkout temporarily unavailable", correlationId },
        { status: 503 }
      );
    }

    // Update checkout attempt with expiration
    await prisma.checkoutAttempt.update({
      where: { id: checkoutAttempt.id },
      data: { status: "READY", expiresAt: new Date(Date.now() + ATTEMPT_TTL_MS) },
    });

    return NextResponse.json(buildCheckoutResponse(order, checkoutAttempt, sessionKey, jwtToken));
  } catch (err) {
    console.error(`[${correlationId}] Checkout prepare error:`, err);
    const message = err instanceof Error ? err.message : "Checkout preparation failed";

    // Sandbox fallback: if the database is unavailable (e.g. SQLite on Vercel
    // serverless), return a memory-based checkout response so the UI can be tested.
    // This must NEVER be enabled in production.
    const isDatabaseError =
      message.includes("Can't reach database") ||
      message.includes("database") ||
      message.includes("prisma") ||
      message.includes("SQLITE") ||
      message.includes("connection");

    if (isDatabaseError && process.env.COINFLOW_ENV !== "prod") {
      console.warn(`[${correlationId}] Database unavailable in sandbox — returning memory-based checkout for UI testing`);
      if (body.items?.length > 0) {
        return NextResponse.json(buildSandboxCheckoutResponse(body.items));
      }
    }

    const safeMessage = message.includes("not found") || message.includes("unavailable")
      ? message
      : "Unable to prepare checkout. Please try again.";
    return NextResponse.json({ error: safeMessage, correlationId }, { status: 500 });
  }
}

/**
 * Replay an existing checkout attempt for a repeated clientIdempotencyKey.
 * Refreshes the attempt expiry and regenerates the Coinflow session key and
 * JWT so the returned checkout remains usable. Fails closed with 503 if
 * Coinflow is unavailable.
 */
async function replayCheckout(
  attempt: AttemptWithOrder,
  correlationId: string
): Promise<NextResponse> {
  const order = attempt.order;
  const address = parseAddressSnapshot(order.shippingAddressSnapshot);

  try {
    const sessionResult = await createSessionKey(attempt.payerId);
    const sessionKey = sessionResult.sessionKey;

    const jwtToken = await createCheckoutJwt({
      subtotal: { cents: order.totalCents, currency: Currency.USD },
      customerInfo: {
        email: order.customerEmail,
        firstName: order.customerFirstName || undefined,
        lastName: order.customerLastName || undefined,
        address: address.line1,
        city: address.city,
        state: address.state,
        zip: address.postalCode,
        country: address.country,
      },
      webhookInfo: {
        orderNumber: order.publicOrderNumber,
        orderId: order.id,
        checkoutAttemptId: attempt.id,
        correlationId,
      },
      chargebackProtectionData: order.items.map((item) => ({
        itemClass: "physical",
        name: item.productTitleSnapshot,
        sku: item.skuSnapshot,
        quantity: item.quantity,
        unitPrice: { valueInCurrency: item.unitPriceCents / 100, currency: "USD" },
      })),
      settlementType: "USDC",
      sessionKey,
    });

    // Refresh the attempt so the returned checkout remains usable.
    await prisma.checkoutAttempt.update({
      where: { id: attempt.id },
      data: { status: "READY", expiresAt: new Date(Date.now() + ATTEMPT_TTL_MS) },
    });

    return NextResponse.json(buildCheckoutResponse(order, attempt, sessionKey, jwtToken));
  } catch (err) {
    console.error(`[${correlationId}] Checkout replay failed (Coinflow unavailable):`, err);
    return NextResponse.json(
      { error: "Checkout temporarily unavailable", correlationId },
      { status: 503 }
    );
  }
}

function buildCheckoutResponse(
  order: OrderWithItems,
  attempt: { id: string },
  sessionKey: string,
  jwtToken?: string
): PrepareCheckoutResponse {
  return {
    orderNumber: order.publicOrderNumber,
    checkoutAttemptId: attempt.id,
    merchantId: process.env.NEXT_PUBLIC_COINFLOW_MERCHANT_ID || "",
    environment: (process.env.NEXT_PUBLIC_COINFLOW_ENV || "sandbox") as "sandbox" | "prod",
    sessionKey,
    jwtToken,
    subtotal: { cents: order.totalCents, currency: Currency.USD },
    displayOrder: {
      items: order.items.map((item) => ({
        title: item.productTitleSnapshot,
        variant: item.variantTitleSnapshot,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        image: item.imageSnapshot || undefined,
      })),
      subtotalCents: order.subtotalCents,
      discountCents: order.discountCents,
      shippingCents: order.shippingCents,
      taxCents: order.taxCents,
      totalCents: order.totalCents,
    },
  };
}

function parseAddressSnapshot(snapshot: string): Record<string, string> {
  try {
    return JSON.parse(snapshot) as Record<string, string>;
  } catch {
    return {};
  }
}

/**
 * Sandbox-only fallback when the database is unavailable.
 * Constructs a checkout response from in-memory product data
 * so the UI flow can be tested end-to-end.
 * NEVER enabled in production (guarded by COINFLOW_ENV check).
 */
function buildSandboxCheckoutResponse(
  items: Array<{ productId: string; variantId: string; quantity: number }>
): PrepareCheckoutResponse {
  const displayItems: PrepareCheckoutResponse["displayOrder"]["items"] = [];
  let subtotalCents = 0;

  for (const item of items) {
    const product = products.find((p) => p.handle === item.productId);
    const variant = product?.variants.find((v) => v.id === item.variantId);
    const price = variant?.price ?? 6999;
    const lineTotal = price * item.quantity;
    subtotalCents += lineTotal;
    displayItems.push({
      title: product?.title ?? item.productId,
      variant: variant?.title ?? "Default",
      quantity: item.quantity,
      unitPriceCents: price,
      image: product?.images[0],
    });
  }

  const shippingCents = 999;
  const taxCents = Math.round(subtotalCents * 0.08);
  const totalCents = subtotalCents + shippingCents + taxCents;

  return {
    orderNumber: `NF-SBOX-${Date.now().toString(36).toUpperCase()}`,
    checkoutAttemptId: `sandbox_${Date.now()}`,
    merchantId: process.env.NEXT_PUBLIC_COINFLOW_MERCHANT_ID || "",
    environment: (process.env.NEXT_PUBLIC_COINFLOW_ENV || "sandbox") as "sandbox" | "prod",
    sessionKey: "",
    subtotal: { cents: totalCents, currency: Currency.USD },
    displayOrder: {
      items: displayItems,
      subtotalCents,
      discountCents: 0,
      shippingCents,
      taxCents,
      totalCents,
    },
  };
}
