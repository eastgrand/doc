// Test if the StrategicAnalysisProcessor is actually being used
const fs = require('fs');

console.log('=== Testing Processor Registration ===\n');

// Simulate the DataProcessor logic
class MockDataProcessor {
  constructor() {
    this.processors = new Map();
    this.initializeProcessors();
  }

  initializeProcessors() {
    // Mock the key processors
    this.processors.set('/analyze', { name: 'CoreAnalysisProcessor' });
    this.processors.set('/strategic-analysis', { name: 'StrategicAnalysisProcessor' });
    this.processors.set('/competitive-analysis', { name: 'CompetitiveDataProcessor' });
    this.processors.set('/spatial-clusters', { name: 'ClusterDataProcessor' });
    this.processors.set('default', { name: 'CoreAnalysisProcessor' });
  }

  getProcessorForEndpoint(endpoint) {
    console.log(`getProcessorForEndpoint called with: "${endpoint}"`);
    console.log('Available processors:', Array.from(this.processors.keys()));
    
    // SPECIFIC FIX: Only force CompetitiveDataProcessor for competitive analysis endpoints
    if (endpoint.includes('competitive') || endpoint === '/competitive-analysis') {
      const competitiveProcessor = this.processors.get('/competitive-analysis');
      console.log(`FORCING CompetitiveDataProcessor for ${endpoint}`);
      return competitiveProcessor;
    }
    
    // Try to get specific processor for endpoint
    if (this.processors.has(endpoint)) {
      const processor = this.processors.get(endpoint);
      console.log(`Found specific processor for ${endpoint}:`, processor.name);
      return processor;
    }
    
    // Fallback to default processor
    console.log(`No specific processor found for ${endpoint}, using default processor`);
    return this.processors.get('default');
  }
}

const processor = new MockDataProcessor();

// Test strategic analysis routing
console.log('1. Testing strategic analysis routing:');
const strategicProcessor = processor.getProcessorForEndpoint('/strategic-analysis');
console.log('Selected processor:', strategicProcessor.name);
console.log('');

// Test if there could be any routing confusion
console.log('2. Testing potential routing conflicts:');
const testEndpoints = ['/strategic-analysis', '/analyze', '/competitive-analysis'];

testEndpoints.forEach(endpoint => {
  const selected = processor.getProcessorForEndpoint(endpoint);
  console.log(`${endpoint} -> ${selected.name}`);
});

console.log('\n3. Check if StrategicAnalysisProcessor file exists:');
const strategicProcessorPath = './lib/analysis/strategies/processors/StrategicAnalysisProcessor.ts';
try {
  const exists = fs.existsSync(strategicProcessorPath);
  console.log(`${strategicProcessorPath} exists:`, exists);
  
  if (exists) {
    const content = fs.readFileSync(strategicProcessorPath, 'utf8');
    const hasCorrectType = content.includes("type: 'strategic_analysis'");
    const hasCorrectSource = content.includes("score_source: 'strategic_value_score'");
    console.log('Has correct type:', hasCorrectType);
    console.log('Has correct score_source:', hasCorrectSource);
  }
} catch (error) {
  console.log('Error checking file:', error.message);
}

console.log('\n=== Potential Issues ===');
console.log('If routing is correct but Claude still shows 79.3, the issue might be:');
console.log('1. Browser/UI caching old data');
console.log('2. The UI is not properly reloading after processor changes');
console.log('3. There\'s a mismatch between the endpoint being requested vs processed');
console.log('4. Claude is receiving correct data but choosing to round in its response');