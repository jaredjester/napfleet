import Image from "next/image";
import { cn } from "@/lib/cn";
import { PREORDER_ESTIMATE_TEXT } from "@/lib/constants";
import type { CommerceProduct } from "@/lib/commerce/types";

function productInitials(title: string): string {
  const words = title
    .replace(/[^a-zA-Z\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("") || "NF";
}

const CALLOUTS = [
  { number: "01", label: "Soft Sleeping Area" },
  { number: "02", label: "Raised Padded Sides" },
  { number: "03", label: "Sculpted Vehicle Detail" },
] as const;

const CALLOUT_POSITIONS = [
  "left-4 top-4",
  "right-4 top-4",
  "bottom-4 left-4",
] as const;

type SpecSheetProps = {
  product: CommerceProduct;
};

/**
 * Technical specification section ("RIDE DATA" / "SPEC SHEET") with a
 * large product image and three numbered callouts — overlaid on desktop,
 * listed below the image on mobile — followed by a grid of confirmed
 * values. Only rows with values are shown; empty rows are hidden.
 */
export function SpecSheet({ product }: SpecSheetProps) {
  const image = product.images[0];

  const rows: { label: string; value: string }[] = [];

  const dimensions = [product.overallLength, product.overallWidth, product.overallHeight].every(
    Boolean
  )
    ? [product.overallLength, product.overallWidth, product.overallHeight].join(" × ")
    : null;
  if (dimensions) rows.push({ label: "Dimensions", value: dimensions });

  const interior = [product.interiorSleepingLength, product.interiorSleepingWidth].every(Boolean)
    ? [product.interiorSleepingLength, product.interiorSleepingWidth].join(" × ")
    : null;
  if (interior) rows.push({ label: "Interior Sleeping Area", value: interior });

  if (product.materials) rows.push({ label: "Materials", value: product.materials });
  if (product.filling) rows.push({ label: "Filling", value: product.filling });
  if (product.careInstructions) rows.push({ label: "Care", value: product.careInstructions });
  if (product.boxContents) rows.push({ label: "Box Contents", value: product.boxContents });
  if (product.assemblyRequired) rows.push({ label: "Assembly", value: product.assemblyRequired });

  rows.push({ label: "Preorder Estimate", value: PREORDER_ESTIMATE_TEXT });

  if (product.returnEligibility) {
    rows.push({ label: "Return Eligibility", value: product.returnEligibility });
  }

  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="eyebrow text-deep-olive">Ride Data</p>
        <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-[0.05em] text-charcoal sm:text-4xl">
          Spec Sheet
        </h2>

        {/* Large product image with numbered callouts */}
        <div className="relative mt-6 overflow-hidden border border-charcoal/15">
          <div
            className={cn(
              "relative aspect-[4/3] w-full sm:aspect-[16/9]",
              image ? "bg-cream" : "bg-field-olive/15"
            )}
          >
            {image ? (
              <Image
                src={image}
                alt={`${product.title} — spec sheet photo`}
                fill
                sizes="(min-width: 640px) 80vw, 100vw"
                className="object-cover"
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center font-display text-5xl font-bold uppercase tracking-[0.2em] text-field-olive/60">
                {productInitials(product.title)}
              </span>
            )}
          </div>

          {/* Desktop: callouts overlaid on the image */}
          <div className="absolute inset-0 hidden sm:block" aria-hidden="false">
            {CALLOUTS.map((callout, index) => (
              <div
                key={callout.number}
                className={cn(
                  "absolute flex items-center gap-2 border border-charcoal/20 bg-warm-white/95 px-3 py-2",
                  CALLOUT_POSITIONS[index]
                )}
              >
                <span className="font-display text-xl font-bold text-field-olive">
                  {callout.number}
                </span>
                <span className="font-display text-xs font-bold uppercase tracking-[0.15em] text-charcoal">
                  {callout.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: callouts below the image */}
        <ol className="mt-2 grid grid-cols-1 divide-y divide-charcoal/15 border border-charcoal/15 sm:hidden">
          {CALLOUTS.map((callout) => (
            <li key={callout.number} className="flex items-center gap-3 bg-warm-white px-4 py-3">
              <span className="font-display text-lg font-bold text-field-olive">
                {callout.number}
              </span>
              <span className="font-display text-xs font-bold uppercase tracking-[0.15em] text-charcoal">
                {callout.label}
              </span>
            </li>
          ))}
        </ol>

        {/* Confirmed spec values */}
        <dl className="mt-2 grid grid-cols-1 gap-px border border-charcoal/15 bg-charcoal/15 sm:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-4 bg-warm-white px-4 py-3"
            >
              <dt className="font-display text-xs font-bold uppercase tracking-[0.15em] text-text-gray">
                {row.label}
              </dt>
              <dd className="text-right text-sm text-charcoal">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
