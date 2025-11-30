// src/components/LangSwitcher.js
"use client";

import { useState, useRef, useEffect } from "react";

const LANG_META = {
  pt: {
    flag: "/img/ca.svg",      
    alt: "Portuguese (Brasil)",
    label: "PT",
  },
  en: {
    flag: "/img/en.svg",
    alt: "English",
    label: "EN",
  },
};

export default function LangSwitcher({ year, month, lang, allowedLangs }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const activeMeta = LANG_META[lang] ?? LANG_META.pt;
  const buildHref = (lng) => `/?y=${year}&m=${month}&lang=${lng}`;

  // zatvori dropdown na klik van
  useEffect(() => {
    function handleClick(e) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="block relative z-30">
      {/* GORNJE DUGME – aktivna zastavica */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`
          flex items-center justify-center
          w-[38px] h-[38px]
          bg-[#284755]/50
          border border-[#396F85]/40
          shadow-[0_8px_24px_rgba(0,0,0,0.6)]
          backdrop-blur-sm
          hover:bg-[#284755]/70
          transition
          ${open ? "rounded-t-[6px] rounded-b-none" : "rounded-[6px]"}
        `}
        aria-label="Change language"
      >
        <img
          src={activeMeta.flag}
          alt={activeMeta.alt}
          className="w-[22px] h-[22px] rounded-[4px] object-cover"
        />
      </button>

      {/* DROPDOWN – stub sa zastavicama, lepi se ispod dugmeta */}
      {open && (
        <div
          className="
            absolute right-0 top-full
            mt-0
            flex flex-col
            bg-[#284755]/50
            rounded-b-[6px]
            px-0 py-0
            shadow-[0_8px_24px_rgba(0,0,0,0.7)]
            backdrop-blur-sm
          "
        >
          {allowedLangs.map((lng) => {
            const meta = LANG_META[lng];
            if (!meta) return null;
            const isActive = lng === lang;

            return (
              <a
                key={lng}
                href={buildHref(lng)}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center justify-center
                  w-[38px] h-[38px]
                  transition
                  ${isActive ? "bg-[#346275]" : "hover:bg-[#346275]"}
                `}
              >
                <img
                  src={meta.flag}
                  alt={meta.alt}
                  className="w-[22px] h-[22px] rounded-[4px] object-cover"
                />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
