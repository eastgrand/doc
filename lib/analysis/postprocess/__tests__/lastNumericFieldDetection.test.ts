/* eslint-disable @typescript-eslint/no-explicit-any */
import { injectTopStrategicMarkets } from '../topStrategicMarkets';

describe('last numeric field detection (energy dataset convention)', () => {
  it('uses the last numeric field for ranking and stats when present', () => {
    const finalContent = 'Top Strategic Markets:\n\nplaceholder\n\nNext Section:\n';

    // Feature A: last numeric key is `x` with high value 100
    const featureA = {
      properties: {
        ID: '1',
        area_name: 'Area A',
        DESCRIPTION: 'ZIP 11111 - Area A, ST',
        strategic_analysis_score: 10, // canonical, lower than x
        x: 100, // last numeric field should be selected
      }
    } as any;

    // Feature B: ensure it also has `x` so summary stats include both
    const featureB = {
      properties: {
        ID: '2',
        area_name: 'Area B',
        DESCRIPTION: 'ZIP 22222 - Area B, ST',
        strategic_analysis_score: 99,
        y: 50,
        x: 20 // lower than A.x so A ranks above B
      }
    } as any;

    const processedLayersData = [
      { layerId: 'test', features: [featureA, featureB] }
    ] as any[];

    const out = injectTopStrategicMarkets(finalContent, processedLayersData, {}, 'strategic_analysis');

  // Expect first item to show Strategic Score: 100.00 (Area A should resolve via DESCRIPTION)
  expect(out).toMatch(/^1\. .*\(Strategic Score: 100\.00\)/m);

    // Study Area Summary should reflect average based on x values -> (100 + 20) / 2 = 60
    const avgMatch = out.match(/Avg score:\s*(\d+\.\d{2})/);
    expect(avgMatch).toBeTruthy();
    if (avgMatch) {
      expect(Number(avgMatch[1])).toBeCloseTo(60.0, 2);
    }
  });
});
