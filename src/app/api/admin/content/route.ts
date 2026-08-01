import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getStoreConfig } from "@/lib/store-config";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = getStoreConfig();
  const content = await config.getContent();
  return NextResponse.json({ content });
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: "key is required" }, { status: 400 });
    }

    const config = getStoreConfig();
    await config.setContentValue(key, value);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update content";
    const status = message.includes("Cannot set") ? 405 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.entries || typeof body.entries !== "object") {
      return NextResponse.json({ error: "entries object is required" }, { status: 400 });
    }

    const config = getStoreConfig();
    await config.setContentValues(body.entries);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update content";
    const status = message.includes("Cannot set") ? 405 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
