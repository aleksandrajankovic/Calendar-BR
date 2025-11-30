"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import RichEditor from "@/components/RichEditor";
import ImageGalleryModal from "../../components/ImageGalleryModal";

const LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// jezici za tabove
const LANGS = [
  { code: "pt", label: "Portuguese" },
  { code: "en", label: "English" },
];

// kategorije za promo
const CATEGORIES = [
  { value: "SPORT", label: "Sport" },
  { value: "CASINO", label: "Casino" },
  { value: "MISSIONS", label: "Missions" },
  { value: "ALL", label: "All" },
];

export default function WeeklyEditor({ initial, onCancel, onSave }) {
  const seed = useMemo(() => {
    const baseTranslations = initial?.translations || {};
    const mainLang = LANGS[0].code; // "pt"

    if (!baseTranslations[mainLang]) {
      baseTranslations[mainLang] = {
        title: initial?.title ?? "",
        button: initial?.button ?? "",
        link: initial?.link ?? "",
        rich: initial?.rich ?? null,
        richHtml: initial?.richHtml ?? "",
      };
    }

    return {
      ...initial,
      translations: baseTranslations,
      buttonColor: initial?.buttonColor || "green",
      category: initial?.category || "ALL",
    };
  }, [initial]);

  const [form, setForm] = useState(seed);
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState(LANGS[0].code);
  const [showIconGallery, setShowIconGallery] = useState(false);

  useEffect(() => {
    setForm(seed);
  }, [seed]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setTranslationField(lang, key, value) {
    setForm((prev) => {
      const prevTranslations = prev.translations || {};
      const prevLangObj = prevTranslations[lang] || {};
      return {
        ...prev,
        translations: {
          ...prevTranslations,
          [lang]: {
            ...prevLangObj,
            [key]: value,
          },
        },
      };
    });
  }

  function handlePreviewCalendar() {
    const y = form.year || new Date().getFullYear();
    const m =
      typeof form.month === "number" ? form.month : new Date().getMonth();

    const url = `/?y=${y}&m=${m}`;
    window.open(url, "_blank", "noopener,noreferrer"); // novi tab
  }

  async function save() {
    const currentT = form.translations?.[activeLang] || {};

    if (!currentT.title?.trim()) {
      toast.error("Title is required for active language.");
      return;
    }

    if (!currentT.richHtml?.trim()) {
      toast.error("Description is required for active language.");
      return;
    }

    setSaving(true);
    try {
      const translations = form.translations || {};
      const mainT = translations[activeLang] || {};
      const mainLink = mainT.link || form.link || "";

      await onSave({
        weekday: form.weekday,

        // lokalizovani sadržaj (defaultLang = aktivni tab)
        translations,
        defaultLang: activeLang,

        title: mainT.title || "",
        button: mainT.button || "",
        link: mainLink,
        rich: mainT.rich || null,
        richHtml: mainT.richHtml || "",

        subtitle: form.subtitle ?? "",
        image: form.image ?? "",
        icon: form.icon ?? "",
        active: !!form.active,
        buttonColor: form.buttonColor ?? "green",

        category: form.category || "ALL",
      });

      toast.success("Saved.");
    } catch (e) {
      toast.error(`Error: ${e.message || "Saving failed."}`);
    } finally {
      setSaving(false);
    }
  }

  const dayLabel = LABELS[form.weekday] || "";
  const currentT = form.translations?.[activeLang] || {};

  return (
    <>
      {/* Top bar: Back + Edit + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-[#AC1C09] hover:underline"
          >
            ← Back
          </button>
          <div className="text-sm text-neutral-600">Edit:</div>
          <div className="text-base font-semibold text-neutral-900">
            {dayLabel}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-[18px] py-[7px] rounded bg-[#C43D2F] font-condensed text-white text-xs hover:brightness-110"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="px-[18px] py-[7px] rounded bg-[#17BB00] text-white text-xs font-condensed hover:brightness-110 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="mt-6 bg-white border border-neutral-200 rounded-lg shadow-sm p-4 md:p-5 space-y-4">
        {/* Language tabs + Active + Preview calendar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {LANGS.map((lng) => (
              <button
                key={lng.code}
                type="button"
                onClick={() => setActiveLang(lng.code)}
                className={`px-3 py-1.5 text-xs border-b-2 ${
                  activeLang === lng.code
                    ? "border-[#AC1C09] text-[#AC1C09] font-semibold"
                    : "border-transparent text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {lng.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Active toggle */}
          <label className="flex items-center gap-2 text-sm text-neutral-800">
            <button
              type="button"
              onClick={() => setField("active", !form.active)}
              className={`h-5 w-5 rounded-sm border flex items-center justify-center ${
                form.active
                  ? "bg-[#17BB00] border-[#17BB00]"
                  : "bg-white border-neutral-400"
              }`}
            >
              {form.active && (
                <span className="text-white text-xs leading-none">
                  <svg
                    width="13"
                    height="10"
                    viewBox="0 0 13 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.2667 1L4.20833 8.05833L1 4.85"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </button>
            <span className="text-[#989898] text-xs">Active</span>
          </label>

          {/* Preview calendar button */}
          <button
            type="button"
            onClick={handlePreviewCalendar}
            className="px-[18px] py-[7px] rounded bg-[#17BB00] text-white text-xs font-condensed hover:brightness-110"
          >
            Preview calendar
          </button>
        </div>

        {/* Form fields */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Title (po jeziku) */}
          <label className="block text-sm text-neutral-800">
            <span className="mb-1 inline-block">
              Title ({activeLang.toUpperCase()})
            </span>
            <input
              className="w-full border border-[#D0D0D0] rounded px-2.5 py-1.5 text-sm"
              value={currentT.title || ""}
              onChange={(e) =>
                setTranslationField(activeLang, "title", e.target.value)
              }
            />
          </label>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {/* Button label (po jeziku) */}
          <label className="block text-sm text-neutral-800 flex-1 min-w-[180px]">
            <span className="mb-1 inline-block">
              Button label ({activeLang.toUpperCase()})
            </span>
            <input
              className="w-full border border-[#D0D0D0] rounded px-2.5 py-1.5 text-sm"
              value={currentT.button || ""}
              onChange={(e) =>
                setTranslationField(activeLang, "button", e.target.value)
              }
            />
          </label>

          {/* Button link (po jeziku) */}
          <label className="block text-sm text-neutral-800 flex-1 min-w-[180px]">
            <span className="mb-1 inline-block">
              Button link ({activeLang.toUpperCase()})
            </span>
            <input
              className="w-full border border-[#D0D0D0] rounded px-2.5 py-1.5 text-sm"
              value={currentT.link || ""}
              onChange={(e) =>
                setTranslationField(activeLang, "link", e.target.value)
              }
              placeholder="https://..."
            />
          </label>

          {/* Button Color (fiksna širina) */}
          <div className="flex flex-col items-start w-32 shrink-0">
            <span className="mb-1 inline-block text-sm text-neutral-800">
              Button Color
            </span>
            <div className="flex items-center gap-3">
              {/* Žuta */}
              <button
                type="button"
                onClick={() => setField("buttonColor", "yellow")}
                className={`h-7 w-7 rounded-full flex items-center justify-center border transition ${
                  form.buttonColor === "yellow"
                    ? "border-black"
                    : "border-transparent"
                }`}
              >
                <span className="h-6 w-6 rounded-full bg-[#FFCB05] flex items-center justify-center">
                  {form.buttonColor === "yellow" && (
                    <span className="text-black text-[10px] leading-none">
                      ✓
                    </span>
                  )}
                </span>
              </button>

              {/* Zelena */}
              <button
                type="button"
                onClick={() => setField("buttonColor", "green")}
                className={`h-7 w-7 rounded-full flex items-center justify-center border transition ${
                  form.buttonColor === "green"
                    ? "border-black"
                    : "border-transparent"
                }`}
              >
                <span className="h-6 w-6 rounded-full bg-[#31A62E] flex items-center justify-center">
                  {form.buttonColor === "green" && (
                    <span className="text-white text-[10px] leading-none">
                      ✓
                    </span>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Category selector */}
        <div className="mt-2">
          <span className="mb-1 inline-block text-sm text-neutral-800">
            Category
          </span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const selected = form.category === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setField("category", cat.value)}
                  className={
                    "px-3 py-1 rounded-full text-[11px] font-medium border transition " +
                    (selected
                      ? "bg-[#17BB00] text-white border-[#17BB00]"
                      : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100")
                  }
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Icon URL + Choose file u jednom redu */}
        <div className="mt-3">
          <label className="block text-sm text-neutral-800">
            <span className="mb-1 inline-block">Icon</span>

            <div className="flex flex-wrap items-center gap-3">
              {/* Ručni unos / URL */}
              <input
                className="flex-1 min-w-0 border border-[#D0D0D0] rounded px-2.5 py-1.5 text-sm"
                value={form.icon || ""}
                onChange={(e) => setField("icon", e.target.value)}
                placeholder="/uploads/promo-icon.webp"
              />

              {/* Dugme za galeriju */}
              <button
                type="button"
                onClick={() => setShowIconGallery(true)}
                className="shrink-0 font-condensed inline-flex items-center justify-center px-4 py-[10px] rounded bg-[#1F2933] text-white text-xs hover:brightness-110 whitespace-nowrap"
              >
                Choose from gallery
              </button>
            </div>

            {form.icon && (
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={form.icon}
                  alt="icon preview"
                  className="w-8 h-8 object-contain border border-neutral-200 rounded bg-white"
                />
                <code className="text-xs text-neutral-500 break-all">
                  {form.icon}
                </code>
              </div>
            )}
          </label>
        </div>

        {/* Gallery modal */}
        {showIconGallery && (
          <ImageGalleryModal
            onSelect={(url) => {
              setField("icon", url);
              setShowIconGallery(false);
            }}
            onClose={() => setShowIconGallery(false)}
          />
        )}

        {/* Rich text editor */}
        <div className="mt-2">
          <span className="text-sm text-neutral-800 block mb-1.5">
            Description ({activeLang.toUpperCase()})
          </span>
          <div className="border border-[#D0D0D0] rounded">
            <RichEditor
              key={activeLang} // remount kad promeniš jezik
              initialJSON={currentT.rich ?? null}
              placeholder="Upiši sadržaj za ovu nedeljnu promociju…"
              onChange={({ json, html }) => {
                setTranslationField(activeLang, "rich", json);
                setTranslationField(activeLang, "richHtml", html);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
