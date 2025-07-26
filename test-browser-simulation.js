#!/usr/bin/env node

/**
 * Browser Simulation Test
 * Tests the exact queries from ANALYSIS_CATEGORIES to debug the issue
 */

const fs = require('fs');

// Import the actual function from field-analysis.ts (simplified version)
function getRelevantFields(attributes, query) {
  if (!attributes || !query) {
    return [];
  }

  const availableFields = Object.keys(attributes);
  const queryLower = query.toLowerCase();

  console.log(`\n🔍 Testing query: "${query}"`);
  console.log(`   Query lowercase: "${queryLower}"`);
  console.log(`   Available fields count: ${availableFields.length}`);

  // For exercise/fitness related queries
  if (queryLower.includes('exercise') || queryLower.includes('fitness') || 
      queryLower.includes('jog') || queryLower.includes('run') || 
      queryLower.includes('workout') || queryLower.includes('active') ||
      queryLower.includes('sport') || queryLower.includes('athletic')) {
    console.log('   ✓ Matches: exercise/fitness criteria');
    const exerciseFields = availableFields.filter(f => {
      const fieldLower = f.toLowerCase();
      return (
        fieldLower.includes('exercise') ||
        fieldLower.includes('fitness') ||
        fieldLower.includes('jog') ||
        fieldLower.includes('run') ||
        fieldLower.includes('workout') ||
        fieldLower.includes('active') ||
        fieldLower.includes('sport') ||
        fieldLower.includes('athletic') ||
        fieldLower.includes('participated')
      );
    });
    
    if (exerciseFields.length > 0) {
      console.log(`   → Found ${exerciseFields.length} exercise fields`);
      return exerciseFields;
    }
  }

  // For competitive analysis queries - PRIORITY OVER BRAND QUERIES
  if (queryLower.includes('competitive') || queryLower.includes('compete') || 
      queryLower.includes('competitor') || queryLower.includes('position') ||
      queryLower.includes('advantage') || queryLower.includes('compare') ||
      (queryLower.includes('market') && queryLower.includes('position')) ||
      (queryLower.includes('nike') && queryLower.includes('against'))) {
    console.log('   ✓ Matches: competitive criteria');
    const competitiveFields = availableFields.filter(f => {
      const fieldLower = f.toLowerCase();
      return (
        fieldLower.includes('competitive_advantage_score') ||
        fieldLower.includes('competitive_score') ||
        fieldLower.includes('advantage_score') ||
        fieldLower.includes('competitive')
      );
    });
    
    if (competitiveFields.length > 0) {
      console.log(`   → Found ${competitiveFields.length} competitive fields`);
      return competitiveFields;
    }
  }

  // For strategic analysis queries - PRIORITY OVER BRAND QUERIES
  if (queryLower.includes('strategic') || queryLower.includes('expansion') || 
      queryLower.includes('invest') || queryLower.includes('opportunity') ||
      queryLower.includes('value') || queryLower.includes('potential') ||
      (queryLower.includes('market') && queryLower.includes('analysis')) ||
      (queryLower.includes('nike') && (queryLower.includes('expand') || queryLower.includes('invest')))) {
    console.log('   ✓ Matches: strategic criteria');
    const strategicFields = availableFields.filter(f => {
      const fieldLower = f.toLowerCase();
      return (
        fieldLower.includes('strategic_value_score') ||
        fieldLower.includes('strategic_score') ||
        fieldLower.includes('value_score') ||
        fieldLower.includes('strategic')
      );
    });
    
    if (strategicFields.length > 0) {
      console.log(`   → Found ${strategicFields.length} strategic fields`);
      return strategicFields;
    }
  }

  // For brand-related queries
  if (queryLower.includes('nike') || queryLower.includes('adidas') || queryLower.includes('brand') || 
      queryLower.includes('lululemon') || queryLower.includes('alo') || queryLower.includes('jordan') ||
      queryLower.includes('shoes') || queryLower.includes('sales') || queryLower.includes('purchase')) {
    console.log('   ✓ Matches: brand criteria');
    const brandFields = availableFields.filter(f => {
      const fieldLower = f.toLowerCase();
      return (
        // Check for brand-specific fields
        fieldLower.includes('nike') || 
        fieldLower.includes('adidas') || 
        fieldLower.includes('alo') ||
        fieldLower.includes('jordan') ||
        fieldLower.includes('lululemon') ||
        // Check for purchase-related fields
        (fieldLower.includes('bought') && 
         (fieldLower.includes('shoes') || 
          fieldLower.includes('athletic') || 
          fieldLower.includes('sports'))) ||
        // Check for sales-related fields
        (fieldLower.includes('sales') || fieldLower.includes('purchase'))
      );
    });
    
    if (brandFields.length > 0) {
      console.log(`   → Found ${brandFields.length} brand fields`);
      return brandFields;
    }
  }
  
  // Default case: return all available fields
  console.log('   ⚠ No specific match - returning all fields');
  return availableFields;
}

