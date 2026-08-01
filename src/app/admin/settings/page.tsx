"use client";

import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [storeName, setStoreName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [viewOnly, setViewOnly] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        setStoreName(data.settings.storeName);
        setLegalName(data.settings.legalName);
        setCurrency(data.settings.currency);
        setViewOnly(data.viewOnly);
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName, legalName, currency }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMessage("Settings saved successfully");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm text-text-gray/50">Loading settings...</p>
      </div>
    );
  }

  const fieldClass =
    "w-full border border-charcoal/20 bg-warm-white px-3 py-2 text-sm text-charcoal focus:border-charcoal/50 focus:outline-none";
  const labelClass =
    "mb-1 block font-display text-[10px] font-bold uppercase tracking-[0.12em] text-text-gray";

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-black uppercase tracking-tight text-charcoal">
          Settings
        </h1>
        <p className="mt-1 text-sm text-text-gray">
          Store configuration and preferences
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 max-w-xl border px-4 py-3 text-sm ${
            message.includes("success")
              ? "border-deep-olive/30 bg-deep-olive/10 text-deep-olive"
              : "border-signal-orange/30 bg-signal-orange/10 text-signal-orange"
          }`}
        >
          {message}
        </div>
      )}

      {/* Editable settings */}
      <div className="mb-10 max-w-xl space-y-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.08em] text-charcoal border-b border-charcoal/10 pb-2">
          Store Information
        </h2>

        <div>
          <label className={labelClass}>Store Name</label>
          <input
            className={fieldClass}
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Legal Business Name</label>
          <input
            className={fieldClass}
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Currency</label>
          <select
            className={fieldClass}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
            <option value="AUD">AUD</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-signal-orange px-6 py-2.5 font-display text-xs font-bold uppercase tracking-[0.1em] text-charcoal hover:bg-signal-orange/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* View-only settings */}
      <div className="max-w-xl space-y-4">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.08em] text-charcoal border-b border-charcoal/10 pb-2">
          Environment Configuration
        </h2>
        <p className="text-xs text-text-gray/50">
          These values are set via environment variables and cannot be changed here.
        </p>

        {Object.entries(viewOnly).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between border-b border-charcoal/5 py-2">
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.08em] text-text-gray">
              {key}
            </span>
            <span className="max-w-[60%] truncate font-mono text-xs text-charcoal/70">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
