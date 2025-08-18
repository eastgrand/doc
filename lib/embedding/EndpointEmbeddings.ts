/**
 * EndpointEmbeddings - Pre-computed embeddings for semantic routing
 * 
 * Manages pre-computed endpoint embeddings and provides efficient similarity search
 * for routing user queries to the most appropriate analysis endpoint.
 */

import { localEmbeddingService } from './LocalEmbeddingService';
import { VectorUtils, VectorIndex, SimilarityResult } from './VectorUtils';
import { ENDPOINT_DESCRIPTIONS, EndpointDescription } from './EndpointDescriptions';

interface EndpointEmbedding {
  endpoint: string;
  embedding: number[];
  description: EndpointDescription;
  computedAt: number;
}

interface EmbeddingIndex {
  [endpoint: string]: EndpointEmbedding;
}

export class EndpointEmbeddings {
  private embeddingIndex: EmbeddingIndex = {};
  private vectorIndex: VectorIndex = {};
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the endpoint embeddings
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  private async _doInitialize(): Promise<void> {
    try {
      console.log('[EndpointEmbeddings] Initializing endpoint embeddings...');
      const startTime = performance.now();

      // First initialize the embedding service
      await localEmbeddingService.initialize();

      // Generate embeddings for all endpoints
      await this.generateEndpointEmbeddings();

      const endTime = performance.now();
      console.log(`[EndpointEmbeddings] Initialized ${Object.keys(this.embeddingIndex).length} endpoint embeddings in ${Math.round(endTime - startTime)}ms`);
      
      this.isInitialized = true;
    } catch (error) {
      console.error('[EndpointEmbeddings] Initialization failed:', error);
      this.initPromise = null;
      throw error;
    }
  }

  /**
   * Generate embeddings for all endpoint descriptions
   */
  private async generateEndpointEmbeddings(): Promise<void> {
    const endpoints = Object.keys(ENDPOINT_DESCRIPTIONS);
    console.log(`[EndpointEmbeddings] Generating embeddings for ${endpoints.length} endpoints...`);

    for (const endpoint of endpoints) {
      const description = ENDPOINT_DESCRIPTIONS[endpoint];
      
      // Create rich text for embedding that includes all semantic information
      const embeddingText = this.createEmbeddingText(description);
      
      // Generate embedding
      const result = await localEmbeddingService.embed(embeddingText);
      
      // Store in index
      this.embeddingIndex[endpoint] = {
        endpoint,
        embedding: result.embedding,
        description,
        computedAt: Date.now()
      };

      // Also store in vector index for similarity search
      this.vectorIndex[endpoint] = {
        vector: result.embedding,
        metadata: {
          endpoint,
          title: description.title,
          description: description.description
        }
      };

      console.log(`[EndpointEmbeddings] Generated embedding for ${endpoint} (${result.processingTime.toFixed(1)}ms)`);
    }
  }

  /**
   * Create rich text for embedding that captures all semantic information
   */
  private createEmbeddingText(description: EndpointDescription): string {
    const parts = [
      // Main description
      description.description,
      
      // Title and business context
      description.title,
      description.businessContext,
      
      // Sample queries (most important for matching user intent)
      ...description.sampleQueries,
      
      // Use cases and concepts
      description.useCases.join(' '),
      description.semanticConcepts.join(' '),
      
      // Keywords
      description.keywords.join(' ')
    ];

    return parts.join('. ');
  }

  /**
   * Find the best matching endpoint for a user query
   */
  async findBestEndpoint(
    userQuery: string,
    topK: number = 3,
    threshold: number = 0.3
  ): Promise<SimilarityResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Generate embedding for user query
    const queryResult = await localEmbeddingService.embed(userQuery);
    
    // Find most similar endpoints
    const results = VectorUtils.findMostSimilar(
      queryResult.embedding,
      this.vectorIndex,
      topK,
      threshold
    );

