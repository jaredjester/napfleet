import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/orders/[orderNumber]/status
 * Returns safe order status for customer-facing polling.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { publicOrderNumber: orderNumber },
    include: { items: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Only return safe, customer-relevant data
  return NextResponse.json({
    orderNumber: order.publicOrderNumber,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    totalCents: order.totalCents,
    currency: order.currency,
    items: order.items.map((item) => ({
      title: item.productTitleSnapshot,
      variant: item.variantTitleSnapshot,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
    })),
    lastPayment: order.payments[0]
      ? {
          status: order.payments[0].status,
          authorizedAt: order.payments[0].authorizedAt,
          settledAt: order.payments[0].settledAt,
        }
      : null,
    createdAt: order.createdAt,
  });
}
