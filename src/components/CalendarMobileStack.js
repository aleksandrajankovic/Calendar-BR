// src/components/CalendarMobileStack.jsx
"use client";

import { useEffect, useState } from "react";
import { getCategoryGradient } from "@/lib/promoCategoryStyles";
import { rowdies } from "@/app/fonts";

export default function CalendarMobileStack({ adminPreview = false }) {
  const [days, setDays] = useState([]);
  const [lang, setLang] = useState("pt");
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartY, setTouchStartY] = useState(null);

  useEffect(() => {
    const dataEl = document.getElementById("calendar-data");
    if (!dataEl) return;

    try {
      const payload = JSON.parse(dataEl.textContent || "{}");
      const allDays = Array.isArray(payload.days) ? payload.days : [];

      if (payload.lang) setLang(payload.lang);

      const year = payload.year;
      const month = payload.month;

      // 1) dani tekućeg meseca (isti kao za desktop)
      const currentDays = allDays.filter((d) => d && typeof d.day === "number");

      // 2) UVEK poslednja 4 dana PRETHODNOG meseca kao ghost kartice
      let ghostDays = [];
      if (typeof year === "number" && typeof month === "number") {
        // date( year, month, 0 ) = poslednji dan prethodnog meseca
        const prevLastDate = new Date(year, month, 0);
        const prevMonthDays = prevLastDate.getDate(); // npr. 30 ili 31
        const prevMonthIndex = prevLastDate.getMonth(); // 0–11
        const prevYear = prevLastDate.getFullYear();

        const GHOST_COUNT = 4;
        const start = Math.max(1, prevMonthDays - GHOST_COUNT + 1);

        for (let dayNum = start; dayNum <= prevMonthDays; dayNum++) {
          ghostDays.push({
            day: dayNum,
            year: prevYear,
            month: prevMonthIndex,
            hasPromo: false,
            isFutureForUx: false,
            isLocked: true,
            category: "ALL",
            icon: null,
            isGhost: true,
            isToday: false,
          });
        }
      }

      // 3) ghost iz preth. meseca + ceo tekući mesec
      const combinedDays = [...ghostDays, ...currentDays];

      // 4) today → prvi sa promo → prvi dan
      let todayIndex = combinedDays.findIndex((d) => d.isToday);
      if (todayIndex === -1) {
        todayIndex = combinedDays.findIndex((d) => d.hasPromo);
      }
      if (todayIndex === -1) todayIndex = 0;

      setDays(combinedDays);
      setActiveIndex(todayIndex >= 0 ? todayIndex : 0);
    } catch {
      // ignore
    }
  }, []);

  const goPrev = () => {
    setActiveIndex((idx) => (idx > 0 ? idx - 1 : idx));
  };

  const goNext = () => {
    setActiveIndex((idx) => (idx < days.length - 1 ? idx + 1 : idx));
  };

  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    if (touchStartY == null) return;
    const delta = e.changedTouches[0].clientY - touchStartY;

    if (delta > 40) goPrev();
    else if (delta < -40) goNext();

    setTouchStartY(null);
  };

  if (!days.length) return null;

  const MAX_OFFSET = 4;
  const CARD_HEIGHT = 140;
  const CARD_GAP = 58;
  const STACK_HEIGHT = 560;
  const ACTIVE_Y = STACK_HEIGHT / 2 - CARD_HEIGHT / 2;

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className="relative w-full max-w-[380px] overflow-hidden touch-none"
        style={{ height: STACK_HEIGHT }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {days.map((day, index) => {
          const offset = index - activeIndex;
          if (Math.abs(offset) > MAX_OFFSET) return null;

          const locked = day.isLocked && !adminPreview;
          const category = day.category || "ALL";
          const isGhost = Boolean(day.isGhost);
          const gradientClass = locked
            ? "bg-black"
            : getCategoryGradient(category);

          const isTodayActive = day.isToday && !isGhost;

          const translateY = ACTIVE_Y + offset * CARD_GAP;
          const scale =
            offset === 0
              ? 1
              : 1 - Math.min(Math.abs(offset), MAX_OFFSET) * 0.06;
          const zIndex = MAX_OFFSET - Math.abs(offset);
          const opacity = offset === 0 ? 1 : 0.9;

          return (
            <button
              key={`mobile-${index}-${day.day}`}
              data-day-button
              data-day={day.day}
              disabled={locked || isGhost}
              onClick={() => !isGhost && setActiveIndex(index)}
              className={`
                absolute top-0 left-1/2
                w-[92%] h-[140px]
                rounded-[18px]
                overflow-hidden
                ${
                  isTodayActive
                    ? "border-2 border-[#FACC01] shadow-[0_0_20px_rgba(250,204,1,0.9)]"
                    : "border"
                }
                ${
                  isGhost
                    ? "bg-[#000000D9] border-white/20 shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
                    : gradientClass
                }
                shadow-[0_18px_40px_rgba(0,0,0,0.7)]
                transition duration-300
                ${
                  locked || isGhost
                    ? "cursor-default"
                    : "cursor-pointer active:scale-[0.98]"
                }
              `}
              style={{
                transform: `translate(-50%, ${translateY}px) scale(${scale})`,
                zIndex,
                opacity,
              }}
            >
              <span
                className={`
                  ${rowdies.className}
                  absolute left-4 top-3
                  z-10 text-[64px] leading-[65px]
                  font-bold
                  bg-gradient-to-b from-white to-white/80
                  bg-clip-text text-transparent
                `}
              >
                {day.day.toString().padStart(2, "0")}
              </span>

              {!isGhost &&
                (!locked && day.hasPromo && day.icon ? (
                  <img
                    src={day.icon}
                    alt="promo icon"
                    className="absolute right-0 inset-y-0 h-full w-[50%] object-cover object-center"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-black/35">
                      <img
                        src="./img/lock.png"
                        alt="default promo icon"
                        className="w-10 h-10 object-contain"
                        loading="lazy"
                      />
                    </div>
                  </div>
                ))}

              {!isGhost && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-black/0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
