/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/coinflow/server";
import { emailProvider } from "@/lib/email";
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

      const settlementAsset = (payload.settlementAsset || "USDC") as string;
      const expectedAsset = process.env.COINFLOW_EXPECTED_SETTLEMENT_ASSET || "USDC";
      const expectedAddress = (process.env.COINFLOW_EXPECTED_SETTLEMENT_ADDRESS || "").toLowerCase();
      const receivedAddress = payload.settlementAddress ? String(payload.settlementAddress) : undefined;

      // Settlement amount: prefer the gross amount charged, fall back to the
      // net amount.
      const settlementAmountCents =
        typeof payload.amountCents === "number"
          ? payload.amountCents
          : typeof payload.netAmountCents === "number"
            ? payload.netAmountCents
            : undefined;

      // 1. Mark the payment settled — the webhook is authoritative for
      //    settlement state.
      await updatePaymentStatus(paymentId, {
        status: "SETTLED",
        settledAt: new Date(),
        settlementAsset,
        settlementAddressMasked: receivedAddress
          ? receivedAddress.slice(0, 4) + "..." + receivedAddress.slice(-4)
          : undefined,
        settlementTransactionSignature: payload.txSignature ? String(payload.txSignature) : undefined,
        usdcGrossAmount: payload.usdcGrossAmount ? String(payload.usdcGrossAmount) : undefined,
        usdcNetAmount: payload.usdcNetAmount ? String(payload.usdcNetAmount) : undefined,
        providerFeeAmount: payload.feeAmount ? String(payload.feeAmount) : undefined,
      });

      // 2. Settlement verification — fail closed. Any mismatch sends the
      //    order to PAYMENT_REVIEW_REQUIRED instead of PAID.
      const mismatchReasons: string[] = [];

      if (settlementAmountCents === undefined) {
        mismatchReasons.push("Settlement amount missing from webhook payload");
      } else if (settlementAmountCents < payment.fiatAmountCents) {
        mismatchReasons.push(
          `Settlement amount ${settlementAmountCents} cents is less than expected ${payment.fiatAmountCents} cents`
        );
      }

      if (settlementAsset !== expectedAsset) {
        mismatchReasons.push(`Settlement asset "${settlementAsset}" does not match expected "${expectedAsset}"`);
      }

      if (expectedAddress) {
        if (!receivedAddress) {
          mismatchReasons.push("Settlement address missing from webhook payload");
        } else if (receivedAddress.toLowerCase() !== expectedAddress) {
          mismatchReasons.push(`Settlement address "${receivedAddress}" does not match expected address`);
        }
      }

      if (mismatchReasons.length > 0) {
        const reasonText = mismatchReasons.join("; ");
        await updatePaymentStatus(paymentId, { settlementMismatchReason: reasonText });
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: "PAYMENT_REVIEW_REQUIRED" },
        });
        await prisma.auditEvent.create({
          data: {
            actorType: "system",
            action: "ORDER_REVIEW_REQUIRED_SETTLEMENT_MISMATCH",
            entityType: "Order",
            entityId: payment.orderId,
            safeMetadata: JSON.stringify({
              provider: "coinflow",
              providerPaymentId: paymentId,
              reasons: mismatchReasons,
              event: "payment.settled",
            }),
            orderId: payment.orderId,
          },
        });
        console.error(`Coinflow webhook: settlement mismatch for payment ${paymentId}: ${reasonText}`);
        break;
      }

      // 3. Settlement verified — only now may the order become PAID,
      //    with the fraud check.
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

        // Send order confirmation email (best-effort — never fail the webhook)
        try {
          await sendOrderConfirmationEmail(payment.orderId);
        } catch (err) {
          console.error(
            `Coinflow webhook: order confirmation email failed for order ${payment.orderId}:`,
            err
          );
        }
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

/**
 * Send the order confirmation email from the immutable order snapshot.
 * Called after an order transitions to PAID. Never throws — the
 * provider returns { success: false, error } instead.
 */
async function sendOrderConfirmationEmail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) {
    console.error(`Coinflow webhook: order ${orderId} not found for confirmation email`);
    return;
  }

  const result = await emailProvider.sendOrderConfirmation({
    to: order.customerEmail,
    orderNumber: order.publicOrderNumber,
    items: order.items.map((item) => ({
      title: item.productTitleSnapshot,
      variant: item.variantTitleSnapshot,
      quantity: item.quantity,
      price: item.unitPriceCents,
    })),
    totalCents: order.totalCents,
    shippingAddress: formatShippingAddress(order.shippingAddressSnapshot),
    preorderEstimate: order.items[0]?.preorderEstimateSnapshot || "Approximately 8 weeks",
  });

  if (!result.success) {
    console.error(
      `Coinflow webhook: confirmation email failed for order ${order.publicOrderNumber}:`,
      result.error
    );
  }
}

/**
 * Flatten the stored shipping address JSON snapshot into a single
 * human-readable string for email delivery.
 */
function formatShippingAddress(snapshot: string): string {
  try {
    const address = JSON.parse(snapshot) as Record<string, string>;
    const cityLine = [address.city, address.state, address.postalCode]
      .filter(Boolean)
      .join(" ");
    return [address.name, address.company, address.line1, address.line2, cityLine, address.country]
      .filter(Boolean)
      .join(", ");
  } catch {
    return snapshot;
  }
}
