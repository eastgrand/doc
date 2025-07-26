const https = require('https');

// Test the strategic analysis API directly
console.log('=== TESTING STRATEGIC ANALYSIS API DIRECTLY ===\n');

const testPayload = JSON.stringify({
  query: "Show me strategic markets for Nike expansion",
  analysisType: "strategic_analysis"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/claude/generate-response',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testPayload)
  }
};

console.log('📡 Making API call to:', `http://localhost:3000${options.path}`);
console.log('📋 Payload:', testPayload);

const req = https.request(options, (res) => {
  console.log(`✅ Response Status: ${res.statusCode}`);
  console.log(`📋 Response Headers:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('\n🎯 API Response Analysis:');
      console.log('Response keys:', Object.keys(result));
      
      if (result.visualizationData) {
        console.log('\n📊 Visualization Data:');
        console.log('  Type:', result.visualizationData.type);
        console.log('  Records:', result.visualizationData.records?.length || 0);
        console.log('  Target Variable:', result.visualizationData.targetVariable);
        
        if (result.visualizationData.records && result.visualizationData.records.length > 0) {
          const sample = result.visualizationData.records[0];
          console.log('  Sample record keys:', Object.keys(sample));
          console.log('  Sample strategic_value_score:', sample.strategic_value_score);
          console.log('  Sample value:', sample.value);
        }
      }
      
      if (result.visualizationResult) {
        console.log('\n🎨 Visualization Result:');
        console.log('  Type:', result.visualizationResult.type);
        console.log('  Config valueField:', result.visualizationResult.config?.valueField);
        console.log('  Renderer field:', result.visualizationResult.renderer?.field);
        console.log('  Class breaks count:', result.visualizationResult.config?.classBreaks?.length);
        console.log('  Class breaks:', result.visualizationResult.config?.classBreaks);
      }
      
      console.log('\n✅ Strategic analysis API test completed successfully!');
      
    } catch (parseError) {
      console.error('❌ Failed to parse response JSON:', parseError.message);
      console.log('Raw response:', data.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.write(testPayload);
req.end();