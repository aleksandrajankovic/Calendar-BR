"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import AdminTableCard from "../../components/AdminTableCard";
import ImageGalleryModal from "../../components/ImageGalleryModal";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const POSITION_OPTIONS = [
  { value: "left",   label: "Left" },
  { value: "center", label: "Center" },
  { value: "right",  label: "Right" },
];

export default function MonthlySettingsPage() {
  const now = new Date();
  const [monthBackgrounds, setMonthBackgrounds] = useState({});
  const [selYear, setSelYear]   = useState(now.getFullYear());
  const [selMonth, setSelMonth] = useState(now.getMonth());
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryField, setGalleryField] = useState(null);

  useEffect(() => {
    fetch("/api/calendar-settings")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setMonthBackgrounds(d.monthBackgrounds || {}))
      .catch(() => toast.error("Error loading settings."))
      .finally(() => setLoading(false));
  }, []);

  const currentKey = `${selYear}-${selMonth}`;
  const currentBg  = monthBackgrounds[currentKey] || {};

  function setField(field, value) {
    setMonthBackgrounds((prev) => ({
      ...prev,
      [currentKey]: { ...prev[currentKey], [field]: value },
    }));
  }

  function clearCurrent() {
    setMonthBackgrounds((prev) => {
      const next = { ...prev };
      delete next[currentKey];
      return next;
    });
  }

  function clearKey(key) {
    setMonthBackgrounds((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/calendar-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthBackgrounds }),
      });
      if (!res.ok) throw new Error((await res.text().catch(() => "")) || `HTTP ${res.status}`);
      const d = await res.json();
      setMonthBackgrounds(d.monthBackgrounds || {});
      toast.success("Monthly settings saved.");
    } catch (e) {
      toast.error(`Error: ${e.message || "Saving failed."}`);
    } finally {
      setSaving(false);
    }
  }

  const configuredKeys = useMemo(
    () => Object.keys(monthBackgrounds).filter((k) => {
      const v = monthBackgrounds[k];
      return v?.desktop || v?.mobile || v?.position || v?.titlePt || v?.titleEn || v?.inactive || v?.theme;
    }),
    [monthBackgrounds]
  );

  return (
    <>
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Settings by Month</h1>
        <p className="text-sm text-neutral-500">
          Override background, title, position, and layout for a specific month.
        </p>
      </div>

      {loading ? (
        <div className="p-4 text-sm">Loading…</div>
      ) : (
        <div className="space-y-6">
          <AdminTableCard title="Settings by Month">
            <div className="p-4 space-y-5">

              {/* Month + year selector */}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  className="border border-[#D0D0D0] rounded px-2.5 py-1.5 text-sm"
                  value={selMonth}
                  onChange={(e) => setSelMonth(Number(e.target.value))}
                >
                  {MONTH_NAMES.map((name, i) => (
                    <option key={i} value={i}>{name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  className="w-24 border border-[#D0D0D0] rounded px-2.5 py-1.5 text-sm"
                  value={selYear}
                  min={2024}
                  max={now.getFullYear() + 2}
                  onChange={(e) => setSelYear(Number(e.target.value))}
                />
                {monthBackgrounds[currentKey] && (
                  <button type="button" onClick={clearCurrent}
                    className="text-xs text-red-500 hover:text-red-700 underline">
                    Clear all overrides for this month
                  </button>
                )}
              </div>

              <p className="text-xs text-neutral-500 -mt-2">
                Editing: <strong>{MONTH_NAMES[selMonth]} {selYear}</strong>
                {!monthBackgrounds[currentKey] && " — no overrides set, uses global defaults"}
              </p>

              {/* ── DEACTIVATE MONTH ── */}
              <div className="pt-3 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Deactivate month</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Hidden from all users. Admin preview still works.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setField("inactive", currentBg.inactive ? null : true)}
                    className={["relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                      currentBg.inactive ? "bg-red-600" : "bg-neutral-300"].join(" ")}
                    role="switch" aria-checked={!!currentBg.inactive}
                  >
                    <span className={["pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-200",
                      currentBg.inactive ? "translate-x-5" : "translate-x-0"].join(" ")} />
                  </button>
                </div>
              </div>

              {/* ── THEME PER MONTH ── */}
              <div className="pt-3 border-t border-neutral-100">
                <label className="block text-sm font-medium text-neutral-800 mb-2">
                  Mobile layout (override)
                </label>
                <div className="flex gap-2 flex-wrap">
                  <button type="button" onClick={() => setField("theme", null)}
                    className={["px-3 py-2 rounded border text-xs transition-colors",
                      !currentBg.theme
                        ? "border-[#AC1C09] bg-red-50 text-[#AC1C09]"
                        : "border-neutral-200 text-neutral-500 hover:border-neutral-400"].join(" ")}>
                    Use global default
                  </button>
                  {[
                    { value: "default", label: "Default (vertical)" },
                    { value: "default-horizontal", label: "Default (horizontal)" },
                    { value: "football", label: "⚽ Football" },
                  ].map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setField("theme", opt.value)}
                      className={["px-4 py-2 rounded border-2 text-xs font-medium transition-colors",
                        currentBg.theme === opt.value
                          ? "border-[#AC1C09] bg-red-50 text-[#AC1C09]"
                          : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"].join(" ")}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── TITLE PER MONTH ── */}
              <div className="pt-3 border-t border-neutral-100">
                <label className="block text-sm font-medium text-neutral-800 mb-3">
                  Calendar title (override)
                </label>
                <div className="space-y-2">
                  <div>
                    <span className="mb-1 inline-block text-xs text-neutral-500">Portuguese (PT)</span>
                    <input
                      className="w-full border border-[#D0D0D0] rounded px-2.5 py-1.5 text-sm"
                      value={currentBg.titlePt || ""}
                      onChange={(e) => setField("titlePt", e.target.value)}
                      placeholder="Leave empty to use global title"
                    />
                  </div>
                  <div>
                    <span className="mb-1 inline-block text-xs text-neutral-500">English (EN)</span>
                    <input
                      className="w-full border border-[#D0D0D0] rounded px-2.5 py-1.5 text-sm"
                      value={currentBg.titleEn || ""}
                      onChange={(e) => setField("titleEn", e.target.value)}
                      placeholder="Leave empty to use global title"
                    />
                  </div>
                </div>
              </div>

              {/* ── POSITION PER MONTH ── */}
              <div className="pt-3 border-t border-neutral-100">
                <label className="block text-sm font-medium text-neutral-800 mb-2">
                  Calendar position (override)
                </label>
                <div className="flex gap-2 flex-wrap">
                  <button type="button" onClick={() => setField("position", null)}
                    className={["px-3 py-2 rounded border text-xs transition-colors",
                      !currentBg.position
                        ? "border-[#AC1C09] bg-red-50 text-[#AC1C09]"
                        : "border-neutral-200 text-neutral-500 hover:border-neutral-400"].join(" ")}>
                    Use global default
                  </button>
                  {POSITION_OPTIONS.map((opt) => {
                    const active = currentBg.position === opt.value;
                    return (
                      <button key={opt.value} type="button" onClick={() => setField("position", opt.value)}
                        className={["flex flex-col items-center gap-1.5 px-4 py-2.5 rounded border-2 text-xs font-medium transition-colors",
                          active ? "border-[#AC1C09] bg-red-50 text-[#AC1C09]" : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"].join(" ")}>
                        <span className="flex gap-0.5 items-end h-6" aria-hidden="true">
                          {opt.value === "left" && (<><span className="w-6 h-full bg-current rounded-sm opacity-80" /><span className="w-2 h-4 bg-current rounded-sm opacity-20" /><span className="w-2 h-4 bg-current rounded-sm opacity-20" /></>)}
                          {opt.value === "center" && (<><span className="w-2 h-4 bg-current rounded-sm opacity-20" /><span className="w-6 h-full bg-current rounded-sm opacity-80" /><span className="w-2 h-4 bg-current rounded-sm opacity-20" /></>)}
                          {opt.value === "right" && (<><span className="w-2 h-4 bg-current rounded-sm opacity-20" /><span className="w-2 h-4 bg-current rounded-sm opacity-20" /><span className="w-6 h-full bg-current rounded-sm opacity-80" /></>)}
                        </span>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── DESKTOP BG ── */}
              <div className="pt-3 border-t border-neutral-100">
                <label className="block text-sm font-medium text-neutral-800 mb-1">Desktop background (override)</label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    className="flex-1 min-w-0 border border-[#D0D0D0] rounded px-2.5 py-1.5 text-sm"
                    value={currentBg.desktop || ""}
                    onChange={(e) => setField("desktop", e.target.value)}
                    placeholder="Leave empty to use default"
                  />
                  <button type="button" onClick={() => { setGalleryField("desktop"); setShowGallery(true); }}
                    className="shrink-0 inline-flex items-center justify-center px-4 py-2.5 rounded bg-[#1F2933] text-white text-xs hover:brightness-110 whitespace-nowrap">
                    Choose from gallery
                  </button>
                </div>
                <div className="mt-3 border border-neutral-200 rounded-lg overflow-hidden max-w-[600px] aspect-video bg-black/40">
                  {currentBg.desktop
                    ? <img src={currentBg.desktop} alt="month desktop bg preview" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">Uses default</div>
                  }
                </div>
              </div>

              {/* ── MOBILE BG ── */}
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1">Mobile background (override)</label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    className="flex-1 min-w-0 border border-[#D0D0D0] rounded px-2.5 py-1.5 text-sm"
                    value={currentBg.mobile || ""}
                    onChange={(e) => setField("mobile", e.target.value)}
                    placeholder="Leave empty to use default"
                  />
                  <button type="button" onClick={() => { setGalleryField("mobile"); setShowGallery(true); }}
                    className="shrink-0 inline-flex items-center justify-center px-4 py-2.5 rounded bg-[#1F2933] text-white text-xs hover:brightness-110 whitespace-nowrap">
                    Choose from gallery
                  </button>
                </div>
                <div className="mt-3 border border-neutral-200 rounded-lg overflow-hidden w-full max-w-[420px] aspect-9/16 bg-black/40">
                  {currentBg.mobile
                    ? <img src={currentBg.mobile} alt="month mobile bg preview" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">Uses default</div>
                  }
                </div>
              </div>

              {/* ── CONFIGURED OVERRIDES SUMMARY ── */}
              {configuredKeys.length > 0 && (
                <div className="pt-4 border-t border-neutral-200">
                  <p className="text-xs font-semibold text-neutral-600 mb-2 uppercase tracking-wide">Configured overrides</p>
                  <ul className="space-y-1">
                    {configuredKeys.map((k) => {
                      const [ky, km] = k.split("-").map(Number);
                      const bg = monthBackgrounds[k];
                      const tags = [
                        bg.inactive && "⚠ deactivated",
                        bg.theme === "default-horizontal" && "↔ horizontal",
                        bg.theme === "default" && "↕ vertical",
                        bg.titlePt && "title",
                        bg.position && `position: ${bg.position}`,
                        bg.desktop  && "desktop bg",
                        bg.mobile   && "mobile bg",
                      ].filter(Boolean).join(", ");
                      return (
                        <li key={k} className="flex items-center gap-3 text-xs text-neutral-700">
                          <button type="button" onClick={() => { setSelYear(ky); setSelMonth(km); }}
                            className="underline hover:text-black">
                            {MONTH_NAMES[km]} {ky}
                          </button>
                          <span className="text-neutral-400">{tags}</span>
                          <button type="button" onClick={() => clearKey(k)}
                            className="text-red-400 hover:text-red-600" aria-label="Remove overrides">✕</button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </AdminTableCard>

          <button type="button" onClick={handleSave} disabled={saving}
            className="px-[18px] py-[7px] rounded bg-[#17BB00] text-white text-xs font-condensed hover:brightness-110 disabled:opacity-60">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      )}

      {showGallery && (
        <ImageGalleryModal
          onSelect={(url) => { setField(galleryField, url); setShowGallery(false); }}
          onClose={() => setShowGallery(false)}
        />
      )}
    </>
  );
}
