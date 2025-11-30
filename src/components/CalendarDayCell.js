// src/components/CalendarDayCell.js
import { rowdies } from "@/app/fonts";
import {
  getCategoryGradient,
  getCategoryLabel,
} from "@/lib/promoCategoryStyles";

const dayNumberClass = `
  ${rowdies.className}
  absolute left-2 top-2
  z-10
  text-[20px] md:text-[22px] lg:text-[25px]
  leading-[25px]
  bg-gradient-to-b from-white to-white/80
  bg-clip-text text-transparent
  antialiased
`;

export default function CalendarDayCell({ cell, lang, adminPreview }) {
  const locked = cell.isLocked && !adminPreview;

  const category = cell.category || "ALL";
  const categoryLabel = getCategoryLabel(category);

  const gradientClass = locked ? "bg-black" : getCategoryGradient(category);

  return (
    <div className="relative h-full w-full rounded-[12px]">
      {/* overlay za today – ide na spoljašnji wrapper */}
      {cell.isToday && (
        <span className="pointer-events-none absolute -inset-px z-20 rounded-[12px] ring-1 ring-[#FACC01] shadow-[0_0_15px_rgba(250,204,1,0.9)]" />
      )}

      <button
        data-day-button
        data-day={cell.day}
        disabled={locked}
        className={`relative w-full h-full rounded-[12px] overflow-hidden border 
          ${gradientClass}
          transition
          ${
            locked
              ? "opacity-70 cursor-not-allowed"
              : "cursor-pointer hover:scale-[1.02]"
          }
          ${adminPreview && cell.isFutureForUx ? "opacity-90" : ""}
        `}
        aria-label={
          cell.hasPromo
            ? `Day ${cell.day} – ${categoryLabel}`
            : `Day ${cell.day}`
        }
        title={
          !adminPreview && cell.isFutureForUx
            ? lang === "pt"
              ? "Promoção desbloqueia neste dia"
              : "Promotion unlocks on this day"
            : ""
        }
        style={
          adminPreview && cell.isFutureForUx
            ? { pointerEvents: "auto", cursor: "pointer" }
            : undefined
        }
      >
        {/* broj dana */}
        <span className={dayNumberClass}>
          {cell.day.toString().padStart(2, "0")}
        </span>

        {/* ikonica / lock */}
        {!locked && cell.hasPromo && cell.icon ? (
          <img
            src={cell.icon}
            alt="promo icon"
            className=" absolute right-0 inset-y-0
              h-full w-[90%]
              object-contain object-right"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-black/35">
              <img
                src="./img/lock.png"
                alt="default promo icon"
                className="w-5 h-5 object-contain"
                loading="lazy"
              />
            </div>
          </div>
        )}
      </button>
    </div>
  );
}
