export const runtime = "nodejs";
import prisma from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";

const VALID_THEMES = ["default", "default-horizontal", "football"];
const VALID_POS = ["left", "center", "right"];

const DEFAULT_TITLE = { pt: "Calendário de Promoções", en: "Promotion Calendar" };
const DEFAULT_LOGO  = "/img/logo.svg";
const DEFAULT_SEO_META = {
  pt: {
    title: "Calendário de Promoções | Meridianbet Brasil",
    description: "Fique por dentro das ofertas diárias, descubra novas promoções e aproveite recompensas exclusivas com o Calendário de Promoções da Meridianbet.",
  },
  en: {
    title: "Promotion Calendar | Meridianbet Brasil",
    description: "Stay on top of daily offers, discover new promotions and enjoy exclusive rewards with the Meridianbet Promotion Calendar.",
  },
};

export async function GET(req) {
  const session = await getAdminFromRequest(req);
  if (!session) return new Response("unauthorized", { status: 401 });

  const row = await prisma.calendarSettings.findFirst();
  return Response.json({
    bgImageUrl:       row?.bgImageUrl       || "/img/bg-calendar.png",
    bgImageUrlMobile: row?.bgImageUrlMobile || "/img/bg-calendar-mobile.png",
    theme:            row?.theme            || "default",
    seoMeta:          row?.seoMeta          || DEFAULT_SEO_META,
    monthBackgrounds: row?.monthBackgrounds || {},
    calendarPosition: row?.calendarPosition || "left",
    calendarTitle:    row?.calendarTitle    || DEFAULT_TITLE,
    logoUrl:          row?.logoUrl          || DEFAULT_LOGO,
  });
}

export async function PUT(req) {
  const session = await getAdminFromRequest(req);
  if (!session) return new Response("unauthorized", { status: 401 });

  const body = await req.json().catch(() => ({}));
  const patch = {};

  if ("bgImageUrl" in body)
    patch.bgImageUrl = (body.bgImageUrl || "").trim() || null;

  if ("bgImageUrlMobile" in body)
    patch.bgImageUrlMobile = (body.bgImageUrlMobile || "").trim() || null;

  if ("theme" in body)
    patch.theme = VALID_THEMES.includes(body.theme) ? body.theme : "default";

  if ("calendarPosition" in body)
    patch.calendarPosition = VALID_POS.includes(body.calendarPosition) ? body.calendarPosition : "left";

  if ("logoUrl" in body)
    patch.logoUrl = (body.logoUrl || "").trim() || null;

  if ("calendarTitle" in body) {
    const t = body.calendarTitle;
    patch.calendarTitle = {
      pt: (typeof t?.pt === "string" ? t.pt.trim() : "") || DEFAULT_TITLE.pt,
      en: (typeof t?.en === "string" ? t.en.trim() : "") || DEFAULT_TITLE.en,
    };
  }

  if ("seoMeta" in body) {
    const s = body.seoMeta;
    patch.seoMeta = {
      pt: {
        title:       (typeof s?.pt?.title       === "string" ? s.pt.title.trim()       : "") || DEFAULT_SEO_META.pt.title,
        description: (typeof s?.pt?.description === "string" ? s.pt.description.trim() : "") || DEFAULT_SEO_META.pt.description,
      },
      en: {
        title:       (typeof s?.en?.title       === "string" ? s.en.title.trim()       : "") || DEFAULT_SEO_META.en.title,
        description: (typeof s?.en?.description === "string" ? s.en.description.trim() : "") || DEFAULT_SEO_META.en.description,
      },
    };
  }

  if ("monthBackgrounds" in body) {
    let cleaned = null;
    const raw = body.monthBackgrounds;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const out = {};
      for (const [key, val] of Object.entries(raw)) {
        if (val && typeof val === "object") {
          const desktop  = (val.desktop  || "").trim() || null;
          const mobile   = (val.mobile   || "").trim() || null;
          const position = VALID_POS.includes(val.position) ? val.position : null;
          const titlePt  = (val.titlePt  || "").trim() || null;
          const titleEn  = (val.titleEn  || "").trim() || null;
          const inactive = val.inactive === true ? true : null;
          const theme    = VALID_THEMES.includes(val.theme) ? val.theme : null;
          if (desktop || mobile || position || titlePt || titleEn || inactive || theme)
            out[key] = { desktop, mobile, position, titlePt, titleEn, inactive, theme };
        }
      }
      cleaned = Object.keys(out).length ? out : null;
    }
    patch.monthBackgrounds = cleaned;
  }

  const row = await prisma.calendarSettings.upsert({
    where:  { id: 1 },
    update: patch,
    create: { id: 1, ...patch },
  });

  return Response.json({
    bgImageUrl:       row.bgImageUrl       || "/img/bg-calendar.png",
    bgImageUrlMobile: row.bgImageUrlMobile || "/img/bg-calendar-mobile.png",
    theme:            row.theme            || "default",
    seoMeta:          row.seoMeta          || DEFAULT_SEO_META,
    monthBackgrounds: row.monthBackgrounds || {},
    calendarPosition: row.calendarPosition || "left",
    calendarTitle:    row.calendarTitle    || DEFAULT_TITLE,
    logoUrl:          row.logoUrl          || DEFAULT_LOGO,
  });
}
