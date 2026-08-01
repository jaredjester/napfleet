"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { products } from "@/content/products";
import type { Domain } from "@/lib/constants";

const DOMAIN_ACCENT: Record<Domain, string> = {
  AIR: "bg-muted-sky/20 text-muted-sky",
  LAND: "bg-field-olive/20 text-field-olive",
  SEA: "bg-khaki/25 text-deep-olive",
};

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

type RideSelectorProps = {
  /** Handle of the currently viewed product. */
  handle: string;
};

/**
 * "Choose Their Ride" thumbnail rail. All five fleet members are
 * separate products, so each thumbnail links to its own product page.
 */
export function RideSelector({ handle }: RideSelectorProps) {
  return (
    <div>
      <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-charcoal">
        Choose Their Ride
      </h2>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
        {products.map((product) => {
          const selected = product.handle === handle;
          const image = product.images[0];
          return (
            <Link
              key={product.handle}
              href={`/products/${product.handle}`}
              aria-current={selected ? "page" : undefined}
              className="group w-20 shrink-0 sm:w-24"
            >
              <div
                className={cn(
                  "relative aspect-square w-full overflow-hidden border",
                  selected
                    ? "border-signal-orange outline outline-2 outline-offset-1 outline-signal-orange"
                    : "border-charcoal/15 group-hover:border-charcoal/40"
                )}
              >
                {image ? (
                  <Image
                    src={image}
                    alt={`${product.title} — thumbnail`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <span
                    className={cn(
                      "absolute inset-0 flex items-center justify-center font-display text-lg font-bold uppercase tracking-widest",
                      DOMAIN_ACCENT[product.domain]
                    )}
                  >
                    {productInitials(product.title)}
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "mt-1.5 truncate text-center font-display text-[11px] font-semibold uppercase tracking-[0.08em]",
                  selected ? "text-signal-orange" : "text-text-gray"
                )}
              >
                {shortName(product.title)}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
