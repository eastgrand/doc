#!/usr/bin/env node

console.log('🚨 CHECKING ALL PROCESSOR vs FIELD MAPPING MISMATCHES\n');

// Processor targetVariable fields (what processors actually provide)
// Note: values reflect current processors' "targetVariable" and top-level score fields
const processorFields = {
  strategic_analysis: 'strategic_analysis_score',
  competitive_analysis: 'competitive_analysis_score',
  demographic_analysis: 'demographic_insights_score',
  trend_analysis: 'trend_analysis_score',
  correlation_analysis: 'correlation_analysis_score',
  anomaly_detection: 'anomaly_detection_score',
  market_sizing: 'market_sizing_score',
  real_estate_analysis: 'real_estate_analysis_score',
  brand_difference: 'brand_difference_score',
  spatial_clusters: 'spatial_clusters_score',
  segment_profiling: 'segment_profiling_score',
  risk_analysis: 'risk_adjusted_score',
  analyze: 'analysis_score',
};

// FieldMappingConfig fields (what extractScoreValue expects)
// Mirrors lib/analysis/utils/FieldMappingConfig.ts ENDPOINT_FIELD_MAPPINGS
const mappingFields = {
  strategic_analysis: 'strategic_analysis_score',
  competitive_analysis: 'competitive_analysis_score',
  demographic_analysis: 'demographic_insights_score',
  trend_analysis: 'trend_analysis_score',
  correlation_analysis: 'correlation_analysis_score',
  anomaly_detection: 'anomaly_detection_score',
  market_sizing: 'market_sizing_score',
  real_estate_analysis: 'real_estate_analysis_score',
  brand_difference: 'brand_difference_score',
  spatial_clusters: 'spatial_clusters_score',
  segment_profiling: 'segment_profiling_score',
  risk_analysis: 'risk_adjusted_score',
  analyze: 'analysis_score',
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

const mismatches = Object.keys(processorFields).filter(k => processorFields[k] !== mappingFields[k]);
console.log('=== IMPACT ANALYSIS ===');
if (mismatches.length === 0) {
  console.log('✅ All processor targetVariables align with FieldMappingConfig.');
  console.log('✅ extractScoreValue() will correctly resolve primary fields.');
} else {
  console.log(`❌ ${mismatches.length} processors have field mapping mismatches!`);
  mismatches.forEach(k => console.log(`   - ${k}: processor=${processorFields[k]} mapping=${mappingFields[k] || 'NOT DEFINED'}`));
  console.log('');
  console.log('🔧 REQUIRED FIXES:');
  console.log('1. Update FieldMappingConfig.ts to match ALL processor targetVariable fields');
  console.log('2. OR update processors to use FieldMappingConfig field names');
  console.log('3. Add validation to prevent future mismatches');
}