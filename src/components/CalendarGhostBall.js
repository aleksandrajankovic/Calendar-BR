// src/components/CalendarGhostBall.js
import { rowdies } from "@/app/fonts";

export default function CalendarGhostBall({ cell }) {
  return (
    <div aria-hidden="true" className="relative h-full w-full flex flex-col items-center justify-center gap-1">
      <div className="rounded-full h-[78%] aspect-square bg-black/40 ring-1 ring-white/8" />
      <span
        className={`
          ${rowdies.className}
          text-[11px] md:text-[13px] lg:text-[15px] leading-none
          text-white/30 font-bold
        `}
      >
        {cell.day.toString().padStart(2, "0")}
      </span>
    </div>
  );
}
