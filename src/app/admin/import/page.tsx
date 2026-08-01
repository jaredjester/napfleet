"use client";

import { useState, useRef } from "react";

type ImportPreview = {
  productsCount: number;
  contentKeys: number;
  settingsKeys: number;
  validationErrors: string[];
};

type ImportResult = {
  productsImported: number;
  productsSkipped: number;
  contentImported: number;
  errors: string[];
};

export default function AdminImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(null);
      setResult(null);
      setError("");
    }
  };

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview", data }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Preview failed");

      setPreview(json.preview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "execute", data, mode }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Import failed");

      setResult(json.result);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-black uppercase tracking-tight text-charcoal">
          Import Store
        </h1>
        <p className="mt-1 text-sm text-text-gray">
          Import products, content, and settings from a .napfleet.json export file
        </p>
      </div>

      {/* File upload */}
      <div className="max-w-xl border border-charcoal/10 bg-cream/30 p-8">
        <div
          className="cursor-pointer border-2 border-dashed border-charcoal/20 p-8 text-center hover:border-charcoal/40 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          {file ? (
            <div>
              <p className="font-mono text-sm font-bold text-charcoal">{file.name}</p>
              <p className="mt-1 text-xs text-text-gray/50">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-[0.1em] text-text-gray">
                Drop .napfleet.json here
              </p>
              <p className="mt-1 text-xs text-text-gray/50">or click to browse</p>
            </div>
          )}
        </div>

        {/* Mode selector */}
        <div className="mt-4 flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="merge"
              checked={mode === "merge"}
              onChange={() => setMode("merge")}
            />
            <span className="text-sm text-charcoal">
              <span className="font-semibold">Merge</span>
              <span className="text-text-gray/50"> — skip existing products</span>
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="replace"
              checked={mode === "replace"}
              onChange={() => setMode("replace")}
            />
            <span className="text-sm text-charcoal">
              <span className="font-semibold">Replace</span>
              <span className="text-text-gray/50"> — clear all and import</span>
            </span>
          </label>
        </div>

        {error && (
          <div className="mt-4 border border-signal-orange/30 bg-signal-orange/10 px-4 py-3 text-sm text-signal-orange">
            {error}
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="mt-6 border border-charcoal/10 bg-warm-white p-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.08em] text-charcoal mb-3">
              Preview
            </h3>
            {preview.validationErrors.length > 0 ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-signal-orange">Validation Errors:</p>
                {preview.validationErrors.map((err, i) => (
                  <p key={i} className="text-xs text-signal-orange">
                    &bull; {err}
                  </p>
                ))}
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">{preview.productsCount}</span> products
                </p>
                <p>
                  <span className="font-semibold">{preview.contentKeys}</span> content keys
                </p>
                <p>
                  <span className="font-semibold">{preview.settingsKeys}</span> settings keys
                </p>
              </div>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6 border border-deep-olive/30 bg-deep-olive/10 p-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.08em] text-deep-olive mb-3">
              Import Complete
            </h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-semibold">{result.productsImported}</span> products
                imported
              </p>
              <p>
                <span className="font-semibold">{result.productsSkipped}</span> products
                skipped
              </p>
              <p>
                <span className="font-semibold">{result.contentImported}</span> content keys
                imported
              </p>
              {result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-signal-orange">Errors:</p>
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-signal-orange">
                      &bull; {err}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handlePreview}
            disabled={!file || loading}
            className="flex-1 border border-charcoal/20 px-4 py-2.5 font-display text-xs font-bold uppercase tracking-[0.1em] text-text-gray hover:border-charcoal/40 disabled:opacity-30 transition-colors"
          >
            {loading ? "Processing..." : "Preview"}
          </button>
          <button
            onClick={handleImport}
            disabled={!file || loading || (preview?.validationErrors?.length ?? 0) > 0}
            className="flex-1 bg-signal-orange px-4 py-2.5 font-display text-xs font-bold uppercase tracking-[0.1em] text-charcoal hover:bg-signal-orange/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Importing..." : mode === "replace" ? "Replace & Import" : "Merge & Import"}
          </button>
        </div>
      </div>
    </div>
  );
}
