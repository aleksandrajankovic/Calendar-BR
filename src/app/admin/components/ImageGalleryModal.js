"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function ImageGalleryModal({ onSelect, onClose }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null); // filename koji brišemo
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  async function loadImages() {
    try {
      setLoading(true);
      const res = await fetch("/api/images");
      if (!res.ok) {
        throw new Error(await res.text().catch(() => "Failed to load images"));
      }
      const data = await res.json();
      setImages(data.files || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load gallery.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadImages();
  }, []);

  async function handleDelete(filename) {
    if (!window.confirm("Delete this image from gallery?")) return;
    setDeleting(filename);
    try {
      const res = await fetch("/api/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });
      if (!res.ok) {
        throw new Error(await res.text().catch(() => "Delete failed"));
      }
      setImages((prev) => prev.filter((img) => img.name !== filename));
      toast.success("Image deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete image.");
    } finally {
      setDeleting(null);
    }
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text().catch(() => "Upload error"));
      }

      const { url } = await res.json();

      const name = url.split("/").pop() || url;

      // dodaj novu sliku na početak liste
      setImages((prev) => [{ url, name }, ...prev]);
      toast.success("Image uploaded.");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
      // reset input da bi sledeći put opet radio change event
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
          <h2 className="text-sm font-semibold text-neutral-900">
            Image gallery
          </h2>

          <div className="flex items-center gap-2">
            {/* Upload new image */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 rounded bg-[#17BB00] text-white text-xs font-semibold hover:brightness-110 disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Upload new"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-neutral-500 hover:text-neutral-800"
            >
              Close
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-neutral-500">Loading images...</p>
          ) : images.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No images yet. Use “Upload new”.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {images.map((img) => (
                <div
                  key={img.name}
                  className="group relative border border-neutral-200 rounded-md overflow-hidden bg-neutral-50"
                >
                  <button
                    type="button"
                    onClick={() => onSelect(img.url)}
                    className="block w-full h-full focus:outline-none"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-20 object-contain bg-white"
                    />
                  </button>

                  {/* filename */}
                  <div className="px-1.5 py-1 bg-white border-t border-neutral-200">
                    <p className="text-[11px] text-neutral-600 truncate">
                      {img.name}
                    </p>
                  </div>

                  {/* Delete btn */}
                  <button
                    type="button"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(img.name);
                    }}
                    disabled={deleting === img.name}
                    className="absolute top-1 right-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/60 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {deleting === img.name ? "…" : "×"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
