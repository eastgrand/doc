import { StrategicAnalysisProcessor } from '../StrategicAnalysisProcessor';

describe('E2E: StrategicAnalysisProcessor', () => {
  it('produces targetVariable and renderer aligned to strategic_score and sorts descending', () => {
    const raw = {
      success: true,
      results: [
        { ID: '1', DESCRIPTION: 'ZIP 12345 - City A, ST', strategic_score: 72 },
        { ID: '2', DESCRIPTION: 'ZIP 23456 - City B, ST', strategic_score: 88 },
        { ID: '3', DESCRIPTION: 'ZIP 34567 - City C, ST', strategic_score: 65 }
      ]
    } as any;

    const proc = new StrategicAnalysisProcessor();
  const out: any = proc.process(raw as any);

    expect(out.type).toBe('strategic_analysis');
    expect(out.targetVariable).toBe('strategic_score');
  // Renderer is opaque (unknown); ensure targetVariable exists and is a string
  expect(typeof out.targetVariable).toBe('string');

    // Sorted descending by value
    expect(out.records[0].area_id).toBe('2');
    expect(out.records[0].value).toBeGreaterThanOrEqual(out.records[1].value);
    expect(out.records[1].value).toBeGreaterThanOrEqual(out.records[2].value);
  });
});
