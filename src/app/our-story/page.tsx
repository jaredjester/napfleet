import { HOME, BRAND } from "@/content/napfleet";

export default function OurStoryPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="font-display font-black uppercase tracking-tight text-charcoal text-2xl sm:text-3xl mb-6">
        {HOME.aboutSection.heading}
      </h1>

      <div className="prose prose-sm max-w-none">
        <p className="text-sm sm:text-base text-text-gray leading-relaxed whitespace-pre-line">
          {HOME.aboutSection.copy}
        </p>
      </div>

      <div className="mt-10 pt-8 border-t border-charcoal/10 space-y-3">
        <p className="font-display font-bold text-charcoal uppercase tracking-[0.1em]">
          {BRAND.tagline}
        </p>
        <p className="text-sm text-text-gray italic">
          {BRAND.promise}
        </p>
      </div>
    </div>
  );
}
