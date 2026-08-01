import Link from "next/link";
import { QUICK_QUESTIONS } from "@/content/napfleet";

/**
 * Compact questions shown immediately after the purchase area on
 * product pages. Only confirmed (non-null) answers are shown.
 * "VIEW FULL DETAILS" jumps to the spec sheet section.
 */
export function QuickQuestions() {
  const answered = QUICK_QUESTIONS.filter(
    (item): item is { question: string; answer: string } => item.answer !== null
  );

  if (answered.length === 0) return null;

  return (
    <div className="mt-6 border border-charcoal/15 bg-cream">
      <ul className="divide-y divide-charcoal/10">
        {answered.map((item) => (
          <li key={item.question} className="px-4 py-3 sm:px-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.08em] text-charcoal">
              {item.question}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-text-gray sm:text-sm">
              {item.answer}
            </p>
          </li>
        ))}
      </ul>
      <div className="border-t border-charcoal/10 px-4 py-3 sm:px-5">
        <Link
          href="#specs"
          className="font-display text-xs font-bold uppercase tracking-[0.15em] text-signal-orange hover:text-charcoal"
        >
          View Full Details
        </Link>
      </div>
    </div>
  );
}
