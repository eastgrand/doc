/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnalyzeProcessor } from '../AnalyzeProcessor';

describe('E2E: AnalyzeProcessor', () => {
  it('produces targetVariable and renderer aligned and mirrors dynamic field on records', () => {
    const raw: any = {
      success: true,
      results: [
        { ID: '1', DESCRIPTION: 'Area One', analysis_score: 72 },
        { ID: '2', DESCRIPTION: 'Area Two', analysis_score: 88 },
        { ID: '3', DESCRIPTION: 'Area Three', analysis_score: 65 }
      ]
    };

    const proc = new AnalyzeProcessor();
    const out: any = proc.process(raw);

    expect(out.type).toBe('analyze');
    expect(typeof out.targetVariable).toBe('string');
    expect(out.renderer?.field).toBe(out.targetVariable);
    expect(out.legend).toBeTruthy();
    // mirrored field exists and equals value
    expect(out.records[0][out.targetVariable]).toBe(out.records[0].value);
    expect(out.records[0].properties[out.targetVariable]).toBe(out.records[0].value);
    // sorted desc
    expect(out.records[0].value).toBeGreaterThanOrEqual(out.records[1].value);
  });

  it('throws when no numeric scoring field can be detected', () => {
    const raw: any = {
      success: true,
      results: [
        { ID: 'A', DESCRIPTION: 'Alpha' },
        { ID: 'B', DESCRIPTION: 'Beta' }
      ]
    };

    const proc = new AnalyzeProcessor();
    expect(() => proc.process(raw)).toThrow();
  });
});
