// src/app/page.js
import CalendarGrid from "@/components/CalendarGrid";
import CalendarEnhancer from "@/components/CalendarEnhancer";
import prisma from "@/lib/db";
import { cookies } from "next/headers";
import LangSwitcher from "@/components/LangSwitcher";
import SnowOverlay from "@/components/SnowOverlay";
import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";

// HELPERS
function prevYM(y, m) {
  return m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 };
}

function nextYM(y, m) {
  return m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 };
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
    (Object.keys(translations).length
      ? translations[Object.keys(translations)[0]]
      : null);

  return {
    title: t?.title ?? row.title ?? "",
    button: t?.button ?? row.button ?? "",
    link: t?.link ?? row.link ?? "#",
    richHtml: t?.richHtml ?? row.richHtml ?? null,
  };
}

function normWeeklyRows(rows = [], lang) {
  const out = Array(7).fill(null);
  for (const r of rows) {
    if (typeof r.weekday === "number" && r.weekday >= 0 && r.weekday <= 6) {
      const t = getTextFromTranslations(r, lang);
      out[r.weekday] = {
        title: t.title,
        icon: r.icon || "",
        richHtml: t.richHtml,
        link: t.link,
        button: t.button,
        active: !!r.active,
        buttonColor: r.buttonColor || "green",
        category: r.category || "ALL",
      };
    }
  }
  return out;
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
    };
  });
}

