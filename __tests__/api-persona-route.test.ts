import { POST } from '../app/api/claude/generate-response/route';
import { getPersona, personaMetadata, defaultPersona } from '../app/api/claude/prompts';

// Mock the Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => {
  let lastCreateArgs: any = null;
  
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn().mockImplementation((args) => {
          lastCreateArgs = args;
          return Promise.resolve({
            content: [{ text: 'Mock response' }],
            role: 'assistant'
          });
        })
      }
    })),
    __getLastCreateArgs: () => lastCreateArgs
  };
});

const { __getLastCreateArgs } = require('@anthropic-ai/sdk');

describe('Generate Response API – Persona integration', () => {
  const buildMockRequest = (personaId: string) => {
    const body = {
      messages: [{ role: 'user', content: 'Test query about shoe sales' }],
      metadata: {
        analysisType: 'default',
        relevantLayers: [],
      },
      featureData: [
        {
          layerId: 'test-layer',
          layerName: 'Test Layer',
          layerType: 'feature',
          features: [
            {
              properties: { value: 1 },
              geometry: null,
            },
          ],
          fields: [],
          geometryType: 'point',
        },
      ],
      persona: personaId,
    };

    return {
      json: async () => body,
    } as any; // Cast to NextRequest-compatible
  };

  const snippet = (str: string) => str.substring(0, 50);

  it.each(personaMetadata.map((p) => p.id))('forwards persona %s prompt into Anthropic call', async (personaId) => {
    const persona = await getPersona(personaId as string);
    await POST(buildMockRequest(personaId as string));
    const args = __getLastCreateArgs();
    expect(args).not.toBeNull();
    expect(args!.system).toContain(snippet(persona.systemPrompt));
  });

  it('falls back to default persona when unknown id supplied', async () => {
    await POST(buildMockRequest('unknown-persona'));
    const args = __getLastCreateArgs();
    const defaultPersonaObj = await getPersona(defaultPersona);
    expect(args!.system).toContain(snippet(defaultPersonaObj.systemPrompt));
  });
}); 