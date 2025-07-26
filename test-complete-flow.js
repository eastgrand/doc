#!/usr/bin/env node

/**
 * Complete Flow Test
 * Simulates the exact browser flow to identify where the issue is
 */

const fs = require('fs');

// Mock AnalysisEngine
class MockAnalysisEngine {
  async analyzeQuery(query, options) {
    console.log(`[MockAnalysisEngine] Analyzing query: "${query}"`);
    
    // Determine endpoint based on query
    let endpoint = '/analyze';
    let analysisType = 'general_analysis';
    
    if (query.toLowerCase().includes('strategic')) {
      endpoint = '/strategic-analysis';
      analysisType = 'strategic_analysis';
    } else if (query.toLowerCase().includes('competitive') || query.toLowerCase().includes('compete') || 
               query.toLowerCase().includes('compare') || query.toLowerCase().includes('position')) {
      endpoint = '/competitive-analysis';
      analysisType = 'competitive_analysis';
    }
    
    console.log(`[MockAnalysisEngine] Selected endpoint: ${endpoint}`);
    
    // Load mock data
    let data = [];
    if (endpoint === '/strategic-analysis') {
      const rawData = JSON.parse(fs.readFileSync('./public/data/endpoints/strategic-analysis.json', 'utf8'));
      data = rawData.results;
    } else if (endpoint === '/competitive-analysis') {
      const rawData = JSON.parse(fs.readFileSync('./public/data/endpoints/competitive-analysis.json', 'utf8'));
      data = rawData.results;
    } else {
      // Default test data
      data = [{
        ID: 'test1',
        DESCRIPTION: 'Test Area 1',
        value: 50
      }];
    }
    
    // Simulate processor output
    const records = data.slice(0, 10).map((record, index) => ({
      area_id: record.ID || record.id,
      area_name: record.DESCRIPTION || record.description || `Area ${index}`,
      value: record.strategic_value_score || record.competitive_advantage_score || 0,
      rank: index + 1,
      properties: record,
      geometry: { type: 'Polygon', coordinates: [] }
    }));
    
    const targetVariable = endpoint === '/strategic-analysis' 
      ? 'strategic_value_score' 
      : 'competitive_advantage_score';
    
    return {
      success: true,
      endpoint,
      data: {
        type: analysisType,
        records,
        targetVariable,
        summary: `Analysis complete for ${records.length} areas`
      },
      visualization: {
        type: 'choropleth',
        config: {
          valueField: targetVariable,
          classification: 'quartile'
        }
      }
    };
  }
}

// Mock field detection
function mockGetRelevantFields(attributes, query) {
  const availableFields = Object.keys(attributes);
  const queryLower = query.toLowerCase();
  
  console.log(`[mockGetRelevantFields] Query: "${query}"`);
  console.log(`[mockGetRelevantFields] Available fields: ${availableFields.length}`);
  
  // Strategic detection
  if (queryLower.includes('strategic') || queryLower.includes('expansion')) {
    const strategicFields = availableFields.filter(f => 
      f.toLowerCase().includes('strategic_value_score') ||
      f.toLowerCase().includes('strategic')
    );
    console.log(`[mockGetRelevantFields] Found strategic fields: ${strategicFields}`);
    return strategicFields.length > 0 ? strategicFields : availableFields;
  }
  
  // Competitive detection
  if (queryLower.includes('competitive') || queryLower.includes('compete') ||
      queryLower.includes('compare') || queryLower.includes('position')) {
    const competitiveFields = availableFields.filter(f => 
      f.toLowerCase().includes('competitive_advantage_score') ||
      f.toLowerCase().includes('competitive')
    );
    console.log(`[mockGetRelevantFields] Found competitive fields: ${competitiveFields}`);
    if (competitiveFields.length === 0) {
      console.log(`[mockGetRelevantFields] WARNING: No competitive fields found!`);
      console.log(`[mockGetRelevantFields] Sample available fields:`, availableFields.slice(0, 10));
    }
    return competitiveFields.length > 0 ? competitiveFields : availableFields;
  }
  
  return availableFields;
}