function getMonthLabel(year, month, lang) {
  const locale = lang === "pt" ? "pt-BR" : "en-US";
  const raw = new Date(year, month, 1).toLocaleString(locale, {
    month: "long",
  });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

// RAW DB FETCHER (bez cache-a)
async function fetchCalendarData(year, month) {
  console.log("DB QUERY EXECUTED:", year, month);

  return Promise.all([
    prisma.weeklyPromotion.findMany({ orderBy: { weekday: "asc" } }),
    prisma.weeklyPlan.findMany({
      where: { year, month },
      orderBy: { weekday: "asc" },
    }),
    prisma.specialPromotion.findMany({
      where: { year, month, active: true },
      orderBy: [{ day: "asc" }],
    }),
    prisma.calendarSettings.findFirst(),
  ]);
}

// CACHED DATA FETCHER
const getCalendarDataCached = unstable_cache(fetchCalendarData, ["calendar-data"], {
  revalidate: 300,
  tags: ["calendar-calendar-data"],
});


// PROMO EXISTENCE CHECK 

async function hasAnyActiveSpecialPromos(prismaClient) {
  const one = await prismaClient.specialPromotion.findFirst({
    where: { active: true },
    select: { id: true },
  });
  return !!one;
}


// PAGE COMPONENT

export default async function Home({ searchParams }) {
  const sp = await searchParams;

  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("admin_auth");
  const isAdmin = !!adminCookie?.value;

  const now = new Date();

  const yRaw = getParam(sp, "y");
  const mRaw = getParam(sp, "m");
  const langRaw = getParam(sp, "lang");

  const ALLOWED_LANGS = ["pt", "en"];
  const lang = ALLOWED_LANGS.includes(langRaw) ? langRaw : "pt";

  const reqYear = Number.parseInt(yRaw ?? "", 10);
  const reqMonth = Number.parseInt(mRaw ?? "", 10);


  let year = Number.isInteger(reqYear) ? reqYear : now.getFullYear();
  let month =
    Number.isInteger(reqMonth) && reqMonth >= 0 && reqMonth <= 11
      ? reqMonth
      : now.getMonth();

 
  const hasPromo = await hasAnyActiveSpecialPromos(prisma);
  const showNav = hasPromo;

  if (!hasPromo) {
    year = now.getFullYear();
    month = now.getMonth();
  }

  const [weeklyDefaults, weeklyPlanRows, specialRows, calendarSettings] =
    await getCalendarDataCached(year, month);

  const defaults = normWeeklyRows(weeklyDefaults, lang);
  const planned = normWeeklyRows(weeklyPlanRows, lang);

  const weekly = Array.from({ length: 7 }, (_, i) =>
    planned[i] ??
    defaults[i] ?? {
      title: "",
      icon: "",
      richHtml: null,
      link: "#",
      button: "",
      active: false,
      buttonColor: "green",
      category: "ALL",
    }
  );

  const specials = normalizeSpecials(specialRows, lang);
  const bgImageUrl = calendarSettings?.bgImageUrl || "/img/bg-calendar.png";

  // pagination (koristi se samo ako showNav=true)
  const p = prevYM(year, month);
  const n = nextYM(year, month);
  const monthLabel = getMonthLabel(year, month, lang);

  return (
    <>
      {/* HEADER */}
      <header className="w-full bg-[linear-gradient(90deg,#A6080E_0%,#D11101_100%)] px-4 md:px-8 py-2 flex items-center justify-between">
        <a href="https://meridianbet.rs">
          <img
            src="./img/logo.svg"
            alt="Meridianbet"
            className="h-6 md:h-7 w-auto"
          />
        </a>
        <div className="flex items-center gap-2">
          <LangSwitcher
            year={year}
            month={month}
            lang={lang}
            allowedLangs={ALLOWED_LANGS}
          />
        </div>
      </header>

      {/* MAIN */}
      <main
        className="
          w-full bg-no-repeat bg-cover bg-center
          calendar-bg
          min-h-[100dvh]
          overflow-hidden
          md:overflow-auto
          flex
          justify-center md:justify-start
        "
        style={{ backgroundImage: `url("${bgImageUrl}")` }}
      >
        {/* <SnowOverlay /> */}

        <div
          className="
            w-full
            max-w-6xl
            px-4 sm:px-6 md:px-10 lg:px-16
            pt-4 pb-4
            md:pt-6 md:pb-10
            mx-auto md:mx-0 md:mr-auto
          "
        >
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white md:text-left text-center">
            {lang === "pt" ? "Calendário de Promoções" : "Promotion Calendar"}
          </h1>

          {isAdmin && (
            <div className="mt-2 inline-block rounded bg-amber-500/20 text-amber-200 px-3 py-1 text-sm">
              Admin preview
            </div>
          )}

          {/* MOBILE paginacija – samo ako ima promo */}
          {showNav && (
            <div className="mt-6 flex items-center justify-center md:hidden">
              <div className="inline-flex items-center gap-4 rounded-full bg-black/40 px-4 py-2 text-white text-sm">
                <a
                  href={`/?y=${p.y}&m=${p.m}&lang=${lang}`}
                  className="p-1 hover:opacity-80"
                  aria-label="Previous month"
                >
                  ‹
                </a>

                <span className="min-w-[140px] text-center font-semibold">
                  {monthLabel} <span className="ml-1 opacity-80">{year}</span>
                </span>

                <a
                  href={`/?y=${n.y}&m=${n.m}&lang=${lang}`}
                  className="p-1 hover:opacity-80"
                  aria-label="Next month"
                >
                  ›
                </a>
              </div>
            </div>
          )}

          {/* KALENDAR */}
          <div className="mt-6">
            <CalendarGrid
              year={year}
              month={month}
              weekly={weekly}
              specials={specials}
              adminPreview={isAdmin}
              lang={lang}
            />
          </div>

          <CalendarEnhancer adminPreview={isAdmin} lang={lang} />

          
          {showNav && (
            <div className="mt-6 md:flex items-center justify-center hidden">
              <div className="inline-flex items-center gap-4 rounded-full bg-black/40 px-4 py-2 text-white text-sm md:text-base">
                <a
                  href={`/?y=${p.y}&m=${p.m}&lang=${lang}`}
                  className="p-1 hover:opacity-80"
                  aria-label="Previous month"
                >
                  ‹
                </a>

                <span className="min-w-[140px] text-center font-semibold">
                  {monthLabel} <span className="ml-1 opacity-80">{year}</span>
                </span>

                <a
                  href={`/?y=${n.y}&m=${n.m}&lang=${lang}`}
                  className="p-1 hover:opacity-80"
                  aria-label="Next month"
                >
                  ›
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
