"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { PREORDER_ESTIMATE_WEEKS } from "@/lib/constants";
import { mockCommerce } from "@/lib/commerce/mock";
import type { CommerceProduct, CommerceVariant } from "@/lib/commerce/types";
import { getProductContent, QUICK_QUESTIONS, HOME } from "@/content/napfleet";
import type { ProductContent } from "@/content/napfleet";
import { useCart } from "@/context/CartContext";
import { Button, buttonClasses } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Accordion } from "@/components/ui/Accordion";
import type { AccordionItem } from "@/components/ui/Accordion";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { RideSelector } from "@/components/product/RideSelector";
import { FulfillmentTimeline } from "@/components/product/FulfillmentTimeline";
import { StickyPurchaseBar } from "@/components/product/StickyPurchaseBar";

type SpecRow = { label: string; value: string };

function buildSpecRows(product: CommerceProduct): SpecRow[] {
  const rows: SpecRow[] = [];

  const dimensions = [product.overallLength, product.overallWidth, product.overallHeight].every(
    Boolean
  )
    ? [product.overallLength, product.overallWidth, product.overallHeight].join(" × ")
    : null;
  if (dimensions) rows.push({ label: "Overall Dimensions", value: dimensions });

  const interior = [product.interiorSleepingLength, product.interiorSleepingWidth].every(Boolean)
    ? [product.interiorSleepingLength, product.interiorSleepingWidth].join(" × ")
    : null;
  if (interior) rows.push({ label: "Interior Sleeping Area", value: interior });

  const petSize = [product.recommendedPetLength, product.recommendedPetWeight]
    .filter(Boolean)
    .join(" · ");
  if (petSize) rows.push({ label: "Recommended Pet Size", value: petSize });

  if (product.entryHeight) rows.push({ label: "Entry Height", value: product.entryHeight });
  if (product.productWeight) rows.push({ label: "Product Weight", value: product.productWeight });
  if (product.materials) rows.push({ label: "Materials", value: product.materials });
  if (product.filling) rows.push({ label: "Filling", value: product.filling });
  if (product.careInstructions) {
    rows.push({ label: "Care Instructions", value: product.careInstructions });
  }
  if (product.boxContents) rows.push({ label: "Box Contents", value: product.boxContents });
  if (product.assemblyRequired) rows.push({ label: "Assembly", value: product.assemblyRequired });
  if (product.returnEligibility) {
    rows.push({ label: "Return Eligibility", value: product.returnEligibility });
  }

  return rows;
}

const ROW_LABEL =
  "font-display text-xs font-semibold uppercase tracking-[0.25em] text-text-gray";

/**
 * Full product detail page. Fetches the product from the commerce
 * provider and the editorial content from the content layer. Follows
 * the approved purchase layout: status label, title, tagline, price,
 * description, highlights, ride rail, variant selector, sizing info,
 * quantity, CTA, preorder disclosure, microcopy, fulfillment timeline,
 * and quick questions. No fake prices, discounts, stock, countdowns,
 * or ratings.
 */
