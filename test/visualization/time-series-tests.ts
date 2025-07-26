import { VisualizationFactory } from '../../utils/visualization-factory';
import { AnalysisResult, EnhancedAnalysisResult } from '../../types/analysis';

describe('Time Series Visualization Tests', () => {
  let visualizationFactory: VisualizationFactory;

  beforeEach(() => {
    const mockAnalysisResult: AnalysisResult = {
      intent: 'visualization_request',
      relevantLayers: ['test-layer'],
      queryType: 'time_series',
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

  describe('Daily Aggregation', () => {
    test('should create daily time series visualization', async () => {
      const layerResults = [{
        layer: {
          id: 'test',
          name: 'Test Layer',
          type: 'feature',
          fields: [
            { name: 'DATE', type: 'date', label: 'Date' },
            { name: 'VALUE', type: 'double', label: 'Value' }
          ]
        },
        features: [
          {
            attributes: {
              DATE: new Date('2024-01-01'),
              VALUE: 100
            }
          },
          {
            attributes: {
              DATE: new Date('2024-01-02'),
              VALUE: 200
            }
          }
        ]
      }];

      const options = {
        visualizationMode: 'time_series',
        query: 'Show daily values over time',
        timeAggregation: 'daily'
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });

  describe('Weekly Aggregation', () => {
    test('should create weekly time series visualization', async () => {
      const layerResults = [{
        layer: {
          id: 'test',
          name: 'Test Layer',
          type: 'feature',
          fields: [
            { name: 'DATE', type: 'date', label: 'Date' },
            { name: 'VALUE', type: 'double', label: 'Value' }
          ]
        },
        features: [
          {
            attributes: {
              DATE: new Date('2024-01-01'),
              VALUE: 100
            }
          },
          {
            attributes: {
              DATE: new Date('2024-01-08'),
              VALUE: 200
            }
          }
        ]
      }];

      const options = {
        visualizationMode: 'time_series',
        query: 'Show weekly values over time',
        timeAggregation: 'weekly'
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });

  describe('Monthly Aggregation', () => {
    test('should create monthly time series visualization', async () => {
      const layerResults = [{
        layer: {
          id: 'test',
          name: 'Test Layer',
          type: 'feature',
          fields: [
            { name: 'DATE', type: 'date', label: 'Date' },
            { name: 'VALUE', type: 'double', label: 'Value' }
          ]
        },
        features: [
          {
            attributes: {
              DATE: new Date('2024-01-01'),
              VALUE: 100
            }
          },
          {
            attributes: {
              DATE: new Date('2024-02-01'),
              VALUE: 200
            }
          }
        ]
      }];

      const options = {
        visualizationMode: 'time_series',
        query: 'Show monthly values over time',
        timeAggregation: 'monthly'
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });

  describe('Time Series with Multiple Variables', () => {
    test('should create time series with multiple variables', async () => {
      const layerResults = [{
        layer: {
          id: 'test',
          name: 'Test Layer',
          type: 'feature',
          fields: [
            { name: 'DATE', type: 'date', label: 'Date' },
            { name: 'VALUE1', type: 'double', label: 'Value 1' },
            { name: 'VALUE2', type: 'double', label: 'Value 2' }
          ]
        },
        features: [
          {
            attributes: {
              DATE: new Date('2024-01-01'),
              VALUE1: 100,
              VALUE2: 150
            }
          },
          {
            attributes: {
              DATE: new Date('2024-01-02'),
              VALUE1: 200,
              VALUE2: 250
            }
          }
        ]
      }];

      const options = {
        visualizationMode: 'time_series',
        query: 'Show multiple values over time',
        timeAggregation: 'daily',
        variables: ['VALUE1', 'VALUE2']
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });

  describe('Time Series with Categories', () => {
    test('should create time series with categorical grouping', async () => {
      const layerResults = [{
        layer: {
          id: 'test',
          name: 'Test Layer',
          type: 'feature',
          fields: [
            { name: 'DATE', type: 'date', label: 'Date' },
            { name: 'VALUE', type: 'double', label: 'Value' },
            { name: 'CATEGORY', type: 'string', label: 'Category' }
          ]
        },
        features: [
          {
            attributes: {
              DATE: new Date('2024-01-01'),
              VALUE: 100,
              CATEGORY: 'A'
            }
          },
          {
            attributes: {
              DATE: new Date('2024-01-01'),
              VALUE: 150,
              CATEGORY: 'B'
            }
          }
        ]
      }];

      const options = {
        visualizationMode: 'time_series',
        query: 'Show values over time by category',
        timeAggregation: 'daily',
        categoryField: 'CATEGORY'
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });

  describe('Time Series with Trend Lines', () => {
    test('should create time series with trend line', async () => {
      const layerResults = [{
        layer: {
          id: 'test',
          name: 'Test Layer',
          type: 'feature',
          fields: [
            { name: 'DATE', type: 'date', label: 'Date' },
            { name: 'VALUE', type: 'double', label: 'Value' }
          ]
        },
        features: [
          {
            attributes: {
              DATE: new Date('2024-01-01'),
              VALUE: 100
            }
          },
          {
            attributes: {
              DATE: new Date('2024-01-02'),
              VALUE: 200
            }
          }
        ]
      }];

      const options = {
        visualizationMode: 'time_series',
        query: 'Show values over time with trend',
        timeAggregation: 'daily',
        showTrendLine: true
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });

  describe('Time Series with Moving Average', () => {
    test('should create time series with moving average', async () => {
      const layerResults = [{
        layer: {
          id: 'test',
          name: 'Test Layer',
          type: 'feature',
          fields: [
            { name: 'DATE', type: 'date', label: 'Date' },
            { name: 'VALUE', type: 'double', label: 'Value' }
          ]
        },
        features: [
          {
            attributes: {
              DATE: new Date('2024-01-01'),
              VALUE: 100
            }
          },
          {
            attributes: {
              DATE: new Date('2024-01-02'),
              VALUE: 200
            }
          }
        ]
      }];

      const options = {
        visualizationMode: 'time_series',
        query: 'Show values over time with moving average',
        timeAggregation: 'daily',
        showMovingAverage: true,
        movingAverageWindow: 7
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });
}); 