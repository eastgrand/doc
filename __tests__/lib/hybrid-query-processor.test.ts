import { HybridQueryProcessor } from '../../lib/hybrid-query-processor';
import { scoreQueryComplexity } from '../../lib/query-complexity-scorer';
import { VisualizationType } from "../../reference/dynamic-layers";
import { MLServiceClient } from '../../lib/ml-service-client';

// Mock dependencies
jest.mock('../../lib/query-classifier', () => ({
  classifyQuery: jest.fn().mockImplementation(async (query: string) => {
    if (query.includes('heatmap')) return VisualizationType.HEATMAP;
    if (query.includes('scatter')) return VisualizationType.SCATTER;
    if (query.includes('choropleth')) return VisualizationType.CHOROPLETH;
    if (query.includes('predict')) return VisualizationType.HOTSPOT;
    return VisualizationType.CHOROPLETH;
  }),
  enhanceAnalysisWithVisualization: jest.fn().mockImplementation((result) => ({
    ...result,
    visualizationType: VisualizationType.CHOROPLETH
  }))
}));

jest.mock('../../lib/query-complexity-scorer', () => ({
  scoreQueryComplexity: jest.fn().mockImplementation((query, vizType) => {
    // Simple implementation to return predictive for queries with 'predict'
    const isPredictive = query.includes('predict') || query.includes('forecast');
    const isComplex = query.includes('correlation') || 
                     query.includes('regression') || 
                     query.includes('relationship') ||
                     query.length > 100;
    
    return {
      score: isPredictive ? 8 : (isComplex ? 6 : 3),
      requiresML: isPredictive || isComplex,
      explanation: [],
      queryType: isPredictive ? 'predictive' : (isComplex ? 'complex' : 'simple')
    };
  })
}));

jest.mock('../../lib/ml-service-client');

describe('Hybrid Query Processor', () => {
  let processor: HybridQueryProcessor;
  let mockMLClient: jest.Mocked<MLServiceClient>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock ML client
    mockMLClient = new MLServiceClient() as jest.Mocked<MLServiceClient>;
    mockMLClient.predict.mockResolvedValue({
      predictions: [0.8, 0.75, 0.65],
      explanations: {
        shap_values: [[0.1, 0.2, -0.1]],
        feature_names: ['feature_1', 'feature_2', 'feature_3'],
        base_value: 0.5
      },
      processing_time: 0.25,
      model_version: '0.1.0',
      cached: false
    });
    
    // Create processor with mocked ML client
    processor = new HybridQueryProcessor({
      featureFlags: { 
        mlEnabled: true,
        useTelemetry: false,
        adaptiveThreshold: false
      }
    });
    
    // Replace the ML client with our mock
    (processor as any).mlClient = mockMLClient;
  });
  
  test('should process simple queries using rule-based approach', async () => {
    const result = await processor.processQuery('show population by neighborhood');
    
    // Verify that scoreQueryComplexity was called
    expect(scoreQueryComplexity).toHaveBeenCalled();
    
    // Verify ML service was not called
    expect(mockMLClient.predict).not.toHaveBeenCalled();
    
    // Verify processing path
    expect(result.processingPath).toBe('rule-based');
  });
  
  test('should process complex queries using ML-based approach', async () => {
    const result = await processor.processQuery('show correlation between income and education levels with statistical significance');
    
    // Verify that ML service was called
    expect(mockMLClient.predict).toHaveBeenCalled();
    
    // Verify processing path
    expect(result.processingPath).toBe('ml-based');
    
    // Verify ML results are included
    expect(result.mlResults).toBeDefined();
  });
  
  test('should always use ML for predictive queries', async () => {
    const result = await processor.processQuery('predict crime rates for next month');
    
    // Verify that ML service was called
    expect(mockMLClient.predict).toHaveBeenCalled();
    
    // Verify processing path and query type
    expect(result.processingPath).toBe('ml-based');
    expect(result.queryType).toBe('predictive');
  });
  
  test('should fall back to rule-based processing if ML service fails', async () => {
    // Make ML service fail
    mockMLClient.predict.mockRejectedValue(new Error('ML service unavailable'));
    
    const result = await processor.processQuery('show correlation between income and education levels');
    
    // Verify that ML service was called but we fell back to rule-based
    expect(mockMLClient.predict).toHaveBeenCalled();
    expect(result.processingPath).toBe('rule-based');
  });
  
  test('should respect feature flag to disable ML', async () => {
    // Create processor with ML disabled
    const mlDisabledProcessor = new HybridQueryProcessor({
      featureFlags: { 
        mlEnabled: false,
        useTelemetry: false,
        adaptiveThreshold: false
      }
    });
    (mlDisabledProcessor as any).mlClient = mockMLClient;
    
    const result = await mlDisabledProcessor.processQuery('predict crime rates for next month');
    
    // Verify that ML service was not called despite being a predictive query
    expect(mockMLClient.predict).not.toHaveBeenCalled();
    expect(result.processingPath).toBe('rule-based');
  });
}); 