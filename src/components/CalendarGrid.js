import { buildCalendarData } from "@/lib/calendarGridHelpers";
import CalendarDayCell from "./CalendarDayCell";
import CalendarGhostCell from "./CalendarGhostCell";
import CalendarInteractionsClient from "@/lib/calendarIneractionsClient";
import CalendarMobileStack from "./CalendarMobileStack";

export default function CalendarGrid({
  year,
  month,
  weekly = [],
  specials = [],
  adminPreview = false,
  lang = "pt",
}) {
  const { cells, daysPayload } = buildCalendarData({
    year,
    month,
    weekly,
    specials,
    adminPreview,
    lang,
  });

  return (
    <section
      id="calendar-root"
      className={`w-full ${adminPreview ? "admin-preview" : ""}`}
    >
      {/* pokreće initCalendarInteractions u browseru */}
      <CalendarInteractionsClient />

      {/* DESKTOP GRID */}
      <div className="hidden md:block max-w-[100%] py-5 md:py-6 lg:py-7 rounded-[32px] bg-transparent">
        <div className="flex flex-col">
          <div
            className="grid grid-cols-7 gap-1.5 md:gap-2 auto-rows-[52px] md:auto-rows-[70px] lg:auto-rows-[95px]"
            data-cal-grid
          >
            {cells.map((cell) => {
              // PREVIOUS / NEXT MONTH → uvek ghost
              if (cell.type === "prev" || cell.type === "next") {
                return <CalendarGhostCell key={cell.key} cell={cell} />;
              }

              if (cell.type === "day") {
                // FUTURE dani u TEKUĆEM mesecu:
                // čak i ako nemaju promo, treba da budu zaključani sa lock ikonicom
                if (cell.isFutureForUx) {
                  return (
                    <CalendarDayCell
                      key={cell.key}
                      cell={cell}
                      lang={lang}
                      adminPreview={adminPreview}
                    />
                  );
                }

                // PROŠLI / DANAŠNJI dani BEZ promo → ghost
                if (!cell.hasPromo) {
                  return <CalendarGhostCell key={cell.key} cell={cell} />;
                }

                // Dan sa promo → normalni day cell
                return (
                  <CalendarDayCell
                    key={cell.key}
                    cell={cell}
                    lang={lang}
                    adminPreview={adminPreview}
                  />
                );
              }

              return null;
            })}
          </div>
        </div>
      </div>
      {/* MOBILE STACK (<= 768) */}
      <div className="md:hidden flex justify-center min-h-[calc(100vh-200px)]">
        <CalendarMobileStack adminPreview={adminPreview} />
      </div>
      {/* MODAL*/}
    
      <div
        id="promo-modal"
        className="
    fixed inset-0 z-40
    hidden
    bg-black/70
    flex items-center justify-center
    px-4
  "
      >
        {/* sam modal / dialog */}
        <div
          id="promo-dialog"
          className="
      relative
      w-full max-w-[480px]
      max-h-[80vh]       
      bg-[#05070D]
      rounded-2xl
      shadow-xl
      transform-gpu transition-all duration-200 ease-out
      flex flex-col
      p-4 sm:p-6
    "
        >
          {/* X dugme fiksirano u gornjem desnom uglu modala */}
          <button
            id="promo-close"
            className="
        absolute right-3 top-3
        h-8 w-8
        flex items-center justify-center
        rounded-full
        text-white/70 hover:text-white
        bg-white/5 hover:bg-white/10
      "
            aria-label="Close"
          >
            ✕
          </button>

          {/* sadržaj koji renderuje renderModalHTML → skroluje se unutar modala */}
          <div
            id="promo-content"
            className="
        mt-6              
        overflow-y-auto
        pr-2            
      "
          ></div>
        </div>
      </div>

      {/* JSON payload za JS logiku */}
      <script
        id="calendar-data"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            days: daysPayload,
            adminPreview,
            year,
            month,
            lang,
          }),
        }}
      />
    </section>
  );
}
