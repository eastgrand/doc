import { CompetitiveDataProcessor } from '../CompetitiveDataProcessor';
import type { RawAnalysisResult, ProcessedAnalysisData } from '../../../types';

describe('E2E: CompetitiveDataProcessor', () => {
  it('emits competitive_analysis_score as targetVariable and sorts descending', () => {
    const raw: RawAnalysisResult = {
      success: true,
      results: [
        { ID: '10', DESCRIPTION: 'ZIP 60601 - City X, ST', competitive_analysis_score: 41 },
        { ID: '20', DESCRIPTION: 'ZIP 60602 - City Y, ST', competitive_analysis_score: 77 },
        { ID: '30', DESCRIPTION: 'ZIP 60603 - City Z, ST', competitive_analysis_score: 55 }
      ] as unknown[]
    };

    const proc = new CompetitiveDataProcessor();
    const out = proc.process(raw) as ProcessedAnalysisData;

    expect(out.type).toBe('competitive_analysis');
    expect(out.targetVariable).toBe('competitive_analysis_score');
    expect(out.records[0].area_id).toBe('20');
    expect(out.records[0].value).toBeGreaterThanOrEqual(out.records[1].value);
    expect(out.records[1].value).toBeGreaterThanOrEqual(out.records[2].value);
  });
});
