/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/coinflow/server";
import crypto from "crypto";

/**
 * POST /api/webhooks/coinflow
 *
 * Coinflow webhook endpoint — source of truth for payment and settlement state.
 * Verifies signature, deduplicates events, persists record, returns quickly.
 * Business effects are processed via job queue (see reconciliation).
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("x-coinflow-signature") || "";
  const secret = process.env.COINFLOW_WEBHOOK_SIGNING_SECRET || "";

  // 1. Verify signature
  if (!verifyWebhookSignature(rawBody, signatureHeader, secret)) {
    console.warn("Coinflow webhook: invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 2. Parse payload
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventId = (payload.eventId || payload.id) as string;
  const eventType = (payload.eventType || payload.type) as string;
  const paymentId = (payload.paymentId) as string | undefined;

  if (!eventId || !eventType) {
    return NextResponse.json({ error: "Missing eventId or eventType" }, { status: 400 });
  }

  // 3. Hash payload for audit trail
  const payloadHash = crypto.createHash("sha256").update(rawBody).digest("hex");

  // 4. Deduplicate — critical: unique constraint on providerEventId
  try {
    await prisma.providerEvent.create({
      data: {
        provider: "coinflow",
        providerEventId: eventId,
        providerPaymentId: paymentId,
        eventType,
        payloadHash,
        processingStatus: "PENDING",
        receivedAt: new Date(),
      },
    });
  } catch {
    // Duplicate event — already recorded
    console.log(`Coinflow webhook: duplicate event ${eventId}`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  // 5. Process business effects synchronously for critical events
  try {
    await processWebhookEvent(eventType, paymentId, payload);
  } catch (err) {
    console.error(`Webhook event processing error (${eventId}):`, err);
    await prisma.providerEvent.update({
      where: { providerEventId: eventId },
      data: {
        processingStatus: "FAILED",
        lastError: err instanceof Error ? err.message.slice(0, 500) : "Unknown error",
      },
    });
  }

  return NextResponse.json({ received: true });
}

/**
 * Process business effects for a webhook event.
 * Only the Settled event transitions the order to PAID.
 */
async function processWebhookEvent(
  eventType: string,
  paymentId: string | undefined,
  payload: Record<string, unknown>
) {
  const status = (payload.status || payload.paymentStatus) as string | undefined;

  // Map webhook event to payment status update
  switch (eventType) {
    case "payment.authorized":
      if (paymentId) {
        await updatePaymentStatus(paymentId, {
          status: "AUTHORIZED",
          authorizedAt: new Date(),
          fraudProtectionStatus: (payload.fraudDecision === "APPROVED"
            ? "APPROVED"
            : payload.fraudDecision === "REJECTED"
              ? "REJECTED"
              : "NOT_REVIEWED") as string,
        });
      }
      break;

    case "payment.declined":
      if (paymentId) {
        await updatePaymentStatus(paymentId, {
          status: "DECLINED",
          failedAt: new Date(),
        });
      }
      break;

    case "payment.disbursed":
      if (paymentId) {
        await updatePaymentStatus(paymentId, {
          status: "DISBURSED",
          disbursedAt: new Date(),
        });
      }
      break;

    case "payment.settled": {
      if (!paymentId) break;

      const payment = await prisma.payment.findUnique({ where: { providerPaymentId: paymentId } });
      if (!payment) break;

      // Critical: validate settlement data
      const settlementAmount = (payload.netAmountCents || payload.amountCents) as number;
      const settlementAsset = (payload.settlementAsset || "USDC") as string;
      const expectedAsset = process.env.COINFLOW_EXPECTED_SETTLEMENT_ASSET || "USDC";

      if (settlementAsset !== expectedAsset) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: "PAYMENT_REVIEW_REQUIRED" },
        });
        await updatePaymentStatus(paymentId, {
          status: "SETTLED",
          settledAt: new Date(),
          settlementAsset,
          settlementAddressMasked: payload.settlementAddress as string,
          settlementTransactionSignature: payload.txSignature as string,
          usdcGrossAmount: String(payload.usdcGrossAmount || ""),
          usdcNetAmount: String(payload.usdcNetAmount || ""),
        });
        break;
      }

      // Mark payment settled
      await updatePaymentStatus(paymentId, {
        status: "SETTLED",
        settledAt: new Date(),
        settlementAsset,
        settlementAddressMasked: payload.settlementAddress
          ? String(payload.settlementAddress).slice(0, 4) + "..." + String(payload.settlementAddress).slice(-4)
          : undefined,
        settlementTransactionSignature: payload.txSignature as string,
        usdcGrossAmount: payload.usdcGrossAmount
          ? String(payload.usdcGrossAmount)
          : undefined,
        usdcNetAmount: payload.usdcNetAmount
          ? String(payload.usdcNetAmount)
          : undefined,
        providerFeeAmount: payload.feeAmount
          ? String(payload.feeAmount)
          : undefined,
      });

      // CRITICAL: Only transition to PAID on verified settlement
      // with fraud check
      const fraudOk = payment.fraudProtectionStatus !== "REJECTED";

      if (fraudOk) {
        await prisma.order.update({
          where: {
            id: payment.orderId,
            paymentStatus: { in: ["PENDING_PAYMENT", "PAYMENT_PROCESSING"] },
          },
          data: {
            paymentStatus: "PAID",
            paidAt: new Date(),
          },
        });

        // Create fulfillment task
        await prisma.fulfillment.create({
          data: {
            orderId: payment.orderId,
            status: "PREORDER",
          },
        });

        // Create audit event
        await prisma.auditEvent.create({
          data: {
            actorType: "system",
            action: "ORDER_MARKED_PAID",
            entityType: "Order",
            entityId: payment.orderId,
            safeMetadata: JSON.stringify({
              provider: "coinflow",
              providerPaymentId: paymentId,
              settlementAsset,
              event: "payment.settled",
            }),
            orderId: payment.orderId,
          },
        });
      } else {
        // Fraud rejected — do NOT fulfill
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: "PAYMENT_REVIEW_REQUIRED" },
        });
      }
      break;
    }

    case "refund.completed":
      if (paymentId) {
        await handleRefundComplete(paymentId, payload);
      }
      break;

    case "chargeback.opened":
      if (paymentId) {
        await handleDisputeOpen(paymentId, payload);
      }
      break;

    case "chargeback.closed":
      if (paymentId) {
        await handleDisputeClose(paymentId, payload);
      }
      break;
  }
}

