"use client";

import { useEffect, useState } from "react";

export default function AdminContentPage() {
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/content");
        const data = await res.json();
        setContent(data.content || {});
        const keys = Object.keys(data.content || {});
        if (keys.length > 0) setActiveSection(keys[0]);
      } catch (err) {
        console.error("Failed to fetch content", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMessage("Content saved successfully");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const updateValue = (key: string, value: unknown) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const sections = Object.keys(content).sort();

  if (loading) {
    return (
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm text-text-gray/50">Loading content...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-charcoal">
            Content
          </h1>
          <p className="mt-1 text-sm text-text-gray">
            Edit storefront content and copy
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-signal-orange px-6 py-2.5 font-display text-xs font-bold uppercase tracking-[0.1em] text-charcoal hover:bg-signal-orange/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save All"}
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 border px-4 py-3 text-sm ${
            message.includes("success")
              ? "border-deep-olive/30 bg-deep-olive/10 text-deep-olive"
              : "border-signal-orange/30 bg-signal-orange/10 text-signal-orange"
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex gap-6">
        {/* Section sidebar */}
        <div className="w-56 shrink-0 space-y-0.5">
          {sections.map((key) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`block w-full px-3 py-2 text-left text-xs font-display font-bold uppercase tracking-[0.08em] transition-colors ${
                activeSection === key
                  ? "bg-charcoal text-warm-white"
                  : "text-text-gray hover:bg-cream hover:text-charcoal"
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Content editor */}
        <div className="min-w-0 flex-1">
          {activeSection && content[activeSection] !== undefined ? (
            <div className="border border-charcoal/10">
              <div className="border-b border-charcoal/10 bg-cream px-4 py-3">
                <h2 className="font-display text-sm font-bold uppercase tracking-[0.08em] text-charcoal">
                  {activeSection}
                </h2>
              </div>
              <div className="p-4">
                <ContentValueEditor
                  value={content[activeSection]}
                  onChange={(v) => updateValue(activeSection, v)}
                />
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center border border-charcoal/10 text-sm text-text-gray/50">
              Select a section to edit
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ContentValueEditor({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (value === null || value === undefined) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-text-gray/50">null</p>
        <button
          onClick={() => onChange("")}
          className="border border-charcoal/20 px-2 py-1 text-[9px] font-display font-bold uppercase tracking-[0.1em] text-text-gray hover:border-charcoal/40 transition-colors"
        >
          Set Value
        </button>
      </div>
    );
  }

  if (typeof value === "string") {
    if (value.length > 120 || value.includes("\n")) {
      return (
        <textarea
          className="w-full border border-charcoal/20 bg-warm-white px-3 py-2 text-sm text-charcoal focus:border-charcoal/50 focus:outline-none"
          rows={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }
    return (
      <input
        className="w-full border border-charcoal/20 bg-warm-white px-3 py-2 text-sm text-charcoal focus:border-charcoal/50 focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return (
      <input
        className="w-full border border-charcoal/20 bg-warm-white px-3 py-2 text-sm text-charcoal focus:border-charcoal/50 focus:outline-none"
        value={String(value)}
        onChange={(e) => {
          const v = e.target.value;
          if (typeof value === "number") {
            const n = Number(v);
            onChange(isNaN(n) ? v : n);
          } else {
            onChange(v === "true");
          }
        }}
      />
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-3">
        {value.map((item, index) => (
          <div key={index} className="border border-charcoal/10 bg-cream/30 p-3">
            <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.1em] text-text-gray">
              [{index}]
            </p>
            {typeof item === "object" && item !== null ? (
              <ObjectEditor
                obj={item as Record<string, unknown>}
                onChange={(newObj) => {
                  const arr = [...value];
                  arr[index] = newObj;
                  onChange(arr);
                }}
              />
            ) : (
              <input
                className="w-full border border-charcoal/20 bg-warm-white px-3 py-2 text-sm text-charcoal focus:border-charcoal/50 focus:outline-none"
                value={String(item)}
                onChange={(e) => {
                  const arr = [...value];
                  arr[index] = e.target.value;
                  onChange(arr);
                }}
              />
            )}
          </div>
        ))}
        <button
          onClick={() => onChange([...value, ""])}
          className="border border-charcoal/20 px-3 py-1.5 text-[10px] font-display font-bold uppercase tracking-[0.1em] text-text-gray hover:border-charcoal/40 transition-colors"
        >
          + Add Item
        </button>
      </div>
    );
  }

  if (typeof value === "object") {
    return (
      <ObjectEditor
        obj={value as Record<string, unknown>}
        onChange={(newObj) => onChange(newObj)}
      />
    );
  }

  return <span className="text-xs text-text-gray/50">Unsupported type</span>;
}

function ObjectEditor({
  obj,
  onChange,
}: {
  obj: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-3">
      {Object.entries(obj).map(([key, val]) => (
        <div key={key}>
          <label className="mb-1 block font-display text-[10px] font-bold uppercase tracking-[0.12em] text-text-gray">
            {key}
          </label>
          <ContentValueEditor
            value={val}
            onChange={(v) => onChange({ ...obj, [key]: v })}
          />
        </div>
      ))}
    </div>
  );
}
