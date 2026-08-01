"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useUi } from "@/context/UiContext";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";

/**
 * Accessible right-side cart drawer. Renders nothing when closed; mount it
 * once at the app root. Focus-trapped, Escape-closable, body scroll locked.
 */
export function CartDrawer() {
  const { cartOpen, closeCart } = useUi();
  const { items, subtotal, itemCount, isUpdating, setQuantity, removeItem } =
    useCart();

  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap + Escape + body scroll lock while open.
  useEffect(() => {
    if (!cartOpen) return;

    const lastFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCart();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.setTimeout(() => lastFocused?.focus(), 0);
    };
  }, [cartOpen, closeCart]);

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden="true"
        onClick={closeCart}
        className="absolute inset-0 animate-fade-in bg-charcoal/60"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="absolute inset-y-0 right-0 flex w-full max-w-md animate-slide-in-right flex-col bg-warm-white"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-charcoal/15 pl-4 pr-2 sm:pl-5">
          <h2 className="font-display text-lg font-bold uppercase tracking-[0.2em] text-charcoal">
            Your Cart
            {itemCount > 0 && (
              <span className="ml-2 text-sm font-semibold text-text-gray">
                ({itemCount})
              </span>
            )}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="inline-flex h-11 w-11 items-center justify-center"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <Icon name="cart" className="h-10 w-10 text-text-gray/40" />
            <p className="font-display text-xl font-bold uppercase tracking-[0.15em] text-charcoal">
              Your cart is empty
            </p>
            <p className="text-sm text-text-gray">The fleet is ready when you are.</p>
            <Link
              href="/shop-the-fleet"
              onClick={closeCart}
              className="mt-2 inline-flex min-h-11 items-center justify-center border border-charcoal/40 px-5 font-display text-sm font-bold uppercase tracking-[0.15em] text-charcoal transition-colors hover:bg-charcoal/5"
            >
              Shop the Fleet
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-charcoal/10 overflow-y-auto">
              {items.map((line) => (
                <li key={line.id} className="flex gap-4 px-4 py-4 sm:px-5">
                  <div className="aspect-square h-20 w-20 shrink-0 border border-charcoal/10 bg-cream">
                    {line.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Icon name="cart" className="h-6 w-6 text-text-gray/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-display text-sm font-semibold uppercase tracking-[0.1em] text-charcoal">
                          {line.title}
                        </p>
                        <p className="mt-0.5 text-xs text-text-gray">
                          {line.variantTitle}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold tabular-nums">
                        {formatPrice(line.price * line.quantity)}
                      </p>
                    </div>
                    <span className="inline-flex w-fit items-center border border-deep-olive/40 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-deep-olive">
                      Preorder
                    </span>
                    <p className="text-xs text-text-gray">
                      Estimated shipping in approximately eight weeks
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <QuantityStepper
                        value={line.quantity}
                        onChange={(quantity) => setQuantity(line.id, quantity)}
                        min={1}
                        max={99}
                        disabled={isUpdating}
                        label={`Quantity of ${line.title}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(line.id)}
                        className="min-h-11 px-2 text-xs font-semibold uppercase tracking-[0.1em] text-text-gray underline-offset-4 transition-colors hover:text-signal-orange hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="shrink-0 border-t border-charcoal/15 px-4 py-4 sm:px-5">
              <div className="flex items-center justify-between py-1">
                <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-charcoal">
                  Subtotal
                </p>
                <p className="font-display text-lg font-bold tabular-nums text-charcoal">
                  {formatPrice(subtotal)}
                </p>
              </div>
              <p className="mt-1 text-xs text-text-gray">
                Shipping and taxes calculated at checkout.
              </p>
              <Button
                variant="primary"
                size="lg"
                className="mt-4 w-full"
                disabled={items.length === 0}
                href="/checkout"
                onClick={closeCart}
              >
                Proceed to Checkout
              </Button>
              <Link
                href="/shop-the-fleet"
                onClick={closeCart}
                className="mt-3 block py-2 text-center font-display text-xs font-bold uppercase tracking-[0.15em] text-text-gray underline-offset-4 transition-colors hover:text-charcoal hover:underline"
              >
                Continue shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
