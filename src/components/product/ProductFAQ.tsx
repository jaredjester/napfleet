"use client";

import { FAQ_QUESTIONS } from "@/content/napfleet";
import { Accordion } from "@/components/ui/Accordion";

/**
 * FAQ accordion for product pages. Shows only questions with
 * confirmed (non-null) answers.
 */
export function ProductFAQ() {
  const answered = FAQ_QUESTIONS.filter(
    (item): item is { question: string; answer: string } => item.answer !== null
  );

  if (answered.length === 0) return null;

  return (
    <section className="bg-warm-white py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="eyebrow text-text-gray mb-3">MISSION BRIEFING</p>
        <h2 className="mb-8 font-display font-black uppercase tracking-tight text-charcoal text-section-mobile md:text-section-desktop leading-[0.95]">
          Quick Answers
        </h2>
        <Accordion items={answered} />
      </div>
    </section>
  );
}
