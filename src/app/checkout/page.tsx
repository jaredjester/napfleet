"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatPrice } from "@/lib/format";
import type { PrepareCheckoutResponse } from "@/lib/coinflow/types";

type CheckoutStep = "review" | "shipping" | "payment" | "processing";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, itemCount } = useCart();

  const [step, setStep] = useState<CheckoutStep>("review");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState({ line1: "", line2: "", city: "", state: "", postalCode: "", country: "US" });
  const [preparing, setPreparing] = useState(false);
  const [checkoutData, setCheckoutData] = useState<PrepareCheckoutResponse | null>(null);
  const [error, setError] = useState("");
  const [correlationId, setCorrelationId] = useState("");

  // Redirect to shop if cart is empty
  useEffect(() => {
    if (itemCount === 0 && step !== "processing") {
      router.push("/shop-the-fleet");
    }
  }, [itemCount, router, step]);

  const handlePrepareCheckout = useCallback(async () => {
    if (!email || !address.line1 || !address.city || !address.postalCode) {
      setError("Please fill in all required shipping fields.");
      return;
    }

    setPreparing(true);
    setError("");

    // Idempotency key: if this request is retried, the server returns the
    // same order instead of creating a duplicate.
    const clientIdempotencyKey =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `checkout_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    try {
      const res = await fetch("/api/checkout/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientIdempotencyKey,
          items: items.map((l) => ({
            productId: l.productHandle,
            variantId: l.variantId,
            quantity: l.quantity,
          })),
          customer: { email, firstName, lastName },
          shippingAddress: {
            name: `${firstName} ${lastName}`.trim(),
            line1: address.line1,
            line2: address.line2 || undefined,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Checkout preparation failed");
        if (data.correlationId) setCorrelationId(data.correlationId);
        return;
      }

      setCheckoutData(data as PrepareCheckoutResponse);
      setStep("payment");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setPreparing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, email, firstName, lastName, address]);

  if (itemCount === 0) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="font-display font-black uppercase tracking-tight text-charcoal text-2xl sm:text-3xl mb-8">
        Secure Checkout
      </h1>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8 text-xs font-display uppercase tracking-[0.15em]">
        {(["review", "shipping", "payment"] as CheckoutStep[]).map((s, i) => (
          <span
            key={s}
            className={`flex items-center gap-2 ${step === s ? "text-signal-orange font-bold" : "text-text-gray/50"}`}
          >
            {i > 0 && <span className="text-text-gray/20">→</span>}
            {s === "review" && "Cart"}
            {s === "shipping" && "Shipping"}
            {s === "payment" && "Payment"}
          </span>
        ))}
      </div>

      {/* Cart review */}
      {step === "review" && (
        <div className="space-y-4">
          <div className="border border-charcoal/10 divide-y divide-charcoal/10">
            {items.map((line) => (
              <div key={line.id} className="flex gap-4 p-4">
                <div className="w-16 h-16 bg-cream border border-charcoal/10 flex items-center justify-center shrink-0">
                  {line.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={line.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Icon name="cart" className="text-text-gray/30" size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-charcoal text-sm uppercase tracking-[0.03em]">
                    {line.title}
                  </p>
                  <p className="text-xs text-text-gray">{line.variantTitle}</p>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-text-gray">Qty: {line.quantity}</span>
                    <span className="font-semibold tabular-nums">{formatPrice(line.price * line.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-charcoal/10 pt-4 flex justify-between font-display font-bold text-lg">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatPrice(subtotal)}</span>
          </div>

          <Button variant="primary" size="lg" className="w-full" onClick={() => setStep("shipping")}>
            Continue to Shipping
          </Button>
        </div>
      )}

      {/* Shipping form */}
      {step === "shipping" && (
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-display uppercase tracking-[0.15em] text-text-gray font-bold mb-1">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-charcoal/20 px-3 py-2.5 text-sm focus:outline-none focus:border-charcoal/40"
              placeholder="you@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-display uppercase tracking-[0.15em] text-text-gray font-bold mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-charcoal/20 px-3 py-2.5 text-sm focus:outline-none focus:border-charcoal/40"
              />
            </div>
            <div>
              <label className="block text-xs font-display uppercase tracking-[0.15em] text-text-gray font-bold mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-charcoal/20 px-3 py-2.5 text-sm focus:outline-none focus:border-charcoal/40"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-display uppercase tracking-[0.15em] text-text-gray font-bold mb-1">
              Address *
            </label>
            <input
              type="text"
              value={address.line1}
              onChange={(e) => setAddress({ ...address, line1: e.target.value })}
              className="w-full border border-charcoal/20 px-3 py-2.5 text-sm focus:outline-none focus:border-charcoal/40"
              placeholder="Street address"
            />
          </div>
          <input
            type="text"
            value={address.line2}
            onChange={(e) => setAddress({ ...address, line2: e.target.value })}
            className="w-full border border-charcoal/20 px-3 py-2.5 text-sm focus:outline-none focus:border-charcoal/40"
            placeholder="Apt, suite, etc."
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-display uppercase tracking-[0.15em] text-text-gray font-bold mb-1">
                City *
              </label>
              <input
                type="text"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="w-full border border-charcoal/20 px-3 py-2.5 text-sm focus:outline-none focus:border-charcoal/40"
              />
            </div>
            <div>
              <label className="block text-xs font-display uppercase tracking-[0.15em] text-text-gray font-bold mb-1">
                State *
              </label>
              <input
                type="text"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                className="w-full border border-charcoal/20 px-3 py-2.5 text-sm focus:outline-none focus:border-charcoal/40"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-display uppercase tracking-[0.15em] text-text-gray font-bold mb-1">
                ZIP *
              </label>
              <input
                type="text"
                value={address.postalCode}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                className="w-full border border-charcoal/20 px-3 py-2.5 text-sm focus:outline-none focus:border-charcoal/40"
              />
            </div>
            <div>
              <label className="block text-xs font-display uppercase tracking-[0.15em] text-text-gray font-bold mb-1">
                Country *
              </label>
              <select
                value={address.country}
                onChange={(e) => setAddress({ ...address, country: e.target.value })}
                className="w-full border border-charcoal/20 px-3 py-2.5 text-sm focus:outline-none focus:border-charcoal/40 bg-warm-white"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-signal-orange">
              {error}
              {correlationId && <span className="text-text-gray/50 ml-2 text-xs">Ref: {correlationId}</span>}
            </p>
          )}

          <div className="flex gap-3">
            <Button variant="outline" size="md" onClick={() => setStep("review")}>
              Back
            </Button>
            <Button variant="primary" size="lg" className="flex-1" onClick={handlePrepareCheckout} loading={preparing}>
              Continue to Payment
            </Button>
          </div>
        </div>
      )}

      {/* Payment step */}
      {step === "payment" && checkoutData && (
        <div className="space-y-4">
          <div className="border border-charcoal/10 p-4 bg-cream">
            <h2 className="font-display font-bold uppercase tracking-[0.05em] text-sm mb-3">
              Order Summary
            </h2>
            {checkoutData.displayOrder.items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs text-text-gray py-1">
                <span>{item.title} × {item.quantity}</span>
                <span className="tabular-nums">{formatPrice(item.unitPriceCents * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-charcoal/10 mt-3 pt-3 space-y-1">
              <div className="flex justify-between text-xs text-text-gray">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(checkoutData.displayOrder.subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-xs text-text-gray">
                <span>Shipping</span>
                <span className="tabular-nums">{formatPrice(checkoutData.displayOrder.shippingCents)}</span>
              </div>
              <div className="flex justify-between text-xs text-text-gray">
                <span>Tax</span>
                <span className="tabular-nums">{formatPrice(checkoutData.displayOrder.taxCents)}</span>
              </div>
              <div className="flex justify-between font-display font-bold text-charcoal pt-1 border-t border-charcoal/10">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(checkoutData.displayOrder.totalCents)}</span>
              </div>
            </div>
          </div>

          {checkoutData.sessionKey ? (
            /* Coinflow available */
            <div className="space-y-3">
              <p className="text-xs text-text-gray/60 text-center">
                Debit or credit card · Secure checkout powered by Coinflow
              </p>
              <div className="border border-charcoal/10 p-8 text-center bg-cream min-h-[200px] flex flex-col items-center justify-center gap-3">
                <p className="font-display font-bold uppercase tracking-[0.1em] text-charcoal text-sm">
                  Card Payment Ready
                </p>
                <p className="text-xs text-text-gray">
                  Coinflow checkout would render here with merchant ID: {checkoutData.merchantId}
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => router.push(`/checkout/processing?order=${checkoutData.orderNumber}`)}
                >
                  Simulate Payment (Dev)
                </Button>
              </div>
            </div>
          ) : (
            /* Checkout unavailable — no test mode fallback */
            <div className="border border-charcoal/10 p-8 text-center bg-cream">
              <Icon name="x-circle" className="mx-auto mb-3 text-text-gray/30" size={32} />
              <p className="font-display font-bold uppercase tracking-[0.1em] text-charcoal text-sm">
                Checkout Temporarily Unavailable
              </p>
              <p className="text-xs text-text-gray mt-2 max-w-sm mx-auto">
                We can&apos;t process payments right now. Please try again shortly, or get in touch and
                we&apos;ll take care of you.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
                <Button variant="outline" size="md" onClick={() => setStep("shipping")}>
                  Back to Shipping
                </Button>
                <Button variant="primary" size="md" href="/contact">
                  Contact Us
                </Button>
              </div>
            </div>
          )}

          <Button variant="outline" size="md" onClick={() => setStep("shipping")}>
            Back to Shipping
          </Button>
        </div>
      )}
    </div>
  );
}