    // Add additional metadata
    return results.map(result => ({
      ...result,
      metadata: {
        ...result.metadata,
        description: this.embeddingIndex[result.id]?.description,
        processingTime: queryResult.processingTime
      }
    }));
  }

  /**
   * Get embedding for a specific endpoint
   */
  getEndpointEmbedding(endpoint: string): EndpointEmbedding | null {
    return this.embeddingIndex[endpoint] || null;
  }

  /**
   * Get all endpoint embeddings
   */
  getAllEmbeddings(): EmbeddingIndex {
    return { ...this.embeddingIndex };
  }

  /**
   * Calculate similarity matrix between all endpoints
   */
  getEndpointSimilarityMatrix(): { [endpoint1: string]: { [endpoint2: string]: number } } {
    const vectors: { [endpoint: string]: number[] } = {};
    
    for (const [endpoint, embedding] of Object.entries(this.embeddingIndex)) {
      vectors[endpoint] = embedding.embedding;
    }

    return VectorUtils.calculateSimilarityMatrix(vectors);
  }

  /**
   * Find endpoints similar to a given endpoint
   */
  findSimilarEndpoints(
    targetEndpoint: string,
    topK: number = 5,
    threshold: number = 0.5
  ): SimilarityResult[] {
    const targetEmbedding = this.embeddingIndex[targetEndpoint];
    if (!targetEmbedding) {
      throw new Error(`Endpoint ${targetEndpoint} not found`);
    }

    return VectorUtils.findMostSimilar(
      targetEmbedding.embedding,
      this.vectorIndex,
      topK + 1, // +1 to exclude self
      threshold
    ).filter(result => result.id !== targetEndpoint); // Remove self from results
  }

  /**
   * Analyze embedding quality and statistics
   */
  analyzeEmbeddingQuality(): {
    endpointCount: number;
    averageSimilarity: number;
    dimensionality: number;
    qualityMetrics: any;
  } {
    const vectors: { [endpoint: string]: number[] } = {};
    
    for (const [endpoint, embedding] of Object.entries(this.embeddingIndex)) {
      vectors[endpoint] = embedding.embedding;
    }

    const qualityMetrics = VectorUtils.analyzeVectorQuality(vectors);

    return {
      endpointCount: Object.keys(this.embeddingIndex).length,
      averageSimilarity: qualityMetrics.averageSimilarity,
      dimensionality: qualityMetrics.dimensionality,
      qualityMetrics
    };
  }

  /**
   * Test semantic routing with example queries
   */
  async testRouting(testQueries: string[]): Promise<{
    query: string;
    topMatches: SimilarityResult[];
    processingTime: number;
  }[]> {
    const results = [];

    for (const query of testQueries) {
      const startTime = performance.now();
      const matches = await this.findBestEndpoint(query, 3, 0.1);
      const processingTime = performance.now() - startTime;

      results.push({
        query,
        topMatches: matches,
        processingTime
      });
    }

    return results;
  }

  /**
   * Export embeddings to JSON for caching
   */
  exportEmbeddings(): string {
    return JSON.stringify({
      embeddings: this.embeddingIndex,
      generatedAt: Date.now(),
      version: '1.0'
    });
  }

  /**
   * Import embeddings from JSON cache
   */
  importEmbeddings(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      this.embeddingIndex = data.embeddings;
      
      // Rebuild vector index
      this.vectorIndex = {};
      for (const [endpoint, embedding] of Object.entries(this.embeddingIndex)) {
        const embeddingData = embedding as EndpointEmbedding;
        this.vectorIndex[endpoint] = {
          vector: embeddingData.embedding,
          metadata: {
            endpoint,
            title: embeddingData.description.title,
            description: embeddingData.description.description
          }
        };
      }

      this.isInitialized = true;
      console.log(`[EndpointEmbeddings] Imported ${Object.keys(this.embeddingIndex).length} cached embeddings`);
    } catch (error) {
      console.error('[EndpointEmbeddings] Failed to import embeddings:', error);
      throw error;
    }
  }

  /**
   * Check if embeddings are ready
   */
  isReady(): boolean {
    return this.isInitialized && Object.keys(this.embeddingIndex).length > 0;
  }
}

// Export singleton instance
export const endpointEmbeddings = new EndpointEmbeddings();