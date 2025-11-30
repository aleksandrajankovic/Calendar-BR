// middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
  const adminCookie = req.cookies.get("admin_auth")?.value;

  if (!adminCookie) {
    const loginUrl = new URL("/login", req.url);
    // opciono:
    // loginUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
