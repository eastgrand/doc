/*
  Verifies dynamic-only (last numeric field) detection across processors,
  alignment of renderer.field and targetVariable, and error-on-missing behavior.
*/

/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnalyzeProcessor } from '../AnalyzeProcessor';
import { CorrelationAnalysisProcessor } from '../CorrelationAnalysisProcessor';
import { ConsensusAnalysisProcessor } from '../ConsensusAnalysisProcessor';
import { OutlierDetectionProcessor } from '../OutlierDetectionProcessor';
import { TrendAnalysisProcessor } from '../TrendAnalysisProcessor';
import { EnsembleAnalysisProcessor } from '../EnsembleAnalysisProcessor';

describe('Dynamic field detection and alignment (last numeric wins)', () => {
  test('AnalyzeProcessor: uses last numeric field and aligns renderer/targetVariable', () => {
    const proc = new AnalyzeProcessor();
    const res = proc.process({
      success: true,
      results: [
        {
          ID: 'A1',
          DESCRIPTION: 'Area A',
          foo: 1,
          bar: 2,
          zzz_dynamic_score: 42.3 // last numeric
        }
      ]
    } as any);

    expect(res.targetVariable).toBe('zzz_dynamic_score');
  expect((res.renderer as any).field).toBe('zzz_dynamic_score');
    expect(res.records[0].value).toBeCloseTo(42.3, 5);
    // mirrored canonical for compatibility
    expect((res.records[0] as any).analysis_score).toBeCloseTo(42.3, 5);
    // ensure record carries detected field
    expect((res.records[0] as any).zzz_dynamic_score).toBeCloseTo(42.3, 5);
  });

  test('CorrelationAnalysisProcessor: mirrors dynamic field while computing value', () => {
    const proc = new CorrelationAnalysisProcessor();
    const res = proc.process({
      success: true,
      results: [
        {
          ID: 'C1',
          DESCRIPTION: 'City C',
          correlation_analysis_score: 55,
          some_other: 10,
          zzz_dynamic_score: 999 // last numeric; should be selected as targetVariable/renderer
        }
      ]
    } as any);

    expect(res.targetVariable).toBe('zzz_dynamic_score');
    expect((res.renderer as any).field).toBe('zzz_dynamic_score');
    // primary correlation value stays 55, mirrored onto dynamic field
    expect(res.records[0].value).toBeCloseTo(55, 5);
    expect((res.records[0] as any).zzz_dynamic_score).toBeCloseTo(55, 5);
  });

  test('ConsensusAnalysisProcessor: mirrors dynamic field and aligns renderer/targetVariable', () => {
    const proc = new ConsensusAnalysisProcessor();
    const res = proc.process({
      success: true,
      results: [
        {
          ID: 'S1',
          DESCRIPTION: 'Somewhere',
          consensus_analysis_score: 77,
          x: 1,
          zzz_dynamic_score: 500 // last numeric selected
        }
      ]
    } as any);

    expect(res.targetVariable).toBe('zzz_dynamic_score');
    expect((res.renderer as any).field).toBe('zzz_dynamic_score');
    expect(res.records[0].value).toBeCloseTo(77, 5);
    expect((res.records[0] as any).zzz_dynamic_score).toBeCloseTo(77, 5);
  });

  test('OutlierDetectionProcessor: mirrors dynamic field and aligns renderer/targetVariable', () => {
    const proc = new OutlierDetectionProcessor();
    const res = proc.process({
      success: true,
      results: [
        {
          ID: 'O1',
          DESCRIPTION: 'Outlier City',
          outlier_score: 65,
          strategic_value_score: 70,
          mp30034a_b_p: 22,
          zzz_dynamic_score: 111 // last numeric selected
        }
      ]
    } as any);

    expect(res.targetVariable).toBe('zzz_dynamic_score');
    expect((res.renderer as any).field).toBe('zzz_dynamic_score');
    expect(res.records[0].value).toBeCloseTo(65, 5);
    expect((res.records[0] as any).zzz_dynamic_score).toBeCloseTo(65, 5);
  });

  test('TrendAnalysisProcessor: mirrors dynamic field and aligns renderer/targetVariable', () => {
    const proc = new TrendAnalysisProcessor();
    const res = proc.process({
      success: true,
      results: [
        {
          ID: 'T1',
          DESCRIPTION: 'Trend Town',
          trend_score: 70,
          strategic_value_score: 60,
          competitive_advantage_score: 50,
          demographic_opportunity_score: 80,
          zzz_dynamic_score: 7 // last numeric selected
        }
      ]
    } as any);

    expect(res.targetVariable).toBe('zzz_dynamic_score');
    expect((res.renderer as any).field).toBe('zzz_dynamic_score');
    expect(res.records[0].value).toBeCloseTo(70, 5);
    expect((res.records[0] as any).zzz_dynamic_score).toBeCloseTo(70, 5);
  });

  test('EnsembleAnalysisProcessor: uses dynamic field value directly and aligns renderer/targetVariable', () => {
    const proc = new EnsembleAnalysisProcessor();
    const res = proc.process({
      success: true,
      results: [
        {
          ID: 'E1',
          DESCRIPTION: 'Ensemble Ville',
          // dynamic last numeric determines value in Ensemble
          foo: 1,
          bar: 2,
          zzz_dynamic_score: 80
        }
      ]
    } as any);

    expect(res.targetVariable).toBe('zzz_dynamic_score');
    expect((res.renderer as any).field).toBe('zzz_dynamic_score');
    expect(res.records[0].value).toBeCloseTo(80, 5);
    // canonical mirrored for compatibility
    expect((res.records[0] as any).ensemble_analysis_score).toBeCloseTo(80, 5);
  });

  test('AnalyzeProcessor: throws when no numeric fields are present', () => {
    const proc = new AnalyzeProcessor();
  expect(() => proc.process({
      success: true,
      results: [
        { ID: 'X1', DESCRIPTION: 'No numbers here' }
      ]
    } as any)).toThrow();
  });
});
