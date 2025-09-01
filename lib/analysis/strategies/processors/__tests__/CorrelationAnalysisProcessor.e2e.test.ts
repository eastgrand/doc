/* eslint-disable @typescript-eslint/no-explicit-any */
import { CorrelationAnalysisProcessor } from '../CorrelationAnalysisProcessor';

describe('E2E: CorrelationAnalysisProcessor', () => {
  it('aligns renderer.field with targetVariable and mirrors dynamic field', () => {
    const raw: any = {
      success: true,
      results: [
        { ID: '1', value_DESCRIPTION: 'ZIP 12345 (City A)', correlation_analysis_score: 40, value_TOTPOP_CY: 10000 },
        { ID: '2', value_DESCRIPTION: 'ZIP 23456 (City B)', correlation_analysis_score: 85, value_TOTPOP_CY: 20000 },
        { ID: '3', value_DESCRIPTION: 'ZIP 34567 (City C)', correlation_analysis_score: 65, value_TOTPOP_CY: 15000 }
      ]
    };

    const proc = new CorrelationAnalysisProcessor();
    const out: any = proc.process(raw);

    expect(out.type).toBe('correlation_analysis');
    expect(typeof out.targetVariable).toBe('string');
    expect(out.renderer?.field).toBe(out.targetVariable);
    expect(out.legend).toBeTruthy();
    expect(out.records[0][out.targetVariable]).toBe(out.records[0].value);
    expect(out.records[0].properties[out.targetVariable]).toBe(out.records[0].value);
  });
});
