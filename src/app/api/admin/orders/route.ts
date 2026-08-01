import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/admin/orders
 * List orders with payment and fulfillment status.
 * Requires admin authorization in production.
 */
export async function GET(request: NextRequest) {
  // TODO: Add proper admin authentication
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const where: Record<string, unknown> = {};
  if (status) where.paymentStatus = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        payments: { orderBy: { createdAt: "desc" }, take: 1 },
        fulfillments: { take: 1 },
        _count: { select: { refunds: true, disputes: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.order.count({ where }),
  ]);

  const result = orders.map((o) => ({
    id: o.id,
    orderNumber: o.publicOrderNumber,
    customerEmail: o.customerEmail,
    customerName: `${o.customerFirstName} ${o.customerLastName}`.trim() || "—",
    totalCents: o.totalCents,
    currency: o.currency,
    paymentStatus: o.paymentStatus,
    fulfillmentStatus: o.fulfillmentStatus,
    lastPayment: o.payments[0]
      ? {
          providerPaymentId: o.payments[0].providerPaymentId,
          status: o.payments[0].status,
          fraudProtectionStatus: o.payments[0].fraudProtectionStatus,
          settlementAsset: o.payments[0].settlementAsset,
          settledAt: o.payments[0].settledAt,
        }
      : null,
    refundCount: o._count.refunds,
    disputeCount: o._count.disputes,
    createdAt: o.createdAt,
  }));

  return NextResponse.json({ orders: result, total, limit, offset });
}
