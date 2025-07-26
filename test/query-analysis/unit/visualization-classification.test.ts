import { QueryClassifier, ClassificationResult } from '../../../lib/query-classifier';
import { VisualizationType } from '../../../config/dynamic-layers';

describe('Visualization Classification', () => {
  let queryClassifier: QueryClassifier;

  beforeEach(() => {
    queryClassifier = new QueryClassifier();
  });

  describe('Standard Visualization Types', () => {
    test('should classify choropleth visualization', async () => {
      const query = "Show income distribution by neighborhood";
      const result = await queryClassifier.classifyQuery(query);
      expect(result.visualizationType).toBe(VisualizationType.CHOROPLETH);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('should classify heatmap visualization', async () => {
      const query = "Show density of applications across the city";
      const result = await queryClassifier.classifyQuery(query);
      expect(result.visualizationType).toBe(VisualizationType.HEATMAP);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('should classify scatter visualization', async () => {
      const query = "Plot all store locations";
      const result = await queryClassifier.classifyQuery(query);
      expect(result.visualizationType).toBe(VisualizationType.SCATTER);
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  describe('Advanced Visualization Types', () => {
    test('should classify multivariate visualization', async () => {
      const query = "Compare population, income, and education levels";
      const result = await queryClassifier.classifyQuery(query);
      expect(result.visualizationType).toBe(VisualizationType.MULTIVARIATE);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('should classify correlation visualization', async () => {
      const query = "Show correlation between factors using multivariate analysis";
      const result = await queryClassifier.classifyQuery(query);
      expect(result.visualizationType).toBe(VisualizationType.CORRELATION);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('should classify top-n visualization', async () => {
      const query = "Map the top 20 areas for business growth";
      const result = await queryClassifier.classifyQuery(query);
      expect(result.visualizationType).toBe(VisualizationType.TOP_N);
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  describe('Specialized Visualization Types', () => {
    test('should classify hexbin visualization', async () => {
      const query = "Show store density using hexagonal bins";
      const result = await queryClassifier.classifyQuery(query);
      expect(result.visualizationType).toBe(VisualizationType.HEXBIN);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('should classify bivariate visualization', async () => {
      const query = "Create a bivariate map of income and education";
      const result = await queryClassifier.classifyQuery(query);
      expect(result.visualizationType).toBe(VisualizationType.BIVARIATE);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('should classify hotspot visualization', async () => {
      const query = "Find hotspots of high conversion rates";
      const result = await queryClassifier.classifyQuery(query);
      expect(result.visualizationType).toBe(VisualizationType.HOTSPOT);
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  describe('Edge Cases', () => {
    test('should handle ambiguous visualization requests', async () => {
      const query = "Show me the data in a nice way";
      const result = await queryClassifier.classifyQuery(query);
      expect(result.confidence).toBeLessThan(0.6);
    });

    test('should handle conflicting visualization indicators', async () => {
      const query = "Show both a heatmap and scatter plot of the data";
      const result = await queryClassifier.classifyQuery(query);
      expect(result.visualizationType).toBe(VisualizationType.HEATMAP);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('should handle complex visualization requests', async () => {
      const query = "Create a multivariate visualization showing correlation between income, education, and housing prices, with hotspots for high conversion rates";
      const result = await queryClassifier.classifyQuery(query);
      expect(result.visualizationType).toBe(VisualizationType.MULTIVARIATE);
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });
}); 