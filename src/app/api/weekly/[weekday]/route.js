// app/api/weekly/[weekday]/route.js
export const runtime = "nodejs";
import prisma from "@/lib/db";

const DEFAULT_LANG = "pt"; // ili šta ti već treba

// helper: pročitaj ID admina iz cookie-ja
function getAdminIdFromCookie(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/admin_auth=(\d+)/);
  if (!match) return null;
  return Number(match[1]);
}

// helper: dozvoli BILO KOG admina
function requireAnyAdmin(req) {
  const adminId = getAdminIdFromCookie(req);
  if (!adminId) {
    return { ok: false, status: 401 };
  }
  return { ok: true, adminId };
}

function parseWeekdayParam(params) {
  const n = Number.parseInt(params?.weekday, 10);
  return Number.isInteger(n) && n >= 0 && n <= 6 ? n : null;
}

// PUT /api/weekly/:weekday  (upsert)
export async function PUT(req, context) {
  const { ok, status } = requireAnyAdmin(req);
  if (!ok) return new Response("unauthorized", { status });

  const params = await context.params;
  const weekday = parseWeekdayParam(params);
  if (weekday === null) return new Response("bad weekday", { status: 400 });

  const body = await req.json().catch(() => ({}));

  const {
    icon,
    link,
    buttonColor,
    active,

    title,
    button,
    rich,
    richHtml,

    translations: rawTranslations,
    defaultLang,
    category,
  } = body;

  const translations = rawTranslations || {};
  const mainLang = defaultLang || DEFAULT_LANG;
  const mainT = translations[mainLang] || {};

  const data = {
    weekday,

    title: mainT.title ?? title ?? "",
    button: mainT.button ?? button ?? "",
    rich: mainT.rich ?? rich ?? null,
    richHtml: mainT.richHtml ?? richHtml ?? null,
    link: mainT.link ?? link ?? "",

    icon: icon ?? "",
    active: Boolean(active ?? true),
    buttonColor: buttonColor || "green",

    translations: Object.keys(translations).length ? translations : null,
    category: category || "ALL",
  };

  const row = await prisma.weeklyPromotion.upsert({
    where: { weekday },
    create: data,
    update: data,
  });

  return Response.json(row);
}

// PATCH /api/weekly/:weekday  { active: boolean }
export async function PATCH(req, context) {
  const { ok, status } = requireAnyAdmin(req);
  if (!ok) return new Response("unauthorized", { status });

  const params = await context.params;
  const weekday = parseWeekdayParam(params);
  if (weekday === null) return new Response("bad weekday", { status: 400 });

  const body = await req.json().catch(() => ({}));
  const next = Boolean(body.active);

  try {
    const row = await prisma.weeklyPromotion.update({
      where: { weekday },
      data: { active: next },
    });
    return Response.json(row);
  } catch {
    return new Response("not found", { status: 404 });
  }
}

// DELETE /api/weekly/:weekday
export async function DELETE(req, context) {
  const { ok, status } = requireAnyAdmin(req);
  if (!ok) return new Response("unauthorized", { status });

  const params = await context.params;
  const weekday = parseWeekdayParam(params);
  if (weekday === null) return new Response("bad weekday", { status: 400 });

  try {
    await prisma.weeklyPromotion.delete({ where: { weekday } });
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 204 });
  }
}
