import { QueryClassifier } from '../../../lib/query-classifier';
import { VisualizationType } from '../../../config/dynamic-layers';

describe('Query Classifier', () => {
  let queryClassifier: QueryClassifier;

  beforeEach(() => {
    queryClassifier = new QueryClassifier();
  });

  describe('Basic Query Classification', () => {
    test('should classify correlation queries', async () => {
      const query = "Show correlation between income and education levels";
      const result = await queryClassifier.classifyQuery(query);
      
      expect(result.visualizationType).toBe(VisualizationType.CORRELATION);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('should classify ranking queries', async () => {
      const query = "Show me the top 10 areas by income";
      const result = await queryClassifier.classifyQuery(query);
      
      expect(result.visualizationType).toBe(VisualizationType.TOP_N);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('should classify distribution queries', async () => {
      const query = "Show the distribution of income across neighborhoods";
      const result = await queryClassifier.classifyQuery(query);
      
      expect(result.visualizationType).toBe(VisualizationType.CHOROPLETH);
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  describe('Complex Query Classification', () => {
    test('should classify multivariate queries', async () => {
      const query = "Analyze the relationship between population density, income levels, and education attainment";
      const result = await queryClassifier.classifyQuery(query);
      
      expect(result.visualizationType).toBe(VisualizationType.MULTIVARIATE);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('should classify joint high queries', async () => {
      const query = "Find areas with high income and high education levels";
      const result = await queryClassifier.classifyQuery(query);
      
      expect(result.visualizationType).toBe(VisualizationType.JOINT_HIGH);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('should classify bivariate queries', async () => {
      const query = "Create a bivariate map of income and education";
      const result = await queryClassifier.classifyQuery(query);
      
      expect(result.visualizationType).toBe(VisualizationType.BIVARIATE);
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  describe('Context-Aware Classification', () => {
    test('should maintain context in follow-up queries', async () => {
      const initialQuery = "Show me areas with high income";
      const followUpQuery = "Now show me the top 10 areas";
      
      const initialResult = await queryClassifier.classifyQuery(initialQuery);
      expect(initialResult.visualizationType).toBe(VisualizationType.CHOROPLETH);
      
      const followUpResult = await queryClassifier.classifyQuery(followUpQuery, initialResult);
      expect(followUpResult.visualizationType).toBe(VisualizationType.TOP_N);
    });

    test('should handle context with pronouns', async () => {
      const initialQuery = "Show me income levels";
      const followUpQuery = "Compare it with education";
      
      const initialResult = await queryClassifier.classifyQuery(initialQuery);
      expect(initialResult.visualizationType).toBe(VisualizationType.CHOROPLETH);
      
      const followUpResult = await queryClassifier.classifyQuery(followUpQuery, initialResult);
      expect(followUpResult.visualizationType).toBe(VisualizationType.CORRELATION);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid queries', async () => {
      const query = "Show me something impossible";
      const result = await queryClassifier.classifyQuery(query);
      
      expect(result.error).toBeDefined();
      expect(result.confidence).toBeLessThan(0.6);
    });

    test('should handle ambiguous queries', async () => {
      const query = "Show me the data";
      const result = await queryClassifier.classifyQuery(query);
      
      expect(result.visualizationType).toBe(VisualizationType.CHOROPLETH);
      expect(result.confidence).toBeLessThan(0.6);
    });

    test('should handle conflicting visualization indicators', async () => {
      const query = "Show both a heatmap and scatter plot of the data";
      const result = await queryClassifier.classifyQuery(query);
      
      expect(result.visualizationType).toBe(VisualizationType.HEATMAP);
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle rapid successive queries', async () => {
      const queries = [
        "Show income distribution",
        "Now show education levels",
        "Compare both with population density"
      ];

      const results = await Promise.all(
        queries.map(query => queryClassifier.classifyQuery(query))
      );

      expect(results).toHaveLength(3);
      expect(results.every(r => r.visualizationType)).toBe(true);
    });

    test('should maintain context across multiple queries', async () => {
      const queries = [
        "Show areas with high income",
        "Filter to show only urban areas",
        "Now show correlation with education"
      ];

      let context = null;
      for (const query of queries) {
        const result = await queryClassifier.classifyQuery(query, context);
        context = result;
        expect(result.visualizationType).toBeDefined();
      }
    });
  });
}); 