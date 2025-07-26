// Simple Node.js test without external dependencies
const http = require('http');

console.log('=== TESTING STRATEGIC ANALYSIS API ===\n');

const postData = JSON.stringify({
  query: "Show me strategic markets for Nike expansion"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/claude/generate-response',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('📡 Sending request to http://localhost:3000/api/claude/generate-response');

const req = http.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      console.log('\n🎯 API Response Analysis:');
      console.log('  Response keys:', Object.keys(result || {}));
      
      if (result.visualizationData) {
        console.log('\n📊 Visualization Data:');
        console.log('  Type:', result.visualizationData.type);
        console.log('  Records count:', result.visualizationData.records?.length || 0);
        console.log('  Target Variable:', result.visualizationData.targetVariable);
        
        if (result.visualizationData.records?.length > 0) {
          const sample = result.visualizationData.records[0];
          console.log('  Sample record fields:', Object.keys(sample || {}));
          console.log('  Sample strategic_value_score:', sample?.strategic_value_score);
        }
      }
      
      if (result.visualizationResult) {
        console.log('\n🎨 Visualization Result:');
        console.log('  Renderer field:', result.visualizationResult.renderer?.field);
        console.log('  Config valueField:', result.visualizationResult.config?.valueField);
        console.log('  Class breaks:', result.visualizationResult.config?.classBreaks);
      }
      
      if (result.error) {
        console.log('\n❌ Error:', result.error);
      }
      
    } catch (e) {
      console.error('❌ Failed to parse JSON response');
      console.log('Raw response (first 500 chars):', data.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(postData);
req.end();