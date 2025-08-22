/**
 * Debug AI/ML routing issues
 */

import { EnhancedQueryAnalyzer } from './lib/analysis/EnhancedQueryAnalyzer';

const analyzer = new EnhancedQueryAnalyzer();

// Test failing AI/ML queries
const testQueries = [
  "What are the most important factors predicting H&R Block online usage?",
  "How accurate are our predictions for tax service market performance?", 
  "Which AI model performs best for predicting tax service usage in each area?",
  "Show me the highest confidence predictions using our best ensemble model",
  "What is the optimal AI algorithm for predictions in each geographic area?"
];

console.log('🔍 Testing AI/ML Routing Issues...\n');

for (const query of testQueries) {
  console.log(`\n📝 Query: "${query}"`);
  console.log('─'.repeat(80));
  
  const scores = analyzer.analyzeQuery(query);
  const bestEndpoint = analyzer.getBestEndpoint(query);
  
  console.log(`🎯 Best Endpoint: ${bestEndpoint}\n`);
  
  console.log('📊 Top 3 Endpoint Scores:');
  scores.slice(0, 3).forEach((score, i) => {
    console.log(`  ${i + 1}. ${score.endpoint}: ${score.score.toFixed(1)} - ${score.reasons.join('; ')}`);
  });
  
  console.log('\n' + '═'.repeat(40));
}