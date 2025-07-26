#!/usr/bin/env ts-node

/**
 * Quick fix script for critical TypeScript errors
 */

import * as fs from 'fs';

console.log('🔧 Fixing Critical TypeScript Errors...');

// Fix 1: Update AnalysisEngineConfig to include missing properties
const analysisEngineConfigPath = 'lib/analysis/types.ts';
let analysisEngineConfig = fs.readFileSync(analysisEngineConfigPath, 'utf8');

// Add missing properties to AnalysisEngineConfig
const configInsert = `
  // Additional configuration options
  apiUrl?: string;
  cacheEnabled?: boolean;
`;

if (!analysisEngineConfig.includes('apiUrl?:')) {
  analysisEngineConfig = analysisEngineConfig.replace(
    'export interface AnalysisEngineConfig {',
    `export interface AnalysisEngineConfig {${configInsert}`
  );
  fs.writeFileSync(analysisEngineConfigPath, analysisEngineConfig);
  console.log('✅ Added missing config properties');
}

// Fix 2: Make featureImportance optional in ProcessedAnalysisData
if (analysisEngineConfig.includes('featureImportance: FeatureImportance[];')) {
  analysisEngineConfig = analysisEngineConfig.replace(
    'featureImportance: FeatureImportance[];',
    'featureImportance?: FeatureImportance[];'
  );
  fs.writeFileSync(analysisEngineConfigPath, analysisEngineConfig);
  console.log('✅ Made featureImportance optional');
}

// Fix 3: Update AnalysisEventType to include missing events
const eventTypeInsert = `
  | 'analysis-completed'
  | 'analysis-failed'`;

if (!analysisEngineConfig.includes('analysis-completed')) {
  analysisEngineConfig = analysisEngineConfig.replace(
    '| \'visualization-created\';',
    `| 'visualization-created'${eventTypeInsert};`
  );
  fs.writeFileSync(analysisEngineConfigPath, analysisEngineConfig);
  console.log('✅ Added missing event types');
}

// Fix 4: Add missing properties to AnalysisState
const stateInsert = `
  currentAnalysis?: any;
  history?: any[];
  selectedEndpoint?: string;
  lastAnalysisMetadata?: any;`;

if (!analysisEngineConfig.includes('currentAnalysis?:')) {
  analysisEngineConfig = analysisEngineConfig.replace(
    'errorState: ErrorState | null;',
    `errorState: ErrorState | null;${stateInsert}`
  );
  fs.writeFileSync(analysisEngineConfigPath, analysisEngineConfig);
  console.log('✅ Added missing state properties');
}

// Fix 5: Update VisualizationType to include multi-endpoint types
const visualizationTypeInsert = `
  | 'multi_endpoint_overlay'
  | 'multi_endpoint_comparison'
  | 'multi_endpoint_sequential'
  | 'multi_endpoint_correlation'`;

if (!analysisEngineConfig.includes('multi_endpoint_overlay')) {
  analysisEngineConfig = analysisEngineConfig.replace(
    /export type VisualizationType = ([^;]*);/,
    `export type VisualizationType = $1${visualizationTypeInsert};`
  );
  fs.writeFileSync(analysisEngineConfigPath, analysisEngineConfig);
  console.log('✅ Added multi-endpoint visualization types');
}

// Fix 6: Add totalRecords to CompositeAnalysisResult
if (!analysisEngineConfig.includes('totalRecords?:')) {
  analysisEngineConfig = analysisEngineConfig.replace(
    'records: GeographicDataPoint[];',
    'records: GeographicDataPoint[];\n  totalRecords?: number;'
  );
  fs.writeFileSync(analysisEngineConfigPath, analysisEngineConfig);
  console.log('✅ Added totalRecords to CompositeAnalysisResult');
}

console.log('🎉 Critical TypeScript errors fixed!');
console.log('🔍 Re-run: npx tsc --noEmit --skipLibCheck'); 