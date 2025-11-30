// src/app/api/admin/me/route.js
export const runtime = "nodejs";

import prisma from "@/lib/db";

function getAdminIdFromCookie(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/admin_auth=(\d+)/);
  if (!match) return null;
  return Number(match[1]);
}

export async function GET(req) {
  try {
    const adminId = getAdminIdFromCookie(req);
    if (!adminId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        isSuper: true,
      },
    });

    if (!admin) {
      return new Response("Unauthorized", { status: 401 });
    }

    return Response.json(admin);
  } catch (err) {
    console.error("GET /api/admin/me error:", err);
    return new Response("Error", { status: 500 });
  }
}
