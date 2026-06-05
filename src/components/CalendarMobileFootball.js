// src/components/CalendarMobileFootball.js
"use client";

import { useEffect, useRef, useState } from "react";
import { russoOne } from "@/app/fonts";
import MonthPagination from "@/components/MonthPagination";

const NUM_DOTS = 7;

export default function CalendarMobileFootball({
  adminPreview = false,
  year,
  month,
  prevMonth = null,
  nextMonth = null,
  lang = "pt",
}) {
  const [days, setDays] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [swipeHintPhase, setSwipeHintPhase] = useState("visible"); // visible | fading | hidden
  const [activeDot, setActiveDot] = useState(0);
  const chipRefs = useRef([]);
  const stripRef = useRef(null);
  const hideHintListenerRef = useRef(null);
  const isTouchingStripRef = useRef(false);
  const lastSwipeVibrateAtRef = useRef(0);
  const ballTouchRef = useRef({ startX: 0, startY: 0 });
  const ballSwipedRef = useRef(false);

  useEffect(() => {
    const dataEl = document.getElementById("calendar-data");
    if (!dataEl) return;

    try {
      const payload = JSON.parse(dataEl.textContent || "{}");
      const allDays = Array.isArray(payload.days) ? payload.days : [];
      const currentDays = allDays.filter((d) => d && typeof d.day === "number");

      let todayIndex = currentDays.findIndex((d) => d.isToday);
      if (todayIndex === -1) todayIndex = currentDays.findIndex((d) => d.hasPromo);
      if (todayIndex === -1) todayIndex = 0;

      setDays(currentDays);
      setSelectedIndex(todayIndex >= 0 ? todayIndex : 0);
    } catch {
      // ignore
    }
  }, [year, month]);

  // Auto-scroll chip into view when selectedIndex changes
  useEffect(() => {
    if (!days.length) return;
    const chip = chipRefs.current[selectedIndex];
    if (chip && stripRef.current) {
      chip.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selectedIndex, days.length]);

  // Scroll listeners: dots tracking + swipe hint hide
  useEffect(() => {
    if (!days.length) return;
    const strip = stripRef.current;
    if (!strip) return;

    const updateDots = () => {
      const { scrollLeft, scrollWidth, clientWidth } = strip;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setActiveDot(Math.round((scrollLeft / maxScroll) * (NUM_DOTS - 1)));
      }

      if (isTouchingStripRef.current && navigator?.vibrate) {
        const now = Date.now();
        if (now - lastSwipeVibrateAtRef.current > 180) {
          navigator.vibrate(8);
          lastSwipeVibrateAtRef.current = now;
        }
      }
    };
    strip.addEventListener("scroll", updateDots, { passive: true });

    const hideHint = () => {
      setSwipeHintPhase("fading");
      setTimeout(() => setSwipeHintPhase("hidden"), 500);
    };
    hideHintListenerRef.current = hideHint;
    const timer = setTimeout(() => {
      strip.addEventListener("scroll", hideHint, { once: true, passive: true });
    }, 400);

    return () => {
      clearTimeout(timer);
      strip.removeEventListener("scroll", updateDots);
      if (hideHintListenerRef.current) {
        strip.removeEventListener("scroll", hideHintListenerRef.current);
      }
    };
  }, [days.length]);

  if (!days.length) return null;

  const selectedDay = days[selectedIndex];
  const locked = selectedDay?.isLocked && !adminPreview;
  const isToday = selectedDay?.isToday;
  const isGold = selectedDay?.category === "GOLD";

  const ballRing = isGold
    ? "border-2 border-[#f8d97a]"
    : isToday
    ? "ring-4 ring-[#FACC01] shadow-[0_0_40px_rgba(250,204,1,0.8)]"
    : "ring-1 ring-white/15";

  return (
    <div className="w-full flex flex-col items-center justify-start pt-3 pb-8 gap-5 [--football-ball-size:min(72vw,320px)] [@media(min-height:800px)]:gap-6 [@media(min-height:800px)]:[--football-ball-size:min(68vw,292px)]">

      {/* ── DATE CHIP STRIP ── */}
      <div className="w-full flex flex-col">
        <div className="relative w-full h-[70px] overflow-hidden" style={{ contain: "layout paint" }}>
          <div
            ref={stripRef}
            className="w-full h-full overflow-x-auto overflow-y-hidden no-scrollbar px-4 touch-pan-x overscroll-x-contain overscroll-y-none"
            onTouchStart={() => { isTouchingStripRef.current = true; }}
            onTouchEnd={() => { isTouchingStripRef.current = false; }}
            onTouchCancel={() => { isTouchingStripRef.current = false; }}
            style={{
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
              transform: "translateZ(0)",
            }}
          >
            <div className="flex h-full items-center gap-2.5 w-max">
              {days.map((day, index) => {
                const isActive = index === selectedIndex;
                const isDayToday = day.isToday;
                const isDayPromo = day.hasPromo;

                return (
                  <button
                    key={`chip-${day.day}`}
                    ref={(el) => (chipRefs.current[index] = el)}
                    onClick={() => { navigator?.vibrate?.(20); setSelectedIndex(index); }}
                    className={`
                      relative flex items-center justify-center
                      h-14 w-11 shrink-0
                      transition duration-200
                      ${isActive ? "scale-110" : "scale-100 opacity-55 hover:opacity-80"}
                    `}
                    aria-label={`Dia ${day.day}`}
                  >
                    <span
                      className={`
                        absolute inset-0 rounded-sm
                        ${isActive ? (isDayToday ? "bg-[#FFD700]" : "bg-white") : "bg-transparent"}
                      `}
                      style={{
                        transform: "skewX(-12deg)",
                        border: isActive
                          ? "1.5px solid rgba(255,215,0,0.55)"
                          : "1.5px solid rgba(255,255,255,0.34)",
                        boxShadow: isActive
                          ? "0 0 16px rgba(255,215,0,0.28)"
                          : "inset 1px 1px 0 rgba(255,255,255,0.22), inset -1px -1px 0 rgba(80,120,170,0.16), 0 0 10px rgba(120,170,255,0.1), 0 8px 18px rgba(0,0,0,0.22)",
                        backgroundImage: isActive
                          ? "linear-gradient(135deg, rgba(255,255,255,0.22), transparent 42%)"
                          : "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.025) 35%, transparent 64%)",
                        backdropFilter: isActive ? "none" : "blur(1px)",
                      }}
                    />

                    {isDayToday && (
                      <span
                        className="absolute top-1 right-1 z-20 rounded-full"
                        style={{ width: 4, height: 4, background: "#FFD700" }}
                      />
                    )}

                    {isDayPromo && (
                      <span
                        className="absolute bottom-1 left-1/2 z-20"
                        style={{ transform: "translateX(-50%)" }}
                      >
                        <span
                          className="block rounded-full promo-dot-pulse"
                          style={{ width: 5, height: 5, background: "#4CAF50" }}
                        />
                      </span>
                    )}

                    <span
                      className={`
                        relative z-10
                        ${russoOne.className}
                        text-[18px] leading-none italic font-bold
                        ${isActive ? "text-black" : "text-white"}
                      `}
                    >
                      {day.day}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dots row */}
        <div className="flex justify-center items-center gap-1.5 mt-2.5 px-4">
          <svg
            className="nudge-left shrink-0"
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{
              opacity: swipeHintPhase === "hidden" ? 0 : swipeHintPhase === "fading" ? 0 : 1,
              transition: "opacity 0.5s",
            }}
          >
            <polyline points="15,18 9,12 15,6" />
          </svg>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: NUM_DOTS }).map((_, i) => (
              <span
                key={i}
                className="block transition-all duration-300"
                style={{
                  height: 4,
                  width: i === activeDot ? 16 : 4,
                  borderRadius: i === activeDot ? 2 : "50%",
                  background: i === activeDot ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)",
                }}
              />
            ))}
          </div>

          <svg
            className="nudge-right shrink-0"
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{
              opacity: swipeHintPhase === "hidden" ? 0 : swipeHintPhase === "fading" ? 0 : 1,
              transition: "opacity 0.5s",
            }}
          >
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </div>
      </div>

      {/* ── LARGE BALL ── */}
      <div
        className="flex flex-col items-center gap-4"
        onTouchStart={(e) => {
          ballTouchRef.current.startX = e.touches[0].clientX;
          ballTouchRef.current.startY = e.touches[0].clientY;
          ballSwipedRef.current = false;
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - ballTouchRef.current.startX;
          const dy = e.changedTouches[0].clientY - ballTouchRef.current.startY;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
            ballSwipedRef.current = true;
            if (dx < 0) {
              setSelectedIndex((i) => Math.min(i + 1, days.length - 1));
            } else {
              setSelectedIndex((i) => Math.max(i - 1, 0));
            }
            navigator?.vibrate?.(20);
          }
        }}
      >
        <div className="relative flex items-center justify-center">
          <span
            className="absolute rounded-full pointer-events-none ball-glow-breathe"
            style={{
              width: "calc(var(--football-ball-size) + 80px)",
              height: "calc(var(--football-ball-size) + 80px)",
              background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
            }}
          />
          <span
            className="absolute rounded-full pointer-events-none ball-pulse-ring-delay"
            style={{
              width: "calc(var(--football-ball-size) + 44px)",
              height: "calc(var(--football-ball-size) + 44px)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          />
          <span
            className="absolute rounded-full pointer-events-none ball-pulse-ring"
            style={{
              width: "calc(var(--football-ball-size) + 24px)",
              height: "calc(var(--football-ball-size) + 24px)",
              border: "2px solid rgba(255,255,255,0.08)",
            }}
          />

          <button
            data-day-button
            data-day={selectedDay?.day}
            data-category={selectedDay?.category || "ALL"}
            onClick={(e) => { if (ballSwipedRef.current) { e.stopPropagation(); ballSwipedRef.current = false; } }}
            disabled={locked}
            className={`
              relative rounded-full overflow-hidden
              w-[var(--football-ball-size)] h-[var(--football-ball-size)]
              ${ballRing}
              ${isGold && !locked ? "gold-ball-glow" : ""}
              bg-black/40
              transition duration-300
              ${locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-[0.97]"}
            `}
            style={{ boxShadow: "30px 0px 10px rgba(0,0,0,0.75)" }}
            aria-label={selectedDay ? `Dia ${selectedDay.day}` : ""}
          >
            {isGold && !locked && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10"
                style={{
                  background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.22) 50%, transparent 80%)",
                  animation: "gold-shimmer 2.8s linear infinite",
                }}
              />
            )}
            {selectedDay?.icon && (
              <img src={selectedDay.icon} alt="ball" className="w-full h-full object-cover" />
            )}
            {locked && (
              <div
                className="absolute inset-0 bg-[#00000080] bg-center bg-no-repeat bg-size-[60px_60px]"
                style={{ backgroundImage: "url('./img/lock.png')" }}
              />
            )}
            {isToday && (
              <span className="pointer-events-none absolute inset-0 rounded-full animate-ping ring-2 ring-[#FACC01]/30" />
            )}
          </button>
        </div>

        {selectedDay && (
          <div className="flex flex-col items-center gap-1">
            <span
              className={`
                ${russoOne.className}
                text-[22px] leading-none italic font-bold
                ${isToday ? "text-[#FFD700]" : "text-white"}
              `}
            >
              {selectedDay.day.toString().padStart(2, "0")}
            </span>
          </div>
        )}

        {year != null && month != null && (
          <MonthPagination
            year={year}
            month={month}
            prevMonth={prevMonth}
            nextMonth={nextMonth}
            lang={lang}
            className="text-lg mt-1"
            labelClassName={`${russoOne.className} text-base leading-none`}
          />
        )}
      </div>
    </div>
  );
}
