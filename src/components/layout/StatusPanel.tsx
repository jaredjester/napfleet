"use client";

import { ANNOUNCEMENT } from "@/content/napfleet";

/**
 * Tactical status panel. Desktop: three columns separated by vertical
 * dividers. Mobile: same content stacked with horizontal dividers.
 */
export function StatusPanel() {
  return (
    <div className="bg-deep-olive text-warm-white">
      <div className="mx-auto flex max-w-7xl flex-col divide-y divide-warm-white/15 md:flex-row md:divide-y-0 md:divide-x md:divide-warm-white/15">
        <div className="flex flex-1 items-center justify-center gap-2 px-4 py-2">
          <span className="h-1.5 w-1.5 shrink-0 bg-khaki" aria-hidden="true" />
          <p className="text-[11px] font-display font-semibold uppercase tracking-[0.2em] sm:text-xs">
            {ANNOUNCEMENT.statusLabel}
          </p>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-2">
          <p className="text-[11px] font-display font-semibold uppercase tracking-[0.2em] sm:text-xs">
            {ANNOUNCEMENT.statusCenter}
          </p>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-2">
          <p className="text-[11px] font-display font-semibold uppercase tracking-[0.2em] sm:text-xs">
            {ANNOUNCEMENT.statusRight}
          </p>
        </div>
      </div>
    </div>
  );
}
