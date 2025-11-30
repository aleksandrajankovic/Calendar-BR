"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminTableCard from "../components/AdminTableCard";
import ImageGalleryModal from "../components/ImageGalleryModal";

export default function CalendarStyleAdminPage() {
  const [bgUrl, setBgUrl] = useState("/img/bg-calendar.png");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/calendar-settings")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        setBgUrl(data.bgImageUrl || "/img/bg-calendar.png");
      })
      .catch(() =>
        toast.error("Error!")
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/calendar-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bgImageUrl: bgUrl }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setBgUrl(data.bgImageUrl || "/img/bg-calendar.png");
      toast.success("Calendar background updated.");
    } catch (e) {
      toast.error(`Error: ${e.message || "Saving failed."}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-2">
        <h1 className="text-xl font-semibold">
          Backoffice - Calendar Background
        </h1>
        <p className="text-sm text-neutral-500">
          Set background image for the promotion calendar.
        </p>
      </div>

      <AdminTableCard title="Calendar Background">
        {loading ? (
          <div className="p-4 text-sm">Loading…</div>
        ) : (
          <div className="p-4 space-y-4">
            {/* URL input + gallery button */}
            <div>
              <label className="block text-sm text-neutral-800 mb-1">
                Background image URL
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  className="flex-1 min-w-0 border border-[#D0D0D0] rounded px-2.5 py-1.5 text-sm"
                  value={bgUrl}
                  onChange={(e) => setBgUrl(e.target.value)}
                  placeholder="/img/bg-calendar.png"
                />
                <button
                  type="button"
                  onClick={() => setShowGallery(true)}
                  className="shrink-0 font-condensed inline-flex items-center justify-center px-4 py-[10px] rounded bg-[#1F2933] text-white text-xs hover:brightness-110 whitespace-nowrap"
                >
                  Choose from gallery
                </button>
              </div>
            </div>

            {/* Preview */}
            <div>
              <span className="block text-sm text-neutral-800 mb-1">
                Preview
              </span>
              <div className="border border-neutral-200 rounded-lg overflow-hidden max-w-[600px] aspect-[16/9] bg-black/40">
                {bgUrl ? (
                  <img
                    src={bgUrl}
                    alt="calendar background preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
                    No background set
                  </div>
                )}
              </div>
            </div>

            {/* Save button */}
            <div>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-[18px] py-[7px] rounded bg-[#17BB00] text-white text-xs font-condensed hover:brightness-110 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </AdminTableCard>

      {showGallery && (
        <ImageGalleryModal
          onSelect={(url) => {
            setBgUrl(url);
            setShowGallery(false);
          }}
          onClose={() => setShowGallery(false)}
        />
      )}
    </>
  );
}
