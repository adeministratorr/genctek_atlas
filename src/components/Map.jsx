import { useEffect, useState, useRef, useMemo } from "react";
import { useApp } from "../context/AppContext";
import LeafletMap from "./LeafletMap";

/**
 * Map.jsx — Unified map wrapper.
 * Renders a toggle between the original SVG Turkey map and the new
 * interactive Leaflet + OpenStreetMap map.
 */
const Map = () => {
  const {
    selectedCity,
    setSelectedCity,
    activeCitiesList,
    allEventsRaw,
    allProjectsRaw,
    isOffline,
  } = useApp();

  // 'svg' | 'leaflet'
  const [mapMode, setMapMode] = useState("svg");

  // Force SVG map mode when offline
  useEffect(() => {
    if (isOffline) {
      setTimeout(() => setMapMode("svg"), 0);
    }
  }, [isOffline]);

  const [svgContent, setSvgContent] = useState("");
  const mapRef    = useRef(null);
  const tooltipRef = useRef(null);

  // Memoised SVG container — prevents React from re-creating DOM nodes on every render
  const svgMapContainer = useMemo(() => {
    if (!svgContent)
      return <div className="empty-state">Harita yükleniyor...</div>;
    return (
      <div
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
      />
    );
  }, [svgContent]);

  // Fetch SVG on mount (only needed when SVG mode is active or about to switch)
  useEffect(() => {
    if (svgContent) return; // already fetched
    fetch("/assets/map/turkey.svg?v=1.1")
      .then((res) => {
        if (!res.ok) throw new Error("Harita yüklenemedi");
        return res.text();
      })
      .then((data) => setSvgContent(data))
      .catch((err) => console.error("SVG Map Fetch Error:", err));
  }, [svgContent]);

  // Update SVG path classes (selected, has-events) without replacing DOM nodes
  useEffect(() => {
    if (mapMode !== "svg" || !svgContent || !mapRef.current) return;

    const svgElement = mapRef.current.querySelector("svg");
    if (!svgElement) return;

    svgElement.classList.add("turkey-map-svg");
    svgElement.setAttribute("width", "100%");
    svgElement.removeAttribute("height");
    svgElement.style.width  = "100%";
    svgElement.style.height = "auto";
    svgElement.style.maxWidth = "100%";

    const paths = svgElement.querySelectorAll("path");
    paths.forEach((path) => {
      const parentG  = path.parentElement;
      const cityName =
        parentG.getAttribute("data-iladi") || path.getAttribute("data-iladi");
      if (!cityName) return;

      path.classList.remove("selected", "has-events");
      if (activeCitiesList.includes(cityName)) path.classList.add("has-events");
      if (selectedCity === cityName) path.classList.add("selected");
    });
  }, [mapMode, svgContent, selectedCity, activeCitiesList]);

  // SVG event delegation
  useEffect(() => {
    if (mapMode !== "svg") return;
    const mapContainer = mapRef.current;
    if (!mapContainer || !svgContent) return;

    const handleMouseOver = (e) => {
      const path = e.target.closest("path");
      if (!path) return;
      const parentG  = path.parentElement;
      const cityName =
        parentG.getAttribute("data-iladi") || path.getAttribute("data-iladi");
      if (!cityName) return;

      const eventCount   = allEventsRaw.filter((ev) => ev.il === cityName && ev.onaylandi).length;
      const projectCount = allProjectsRaw.filter((p)  => p.katilimciIller?.includes(cityName) && p.onaylandi).length;
      const rect = mapContainer.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top - 20;

      if (tooltipRef.current) {
        tooltipRef.current.style.display = "block";
        tooltipRef.current.style.left    = `${x}px`;
        tooltipRef.current.style.top     = `${y}px`;
        tooltipRef.current.textContent   = `${cityName} (${eventCount} Etkinlik, ${projectCount} Proje)`;
      }
    };

    const handleMouseMove = (e) => {
      const path = e.target.closest("path");
      if (!path || !tooltipRef.current) return;
      const rect = mapContainer.getBoundingClientRect();
      tooltipRef.current.style.left = `${e.clientX - rect.left}px`;
      tooltipRef.current.style.top  = `${e.clientY - rect.top - 20}px`;
    };

    const handleMouseOut = (e) => {
      const path = e.target.closest("path");
      if (!path) return;
      if (tooltipRef.current) tooltipRef.current.style.display = "none";
    };

    const handleClick = (e) => {
      const path = e.target.closest("path");
      if (!path) return;
      const parentG  = path.parentElement;
      const cityName =
        parentG.getAttribute("data-iladi") || path.getAttribute("data-iladi");
      if (!cityName) return;
      setSelectedCity(selectedCity === cityName ? "" : cityName);
    };

    mapContainer.addEventListener("mouseover",  handleMouseOver);
    mapContainer.addEventListener("mousemove",  handleMouseMove);
    mapContainer.addEventListener("mouseout",   handleMouseOut);
    mapContainer.addEventListener("click",      handleClick);

    return () => {
      mapContainer.removeEventListener("mouseover",  handleMouseOver);
      mapContainer.removeEventListener("mousemove",  handleMouseMove);
      mapContainer.removeEventListener("mouseout",   handleMouseOut);
      mapContainer.removeEventListener("click",      handleClick);
    };
  }, [mapMode, svgContent, selectedCity, setSelectedCity, allEventsRaw, allProjectsRaw]);

  return (
    <section className="map-section" id="map-section">
      {/* Header with mode toggle */}
      <div className="section-header" style={{ flexWrap: "wrap", gap: "8px" }}>
        <h3 className="section-title">İnteraktif Türkiye Haritası</h3>

        <div className="map-mode-toggle" role="group" aria-label="Harita görünüm seçimi">
          <button
            id="map-toggle-svg"
            className={`map-mode-btn ${mapMode === "svg" ? "active" : ""}`}
            onClick={() => setMapMode("svg")}
            aria-pressed={mapMode === "svg"}
          >
            🗺️ SVG
          </button>
          <button
            id="map-toggle-leaflet"
            className={`map-mode-btn ${mapMode === "leaflet" ? "active" : ""}`}
            onClick={() => !isOffline && setMapMode("leaflet")}
            disabled={isOffline}
            title={isOffline ? "İnternet bağlantısı yok" : "İnternet haritasına geç"}
            aria-pressed={mapMode === "leaflet"}
          >
            🌍 İnteraktif (OSM) {isOffline && "🔒"}
          </button>
        </div>

        {selectedCity && (
          <button
            className="card-btn secondary"
            onClick={() => setSelectedCity("")}
            style={{ padding: "4px 12px", fontSize: "12px" }}
          >
            Filtreyi Temizle ({selectedCity})
          </button>
        )}
      </div>

      {/* SVG Map */}
      {mapMode === "svg" && (
        <div className="map-wrapper" ref={mapRef}>
          {svgMapContainer}
          <div
            ref={tooltipRef}
            className="map-tooltip"
            style={{
              display: "none",
              position: "absolute",
              pointerEvents: "none",
              transform: "translate(-50%, -50%)",
              transition: "opacity 0.15s ease-out",
            }}
          />
        </div>
      )}

      {/* Leaflet Map */}
      {mapMode === "leaflet" && <LeafletMap />}
    </section>
  );
};

export default Map;
