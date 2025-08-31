#!/usr/bin/env node

console.log('🚨 CHECKING ALL PROCESSOR vs FIELD MAPPING MISMATCHES\n');

// Processor targetVariable fields (what processors actually provide)
const processorFields = {
  'strategic_analysis': 'strategic_score',           // ✅ FIXED
  'competitive_analysis': 'competitive_analysis_score', // Check vs mapping
  'demographic_analysis': 'demographic_insights_score', // Check vs mapping  
  'trend_analysis': 'trend_analysis_score',          // Check vs mapping
  'correlation_analysis': 'correlation_analysis_score', // Check vs mapping
  'anomaly_detection': 'anomaly_detection_score',    // Check vs mapping
  'market_sizing': 'market_sizing_score',            // Check vs mapping
  'real_estate_analysis': 'real_estate_analysis_score', // Check vs mapping
  'brand_difference': 'brand_difference_score',      // Check vs mapping
  'spatial_clustering': 'spatial_clusters_score',    // Check vs mapping
  'segment_profiling': 'segment_profiling_score',    // Check vs mapping
  'risk_analysis': 'risk_adjusted_score',            // Check vs mapping
  'core_analysis': 'strategic_value_score',          // Check vs mapping
};

// FieldMappingConfig fields (what extractScoreValue expects)
const mappingFields = {
  'strategic_analysis': 'strategic_score',           // ✅ FIXED  
  'competitive_analysis': 'competitive_advantage_score', // ❌ MISMATCH!
  'demographic_analysis': 'demographic_score',       // ❌ MISMATCH!
  'trend_analysis': 'trend_score',                   // ❌ MISMATCH!
  'correlation_analysis': 'correlation_score',       // ❌ MISMATCH!
  'anomaly_detection': 'anomaly_score',              // ❌ MISMATCH!
  'market_sizing': 'market_size_score',              // ❌ MISMATCH!
  'real_estate_analysis': 'real_estate_score',       // ❌ MISMATCH!
  'brand_analysis': 'brand_score',                   // No processor found?
  'spatial_clustering': 'cluster_performance_score', // ❌ MISMATCH!
  'segment_profiling': 'segment_score',              // ❌ MISMATCH!
  'risk_analysis': 'risk_score',                     // ❌ MISMATCH!
};

console.log('=== FIELD MAPPING ANALYSIS ===');
Object.keys(processorFields).forEach(analysisType => {
  const processorField = processorFields[analysisType];
  const mappingField = mappingFields[analysisType];
  const isMatch = processorField === mappingField;
  
  console.log(`${isMatch ? '✅' : '❌'} ${analysisType}:`);
  console.log(`   Processor provides: ${processorField}`);
  console.log(`   Mapping expects:    ${mappingField || 'NOT DEFINED'}`);
  if (!isMatch) {
    console.log(`   🚨 MISMATCH - extractScoreValue() will fail!`);
  }
  console.log('');
});

console.log('=== IMPACT ANALYSIS ===');
console.log('❌ Almost ALL processors have field mapping mismatches!');
console.log('❌ This means geographic join corrupts data for most analysis types');
console.log('❌ Only strategic_analysis is fixed, all others will have wrong Claude data');
console.log('');
console.log('🔧 REQUIRED FIXES:');
console.log('1. Update FieldMappingConfig.ts to match ALL processor targetVariable fields');
console.log('2. OR update processors to use FieldMappingConfig field names');
console.log('3. Add validation to prevent future mismatches');