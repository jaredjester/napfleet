"use client";

import { TICKER_STATEMENTS } from "@/content/napfleet";

/**
 * Continuous marquee ticker. The track holds two identical copies of the
 * statement sequence so the -50% marquee keyframe loops seamlessly.
 * Pauses on hover; prefers-reduced-motion is handled globally in globals.css.
 */
export function BrandTicker() {
  return (
    <div className="group overflow-hidden border-b border-warm-white/10 bg-charcoal text-warm-white">
      <p className="sr-only">{TICKER_STATEMENTS.join(" ")}</p>

      <div
        aria-hidden="true"
        className="flex w-max animate-marquee group-hover:pause-animation will-change-transform"
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {TICKER_STATEMENTS.map((statement) => (
              <span key={statement} className="flex items-center">
                <span className="whitespace-nowrap px-6 py-2.5 text-xs font-display font-semibold uppercase tracking-[0.2em] sm:text-sm">
                  {statement}
                </span>
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 bg-khaki/70"
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
