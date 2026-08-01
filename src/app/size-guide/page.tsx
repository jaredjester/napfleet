"use client";

import { useState } from "react";
import { products } from "@/content/products";
import { getProductContent } from "@/content/napfleet";
import type { CommerceProduct } from "@/lib/commerce/types";
import { Button } from "@/components/ui/Button";

export default function SizeGuidePage() {
  const [selected, setSelected] = useState(products[0].handle);
  const product = products.find((p) => p.handle === selected);
  const content = product ? getProductContent(product.handle) : null;

  const fields: { key: keyof CommerceProduct; label: string }[] = product
    ? [
        { key: "overallLength", label: "Overall Length" },
        { key: "overallWidth", label: "Overall Width" },
        { key: "overallHeight", label: "Overall Height" },
        { key: "interiorSleepingLength", label: "Interior Sleeping Length" },
        { key: "interiorSleepingWidth", label: "Interior Sleeping Width" },
        { key: "recommendedPetLength", label: "Recommended Pet Length" },
        { key: "recommendedPetWeight", label: "Recommended Pet Weight" },
        { key: "entryHeight", label: "Entry Height" },
        { key: "productWeight", label: "Product Weight" },
      ]
    : [];

  const availableFields = fields.filter((f) => product?.[f.key as keyof typeof product]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
      <div className="text-center mb-8">
        <p className="eyebrow text-text-gray mb-3">MISSION FIT</p>
        <h1 className="font-display font-black uppercase tracking-tight text-charcoal text-section-mobile md:text-section-desktop leading-[0.95]">
          FIND THEIR RIDE
        </h1>
        <p className="text-sm text-text-gray mt-3 max-w-lg mx-auto leading-relaxed">
          Choose a NapFleet design below to view its confirmed overall dimensions, interior sleeping area, and recommended pet-size guidance.
        </p>
      </div>

      {/* Product selector */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {products.map((p) => (
          <button
            key={p.handle}
            onClick={() => setSelected(p.handle)}
            className={`text-xs font-display font-bold uppercase tracking-[0.1em] px-3 py-2 border transition-colors
              ${selected === p.handle
                ? "bg-signal-orange text-charcoal border-signal-orange"
                : "border-charcoal/20 text-text-gray hover:border-charcoal/40"
              }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Measurements */}
      {product && (
        <div className="max-w-md mx-auto border border-charcoal/10">
          <h2 className="font-display font-black uppercase tracking-[0.05em] text-charcoal text-lg p-4 border-b border-charcoal/10 bg-cream">
            {product.title}
          </h2>
          {content?.pageTagline && (
            <p className="text-sm text-text-gray px-4 pt-4">{content.pageTagline}</p>
          )}
          {availableFields.length > 0 ? (
            <div className="divide-y divide-charcoal/10">
              {availableFields.map((f) => (
                <div key={f.key} className="flex justify-between px-4 py-3 text-sm">
                  <span className="text-text-gray">{f.label}</span>
                  <span className="font-semibold text-charcoal tabular-nums">
                    {String(product[f.key as keyof typeof product] ?? "")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-gray/50 px-4 py-6 text-center">
              Measurements coming soon
            </p>
          )}
          <div className="p-4 border-t border-charcoal/10">
            <Button variant="primary" size="md" href={`/products/${product.handle}`} className="w-full">
              View {product.title}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
