// src/app/api/weekly-plan/route.js
export const runtime = "nodejs";
import prisma from "@/lib/db";

const DEFAULT_LANG = "pt";

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

// GET /api/weekly-plan?year=YYYY&month=MM
// ovo je ok da ostane public, za front
export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const year = Number.parseInt(searchParams.get("year") ?? "", 10);
  const month = Number.parseInt(searchParams.get("month") ?? "", 10);

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return new Response("Bad params", { status: 400 });
  }

  const rows = await prisma.weeklyPlan.findMany({
    where: { year, month },
    orderBy: { weekday: "asc" },
  });

  return Response.json(rows);
}

// PUT /api/weekly-plan  (upsert jedne stavke)
export async function PUT(req) {
  const { ok, status } = requireAnyAdmin(req);
  if (!ok) return new Response("unauthorized", { status });

  const body = await req.json().catch(() => ({}));

  const year = Number.parseInt(body.year, 10);
  const month = Number.parseInt(body.month, 10);
  const weekday = Number.parseInt(body.weekday, 10);

  if (
    ![year, month, weekday].every(Number.isInteger) ||
    weekday < 0 ||
    weekday > 6
  ) {
    return new Response("Bad payload", { status: 400 });
  }

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
    year,
    month,
    weekday,

    title: mainT.title ?? title ?? "",
    button: mainT.button ?? button ?? "",
    rich: mainT.rich ?? rich ?? null,
    richHtml: mainT.richHtml ?? richHtml ?? null,
    link: mainT.link ?? link ?? "",

    icon: icon ?? null,
    active: Boolean(active ?? true),
    buttonColor: buttonColor || "green",

    translations: Object.keys(translations).length ? translations : null,
    category: category || "ALL",
  };

  const row = await prisma.weeklyPlan.upsert({
    where: { year_month_weekday: { year, month, weekday } },
    create: data,
    update: data,
  });

  return Response.json(row);
}

// DELETE /api/weekly-plan
export async function DELETE(req) {
  const { ok, status } = requireAnyAdmin(req);
  if (!ok) return new Response("unauthorized", { status });

  const body = await req.json().catch(() => ({}));
  const year = Number.parseInt(body.year, 10);
  const month = Number.parseInt(body.month, 10);
  const weekday = Number.parseInt(body.weekday, 10);

  if (
    ![year, month, weekday].every(Number.isInteger) ||
    weekday < 0 ||
    weekday > 6
  ) {
    return new Response("Bad payload", { status: 400 });
  }

  try {
    await prisma.weeklyPlan.delete({
      where: { year_month_weekday: { year, month, weekday } },
    });
  } catch {
    // ako ne postoji, i dalje vraćamo 204
  }

  return new Response(null, { status: 204 });
}
