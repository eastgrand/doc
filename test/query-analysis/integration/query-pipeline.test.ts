import { QueryClassifier } from '../../../lib/query-classifier';
import { VisualizationFactory } from '../../../utils/visualization-factory';
import { AnalysisResult, EnhancedAnalysisResult } from '../../../types/analysis';
import { VisualizationType } from '../../../config/dynamic-layers';

describe('Query Analysis Pipeline', () => {
  let queryClassifier: QueryClassifier;
  let visualizationFactory: VisualizationFactory;

  beforeEach(() => {
    queryClassifier = new QueryClassifier();
    const mockAnalysisResult: AnalysisResult = {
      intent: 'Test intent',
      relevantLayers: ['testLayer'],
      queryType: 'test',
      confidence: 0.8,
      explanation: 'Test explanation'
    };
    const mockEnhancedAnalysis: EnhancedAnalysisResult = {
      queryType: 'default',
      visualizationStrategy: {
        title: '',
        description: '',
        targetVariable: ''
      },
      confidence: 0,
      suggestedActions: []
    };
    visualizationFactory = new VisualizationFactory({
      analysisResult: mockAnalysisResult,
      enhancedAnalysis: mockEnhancedAnalysis,
      features: { features: [] }
    });
  });

  describe('End-to-End Query Processing', () => {
    test('should process a simple correlation query', async () => {
      const query = "Show correlation between income and education levels";
      const classification = await queryClassifier.classifyQuery(query);
      
      expect(classification.visualizationType).toBe(VisualizationType.CORRELATION);
      expect(classification.confidence).toBeGreaterThan(0.6);
      
      const visualization = await visualizationFactory.createVisualization(
        [{ layerId: 'test', layerName: 'test', layerType: 'feature', features: [] }],
        { visualizationMode: 'correlation' }
      );
      expect(visualization).toBeDefined();
    });

    test('should process a complex multivariate query', async () => {
      const query = "Analyze the relationship between population density, income levels, and education attainment across neighborhoods";
      const classification = await queryClassifier.classifyQuery(query);
      
      expect(classification.visualizationType).toBe(VisualizationType.MULTIVARIATE);
      expect(classification.confidence).toBeGreaterThan(0.6);
      
      const visualization = await visualizationFactory.createVisualization(
        [{ layerId: 'test', layerName: 'test', layerType: 'feature', features: [] }],
        { visualizationMode: 'multivariate' }
      );
      expect(visualization).toBeDefined();
    });

    test('should process a ranking query with context', async () => {
      const initialQuery = "Show me areas with high income";
      const followUpQuery = "Now show me the top 10 areas";
      
      const initialClassification = await queryClassifier.classifyQuery(initialQuery);
      expect(initialClassification.visualizationType).toBe(VisualizationType.CHOROPLETH);
      
      const followUpClassification = await queryClassifier.classifyQuery(followUpQuery, initialClassification);
      expect(followUpClassification.visualizationType).toBe(VisualizationType.TOP_N);
      
      const visualization = await visualizationFactory.createVisualization(
        [{ layerId: 'test', layerName: 'test', layerType: 'feature', features: [] }],
        { visualizationMode: 'top-n' }
      );
      expect(visualization).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid visualization types', async () => {
      const query = "Show me something impossible";
      const classification = await queryClassifier.classifyQuery(query);
      
      expect(classification.error).toBeDefined();
      expect(classification.confidence).toBeLessThan(0.6);
      
      await expect(visualizationFactory.createVisualization(
        [{ layerId: 'test', layerName: 'test', layerType: 'feature', features: [] }],
        { visualizationMode: 'invalid' }
      )).rejects.toThrow();
    });

    test('should handle missing data requirements', async () => {
      const query = "Show correlation between non-existent variables";
      const classification = await queryClassifier.classifyQuery(query);
      
      expect(classification.error).toBeDefined();
      expect(classification.confidence).toBeLessThan(0.6);
      
      await expect(visualizationFactory.createVisualization(
        [{ layerId: 'test', layerName: 'test', layerType: 'feature', features: [] }],
        { visualizationMode: 'correlation' }
      )).rejects.toThrow();
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