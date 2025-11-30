// app/api/specials/route.js
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

// GET /api/specials
export async function GET(req) {
  const adminId = getAdminIdFromCookie(req);
  if (!adminId) {
    return new Response("unauthorized", { status: 401 });
  }

  const rows = await prisma.specialPromotion.findMany();

  const safe = rows.map((r) => ({
    ...r,
    richHtml: r.richHtml ?? null,
  }));

  return Response.json(safe);
}

// POST /api/specials
export async function POST(req) {
  const adminId = getAdminIdFromCookie(req);
  if (!adminId) {
    return new Response("unauthorized", { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const {
    year,
    month,
    day,

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

  if (
    typeof year !== "number" ||
    typeof month !== "number" ||
    typeof day !== "number" ||
    !(title || mainT.title)
  ) {
    return new Response("bad payload", { status: 400 });
  }

  const created = await prisma.specialPromotion.create({
    data: {
      year,
      month, // 0–11
      day,

      title: mainT.title ?? title ?? "",
      button: mainT.button ?? button ?? "",
      link: mainT.link ?? link ?? "",
      rich: mainT.rich ?? rich ?? null,
      richHtml: mainT.richHtml ?? richHtml ?? null,

      icon: icon ?? "",
      active: typeof active === "boolean" ? active : true,
      buttonColor: buttonColor || "green",

      translations: Object.keys(translations).length ? translations : null,
      category: category || "ALL",
    },
  });

  return Response.json(created, { status: 201 });
}
