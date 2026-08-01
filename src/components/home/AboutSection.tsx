import Image from "next/image";
import { HOME } from "@/content/napfleet";
import { Button } from "@/components/ui/Button";

export function AboutSection() {
  return (
    <section className="bg-cream py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="relative aspect-[4/3] overflow-hidden border border-charcoal/10">
          <Image
            src="/products/command-truck-01.jpg"
            alt="NapFleet Command Truck dog bed"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-4">
          <p className="eyebrow text-text-gray">{HOME.aboutSection.eyebrow}</p>
          <h2 className="font-display font-black uppercase tracking-tight text-charcoal text-section-mobile md:text-section-desktop leading-[0.95]">
            {HOME.aboutSection.heading}
          </h2>
          <p className="text-sm sm:text-base text-text-gray leading-relaxed whitespace-pre-line">
            {HOME.aboutSection.copy}
          </p>
          <div>
            <Button variant="outline" size="md" href="/our-story">
              Read Our Story
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
