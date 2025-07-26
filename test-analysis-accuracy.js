/**
 * Analysis Accuracy Test
 * Tests that analyses produce expected and logical results
 */

const fs = require('fs');
const path = require('path');

// Load the actual data
const dataPath = path.join(__dirname, 'public/data/microservice-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const results = data.datasets.correlation_analysis.results;

console.log('🔬 Testing Analysis Accuracy & Logic...\n');

// Test 1: Score Distribution Analysis
function testScoreDistributions() {
  console.log('📊 Testing Score Distributions...');
  
  const scoreFields = [
    'strategic_value_score',
    'competitive_advantage_score', 
    'demographic_opportunity_score',
    'trend_strength_score',
    'correlation_strength_score',
    'anomaly_detection_score',
    'feature_interaction_score',
    'outlier_detection_score',
    'comparative_analysis_score',
    'predictive_modeling_score',
    'segment_profiling_score',
    'scenario_analysis_score',
    'market_sizing_score',
    'brand_analysis_score',
    'real_estate_analysis_score'
  ];
  
  scoreFields.forEach(field => {
    const scores = results.map(r => Number(r[field]) || 0).filter(s => s > 0);
    if (scores.length > 0) {
      const min = Math.min(...scores);
      const max = Math.max(...scores);
      const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
      
      console.log(`   ${field}: ${scores.length} records, range ${min.toFixed(1)}-${max.toFixed(1)}, avg ${avg}`);
      
      // Validation checks
      if (min === max) console.log(`   ⚠️  WARNING: ${field} has no variation`);
      if (max > 100) console.log(`   ❌ ERROR: ${field} exceeds 100`);
      if (min < 0) console.log(`   ❌ ERROR: ${field} has negative values`);
    } else {
      console.log(`   ❌ ERROR: ${field} has no valid scores`);
    }
  });
}

// Test 2: Logical Relationships
function testLogicalRelationships() {
  console.log('\n🧠 Testing Logical Relationships...');
  
  // Test: High Nike share should correlate with high brand analysis scores
  const nikeVsBrand = results.filter(r => r.mp30034a_b_p > 0 && r.brand_analysis_score > 0);
  if (nikeVsBrand.length > 100) {
    const highNike = nikeVsBrand.filter(r => r.mp30034a_b_p >= 25);
    const lowNike = nikeVsBrand.filter(r => r.mp30034a_b_p < 10);
    
    const avgHighNikeBrand = highNike.reduce((sum, r) => sum + r.brand_analysis_score, 0) / highNike.length;
    const avgLowNikeBrand = lowNike.reduce((sum, r) => sum + r.brand_analysis_score, 0) / lowNike.length;
    
    console.log(`   Nike Share vs Brand Analysis:`);
    console.log(`   High Nike share (25%+): ${avgHighNikeBrand.toFixed(1)} avg brand score (${highNike.length} markets)`);
    console.log(`   Low Nike share (<10%): ${avgLowNikeBrand.toFixed(1)} avg brand score (${lowNike.length} markets)`);
    
    if (avgHighNikeBrand > avgLowNikeBrand) {
      console.log(`   ✅ PASS: High Nike share correlates with higher brand scores`);
    } else {
      console.log(`   ❌ FAIL: Logic error - high Nike share should mean higher brand scores`);
    }
  }
  
  // Test: Large populations should have higher market sizing scores
  const popVsMarketSize = results.filter(r => r.total_population > 0 && r.market_sizing_score > 0);
  if (popVsMarketSize.length > 100) {
    const largePop = popVsMarketSize.filter(r => r.total_population >= 100000);
    const smallPop = popVsMarketSize.filter(r => r.total_population < 25000);
    
    const avgLargePopMarket = largePop.reduce((sum, r) => sum + r.market_sizing_score, 0) / largePop.length;
    const avgSmallPopMarket = smallPop.reduce((sum, r) => sum + r.market_sizing_score, 0) / smallPop.length;
    
    console.log(`   Population vs Market Sizing:`);
    console.log(`   Large population (100k+): ${avgLargePopMarket.toFixed(1)} avg market score (${largePop.length} markets)`);
    console.log(`   Small population (<25k): ${avgSmallPopMarket.toFixed(1)} avg market score (${smallPop.length} markets)`);
    
    if (avgLargePopMarket > avgSmallPopMarket) {
      console.log(`   ✅ PASS: Large populations correlate with higher market sizing scores`);
    } else {
      console.log(`   ❌ FAIL: Logic error - large populations should have higher market sizing scores`);
    }
  }
  
  // Test: High income should correlate with higher demographic scores
  const incomeVsDemographic = results.filter(r => r.median_income > 0 && r.demographic_opportunity_score > 0);
  if (incomeVsDemographic.length > 100) {
    const highIncome = incomeVsDemographic.filter(r => r.median_income >= 100000);
    const lowIncome = incomeVsDemographic.filter(r => r.median_income < 50000);
    
    const avgHighIncomeDemographic = highIncome.reduce((sum, r) => sum + r.demographic_opportunity_score, 0) / highIncome.length;
    const avgLowIncomeDemographic = lowIncome.reduce((sum, r) => sum + r.demographic_opportunity_score, 0) / lowIncome.length;
    
    console.log(`   Income vs Demographic Opportunity:`);
    console.log(`   High income ($100k+): ${avgHighIncomeDemographic.toFixed(1)} avg demographic score (${highIncome.length} markets)`);
    console.log(`   Low income (<$50k): ${avgLowIncomeDemographic.toFixed(1)} avg demographic score (${lowIncome.length} markets)`);
    
    if (avgHighIncomeDemographic > avgLowIncomeDemographic) {
      console.log(`   ✅ PASS: High income correlates with higher demographic scores`);
    } else {
      console.log(`   ❌ FAIL: Logic error - high income should correlate with higher demographic scores`);
    }
  }
}

// Test 3: Top Market Validation
function testTopMarkets() {
  console.log('\n🏆 Testing Top Market Rankings...');
  
  // Get top 5 markets for key analyses
  const analyses = [
    { field: 'strategic_value_score', name: 'Strategic Value' },
    { field: 'market_sizing_score', name: 'Market Sizing' },
    { field: 'brand_analysis_score', name: 'Brand Analysis' },
    { field: 'competitive_advantage_score', name: 'Competitive Advantage' }
  ];
  
  analyses.forEach(analysis => {
    const sorted = results
      .filter(r => r[analysis.field] > 0)
      .sort((a, b) => b[analysis.field] - a[analysis.field])
      .slice(0, 5);
    
    console.log(`   Top 5 ${analysis.name}:`);
    sorted.forEach((market, i) => {
      const name = market.DESCRIPTION || market.ID || 'Unknown';
      const score = market[analysis.field].toFixed(1);
      const nike = market.mp30034a_b_p ? market.mp30034a_b_p.toFixed(1) + '%' : 'N/A';
      const pop = market.total_population ? market.total_population.toLocaleString() : 'N/A';
      console.log(`     ${i+1}. ${name}: ${score} (Nike: ${nike}, Pop: ${pop})`);
    });
  });
}

// Test 4: Data Completeness
function testDataCompleteness() {
  console.log('\n📋 Testing Data Completeness...');
  
  const totalRecords = results.length;
  const completenessTests = [
    { field: 'mp30034a_b_p', name: 'Nike Market Share' },
    { field: 'total_population', name: 'Population Data' },
    { field: 'median_income', name: 'Income Data' },
    { field: 'strategic_value_score', name: 'Strategic Scores' },
    { field: 'brand_analysis_score', name: 'Brand Analysis Scores' }
  ];
  
  completenessTests.forEach(test => {
    const available = results.filter(r => r[test.field] > 0).length;
    const percentage = ((available / totalRecords) * 100).toFixed(1);
    console.log(`   ${test.name}: ${available}/${totalRecords} (${percentage}%)`);
    
    if (percentage < 50) {
      console.log(`   ⚠️  WARNING: Low data availability for ${test.name}`);
    }
  });
}

// Test 5: Score Reasonableness
function testScoreReasonableness() {
  console.log('\n🎯 Testing Score Reasonableness...');
  
  // Find markets with extreme combinations that might indicate errors
  const extremeTests = results.filter(r => {
    // Markets with very high scores across multiple dimensions (should be rare)
    const highScores = [
      r.strategic_value_score > 90,
      r.competitive_advantage_score > 9,
      r.demographic_opportunity_score > 90,
      r.market_sizing_score > 90,
      r.brand_analysis_score > 90
    ].filter(Boolean).length;
    
    return highScores >= 4; // 4 or more very high scores
  });
  
  console.log(`   Markets with 4+ extremely high scores: ${extremeTests.length}`);
  if (extremeTests.length > 0) {
    console.log(`   Top "too perfect" markets:`);
    extremeTests.slice(0, 3).forEach(market => {
      const name = market.DESCRIPTION || market.ID;
      console.log(`     ${name}: Strategic ${market.strategic_value_score}, Competitive ${market.competitive_advantage_score}, Brand ${market.brand_analysis_score}`);
    });
    
    if (extremeTests.length > 20) {
      console.log(`   ⚠️  WARNING: Too many "perfect" markets (${extremeTests.length}) - may indicate scoring issues`);
    }
  }
  
  // Find markets with very low scores across all dimensions (also suspicious)
  const lowScoreTests = results.filter(r => {
    const scores = [
      r.strategic_value_score || 0,
      r.competitive_advantage_score || 0,
      r.demographic_opportunity_score || 0,
      r.market_sizing_score || 0,
      r.brand_analysis_score || 0
    ].filter(s => s > 0);
    
    return scores.length >= 3 && scores.every(s => s < 20);
  });
  
  console.log(`   Markets with consistently very low scores: ${lowScoreTests.length}`);
  if (lowScoreTests.length > results.length * 0.3) {
    console.log(`   ⚠️  WARNING: Too many low-scoring markets (${lowScoreTests.length}) - may indicate scoring issues`);
  }
}

// Run all tests
console.log(`Testing analysis accuracy on ${results.length.toLocaleString()} market records...\n`);

testScoreDistributions();
testLogicalRelationships();
testTopMarkets();
testDataCompleteness();
testScoreReasonableness();

console.log('\n🏁 Analysis Accuracy Test Complete!');
console.log('\n💡 Next Steps:');
console.log('1. Review any warnings or errors above');
console.log('2. Test live queries with the results you see here');
console.log('3. Verify that top markets make business sense for Nike');
console.log('4. Check that score relationships align with Nike\'s strategy');