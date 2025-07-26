import fs from 'fs';
import path from 'path';

import { ANALYSIS_CATEGORIES } from '../components/chat/chat-constants';
import { conceptMapping } from '../lib/concept-mapping';
import { analyzeQuery } from '../lib/query-analyzer';
import { buildMicroserviceRequest } from '../lib/build-microservice-request';
import { FIELD_ALIASES } from '../utils/field-aliases';

/**
 * Utility – flatten the category → queries map into a simple array.
 */
function flattenQueries(categories: Record<string, string[]>): string[] {
  return Object.values(categories).flat();
}

/**
 * Utility – load the authoritative list of dataset codes that the micro-service
 * accepts (uppercase codes like "MP30034A_B", "TOTPOP_CY", etc.).  The list is
 * maintained inside shap-microservice/data/NESTO_FIELD_MAPPING.md where it is
 * rendered as a Python dict.
 */
function loadValidDatasetCodes(): Set<string> {
  const mappingPath = path.resolve(__dirname, '../../shap-microservice/data/NESTO_FIELD_MAPPING.md');
  const raw = fs.readFileSync(mappingPath, 'utf-8');
  // The file has lines like: "  \"MP30034A_B\": \"MP30034A_B\","
  const regex = /"([A-Z0-9_]+)"\s*:/g;
  const codes = new Set<string>();
  let match: RegExpExecArray | null;
  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(raw)) !== null) {
    codes.add(match[1]);
  }
  return codes;
}

const VALID_CODES = loadValidDatasetCodes();

/**
 * Helper – normalise a field using FIELD_ALIASES and dataset-code detection
 * logic from buildMicroserviceRequest so the check mirrors production.
 */
function normaliseField(field: string): string {
  const looksLikeDatasetCode = (s: string): boolean => /^[A-Z0-9]{4,}(?:[_-][A-Z0-9]+)+$/.test(s);
  const toSnake = (str: string) =>
    str
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
      .toUpperCase();

  const aliasKey = field.toLowerCase();
  if (FIELD_ALIASES[aliasKey]) return FIELD_ALIASES[aliasKey];
  if (looksLikeDatasetCode(field.toUpperCase())) return field.toUpperCase();
  return toSnake(field);
}

describe('Microservice payload field validation', () => {
  const queries = flattenQueries(ANALYSIS_CATEGORIES);

  // Sanity check – make sure we loaded a reasonable number of valid codes
  it('loaded valid dataset codes (>80 entries)', () => {
    expect(VALID_CODES.size).toBeGreaterThan(80);
  });

  queries.forEach((query) => {
    it(`produces valid field codes for query: "${query}"`, async () => {
      const conceptMap = await conceptMapping(query);
      const analysisResult = await analyzeQuery(query, conceptMap);
      const targetVar = analysisResult.targetVariable || analysisResult.relevantFields?.[0] || '';
      const payload = buildMicroserviceRequest(analysisResult as any, query, targetVar);

      // Combine target + matched fields to validate
      const fieldsToCheck = [payload.target_variable, ...(payload.matched_fields || [])];
      fieldsToCheck.forEach((fld) => {
        const normalised = normaliseField(fld);
        // 1️⃣  Verify that the raw code in the payload is already normalised — i.e.
        //     buildMicroserviceRequest should have produced a value that needs *no*
        //     further transformation.  This will catch mistakes like
        //     "mp30034_a_b_p" sneaking through.
        expect(fld).toBe(normalised);

        // 2️⃣  Ensure the normalised code is recognised by the micro-service.
        if (!VALID_CODES.has(normalised)) {
          throw new Error(
            `Unknown dataset code produced by payload builder: ${fld}`
          );
        }
      });
    });
  });
}); 