"use client";

import { ANNOUNCEMENT } from "@/content/napfleet";

export function AnnouncementBar() {
  return (
    <div className="bg-charcoal text-warm-white text-center py-2.5 px-4">
      <p className="text-xs sm:text-sm font-display uppercase tracking-[0.2em] font-semibold">
        {ANNOUNCEMENT.bar1}
      </p>
    </div>
  );
}
