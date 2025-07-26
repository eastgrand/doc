#!/usr/bin/env node

/**
 * Simple Field Detection Test
 * Tests getRelevantFields function with actual data
 */

const fs = require('fs');

console.log('🔍 FIELD DETECTION TEST');
console.log('=' .repeat(50));

// Simple version of getRelevantFields function
function getRelevantFields(attributes, query) {
  if (!attributes || !query) {
    return [];
  }

  const availableFields = Object.keys(attributes);
  const queryLower = query.toLowerCase();

  console.log(`\n📊 Testing query: "${query}"`);
  console.log(`📋 Available fields count: ${availableFields.length}`);

  // For competitive analysis queries - PRIORITY OVER BRAND QUERIES
  if (queryLower.includes('competitive') || queryLower.includes('compete') || 
      queryLower.includes('competitor') || queryLower.includes('position') ||
      queryLower.includes('advantage') || queryLower.includes('compare') ||
      (queryLower.includes('market') && queryLower.includes('position')) ||
      (queryLower.includes('nike') && queryLower.includes('against'))) {
    
    console.log('🎯 Query matches competitive criteria');
    
    const competitiveFields = availableFields.filter(f => {
      const fieldLower = f.toLowerCase();
      return (
        fieldLower.includes('competitive_advantage_score') ||
        fieldLower.includes('competitive_score') ||
        fieldLower.includes('advantage_score') ||
        fieldLower.includes('competitive')
      );
    });
    
    console.log(`🏆 Found ${competitiveFields.length} competitive fields:`, competitiveFields);
    
    if (competitiveFields.length > 0) {
      return competitiveFields;
    }
  }

  // For strategic analysis queries - PRIORITY OVER BRAND QUERIES
  if (queryLower.includes('strategic') || queryLower.includes('expansion') || 
      queryLower.includes('invest') || queryLower.includes('opportunity') ||
      queryLower.includes('value') || queryLower.includes('potential') ||
      (queryLower.includes('market') && queryLower.includes('analysis')) ||
      (queryLower.includes('nike') && (queryLower.includes('expand') || queryLower.includes('invest')))) {
    
    console.log('🎯 Query matches strategic criteria');
    
    const strategicFields = availableFields.filter(f => {
      const fieldLower = f.toLowerCase();
      return (
        fieldLower.includes('strategic_value_score') ||
        fieldLower.includes('strategic_score') ||
        fieldLower.includes('value_score') ||
        fieldLower.includes('strategic')
      );
    });
    
    console.log(`📊 Found ${strategicFields.length} strategic fields:`, strategicFields);
    
    if (strategicFields.length > 0) {
      return strategicFields;
    }
  }

  // For brand-related queries
  if (queryLower.includes('nike') || queryLower.includes('adidas') || queryLower.includes('brand') || 
      queryLower.includes('lululemon') || queryLower.includes('alo') || queryLower.includes('jordan') ||
      queryLower.includes('shoes') || queryLower.includes('sales') || queryLower.includes('purchase')) {
    
    console.log('🎯 Query matches brand criteria');
    
    const brandFields = availableFields.filter(f => {
      const fieldLower = f.toLowerCase();
      return (
        fieldLower.includes('nike') || 
        fieldLower.includes('adidas') || 
        fieldLower.includes('alo') ||
        fieldLower.includes('jordan') ||
        fieldLower.includes('lululemon') ||
        (fieldLower.includes('bought') && 
         (fieldLower.includes('shoes') || 
          fieldLower.includes('athletic') || 
          fieldLower.includes('sports'))) ||
        (fieldLower.includes('sales') || fieldLower.includes('purchase'))
      );
    });
    
    console.log(`👟 Found ${brandFields.length} brand fields:`, brandFields);
    
    if (brandFields.length > 0) {
      return brandFields;
    }
  }
  
  // Default case: return all available fields
  console.log('📋 No specific fields found, returning all available fields');
  return availableFields;
}

async function testFieldDetection() {
  try {
    // Test paths
    const strategicPath = './public/data/endpoints/strategic-analysis.json';
    const competitivePath = './public/data/endpoints/competitive-analysis.json';
    
    console.log('\n📁 Loading test data...');
    
    // Load and test strategic data
    if (fs.existsSync(strategicPath)) {
      const strategicData = JSON.parse(fs.readFileSync(strategicPath, 'utf8'));
      console.log(`\n📊 STRATEGIC ANALYSIS`);
      console.log(`Data structure:`, Object.keys(strategicData));
      
      // Get the actual data array
      const dataArray = strategicData.data || strategicData.results || strategicData;
      console.log(`Data array length: ${Array.isArray(dataArray) ? dataArray.length : 'Not an array'}`);
      
      if (Array.isArray(dataArray) && dataArray.length > 0) {
        const strategicSample = dataArray[0];
        console.log('Sample record keys:', Object.keys(strategicSample).slice(0, 15), '...');
        
        // Check for strategic score fields in the data
        const strategicScoreFields = Object.keys(strategicSample).filter(f => 
          f.toLowerCase().includes('strategic') || 
          f.toLowerCase().includes('value_score') ||
          f === 'strategic_value_score'
        );
        console.log('Strategic score fields in data:', strategicScoreFields);
        
        // Test field detection
        const strategicQuery = "strategic analysis";
        const strategicFields = getRelevantFields(strategicSample, strategicQuery);
        console.log(`Final result for "${strategicQuery}":`, strategicFields.slice(0, 5));
      } else {
        console.log('❌ No data array found in strategic file');
      }
      
    } else {
      console.log(`❌ Strategic data not found at: ${strategicPath}`);
    }
    
    // Load and test competitive data
    if (fs.existsSync(competitivePath)) {
      const competitiveData = JSON.parse(fs.readFileSync(competitivePath, 'utf8'));
      console.log(`\n🏆 COMPETITIVE ANALYSIS`);
      console.log(`Data structure:`, Object.keys(competitiveData));
      
      // Get the actual data array
      const dataArray = competitiveData.data || competitiveData.results || competitiveData;
      console.log(`Data array length: ${Array.isArray(dataArray) ? dataArray.length : 'Not an array'}`);
      
      if (Array.isArray(dataArray) && dataArray.length > 0) {
        const competitiveSample = dataArray[0];
        console.log('Sample record keys:', Object.keys(competitiveSample).slice(0, 15), '...');
        
        // Check for competitive score fields in the data
        const competitiveScoreFields = Object.keys(competitiveSample).filter(f => 
          f.toLowerCase().includes('competitive') || 
          f.toLowerCase().includes('advantage') ||
          f === 'competitive_advantage_score'
        );
        console.log('Competitive score fields in data:', competitiveScoreFields);
        
        // Test field detection
        const competitiveQuery = "competitive analysis";
        const competitiveFields = getRelevantFields(competitiveSample, competitiveQuery);
        console.log(`Final result for "${competitiveQuery}":`, competitiveFields.slice(0, 5));
        
        // Test specific score field values
        console.log('\nSample competitive values:');
        console.log('- competitive_advantage_score:', competitiveSample.competitive_advantage_score);
        console.log('- value:', competitiveSample.value);
        console.log('- value_MP30034A_B_P:', competitiveSample.value_MP30034A_B_P);
      } else {
        console.log('❌ No data array found in competitive file');
      }
      
    } else {
      console.log(`❌ Competitive data not found at: ${competitivePath}`);
    }
    
    console.log('\n✅ Field detection test complete');
    
  } catch (error) {
    console.error('❌ Error during field detection test:', error);
  }
}

// Run the test
testFieldDetection();