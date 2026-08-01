"use client";

import { useEffect, useState, useRef } from "react";

type MediaItem = {
  url: string;
  productTitle?: string;
};

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products?includeUnpublished=true");
      const data = await res.json();
      const items: MediaItem[] = [];
      for (const p of data.products || []) {
        // Re-fetch individual product to get media
        try {
          const prodRes = await fetch(`/api/admin/products/${p.handle}`);
          const prodData = await prodRes.json();
          const product = prodData.product;
          if (product?.images) {
            for (const url of product.images) {
              items.push({ url, productTitle: product.title });
            }
          }
        } catch {
          // skip
        }
      }
      setMedia(items);
    } catch (err) {
      console.error("Failed to fetch media", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setMedia((prev) => [...prev, { url: data.url }]);
      setMessage(`Uploaded: ${data.filename}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const copyUrl = async (url: string) => {
    const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-charcoal">
            Media Library
          </h1>
          <p className="mt-1 text-sm text-text-gray">
            Upload and manage product images
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 bg-signal-orange px-6 py-2.5 font-display text-xs font-bold uppercase tracking-[0.1em] text-charcoal hover:bg-signal-orange/90 transition-colors">
          {uploading ? "Uploading..." : "+ Upload Image"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {message && (
        <div
          className={`mb-6 border px-4 py-3 text-sm ${
            message.includes("Uploaded")
              ? "border-deep-olive/30 bg-deep-olive/10 text-deep-olive"
              : "border-signal-orange/30 bg-signal-orange/10 text-signal-orange"
          }`}
        >
          {message}
        </div>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-text-gray/50">Loading media...</p>
      ) : media.length === 0 ? (
        <div className="border border-charcoal/10 px-6 py-12 text-center">
          <p className="font-display font-bold uppercase tracking-[0.15em] text-charcoal">
            No Media Yet
          </p>
          <p className="mt-1 text-sm text-text-gray">
            Upload images or add them to products to see them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {media.map((item, i) => (
            <div
              key={i}
              className="group relative border border-charcoal/10 bg-cream/30"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.productTitle || "Media"}
                className="aspect-square w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect fill='%23f5f0eb' width='200' height='200'/><text x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23888' font-size='12' font-family='mono'>No Image</text></svg>";
                }}
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-charcoal/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => copyUrl(item.url)}
                  className="w-full border border-warm-white/30 px-2 py-1.5 text-center font-display text-[9px] font-bold uppercase tracking-[0.1em] text-warm-white hover:bg-warm-white/10 transition-colors"
                >
                  {copied === item.url ? "Copied!" : "Copy URL"}
                </button>
              </div>
              {item.productTitle && (
                <div className="px-3 py-2">
                  <p className="truncate font-mono text-[10px] text-text-gray/70">{item.productTitle}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
