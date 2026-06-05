// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const token = req.cookies.get("admin_auth")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    // Invalid or expired token — clear cookie and redirect
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("admin_auth");
    return res;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
