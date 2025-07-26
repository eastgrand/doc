import { describe, it, expect } from '@jest/globals';

// This test file isolates the data merging logic from geospatial-chat-interface.tsx
// to rapidly debug the join failure between microservice results and ArcGIS features.

// MOCK DATA SETUP

// 1. Mock Microservice Analysis Records (from response.results)
// Structure: Assumes ID is at the top level.
const mockAnalysisRecords = [
  { ID: 'A1', shap_value: 0.75, analysis_metric: 100 },
  { ID: 'A2', shap_value: 0.55, analysis_metric: 150 },
  { ID: 'A3', shap_value: 0.95, analysis_metric: 200 },
];

// 2. Mock ArcGIS Geographic Features (from response.visualizationData)
// Structure: Assumes ID is nested within the 'attributes' property.
const mockArcGISFeatures = [
  { 
    attributes: { ID: 'A1', NAME: 'Area 1', REGION: 'North' }, 
    geometry: { type: 'polygon', rings: [/*...data...*/] } 
  },
  { 
    attributes: { ID: 'A2', NAME: 'Area 2', REGION: 'South' }, 
    geometry: { type: 'polygon', rings: [/*...data...*/] } 
  },
  // Note: 'A3' is intentionally missing to test resilience.
  { 
    attributes: { ID: 'A4', NAME: 'Area 4', REGION: 'East' }, 
    geometry: { type: 'polygon', rings: [/*...data...*/] } 
  },
];

// REPLICATED LOGIC FROM COMPONENT

/**
 * Ensures a feature object has a top-level 'ID' property for consistent joining.
 * Checks feature.ID, feature.properties.ID, and feature.attributes.ID.
 * @param feature The feature object.
 * @returns A feature object with a guaranteed top-level ID, or the original object.
 */
function ensureTopLevelID(feature: any): any {
  if (feature && typeof feature === 'object') {
    if (feature.ID !== undefined && feature.ID !== null) {
      return feature;
    }
    const newFeature = { ...feature };
    if (feature.properties && feature.properties.ID !== undefined && feature.properties.ID !== null) {
      newFeature.ID = feature.properties.ID;
      return newFeature;
    }
    if (feature.attributes && feature.attributes.ID !== undefined && feature.attributes.ID !== null) {
      newFeature.ID = feature.attributes.ID;
      return newFeature;
    }
  }
  return feature;
}

/**
 * The core merge logic that joins analytical records to geographic features.
 * @param analysisRecords Array of records from the microservice.
 * @param arcgisFeatures Array of features from ArcGIS.
 * @returns An array of merged features.
 */
function mergeData(analysisRecords: any[], arcgisFeatures: any[]): any[] {
  const arcgisFeatureMap = new Map<string, any>();
  for (const feature of arcgisFeatures) {
    const fixedFeature = ensureTopLevelID(feature);
    if (fixedFeature.ID !== undefined && fixedFeature.ID !== null) {
      arcgisFeatureMap.set(String(fixedFeature.ID).toLowerCase(), fixedFeature);
    }
  }

  const mergedFeatures: any[] = [];
  for (const analysisRecord of analysisRecords) {
    const msFeature = ensureTopLevelID(analysisRecord);
    const msKey = msFeature.ID;
    if (!msKey) continue;

    const arcgisFeature = arcgisFeatureMap.get(String(msKey).toLowerCase());
    if (arcgisFeature && arcgisFeature.geometry) {
      mergedFeatures.push({
        ...arcgisFeature,
        properties: {
          ...arcgisFeature.attributes, // Use attributes from the original feature
          ...msFeature,
        },
      });
    }
  }
  return mergedFeatures;
}


// TEST SUITE

describe('Data Merge Logic', () => {

  it('should correctly find the ID within feature.attributes', () => {
    const feature = { attributes: { ID: 'Test1' } };
    const fixedFeature = ensureTopLevelID(feature);
    expect(fixedFeature.ID).toBe('Test1');
  });

  it('should correctly find the ID within feature.properties', () => {
    const feature = { properties: { ID: 'Test2' } };
    const fixedFeature = ensureTopLevelID(feature);
    expect(fixedFeature.ID).toBe('Test2');
  });

  it('should return the feature as-is if ID is already at the top level', () => {
    const feature = { ID: 'Test3' };
    const fixedFeature = ensureTopLevelID(feature);
    expect(fixedFeature).toBe(feature); // Should be the same object
  });

  it('should merge analysis records with ArcGIS features using the ID key', () => {
    const merged = mergeData(mockAnalysisRecords, mockArcGISFeatures);

    // Should only merge the two records that have matching IDs ('A1' and 'A2')
    expect(merged.length).toBe(2);

    // Check the first merged feature ('A1')
    const mergedA1 = merged.find(f => f.properties.ID === 'A1');
    expect(mergedA1).toBeDefined();
    expect(mergedA1.geometry).toBeDefined(); // Should have geometry from ArcGIS feature
    expect(mergedA1.properties.NAME).toBe('Area 1'); // Property from ArcGIS feature
    expect(mergedA1.properties.shap_value).toBe(0.75); // Property from analysis record

    // Check the second merged feature ('A2')
    const mergedA2 = merged.find(f => f.properties.ID === 'A2');
    expect(mergedA2).toBeDefined();
    expect(mergedA2.geometry).toBeDefined();
    expect(mergedA2.properties.REGION).toBe('South');
    expect(mergedA2.properties.analysis_metric).toBe(150);
  });

  it('should handle cases where no matches are found', () => {
    const nonMatchingRecords = [{ ID: 'Z1' }, { ID: 'Z2' }];
    const merged = mergeData(nonMatchingRecords, mockArcGISFeatures);
    expect(merged.length).toBe(0);
  });

  it('should be case-insensitive when matching IDs', () => {
    const recordsWithDifferentCase = [{ ID: 'a1' }];
    const merged = mergeData(recordsWithDifferentCase, mockArcGISFeatures);
    expect(merged.length).toBe(1);
    expect(merged[0].properties.ID).toBe('a1');
    expect(merged[0].properties.NAME).toBe('Area 1');
  });
}); 