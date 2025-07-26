// Test the AnalysisEngine directly with strategic analysis
const fs = require('fs');

async function testMockAnalysisEngine() {
  console.log('=== Testing Mock AnalysisEngine ===\n');
  
  console.log('1. Testing raw data:');
  const data = JSON.parse(fs.readFileSync('./public/data/endpoints/strategic-analysis.json', 'utf8'));
  console.log(`Found ${data.results.length} records`);
  console.log('First 3 strategic_value_scores:');
  data.results.slice(0, 3).forEach((record, i) => {
    console.log(`  ${i+1}. ${record.DESCRIPTION}: ${record.strategic_value_score}`);
  });
  
  console.log('\n2. Processing like AnalysisEngine should:');
  const processedRecords = data.results.slice(0, 5).map((record) => {
    const primaryScore = Number(record.strategic_value_score);
    return {
      area_id: record.ID,
      area_name: record.DESCRIPTION,
      value: primaryScore, // Keep exact precision
      properties: {
        strategic_value_score: primaryScore
      }
    };
  });
  
  const rankedRecords = processedRecords.sort((a, b) => b.value - a.value)
    .map((record, index) => ({ ...record, rank: index + 1 }));
  
  console.log('Processed records:');
  rankedRecords.forEach((record, i) => {
    console.log(`  ${i+1}. ${record.area_name}: value=${record.value}`);
  });
  
  // Check if all values are the same (the bug we're trying to fix)
  const values = rankedRecords.map(r => r.value);
  const uniqueValues = [...new Set(values)];
  
  if (uniqueValues.length === 1) {
    console.log('\n🚨 PROBLEM: All values are identical!');
    console.log(`All values: ${values.join(', ')}`);
  } else {
    console.log('\n✅ Values are distinct as expected');
    console.log(`Distinct values: ${uniqueValues.join(', ')}`);
  }

  // Now simulate what happens when this goes to Claude API
  console.log('\n3. Simulating Claude API data preparation:');
  const claudeFeatures = rankedRecords.map(record => ({
    properties: {
      area_name: record.area_name,
      target_value: record.properties?.strategic_value_score || record.value,
      analysis_score: record.properties?.strategic_value_score || record.value
    }
  }));
  
  console.log('Data sent to Claude:');
  claudeFeatures.forEach((feature, i) => {
    console.log(`  ${i+1}. ${feature.properties.area_name}: target_value=${feature.properties.target_value}`);
  });
  
  const claudeValues = claudeFeatures.map(f => f.properties.target_value);
  const uniqueClaudeValues = [...new Set(claudeValues)];
  
  if (uniqueClaudeValues.length === 1) {
    console.log('\n🚨 PROBLEM: Claude receives identical values!');
    console.log(`All Claude values: ${claudeValues.join(', ')}`);
  } else {
    console.log('\n✅ Claude receives distinct values');
    console.log(`Distinct Claude values: ${uniqueClaudeValues.join(', ')}`);
  }
}

testMockAnalysisEngine();