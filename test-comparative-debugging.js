const { AnalysisEngine } = require('./lib/analysis/AnalysisEngine');

async function testComparativeDebugging() {
  try {
    console.log('🧪 Testing comparative analysis debugging...');
    
    const analysisEngine = new AnalysisEngine();
    
    // Test with Florida counties query that should trigger geo-awareness
    const query = "compare areas in gainesville and miami";
    
    console.log(`\n📝 Query: "${query}"`);
    
    const result = await analysisEngine.analyze(query, {
      selectedLocations: [] // This will trigger normal processing
    });
    
    console.log('\n📊 Result Summary:');
    console.log('- Type:', result.type);
    console.log('- Records count:', result.records?.length || 0);
    console.log('- Target variable:', result.targetVariable);
    
    if (result.records && result.records.length > 0) {
      console.log('\n🎯 First 5 records with values:');
      result.records.slice(0, 5).forEach((record, index) => {
        console.log(`${index + 1}. ${record.area_name}: ${record.value} (rank: ${record.rank})`);
      });
      
      // Check for value distribution
      const values = result.records.map(r => r.value);
      const uniqueValues = [...new Set(values)];
      console.log('\n📈 Value Analysis:');
      console.log('- Total values:', values.length);
      console.log('- Unique values:', uniqueValues.length);
      console.log('- Sample values:', uniqueValues.slice(0, 10));
      console.log('- All same value?', uniqueValues.length === 1);
      
      if (uniqueValues.length === 1) {
        console.log('❌ ISSUE CONFIRMED: All values are the same:', uniqueValues[0]);
      } else {
        console.log('✅ VALUES ARE VARIED - Issue appears to be fixed!');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testComparativeDebugging();