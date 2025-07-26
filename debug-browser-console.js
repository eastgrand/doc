#!/usr/bin/env node

/**
 * Browser Console Debug Instructions
 * 
 * Copy and paste these console commands into your browser's developer console
 * while running strategic or competitive analysis to trace the actual data flow.
 */

console.log(`
🔍 BROWSER CONSOLE DEBUG COMMANDS
=====================================

1. First, open your browser developer console (F12)

2. Run strategic or competitive analysis in the UI

3. While it's processing, paste these commands one by one to trace the data:

//--- CHECK ANALYSISENGINE DATA ---
console.log('=== ANALYSISENGINE DEBUG ===');
// Look for logs like: [AnalysisEngine] Processed data returned: {recordCount: X}
// This will show you how many records reach the AnalysisEngine

//--- CHECK VISUALIZATIONRENDERER DATA ---
console.log('=== VISUALIZATIONRENDERER DEBUG ===');
// Look for logs like: [VisualizationRenderer] Creating visualization for /strategic-analysis with X records
// This will show you how many records reach the VisualizationRenderer

//--- CHECK CHOROPLETHRENDERER DATA ---
console.log('=== CHOROPLETHRENDERER DEBUG ===');
// Look for logs like: [ChoroplethRenderer] Using field for class breaks: strategic_value_score
// And: Values extracted: X valid values
// This will show you how many records reach the ChoroplethRenderer

//--- MANUAL CHECK IN CONSOLE ---
// You can also run this in the console during analysis:
window.debugAnalysisData = true;

// Or check the actual data being processed:
if (window.lastAnalysisData) {
  console.log('Last analysis record count:', window.lastAnalysisData.records?.length);
  console.log('Sample records:', window.lastAnalysisData.records?.slice(0, 3));
}

=====================================

🎯 WHAT TO LOOK FOR:

❌ If AnalysisEngine shows recordCount: 1
   → Problem is in the DataProcessor or data loading

❌ If VisualizationRenderer shows "with 1 records"  
   → Problem is between AnalysisEngine and VisualizationRenderer

❌ If ChoroplethRenderer shows "Values extracted: 1 valid values"
   → Problem is in the ChoroplethRenderer field access

❌ If ChoroplethRenderer shows "Values extracted: 0 valid values"
   → Problem is in the feature attribute mapping

✅ Expected: All should show 3000+ records for strategic/competitive analysis

=====================================

🔧 NEXT STEPS BASED ON FINDINGS:

If recordCount is 1 everywhere:
- Check if DataProcessor is limiting records
- Check if there's a development mode limiting data
- Check if the endpoint files are being truncated

If recordCount drops at VisualizationRenderer:
- Check if there's data filtering between AnalysisEngine and renderer
- Check if configuration limits are being applied

If recordCount drops at ChoroplethRenderer:
- Check if field access is failing and filtering out records
- Check if the feature attribute mapping is removing records

=====================================
`);

console.log('Instructions printed above. Copy and run in browser console during analysis.');