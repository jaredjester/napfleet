"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { DOMAINS } from "@/lib/constants";

type ProductSummary = {
  id: string;
  handle: string;
  title: string;
  domain: string;
  publishReady: boolean;
  preorderStatus: string;
  price: number;
  variantCount: number;
  mediaCount: number;
  updatedAt: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [domainFilter, setDomainFilter] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("includeUnpublished", "true");
      if (domainFilter) params.set("domain", domainFilter);
      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainFilter]);

  const togglePublish = async (handle: string, current: boolean) => {
    try {
      await fetch(`/api/admin/products/${handle}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publishReady: !current }),
      });
      fetchProducts();
    } catch (err) {
      console.error("Failed to toggle publish", err);
    }
  };

  const handleDelete = async (handle: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/admin/products/${handle}`, { method: "DELETE" });
      fetchProducts();
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-charcoal">
            Products
          </h1>
          <p className="mt-1 text-sm text-text-gray">
            Manage your product catalog
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-signal-orange px-4 py-2.5 font-display text-xs font-bold uppercase tracking-[0.1em] text-charcoal hover:bg-signal-orange/90 transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {/* Domain filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setDomainFilter("")}
          className={`text-[10px] font-display font-bold uppercase tracking-[0.1em] px-2.5 py-1.5 border transition-colors ${
            domainFilter === ""
              ? "bg-charcoal text-warm-white border-charcoal"
              : "border-charcoal/20 text-text-gray hover:border-charcoal/40"
          }`}
        >
          All
        </button>
        {DOMAINS.map((d) => (
          <button
            key={d}
            onClick={() => setDomainFilter(d)}
            className={`text-[10px] font-display font-bold uppercase tracking-[0.1em] px-2.5 py-1.5 border transition-colors ${
              domainFilter === d
                ? "bg-charcoal text-warm-white border-charcoal"
                : "border-charcoal/20 text-text-gray hover:border-charcoal/40"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Product table */}
      {loading ? (
        <p className="py-8 text-center text-sm text-text-gray/50">Loading products...</p>
      ) : products.length === 0 ? (
        <div className="border border-charcoal/10 px-6 py-12 text-center">
          <p className="font-display font-bold uppercase tracking-[0.15em] text-charcoal">
            No Products Yet
          </p>
          <p className="mt-1 text-sm text-text-gray">
            Create your first product to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-charcoal/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 bg-cream">
                <th className="p-3 text-left text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                  Product
                </th>
                <th className="p-3 text-left text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                  Domain
                </th>
                <th className="p-3 text-right text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                  Price
                </th>
                <th className="p-3 text-center text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                  Status
                </th>
                <th className="p-3 text-center text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                  Published
                </th>
                <th className="p-3 text-right text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-cream/50 transition-colors">
                  <td className="p-3">
                    <Link
                      href={`/admin/products/${product.handle}`}
                      className="font-mono text-xs font-bold text-charcoal hover:text-signal-orange transition-colors"
                    >
                      {product.title}
                    </Link>
                    <br />
                    <span className="text-[10px] text-text-gray/50">{product.handle}</span>
                  </td>
                  <td className="p-3">
                    <span className="inline-block border border-charcoal/20 px-1.5 py-0.5 text-[9px] font-display font-bold uppercase tracking-[0.1em] text-text-gray">
                      {product.domain}
                    </span>
                  </td>
                  <td className="p-3 text-right font-semibold tabular-nums">
                    {formatPrice(product.price)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block text-[9px] font-display font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 border ${
                        product.preorderStatus === "open"
                          ? "border-signal-orange/30 bg-signal-orange/10 text-signal-orange"
                          : "border-charcoal/20 text-text-gray/50"
                      }`}
                    >
                      {product.preorderStatus === "open" ? "Preorder Open" : "Closed"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => togglePublish(product.handle, product.publishReady)}
                      className={`text-[9px] font-display font-bold uppercase tracking-[0.1em] px-2 py-1 border transition-colors ${
                        product.publishReady
                          ? "border-deep-olive/40 bg-deep-olive/10 text-deep-olive"
                          : "border-charcoal/20 text-text-gray/40"
                      }`}
                    >
                      {product.publishReady ? "Live" : "Draft"}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.handle}`}
                        className="text-[9px] font-display font-bold uppercase tracking-[0.1em] text-text-gray hover:text-charcoal transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product.handle, product.title)}
                        className="text-[9px] font-display font-bold uppercase tracking-[0.1em] text-signal-orange/60 hover:text-signal-orange transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
