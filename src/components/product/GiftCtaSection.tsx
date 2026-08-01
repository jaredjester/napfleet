import { GIFT_CTA } from "@/content/napfleet";
import { Button } from "@/components/ui/Button";

/**
 * Gift CTA shown at the bottom of product pages.
 */
export function GiftCtaSection() {
  return (
    <section className="border-t border-warm-white/10 bg-charcoal py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="eyebrow text-signal-orange mb-4">PROMOTION APPROVED</p>
        <h2 className="font-display font-black uppercase tracking-tight text-warm-white text-section-mobile md:text-section-desktop leading-[0.95]">
          {GIFT_CTA.heading}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-warm-white/60 sm:text-base">
          {GIFT_CTA.copy}
        </p>
        <div className="mt-8">
          <Button variant="primary" size="lg" href="/shop-the-fleet">
            SHOP THE FLEET
          </Button>
        </div>
      </div>
    </section>
  );
}
