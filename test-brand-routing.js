// Test script to verify brand difference routing fix
import { EnhancedQueryAnalyzer } from './lib/analysis/EnhancedQueryAnalyzer.js';

const analyzer = new EnhancedQueryAnalyzer();

const testQuery = "Show me the market share difference between H&R Block and TurboTax";

console.log('Testing query:', testQuery);
console.log('---');

const results = analyzer.analyzeQuery(testQuery);

// Sort by score to see the best match
const sorted = results.sort((a, b) => b.score - a.score);

console.log('Top 3 endpoint scores:');
sorted.slice(0, 3).forEach((result, index) => {
  console.log(`${index + 1}. ${result.endpoint}: ${result.score}`);
  console.log(`   Reasons: ${result.reasons.join('; ')}`);
});

console.log('---');
const bestEndpoint = sorted[0].endpoint;
console.log('Selected endpoint:', bestEndpoint);
console.log('Expected endpoint: /brand-difference');
console.log('PASS:', bestEndpoint === '/brand-difference' ? '✅' : '❌');