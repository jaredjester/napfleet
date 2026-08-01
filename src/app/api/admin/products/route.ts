import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStoreConfig } from "@/lib/store-config";
import { DOMAINS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");

  try {
    // Try DB-first for full admin access (including unpublished)
    const rows = await prisma.product.findMany({
      include: {
        variants: { orderBy: { sortOrder: "asc" as const } },
        metafields: true,
        media: { orderBy: { sortOrder: "asc" as const } },
      },
      orderBy: { sortOrder: "asc" },
    });

    let products = rows.map((row) => ({
      id: row.id,
      handle: row.handle,
      title: row.title,
      domain: row.domain,
      publishReady: row.publishReady,
      preorderStatus: row.preorderStatus,
      updatedAt: row.updatedAt,
      createdAt: row.createdAt,
      price: row.variants[0]?.price ?? 0,
      variantCount: row.variants.length,
      mediaCount: row.media.length,
    }));

    if (domain) {
      products = products.filter((p) => p.domain === domain);
    }

    return NextResponse.json({ products });
  } catch {
    // Fallback to file provider (without DB)
    const config = getStoreConfig();
    const products = await config.getProducts();
    return NextResponse.json({ products });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.handle || !body.title || !body.domain) {
      return NextResponse.json(
        { error: "handle, title, and domain are required" },
        { status: 400 }
      );
    }

    if (!DOMAINS.includes(body.domain)) {
      return NextResponse.json(
        { error: `domain must be one of: ${DOMAINS.join(", ")}` },
        { status: 400 }
      );
    }

    const config = getStoreConfig();
    const product = await config.createProduct(body);
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create product";
    const status =
      message.includes("Cannot create") ? 405 : message.includes("Unique constraint") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
