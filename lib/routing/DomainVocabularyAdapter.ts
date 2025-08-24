/**
 * Domain Vocabulary Adapter
 * 
 * Maps generic intents to domain-specific contexts without hardcoding
 */

import { 
  DomainConfiguration, 
  EnhancedQuery, 
  EndpointCandidate, 
  DomainAdaptationResult 
} from './types/DomainTypes';
import { IntentClassification } from './types/BaseIntentTypes';

export class DomainVocabularyAdapter {
  /**
   * Enhance query with domain-specific vocabulary and context
   */
  enhanceQuery(
    query: string, 
    baseIntent: IntentClassification, 
    domain: DomainConfiguration
  ): EnhancedQuery {
    const startTime = performance.now();
    
    // Step 1: Replace domain-specific terms with generic equivalents
    const normalizedQuery = this.normalizeToGeneric(query, domain);
    
    // Step 2: Expand synonyms and variations
    const expandedTerms = this.expandSynonyms(normalizedQuery, domain.synonyms);
    
    // Step 3: Map entities to domain context
    const entityContext = this.mapEntitiesToDomain(expandedTerms, domain.vocabulary.entities);
    
    // Step 4: Apply domain-specific boosting
    const domainRelevance = this.calculateDomainRelevance(query, domain.vocabulary.domain_terms);
    
    const endTime = performance.now();
    
    return {
      original_query: query,
      normalized_query: normalizedQuery,
      expanded_terms: expandedTerms,
      entity_context: entityContext,
      domain_relevance: domainRelevance,
      base_intent: baseIntent,
      processing_metadata: {
        processing_time: endTime - startTime,
        applied_synonyms: this.getAppliedSynonyms(query, normalizedQuery),
        expanded_entities: this.getExpandedEntities(entityContext),
        relevance_factors: this.getRelevanceFactors(query, domain)
      }
    };
  }

