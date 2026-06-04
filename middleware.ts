import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";

/**
 * Protects the admin dashboard. Any /admin/* page (except the login page)
 * requires a valid HttpOnly session cookie; otherwise we redirect to the login
 * page. The cookie is verified server-side, so it cannot be faked from the
 * browser.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the login page itself through.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (await verifySessionToken(token, secret)) {
    return NextResponse.next();
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.search = "";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
