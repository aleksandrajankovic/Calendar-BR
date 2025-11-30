// lib/calendarInteractions.js

// -----------------------------
// RENDER MODALA
// -----------------------------
function renderModalHTML(entry, lang = "pt") {
  if (!entry) {
    return lang === "pt"
      ? "<p>Sem promoções neste dia.</p>"
      : "<p>No promotions for this day.</p>";
  }

  const { promo, day, type } = entry;

  // koristimo top-level vrednosti, pa ako nema, padamo na promo.*
  const title = entry.title || (promo && promo.title) || "";
  const button = entry.button || (promo && promo.button) || "";
  const buttonColor =
    entry.buttonColor || (promo && promo.buttonColor) || "green";
  const link = entry.link || (promo && promo.link) || "";
  const richHtml = entry.richHtml || (promo && promo.richHtml) || "";

  // ako baš nemamo nikakav sadržaj
  if (!promo && !richHtml) {
    return lang === "pt"
      ? "<p>Sem promoções neste dia.</p>"
      : "<p>No promotions for this day.</p>";
  }

  // --- izvlačenje prve <img> iz richHtml ---
  let imageHtml = null;
  let contentHtml = richHtml;

  if (contentHtml) {
    const imgMatch = contentHtml.match(/<img[^>]*>/i);
    if (imgMatch) {
      imageHtml = imgMatch[0];
      contentHtml = contentHtml.replace(imgMatch[0], "");
    }
  }

  // --- kategorija (žuti label) ---
  let categoryLabel;
  if (type === "special") {
    categoryLabel = lang === "pt" ? "Promoção especial" : "Special promotion";
  } else {
    categoryLabel = lang === "pt" ? "Promoção semanal" : "Weekly promotion";
  }

  // --- button ---
  const openUrl = link && String(link);
  const canOpen = openUrl && openUrl !== "#";

  const isYellow = buttonColor === "yellow";

  const defaultButtonLabel =
    button || (lang === "pt" ? "Registrar-se" : "Register");

  // --- HTML struktura: slika → title → žuti label → opis → dugme ---
  return `
    <div class="flex flex-col w-full max-w-[420px] mx-auto">
      ${
        imageHtml
          ? `
        <div class="mb-4 [&_img]:w-full [&_img]:h-auto [&_img]:rounded-2xl">
          ${imageHtml}
        </div>`
          : ""
      }

      <h2 class="font-bold text-[24px] md:text-[28px] leading-tight mb-2 text-center text-white">
        ${title}
      </h2>


      ${
        contentHtml
          ? `
        <div class="
          text-sm leading-relaxed text-white/90
          [&_p]:mb-2 [&_p:last-child]:mb-0
          [&_strong]:font-semibold
          [&_ul]:list-disc [&_ul]:pl-5
        ">
          ${contentHtml}
        </div>`
          : ""
      }

      ${
        canOpen
          ? `
        <div class="pt-5 mt-2 flex justify-center">
          <a
            href="${openUrl}"
            target="_blank"
            rel="noreferrer"
            class="
              w-4/5 max-w-[360px]
              inline-flex items-center justify-center
              px-4 py-3
              rounded-[10px]
              text-sm font-semibold font-condensed
              shadow-[0_10px_25px_rgba(0,0,0,0.6)]
              transition
              ${
                isYellow
                  ? "bg-[#FACC01] text-black hover:brightness-110"
                  : "bg-[#17BB00] text-white hover:brightness-110"
              }
            "
          >
            ${defaultButtonLabel}
          </a>
        </div>`
          : ""
      }
    </div>
  `;
}

// -----------------------------
// INIT FUNKCIJA
// -----------------------------
export function initCalendarInteractions(rootSelector = "#calendar-root") {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const dataEl = root.querySelector("#calendar-data");
  if (!dataEl) return;

  const payload = JSON.parse(dataEl.textContent || "{}");
  const days = Array.isArray(payload.days) ? payload.days : [];
  const lang = payload.lang || "pt";

  const modal = root.querySelector("#promo-modal");
  const content = root.querySelector("#promo-content");
  const closeBtn = root.querySelector("#promo-close");
  const dialog = modal ? modal.querySelector("#promo-dialog") : null;

  if (!modal || !content) return;

  let isOpen = false;
  let previousUrl = null;

  function animateOpen() {
    if (!dialog) return;

    // reset na zatvoreno stanje
    dialog.classList.remove("opacity-100", "translate-y-0", "scale-100");
    dialog.classList.add("opacity-0", "translate-y-4", "scale-95");

    // sledeći frame → otvoreno stanje
    requestAnimationFrame(() => {
      dialog.classList.remove("opacity-0", "translate-y-4", "scale-95");
      dialog.classList.add("opacity-100", "translate-y-0", "scale-100");
    });
  }

  function animateClose(cb) {
    if (!dialog) {
      cb?.();
      return;
    }

    dialog.classList.remove("opacity-100", "translate-y-0", "scale-100");
    dialog.classList.add("opacity-0", "translate-y-4", "scale-95");

    // duration mora da se poklopi sa Tailwind `duration-200`
    setTimeout(() => {
      cb?.();
    }, 200);
  }

  function openModal(entry) {
    content.innerHTML = renderModalHTML(entry, lang);

    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    isOpen = true;

    previousUrl = window.location.href;

    if (entry && entry.shareUrl) {
      history.pushState({ promo: true }, "", entry.shareUrl);
    }

    animateOpen();
  }

  function closeModal({ fromPopstate = false } = {}) {
    isOpen = false;
    document.body.style.overflow = "";

    animateClose(() => {
      modal.classList.add("hidden");

      if (!fromPopstate && previousUrl) {
        history.replaceState(null, "", previousUrl);
      }
    });
  }

  // Klik na dan - otvori modal
  root.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-day-button]");
    if (!btn) return;

    const day = Number(btn.getAttribute("data-day"));
    const entry = days.find((d) => d.day === day);

    if (!entry) return;

    openModal(entry);
  });

  // Zatvaranje – X dugme
  closeBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal();
  });

  // Klik na overlay
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // ESC
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      closeModal();
    }
  });

  // Back/forward u browseru
  window.addEventListener("popstate", () => {
    if (isOpen) {
      closeModal({ fromPopstate: true });
    }
  });
}

export default initCalendarInteractions;
