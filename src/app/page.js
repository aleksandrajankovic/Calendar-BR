// src/app/page.js
export const dynamic = "force-dynamic";

import CalendarGrid from "@/components/CalendarGrid";
import CalendarEnhancer from "@/components/CalendarEnhancer";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { withRetry } from "@/lib/withRetry";
import { cookies } from "next/headers";
import LangSwitcher from "@/components/LangSwitcher";
import { notFound } from "next/navigation";
import { bebasNeue } from "@/app/fonts";

const BASE_URL = "https://calendario.meridianbet.bet.br";
const OG_IMAGE = "https://cloud.merbet.com/Preview-image/calendar-universal.png";

const MONTH_NAMES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const yRaw = Array.isArray(sp?.y) ? sp.y[0] : sp?.y;
  const mRaw = Array.isArray(sp?.m) ? sp.m[0] : sp?.m;

  const now = new Date();
  const year = Number.isInteger(parseInt(yRaw)) ? parseInt(yRaw) : now.getFullYear();
  const month =
    Number.isInteger(parseInt(mRaw)) && parseInt(mRaw) >= 0 && parseInt(mRaw) <= 11
      ? parseInt(mRaw)
      : now.getMonth();

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const canonical = isCurrentMonth ? `${BASE_URL}/` : `${BASE_URL}/?y=${year}&m=${month}`;

  const row = await prisma.calendarSettings.findFirst();
  const seo = row?.seoMeta?.pt || {};

  const monthPt = MONTH_NAMES_PT[month];
  const title = seo.title || `Calendário de Promoções ${monthPt} ${year} | Meridianbet Brasil`;
  const description = seo.description || `Descubra as promoções diárias de ${monthPt} ${year}. Aproveite recompensas exclusivas com o Calendário de Promoções da Meridianbet Brasil.`;

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    alternates: {
      canonical,
      languages: { pt: canonical, "x-default": canonical },
    },
    openGraph: {
      title, description,
      url: canonical,
      siteName: "Meridianbet",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Calendário de Promoções" }],
      locale: "pt_BR",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
    robots: { index: true, follow: true },
  };
}

// -------------------------
// HELPERS
// -------------------------
function prevYM(y, m) {
  return m === 0 ? { year: y - 1, month: 11 } : { year: y, month: m - 1 };
}

function nextYM(y, m) {
  return m === 11 ? { year: y + 1, month: 0 } : { year: y, month: m + 1 };
}

