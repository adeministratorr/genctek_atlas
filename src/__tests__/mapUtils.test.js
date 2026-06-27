import { describe, it, expect } from "vitest";
import {
  getCityCoords,
  getProvinceStyle,
  getProvinceHoverStyle,
  getProvinceNameFromFeature,
  buildHeatPoints,
  buildEventPopupHtml,
  buildSchoolPopupHtml,
  createEventMarkerHtml,
  createSchoolMarkerHtml,
} from "../utils/mapUtils";

// ─── getCityCoords ────────────────────────────────────────────────────────────
describe("getCityCoords", () => {
  it("returns correct coords for Ankara", () => {
    const { lat, lng } = getCityCoords("Ankara");
    expect(lat).toBeCloseTo(39.9334, 2);
    expect(lng).toBeCloseTo(32.8597, 2);
  });

  it("returns correct coords for İstanbul (case insensitive)", () => {
    const { lat, lng } = getCityCoords("istanbul");
    expect(lat).toBeCloseTo(41.0082, 2);
    expect(lng).toBeCloseTo(28.9784, 2);
  });

  it("returns Turkey centre for unknown city", () => {
    const { lat, lng } = getCityCoords("Bilinmeyen Şehir");
    expect(lat).toBe(39.1);
    expect(lng).toBe(35.0);
  });

  it("returns Turkey centre for empty string", () => {
    const { lat, lng } = getCityCoords("");
    expect(lat).toBe(39.1);
    expect(lng).toBe(35.0);
  });

  it("all 81 cities have valid lat/lng ranges", async () => {
    const citiesData = (await import("../data/cities.json")).default;
    expect(citiesData).toHaveLength(81);
    citiesData.forEach((city) => {
      // Turkey latitude range: roughly 36–42
      expect(city.lat).toBeGreaterThanOrEqual(35.5);
      expect(city.lat).toBeLessThanOrEqual(42.5);
      // Turkey longitude range: roughly 26–45
      expect(city.lng).toBeGreaterThanOrEqual(25.5);
      expect(city.lng).toBeLessThanOrEqual(44.5);
    });
  });
});

// ─── getProvinceStyle ─────────────────────────────────────────────────────────
describe("getProvinceStyle", () => {
  it("returns deep red style for selected province", () => {
    const style = getProvinceStyle("Ankara", 5, true);
    expect(style.fillColor).toBe("#d90429");
    expect(style.fillOpacity).toBeGreaterThanOrEqual(0.4);
    expect(style.weight).toBeGreaterThan(2);
  });

  it("returns red tint for province with events", () => {
    const style = getProvinceStyle("İstanbul", 3, false);
    expect(style.fillColor).toBe("#e63946");
    expect(style.fillOpacity).toBeGreaterThan(0);
  });

  it("returns minimal style for province with no events", () => {
    const style = getProvinceStyle("Bayburt", 0, false);
    expect(style.fillOpacity).toBeLessThan(0.1);
  });

  it("caps opacity at 0.40 for very high event counts", () => {
    const style = getProvinceStyle("Ankara", 100, false);
    expect(style.fillOpacity).toBeLessThanOrEqual(0.41);
  });
});

// ─── getProvinceHoverStyle ────────────────────────────────────────────────────
describe("getProvinceHoverStyle", () => {
  it("returns object with fillOpacity and weight", () => {
    const style = getProvinceHoverStyle();
    expect(style).toHaveProperty("fillOpacity");
    expect(style).toHaveProperty("weight");
    expect(style.fillOpacity).toBeGreaterThan(0);
  });
});

