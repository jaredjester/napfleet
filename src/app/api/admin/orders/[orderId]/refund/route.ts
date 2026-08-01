import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createRefund } from "@/lib/coinflow/server";

/**
 * POST /api/admin/orders/[orderId]/refund
 * Process a full or partial refund through Coinflow.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  // TODO: Add proper admin authentication
  const { orderId } = await params;

  try {
    const body = await request.json();
    const { amountCents, reason } = body as {
      amountCents?: number;
      reason?: string;
    };

    // Fetch order with payment
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payments: {
          where: { status: { in: ["SETTLED", "PARTIALLY_REFUNDED"] } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        refunds: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const payment = order.payments[0];
    if (!payment) {
      return NextResponse.json({ error: "No settled payment found for this order" }, { status: 400 });
    }

    // Calculate refundable amount
    const totalRefunded = order.refunds
      .filter((r) => r.status === "COMPLETED")
      .reduce((sum, r) => sum + r.amountCents, 0);

    const refundAmount = amountCents || payment.fiatAmountCents - totalRefunded;

    if (refundAmount <= 0) {
      return NextResponse.json({ error: "No refundable amount remaining" }, { status: 400 });
    }

    if (refundAmount > payment.fiatAmountCents - totalRefunded) {
      return NextResponse.json(
        { error: `Cannot refund more than ${payment.fiatAmountCents - totalRefunded} cents` },
        { status: 400 }
      );
    }

    // Create internal pending refund
    const idempotencyKey = `refund_${order.id}_${Date.now()}`;

    const refund = await prisma.refund.create({
      data: {
        orderId: order.id,
        paymentId: payment.id,
        amountCents: refundAmount,
        currency: "USD",
        reason: reason || "customer_request",
        status: "PENDING",
        initiatedByAdminId: "admin", // TODO: use actual admin ID
      },
    });

    // Call Coinflow refund API
    const result = await createRefund({
      paymentId: payment.providerPaymentId,
      amountCents: refundAmount,
      reason,
      idempotencyKey,
    });

    if (result.error) {
      await prisma.refund.update({
        where: { id: refund.id },
        data: { status: "FAILED", failureReason: result.error },
      });
      return NextResponse.json(
        { error: `Refund failed: ${result.error}`, refundId: refund.id },
        { status: 500 }
      );
    }

    // Update refund with provider ID
    await prisma.refund.update({
      where: { id: refund.id },
      data: { providerRefundId: result.providerRefundId },
    });

    // Audit event
    await prisma.auditEvent.create({
      data: {
        actorType: "admin",
        actorId: "admin",
        action: "REFUND_REQUESTED",
        entityType: "Refund",
        entityId: refund.id,
        safeMetadata: JSON.stringify({
          amountCents: refundAmount,
          providerRefundId: result.providerRefundId,
        }),
        orderId: order.id,
      },
    });

    return NextResponse.json({
      refundId: refund.id,
      providerRefundId: result.providerRefundId,
      amountCents: refundAmount,
      status: "PENDING",
    });
  } catch (err) {
    console.error("Refund error:", err);
    return NextResponse.json(
      { error: "Refund processing failed" },
      { status: 500 }
    );
  }
}
