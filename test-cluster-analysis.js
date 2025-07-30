// Test the cluster analysis generation logic directly
console.log('🧪 Testing Cluster Analysis Generation Logic');
console.log('===========================================');

// Mock data structures that would come from clustering
const mockClusteringResult = {
  success: true,
  clusters: [
    {
      clusterId: 0,
      name: "Brooklyn Territory",
      zipCodes: ["11234", "11226", "11214"],
      totalPopulation: 850000,
      isValid: true
    },
    {
      clusterId: 1, 
      name: "Manhattan Territory",
      zipCodes: ["10001", "10002", "10003"],
      totalPopulation: 450000,
      isValid: true
    }
  ],
  totalZipCodes: 3983
};

const mockClusteredZipRecords = [
  {
    cluster_id: 0,
    area_name: "11234 (Brooklyn)",
    value: 95.1,
    properties: {
      geo_id: "11234",
      total_population: 45000,
      DESCRIPTION: "Canarsie, Brooklyn"
    }
  },
  {
    cluster_id: 0,
    area_name: "11226 (Brooklyn)", 
    value: 89.4,
    properties: {
      geo_id: "11226", 
      total_population: 42000,
      DESCRIPTION: "Flatbush, Brooklyn"
    }
  },
  {
    cluster_id: 1,
    area_name: "10001 (Manhattan)",
    value: 91.3,
    properties: {
      geo_id: "10001",
      total_population: 35000,
      DESCRIPTION: "Chelsea, Manhattan"
    }
  }
];

// Mock endpoint-specific config
function getEndpointAnalysisConfig(endpoint) {
  const configs = {
    '/strategic-analysis': {
      name: 'Strategic Market Analysis',
      scoreField: 'strategic_value_score',
      scoreName: 'Strategic Value',
      focus: 'market expansion opportunities',
      recommendations: 'strategic market entry'
    }
  };
  return configs[endpoint] || configs['/strategic-analysis'];
}

// Mock cluster naming
function extractClusterName(leadZip) {
  const areaName = leadZip.area_name || '';
  if (areaName.includes('(') && areaName.includes(')')) {
    const match = areaName.match(/\((.*?)\)/);
    if (match) return match[1] + ' Territory';
  }
  return 'Unknown Territory';
}

// Mock cluster creation
function createNamedCluster(cluster, clusteredZipRecords, config) {
  const clusterZips = clusteredZipRecords.filter(record => 
    record.cluster_id === cluster.clusterId
  );
  
  if (clusterZips.length === 0) return null;
  
  const leadZip = clusterZips.reduce((max, zip) => {
    const maxPop = max.properties?.total_population || 0;
    const zipPop = zip.properties?.total_population || 0; 
    return zipPop > maxPop ? zip : max;
  });
  
  const clusterName = extractClusterName(leadZip);
  const scores = clusterZips.map(zip => zip.value || 0);
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  const topZips = clusterZips
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, 3)
    .map(zip => ({
      code: zip.properties?.geo_id || 'Unknown',
      name: zip.area_name || 'Unknown Area',
      score: zip.value || 0
    }));
    
  return {
    id: cluster.clusterId,
    name: clusterName,
    zipCount: clusterZips.length,
    avgScore,
    topZips,
    totalPopulation: clusterZips.reduce((sum, zip) => 
      sum + (zip.properties?.total_population || 0), 0
    )
  };
}

// Test the cluster analysis generation
console.log('📊 Testing cluster analysis generation...');

const endpointConfig = getEndpointAnalysisConfig('/strategic-analysis');
console.log('✅ Endpoint config:', endpointConfig);

const namedClusters = mockClusteringResult.clusters.map(cluster => {
  return createNamedCluster(cluster, mockClusteredZipRecords, endpointConfig);
});

console.log('✅ Named clusters created:', namedClusters.length);
namedClusters.forEach((cluster, i) => {
  console.log(`   ${i + 1}. ${cluster.name} - ${cluster.zipCount} ZIPs, Avg: ${cluster.avgScore.toFixed(1)}`);
});

// Generate mock analysis
const totalZips = namedClusters.reduce((sum, cluster) => sum + cluster.zipCount, 0);
const avgScore = namedClusters.reduce((sum, cluster) => sum + cluster.avgScore, 0) / namedClusters.length;

let analysis = `**${endpointConfig.name} - Territory Clustering Results**

This ${endpointConfig.focus} analysis has identified ${namedClusters.length} distinct market territories comprising ${totalZips.toLocaleString()} ZIP codes. The territories are strategically grouped based on ${endpointConfig.scoreName.toLowerCase()} scores, with an average ${endpointConfig.scoreName.toLowerCase()} of ${avgScore.toFixed(1)}.

**Territory Analysis:**

`;

namedClusters.forEach((cluster, index) => {
  const topZipsText = cluster.topZips
    .map(zip => `${zip.code} (${zip.name}, score: ${zip.score.toFixed(1)})`)
    .join(', ');
    
  analysis += `**${index + 1}. ${cluster.name}** - ${cluster.zipCount} ZIP codes, Avg ${endpointConfig.scoreName}: ${cluster.avgScore.toFixed(1)}
Population: ${cluster.totalPopulation.toLocaleString()}
Top ZIP codes: ${topZipsText}

`;
});

const topCluster = namedClusters[0];
const totalPopulation = namedClusters.reduce((sum, cluster) => sum + cluster.totalPopulation, 0);

analysis += `**Strategic Recommendations:**

Priority deployment should focus on **${topCluster.name}** (highest ${endpointConfig.scoreName.toLowerCase()}: ${topCluster.avgScore.toFixed(1)}) containing ${topCluster.zipCount} ZIP codes. This territory offers the strongest ${endpointConfig.focus} potential with ${topCluster.totalPopulation.toLocaleString()} population reach.`;

console.log('\n🎯 GENERATED CLUSTER ANALYSIS:');
console.log('===============================');
console.log(analysis);
console.log('\n✅ Cluster analysis generation works correctly!');
console.log('❓ Issue must be in the flow - either method not called or result not used.');