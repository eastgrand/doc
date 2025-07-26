# Extending AI Personas

This guide describes how to add a new AI persona or update existing ones in the geospatial-analytics project.

---

## Folder Layout
```
app/api/claude/
  prompts/
    strategist.ts
    tactician.ts
    creative.ts
    product-specialist.ts
    customer-advocate.ts
    📂 shared/
      base-prompt.ts
    …
```
Each persona is a single TS module that exports a configuration object.

## 1 – Create the prompt file
1. Copy an existing persona file into `app/api/claude/prompts/your-persona.ts`.
2. Edit the fields:
   • `name`, `description`
   • `systemPrompt` – prepend/append content onto `baseSystemPrompt`.
   • `taskInstructions` – per-analysis-type instructions (`default` key required).
   • `responseFormat` and `focusAreas` – optional but recommended for consistency.

```ts
import { baseSystemPrompt, contentFocus, formattingRequirements, responseStyle } from '../shared/base-prompt';

export const dataScientistPersona = {
  name: 'Data Scientist',
  description: 'Deep statistical insight with focus on uncertainty & significance',
  systemPrompt: `${baseSystemPrompt}

DATA-SCIENTIST PERSPECTIVE: …

${contentFocus}
${formattingRequirements}
${responseStyle}`,
  taskInstructions: {
    default: 'Provide rigorous statistical analysis with confidence intervals and hypothesis testing.'
  },
  responseFormat: {
    structure: ['Overview', 'Methodology', 'Findings', 'Uncertainty & Limitations'],
    emphasis: 'Statistical rigor'
  },
  focusAreas: ['Confidence intervals', 'p-values', 'Sample size']
};
export default dataScientistPersona;
```

## 2 – Register the persona
Update `app/api/claude/prompts/index.ts`:
```ts
export { default as dataScientistPersona } from './data-scientist';

personaRegistry['data-scientist'] = () => import('./data-scientist').then(m => m.default);

personaMetadata.push({
  id: 'data-scientist',
  name: 'Data Scientist',
  description: 'Statistical deep-dive',
  icon: '📊',
  color: 'teal'
});
```
The tests iterate over `personaMetadata`, so no further changes are needed.

## 3 – Update UI (optional)
Add the new persona into the selection dialog component. Use the `icon` and `color` you added to `personaMetadata`.

## 4 – Run tests
```bash
npm test -- -t "AI Persona System"
```
Both loader and API-route tests should now include your persona.

## 5 – Deploy
No extra environment variables are required. Deploy as usual; run `scripts/smoke-test-personas.ts` for a quick live check. 