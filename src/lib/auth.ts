/**
 * Admin session management using iron-session.
 * Sealed, encrypted cookies — no server-side session store needed.
 */
import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export type AdminSession = {
  isAdmin: boolean;
  createdAt: string;
};

/**
 * Shared session configuration. The password must stay in sync with
 * src/middleware.ts (which duplicates it because the edge runtime cannot
 * import next/headers).
 */
const sessionOptions: SessionOptions = {
  cookieName: "napfleet-admin-session",
  password: process.env.SESSION_SECRET || "napfleet-dev-only-session-secret-change-me-0000",
  ttl: 60 * 60 * 8, // 8 hours
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  },
};

/** Read the current admin session from cookies (never throws). */
export async function getSession(): Promise<IronSession<AdminSession>> {
  const cookieStore = await cookies();
  return getIronSession<AdminSession>(cookieStore, sessionOptions);
}

/**
 * Verify the submitted password against the bcrypt hash in
 * ADMIN_PASSWORD_HASH and, if valid, create an admin session.
 */
export async function createSession(password: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    return { success: false, error: "Admin authentication is not configured" };
  }

  let valid = false;
  try {
    valid = await bcrypt.compare(password, hash);
  } catch {
    return { success: false, error: "Authentication error" };
  }

  if (!valid) {
    return { success: false, error: "Invalid credentials" };
  }

  const session = await getSession();
  session.isAdmin = true;
  session.createdAt = new Date().toISOString();
  await session.save();

  return { success: true };
}

/** Destroy the admin session and clear the session cookie. */
export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}

/**
 * Middleware helper for API routes. Returns true when a valid admin
 * session is present, false otherwise — guard with:
 *
 *   if (!(await requireAdmin())) {
 *     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 *   }
 */
export async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  return session.isAdmin === true;
}
