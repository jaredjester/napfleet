"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";

type FinanceOverview = {
  totalRevenueCents: number;
  completedPayoutsCents: number;
  pendingPayoutsCents: number;
  estimatedBalanceCents: number;
  currency: string;
  paymentCount: number;
  payoutCount: number;
  pendingPayoutCount: number;
};

type Transaction = {
  type: "payment" | "payout";
  id: string;
  amountCents: number;
  status: string;
  date: string;
  destination?: string;
  category?: string;
  notes?: string | null;
};

type Payout = {
  id: string;
  amountCents: number;
  destination: string;
  category: string;
  status: string;
  notes: string | null;
  createdAt: string;
  completedAt: string | null;
};

const CATEGORY_OPTIONS = ["supplier", "operations", "marketing", "other"];

export default function AdminFinancePage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [error, setError] = useState("");

  // New payout form
  const [showNewPayout, setShowNewPayout] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutDest, setPayoutDest] = useState("");
  const [payoutCategory, setPayoutCategory] = useState("supplier");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/finance");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setOverview(data.overview);
      setTransactions(data.recentTransactions || []);
      setPayouts(data.payouts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePayout = async () => {
    const cents = Math.round(parseFloat(payoutAmount) * 100);
    if (!cents || cents <= 0) return;

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents: cents,
          destination: payoutDest || "Manual payout",
          category: payoutCategory,
          notes: payoutNotes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setPayoutAmount("");
      setPayoutDest("");
      setPayoutNotes("");
      setShowNewPayout(false);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/finance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed");
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "border-khaki/40 bg-khaki/10 text-text-gray",
      COMPLETED: "border-deep-olive/40 bg-deep-olive/10 text-deep-olive",
      FAILED: "border-signal-orange/40 bg-signal-orange/10 text-signal-orange",
      SETTLED: "border-deep-olive/40 bg-deep-olive/10 text-deep-olive",
    };
    return (
      <span
        className={`inline-block border px-1.5 py-0.5 text-[9px] font-display font-bold uppercase tracking-[0.1em] ${colors[status] || "border-charcoal/20 text-text-gray"}`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm text-text-gray/50">Loading financial data...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-charcoal">
            Finance
          </h1>
          <p className="mt-1 text-sm text-text-gray">
            Wallet balance, revenue, and payouts
          </p>
        </div>
        <button
          onClick={() => setShowNewPayout(true)}
          className="bg-signal-orange px-4 py-2.5 font-display text-xs font-bold uppercase tracking-[0.1em] text-charcoal hover:bg-signal-orange/90 transition-colors"
        >
          + New Payout
        </button>
      </div>

      {error && (
        <div className="mb-6 border border-signal-orange/30 bg-signal-orange/10 px-4 py-3 text-sm text-signal-orange">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      {overview && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-charcoal/10 bg-cream/30 p-5">
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-text-gray">
              Wallet Balance
            </p>
            <p className="mt-2 font-display text-2xl font-black text-charcoal tabular-nums">
              {formatPrice(overview.estimatedBalanceCents)}
            </p>
            <p className="mt-1 text-[10px] text-text-gray/50">Estimated (revenue - payouts)</p>
          </div>

          <div className="border border-charcoal/10 bg-cream/30 p-5">
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-text-gray">
              Total Revenue
            </p>
            <p className="mt-2 font-display text-2xl font-black text-charcoal tabular-nums">
              {formatPrice(overview.totalRevenueCents)}
            </p>
            <p className="mt-1 text-[10px] text-text-gray/50">
              {overview.paymentCount} settled payment{overview.paymentCount !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="border border-charcoal/10 bg-cream/30 p-5">
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-text-gray">
              Pending Payouts
            </p>
            <p className="mt-2 font-display text-2xl font-black text-charcoal tabular-nums">
              {formatPrice(overview.pendingPayoutsCents)}
            </p>
            <p className="mt-1 text-[10px] text-text-gray/50">
              {overview.pendingPayoutCount} pending
            </p>
          </div>

          <div className="border border-charcoal/10 bg-cream/30 p-5">
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-text-gray">
              Total Paid Out
            </p>
            <p className="mt-2 font-display text-2xl font-black text-charcoal tabular-nums">
              {formatPrice(overview.completedPayoutsCents)}
            </p>
            <p className="mt-1 text-[10px] text-text-gray/50">
              {overview.payoutCount} payout{overview.payoutCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      {/* New Payout Form */}
      {showNewPayout && (
        <div className="mb-8 border border-charcoal/10 bg-cream/30 p-6 max-w-xl">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.08em] text-charcoal mb-4">
            New Manual Payout
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block font-display text-[10px] font-bold uppercase tracking-[0.12em] text-text-gray">
                Amount (USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder="0.00"
                className="w-full border border-charcoal/20 bg-warm-white px-3 py-2 text-sm focus:border-charcoal/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-display text-[10px] font-bold uppercase tracking-[0.12em] text-text-gray">
                Destination
              </label>
              <input
                type="text"
                value={payoutDest}
                onChange={(e) => setPayoutDest(e.target.value)}
                placeholder="Supplier name, wallet address, or account"
                className="w-full border border-charcoal/20 bg-warm-white px-3 py-2 text-sm focus:border-charcoal/50 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block font-display text-[10px] font-bold uppercase tracking-[0.12em] text-text-gray">
                  Category
                </label>
                <select
                  value={payoutCategory}
                  onChange={(e) => setPayoutCategory(e.target.value)}
                  className="w-full border border-charcoal/20 bg-warm-white px-3 py-2 text-sm focus:border-charcoal/50 focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block font-display text-[10px] font-bold uppercase tracking-[0.12em] text-text-gray">
                  Notes
                </label>
                <input
                  type="text"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="Optional"
                  className="w-full border border-charcoal/20 bg-warm-white px-3 py-2 text-sm focus:border-charcoal/50 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCreatePayout}
                disabled={submitting || !payoutAmount}
                className="bg-signal-orange px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.1em] text-charcoal hover:bg-signal-orange/90 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Creating..." : "Record Payout"}
              </button>
              <button
                onClick={() => setShowNewPayout(false)}
                className="border border-charcoal/20 px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.1em] text-text-gray hover:border-charcoal/40 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payouts Table */}
      <div className="mb-8">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.08em] text-charcoal border-b border-charcoal/10 pb-2 mb-4">
          Payouts
        </h2>
        {payouts.length === 0 ? (
          <div className="border border-charcoal/10 px-6 py-10 text-center">
            <p className="font-display font-bold uppercase tracking-[0.15em] text-charcoal text-sm">
              No Payouts Yet
            </p>
            <p className="mt-1 text-xs text-text-gray">
              Record manual payouts to track supplier payments and withdrawals.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-charcoal/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-charcoal/10 bg-cream">
                  <th className="p-3 text-left text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                    Date
                  </th>
                  <th className="p-3 text-right text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                    Amount
                  </th>
                  <th className="p-3 text-left text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                    Destination
                  </th>
                  <th className="p-3 text-left text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                    Category
                  </th>
                  <th className="p-3 text-center text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                    Status
                  </th>
                  <th className="p-3 text-right text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-cream/50">
                    <td className="p-3 text-xs text-text-gray tabular-nums">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right font-semibold tabular-nums">
                      {formatPrice(p.amountCents)}
                    </td>
                    <td className="p-3 text-xs text-text-gray max-w-[180px] truncate">
                      {p.destination}
                    </td>
                    <td className="p-3">
                      <span className="text-[9px] font-display font-bold uppercase tracking-[0.08em] text-text-gray/70">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3 text-center">{statusBadge(p.status)}</td>
                    <td className="p-3 text-right">
                      {p.status === "PENDING" && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleUpdateStatus(p.id, "COMPLETED")}
                            className="px-2 py-1 text-[9px] font-display font-bold uppercase tracking-[0.1em] text-deep-olive hover:bg-deep-olive/10 transition-colors"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(p.id, "FAILED")}
                            className="px-2 py-1 text-[9px] font-display font-bold uppercase tracking-[0.1em] text-signal-orange hover:bg-signal-orange/10 transition-colors"
                          >
                            Fail
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Ledger */}
      <div>
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.08em] text-charcoal border-b border-charcoal/10 pb-2 mb-4">
          Transaction Ledger
        </h2>
        {transactions.length === 0 ? (
          <p className="py-6 text-center text-xs text-text-gray/50">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto border border-charcoal/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-charcoal/10 bg-cream">
                  <th className="p-3 text-left text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                    Date
                  </th>
                  <th className="p-3 text-left text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                    Type
                  </th>
                  <th className="p-3 text-right text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                    Amount
                  </th>
                  <th className="p-3 text-left text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                    Details
                  </th>
                  <th className="p-3 text-center text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10">
                {transactions.map((txn, i) => (
                  <tr key={i} className="hover:bg-cream/50">
                    <td className="p-3 text-xs text-text-gray tabular-nums">
                      {new Date(txn.date).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[9px] font-display font-bold uppercase tracking-[0.08em] ${
                          txn.type === "payment" ? "text-deep-olive" : "text-signal-orange"
                        }`}
                      >
                        {txn.type === "payment" ? "Payment In" : "Payout Out"}
                      </span>
                    </td>
                    <td
                      className={`p-3 text-right font-semibold tabular-nums ${
                        txn.amountCents >= 0 ? "text-deep-olive" : "text-signal-orange"
                      }`}
                    >
                      {txn.amountCents >= 0 ? "+" : ""}
                      {formatPrice(Math.abs(txn.amountCents))}
                    </td>
                    <td className="p-3 text-xs text-text-gray/70">
                      {txn.type === "payout" ? txn.destination || txn.category : txn.id?.slice(0, 12)}
                    </td>
                    <td className="p-3 text-center">{statusBadge(txn.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
