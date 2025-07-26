import { analyzeQuery } from '../../../lib/query-analyzer';
import { VisualizationType } from '../../../config/dynamic-layers';
import { ConceptMap } from '../../../lib/analytics/types';

describe('Query Analyzer', () => {
  const mockConceptMap: ConceptMap = {
    matchedLayers: ['income', 'education'],
    matchedFields: ['INCOME', 'EDUCATION'],
    confidence: 0.8,
    keywords: ['income', 'education'],
    layerScores: { 'income': 0.9, 'education': 0.8 },
    fieldScores: { 'INCOME': 0.9, 'EDUCATION': 0.8 }
  };

  describe('Basic Query Analysis', () => {
    test('should analyze correlation queries', async () => {
      const query = "Show correlation between income and education levels";
      const result = await analyzeQuery(query, mockConceptMap);
      
      expect(result.queryType).toBe('correlation');
      expect(result.visualizationStrategy).toBe('correlation');
      expect(result.relevantLayers).toContain('income');
      expect(result.relevantLayers).toContain('education');
    });

    test('should analyze ranking queries', async () => {
      const query = "Show me the top 10 areas by income";
      const result = await analyzeQuery(query, mockConceptMap);
      
      expect(result.queryType).toBe('ranking');
      expect(result.visualizationStrategy).toBe('top_n');
      expect(result.relevantLayers).toContain('income');
    });

    test('should analyze distribution queries', async () => {
      const query = "Show the distribution of income across neighborhoods";
      const result = await analyzeQuery(query, mockConceptMap);
      
      expect(result.queryType).toBe('distribution');
      expect(result.visualizationStrategy).toBe('choropleth');
      expect(result.relevantLayers).toContain('income');
    });
  });

  describe('Complex Query Analysis', () => {
    test('should analyze multivariate queries', async () => {
      const query = "Analyze the relationship between population density, income levels, and education attainment";
      const result = await analyzeQuery(query, mockConceptMap);
      
      expect(result.queryType).toBe('multivariate');
      expect(result.visualizationStrategy).toBe('multivariate');
      expect(result.relevantLayers).toContain('income');
      expect(result.relevantLayers).toContain('education');
    });

    test('should analyze joint high queries', async () => {
      const query = "Find areas with high income and high education levels";
      const result = await analyzeQuery(query, mockConceptMap);
      
      expect(result.queryType).toBe('joint_high');
      expect(result.visualizationStrategy).toBe('joint_high');
      expect(result.relevantLayers).toContain('income');
      expect(result.relevantLayers).toContain('education');
    });

    test('should analyze bivariate queries', async () => {
      const query = "Create a bivariate map of income and education";
      const result = await analyzeQuery(query, mockConceptMap);
      
      expect(result.queryType).toBe('bivariate');
      expect(result.visualizationStrategy).toBe('bivariate');
      expect(result.relevantLayers).toContain('income');
      expect(result.relevantLayers).toContain('education');
    });
  });

  describe('Context-Aware Analysis', () => {
    test('should maintain context in follow-up queries', async () => {
      const initialQuery = "Show me areas with high income";
      const followUpQuery = "Now show me the top 10 areas";
      
      const initialResult = await analyzeQuery(initialQuery, mockConceptMap);
      expect(initialResult.visualizationStrategy).toBe('choropleth');
      
      const followUpResult = await analyzeQuery(followUpQuery, mockConceptMap, initialQuery);
      expect(followUpResult.visualizationStrategy).toBe('top_n');
    });

    test('should handle context with pronouns', async () => {
      const initialQuery = "Show me income levels";
      const followUpQuery = "Compare it with education";
      
      const initialResult = await analyzeQuery(initialQuery, mockConceptMap);
      expect(initialResult.visualizationStrategy).toBe('choropleth');
      
      const followUpResult = await analyzeQuery(followUpQuery, mockConceptMap, initialQuery);
      expect(followUpResult.visualizationStrategy).toBe('correlation');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid queries', async () => {
      const query = "Show me something impossible";
      const result = await analyzeQuery(query, mockConceptMap);
      
      expect(result.relevantLayers).toHaveLength(0);
    });

    test('should handle ambiguous queries', async () => {
      const query = "Show me the data";
      const result = await analyzeQuery(query, mockConceptMap);
      
      expect(result.visualizationStrategy).toBe('choropleth');
      expect(result.relevantLayers).toHaveLength(0);
    });

    test('should handle conflicting visualization indicators', async () => {
      const query = "Show both a heatmap and scatter plot of the data";
      const result = await analyzeQuery(query, mockConceptMap);
      
      expect(result.visualizationStrategy).toBe('heatmap');
      expect(result.relevantLayers).toHaveLength(0);
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
        queries.map(query => analyzeQuery(query, mockConceptMap))
      );

      expect(results).toHaveLength(3);
      expect(results.every(r => r.visualizationStrategy)).toBe(true);
    });

    test('should maintain context across multiple queries', async () => {
      const queries = [
        "Show areas with high income",
        "Filter to show only urban areas",
        "Now show correlation with education"
      ];

      let context = '';
      for (const query of queries) {
        const result = await analyzeQuery(query, mockConceptMap, context);
        context = query;
        expect(result.visualizationStrategy).toBeDefined();
      }
    });
  });
}); 