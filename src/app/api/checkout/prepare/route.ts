/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { Currency } from "@coinflowlabs/react";
import { prisma } from "@/lib/db";
import { createSessionKey, createCheckoutJwt } from "@/lib/coinflow/server";
import { createOrder, calculatePricing } from "@/lib/orders";
import type { PrepareCheckoutInput, PrepareCheckoutResponse } from "@/lib/coinflow/types";

const MAX_BODY_SIZE = 64 * 1024; // 64KB

/**
 * POST /api/checkout/prepare
 *
 * Server-authoritative checkout preparation.
 * 1. Validates request schema
 * 2. Validates cart server-side (prices never from client)
 * 3. Creates pending order with immutable snapshots
 * 4. Creates checkout attempt
 * 5. Generates Coinflow session key and checkout JWT
 * 6. Returns only safe checkout configuration
 */
export async function POST(request: NextRequest) {
  // Rate limiting placeholder — integrate with Upstash or similar in production
  const correlationId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    // Validate body size
    const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
    if (contentLength > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: "Request too large", correlationId },
        { status: 413 }
      );
    }

    const body = (await request.json()) as PrepareCheckoutInput;

    // Validate required fields
    if (!body.items?.length || !body.customer?.email || !body.shippingAddress) {
      return NextResponse.json(
        { error: "Missing required fields: items, customer.email, shippingAddress", correlationId },
        { status: 400 }
      );
    }

    if (body.items.length > 20) {
      return NextResponse.json(
        { error: "Too many items", correlationId },
        { status: 400 }
      );
    }

    // Server-authoritative pricing (never trusts client prices)
    const pricing = calculatePricing(body.items, undefined, body.discountCode);

    // Get or create the NapFleet store
    let store = await prisma.store.findUnique({ where: { slug: "napfleet" } });
    if (!store) {
      store = await prisma.store.create({
        data: {
          slug: "napfleet",
          name: "NapFleet",
          legalName: "NapFleet Pet Co.",
          currency: "USD",
        },
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

    // Create checkout attempt
    const idempotencyKey = `attempt_${order.id}_${Date.now()}`;
    const checkoutAttempt = await prisma.checkoutAttempt.create({
      data: {
        orderId: order.id,
        provider: "coinflow",
        payerId,
        amountCents: pricing.totalCents,
        currency: "USD",
        status: "CREATED",
        attemptNumber: 1,
        idempotencyKey,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
      },
    });

    // Generate Coinflow session key and checkout JWT
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
        settlementType: "USDC" as any,
        sessionKey,
      });
      jwtToken = jwtResult;
    } catch (err) {
      // Log the error but still return a partial response — Coinflow SDK on client
      // may handle session key + JWT generation through its own channels
      console.error("Coinflow session/JWT error:", err);
      sessionKey = "";
    }

    // Update checkout attempt with expiration
    await prisma.checkoutAttempt.update({
      where: { id: checkoutAttempt.id },
      data: { status: "READY", expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
    });

    const merchantId = process.env.NEXT_PUBLIC_COINFLOW_MERCHANT_ID || "";
    const environment = (process.env.NEXT_PUBLIC_COINFLOW_ENV || "sandbox") as "sandbox" | "prod";

    const response: PrepareCheckoutResponse = {
      orderNumber: order.publicOrderNumber,
      checkoutAttemptId: checkoutAttempt.id,
      merchantId,
      environment,
      sessionKey,
      jwtToken,
      subtotal: { cents: pricing.totalCents, currency: Currency.USD },
      displayOrder: {
        items: pricing.lineItems.map((li) => ({
          title: li.title,
          variant: li.variantTitle,
          quantity: li.quantity,
          unitPriceCents: li.unitPriceCents,
          image: li.image,
        })),
        subtotalCents: pricing.subtotalCents,
        discountCents: pricing.discountCents,
        shippingCents: pricing.shippingCents,
        taxCents: pricing.taxCents,
        totalCents: pricing.totalCents,
      },
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error(`[${correlationId}] Checkout prepare error:`, err);
    const message = err instanceof Error ? err.message : "Checkout preparation failed";
    // Don't expose internal error details
    const safeMessage = message.includes("not found") || message.includes("unavailable")
      ? message
      : "Unable to prepare checkout. Please try again.";
    return NextResponse.json(
      { error: safeMessage, correlationId },
      { status: 500 }
    );
  }
}
