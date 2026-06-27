/**
 * mapUtils.js
 * Utility functions for the Leaflet interactive map.
 * All functions are pure (no side effects) for easy testability.
 */

import citiesData from "../data/cities.json";
import themesData from "../data/themes.json";

// ─── City Coordinate Lookup ───────────────────────────────────────────────────

/**
 * Returns { lat, lng } for a given city name.
 * Falls back to Turkey's geographic centre if not found.
 */
export function getCityCoords(cityName) {
  if (!cityName) return { lat: 39.1, lng: 35.0 };
  const normalized = cityName.toLocaleLowerCase("tr-TR");
  const match = citiesData.find(
    (c) => c.ad.toLocaleLowerCase("tr-TR") === normalized
  );
  return match ? { lat: match.lat, lng: match.lng } : { lat: 39.1, lng: 35.0 };
}

/**
 * Returns deterministically computed { lat, lng } coordinates for a school
 * based on its name and its city's coordinates to keep it stable.
 */
export function getSchoolCoords(school, cityName) {
  if (!school) return { lat: 39.1, lng: 35.0 };
  if (school.enlem && school.boylam) {
    return { lat: Number(school.enlem), lng: Number(school.boylam) };
  }
  const cityCoords = getCityCoords(cityName);
  const str = school.ad || "";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = ((Math.abs(hash) % 1000) / 1000 - 0.5) * 0.15;
  const lngOffset = ((Math.abs(hash * 31) % 1000) / 1000 - 0.5) * 0.15;
  return {
    lat: cityCoords.lat + latOffset,
    lng: cityCoords.lng + lngOffset
  };
}


// ─── Province Colour Helpers ──────────────────────────────────────────────────

/**
 * Returns a Leaflet-compatible style object for a GeoJSON province feature.
 * Colour intensity scales with event count (0 → transparent, 10+ → deep red).
 */
export function getProvinceStyle(cityName, eventCount, isSelected) {
  if (isSelected) {
    return {
      fillColor: "#d90429",
      fillOpacity: 0.45,
      color: "#d90429",
      weight: 2.5,
      opacity: 1,
    };
  }
  if (eventCount > 0) {
    const intensity = Math.min(eventCount / 10, 1); // 0.0 – 1.0
    const opacity = 0.08 + intensity * 0.32;       // 0.08 – 0.40
    return {
      fillColor: "#e63946",
      fillOpacity: opacity,
      color: "#adb5bd",
      weight: 1,
      opacity: 0.8,
    };
  }
  return {
    fillColor: "#f8f9fa",
    fillOpacity: 0.05,
    color: "#adb5bd",
    weight: 1,
    opacity: 0.7,
  };
}

/**
 * Hover style — slightly brighter fill.
 */
export function getProvinceHoverStyle() {
  return {
    fillOpacity: 0.35,
    color: "#6c757d",
    weight: 2,
  };
}

// ─── GeoJSON Province Name Extraction ────────────────────────────────────────

/**
 * Extracts the Turkish province name from a GeoJSON feature.
 * Handles multiple common property key names from different GeoJSON sources.
 */
export function getProvinceNameFromFeature(feature) {
  const props = feature?.properties ?? {};
  // Different GeoJSON sources use different keys
  return (
    props.NAME_1 ||
    props.name ||
    props.il_adi ||
    props.ADI ||
    props.province ||
    props.il ||
    ""
  );
}

// ─── Marker Icon Helpers ──────────────────────────────────────────────────────

/**
 * Creates SVG-based custom DivIcon HTML for an event marker.
 * Using DivIcon avoids Leaflet's broken default icon path issue in Vite.
 */
export function createEventMarkerHtml(color = "#d90429") {
  return `
    <div style="
      width: 32px; height: 32px;
      background: ${color};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    "></div>`;
}

/**
 * Creates SVG-based custom DivIcon HTML for a school marker.
 */
export function createSchoolMarkerHtml() {
  return `
    <div style="
      width: 28px; height: 28px;
      background: #1d6fe8;
      border-radius: 6px;
      border: 3px solid #fff;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.30);
      font-size: 14px; line-height: 1;
    ">🏫</div>`;
}

