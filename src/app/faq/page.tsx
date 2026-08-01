"use client";

import { FAQ_QUESTIONS } from "@/content/napfleet";
import { Accordion } from "@/components/ui/Accordion";

export default function FAQPage() {
  const visibleQuestions = FAQ_QUESTIONS.filter((q) => q.answer !== null).map((q) => ({
    question: q.question,
    answer: q.answer!,
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      <div className="text-center mb-8">
        <p className="eyebrow text-text-gray mb-3">MISSION BRIEFING</p>
        <h1 className="font-display font-black uppercase tracking-tight text-charcoal text-section-mobile md:text-section-desktop leading-[0.95]">
          QUESTIONS BEFORE TAKEOFF?
        </h1>
      </div>

      {visibleQuestions.length > 0 ? (
        <Accordion items={visibleQuestions} />
      ) : (
        <p className="text-center text-text-gray/50 text-sm py-8">
          FAQ answers are being prepared. Check back soon.
        </p>
      )}
    </div>
  );
}
