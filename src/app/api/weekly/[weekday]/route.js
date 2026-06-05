// app/api/weekly/[weekday]/route.js
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

function parseWeekdayParam(params) {
  const n = Number.parseInt(params?.weekday, 10);
  return Number.isInteger(n) && n >= 0 && n <= 6 ? n : null;
}

export async function PUT(req, context) {
  const session = await getAdminFromRequest(req);
  if (!session) return new Response("unauthorized", { status: 401 });

  const params = await context.params;
  const weekday = parseWeekdayParam(params);
  if (weekday === null) return new Response("bad weekday", { status: 400 });

  const body = await req.json().catch(() => ({}));
  const { icon, link, buttonColor, active, title, button, rich, richHtml, translations: rawTranslations, defaultLang, category } = body;

  const translations = rawTranslations || {};
  const mainLang = defaultLang || "pt";
  const mainT = translations[mainLang] || {};

  const data = {
    weekday,
    title: mainT.title ?? title ?? "",
    button: mainT.button ?? button ?? "",
    rich: mainT.rich ?? rich ?? null,
    richHtml: sanitizeRichHtml(mainT.richHtml ?? richHtml ?? null),
    link: sanitizeLink(mainT.link ?? link ?? ""),
    icon: icon ?? "",
    active: Boolean(active ?? true),
    buttonColor: buttonColor || "green",
    translations: sanitizeTranslations(translations),
    category: category || "ALL",
  };

  const row = await prisma.weeklyPromotion.upsert({
    where: { weekday },
    create: data,
    update: data,
  });

  return Response.json(row);
}

export async function PATCH(req, context) {
  const session = await getAdminFromRequest(req);
  if (!session) return new Response("unauthorized", { status: 401 });

  const params = await context.params;
  const weekday = parseWeekdayParam(params);
  if (weekday === null) return new Response("bad weekday", { status: 400 });

  const body = await req.json().catch(() => ({}));
  const next = Boolean(body.active);

  try {
    const row = await prisma.weeklyPromotion.update({ where: { weekday }, data: { active: next } });
    return Response.json(row);
  } catch {
    return new Response("not found", { status: 404 });
  }
}

export async function DELETE(req, context) {
  const session = await getAdminFromRequest(req);
  if (!session) return new Response("unauthorized", { status: 401 });

  const params = await context.params;
  const weekday = parseWeekdayParam(params);
  if (weekday === null) return new Response("bad weekday", { status: 400 });

  try {
    await prisma.weeklyPromotion.delete({ where: { weekday } });
  } catch {}

  return new Response(null, { status: 204 });
}
