"use client";

import { useEffect, useState } from "react";
import { HOME } from "@/content/napfleet";
import { getProductContent } from "@/content/napfleet";
import { mockCommerce } from "@/lib/commerce/mock";
import type { CommerceProduct } from "@/lib/commerce/types";
import { ProductCard } from "@/components/product/ProductCard";

export function CollectionIntroSection() {
  const [products, setProducts] = useState<CommerceProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockCommerce.getCollection("shop-the-fleet").then((p) => {
      setProducts(p);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  // Only show publishReady products
  const published = products.filter((p) => p.publishReady);

  return (
    <section className="bg-cream py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="eyebrow text-text-gray mb-3">{HOME.collectionIntro.eyebrow}</p>
          <h2 className="font-display font-black uppercase tracking-tight text-charcoal text-section-mobile md:text-section-desktop leading-[0.95] mb-4">
            {HOME.collectionIntro.heading}
          </h2>
          <p className="text-sm sm:text-base text-text-gray max-w-xl mx-auto leading-relaxed">
            {HOME.collectionIntro.copy}
          </p>
        </div>

        {published.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-gray/50 font-display uppercase tracking-[0.2em] text-sm">
              Preparing for launch
            </p>
            <p className="text-text-gray/40 text-sm mt-2">
              The fleet is getting ready. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
            {published.map((p) => {
                const content = getProductContent(p.handle);
                if (!content) return null;
                return <ProductCard key={p.handle} product={p} content={content} />;
              })}
          </div>
        )}
      </div>
    </section>
  );
}
