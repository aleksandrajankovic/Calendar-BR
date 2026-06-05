// src/lib/scratch/renderScratchModal.js

function extractFirstImg(richHtml = "") {
  if (!richHtml) return { imgSrc: "", restHtml: "" };

  const m = richHtml.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
  const imgSrc = m?.[1] || "";
  const restHtml = imgSrc ? richHtml.replace(m[0], "") : richHtml;

  return { imgSrc, restHtml };
}

export function renderScratchModal({
  title,
  richHtml,
  link,
  button,
  buttonColor,
  type,
  lang,
  shareKey,
  threshold = 0.7,
  coverSrc = "/img/scratchCard.png",
  theme = "default",
}) {
  const { imgSrc, restHtml } = extractFirstImg(richHtml);

  const categoryLabel =
    type === "special"
      ? lang === "pt"
        ? "Promoção especial"
        : "Special promotion"
      : lang === "pt"
      ? "Promoção semanal"
      : "Weekly promotion";

  const isYellow = buttonColor === "yellow";
  const canOpen = link && link !== "#";

  const hintText = lang === "pt" ? "Raspe o cartão" : "Scratch the card";
  const hintText1 = lang === "pt" ? "PARA REVELAR SUA OFERTA DO DIA" : "Scratch to reveal today's offer";

  const safeKey = String(shareKey || "default");

  return `
  <div class="w-full max-w-[420px] mx-auto rounded-3xl overflow-hidden">

    <!-- SCRATCH AREA -->
    <div class="p-4">
      <div class="relative overflow-hidden rounded-2xl" style="height:160px">
        ${
          imgSrc
            ? `<img src="${imgSrc}" alt="" class="absolute inset-0 w-full h-full object-contain" />`
            : `<div class="absolute inset-0 flex items-center justify-center text-white/70 text-sm">Sem imagem</div>`
        }

        <canvas
          id="scratch-canvas"
          data-key="${safeKey}"
          data-cover="${coverSrc}"
          data-threshold="${threshold}"
          data-theme="${theme}"
          class="absolute inset-0 z-10 w-full h-full touch-none select-none"
        ></canvas>
      </div>

      <div
        id="scratch-hint"
        class="mt-3 text-center text-xl font-semibold text-white uppercase"
      >${hintText}</div>

      <div
        id="scratch-hint1"
        class="text-[#FACC01] text-sm text-center uppercase"
      >${hintText1}</div>
    </div>

    <!-- REVEAL CONTENT -->
    <div
      id="scratch-reveal"
      class="
        px-4 pb-5
        overflow-hidden
        max-h-0 opacity-0 translate-y-2
        pointer-events-none
        transition-all duration-500 ease-out
      "
    >
      <h2 class="font-bold text-[22px] md:text-[26px] text-center text-white">
        ${title}
      </h2>

      <div class="text-[11px] uppercase tracking-[0.12em] text-[#FACC01] mt-2 text-center">
        ${categoryLabel}
      </div>

      ${
        restHtml
          ? `<div class="mt-3 text-sm text-white/90
                    [&_p]:mb-2 [&_p:last-child]:mb-0
                    [&_strong]:font-semibold
                    [&_ul]:list-disc [&_ul]:pl-5">
              ${restHtml}
            </div>`
          : ""
      }

      ${
        canOpen
          ? `<div class="pt-5 flex justify-center">
              <a href="${link}" target="_blank" rel="noreferrer"
                 class="w-4/5 max-w-[360px] px-4 py-3 rounded-[10px]
                        text-sm text-center font-semibold
                        ${
                          isYellow
                            ? "bg-[#FACC01] text-black"
                            : "bg-[#17BB00] text-white"
                        }
                        hover:brightness-110 transition">
                ${button}
              </a>
            </div>`
          : ""
      }
    </div>
  </div>
  `;
}
