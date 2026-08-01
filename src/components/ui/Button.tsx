"use client";

import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  MouseEvent as ReactMouseEvent,
} from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "outline" | "outlineLight";
export type ButtonSize = "sm" | "md" | "lg";

const baseClasses =
  "inline-flex items-center justify-center gap-2 border font-display font-bold uppercase tracking-[0.15em] transition-colors duration-150 rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-orange disabled:cursor-not-allowed disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border-signal-orange bg-signal-orange text-charcoal hover:brightness-95",
  outline: "border-charcoal/40 bg-transparent text-charcoal hover:bg-charcoal/5",
  outlineLight:
    "border-warm-white/40 bg-transparent text-warm-white hover:bg-warm-white/10",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-7 text-base",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string
): string {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
}

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** When provided, renders an anchor styled as a button. */
  href?: string;
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  type = "button",
  href,
  className,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const spinner = (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin border-2 border-current border-t-transparent"
    />
  );

  if (href) {
    return (
      <a
        href={isDisabled ? undefined : href}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        className={buttonClasses(variant, size, className)}
        onClick={(event: ReactMouseEvent<HTMLAnchorElement>) => {
          if (isDisabled) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
        {...(props as unknown as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {loading && spinner}
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={buttonClasses(variant, size, className)}
      onClick={onClick}
      {...props}
    >
      {loading && spinner}
      {children}
    </button>
  );
}
