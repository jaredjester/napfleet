/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatPrice } from "@/lib/format";

function ProcessingContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "";

  const [status, setStatus] = useState<"loading" | "paid" | "delayed" | "failed" | "not_found">("loading");
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);

  const checkStatus = useCallback(async () => {
    if (!orderNumber) {
      setStatus("not_found");
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderNumber}/status`);
      if (!res.ok) {
        if (res.status === 404) {
          setStatus("not_found");
          return;
        }
        throw new Error("Status check failed");
      }
      const data = await res.json();
      setOrder(data);

      if (data.paymentStatus === "PAID") {
        setStatus("paid");
      } else if (data.paymentStatus === "FAILED" || data.paymentStatus === "CANCELED") {
        setStatus("failed");
      }
    } catch {
      // Retry on next poll
    }
  }, [orderNumber]);

  useEffect(() => {
    if (!orderNumber) {
      setStatus("not_found");
      return;
    }

    checkStatus();

    let attempt = 0;
    const interval = setInterval(() => {
      attempt++;
      if (attempt > 60) {
        setStatus("delayed");
        clearInterval(interval);
        return;
      }
      checkStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, [orderNumber, checkStatus]);

  if (status === "not_found" || !orderNumber) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <Icon name="x-circle" className="mx-auto mb-4 text-text-gray/30" size={48} />
        <h1 className="font-display font-black uppercase text-charcoal text-xl mb-2">
          Order Not Found
        </h1>
        <Button variant="outline" size="md" href="/shop-the-fleet">
          Shop the Fleet
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12 sm:py-16 text-center">
      {status === "loading" && (
        <>
          <div className="w-12 h-12 border-2 border-charcoal/20 border-t-signal-orange rounded-full animate-spin mx-auto mb-6" />
          <h1 className="font-display font-black uppercase text-charcoal text-xl sm:text-2xl mb-3">
            Confirming Your Order
          </h1>
          <p className="text-sm text-text-gray">
            Processing your payment and confirming order {orderNumber}...
          </p>
          <p className="text-xs text-text-gray/50 mt-4">
            This may take a few moments. Please don&apos;t close this page.
          </p>
        </>
      )}

      {status === "paid" && order && (
        <>
          <Icon name="check" className="mx-auto mb-4 text-deep-olive" size={48} />
          <h1 className="font-display font-black uppercase text-charcoal text-xl sm:text-2xl mb-3">
            Order Confirmed
          </h1>
          <p className="text-sm text-text-gray mb-2">
            Order <span className="font-mono font-bold">{orderNumber as string}</span>
          </p>
          <p className="text-xs text-text-gray/50 mb-6">
            Estimated shipping in approximately 8 weeks
          </p>
          {order.totalCents && (
            <p className="text-sm font-bold tabular-nums text-charcoal mb-6">
              Total: {formatPrice(order.totalCents as number)}
            </p>
          )}
          <Button variant="primary" size="md" href="/shop-the-fleet">
            Continue Shopping
          </Button>
        </>
      )}

      {status === "delayed" && (
        <>
          <Icon name="star" className="mx-auto mb-4 text-text-gray/30" size={48} />
          <h1 className="font-display font-black uppercase text-charcoal text-xl sm:text-2xl mb-3">
            Taking Longer Than Expected
          </h1>
          <p className="text-sm text-text-gray mb-4">
            Your payment is still being processed. You&apos;ll receive an order confirmation.
          </p>
          <p className="text-xs text-text-gray/50 mb-6">
            Order: {orderNumber} — If you don&apos;t hear from us within 30 minutes, please contact support.
          </p>
          <Button variant="outline" size="md" href="/contact">
            Contact Support
          </Button>
        </>
      )}

      {status === "failed" && (
        <>
          <Icon name="x-circle" className="mx-auto mb-4 text-signal-orange/50" size={48} />
          <h1 className="font-display font-black uppercase text-charcoal text-xl sm:text-2xl mb-3">
            Payment Not Completed
          </h1>
          <p className="text-sm text-text-gray mb-6">
            Your payment could not be processed. Your cart has been saved.
          </p>
          <Button variant="primary" size="md" href="/cart">
            View Your Cart
          </Button>
        </>
      )}
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-2 border-charcoal/20 border-t-signal-orange rounded-full animate-spin mx-auto mb-6" />
        <p className="text-sm text-text-gray">Loading...</p>
      </div>
    }>
      <ProcessingContent />
    </Suspense>
  );
}
