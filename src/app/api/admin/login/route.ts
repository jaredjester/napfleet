import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { rateLimit, getRateLimitKey, Limiters } from "@/lib/rate-limit";

/**
 * POST /api/admin/login
 *
 * Verifies the submitted password via createSession() (bcrypt against
 * ADMIN_PASSWORD_HASH) and issues an iron-session cookie on success.
 * Rate limited to 5 attempts per minute per IP (in-memory Map).
 */
export async function POST(request: NextRequest) {
  // Rate limit: 5 attempts per minute per IP
  const key = getRateLimitKey(request);
  const { allowed } = await rateLimit(
    key,
    Limiters.adminLogin.maxRequests,
    Limiters.adminLogin.windowMs
  );
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in a minute." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const password = typeof body?.password === "string" ? body.password : "";

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const result = await createSession(password);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({ success: true, redirect: "/admin" });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
