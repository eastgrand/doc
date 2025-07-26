#!/usr/bin/env ts-node

import * as fs from 'fs';

console.log('🔧 Fixing Remaining TypeScript Errors...');

// Fix AnalysisState to include missing properties
const typesPath = 'lib/analysis/types.ts';
let typesContent = fs.readFileSync(typesPath, 'utf8');

// Add missing properties to AnalysisState
const stateAdditions = `
  currentVisualization?: any;`;

if (!typesContent.includes('currentVisualization?:')) {
  typesContent = typesContent.replace(
    'lastAnalysisMetadata?: any;',
    `lastAnalysisMetadata?: any;${stateAdditions}`
  );
}

// Add missing properties to ErrorState
const errorStateAdditions = `
  errorMessage?: string;`;

if (!typesContent.includes('errorMessage?:')) {
  typesContent = typesContent.replace(
    'timestamp: string;',
    `timestamp: string;${errorStateAdditions}`
  );
}

// Add missing properties to AnalysisEngineConfig
const configAdditions = `
  apiKey?: string;`;

if (!typesContent.includes('apiKey?:')) {
  typesContent = typesContent.replace(
    'cacheEnabled?: boolean;',
    `cacheEnabled?: boolean;${configAdditions}`
  );
}

// Add missing event type
const eventAdditions = `
  | 'endpoint-changed'`;

if (!typesContent.includes('endpoint-changed')) {
  typesContent = typesContent.replace(
    '| \'analysis-failed\';',
    `| 'analysis-failed'${eventAdditions};`
  );
}

fs.writeFileSync(typesPath, typesContent);
console.log('✅ Fixed remaining type errors');

console.log('🎉 All critical errors should be fixed!');