export function ProductDetail({ handle }: { handle: string }) {
  const { addItem, isUpdating, cartId } = useCart();
  const [product, setProduct] = useState<CommerceProduct | null>(null);
  const [content, setContent] = useState<ProductContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const purchaseRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    mockCommerce.getProduct(handle).then((found) => {
      if (cancelled) return;
      setProduct(found);
      setContent(found ? getProductContent(handle) : null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [handle]);

  // Reset selection whenever a new product loads.
  useEffect(() => {
    if (!product) return;
    setSelectedVariantId(
      product.variants.find((variant) => variant.available)?.id ??
        product.variants[0]?.id ??
        null
    );
    setQuantity(1);
  }, [product]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="h-6 w-36 animate-pulse bg-charcoal/10" />
        <div className="mt-4 h-12 w-3/4 animate-pulse bg-charcoal/10" />
        <div className="mt-6 h-64 animate-pulse bg-cream" />
      </div>
    );
  }

  if (!product || !content || !product.publishReady) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <p className="inline-flex border border-signal-orange/30 bg-signal-orange/10 px-2 py-1 font-display text-xs font-bold uppercase tracking-[0.25em] text-signal-orange">
          Preorder Closed
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-[0.04em] text-charcoal sm:text-5xl">
          This Ride Isn&apos;t Available Right Now
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-text-gray">
          This product isn&apos;t currently available for preorder. Please check back
          soon, or explore the rest of the fleet in the meantime.
        </p>
        <Link href="/shop-the-fleet" className={buttonClasses("primary", "md", "mt-8")}>
          Shop the Fleet
        </Link>
      </div>
    );
  }

  const selectedVariant: CommerceVariant | null =
    product.variants.find((variant) => variant.id === selectedVariantId) ??
    product.variants[0] ??
    null;
  const price = selectedVariant?.price ?? product.variants[0]?.price ?? 0;
  const specRows = buildSpecRows(product);

  const answeredQuestions: AccordionItem[] = QUICK_QUESTIONS.filter(
    (question) => question.answer !== null
  ).map((question) => ({ question: question.question, answer: question.answer as string }));

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addItem(product.handle, selectedVariant.id, quantity);
  };

  return (
    <article className="mx-auto w-full max-w-2xl">
      {/* 1. Preorder status label */}
      <p className="inline-flex border border-signal-orange/30 bg-signal-orange/10 px-2 py-1 font-display text-xs font-bold uppercase tracking-[0.25em] text-signal-orange">
        {product.preorderStatus === "open" ? "Preorder Open" : "Preorder Closed"}
      </p>

      {/* 2. Title */}
      <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-[0.04em] text-charcoal sm:text-5xl">
        {product.title}
      </h1>

      {/* 3. Page tagline */}
      <p className="mt-2 text-base text-text-gray">{content.pageTagline}</p>

      {/* 4. Current price (from provider) */}
      <div className="mt-5">
        <PriceDisplay price={price} size="lg" />
      </div>

      {/* 5. Approved description */}
      <div className="mt-5 border-t border-charcoal/10 pt-5">
        <p className="whitespace-pre-line text-sm leading-relaxed text-charcoal/85">
          {product.description}
        </p>
      </div>

      {/* 6. Three highlights */}
      <ul className="mt-5 space-y-2 border-t border-charcoal/10 pt-5">
        {content.highlights.slice(0, 3).map((highlight) => (
          <li key={highlight} className="flex items-start gap-3 text-sm text-charcoal/85">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-field-olive" aria-hidden="true" />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>

      {/* 7. Choose Their Ride rail */}
      <div className="mt-8 border-t border-charcoal/10 pt-6">
        <RideSelector handle={handle} />
      </div>

      {/* Purchase section (observed by the sticky bar) */}
      <div ref={purchaseRef} className="mt-8 space-y-6 border-t border-charcoal/10 pt-6">
        {/* 8. Variant selector — only when more than one variant exists */}
        {product.variants.length > 1 && (
          <div>
            <p className={ROW_LABEL}>Select an Option</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.variants.map((variant) => {
                const selected = variant.id === selectedVariantId;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={!variant.available}
                    aria-pressed={selected}
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={cn(
                      "min-h-11 border px-4 font-display text-sm font-semibold uppercase tracking-[0.1em] transition-colors",
                      selected
                        ? "border-signal-orange bg-cream text-charcoal"
                        : "border-charcoal/25 bg-warm-white text-charcoal hover:border-charcoal/50",
                      !variant.available && "cursor-not-allowed opacity-40"
                    )}
                  >
                    {variant.title}
                    <span className="ml-2 font-body text-xs font-normal normal-case tracking-normal text-text-gray">
                      {formatPrice(variant.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 9. Required sizing/material info — only rows with values */}
        {specRows.length > 0 && (
          <div>
            <p className={ROW_LABEL}>Sizing &amp; Materials</p>
            <dl className="mt-2 divide-y divide-charcoal/10 border border-charcoal/15">
              {specRows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-3 py-2.5 sm:px-4"
                >
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-text-gray">
                    {row.label}
                  </dt>
                  <dd className="text-right text-sm text-charcoal">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* 10. Quantity selector */}
        <div className="flex items-center justify-between gap-4">
          <p className={ROW_LABEL}>Quantity</p>
          <QuantityStepper value={quantity} onChange={setQuantity} min={1} max={99} />
        </div>

        {/* 11. Primary CTA */}
        <Button
          variant="primary"
          size="lg"
          className="w-full min-h-[56px] text-base sm:min-h-[60px] sm:text-lg"
          loading={isUpdating}
          disabled={!selectedVariant || !selectedVariant.available || cartId === null}
          onClick={handleAddToCart}
        >
          {content.cta}
        </Button>

        {/* 12. Preorder disclosure */}
        <p className="text-center font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-text-gray">
          Preorder Item · Estimated to Ship in Approximately {PREORDER_ESTIMATE_WEEKS} Weeks
        </p>

        {/* 13. Microcopy */}
        <p className="text-center text-xs text-text-gray/80">{HOME.preorderSection.microcopy}</p>
      </div>

      {/* 14. Fulfillment timeline */}
      <div className="mt-10 border-t border-charcoal/10 pt-8">
        <FulfillmentTimeline />
      </div>

      {/* 15. Quick questions (compact, after the purchase area) */}
      {answeredQuestions.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-lg font-bold uppercase tracking-[0.08em] text-charcoal">
            Quick Questions
          </h2>
          <Accordion className="mt-4" items={answeredQuestions} defaultOpenIndex={null} />
        </div>
      )}

      <StickyPurchaseBar
        product={product}
        content={content}
        purchaseRef={purchaseRef}
        selectedVariant={selectedVariant}
        quantity={quantity}
      />
    </article>
  );
}
