#!/usr/bin/env node

/**
 * Fix Comparative Analysis Format
 * 
 * Transform comparative-analysis.json to proper format with scores
 * from correlation_analysis data that has competitive_advantage_score.
 * 
 * Note: This is different from competitive-analysis!
 * - comparative-analysis = general comparison analysis
 * - competitive-analysis = brand competition analysis
 */

const fs = require('fs');
const path = require('path');

console.log('⚖️ Fixing Comparative Analysis Format...');

// Load current comparative analysis file (wrong format)
const comparativeAnalysisPath = path.join(__dirname, '../public/data/endpoints/comparative-analysis.json');
const currentData = JSON.parse(fs.readFileSync(comparativeAnalysisPath, 'utf8'));

// Load main dataset (has competitive_advantage_score and other scores)
const mainDataPath = path.join(__dirname, '../public/data/microservice-export.json');
const mainData = JSON.parse(fs.readFileSync(mainDataPath, 'utf8'));

// Get correlation_analysis dataset which has the scores we need
const correlationData = mainData.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

console.log(`📊 Found ${correlationData.results.length} records with comparative scores`);

// Create properly formatted comparative analysis data
const fixedData = {
  "success": true,
  "analysis_type": "comparative_analysis",
  "endpoint": "/comparative-analysis", 
  "description": "Comparative analysis across geographic regions and market segments",
  "methodology": {
    "comparison_approach": {
      "primary_metrics": "Nike vs Adidas market share comparison",
      "secondary_metrics": "Demographic and strategic value comparisons", 
      "statistical_methods": "Relative performance and gap analysis",
      "geographic_scope": "ZIP code level market comparison"
    },
    "comparison_dimensions": [
      "Brand market share", "Demographic opportunity", "Strategic value", "Market maturity"
    ]
  },
  
  // Preserve existing feature importance data if available
  "feature_importance": currentData.feature_importance || [],
  
  // Add results array with comparative scores (use competitive_advantage_score for comparison)
  "results": correlationData.results.map(record => ({
    ...record,
    // Use competitive_advantage_score as the primary comparative metric
    comparative_score: record.competitive_advantage_score || 5.0,
    // Also ensure it's in properties for compatibility
    properties: {
      ...record,
      comparative_score: record.competitive_advantage_score || 5.0,
      competitive_advantage_score: record.competitive_advantage_score || 5.0
    }
  })),
  
  // Add statistics for comparative analysis
  "comparison_statistics": (() => {
    const comparativeScores = correlationData.results.map(r => r.competitive_advantage_score || 5.0);
    const nikeShares = correlationData.results.map(r => r.mp30034a_b_p || 0);
    const strategicScores = correlationData.results.map(r => r.strategic_value_score || 50.0);
    
    const sortedComparative = [...comparativeScores].sort((a, b) => a - b);
    const sortedNike = [...nikeShares].sort((a, b) => a - b);
    
    const avgComparative = comparativeScores.reduce((sum, s) => sum + s, 0) / comparativeScores.length;
    const avgNike = nikeShares.reduce((sum, s) => sum + s, 0) / nikeShares.length;
    const avgStrategic = strategicScores.reduce((sum, s) => sum + s, 0) / strategicScores.length;
    
    return {
      comparative_score: {
        mean: Math.round(avgComparative * 100) / 100,
        median: sortedComparative[Math.floor(sortedComparative.length / 2)],
        min: Math.min(...comparativeScores),
        max: Math.max(...comparativeScores)
      },
      nike_market_share: {
        mean: Math.round(avgNike * 100) / 100,
        median: sortedNike[Math.floor(sortedNike.length / 2)],
        min: Math.min(...nikeShares),
        max: Math.max(...nikeShares)
      },
      strategic_alignment: {
        mean: Math.round(avgStrategic * 100) / 100
      },
      distribution: {
        "High Comparative Advantage (8-10)": comparativeScores.filter(s => s >= 8).length,
        "Good Comparative Position (6-7)": comparativeScores.filter(s => s >= 6 && s < 8).length,
        "Average Position (4-5)": comparativeScores.filter(s => s >= 4 && s < 6).length,
        "Below Average Position (2-3)": comparativeScores.filter(s => s >= 2 && s < 4).length,
        "Poor Position (0-1)": comparativeScores.filter(s => s < 2).length
      }
    };
  })(),
  
  // Add top comparative markets
  "top_comparative_markets": correlationData.results
    .sort((a, b) => (b.competitive_advantage_score || 0) - (a.competitive_advantage_score || 0))
    .slice(0, 15)
    .map(record => ({
      id: record.ID || record.id,
      name: record.DESCRIPTION || record.description || `${record.ID} (Unknown Area)`,
      comparative_score: record.competitive_advantage_score || 5.0,
      nike_share: record.mp30034a_b_p || 0,
      adidas_share: record.mp30029a_b_p || 0,
      nike_advantage: (record.mp30034a_b_p || 0) - (record.mp30029a_b_p || 0),
      strategic_score: record.strategic_value_score || 0,
      demographic_score: record.demographic_opportunity_score || 0
    }))
};

console.log('✅ Created fixed comparative analysis data structure:');
console.log(`   - success: ${fixedData.success}`);
console.log(`   - analysis_type: ${fixedData.analysis_type}`);
console.log(`   - results count: ${fixedData.results.length}`);
console.log(`   - feature_importance count: ${fixedData.feature_importance.length}`);
console.log(`   - comparative score range: ${fixedData.comparison_statistics.comparative_score.min} - ${fixedData.comparison_statistics.comparative_score.max}`);
console.log(`   - average comparative score: ${fixedData.comparison_statistics.comparative_score.mean}`);

// Save the fixed file
fs.writeFileSync(comparativeAnalysisPath, JSON.stringify(fixedData, null, 2));

console.log('✅ Successfully fixed comparative-analysis.json format!');
console.log(`📄 Updated: ${comparativeAnalysisPath}`);
console.log('\n⚖️ Comparative analysis now has proper format:');
console.log('   ✅ "success": true');
console.log('   ✅ "analysis_type": "comparative_analysis"');
console.log('   ✅ "results": [...] with comparative_score and competitive_advantage_score');
console.log('   ✅ Added comprehensive comparison statistics');
console.log('   ✅ Added top comparative markets analysis');

console.log('\n📊 Top 5 Comparative Markets:');
fixedData.top_comparative_markets.slice(0, 5).forEach((market, i) => {
  console.log(`   ${i + 1}. ${market.name}: ${market.comparative_score.toFixed(1)} comparative score (Nike: ${market.nike_share.toFixed(1)}%, Adidas: ${market.adidas_share.toFixed(1)}%)`);
});

console.log('\n🔄 Next: Test "Compare Nike\'s market position against competitors" query in the UI!');