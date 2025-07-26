import { analyzeQuery } from '../../../lib/query-analyzer';
import { VisualizationFactory } from '../../../utils/visualization-factory';
import { AnalysisResult, EnhancedAnalysisResult } from '../../../types/analysis';
import { VisualizationOptions } from '../../../utils/visualizations/base-visualization';
import { createMockMapView } from '../../../test/mock-arcgis-utils';
import { ConceptMap } from '../../../lib/analytics/types';

describe('Query to Visualization Flow Integration Tests', () => {
  let visualizationFactory: VisualizationFactory;
  let mockMapView: __esri.MapView;
  let mockConceptMap: ConceptMap;

  beforeEach(() => {
    mockMapView = createMockMapView();
    mockConceptMap = {
      matchedLayers: ['demographics', 'applications'],
      matchedFields: ['INCOME', 'EDUCATION', 'RATE'],
      confidence: 0.8,
      keywords: ['income', 'education', 'rate'],
      layerScores: { 'demographics': 0.9, 'applications': 0.8 },
      fieldScores: { 'INCOME': 0.9, 'EDUCATION': 0.8, 'RATE': 0.7 }
    };
    
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

  describe('Correlation Analysis Flow', () => {
    test('should process correlation query and create visualization', async () => {
      const query = 'Show correlation between income and education levels';
      
      // Step 1: Analyze query
      const analysisResult = await analyzeQuery(query, mockConceptMap);
      expect(analysisResult).toBeDefined();
      expect(analysisResult.queryType).toBe('correlation');
      
      // Step 2: Create visualization
      const layerResults = [{
        layer: {
          id: 'demographics',
          name: 'Demographics Layer',
          type: 'feature',
          fields: [
            { name: 'INCOME', type: 'double', label: 'Income' },
            { name: 'EDUCATION', type: 'double', label: 'Education' }
          ]
        },
        features: [
          {
            attributes: {
              INCOME: 50000,
              EDUCATION: 12
            }
          }
        ]
      }];

      const options: VisualizationOptions = {
        symbolConfig: {
          color: [255, 0, 0, 1],
          size: 8
        }
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });

  describe('Time Series Analysis Flow', () => {
    test('should process time series query and create visualization', async () => {
      const query = 'Show monthly trends in application rates';
      
      // Step 1: Analyze query
      const analysisResult = await analyzeQuery(query, mockConceptMap);
      expect(analysisResult).toBeDefined();
      expect(analysisResult.queryType).toBe('trends');
      
      // Step 2: Create visualization
      const layerResults = [{
        layer: {
          id: 'applications',
          name: 'Applications Layer',
          type: 'feature',
          fields: [
            { name: 'DATE', type: 'date', label: 'Date' },
            { name: 'RATE', type: 'double', label: 'Application Rate' }
          ]
        },
        features: [
          {
            attributes: {
              DATE: new Date('2024-01-01'),
              RATE: 0.5
            }
          },
          {
            attributes: {
              DATE: new Date('2024-02-01'),
              RATE: 0.6
            }
          }
        ]
      }];

      const options: VisualizationOptions = {
        symbolConfig: {
          color: [0, 0, 255, 1],
          size: 2
        }
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });

  describe('Hotspot Analysis Flow', () => {
    test('should process hotspot query and create visualization', async () => {
      const query = 'Show hotspots of high conversion rates';
      
      // Step 1: Analyze query
      const analysisResult = await analyzeQuery(query, mockConceptMap);
      expect(analysisResult).toBeDefined();
      expect(analysisResult.queryType).toBe('hotspot');
      
      // Step 2: Create visualization
      const layerResults = [{
        layer: {
          id: 'conversions',
          name: 'Conversions Layer',
          type: 'feature',
          fields: [
            { name: 'RATE', type: 'double', label: 'Conversion Rate' }
          ]
        },
        features: [
          {
            attributes: {
              RATE: 0.8
            },
            geometry: {
              type: 'point',
              x: -118.2437,
              y: 34.0522
            }
          }
        ]
      }];

      const options: VisualizationOptions = {
        // No direct symbolConfig for heatmap, leave empty or add custom if needed
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });

  describe('Multivariate Analysis Flow', () => {
    test('should process multivariate query and create visualization', async () => {
      const query = 'Show relationship between income, education, and conversion rates';
      
      // Step 1: Analyze query
      const analysisResult = await analyzeQuery(query, mockConceptMap);
      expect(analysisResult).toBeDefined();
      expect(analysisResult.queryType).toBe('multivariate');
      
      // Step 2: Create visualization
      const layerResults = [{
        layer: {
          id: 'demographics',
          name: 'Demographics Layer',
          type: 'feature',
          fields: [
            { name: 'INCOME', type: 'double', label: 'Income' },
            { name: 'EDUCATION', type: 'double', label: 'Education' },
            { name: 'CONVERSION', type: 'double', label: 'Conversion Rate' }
          ]
        },
        features: [
          {
            attributes: {
              INCOME: 50000,
              EDUCATION: 12,
              CONVERSION: 0.7
            }
          }
        ]
      }];

      const options: VisualizationOptions = {
        symbolConfig: {
          color: [255, 0, 0, 1],
          size: 8
        }
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });

  describe('Error Handling in Flow', () => {
    test('should handle invalid query gracefully', async () => {
      const query = 'Invalid query that should fail';
      
      // Step 1: Analyze query
      const analysisResult = await analyzeQuery(query, mockConceptMap);
      expect(analysisResult).toBeDefined();
      expect(analysisResult.queryType).toBe('default');
      
      // Step 2: Attempt visualization
      const layerResults = [{
        layer: {
          id: 'test',
          name: 'Test Layer',
          type: 'feature',
          fields: []
        },
        features: []
      }];

      const options: VisualizationOptions = {
        symbolConfig: {
          color: [200, 200, 200, 0.5]
        }
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
    });

    test('should handle missing data gracefully', async () => {
      const query = 'Show correlation between income and education';
      
      // Step 1: Analyze query
      const analysisResult = await analyzeQuery(query, mockConceptMap);
      expect(analysisResult).toBeDefined();
      
      // Step 2: Attempt visualization with missing data
      const layerResults = [{
        layer: {
          id: 'test',
          name: 'Test Layer',
          type: 'feature',
          fields: [
            { name: 'INCOME', type: 'double', label: 'Income' }
            // Missing EDUCATION field
          ]
        },
        features: []
      }];

      const options: VisualizationOptions = {
        symbolConfig: {
          color: [255, 0, 0, 1],
          size: 8
        }
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
    });
  });

  describe('Interactive Features in Flow', () => {
    test('should create visualization with popups and selection', async () => {
      const query = 'Show income levels with detailed popups';
      
      // Step 1: Analyze query
      const analysisResult = await analyzeQuery(query, mockConceptMap);
      expect(analysisResult).toBeDefined();
      
      // Step 2: Create visualization with interactive features
      const layerResults = [{
        layer: {
          id: 'income',
          name: 'Income Layer',
          type: 'feature',
          fields: [
            { name: 'INCOME', type: 'double', label: 'Income' },
            { name: 'REGION', type: 'string', label: 'Region' }
          ]
        },
        features: [
          {
            attributes: {
              INCOME: 50000,
              REGION: 'North'
            }
          }
        ]
      }];

      const options: VisualizationOptions = {
        symbolConfig: {
          color: [200, 200, 200, 0.5]
        },
        popupConfig: {
          titleExpression: '{REGION}',
          content: [
            {
              type: 'fields',
              fieldInfos: [
                { fieldName: 'INCOME', label: 'Income' },
                { fieldName: 'REGION', label: 'Region' }
              ]
            }
          ]
        }
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });
}); 