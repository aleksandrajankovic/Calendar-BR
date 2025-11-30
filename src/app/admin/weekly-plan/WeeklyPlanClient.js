// app/admin/weekly-plan/page.jsx
"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useWeeklyPlan } from "./useWeeklyPlan";
import WeeklyEditor from "../weekly/components/WeeklyEditor";
import AdminTableCard from "../components/AdminTableCard";
import {
  StatusToggleButton,
  IconButton,
} from "../components/AdminTableButtons";
import { confirmDeleteToast } from "../components/ConfirmDeleteToast";

const LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function WeeklyPlanAdmin() {
  const sp = useSearchParams();
  const now = new Date();

  const y0 = Number.parseInt(sp.get("y") ?? "", 10);
  const m0 = Number.parseInt(sp.get("m") ?? "", 10);

  const [year, setYear] = useState(
    Number.isInteger(y0) ? y0 : now.getFullYear()
  );
  const [month, setMonth] = useState(
    Number.isInteger(m0) && m0 >= 0 && m0 <= 11 ? m0 : (now.getMonth() + 1) % 12
  );

  const { rows, loading, error, upsert, remove } = useWeeklyPlan(year, month);
  const [editing, setEditing] = useState(null); // weekday 0..6

  const initial = useMemo(() => {
    if (editing == null) return null;
    const existing = rows.find((r) => r.weekday === editing);
    return (
      existing || {
        year,
        month,
        weekday: editing,
        title: "",
        link: "",
        button: "",
        icon: "",
        active: true,
        rich: null,
        richHtml: null,
        buttonColor: "green",
        category: "ALL",
      }
    );
  }, [editing, rows, year, month]);

  async function handleToggle(wd) {
    const existing = rows.find((x) => x.weekday === wd);
    if (!existing) {
      setEditing(wd);
      return;
    }
    await upsert({
      ...existing,
      year,
      month,
      active: !existing.active,
    });
  }

  const rowGrid =
    "grid grid-cols-1 sm:grid-cols-[120px_1fr] " +
    "lg:grid-cols-[120px_1fr_1.5fr_120px_120px_160px]";

  return (
    <>
      {/* Naslov + opis */}
      <div className="mb-2">
        <h1 className="text-xl font-semibold">
          Backoffice - Monthly Promotions
        </h1>
        <p className="text-sm text-neutral-500">
          Review and edit weekly promotions for the selected month{" "}
        </p>
      </div>

      <AdminTableCard
        title="Weekly Promotions"
        headerRight={
          <>
            {/* Month */}
            <select
              className="border border-neutral-300 rounded px-2 py-1 text-sm text-black bg-white"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {new Date(2000, i, 1).toLocaleString("en", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </>
        }
        columns={[
          { key: "day", label: "Day", width: "120px" },
          { key: "name", label: "Name" },
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
        {error && <div className="p-4 text-sm text-red-600">{error}</div>}

        {!loading && !error && (
          <ul className="divide-y divide-neutral-200">
            {Array.from({ length: 7 }, (_, wd) => {
              const r = rows.find((x) => x.weekday === wd) || null;
              return (
                <li
                  key={wd}
                  className={`${rowGrid} gap-3 items-center px-4 py-3 ${
                    wd % 2 === 0 ? "bg-white" : "bg-[#F5F5F5]"
                  }`}
                >
                  {/* Day */}
                  <div className="text-sm text-[#646464]">{LABELS[wd]}</div>

                  {/* Name */}
                  <div className="font-semibold text-sm text-[var(--black-white-90)]">
                    {r?.title || "—"}
                  </div>

                  {/* Link */}
                  <div className="text-sm text-[var(--black-white-90)] truncate">
                    {r?.link ? (
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
                    className={`text-sm ${
                      r?.active ? "text-green-600" : "text-neutral-500"
                    }`}
                  >
                    {r ? (r.active ? "Active" : "Inactive") : "—"}
                  </div>

                  {/* Toggle */}
                  <div>
                    <StatusToggleButton
                      active={!!r?.active}
                      onClick={() => handleToggle(wd)}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2">
                    <IconButton
                      variant={r ? "edit" : "add"}
                      onClick={() => setEditing(wd)}
                      title={r ? "Edit" : "Add"}
                    />
                    {r && (
                      <IconButton
                        variant="delete"
                        onClick={() =>
                          confirmDeleteToast(r.title || LABELS[wd], () =>
                            remove(wd)
                          )
                        }
                        title="Delete"
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </AdminTableCard>

      {editing != null && initial && (
        <div className="mt-6">
          <WeeklyEditor
            key={editing}
            initial={initial}
            onCancel={() => setEditing(null)}
            onSave={async (payload) => {
              await upsert({ ...payload, year, month });
              setEditing(null);
            }}
          />
        </div>
      )}
    </>
  );
}
