"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin/users", label: "Users" },
  { href: "/admin/weekly-plan", label: "Monthly Promotions" },
  { href: "/admin/specials", label: "Special Promotions" },
  {
    href: "/admin/calendar-style",
    label: "Calendar Styling",
    children: [
      { href: "/admin/calendar-style/defaults", label: "Default Settings" },
      { href: "/admin/calendar-style/monthly",  label: "Settings by Month" },
    ],
  },
];

export default function SidebarNav({ className = "", topOffsetPx = 56 }) {
  const pathname = usePathname();

  return (
    <aside
      className={
        `bg-white border-r border-neutral-200 p-0 font-(--font-roboto-condensed) ` +
        `h-[calc(100vh-${topOffsetPx}px)] ` +
        className
      }
    >
      <nav aria-label="Sidebar">
        <ul className="text-[13px]">
          {items.map((item) => {
            const active   = pathname === item.href;
            const expanded = item.children && pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.children ? item.children[0].href : item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex items-center h-10 px-4 border-t border-neutral-200",
                    "hover:bg-neutral-50",
                    expanded
                      ? "text-[#AC1C09] text-sm border-l-4 border-l-[#AC1C09]"
                      : "text-neutral-800 border-l-4 border-l-transparent",
                  ].join(" ")}
                >
                  {item.label}
                </Link>

                {expanded && (
                  <ul className="border-t border-neutral-100">
                    {item.children.map((sub) => {
                      const subActive = pathname === sub.href;
                      return (
                        <li key={sub.href}>
                          <Link
                            href={sub.href}
                            aria-current={subActive ? "page" : undefined}
                            className={[
                              "flex items-center h-9 pl-8 pr-4 text-[12px]",
                              "hover:bg-neutral-50",
                              subActive
                                ? "text-[#AC1C09] font-medium border-l-4 border-l-[#AC1C09]"
                                : "text-neutral-600 border-l-4 border-l-transparent",
                            ].join(" ")}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
          <li className="border-t border-neutral-200" />
        </ul>
      </nav>
    </aside>
  );
}
