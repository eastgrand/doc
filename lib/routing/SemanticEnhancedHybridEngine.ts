/**
 * Semantic Enhanced Hybrid Routing Engine
 * 
 * Combines the robust validation and structure of HybridRoutingEngine
 * with the semantic understanding power of SemanticRouter for optimal
 * query routing that handles both structured and creative queries.
 */

import { HybridRoutingEngine, HybridRoutingResult } from './HybridRoutingEngine';
import { semanticRouter } from '../analysis/SemanticRouter';
import { DatasetContext } from './types/ContextTypes';

export interface SemanticEnhancedResult extends HybridRoutingResult {
  semantic_verification?: {
    used: boolean;
    semantic_confidence?: number;
    semantic_endpoint?: string;
    confidence_boost?: number;
    reasoning: string;
  };
}

export class SemanticEnhancedHybridEngine {
  private hybridEngine: HybridRoutingEngine;
  private useSemanticEnhancement: boolean = true;
  private semanticThreshold: number = 0.3;
  
  constructor() {
    this.hybridEngine = new HybridRoutingEngine();
    this.initializeSemanticEnhancement();
  }

  /**
   * Initialize semantic enhancement asynchronously
   */
  private async initializeSemanticEnhancement(): Promise<void> {
    try {
      console.log('[SemanticEnhancedHybrid] Initializing semantic enhancement...');
      if (typeof window !== 'undefined') {
        // Browser environment - semantic router available
        await semanticRouter.initialize();
        console.log('[SemanticEnhancedHybrid] Semantic enhancement ready');
      } else {
        // Server environment - semantic router not available
        console.log('[SemanticEnhancedHybrid] Server environment - semantic enhancement disabled');
        this.useSemanticEnhancement = false;
      }
    } catch (error) {
      console.warn('[SemanticEnhancedHybrid] Failed to initialize semantic enhancement:', error);
      this.useSemanticEnhancement = false;
    }
  }

  /**
   * Route query using hybrid system with semantic enhancement
   */
  async route(
    query: string, 
    datasetContext?: DatasetContext
  ): Promise<SemanticEnhancedResult> {
    // Step 1: Use hybrid system for primary routing
    const hybridResult = await this.hybridEngine.route(query, datasetContext);
    
    // Initialize semantic verification
    const enhancedResult: SemanticEnhancedResult = {
      ...hybridResult,
      semantic_verification: {
        used: false,
        reasoning: 'Semantic enhancement not applied'
      }
    };

    // Step 2: Apply semantic enhancement if conditions are met
    if (this.shouldApplySemanticEnhancement(query, hybridResult)) {
      try {
        const semanticEnhancement = await this.applySemanticEnhancement(query, hybridResult);
        enhancedResult.semantic_verification = semanticEnhancement;
        
        // Apply confidence boost if semantic verification agrees
        if (semanticEnhancement.confidence_boost && semanticEnhancement.confidence_boost > 0) {
          enhancedResult.confidence = Math.min(1.0, 
            (enhancedResult.confidence || 0) + semanticEnhancement.confidence_boost
          );
        }
        
      } catch (error) {
        console.warn('[SemanticEnhancedHybrid] Semantic enhancement failed:', error);
        enhancedResult.semantic_verification = {
          used: true,
          reasoning: `Semantic enhancement failed: ${error}`
        };
      }
    }

    return enhancedResult;
  }

  /**
   * Determine if semantic enhancement should be applied
   */
  private shouldApplySemanticEnhancement(
    query: string, 
    hybridResult: HybridRoutingResult
  ): boolean {
    if (!this.useSemanticEnhancement) return false;
    if (!semanticRouter.isReady()) return false;
    
    // Apply semantic enhancement for:
    // 1. Creative/metaphorical queries
    // 2. Low confidence hybrid results
    // 3. Novel phrasing patterns
    // 4. Compound queries
    
    const isCreativeQuery = this.isCreativeQuery(query);
    const isLowConfidence = (hybridResult.confidence || 0) < 0.6;
    const isNovelPhrasing = this.hasNovelPhrasing(query);
    const isCompoundQuery = this.isCompoundQuery(query);
    
    return isCreativeQuery || isLowConfidence || isNovelPhrasing || isCompoundQuery;
  }

  /**
   * Apply semantic enhancement to improve routing confidence
   */
  private async applySemanticEnhancement(
    query: string, 
    hybridResult: HybridRoutingResult
  ): Promise<NonNullable<SemanticEnhancedResult['semantic_verification']>> {
    const semanticResult = await semanticRouter.route(query, {
      minConfidence: this.semanticThreshold,
      maxAlternatives: 2
    });

    const semanticEndpoint = semanticResult.endpoint;
    const semanticConfidence = semanticResult.confidence;
    
    // Check if semantic router agrees with hybrid result
    const endpointsMatch = hybridResult.endpoint === semanticEndpoint;
    const confidenceBoost = endpointsMatch ? 
      Math.min(0.2, semanticConfidence * 0.3) : // Boost if they agree
      0; // No boost if they disagree
    
    let reasoning: string;
    if (endpointsMatch) {
      reasoning = `Semantic router agrees: ${semanticEndpoint} (${(semanticConfidence * 100).toFixed(1)}% confidence)`;
    } else {
      reasoning = `Semantic router suggests different endpoint: ${semanticEndpoint} vs hybrid: ${hybridResult.endpoint}`;
    }

    return {
      used: true,
      semantic_confidence: semanticConfidence,
      semantic_endpoint: semanticEndpoint,
      confidence_boost: confidenceBoost,
      reasoning
    };
  }

  /**
   * Detect creative/metaphorical queries
   */
  private isCreativeQuery(query: string): boolean {
    const creativePatterns = [
      /story.*tell/i,
      /paint.*picture/i,
      /walk.*through/i,
      /dissect.*anatomy/i,
      /unpack.*dynamics/i,
      /decode.*pattern/i,
      /illuminate.*factor/i,
      /if.*could talk/i,
      /landscape of/i
    ];
    
    return creativePatterns.some(pattern => pattern.test(query));
  }

  /**
   * Detect novel phrasing patterns
   */
  private hasNovelPhrasing(query: string): boolean {
    const novelPatterns = [
      /what would happen if/i,
      /help me understand/i,
      /can you break down/i,
      /show me which/i,
      /tell me about/i,
      /i want to understand/i,
      /help me identify/i
    ];
    
    return novelPatterns.some(pattern => pattern.test(query));
  }

  /**
   * Detect compound queries with multiple intents
   */
  private isCompoundQuery(query: string): boolean {
    const compoundIndicators = [
      / and also /i,
      / but also /i,
      / combined with /i,
      / along with /i,
      / as well as /i,
      / plus /i,
      / additionally /i
    ];
    
    return compoundIndicators.some(indicator => indicator.test(query));
  }

  /**
   * Initialize the hybrid engine
   */
  async initialize(): Promise<void> {
    await this.hybridEngine.initialize();
    await this.initializeSemanticEnhancement();
  }
}

// Export singleton instance
export const semanticEnhancedHybridEngine = new SemanticEnhancedHybridEngine();