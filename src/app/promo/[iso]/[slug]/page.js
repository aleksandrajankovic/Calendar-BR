// src/app/promo/[iso]/[slug]/page.js
export const runtime = "nodejs";

import prisma from "@/lib/db";
import { headers } from "next/headers";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { slugify } from "@/lib/slug";

// ---------- helpers ----------
async function absoluteUrl(path) {
  const h = await headers();

  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";

  const base = process.env.NEXT_PUBLIC_BASE_URL || `${proto}://${host}`;
  return `${base}${path}`;
}

// YYYY-MM-DD → { y, m(0-11), d } + validacija
function parseISO(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const y = +m[1],
    mon = +m[2],
    d = +m[3];
  const dt = new Date(Date.UTC(y, mon - 1, d));
  const valid =
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() + 1 === mon &&
    dt.getUTCDate() === d;
  return valid ? { y, m: mon - 1, d } : null;
}

// Nađi promo za datum (special prioritet, pa weekly)
async function findPromoByDate(y, m, d) {
  const special = await prisma.specialPromotion.findFirst({
    where: { year: y, month: m, day: d, active: true },
  });
  if (special) return { type: "special", promo: special };

  // weekly po day-of-week (pon=0..ned=6)
  const jsWd = new Date(y, m, d).getDay(); // 0..6 (ned..sub)
  const wd = jsWd === 0 ? 6 : jsWd - 1; // 0..6 (pon..ned)
  const weekly = await prisma.weeklyPromotion.findFirst({
    where: { weekday: wd, active: true },
  });
  if (weekly) return { type: "weekly", promo: weekly };

  return { type: null, promo: null };
}

// ---------- SEO ----------
export async function generateMetadata({ params }) {
  const p = await params;
  const parsed = parseISO(p.iso);
  if (!parsed) return {};

  const { y, m, d } = parsed;
  const { promo } = await findPromoByDate(y, m, d);
  if (!promo) return {};

  const title = promo.title || "Promoção";
  const description =
    (Array.isArray(promo.description) && promo.description[0]) ||
    promo.subtitle ||
    "Confira a promoção do dia";

  const correctSlug = slugify(promo.title || "promocao");
  const canonicalPath = `/promo/${p.iso}/${correctSlug}`;

  const url = await absoluteUrl(canonicalPath);
  const image = promo.image ? await absoluteUrl(promo.image) : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

// ---------- PAGE (SSR) ----------
export default async function PromoDetailPage({ params }) {
  // 🔴 PRIVREMENO ISKLJUČENO:
  // svaki pristup /promo/[iso]/[slug] šaljemo nazad na kalendar
  redirect("/");

  // Ako kasnije hoćeš da vratiš single page, samo obriši `redirect("/")`
  // i odkomentariši kod ispod:

  /*
  const p = await params; // Next 16
  const parsed = parseISO(p.iso);
  if (!parsed) notFound();

  const { y, m, d } = parsed;
  const found = await findPromoByDate(y, m, d);
  if (!found.promo) notFound();

  const promo = found.promo;

  const correctSlug = slugify(promo.title || "promocao");
  if (p.slug !== correctSlug) {
    permanentRedirect(`/promo/${p.iso}/${correctSlug}`);
  }

  const dateHuman = `${String(d).padStart(2, "0")}.${String(m + 1).padStart(
    2,
    "0"
  )}.${y}.`;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <p className="text-sm text-zinc-500">{dateHuman}</p>
      <h1 className="text-2xl font-bold text-white">{promo.title}</h1>

      {promo.richHtml ? (
        <article
          className="prose prose-invert max-w-none [&_ul]:list-inside [&_ul]:pl-0 [&_ul_li_p]:m-0 [&_ul_li_p]:inline"
          dangerouslySetInnerHTML={{ __html: promo.richHtml }}
        />
      ) : (
        <>
          {promo.image ? (
            <div
              className="w-full aspect-[44/17] rounded-lg overflow-hidden mb-4"
              style={{
                backgroundImage: `url(${promo.image})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          ) : null}
        </>
      )}

      {promo.link ? (
        <a
          className="inline-block bg-red-600 hover:bg-red-500 px-4 py-2 rounded-md"
          href={promo.link}
          target="_blank"
          rel="noreferrer"
        >
          {promo.button || "Saiba mais"}
        </a>
      ) : null}

      <div>
        <a href="/" className="text-white underline">
          ← Voltar ao calendário
        </a>
      </div>
    </main>
  );
  */
}
