// Simple test to verify clustering logic
console.log('Testing clustering configuration...');

// Simulate the clusterConfig that should be passed
const clusterConfig = {
  enabled: true,
  numClusters: 5,
  minZipCodes: 10,
  minPopulation: 50000,
  maxRadiusMiles: 50,
  minScorePercentile: 70
};

const analysisOptions = {
  sampleSize: 5000,
  targetVariable: 'strategic_value_score',
  forceRefresh: false,
  endpoint: undefined,
  clusterConfig: clusterConfig
};

console.log('🚨🚨🚨 [CLUSTERING DEBUG] Checking clustering condition:', {
  hasClusterConfig: !!analysisOptions.clusterConfig,
  clusterConfig: analysisOptions.clusterConfig,
  isEnabled: analysisOptions.clusterConfig?.enabled,
  conditionResult: analysisOptions.clusterConfig && analysisOptions.clusterConfig.enabled
});

if (analysisOptions.clusterConfig && analysisOptions.clusterConfig.enabled) {
  console.log('✅ Clustering condition is TRUE - clustering should be applied');
} else {
  console.log('❌ Clustering condition is FALSE - clustering will be skipped');
  console.log('Debug info:', {
    hasClusterConfig: !!analysisOptions.clusterConfig,
    enabled: analysisOptions.clusterConfig?.enabled,
    clusterConfig: analysisOptions.clusterConfig
  });
}