"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { DOMAINS } from "@/lib/constants";
import type { CommerceProduct, CommerceVariant } from "@/lib/commerce/types";

type Tab = "basic" | "variants" | "metafields" | "media";

const TABS: { key: Tab; label: string }[] = [
  { key: "basic", label: "Basic Info" },
  { key: "variants", label: "Variants" },
  { key: "metafields", label: "Metafields" },
  { key: "media", label: "Media" },
];

const METAFIELD_DEFS: { key: string; label: string }[] = [
  { key: "overallLength", label: "Overall Length" },
  { key: "overallWidth", label: "Overall Width" },
  { key: "overallHeight", label: "Overall Height" },
  { key: "interiorSleepingLength", label: "Interior Sleeping Length" },
  { key: "interiorSleepingWidth", label: "Interior Sleeping Width" },
  { key: "recommendedPetLength", label: "Recommended Pet Length" },
  { key: "recommendedPetWeight", label: "Recommended Pet Weight" },
  { key: "entryHeight", label: "Entry Height" },
  { key: "productWeight", label: "Product Weight" },
  { key: "materials", label: "Materials" },
  { key: "filling", label: "Filling" },
  { key: "careInstructions", label: "Care Instructions" },
  { key: "boxContents", label: "Box Contents" },
  { key: "assemblyRequired", label: "Assembly Required" },
  { key: "returnEligibility", label: "Return Eligibility" },
  { key: "sleepAreaDesign", label: "Sleep Area Design" },
];

const FIELD_CLASS =
  "w-full border border-charcoal/20 bg-warm-white px-3 py-2 text-sm text-charcoal focus:border-charcoal/50 focus:outline-none";
const LABEL_CLASS =
  "mb-1 block font-display text-[10px] font-bold uppercase tracking-[0.12em] text-text-gray";

