"use client";

import { useState } from "react";
import { BRAND } from "@/content/napfleet";
import { Button } from "@/components/ui/Button";

type FormErrors = Partial<Record<"name" | "email" | "message" | "consent", string>>;

const TOPICS = [
  { value: "general", label: "General Inquiry" },
  { value: "order", label: "Order Question" },
  { value: "preorder", label: "Preorder Question" },
  { value: "sizing", label: "Sizing Question" },
  { value: "product", label: "Product Question" },
  { value: "other", label: "Other" },
];

/**
 * Contact form. Client-side validation is a first pass; the server
 * validates authoritatively via POST /api/contact. No invented address
 * or phone number — contact channels will be confirmed before launch.
 */
export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [topic, setTopic] = useState("general");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!name.trim()) {
      next.name = "Please enter your name.";
    } else if (name.trim().length < 2) {
      next.name = "Name must be at least 2 characters.";
    }
    if (!email.trim()) {
      next.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    if (!message.trim()) {
      next.message = "Please enter a message.";
    } else if (message.trim().length < 10) {
      next.message = "Message must be at least 10 characters.";
    }
    if (!consent) {
      next.consent = "Please confirm you agree to be contacted about this inquiry.";
    }
    return next;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("idle");
    setErrors({});
    setServerError("");

    // Honeypot: silently accept without processing (server enforces too).
    if (honeypot) {
      setStatus("success");
      return;
    }

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus("error");
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          orderNumber: orderNumber.trim() || undefined,
          topic,
          message: message.trim(),
          consent,
          website: honeypot,
        }),
      });

      if (response.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setOrderNumber("");
        setMessage("");
        setConsent(false);
        return;
      }

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        errors?: Record<string, string>;
      } | null;

      if (response.status === 429) {
        setServerError("Too many messages — please wait a minute and try again.");
      } else if (response.status === 400 && payload?.errors) {
        const fieldErrors: FormErrors = {};
        for (const key of ["name", "email", "message"] as const) {
          if (payload.errors[key]) fieldErrors[key] = payload.errors[key];
        }
        setErrors(fieldErrors);
        setServerError("Please fix the highlighted fields.");
      } else {
        setServerError(payload?.error || "Something went wrong sending your message. Please try again.");
      }
      setStatus("error");
    } catch {
      setServerError("Something went wrong sending your message. Please try again.");
      setStatus("error");
    }
  };

  const inputClasses =
    "w-full border border-charcoal/20 bg-warm-white px-3 py-2.5 text-sm text-charcoal placeholder:text-text-gray/40 focus:outline-none focus:border-charcoal/50";
  const labelClasses =
    "block text-xs font-display font-bold uppercase tracking-[0.15em] text-text-gray mb-1";

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:py-14">
      <div className="mb-8 text-center">
        <p className="eyebrow text-text-gray mb-3">MISSION COMMUNICATIONS</p>
        <h1 className="font-display font-black uppercase tracking-tight text-charcoal text-section-mobile md:text-section-desktop leading-[0.95]">
          Contact the Fleet
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-gray">
          Send {BRAND.formalName} a message. We&apos;ll respond to the email you provide.
        </p>
      </div>

      {status === "success" ? (
        <div className="border border-charcoal/10 bg-cream px-6 py-10 text-center">
          <p className="font-display font-bold uppercase tracking-[0.1em] text-charcoal text-lg">
            Message Received
          </p>
          <p className="mt-2 text-sm text-text-gray">
            Thanks for reaching out. We&apos;ll respond to your email as soon as we can.
          </p>
          <Button
            variant="outline"
            size="md"
            className="mt-6"
            onClick={() => setStatus("idle")}
          >
            Send Another
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div>
            <label htmlFor="contact-name" className={labelClasses}>
              Name
            </label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
              placeholder="Your name"
              autoComplete="name"
            />
            {errors.name && <p className="mt-1 text-xs text-signal-orange">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="contact-email" className={labelClasses}>
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <p className="mt-1 text-xs text-signal-orange">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="contact-order" className={labelClasses}>
              Order Number (optional)
            </label>
            <input
              id="contact-order"
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className={inputClasses}
              placeholder="e.g. NAP-1234"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="contact-topic" className={labelClasses}>
              Topic
            </label>
            <select
              id="contact-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className={inputClasses}
            >
              {TOPICS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="contact-message" className={labelClasses}>
              Message
            </label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className={`${inputClasses} resize-none`}
              placeholder="Tell us what&apos;s on your mind..."
            />
            {errors.message && <p className="mt-1 text-xs text-signal-orange">{errors.message}</p>}
          </div>

          {/* Honeypot — hidden from real users */}
          <div className="absolute left-[-9999px] top-auto" aria-hidden="true">
            <label htmlFor="contact-website">Website</label>
            <input
              id="contact-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-text-gray">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 accent-signal-orange"
            />
            I agree to be contacted about this inquiry at the email provided.
          </label>
          {errors.consent && <p className="-mt-2 text-xs text-signal-orange">{errors.consent}</p>}

          {status === "error" && serverError && (
            <p className="text-xs text-signal-orange" role="alert">
              {serverError}
            </p>
          )}

          <Button variant="primary" size="lg" type="submit" loading={status === "submitting"}>
            Send Message
          </Button>
        </form>
      )}
    </div>
  );
}
