import { VisualizationType } from "../reference/dynamic-layers";
import { queryClassifier, classifyQuery, enhanceAnalysisWithVisualization } from '../lib/query-classifier';
import { enhanceAnalysisResult, createEnhancedAnalysisResult } from '../components/geospatial/enhanced-analysis-types';

describe('Dynamic Layer System Integration', () => {
  describe('Query Classification and Analysis Enhancement', () => {
    it('should classify and enhance distribution queries correctly', async () => {
      const analysisResult = {
        intent: 'Show distribution data',
        relevantLayers: ['populationLayer'],
        relevantFields: ['population'],
        queryType: 'distribution',
        confidence: 0.9,
        explanation: 'Found distribution intent'
      };

      const enhanced = await enhanceAnalysisWithVisualization(analysisResult);

      expect(enhanced.visualizationType).toBe(VisualizationType.CHOROPLETH);
      expect(enhanced.queryType).toBe(VisualizationType.CHOROPLETH);
      expect(enhanced.originalQueryType).toBe('distribution');
    });

    it('should enhance correlation analysis correctly', async () => {
      const analysisResult = {
        intent: 'Show correlation',
        relevantLayers: ['incomeLayer', 'educationLayer'],
        relevantFields: ['income', 'education'],
        queryType: 'correlation',
        confidence: 0.9,
        explanation: 'Found correlation intent',
        metrics: { r: 0.75, pValue: 0.01 }
      };

      const enhanced = await enhanceAnalysisWithVisualization(analysisResult);

      expect(enhanced.visualizationType).toBe(VisualizationType.CORRELATION);
      expect(enhanced.queryType).toBe(VisualizationType.CORRELATION);
      expect(enhanced.metrics).toEqual({ r: 0.75, pValue: 0.01 });
    });

    it('should handle joint high analysis correctly', async () => {
      const analysisResult = {
        intent: 'Find areas with both high values',
        relevantLayers: ['incomeLayer', 'educationLayer'],
        relevantFields: ['income', 'education'],
        queryType: 'joint_high',
        confidence: 0.9,
        explanation: 'Found joint high intent',
        thresholds: { income: 75000, education: 16 }
      };

      const enhanced = await enhanceAnalysisWithVisualization(analysisResult);

      expect(enhanced.visualizationType).toBe(VisualizationType.JOINT_HIGH);
      expect(enhanced.queryType).toBe(VisualizationType.JOINT_HIGH);
      expect(enhanced.thresholds).toEqual({ income: 75000, education: 16 });
    });

    it('should enhance trends analysis correctly', async () => {
      const analysisResult = {
        intent: 'Show trends data',
        relevantLayers: ['googleTrends'],
        relevantFields: ['interest_over_time'],
        queryType: 'trends',
        confidence: 0.9,
        explanation: 'Found trends intent',
        trendsKeyword: 'bitcoin',
        timeframe: 'past 12 months',
        searchType: 'web',
        category: 'all'
      };

      const enhanced = await enhanceAnalysisWithVisualization(analysisResult);

      expect(enhanced.visualizationType).toBe(VisualizationType.TRENDS);
      expect(enhanced.queryType).toBe(VisualizationType.TRENDS);
      expect(enhanced.trendsKeyword).toBe('bitcoin');
    });
  });

  describe('Natural language query classification', () => {
    it('should classify descriptive queries correctly', () => {
      const queries = [
        "Show me high income areas",
        "Where are the wealthy neighborhoods",
        "Display income levels by zip code",
        "Visualize the distribution of home values"
      ];

      queries.forEach(query => {
        const result = classifyQuery(query);
        expect(result).toBe(VisualizationType.CHOROPLETH);
      });
    });

    it('should classify correlation queries correctly', () => {
      const queries = [
        "Show correlation between income and education",
        "Compare home prices to income levels",
        "How do education levels relate to income",
        "What's the relationship between crime and poverty"
      ];

      queries.forEach(query => {
        const result = classifyQuery(query);
        expect(result).toBe(VisualizationType.CORRELATION);
      });
    });

    it('should classify joint high queries correctly', () => {
      const queries = [
        "Show areas with both high income and education",
        "Where are both crime and poverty high",
        "Find neighborhoods with high home values and good schools",
        "Areas where both pollution and asthma rates are high"
      ];

      queries.forEach(query => {
        const result = classifyQuery(query);
        expect(result).toBe(VisualizationType.JOINT_HIGH);
      });
    });

    it('should classify heatmap queries correctly', () => {
      const queries = [
        "Show crime hotspots",
        "Where are restaurants concentrated",
        "Density of traffic accidents",
        "Heat map of customer locations"
      ];

      queries.forEach(query => {
        const result = classifyQuery(query);
        expect(result).toBe(VisualizationType.HEATMAP);
      });
    });
  });
}); 