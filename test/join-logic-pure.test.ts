import { describe, it, expect } from '@jest/globals';

// Mock ArcGIS features
const arcgisFeatures = [
  { attributes: { ID: 'A1', NAME: 'Area 1' }, geometry: { type: 'polygon', rings: [] } },
  { attributes: { ID: 'A2', NAME: 'Area 2' }, geometry: { type: 'polygon', rings: [] } },
  { attributes: { ID: 'A3', NAME: 'Area 3' }, geometry: { type: 'polygon', rings: [] } },
];

// Mock microservice results
const microserviceRecords = [
  { ID: 'A1', score: 0.9, extra: 'foo' },
  { ID: 'A2', score: 0.7, extra: 'bar' },
  { ID: 'A3', score: 0.5, extra: 'baz' },
];

// Pure mapping function (simulates processMicroserviceResponse)
function mapMicroserviceToFeatures(records: any[]): any[] {
  return records.map((record, index) => ({
    attributes: {
      ...record,
      ID: record.ID,
      OBJECTID: index + 1
    },
    geometry: { type: 'polygon', rings: [] }
  }));
}

// Pure join function
function joinByID(arcgis: any[], micro: any[]): any[] {
  const microMap = new Map<any, any>(micro.map((f: any) => [f.attributes.ID, f]));
  return arcgis.map((f: any) => ({
    ...f,
    micro: microMap.get(f.attributes.ID) || null
  }));
}

describe('Pure join logic and ID mapping', () => {
  it('joins ArcGIS and microservice features by ID', () => {
    const microFeatures = mapMicroserviceToFeatures(microserviceRecords);
    const joined = joinByID(arcgisFeatures, microFeatures);
    joined.forEach((j: any) => {
      expect(j.micro).not.toBeNull();
      expect(j.micro.attributes.ID).toBe(j.attributes.ID);
    });
  });

  it('handles missing IDs gracefully', () => {
    const badMicro = [
      { ID: 'A1', score: 0.9 },
      { ID: 'A2', score: 0.7 },
      { ID: 'B4', score: 0.1 }, // No match
    ];
    const microFeatures = mapMicroserviceToFeatures(badMicro);
    const joined = joinByID(arcgisFeatures, microFeatures);
    expect(joined[2].micro).toBeNull(); // A3 has no match
    expect(joined[0].micro).not.toBeNull();
    expect(joined[1].micro).not.toBeNull();
  });

  it('works for different simulated visualization data structures', () => {
    // Simulate different field sets
    const ms1 = microserviceRecords.map((r, i) => ({ ...r, thematic_value: i * 10 }));
    const ms2 = microserviceRecords.map((r, i) => ({ ...r, primary_value: i, comparison_value: i + 1 }));
    const ms3 = microserviceRecords.map((r, i) => ({ ...r, combined_score: i * 0.5 }));
    [ms1, ms2, ms3].forEach((records) => {
      const microFeatures = mapMicroserviceToFeatures(records);
      const joined = joinByID(arcgisFeatures, microFeatures);
      joined.forEach((j: any) => {
        expect(j.micro).not.toBeNull();
        expect(j.micro.attributes.ID).toBe(j.attributes.ID);
      });
    });
  });
}); 