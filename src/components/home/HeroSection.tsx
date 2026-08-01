"use client";

import Image from "next/image";
import { HOME } from "@/content/napfleet";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <section className="bg-warm-white overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[56fr_44fr] items-center gap-8 md:gap-12">
        {/* Hero image */}
        <div className="order-1 md:order-1 relative aspect-[4/3] md:aspect-auto md:h-full min-h-[320px] md:min-h-[520px] bg-charcoal/5 overflow-hidden">
          <Image
            src="/products/rescue-chopper-01.jpg"
            alt="NapFleet Rescue Chopper vehicle-shaped dog bed"
            fill
            priority
            sizes="(min-width: 768px) 56vw, 100vw"
            className="object-cover"
          />
        </div>

        {/* Copy */}
        <div className="order-2 md:order-2 px-4 md:px-0 pb-8 md:pb-0 md:pr-8 flex flex-col gap-5">
          <p className="eyebrow text-text-gray">{HOME.hero.eyebrow}</p>
          <h1 className="font-display font-black uppercase tracking-tight text-charcoal text-hero-mobile md:text-hero-desktop leading-[0.95]">
            {HOME.hero.heading}
          </h1>
          <p className="text-sm sm:text-base text-text-gray leading-relaxed max-w-md">
            {HOME.hero.copy}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Button variant="primary" size="lg" href="/shop-the-fleet">
              SHOP THE FLEET
            </Button>
            <Button variant="outline" size="lg" href="/size-guide">
              FIND THEIR RIDE
            </Button>
          </div>

          <p className="text-xs text-text-gray/60 italic">{HOME.hero.stampLine}</p>

          <div className="mt-4 pt-4 border-t border-charcoal/10">
            <p className="text-[11px] font-display uppercase tracking-[0.2em] text-text-gray/50 font-semibold">
              {HOME.hero.sideLabel}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
