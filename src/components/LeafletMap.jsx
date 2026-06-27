/**
 * LeafletMap.jsx
 * Interactive Turkey map built with Leaflet + OpenStreetMap.
 *
 * Features:
 *  - OpenStreetMap tile layer (free, no API key)
 *  - Turkey province boundaries via GeoJSON (with hover/click)
 *  - Event markers with MarkerCluster (count badges on clusters)
 *  - School markers (toggle on/off)
 *  - Heat-map mode toggle (via leaflet-heat CDN script)
 *  - Toolbar: Pins | Heatmap | Schools | Reset view
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useApp } from "../context/AppContext";
import {
  getCityCoords,
  getSchoolCoords,
  getProvinceStyle,
  getProvinceHoverStyle,
  getProvinceNameFromFeature,
  buildEventPopupHtml,
  buildSchoolPopupHtml,
  buildHeatPoints,
  createEventMarkerHtml,
  createSchoolMarkerHtml,
} from "../utils/mapUtils";

// ─── Constants ────────────────────────────────────────────────────────────────
const TURKEY_CENTER = [39.1, 35.0];
const TURKEY_ZOOM   = 6;
const GEOJSON_URL   = "/data/turkey-provinces.geojson";

// ─── Component ────────────────────────────────────────────────────────────────
const LeafletMap = () => {
  const {
    selectedCity,
    setSelectedCity,
    allEventsRaw,
    allProjectsRaw,
    schoolsData,
    loadSchoolsForCity,
    setSelectedDetailEvent,
    setSelectedSchool,
    setModalType,
    fetchSchoolDetails,
  } = useApp();

  const mapContainerRef = useRef(null);
  const mapRef          = useRef(null);   // L.Map instance
  const geoJsonRef      = useRef(null);   // GeoJSON layer
  const clusterRef      = useRef(null);   // MarkerClusterGroup
  const schoolsRef      = useRef(null);   // School markers layer
  const heatRef         = useRef(null);   // Heat layer
  const prevCityRef     = useRef(null);   // Track previous selectedCity for re-styling
  const allEventsRef    = useRef([]);     // Always-current events list (for popup click handler)

  // Keep allEventsRef in sync — fixes stale closure in the map click handler
  useEffect(() => {
    allEventsRef.current = allEventsRaw;
  }, [allEventsRaw]);

  const [viewMode, setViewMode]         = useState("pins");     // 'pins' | 'heat'
  const [showSchools, setShowSchools]   = useState(false);
  const [geoJsonData, setGeoJsonData]   = useState(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [loadError, setLoadError]       = useState(null);
  const [LLib, setLLib]                 = useState(null);       // Leaflet library ref

  // Approved events only
  const approvedEvents = allEventsRaw.filter((e) => e.onaylandi);


  // ─── Load Leaflet dynamically (avoids SSR issues) ────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet.markercluster");
        if (!cancelled) setLLib(L);
      } catch {
        if (!cancelled) setLoadError("Harita kütüphanesi yüklenemedi.");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ─── Fetch GeoJSON ───────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    fetch(GEOJSON_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`GeoJSON fetch failed: ${r.status}`);
        return r.json();
      })
      .then((data) => { if (!cancelled) setGeoJsonData(data); })
      .catch(() => {
        if (!cancelled) {
          // Silently degrade: map works without province boundaries
          setGeoJsonData(null);
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // ─── Initialise Leaflet map (runs once Leaflet is loaded) ────────────────
  useEffect(() => {
    if (!LLib || !mapContainerRef.current || mapRef.current) return;

    const map = LLib.map(mapContainerRef.current, {
      center: TURKEY_CENTER,
      zoom: TURKEY_ZOOM,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // OpenStreetMap tiles
    LLib.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // ── Popup'taki "Detaya Git" butonunu dinle ──────────────────────────────
    // Leaflet popup DOM'u Leaflet'in kendi event sistemi üzerinden yönetilir.
    // popupopen anında buton henüz DOM'a eklenmemiş olabilir;
    // bu yüzden mapContainerRef üzerinde event delegation kullanıyoruz.
    const handlePopupClick = (e) => {
      const btn = e.target.closest("[data-event-id]");
      if (btn) {
        const eventId = btn.getAttribute("data-event-id");
        const found = allEventsRef.current.find((ev) => ev.id === eventId);
        if (found) {
          map.closePopup();
          setSelectedDetailEvent(found);
        }
        return;
      }

      const schoolBtn = e.target.closest("[data-school-name]");
      if (schoolBtn) {
        const schoolName = schoolBtn.getAttribute("data-school-name");
        map.closePopup();
        setSelectedSchool(schoolName);
        fetchSchoolDetails(schoolName);
        setModalType("school-profile");
      }
    };
    const container = mapContainerRef.current;
    container.addEventListener("click", handlePopupClick);

    mapRef.current = map;

    return () => {
      container?.removeEventListener("click", handlePopupClick);
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [LLib]);

  // ─── Province GeoJSON layer ───────────────────────────────────────────────
  const styleFeature = useCallback(
    (feature) => {
      const name  = getProvinceNameFromFeature(feature);
      const count = approvedEvents.filter((e) => e.il === name).length;
      const isSelected = name === selectedCity;
      return getProvinceStyle(name, count, isSelected);
    },
    [approvedEvents, selectedCity]
  );

  useEffect(() => {
    if (!LLib || !mapRef.current || !geoJsonData) return;

    // Remove old layer
    if (geoJsonRef.current) {
      mapRef.current.removeLayer(geoJsonRef.current);
    }

    const layer = LLib.geoJSON(geoJsonData, {
      style: styleFeature,
      onEachFeature: (feature, layer) => {
        const name  = getProvinceNameFromFeature(feature);
        const evCnt = approvedEvents.filter((e) => e.il === name).length;
        const prCnt = allProjectsRaw.filter(
          (p) => p.katilimciIller?.includes(name) && p.onaylandi
        ).length;

        layer.bindTooltip(
          `<strong>${name}</strong><br/>
           🗓 ${evCnt} Etkinlik &nbsp; 📁 ${prCnt} Proje`,
          { sticky: true, className: "leaflet-province-tooltip" }
        );

        layer.on({
          mouseover: (e) => {
            e.target.setStyle(getProvinceHoverStyle());
            e.target.bringToFront();
          },
          mouseout: (e) => {
            layer.resetStyle(e.target);
          },
          click: () => {
            setSelectedCity(selectedCity === name ? "" : name);
          },
        });
      },
    }).addTo(mapRef.current);

    geoJsonRef.current = layer;
  }, [LLib, geoJsonData, styleFeature, selectedCity, setSelectedCity, approvedEvents, allProjectsRaw]);

  // ─── Event Marker Cluster ─────────────────────────────────────────────────
  useEffect(() => {
    if (!LLib || !mapRef.current) return;
    if (viewMode !== "pins") return;

    // Clear existing cluster
    if (clusterRef.current) {
      mapRef.current.removeLayer(clusterRef.current);
    }

    const cluster = LLib.markerClusterGroup({
      maxClusterRadius: 50,
      iconCreateFunction: (c) =>
        LLib.divIcon({
          html: `<div class="leaflet-cluster-icon">${c.getChildCount()}</div>`,
          className: "",
          iconSize: [40, 40],
        }),
    });

    approvedEvents.forEach((ev) => {
      if (!ev.il) return;
      
      let evLat, evLng;
      if (ev.enlem && ev.boylam) {
        evLat = Number(ev.enlem);
        evLng = Number(ev.boylam);
      } else {
        const { lat, lng } = getCityCoords(ev.il);
        // Add small jitter to separate overlapping city-centre pins
        evLat = lat + (Math.random() - 0.5) * 0.12;
        evLng = lng + (Math.random() - 0.5) * 0.12;
      }

      const marker = LLib.marker([evLat, evLng], {
        icon: LLib.divIcon({
          html: createEventMarkerHtml(ev.tema === "duyuru" ? "#2ecc71" : "#d90429"),
          className: "",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        }),
        title: ev.baslik,
      });

      marker.bindPopup(buildEventPopupHtml(ev));
      cluster.addLayer(marker);
    });

    mapRef.current.addLayer(cluster);
    clusterRef.current = cluster;

    return () => {
      if (clusterRef.current && mapRef.current) {
        mapRef.current.removeLayer(clusterRef.current);
        clusterRef.current = null;
      }
    };
  }, [LLib, approvedEvents, viewMode]);

  // ─── Heat Map (via dynamically injected Leaflet.heat) ────────────────────
  useEffect(() => {
    if (!LLib || !mapRef.current) return;

    // Remove existing heat layer
    if (heatRef.current) {
      mapRef.current.removeLayer(heatRef.current);
      heatRef.current = null;
    }
    if (clusterRef.current) {
      if (viewMode === "heat") {
        mapRef.current.removeLayer(clusterRef.current);
      } else {
        if (!mapRef.current.hasLayer(clusterRef.current)) {
          mapRef.current.addLayer(clusterRef.current);
        }
      }
    }

    if (viewMode !== "heat") return;

    // Dynamically load Leaflet.heat only when needed
    const loadHeat = async () => {
      if (!window.L?.heatLayer) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src =
            "https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      const points = buildHeatPoints(approvedEvents);
      if (points.length === 0) return;

      const heat = window.L.heatLayer(points, {
        radius: 35,
        blur: 20,
        maxZoom: 10,
        max: 1.0,
        gradient: { 0.2: "#ffd166", 0.5: "#ef476f", 0.8: "#d90429", 1.0: "#7b0015" },
      });
      heat.addTo(mapRef.current);
      heatRef.current = heat;
    };

    loadHeat().catch(() => {});
  }, [LLib, viewMode, approvedEvents]);

  // ─── School Markers ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!LLib || !mapRef.current) return;

    if (schoolsRef.current) {
      mapRef.current.removeLayer(schoolsRef.current);
      schoolsRef.current = null;
    }
    if (!showSchools || !selectedCity) return;

    // Load schools for selected city
    loadSchoolsForCity(selectedCity);
  }, [showSchools, selectedCity, LLib, loadSchoolsForCity]);

  useEffect(() => {
    if (!LLib || !mapRef.current || !showSchools || !selectedCity) return;
    if (!schoolsData || Object.keys(schoolsData).length === 0) return;

    if (schoolsRef.current) {
      mapRef.current.removeLayer(schoolsRef.current);
    }

    const schoolLayer = LLib.markerClusterGroup({ maxClusterRadius: 30 });

    Object.entries(schoolsData).forEach(([ilce, schools]) => {
      schools.forEach((school) => {
        const { lat, lng } = getSchoolCoords(school, selectedCity);
        const marker = LLib.marker([lat, lng], {
          icon: LLib.divIcon({
            html: createSchoolMarkerHtml(),
            className: "",
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          }),
          title: school.ad,
        });

        marker.bindPopup(buildSchoolPopupHtml(school, ilce));
        schoolLayer.addLayer(marker);
      });
    });

    mapRef.current.addLayer(schoolLayer);
    schoolsRef.current = schoolLayer;
  }, [LLib, showSchools, selectedCity, schoolsData]);

  // ─── Fly to selected city ─────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    if (selectedCity && selectedCity !== prevCityRef.current) {
      const { lat, lng } = getCityCoords(selectedCity);
      mapRef.current.flyTo([lat, lng], 8, { duration: 1.2 });
    } else if (!selectedCity && prevCityRef.current) {
      mapRef.current.flyTo(TURKEY_CENTER, TURKEY_ZOOM, { duration: 1.0 });
    }
    prevCityRef.current = selectedCity;
  }, [selectedCity]);

  // ─── Reset view ───────────────────────────────────────────────────────────
  const handleResetView = useCallback(() => {
    setSelectedCity("");
    mapRef.current?.flyTo(TURKEY_CENTER, TURKEY_ZOOM, { duration: 0.8 });
  }, [setSelectedCity]);

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="leaflet-error-state">
        <span>⚠️ {loadError}</span>
      </div>
    );
  }

  return (
    <div className="leaflet-map-section" id="leaflet-map-section">
      {/* Toolbar */}
      <div className="leaflet-toolbar">
        <div className="leaflet-toolbar-group">
          <button
            className={`leaflet-tool-btn ${viewMode === "pins" ? "active" : ""}`}
            onClick={() => setViewMode("pins")}
            title="Etkinlik pinlerini göster"
          >
            📍 Pinler
          </button>
          <button
            className={`leaflet-tool-btn ${viewMode === "heat" ? "active" : ""}`}
            onClick={() => setViewMode("heat")}
            title="Isı haritası modunu aç"
          >
            🔥 Isı Haritası
          </button>
          <button
            className={`leaflet-tool-btn ${showSchools ? "active" : ""}`}
            onClick={() => setShowSchools((v) => !v)}
            title="Okulları göster/gizle (il seçiliyken)"
          >
            🏫 Okullar
          </button>
        </div>

        <button
          className="leaflet-tool-btn reset-btn"
          onClick={handleResetView}
          title="Türkiye görünümüne dön"
        >
          🗺️ Sıfırla
        </button>
      </div>

      {/* Loading indicator */}
      {(isLoading || !LLib) && (
        <div className="leaflet-loading">
          <div className="leaflet-loading-spinner" />
          <span>Harita yükleniyor…</span>
        </div>
      )}

      {/* Map container — always rendered so Leaflet can mount */}
      <div
        ref={mapContainerRef}
        className="leaflet-map-container"
        id="leaflet-map-container"
        style={{ visibility: !LLib ? "hidden" : "visible" }}
        aria-label="İnteraktif Türkiye Haritası"
        role="region"
      />

      {/* Legend */}
      <div className="leaflet-legend">
        <div className="leaflet-legend-item">
          <span className="leaflet-legend-dot event-dot" /> Etkinlik
        </div>
        {showSchools && (
          <div className="leaflet-legend-item">
            <span className="leaflet-legend-dot school-dot" /> Okul
          </div>
        )}
        <div className="leaflet-legend-item legend-hint">
          İl sınırına tıklayarak filtrele
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;
