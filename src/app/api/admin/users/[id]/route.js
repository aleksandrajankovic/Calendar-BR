export const runtime = "nodejs";

import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

function getAdminIdFromCookie(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/admin_auth=(\d+)/);
  if (!match) return null;
  return Number(match[1]);
}

// PATCH /api/admin/users/:id  -> edit name/email (samo super admin)
export async function PATCH(req, { params }) {
  const { id: idParam } = await params; // ⬅️ bitno

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

    const id = Number(idParam);
    if (!Number.isInteger(id)) {
      return new Response("Bad id", { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    let { name, email } = body;

    const data = {};
    if (name) data.name = String(name).trim();
    if (email) data.email = String(email).trim().toLowerCase();

    if (!Object.keys(data).length) {
      return new Response("Nothing to update", { status: 400 });
    }

    if (data.email) {
      const existing = await prisma.adminUser.findUnique({
        where: { email: data.email },
      });
      if (existing && existing.id !== id) {
        return new Response("Email already in use", { status: 409 });
      }
    }

    const updated = await prisma.adminUser.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        isSuper: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json(updated);
  } catch (err) {
    console.error("Update admin error:", err);
    return new Response("Error", { status: 500 });
  }
}

// DELETE /api/admin/users/:id  -> brisanje (samo super admin)
export async function DELETE(req, { params }) {
  const { id: idParam } = await params; // ⬅️ bitno

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

    const id = Number(idParam);
    if (!Number.isInteger(id)) {
      return new Response("Bad id", { status: 400 });
    }

    if (id === currentAdminId) {
      return new Response("Cannot delete yourself", { status: 400 });
    }

    const user = await prisma.adminUser.findUnique({ where: { id } });
    if (!user) {
      return new Response("Not found", { status: 404 });
    }

    // ne dozvoli brisanje poslednjeg super admina
    if (user.isSuper) {
      const otherSupers = await prisma.adminUser.count({
        where: { isSuper: true, NOT: { id } },
      });
      if (otherSupers === 0) {
        return new Response("Cannot delete last super admin", {
          status: 400,
        });
      }
    }

    await prisma.adminUser.delete({ where: { id } });

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("Delete admin error:", err);
    return new Response("Error", { status: 500 });
  }
}
