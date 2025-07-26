// Test endpoint routing for different queries
const fs = require('fs');
const path = require('path');

// Mock minimal ConfigurationManager
class ConfigurationManager {
  constructor() {
    this.endpoints = [
      {
        id: '/analyze',
        name: 'General Analysis',
        keywords: ['analyze', 'analysis', 'show', 'find', 'identify', 'display']
      },
      {
        id: '/competitive-analysis',
        name: 'Competitive Analysis',
        keywords: ['competitive', 'competition', 'compete', 'brand', 'nike', 'adidas', 'market share', 'versus', 'vs']
      },
      {
        id: '/strategic-analysis', 
        name: 'Strategic Analysis',
        keywords: ['strategic', 'strategy', 'expansion', 'opportunity', 'potential', 'growth']
      },
      {
        id: '/spatial-clusters',
        name: 'Spatial Clustering',
        keywords: ['cluster', 'clustering', 'similar', 'spatial', 'geographic', 'region', 'area']
      }
    ];
  }
  
  getEndpointConfigurations() {
    return this.endpoints;
  }
}

// Simplified endpoint selection logic
function selectEndpoint(query) {
  const configManager = new ConfigurationManager();
  const lowerQuery = query.toLowerCase();
  const endpoints = configManager.getEndpointConfigurations();
  
  let bestMatch = { endpoint: '/analyze', score: 0 };
  
  for (const config of endpoints) {
    let score = 0;
    
    // Check keyword matches
    for (const keyword of config.keywords) {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    
    // Boost score for exact matches
    if (config.keywords.some(keyword => lowerQuery === keyword.toLowerCase())) {
      score += 2;
    }
    
    console.log(`  ${config.id}: score=${score} (matched keywords: ${config.keywords.filter(k => lowerQuery.includes(k.toLowerCase())).join(', ')})`);
    
    if (score > bestMatch.score) {
      bestMatch = { endpoint: config.id, score };
    }
  }
  
  return bestMatch.endpoint;
}

// Test queries
const testQueries = [
  "Show me the top strategic markets for Nike expansion",
  "analyze nike markets", 
  "competitive analysis of nike and adidas",
  "identify spatial clusters for nike"
];

console.log('=== Testing Endpoint Routing ===\n');

for (const query of testQueries) {
  console.log(`Query: "${query}"`);
  const endpoint = selectEndpoint(query);
  console.log(`→ Selected endpoint: ${endpoint}\n`);
}