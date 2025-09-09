import fs from 'fs';
import path from 'path';
import { getPrimaryScoreField } from '../../processors/HardcodedFieldDefs';

describe('HardcodedFieldDefs: coverage against blob-urls.json', () => {
  const blobPath = path.resolve(process.cwd(), 'public/data/blob-urls.json');
  const json = JSON.parse(fs.readFileSync(blobPath, 'utf8')) as Record<string, string>;
  const keys = Object.keys(json);

  // Endpoints in blob-urls.json that are not analysis endpoints and should be ignored
  const IGNORE = new Set<string>([
    // Any boundaries or utility datasets
    ...keys.filter((k) => k.includes('/')), // e.g., 'boundaries/fsa_boundaries'
  ]);

  it('has a non-default mapping for every analysis endpoint key in blob-urls.json', () => {
    const missing: string[] = [];
    for (const key of keys) {
      if (IGNORE.has(key)) continue;
      const primary = getPrimaryScoreField(key);
      if (!primary || primary === 'value') {
        missing.push(key);
      }
    }

    if (missing.length > 0) {
      // Helpful message to add new mappings when an endpoint is added to blob-urls.json
      throw new Error(
        `Missing primary score mapping for endpoints: ${missing.join(', ')}\n` +
        `Add entries to HardcodedFieldDefs.getPrimaryScoreField for these keys (hyphens->underscores).`
      );
    }
  });
});
