"use client";

import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import dynamic from "next/dynamic";
import { Mark, mergeAttributes } from "@tiptap/core";

import LinkControl from "./LinkControl";
import ImageGalleryModal from "@/app/admin/components/ImageGalleryModal";

const EmojiCorePicker = dynamic(() => import("./EmojiPicker"), { ssr: false });

/* ---------- Emoji button ---------- */
function EmojiButton({ editor }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-8 w-8 flex items-center justify-center rounded-md border border-neutral-200 text-sm text-neutral-700 hover:bg-neutral-50"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_46_2139)">
            <path
              d="M7.99998 1.33325C11.682 1.33325 14.6666 4.31792 14.6666 7.99992C14.6666 11.6819 11.682 14.6666 7.99998 14.6666C4.31798 14.6666 1.33331 11.6819 1.33331 7.99992C1.33331 4.31792 4.31798 1.33325 7.99998 1.33325ZM7.99998 2.66659C6.58549 2.66659 5.22894 3.22849 4.22874 4.22868C3.22855 5.22888 2.66665 6.58543 2.66665 7.99992C2.66665 9.41441 3.22855 10.771 4.22874 11.7712C5.22894 12.7713 6.58549 13.3333 7.99998 13.3333C9.41447 13.3333 10.771 12.7713 11.7712 11.7712C12.7714 10.771 13.3333 9.41441 13.3333 7.99992C13.3333 6.58543 12.7714 5.22888 11.7712 4.22868C10.771 3.22849 9.41447 2.66659 7.99998 2.66659ZM9.86665 9.23792C9.92884 9.17517 10.0029 9.12542 10.0845 9.09154C10.1661 9.05766 10.2536 9.04034 10.342 9.04059C10.4303 9.04083 10.5177 9.05863 10.5991 9.09296C10.6805 9.12729 10.7543 9.17745 10.8162 9.24054C10.878 9.30363 10.9267 9.37838 10.9594 9.46045C10.9921 9.54252 11.0082 9.63028 11.0067 9.71861C11.0052 9.80695 10.9861 9.89411 10.9506 9.97502C10.9152 10.0559 10.8639 10.129 10.8 10.1899C10.0529 10.9238 9.0472 11.3344 7.99998 11.3333C6.95276 11.3344 5.94707 10.9238 5.19998 10.1899C5.07667 10.0655 5.00726 9.89759 5.00678 9.72242C5.0063 9.54726 5.07477 9.37895 5.1974 9.25387C5.32002 9.12879 5.48695 9.057 5.66208 9.05401C5.83722 9.05103 6.0065 9.11709 6.13331 9.23792C6.63119 9.72739 7.30179 10.0011 7.99998 9.99992C8.72665 9.99992 9.38465 9.70992 9.86665 9.23792ZM5.66665 5.33325C5.93186 5.33325 6.18622 5.43861 6.37375 5.62614C6.56129 5.81368 6.66665 6.06804 6.66665 6.33325C6.66665 6.59847 6.56129 6.85282 6.37375 7.04036C6.18622 7.22789 5.93186 7.33325 5.66665 7.33325C5.40143 7.33325 5.14708 7.22789 4.95954 7.04036C4.772 6.85282 4.66665 6.59847 4.66665 6.33325C4.66665 6.06804 4.772 5.81368 4.95954 5.62614C5.14708 5.43861 5.40143 5.33325 5.66665 5.33325ZM10.3333 5.33325C10.5985 5.33325 10.8529 5.43861 11.0404 5.62614C11.228 5.81368 11.3333 6.06804 11.3333 6.33325C11.3333 6.59847 11.228 6.85282 11.0404 7.04036C10.8529 7.22789 10.5985 7.33325 10.3333 7.33325C10.0681 7.33325 9.81374 7.22789 9.62621 7.04036C9.43867 6.85282 9.33331 6.59847 9.33331 6.33325C9.33331 6.06804 9.43867 5.81368 9.62621 5.62614C9.81374 5.43861 10.0681 5.33325 10.3333 5.33325Z"
              fill="#667085"
            />
          </g>
          <defs>
            <clipPath id="clip0_46_2139">
              <rect width="16" height="16" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 z-50">
          <EmojiCorePicker
            onSelect={(emoji) => {
              editor.chain().focus().insertContent(emoji.native).run();
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ---------- Consts ---------- */

const SIZE_OPTIONS = ["12", "14", "16", "18", "20", "24", "28", "32"];

const COLOR_PRESETS = {
  default: "#334155",
  black: "#334155",
  blue: "#3398FF",
  green: "#3FD88C",
  gold: "#FFD47F",
  pink: "#FF55A9",
  lilac: "#D4A9D4",
  skyblue: "#82D4FF",
  error: "#F44336",
  warning: "#FF9800",
};

const COLORS = [
  "black",
  "blue",
  "green",
  "gold",
  "pink",
  "lilac",
  "skyblue",
  "error",
  "warning",
];

const HEADING_LEVELS = [
  { label: "p", value: 0 },
  { label: "H1", value: 1 },
  { label: "H2", value: 2 },
  { label: "H3", value: 3 },
];

/* ---------- Marks ---------- */

const FontSizeMark = Mark.create({
  name: "fontSize",

  addAttributes() {
    return {
      fs: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-fs") || null,
        renderHTML: (attrs) =>
          attrs.fs ? { "data-fs": String(attrs.fs) } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-fs]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setFontSize:
        (fs) =>
        ({ chain }) =>
          chain().setMark(this.name, { fs }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().unsetMark(this.name).run(),
    };
  },
});

const FontColorMark = Mark.create({
  name: "fontColor",

  addAttributes() {
    return {
      colorKey: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-color") || null,
        renderHTML: (attrs) => {
          const key = attrs.colorKey;
          const color = key && COLOR_PRESETS[key] ? COLOR_PRESETS[key] : null;
          return {
            "data-color": key || null,
            style: color ? `color: ${color}` : null,
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-color]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setFontColor:
        (key) =>
        ({ chain }) =>
          chain().setMark(this.name, { colorKey: key }).run(),
      unsetFontColor:
        () =>
        ({ chain }) =>
          chain().unsetMark(this.name).run(),
    };
  },
});

/* ---------- Color picker ---------- */

function ColorPicker({ activeColor, setColor }) {
  const [open, setOpen] = React.useState(false);
  const currentColor =
    COLOR_PRESETS[activeColor] || COLOR_PRESETS.black || "#111827";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-8 w-8 flex items-center justify-center rounded-md border border-neutral-200 hover:bg-neutral-50"
      >
        <span
          className="w-4 h-4 rounded-full border border-neutral-300"
          style={{ backgroundColor: currentColor }}
        />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 z-50 bg-white border border-neutral-200 rounded-md shadow-md p-2">
          <div className="grid grid-cols-3 gap-2 w-[100px]">
            {COLORS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setColor(key);
                  setOpen(false);
                }}
                className="w-6 h-6 rounded-full border border-neutral-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: COLOR_PRESETS[key] }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setColor(null);
              setOpen(false);
            }}
            className="mt-2 w-full text-[10px] text-neutral-500 text-center hover:text-neutral-800"
          >
            Reset color
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Main component ---------- */

export default function RichEditor({
  initialJSON = null,
  placeholder = "Upiši sadržaj…",
  onChange,
}) {
  const [showImageGallery, setShowImageGallery] = React.useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      FontSizeMark,
      FontColorMark,
      StarterKit.configure({}),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "text-green-500 underline cursor-pointer",
        },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      TextAlign.configure({ types: ["heading", "paragraph", "listItem"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: initialJSON || "",
    onUpdate: ({ editor }) =>
      onChange?.({ json: editor.getJSON(), html: editor.getHTML() }),
    editorProps: {
      attributes: {
        class:
          "tiptap max-w-none min-h-40 focus:outline-none text-[14px] leading-relaxed",
      },
    },
  });

  if (!editor) return null;

  const btnBase =
    "h-8 w-8 flex items-center justify-center rounded-md border border-neutral-200 text-[13px] text-neutral-700 hover:bg-neutral-50";
  const btnActive =
    "bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-900";

  const setSize = (v) =>
    v
      ? editor.chain().focus().setFontSize(v).run()
      : editor.chain().focus().unsetFontSize().run();

  const setColor = (key) =>
    key
      ? editor.chain().focus().setFontColor(key).run()
      : editor.chain().focus().unsetFontColor().run();

  const activeSize = editor.getAttributes("fontSize")?.fs || "";
  const activeColor = editor.getAttributes("fontColor")?.colorKey || "";
  const currentHeading = editor.isActive("heading")
    ? editor.getAttributes("heading")?.level || 0
    : 0;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-neutral-200 bg-neutral-50">
        {/* Font size */}
        <select
          className="h-8 px-2 rounded-md border border-neutral-200 text-[13px] text-neutral-700 bg-white"
          value={activeSize || "14"}
          onChange={(e) => setSize(e.target.value || null)}
        >
          {SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Color picker */}
        <ColorPicker activeColor={activeColor} setColor={setColor} />

        {/* Bold / Italic / Underline */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${btnBase} ${
            editor.isActive("bold") ? btnActive : ""
          } font-semibold`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${btnBase} ${
            editor.isActive("italic") ? btnActive : ""
          } italic`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${btnBase} ${
            editor.isActive("underline") ? btnActive : ""
          }`}
        >
          <span className="underline">U</span>
        </button>

        {/* Heading */}
        <select
          className="h-8 px-2 rounded-md border border-neutral-200 text-[13px] text-neutral-700 bg-white"
          value={currentHeading}
          onChange={(e) => {
            const lvl = Number(e.target.value);
            const isSame = editor.isActive("heading", { level: lvl });
            if (lvl === 0 || isSame) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().setHeading({ level: lvl }).run();
            }
          }}
        >
          {HEADING_LEVELS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${btnBase} ${
            editor.isActive("bulletList") ? btnActive : ""
          }`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.50002 6.00008H14.1667M8.50002 10.0001H14.1667M8.50002 14.0001H14.1667M6.33335 6.00008C6.33335 6.18418 6.18412 6.33341 6.00002 6.33341C5.81593 6.33341 5.66669 6.18418 5.66669 6.00008C5.66669 5.81599 5.81593 5.66675 6.00002 5.66675C6.18412 5.66675 6.33335 5.81599 6.33335 6.00008ZM6.33335 10.0001C6.33335 10.1842 6.18412 10.3334 6.00002 10.3334C5.81593 10.3334 5.66669 10.1842 5.66669 10.0001C5.66669 9.81599 5.81593 9.66675 6.00002 9.66675C6.18412 9.66675 6.33335 9.81599 6.33335 10.0001ZM6.33335 14.0001C6.33335 14.1842 6.18412 14.3334 6.00002 14.3334C5.81593 14.3334 5.66669 14.1842 5.66669 14.0001C5.66669 13.816 5.81593 13.6667 6.00002 13.6667C6.18412 13.6667 6.33335 13.816 6.33335 14.0001Z"
              stroke="#667085"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${btnBase} ${
            editor.isActive("orderedList") ? btnActive : ""
          }`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_46_2057)">
              <path
                d="M3.875 2.24976H11.375C11.5076 2.24976 11.6348 2.19708 11.7286 2.10331C11.8223 2.00954 11.875 1.88236 11.875 1.74976C11.875 1.61715 11.8223 1.48997 11.7286 1.3962C11.6348 1.30243 11.5076 1.24976 11.375 1.24976H3.875C3.74239 1.24976 3.61521 1.30243 3.52145 1.3962C3.42768 1.48997 3.375 1.61715 3.375 1.74976C3.375 1.88236 3.42768 2.00954 3.52145 2.10331C3.61521 2.19708 3.74239 2.24976 3.875 2.24976Z"
                fill="#667085"
              />
              <path
                d="M11.375 5.50024H3.875C3.74239 5.50024 3.61521 5.55292 3.52145 5.64669C3.42768 5.74046 3.375 5.86764 3.375 6.00024C3.375 6.13285 3.42768 6.26003 3.52145 6.3538C3.61521 6.44757 3.74239 6.50024 3.875 6.50024H11.375C11.5076 6.50024 11.6348 6.44757 11.7286 6.3538C11.8223 6.26003 11.875 6.13285 11.875 6.00024C11.875 5.86764 11.8223 5.74046 11.7286 5.64669C11.6348 5.55292 11.5076 5.50024 11.375 5.50024Z"
                fill="#667085"
              />
              <path
                d="M11.375 9.75H3.875C3.74239 9.75 3.61521 9.80268 3.52145 9.89645C3.42768 9.99021 3.375 10.1174 3.375 10.25C3.375 10.3826 3.42768 10.5098 3.52145 10.6036C3.61521 10.6973 3.74239 10.75 3.875 10.75H11.375C11.5076 10.75 11.6348 10.6973 11.7286 10.6036C11.8223 10.5098 11.875 10.3826 11.875 10.25C11.875 10.1174 11.8223 9.99021 11.7286 9.89645C11.6348 9.80268 11.5076 9.75 11.375 9.75Z"
                fill="#667085"
              />
              <path
                d="M1.10507 8.625C0.885247 8.62513 0.671595 8.6977 0.497158 8.83146C0.322722 8.96522 0.197221 9.15274 0.140068 9.365C0.114209 9.46114 0.127601 9.56362 0.177298 9.64988C0.226996 9.73615 0.308927 9.79914 0.405068 9.825C0.501209 9.85086 0.603684 9.83747 0.689951 9.78777C0.776218 9.73807 0.839209 9.65614 0.865068 9.56C0.8793 9.50714 0.910488 9.46041 0.953844 9.42699C0.9972 9.39357 1.05033 9.37531 1.10507 9.375C1.17137 9.375 1.23496 9.40134 1.28184 9.44822C1.32873 9.49511 1.35507 9.5587 1.35507 9.625C1.35507 9.6913 1.32873 9.75489 1.28184 9.80178C1.23496 9.84866 1.17137 9.875 1.10507 9.875C1.00561 9.875 0.910229 9.91451 0.839903 9.98483C0.769576 10.0552 0.730068 10.1505 0.730068 10.25C0.730068 10.3495 0.769576 10.4448 0.839903 10.5152C0.910229 10.5855 1.00561 10.625 1.10507 10.625C1.17137 10.625 1.23496 10.6513 1.28184 10.6982C1.32873 10.7451 1.35507 10.8087 1.35507 10.875C1.36369 10.9413 1.34561 11.0083 1.30483 11.0613C1.26404 11.1143 1.20387 11.1489 1.13757 11.1575C1.07126 11.1661 1.00425 11.148 0.951272 11.1073C0.898293 11.0665 0.863687 11.0063 0.855068 10.94C0.844072 10.89 0.822966 10.8428 0.793051 10.8013C0.763136 10.7598 0.725043 10.7249 0.681118 10.6986C0.637192 10.6724 0.588362 10.6554 0.537633 10.6488C0.486904 10.6421 0.435349 10.6459 0.386141 10.6599C0.336933 10.6739 0.291112 10.6979 0.251498 10.7303C0.211885 10.7626 0.179317 10.8028 0.155798 10.8482C0.132279 10.8937 0.118307 10.9434 0.114742 10.9945C0.111177 11.0455 0.118094 11.0967 0.135068 11.145C0.202195 11.3753 0.349873 11.5738 0.551163 11.7043C0.752453 11.8348 0.993943 11.8885 1.23158 11.8558C1.46922 11.8231 1.68718 11.706 1.84569 11.526C2.0042 11.3459 2.09271 11.1149 2.09507 10.875C2.09638 10.677 2.03706 10.4833 1.92507 10.32C1.91278 10.2987 1.90631 10.2746 1.90631 10.25C1.90631 10.2254 1.91278 10.2013 1.92507 10.18C2.03706 10.0167 2.09638 9.82302 2.09507 9.625C2.09508 9.36151 1.9911 9.10866 1.80572 8.92141C1.62034 8.73415 1.36855 8.62763 1.10507 8.625Z"
                fill="#667085"
              />
              <path
                d="M2.12499 5.37524C2.12499 5.11003 2.01963 4.85567 1.83209 4.66814C1.64456 4.4806 1.3902 4.37524 1.12499 4.37524C0.859769 4.37524 0.605415 4.4806 0.417879 4.66814C0.230343 4.85567 0.124986 5.11003 0.124986 5.37524C0.126281 5.4743 0.166205 5.56893 0.236253 5.63898C0.3063 5.70902 0.400932 5.74895 0.499986 5.75024C0.599039 5.74895 0.693671 5.70902 0.763719 5.63898C0.833766 5.56893 0.873691 5.4743 0.874986 5.37524C0.874986 5.30894 0.901325 5.24535 0.948209 5.19847C0.995093 5.15158 1.05868 5.12524 1.12499 5.12524C1.19129 5.12524 1.25488 5.15158 1.30176 5.19847C1.34865 5.24535 1.37499 5.30894 1.37499 5.37524C1.37521 5.49207 1.33453 5.60529 1.25999 5.69524L0.204986 7.00024C0.161746 7.05551 0.134653 7.12167 0.12671 7.19139C0.118767 7.26111 0.130285 7.33167 0.159986 7.39524C0.190863 7.45931 0.239097 7.51342 0.299202 7.55142C0.359308 7.58943 0.428873 7.60981 0.499986 7.61024H1.74999C1.84944 7.61024 1.94482 7.57074 2.01515 7.50041C2.08548 7.43008 2.12499 7.3347 2.12499 7.23524C2.12499 7.13579 2.08548 7.04041 2.01515 6.97008C1.94482 6.89975 1.84944 6.86024 1.74999 6.86024H1.53999C1.51698 6.85983 1.49454 6.85307 1.47514 6.84072C1.45573 6.82837 1.4401 6.8109 1.42999 6.79024C1.41644 6.77034 1.4092 6.74682 1.4092 6.72274C1.4092 6.69867 1.41644 6.67515 1.42999 6.65524L1.83499 6.15524C2.01483 5.93423 2.11676 5.66007 2.12499 5.37524Z"
                fill="#667085"
              />
              <path
                d="M2 2.62476H1.875C1.84185 2.62476 1.81005 2.61159 1.78661 2.58814C1.76317 2.5647 1.75 2.53291 1.75 2.49976V0.809756C1.74868 0.627624 1.6754 0.453402 1.54614 0.325081C1.41689 0.196761 1.24214 0.124751 1.06 0.124756H0.75C0.650544 0.124756 0.555161 0.164265 0.484835 0.234591C0.414509 0.304917 0.375 0.4003 0.375 0.499756C0.375 0.599212 0.414509 0.694595 0.484835 0.764921C0.555161 0.835247 0.650544 0.874756 0.75 0.874756H0.875C0.908152 0.874756 0.939946 0.887925 0.963388 0.911367C0.98683 0.93481 1 0.966604 1 0.999756V2.49976C1 2.53291 0.98683 2.5647 0.963388 2.58814C0.939946 2.61159 0.908152 2.62476 0.875 2.62476H0.75C0.650544 2.62476 0.555161 2.66426 0.484835 2.73459C0.414509 2.80492 0.375 2.9003 0.375 2.99976C0.375 3.09921 0.414509 3.19459 0.484835 3.26492C0.555161 3.33525 0.650544 3.37476 0.75 3.37476H2C2.09946 3.37476 2.19484 3.33525 2.26516 3.26492C2.33549 3.19459 2.375 3.09921 2.375 2.99976C2.375 2.9003 2.33549 2.80492 2.26516 2.73459C2.19484 2.66426 2.09946 2.62476 2 2.62476Z"
                fill="#667085"
              />
            </g>
            <defs>
              <clipPath id="clip0_46_2057">
                <rect width="12" height="12" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </button>

        {/* Align */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`${btnBase} ${
            editor.isActive({ textAlign: "left" }) ? btnActive : ""
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.16666 3.83325H9.49999M3.16666 12.1666H9.49999M3.16666 7.99992H12.8333"
              stroke="#667085"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`${btnBase} ${
            editor.isActive({ textAlign: "center" }) ? btnActive : ""
          }`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.16666 5.83325H12.8333M7.16666 14.1666H12.8333M5.16666 9.99992H14.8333"
              stroke="#667085"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`${btnBase} ${
            editor.isActive({ textAlign: "right" }) ? btnActive : ""
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.49999 3.83325H12.8333M6.49999 12.1666H12.8333M3.16666 7.99992H12.8333"
              stroke="#667085"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Link controls */}
        <LinkControl editor={editor} />

        {/* Emoji */}
        <EmojiButton editor={editor} />

        {/* Image from gallery */}
        <button
          type="button"
          onClick={() => setShowImageGallery(true)}
          className={btnBase}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.16669 12.6667L6.99748 10.3379C7.51662 9.67749 8.5097 9.65589 9.05708 10.2931L10.6667 12.1667M9.27672 10.5487C9.96815 9.66919 10.9316 8.42312 10.9943 8.34204L11.0009 8.33352C11.521 7.6774 12.5109 7.65729 13.0571 8.29306L14.6667 10.1667M6.50002 5.16675H13.5C14.2364 5.16675 14.8334 5.7637 14.8334 6.50008V13.5001C14.8334 14.2365 14.2364 14.8334 13.5 14.8334H6.50002C5.76364 14.8334 5.16669 14.2365 5.16669 13.5001V6.50008C5.16669 5.7637 5.76364 5.16675 6.50002 5.16675Z"
              stroke="#667085"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-3 py-2 list-inside">
        <EditorContent editor={editor} />
      </div>

      {/* Gallery modal */}
      {showImageGallery && (
        <ImageGalleryModal
          onSelect={(url) => {
            editor.chain().focus().setImage({ src: url }).run();
            setShowImageGallery(false);
          }}
          onClose={() => setShowImageGallery(false)}
        />
      )}
    </div>
  );
}
