"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { CommerceProduct, CommerceVariant } from "@/lib/commerce/types";
import type { ProductContent } from "@/content/napfleet";
import { useCart } from "@/context/CartContext";
import { useUi } from "@/context/UiContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/Button";

function shortName(title: string): string {
  return title.replace(/\s*Dog Bed$/i, "");
}

function productInitials(title: string): string {
  const words = title
    .replace(/[^a-zA-Z\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("") || "NF";
}

type StickyPurchaseBarProps = {
  product: CommerceProduct;
  content: ProductContent;
  /** The primary purchase section on the page; the bar appears when it scrolls out of view. */
  purchaseRef: RefObject<HTMLDivElement | null>;
  selectedVariant: CommerceVariant | null;
  quantity: number;
};

/**
 * Purchase bar. Desktop: a slim sticky bar that appears once the primary
 * purchase section scrolls out of view. Mobile: a fixed bottom bar with
 * price, PREORDER label, and CTA. Respects iPhone safe-area insets,
 * hides while the cart drawer is open, and uses IntersectionObserver
 * (never scroll listeners).
 */
export function StickyPurchaseBar({
  product,
  content,
  purchaseRef,
  selectedVariant,
  quantity,
}: StickyPurchaseBarProps) {
  const { addItem, isUpdating, cartId } = useCart();
  const { cartOpen } = useUi();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [inView, setInView] = useState(false);
  const [observed, setObserved] = useState(false);

  useEffect(() => {
    const el = purchaseRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setObserved(true);
        setInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [purchaseRef]);

  // Mobile: always fixed. Desktop: only once the purchase section is out of view.
  const show = !cartOpen && (isMobile || (observed && !inView));
  if (!show) return null;

  const price = selectedVariant?.price ?? product.variants[0]?.price ?? 0;
  const image = product.images[0];
  const disabled = !selectedVariant || !selectedVariant.available || cartId === null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 animate-slide-up border-t border-charcoal/15 bg-warm-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        {/* Desktop: thumbnail + short title */}
        <div className="hidden items-center gap-3 md:flex">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-charcoal/15",
              image ? "bg-cream" : "bg-field-olive/15"
            )}
          >
            {image ? (
              <Image
                src={image}
                alt=""
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-display text-[10px] font-bold uppercase tracking-widest text-field-olive">
                {productInitials(product.title)}
              </span>
            )}
          </div>
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-[0.08em] text-charcoal">
              {shortName(product.title)}
            </p>
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-signal-orange">
              Preorder
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-between gap-3 md:justify-end md:gap-6">
          {/* Mobile: price + PREORDER */}
          <div className="md:hidden">
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-signal-orange">
              Preorder
            </p>
            <p className="font-body text-base font-bold tabular-nums text-charcoal">
              {formatPrice(price)}
            </p>
          </div>

          {/* Desktop: selected option + price */}
          <div className="hidden text-right md:block">
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-text-gray">
              {selectedVariant ? selectedVariant.title : "—"}
            </p>
            <p className="font-body text-lg font-bold tabular-nums text-charcoal">
              {formatPrice(price)}
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="min-h-[52px] px-6 text-sm sm:text-base"
          loading={isUpdating}
          disabled={disabled}
          onClick={() => {
            if (selectedVariant) void addItem(product.handle, selectedVariant.id, quantity);
          }}
        >
          {content.cta}
        </Button>
      </div>
    </div>
  );
}
