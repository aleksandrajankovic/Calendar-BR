// app/admin/specials/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import SpecialEditor from "./components/SpecialEditor";
import AdminTableCard from "../components/AdminTableCard";
import { confirmDeleteToast } from "../components/ConfirmDeleteToast";

const monthName = (i) =>
  new Date(2000, i, 1).toLocaleString("en", { month: "long" });

export default function SpecialsAdminPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [filterMonth, setFilterMonth] = useState(-1);
  const [filterYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetch("/api/special")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        data.sort(
          (a, b) => a.year - b.year || a.month - b.month || a.day - b.day
        );
        setRows(data);
      })
      .catch(() => setErr("Ne mogu da učitam specijalne promocije."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (filterMonth !== -1 && r.month !== filterMonth) return false;
        return true;
      }),
    [rows, filterMonth]
  );

  async function handleDelete(id, title) {
    confirmDeleteToast(title, async () => {
      setDeletingId(id);
      try {
        const res = await fetch(`/api/special/${id}`, { method: "DELETE" });
        if (res.status !== 204) {
          const t = await res.text().catch(() => "");
          throw new Error(t || `HTTP ${res.status}`);
        }
        setRows((prev) => prev.filter((x) => x.id !== id));
        toast.success("Promotion deleted.");
      } catch (e) {
        toast.error(`Error while deleting: ${e.message || e}`);
      } finally {
        setDeletingId(null);
      }
    });
  }

  async function handleToggle(id, next) {
    const prev = rows;
    setRows((current) =>
      current.map((r) => (r.id === id ? { ...r, active: next } : r))
    );

    try {
      const res = await fetch(`/api/special/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `HTTP ${res.status}`);
      }
      toast.success(next ? "Promotion activated." : "Promotion deactivated");
    } catch (e) {
      setRows(prev);
      toast.error(`Error while updating status: ${e.message || e}`);
    }
  }

  // lg: date | title | category | link | status | toggle | actions
  const rowGrid =
    "grid grid-cols-1 sm:grid-cols-[140px_1fr] " +
    "lg:grid-cols-[140px_1fr_120px_1.5fr_120px_120px_160px]"; // 👈 dodata kolona za kategoriju

  return (
    <>
      {/* Naslov + opis */}
      <div className="mb-2 flex justify-between align-center">
        <div className="mb-2">
          <h1 className="text-xl font-semibold">
            Backoffice - Special Promotions
          </h1>
          <p className="text-sm text-neutral-500">
            Review and manage special promotions for the selected date
          </p>
        </div>

        <button
          className="rounded-md bg-[var(--green-primary,#31A62E)] text-white text-sm font-medium px-3 py-2 hover:brightness-95"
          onClick={() => {
            setEditing(null);
            setShowNew((v) => !v);
          }}
        >
          {showNew ? "Close form" : "+ New"}
        </button>
      </div>

      {/* Tabela u kartici */}
      <AdminTableCard
        title="Special Promotions"
        headerRight={
          <select
            className="border border-neutral-300 rounded px-2 py-1 text-sm text-black bg-white"
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
            title="Filter by month"
          >
            <option value={-1}>All months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {monthName(i)}
              </option>
            ))}
          </select>
        }
        columns={[
          { key: "date", label: "Date", width: "140px" },
          { key: "title", label: "Title" },
          { key: "category", label: "Category", width: "120px" }, // 👈 NOVO
          { key: "link", label: "Link", width: "1.5fr" },
          { key: "status", label: "Status", width: "120px" },
          { key: "toggle", label: "Toggle", width: "120px" },
          {
            key: "actions",
            label: "Actions",
            width: "160px",
            className: "text-right pr-2",
          },
        ]}
      >
        {loading && <div className="p-4 text-sm">Loading…</div>}
        {err && <div className="p-4 text-sm text-red-600">{err}</div>}

        {!loading && !err && (
          <>
            {filtered.length === 0 ? (
              <div className="p-4 text-sm text-neutral-500">
                No promotions match the selected filter.
              </div>
            ) : (
              <ul className="divide-y divide-neutral-200">
                {filtered.map((r, idx) => (
                  <li
                    key={r.id}
                    className={`${rowGrid} gap-3 items-center px-4 py-3 ${
                      idx % 2 === 0 ? "bg-white" : "bg-[#F5F5F5]"
                    }`}
                  >
                    {/* Date */}
                    <div className="text-sm text-[#646464]">
                      {String(r.day).padStart(2, "0")}.
                      {String((r.month ?? 0) + 1).padStart(2, "0")}.{r.year}.
                    </div>

                    {/* Title */}
                    <div className="font-semibold text-sm text-[var(--black-white-90)]">
                      {r.title || "—"}
                    </div>

                    {/* Category – NOVO */}
                    <div className="text-xs text-neutral-600 uppercase tracking-wide">
                      {r.category || "ALL"}
                    </div>

                    {/* Link */}
                    <div className="text-sm text-[var(--black-white-90)] truncate">
                      {r.link ? (
                        <a
                          href={r.link}
                          className="underline decoration-neutral-300 hover:decoration-neutral-500"
                          target="_blank"
                        >
                          {r.link}
                        </a>
                      ) : (
                        "—"
                      )}
                    </div>

                    {/* Status */}
                    <div
                      className={
                        r.active
                          ? "text-green-600 text-sm"
                          : "text-neutral-500 text-sm"
                      }
                    >
                      {r.active ? "Active" : "Inactive"}
                    </div>

                    {/* Toggle */}
                    <div>
                      <button
                        type="button"
                        onClick={() => handleToggle(r.id, !r.active)}
                        title={r.active ? "Deactivate" : "Activate"}
                        aria-label={r.active ? "Deactivate" : "Activate"}
                        className={`w-full h-8 text-xs rounded border uppercase cursor-pointer
                          ${
                            r.active
                              ? "border-[#4A4A4A] text-[#4A4A4A] bg-white hover:bg-neutral-50"
                              : "border-green-600 text-green-700 bg-white hover:bg-green-50"
                          }`}
                      >
                        {r.active ? "Deactivate" : "Activate"}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2">
                      {/* Edit */}
                      <button
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-[#5F5F5F] hover:brightness-110"
                        onClick={() => {
                          setShowNew(false);
                          setEditing(r);
                        }}
                        title="Edit"
                        aria-label="Edit"
                      >
                        <svg
                          width="11"
                          height="12"
                          viewBox="0 0 11 12"
                          aria-hidden="true"
                        >
                          <path
                            d="M10.1455 11.2559H0V10.1289H10.1455V11.2559ZM6.84375 0C6.99318 2.04314e-05 7.13651 0.0593917 7.24219 0.165039L8.83691 1.75879C8.88931 1.81113 8.93062 1.87397 8.95898 1.94238C8.98724 2.01069 9.00195 2.08428 9.00195 2.1582C9.00189 2.23211 8.98729 2.30574 8.95898 2.37402C8.93063 2.44227 8.8892 2.50441 8.83691 2.55664L2.3916 9.00195H0V6.61035L6.44531 0.165039C6.55101 0.0594016 6.69431 0 6.84375 0Z"
                            fill="white"
                          />
                        </svg>
                      </button>

                      {/* Delete */}
                      <button
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-[#5F5F5F] hover:brightness-110 disabled:opacity-50"
                        onClick={() =>
                          handleDelete(r.id, r.title || "Promotion")
                        }
                        disabled={deletingId === r.id}
                        title="Delete"
                        aria-label="Delete"
                      >
                        <svg
                          width="10"
                          height="14"
                          viewBox="0 0 10 14"
                          aria-hidden="true"
                        >
                          <path
                            d="M7.85742 3.11133C8.64301 3.11149 9.28613 3.81154 9.28613 4.66699V12.4443C9.28613 13.2998 8.64301 13.9998 7.85742 14H2.14258C1.35699 13.9998 0.713867 13.2998 0.713867 12.4443V4.66699C0.713867 3.81154 1.35699 3.11149 2.14258 3.11133H7.85742ZM6.49316 0C6.67878 9.41196e-05 6.86466 0.085663 6.99316 0.225586L7.5 0.777344H9.28613C9.6788 0.777592 10 1.12804 10 1.55566C9.99995 1.98324 9.67877 2.33276 9.28613 2.33301H0.713867C0.321234 2.33276 5.4316e-05 1.98324 0 1.55566C0 1.12804 0.3212 0.777592 0.713867 0.777344H2.5L3.00684 0.225586C3.13534 0.085663 3.32122 9.41927e-05 3.50684 0H6.49316Z"
                            fill="white"
                          />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </AdminTableCard>

      {/* Editor sekcije – ispod kartice */}
      {editing && (
        <div className="mt-6">
          <SpecialEditor
            key={editing.id}
            initial={editing}
            onCancel={() => setEditing(null)}
            onSaved={(updated) => {
              setRows((prev) =>
                prev.map((x) => (x.id === updated.id ? updated : x))
              );
              setEditing(null);
            }}
          />
        </div>
      )}

      {showNew && !editing && (
        <div className="mt-6">
          <SpecialEditor
            initial={{}}
            onCancel={() => setShowNew(false)}
            onSaved={(created) => {
              setRows((prev) => {
                const next = [...prev, created];
                next.sort(
                  (a, b) =>
                    a.year - b.year || a.month - b.month || a.day - b.day
                );
                return next;
              });
              setShowNew(false);
            }}
          />
        </div>
      )}
    </>
  );
}
