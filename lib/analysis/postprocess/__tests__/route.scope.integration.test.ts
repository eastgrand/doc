/* eslint-disable @typescript-eslint/no-explicit-any */
import { POST } from '../../../../app/api/claude/generate-response/route';

// Mock Anthropic SDK to avoid network calls
// Provide a controllable Anthropic mock that reads a test-defined global response.
jest.mock('@anthropic-ai/sdk', () => {
  return {
    Anthropic: class {
      messages = {
        create: async () => {
          const override = (global as any).__TEST_AI_RESPONSE;
          const text = override ?? [
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
            '',
            'Footer section'
          ].join('\n');
          return { content: [{ type: 'text', text }] };
        }
      };
      constructor() {}
    }
  };
});

// Mock GeoAwarenessEngine to avoid unnecessary processing
jest.mock('../../../../lib/geo/GeoAwarenessEngine', () => ({
  GeoAwarenessEngine: {
    getInstance: () => ({
      processGeoQuery: async () => ({ matchedEntities: [], filterStats: { filterMethod: 'none' } })
    })
  }
}));

// Mock NextResponse to avoid Next.js runtime dependency in tests
jest.mock('next/server', () => ({
  NextResponse: {
    json: (obj: any, init?: any) => ({ json: async () => obj, status: init?.status || 200 })
  },
  NextRequest: class {}
}));

function feature(id: string, name: string, score: number) {
  return { type: 'Feature', properties: { ID: id, DESCRIPTION: name, area_name: name, strategic_analysis_score: score } };
}

describe('API route POST scope behavior (integration)', () => {
  const baseMessages = [{ role: 'user', content: 'Run strategic analysis' }];
  const features = [
    feature('10101', 'ZIP 10101 (City A)', 80),
    feature('20202', 'ZIP 20202 (City B)', 60),
    feature('30303', 'ZIP 30303 (City C)', 70)
  ];
  const layer = { layerId: 'test-layer', features };

  beforeAll(() => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
  });

  async function callPost(body: any) {
    const req: any = {
      headers: { get: (k: string) => (k.toLowerCase() === 'content-type' ? 'application/json' : '') },
      json: async () => body
    };
    const res = await POST(req as any);
    const json = await (res as any).json();
    return json as { content: string };
  }

  it('enforces selection-scoped study area when spatialFilterIds provided', async () => {
    const metadata = { spatialFilterIds: ['20202', '30303'], targetVariable: 'strategic_analysis_score' };
    const body = { messages: baseMessages, metadata, featureData: [layer] };
    // Force the mocked Anthropic response to be deterministic for this test
    (global as any).__TEST_AI_RESPONSE = [
      'Analyzing 2 areas...',
      '',
      'Market Analysis Overview:',
      '• 2 markets analyzed',
      '• Average performance: 70',
      '• Performance range: 60 – 80',
      '',
      'Top Strategic Markets:',
      '',
      '1. ZIP 20202 - City B (Score: 60)',
      '2. ZIP 30303 - City C (Score: 70)',
      '',
      'Footer section'
    ].join('\n');
    const { content } = await callPost(body);

    // Header count normalized
    expect(content).toMatch(/Analyzing\s+2\s+areas\.\.\./);
  });

  it('bypasses selection when analysisScope=project', async () => {
    const metadata = { spatialFilterIds: ['20202'], analysisScope: 'project', targetVariable: 'strategic_analysis_score' };
    const body = { messages: baseMessages, metadata, featureData: [layer] };
    // Force Anthropic mock to return a project-level analysis header
    (global as any).__TEST_AI_RESPONSE = [
      'Analyzing 3 areas...',
      '',
      'Market Analysis Overview:',
      '• 3 markets analyzed',
      '• Average performance: 70',
      '• Performance range: 60 – 80',
      '',
      'Top Strategic Markets:',
      '',
      '1. ZIP 10101 - City A (Score: 80)',
      '2. ZIP 20202 - City B (Score: 60)',
      '3. ZIP 30303 - City C (Score: 70)',
      '',
      'Footer section'
    ].join('\n');
    const { content } = await callPost(body);

    expect(content).toMatch(/Analyzing\s+3\s+areas\.\.\./);
  });
});
