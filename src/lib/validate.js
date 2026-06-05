// src/lib/validate.js

/**
 * Accepts only http://, https://, or relative paths (/..).
 * Rejects javascript:, data:, etc.
 */
export function isValidLink(value) {
  if (!value || typeof value !== "string") return true;
  const trimmed = value.trim();
  if (trimmed === "") return true;
  if (trimmed.startsWith("/")) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function sanitizeLink(value) {
  if (!isValidLink(value)) return "";
  return (value || "").trim();
}
