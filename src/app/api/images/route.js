export const runtime = "nodejs";

import fs from "node:fs/promises";
import path from "node:path";

function isAuthed(req) {
  const cookie = req.headers.get("cookie") || "";
  // dovoljno je da postoji admin_auth cookie
  return cookie.includes("admin_auth=");
}

// GET /api/images  -> lista fajlova iz public/uploads
export async function GET(req) {
  if (!isAuthed(req)) return new Response("unauthorized", { status: 401 });

  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  try {
    const entries = await fs.readdir(uploadsDir, { withFileTypes: true });

    const files = entries
      .filter((e) => e.isFile())
      .map((e) => ({
        name: e.name,
        url: `/uploads/${e.name}`,
      }));

    return Response.json({ files });
  } catch (err) {
    // ako folder ne postoji, samo empty lista
    if (err.code === "ENOENT") {
      return Response.json({ files: [] });
    }
    console.error("List images error:", err);
    return new Response("Error listing images", { status: 500 });
  }
}

// DELETE /api/images  { filename }
export async function DELETE(req) {
  if (!isAuthed(req)) return new Response("unauthorized", { status: 401 });

  const body = await req.json().catch(() => ({}));
  const filename = (body.filename || "").trim();

  if (!filename || filename.includes("..") || filename.includes("/")) {
    return new Response("Bad filename", { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadsDir, filename);

  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error("Delete image error:", err);
      return new Response("Error deleting", { status: 500 });
    }
  }

  return new Response(null, { status: 204 });
}
