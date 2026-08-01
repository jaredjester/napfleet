"use client";

import { useState } from "react";
import { HOME } from "@/content/napfleet";
import { mockNewsletter } from "@/lib/commerce/mock";
import { Button } from "@/components/ui/Button";

export function EmailSignupSection() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !consent) return;
    setStatus("loading");
    try {
      const result = await mockNewsletter.subscribe(email);
      if (result.success) {
        setStatus("success");
        setEmail("");
        setConsent(false);
      } else {
        setStatus("error");
        setErrorMsg(result.error || "Something went wrong");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Newsletter provider not configured");
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
