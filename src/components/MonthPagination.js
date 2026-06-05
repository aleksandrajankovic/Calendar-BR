// src/components/MonthPagination.js

export default function MonthPagination({
  year,
  month,
  prevMonth,
  nextMonth,
  lang = "pt",
  className = "",
  labelClassName = "",
}) {
  const locale = lang === "en" ? "en-US" : "pt-BR";
  const raw = new Date(year, month, 1).toLocaleString(locale, { month: "long" });
  const monthLabel = raw.charAt(0).toUpperCase() + raw.slice(1);

  const hrefFor = (obj) => {
    if (!obj) return "#";
    const yy = obj.year ?? obj.y;
    const mm = obj.month ?? obj.m;
    return `/?y=${yy}&m=${mm}&lang=${lang}`;
  };

  return (
    <div className={`inline-flex items-center gap-4 rounded-full bg-black/40 px-4 py-2 text-white ${className}`}>
      {prevMonth ? (
        <a href={hrefFor(prevMonth)} className="p-1 hover:opacity-80" aria-label="Previous month">‹</a>
      ) : (
        <span className="p-1 opacity-20 cursor-default" aria-hidden="true">‹</span>
      )}

      <span className={`min-w-[140px] text-center font-semibold ${labelClassName}`}>
        {monthLabel} <span className="ml-1 opacity-80">{year}</span>
      </span>

      {nextMonth ? (
        <a href={hrefFor(nextMonth)} className="p-1 hover:opacity-80" aria-label="Next month">›</a>
      ) : (
        <span className="p-1 opacity-20 cursor-default" aria-hidden="true">›</span>
      )}
    </div>
  );
}
