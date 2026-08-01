import { FULFILLMENT_TIMELINE } from "@/content/napfleet";

/**
 * Three-step fulfillment timeline: RESERVED → RIDE PREPARATION →
 * TRACKING SENT. Icons connected by thin lines; vertical on mobile,
 * horizontal on desktop. All copy comes from the content layer.
 */

function ReservedIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <rect x="4" y="3" width="16" height="18" />
      <path d="m8 10 2.5 2.5L16 7" />
    </svg>
  );
}

function PreparationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" />
      <path d="M3 7l9 5 9-5" />
      <path d="m12 12v10" />
    </svg>
  );
}

function TrackingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path d="M2 5h13v11H2Z" />
      <path d="M15 9h4l3 4v3h-7" />
      <circle cx="6.5" cy="18.5" r="1.75" />
      <circle cx="17.5" cy="18.5" r="1.75" />
    </svg>
  );
}

const STEP_ICONS = [ReservedIcon, PreparationIcon, TrackingIcon];

export function FulfillmentTimeline() {
  return (
    <div>
      <h2 className="font-display text-lg font-bold uppercase tracking-[0.08em] text-charcoal">
        Fulfillment Timeline
      </h2>

      <div className="relative mt-6 md:grid md:grid-cols-3 md:gap-8">
        {/* Connecting lines */}
        <div
          className="absolute bottom-6 left-6 top-6 w-px bg-charcoal/15 md:hidden"
          aria-hidden="true"
        />
        <div
          className="absolute left-0 right-0 top-6 hidden h-px bg-charcoal/15 md:block"
          aria-hidden="true"
        />

        <ol className="relative space-y-8 md:grid md:grid-cols-3 md:gap-8 md:space-y-0">
          {FULFILLMENT_TIMELINE.steps.map((step, index) => {
            const StepIcon = STEP_ICONS[index] ?? STEP_ICONS[0];
            return (
              <li key={step.label} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center border border-charcoal/20 bg-warm-white text-deep-olive">
                  <StepIcon />
                </div>
                <div className="pt-1 md:pt-3">
                  <h3 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-charcoal">
                    {step.label}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-text-gray">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
