/**
 * TOOLTIP - Optionale Tooltip-Funktionalität
 * Click-basierte Modul-Details
 */

window.StudienplanTooltip = {
  currentTooltip: null,

  initialize() {
    // Klick-Listener für alle Module (außer Platzhaltern)
    document.addEventListener("click", (e) => {
      // Direkte Link-Indikatoren nicht abfangen – sie öffnen das PDF/Link direkt
      if (
        e.target.closest(
          "a.exam-btn, a.zsf-btn, a.video-indicator, a.script-indicator, a.link-indicator, a.kurslink-indicator",
        )
      ) {
        return;
      }
      const modul = e.target.closest(".modul");
      if (modul && !modul.classList.contains("modul-platzhalter")) {
        e.preventDefault();
        e.stopPropagation();
        this.showTooltip(modul);
      } else if (e.target.closest(".tooltip-container")) {
        // Klick im Tooltip - nicht schließen
        return;
      } else {
        // Klick außerhalb - Tooltip schließen
        this.hideTooltip();
      }
    });

    // Warte bis Details geladen sind, dann füge Indikatoren hinzu
    this.waitForDetailsAndAddIndicators();

    console.log("✅ Tooltip-System initialisiert (Click-basiert)");
  },

  waitForDetailsAndAddIndicators() {
    // Prüfe wiederholt ob Details geladen sind
    const checkDetails = () => {
      if (
        window.StudiengangModuleDetails &&
        Object.keys(window.StudiengangModuleDetails).length > 0
      ) {
        this.addIndicatorsToAllModules();
      } else {
        // Versuche in 100ms wieder
        setTimeout(checkDetails, 100);
      }
    };
    checkDetails();
  },

  addIndicatorsToAllModules() {
    // Finde alle Module (außer Platzhaltern)
    const modules = document.querySelectorAll(".modul:not(.modul-platzhalter)");
    modules.forEach((modul) => {
      const name = modul.querySelector(".modul-titel")?.textContent;
      if (name && window.StudiengangModuleDetails[name]) {
        this.addIndicators(modul, window.StudiengangModuleDetails[name]);
      }
    });
  },

  addIndicators(moduleElement, details) {
    // === Top-right icon indicators ===
    let container = moduleElement.querySelector(".indicators-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "indicators-container";
      moduleElement.style.position = "relative";
      moduleElement.appendChild(container);
    }
    container.innerHTML = "";

    if (details.vorlesungslink) {
      const indicator = document.createElement("a");
      indicator.className = "video-indicator";
      indicator.href = details.vorlesungslink;
      indicator.target = "_blank";
      indicator.rel = "noopener noreferrer";
      indicator.title = "Vorlesungsvideos";
      indicator.textContent = "🎥";
      container.appendChild(indicator);
    }

    if (details.skript) {
      const indicator = document.createElement("a");
      indicator.className = "script-indicator";
      indicator.href = details.skript;
      indicator.target = "_blank";
      indicator.rel = "noopener noreferrer";
      indicator.title = "Skript";
      indicator.textContent = "📄";
      container.appendChild(indicator);
    }

    if (details.link) {
      const linkUrl = Array.isArray(details.link)
        ? details.link[0]
        : details.link;
      const indicator = document.createElement("a");
      indicator.className = "link-indicator";
      indicator.href = linkUrl;
      indicator.target = "_blank";
      indicator.rel = "noopener noreferrer";
      indicator.title = "VVZ Seite";
      indicator.textContent = "📖";
      container.appendChild(indicator);
    }

    if (details.kurslink) {
      const kurslinkUrl =
        typeof details.kurslink === "string" && details.kurslink.includes("\n")
          ? details.kurslink.split("\n").filter(Boolean)[0].trim()
          : details.kurslink;
      const indicator = document.createElement("a");
      indicator.className = "kurslink-indicator";
      indicator.href = kurslinkUrl;
      indicator.target = "_blank";
      indicator.rel = "noopener noreferrer";
      indicator.title = "Kursunterlagen";
      indicator.textContent = "📚";
      container.appendChild(indicator);
    }

    // === Bottom rectangular buttons for Prüfung & Zusammenfassung ===
    let btnContainer = moduleElement.querySelector(".module-btns");
    if (!btnContainer) {
      btnContainer = document.createElement("div");
      btnContainer.className = "module-btns";
      moduleElement.appendChild(btnContainer);
    }
    btnContainer.innerHTML = "";

    if (details.pruefungen) {
      let examUrl = null;
      let zsfUrl = null;

      if (Array.isArray(details.pruefungen)) {
        const examEntries = details.pruefungen.filter(
          (p) => !p.label.toLowerCase().includes("zusammenfassung"),
        );
        const zsfEntries = details.pruefungen.filter((p) =>
          p.label.toLowerCase().includes("zusammenfassung"),
        );
        if (examEntries.length > 0) examUrl = examEntries[0].url;
        if (zsfEntries.length > 0) zsfUrl = zsfEntries[0].url;
      } else {
        examUrl = details.pruefungen;
      }

      if (examUrl) {
        const btn = document.createElement("a");
        btn.className = "exam-btn";
        btn.href = examUrl;
        btn.target = "_blank";
        btn.rel = "noopener noreferrer";
        btn.title = "Alte Prüfung";
        btn.textContent = "📝 Prüfung";
        btnContainer.appendChild(btn);
      }

      if (zsfUrl) {
        const btn = document.createElement("a");
        btn.className = "zsf-btn";
        btn.href = zsfUrl;
        btn.target = "_blank";
        btn.rel = "noopener noreferrer";
        btn.title = "Zusammenfassung / Spick";
        btn.textContent = "📋 Spick";
        btnContainer.appendChild(btn);
      }
    }
  },

  showTooltip(moduleElement) {
    const tooltip = document.getElementById("tooltip");
    if (!tooltip) return;

    const name = moduleElement.querySelector(".modul-titel")?.textContent;
    const ects = moduleElement.querySelector(".modul-kp")?.textContent;

    let detailsHTML = "";
    if (
      window.StudiengangModuleDetails &&
      window.StudiengangModuleDetails[name]
    ) {
      const details = window.StudiengangModuleDetails[name];
      const hilfsmittel = details.hilfsmittel;

      detailsHTML = `<h3>${name}</h3>`;
      if (ects) {
        detailsHTML += `<div style="font-size:0.9em;color:#666;margin-bottom:8px;">${ects}</div>`;
      }

      if (hilfsmittel) {
        const items = Array.isArray(hilfsmittel) ? hilfsmittel : [hilfsmittel];
        detailsHTML += `<h4 style="margin-bottom:6px;">&#x1F4CB; Erlaubte Hilfsmittel</h4>`;
        detailsHTML += `<ul style="margin:0;padding-left:18px;font-size:0.9em;line-height:1.7;">`;
        items.forEach((item) => {
          detailsHTML += `<li>${item}</li>`;
        });
        detailsHTML += `</ul>`;
      } else {
        detailsHTML += `<p style="color:#999;font-size:0.9em;">Keine Hilfsmittel-Info verfügbar</p>`;
      }
    } else {
      detailsHTML = `
        <h3>${name}</h3>
        ${ects ? `<div style="font-size:0.9em;color:#666;">${ects}</div>` : ""}
        <p style="color:#999;font-size:0.9em;">Keine Hilfsmittel-Info verfügbar</p>
      `;
    }

    tooltip.innerHTML = detailsHTML;

    // Positioniere Tooltip direkt neben dem Modul
    const rect = moduleElement.getBoundingClientRect();
    const tooltipWidth = 320;
    const padding = 10;

    // Standard: rechts vom Modul
    let left = rect.right + padding;
    let top = rect.top + window.scrollY;

    // Wenn rechts nicht passt: links vom Modul
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = rect.left - tooltipWidth - padding;
    }

    // Fallback: wenn auch links nicht passt, zentriere
    if (left < padding) {
      left = padding;
    }

    tooltip.style.position = "absolute";
    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
    tooltip.style.display = "block";

    this.currentTooltip = moduleElement;
  },

  hideTooltip() {
    const tooltip = document.getElementById("tooltip");
    if (tooltip) {
      tooltip.style.display = "none";
    }
    this.currentTooltip = null;
  },
};

// Initialisiere sofort oder wenn DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.StudienplanTooltip.initialize();
  });
} else {
  window.StudienplanTooltip.initialize();
}

// Markiere als geladen
window.subModulesReady["tooltip"] = Promise.resolve();
