import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { newsletterProvider } from "@/lib/newsletter";
import { rateLimit, getRateLimitKey, Limiters } from "@/lib/rate-limit";

const newsletterSchema = z.object({
  email: z.email("Please enter a valid email address."),
});

/**
 * POST /api/newsletter
 *
 * Newsletter signup endpoint.
 * 200 on success, 400 on validation/provider failure, 429 on rate limit.
 */
export async function POST(request: NextRequest) {
  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Rate limit by IP
  const limit = await rateLimit(
    getRateLimitKey(request),
    Limiters.newsletter.maxRequests,
    Limiters.newsletter.windowMs
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait and try again." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  // Validate email
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  // Subscribe via the configured newsletter provider
  const result = await newsletterProvider.subscribe(parsed.data.email.trim().toLowerCase());
  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Unable to subscribe. Please try again." },
      { status: 400 }
    );
  }

  return NextResponse.json({ subscribed: true });
}
