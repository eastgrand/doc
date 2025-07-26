import { analyzeQuery } from '../../../lib/query-analyzer';
import { ConceptMap, AnalysisResult as LibAnalysisResult } from '../../../lib/analytics/types';
import { VisualizationFactory } from '../../../utils/visualization-factory';
import { AnalysisResult, EnhancedAnalysisResult } from '../../../types/analysis';
import { VisualizationType } from '../../../config/dynamic-layers';

describe('Query Analysis Pipeline', () => {
  let visualizationFactory: VisualizationFactory;

  beforeEach(() => {
    const mockAnalysisResult: AnalysisResult = {
      intent: 'unknown',
      relevantLayers: [],
      queryType: 'unknown',
      confidence: 0.8,
      explanation: 'Test analysis'
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

  describe('Query Analysis', () => {
    test('should analyze a simple correlation query', async () => {
      const query = "Show correlation between income and education levels";
      const conceptMap: ConceptMap = {
        matchedLayers: ['income', 'education'],
        matchedFields: ['INCOME', 'EDUCATION'],
        confidence: 0.8,
        keywords: ['income', 'education', 'correlation'],
        layerScores: { 'income': 0.9, 'education': 0.8 },
        fieldScores: { 'INCOME': 0.9, 'EDUCATION': 0.8 }
      };
      
      const result = await analyzeQuery(query, conceptMap);
      
      expect(result.queryType).toBe('correlation');
      expect(result.visualizationStrategy).toBe('correlation');
      expect(result.targetVariable).toBe('INCOME');
      expect(result.targetField).toBe('INCOME');
      expect(result.relevantLayers).toContain('income');
      expect(result.relevantLayers).toContain('education');
    });

    test('should analyze a complex multivariate query', async () => {
      const query = "Analyze the relationship between population density, income levels, and education attainment across neighborhoods";
      const conceptMap: ConceptMap = {
        matchedLayers: ['population', 'income', 'education'],
        matchedFields: ['POPULATION', 'INCOME', 'EDUCATION'],
        confidence: 0.8,
        keywords: ['population', 'income', 'education', 'relationship'],
        layerScores: { 'population': 0.9, 'income': 0.8, 'education': 0.8 },
        fieldScores: { 'POPULATION': 0.9, 'INCOME': 0.8, 'EDUCATION': 0.8 }
      };
      
      const result = await analyzeQuery(query, conceptMap);
      
      expect(result.queryType).toBe('correlation');
      expect(result.visualizationStrategy).toBe('correlation');
      expect(result.targetVariable).toBe('POPULATION');
      expect(result.targetField).toBe('POPULATION');
      expect(result.relevantLayers).toContain('population');
      expect(result.relevantLayers).toContain('income');
      expect(result.relevantLayers).toContain('education');
    });

    test('should analyze a ranking query with context', async () => {
      const initialQuery = "Show me areas with high income";
      const followUpQuery = "Now show me the top 10 areas";
      const conceptMap: ConceptMap = {
        matchedLayers: ['income'],
        matchedFields: ['INCOME'],
        confidence: 0.8,
        keywords: ['income', 'high', 'areas'],
        layerScores: { 'income': 0.9 },
        fieldScores: { 'INCOME': 0.9 }
      };
      
      const initialResult = await analyzeQuery(initialQuery, conceptMap);
      expect(initialResult.queryType).toBe('ranking');
      expect(initialResult.visualizationStrategy).toBe('single-layer');
      
      const followUpResult = await analyzeQuery(followUpQuery, conceptMap, initialQuery);
      expect(followUpResult.queryType).toBe('ranking');
      expect(followUpResult.visualizationStrategy).toBe('single-layer');
      // Remove sqlQuery test as it's not part of AnalysisResult type
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid queries', async () => {
      const query = "Show me something impossible";
      const conceptMap: ConceptMap = {
        matchedLayers: [],
        matchedFields: [],
        confidence: 0,
        keywords: [],
        layerScores: {},
        fieldScores: {}
      };
      
      const result = await analyzeQuery(query, conceptMap);
      
      expect(result.queryType).toBe('simple_display');
      expect(result.visualizationStrategy).toBe('single-layer');
      expect(result.relevantLayers).toHaveLength(0);
    });

    test('should handle missing data requirements', async () => {
      const query = "Show correlation between non-existent variables";
      const conceptMap: ConceptMap = {
        matchedLayers: [],
        matchedFields: [],
        confidence: 0,
        keywords: [],
        layerScores: {},
        fieldScores: {}
      };
      
      const result = await analyzeQuery(query, conceptMap);
      
      expect(result.queryType).toBe('correlation');
      expect(result.visualizationStrategy).toBe('correlation');
      expect(result.relevantLayers).toHaveLength(0);
    });
  });

  describe('Context Handling', () => {
    test('should maintain context in follow-up queries', async () => {
      const queries = [
        "Show areas with high income",
        "Filter to show only urban areas",
        "Now show correlation with education"
      ];
      const conceptMap: ConceptMap = {
        matchedLayers: ['income', 'urban', 'education'],
        matchedFields: ['INCOME', 'URBAN', 'EDUCATION'],
        confidence: 0.8,
        keywords: ['income', 'urban', 'education', 'areas'],
        layerScores: { 'income': 0.9, 'urban': 0.7, 'education': 0.8 },
        fieldScores: { 'INCOME': 0.9, 'URBAN': 0.7, 'EDUCATION': 0.8 }
      };
      
      let context = '';
      for (const query of queries) {
        const result = await analyzeQuery(query, conceptMap, context);
        context = query;
        expect(result.relevantLayers).toContain('income');
      }
    });

    test('should handle context with pronouns', async () => {
      const queries = [
        "Show me income levels",
        "Compare it with education"
      ];
      const conceptMap: ConceptMap = {
        matchedLayers: ['income', 'education'],
        matchedFields: ['INCOME', 'EDUCATION'],
        confidence: 0.8,
        keywords: ['income', 'education', 'compare'],
        layerScores: { 'income': 0.9, 'education': 0.8 },
        fieldScores: { 'INCOME': 0.9, 'EDUCATION': 0.8 }
      };
      
      let context = '';
      for (const query of queries) {
        const result = await analyzeQuery(query, conceptMap, context);
        context = query;
        if (query.includes('it')) {
          expect(result.relevantLayers).toContain('income');
          expect(result.relevantLayers).toContain('education');
        }
      }
    });
  });
}); 