function getParam(sp, key) {
  if (!sp) return undefined;
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

function getTextFromTranslations(row, lang) {
  const translations = row.translations || {};
  const t =
    translations[lang] ||
    (Object.keys(translations).length ? translations[Object.keys(translations)[0]] : null);
  return {
    title: t?.title ?? row.title ?? "",
    button: t?.button ?? row.button ?? "",
    link: t?.link ?? row.link ?? "#",
    richHtml: t?.richHtml ?? row.richHtml ?? null,
  };
}

function normalizeSpecials(rows = [], lang) {
  return rows.map((r) => {
    const t = getTextFromTranslations(r, lang);
    return {
      year: r.year,
      month: r.month,
      day: r.day,
      title: t.title,
      icon: r.icon || "",
      richHtml: t.richHtml,
      link: t.link,
      button: t.button,
      active: !!r.active,
      buttonColor: r.buttonColor || "green",
      category: r.category || "ALL",
      scratch: !!r.scratch,
    };
  });
}

// -------------------------
// ALLOWED MONTHS (SpecialPromotion only — prevents infinite crawl)
// -------------------------
function keyYM(y, m) {
  return `${y}-${String(m).padStart(2, "0")}`;
}

async function getAllowedMonths(prismaClient) {
  const specialMonths = await prismaClient.specialPromotion.findMany({
    select: { year: true, month: true },
    distinct: ["year", "month"],
  });

  const map = new Map();
  for (const r of specialMonths) {
    if (
      Number.isInteger(r.year) &&
      Number.isInteger(r.month) &&
      r.month >= 0 &&
      r.month <= 11
    ) {
      map.set(keyYM(r.year, r.month), { year: r.year, month: r.month });
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => a.year - b.year || a.month - b.month
  );
}

// -------------------------
// PAGE COMPONENT
// -------------------------
export default async function Home({ searchParams }) {
  const sp = await searchParams;

  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("admin_auth");
  const adminSession = adminCookie?.value ? await verifyToken(adminCookie.value) : null;
  const isAdmin = !!adminSession;

  const now = new Date();

  const yRaw = getParam(sp, "y");
  const mRaw = getParam(sp, "m");
  const langRaw = getParam(sp, "lang");

  const ALLOWED_LANGS = ["pt", "en"];
  const lang = ALLOWED_LANGS.includes(langRaw) ? langRaw : "pt";

  const reqYear = Number.parseInt(yRaw ?? "", 10);
  const reqMonth = Number.parseInt(mRaw ?? "", 10);

  const year = Number.isInteger(reqYear) ? reqYear : now.getFullYear();
  const month =
    Number.isInteger(reqMonth) && reqMonth >= 0 && reqMonth <= 11
      ? reqMonth
      : now.getMonth();

  const allowedMonths = await withRetry(() => getAllowedMonths(prisma));

  // 404 only when user explicitly requests a month that has no promos via URL params.
  // Default (no params) always shows current month regardless of promo availability.
  if (allowedMonths.length > 0 && (yRaw != null || mRaw != null)) {
    const allowedSet = new Set(allowedMonths.map((x) => keyYM(x.year, x.month)));
    if (!allowedSet.has(keyYM(year, month))) {
      notFound();
    }
  }

  const [weeklyPlanRows, specialRows, calendarSettings] = await withRetry(() =>
    Promise.all([
      prisma.weeklyPlan.findMany({
        where: { year, month },
        orderBy: { weekday: "asc" },
      }),
      prisma.specialPromotion.findMany({
        where: { year, month },
        orderBy: [{ day: "asc" }],
      }),
      prisma.calendarSettings.findFirst(),
    ])
  );

  const weekly = Array.from({ length: 7 }, (_, i) => {
    const r = weeklyPlanRows.find((x) => x.weekday === i);
    if (!r) return { title: "", icon: "", richHtml: null, link: "#", button: "", active: false, buttonColor: "green", category: "ALL" };
    const t = getTextFromTranslations(r, lang);
    return { title: t.title, icon: r.icon || "", richHtml: t.richHtml, link: t.link, button: t.button, active: !!r.active, buttonColor: r.buttonColor || "green", category: r.category || "ALL" };
  });

  const specials = normalizeSpecials(specialRows, lang);

  // Per-month settings
  const monthBgs = calendarSettings?.monthBackgrounds || {};
  const monthBg  = monthBgs[`${year}-${month}`] || {};

  const bgImageUrl       = monthBg.desktop || calendarSettings?.bgImageUrl       || "/img/bg-calendar.png";
  const bgImageUrlMobile = monthBg.mobile  || calendarSettings?.bgImageUrlMobile || bgImageUrl;
  const logoUrl          = calendarSettings?.logoUrl || "/img/logo.svg";
  const pos              = monthBg.position || calendarSettings?.calendarPosition || "left";
  const theme            = monthBg.theme    || calendarSettings?.theme            || "default";
  const isMonthInactive  = !!monthBg.inactive;

  const globalTitles = calendarSettings?.calendarTitle || {};
  const calendarTitle =
    (lang === "pt" ? monthBg.titlePt : (monthBg.titleEn || monthBg.titlePt)) ||
    globalTitles[lang] ||
    (lang === "pt" ? "Calendário de Promoções" : "Promotion Calendar");

  const mainJustify =
    pos === "center" ? "md:justify-center" :
    pos === "right"  ? "md:justify-end" :
                       "md:justify-start";
  const innerMargin =
    pos === "center" ? "mx-auto" :
    pos === "right"  ? "mx-auto md:mx-0 md:ml-auto" :
                       "mx-auto md:mx-0 md:mr-auto";
  const headingAlign =
    pos === "center" ? "md:text-center" :
    pos === "right"  ? "md:text-right" :
                       "md:text-left";

  // Pagination through allowed months only
  let p = null;
  let n = null;
  if (allowedMonths.length > 0) {
    const idx = allowedMonths.findIndex((x) => x.year === year && x.month === month);
    if (idx > 0) p = allowedMonths[idx - 1];
    if (idx >= 0 && idx < allowedMonths.length - 1) n = allowedMonths[idx + 1];
  } else {
    p = prevYM(year, month);
    n = nextYM(year, month);
  }

  const locale = lang === "pt" ? "pt-BR" : "en-US";
  const rawLabel = new Date(year, month, 1).toLocaleString(locale, { month: "long" });
  const monthLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);

  return (
    <>
      <div className="min-h-dvh flex flex-col overflow-hidden">
        {/* HEADER — absolute overlay, same style as calendar-next */}
        <header className="absolute inset-x-0 top-0 z-20 flex items-center px-4 py-6 md:px-16 md:py-7">
          <div className="flex-1" />
          <a href="https://meridianbet.bet.br" target="_blank" rel="noreferrer" aria-label="Meridianbet main site">
            <img src={logoUrl} alt="Meridianbet" className="h-8 md:h-10 w-auto" />
          </a>
          <div className="flex-1 flex items-center justify-end gap-3">
            <LangSwitcher year={year} month={month} lang={lang} allowedLangs={ALLOWED_LANGS} />
          </div>
        </header>

        {/* MAIN */}
        <main
          className={`relative z-0 w-full flex-1 bg-no-repeat bg-cover bg-center calendar-bg overflow-hidden md:overflow-auto flex justify-center ${mainJustify}`}
          style={{ backgroundImage: `url("${bgImageUrl}")` }}
        >
          {/* MOBILE BG */}
          <div
            className="pointer-events-none absolute inset-0 md:hidden bg-no-repeat bg-cover bg-center -z-10 calendar-mobile-bg"
            style={{ backgroundImage: `url("${bgImageUrlMobile}")` }}
          />

          {/* <SnowOverlay /> */}

          <div className={`relative z-10 w-full max-w-6xl px-4 sm:px-6 md:px-10 lg:px-16 pb-4 md:pb-10 ${
            theme === "football" ? "pt-4 md:pt-6" : "pt-20 md:pt-24"
          } ${innerMargin}`}>
            <h1
              className={`${
                theme === "football"
                  ? `text-[28px] md:text-[44px] font-normal tracking-[0.06em] ${bebasNeue.className} mt-10 mb-4 md:mt-10 md:mb-10`
                  : "text-3xl md:text-5xl font-extrabold tracking-tight"
              } text-white text-center ${headingAlign}`}
            >
              {calendarTitle}
            </h1>

            {isAdmin && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded bg-amber-500/20 text-amber-200 px-3 py-1 text-sm">
                  <span>Admin preview</span>
                  <a href="/admin" className="underline hover:text-white transition-colors">Dashboard</a>
                </div>
                {isMonthInactive && (
                  <div className="inline-flex items-center gap-1.5 rounded bg-red-700/40 text-red-200 border border-red-500/40 px-3 py-1 text-sm">
                    <span>⚠ Month deactivated — not visible to users</span>
                    <a href="/admin/calendar-style/monthly" className="underline hover:text-white transition-colors">Edit</a>
                  </div>
                )}
              </div>
            )}

            {/* MOBILE PAGINATION — hidden for football (pagination is inside CalendarMobileFootball) */}
            {theme !== "football" && (
              <div className="mt-6 flex items-center justify-center md:hidden">
                <div className="inline-flex items-center gap-4 rounded-full bg-black/40 px-4 py-2 text-white text-sm">
                  {p ? (
                    <a href={`/?y=${p.year}&m=${p.month}&lang=${lang}`} className="p-1 hover:opacity-80" aria-label="Previous month">‹</a>
                  ) : (
                    <span className="p-1 opacity-30" aria-hidden="true">‹</span>
                  )}
                  <span className="min-w-[140px] text-center font-semibold">
                    {monthLabel} <span className="ml-1 opacity-80">{year}</span>
                  </span>
                  {n ? (
                    <a href={`/?y=${n.year}&m=${n.month}&lang=${lang}`} className="p-1 hover:opacity-80" aria-label="Next month">›</a>
                  ) : (
                    <span className="p-1 opacity-30" aria-hidden="true">›</span>
                  )}
                </div>
              </div>
            )}

            {/* CALENDAR */}
            <div className={theme === "football" ? "mt-2 md:mt-1" : "mt-6"}>
              <CalendarGrid
                year={year}
                month={month}
                weekly={weekly}
                specials={specials}
                adminPreview={isAdmin}
                lang={lang}
                theme={theme}
                prevMonth={p}
                nextMonth={n}
              />
            </div>

            <CalendarEnhancer adminPreview={isAdmin} lang={lang} />

            {/* DESKTOP PAGINATION */}
            <div className="mt-6 hidden md:flex items-center justify-center">
              <div className="inline-flex items-center gap-4 rounded-full bg-black/40 px-4 py-2 text-white text-base">
                {p ? (
                  <a href={`/?y=${p.year}&m=${p.month}&lang=${lang}`} className="p-1 hover:opacity-80" aria-label="Previous month">‹</a>
                ) : (
                  <span className="p-1 opacity-30" aria-hidden="true">‹</span>
                )}
                <span className="min-w-[140px] text-center font-semibold">
                  {monthLabel} <span className="ml-1 opacity-80">{year}</span>
                </span>
                {n ? (
                  <a href={`/?y=${n.year}&m=${n.month}&lang=${lang}`} className="p-1 hover:opacity-80" aria-label="Next month">›</a>
                ) : (
                  <span className="p-1 opacity-30" aria-hidden="true">›</span>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
