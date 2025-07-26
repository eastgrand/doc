import { QueryClassifier, ClassificationResult } from '../../../lib/query-classifier';
import { VisualizationType } from '../../../config/dynamic-layers';

describe('Query Intent Detection', () => {
  let queryClassifier: QueryClassifier;

  beforeEach(() => {
    queryClassifier = new QueryClassifier();
  });

  describe('Basic Intent Detection', () => {
    test('should detect correlation intent', async () => {
      const query = "Show correlation between income and conversion rate";
      const result = await queryClassifier.classifyQuery(query);
      expect(result.visualizationType).toBe(VisualizationType.CORRELATION);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('should detect ranking intent', async () => {
      const query = "Show areas with highest conversion rates";
      const result = await queryClassifier.classifyQuery(query);
      expect(result.visualizationType).toBe(VisualizationType.TOP_N);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('should detect distribution intent', async () => {
      const query = "Show distribution of income levels";
      const result = await queryClassifier.classifyQuery(query);
      expect(result.visualizationType).toBe(VisualizationType.CHOROPLETH);
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  describe('Context-Aware Intent Detection', () => {
    test('should maintain context in follow-up questions', async () => {
      const query = "Why is Filipino population such a strong factor?";
      const result = await queryClassifier.classifyQuery(query, {
        previousQuery: "Show areas with high Filipino population and conversion rates",
        previousVisualization: VisualizationType.CORRELATION
      });
      expect(result.visualizationType).toBe(VisualizationType.CORRELATION);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('should inherit focus areas from context', async () => {
      const query = "Show me more areas like that";
      const result = await queryClassifier.classifyQuery(query, {
        previousQuery: "Show areas with high income and housing prices",
        previousVisualization: VisualizationType.CHOROPLETH
      });
      expect(result.visualizationType).toBe(VisualizationType.CHOROPLETH);
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  describe('Edge Cases', () => {
    test('should handle ambiguous queries', async () => {
      const query = "Show me the data";
      const result = await queryClassifier.classifyQuery(query);
      expect(result.confidence).toBeLessThan(0.6);
    });

    test('should handle complex multi-intent queries', async () => {
      const query = "Compare income distribution and show correlation with conversion rates";
      const result = await queryClassifier.classifyQuery(query);
      expect(result.visualizationType).toBe(VisualizationType.CORRELATION);
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });
}); 