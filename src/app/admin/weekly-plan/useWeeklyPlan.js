"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function useWeeklyPlan(year, month) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    //setLoading(true);
    //setError("");

    fetch(`/api/weekly-plan?year=${year}&month=${month}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setRows)
      .catch(() => setError("Ne mogu da učitam plan"))
      .finally(() => setLoading(false));
  }, [year, month]);

  async function upsert(payload) {
    const res = await fetch(`/api/weekly-plan`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year,
        month,
        weekday: payload.weekday,

        title: payload.title ?? "",
        button: payload.button ?? "",
        link: payload.link ?? "",
        rich: payload.rich ?? null,
        richHtml: payload.richHtml ?? "",

        active: !!payload.active,
        icon: payload.icon ?? "",
        buttonColor: payload.buttonColor ?? "green",

        translations: payload.translations || null,
        defaultLang: payload.defaultLang || "pt",
        category: payload.category || "ALL",
      }),
    });

    if (!res.ok) {
      toast.error("Greška pri snimanju");
      return;
    }

    const saved = await res.json();
    setRows((prev) => {
      const other = prev.filter((r) => r.weekday !== saved.weekday);
      return [...other, saved].sort((a, b) => a.weekday - b.weekday);
    });
    toast.success("Success!");
  }

  async function remove(weekday) {
    const prev = rows;
    setRows((r) => r.filter((x) => x.weekday !== weekday));
    const res = await fetch(`/api/weekly-plan`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, month, weekday }),
    });
    if (!res.ok && res.status !== 204) {
      setRows(prev);
      toast.error("Greška pri brisanju");
    }
  }

  return { rows, loading, error, upsert, remove };
}
