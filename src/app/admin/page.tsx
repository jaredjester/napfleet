"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";

type OrderSummary = {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  totalCents: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  lastPayment: {
    providerPaymentId: string;
    status: string;
    fraudProtectionStatus: string;
    settlementAsset?: string;
    settledAt?: string;
  } | null;
  refundCount: number;
  disputeCount: number;
  createdAt: string;
};

export default function AdminPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchOrders = async (statusFilter?: string) => {
    setLoading(true);
    try {
      const url = statusFilter
        ? `/api/admin/orders?status=${statusFilter}`
        : "/api/admin/orders";
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(filter);
  }, [filter]);

  const statusColors: Record<string, string> = {
    PAID: "bg-deep-olive/20 text-deep-olive",
    PENDING_PAYMENT: "bg-khaki/20 text-text-gray",
    PAYMENT_PROCESSING: "bg-muted-sky/20 text-muted-sky",
    PAYMENT_REVIEW_REQUIRED: "bg-signal-orange/20 text-signal-orange",
    REFUNDED: "bg-charcoal/20 text-charcoal",
    PARTIALLY_REFUNDED: "bg-khaki/20 text-text-gray",
    FAILED: "bg-signal-orange/20 text-signal-orange",
    CANCELED: "bg-charcoal/10 text-text-gray/50",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-black uppercase tracking-tight text-charcoal text-2xl sm:text-3xl">
            Command Center
          </h1>
          <p className="text-sm text-text-gray mt-1">Order management and payment reconciliation</p>
        </div>
        {process.env.NEXT_PUBLIC_COINFLOW_ENV === "sandbox" && (
          <span className="border border-signal-orange/40 bg-signal-orange/10 px-3 py-1 text-xs font-display font-bold uppercase tracking-[0.2em] text-signal-orange">
            SANDBOX
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { label: "All", value: "" },
          { label: "Pending Payment", value: "PENDING_PAYMENT" },
          { label: "Paid", value: "PAID" },
          { label: "Review Required", value: "PAYMENT_REVIEW_REQUIRED" },
          { label: "Refunded", value: "REFUNDED" },
          { label: "Failed", value: "FAILED" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`text-[10px] font-display font-bold uppercase tracking-[0.1em] px-2.5 py-1.5 border transition-colors
              ${filter === f.value
                ? "bg-charcoal text-warm-white border-charcoal"
                : "border-charcoal/20 text-text-gray hover:border-charcoal/40"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders table */}
      {loading ? (
        <p className="text-sm text-text-gray/50 py-8 text-center">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="border border-charcoal/10 px-6 py-12 text-center">
          <p className="font-display font-bold uppercase tracking-[0.15em] text-charcoal">
            No Orders Yet
          </p>
          <p className="text-sm text-text-gray mt-1">Orders will appear here when customers complete checkout.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-charcoal/10 text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 bg-cream">
                <th className="text-left p-3 text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                  Order
                </th>
                <th className="text-left p-3 text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                  Customer
                </th>
                <th className="text-right p-3 text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                  Total
                </th>
                <th className="text-center p-3 text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                  Payment
                </th>
                <th className="text-center p-3 text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                  Settlement
                </th>
                <th className="text-right p-3 text-[10px] font-display font-bold uppercase tracking-[0.15em] text-text-gray">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-cream/50 transition-colors">
                  <td className="p-3">
                    <a
                      href={`/admin/orders/${order.id}`}
                      className="font-mono text-xs font-bold text-charcoal hover:text-signal-orange transition-colors"
                    >
                      {order.orderNumber}
                    </a>
                  </td>
                  <td className="p-3 text-xs text-text-gray">
                    {order.customerName}
                    <br />
                    <span className="text-text-gray/50">{order.customerEmail}</span>
                  </td>
                  <td className="p-3 text-right font-semibold tabular-nums text-xs">
                    {formatPrice(order.totalCents)}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`inline-block text-[9px] font-display font-bold uppercase tracking-[0.1em] px-2 py-0.5 border ${statusColors[order.paymentStatus] || "border-charcoal/20 text-text-gray"}`}>
                      {order.paymentStatus.replace(/_/g, " ")}
                    </span>
                    {order.lastPayment?.fraudProtectionStatus === "REJECTED" && (
                      <span className="block text-[9px] text-signal-orange font-bold mt-1">FRAUD REJECTED</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {order.lastPayment?.settlementAsset ? (
                      <span className="text-[9px] font-mono text-deep-olive font-bold">
                        {order.lastPayment.settlementAsset}
                      </span>
                    ) : (
                      <span className="text-[9px] text-text-gray/30">—</span>
                    )}
                  </td>
                  <td className="p-3 text-right text-xs text-text-gray/50 tabular-nums">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
