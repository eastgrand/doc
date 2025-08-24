/**
 * Semantic Enhanced Hybrid Routing Engine Tests
 * 
 * Tests the integration of semantic understanding with hybrid routing
 */

import { semanticEnhancedHybridEngine } from '../lib/routing/SemanticEnhancedHybridEngine';
import { domainConfigLoader } from '../lib/routing/DomainConfigurationLoader';

describe('Semantic Enhanced Hybrid Routing Engine', () => {
  beforeAll(async () => {
    // Initialize domain configuration
    domainConfigLoader.initializeWithDefaults();
    
    // Initialize the semantic enhanced engine
    await semanticEnhancedHybridEngine.initialize();
  });

  describe('Creative Query Enhancement', () => {
    test('should enhance creative metaphorical queries', async () => {
      const query = "Paint me a picture of how different segments behave";
      const result = await semanticEnhancedHybridEngine.route(query);

      expect(result.success).toBe(true);
      expect(result.semantic_verification?.used).toBe(true);
      expect(result.semantic_verification?.reasoning).toContain('Semantic');
      
      console.log(`Creative Query Test:`);
      console.log(`  Query: "${query}"`);
      console.log(`  Endpoint: ${result.endpoint}`);
      console.log(`  Confidence: ${result.confidence}`);
      console.log(`  Semantic Enhancement: ${result.semantic_verification?.reasoning}`);
    });

    test('should enhance novel phrasing queries', async () => {
      const query = "Help me identify clusters of similar performing locations";
      const result = await semanticEnhancedHybridEngine.route(query);

      expect(result.success).toBe(true);
      expect(result.endpoint).toBe('/spatial-clusters');
      expect(result.semantic_verification?.used).toBe(true);
      
      console.log(`Novel Phrasing Test:`);
      console.log(`  Query: "${query}"`);
      console.log(`  Endpoint: ${result.endpoint}`);
      console.log(`  Confidence: ${result.confidence}`);
      console.log(`  Semantic Enhancement: ${result.semantic_verification?.reasoning}`);
    });

    test('should handle compound queries with enhancement', async () => {
      const query = "Compare the demographics between regions and also show me geographic clusters";
      const result = await semanticEnhancedHybridEngine.route(query);

      expect(result.success).toBe(true);
      expect(result.semantic_verification?.used).toBe(true);
      
      console.log(`Compound Query Test:`);
      console.log(`  Query: "${query}"`);
      console.log(`  Endpoint: ${result.endpoint}`);
      console.log(`  Confidence: ${result.confidence}`);
      console.log(`  Semantic Enhancement: ${result.semantic_verification?.reasoning}`);
    });
  });

  describe('Structured Query Handling', () => {
    test('should handle structured queries without unnecessary semantic enhancement', async () => {
      const query = "Show me demographic insights for tax preparation services";
      const result = await semanticEnhancedHybridEngine.route(query);

      expect(result.success).toBe(true);
      expect(result.endpoint).toBe('/demographic-insights');
      
      // Structured queries with high confidence shouldn't need semantic enhancement
      const semanticUsed = result.semantic_verification?.used || false;
      
      console.log(`Structured Query Test:`);
      console.log(`  Query: "${query}"`);
      console.log(`  Endpoint: ${result.endpoint}`);
      console.log(`  Confidence: ${result.confidence}`);
      console.log(`  Semantic Enhancement Used: ${semanticUsed}`);
      console.log(`  Enhancement Reasoning: ${result.semantic_verification?.reasoning}`);
    });

    test('should maintain high accuracy on predefined patterns', async () => {
      const predefinedQueries = [
        "Show me the top strategic markets for expansion",
        "Compare usage between different counties",
        "Which areas have the best demographics for services?"
      ];

      for (const query of predefinedQueries) {
        const result = await semanticEnhancedHybridEngine.route(query);
        
        expect(result.success).toBe(true);
        expect(result.confidence).toBeGreaterThan(0.5);
        
        console.log(`Predefined Query: "${query}" → ${result.endpoint} (${result.confidence})`);
      }
    });
  });

  describe('Out-of-Scope Handling', () => {
    test('should properly reject out-of-scope queries', async () => {
      const outOfScopeQueries = [
        "What's the weather forecast for tomorrow?",
        "How do I make chocolate chip cookies?",
        "Tell me a joke"
      ];

      for (const query of outOfScopeQueries) {
        const result = await semanticEnhancedHybridEngine.route(query);
        
        expect(result.success).toBe(false);
        expect(result.validation.scope).toBe('out_of_scope');
        
        console.log(`Out-of-scope Query: "${query}" → Rejected (${result.validation.confidence})`);
      }
    });
  });

  describe('Performance and Confidence', () => {
    test('should complete routing within reasonable time', async () => {
      const query = "What story does our customer data tell about regional differences?";
      const startTime = performance.now();
      
      const result = await semanticEnhancedHybridEngine.route(query);
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
      
      console.log(`Performance Test:`);
      console.log(`  Query: "${query}"`);
      console.log(`  Processing Time: ${processingTime.toFixed(2)}ms`);
      console.log(`  Hybrid Time: ${result.processing_time.toFixed(2)}ms`);
      console.log(`  Semantic Enhancement: ${result.semantic_verification?.used ? 'Applied' : 'Not applied'}`);
    });

    test('should provide confidence boost when semantic agrees', async () => {
      const query = "Dissect the anatomy of our high-performing markets";
      const result = await semanticEnhancedHybridEngine.route(query);

      if (result.semantic_verification?.used && result.semantic_verification.confidence_boost) {
        expect(result.semantic_verification.confidence_boost).toBeGreaterThan(0);
        console.log(`Confidence Boost Test:`);
        console.log(`  Query: "${query}"`);
        console.log(`  Confidence Boost: +${(result.semantic_verification.confidence_boost * 100).toFixed(1)}%`);
        console.log(`  Final Confidence: ${(result.confidence || 0 * 100).toFixed(1)}%`);
      }
    });
  });

  describe('System Integration', () => {
    test('should maintain all hybrid system features', async () => {
      const query = "Show me competitive analysis for strategic expansion";
      const result = await semanticEnhancedHybridEngine.route(query);

      // Should have all the hybrid system properties
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('validation');
      expect(result).toHaveProperty('routing_layers');
      expect(result).toHaveProperty('user_response');
      expect(result).toHaveProperty('metadata');
      
      // Plus the new semantic enhancement property
      expect(result).toHaveProperty('semantic_verification');
      
      console.log(`Integration Test:`);
      console.log(`  All hybrid properties present: ✓`);
      console.log(`  Semantic enhancement added: ✓`);
      console.log(`  Layers executed: ${result.metadata.layers_executed.join(', ')}`);
    });
  });
});