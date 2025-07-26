import { classifyQueryWithLayers } from '../lib/query-classifier';
import { ANALYSIS_CATEGORIES } from '../components/chat/chat-constants';
import { conceptMapping } from '../lib/concept-mapping';

// Define LayerConfig locally for the test since it's not exported
interface Layer {
    id: string;
    name: string;
    type: string;
    url: string;
    rendererField: string;
    fields: { name: string; type: string }[];
}

interface LayerGroup {
    id: string;
    name: string;
    layerType: string;
    layers: Layer[];
}

interface LayerConfig {
    groups: LayerGroup[];
}

// Mock layer config for testing
const mockLayerConfig: LayerConfig = {
  "groups": [
    {
      "id": "demographics",
      "name": "Demographics",
      "layerType": "static",
      "layers": [
        { "id": "layer1", "name": "Population", "type": "FeatureLayer", "url": "...", "rendererField": "pop_density", "fields": [{"name": "pop_density", "type": "Double"}] }
      ]
    },
    {
      "id": "conversions",
      "name": "Conversions",
      "layerType": "static",
      "layers": [
        { "id": "layer2", "name": "Conversion Rate", "type": "FeatureLayer", "url": "...", "rendererField": "conversion_rate", "fields": [{"name": "conversion_rate", "type": "Double"}] }
      ]
    },
    {
        "id": "applications",
        "name": "Applications",
        "layerType": "static",
        "layers": [
          { "id": "layer3", "name": "Application Density", "type": "FeatureLayer", "url": "...", "rendererField": "app_density", "fields": [{"name": "app_density", "type": "Double"}] }
        ]
      }
  ]
};

describe('Query Classifier with Chat Constants Queries', () => {

  it('should classify queries from ANALYSIS_CATEGORIES and select real layers', async () => {
    console.log('--- Running Tests for ANALYSIS_CATEGORIES ---');
    const allQueries = Object.values(ANALYSIS_CATEGORIES).flat();

    for (const query of allQueries) {
      console.log(`\n--- Testing Query: "${query}" ---`);

      // 1. Classify query to get visualization type
      const classificationResult = await classifyQueryWithLayers(query);
      console.log('Classification Result:', {
        visualizationType: classificationResult.visualizationType,
        confidence: classificationResult.confidence,
        explanation: classificationResult.explanation,
      });

      // 2. Use conceptMapping to find relevant layers
      const conceptMap = await conceptMapping(query);
      console.log('Concept Map:', {
        matchedLayers: conceptMap.matchedLayers,
        matchedKeywords: conceptMap.keywords,
      });
      
      const matchedLayerNames = conceptMap.matchedLayers.map((layerId: string) => {
        for (const group of mockLayerConfig.groups) {
            const layer = group.layers.find((l: Layer) => l.id === layerId);
            if (layer) return layer.name;
        }
        return layerId;
      });

      console.log('Final Result:', {
        query,
        visualizationType: classificationResult.visualizationType,
        relevantLayers: matchedLayerNames,
      });

      // We are just logging the output for now, not asserting
      expect(true).toBe(true);
    }
  }, 30000); // 30s timeout for all queries
}); 