import { VisualizationFactory } from '../../utils/visualization-factory';
import { VisualizationType } from '../../config/dynamic-layers';
import { AnalysisResult, EnhancedAnalysisResult } from '../../types/analysis';
import { PopupConfiguration } from '../../types/popup-config';

describe('Advanced Visualization Tests', () => {
  let visualizationFactory: VisualizationFactory;

  beforeEach(() => {
    const mockAnalysisResult: AnalysisResult = {
      intent: 'visualization_request',
      relevantLayers: ['test-layer'],
      queryType: 'distribution',
      confidence: 0.8,
      explanation: 'Test analysis',
      relevantFields: ['test'],
      originalQuery: 'Test query'
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

  describe('Bivariate Visualization', () => {
    test('should create bivariate visualization with two numeric fields', async () => {
      const layerResults = [{
        layer: {
          id: 'test',
          name: 'Test Layer',
          type: 'feature',
          fields: [
            { name: 'FIELD1', type: 'double', label: 'Field 1' },
            { name: 'FIELD2', type: 'double', label: 'Field 2' }
          ]
        },
        features: [
          {
            attributes: {
              FIELD1: 100,
              FIELD2: 200
            }
          }
        ]
      }];

      const options = {
        visualizationMode: 'bivariate',
        query: 'Show relationship between Field 1 and Field 2'
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });

  describe('Buffer Visualization', () => {
    test('should create buffer visualization with distance parameter', async () => {
      const layerResults = [{
        layer: {
          id: 'test',
          name: 'Test Layer',
          type: 'feature',
          fields: [
            { name: 'DISTANCE', type: 'double', label: 'Distance' }
          ]
        },
        features: [
          {
            attributes: {
              DISTANCE: 1000
            },
            geometry: {
              type: 'point',
              x: -118.2437,
              y: 34.0522
            }
          }
        ]
      }];

      const options = {
        visualizationMode: 'buffer',
        query: 'Show 1km buffer around points',
        bufferDistance: 1000
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });

  describe('Hotspot Visualization', () => {
    test('should create hotspot visualization with clustering', async () => {
      const layerResults = [{
        layer: {
          id: 'test',
          name: 'Test Layer',
          type: 'feature',
          fields: [
            { name: 'VALUE', type: 'double', label: 'Value' }
          ]
        },
        features: [
          {
            attributes: {
              VALUE: 100
            },
            geometry: {
              type: 'point',
              x: -118.2437,
              y: 34.0522
            }
          }
        ]
      }];

      const options = {
        visualizationMode: 'hotspot',
        query: 'Show hotspots of high values'
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });

  describe('Network Visualization', () => {
    test('should create network visualization with connections', async () => {
      const layerResults = [{
        layer: {
          id: 'test',
          name: 'Test Layer',
          type: 'feature',
          fields: [
            { name: 'FROM_ID', type: 'string', label: 'From' },
            { name: 'TO_ID', type: 'string', label: 'To' },
            { name: 'WEIGHT', type: 'double', label: 'Weight' }
          ]
        },
        features: [
          {
            attributes: {
              FROM_ID: 'A',
              TO_ID: 'B',
              WEIGHT: 1.0
            },
            geometry: {
              type: 'polyline',
              paths: [[[-118.2437, 34.0522], [-118.3, 34.1]]]
            }
          }
        ]
      }];

      const options = {
        visualizationMode: 'network',
        query: 'Show network connections'
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });

  describe('Multivariate Visualization', () => {
    test('should create multivariate visualization with multiple fields', async () => {
      const layerResults = [{
        layer: {
          id: 'test',
          name: 'Test Layer',
          type: 'feature',
          fields: [
            { name: 'FIELD1', type: 'double', label: 'Field 1' },
            { name: 'FIELD2', type: 'double', label: 'Field 2' },
            { name: 'FIELD3', type: 'double', label: 'Field 3' }
          ]
        },
        features: [
          {
            attributes: {
              FIELD1: 100,
              FIELD2: 200,
              FIELD3: 300
            }
          }
        ]
      }];

      const options = {
        visualizationMode: 'multivariate',
        query: 'Show relationship between multiple fields'
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });

  describe('Joint High Visualization', () => {
    test('should create joint high visualization for multiple variables', async () => {
      const layerResults = [{
        layer: {
          id: 'test',
          name: 'Test Layer',
          type: 'feature',
          fields: [
            { name: 'VAR1', type: 'double', label: 'Variable 1' },
            { name: 'VAR2', type: 'double', label: 'Variable 2' }
          ]
        },
        features: [
          {
            attributes: {
              VAR1: 100,
              VAR2: 200
            }
          }
        ]
      }];

      const options = {
        visualizationMode: 'joint_high',
        query: 'Show areas with high values in both variables'
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });

  describe('Proportional Symbol Visualization', () => {
    test('should create proportional symbol visualization', async () => {
      const layerResults = [{
        layer: {
          id: 'test',
          name: 'Test Layer',
          type: 'feature',
          fields: [
            { name: 'SIZE', type: 'double', label: 'Size' }
          ]
        },
        features: [
          {
            attributes: {
              SIZE: 100
            },
            geometry: {
              type: 'point',
              x: -118.2437,
              y: 34.0522
            }
          }
        ]
      }];

      const options = {
        visualizationMode: 'proportional_symbol',
        query: 'Show values as proportional symbols'
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });

  describe('Hexbin Visualization', () => {
    test('should create hexbin visualization for point density', async () => {
      const layerResults = [{
        layer: {
          id: 'test',
          name: 'Test Layer',
          type: 'feature',
          fields: [
            { name: 'VALUE', type: 'double', label: 'Value' }
          ]
        },
        features: [
          {
            attributes: {
              VALUE: 100
            },
            geometry: {
              type: 'point',
              x: -118.2437,
              y: 34.0522
            }
          }
        ]
      }];

      const options = {
        visualizationMode: 'hexbin',
        query: 'Show point density using hexbins'
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });

  describe('Statistical Visualizations', () => {
    test('should create boxplot visualization', async () => {
      const layerResults = [{
        layer: {
          id: 'test',
          name: 'Test Layer',
          type: 'feature',
          fields: [
            { name: 'VALUE', type: 'double', label: 'Value' },
            { name: 'CATEGORY', type: 'string', label: 'Category' }
          ]
        },
        features: [
          {
            attributes: {
              VALUE: 100,
              CATEGORY: 'A'
            }
          }
        ]
      }];

      const options = {
        visualizationMode: 'boxplot',
        query: 'Show value distribution by category'
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });

    test('should create histogram visualization', async () => {
      const layerResults = [{
        layer: {
          id: 'test',
          name: 'Test Layer',
          type: 'feature',
          fields: [
            { name: 'VALUE', type: 'double', label: 'Value' }
          ]
        },
        features: [
          {
            attributes: {
              VALUE: 100
            }
          }
        ]
      }];

      const options = {
        visualizationMode: 'histogram',
        query: 'Show value distribution'
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });

  describe('Interactive Features', () => {
    test('should create visualization with popup configuration', async () => {
      const layerResults = [{
        layer: {
          id: 'test',
          name: 'Test Layer',
          type: 'feature',
          fields: [
            { name: 'VALUE', type: 'double', label: 'Value' }
          ]
        },
        features: [
          {
            attributes: {
              VALUE: 100
            }
          }
        ]
      }];

      const popupConfig: PopupConfiguration = {
        titleExpression: '{VALUE}',
        content: [
          {
            type: 'fields',
            fieldInfos: [
              { fieldName: 'VALUE', label: 'Value' }
            ]
          }
        ]
      };

      const options = {
        visualizationMode: 'single_layer',
        query: 'Show values with popups',
        popupConfig
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });

    test('should handle feature selection', async () => {
      const layerResults = [{
        layer: {
          id: 'test',
          name: 'Test Layer',
          type: 'feature',
          fields: [
            { name: 'VALUE', type: 'double', label: 'Value' }
          ]
        },
        features: [
          {
            attributes: {
              VALUE: 100
            }
          }
        ]
      }];

      const options = {
        visualizationMode: 'single_layer',
        query: 'Show values with selection',
        enableSelection: true
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });
}); 