import { QueryClassifier } from '../lib/query-classifier';
import { VisualizationType } from '../config/dynamic-layers';

// Define the AnalysisResult interface to match the one in query-classifier.ts
interface AnalysisResult {
  intent: string;
  relevantLayers: string[];
  relevantFields?: string[]; 
  comparisonParty?: string; 
  queryType: string;
  confidence: number;
  explanation: string;
  topN?: number;
  isCrossGeography?: boolean;
  originalQueryType?: string;
  originalQuery?: string;
  trendsKeyword?: string;
  populationLookup?: Map<string, number>;
  reasoning?: string;
  metrics?: { r: number; pValue?: number };
  correlationMetrics?: { r: number; pValue?: number };
  thresholds?: Record<string, number>;
  timeframe?: string;
  searchType?: string;
  category?: string;
  visualizationType?: VisualizationType;
}

describe('QueryClassifier', () => {
  let classifier: QueryClassifier;

  beforeEach(() => {
    classifier = new QueryClassifier();
  });

  describe('Core Visualization Types', () => {
    test('CHOROPLETH classification', async () => {
      const result = await classifier.classifyQuery('show me income by county');
      expect(result.visualizationType).toBe(VisualizationType.CHOROPLETH);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('CORRELATION classification', async () => {
      const result = await classifier.classifyQuery('compare income with education');
      expect(result.visualizationType).toBe(VisualizationType.CORRELATION);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('JOINT_HIGH classification', async () => {
      const result = await classifier.classifyQuery('where are both income and education high');
      expect(result.visualizationType).toBe(VisualizationType.JOINT_HIGH);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('TRENDS classification', async () => {
      const result = await classifier.classifyQuery('how has income changed over time');
      expect(result.visualizationType).toBe(VisualizationType.TRENDS);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('HEATMAP classification', async () => {
      const result = await classifier.classifyQuery('show density of restaurants');
      expect(result.visualizationType).toBe(VisualizationType.HEATMAP);
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('Edge Cases', () => {
    test('handles mixed signal queries', async () => {
      const result = await classifier.classifyQuery('show me income trends and compare with education');
      // Should prioritize one type over the other
      expect(result.visualizationType).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    test('handles ambiguous queries', async () => {
      const result = await classifier.classifyQuery('show me the data');
      // Should return a default or most likely type
      expect(result.visualizationType).toBeDefined();
      expect(result.confidence).toBeLessThan(0.5);
    });

    test('handles queries with multiple visualization keywords', async () => {
      const result = await classifier.classifyQuery('show me a heatmap of income correlation');
      // Should prioritize one type over the other
      expect(result.visualizationType).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0.3);
    });
  });

  describe('Analysis Result Enhancement', () => {
    test('enhances analysis with visualization type', async () => {
      const analysisResult: AnalysisResult = {
        queryType: 'unknown',
        originalQuery: 'show me income by county',
        intent: 'visualize income distribution',
        explanation: 'user wants to see income data by county',
        reasoning: 'choropleth map would be appropriate',
        relevantLayers: [],
        confidence: 0.8
      };

      const enhanced = await classifier.enhanceAnalysisResult(analysisResult);
      expect(enhanced.visualizationType).toBe(VisualizationType.CHOROPLETH);
      expect(enhanced.queryType).toBe(VisualizationType.CHOROPLETH);
    });

    test('preserves existing visualization type', async () => {
      const analysisResult: AnalysisResult = {
        queryType: VisualizationType.CHOROPLETH,
        originalQuery: 'show me income by county',
        intent: 'visualize income distribution',
        explanation: 'user wants to see income data by county',
        reasoning: 'choropleth map would be appropriate',
        relevantLayers: [],
        confidence: 0.8
      };

      const enhanced = await classifier.enhanceAnalysisResult(analysisResult);
      expect(enhanced.visualizationType).toBe(VisualizationType.CHOROPLETH);
      expect(enhanced.queryType).toBe(VisualizationType.CHOROPLETH);
    });
  });
}); 