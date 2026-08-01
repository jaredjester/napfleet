"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { mockCommerce } from "@/lib/commerce/mock";
import type { CommerceProduct } from "@/lib/commerce/types";
import { useUi } from "@/context/UiContext";
import { Icon } from "@/components/ui/Icon";

/**
 * Full-screen search overlay driven by UiContext.searchOpen. Runs live
 * (debounced) product searches against the mockCommerce provider. Renders
 * nothing when closed; mount it once at the app root.
 */
export function SearchOverlay() {
  const { searchOpen, closeSearch } = useUi();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CommerceProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  // Focus management + Escape + body scroll lock while open.
  useEffect(() => {
    if (!searchOpen) return;

    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => inputRef.current?.focus(), 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSearch();
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
  }, [searchOpen, closeSearch]);

  // Reset the query each time the overlay is closed.
  useEffect(() => {
    if (!searchOpen) setQuery("");
  }, [searchOpen]);

  // Debounced live search.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    const handle = window.setTimeout(async () => {
      const found = await mockCommerce.searchProducts(trimmed);
      setResults(found);
      setLoading(false);
    }, 200);
    return () => window.clearTimeout(handle);
  }, [query]);

  if (!searchOpen) return null;

  const showPrompt = !hasSearched && !loading;
  const showEmpty = hasSearched && !loading && results.length === 0;

  return (
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden="true"
        onClick={closeSearch}
        className="absolute inset-0 animate-fade-in bg-charcoal/60"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="absolute inset-0 flex animate-fade-in flex-col bg-warm-white"
      >
        <div className="shrink-0 border-b border-charcoal/15">
          <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4 sm:px-6">
            <Icon name="search" className="h-5 w-5 shrink-0 text-text-gray" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the fleet"
              aria-label="Search products"
              className="h-11 flex-1 bg-transparent font-display text-lg uppercase tracking-[0.1em] text-charcoal placeholder:text-text-gray/60 focus:outline-none"
            />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeSearch}
              aria-label="Close search"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center border-l border-charcoal/15"
            >
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
            {loading && (
              <p className="text-sm text-text-gray">Searching the fleet&hellip;</p>
            )}
            {showPrompt && (
              <p className="border border-charcoal/15 px-4 py-8 text-center text-sm text-text-gray">
                Type at least two characters to search products.
              </p>
            )}
            {showEmpty && (
              <div className="border border-charcoal/15 px-4 py-8 text-center">
                <p className="font-display text-lg font-bold uppercase tracking-[0.15em] text-charcoal">
                  No matches found
                </p>
                <p className="mt-1 text-sm text-text-gray">
                  Try a different search term.
                </p>
              </div>
            )}
            {!loading && results.length > 0 && (
              <ul className="divide-y divide-charcoal/10 border-y border-charcoal/15">
                {results.map((product) => (
                  <li key={product.handle}>
                    <Link
                      href={`/products/${product.handle}`}
                      onClick={closeSearch}
                      className={cn(
                        "flex min-h-11 items-center justify-between gap-4 py-3 transition-colors hover:bg-cream"
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-display text-base font-semibold uppercase tracking-[0.1em] text-charcoal">
                          {product.title}
                        </p>
                        <p className="mt-0.5 text-xs uppercase tracking-[0.15em] text-text-gray">
                          {product.domain} &middot; Preorder
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums">
                        {formatPrice(product.variants[0]?.price ?? 0)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
