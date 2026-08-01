import { HOME } from "@/content/napfleet";
import { Button } from "@/components/ui/Button";

export function PreorderSection() {
  return (
    <section className="bg-charcoal py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 text-center flex flex-col gap-5">
        <p className="eyebrow text-warm-white/60">{HOME.preorderSection.eyebrow}</p>
        <h2 className="font-display font-black uppercase tracking-tight text-warm-white text-section-mobile md:text-section-desktop leading-[0.95]">
          {HOME.preorderSection.heading}
        </h2>
        <p className="text-sm sm:text-base text-warm-white/60 leading-relaxed max-w-xl mx-auto">
          {HOME.preorderSection.copy}
        </p>
        <div>
          <Button variant="primary" size="lg" href="/shop-the-fleet">
            RESERVE A BED
          </Button>
        </div>
        <p className="text-xs text-warm-white/40 italic">{HOME.preorderSection.microcopy}</p>
      </div>
    </section>
  );
}
