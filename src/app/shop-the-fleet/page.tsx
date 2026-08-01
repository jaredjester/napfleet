"use client";

import { useEffect, useState } from "react";
import { HOME } from "@/content/napfleet";
import { getProductContent } from "@/content/napfleet";
import { mockCommerce } from "@/lib/commerce/mock";
import type { CommerceProduct } from "@/lib/commerce/types";
import { ProductCard } from "@/components/product/ProductCard";

export default function ShopTheFleetPage() {
  const [products, setProducts] = useState<CommerceProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockCommerce.getCollection("shop-the-fleet").then((p) => {
      setProducts(p);
      setLoading(false);
    });
  }, []);

  const published = products.filter((p) => p.publishReady);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
      <div className="text-center mb-10">
        <p className="eyebrow text-text-gray mb-3">{HOME.collectionIntro.eyebrow}</p>
        <h1 className="font-display font-black uppercase tracking-tight text-charcoal text-section-mobile md:text-section-desktop leading-[0.95]">
          SHOP THE FLEET
        </h1>
      </div>

      {loading ? (
        <p className="text-center text-text-gray/50 text-sm py-12">Loading the fleet...</p>
      ) : published.length === 0 ? (
        <div className="text-center py-12 border border-charcoal/10">
          <p className="font-display font-bold uppercase tracking-[0.15em] text-charcoal text-lg">
            Preparing for Launch
          </p>
          <p className="text-sm text-text-gray mt-2">
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
  );
}
