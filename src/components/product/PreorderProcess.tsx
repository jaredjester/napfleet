import { PREORDER_PROCESS } from "@/content/napfleet";

/**
 * "Preorder Protocol" section with three numbered steps
 * (01 CHOOSE, 02 RESERVE, 03 TRACK). Large two-digit numbers,
 * strong dividers; three columns on desktop, vertical stack on mobile.
 * All copy comes from the content layer.
 */
export function PreorderProcess() {
  return (
    <section className="border-y border-charcoal/15 bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <p className="eyebrow text-deep-olive">{PREORDER_PROCESS.eyebrow}</p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl font-bold uppercase tracking-[0.05em] text-charcoal sm:text-4xl">
          {PREORDER_PROCESS.heading}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-gray">
          {PREORDER_PROCESS.copy}
        </p>

        <div className="mt-8 grid divide-y divide-charcoal/20 md:grid-cols-3 md:divide-x md:divide-y-0">
          {PREORDER_PROCESS.steps.map((step) => (
            <div key={step.number} className="py-6 md:px-8 md:py-2 md:first:pl-0 md:last:pr-0">
              <p className="font-display text-5xl font-bold tracking-[0.05em] text-field-olive">
                {step.number}
              </p>
              <h3 className="mt-3 font-display text-lg font-bold uppercase tracking-[0.1em] text-charcoal">
                {step.heading}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-gray">{step.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
