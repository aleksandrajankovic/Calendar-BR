// app/api/special/route.js
export const runtime = "nodejs";
import prisma from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";
import { sanitizeRichHtml } from "@/lib/sanitize";
import { sanitizeLink } from "@/lib/validate";

export async function GET(req) {
  const session = await getAdminFromRequest(req);
  if (!session) return new Response("unauthorized", { status: 401 });

  const rows = await prisma.specialPromotion.findMany();
  return Response.json(rows.map((r) => ({ ...r, richHtml: r.richHtml ?? null })));
}

export async function POST(req) {
  const session = await getAdminFromRequest(req);
  if (!session) return new Response("unauthorized", { status: 401 });

  const body = await req.json().catch(() => ({}));
  const {
    year, month, day,
    icon, link, buttonColor, active,
    title, button, rich, richHtml,
    translations: rawTranslations,
    defaultLang,
    category,
    scratch,
  } = body;

  const translations = rawTranslations || {};
  const mainLang = defaultLang || "pt";
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
      year, month, day,
      title: mainT.title ?? title ?? "",
      button: mainT.button ?? button ?? "",
      link: sanitizeLink(mainT.link ?? link ?? ""),
      rich: mainT.rich ?? rich ?? null,
      richHtml: sanitizeRichHtml(mainT.richHtml ?? richHtml ?? null),
      icon: icon ?? "",
      active: typeof active === "boolean" ? active : true,
      buttonColor: buttonColor || "green",
      scratch: !!scratch,
      translations: Object.keys(translations).length ? translations : null,
      category: category || "ALL",
    },
  });

  return Response.json(created, { status: 201 });
}
