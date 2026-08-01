import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession, type SessionOptions } from "iron-session";
import type { AdminSession } from "@/lib/auth";

/**
 * Session configuration must match src/lib/auth.ts exactly. It is duplicated
 * here (instead of importing) because middleware runs on the edge runtime,
 * where importing next/headers is not supported.
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

/**
 * Protect /admin and /api/admin/* routes.
 * - /admin/login and /api/admin/login always pass through.
 * - Unauthenticated page requests redirect to /admin/login.
 * - Unauthenticated API requests return 401.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page and login endpoint through
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const session = await getIronSession<AdminSession>(request, response, sessionOptions);

  if (!session.isAdmin) {
    if (pathname.startsWith("/api/admin/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
