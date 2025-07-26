// Test script to verify competitive analysis processing
import { AnalysisEngine } from './lib/analysis/AnalysisEngine.js';

async function testCompetitiveAnalysis() {
  console.log('🧪 Testing Competitive Analysis Processing...\n');
  
  try {
    const analysisEngine = new AnalysisEngine({ 
      debugMode: true 
    });
    
    const query = "Nike vs Adidas competitive analysis";
    console.log(`🔥 Testing query: "${query}"`);
    
    const result = await analysisEngine.executeAnalysis(query, {
      endpoint: '/competitive-analysis'
    });
    
    console.log('\n✅ ANALYSIS RESULT:');
    console.log('- Success:', result.success);
    console.log('- Endpoint:', result.endpoint);
    console.log('- Records:', result.data?.records?.length || 0);
    
    if (result.data?.records?.length > 0) {
      const firstRecord = result.data.records[0];
      console.log('\n📊 FIRST RECORD VERIFICATION:');
      console.log('- Area:', firstRecord.area_name);
      console.log('- Value (should be 0-10):', firstRecord.value);
      console.log('- Nike Market Share:', firstRecord.nike_market_share);
      console.log('- Competitive Score:', firstRecord.competitive_advantage_score);
      console.log('- Value in correct range:', firstRecord.value >= 0 && firstRecord.value <= 10 ? '✅ YES' : '❌ NO');
      
      console.log('\n🎯 TOP 3 MARKETS:');
      result.data.records.slice(0, 3).forEach((record, i) => {
        console.log(`${i+1}. ${record.area_name}: ${record.value.toFixed(2)}/10 competitive advantage`);
      });
    }
    
    console.log('\n🎨 VISUALIZATION:');
    console.log('- Type:', result.visualization?.type);
    console.log('- Has Renderer:', !!result.visualization?.renderer);
    console.log('- Has Legend:', !!result.visualization?.legend?.items?.length);
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  // Exit the process
  process.exit(0);
}

testCompetitiveAnalysis();