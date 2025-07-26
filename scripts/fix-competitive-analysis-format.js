#!/usr/bin/env node

/**
 * Fix Competitive Analysis Format
 * 
 * Transform competitive-analysis.json to match strategic-analysis.json format:
 * - Add "success": true
 * - Change analysis_type from "shap_analysis" to "competitive_analysis"  
 * - Add "results" array from main dataset with competitive_advantage_score
 * - Preserve existing feature_importance data
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Competitive Analysis Format...');

// Load current competitive analysis file (wrong format)
const competitiveAnalysisPath = path.join(__dirname, '../public/data/endpoints/competitive-analysis.json');
const currentData = JSON.parse(fs.readFileSync(competitiveAnalysisPath, 'utf8'));

// Load main dataset (has competitive_advantage_score)
const mainDataPath = path.join(__dirname, '../public/data/microservice-export.json');
const mainData = JSON.parse(fs.readFileSync(mainDataPath, 'utf8'));

// Get correlation_analysis dataset which has the competitive scores
const correlationData = mainData.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

console.log(`📊 Found ${correlationData.results.length} records with competitive_advantage_score`);

// Create properly formatted competitive analysis data
const fixedData = {
  "success": true,
  "analysis_type": "competitive_analysis",
  "endpoint": "/competitive-analysis", 
  "description": "Nike competitive advantage analysis across athletic footwear markets",
  "methodology": {
    "scoring_methodology": {
      "market_dominance": "40% - Nike market share vs confirmed competitors",
      "demographic_alignment": "30% - SHAP-weighted demographic favorability", 
      "competitive_pressure": "20% - Competitive pressure from other brands",
      "category_strength": "10% - Nike strength in key product categories"
    },
    "confirmed_competitors": [
      "Adidas", "Jordan", "Converse", "Puma", "New Balance", "Asics", "Skechers", "Reebok"
    ]
  },
  
  // Preserve existing feature importance data
  "feature_importance": currentData.feature_importance || [],
  
  // Add results array with competitive_advantage_score (same format as strategic analysis)
  "results": correlationData.results.map(record => ({
    ...record,
    // Ensure competitive_advantage_score is at top level for processor access
    competitive_advantage_score: record.competitive_advantage_score || 5.0,
    // Also ensure it's in properties for compatibility
    properties: {
      ...record,
      competitive_advantage_score: record.competitive_advantage_score || 5.0
    }
  })),
  
  // Add statistics similar to strategic analysis
  "score_statistics": (() => {
    const scores = correlationData.results.map(r => r.competitive_advantage_score || 5.0);
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
        "Dominant Advantage (8-10)": scores.filter(s => s >= 8).length,
        "Strong Advantage (6-7)": scores.filter(s => s >= 6 && s < 8).length,
        "Moderate Advantage (4-5)": scores.filter(s => s >= 4 && s < 6).length,
        "Limited Advantage (2-3)": scores.filter(s => s >= 2 && s < 4).length,
        "Weak Position (1-2)": scores.filter(s => s < 2).length
      }
    };
  })(),
  
  // Add top competitive markets
  "top_competitive_markets": correlationData.results
    .sort((a, b) => (b.competitive_advantage_score || 0) - (a.competitive_advantage_score || 0))
    .slice(0, 10)
    .map(record => ({
      id: record.ID || record.id,
      name: record.DESCRIPTION || record.description || `${record.ID} (Unknown Area)`,
      competitive_score: record.competitive_advantage_score || 5.0,
      nike_share: record.mp30034a_b_p || 0,
      strategic_score: record.strategic_value_score || 0,
      demographic_score: record.demographic_opportunity_score || 0
    }))
};

console.log('✅ Created fixed competitive analysis data structure:');
console.log(`   - success: ${fixedData.success}`);
console.log(`   - analysis_type: ${fixedData.analysis_type}`);
console.log(`   - results count: ${fixedData.results.length}`);
console.log(`   - feature_importance count: ${fixedData.feature_importance.length}`);
console.log(`   - score range: ${fixedData.score_statistics.min} - ${fixedData.score_statistics.max}`);
console.log(`   - average score: ${fixedData.score_statistics.mean}`);

// Save the fixed file
fs.writeFileSync(competitiveAnalysisPath, JSON.stringify(fixedData, null, 2));

console.log('✅ Successfully fixed competitive-analysis.json format!');
console.log(`📄 Updated: ${competitiveAnalysisPath}`);
console.log('\n🎯 Competitive analysis now has the same format as strategic analysis:');
console.log('   ✅ "success": true');
console.log('   ✅ "analysis_type": "competitive_analysis"');
console.log('   ✅ "results": [...] with competitive_advantage_score');
console.log('   ✅ Preserved existing feature_importance data');
console.log('   ✅ Added metadata and statistics');

console.log('\n🔄 Next: Test competitive analysis in the UI - it should now work like strategic analysis!');