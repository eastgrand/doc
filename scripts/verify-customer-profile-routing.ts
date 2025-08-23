/*
  verify-customer-profile-routing.ts
  - Verifies that a persona-style query routes to '/customer-profile'
  - Confirms the configured score field is 'customer_profile_score'
  - Checks that the dataset contains this field on records

  Safe to run in Node (does not import browser-only libraries)
*/

import * as fs from 'fs';
import * as path from 'path';
import { EnhancedQueryAnalyzer } from '../lib/analysis/EnhancedQueryAnalyzer';
import { ConfigurationManager } from '../lib/analysis/ConfigurationManager';

interface CustomerProfileRecord {
  customer_profile_score?: number;
  purchase_propensity?: number;
  persona_type?: string;
  [key: string]: unknown;
}

function log(section: string, msg: string, data?: unknown) {
  const prefix = `[# ${section}]`;
  if (data !== undefined) {
    console.log(`${prefix} ${msg}`, data);
  } else {
    console.log(`${prefix} ${msg}`);
  }
}

async function main() {
  const query = 'Create a customer profile of ideal customer personas for tax preparation services focusing on lifestyle and demographics';
  log('START', 'Verifying customer-profile routing and score field mapping');
  log('QUERY', query);

  // 1) Route the query using EnhancedQueryAnalyzer (keyword-based)
  const analyzer = new EnhancedQueryAnalyzer();
  const scores = analyzer.analyzeQuery(query);
  const best = analyzer.getBestEndpoint(query);
  log('ROUTING', `Top endpoint: ${best}`);
  log('ROUTING', 'Top 3:', scores.slice(0, 3).map(s => ({ endpoint: s.endpoint, score: s.score, reasons: s.reasons.slice(0,2) })));

  // 2) Check configuration score mapping for '/customer-profile'
  const config = ConfigurationManager.getInstance();
  const scoreCfg = config.getScoreConfig('/customer-profile');
  if (!scoreCfg) {
    console.error('[ERROR] No score config for /customer-profile');
    process.exit(1);
  }
  log('CONFIG', 'Score mapping', scoreCfg);

  // 3) Validate dataset has the score field
  const datasetPath = path.join(process.cwd(), 'public', 'data', 'endpoints', 'customer-profile.json');
  if (!fs.existsSync(datasetPath)) {
    console.error('[ERROR] Dataset not found at', datasetPath);
    process.exit(1);
  }
  const raw = fs.readFileSync(datasetPath, 'utf8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error('[ERROR] Failed to parse dataset JSON:', (e as Error).message);
    process.exit(1);
  }

  let records: CustomerProfileRecord[] = [];
  if (Array.isArray(parsed)) {
    records = parsed as CustomerProfileRecord[];
  } else if (typeof parsed === 'object' && parsed !== null) {
    const obj = parsed as Record<string, unknown>;
    const results = obj['results'];
    if (Array.isArray(results)) {
      records = results as CustomerProfileRecord[];
    }
  }

  const sample: CustomerProfileRecord = records[0] ?? {};
  const hasScoreField = Object.prototype.hasOwnProperty.call(sample, scoreCfg.scoreFieldName);
  const sampleRec = sample as Record<string, unknown>;
  const sampleValue = sampleRec[scoreCfg.scoreFieldName];
  log('DATA', `Records: ${records.length}, Sample has score field: ${hasScoreField}, Sample value: ${sampleValue}`);

  // 4) Assertions and summary
  const assertions = [
    { name: 'Routes to /customer-profile', ok: best === '/customer-profile' },
    { name: 'Score field is customer_profile_score', ok: scoreCfg.scoreFieldName === 'customer_profile_score' },
    { name: 'Dataset has score field on records', ok: hasScoreField }
  ];

  const failed = assertions.filter(a => !a.ok);
  if (failed.length > 0) {
    console.log('\n❌ Verification failed:');
    failed.forEach(f => console.log(` - ${f.name}`));
    process.exit(2);
  }

  console.log('\n✅ Verification passed:');
  assertions.forEach(a => console.log(` - ${a.name}`));
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
