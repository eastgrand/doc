import { VisualizationFactory } from '../../../utils/visualization-factory';
import { VisualizationType } from '../../../config/dynamic-layers';
import { AnalysisResult, EnhancedAnalysisResult } from '../../../types/analysis';
import { PopupConfiguration } from '../../../types/popup-config';

describe('Visualization Factory', () => {
  let visualizationFactory: VisualizationFactory;

  beforeEach(() => {
    const mockAnalysisResult: AnalysisResult = {
      intent: 'Analysis of income and education correlation',
      relevantLayers: ['income', 'education'],
      queryType: 'correlation',
      confidence: 0.8,
      explanation: 'Analysis of income and education correlation'
    };

    const mockEnhancedAnalysis: EnhancedAnalysisResult = {
      queryType: 'correlation',
      visualizationStrategy: {
        title: 'Income vs Education Correlation',
        description: 'Shows the relationship between income and education levels',
        targetVariable: 'INCOME',
        correlationField: 'EDUCATION'
      },
      confidence: 0.8,
      suggestedActions: []
    };

    visualizationFactory = new VisualizationFactory({
      analysisResult: mockAnalysisResult,
      enhancedAnalysis: mockEnhancedAnalysis,
      features: { features: [] }
    });
  });

  describe('Visualization Creation', () => {
    test('should create correlation visualization', async () => {
      const layerResults = [{
        layer: {
          id: 'income',
          name: 'Income Layer',
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

      const options = {
        visualizationMode: 'correlation',
        query: 'Show correlation between income and education'
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });

    test('should create multivariate visualization', async () => {
      const layerResults = [{
        layer: {
          id: 'income',
          name: 'Income Layer',
          type: 'feature',
          fields: [
            { name: 'INCOME', type: 'double', label: 'Income' },
            { name: 'EDUCATION', type: 'double', label: 'Education' },
            { name: 'POPULATION', type: 'double', label: 'Population' }
          ]
        },
        features: [
          {
            attributes: {
              INCOME: 50000,
              EDUCATION: 12,
              POPULATION: 1000
            }
          }
        ]
      }];

      const options = {
        visualizationMode: 'multivariate',
        query: 'Show relationship between income, education, and population'
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });

    test('should create top-n visualization', async () => {
      const layerResults = [{
        layer: {
          id: 'income',
          name: 'Income Layer',
          type: 'feature',
          fields: [
            { name: 'INCOME', type: 'double', label: 'Income' }
          ]
        },
        features: [
          {
            attributes: {
              INCOME: 50000
            }
          }
        ]
      }];

      const options = {
        visualizationMode: 'top-n',
        query: 'Show top 10 areas by income'
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid visualization mode', async () => {
      const layerResults = [{
        layer: {
          id: 'income',
          name: 'Income Layer',
          type: 'feature',
          fields: [
            { name: 'INCOME', type: 'double', label: 'Income' }
          ]
        },
        features: [
          {
            attributes: {
              INCOME: 50000
            }
          }
        ]
      }];

      const options = {
        visualizationMode: 'invalid',
        query: 'Show invalid visualization'
      };

      await expect(visualizationFactory.createVisualization(layerResults, options))
        .rejects
        .toThrow('Invalid visualization mode');
    });

    test('should handle missing layer data', async () => {
      const layerResults: any[] = [];
      const options = {
        visualizationMode: 'correlation',
        query: 'Show correlation'
      };

      await expect(visualizationFactory.createVisualization(layerResults, options))
        .rejects
        .toThrow('No layer data available');
    });

    test('should handle invalid layer type', async () => {
      const layerResults = [{
        layer: {
          id: 'invalid',
          name: 'Invalid Layer',
          type: 'invalid',
          fields: []
        },
        features: []
      }];

      const options = {
        visualizationMode: 'correlation',
        query: 'Show correlation'
      };

      await expect(visualizationFactory.createVisualization(layerResults, options))
        .rejects
        .toThrow('Invalid layer type');
    });
  });

  describe('Advanced Visualization', () => {
    test('should create visualization with additional options', async () => {
      const layerResults = [{
        layer: {
          id: 'income',
          name: 'Income Layer',
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

      const popupConfig: PopupConfiguration = {
        titleExpression: '{INCOME} vs {EDUCATION}',
        content: [
          {
            type: 'fields',
            fieldInfos: [
              { fieldName: 'INCOME', label: 'Income' },
              { fieldName: 'EDUCATION', label: 'Education' }
            ]
          }
        ]
      };

      const options = {
        visualizationMode: 'correlation',
        query: 'Show correlation between income and education',
        popupConfig
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });

  describe('Visualization Configuration', () => {
    test('should configure visualization with default options', async () => {
      const layerResults = [{
        layer: {
          id: 'income',
          name: 'Income Layer',
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

      const options = {
        visualizationMode: 'correlation',
        query: 'Show correlation between income and education'
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });

    test('should configure visualization with custom options', async () => {
      const layerResults = [{
        layer: {
          id: 'income',
          name: 'Income Layer',
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

      const popupConfig: PopupConfiguration = {
        titleExpression: 'Custom Title: {INCOME}',
        content: [
          {
            type: 'fields',
            fieldInfos: [
              { fieldName: 'INCOME', label: 'Custom Income Label' },
              { fieldName: 'EDUCATION', label: 'Custom Education Label' }
            ]
          }
        ]
      };

      const options = {
        visualizationMode: 'correlation',
        query: 'Show correlation between income and education',
        popupConfig
      };

      const visualization = await visualizationFactory.createVisualization(layerResults, options);
      expect(visualization).toBeDefined();
      expect(visualization.layer).toBeDefined();
      expect(visualization.extent).toBeDefined();
    });
  });
}); 