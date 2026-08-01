"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { BRAND, NAV_LINKS } from "@/content/napfleet";
import { useUi } from "@/context/UiContext";
import { Icon } from "@/components/ui/Icon";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Slide-out navigation drawer from the left. Always mounted so the open/close
 * transition runs; visibility, focus, and scroll lock are driven by `open`.
 */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { openSearch } = useUi();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.setTimeout(() => lastFocusedRef.current?.focus(), 0);
    };
  }, [open, onClose]);

  const handleSearch = () => {
    onClose();
    openSearch();
  };

  return (
    <div
      className={cn("fixed inset-0 z-50", open ? "visible" : "invisible")}
      aria-hidden={!open}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-charcoal/60 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "absolute inset-y-0 left-0 flex w-full max-w-sm flex-col border-r border-charcoal/15 bg-warm-white transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-charcoal/15 pl-4 pr-2">
          <span className="font-display text-lg font-bold uppercase tracking-[0.3em] text-charcoal">
            {BRAND.name}
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex h-11 w-11 items-center justify-center"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-charcoal/10">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="flex min-h-11 items-center justify-between gap-4 px-4 py-3 font-display text-base font-semibold uppercase tracking-[0.15em] text-charcoal transition-colors hover:bg-cream"
                >
                  {link.label}
                  <Icon name="chevron-right" className="h-4 w-4 text-text-gray" />
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={handleSearch}
            className="flex min-h-11 w-full items-center justify-between gap-4 border-t border-charcoal/10 px-4 py-3 font-display text-base font-semibold uppercase tracking-[0.15em] text-charcoal transition-colors hover:bg-cream"
          >
            Search
            <Icon name="search" className="h-4 w-4 text-text-gray" />
          </button>
        </nav>
      </div>
    </div>
  );
}
