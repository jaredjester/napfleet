"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProductContent } from "@/content/napfleet";
import { mockCommerce } from "@/lib/commerce/mock";
import type { CommerceProduct } from "@/lib/commerce/types";
import { ProductCard } from "@/components/product/ProductCard";

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [input, setInput] = useState(query);
  const [results, setResults] = useState<CommerceProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    setInput(query);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      setSearching(false);
      return;
    }
    setSearching(true);
    mockCommerce.searchProducts(trimmed).then((found) => {
      if (cancelled) return;
      setResults(found);
      setHasSearched(true);
      setSearching(false);
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 text-center">
        <p className="eyebrow text-text-gray mb-3">FLEET SEARCH</p>
        <h1 className="font-display font-black uppercase tracking-tight text-charcoal text-section-mobile md:text-section-desktop leading-[0.95]">
          Search the Fleet
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl gap-2" role="search">
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search by name or description..."
          aria-label="Search products"
          className="w-full border border-charcoal/20 bg-warm-white px-4 py-3 text-sm text-charcoal placeholder:text-text-gray/40 focus:outline-none focus:border-charcoal/50"
        />
        <button
          type="submit"
          className="border border-signal-orange bg-signal-orange px-5 font-display text-sm font-bold uppercase tracking-[0.15em] text-charcoal transition-colors hover:brightness-95"
        >
          Search
        </button>
      </form>

      <div className="mt-10">
        {searching ? (
          <p className="text-center text-sm text-text-gray/50 py-12">Searching the fleet...</p>
        ) : !hasSearched ? (
          <p className="text-center text-sm text-text-gray/50 py-12">
            Enter a search term to find their ride.
          </p>
        ) : results.length === 0 ? (
          <div className="border border-charcoal/10 px-6 py-12 text-center">
            <p className="font-display font-bold uppercase tracking-[0.15em] text-charcoal text-lg">
              No Results
            </p>
            <p className="mt-2 text-sm text-text-gray">
              No fleet members match &ldquo;{query}&rdquo;. Try another search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((product) => {
                const content = getProductContent(product.handle);
                if (!content) return null;
                return (
              <ProductCard
                key={product.handle}
                product={product}
                content={content}
              />
            )})}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageContent />
    </Suspense>
  );
}
