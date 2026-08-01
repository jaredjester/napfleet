/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPaymentStatus } from "@/lib/coinflow/server";

/**
 * POST /api/cron/coinflow-reconcile
 *
 * Automated reconciliation job. Protected by CRON_SECRET.
 * Synchronizes application state with Coinflow for:
 * - Missed webhook events
 * - Stale checkout attempts
 * - Pending refunds
 * - Open disputes
 */
export async function POST(request: NextRequest) {
  // Protect the endpoint
  const authHeader = request.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET || "dev-secret";

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, number> = {};

  try {
    // 1. Find stale checkout attempts (older than 15 min, still in CREATED/READY)
    const staleAttempts = await prisma.checkoutAttempt.findMany({
      where: {
        status: { in: ["CREATED", "READY", "OPENED", "PROCESSING"] },
        createdAt: { lt: new Date(Date.now() - 15 * 60 * 1000) },
      },
    });

    for (const attempt of staleAttempts) {
      await prisma.checkoutAttempt.update({
        where: { id: attempt.id },
        data: { status: "EXPIRED" },
      });
    }
    results.staleAttemptsExpired = staleAttempts.length;

    // 2. Find settled payments missing USDC metadata
    const settledMissingMetadata = await prisma.payment.findMany({
      where: {
        status: "SETTLED",
        usdcGrossAmount: null,
        updatedAt: { lt: new Date(Date.now() - 30 * 60 * 1000) },
      },
    });

    for (const payment of settledMissingMetadata) {
      try {
        const providerStatus = await getPaymentStatus(payment.providerPaymentId);
        if (providerStatus) {
          const updates: Record<string, unknown> = {};
          if (providerStatus.usdcGrossAmount) updates.usdcGrossAmount = String(providerStatus.usdcGrossAmount);
          if (providerStatus.usdcNetAmount) updates.usdcNetAmount = String(providerStatus.usdcNetAmount);
          if (providerStatus.txSignature) updates.settlementTransactionSignature = providerStatus.txSignature as string;
          if (providerStatus.networkFee) updates.networkFeeAmount = String(providerStatus.networkFee);

          if (Object.keys(updates).length > 0) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: updates as any,
            });
          }
        }
      } catch {
        // Skip individual failures
      }
    }
    results.settledMetadataUpdated = settledMissingMetadata.length;

    // 3. Find pending refunds to reconcile
    const pendingRefunds = await prisma.refund.findMany({
      where: { status: "PENDING", providerRefundId: { not: null } },
      include: { payment: true },
    });

    for (const refund of pendingRefunds) {
      try {
        const providerStatus = await getPaymentStatus(refund.payment.providerPaymentId);
        if (providerStatus?.refunds) {
          const providerRefund = (providerStatus.refunds as Array<Record<string, unknown>>).find(
            (r) => r.id === refund.providerRefundId
          );
          if (providerRefund?.status === "completed") {
            await prisma.refund.update({
              where: { id: refund.id },
              data: { status: "COMPLETED", completedAt: new Date() },
            });
            results.refundsCompleted = (results.refundsCompleted || 0) + 1;
          }
        }
      } catch {
        // Skip individual failures
      }
    }

    // 4. Retry failed provider event processing
    const failedEvents = await prisma.providerEvent.findMany({
      where: {
        processingStatus: "FAILED",
        attemptCount: { lt: 5 },
      },
    });

    for (const event of failedEvents) {
      await prisma.providerEvent.update({
        where: { id: event.id },
        data: {
          processingStatus: "PENDING",
          attemptCount: event.attemptCount + 1,
        },
      });
    }
    results.eventsRetried = failedEvents.length;

    // 5. Find orders requiring review (settled but fraud rejected)
    const reviewOrders = await prisma.order.count({
      where: { paymentStatus: "PAYMENT_REVIEW_REQUIRED" },
    });
    results.ordersAwaitingReview = reviewOrders;

    return NextResponse.json({
      reconciled: true,
      ...results,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Reconciliation error:", err);
    return NextResponse.json(
      { error: "Reconciliation failed", details: err instanceof Error ? err.message : "Unknown" },
      { status: 500 }
    );
  }
}
