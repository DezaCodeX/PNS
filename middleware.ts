import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PATHS = new Set(["/admin/login", "/admin/forgot-password", "/admin/create-account"]);
const PUBLIC_API_PATHS = new Set(["/api/admin/auth/login", "/api/admin/auth/logout"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi = pathname === "/api/admin" || pathname.startsWith("/api/admin/");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("pns_admin_session")?.value;

  if (isAdminPage) {
    const isAuthPath = AUTH_PATHS.has(pathname);

    if (isAuthPath) {
      if (sessionCookie) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    if (!sessionCookie) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  if (PUBLIC_API_PATHS.has(pathname) || pathname.startsWith("/api/admin/auth/")) {
    return NextResponse.next();
  }

  if (!sessionCookie) {
    return NextResponse.json(
      { success: false, error: { code: "unauthorized", message: "Authentication required." } },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
