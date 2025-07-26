#!/usr/bin/env node

/**
 * Create Strategic Analysis Data
 * 
 * Create strategic-analysis.json from correlation_analysis data that has strategic_value_score.
 * This matches the format expected by StrategicAnalysisProcessor.
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Creating Strategic Analysis Data...');

// Load main dataset (has strategic_value_score from scoring script)
const mainDataPath = path.join(__dirname, '../public/data/microservice-export.json');
if (!fs.existsSync(mainDataPath)) {
  console.error('❌ microservice-export.json not found');
  process.exit(1);
}

const mainData = JSON.parse(fs.readFileSync(mainDataPath, 'utf8'));

// Get correlation_analysis dataset which has the strategic scores
const correlationData = mainData.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

console.log(`📊 Found ${correlationData.results.length} records with strategic_value_score`);

// Check if strategic_value_score exists
const hasStrategicScores = correlationData.results.some(r => r.strategic_value_score !== undefined);
if (!hasStrategicScores) {
  console.error('❌ No strategic_value_score found in correlation data. Run strategic-value-scores.js first.');
  process.exit(1);
}

// Create properly formatted strategic analysis data
const strategicData = {
  "success": true,
  "analysis_type": "strategic_analysis",
  "endpoint": "/strategic-analysis",
  "description": "Strategic market analysis for Nike expansion opportunities",
  "methodology": {
    "scoring_methodology": {
      "market_opportunity": "35% - Demographics + Market fundamentals",
      "competitive_position": "30% - Competitive advantage + Brand positioning", 
      "data_reliability": "20% - Correlation strength + Data consistency",
      "market_scale": "15% - Population size + Economic scale"
    },
    "component_weights": {
      "demographic_opportunity_score": 0.21,
      "market_gap_potential": 0.14,
      "competitive_advantage_score": 0.20,
      "brand_positioning": 0.10,
      "correlation_strength": 0.15,
      "cluster_consistency": 0.05,
      "population_scale": 0.09,
      "economic_scale": 0.06
    }
  },
  
  // Add results array with strategic_value_score (format expected by StrategicAnalysisProcessor)
  "results": correlationData.results.map(record => ({
    ...record,
    // Ensure strategic_value_score is at top level for processor access
    strategic_value_score: record.strategic_value_score || 50.0,
    // Also ensure it's in properties for compatibility
    properties: {
      ...record,
      strategic_value_score: record.strategic_value_score || 50.0
    }
  })),
  
  // Add statistics similar to competitive analysis
  "score_statistics": (() => {
    const scores = correlationData.results.map(r => r.strategic_value_score || 50.0);
    const sortedScores = [...scores].sort((a, b) => a - b);
    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const median = sortedScores[Math.floor(sortedScores.length / 2)];
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    
    return {
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      min,
      max,
      distribution: {
        "Exceptional Strategic Value (90-100)": scores.filter(s => s >= 90).length,
        "High Strategic Value (75-89)": scores.filter(s => s >= 75 && s < 90).length,
        "Good Strategic Value (60-74)": scores.filter(s => s >= 60 && s < 75).length,
        "Moderate Strategic Value (45-59)": scores.filter(s => s >= 45 && s < 60).length,
        "Limited Strategic Value (0-44)": scores.filter(s => s < 45).length
      }
    };
  })(),
  
  // Add top strategic markets
  "top_strategic_markets": correlationData.results
    .sort((a, b) => (b.strategic_value_score || 0) - (a.strategic_value_score || 0))
    .slice(0, 15)
    .map(record => ({
      id: record.ID || record.id,
      name: record.DESCRIPTION || record.description || `${record.ID} (Unknown Area)`,
      strategic_score: record.strategic_value_score || 50.0,
      competitive_score: record.competitive_advantage_score || 0,
      demographic_score: record.demographic_opportunity_score || 0,
      nike_share: record.mp30034a_b_p || 0,
      market_gap: Math.max(0, 100 - (record.mp30034a_b_p || 0)),
      total_population: record.total_population || 0,
      median_income: record.median_income || 0
    }))
};

console.log('✅ Created strategic analysis data structure:');
console.log(`   - success: ${strategicData.success}`);
console.log(`   - analysis_type: ${strategicData.analysis_type}`);
console.log(`   - results count: ${strategicData.results.length}`);
console.log(`   - score range: ${strategicData.score_statistics.min} - ${strategicData.score_statistics.max}`);
console.log(`   - average score: ${strategicData.score_statistics.mean}`);

// Save the strategic analysis file
const outputPath = path.join(__dirname, '../public/data/endpoints/strategic-analysis.json');
const outputDir = path.dirname(outputPath);

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(strategicData, null, 2));

console.log('✅ Successfully created strategic-analysis.json!');
console.log(`📄 Created: ${outputPath}`);
console.log('\n🎯 Strategic analysis file structure:');
console.log('   ✅ "success": true');
console.log('   ✅ "analysis_type": "strategic_analysis"');
console.log('   ✅ "results": [...] with strategic_value_score');
console.log('   ✅ Added comprehensive metadata and statistics');
console.log('   ✅ Added top strategic markets analysis');

console.log('\n📊 Top 5 Strategic Markets:');
strategicData.top_strategic_markets.slice(0, 5).forEach((market, i) => {
  console.log(`   ${i + 1}. ${market.name}: ${market.strategic_score.toFixed(1)} strategic score`);
});

console.log('\n🔄 Next: Test "show me the top strategic markets for Nike expansion" query in the UI!');