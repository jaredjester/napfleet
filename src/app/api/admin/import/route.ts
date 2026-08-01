import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getStoreConfig } from "@/lib/store-config";
import type { StoreExport, ImportPreview } from "@/lib/store-config";

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (action === "preview") {
      return handlePreview(body.data);
    }

    if (action === "execute") {
      return handleExecute(body.data, body.mode);
    }

    return NextResponse.json(
      { error: "action must be 'preview' or 'execute'" },
      { status: 400 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handlePreview(data: unknown) {
  const validated = validateExport(data);
  if (validated.errors.length > 0) {
    const preview: ImportPreview = {
      productsCount: 0,
      contentKeys: 0,
      settingsKeys: 0,
      validationErrors: validated.errors,
    };
    return NextResponse.json({ preview });
  }

  const exportData = data as StoreExport;
  const preview: ImportPreview = {
    productsCount: exportData.products.length,
    contentKeys: Object.keys(exportData.content || {}).length,
    settingsKeys: Object.keys(exportData.settings || {}).length,
    validationErrors: [],
  };

  return NextResponse.json({ preview });
}

async function handleExecute(data: unknown, mode: string) {
  const validated = validateExport(data);
  if (validated.errors.length > 0) {
    return NextResponse.json(
      { error: "Invalid export data", details: validated.errors },
      { status: 400 }
    );
  }

  const config = getStoreConfig();
  const result = await config.importStore(
    data as StoreExport,
    (mode === "replace" ? "replace" : "merge")
  );

  return NextResponse.json({ result });
}

function validateExport(data: unknown): { errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    errors.push("Data must be a JSON object");
    return { errors };
  }

  const d = data as Record<string, unknown>;

  if (!d.version) errors.push("Missing version field");
  if (!Array.isArray(d.products)) errors.push("products must be an array");

  if (Array.isArray(d.products)) {
    for (let i = 0; i < d.products.length; i++) {
      const p = d.products[i] as Record<string, unknown>;
      if (!p.handle) errors.push(`Product ${i}: missing handle`);
      if (!p.title) errors.push(`Product ${i}: missing title`);
      if (!p.domain) errors.push(`Product ${i}: missing domain`);
    }
  }

  return { errors };
}
