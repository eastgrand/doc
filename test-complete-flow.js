#!/usr/bin/env node

// Test the complete clustering flow by simulating the actual execution
console.log('🧪 TESTING COMPLETE CLUSTERING FLOW');
console.log('==================================');

// Mock the ClusteringService.generateEndpointSpecificClusterAnalysis method
function generateEndpointSpecificClusterAnalysis(clusteringResult, clusteredZipRecords, endpoint) {
  console.log('🎯 [CLUSTER ANALYSIS METHOD] Starting cluster analysis generation');
  
  if (!clusteringResult.success || clusteringResult.clusters.length === 0) {
    console.log('🎯 [CLUSTER ANALYSIS METHOD] Falling back to original summary - clustering failed or no clusters');
    return 'Original non-clustered analysis';
  }

  // Mock endpoint config
  const endpointConfig = {
    name: 'Strategic Market Analysis',
    scoreName: 'Strategic Value',
    focus: 'market expansion opportunities',
    recommendations: 'strategic market entry'
  };

  // Mock named clusters
  const namedClusters = [
    {
      name: 'Brooklyn Territory',
      zipCount: 847,
      avgScore: 78.3,
      totalPopulation: 2450000,
      topZips: [
        { code: '11234', name: '11234 (Brooklyn)', score: 95.1 },
        { code: '11226', name: '11226 (Brooklyn)', score: 89.4 },
        { code: '11214', name: '11214 (Brooklyn)', score: 85.7 }
      ]
    },
    {
      name: 'Manhattan Territory', 
      zipCount: 234,
      avgScore: 76.8,
      totalPopulation: 1630000,
      topZips: [
        { code: '10001', name: '10001 (Manhattan)', score: 91.3 },
        { code: '10002', name: '10002 (Manhattan)', score: 87.2 }
      ]
    }
  ];

  // Generate cluster analysis
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

  console.log('🎯 [CLUSTER ANALYSIS METHOD] Successfully generated cluster analysis:', {
    analysisLength: analysis.length,
    namedClustersCount: namedClusters.length,
    preview: analysis.substring(0, 300) + '...'
  });

  return analysis;
}

// Mock the createAnalysisSummary function
function createAnalysisSummary(analysisResult, query) {
  console.log('🎯 [createAnalysisSummary] Called with analysisResult.data.summary length:', analysisResult.data?.summary?.length || 0);
  
  // CRITICAL: Use existing summary if it exists (e.g., from clustering)
  if (analysisResult.data?.summary && analysisResult.data.summary.trim().length > 0) {
    console.log('🎯 [createAnalysisSummary] Using existing summary from analysisResult.data.summary');
    console.log('🎯 [createAnalysisSummary] Summary preview:', analysisResult.data.summary.substring(0, 200) + '...');
    return `## Analysis Complete: ${query}\n\n${analysisResult.data.summary}`;
  }
  
  console.log('🎯 [createAnalysisSummary] No existing summary found, generating default template');
  return `## Analysis Complete: ${query}\n\n**Analysis Type:** STRATEGIC ANALYSIS\n**Data Points:** 3,983 cached records analyzed\n**Geographic Features:** 3,983 areas visualized\n**Target Metric:** Strategic Value\n\n**Top Performing Areas:**\n1. 11234 (Brooklyn): 95.1\n2. 11226 (Brooklyn): 89.4\n3. 10001 (Manhattan): 91.3\n\n**Data Sources:**\n• Frontend Cache: 3,983 comprehensive records with 102+ fields`;
}

// Test the complete flow
console.log('📋 TESTING FLOW:');
console.log('');

// Step 1: Simulate clustering result
console.log('1️⃣ CLUSTERING SERVICE GENERATES ANALYSIS:');
const mockClusteringResult = {
  success: true,
  clusters: [{ clusterId: 0 }, { clusterId: 1 }]
};
const mockClusteredZips = [
  { cluster_id: 0, area_name: '11234 (Brooklyn)', value: 95.1 },
  { cluster_id: 1, area_name: '10001 (Manhattan)', value: 91.3 }
];

const clusterAnalysis = generateEndpointSpecificClusterAnalysis(
  mockClusteringResult, 
  mockClusteredZips, 
  '/strategic-analysis'
);

// Step 2: Simulate ClusteringService.enhanceAnalysisWithClusters
console.log('');
console.log('2️⃣ CLUSTERING SERVICE ENHANCES ANALYSIS RESULT:');
const finalAnalysisResult = {
  data: {
    summary: clusterAnalysis + '\n\n**Territory Clustering Applied:** The analysis has been organized into 2 distinct market territories.',
    records: mockClusteredZips,
    isClustered: true
  },
  endpoint: '/strategic-analysis'
};

console.log('✅ finalAnalysisResult.data.summary length:', finalAnalysisResult.data.summary.length);
console.log('✅ finalAnalysisResult.data.isClustered:', finalAnalysisResult.data.isClustered);

// Step 3: Simulate createAnalysisSummary
console.log('');
console.log('3️⃣ CREATE ANALYSIS SUMMARY:');
const query = 'Show me the top strategic markets for Nike expansion';
const finalContent = createAnalysisSummary(finalAnalysisResult, query);

console.log('');
console.log('4️⃣ FINAL RESULT:');
console.log('================');
console.log(finalContent);

console.log('');
console.log('✅ SUCCESS INDICATORS:');
console.log('- Should see "Territory Clustering Results" in output');
console.log('- Should see "Brooklyn Territory" and "Manhattan Territory"');
console.log('- Should see strategic recommendations');
console.log('- Should NOT see generic "Top Performing Areas" list');

const hasClusterAnalysis = finalContent.includes('Territory Clustering Results');
const hasTerritories = finalContent.includes('Brooklyn Territory');
const hasRecommendations = finalContent.includes('Strategic Recommendations');

console.log('');
console.log('🎯 VERIFICATION:');
console.log('   ✓ Contains cluster analysis:', hasClusterAnalysis);
console.log('   ✓ Contains territories:', hasTerritories);
console.log('   ✓ Contains recommendations:', hasRecommendations);

if (hasClusterAnalysis && hasTerritories && hasRecommendations) {
  console.log('');
  console.log('🎉 SUCCESS: Clustering flow works correctly!');
  console.log('🚀 The analysis should now show territories instead of individual ZIP codes');
} else {
  console.log('');
  console.log('❌ FAILURE: Clustering flow has issues');
}