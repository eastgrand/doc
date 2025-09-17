import { StrategicAnalysisProcessor } from '../StrategicAnalysisProcessor';

describe('StrategicAnalysisProcessor area naming', () => {
  const proc = new StrategicAnalysisProcessor();

  test('uses DESCRIPTION city name', () => {
    const raw: any = {
      success: true,
      results: [
        { ID: '11234', DESCRIPTION: '11234 (Brooklyn)', strategic_score: 7.5 },
      ],
    };
    const out = proc.process(raw as any);
  // Area naming may include the ZIP prefix depending on configuration; assert the city is present
  expect(out.records[0].area_name).toMatch(/Brooklyn/);
  });

  test('falls back to ZIP when no description/city', () => {
    const raw: any = {
      success: true,
      results: [
        { ID: '08544', strategic_score: 6.1 },
      ],
    };
    const out = proc.process(raw as any);
    expect(out.records[0].area_name).toMatch(/08544|ZIP 08544/);
  });
});