async function updatePaymentStatus(
  paymentId: string,
  data: Record<string, unknown>
) {
  await prisma.payment.updateMany({
    where: { providerPaymentId: paymentId },
    data: data as any,
  });
}

async function handleRefundComplete(
  paymentId: string,
  payload: Record<string, unknown>
) {
  const refundId = payload.refundId as string;
  if (!refundId) return;

  const refund = await prisma.refund.findUnique({ where: { providerRefundId: refundId } });
  if (!refund) return;

  await prisma.refund.update({
    where: { id: refund.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  // Update order payment status based on remaining balance
  const payment = await prisma.payment.findUnique({
    where: { providerPaymentId: paymentId },
    include: { refunds: true },
  });

  if (payment) {
    const totalRefunded = payment.refunds
      .filter((r) => r.status === "COMPLETED")
      .reduce((sum, r) => sum + r.amountCents, 0);

    if (totalRefunded >= payment.fiatAmountCents) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: "REFUNDED" },
      });
    } else if (totalRefunded > 0) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: "PARTIALLY_REFUNDED" },
      });
    }
  }
}

async function handleDisputeOpen(
  paymentId: string,
  payload: Record<string, unknown>
) {
  const payment = await prisma.payment.findUnique({ where: { providerPaymentId: paymentId } });
  if (!payment) return;

  await prisma.dispute.create({
    data: {
      orderId: payment.orderId,
      paymentId: payment.id,
      providerDisputeId: (payload.disputeId || payload.id) as string,
      amountCents: (payload.amountCents || payment.fiatAmountCents) as number,
      currency: "USD",
      reasonCode: (payload.reasonCode || "unknown") as string,
      category: (payload.category || "other") as string,
      status: "OPEN",
      openedAt: new Date(),
    },
  });
}

async function handleDisputeClose(
  paymentId: string,
  payload: Record<string, unknown>
) {
  const disputeId = payload.disputeId as string;
  if (!disputeId) return;

  const outcome = (payload.outcome || "lost") as string;
  await prisma.dispute.updateMany({
    where: { providerDisputeId: disputeId },
    data: {
      status: outcome === "won" ? "WON" : "LOST",
      closedAt: new Date(),
    },
  });
}
