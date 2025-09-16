import { getPersona, defaultPersona, personaMetadata } from '../app/api/claude/prompts';

describe('AI Persona System - Integration Tests', () => {
  const requiredFields = ['name', 'description', 'systemPrompt', 'taskInstructions', 'responseFormat', 'focusAreas'];

  it.each(personaMetadata.map(p => p.id))('should load persona "%s" with all required fields', async (personaId) => {
    const persona = await getPersona(personaId as string);
    expect(persona).toBeDefined();
    requiredFields.forEach(field => {
      expect(persona).toHaveProperty(field);
    });
    // Ensure taskInstructions has default key
    expect(persona.taskInstructions).toHaveProperty('default');
  });

  it('should fallback to default persona when invalid id provided', async () => {
    const invalidId = 'non-existent-persona';
    const persona = await getPersona(invalidId);
    const defaultLoaded = await getPersona(defaultPersona);
    expect(persona.name).toBe(defaultLoaded.name);
  });
}); 