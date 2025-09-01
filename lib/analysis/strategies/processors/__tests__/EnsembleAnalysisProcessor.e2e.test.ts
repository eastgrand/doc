/* eslint-disable @typescript-eslint/no-explicit-any */
import { EnsembleAnalysisProcessor } from '../EnsembleAnalysisProcessor';

describe('E2E: EnsembleAnalysisProcessor', () => {
  it('aligns renderer.field with targetVariable and mirrors dynamic field', () => {
    const raw: any = {
      success: true,
      results: [
        { ID: '1', DESCRIPTION: 'Area 1', ensemble_analysis_score: 55 },
        { ID: '2', DESCRIPTION: 'Area 2', ensemble_analysis_score: 78 },
        { ID: '3', DESCRIPTION: 'Area 3', ensemble_analysis_score: 62 }
      ]
    };

    const proc = new EnsembleAnalysisProcessor();
    const out: any = proc.process(raw);

    expect(out.type).toBe('ensemble_analysis');
    expect(typeof out.targetVariable).toBe('string');
    expect(out.renderer?.field).toBe(out.targetVariable);
    expect(out.legend).toBeTruthy();
    expect(out.records[0][out.targetVariable]).toBe(out.records[0].value);
    expect(out.records[0].properties[out.targetVariable]).toBe(out.records[0].value);
  });
});