// Test queries from ANALYSIS_CATEGORIES
const testQueries = {
  strategic: 'Show me the top strategic markets for Nike expansion',
  competitive: "Compare Nike's market position against competitors",
  demographic: "Which markets have the best demographic fit for Nike's target customer profile?",
  location: 'Show me geographic clusters of similar markets',
  insights: "What market factors are most strongly correlated with Nike's success?",
  analysis: 'Which markets are most adaptable to different strategic scenarios?',
  quality: 'Show me markets that have outliers with unique characteristics',
  brand: 'Which markets have the strongest Nike brand positioning?'
};

async function testBrowserSimulation() {
  console.log('🌐 BROWSER SIMULATION TEST');
  console.log('=' .repeat(60));
  
  try {
    // Load actual data
    const strategicPath = './public/data/endpoints/strategic-analysis.json';
    const competitivePath = './public/data/endpoints/competitive-analysis.json';
    
    const strategicFile = JSON.parse(fs.readFileSync(strategicPath, 'utf8'));
    const competitiveFile = JSON.parse(fs.readFileSync(competitivePath, 'utf8'));
    
    const strategicData = strategicFile.results?.[0] || {};
    const competitiveData = competitiveFile.results?.[0] || {};
    
    console.log('\n📊 TESTING EXACT BROWSER QUERIES:');
    console.log('=' .repeat(60));
    
    // Test strategic query
    console.log('\n1. STRATEGIC QUERY TEST:');
    const strategicResult = getRelevantFields(strategicData, testQueries.strategic);
    console.log(`   Result: ${strategicResult.length} fields`);
    console.log(`   Contains strategic_value_score: ${strategicResult.includes('strategic_value_score')}`);
    if (strategicResult.length < 10) {
      console.log(`   Fields returned:`, strategicResult);
    }
    
    // Test competitive query
    console.log('\n2. COMPETITIVE QUERY TEST:');
    const competitiveResult = getRelevantFields(competitiveData, testQueries.competitive);
    console.log(`   Result: ${competitiveResult.length} fields`);
    console.log(`   Contains competitive_advantage_score: ${competitiveResult.includes('competitive_advantage_score')}`);
    if (competitiveResult.length < 10) {
      console.log(`   Fields returned:`, competitiveResult);
    }
    
    console.log('\n🔍 KEYWORD ANALYSIS:');
    console.log('=' .repeat(60));
    
    // Analyze why queries might not match
    console.log('\nStrategic query analysis:');
    const strategicQuery = testQueries.strategic.toLowerCase();
    console.log(`- Contains "strategic": ${strategicQuery.includes('strategic')}`);
    console.log(`- Contains "expansion": ${strategicQuery.includes('expansion')}`);
    console.log(`- Contains "nike": ${strategicQuery.includes('nike')}`);
    console.log(`- Contains "market": ${strategicQuery.includes('market')}`);
    
    console.log('\nCompetitive query analysis:');
    const competitiveQuery = testQueries.competitive.toLowerCase();
    console.log(`- Contains "competitive": ${competitiveQuery.includes('competitive')}`);
    console.log(`- Contains "compare": ${competitiveQuery.includes('compare')}`);
    console.log(`- Contains "position": ${competitiveQuery.includes('position')}`);
    console.log(`- Contains "competitor": ${competitiveQuery.includes('competitor')}`);
    
    // Check field availability in data
    console.log('\n📁 FIELD AVAILABILITY CHECK:');
    console.log('=' .repeat(60));
    
    console.log('\nStrategic data fields:');
    const strategicFields = Object.keys(strategicData);
    console.log(`- Total fields: ${strategicFields.length}`);
    console.log(`- Has strategic_value_score: ${strategicFields.includes('strategic_value_score')}`);
    console.log(`- Strategic-related fields:`, strategicFields.filter(f => f.toLowerCase().includes('strategic')));
    
    console.log('\nCompetitive data fields:');
    const competitiveFields = Object.keys(competitiveData);
    console.log(`- Total fields: ${competitiveFields.length}`);
    console.log(`- Has competitive_advantage_score: ${competitiveFields.includes('competitive_advantage_score')}`);
    console.log(`- Competitive-related fields:`, competitiveFields.filter(f => f.toLowerCase().includes('competitive')));
    
    console.log('\n❌ POTENTIAL ISSUES:');
    console.log('=' .repeat(60));
    
    if (!strategicResult.includes('strategic_value_score')) {
      console.log('⚠️  Strategic query not returning strategic_value_score field');
      if (strategicResult.length === strategicFields.length) {
        console.log('   → Field detection falling back to ALL fields');
      }
    }
    
    if (!competitiveResult.includes('competitive_advantage_score')) {
      console.log('⚠️  Competitive query not returning competitive_advantage_score field');
      if (competitiveResult.length === competitiveFields.length) {
        console.log('   → Field detection falling back to ALL fields');
      }
    }
    
  } catch (error) {
    console.error('❌ Error during browser simulation test:', error);
  }
}

// Run the test
testBrowserSimulation();