// Simulate what the UI does when running strategic analysis
const fs = require('fs');

async function simulateUIFlow() {
  console.log('=== Simulating UI Strategic Analysis Flow ===\n');

  try {
    // 1. UI calls AnalysisEngine.executeAnalysis()
    console.log('1. UI calls executeAnalysis("Show me the top strategic markets for Nike expansion")');
    
    // 2. AnalysisEngine.executeAnalysis() calls endpointRouter.selectEndpoint()
    console.log('2. AnalysisEngine calls endpointRouter.selectEndpoint()');
    
    // Simulate endpoint selection
    const query = "Show me the top strategic markets for Nike expansion";
    const keywords = {
      '/analyze': ['analyze', 'analysis', 'show', 'find', 'identify', 'display'],
      '/strategic-analysis': ['strategic', 'strategy', 'expansion', 'opportunity', 'potential', 'growth'],
      '/competitive-analysis': ['competitive', 'competition', 'compete', 'brand', 'nike', 'adidas'],
      '/spatial-clusters': ['cluster', 'clustering', 'similar', 'spatial', 'geographic']
    };
    
    const lowerQuery = query.toLowerCase();
    let bestMatch = { endpoint: '/analyze', score: 0 };
    
    for (const [endpoint, keywordList] of Object.entries(keywords)) {
      let score = 0;
      const matched = [];
      for (const keyword of keywordList) {
        if (lowerQuery.includes(keyword)) {
          score++;
          matched.push(keyword);
        }
      }
      console.log(`   ${endpoint}: score=${score} (matched: ${matched.join(', ')})`);
      if (score > bestMatch.score) {
        bestMatch = { endpoint, score };
      }
    }
    
    console.log(`   → Selected endpoint: ${bestMatch.endpoint}`);
    
    // 3. AnalysisEngine calls endpointRouter.callEndpoint()
    console.log('\n3. AnalysisEngine calls endpointRouter.callEndpoint()');
    
    // Load the data file (simulating CachedEndpointRouter)
    const dataPath = './public/data/endpoints/strategic-analysis.json';
    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`   Loaded ${rawData.results.length} records from ${dataPath}`);
    
    // 4. AnalysisEngine calls dataProcessor.processResults()
    console.log('\n4. AnalysisEngine calls dataProcessor.processResults()');
    console.log('   Using StrategicAnalysisProcessor...');
    
    // Simulate StrategicAnalysisProcessor.process()
    const processedRecords = rawData.results.slice(0, 10).map((record, index) => {
      const primaryScore = Number(record.strategic_value_score);
      
      return {
        area_id: record.ID,
        area_name: record.DESCRIPTION,
        value: Math.round(primaryScore * 100) / 100,
        rank: 0,
        properties: {
          ...record,
          strategic_value_score: primaryScore,
          score_source: 'strategic_value_score'
        },
        geometry: {
          type: 'Point',
          coordinates: [-74.0, 40.7] // Mock coordinates
        }
      };
    });
    
    const rankedRecords = processedRecords.sort((a, b) => b.value - a.value)
      .map((record, index) => ({ ...record, rank: index + 1 }));
    
    const analysisResult = {
      success: true,
      endpoint: '/strategic-analysis',
      data: {
        type: 'strategic_analysis',
        records: rankedRecords,
        targetVariable: 'strategic_value_score',
        summary: 'Strategic analysis complete'
      },
      visualization: { type: 'point' }
    };
    
    console.log('   AnalysisEngine returns:');
    console.log(`   - success: ${analysisResult.success}`);
    console.log(`   - endpoint: ${analysisResult.endpoint}`);
    console.log(`   - data.type: ${analysisResult.data.type}`);
    console.log(`   - records: ${analysisResult.data.records.length}`);
    console.log('   - First 3 values:');
    analysisResult.data.records.slice(0, 3).forEach((record, i) => {
      console.log(`     ${i+1}. ${record.area_name}: ${record.value}`);
    });
    
    // 5. UI processes AnalysisEngine result
    console.log('\n5. UI processes AnalysisEngine result');
    
    // This is where the bug might be - in the UI processing
    console.log('   Converting to Claude format...');
    
    const claudeFeatures = analysisResult.data.records.slice(0, 5).map(result => {
      // This simulates the UI code that prepares data for Claude
      let targetValue;
      
      if (analysisResult.data.type === 'strategic_analysis') {
        targetValue = result.properties?.strategic_value_score || 
                     result.strategic_value_score || 
                     result.value || 
                     0;
        console.log(`   Processing ${result.area_name}:`);
        console.log(`     result.properties?.strategic_value_score: ${result.properties?.strategic_value_score}`);
        console.log(`     result.strategic_value_score: ${result.strategic_value_score}`);
        console.log(`     result.value: ${result.value}`);
        console.log(`     → targetValue: ${targetValue}`);
      }
      
      return {
        properties: {
          area_name: result.area_name,
          target_value: targetValue,
          analysis_score: targetValue
        }
      };
    });
    
    console.log('\n   Claude receives features with target_values:');
    claudeFeatures.forEach((feature, i) => {
      console.log(`   ${i+1}. ${feature.properties.area_name}: ${feature.properties.target_value}`);
    });
    
    // Check for the 79.3 issue
    const targetValues = claudeFeatures.map(f => f.properties.target_value);
    const uniqueTargetValues = [...new Set(targetValues)];
    
    if (uniqueTargetValues.length === 1) {
      console.log('\n🚨 PROBLEM FOUND: All target_values identical!');
      console.log('   This explains why Claude sees all 79.3 values');
    } else {
      console.log('\n✅ Target values are distinct - Claude should see different values');
    }
    
  } catch (error) {
    console.error('Simulation failed:', error);
  }
}

simulateUIFlow();