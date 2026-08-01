"use client";

import { useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

export type AccordionItem = {
  question: string;
  answer: string;
};

type AccordionProps = {
  items: AccordionItem[];
  className?: string;
  defaultOpenIndex?: number | null;
};

export function Accordion({
  items,
  className,
  defaultOpenIndex = 0,
}: AccordionProps) {
  const id = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        buttonRefs.current[(index + 1) % items.length]?.focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        buttonRefs.current[(index - 1 + items.length) % items.length]?.focus();
        break;
      case "Home":
        event.preventDefault();
        buttonRefs.current[0]?.focus();
        break;
      case "End":
        event.preventDefault();
        buttonRefs.current[items.length - 1]?.focus();
        break;
    }
  };

  return (
    <div className={cn("border border-charcoal/20", className)}>
      {items.map((item, index) => {
        const open = openIndex === index;
        const buttonId = `${id}-button-${index}`;
        const regionId = `${id}-region-${index}`;
        return (
          <div key={buttonId} className="border-b border-charcoal/20 last:border-b-0">
            <h3 className="m-0">
              <button
                ref={(node) => {
                  buttonRefs.current[index] = node;
                }}
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={regionId}
                onClick={() => setOpenIndex(open ? null : index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className="flex min-h-11 w-full items-center justify-between gap-4 px-4 py-4 text-left font-display text-sm font-semibold uppercase tracking-[0.1em] text-charcoal hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-orange sm:px-5"
              >
                <span>{item.question}</span>
                <Icon
                  name={open ? "chevron-up" : "chevron-down"}
                  className="h-4 w-4 shrink-0 text-deep-olive"
                />
              </button>
            </h3>
            <div
              id={regionId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                "grid transition-[grid-template-rows] duration-200 ease-out",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <p className="border-t border-charcoal/10 px-4 py-4 text-sm leading-relaxed text-text-gray sm:px-5">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
