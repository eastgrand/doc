// Test the complete analysis flow
const fetch = require('node-fetch');

async function testStrategicQuery() {
  console.log('Testing strategic query flow...\n');
  
  // Step 1: Test endpoint selection
  console.log('1. Testing endpoint selection for strategic query...');
  const query = "Show me the top strategic markets for Nike expansion";
  
  // Simulate what ConfigurationManager would do
  const strategicKeywords = ['strategic', 'strategy', 'expansion', 'invest', 'investment', 'growth', 'opportunity', 'top markets', 'best markets', 'strategic markets', 'nike expansion', 'market expansion', 'strategic value', 'strategic opportunities'];
  
  const hasMatch = strategicKeywords.some(keyword => 
    query.toLowerCase().includes(keyword.toLowerCase())
  );
  
  console.log('- Query:', query);
  console.log('- Has strategic keyword match:', hasMatch);
  console.log('- Expected endpoint: /strategic-analysis');
  
  // Step 2: Test data loading
  console.log('\n2. Testing data loading...');
  try {
    const response = await fetch('http://localhost:3000/data/endpoints/strategic-analysis.json');
    if (response.ok) {
      const data = await response.json();
      console.log('- File loaded successfully');
      console.log('- Results count:', data.results?.length || 0);
      console.log('- Has strategic_value_score:', data.results?.[0]?.strategic_value_score !== undefined);
    } else {
      console.log('- Failed to load file:', response.status);
    }
  } catch (error) {
    console.log('- Error loading file:', error.message);
  }
  
  // Step 3: Test API endpoint
  console.log('\n3. Testing API endpoint...');
  try {
    const response = await fetch('http://localhost:3000/api/claude/generate-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    
    console.log('- API Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('- Success:', result.success);
      console.log('- Has data:', !!result.data);
      console.log('- Record count:', result.data?.records?.length || 0);
    } else {
      const text = await response.text();
      console.log('- Error response:', text.substring(0, 200));
    }
  } catch (error) {
    console.log('- API Error:', error.message);
  }
}

// Wait a bit for server to be ready
setTimeout(() => {
  testStrategicQuery().catch(console.error);
}, 3000);