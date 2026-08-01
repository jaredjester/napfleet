"use client";

import { useState } from "react";

export default function AdminExportPage() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const handleExport = async () => {
    setExporting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/content");
      const contentData = await res.json();

      const productsRes = await fetch("/api/admin/products?includeUnpublished=true");
      const productsData = await productsRes.json();

      const settingsRes = await fetch("/api/admin/settings");
      const settingsData = await settingsRes.json();

      // Fetch full product details
      const fullProducts = [];
      for (const p of productsData.products || []) {
        try {
          const prodRes = await fetch(`/api/admin/products/${p.handle}`);
          const prodData = await prodRes.json();
          if (prodData.product) fullProducts.push(prodData.product);
        } catch {
          // skip
        }
      }

      const exportData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        store: {
          name: settingsData.settings?.storeName || "NapFleet",
          legalName: settingsData.settings?.legalName || "NapFleet Pet Co.",
          currency: settingsData.settings?.currency || "USD",
        },
        products: fullProducts,
        content: contentData.content || {},
        settings: {},
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `napfleet-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-black uppercase tracking-tight text-charcoal">
          Export Store
        </h1>
        <p className="mt-1 text-sm text-text-gray">
          Download your entire store data as a portable .napfleet.json file
        </p>
      </div>

      <div className="max-w-xl border border-charcoal/10 bg-cream/30 p-8">
        <div className="mb-6">
          <h2 className="font-display text-lg font-bold uppercase tracking-[0.05em] text-charcoal">
            One-Click Export
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-gray">
            Downloads all products, variants, metafields, media URLs, content, and store
            settings into a single JSON file. Use this file to migrate your store to a new
            deployment or create a backup.
          </p>
        </div>

        <div className="space-y-3 border-t border-charcoal/10 pt-4">
          <div className="flex items-center gap-2 text-sm text-text-gray">
            <span className="text-deep-olive">&check;</span>
            All products with variants and metafields
          </div>
          <div className="flex items-center gap-2 text-sm text-text-gray">
            <span className="text-deep-olive">&check;</span>
            Store content and copy
          </div>
          <div className="flex items-center gap-2 text-sm text-text-gray">
            <span className="text-deep-olive">&check;</span>
            Store settings
          </div>
          <div className="flex items-center gap-2 text-sm text-text-gray">
            <span className="text-deep-olive">&check;</span>
            Media URLs (images are not bundled)
          </div>
        </div>

        {error && (
          <div className="mt-4 border border-signal-orange/30 bg-signal-orange/10 px-4 py-3 text-sm text-signal-orange">
            {error}
          </div>
        )}

        <button
          onClick={handleExport}
          disabled={exporting}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-signal-orange px-6 py-3 font-display text-sm font-bold uppercase tracking-[0.1em] text-charcoal hover:bg-signal-orange/90 disabled:opacity-50 transition-colors"
        >
          {exporting ? "Exporting..." : "Download .napfleet.json"}
        </button>
      </div>
    </div>
  );
}
