// src/app/api/special/[id]/route.js
export const runtime = "nodejs";
import prisma from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";
import { sanitizeRichHtml } from "@/lib/sanitize";
import { sanitizeLink } from "@/lib/validate";

function sanitizeTranslations(translations) {
  if (!translations || typeof translations !== "object" || Array.isArray(translations)) return null;
  return Object.fromEntries(
    Object.entries(translations).map(([lang, value]) => [
      lang,
      {
        ...(value && typeof value === "object" ? value : {}),
        richHtml: sanitizeRichHtml(value?.richHtml ?? null),
        link: sanitizeLink(value?.link ?? ""),
      },
    ])
  );
}

/* ---------- PUT /api/special/:id ---------- */
export async function PUT(req, { params }) {
  const session = await getAdminFromRequest(req);
  if (!session) return new Response("unauthorized", { status: 401 });

  const { id } = await params;
  const specialId = Number.parseInt(id, 10);
  if (!Number.isInteger(specialId)) return new Response("bad id", { status: 400 });

  const body = await req.json().catch(() => ({}));
  const {
    year, month, day, icon, link, buttonColor, active,
    title, button, rich, richHtml,
    translations: rawTranslations,
    defaultLang,
    category,
    scratch,
  } = body;

  const translations = rawTranslations || {};
  const mainLang = defaultLang || "pt";
  const mainT = translations[mainLang] || {};

  const rawTitle = (title ?? "").trim();
  const mainTitle = (mainT.title ?? "").trim();
  if (!rawTitle && !mainTitle) return new Response("Title is required", { status: 400 });

  const data = {
    year, month, day,
    title: mainT.title ?? title ?? "",
    button: mainT.button ?? button ?? "",
    link: sanitizeLink(mainT.link ?? link ?? ""),
    rich: mainT.rich ?? rich ?? null,
    richHtml: sanitizeRichHtml(mainT.richHtml ?? richHtml ?? null),
    icon: icon ?? "",
    active: !!active,
    buttonColor: buttonColor || "green",
    scratch: !!scratch,
    translations: sanitizeTranslations(Object.keys(translations).length ? translations : null),
    category: category || "ALL",
  };

  const row = await prisma.specialPromotion.upsert({
    where: { id: specialId },
    update: data,
    create: { id: specialId, ...data },
  });

  return Response.json(row);
}

/* ---------- PATCH /api/special/:id ---------- */
export async function PATCH(req, { params }) {
  const session = await getAdminFromRequest(req);
  if (!session) return new Response("unauthorized", { status: 401 });

  const { id } = await params;
  const specialId = Number.parseInt(id, 10);
  if (!Number.isInteger(specialId)) return new Response("bad id", { status: 400 });

  const body = await req.json().catch(() => ({}));
  const next = Boolean(body.active);

  try {
    const row = await prisma.specialPromotion.update({
      where: { id: specialId },
      data: { active: next },
    });
    return Response.json(row);
  } catch {
    return new Response("not found", { status: 404 });
  }
}

/* ---------- DELETE /api/special/:id ---------- */
export async function DELETE(req, { params }) {
  const session = await getAdminFromRequest(req);
  if (!session) return new Response("unauthorized", { status: 401 });

  const { id } = await params;
  const specialId = Number.parseInt(id, 10);
  if (!Number.isInteger(specialId)) return new Response("bad id", { status: 400 });

  await prisma.specialPromotion.delete({ where: { id: specialId } }).catch(() => {});
  return new Response(null, { status: 204 });
}
