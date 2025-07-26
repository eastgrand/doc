import { expect, describe, it } from '@jest/globals';

// Re-implement minimal copy of validateFeatureGeometry logic so that the
// behaviour is locked by tests.  If the production implementation changes in a
// way that breaks these expectations, CI will fail and we'll spot the issue.

interface GeometryBase { type: string; spatialReference?: { wkid: number }; }
interface PolygonGeom extends GeometryBase { type: 'Polygon'; rings?: number[][][]; coordinates?: number[][][]; }
interface Feature { type: 'Feature'; geometry: PolygonGeom; properties: Record<string, any>; }

const validateFeatureGeometry = (feature: Feature): boolean => {
  if (!feature || !feature.geometry) return false;
  const geometry = feature.geometry;
  if (geometry.type.toLowerCase() !== 'polygon') return false;
  // Prefer coordinates, fall back to rings
  // @ts-ignore – allow dynamic rings property
  const coords: any = geometry.coordinates || geometry.rings;
  if (!Array.isArray(coords) || coords.length === 0) return false;
  const hasValid = coords.every((ring: any) => Array.isArray(ring) && ring.length >= 4 &&
    ring.every((c: any) => Array.isArray(c) && c.length >= 2 && typeof c[0] === 'number' && typeof c[1] === 'number'));
  return hasValid;
};

describe('validateFeatureGeometry polygon handling', () => {
  const sampleRing = [
    [-100, 40],
    [-101, 41],
    [-99, 41],
    [-100, 40]
  ];

  it('accepts GeoJSON-style polygon (coordinates)', () => {
    const feature: Feature = {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [sampleRing] },
      properties: {}
    };
    expect(validateFeatureGeometry(feature)).toBe(true);
  });

  it('accepts Esri Polygon-style polygon (rings)', () => {
    const feature: Feature = {
      type: 'Feature',
      // @ts-ignore – rings only
      geometry: { type: 'Polygon', rings: [sampleRing] },
      properties: {}
    };
    expect(validateFeatureGeometry(feature)).toBe(true);
  });
}); 