// src/app/api/admin/users/route.js
export const runtime = "nodejs";

import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

function getAdminIdFromCookie(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/admin_auth=(\d+)/);
  if (!match) return null;
  return Number(match[1]);
}

// GET /api/admin/users  -> lista svih admina (samo super admin)
export async function GET(req) {
  try {
    const currentAdminId = getAdminIdFromCookie(req);
    if (!currentAdminId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const currentAdmin = await prisma.adminUser.findUnique({
      where: { id: currentAdminId },
    });

    if (!currentAdmin || !currentAdmin.isSuper) {
      return new Response("Forbidden", { status: 403 });
    }

    const admins = await prisma.adminUser.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        isSuper: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json(admins);
  } catch (err) {
    console.error("List admins error:", err);
    return new Response("Error", { status: 500 });
  }
}


export async function POST(req) {
  try {
    const currentAdminId = getAdminIdFromCookie(req);
    if (!currentAdminId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const currentAdmin = await prisma.adminUser.findUnique({
      where: { id: currentAdminId },
    });

    if (!currentAdmin || !currentAdmin.isSuper) {
      return new Response("Forbidden", { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    let { name, email, password, isSuper } = body;

    name = (name || "").trim();
    email = (email || "").trim().toLowerCase();
    password = (password || "").trim();
    isSuper = Boolean(isSuper);

    if (!name || !email || !password) {
      return new Response("Missing fields", { status: 400 });
    }

    const existing = await prisma.adminUser.findUnique({
      where: { email },
    });
    if (existing) {
      return new Response("Email already in use", { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.adminUser.create({
      data: {
        name,
        email,
        passwordHash,
        isSuper,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isSuper: true,
        createdAt: true,
      },
    });

    return Response.json(newAdmin, { status: 201 });
  } catch (err) {
    console.error("Create admin error:", err);
    return new Response("Error", { status: 500 });
  }
}
