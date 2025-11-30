"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarNav({ className = "", topOffsetPx = 56 }) {
  const pathname = usePathname();

  const items = [
    { href: "/admin/users", label: "Users" }, 
    { href: "/admin/weekly-plan", label: "Monthly Promotions" }, 
    { href: "/admin/specials", label: "Special Promotions" },
    { href: "/admin/weekly", label: "Weekly Promotions" },
    { href: "/admin/calendar-style", label: "Calendar Styling" },
  ];

  return (
    <aside
      className={
        `bg-white border-r border-neutral-200 p-0 font-[var(--font-roboto-condensed)] 
        
        h-[calc(100vh-${topOffsetPx}px)] ` +
        className
      }
    >


      <nav aria-label="Sidebar">
        <ul className="text-[13px]">
          {items.map((it) => {
            const active = pathname === it.href;
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex items-center h-10 px-4 border-t border-neutral-200",
                    "hover:bg-neutral-50",
                    active
                      ? "text-[#AC1C09] text-sm border-l-4 border-l-[#AC1C09]"
                      : "text-neutral-800 border-l-4 border-l-transparent",
                  ].join(" ")}
                >
                  {it.label}
                </Link>
              </li>
            );
          })}
          {/* donja linija da zatvori listu */}
          <li className="border-t border-neutral-200" />
        </ul>
      </nav>
    </aside>
  );
}
