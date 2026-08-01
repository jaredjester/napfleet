import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";

type PriceDisplayProps = {
  /** Price in cents. */
  price: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASSES: Record<NonNullable<PriceDisplayProps["size"]>, string> = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl sm:text-3xl",
};

/**
 * Current price only. NapFleet never displays crossed-out prices, discounts,
 * or sale badges — the preorder price is the price.
 */
export function PriceDisplay({ price, size = "md", className }: PriceDisplayProps) {
  return (
    <p className={cn("font-body font-bold tabular-nums text-charcoal", SIZE_CLASSES[size], className)}>
      {formatPrice(price)}
    </p>
  );
}
