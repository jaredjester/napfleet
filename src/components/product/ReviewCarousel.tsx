"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TouchEvent as ReactTouchEvent } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { mockReviews } from "@/lib/commerce/mock";
import type { Review } from "@/lib/commerce/types";
import { Icon } from "@/components/ui/Icon";

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("") || "R";
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`Rated ${rating} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Icon
          key={index}
          name="star"
          className={cn(
            "h-4 w-4",
            index < rating ? "fill-field-olive text-field-olive" : "text-charcoal/20"
          )}
        />
      ))}
    </div>
  );
}

type ReviewCarouselProps = {
  handle: string;
};

/**
 * Review carousel. Renders ONLY when authentic reviews exist — an empty
 * result renders nothing at all (no heading, no stars, no placeholders).
 */
export function ReviewCarousel({ handle }: ReviewCarouselProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loaded, setLoaded] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    mockReviews.getProductReviews(handle).then((found) => {
      if (cancelled) return;
      setReviews(found);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [handle]);

  const scrollByCards = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-review-card]");
    const width = card?.offsetWidth ?? track.clientWidth;
    track.scrollBy({ left: direction * (width + 12), behavior: "smooth" });
  }, []);

  if (!loaded) return null;
  if (reviews.length === 0) return null;

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 48) {
      scrollByCards(delta < 0 ? 1 : -1);
    }
    touchStartX.current = null;
  };

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-deep-olive">Reviews</p>
          <h2 className="mt-2 font-display text-2xl font-bold uppercase tracking-[0.05em] text-charcoal sm:text-3xl">
            From the Fleet
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            aria-label="Previous reviews"
            className="flex h-11 w-11 items-center justify-center border border-charcoal/25 bg-warm-white text-charcoal transition-colors hover:bg-cream"
          >
            <Icon name="chevron-left" className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            aria-label="Next reviews"
            className="flex h-11 w-11 items-center justify-center border border-charcoal/25 bg-warm-white text-charcoal transition-colors hover:bg-cream"
          >
            <Icon name="chevron-right" className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        role="region"
        aria-label="Customer reviews"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") scrollByCards(-1);
          if (event.key === "ArrowRight") scrollByCards(1);
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1"
      >
        {reviews.map((review) => (
          <article
            key={review.id}
            data-review-card
            className="flex w-[82%] shrink-0 snap-start flex-col border border-charcoal/15 bg-warm-white p-5 sm:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.5rem)]"
          >
            <div className="flex items-center gap-3">
              {review.image ? (
                <div className="h-10 w-10 shrink-0 overflow-hidden border border-charcoal/15 bg-cream">
                  <Image
                    src={review.image}
                    alt={`${review.authorName} — customer photo`}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-charcoal/15 bg-field-olive/15 font-display text-sm font-bold uppercase tracking-widest text-field-olive">
                  {initials(review.authorName)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold uppercase tracking-[0.08em] text-charcoal">
                  {review.authorName}
                </p>
                {review.verified && (
                  <span className="mt-0.5 inline-block border border-field-olive/40 px-1.5 py-0.5 font-display text-[9px] font-bold uppercase tracking-[0.15em] text-field-olive">
                    Verified
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3">
              <StarRating rating={review.rating} />
            </div>

            <p className="mt-3 text-sm leading-relaxed text-charcoal/85">{review.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
