// src/app/api/weekly-plan/route.js
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

const DEFAULT_LANG = "pt";

// GET is public — used by the calendar page itself
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const year = Number.parseInt(searchParams.get("year") ?? "", 10);
  const month = Number.parseInt(searchParams.get("month") ?? "", 10);

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return new Response("Bad params", { status: 400 });
  }

  const rows = await prisma.weeklyPlan.findMany({ where: { year, month }, orderBy: { weekday: "asc" } });
  return Response.json(rows);
}

export async function PUT(req) {
  const session = await getAdminFromRequest(req);
  if (!session) return new Response("unauthorized", { status: 401 });

  const body = await req.json().catch(() => ({}));
  const year = Number.parseInt(body.year, 10);
  const month = Number.parseInt(body.month, 10);
  const weekday = Number.parseInt(body.weekday, 10);

  if (![year, month, weekday].every(Number.isInteger) || weekday < 0 || weekday > 6) {
    return new Response("Bad payload", { status: 400 });
  }

  const { icon, link, buttonColor, active, title, button, rich, richHtml, translations: rawTranslations, defaultLang, category } = body;

  const translations = rawTranslations || {};
  const mainLang = defaultLang || DEFAULT_LANG;
  const mainT = translations[mainLang] || {};

  const data = {
    year, month, weekday,
    title: mainT.title ?? title ?? "",
    button: mainT.button ?? button ?? "",
    rich: mainT.rich ?? rich ?? null,
    richHtml: sanitizeRichHtml(mainT.richHtml ?? richHtml ?? null),
    link: sanitizeLink(mainT.link ?? link ?? ""),
    icon: icon ?? null,
    active: Boolean(active ?? true),
    buttonColor: buttonColor || "green",
    translations: sanitizeTranslations(translations),
    category: category || "ALL",
  };

  const row = await prisma.weeklyPlan.upsert({
    where: { year_month_weekday: { year, month, weekday } },
    create: data,
    update: data,
  });

  return Response.json(row);
}

export async function DELETE(req) {
  const session = await getAdminFromRequest(req);
  if (!session) return new Response("unauthorized", { status: 401 });

  const body = await req.json().catch(() => ({}));
  const year = Number.parseInt(body.year, 10);
  const month = Number.parseInt(body.month, 10);
  const weekday = Number.parseInt(body.weekday, 10);

  if (![year, month, weekday].every(Number.isInteger) || weekday < 0 || weekday > 6) {
    return new Response("Bad payload", { status: 400 });
  }

  try {
    await prisma.weeklyPlan.delete({ where: { year_month_weekday: { year, month, weekday } } });
  } catch {}

  return new Response(null, { status: 204 });
}
