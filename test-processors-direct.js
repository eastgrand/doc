/**
 * Direct processor testing - tests data processing without API
 */
const fs = require('fs').promises;
const path = require('path');

const testCases = [
  {
    name: 'Strategic Analysis',
    dataFile: './public/data/endpoints/strategic-analysis.json',
    expectedType: 'strategic_analysis',
    expectedTargetVariable: 'strategic_value_score'
  },
  {
    name: 'Competitive Analysis',
    dataFile: './public/data/endpoints/competitive-analysis.json', 
    expectedType: 'competitive_analysis',
    expectedTargetVariable: 'competitive_advantage_score'
  },
  {
    name: 'Demographic Analysis',
    dataFile: './public/data/endpoints/demographic-insights.json',
    expectedType: 'demographic_analysis',
    expectedTargetVariable: 'value_MP30034A_B_P'  // Nike market share as demographic score
  },
  {
    name: 'Spatial Clusters',
    dataFile: './public/data/endpoints/spatial-clusters.json',
    expectedType: 'spatial_clustering',
    expectedTargetVariable: 'cluster_performance_score'  // Updated to match data
  }
];

async function testDataFile(testCase) {
  console.log(`\n📊 TESTING: ${testCase.name}`);
  console.log(`Data file: ${testCase.dataFile}`);
  
  try {
    // Test data file exists and is valid
    const dataContent = await fs.readFile(testCase.dataFile, 'utf8');
    const data = JSON.parse(dataContent);
    
    console.log(`✅ Step 1 - Data File Loaded: ${data.results?.length || 0} records`);
    
    if (!data.results || data.results.length === 0) {
      console.log(`❌ No data records found`);
      return;
    }
    
    // Check sample record structure
    const sampleRecord = data.results[0];
    const recordKeys = Object.keys(sampleRecord);
    console.log(`📋 Step 2 - Sample Record Keys (first 15): ${recordKeys.slice(0, 15).join(', ')}`);
    
    // Check for expected target variable
    if (sampleRecord[testCase.expectedTargetVariable] !== undefined) {
      const value = sampleRecord[testCase.expectedTargetVariable];
      console.log(`✅ Step 3 - Target Variable Present: ${testCase.expectedTargetVariable} = ${value}`);
    } else {
      console.log(`❌ Step 3 - Target Variable Missing: ${testCase.expectedTargetVariable}`);
      
      // Find similar score fields
      const scoreFields = recordKeys.filter(key => 
        key.includes('score') || key.includes('value') || key.includes('analysis')
      );
      console.log(`🔍 Available Score Fields: ${scoreFields.join(', ')}`);
    }
    
    // Check for common required fields
    const requiredFields = ['area_id', 'ID', 'id'];
    const hasIdField = requiredFields.some(field => sampleRecord[field] !== undefined);
    console.log(`${hasIdField ? '✅' : '❌'} Step 4 - ID Field Present: ${hasIdField}`);
    
    // Check for geographic fields (prioritizing value_DESCRIPTION)
    const geoFields = ['value_DESCRIPTION', 'DESCRIPTION', 'area_name', 'NAME', 'name'];
    const hasNameField = geoFields.some(field => sampleRecord[field] !== undefined);
    const foundNameField = geoFields.find(field => sampleRecord[field] !== undefined);
    console.log(`${hasNameField ? '✅' : '❌'} Step 5 - Name Field Present: ${hasNameField} (using: ${foundNameField})`);
    
    // Check for Nike market share data
    const nikeFields = ['mp30034a_b_p', 'value_MP30034A_B_P', 'nike_market_share'];
    const hasNikeData = nikeFields.some(field => sampleRecord[field] !== undefined);
    console.log(`${hasNikeData ? '✅' : '❌'} Step 6 - Nike Data Present: ${hasNikeData}`);
    
    // Sample some values to check data quality - show varied samples for competitive analysis
    if (data.results.length >= 5) {
      console.log(`📈 Step 7 - Sample Values for ${testCase.expectedTargetVariable}:`);
      let sampleRecords;
      if (testCase.name === 'Competitive Analysis') {
        // For competitive analysis, sample from different parts to show variation
        sampleRecords = [
          data.results[0], data.results[6], data.results[100], 
          data.results[500], data.results[1000]
        ];
      } else {
        sampleRecords = data.results.slice(0, 5);
      }
      
      const sampleValues = sampleRecords.map((record, index) => {
        const value = record[testCase.expectedTargetVariable];
        const id = record.area_id || record.ID || record.id || `Record ${index + 1}`;
        return `  ${id}: ${value}`;
      });
      console.log(sampleValues.join('\n'));
    }
    
    console.log(`🎉 ${testCase.name} data test completed!`);
    
  } catch (error) {
    console.log(`💥 ${testCase.name} test failed: ${error.message}`);
  }
}

async function runDataTests() {
  console.log('🚀 Starting direct data file testing...\n');
  
  for (const testCase of testCases) {
    await testDataFile(testCase);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n✨ All data tests completed!');
  console.log('\n📋 KEY FINDINGS:');
  console.log('1. Each data file should contain records with the expected target variable');
  console.log('2. Records should have proper ID and name fields for visualization');
  console.log('3. Competitive analysis should have competitive_advantage_score values');
  console.log('4. Strategic analysis should have strategic_value_score values');
  console.log('5. All scores should be numeric and vary across records');
}

runDataTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});