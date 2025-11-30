// src/app/api/upload/route.js
export const runtime = "nodejs";

import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import sharp from "sharp";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_WIDTH = 1600;
const QUALITY = 85;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

// helper: bilo koji ulogovan admin
function getAdminIdFromCookie(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/admin_auth=(\d+)/);
  if (!match) return null;
  return Number(match[1]);
}

export async function POST(req) {
  // dozvoli bilo kog admina
  const adminId = getAdminIdFromCookie(req);
  if (!adminId) {
    return new Response("unauthorized", { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return new Response("No file", { status: 400 });
  }

  if (!ALLOWED_MIME.includes(file.type || "")) {
    return new Response("Unsupported file type", { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return new Response("Too large", { status: 413 });
  }

  const inputBuf = Buffer.from(await file.arrayBuffer());

  const orig = file.name || "upload";
  const baseName = path
    .parse(orig).name
    .replace(/[^a-z0-9-_]+/gi, "_")
    .toLowerCase();
  const hash = crypto.createHash("md5").update(inputBuf).digest("hex").slice(0, 8);
  const fileNameWebp = `${baseName}-${hash}.webp`;

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const outPath = path.join(uploadsDir, fileNameWebp);
  await sharp(inputBuf)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(outPath);

  const url = `/uploads/${fileNameWebp}`;
  return Response.json({ url });
}
