"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function useWeeklyData() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/weekly")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setRows)
      .catch(() => setError("No data!"))
      .finally(() => setLoading(false));
  }, []);

  async function patchActive(weekday, next) {
    const prev = rows;
    setRows((r) =>
      r.map((x) => (x.weekday === weekday ? { ...x, active: next } : x))
    );
    const res = await fetch(`/api/weekly/${weekday}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    if (!res.ok) {
      setRows(prev);
      toast.error("Error!");
    }
  }

  async function remove(weekday) {
    const prev = rows;
    setRows((r) => r.filter((x) => x.weekday !== weekday));
    const res = await fetch(`/api/weekly/${weekday}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      setRows(prev);
      toast.error("Error!");
    }
  }

  async function upsert(payload) {
    const res = await fetch(`/api/weekly/${payload.weekday}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: payload.title ?? "",
        button: payload.button ?? "",
        link: payload.link ?? "",
        rich: payload.rich ?? null,
        richHtml: payload.richHtml ?? "",

        image: payload.image ?? "",
        icon: payload.icon ?? "",
        active: !!payload.active,
        buttonColor: payload.buttonColor ?? "green",

        translations: payload.translations || null,
        defaultLang: payload.defaultLang || "pt",

        category: payload.category || "ALL",
      }),
    });
    if (!res.ok) toast.error("Error!");
    const saved = await res.json();
    setRows((prev) => {
      const other = prev.filter((r) => r.weekday !== saved.weekday);
      return [...other, saved].sort((a, b) => a.weekday - b.weekday);
    });
  }

  return { rows, loading, error, patchActive, remove, upsert };
}