export default function ProductEditorPage({
  params,
}: {
  params: { handle: string };
}) {
  const router = useRouter();
  const isNew = params.handle === "new";
  const [tab, setTab] = useState<Tab>("basic");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Basic fields
  const [handle, setHandle] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState<string>("AIR");
  const [publishReady, setPublishReady] = useState(false);
  const [preorderStatus, setPreorderStatus] = useState<"open" | "closed">("closed");
  const [preorderEstimateWeeks, setPreorderEstimateWeeks] = useState(8);

  // Variants
  const [variants, setVariants] = useState<CommerceVariant[]>([]);

  // Metafields
  const [metafields, setMetafields] = useState<Record<string, string>>({});

  // Media
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState("");

  // Fetch existing product
  useEffect(() => {
    if (isNew) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/products/${params.handle}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        const p: CommerceProduct = data.product;
        setHandle(p.handle);
        setTitle(p.title);
        setDescription(p.description);
        setDomain(p.domain);
        setPublishReady(p.publishReady);
        setPreorderStatus(p.preorderStatus);
        setPreorderEstimateWeeks(p.preorderEstimateWeeks);
        setVariants(p.variants);
        setMediaUrls(p.images);

        // Extract metafields from product
        const mfs: Record<string, string> = {};
        for (const def of METAFIELD_DEFS) {
          const val = (p as Record<string, unknown>)[def.key];
          if (val) mfs[def.key] = String(val);
        }
        setMetafields(mfs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    })();
  }, [isNew, params.handle]);

  const buildPayload = useCallback(() => {
    return {
      handle,
      title,
      description,
      domain,
      publishReady,
      preorderStatus,
      preorderEstimateWeeks,
      variants: variants.map((v, i) => ({
        title: v.title,
        sku: v.sku,
        price: v.price,
        available: v.available,
        sortOrder: i,
      })),
      metafields,
      media: mediaUrls,
    };
  }, [handle, title, description, domain, publishReady, preorderStatus, preorderEstimateWeeks, variants, metafields, mediaUrls]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = buildPayload();
      const url = isNew ? "/api/admin/products" : `/api/admin/products/${params.handle}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      if (isNew) {
        router.push(`/admin/products/${handle}`);
      } else {
        // Refresh data
        setLoading(true);
        const data = await (await fetch(`/api/admin/products/${handle}`)).json();
        const p: CommerceProduct = data.product;
        setVariants(p.variants);
        setMediaUrls(p.images);
        const mfs: Record<string, string> = {};
        for (const def of METAFIELD_DEFS) {
          const val = (p as Record<string, unknown>)[def.key];
          if (val) mfs[def.key] = String(val);
        }
        setMetafields(mfs);
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Variant helpers
  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: `new-${Date.now()}`,
        title: "Default",
        sku: "",
        price: 6999,
        available: true,
      },
    ]);
  };

  const updateVariant = (index: number, updates: Partial<CommerceVariant>) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], ...updates };
    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Media helpers
  const addMediaUrl = () => {
    if (!newMediaUrl.trim()) return;
    setMediaUrls([...mediaUrls, newMediaUrl.trim()]);
    setNewMediaUrl("");
  };

  const removeMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const moveMedia = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= mediaUrls.length) return;
    const updated = [...mediaUrls];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setMediaUrls(updated);
  };

  if (loading) {
    return (
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm text-text-gray/50">Loading product...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="text-xs font-display font-bold uppercase tracking-[0.1em] text-text-gray/50 hover:text-text-gray transition-colors"
            >
              &larr; Products
            </Link>
          </div>
          <h1 className="mt-2 font-display text-2xl font-black uppercase tracking-tight text-charcoal">
            {isNew ? "New Product" : title || params.handle}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-signal-orange px-6 py-2.5 font-display text-xs font-bold uppercase tracking-[0.1em] text-charcoal hover:bg-signal-orange/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save Product"}
        </button>
      </div>

      {error && (
        <div className="mb-6 border border-signal-orange/30 bg-signal-orange/10 px-4 py-3 text-sm text-signal-orange">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-charcoal/10">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-[10px] font-display font-bold uppercase tracking-[0.1em] border-b-2 transition-colors ${
              tab === t.key
                ? "border-charcoal text-charcoal"
                : "border-transparent text-text-gray/50 hover:text-text-gray"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Basic Info */}
      {tab === "basic" && (
        <div className="max-w-2xl space-y-5">
          <div>
            <label className={LABEL_CLASS}>Title</label>
            <input
              className={FIELD_CLASS}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rescue Chopper Dog Bed"
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Handle</label>
            <input
              className={FIELD_CLASS}
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="e.g. rescue-chopper-dog-bed"
              disabled={!isNew}
            />
            {!isNew && (
              <p className="mt-1 text-[10px] text-text-gray/50">
                Handle cannot be changed after creation.
              </p>
            )}
          </div>

          <div>
            <label className={LABEL_CLASS}>Domain</label>
            <select
              className={FIELD_CLASS}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            >
              {DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS}>Description</label>
            <textarea
              className={FIELD_CLASS}
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Preorder Status</label>
              <select
                className={FIELD_CLASS}
                value={preorderStatus}
                onChange={(e) => setPreorderStatus(e.target.value as "open" | "closed")}
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Preorder Estimate (Weeks)</label>
              <input
                className={FIELD_CLASS}
                type="number"
                value={preorderEstimateWeeks}
                onChange={(e) => setPreorderEstimateWeeks(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPublishReady(!publishReady)}
              className={`px-3 py-2 font-display text-[10px] font-bold uppercase tracking-[0.1em] border transition-colors ${
                publishReady
                  ? "border-deep-olive/40 bg-deep-olive/10 text-deep-olive"
                  : "border-charcoal/20 text-text-gray/50"
              }`}
            >
              {publishReady ? "Published" : "Draft"}
            </button>
            <span className="text-xs text-text-gray/50">
              {publishReady ? "Visible on storefront" : "Hidden from storefront"}
            </span>
          </div>
        </div>
      )}

      {/* Tab: Variants */}
      {tab === "variants" && (
        <div className="max-w-2xl space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-bold uppercase tracking-[0.08em] text-charcoal">
              Variants ({variants.length})
            </p>
            <button
              onClick={addVariant}
              className="border border-charcoal/20 px-3 py-1.5 text-[10px] font-display font-bold uppercase tracking-[0.1em] text-text-gray hover:border-charcoal/40 transition-colors"
            >
              + Add Variant
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-gray/50">
              No variants yet. Add at least one variant.
            </p>
          ) : (
            variants.map((v, i) => (
              <div
                key={i}
                className="border border-charcoal/10 bg-cream/30 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-bold uppercase tracking-[0.1em] text-text-gray">
                    Variant {i + 1}
                  </span>
                  <button
                    onClick={() => removeVariant(i)}
                    className="text-[9px] font-display font-bold uppercase tracking-[0.1em] text-signal-orange/60 hover:text-signal-orange transition-colors"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL_CLASS}>Title</label>
                    <input
                      className={FIELD_CLASS}
                      value={v.title}
                      onChange={(e) => updateVariant(i, { title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>SKU</label>
                    <input
                      className={FIELD_CLASS}
                      value={v.sku}
                      onChange={(e) => updateVariant(i, { sku: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL_CLASS}>Price (cents)</label>
                    <input
                      className={FIELD_CLASS}
                      type="number"
                      value={v.price}
                      onChange={(e) => updateVariant(i, { price: Number(e.target.value) })}
                    />
                    <p className="mt-0.5 text-[10px] text-text-gray/50">
                      = {formatPrice(v.price)}
                    </p>
                  </div>
                  <div className="flex items-end pb-2">
                    <button
                      onClick={() => updateVariant(i, { available: !v.available })}
                      className={`px-3 py-2 font-display text-[10px] font-bold uppercase tracking-[0.1em] border transition-colors ${
                        v.available
                          ? "border-deep-olive/40 bg-deep-olive/10 text-deep-olive"
                          : "border-charcoal/20 text-text-gray/50"
                      }`}
                    >
                      {v.available ? "Available" : "Unavailable"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Metafields */}
      {tab === "metafields" && (
        <div className="max-w-2xl space-y-4">
          <p className="text-xs text-text-gray/50">
            Product specifications and attributes. Only populated fields are shown on the
            storefront.
          </p>
          {METAFIELD_DEFS.map((def) => (
            <div key={def.key}>
              <label className={LABEL_CLASS}>{def.label}</label>
              <input
                className={FIELD_CLASS}
                value={metafields[def.key] || ""}
                onChange={(e) =>
                  setMetafields({ ...metafields, [def.key]: e.target.value })
                }
                placeholder={`Enter ${def.label.toLowerCase()}...`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Tab: Media */}
      {tab === "media" && (
        <div className="max-w-2xl space-y-4">
          <div className="flex gap-2">
            <input
              className={FIELD_CLASS}
              value={newMediaUrl}
              onChange={(e) => setNewMediaUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMediaUrl()}
              placeholder="Enter image URL..."
            />
            <button
              onClick={addMediaUrl}
              className="border border-charcoal/20 px-4 py-2 font-display text-[10px] font-bold uppercase tracking-[0.1em] text-text-gray hover:border-charcoal/40 transition-colors shrink-0"
            >
              Add
            </button>
          </div>

          {mediaUrls.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-gray/50">
              No images. Add image URLs to display on the product page.
            </p>
          ) : (
            <div className="space-y-2">
              {mediaUrls.map((url, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 border border-charcoal/10 bg-cream/30 p-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="h-16 w-16 border border-charcoal/10 bg-warm-white object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-charcoal/70">
                    {url}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveMedia(i, -1)}
                      disabled={i === 0}
                      className="px-2 py-1 text-[9px] font-display font-bold uppercase tracking-[0.1em] text-text-gray/50 hover:text-text-gray disabled:opacity-20 transition-colors"
                    >
                      &uarr;
                    </button>
                    <button
                      onClick={() => moveMedia(i, 1)}
                      disabled={i === mediaUrls.length - 1}
                      className="px-2 py-1 text-[9px] font-display font-bold uppercase tracking-[0.1em] text-text-gray/50 hover:text-text-gray disabled:opacity-20 transition-colors"
                    >
                      &darr;
                    </button>
                    <button
                      onClick={() => removeMedia(i)}
                      className="px-2 py-1 text-[9px] font-display font-bold uppercase tracking-[0.1em] text-signal-orange/60 hover:text-signal-orange transition-colors"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
