import { HOME } from "@/content/napfleet";

export function FleetInfoRailSection() {
  return (
    <section className="bg-warm-white py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4">
        <p className="eyebrow text-text-gray text-center mb-3">{HOME.fleetInfoRail.eyebrow}</p>
        <h2 className="font-display font-black uppercase tracking-tight text-charcoal text-section-mobile md:text-section-desktop leading-[0.95] text-center mb-8">
          {HOME.fleetInfoRail.heading}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-charcoal/10">
          {HOME.fleetInfoRail.items.map((item, i) => (
            <div
              key={i}
              className="p-6 text-center border-r border-b md:border-b-0 border-charcoal/10 last:border-r-0
                         [&:nth-child(3)]:border-b-0 md:[&:nth-child(3)]:border-b-0 [&:nth-child(4)]:border-b-0"
            >
              <p className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-charcoal mb-1 leading-none">
                {item.value}
              </p>
              <p className="text-[10px] sm:text-xs font-display uppercase tracking-[0.15em] text-text-gray font-semibold">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
