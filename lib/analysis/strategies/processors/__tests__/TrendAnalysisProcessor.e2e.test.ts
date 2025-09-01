/* eslint-disable @typescript-eslint/no-explicit-any */
import { TrendAnalysisProcessor } from '../TrendAnalysisProcessor';

describe('E2E: TrendAnalysisProcessor', () => {
  it('aligns renderer.field with targetVariable and mirrors dynamic field', () => {
    const raw: any = {
      success: true,
      results: [
        { ID: '1', value_DESCRIPTION: 'ZIP 12345 (City A)', trend_score: 35, demographic_opportunity_score: 70 },
        { ID: '2', value_DESCRIPTION: 'ZIP 23456 (City B)', trend_score: 68, demographic_opportunity_score: 80 },
        { ID: '3', value_DESCRIPTION: 'ZIP 34567 (City C)', trend_score: 52, demographic_opportunity_score: 75 }
      ]
    };

    const proc = new TrendAnalysisProcessor();
    const out: any = proc.process(raw);

    expect(out.type).toBe('trend_analysis');
    expect(typeof out.targetVariable).toBe('string');
    expect(out.renderer?.field).toBe(out.targetVariable);
    expect(out.legend).toBeTruthy();
    expect(out.records[0][out.targetVariable]).toBe(out.records[0].value);
    expect(out.records[0].properties[out.targetVariable]).toBe(out.records[0].value);
  });
});
