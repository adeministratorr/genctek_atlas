import "@testing-library/jest-dom";
import { vi } from "vitest";

// ─── Leaflet Mock ────────────────────────────────────────────────────────────
// Leaflet uses browser APIs (DOM, canvas) unavailable in jsdom; mock the entire module.
vi.mock("leaflet", () => {
  const mockMap = {
    setView: vi.fn().mockReturnThis(),
    addLayer: vi.fn().mockReturnThis(),
    removeLayer: vi.fn().mockReturnThis(),
    fitBounds: vi.fn().mockReturnThis(),
    flyTo: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    getZoom: vi.fn().mockReturnValue(6),
    getBounds: vi.fn().mockReturnValue({ isValid: () => true }),
    hasLayer: vi.fn().mockReturnValue(false),
  };

  const mockLayer = {
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    clearLayers: vi.fn().mockReturnThis(),
    addLayer: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    setStyle: vi.fn().mockReturnThis(),
    bindTooltip: vi.fn().mockReturnThis(),
    bindPopup: vi.fn().mockReturnThis(),
  };

  return {
    default: {
      map: vi.fn().mockReturnValue(mockMap),
      tileLayer: vi.fn().mockReturnValue(mockLayer),
      geoJSON: vi.fn().mockReturnValue(mockLayer),
      markerClusterGroup: vi.fn().mockReturnValue(mockLayer),
      marker: vi.fn().mockReturnValue(mockLayer),
      divIcon: vi.fn().mockReturnValue({}),
      icon: vi.fn().mockReturnValue({}),
      latLngBounds: vi.fn().mockReturnValue({ isValid: () => true }),
    },
    map: vi.fn().mockReturnValue(mockMap),
    tileLayer: vi.fn().mockReturnValue(mockLayer),
    geoJSON: vi.fn().mockReturnValue(mockLayer),
    marker: vi.fn().mockReturnValue(mockLayer),
    divIcon: vi.fn().mockReturnValue({}),
    icon: vi.fn().mockReturnValue({}),
    latLngBounds: vi.fn().mockReturnValue({ isValid: () => true }),
  };
});

vi.mock("leaflet.markercluster", () => ({
  default: {},
}));

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }) => children,
  TileLayer: () => null,
  GeoJSON: () => null,
  Marker: () => null,
  Popup: ({ children }) => children,
  useMap: vi.fn().mockReturnValue({
    fitBounds: vi.fn(),
    setView: vi.fn(),
  }),
}));

// ─── Firebase Mock ───────────────────────────────────────────────────────────
vi.mock("../firebase/config", () => ({
  db: {},
  auth: { config: { apiKey: "DummyKey-test" } },
  storage: {},
}));

// ─── Fetch Mock (GeoJSON dosyası için) ───────────────────────────────────────
globalThis.fetch = vi.fn().mockImplementation((url) => {
  if (url.includes("turkey-provinces") || url.includes(".geojson")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: { NAME_1: "Ankara" },
              geometry: { type: "Polygon", coordinates: [[]] },
            },
          ],
        }),
    });
  }
  if (url.includes(".svg")) {
    return Promise.resolve({
      ok: true,
      text: () => Promise.resolve('<svg><path data-iladi="Ankara"/></svg>'),
    });
  }
  return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
});

// ─── Window / Browser API Stubs ───────────────────────────────────────────────
globalThis.URL.createObjectURL = vi.fn();
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

window.HTMLElement.prototype.scrollIntoView = vi.fn();
