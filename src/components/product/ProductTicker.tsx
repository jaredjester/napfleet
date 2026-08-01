"use client";

import { useState } from "react";
import { PRODUCT_TICKER_TAGS } from "@/content/napfleet";
import { cn } from "@/lib/cn";

/**
 * Narrow dark hashtag ticker used across product pages.
 * Continuous marquee; pauses on hover. prefers-reduced-motion is
 * handled globally in globals.css.
 */
export function ProductTicker() {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="group overflow-hidden border-y border-warm-white/10 bg-charcoal text-warm-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p className="sr-only">{PRODUCT_TICKER_TAGS.join(" ")}</p>
      <div
        aria-hidden="true"
        className={cn(
          "flex w-max animate-marquee will-change-transform",
          paused && "pause-animation"
        )}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {PRODUCT_TICKER_TAGS.map((tag) => (
              <span key={tag} className="flex items-center">
                <span className="whitespace-nowrap px-6 py-3 text-xs font-display font-semibold uppercase tracking-[0.2em] sm:text-sm">
                  {tag}
                </span>
                <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-signal-orange/70" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
