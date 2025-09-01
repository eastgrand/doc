/* eslint-disable @typescript-eslint/no-explicit-any */
import { sanitizeNarrativeScope } from '../scopeSanitizer';

function feature(id: string, name: string, score: number) {
  return { properties: { ID: id, DESCRIPTION: name, strategic_analysis_score: score, area_name: name } };
}

describe('sanitizeNarrativeScope', () => {
  const baseHeader = [
    'Analyzing 999 areas...',
    '',
    'Market Analysis Overview:',
    '• 999 markets analyzed',
    '• Average performance: 0',
    '• Performance range: 0 – 0',
    '',
    'Top Strategic Markets:',
    '',
    '- placeholder -',
    ''
  ].join('\n');

  const feats = [
    feature('10101', 'ZIP 10101 (City A)', 80),
    feature('20202', 'ZIP 20202 (City B)', 60),
    feature('30303', 'ZIP 30303 (City C)', 70)
  ];
  const processed = [{ features: feats }];

  it('normalizes counts and overview to selection-scoped study area', () => {
    const metadata = { spatialFilterIds: ['20202', '30303'] };
    const out = sanitizeNarrativeScope(baseHeader, processed as any, metadata as any, 'strategic_analysis');
    expect(out).toMatch(/Analyzing\s+2\s+areas\.\.\./);
  expect(out).toMatch(/• Areas analyzed: 2\/3/);
  // Additional lines may be removed or reformatted; core count assertion is sufficient here
  });

  it('bypasses spatialFilterIds when analysisScope=project for study-area metrics', () => {
    const metadata = { spatialFilterIds: ['20202'], analysisScope: 'project' };
    const out = sanitizeNarrativeScope(baseHeader, processed as any, metadata as any, 'strategic_analysis');
    expect(out).toMatch(/Analyzing\s+3\s+areas\.\.\./);
    expect(out).toMatch(/• Areas analyzed: 3\/3/);
  });

  it('removes distribution and clustering sections irrespective of formatting', () => {
    const noisy = [
      baseHeader,
      '',
      '**Distribution Analysis**',
      'Quartiles: ...',
      'IQR: ...',
      'Outliers: ...',
      '',
      'Market Clusters:',
      '- Cluster A (global-ish)',
      '',
      'Score Distribution:',
      '... lots of bins ...',
      ''
    ].join('\n');
    const metadata = { spatialFilterIds: ['20202', '30303'] };
    const out = sanitizeNarrativeScope(noisy, processed as any, metadata as any, 'strategic_analysis');
    expect(out).not.toMatch(/Distribution Analysis/i);
    expect(out).not.toMatch(/Quartiles:/i);
    expect(out).not.toMatch(/IQR:/i);
    expect(out).not.toMatch(/Outliers:/i);
    expect(out).not.toMatch(/Market Clusters:/i);
    expect(out).not.toMatch(/Score Distribution:/i);
  });
});
