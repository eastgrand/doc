import { DemographicDataProcessor } from '../DemographicDataProcessor';
import type { RawAnalysisResult, ProcessedAnalysisData } from '../../../types';

describe('E2E: DemographicDataProcessor', () => {
  it('emits demographic_insights_score as targetVariable and sorts descending', () => {
    const raw: RawAnalysisResult = {
      success: true,
      results: [
        { ID: 'A', DESCRIPTION: 'ZIP 10001 - City M, ST', demographic_insights_score: 25 },
        { ID: 'B', DESCRIPTION: 'ZIP 10002 - City N, ST', demographic_insights_score: 82 },
        { ID: 'C', DESCRIPTION: 'ZIP 10003 - City O, ST', demographic_insights_score: 45 }
      ] as unknown[]
    };

    const proc = new DemographicDataProcessor();
    const out = proc.process(raw) as ProcessedAnalysisData;

    expect(out.type).toBe('demographic_analysis');
    expect(out.targetVariable).toBe('demographic_insights_score');
    expect(out.records[0].area_id).toBe('B');
    expect(out.records[0].value).toBeGreaterThanOrEqual(out.records[1].value);
    expect(out.records[1].value).toBeGreaterThanOrEqual(out.records[2].value);
  });
});
