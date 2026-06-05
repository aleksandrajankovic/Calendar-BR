"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminTableCard from "../../components/AdminTableCard";
import ImageGalleryModal from "../../components/ImageGalleryModal";

const POSITION_OPTIONS = [
  { value: "left",   label: "Left" },
  { value: "center", label: "Center" },
  { value: "right",  label: "Right" },
];

export default function DefaultSettingsPage() {
  const [bgUrl, setBgUrl]                       = useState("");
  const [bgUrlMobile, setBgUrlMobile]           = useState("");
  const [calendarPosition, setCalendarPosition] = useState("left");
  const [titlePt, setTitlePt]                   = useState("Calendário de Promoções");
  const [titleEn, setTitleEn]                   = useState("Promotion Calendar");
  const [logoUrl, setLogoUrl]                   = useState("/img/logo.svg");
  const [theme, setTheme]                       = useState("default");
  const [seoTitlePt, setSeoTitlePt]             = useState("");
  const [seoDescPt, setSeoDescPt]               = useState("");
  const [loading, setLoading]                   = useState(true);
  const [saving, setSaving]                     = useState(false);
  const [showGallery, setShowGallery]           = useState(false);
  const [galleryTarget, setGalleryTarget]       = useState(null);

  useEffect(() => {
    fetch("/api/calendar-settings")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        setBgUrl(d.bgImageUrl || "/img/bg-calendar.png");
        setBgUrlMobile(d.bgImageUrlMobile || "/img/bg-calendar-mobile.png");
        setCalendarPosition(d.calendarPosition || "left");
        setTitlePt(d.calendarTitle?.pt || "Calendário de Promoções");
        setTitleEn(d.calendarTitle?.en || "Promotion Calendar");
        setLogoUrl(d.logoUrl || "/img/logo.svg");
        setTheme(d.theme || "default");
        setSeoTitlePt(d.seoMeta?.pt?.title || "");
        setSeoDescPt(d.seoMeta?.pt?.description || "");
      })
      .catch(() => toast.error("Error loading settings."))
      .finally(() => setLoading(false));
  }, []);

  function openGallery(target) {
    setGalleryTarget(target);
    setShowGallery(true);
  }

  function handleGallerySelect(url) {
    if (galleryTarget === "desktop") setBgUrl(url);
    else if (galleryTarget === "mobile") setBgUrlMobile(url);
    else if (galleryTarget === "logo") setLogoUrl(url);
    setShowGallery(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/calendar-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bgImageUrl: bgUrl,
          bgImageUrlMobile: bgUrlMobile,
          calendarPosition,
          calendarTitle: { pt: titlePt, en: titleEn },
          logoUrl,
          theme,
          seoMeta: { pt: { title: seoTitlePt, description: seoDescPt } },
        }),
      });
      if (!res.ok) throw new Error((await res.text().catch(() => "")) || `HTTP ${res.status}`);
      const d = await res.json();
      setBgUrl(d.bgImageUrl || "/img/bg-calendar.png");
      setBgUrlMobile(d.bgImageUrlMobile || "/img/bg-calendar-mobile.png");
      setCalendarPosition(d.calendarPosition || "left");
      setTitlePt(d.calendarTitle?.pt || "Calendário de Promoções");
      setTitleEn(d.calendarTitle?.en || "Promotion Calendar");
      setLogoUrl(d.logoUrl || "/img/logo.svg");
      setTheme(d.theme || "default");
      setSeoTitlePt(d.seoMeta?.pt?.title || "");
      setSeoDescPt(d.seoMeta?.pt?.description || "");
      toast.success("Default settings saved.");
    } catch (e) {
      toast.error(`Error: ${e.message || "Saving failed."}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Default Settings</h1>
        <p className="text-sm text-neutral-500">
          Global defaults applied to all months unless overridden per month in "Settings by Month".
        </p>
      </div>

      {loading ? (
        <div className="p-4 text-sm">Loading…</div>
      ) : (
        <div className="space-y-6">

          {/* ── LOGO ── */}
          <AdminTableCard title="Logo">
            <div className="p-4 space-y-4">
              <p className="text-sm text-neutral-500">Logo displayed in the header bar.</p>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  className="flex-1 min-w-0 border border-[#D0D0D0] rounded px-2.5 py-1.5 text-sm"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="/img/logo.svg"
                />
                <button type="button" onClick={() => openGallery("logo")}
                  className="shrink-0 inline-flex items-center justify-center px-4 py-2.5 rounded bg-[#1F2933] text-white text-xs hover:brightness-110 whitespace-nowrap">
                  Choose from gallery
                </button>
              </div>
              {logoUrl && (
                <div className="mt-1 h-14 flex items-center bg-[#D11101] rounded-lg px-4 max-w-xs">
                  <img src={logoUrl} alt="logo preview" className="h-9 w-auto object-contain" />
                </div>
              )}
            </div>
          </AdminTableCard>

          {/* ── CALENDAR TITLE ── */}
          <AdminTableCard title="Calendar Title">
            <div className="p-4 space-y-4">
              <p className="text-sm text-neutral-500">Main heading shown above the calendar.</p>
              <label className="block">
                <span className="mb-1 inline-block text-sm text-neutral-600">Portuguese (PT)</span>
                <input
                  className="w-full border border-[#D0D0D0] rounded px-2.5 py-2 text-sm"
                  value={titlePt}
                  onChange={(e) => setTitlePt(e.target.value)}
                  placeholder="Calendário de Promoções"
                />
              </label>
              <label className="block">
                <span className="mb-1 inline-block text-sm text-neutral-600">English (EN)</span>
                <input
                  className="w-full border border-[#D0D0D0] rounded px-2.5 py-2 text-sm"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="Promotion Calendar"
                />
              </label>
            </div>
          </AdminTableCard>

          {/* ── MOBILE LAYOUT ── */}
          <AdminTableCard title="Mobile Layout">
            <div className="p-4 space-y-4">
              <p className="text-sm text-neutral-500">Choose how the calendar looks on mobile devices.</p>
              <div className="flex gap-3 flex-wrap">
                {[
                  { value: "default", label: "Default (vertical)" },
                  { value: "default-horizontal", label: "Default (horizontal)" },
                  { value: "football", label: "⚽ Football" },
                ].map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setTheme(opt.value)}
                    className={[
                      "px-5 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors",
                      theme === opt.value
                        ? "border-[#AC1C09] bg-red-50 text-[#AC1C09]"
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400",
                    ].join(" ")}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </AdminTableCard>

          {/* ── CALENDAR POSITION ── */}
          <AdminTableCard title="Calendar Position">
            <div className="p-4 space-y-4">
              <p className="text-sm text-neutral-500">Desktop alignment of the calendar content.</p>
              <div className="flex gap-3 flex-wrap">
                {POSITION_OPTIONS.map((opt) => {
                  const active = calendarPosition === opt.value;
                  return (
                    <button key={opt.value} type="button" onClick={() => setCalendarPosition(opt.value)}
                      className={[
                        "flex flex-col items-center gap-2 px-6 py-4 rounded-lg border-2 text-sm font-medium transition-colors",
                        active
                          ? "border-[#AC1C09] bg-red-50 text-[#AC1C09]"
                          : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400",
                      ].join(" ")}>
                      <span className="flex gap-0.5 items-end h-8" aria-hidden="true">
                        {opt.value === "left" && (
                          <><span className="w-8 h-full bg-current rounded-sm opacity-80" /><span className="w-3 h-5 bg-current rounded-sm opacity-20" /><span className="w-3 h-5 bg-current rounded-sm opacity-20" /></>
                        )}
                        {opt.value === "center" && (
                          <><span className="w-3 h-5 bg-current rounded-sm opacity-20" /><span className="w-8 h-full bg-current rounded-sm opacity-80" /><span className="w-3 h-5 bg-current rounded-sm opacity-20" /></>
                        )}
                        {opt.value === "right" && (
                          <><span className="w-3 h-5 bg-current rounded-sm opacity-20" /><span className="w-3 h-5 bg-current rounded-sm opacity-20" /><span className="w-8 h-full bg-current rounded-sm opacity-80" /></>
                        )}
                      </span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </AdminTableCard>

          {/* ── BACKGROUND IMAGE ── */}
          <AdminTableCard title="Background Image">
            <div className="p-4 space-y-6">
              <p className="text-sm text-neutral-500">Fallback background used on all months unless overridden per month.</p>

              <div>
                <label className="block text-sm text-neutral-800 mb-1">Desktop</label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    className="flex-1 min-w-0 border border-[#D0D0D0] rounded px-2.5 py-1.5 text-sm"
                    value={bgUrl}
                    onChange={(e) => setBgUrl(e.target.value)}
                    placeholder="/img/bg-calendar.png"
                  />
                  <button type="button" onClick={() => openGallery("desktop")}
                    className="shrink-0 inline-flex items-center justify-center px-4 py-2.5 rounded bg-[#1F2933] text-white text-xs hover:brightness-110 whitespace-nowrap">
                    Choose from gallery
                  </button>
                </div>
                <div className="mt-3 border border-neutral-200 rounded-lg overflow-hidden max-w-[600px] aspect-video bg-black/40">
                  {bgUrl
                    ? <img src={bgUrl} alt="desktop bg preview" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">No background set</div>
                  }
                </div>
              </div>

              <div>
                <label className="block text-sm text-neutral-800 mb-1">Mobile</label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    className="flex-1 min-w-0 border border-[#D0D0D0] rounded px-2.5 py-1.5 text-sm"
                    value={bgUrlMobile}
                    onChange={(e) => setBgUrlMobile(e.target.value)}
                    placeholder="/img/bg-calendar-mobile.png"
                  />
                  <button type="button" onClick={() => openGallery("mobile")}
                    className="shrink-0 inline-flex items-center justify-center px-4 py-2.5 rounded bg-[#1F2933] text-white text-xs hover:brightness-110 whitespace-nowrap">
                    Choose from gallery
                  </button>
                </div>
                <div className="mt-3 border border-neutral-200 rounded-lg overflow-hidden w-full max-w-[420px] aspect-9/16 bg-black/40">
                  {bgUrlMobile
                    ? <img src={bgUrlMobile} alt="mobile bg preview" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">No background set</div>
                  }
                </div>
              </div>
            </div>
          </AdminTableCard>

          {/* ── SEO / META ── */}
          <AdminTableCard title="SEO / Meta Tags">
            <div className="p-4 space-y-4">
              <p className="text-sm text-neutral-500">
                Meta title and description used in search engines and social previews (Portuguese).
              </p>
              <label className="block">
                <span className="mb-1 inline-block text-sm text-neutral-600">Meta title (PT)</span>
                <input className="w-full border border-[#D0D0D0] rounded px-2.5 py-2 text-sm"
                  value={seoTitlePt} onChange={(e) => setSeoTitlePt(e.target.value)}
                  placeholder="Calendário de Promoções | Meridianbet Brasil" maxLength={120} />
                <span className="mt-0.5 text-xs text-neutral-400">{seoTitlePt.length}/120</span>
              </label>
              <label className="block">
                <span className="mb-1 inline-block text-sm text-neutral-600">Meta description (PT)</span>
                <textarea className="w-full border border-[#D0D0D0] rounded px-2.5 py-2 text-sm resize-none"
                  rows={3} value={seoDescPt} onChange={(e) => setSeoDescPt(e.target.value)}
                  placeholder="Fique por dentro das ofertas diárias..." maxLength={320} />
                <span className="mt-0.5 text-xs text-neutral-400">{seoDescPt.length}/320</span>
              </label>
            </div>
          </AdminTableCard>

          <button type="button" onClick={handleSave} disabled={saving}
            className="px-[18px] py-[7px] rounded bg-[#17BB00] text-white text-xs font-condensed hover:brightness-110 disabled:opacity-60">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      )}

      {showGallery && (
        <ImageGalleryModal onSelect={handleGallerySelect} onClose={() => setShowGallery(false)} />
      )}
    </>
  );
}
