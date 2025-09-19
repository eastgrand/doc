import { ComparativeAnalysisProcessor } from '../ComparativeAnalysisProcessor';
import type { RawAnalysisResult, ProcessedAnalysisData } from '../../../types';

describe('E2E: ComparativeAnalysisProcessor', () => {
  it('emits comparison_score as targetVariable and sorts descending', () => {
    const raw: RawAnalysisResult = {
      success: true,
      results: [
        { ID: 'X', DESCRIPTION: 'ZIP 94102 - City P, ST', comparison_score: 30 },
        { ID: 'Y', DESCRIPTION: 'ZIP 94103 - City Q, ST', comparison_score: 60 },
        { ID: 'Z', DESCRIPTION: 'ZIP 94104 - City R, ST', comparison_score: 40 }
      ] as unknown[]
    };

    const proc = new ComparativeAnalysisProcessor();
    const out = proc.process(raw) as ProcessedAnalysisData;

    expect(out.type).toBe('comparative_analysis');
    expect(out.targetVariable).toBe('comparison_score');
    expect(out.records[0].area_id).toBe('Y');
    expect(out.records[0].value).toBeGreaterThanOrEqual(out.records[1].value);
    expect(out.records[1].value).toBeGreaterThanOrEqual(out.records[2].value);
  });
});
