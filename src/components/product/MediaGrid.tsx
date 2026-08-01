"use client";

import Image from "next/image";

function productInitials(title: string): string {
  const words = title
    .replace(/[^a-zA-Z\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("") || "NF";
}

const MAX_MEDIA = 6;

type MediaGridProps = {
  images: string[];
  productTitle: string;
};

/**
 * Dense product media grid using up to six assets. Three columns on
 * desktop, two on tablet, one on mobile; narrow gaps and edge-to-edge
 * on mobile. When no images exist, a media-coming-soon message and
 * neutral tiles are shown instead.
 */
export function MediaGrid({ images, productTitle }: MediaGridProps) {
  const media = images.slice(0, MAX_MEDIA);

  if (media.length === 0) {
    return (
      <div className="-mx-4 sm:mx-0">
        <div className="border border-charcoal/15 bg-cream px-4 py-6 text-center">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-text-gray">
            Product Media Coming Soon
          </p>
          <p className="mt-1 text-xs text-text-gray/80">
            Lifestyle and detail shots for the {productTitle} are being finalized.
          </p>
        </div>
        <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: MAX_MEDIA }).map((_, index) => (
            <div
              key={index}
              className="relative flex aspect-[4/3] items-center justify-center border border-charcoal/10 bg-cream/60"
            >
              <span className="font-display text-xl font-bold uppercase tracking-[0.15em] text-khaki">
                {productInitials(productTitle)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="-mx-4 sm:mx-0">
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 md:grid-cols-3">
        {media.map((src, index) => (
          <div
            key={src}
            className="relative aspect-[4/3] overflow-hidden border border-charcoal/10 bg-cream"
          >
            <Image
              src={src}
              alt={`${productTitle} — media ${index + 1} of ${media.length}`}
              fill
              loading="lazy"
              sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
