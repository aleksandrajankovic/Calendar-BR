// src/lib/sanitize.js
import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p", "br", "b", "i", "em", "strong", "u", "s", "span",
  "h1", "h2", "h3", "h4",
  "ul", "ol", "li",
  "a", "img",
  "div",
];

const ALLOWED_ATTRIBUTES = {
  a: ["href", "target", "rel"],
  img: ["src", "alt", "width", "height", "style"],
  div: ["style"],
  span: ["style", "data-fs", "data-color"],
  p: ["style"],
  h1: ["style"],
  h2: ["style"],
  h3: ["style"],
  h4: ["style"],
  li: ["style"],
};

export function sanitizeRichHtml(html) {
  if (!html || typeof html !== "string") return null;

  const clean = sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
          target: attribs.target || "_blank",
        },
      }),
    },
  });

  return clean || null;
}
