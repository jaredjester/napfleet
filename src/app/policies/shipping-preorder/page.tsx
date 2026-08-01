import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false } };

export default function ShippingPreorderPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      <div className="border border-signal-orange/30 bg-signal-orange/5 px-4 py-3 mb-8">
        <p className="text-xs font-display font-bold uppercase tracking-[0.15em] text-signal-orange">
          POLICY DRAFT — NOT YET FINAL
        </p>
      </div>
      <h1 className="font-display font-black uppercase tracking-tight text-charcoal text-2xl sm:text-3xl mb-6">
        Shipping and Preorder Policy
      </h1>
      <p className="text-sm text-text-gray mb-4">
        NapFleet Pet Co. products are currently available for preorder and typically ship within approximately eight weeks.
        Customers receive order updates by email, and tracking is provided when the order ships.
      </p>
      <div className="border-t border-charcoal/10 pt-6 mt-6">
        <h2 className="font-display font-bold uppercase tracking-[0.1em] text-charcoal text-sm mb-3">
          Pending Confirmation
        </h2>
        <ul className="space-y-1.5 text-sm text-text-gray list-disc list-inside">
          <li>Shipping origin</li>
          <li>Available destinations</li>
          <li>Shipping rates</li>
          <li>Carrier information</li>
          <li>Processing exceptions</li>
          <li>Address-change policy</li>
          <li>Delay policy</li>
          <li>Lost-package procedure</li>
          <li>Damaged-delivery procedure</li>
        </ul>
      </div>
    </div>
  );
}
