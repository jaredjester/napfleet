import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = await prisma.store.findUnique({ where: { slug: "napfleet" } });

    return NextResponse.json({
      settings: {
        storeName: store?.name || "NapFleet",
        legalName: store?.legalName || "NapFleet Pet Co.",
        currency: store?.currency || "USD",
      },
      viewOnly: {
        coinflowMerchantId: process.env.NEXT_PUBLIC_COINFLOW_MERCHANT_ID || "(not set)",
        coinflowEnvironment: process.env.NEXT_PUBLIC_COINFLOW_ENV || "sandbox",
        emailFrom: process.env.EMAIL_FROM || "(not set)",
        adminEmails: process.env.ADMIN_EMAILS || "(not set)",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const store = await prisma.store.upsert({
      where: { slug: "napfleet" },
      create: {
        slug: "napfleet",
        name: body.storeName || "NapFleet",
        legalName: body.legalName || "NapFleet Pet Co.",
        currency: body.currency || "USD",
      },
      update: {
        ...(body.storeName && { name: body.storeName }),
        ...(body.legalName && { legalName: body.legalName }),
        ...(body.currency && { currency: body.currency }),
      },
    });

    return NextResponse.json({
      settings: {
        storeName: store.name,
        legalName: store.legalName,
        currency: store.currency,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
