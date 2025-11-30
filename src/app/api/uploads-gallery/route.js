export const runtime = "nodejs";

import fs from "node:fs/promises";
import path from "node:path";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED_EXT = /\.(png|jpe?g|webp|gif|svg)$/i;

function getAdminIdFromCookie(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/admin_auth=(\d+)/);
  if (!match) return null;
  return Number(match[1]);
}

// GET /api/uploads-gallery -> lista svih slika
export async function GET(req) {
  const adminId = getAdminIdFromCookie(req);
  if (!adminId) {
    return new Response("unauthorized", { status: 401 });
  }

  try {
    const entries = await fs.readdir(UPLOADS_DIR, { withFileTypes: true });

    const files = [];
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (!ALLOWED_EXT.test(entry.name)) continue;

      const fullPath = path.join(UPLOADS_DIR, entry.name);
      const stat = await fs.stat(fullPath);

      files.push({
        name: entry.name,
        url: `/uploads/${entry.name}`,
        size: stat.size,
        mtime: stat.mtime,
      });
    }

    // najnovije prvo
    files.sort((a, b) => b.mtime - a.mtime);

    return Response.json(files);
  } catch (err) {
    console.error("Gallery GET error:", err);
    return new Response("error", { status: 500 });
  }
}

// DELETE /api/uploads-gallery?name=filename.webp
export async function DELETE(req) {
  const adminId = getAdminIdFromCookie(req);
  if (!adminId) {
    return new Response("unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (
    !name ||
    name.includes("..") ||
    name.includes("/") ||
    !ALLOWED_EXT.test(name)
  ) {
    return new Response("bad name", { status: 400 });
  }

  const fullPath = path.join(UPLOADS_DIR, name);

  try {
    await fs.unlink(fullPath);
  } catch (err) {
    // ako ne postoji, ignoriši
    console.warn("Delete error:", err.message);
  }

  return new Response(null, { status: 204 });
}
