import Image from "next/image";
import { HOME } from "@/content/napfleet";
import { Button } from "@/components/ui/Button";

export function GiftSection() {
  return (
    <section className="bg-charcoal py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="order-2 md:order-1 flex flex-col gap-4">
          <p className="eyebrow text-warm-white/60">{HOME.giftSection.eyebrow}</p>
          <h2 className="font-display font-black uppercase tracking-tight text-warm-white text-section-mobile md:text-section-desktop leading-[0.95]">
            {HOME.giftSection.heading}
          </h2>
          <p className="text-sm sm:text-base text-warm-white/60 leading-relaxed whitespace-pre-line">
            {HOME.giftSection.copy}
          </p>
          <div>
            <Button variant="outlineLight" size="lg" href="/shop-the-fleet">
              CHOOSE THEIR MISSION
            </Button>
          </div>
        </div>
        <div className="order-1 md:order-2 relative aspect-[4/3] overflow-hidden">
          <Image
            src="/products/top-dog-jet-01.jpg"
            alt="NapFleet dog bed gift"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
