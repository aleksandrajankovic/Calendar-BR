"use client"
import React from "react";
export default function LinkControl({ editor }) {
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");

  if (!editor) return null;

  const openDialog = () => {
    const prev = editor.getAttributes("link").href || "";
    setUrl(prev);
    setOpen(true);
  };

  const applyLink = () => {
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url.trim() })
        .run();
    }
    setOpen(false);
  };

  const cancel = () => setOpen(false);

  const btnBase =
    "h-8 w-8 flex items-center justify-center rounded-md border border-neutral-200 text-[13px] text-neutral-700 hover:bg-neutral-50";
  const btnActive = "bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-900";

  return (
    <div className="relative">
      {/* Dugme za link */}
      <button
        type="button"
        onClick={openDialog}
        className={`${btnBase} ${editor.isActive("link") ? btnActive : ""}`}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.74509 6.41176L9.57843 5.57843C10.683 4.47386 10.683 2.683 9.57843 1.57843C8.47386 0.473858 6.683 0.473857 5.57843 1.57843L4.74509 2.41176M2.41176 4.74509L1.57843 5.57843C0.473857 6.683 0.473858 8.47386 1.57843 9.57843C2.683 10.683 4.47386 10.683 5.57843 9.57843L6.41176 8.74509M7.07843 4.07843L4.07843 7.07843"
            stroke="#667085"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 top-10 left-1/2 -translate-x-1/2 bg-white border border-neutral-700 rounded-md p-3 shadow-lg min-w-[260px]">
          <label className="block text-xs text-black mb-1">
           Enter URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full text-sm bg-white border border-neutral-600 rounded px-2 py-1 mb-2 outline-none focus:border-green-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={cancel}
              className="px-2 py-1 text-xs rounded border border-neutral-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applyLink}
              className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:brightness-110"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
