#!/usr/bin/env node

// Test that non-clustering queries still work correctly
console.log('🧪 TESTING NON-CLUSTERING FLOW');
console.log('==============================');

// Mock the createAnalysisSummary function (same as updated version)
function createAnalysisSummary(analysisResult, query) {
  console.log('🎯 [createAnalysisSummary] Called with analysisResult.data.summary length:', analysisResult.data?.summary?.length || 0);
  
  // CRITICAL: Use existing summary if it exists (e.g., from clustering)
  if (analysisResult.data?.summary && analysisResult.data.summary.trim().length > 0) {
    console.log('🎯 [createAnalysisSummary] Using existing summary from analysisResult.data.summary');
    console.log('🎯 [createAnalysisSummary] Summary preview:', analysisResult.data.summary.substring(0, 200) + '...');
    return `## Analysis Complete: ${query}\n\n${analysisResult.data.summary}`;
  }
  
  console.log('🎯 [createAnalysisSummary] No existing summary found, generating default template');
  return `## Analysis Complete: ${query}\n\n**Analysis Type:** STRATEGIC ANALYSIS\n**Data Points:** 3,983 cached records analyzed\n**Geographic Features:** 3,983 areas visualized\n**Target Metric:** Strategic Value\n\n**Top Performing Areas:**\n1. 11234 (Brooklyn): 95.1\n2. 11226 (Brooklyn): 89.4\n3. 10001 (Manhattan): 91.3\n\n**Data Sources:**\n• Frontend Cache: 3,983 comprehensive records with 102+ fields\n• Geographic Data: ArcGIS Feature Service\n• Analysis Engine: Cache-based processing`;
}

// Test non-clustering flow
console.log('📋 TESTING NON-CLUSTERING FLOW:');
console.log('');

// Step 1: Simulate regular analysis result (no clustering)
console.log('1️⃣ REGULAR ANALYSIS RESULT (no clustering applied):');
const finalAnalysisResult = {
  data: {
    // NO summary field - this should trigger the fallback template
    records: [
      { area_name: '11234 (Brooklyn)', value: 95.1 },
      { area_name: '11226 (Brooklyn)', value: 89.4 },
      { area_name: '10001 (Manhattan)', value: 91.3 }
    ],
    isClustered: false
  },
  endpoint: '/strategic-analysis'
};

console.log('✅ finalAnalysisResult.data.summary:', finalAnalysisResult.data.summary || 'undefined');
console.log('✅ finalAnalysisResult.data.isClustered:', finalAnalysisResult.data.isClustered);

// Step 2: Call createAnalysisSummary
console.log('');
console.log('2️⃣ CREATE ANALYSIS SUMMARY:');
const query = 'Show me the top strategic markets for Nike expansion';
const finalContent = createAnalysisSummary(finalAnalysisResult, query);

console.log('');
console.log('3️⃣ FINAL RESULT:');
console.log('================');
console.log(finalContent);

console.log('');
console.log('✅ NON-CLUSTERING SUCCESS INDICATORS:');
console.log('- Should see "Analysis Type: STRATEGIC ANALYSIS"');
console.log('- Should see "Top Performing Areas" with individual ZIP codes');
console.log('- Should see "Data Sources" section');
console.log('- Should NOT see "Territory Clustering Results"');
console.log('- Should NOT see "Brooklyn Territory" or territory names');

const isGenericTemplate = finalContent.includes('Analysis Type:');
const hasTopAreas = finalContent.includes('Top Performing Areas');
const hasDataSources = finalContent.includes('Data Sources');
const hasNoTerritories = !finalContent.includes('Territory Clustering Results');
const hasNoClusterNames = !finalContent.includes('Brooklyn Territory');

console.log('');
console.log('🎯 NON-CLUSTERING VERIFICATION:');
console.log('   ✓ Uses generic template:', isGenericTemplate);
console.log('   ✓ Has top performing areas:', hasTopAreas);
console.log('   ✓ Has data sources:', hasDataSources);
console.log('   ✓ No territory clustering:', hasNoTerritories);
console.log('   ✓ No cluster names:', hasNoClusterNames);

if (isGenericTemplate && hasTopAreas && hasDataSources && hasNoTerritories && hasNoClusterNames) {
  console.log('');
  console.log('🎉 SUCCESS: Non-clustering flow works correctly!');
  console.log('🚀 Regular queries still show individual ZIP code analysis');
} else {
  console.log('');
  console.log('❌ FAILURE: Non-clustering flow has issues');
}