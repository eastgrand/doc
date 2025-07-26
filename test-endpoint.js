const query = "Show me the top strategic markets for Nike expansion";

// Test endpoint detection
const endpointKeywords = {
  '/analyze': ['analyze', 'strategic', 'strategy', 'expansion', 'top markets', 'show me'],
  '/competitive-analysis': ['compete', 'competition', 'competitive', 'vs', 'versus']
};

function detectEndpoint(query) {
  const lowerQuery = query.toLowerCase();
  let bestMatch = null;
  let maxMatches = 0;
  
  for (const [endpoint, keywords] of Object.entries(endpointKeywords)) {
    const matches = keywords.filter(keyword => lowerQuery.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = endpoint;
    }
  }
  
  return bestMatch;
}

const detectedEndpoint = detectEndpoint(query);
console.log(`Query: "${query}"`);
console.log(`Detected endpoint: ${detectedEndpoint}`);

const analyzeMatches = endpointKeywords['/analyze'].filter(keyword => 
  query.toLowerCase().includes(keyword)
);
console.log('Keywords matched for /analyze:', analyzeMatches);