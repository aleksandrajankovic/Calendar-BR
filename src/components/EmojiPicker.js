"use client";
import { useEffect, useRef } from "react";
import data from "@emoji-mart/data";

export default function EmojiCorePicker({ onSelect, theme = "light" }) {
  const hostRef = useRef(null);

  useEffect(() => {
    let picker;
    (async () => {
      const { Picker } = await import("emoji-mart"); // core paket
      picker = new Picker({
        data,
        theme,
        onEmojiSelect: (emoji) => onSelect?.(emoji),
      });
      if (hostRef.current) hostRef.current.appendChild(picker);
    })();

    return () => {
      if (hostRef.current) hostRef.current.innerHTML = "";
      // picker.destroy() postoji u starijim verzijama; bezbedno je čistiti innerHTML
    };
  }, [onSelect, theme]);

  return <div ref={hostRef} className="z-50" />;
}
