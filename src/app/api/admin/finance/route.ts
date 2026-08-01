import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Aggregate financial data
    const [payments, payouts, store] = await Promise.all([
      prisma.payment.findMany({
        where: { status: "SETTLED" },
        select: {
          fiatAmountCents: true,
          status: true,
          settledAt: true,
          providerPaymentId: true,
        },
        orderBy: { settledAt: "desc" },
      }),
      prisma.payout.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.store.findUnique({ where: { slug: "napfleet" } }),
    ]);

    // Calculate totals
    const totalRevenueCents = payments.reduce((sum, p) => sum + p.fiatAmountCents, 0);
    const completedPayoutsCents = payouts
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + p.amountCents, 0);
    const pendingPayoutsCents = payouts
      .filter((p) => p.status === "PENDING")
      .reduce((sum, p) => sum + p.amountCents, 0);

    const estimatedBalanceCents = totalRevenueCents - completedPayoutsCents;

    // Recent transactions (combined payments + payouts)
    const recentTxns = [
      ...payments.slice(0, 10).map((p) => ({
        type: "payment" as const,
        id: p.providerPaymentId,
        amountCents: p.fiatAmountCents,
        status: p.status,
        date: p.settledAt?.toISOString() ?? "",
      })),
      ...payouts.slice(0, 10).map((p) => ({
        type: "payout" as const,
        id: p.id,
        amountCents: -p.amountCents,
        status: p.status,
        date: p.createdAt.toISOString(),
        destination: p.destination,
        category: p.category,
        notes: p.notes,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);

    return NextResponse.json({
      overview: {
        totalRevenueCents,
        completedPayoutsCents,
        pendingPayoutsCents,
        estimatedBalanceCents,
        currency: store?.currency || "USD",
        paymentCount: payments.length,
        payoutCount: payouts.length,
        pendingPayoutCount: payouts.filter((p) => p.status === "PENDING").length,
      },
      recentTransactions: recentTxns,
      payouts,
    });
  } catch (err) {
    console.error("Finance overview error:", err);
    return NextResponse.json({ error: "Failed to load finance data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.amountCents || body.amountCents <= 0) {
      return NextResponse.json({ error: "Valid amountCents is required" }, { status: 400 });
    }

    const payout = await prisma.payout.create({
      data: {
        amountCents: body.amountCents,
        currency: body.currency || "USD",
        destination: body.destination || "Manual payout",
        category: body.category || "supplier",
        notes: body.notes || null,
        initiatedByAdminId: "admin",
      },
    });

    // Audit log
    await prisma.auditEvent.create({
      data: {
        actorType: "admin",
        actorId: "admin",
        action: "PAYOUT_CREATED",
        entityType: "Payout",
        entityId: payout.id,
        safeMetadata: JSON.stringify({
          amountCents: body.amountCents,
          category: body.category,
        }),
      },
    });

    return NextResponse.json({ payout }, { status: 201 });
  } catch (err) {
    console.error("Create payout error:", err);
    return NextResponse.json({ error: "Failed to create payout" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.id || !body.status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    const validStatuses = ["PENDING", "COMPLETED", "FAILED"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { status: body.status };
    if (body.status === "COMPLETED") {
      updateData.completedAt = new Date();
    }

    const payout = await prisma.payout.update({
      where: { id: body.id },
      data: updateData,
    });

    // Audit log
    await prisma.auditEvent.create({
      data: {
        actorType: "admin",
        actorId: "admin",
        action: `PAYOUT_${body.status}`,
        entityType: "Payout",
        entityId: payout.id,
        safeMetadata: JSON.stringify({ newStatus: body.status }),
      },
    });

    return NextResponse.json({ payout });
  } catch (err) {
    console.error("Update payout error:", err);
    return NextResponse.json({ error: "Failed to update payout" }, { status: 500 });
  }
}
