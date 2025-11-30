// src/components/CalendarGhostCell.js
import { rowdies } from "@/app/fonts";

const ghostNumberClass = `
  ${rowdies.className}
  absolute left-2 top-2
  text-[18px] md:text-[20px] lg:text-[22px]
  leading-[22px]
  text-white/60
  
`;

export default function CalendarGhostCell({ cell }) {
  return (
  <div
  aria-hidden="true"
  className="
    relative
    rounded-[10px]
    bg-[#000000D9]
    border border-white/15
    grid place-items-center
  "
>
  <span
    className={`
      ${ghostNumberClass}
      text-white/80
    `}
  >
    {cell.day.toString().padStart(2, "0")}
  </span>
</div>

  );
}
