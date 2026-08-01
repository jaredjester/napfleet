"use client";

import { PREORDER_ESTIMATE_WEEKS } from "@/lib/constants";

const PROFILE_ITEMS = [
  {
    label: "Vehicle-Shaped 3D Design",
    copy: "Sculpted, vehicle-inspired silhouettes built to be the most talked-about spot in the room.",
  },
  {
    label: "Soft Sleeping Center",
    copy: "A soft, tufted sleeping area designed for serious snoozers.",
  },
  {
    label: "Raised Padded Sides",
    copy: "Raised padded sides create a cozy, tucked-in feeling.",
  },
  {
    label: `Preorder · Approx. ${PREORDER_ESTIMATE_WEEKS} Weeks`,
    copy: `Estimated shipping in approximately ${PREORDER_ESTIMATE_WEEKS} weeks, with tracking sent when it ships.`,
  },
];

/**
 * Four-column fleet info rail. Eyebrow: "FLEET PROFILE",
 * heading: "BUILT FOR THE MISSION". Four bordered columns on desktop,
 * a 2x2 grid on mobile. No fake statistics or numbers.
 */
export function FleetProfileRail() {
  return (
    <section className="border-y border-charcoal/15 bg-warm-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <p className="eyebrow text-deep-olive">Fleet Profile</p>
        <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-[0.05em] text-charcoal sm:text-4xl">
          Built for the Mission
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-px border border-charcoal/15 bg-charcoal/15 md:grid-cols-4">
          {PROFILE_ITEMS.map((item) => (
            <div key={item.label} className="bg-warm-white p-5 sm:p-6">
              <span className="block h-2 w-2 bg-field-olive" aria-hidden="true" />
              <h3 className="mt-3 font-display text-sm font-bold uppercase tracking-[0.15em] text-charcoal">
                {item.label}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-text-gray">{item.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
