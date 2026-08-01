import Image from "next/image";
import { HOME } from "@/content/napfleet";

const benefitImages = [
  "/products/command-tank-02.jpg",
  "/products/patrol-boat-02.jpg",
  "/products/rescue-chopper-02.jpg",
];

export function WhyNapFleetSection() {
  return (
    <section className="bg-warm-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="eyebrow text-text-gray mb-3">{HOME.whyNapFleet.eyebrow}</p>
          <h2 className="font-display font-black uppercase tracking-tight text-charcoal text-section-mobile md:text-section-desktop leading-[0.95] mb-4">
            {HOME.whyNapFleet.heading}
          </h2>
          <p className="text-sm sm:text-base text-text-gray max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
            {HOME.whyNapFleet.copy}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {HOME.whyNapFleet.benefits.map((benefit, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="relative aspect-[4/3] bg-cream border border-charcoal/10 overflow-hidden">
                <Image
                  src={benefitImages[i]}
                  alt={benefit.heading}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
              <h3 className="font-display font-bold uppercase tracking-[0.05em] text-charcoal text-base">
                {benefit.heading}
              </h3>
              <p className="text-sm text-text-gray leading-relaxed">{benefit.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