// ─── Heat Map Point Builder ───────────────────────────────────────────────────

/**
 * Converts a list of approved events to leaflet-heat compatible point array.
 * Returns [[lat, lng, intensity], ...]
 */
export function buildHeatPoints(events) {
  const cityEventCounts = {};
  events.forEach((ev) => {
    if (!ev.il) return;
    cityEventCounts[ev.il] = (cityEventCounts[ev.il] ?? 0) + 1;
  });

  return Object.entries(cityEventCounts).map(([cityName, count]) => {
    const coords = getCityCoords(cityName);
    const intensity = Math.min(count / 10, 1);
    return [coords.lat, coords.lng, intensity];
  });
}

// ─── Popup Content Builder ────────────────────────────────────────────────────

/**
 * Builds the HTML string for an event marker popup.
 */
export function buildEventPopupHtml(event) {
  const dateStr = event.tarih
    ? new Date(event.tarih).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
      })
    : "";

  // Get theme metadata
  const themeObj = themesData.find((t) => t.kisaKod === event.tema) || {
    ad: event.temaAd || event.tema || "Diğer",
    renk: "#1d6fe8",
  };

  const shortThemeAd = themeObj.ad.split(" — ")[0];
  const eventTitle = event.ad || event.baslik || "Etkinlik";
  const locationText = event.ilce ? `${event.il}, ${event.ilce}` : event.il || "";

  // Short description snippet (max 75 chars)
  const descSnippet = event.aciklama
    ? event.aciklama.length > 75
      ? event.aciklama.slice(0, 75) + "..."
      : event.aciklama
    : "";

  // Participant info
  let participantHtml = "";
  if (event.durum === "duyuru") {
    participantHtml = `<span class="map-popup-meta-item">👥 Başvuru Açık</span>`;
  } else if (event.katilimciSayisi) {
    participantHtml = `<span class="map-popup-meta-item">👥 ${event.katilimciSayisi} Katılımcı</span>`;
  }

  return `
    <div class="map-popup-event" style="border-top: 4px solid ${themeObj.renk};">
      <div class="map-popup-header">
        <span class="map-popup-badge theme-badge" style="background-color: ${themeObj.renk}15; color: ${themeObj.renk};">
          ${shortThemeAd}
        </span>
        <span class="map-popup-badge format-badge">
          ${event.format || "Etkinlik"}
        </span>
      </div>
      <h4 class="map-popup-title">${eventTitle}</h4>
      ${descSnippet ? `<p class="map-popup-desc">${descSnippet}</p>` : ""}
      <div class="map-popup-meta">
        ${dateStr ? `<span class="map-popup-meta-item">📅 ${dateStr}</span>` : ""}
        ${locationText ? `<span class="map-popup-meta-item">📍 ${locationText}</span>` : ""}
        ${participantHtml}
      </div>
      <button
        class="map-popup-detail-btn"
        data-event-id="${event.id}"
        style="background-color: ${themeObj.renk};"
        aria-label="${eventTitle} detaylarını gör"
      >
        Detaya Git <span class="arrow">→</span>
      </button>
    </div>`;
}


/**
 * Builds the HTML string for a school marker popup.
 */
export function buildSchoolPopupHtml(school, ilce) {
  return `
    <div class="map-popup-school">
      <div class="map-popup-school-title">🏫 ${school.ad}</div>
      ${ilce ? `<div class="map-popup-school-meta">📍 ${ilce}</div>` : ""}
      ${school.website ? `
        <div style="margin-top: 8px;">
          <a href="${school.website}" target="_blank" class="map-popup-school-link">
            🔗 Web Sitesi <span class="arrow">↗</span>
          </a>
        </div>
      ` : ""}
      <button
        class="map-popup-school-detail-btn"
        data-school-name="${school.ad}"
        style="
          margin-top: 12px;
          width: 100%;
          padding: 8px 12px;
          background-color: var(--primary, #d90429);
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background-color 0.2s ease;
        "
        aria-label="${school.ad} detaylarını gör"
      >
        Okul Profilini Gör <span class="arrow">→</span>
      </button>
    </div>`;
}
