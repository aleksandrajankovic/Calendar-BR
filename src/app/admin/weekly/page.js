"use client";

import { useMemo, useState } from "react";
import { useWeeklyData } from "./hooks/useWeeklyData";
import WeeklyEditor from "./components/WeeklyEditor";
import AdminTableCard from "../components/AdminTableCard";
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

export default function GlobalWeeklyPage() {
  const { rows, loading, error, patchActive, remove, upsert } = useWeeklyData();
  const [editingDay, setEditingDay] = useState(null);

  const draftInitial = useMemo(() => {
    if (editingDay === null) return null;
    const existing = rows.find((r) => r.weekday === editingDay);
    return (
      existing || {
        weekday: editingDay,
        title: "",
        subtitle: "",
        image: "",
        icon: "",
        link: "",
        button: "",
        rich: [],
        richHtml: [],
        active: true,
        buttonColor: "green",
        category: "ALL",
      }
    );
  }, [editingDay, rows]);

  const rowGrid =
    "grid grid-cols-1 sm:grid-cols-[120px_1fr] " +
    "lg:grid-cols-[120px_1fr_1.5fr_120px_120px_160px]";

  return (
    <>
      <div className="mb-2">
        <h1 className="text-xl font-semibold">
          Backoffice - Global Weekly Promotions
        </h1>
        <p className="text-sm text-neutral-500">
          Review and edit global weekly promotions
        </p>
      </div>

      <AdminTableCard
        title="Weekly Promotions (Global)"
        headerRight={
          <div className="text-sm opacity-80">7 days · single config</div>
        }
        columns={[
          { key: "day", label: "Day", width: "120px" },
          { key: "name", label: "Name" },
          { key: "link", label: "Link", width: "1.5fr" },
          { key: "status", label: "Status", width: "120px" },
          { key: "toggle", label: "", width: "120px" },
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
                  <div className="text-sm text-[#646464]">{LABELS[wd]}</div>
                  <div className="font-semibold text-sm text-[var(--black-white-90)]">
                    {r?.title || "—"}
                  </div>
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
                  <div
                    className={
                      r?.active
                        ? "text-green-600 text-sm"
                        : "text-neutral-500 text-sm"
                    }
                  >
                    {r ? (r.active ? "Active" : "Inactive") : "—"}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        r ? patchActive(wd, !r.active) : setEditingDay(wd)
                      }
                      className={`w-full h-8 text-xs rounded border uppercase cursor-pointer
                        ${
                          r?.active
                            ? "border-[#4A4A4A] text-[#4A4A4A] bg-white hover:bg-neutral-50"
                            : "border-green-600 text-green-700 bg-white hover:bg-green-50"
                        }`}
                    >
                      {r?.active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-[#5F5F5F] hover:brightness-110"
                      onClick={() => setEditingDay(wd)}
                      aria-label={r ? "Edit" : "Add"}
                    >
                      {/* pencil or plus */}
                      {r ? (
                        <svg width="11" height="12" viewBox="0 0 11 12">
                          <path
                            d="M10.1455 11.2559H0V10.1289H10.1455V11.2559ZM6.84375 0C6.99318 2.04314e-05 7.13651 0.0593917 7.24219 0.165039L8.83691 1.75879C8.88931 1.81113 8.93062 1.87397 8.95898 1.94238C8.98724 2.01069 9.00195 2.08428 9.00195 2.1582C9.00189 2.23211 8.98729 2.30574 8.95898 2.37402C8.93063 2.44227 8.8892 2.50441 8.83691 2.55664L2.3916 9.00195H0V6.61035L6.44531 0.165039C6.55101 0.0594016 6.69431 0 6.84375 0Z"
                            fill="white"
                          />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          className="stroke-white"
                        >
                          <path
                            d="M12 5v14M5 12h14"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </button>
                    {r && (
                      <button
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-[#5F5F5F] hover:brightness-110"
                        onClick={() =>
                          confirmDeleteToast(r.title || LABELS[wd], () =>
                            remove(wd)
                          )
                        }
                        aria-label="Delete"
                      >
                        <svg width="10" height="14" viewBox="0 0 10 14">
                          <path
                            d="M7.85742 3.11133C8.64301 3.11149 9.28613 3.81154 9.28613 4.66699V12.4443C9.28613 13.2998 8.64301 13.9998 7.85742 14H2.14258C1.35699 13.9998 0.713867 13.2998 0.713867 12.4443V4.66699C0.713867 3.81154 1.35699 3.11149 2.14258 3.11133H7.85742ZM6.49316 0C6.67878 9.41196e-05 6.86466 0.085663 6.99316 0.225586L7.5 0.777344H9.28613C9.6788 0.777592 10 1.12804 10 1.55566C9.99995 1.98324 9.67877 2.33276 9.28613 2.33301H0.713867C0.321234 2.33276 5.4316e-05 1.98324 0 1.55566C0 1.12804 0.3212 0.777592 0.713867 0.777344H2.5L3.00684 0.225586C3.13534 0.085663 3.32122 9.41927e-05 3.50684 0H6.49316Z"
                            fill="white"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </AdminTableCard>

      {editingDay !== null && draftInitial && (
        <div className="mt-6">
          <WeeklyEditor
            key={editingDay}
            initial={draftInitial}
            onCancel={() => setEditingDay(null)}
            onSave={async (payload) => {
              await upsert(payload);
              setEditingDay(null);
            }}
          />
        </div>
      )}
    </>
  );
}
