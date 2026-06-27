import { describe, it, expect } from 'vitest';
import cities from '../data/cities.json';

describe('Cities Data Validation', () => {
  it('should contain exactly 81 cities', () => {
    expect(cities).toHaveLength(81);
  });

  it('should have unique plaka codes and names', () => {
    const plakalar = cities.map(c => c.plaka);
    const names = cities.map(c => c.ad);
    const uniquePlakalar = new Set(plakalar);
    const uniqueNames = new Set(names);

    expect(uniquePlakalar.size).toBe(81);
    expect(uniqueNames.size).toBe(81);
  });

  it('should validate format of plaka codes', () => {
    cities.forEach(city => {
      expect(city.plaka).toMatch(/^\d{2}$/);
      const plakaNum = Number(city.plaka);
      expect(plakaNum).toBeGreaterThanOrEqual(1);
      expect(plakaNum).toBeLessThanOrEqual(81);
    });
  });

  it('should contain valid coordinates within Turkey boundaries', () => {
    // Turkey bounding box coordinates (approximate):
    // Latitude: 35.5 to 42.5 North
    // Longitude: 25.5 to 45.0 East
    cities.forEach(city => {
      expect(city.lat).toBeGreaterThanOrEqual(35.5);
      expect(city.lat).toBeLessThanOrEqual(42.5);
      expect(city.lng).toBeGreaterThanOrEqual(25.5);
      expect(city.lng).toBeLessThanOrEqual(45.0);
    });
  });
});
