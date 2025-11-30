// app/api/auth/route.js
export const runtime = "nodejs";

import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

const maxAge = 60 * 60 * 24 * 7; // 7 dana

function makeSessionCookie(value) {
  const isProd = process.env.NODE_ENV === "production";
  return [
    `admin_auth=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`,
    isProd ? "Secure" : null,
  ]
    .filter(Boolean)
    .join("; ");
}

function makeDeleteCookie() {
  const isProd = process.env.NODE_ENV === "production";
  return [
    "admin_auth=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
    isProd ? "Secure" : null,
  ]
    .filter(Boolean)
    .join("; ");
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body?.email || "").trim().toLowerCase();
    const password = (body?.password || "").trim();

    console.log("LOGIN BODY:", body);
    console.log("EMAIL:", email);

    if (!email || !password) {
      console.log("Missing credentials");
      return new Response("Missing credentials", { status: 400 });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email },
    });

    console.log("FOUND ADMIN:", admin);

    if (!admin) {
      console.log("No admin for this email");
      return new Response("Invalid credentials", { status: 401 });
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    console.log("PASSWORD OK?", ok);

    if (!ok) {
      return new Response("Invalid credentials", { status: 401 });
    }

    return new Response(null, {
      status: 204,
      headers: {
        "Set-Cookie": makeSessionCookie(String(admin.id)),
      },
    });
  } catch (e) {
    console.error(e);
    return new Response("Error", { status: 500 });
  }
}


export async function DELETE() {
  return new Response(null, {
    status: 204,
    headers: {
      "Set-Cookie": makeDeleteCookie(),
    },
  });
}
