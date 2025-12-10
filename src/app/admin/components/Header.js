"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminHeader() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch("/api/admin/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setUser(data);
      } catch (e) {
        console.error(e);
      }
    }
    loadMe();
  }, []);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function doLogout() {
    try {
      await fetch("/api/auth", { method: "DELETE", cache: "no-store" });
    } finally {
      router.replace("/login");
      window.location.reload();
    }
  }

  async function handleClearCache() {
    try {
      setIsClearing(true);
      const res = await fetch("/api/admin/clear-calendar-cache", {
        method: "POST",
      });

      if (!res.ok) {
        showToast("Failed to clear cache. Please try again.", "error");
        return;
      }

      showToast("Cache cleared successfully. ", "success");
    } catch (e) {
      console.error(e);
      showToast("Something went wrong while clearing the cache.", "error");
    } finally {
      setIsClearing(false);
    }
  }

  const displayName = user?.name || user?.email?.split("@")[0] || "Admin";

  return (
    <>
      {/* TOAST */}
      {toast && (
        <div
          className={`
            fixed bottom-4 right-4 z-50 rounded-md px-4 py-3 text-sm shadow-lg
            ${toast.type === "error" ? "bg-red-600" : "bg-emerald-600"}
            text-white
          `}
        >
          {toast.message}
        </div>
      )}

      <header className="h-14 bg-[#AC1C09] text-white flex items-center justify-between px-4 sm:px-6 shadow">
        <div className="font-semibold">BackOffice</div>

        <div className="flex items-stretch border-l border-[#C93A25]">
          {/* CLEAR CACHE button */}
          <button
            onClick={handleClearCache}
            className="flex items-center justify-center px-3 border-r border-[#C93A25] text-sm hover:bg-[#C93A25] transition-colors disabled:opacity-60"
            disabled={isClearing}
          >
            {isClearing ? "Clearing..." : "Clear cache"}
          </button>

          <div className="flex items-center gap-2 px-3">
            <span className="text-sm font-medium max-w-[160px] truncate">
              {displayName}
            </span>
          </div>

          <button
            onClick={doLogout}
            className="flex items-center justify-center px-3 transition-colors"
            title="Log out"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <img src="/img/logout.png" alt="Logout" />
            </div>
          </button>
        </div>
      </header>
    </>
  );
}
