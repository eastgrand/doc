const { execSync } = require('child_process');

// Test the actual live strategic analysis issue
console.log('=== LIVE STRATEGIC ANALYSIS ISSUE TEST ===\n');

async function testLiveIssue() {
  try {
    // Start the dev server in background
    console.log('🚀 Starting dev server...');
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test strategic analysis API directly
    console.log('📡 Testing strategic analysis API...');
    
    const testPayload = {
      query: "Show me strategic markets for Nike expansion",
      analysisType: "strategic_analysis"
    };
    
    console.log('Test payload:', testPayload);
    
    // Make actual API call
    const fetch = require('node-fetch');
    
    try {
      const response = await fetch('http://localhost:3000/api/claude/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });
      
      if (!response.ok) {
        console.log('❌ API Response not OK:', response.status, response.statusText);
        return;
      }
      
      const result = await response.json();
      console.log('✅ API Response received');
      console.log('   Response keys:', Object.keys(result));
      
      if (result.visualizationData) {
        console.log('📊 Visualization data found:');
        console.log('   Type:', result.visualizationData.type);
        console.log('   Records:', result.visualizationData.records?.length || 0);
        console.log('   TargetVariable:', result.visualizationData.targetVariable);
        
        if (result.visualizationData.records && result.visualizationData.records.length > 0) {
          const sample = result.visualizationData.records[0];
          console.log('   Sample record keys:', Object.keys(sample));
          console.log('   Sample strategic_value_score:', sample.strategic_value_score);
        }
      }
      
      if (result.visualizationResult) {
        console.log('🎨 Visualization result found:');
        console.log('   Type:', result.visualizationResult.type);
        console.log('   Config valueField:', result.visualizationResult.config?.valueField);
        console.log('   Renderer field:', result.visualizationResult.renderer?.field);
        console.log('   Class breaks:', result.visualizationResult.config?.classBreaks);
      }
      
    } catch (fetchError) {
      console.log('❌ Fetch error:', fetchError.message);
      console.log('   Is dev server running on localhost:3000?');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Check if dev server is running
try {
  execSync('curl -s http://localhost:3000 > /dev/null');
  console.log('✅ Dev server is running');
  testLiveIssue();
} catch (error) {
  console.log('❌ Dev server not running. Start with: npm run dev');
  console.log('   Then run this test again');
}