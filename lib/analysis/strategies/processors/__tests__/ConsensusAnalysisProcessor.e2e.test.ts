/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConsensusAnalysisProcessor } from '../ConsensusAnalysisProcessor';

describe('E2E: ConsensusAnalysisProcessor', () => {
  it('aligns renderer.field with targetVariable and mirrors dynamic field', () => {
    const raw: any = {
      success: true,
      results: [
        { ID: '1', DESCRIPTION: 'Area 1', consensus_analysis_score: 55 },
        { ID: '2', DESCRIPTION: 'Area 2', consensus_analysis_score: 78 },
        { ID: '3', DESCRIPTION: 'Area 3', consensus_analysis_score: 62 }
      ]
    };

    const proc = new ConsensusAnalysisProcessor();
    const out: any = proc.process(raw);

    expect(out.type).toBe('consensus_analysis');
    expect(typeof out.targetVariable).toBe('string');
    expect(out.renderer?.field).toBe(out.targetVariable);
    expect(out.legend).toBeTruthy();
    expect(out.records[0][out.targetVariable]).toBe(out.records[0].value);
    expect(out.records[0].properties[out.targetVariable]).toBe(out.records[0].value);
  });
});
