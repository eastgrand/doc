import { VisualizationType } from "../reference/dynamic-layers";
import { queryClassifier, classifyQuery, enhanceAnalysisWithVisualization } from '../lib/query-classifier';

describe('Query Classifier', () => {
  describe('classifyQuery', () => {
    it('should classify choropleth queries', () => {
      expect(classifyQuery('Show me income distribution across neighborhoods')).toBe(VisualizationType.CHOROPLETH);
      expect(classifyQuery('Display education levels by region')).toBe(VisualizationType.CHOROPLETH);
      expect(classifyQuery('Visualize population distribution in the city')).toBe(VisualizationType.CHOROPLETH);
    });

    it('should classify correlation queries', () => {
      expect(classifyQuery('Show correlation between income and education')).toBe(VisualizationType.CORRELATION);
      expect(classifyQuery('Compare housing prices versus income levels')).toBe(VisualizationType.CORRELATION);
      expect(classifyQuery('What is the relationship between crime and poverty')).toBe(VisualizationType.CORRELATION);
    });

    it('should classify joint high queries', () => {
      expect(classifyQuery('Where are both income and education high')).toBe(VisualizationType.JOINT_HIGH);
      expect(classifyQuery('Find areas with both high crime and poverty rates')).toBe(VisualizationType.JOINT_HIGH);
      expect(classifyQuery('Show regions where housing prices and income are simultaneously high')).toBe(VisualizationType.JOINT_HIGH);
    });

    it('should classify trends queries', () => {
      expect(classifyQuery('Show trends for NFL over time')).toBe(VisualizationType.TRENDS);
      expect(classifyQuery('How has bitcoin changed over time')).toBe(VisualizationType.TRENDS);
      expect(classifyQuery('Display temporal patterns for COVID cases')).toBe(VisualizationType.TRENDS);
    });

    it('should classify heatmap queries', () => {
      expect(classifyQuery('Show density of crime incidents')).toBe(VisualizationType.HEATMAP);
      expect(classifyQuery('Heat map of traffic accidents')).toBe(VisualizationType.HEATMAP);
      expect(classifyQuery('Where are restaurants concentrated')).toBe(VisualizationType.HEATMAP);
    });
  });

  describe('enhanceAnalysisWithVisualization', () => {
    it('should enhance an analysis result with visualization type', async () => {
      const analysisResult = {
        intent: 'Show crime distribution',
        relevantLayers: ['crime'],
        queryType: 'distribution',
        confidence: 0.9,
        explanation: 'Found crime distribution intent',
        originalQuery: 'Show crime distribution across neighborhoods'
      };

      const enhanced = await enhanceAnalysisWithVisualization(analysisResult);

      expect(enhanced.visualizationType).toBe(VisualizationType.CHOROPLETH);
      expect(enhanced.queryType).toBe(VisualizationType.CHOROPLETH);
      expect(enhanced.originalQueryType).toBe('distribution');
    });

    it('should preserve existing visualization type if present', async () => {
      const analysisResult = {
        intent: 'Compare variables',
        relevantLayers: ['income', 'education'],
        queryType: 'correlation',
        confidence: 0.9,
        explanation: 'Found correlation intent',
        originalQuery: 'Show correlation between income and education',
        visualizationType: VisualizationType.CORRELATION
      };

      const enhanced = await enhanceAnalysisWithVisualization(analysisResult);

      expect(enhanced.visualizationType).toBe(VisualizationType.CORRELATION);
      expect(enhanced.queryType).toBe(VisualizationType.CORRELATION);
    });
  });
}); 