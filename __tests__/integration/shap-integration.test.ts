import { MLAnalyticsService, AnalysisType, AnalysisRequest, AnalysisResult } from '@/services/ml-analytics-service';
import { DynamicVisualizationFactory } from '@/utils/dynamic-visualization-factory';
import { LayerConfig, IndexLayerConfig, LayerMetadata } from '@/types/layers';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';

describe('SHAP Microservice Integration', () => {
  let mlAnalyticsService: MLAnalyticsService;
  let visualizationFactory: DynamicVisualizationFactory;
  let mockLayer: IndexLayerConfig;
  let mapView: MapView;

  beforeAll(async () => {
    // Initialize services with production endpoint
    mlAnalyticsService = new MLAnalyticsService();
    
    // Create a map and map view for visualization
    const map = new Map({
      basemap: 'streets-vector'
    });
    mapView = new MapView({
      map,
      container: document.createElement('div')
    });
    
    visualizationFactory = new DynamicVisualizationFactory();
    visualizationFactory.setMapView(mapView);
    
    // Use actual layer configuration
    mockLayer = {
      id: 'demographics',
      name: 'Exercise Daily Index',
      url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__1025f3822c784873/FeatureServer/0',
      type: 'index',
      status: 'active',
      description: 'Population that exercises daily',
      rendererField: 'MP28646A_B_I',
      geographicType: 'census',
      geographicLevel: 'national',
      group: 'demographics-group',
      fields: [
        { 
          name: 'MP28646A_B_I', 
          label: 'Exercise Index', 
          type: 'double',
          format: {
            places: 2,
            digitSeparator: true
          }
        }
      ],
      metadata: {
        provider: 'Market Research',
        updateFrequency: 'annual',
        lastUpdate: new Date('2024-01-01'),
        version: '2024.1',
        tags: ['exercise', 'demographics', 'fitness'],
        accuracy: 0.95,
        coverage: {
          spatial: 'national',
          temporal: '2020-2024'
        },
        geographicType: 'census',
        geographicLevel: 'national'
      },
      processing: { 
        strategy: 'traditional',
        batchSize: 1000,
        timeout: 30000,
        priority: 1,
        retryAttempts: 2
      },
      caching: { 
        enabled: true,
        ttl: 86400000,
        strategy: 'hybrid',
        maxEntries: 10000,
        prefetch: true
      },
      performance: { 
        maxFeatures: 100000,
        maxGeometryComplexity: 1000000,
        timeoutMs: 30000,
        rateLimits: {
          requestsPerSecond: 10,
          burstSize: 20
        },
        optimizationLevel: 'high'
      },
      security: { 
        requiresAuthentication: true,
        accessLevels: ['read', 'write'],
        encryptionRequired: true,
        auditEnabled: true
      }
    };
  });

  afterAll(() => {
    if (mapView) {
      mapView.destroy();
    }
  });

  it('should process SHAP analysis request', async () => {
    const request: AnalysisRequest = {
      analysis_type: 'prediction',
      target_variable: 'MP28646A_B_I',
      data: [
        {
          MP28646A_B_I: 0.75,
          ID: '12345'
        }
      ]
    };

    const result = await mlAnalyticsService.submitAnalysis(request);
    expect(result.status).toBe('success');
    expect(result.data).toBeDefined();
    expect(result.predictions).toBeDefined();
  });

  it('should create SHAP visualization', async () => {
    const request: AnalysisRequest = {
      analysis_type: 'prediction',
      target_variable: 'MP28646A_B_I',
      data: [
        {
          MP28646A_B_I: 0.75,
          ID: '12345'
        }
      ]
    };

    const result = await mlAnalyticsService.submitAnalysis(request);
    const visualization = await visualizationFactory.createTopNVisualization([{
      layer: mockLayer,
      features: result.data || []
    }], {
      query: 'Show top 10 areas by exercise index',
      primaryField: 'MP28646A_B_I'
    });
    
    expect(visualization).toBeDefined();
    expect(visualization.layer).toBeDefined();
    expect(visualization.extent).toBeDefined();
  });

  it('should handle SHAP analysis errors', async () => {
    const invalidRequest: AnalysisRequest = {
      analysis_type: 'prediction',
      target_variable: 'INVALID_FIELD',
      data: [
        {
          INVALID_FIELD: 'invalid'
        }
      ]
    };

    await expect(mlAnalyticsService.submitAnalysis(invalidRequest))
      .rejects
      .toThrow();
  });

  it('should process SHAP values for visualization', async () => {
    const request: AnalysisRequest = {
      analysis_type: 'prediction',
      target_variable: 'MP28646A_B_I',
      data: [
        {
          MP28646A_B_I: 0.75,
          ID: '12345'
        }
      ]
    };

    const result = await mlAnalyticsService.submitAnalysis(request);
    expect(result.data).toBeDefined();
    expect(result.explanations?.shap_values).toBeDefined();
    expect(Array.isArray(result.explanations?.shap_values)).toBe(true);
  });
}); 