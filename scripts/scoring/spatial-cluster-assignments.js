/**
 * Spatial Cluster Assignment Script
 * 
 * Adds cluster assignment fields to individual records based on the existing
 * regional_clusters data structure. Creates cluster_id, cluster_label, and
 * cluster_performance_score fields for each record.
 */

const fs = require('fs');
const path = require('path');

console.log('🗺️ Starting Spatial Cluster Assignment...');

// Load the microservice data
const dataPath = path.join(__dirname, '../../public/data/microservice-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Access correlation_analysis dataset
const correlationData = data.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

// Access regional clusters information
const regionalClusters = correlationData.regional_clusters;
if (!regionalClusters || !regionalClusters.clusters) {
  console.error('❌ regional_clusters data not found');
  process.exit(1);
}

console.log(`📊 Processing ${correlationData.results.length} records for cluster assignment...`);
console.log(`🗺️ Found ${regionalClusters.clusters.length} existing clusters:`);
regionalClusters.clusters.forEach((cluster, index) => {
  console.log(`   ${index}: ${cluster.label} (${cluster.area_count} areas, avg: ${cluster.avg_value.toFixed(1)})`);
});

// Create cluster lookup map: area_id -> cluster_info
const clusterLookup = new Map();

regionalClusters.clusters.forEach((cluster, clusterIndex) => {
  cluster.areas.forEach(areaId => {
    // Handle both string and number ID formats
    clusterLookup.set(String(areaId), {
      cluster_id: clusterIndex,
      cluster_label: cluster.label,
      cluster_name: cluster.name,
      cluster_avg_value: cluster.avg_value,
      cluster_min_value: cluster.min_value,
      cluster_max_value: cluster.max_value,
      cluster_size: cluster.area_count,
      cluster_percentage: cluster.percentage_of_total
    });
  });
});

console.log(`🔗 Created lookup map for ${clusterLookup.size} area-cluster assignments`);

// Calculate cluster performance scores based on position within cluster range
function calculateClusterPerformanceScore(record, clusterInfo) {
  const targetValue = Number(record.target_value) || 0;
  const clusterMin = clusterInfo.cluster_min_value;
  const clusterMax = clusterInfo.cluster_max_value;
  const clusterAvg = clusterInfo.cluster_avg_value;
  
  if (clusterMax === clusterMin) {
    return 0.5; // If no range, return middle performance
  }
  
  // Calculate position within cluster (0-1 scale)
  const positionInCluster = (targetValue - clusterMin) / (clusterMax - clusterMin);
  
  // Convert to performance score (0-100)
  return Math.max(0, Math.min(100, positionInCluster * 100));
}

// Calculate similarity score based on how close the record is to cluster average
function calculateSimilarityScore(record, clusterInfo) {
  const targetValue = Number(record.target_value) || 0;
  const clusterAvg = clusterInfo.cluster_avg_value;
  const clusterMin = clusterInfo.cluster_min_value;
  const clusterMax = clusterInfo.cluster_max_value;
  const clusterRange = clusterMax - clusterMin;
  
  if (clusterRange === 0) {
    return 1.0; // Perfect similarity if no variation
  }
  
  // Calculate distance from cluster average as percentage of cluster range
  const distanceFromAverage = Math.abs(targetValue - clusterAvg);
  const normalizedDistance = distanceFromAverage / clusterRange;
  
  // Convert to similarity (1 = perfect similarity, 0 = maximum distance)
  const similarity = Math.max(0, 1 - normalizedDistance);
  
  return similarity;
}

// Assign clusters to records
let assignedCount = 0;
let unassignedCount = 0;
const clusterStats = new Map();

console.log('🔄 Assigning cluster information to records...');

correlationData.results.forEach((record, index) => {
  const areaId = String(record.ID || record.id || '');
  const clusterInfo = clusterLookup.get(areaId);
  
  if (clusterInfo) {
    // Assign cluster fields
    record.cluster_id = clusterInfo.cluster_id;
    record.cluster_label = clusterInfo.cluster_label;
    record.cluster_name = clusterInfo.cluster_name;
    record.cluster_size = clusterInfo.cluster_size;
    record.cluster_avg_value = clusterInfo.cluster_avg_value;
    
    // Calculate performance and similarity scores
    record.cluster_performance_score = calculateClusterPerformanceScore(record, clusterInfo);
    record.similarity_score = calculateSimilarityScore(record, clusterInfo);
    
    // Add cluster centroid distance (simplified calculation)
    const targetValue = Number(record.target_value) || 0;
    record.cluster_centroid_distance = Math.abs(targetValue - clusterInfo.cluster_avg_value);
    
    assignedCount++;
    
    // Track cluster statistics
    const clusterId = clusterInfo.cluster_id;
    if (!clusterStats.has(clusterId)) {
      clusterStats.set(clusterId, {
        label: clusterInfo.cluster_label,
        count: 0,
        avgPerformance: 0,
        avgSimilarity: 0,
        totalPerformance: 0,
        totalSimilarity: 0
      });
    }
    
    const stats = clusterStats.get(clusterId);
    stats.count++;
    stats.totalPerformance += record.cluster_performance_score;
    stats.totalSimilarity += record.similarity_score;
    stats.avgPerformance = stats.totalPerformance / stats.count;
    stats.avgSimilarity = stats.totalSimilarity / stats.count;
    
  } else {
    // No cluster assignment found
    record.cluster_id = -1; // Unassigned indicator
    record.cluster_label = 'Unassigned';
    record.cluster_name = 'unassigned';
    record.cluster_size = 0;
    record.cluster_avg_value = 0;
    record.cluster_performance_score = 0;
    record.similarity_score = 0;
    record.cluster_centroid_distance = 0;
    
    unassignedCount++;
  }
  
  if ((index + 1) % 500 === 0) {
    console.log(`   Processed ${index + 1}/${correlationData.results.length} records...`);
  }
});

console.log('📈 Cluster Assignment Statistics:');
console.log(`   📊 Records assigned to clusters: ${assignedCount.toLocaleString()}`);
console.log(`   📊 Records unassigned: ${unassignedCount.toLocaleString()}`);
console.log(`   📊 Assignment rate: ${(assignedCount / (assignedCount + unassignedCount) * 100).toFixed(1)}%`);

console.log('🏷️ Cluster Performance Summary:');
clusterStats.forEach((stats, clusterId) => {
  console.log(`   Cluster ${clusterId} (${stats.label}): ${stats.count.toLocaleString()} areas, ${stats.avgPerformance.toFixed(1)} avg performance, ${(stats.avgSimilarity * 100).toFixed(1)}% avg similarity`);
});

// Show sample records from each cluster
console.log('🔍 Sample Cluster Assignments:');
const samplesByCluster = new Map();

correlationData.results.forEach(record => {
  const clusterId = record.cluster_id;
  if (clusterId >= 0) {
    if (!samplesByCluster.has(clusterId)) {
      samplesByCluster.set(clusterId, []);
    }
    if (samplesByCluster.get(clusterId).length < 3) {
      samplesByCluster.get(clusterId).push({
        description: record.DESCRIPTION || record.ID,
        performance: record.cluster_performance_score.toFixed(1),
        similarity: (record.similarity_score * 100).toFixed(1)
      });
    }
  }
});

samplesByCluster.forEach((samples, clusterId) => {
  const stats = clusterStats.get(clusterId);
  console.log(`   ${stats.label}:`);
  samples.forEach(sample => {
    console.log(`      ${sample.description}: ${sample.performance}% performance, ${sample.similarity}% similarity`);
  });
});

// Validate cluster consistency
console.log('✅ Validating cluster assignments...');
let validationErrors = 0;

// Check that all cluster IDs are valid
const validClusterIds = new Set([0, 1, 2, 3, -1]); // 4 clusters + unassigned
correlationData.results.forEach(record => {
  if (!validClusterIds.has(record.cluster_id)) {
    console.error(`❌ Invalid cluster_id: ${record.cluster_id} for record ${record.ID}`);
    validationErrors++;
  }
});

// Check performance score ranges
correlationData.results.forEach(record => {
  if (record.cluster_performance_score < 0 || record.cluster_performance_score > 100) {
    console.error(`❌ Invalid performance score: ${record.cluster_performance_score} for record ${record.ID}`);
    validationErrors++;
  }
});

// Check similarity score ranges
correlationData.results.forEach(record => {
  if (record.similarity_score < 0 || record.similarity_score > 1) {
    console.error(`❌ Invalid similarity score: ${record.similarity_score} for record ${record.ID}`);
    validationErrors++;
  }
});

if (validationErrors === 0) {
  console.log('✅ All cluster assignments passed validation');
} else {
  console.log(`⚠️ Found ${validationErrors} validation errors`);
}

// Save updated data
console.log('💾 Saving updated dataset...');
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('✅ Spatial cluster assignment complete!');
console.log(`📄 Updated dataset saved to: ${dataPath}`);
console.log(`🗺️ All ${assignedCount.toLocaleString()} records now include cluster assignment fields`);

// Update completion status
console.log('\n📋 Added fields to each record:');
console.log('   ✅ cluster_id (0-3 for clusters, -1 for unassigned)');
console.log('   ✅ cluster_label (human-readable cluster name)');
console.log('   ✅ cluster_name (machine-readable cluster identifier)');
console.log('   ✅ cluster_size (number of areas in cluster)');
console.log('   ✅ cluster_avg_value (cluster average performance)');
console.log('   ✅ cluster_performance_score (0-100 position within cluster)');
console.log('   ✅ similarity_score (0-1 similarity to cluster center)');
console.log('   ✅ cluster_centroid_distance (distance from cluster average)');

console.log('\n📋 Next steps:');
console.log('   1. ✅ Created cluster assignments for all records');
console.log('   2. 🔄 Update ClusterDataProcessor field mappings');
console.log('   3. 🔄 Verify target variable consistency');
console.log('   4. 🔄 Test spatial clustering endpoint');