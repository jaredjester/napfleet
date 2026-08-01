import Image from "next/image";
import { HOME } from "@/content/napfleet";

export function ProductActionBanner() {
  const refuelingLine = HOME.aboutSection.copy.split("\n").pop()?.trim() ?? "";

  return (
    <section className="border-y border-charcoal/10 bg-deep-olive">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="eyebrow text-warm-white/60">NAP MODE // ACTIVE</p>

        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md flex flex-col gap-3">
            <h2 className="font-display font-black uppercase tracking-tight text-warm-white text-3xl leading-[0.95] sm:text-4xl">
              Captured on duty.
            </h2>
            <p className="text-sm leading-relaxed text-warm-white/70">{refuelingLine}</p>
          </div>

          <div className="relative aspect-[16/9] w-full overflow-hidden border border-warm-white/15 lg:aspect-[21/9] lg:max-w-2xl">
            <Image
              src="/products/rescue-chopper-01.jpg"
              alt="NapFleet product in action"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
