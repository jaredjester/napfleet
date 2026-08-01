import { NextRequest, NextResponse } from "next/server";
import { validateContactForm } from "@/lib/contact";
import { emailProvider } from "@/lib/email";
import { rateLimit, getRateLimitKey, Limiters } from "@/lib/rate-limit";

/**
 * POST /api/contact
 *
 * Contact form endpoint.
 * 1. Honeypot check — bots that fill the hidden field get a silent 200
 * 2. Rate limit — 3 requests per minute per IP (429)
 * 3. Zod validation — server is authoritative (400)
 * 4. Notify the team via the configured email provider (500 on failure)
 */
export async function POST(request: NextRequest) {
  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Honeypot — silently accept bots without processing or rate limiting.
  const honeypot = (body as Record<string, unknown>).website;
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return NextResponse.json({ received: true });
  }

  // Rate limit by IP: 3 per minute
  const limit = await rateLimit(
    getRateLimitKey(request),
    Limiters.contact.maxRequests,
    Limiters.contact.windowMs
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many messages. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  // Server-side validation
  const parsed = validateContactForm(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      if (!errors[key]) errors[key] = issue.message;
    }
    return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
  }

  const data = parsed.data;

  // Notify the team
  const result = await emailProvider.sendContactNotification({
    fromEmail: data.email,
    fromName: data.name,
    topic: data.topic,
    message: data.message,
    orderNumber: data.orderNumber,
  });

  if (!result.success) {
    console.error("Contact notification email failed:", result.error);
    return NextResponse.json(
      { error: "Unable to send your message. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
