/* eslint-disable @typescript-eslint/no-explicit-any */
import { injectTopStrategicMarkets } from '../topStrategicMarkets';

function feature(id: string, name: string, score: number) {
  return { properties: { ID: id, DESCRIPTION: name, strategic_analysis_score: score, area_name: name } };
}

describe('injectTopStrategicMarkets', () => {
  const header = 'Intro text\n\nTop Strategic Markets:\n';
  const tail = '\n\nFooter';

  it('injects ranked list capped at 10 and includes Study Area Summary', () => {
    const features = Array.from({ length: 15 }, (_, i) => feature(String(i + 1), `ZIP ${10000 + i} (City ${i})`, 50 + i));
    const processed = [{ features }];
    const metadata = { spatialFilterIds: undefined };
    const content = header + '- placeholder list -' + tail;

    const out = injectTopStrategicMarkets(content, processed as any, metadata as any, 'strategic_analysis');

    // Should include Study Area Summary
    expect(out).toMatch(/Study Area Summary:/);
    // Should include exactly 10 numbered items
    const lines = out.split('\n').filter(l => /^\d+\.\s/.test(l));
    expect(lines.length).toBe(10);
    // Top item should be the highest score (last generated)
    expect(lines[0]).toMatch(/Strategic Score: 64.00/);
  });

  it('respects spatialFilterIds by limiting candidates', () => {
    const feats = [
      feature('10101', 'ZIP 10101 (City A)', 80),
      feature('20202', 'ZIP 20202 (City B)', 60),
      feature('30303', 'ZIP 30303 (City C)', 70)
    ];
    const processed = [{ features: feats }];
    const metadata = { spatialFilterIds: ['20202', '30303'] };
    const content = header + '- placeholder list -' + tail;

  const out = injectTopStrategicMarkets(content, processed as any, metadata as any, 'strategic_analysis');

    const lines = out.split('\n').filter(l => /^\d+\.\s/.test(l));
    // Only 2 items should be included (IDs 20202 and 30303)
    expect(lines.length).toBe(2);
  expect(out).toContain('30303 (City C)');
  expect(out).toContain('20202 (City B)');
  expect(out).not.toContain('10101 (City A)');
  // Study area summary shows N/Total
  expect(out).toMatch(/Study Area Summary:[\s\S]*Areas analyzed: 2\/3/);
  });

  it('bypasses spatialFilterIds when analysisScope=project to rank across full dataset', () => {
    const feats = [
      feature('10101', 'ZIP 10101 (City A)', 80),
      feature('20202', 'ZIP 20202 (City B)', 60),
      feature('30303', 'ZIP 30303 (City C)', 70)
    ];
    const processed = [{ features: feats }];
    const metadata = { spatialFilterIds: ['20202'], analysisScope: 'project' };
    const content = header + '- placeholder list -' + tail;

  const out = injectTopStrategicMarkets(content, processed as any, metadata as any, 'strategic_analysis');
    const lines = out.split('\n').filter(l => /^\d+\.\s/.test(l));
    // Should include all three ranked by score, not just the filtered id
    expect(lines.length).toBe(3);
    expect(out).toContain('10101 (City A)');
    expect(out).toContain('20202 (City B)');
    expect(out).toContain('30303 (City C)');
  // When N === Total, summary shows just N (no /Total)
  expect(out).toMatch(/Study Area Summary:[\s\S]*Areas analyzed: 3(\b|$)/);
  });

  it('no-op when header missing', () => {
    const processed = [{ features: [feature('1', 'ZIP 00001 (Test)', 80)] }];
    const out = injectTopStrategicMarkets('No header here', processed as any, undefined as any, 'strategic_analysis');
    expect(out).toBe('No header here');
  });
});
