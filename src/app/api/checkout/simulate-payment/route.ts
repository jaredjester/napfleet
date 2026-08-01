import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/checkout/simulate-payment
 *
 * Sandbox-only: simulates a completed payment so the checkout flow
 * can be demoed end-to-end without a real Coinflow transaction.
 * Only works when COINFLOW_ENV !== "prod".
 */
export async function POST(request: NextRequest) {
  if ((process.env.COINFLOW_ENV || "sandbox") === "prod") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { orderNumber } = body;

    if (!orderNumber) {
      return NextResponse.json({ error: "orderNumber is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { publicOrderNumber: orderNumber },
      include: { checkoutAttempts: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const attempt = order.checkoutAttempts[0];

    // Create a simulated payment
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        checkoutAttemptId: attempt?.id || order.id,
        provider: "sandbox",
        providerPaymentId: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        fiatAmountCents: order.totalCents,
        fiatCurrency: order.currency,
        settlementAsset: "USDC",
        settlementNetwork: "solana",
        status: "SETTLED",
        settledAt: new Date(),
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        paidAt: new Date(),
      },
    });

    // Update checkout attempt
    if (attempt) {
      await prisma.checkoutAttempt.update({
        where: { id: attempt.id },
        data: { status: "COMPLETED" },
      });
    }

    // Log audit event
    await prisma.auditEvent.create({
      data: {
        actorType: "system",
        actorId: "sandbox-simulator",
        action: "PAYMENT_SIMULATED",
        entityType: "Order",
        entityId: order.id,
        orderId: order.id,
        safeMetadata: JSON.stringify({
          orderNumber,
          amountCents: order.totalCents,
          providerPaymentId: payment.providerPaymentId,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      orderNumber,
      paymentStatus: "PAID",
      simulatedPaymentId: payment.providerPaymentId,
    });
  } catch (err) {
    console.error("Simulate payment error:", err);

    // Log to audit
    try {
      await prisma.auditEvent.create({
        data: {
          actorType: "system",
          actorId: "sandbox-simulator",
          action: "PAYMENT_SIMULATION_FAILED",
          entityType: "System",
          entityId: "checkout",
          safeMetadata: JSON.stringify({
            error: err instanceof Error ? err.message : "Unknown",
          }),
        },
      });
    } catch { /* best effort */ }

    return NextResponse.json(
      { error: "Failed to simulate payment" },
      { status: 500 }
    );
  }
}