// ─── getProvinceNameFromFeature ───────────────────────────────────────────────
describe("getProvinceNameFromFeature", () => {
  it("extracts NAME_1 property", () => {
    const feature = { properties: { NAME_1: "Ankara" } };
    expect(getProvinceNameFromFeature(feature)).toBe("Ankara");
  });

  it("falls back to name property", () => {
    const feature = { properties: { name: "İstanbul" } };
    expect(getProvinceNameFromFeature(feature)).toBe("İstanbul");
  });

  it("falls back to il_adi property", () => {
    const feature = { properties: { il_adi: "İzmir" } };
    expect(getProvinceNameFromFeature(feature)).toBe("İzmir");
  });

  it("returns empty string for feature with no known property", () => {
    const feature = { properties: { foo: "bar" } };
    expect(getProvinceNameFromFeature(feature)).toBe("");
  });

  it("returns empty string for null feature", () => {
    expect(getProvinceNameFromFeature(null)).toBe("");
  });
});

// ─── buildHeatPoints ──────────────────────────────────────────────────────────
describe("buildHeatPoints", () => {
  const events = [
    { il: "Ankara", onaylandi: true },
    { il: "Ankara", onaylandi: true },
    { il: "İstanbul", onaylandi: true },
  ];

  it("returns array of [lat, lng, intensity] tuples", () => {
    const points = buildHeatPoints(events);
    expect(Array.isArray(points)).toBe(true);
    points.forEach((p) => {
      expect(p).toHaveLength(3);
      expect(typeof p[0]).toBe("number"); // lat
      expect(typeof p[1]).toBe("number"); // lng
      expect(typeof p[2]).toBe("number"); // intensity
    });
  });

  it("aggregates events by city", () => {
    const points = buildHeatPoints(events, {});
    const ankPoint = points.find((p) => {
      const { lat } = getCityCoords("Ankara");
      return Math.abs(p[0] - lat) < 0.01;
    });
    expect(ankPoint).toBeDefined();
  });

  it("handles empty events array", () => {
    expect(buildHeatPoints([], {})).toEqual([]);
  });

  it("skips events without il", () => {
    const pts = buildHeatPoints([{ onaylandi: true }], {});
    expect(pts).toHaveLength(0);
  });
});

// ─── buildEventPopupHtml ──────────────────────────────────────────────────────
describe("buildEventPopupHtml", () => {
  it("includes event title", () => {
    const html = buildEventPopupHtml({ baslik: "Test Etkinlik", il: "Ankara" });
    expect(html).toContain("Test Etkinlik");
  });

  it("includes city name", () => {
    const html = buildEventPopupHtml({ baslik: "A", il: "İzmir" });
    expect(html).toContain("İzmir");
  });

  it("shows fallback for missing title", () => {
    const html = buildEventPopupHtml({});
    expect(html).toContain("Etkinlik");
  });

  it("includes tema badge when tema is set", () => {
    const html = buildEventPopupHtml({ tema: "Yapay Zeka" });
    expect(html).toContain("Yapay Zeka");
  });
});

// ─── buildSchoolPopupHtml ────────────────────────────────────────────────────
describe("buildSchoolPopupHtml", () => {
  it("includes school name", () => {
    const html = buildSchoolPopupHtml({ ad: "Atatürk Lisesi" }, "Çankaya");
    expect(html).toContain("Atatürk Lisesi");
  });

  it("includes district name", () => {
    const html = buildSchoolPopupHtml({ ad: "Test Okul" }, "Kadıköy");
    expect(html).toContain("Kadıköy");
  });

  it("includes website link when provided", () => {
    const html = buildSchoolPopupHtml(
      { ad: "Test", website: "https://okul.edu.tr" },
      ""
    );
    expect(html).toContain("https://okul.edu.tr");
  });
});

// ─── Marker HTML helpers ─────────────────────────────────────────────────────
describe("createEventMarkerHtml", () => {
  it("returns non-empty HTML string", () => {
    const html = createEventMarkerHtml();
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
    expect(html).toContain("div");
  });

  it("uses provided color", () => {
    const html = createEventMarkerHtml("#ff0000");
    expect(html).toContain("#ff0000");
  });
});

describe("createSchoolMarkerHtml", () => {
  it("returns non-empty HTML string", () => {
    const html = createSchoolMarkerHtml();
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
  });
});
