// src/app/api/admin/me/route.js
export const runtime = "nodejs";

import prisma from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(req) {
  try {
    const session = await getAdminFromRequest(req);
    if (!session) return new Response("Unauthorized", { status: 401 });

    const admin = await prisma.adminUser.findUnique({
      where: { id: session.adminId },
      select: { id: true, name: true, email: true, isSuper: true },
    });

    if (!admin) return new Response("Unauthorized", { status: 401 });

    return Response.json(admin);
  } catch (err) {
    console.error("GET /api/admin/me error:", err);
    return new Response("Error", { status: 500 });
  }
}