// Test the complete flow
async function testCompleteFlow() {
  console.log('🔄 COMPLETE FLOW TEST');
  console.log('=' .repeat(60));
  
  const engine = new MockAnalysisEngine();
  
  const testCases = [
    {
      name: 'Strategic Analysis',
      query: 'Show me the top strategic markets for Nike expansion'
    },
    {
      name: 'Competitive Analysis',
      query: "Compare Nike's market position against competitors"
    }
  ];
  
  for (const test of testCases) {
    console.log(`\n\n📊 ${test.name}`);
    console.log('─'.repeat(40));
    
    // Step 1: Analysis Engine
    console.log('\n1️⃣ ANALYSIS ENGINE');
    const analysisResult = await engine.analyzeQuery(test.query);
    console.log(`- Endpoint: ${analysisResult.endpoint}`);
    console.log(`- Type: ${analysisResult.data.type}`);
    console.log(`- Target Variable: ${analysisResult.data.targetVariable}`);
    console.log(`- Records: ${analysisResult.data.records.length}`);
    console.log(`- First record value: ${analysisResult.data.records[0]?.value}`);
    
    // Step 2: Enhanced Analysis (simulating geospatial-chat-interface)
    console.log('\n2️⃣ ENHANCED ANALYSIS RESULT');
    const enhancedAnalysisResult = {
      ...analysisResult,
      data: {
        ...analysisResult.data,
        records: analysisResult.data.records // In real flow, this would be joined with geographic data
      }
    };
    
    // Step 3: Prepare Claude features
    console.log('\n3️⃣ CLAUDE FEATURE PREPARATION');
    const firstRecord = enhancedAnalysisResult.data.records[0];
    
    let targetValue;
    if (enhancedAnalysisResult.data.type === 'competitive_analysis') {
      targetValue = firstRecord.properties?.competitive_advantage_score || 
                   firstRecord.competitive_advantage_score || 
                   firstRecord.value || 0;
      console.log(`- Competitive target value logic:`);
      console.log(`  properties.competitive_advantage_score: ${firstRecord.properties?.competitive_advantage_score}`);
      console.log(`  competitive_advantage_score: ${firstRecord.competitive_advantage_score}`);
      console.log(`  value: ${firstRecord.value}`);
      console.log(`  → Final targetValue: ${targetValue}`);
    } else if (enhancedAnalysisResult.data.type === 'strategic_analysis') {
      targetValue = firstRecord.properties?.strategic_value_score || 
                   firstRecord.strategic_value_score || 
                   firstRecord.value || 0;
      console.log(`- Strategic target value logic:`);
      console.log(`  properties.strategic_value_score: ${firstRecord.properties?.strategic_value_score}`);
      console.log(`  strategic_value_score: ${firstRecord.strategic_value_score}`);
      console.log(`  value: ${firstRecord.value}`);
      console.log(`  → Final targetValue: ${targetValue}`);
    }
    
    // Step 4: Claude payload
    console.log('\n4️⃣ CLAUDE PAYLOAD');
    const claudeFeature = {
      properties: {
        area_name: firstRecord.area_name,
        area_id: firstRecord.area_id,
        target_value: targetValue,
        score_field_name: analysisResult.data.targetVariable,
        strategic_value_score: firstRecord.properties?.strategic_value_score || 0,
        competitive_advantage_score: firstRecord.properties?.competitive_advantage_score || 0,
        nike_market_share: firstRecord.properties?.value_MP30034A_B_P || 0
      }
    };
    
    console.log('Claude feature sample:', JSON.stringify(claudeFeature, null, 2));
    
    // Step 5: Field detection (for API route)
    console.log('\n5️⃣ FIELD DETECTION (API Route)');
    const relevantFields = mockGetRelevantFields(firstRecord.properties, test.query);
    console.log(`- Relevant fields returned: ${relevantFields.slice(0, 5)}`);
    console.log(`- Would use field: ${relevantFields[0]}`);
    
    // Summary
    console.log('\n✅ FLOW SUMMARY:');
    console.log(`- Analysis type: ${enhancedAnalysisResult.data.type}`);
    console.log(`- Target variable: ${enhancedAnalysisResult.data.targetVariable}`);
    console.log(`- Claude target_value: ${targetValue}`);
    console.log(`- Field detection result: ${relevantFields[0]}`);
    
    const isCorrect = (
      (test.name === 'Strategic Analysis' && targetValue === firstRecord.properties.strategic_value_score) ||
      (test.name === 'Competitive Analysis' && targetValue === firstRecord.properties.competitive_advantage_score)
    );
    
    console.log(`- Flow correct: ${isCorrect ? '✅ YES' : '❌ NO'}`);
  }
}

// Run test
testCompleteFlow().catch(console.error);