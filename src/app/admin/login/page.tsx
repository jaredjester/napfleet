"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/**
 * Admin login. Email is ceremonial for now — only the password is verified
 * (against ADMIN_PASSWORD_HASH on the server).
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(data.redirect || "/admin");
      } else {
        setError(data.error || "Login failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white px-4 py-16">
      <div className="w-full max-w-md">
        <h1 className="font-display font-black uppercase tracking-tight text-charcoal text-2xl sm:text-3xl text-center mb-2">
          Command Center
        </h1>
        <p className="text-xs font-display font-semibold uppercase tracking-[0.25em] text-text-gray text-center mb-8">
          Admin Sign In
        </p>

        <form onSubmit={handleSubmit} className="border border-charcoal/10 bg-cream p-6 sm:p-8 space-y-5">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-display uppercase tracking-[0.15em] text-text-gray font-bold mb-1"
            >
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full border border-charcoal/20 bg-warm-white px-3 py-2.5 text-sm focus:outline-none focus:border-charcoal/40"
              placeholder="you@napfleet.com"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-display uppercase tracking-[0.15em] text-text-gray font-bold mb-1"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full border border-charcoal/20 bg-warm-white px-3 py-2.5 text-sm focus:outline-none focus:border-charcoal/40"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-signal-orange">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
