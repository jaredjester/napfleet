"use client";

import { useState } from "react";
import { HOME } from "@/content/napfleet";
import { Button } from "@/components/ui/Button";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailSignupSection() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Client-side first pass — the server validates authoritatively.
    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      setStatus("error");
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      setStatus("error");
      return;
    }
    if (!consent) {
      setErrorMsg("Please confirm you agree to receive email updates.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), consent }),
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
        setConsent(false);
        return;
      }

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus("error");
      setErrorMsg(payload?.error || "Something went wrong. Please try again.");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="bg-charcoal py-12 sm:py-16">
      <div className="max-w-xl mx-auto px-4 text-center flex flex-col gap-4">
        <p className="eyebrow text-warm-white/60">{HOME.emailSignup.eyebrow}</p>
        <h2 className="font-display font-black uppercase tracking-tight text-warm-white text-2xl sm:text-3xl">
          {HOME.emailSignup.heading}
        </h2>
        <p className="text-sm text-warm-white/60 leading-relaxed">{HOME.emailSignup.copy}</p>

        {status === "success" ? (
          <p className="text-sm text-warm-white font-display uppercase tracking-[0.1em] font-bold">
            You&apos;re on the list. Stand by for updates.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md mx-auto w-full">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={HOME.emailSignup.placeholder}
              required
              className="bg-warm-white/10 border border-warm-white/20 px-4 py-3 text-sm
                         text-warm-white placeholder:text-warm-white/30 focus:outline-none focus:border-warm-white/40"
            />
            <label className="flex items-start gap-2 text-left text-xs text-warm-white/50 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 accent-signal-orange"
              />
              I agree to receive email updates from NapFleet. Unsubscribe anytime.
            </label>
            <Button variant="outlineLight" size="md" type="submit" loading={status === "loading"}>
              {HOME.emailSignup.button}
            </Button>
            {status === "error" && (
              <p className="text-xs text-signal-orange">{errorMsg}</p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
