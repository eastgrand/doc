import { describe, it, expect } from '@jest/globals';

// Mimic minimal structures used in geospatial-chat-interface join logic
interface GeoFeature {
  properties: Record<string, any>;
}

/** Normalise a string we expect to contain a ZIP or FSA. */
const normalizeZipCode = (val: string | undefined | null): string | null => {
  if (!val || typeof val !== 'string') return null;
  return val.substring(0, 5).toUpperCase();
};

describe('Data-join key mapping', () => {
  const geoFeatures: GeoFeature[] = [
    { properties: { ZIP_CODE: '12345', DESCRIPTION: '12345', FSA_ID: '12345', ID: '12345' } },
    { properties: { ZIP_CODE: '67890', DESCRIPTION: '67890', FSA_ID: '67890', ID: '67890' } }
  ];

  const buildFeatureMap = (features: GeoFeature[]) => {
    const map = new Map<string, GeoFeature>();
    features.forEach((f) => {
      const rawId = f.properties.ZIP_CODE || f.properties.ID || f.properties.DESCRIPTION || f.properties.FSA_ID;
      const key = normalizeZipCode(rawId);
      if (key) map.set(key, f);
    });
    return map;
  };

  it('matches analysis records that specify DESCRIPTION only', () => {
    const featureMap = buildFeatureMap(geoFeatures);
    const record = { DESCRIPTION: '12345' };
    const rawId = (record as any).ZIP_CODE || (record as any).ID || record.DESCRIPTION || (record as any).FSA_ID;
    const key = normalizeZipCode(rawId);
    expect(key).toBe('12345');
    expect(featureMap.has(key!)).toBe(true);
  });

  it('matches analysis records that specify FSA_ID only', () => {
    const featureMap = buildFeatureMap(geoFeatures);
    const record = { FSA_ID: '67890' };
    const rawId = (record as any).ZIP_CODE || (record as any).ID || (record as any).DESCRIPTION || record.FSA_ID;
    const key = normalizeZipCode(rawId);
    expect(key).toBe('67890');
    expect(featureMap.has(key!)).toBe(true);
  });
}); 