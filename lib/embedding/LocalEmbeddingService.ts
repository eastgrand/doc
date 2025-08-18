/**
 * LocalEmbeddingService - Local sentence transformer embeddings using ONNX.js
 * 
 * Provides semantic embeddings for query routing without external API calls.
 * Uses the all-MiniLM-L6-v2 model (22MB, 384-dimensional vectors).
 */

import { pipeline, env } from '@xenova/transformers';

// Configure transformers for browser environment
env.allowRemoteModels = true;
env.allowLocalModels = true;
env.backends.onnx.wasm.wasmPaths = '/static/onnx-wasm/';

interface EmbeddingResult {
  embedding: number[];
  processingTime: number;
}

interface EmbeddingCache {
  [text: string]: number[];
}

export class LocalEmbeddingService {
  private pipeline: any = null;
  private cache: EmbeddingCache = {};
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the embedding pipeline
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  private async _doInitialize(): Promise<void> {
    try {
      console.log('[LocalEmbeddingService] Initializing sentence transformer...');
      const startTime = performance.now();

      // Load the all-MiniLM-L6-v2 model
      this.pipeline = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
        {
          quantized: true, // Use quantized model for smaller size
          progress_callback: (progress: any) => {
            if (progress.status === 'downloading') {
              console.log(`[LocalEmbeddingService] Downloading: ${Math.round(progress.progress || 0)}%`);
            }
          }
        }
      );

      const endTime = performance.now();
      console.log(`[LocalEmbeddingService] Initialized in ${Math.round(endTime - startTime)}ms`);
      
      this.isInitialized = true;
    } catch (error) {
      console.error('[LocalEmbeddingService] Initialization failed:', error);
      this.initPromise = null;
      throw error;
    }
  }

  /**
   * Generate embedding for a text string
   */
  async embed(text: string): Promise<EmbeddingResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Check cache first
    if (this.cache[text]) {
      return {
        embedding: this.cache[text],
        processingTime: 0
      };
    }

    const startTime = performance.now();

    try {
      // Generate embedding
      const result = await this.pipeline(text, {
        pooling: 'mean',
        normalize: true
      });

      // Extract the embedding array
      const embedding = Array.from(result.data) as number[];

      // Cache the result
      this.cache[text] = embedding;

      const processingTime = performance.now() - startTime;

      return {
        embedding,
        processingTime
      };
    } catch (error) {
      console.error('[LocalEmbeddingService] Embedding generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts (batch processing)
   */
  async embedBatch(texts: string[]): Promise<{ [text: string]: number[] }> {
    const results: { [text: string]: number[] } = {};

    // Process in parallel for better performance
    const embeddingPromises = texts.map(async (text) => {
      const result = await this.embed(text);
      return { text, embedding: result.embedding };
    });

    const embeddings = await Promise.all(embeddingPromises);

    for (const { text, embedding } of embeddings) {
      results[text] = embedding;
    }

    return results;
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Get cached embedding count
   */
  getCacheSize(): number {
    return Object.keys(this.cache).length;
  }

  /**
   * Clear the embedding cache
   */
  clearCache(): void {
    this.cache = {};
  }

  /**
   * Check if the service is ready to use
   */
  isReady(): boolean {
    return this.isInitialized && this.pipeline !== null;
  }
}

// Export singleton instance
export const localEmbeddingService = new LocalEmbeddingService();