// Test competitive analysis routing
const { CachedEndpointRouter } = require('./lib/analysis/CachedEndpointRouter.ts');
const { ConfigurationManager } = require('./lib/analysis/ConfigurationManager.ts');

const configManager = new ConfigurationManager();
const router = new CachedEndpointRouter(configManager);

const competitiveQuery = "Compare Nike's market position against competitors";

console.log('Testing competitive analysis routing...');
console.log(`Query: "${competitiveQuery}"`);

const endpoint = router.routeQuery(competitiveQuery);
console.log(`Routed to: ${endpoint}`);

// Check configuration for this endpoint
const config = configManager.getEndpointConfig(endpoint);
console.log('Endpoint config:', {
  name: config?.name,
  defaultVisualization: config?.defaultVisualization,
  keywords: config?.keywords
});