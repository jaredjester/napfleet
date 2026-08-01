import { HOME } from "@/content/napfleet";

export function BenefitStrip() {
  return (
    <section className="bg-deep-olive text-warm-white border-y border-warm-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4 text-center">
        <p className="text-xs sm:text-sm font-display font-semibold uppercase tracking-[0.15em]">
          {HOME.benefitStrip}
        </p>
      </div>
    </section>
  );
}
