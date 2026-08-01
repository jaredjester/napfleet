import { prisma } from "./db";
import { getStoreConfig } from "@/lib/store-config";
import type { TaxProvider } from "./tax/types";
import type { ShippingProvider } from "./shipping/types";
import { mockTaxProvider } from "./tax/mock";
import { mockShippingProvider } from "./shipping/mock";

const ORDER_PREFIX = "NF";

/**
 * Provider selection — mock by default. Swap these for real providers
 * (e.g. Stripe Tax, EasyPost) once configured, keyed off env vars.
 */
const taxProvider: TaxProvider = mockTaxProvider;
const shippingProvider: ShippingProvider = mockShippingProvider;

/**
 * Generate a human-readable public order number.
 * Format: NF-2026-8K4Q2M
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No 0/O, 1/I confusion
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${ORDER_PREFIX}-${year}-${suffix}`;
}

/**
 * Server-authoritative pricing calculation.
 * Never trusts client-submitted prices.
 *
 * Tax and shipping rates come from the configured providers
 * (flat 8% tax and flat $9.99 shipping mocks by default).
 */
export async function calculatePricing(
  items: Array<{ productId: string; variantId: string; quantity: number }>,
  shippingAddress?: { country: string; state: string; postalCode: string },
  _discountCode?: string
) {
  void _discountCode; // placeholder — discount provider integration point
  let subtotalCents = 0;
  const lineItems: Array<{
    productId: string;
    variantId: string;
    title: string;
    variantTitle: string;
    sku: string;
    unitPriceCents: number;
    quantity: number;
    lineTotalCents: number;
    image?: string;
    preorderEstimate: string;
    weight?: string;
  }> = [];

  const config = getStoreConfig();

  for (const item of items) {
    const product = await config.getProduct(item.productId);
    if (!product) throw new Error(`Product not found: ${item.productId}`);
    if (!product.publishReady) throw new Error(`Product not available: ${item.productId}`);

    // Match variant by ID first. If the client-side file provider and
    // server-side DB provider have different IDs, fall back to SKU match
    // or the first available variant (most products have a single "Default" variant).
    let variant = product.variants.find((v) => v.id === item.variantId);
    if (!variant) {
      // Try SKU match (SKUs are consistent across providers)
      variant = product.variants.find((v) => v.sku && v.sku === item.variantId);
    }
    if (!variant) {
      // Fall back to first available variant
      variant = product.variants.find((v) => v.available) ?? product.variants[0];
    }
    if (!variant) throw new Error(`Variant not found: ${item.variantId}`);
    if (!variant.available) throw new Error(`Variant unavailable: ${item.variantId}`);

    if (item.quantity < 1 || item.quantity > 99) {
      throw new Error(`Invalid quantity: ${item.quantity}`);
    }

    const lineTotal = variant.price * item.quantity;
    subtotalCents += lineTotal;

    lineItems.push({
      productId: product.handle,
      variantId: variant.id,
      title: product.title,
      variantTitle: variant.title,
      sku: variant.sku,
      unitPriceCents: variant.price,
      quantity: item.quantity,
      lineTotalCents: lineTotal,
      image: product.images[0],
      preorderEstimate: `Approximately ${product.preorderEstimateWeeks} weeks`,
      weight: product.productWeight,
    });
  }

  const address: { country: string; state: string; postalCode: string } =
    shippingAddress ?? { country: "US", state: "", postalCode: "" };

  // Shipping and tax via the configured providers
  const [shippingRate, tax] = await Promise.all([
    shippingProvider.calculateRate({
      items: lineItems.map((li) => ({ weight: li.weight, quantity: li.quantity })),
      shippingAddress: address,
    }),
    taxProvider.calculateTax({ subtotalCents, shippingAddress: address }),
  ]);

  const shippingCents = shippingRate.rateCents;
  const taxCents = tax.taxCents;

  // Discount: placeholder for future implementation
  const discountCents = 0;

  const totalCents = subtotalCents - discountCents + shippingCents + taxCents;

  return {
    lineItems,
    subtotalCents,
    discountCents,
    shippingCents,
    taxCents,
    totalCents,
    shippingCarrier: shippingRate.carrier,
    shippingEstimatedDays: shippingRate.estimatedDays,
  };
}

/**
 * Create a pending order with immutable snapshots.
 */
export async function createOrder(params: {
  items: Array<{ productId: string; variantId: string; quantity: number }>;
  customer: { email: string; firstName?: string; lastName?: string; phone?: string };
  shippingAddress: Record<string, unknown>;
  discountCode?: string;
  storeId: string;
}) {
  const pricing = await calculatePricing(
    params.items,
    params.shippingAddress as { country: string; state: string; postalCode: string } | undefined,
    params.discountCode
  );

  const publicOrderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      storeId: params.storeId,
      publicOrderNumber,
      customerEmail: params.customer.email,
      customerFirstName: params.customer.firstName || "",
      customerLastName: params.customer.lastName || "",
      customerPhone: params.customer.phone,
      shippingAddressSnapshot: JSON.stringify(params.shippingAddress),
      subtotalCents: pricing.subtotalCents,
      discountCents: pricing.discountCents,
      shippingCents: pricing.shippingCents,
      taxCents: pricing.taxCents,
      totalCents: pricing.totalCents,
      currency: "USD",
      paymentStatus: "PENDING_PAYMENT",
      fulfillmentStatus: "PREORDER",
      appliedDiscountCode: params.discountCode,
      items: {
        create: pricing.lineItems.map((li) => ({
          productId: li.productId,
          variantId: li.variantId,
          skuSnapshot: li.sku,
          productTitleSnapshot: li.title,
          variantTitleSnapshot: li.variantTitle,
          sizeSnapshot: li.variantTitle,
          imageSnapshot: li.image || "",
          preorderEstimateSnapshot: li.preorderEstimate,
          unitPriceCents: li.unitPriceCents,
          quantity: li.quantity,
          lineTotalCents: li.lineTotalCents,
        })),
      },
    },
    include: { items: true },
  });

  return order;
}

/**
 * Determine if an order is in a state that allows checkout.
 */
export function canCheckout(order: { paymentStatus: string; canceledAt: Date | null }): boolean {
  if (order.canceledAt) return false;
  return order.paymentStatus === "PENDING_PAYMENT" || order.paymentStatus === "FAILED";
}
