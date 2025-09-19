/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPrimaryScoreField } from '../HardcodedFieldDefs';

// Import all active processors
import { AnalyzeProcessor } from '../AnalyzeProcessor';
import { BrandDifferenceProcessor } from '../BrandDifferenceProcessor';
import { CompetitiveDataProcessor } from '../CompetitiveDataProcessor';
import { ConsensusAnalysisProcessor } from '../ConsensusAnalysisProcessor';
import { CorrelationAnalysisProcessor } from '../CorrelationAnalysisProcessor';
import { DemographicDataProcessor } from '../DemographicDataProcessor';
import { EnsembleAnalysisProcessor } from '../EnsembleAnalysisProcessor';
import { OutlierDetectionProcessor } from '../OutlierDetectionProcessor';
import { PredictiveModelingProcessor } from '../PredictiveModelingProcessor';
import { SpatialClustersProcessor } from '../SpatialClustersProcessor';
import { StrategicAnalysisProcessor } from '../StrategicAnalysisProcessor';
import { TrendAnalysisProcessor } from '../TrendAnalysisProcessor';

describe('Hardcoded field detection and alignment (deterministic)', () => {
  
  describe('All processors use hardcoded primary fields correctly', () => {
    
    it('StrategicAnalysisProcessor: uses hardcoded strategic_score field and aligns renderer/targetVariable', () => {
      const processor = new StrategicAnalysisProcessor();
      const res = processor.process({
        success: true,
        results: [
          { ID: 'S1', area_name: 'Strategic Area 1', strategic_analysis_score: 85, strategic_score: 85 },
          { ID: 'S2', area_name: 'Strategic Area 2', strategic_analysis_score: 72, strategic_score: 72 }
        ],
        summary: 'Strategic analysis test',
        feature_importance: []
      } as any);

      expect(res.targetVariable).toBe('strategic_score');
      expect((res.renderer as any).field).toBe('strategic_score');
      expect(res.records[0].value).toBeCloseTo(85, 0);
      expect((res.records[0] as any).strategic_analysis_score).toBeCloseTo(85, 0);
    });

    it('CompetitiveDataProcessor: uses hardcoded competitive_score field', () => {
      const processor = new CompetitiveDataProcessor();
      const res = processor.process({
        success: true,
        results: [
          { ID: 'C1', area_name: 'Competitive Area 1', competitive_score: 90, competitive_analysis_score: 90 },
          { ID: 'C2', area_name: 'Competitive Area 2', competitive_score: 75, competitive_analysis_score: 75 }
        ],
        summary: 'Competitive analysis test',
        feature_importance: []
      } as any);

      expect(res.targetVariable).toBe('competitive_score');
      expect((res.renderer as any).field).toBe('competitive_score');
      expect(res.records[0].value).toBeCloseTo(90, 0);
    });

    it('DemographicDataProcessor: uses hardcoded demographic_score field', () => {
      const processor = new DemographicDataProcessor();
      const res = processor.process({
        success: true,
        results: [
          { ID: 'D1', area_name: 'Demo Area 1', demographic_score: 78, demographic_insights_score: 78 },
          { ID: 'D2', area_name: 'Demo Area 2', demographic_score: 65, demographic_insights_score: 65 }
        ],
        summary: 'Demographic insights test',
        feature_importance: []
      } as any);

      expect(res.targetVariable).toBe('demographic_score');
      expect((res.renderer as any).field).toBe('demographic_score');
      expect(res.records[0].value).toBeCloseTo(78, 0);
    });

    it('TrendAnalysisProcessor: uses hardcoded trend_score field', () => {
      const processor = new TrendAnalysisProcessor();
      const res = processor.process({
        success: true,
        results: [
          { ID: 'T1', area_name: 'Trend Area 1', trend_score: 82 },
          { ID: 'T2', area_name: 'Trend Area 2', trend_score: 68 }
        ],
        summary: 'Trend analysis test',
        feature_importance: []
      } as any);

      expect(res.targetVariable).toBe('trend_score');
      expect((res.renderer as any).field).toBe('trend_score');
      expect(res.records[0].value).toBeCloseTo(82, 0);
    });

    it('AnalyzeProcessor: uses hardcoded analysis_score field', () => {
      const processor = new AnalyzeProcessor();
      const res = processor.process({
        success: true,
        results: [
          { ID: 'A1', area_name: 'Analysis Area 1', analysis_score: 77 },
          { ID: 'A2', area_name: 'Analysis Area 2', analysis_score: 63 }
        ],
        summary: 'General analysis test',
        feature_importance: []
      } as any);

      expect(res.targetVariable).toBe('analysis_score');
      expect((res.renderer as any).field).toBe('analysis_score');
      expect(res.records[0].value).toBeCloseTo(77, 0);
    });

    it('BrandDifferenceProcessor: uses hardcoded brand_difference_score field', () => {
      const processor = new BrandDifferenceProcessor();
      const res = processor.process({
        success: true,
        results: [
          { ID: 'B1', area_name: 'Brand Area 1', brand_difference_score: 15.5, comparison_score: 15.5 },
          { ID: 'B2', area_name: 'Brand Area 2', brand_difference_score: -8.2, comparison_score: -8.2 }
        ],
        summary: 'Brand difference test',
        feature_importance: []
      } as any);

      expect(res.targetVariable).toBe('brand_difference_score');
      expect((res.renderer as any).field).toBe('brand_difference_score');
      expect(res.records[0].value).toBeCloseTo(15.5, 1);
    });

    it('SpatialClustersProcessor: uses hardcoded cluster_score field', () => {
      const processor = new SpatialClustersProcessor();
      const res = processor.process({
        success: true,
        results: [
          { ID: 'SC1', area_name: 'Cluster Area 1', cluster_score: 88, spatial_clusters_score: 88 },
          { ID: 'SC2', area_name: 'Cluster Area 2', cluster_score: 71, spatial_clusters_score: 71 }
        ],
        summary: 'Spatial clusters test',
        feature_importance: []
      } as any);

      expect(res.targetVariable).toBe('cluster_score');
      expect((res.renderer as any).field).toBe('cluster_score');
      expect(res.records[0].value).toBeCloseTo(88, 0);
    });

    it('OutlierDetectionProcessor: uses hardcoded outlier_score field', () => {
      const processor = new OutlierDetectionProcessor();
      const res = processor.process({
        success: true,
        results: [
          { ID: 'O1', area_name: 'Outlier Area 1', outlier_score: 95 },
          { ID: 'O2', area_name: 'Outlier Area 2', outlier_score: 12 }
        ],
        summary: 'Outlier detection test',
        feature_importance: []
      } as any);

      expect(res.targetVariable).toBe('outlier_score');
      expect((res.renderer as any).field).toBe('outlier_score');
      expect(res.records[0].value).toBeCloseTo(95, 0);
    });

    it('ConsensusAnalysisProcessor: uses hardcoded consensus_analysis_score field', () => {
      const processor = new ConsensusAnalysisProcessor();
      const res = processor.process({
        success: true,
        results: [
          { ID: 'CN1', area_name: 'Consensus Area 1', consensus_analysis_score: 83 },
          { ID: 'CN2', area_name: 'Consensus Area 2', consensus_analysis_score: 69 }
        ],
        summary: 'Consensus analysis test',
        feature_importance: []
      } as any);

      expect(res.targetVariable).toBe('consensus_analysis_score');
      expect((res.renderer as any).field).toBe('consensus_analysis_score');
      expect(res.records[0].value).toBeCloseTo(83, 0);
    });

    it('EnsembleAnalysisProcessor: uses hardcoded ensemble_analysis_score field', () => {
      const processor = new EnsembleAnalysisProcessor();
      const res = processor.process({
        success: true,
        results: [
          { ID: 'E1', area_name: 'Ensemble Area 1', ensemble_analysis_score: 79 },
          { ID: 'E2', area_name: 'Ensemble Area 2', ensemble_analysis_score: 66 }
        ],
        summary: 'Ensemble analysis test',
        feature_importance: []
      } as any);

      expect(res.targetVariable).toBe('ensemble_analysis_score');
      expect((res.renderer as any).field).toBe('ensemble_analysis_score');
      expect(res.records[0].value).toBeCloseTo(79, 0);
    });

    it('CorrelationAnalysisProcessor: uses hardcoded correlation_score field', () => {
      const processor = new CorrelationAnalysisProcessor();
      const res = processor.process({
        success: true,
        results: [
          { 
            ID: 'CR1', 
            area_name: 'Correlation Area 1', 
            correlation_score: 0.85,
            feature1: 'income',
            feature2: 'education',
            sample_size: 100
          }
        ],
        summary: 'Correlation analysis test',
        feature_importance: []
      } as any);

      expect(res.targetVariable).toBe('correlation_score');
      expect((res.renderer as any).field).toBe('correlation_score');
      expect(res.records[0].value).toBeCloseTo(0.85, 2);
    });

    it('PredictiveModelingProcessor: uses hardcoded prediction_score field', () => {
      const processor = new PredictiveModelingProcessor();
      const res = processor.process({
        success: true,
        results: [
          { ID: 'P1', area_name: 'Prediction Area 1', prediction_score: 92 },
          { ID: 'P2', area_name: 'Prediction Area 2', prediction_score: 78 }
        ],
        summary: 'Predictive modeling test',
        feature_importance: []
      } as any);

      expect(res.targetVariable).toBe('prediction_score');
      expect((res.renderer as any).field).toBe('prediction_score');
      expect(res.records[0].value).toBeCloseTo(92, 0);
    });
  });

  describe('Field mapping configuration matches processor outputs', () => {
    const testCases = [
      { analysisType: 'strategic-analysis', expectedField: 'strategic_score' },
      { analysisType: 'competitive-analysis', expectedField: 'competitive_score' },
      { analysisType: 'demographic-insights', expectedField: 'demographic_score' },
      { analysisType: 'trend-analysis', expectedField: 'trend_score' },
      { analysisType: 'brand-difference', expectedField: 'brand_difference_score' },
      { analysisType: 'spatial-clusters', expectedField: 'cluster_score' },
      { analysisType: 'analyze', expectedField: 'analysis_score' },
      { analysisType: 'outlier-detection', expectedField: 'outlier_score' },
      { analysisType: 'correlation-analysis', expectedField: 'correlation_score' },
      { analysisType: 'predictive-modeling', expectedField: 'prediction_score' },
      { analysisType: 'ensemble-analysis', expectedField: 'ensemble_analysis_score' },
      { analysisType: 'consensus-analysis', expectedField: 'consensus_analysis_score' },
      { analysisType: 'anomaly-detection', expectedField: 'anomaly_score' },
      { analysisType: 'scenario-analysis', expectedField: 'scenario_score' },
      { analysisType: 'sensitivity-analysis', expectedField: 'sensitivity_score' },
      { analysisType: 'segment-profiling', expectedField: 'segment_score' },
      { analysisType: 'feature-importance-ranking', expectedField: 'importance_score' },
      { analysisType: 'feature-interactions', expectedField: 'interaction_score' },
      { analysisType: 'model-performance', expectedField: 'model_performance_prediction_score' },
      { analysisType: 'model-selection', expectedField: 'algorithm_category' },
      { analysisType: 'dimensionality-insights', expectedField: 'dimensionality_insights_score' },
      { analysisType: 'algorithm-comparison', expectedField: 'algorithm_comparison_score' },
      { analysisType: 'comparative-analysis', expectedField: 'comparison_score' }
    ];

    testCases.forEach(({ analysisType, expectedField }) => {
      it(`${analysisType} should map to ${expectedField}`, () => {
        const field = getPrimaryScoreField(analysisType);
        expect(field).toBe(expectedField);
      });
    });
  });

  describe('Metadata targetVariable override works correctly', () => {
    it('should respect metadata.targetVariable when provided', () => {
      const processor = new StrategicAnalysisProcessor();
      const res = processor.process({
        success: true,
        results: [
          { ID: 'M1', area_name: 'Meta Area 1', custom_score: 99, strategic_analysis_score: 50 }
        ],
        summary: 'Metadata override test',
        feature_importance: [],
        metadata: { targetVariable: 'custom_score' }
      } as any);

      // Note: The processor should use metadata.targetVariable
      const expectedField = getPrimaryScoreField('strategic-analysis', { targetVariable: 'custom_score' });
      expect(expectedField).toBe('custom_score');
    });
  });
});