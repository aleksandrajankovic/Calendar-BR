"use client";

import toast from "react-hot-toast";

export function confirmDeleteToast(title, onConfirm) {
  toast(
    (t) => (
      <div className="text-sm">
        <p>
          Delete promotion:{" "}
          <strong>{title}</strong>?
        </p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              onConfirm?.();
            }}
            className="bg-red-600 text-white px-3 py-1 rounded text-xs"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="border border-gray-400 px-3 py-1 rounded text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    { duration: 4000 }
  );
}
