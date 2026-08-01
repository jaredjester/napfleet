import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false } };

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      <div className="border border-signal-orange/30 bg-signal-orange/5 px-4 py-3 mb-8">
        <p className="text-xs font-display font-bold uppercase tracking-[0.15em] text-signal-orange">
          POLICY DRAFT — NOT YET FINAL
        </p>
      </div>
      <h1 className="font-display font-black uppercase tracking-tight text-charcoal text-2xl sm:text-3xl mb-6">
        Privacy Policy
      </h1>
      <p className="text-sm text-text-gray mb-4">
        NapFleet Pet Co. is committed to protecting your privacy. This policy is under development and will detail how we collect, use, and protect your information.
      </p>
      <div className="border-t border-charcoal/10 pt-6 mt-6">
        <h2 className="font-display font-bold uppercase tracking-[0.1em] text-charcoal text-sm mb-3">
          Pending Confirmation
        </h2>
        <ul className="space-y-1.5 text-sm text-text-gray list-disc list-inside">
          <li>Business address</li>
          <li>Phone number</li>
          <li>Jurisdiction</li>
          <li>Legal registration</li>
          <li>Data-processor details</li>
        </ul>
      </div>
    </div>
  );
}
