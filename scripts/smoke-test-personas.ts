#!/usr/bin/env ts-node
import fetch from 'node-fetch';
import { personaMetadata } from '../app/api/claude/prompts';

const API_URL = process.env.PERSONA_SMOKE_URL || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api/claude/generate-response';

async function smokeTest() {
  const personas = personaMetadata.map((p) => p.id);

  console.log(`Running smoke tests against ${API_URL}\n`);

  for (const id of personas) {
    const body = {
      messages: [{ role: 'user', content: 'Which areas have strong Nike sales?' }],
      metadata: { analysisType: 'default', relevantLayers: [] },
      featureData: [],
      persona: id,
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      console.log(`${id.padEnd(18)} → ${res.status} (${text.slice(0, 40)}…)`);
    } catch (err) {
      console.error(`${id.padEnd(18)} → ERROR`, err);
    }
  }
}

smokeTest(); 