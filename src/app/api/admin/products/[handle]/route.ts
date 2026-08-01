import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getStoreConfig } from "@/lib/store-config";
import { DOMAINS } from "@/lib/constants";

export async function GET(
  _request: NextRequest,
  { params }: { params: { handle: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = getStoreConfig();
  const product = await config.getProduct(params.handle);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.domain && !DOMAINS.includes(body.domain)) {
      return NextResponse.json(
        { error: `domain must be one of: ${DOMAINS.join(", ")}` },
        { status: 400 }
      );
    }

    const config = getStoreConfig();
    const product = await config.updateProduct(params.handle, body);
    return NextResponse.json({ product });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update product";
    const status = message.includes("not found") ? 404 : message.includes("Cannot update") ? 405 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { handle: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const config = getStoreConfig();
    await config.deleteProduct(params.handle);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete product";
    const status = message.includes("not found") ? 404 : message.includes("Cannot delete") ? 405 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