  /**
   * Generate endpoint candidates based on enhanced query
   */
  generateCandidates(
    enhancedQuery: EnhancedQuery, 
    domain: DomainConfiguration
  ): EndpointCandidate[] {
    const candidates: EndpointCandidate[] = [];
    
    for (const [endpoint, config] of Object.entries(domain.endpoint_mappings)) {
      const candidate = this.scoreEndpointCandidate(
        endpoint, 
        config, 
        enhancedQuery, 
        domain
      );
      candidates.push(candidate);
    }
    
    return candidates.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Apply avoidance filters to prevent cross-contamination
   */
  applyAvoidanceFilters(
    candidates: EndpointCandidate[], 
    domain: DomainConfiguration
  ): EndpointCandidate[] {
    return candidates.map(candidate => {
      const avoidTerms = domain.avoid_terms[candidate.endpoint] || [];
      const penaltyScore = this.calculateAvoidancePenalty(
        candidate.reasoning.join(' '), 
        avoidTerms
      );
      
      if (penaltyScore > 0) {
        return {
          ...candidate,
          confidence: candidate.confidence * (1 - penaltyScore),
          penalties: [
            ...(candidate.penalties || []),
            {
              type: 'avoidance',
              score: penaltyScore,
              reason: `Avoidance terms matched: ${avoidTerms.filter(term => 
                candidate.reasoning.join(' ').toLowerCase().includes(term.toLowerCase())
              ).join(', ')}`
            }
          ]
        };
      }
      
      return candidate;
    });
  }

  /**
   * Perform complete domain adaptation
   */
  adaptToDomain(
    query: string,
    baseIntent: IntentClassification,
    domain: DomainConfiguration
  ): DomainAdaptationResult {
    // Enhance query with domain context
    const enhancedQuery = this.enhanceQuery(query, baseIntent, domain);
    
    // Generate initial candidates
    let candidates = this.generateCandidates(enhancedQuery, domain);
    
    // Apply avoidance filters
    candidates = this.applyAvoidanceFilters(candidates, domain);
    
    // Calculate overall domain confidence
    const domainConfidence = this.calculateOverallDomainConfidence(
      enhancedQuery, 
      candidates, 
      domain
    );
    
    return {
      enhanced_query: enhancedQuery,
      candidates: candidates,
      domain_confidence: domainConfidence,
      adaptation_metadata: {
        synonyms_applied: enhancedQuery.processing_metadata.applied_synonyms.length,
        entities_expanded: enhancedQuery.processing_metadata.expanded_entities.length,
        domain_terms_matched: this.countDomainTermMatches(query, domain),
        avoidance_penalties: candidates.filter(c => c.penalties && c.penalties.length > 0).length
      }
    };
  }

  /**
   * Normalize query by replacing domain-specific terms with generic ones
   */
  private normalizeToGeneric(query: string, domain: DomainConfiguration): string {
    let normalized = query.toLowerCase();
    
    // Replace domain-specific terms with generic equivalents
    const allDomainTerms = [
      ...domain.vocabulary.domain_terms.primary,
      ...domain.vocabulary.domain_terms.secondary,
      ...domain.vocabulary.domain_terms.context
    ];
    
    for (const term of allDomainTerms) {
      // Replace domain terms with generic "business" or "service"
      const genericReplacement = this.getGenericReplacement(term);
      normalized = normalized.replace(new RegExp(`\\b${term}\\b`, 'gi'), genericReplacement);
    }
    
    return normalized;
  }

  /**
   * Get generic replacement for domain-specific term
   */
  private getGenericReplacement(term: string): string {
    const genericMap: { [key: string]: string } = {
      'tax': 'business',
      'preparation': 'service',
      'filing': 'process',
      'return': 'document',
      'refund': 'outcome',
      'season': 'period',
      'deadline': 'timeline',
      'audit': 'review',
      'software': 'product',
      'professional': 'service',
      'diy': 'self-service'
    };
    
    return genericMap[term.toLowerCase()] || 'service';
  }

  /**
   * Expand synonyms in query
   */
  private expandSynonyms(query: string, synonyms: { [key: string]: string[] }): string[] {
    const terms = query.toLowerCase().split(/\s+/);
    const expandedTerms = new Set(terms);
    
    for (const [key, synonymList] of Object.entries(synonyms)) {
      if (query.toLowerCase().includes(key.toLowerCase())) {
        synonymList.forEach(synonym => {
          expandedTerms.add(synonym.toLowerCase());
        });
      }
    }
    
    return Array.from(expandedTerms);
  }

  /**
   * Map entities to domain context
   */
  private mapEntitiesToDomain(
    expandedTerms: string[], 
    entities: any
  ): { [entityType: string]: string[] } {
    const entityContext: { [entityType: string]: string[] } = {};
    
    for (const [entityType, entityTerms] of Object.entries(entities)) {
      const matchedTerms = expandedTerms.filter(term => 
        (entityTerms as string[]).some(entityTerm => 
          term.includes(entityTerm.toLowerCase()) || 
          entityTerm.toLowerCase().includes(term)
        )
      );
      
      if (matchedTerms.length > 0) {
        entityContext[entityType] = matchedTerms;
      }
    }
    
    return entityContext;
  }

  /**
   * Calculate domain relevance score
   */
  private calculateDomainRelevance(
    query: string, 
    domainTerms: { primary: string[], secondary: string[], context: string[] }
  ): number {
    const queryLower = query.toLowerCase();
    let relevanceScore = 0;
    let matchedTerms: string[] = [];
    
    // Primary terms (highest weight)
    for (const term of domainTerms.primary) {
      if (queryLower.includes(term.toLowerCase())) {
        relevanceScore += 0.4;
        matchedTerms.push(`primary:${term}`);
      }
    }
    
    // Secondary terms (medium weight)
    for (const term of domainTerms.secondary) {
      if (queryLower.includes(term.toLowerCase())) {
        relevanceScore += 0.3;
        matchedTerms.push(`secondary:${term}`);
      }
    }
    
    // Context terms (lower weight)
    for (const term of domainTerms.context) {
      if (queryLower.includes(term.toLowerCase())) {
        relevanceScore += 0.2;
        matchedTerms.push(`context:${term}`);
      }
    }
    
    // Return raw score (0.0-1.0+ range) instead of normalized by term count
    return Math.min(1.0, relevanceScore);
  }

  /**
   * Score an endpoint candidate
   */
  private scoreEndpointCandidate(
    endpoint: string,
    config: any,
    enhancedQuery: EnhancedQuery,
    _domain: DomainConfiguration
  ): EndpointCandidate {
    let baseScore = 0;
    const reasoning: string[] = [];
    const boosts: Array<{ type: string; score: number; reason: string }> = [];
    
    // Score based on base intent match
    if (config.primary_intents.includes(enhancedQuery.base_intent.primary_intent)) {
      const intentBonus = 0.5;
      baseScore += intentBonus;
      reasoning.push(`Primary intent match: ${enhancedQuery.base_intent.primary_intent}`);
      boosts.push({
        type: 'intent_match',
        score: intentBonus,
        reason: 'Primary intent alignment'
      });
    }
    
    // Score based on boost terms
    const queryText = enhancedQuery.expanded_terms.join(' ');
    const boostMatches = config.boost_terms.filter((term: string) =>
      queryText.includes(term.toLowerCase())
    );
    
    if (boostMatches.length > 0) {
      const boostScore = boostMatches.length * 0.2;
      baseScore += boostScore;
      reasoning.push(`Boost terms: ${boostMatches.join(', ')}`);
      boosts.push({
        type: 'boost_terms',
        score: boostScore,
        reason: `Matched ${boostMatches.length} boost terms`
      });
    }
    
    // Penalty for penalty terms
    const penalties: Array<{ type: string; score: number; reason: string }> = [];
    const penaltyMatches = config.penalty_terms.filter((term: string) =>
      queryText.includes(term.toLowerCase())
    );
    
    if (penaltyMatches.length > 0) {
      const penaltyScore = penaltyMatches.length * 0.15;
      baseScore -= penaltyScore;
      reasoning.push(`Penalty terms: ${penaltyMatches.join(', ')}`);
      penalties.push({
        type: 'penalty_terms',
        score: penaltyScore,
        reason: `Matched ${penaltyMatches.length} penalty terms`
      });
    }
    
    // Domain relevance bonus
    if (enhancedQuery.domain_relevance > 0.3) {
      const domainBonus = enhancedQuery.domain_relevance * 0.2;
      baseScore += domainBonus;
      reasoning.push(`Domain relevance: ${(enhancedQuery.domain_relevance * 100).toFixed(1)}%`);
      boosts.push({
        type: 'domain_relevance',
        score: domainBonus,
        reason: 'High domain relevance'
      });
    }
    
    // Ensure score doesn't go below 0
    const confidence = Math.max(0, baseScore);
    
    return {
      endpoint,
      confidence,
      base_score: baseScore,
      reasoning,
      boosts: boosts.length > 0 ? boosts : undefined,
      penalties: penalties.length > 0 ? penalties : undefined
    };
  }

  /**
   * Calculate avoidance penalty
   */
  private calculateAvoidancePenalty(reasoning: string, avoidTerms: string[]): number {
    if (avoidTerms.length === 0) return 0;
    
    const matchedTerms = avoidTerms.filter(term =>
      reasoning.toLowerCase().includes(term.toLowerCase())
    );
    
    return matchedTerms.length > 0 ? Math.min(0.3, matchedTerms.length * 0.1) : 0;
  }

  /**
   * Calculate overall domain confidence
   */
  private calculateOverallDomainConfidence(
    enhancedQuery: EnhancedQuery,
    candidates: EndpointCandidate[],
    _domain: DomainConfiguration
  ): number {
    const topCandidate = candidates[0];
    const domainRelevance = enhancedQuery.domain_relevance;
    const intentConfidence = enhancedQuery.base_intent.confidence;
    const candidateConfidence = topCandidate ? topCandidate.confidence : 0;
    
    return (domainRelevance * 0.3 + intentConfidence * 0.3 + candidateConfidence * 0.4);
  }

  /**
   * Get applied synonyms for metadata
   */
  private getAppliedSynonyms(original: string, normalized: string): string[] {
    if (original.toLowerCase() === normalized.toLowerCase()) {
      return [];
    }
    return ['synonyms_applied']; // Simplified for now
  }

  /**
   * Get expanded entities for metadata
   */
  private getExpandedEntities(entityContext: { [entityType: string]: string[] }): string[] {
    return Object.keys(entityContext);
  }

  /**
   * Get relevance factors for metadata
   */
  private getRelevanceFactors(query: string, domain: DomainConfiguration): string[] {
    const factors: string[] = [];
    const queryLower = query.toLowerCase();
    
    // Check for domain term categories
    if (domain.vocabulary.domain_terms.primary.some(term => queryLower.includes(term.toLowerCase()))) {
      factors.push('primary_domain_terms');
    }
    
    if (domain.vocabulary.domain_terms.secondary.some(term => queryLower.includes(term.toLowerCase()))) {
      factors.push('secondary_domain_terms');
    }
    
    if (domain.vocabulary.domain_terms.context.some(term => queryLower.includes(term.toLowerCase()))) {
      factors.push('context_terms');
    }
    
    return factors;
  }

  /**
   * Count domain term matches for metadata
   */
  private countDomainTermMatches(query: string, domain: DomainConfiguration): number {
    const queryLower = query.toLowerCase();
    const allTerms = [
      ...domain.vocabulary.domain_terms.primary,
      ...domain.vocabulary.domain_terms.secondary,
      ...domain.vocabulary.domain_terms.context
    ];
    
    return allTerms.filter(term => queryLower.includes(term.toLowerCase())).length;
  }

  /**
   * Debug method to show adaptation process
   */
  debugAdaptation(
    query: string,
    baseIntent: IntentClassification,
    domain: DomainConfiguration
  ): any {
    const result = this.adaptToDomain(query, baseIntent, domain);
    
    return {
      input: {
        query,
        base_intent: baseIntent.primary_intent,
        intent_confidence: baseIntent.confidence
      },
      processing: {
        normalized_query: result.enhanced_query.normalized_query,
        expanded_terms: result.enhanced_query.expanded_terms,
        entity_context: result.enhanced_query.entity_context,
        domain_relevance: result.enhanced_query.domain_relevance
      },
      candidates: result.candidates.map(c => ({
        endpoint: c.endpoint,
        confidence: c.confidence,
        reasoning: c.reasoning,
        boosts: c.boosts?.length || 0,
        penalties: c.penalties?.length || 0
      })),
      metadata: result.adaptation_metadata
    };
  }
}