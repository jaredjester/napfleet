import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { products } from "@/content/products";
import { getProductContent } from "@/content/napfleet";
import type { Domain } from "@/lib/constants";
import type { CommerceProduct } from "@/lib/commerce/types";

const DOMAIN_ACCENT: Record<Domain, { dot: string; text: string }> = {
  AIR: { dot: "bg-muted-sky", text: "text-muted-sky" },
  LAND: { dot: "bg-field-olive", text: "text-field-olive" },
  SEA: { dot: "bg-deep-olive", text: "text-deep-olive" },
};

/** First available variant price — the price the provider supports. */
function preorderPrice(product: CommerceProduct): number {
  return (
    product.variants.find((variant) => variant.available)?.price ??
    product.variants[0]?.price ??
    0
  );
}

const TH_ROW =
  "px-3 py-3 text-left font-display text-[11px] font-bold uppercase tracking-[0.2em] text-text-gray";

type FleetManifestProps = {
  /** Handle of the currently viewed product, highlighted in the table. */
  currentHandle?: string;
};

/**
 * Fleet comparison table: RIDE, DOMAIN, SLEEP-AREA DESIGN, PREORDER PRICE.
 * Prices come from the same catalog the mockCommerce provider serves.
 * Horizontally scrollable on mobile with a sticky first column.
 */
export function FleetManifest({ currentHandle }: FleetManifestProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="border-b-2 border-charcoal/20">
            <th scope="col" className={cn(TH_ROW, "sticky left-0 z-10 bg-warm-white")}>
              Ride
            </th>
            <th scope="col" className={TH_ROW}>
              Domain
            </th>
            <th scope="col" className={TH_ROW}>
              Sleep-Area Design
            </th>
            <th scope="col" className={cn(TH_ROW, "text-right")}>
              Preorder Price
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const isCurrent = product.handle === currentHandle;
            const accent = DOMAIN_ACCENT[product.domain];
            const content = getProductContent(product.handle);
            return (
              <tr
                key={product.handle}
                aria-current={isCurrent ? "true" : undefined}
                className={cn("border-b border-charcoal/10 last:border-b-0", isCurrent && "bg-cream")}
              >
                <th
                  scope="row"
                  className={cn(
                    "sticky left-0 z-10 border-r border-charcoal/10 px-3 py-3 text-left font-display text-sm font-bold uppercase tracking-[0.06em] text-charcoal",
                    isCurrent ? "bg-cream" : "bg-warm-white"
                  )}
                >
                  <Link
                    href={`/products/${product.handle}`}
                    className="transition-colors hover:text-signal-orange"
                  >
                    {product.title}
                  </Link>
                </th>
                <td className="px-3 py-3">
                  <span
                    className={cn(
                      "flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.2em]",
                      accent.text
                    )}
                  >
                    <span className={cn("h-2 w-2 shrink-0", accent.dot)} aria-hidden="true" />
                    {product.domain}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs text-text-gray">
                  {content?.sleepAreaDesign ?? "—"}
                </td>
                <td className="px-3 py-3 text-right font-body text-sm font-semibold tabular-nums text-charcoal">
                  {formatPrice(preorderPrice(product))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
