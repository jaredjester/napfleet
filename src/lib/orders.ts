import { prisma } from "./db";
import { products } from "@/content/products";

const ORDER_PREFIX = "NF";

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
 */
export function calculatePricing(
  items: Array<{ productId: string; variantId: string; quantity: number }>,
  _shippingAddress?: { country: string; state: string; postalCode: string },
  _discountCode?: string
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const __sfx = _shippingAddress;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const __dc = _discountCode;
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
  }> = [];

  for (const item of items) {
    const product = products.find((p) => p.handle === item.productId);
    if (!product) throw new Error(`Product not found: ${item.productId}`);
    if (!product.publishReady) throw new Error(`Product not available: ${item.productId}`);

    const variant = product.variants.find((v) => v.id === item.variantId);
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
    });
  }

  // Shipping: flat $9.99 for MVP
  const shippingCents = 999;

  // Tax: simplified 8% for MVP (real implementation would use a tax service)
  const taxCents = Math.round(subtotalCents * 0.08);

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
  const pricing = calculatePricing(params.items, undefined, params.discountCode);

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
