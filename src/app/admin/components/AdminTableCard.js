export default function AdminTableCard({
  title,
  headerRight = null,
  columns = [],
  children,
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden flex flex-col flex-1 min-h-0">
      {/* Crveni header */}
      <div className="flex items-center justify-between bg-[#AC1C09] text-white px-4 py-3">
        <div className="font-semibold">{title}</div>
        {headerRight && (
          <div className="flex items-center gap-2">{headerRight}</div>
        )}
      </div>

      {/* Header kolone */}
      {columns.length > 0 && (
        <div
          className="grid gap-3 px-4 py-2 text-sm font-bold uppercase text-[var(--black-white-80)] bg-[#CBCBCB] border-t border-neutral-200"
          style={{
            gridTemplateColumns: columns.map((c) => c.width || "1fr").join(" "),
          }}
        >
          {columns.map((col) => (
            <div key={col.key || col.label} className={col.className}>
              {col.label}
            </div>
          ))}
        </div>
      )}

      {/* Body (rows) */}
      <div className="flex-1 min-h-0 overflow-auto">{children}</div>
    </div>
  );
}
