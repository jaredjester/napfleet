import type { ReactNode, SVGProps } from "react";
import { cn } from "@/lib/cn";

export type IconName =
  | "search"
  | "cart"
  | "menu"
  | "close"
  | "chevron-up"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "minus"
  | "plus"
  | "x-circle"
  | "play"
  | "pause"
  | "star"
  | "arrow-right"
  | "check";

const paths: Record<IconName, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4.5 4.5" />
    </>
  ),
  cart: (
    <>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </>
  ),
  menu: (
    <>
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  "chevron-up": <path d="m18 15-6-6-6 6" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  "chevron-left": <path d="m15 18-6-6 6-6" />,
  "chevron-right": <path d="m9 18 6-6-6-6" />,
  minus: <path d="M5 12h14" />,
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  "x-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9.5 9.5 5 5" />
      <path d="m14.5 9.5-5 5" />
    </>
  ),
  play: <path d="M8 5.5v13l11-6.5Z" />,
  pause: (
    <>
      <path d="M9 5v14" />
      <path d="M15 5v14" />
    </>
  ),
  star: (
    <path d="m12 3 2.7 5.8 6.3.7-4.7 4.3 1.3 6.2-5.6-3.2-5.6 3.2 1.3-6.2L3 9.5l6.3-.7Z" />
  ),
  "arrow-right": (
    <>
      <path d="M4 12h16" />
      <path d="m13 5 7 7-7 7" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
};

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  /** Optional pixel size; defaults to the h-5 w-5 className. */
  size?: number;
};

export function Icon({ name, className, size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className={cn("shrink-0", size === undefined && "h-5 w-5", className)}
      style={size === undefined ? undefined : { width: size, height: size }}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
