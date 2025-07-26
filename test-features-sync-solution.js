#!/usr/bin/env node

// Test the features sync solution to see if it actually fixes the issue
console.log('🔧 TESTING: Features Sync Solution');
console.log('='.repeat(70));

console.log('📊 STEP 1: Simulate Initial Analysis (handleSubmit)');

// Raw data from competitive-analysis.json
const rawData = {
  success: true,
  results: [
    {
      area_id: '10996',
      area_name: 'New York 10996', 
      value_MP30034A_B_P: 27.0,  // Nike market share %
      value_MP30029A_B_P: 18.5,  // Adidas market share %
      shap_MP30034A_B_P: 0.22,
      shap_MP30029A_B_P: -0.15,
      value_TOTPOP_CY: 45000,
      value_AVGHINC_CY: 65000,
      value_MEDAGE_CY: 29
    },
    {
      area_id: '15261',
      area_name: 'Pennsylvania 15261',
      value_MP30034A_B_P: 25.0,  // Nike market share %
      value_MP30029A_B_P: 20.1,
      shap_MP30034A_B_P: 0.18,
      shap_MP30029A_B_P: -0.12,
      value_TOTPOP_CY: 38000,
      value_AVGHINC_CY: 58000,
      value_MEDAGE_CY: 34
    }
  ]
};

// Simulate CompetitiveDataProcessor calculation
function simulateCompetitiveProcessor(data) {
  console.log('🔥 [CompetitiveDataProcessor] Processing records...');
  
  const processedRecords = data.results.map(record => {
    // Simplified competitive scoring (based on actual algorithm)
    const nikeShare = record.value_MP30034A_B_P;
    const adidasShare = record.value_MP30029A_B_P;
    const shareAdvantage = Math.max(-20, Math.min(20, nikeShare - adidasShare));
    const shapDiff = record.shap_MP30034A_B_P - record.shap_MP30029A_B_P;
    const marketPresence = Math.min(10, nikeShare * 0.25);
    
    // Competitive advantage calculation (1-10 scale)
    const rawScore = (20 + shareAdvantage + shapDiff * 10 + marketPresence + 30) / 10;
    const competitiveScore = Math.max(1.0, Math.min(10.0, rawScore));
    const finalScore = Math.round(competitiveScore * 10) / 10;
    
    console.log(`  ${record.area_name}: Nike ${nikeShare}% → Competitive Score ${finalScore}`);
    
    return {
      area_id: record.area_id,
      area_name: record.area_name,
      value: finalScore, // ← COMPETITIVE SCORE
      geometry: { type: 'Polygon', coordinates: [[[0,0],[1,0],[1,1],[0,1],[0,0]]] },
      properties: {
        competitive_advantage_score: finalScore,
        nike_market_share: nikeShare,
        adidas_market_share: adidasShare,
        // Raw data contamination
        value_MP30034A_B_P: nikeShare,
        value_MP30029A_B_P: adidasShare
      }
    };
  });
  
  return {
    type: 'competitive_analysis',
    records: processedRecords
  };
}

const enhancedAnalysisResult = { data: simulateCompetitiveProcessor(rawData) };

console.log('Enhanced analysis result:', {
  type: enhancedAnalysisResult.data.type,
  recordCount: enhancedAnalysisResult.data.records.length,
  firstRecordValue: enhancedAnalysisResult.data.records[0].value,
  firstRecordMarketShare: enhancedAnalysisResult.data.records[0].properties.value_MP30034A_B_P
});
console.log('');

console.log('🔄 STEP 2: Simulate Features Sync Fix');

// Simulate the fix from lines 2393-2422
const isCompetitiveAnalysis = enhancedAnalysisResult.data.type === 'competitive_analysis';

