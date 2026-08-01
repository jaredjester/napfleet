"use client";

import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  label?: string;
};

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  label = "Quantity",
}: QuantityStepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-stretch border border-charcoal/30 bg-warm-white",
        disabled && "opacity-50"
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
        className="flex h-10 w-10 items-center justify-center border-r border-charcoal/30 hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Icon name="minus" className="h-4 w-4" />
      </button>
      <span
        aria-live="polite"
        className="flex h-10 w-10 items-center justify-center text-sm font-semibold tabular-nums"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + 1))}
        className="flex h-10 w-10 items-center justify-center border-l border-charcoal/30 hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Icon name="plus" className="h-4 w-4" />
      </button>
    </div>
  );
}
