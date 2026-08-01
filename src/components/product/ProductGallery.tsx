"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TouchEvent as ReactTouchEvent } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

function productInitials(title: string): string {
  const words = title
    .replace(/[^a-zA-Z\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("") || "NF";
}

type ProductGalleryProps = {
  images: string[];
  productTitle: string;
};

/**
 * Product image gallery: primary image with prev/next controls, swipe
 * gestures, a thumbnail strip, and a fullscreen lightbox. Falls back to
 * a styled initials placeholder when no images exist yet.
 */
export function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const count = images.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Keep the index in range if the image list shrinks.
  useEffect(() => {
    if (count === 0) {
      setCurrentIndex(0);
      return;
    }
    setCurrentIndex((index) => Math.min(index, count - 1));
  }, [count]);

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setCurrentIndex(((index % count) + count) % count);
    },
    [count]
  );

  const next = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex]);
  const prev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex]);

  // Lightbox: Escape to close, arrows to navigate, body scroll lock.
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, next, prev]);

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 48) {
      if (delta < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  if (count === 0) {
    return (
      <div className="relative aspect-square w-full overflow-hidden border border-charcoal/15 bg-cream">
        <span className="absolute inset-0 flex items-center justify-center font-display text-4xl font-bold uppercase tracking-[0.2em] text-field-olive">
          {productInitials(productTitle)}
        </span>
      </div>
    );
  }

  const current = images[Math.min(currentIndex, count - 1)];
  const altFor = (index: number) => `${productTitle} — photo ${index + 1} of ${count}`;

  return (
    <div>
      {/* Primary image */}
      <div
        className="relative aspect-square w-full overflow-hidden border border-charcoal/15 bg-cream"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          type="button"
          aria-label="Open fullscreen gallery"
          onClick={() => setLightboxOpen(true)}
          className="absolute inset-0 z-10 h-full w-full cursor-zoom-in"
        >
          <Image
            src={current}
            alt={altFor(currentIndex)}
            fill
            priority={currentIndex === 0}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </button>

        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-between px-2">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous photo"
            className="pointer-events-auto flex h-11 w-11 items-center justify-center border border-charcoal/15 bg-warm-white/90 text-charcoal transition-colors hover:bg-cream"
          >
            <Icon name="chevron-left" className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next photo"
            className="pointer-events-auto flex h-11 w-11 items-center justify-center border border-charcoal/15 bg-warm-white/90 text-charcoal transition-colors hover:bg-cream"
          >
            <Icon name="chevron-right" className="h-5 w-5" />
          </button>
        </div>

        <span className="pointer-events-none absolute bottom-3 right-3 z-20 border border-charcoal/15 bg-warm-white/90 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.15em] text-charcoal">
          {currentIndex + 1} / {count}
        </span>
      </div>

      {/* Thumbnail strip */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Show ${altFor(index)}`}
            aria-current={index === currentIndex ? "true" : undefined}
            className={cn(
              "relative h-16 w-16 shrink-0 overflow-hidden border bg-cream",
              index === currentIndex
                ? "border-signal-orange"
                : "border-charcoal/15 hover:border-charcoal/40"
            )}
          >
            <Image src={src} alt="" fill sizes="64px" loading="lazy" className="object-cover" />
          </button>
        ))}
      </div>

      {/* Fullscreen lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-charcoal/95"
          role="dialog"
          aria-modal="true"
          aria-label={`${productTitle} gallery`}
        >
          <div className="flex items-center justify-between border-b border-warm-white/15 px-4 py-3">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-warm-white">
              {currentIndex + 1} / {count}
            </p>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close gallery"
              className="flex h-11 w-11 items-center justify-center text-warm-white transition-colors hover:text-signal-orange"
            >
              <Icon name="close" className="h-6 w-6" />
            </button>
          </div>

          <div className="relative flex-1">
            <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-10">
              <div className="relative h-full max-h-[80vh] w-full max-w-4xl">
                <Image
                  src={current}
                  alt={altFor(currentIndex)}
                  fill
                  sizes="(min-width: 1024px) 80vw, 100vw"
                  className="object-contain"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-warm-white/25 text-warm-white transition-colors hover:bg-warm-white/10"
            >
              <Icon name="chevron-left" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-warm-white/25 text-warm-white transition-colors hover:bg-warm-white/10"
            >
              <Icon name="chevron-right" className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
