/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';
import { HousingMarketCorrelationProcessor } from '../HousingMarketCorrelationProcessor';

describe('HousingMarketCorrelationProcessor integration with real sample data', () => {
  it('processes Quebec sample areas without throwing and returns valid structure', () => {
  // __dirname is lib/analysis/strategies/processors/__tests__ -> go up 5 levels to repo root
  const samplePath = path.join(__dirname, '../../../../../public/data/quebec_housing_sample_areas.json');
    const raw = fs.readFileSync(samplePath, 'utf8');
    const areas = JSON.parse(raw) as any[];

    // Convert sample area structure into RawAnalysisResult expected by the processor
    const results = areas.map(a => {
      const metrics = a.metrics || {};

      // Derive a simple affordability index: lower median price -> higher affordability (0-100)
      const median = Number(metrics.median_housing_value || 300000);
      const home_affordability_index = Math.max(0, Math.min(100, Math.round((300000 - median) / 3000 + 50)));

      // Derive a growth index from population_25_34 (simple normalized heuristic)
      const pop25 = Number(metrics.population_25_34 || 0);
      const hot_growth_market_index = Math.max(0, Math.min(100, Math.round((pop25 / 5000) * 100)));

      // Use homeownership_rate as proxy for new owner activity (0-100)
      const new_home_owner_index = Math.max(0, Math.min(100, Math.round(Number(metrics.homeownership_rate || 50))));

      return {
        ID: a.id || a.zipCode || a.id,
        area_name: a.name || a.city || a.zipCode,
        hot_growth_market_index,
        new_home_owner_index,
        home_affordability_index: home_affordability_index,
        median_home_price: median,
        population_growth_rate: 0
      };
    });

    const processor = new HousingMarketCorrelationProcessor();

    expect(() => processor.process({ success: true, results, summary: 'integration sample' } as any)).not.toThrow();

    const result = processor.process({ success: true, results, summary: 'integration sample' } as any);
    expect(result).toBeDefined();
    expect(result.type).toBe('housing_market_correlation');
    expect(Array.isArray(result.records)).toBe(true);
    expect(result.records.length).toBe(results.length);
    expect(result.correlationMatrix).toBeDefined();
  expect(result.renderer).toBeDefined();
  // renderer is unknown in typings; cast to any for the assertion
  expect((result.renderer as any).field).toBe(result.targetVariable);

    // sanity: all record values in range
    result.records.forEach((r: any) => {
      expect(typeof r.value).toBe('number');
      expect(r.value).toBeGreaterThanOrEqual(0);
      expect(r.value).toBeLessThanOrEqual(100);
    });
  });
});
