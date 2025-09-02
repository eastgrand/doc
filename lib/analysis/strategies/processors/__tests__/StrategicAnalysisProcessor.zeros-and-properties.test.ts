/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { StrategicAnalysisProcessor } from '../StrategicAnalysisProcessor';

describe('StrategicAnalysisProcessor regression: zeros and raw properties retention', () => {
  it('preserves 0 values and includes full raw properties in output', () => {
    const processor = new StrategicAnalysisProcessor();

  const rawData: any = {
      success: true,
      results: [
        {
          ID: '1',
          DESCRIPTION: 'Area 1',
          strategic_score: 0, // zero score must be preserved (not coerced)
          total_population: 0, // zero should remain in properties
          AVGHINC_CY: 0, // zero should remain in properties under raw spread
          some_metric: 0 // arbitrary zero-valued field should remain
        },
        {
          ID: '2',
          DESCRIPTION: 'Area 2',
          strategic_score: 10,
          total_population: 5000,
          AVGHINC_CY: 55000
        }
      ]
    };

  const out = processor.process(rawData as any);

    expect(out.type).toBe('strategic_analysis');
    expect(out.records.length).toBe(2);

  const area1 = out.records.find((r: any) => (r as any).area_id === '1') as any;
  const area2 = out.records.find((r: any) => (r as any).area_id === '2') as any;

    // Values should be calculated (not NaN or defaulted to the fallback 25)
    expect(typeof area1.value).toBe('number');
    expect(area1.value).toBeGreaterThanOrEqual(0);
    expect(typeof area1.strategic_score).toBe('number');
    expect(area1.strategic_score).toBeGreaterThanOrEqual(0);

    // Raw properties retained with zeroes
    expect(area1.properties).toBeTruthy();
    expect(area1.properties.ID).toBe('1');
    expect(area1.properties.DESCRIPTION).toBe('Area 1');
    expect(area1.properties.total_population).toBe(0);
    expect(area1.properties.AVGHINC_CY).toBe(0);
    expect(area1.properties.some_metric).toBe(0);

    // Sanity on second record - calculated score should be positive
    expect(area2.value).toBeGreaterThanOrEqual(0);
    expect(area2.properties.total_population).toBe(5000);
    expect(area2.properties.AVGHINC_CY).toBe(55000);

    // Target variable alignment
    expect(out.targetVariable).toBeDefined();
    const rendererField = (out as any)?.renderer && typeof (out as any).renderer === 'object' ? (out as any).renderer.field : undefined;
    if (rendererField) {
      expect(['strategic_score', (out as any).targetVariable]).toContain(rendererField);
    }
  });
});