if (isCompetitiveAnalysis) {
  console.log('🔄 [FEATURES SYNC] Updating features state with competitive scores...');
  
  // Create features with competitive advantage scores instead of raw market share
  const competitiveFeatures = enhancedAnalysisResult.data.records.map((record) => ({
    type: 'Feature',
    geometry: record.geometry,
    properties: {
      ...record.properties,
      // Ensure competitive scores are used, not market share
      thematic_value: record.value, // Use the competitive score as thematic_value
      competitive_advantage_score: record.properties?.competitive_advantage_score || record.value,
      // Keep market share as context but don't let it override competitive scores
      nike_market_share_context: record.properties?.nike_market_share || record.properties?.value_MP30034A_B_P,
      adidas_market_share_context: record.properties?.adidas_market_share || record.properties?.value_MP30029A_B_P
    }
  }));
  
  console.log('🔄 [FEATURES SYNC] Sample competitive feature:', {
    area_name: competitiveFeatures[0]?.properties?.area_name,
    thematic_value: competitiveFeatures[0]?.properties?.thematic_value,
    competitive_advantage_score: competitiveFeatures[0]?.properties?.competitive_advantage_score,
    nike_market_share_context: competitiveFeatures[0]?.properties?.nike_market_share_context
  });
  
  console.log('');
  console.log('📤 STEP 3: Simulate sendChatMessage with Updated Features');
  
  // Simulate what sendChatMessage would do with the updated features
  const features = competitiveFeatures;
  
  console.log('[DEBUG] sendChatMessage - features state:', {
    hasFeatures: !!features,
    featuresLength: features?.length || 0,
    firstFeatureSample: features?.[0] ? {
      keys: Object.keys(features[0]),
      propertiesKeys: features[0].properties ? Object.keys(features[0].properties) : 'no properties',
      hasGeometry: !!features[0].geometry
    } : 'no first feature'
  });
  
  // Simulate the data summary generation for Claude
  const allProps = features.map(f => f.properties || {});
  
  // Extract thematic values that would be sent to Claude
  const thematicValues = allProps.map(p => p.thematic_value).filter(v => v != null);
  const marketShareValues = allProps.map(p => p.value_MP30034A_B_P).filter(v => v != null);
  
  console.log('');
  console.log('🎯 STEP 4: Data That Would Be Sent to Claude');
  console.log('Thematic values (should be competitive scores):', thematicValues);
  console.log('Market share values (should not be used for ranking):', marketShareValues);
  
  // Simulate the top performers section that goes to Claude
  const sortedFeatures = features
    .filter(f => f.properties?.thematic_value != null)
    .sort((a, b) => (b.properties?.thematic_value || 0) - (a.properties?.thematic_value || 0));
  
  const topPerformers = sortedFeatures.slice(0, 5).map((f, index) => {
    const score = f.properties?.thematic_value;
    const marketShare = f.properties?.nike_market_share_context;
    
    return {
      rank: index + 1,
      description: f.properties?.area_name || 'Unknown',
      competitive_advantage_score: score,
      nike_market_share_context: marketShare
    };
  });
  
  console.log('');
  console.log('📊 Top Performers That Claude Would Receive:');
  topPerformers.forEach(p => {
    console.log(`${p.rank}. ${p.description}: competitive_advantage_score ${p.competitive_advantage_score} (Nike context: ${p.nike_market_share_context}%)`);
  });
  
  console.log('');
  console.log('🎯 VERIFICATION:');
  console.log('='.repeat(50));
  
  const firstScore = topPerformers[0]?.competitive_advantage_score;
  const firstMarketShare = topPerformers[0]?.nike_market_share_context;
  
  if (firstScore > 20) {
    console.log('❌ FIX FAILED: Claude still receives market share percentage');
    console.log(`   competitive_advantage_score: ${firstScore} (looks like market share)`);
  } else if (firstScore >= 1 && firstScore <= 10) {
    console.log('✅ FIX SUCCESSFUL: Claude receives competitive advantage score');
    console.log(`   competitive_advantage_score: ${firstScore} (1-10 scale)`);
    console.log(`   Market share is context only: ${firstMarketShare}%`);
  } else {
    console.log('⚠️  UNEXPECTED: Claude receives unexpected value');
    console.log(`   competitive_advantage_score: ${firstScore}`);
  }
  
  // Test what would happen if the old behavior was still present
  console.log('');
  console.log('📋 COMPARISON: Old vs New Behavior');
  console.log('Old behavior (market share): Claude would rank by', marketShareValues[0] + '%');
  console.log('New behavior (competitive): Claude ranks by', thematicValues[0]);
  
  if (Math.abs(thematicValues[0] - marketShareValues[0]) < 0.1) {
    console.log('❌ WARNING: Competitive score suspiciously close to market share');
    console.log('   This suggests the fix may not be working as expected');
  } else {
    console.log('✅ CONFIRMED: Competitive scores differ from market share data');
    console.log(`   Difference: ${Math.abs(thematicValues[0] - marketShareValues[0]).toFixed(2)}`);
  }
} else {
  console.log('❌ Not competitive analysis - fix would not apply');
}

console.log('');
console.log('💡 SOLUTION ASSESSMENT:');
console.log('='.repeat(50));
console.log('The features sync solution should work IF:');
console.log('1. CompetitiveDataProcessor is actually being called');
console.log('2. enhancedAnalysisResult.data.type === "competitive_analysis"');
console.log('3. record.value contains the calculated competitive scores');
console.log('4. The features state update actually happens');
console.log('');
console.log('If Claude still shows market share %, then either:');
console.log('- CompetitiveDataProcessor is not being called at all');
console.log('- The features sync code is not executing');
console.log('- There\'s another data path we haven\'t identified');