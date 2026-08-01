"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { Domain } from "@/lib/constants";
import type { CommerceProduct } from "@/lib/commerce/types";
import type { ProductContent } from "@/content/napfleet";

const DOMAIN_ACCENT: Record<Domain, { text: string; bg: string }> = {
  AIR: { text: "text-muted-sky", bg: "bg-muted-sky/15" },
  LAND: { text: "text-field-olive", bg: "bg-field-olive/15" },
  SEA: { text: "text-deep-olive", bg: "bg-deep-olive/15" },
};

const PLACEHOLDER_BG: Record<Domain, string> = {
  AIR: "bg-muted-sky/20",
  LAND: "bg-field-olive/20",
  SEA: "bg-khaki/25",
};

function productInitials(title: string): string {
  const words = title
    .replace(/[^a-zA-Z\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("") || "NF";
}

type ProductCardProps = {
  product: CommerceProduct;
  content: ProductContent;
};

/**
 * Collection/product grid card. Links to /products/{handle}.
 * Never shows crossed-out prices, discounts, sale labels, low-stock,
 * or ratings — only facts the provider actually supports.
 */
export function ProductCard({ product, content }: ProductCardProps) {
  const price =
    product.variants.find((variant) => variant.available)?.price ??
    product.variants[0]?.price ??
    0;
  const accent = DOMAIN_ACCENT[product.domain];
  const image = product.images[0];

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group flex flex-col border border-charcoal/15 bg-warm-white transition-shadow duration-150 hover:shadow-sm"
    >
      <div className="relative">
        <div
          className={cn(
            "relative aspect-square w-full overflow-hidden",
            image ? "bg-cream" : PLACEHOLDER_BG[product.domain]
          )}
        >
          {image ? (
            <Image
              src={image}
              alt={`${product.title} — product photo`}
              fill
              sizes="(min-width: 640px) 25vw, 50vw"
              className="object-cover"
            />
          ) : (
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center font-display text-3xl font-bold uppercase tracking-[0.15em]",
                accent.text
              )}
            >
              {productInitials(product.title)}
            </span>
          )}
        </div>

        <span
          className={cn(
            "absolute left-3 top-3 border border-charcoal/15 px-1.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.2em]",
            accent.bg,
            accent.text
          )}
        >
          {product.domain}
        </span>
        <span className="absolute right-3 top-3 border border-charcoal/25 bg-warm-white/95 px-1.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-charcoal">
          Preorder
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 border-t border-charcoal/10 p-4">
        <h3 className="font-display text-lg font-bold uppercase tracking-[0.06em] text-charcoal">
          {product.title}
        </h3>
        <p className="text-xs leading-relaxed text-text-gray">{content.cardTagline}</p>
        <p className="mt-auto pt-2 font-body text-sm font-semibold text-charcoal">
          <span className="text-text-gray">Preorder — </span>
          {formatPrice(price)}
        </p>
      </div>
    </Link>
  );
}
