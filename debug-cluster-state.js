// Debug cluster state - what the user sees vs what the code uses
console.log('🔍 CLUSTER STATE ANALYSIS');
console.log('========================');

// Import the default config
const DEFAULT_CLUSTER_CONFIG = {
  enabled: false,                     // OFF by default
  numClusters: 5,                     // Manageable number for campaigns
  minZipCodes: 10,                    // Meaningful territory size
  minPopulation: 50000,               // Viable campaign audience
  maxRadiusMiles: 50,                 // Typical DMA coverage
  minScorePercentile: 70              // Only top 30% of ZIP codes
};

console.log('📋 DEFAULT_CLUSTER_CONFIG from types.ts:');
console.log(JSON.stringify(DEFAULT_CLUSTER_CONFIG, null, 2));
console.log('');

console.log('❌ ISSUE IDENTIFIED:');
console.log('   - clustering is DISABLED by default (enabled: false)');
console.log('   - User must manually enable it in the UI');
console.log('   - If user forgot to enable it, clustering will be skipped');
console.log('');

console.log('🔧 DEBUGGING STEPS:');
console.log('1. Check if [CLUSTER STATE DEBUG] shows enabled: false');
console.log('2. If enabled: false, user needs to click the clustering toggle in UI');
console.log('3. The clustering icon should be in the top toolbar');
console.log('4. Toggle it ON (enabled: true) before running queries');
console.log('');

console.log('✅ EXPECTED FLOW WHEN WORKING:');
console.log('   [CLUSTER STATE DEBUG] enabled: true ← This is key!');
console.log('   [CLUSTERING DEBUG] conditionResult: true');
console.log('   [CLUSTERING] Applying clustering AFTER geometry join');
console.log('   [ClusteringService] Config set on service');
console.log('   [ClusteringService] Successfully applied clustering');
console.log('');

console.log('🎯 NEXT ACTION:');
console.log('   Run query with clustering toggle ENABLED in UI');
console.log('   Watch console for enabled: true in the debug logs');