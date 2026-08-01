import Link from "next/link";
import { BRAND, FOOTER } from "@/content/napfleet";
import { getPolicyStatuses } from "@/lib/validation/policies";

/**
 * Dark footer. Policy links render only for policies whose status is "ready";
 * all policies are currently in draft, so none are shown.
 */
export function Footer() {
  const readyPolicies = getPolicyStatuses().filter((p) => p.status === "ready");

  return (
    <footer className="mt-auto bg-charcoal text-warm-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              href="/"
              className="font-display text-2xl font-bold uppercase tracking-[0.3em] text-warm-white"
            >
              {BRAND.name}
            </Link>
            <p className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.2em] text-warm-white/60">
              {BRAND.tagline}
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-3 md:grid-cols-1"
          >
            {FOOTER.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-11 items-center text-sm text-warm-white/70 transition-colors hover:text-warm-white"
              >
                {link.label}
              </Link>
            ))}
            {readyPolicies.map((policy) => (
              <Link
                key={policy.slug}
                href={`/policies/${policy.slug}`}
                className="flex min-h-11 items-center text-sm text-warm-white/70 transition-colors hover:text-warm-white"
              >
                {policy.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-warm-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warm-white/50">
            {BRAND.formalName}
          </p>
          <p className="text-xs text-warm-white/50">
            © 2026 {BRAND.formalName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
