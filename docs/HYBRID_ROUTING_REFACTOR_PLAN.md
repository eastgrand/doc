# Hybrid Routing Architecture Refactor Plan

## Overview

This document outlines a comprehensive plan to refactor the current query-to-visualization routing system into a hybrid architecture that combines the best aspects of intent-based routing, domain-specific optimization, and robust fallback mechanisms. This approach is designed to maintain 100% accuracy for predefined queries while providing flexibility for open-ended questions and cross-domain portability.

## Current System Analysis

### Achievements
- **100% accuracy** for predefined queries in tax service domain
- **Fast routing** with deterministic keyword matching (<6ms average)
- **Comprehensive coverage** of 22+ analysis endpoints
- **Robust keyword scoring** with sophisticated weighting

### Critical Limitations
- **Domain over-fitting**: Hardcoded "tax preparation services", "H&R Block", "for tax preparation"
- **Vocabulary brittleness**: Fails when phrasing changes ("demographics" vs "demographic data")
- **Maintenance complexity**: Each domain requires extensive keyword re-engineering
- **Open-ended query limitations**: Struggles with novel phrasings and compound questions
- **Cross-contamination**: Keywords leak between endpoints (customer-profile vs demographic-insights)

## Hybrid Architecture Design

### Four-Layer Routing System

The hybrid approach uses four complementary layers that work together to provide both precision and flexibility:

```typescript
interface HybridRoutingSystem {
  layers: {
    baseIntent: BaseIntentLayer      // Domain-agnostic intent recognition
    domainVocab: DomainVocabLayer    // Configurable domain-specific terms
    contextEnhancement: ContextLayer // Dataset-aware context boosting
    conservativeFallback: FallbackLayer // Safe routing when uncertain
  }
  
  routing_strategy: 'consensus' | 'weighted_voting' | 'hierarchical'
  confidence_threshold: number
  fallback_behavior: 'safe' | 'exploratory' | 'multi_option'
}
```

## Layer 1: Base Intent Classification (Domain-Agnostic)

**Purpose**: Extract fundamental analytical intent without domain-specific vocabulary

### Core Intent Categories
```typescript
enum BaseIntent {
  // Primary Analysis Types
  DEMOGRAPHIC_ANALYSIS = 'demographic_analysis',
  COMPETITIVE_ANALYSIS = 'competitive_analysis', 
  STRATEGIC_ANALYSIS = 'strategic_analysis',
  COMPARATIVE_ANALYSIS = 'comparative_analysis',
  
  // Analytical Approaches
  PERFORMANCE_RANKING = 'performance_ranking',
  DIFFERENCE_ANALYSIS = 'difference_analysis',
  RELATIONSHIP_ANALYSIS = 'relationship_analysis',
  TREND_ANALYSIS = 'trend_analysis',
  
  // Advanced Analytics
  PREDICTION_MODELING = 'prediction_modeling',
  CLUSTERING_SEGMENTATION = 'clustering_segmentation',
  ANOMALY_DETECTION = 'anomaly_detection',
  OPTIMIZATION = 'optimization',
  
  // Meta-Analysis
  GENERAL_EXPLORATION = 'general_exploration',
  COMPREHENSIVE_OVERVIEW = 'comprehensive_overview'
}

interface IntentSignatures {
  // Demographic Analysis Signatures
  [BaseIntent.DEMOGRAPHIC_ANALYSIS]: {
    subject_indicators: ['population', 'demographic', 'customer', 'people', 'residents']
    analysis_indicators: ['characteristics', 'breakdown', 'composition', 'profile']
    scope_indicators: ['areas', 'regions', 'markets', 'locations', 'segments']
    quality_indicators: ['best', 'ideal', 'target', 'optimal', 'suitable']
  }
  
  // Competitive Analysis Signatures
  [BaseIntent.COMPETITIVE_ANALYSIS]: {
    subject_indicators: ['competitive', 'competition', 'competitors', 'rivalry']
    analysis_indicators: ['positioning', 'advantage', 'landscape', 'dynamics', 'strength']
    scope_indicators: ['market', 'industry', 'sector', 'space']
    quality_indicators: ['strong', 'weak', 'leading', 'dominant', 'superior']
  }
  
  // Strategic Analysis Signatures
  [BaseIntent.STRATEGIC_ANALYSIS]: {
    subject_indicators: ['strategic', 'strategy', 'business', 'investment']
    analysis_indicators: ['opportunity', 'potential', 'expansion', 'growth', 'development']
    scope_indicators: ['markets', 'areas', 'regions', 'territories']
    quality_indicators: ['top', 'best', 'priority', 'key', 'critical']
  }
}
```

### Intent Recognition Algorithm
```typescript
class BaseIntentClassifier {
  classifyIntent(query: string): IntentClassification {
    const tokens = this.tokenizeAndNormalize(query)
    const intentScores = new Map<BaseIntent, number>()
    
    // Score each intent based on signature matching
    for (const [intent, signature] of Object.entries(IntentSignatures)) {
      let score = 0
      let matchedCategories = 0
      
      // Subject matching (35% weight)
      const subjectMatches = this.countMatches(tokens, signature.subject_indicators)
      if (subjectMatches > 0) {
        score += 0.35 * (subjectMatches / signature.subject_indicators.length)
        matchedCategories++
      }
      
      // Analysis type matching (25% weight)
      const analysisMatches = this.countMatches(tokens, signature.analysis_indicators)
      if (analysisMatches > 0) {
        score += 0.25 * (analysisMatches / signature.analysis_indicators.length)
        matchedCategories++
      }
      
      // Scope matching (20% weight)
      const scopeMatches = this.countMatches(tokens, signature.scope_indicators)
      if (scopeMatches > 0) {
        score += 0.20 * (scopeMatches / signature.scope_indicators.length)
        matchedCategories++
      }
      
      // Quality matching (20% weight)
      const qualityMatches = this.countMatches(tokens, signature.quality_indicators)
      if (qualityMatches > 0) {
        score += 0.20 * (qualityMatches / signature.quality_indicators.length)
        matchedCategories++
      }
      
      // Bonus for multi-category matching
      if (matchedCategories >= 2) {
        score *= 1.2
      }
      
      intentScores.set(intent, score)
    }
    
    return this.selectTopIntents(intentScores, query)
  }
}
```

## Layer 2: Domain Vocabulary Enhancement

**Purpose**: Map generic intents to domain-specific contexts without hardcoding

### Domain Configuration Schema
```typescript
interface DomainConfiguration {
  domain: {
    name: string
    version: string
    description: string
  }
  
  // Vocabulary mappings from generic to domain-specific
  vocabulary: {
    // Entity type mappings
    entities: {
      geographic_unit: string[]     // ['areas', 'markets', 'regions', 'territories']
      customer_unit: string[]       // ['customers', 'clients', 'users', 'consumers']
      competitor_unit: string[]     // ['brands', 'companies', 'competitors', 'players']
      product_unit: string[]        // ['services', 'products', 'offerings', 'solutions']
    }
    
    // Quality and performance terms
    qualifiers: {
      performance: string[]         // ['best', 'top', 'highest', 'optimal', 'leading']
      comparison: string[]          // ['difference', 'gap', 'versus', 'compared to']
      measurement: string[]         // ['score', 'rating', 'index', 'metric', 'value']
    }
    
    // Domain-specific terminology (configurable)
    domain_terms: {
      primary: string[]             // ['tax', 'preparation', 'filing', 'return']
      secondary: string[]           // ['service', 'software', 'professional', 'DIY']
      context: string[]             // ['season', 'deadline', 'refund', 'audit']
    }
  }
  
  // Synonym and variation mappings
  synonyms: {
    [key: string]: string[]         // 'demographics': ['demo', 'population data', 'customer data']
  }
  
  // Anti-patterns to avoid confusion
  avoid_terms: {
    [endpoint: string]: string[]    // '/customer-profile': ['demographic analysis', 'population study']
  }
}
```

### Domain Adapter Implementation
```typescript
class DomainVocabularyAdapter {
  enhanceQuery(query: string, baseIntent: IntentClassification, domain: DomainConfiguration): EnhancedQuery {
    // Step 1: Replace domain-specific terms with generic equivalents
    const genericQuery = this.normalizeToGeneric(query, domain)
    
    // Step 2: Expand synonyms and variations
    const expandedTerms = this.expandSynonyms(genericQuery, domain.synonyms)
    
    // Step 3: Map entities to domain context
    const entityContext = this.mapEntitiesToDomain(expandedTerms, domain.vocabulary.entities)
    
    // Step 4: Apply domain-specific boosting
    const domainBoosting = this.calculateDomainRelevance(query, domain.domain_terms)
    
    return {
      original_query: query,
      normalized_query: genericQuery,
      expanded_terms: expandedTerms,
      entity_context: entityContext,
      domain_relevance: domainBoosting,
      base_intent: baseIntent
    }
  }
  
  // Avoid cross-contamination between similar endpoints
  applyAvoidanceFilters(candidates: EndpointCandidate[], domain: DomainConfiguration): EndpointCandidate[] {
    return candidates.map(candidate => {
      const avoidTerms = domain.avoid_terms[candidate.endpoint] || []
      const penaltyScore = this.calculateAvoidancePenalty(candidate.reasoning, avoidTerms)
      
      return {
        ...candidate,
        confidence: candidate.confidence * (1 - penaltyScore),
        penalties: [...(candidate.penalties || []), { type: 'avoidance', score: penaltyScore }]
      }
    })
  }
}
```

## Layer 3: Context Enhancement & Dataset Awareness

**Purpose**: Boost routing accuracy based on actual dataset characteristics and query context

### Context Enhancement Engine
```typescript
interface DatasetContext {
  // Field availability and characteristics
  available_fields: {
    demographic: string[]           // ['TOTPOP_CY', 'MEDAGE_CY', 'AVGHINC_CY']
    competitive: string[]           // ['MP10128A_B_P', 'MP10104A_B_P']
    geographic: string[]            // ['ID', 'DESCRIPTION', 'coordinates']
    strategic: string[]             // ['strategic_analysis_score', 'market_gap']
  }
  
  // Data distribution insights
  field_characteristics: {
    [field: string]: {
      coverage: number              // 0.0-1.0, percentage of non-null values
      variance: number              // Data variance/spread
      uniqueness: number            // Unique value ratio
      relevance_score: number       // Historical routing success for this field
    }
  }
  
  // Historical routing patterns
  routing_history: {
    [query_pattern: string]: {
      successful_endpoint: string
      confidence: number
      frequency: number
      last_updated: Date
    }
  }
}

class ContextEnhancementEngine {
  enhanceWithDatasetContext(
    enhancedQuery: EnhancedQuery,
    candidates: EndpointCandidate[],
    datasetContext: DatasetContext
  ): ContextuallyEnhancedCandidates {
    
    return candidates.map(candidate => {
      let contextualScore = candidate.base_score
      const enhancements: ContextEnhancement[] = []
      
      // Field availability boosting
      const requiredFields = this.getRequiredFields(candidate.endpoint)
      const fieldAvailability = this.calculateFieldAvailability(requiredFields, datasetContext)
      contextualScore *= fieldAvailability.multiplier
      enhancements.push({
        type: 'field_availability',
        impact: fieldAvailability.multiplier,
        reasoning: `Required fields coverage: ${fieldAvailability.coverage}%`
      })
      
      // Historical pattern matching
      const historicalMatch = this.findHistoricalPatterns(enhancedQuery, datasetContext.routing_history)
      if (historicalMatch) {
        contextualScore *= (1 + historicalMatch.confidence * 0.3)
        enhancements.push({
          type: 'historical_pattern',
          impact: historicalMatch.confidence,
          reasoning: `Similar query routed to ${historicalMatch.endpoint} ${historicalMatch.frequency} times`
        })
      }
      
      // Data quality boosting
      const dataQuality = this.assessDataQuality(candidate.endpoint, datasetContext.field_characteristics)
      contextualScore *= dataQuality.multiplier
      enhancements.push({
        type: 'data_quality',
        impact: dataQuality.multiplier,
        reasoning: `Data quality score: ${dataQuality.score}/1.0`
      })
      
      return {
        ...candidate,
        contextual_score: contextualScore,
        enhancements: enhancements,
        final_confidence: this.calculateFinalConfidence(candidate, contextualScore, enhancements)
      }
    })
  }
}
```

## Layer 4: Conservative Fallback System

**Purpose**: Provide safe, reliable routing when confidence is low or queries are ambiguous

### Fallback Strategy Framework
```typescript
enum FallbackStrategy {
  SAFE_DEFAULT = 'safe_default',           // Route to general analysis
  CLOSEST_MATCH = 'closest_match',         // Best available match with penalty
  MULTI_OPTION = 'multi_option',           // Present multiple options to user
  PROGRESSIVE_CLARIFICATION = 'progressive', // Ask for clarification
  SEMANTIC_SIMILARITY = 'semantic'          // Use embedding-based similarity
}

interface FallbackConfiguration {
  confidence_threshold: number              // Below this, trigger fallback
  strategy: FallbackStrategy
  safe_endpoints: string[]                  // Known-good fallback endpoints
  clarification_prompts: {
    [intent_category: string]: string[]
  }
}

class ConservativeFallbackRouter {
  handleLowConfidenceRouting(
    candidates: ContextuallyEnhancedCandidates,
    query: string,
    config: FallbackConfiguration
  ): FallbackRoutingResult {
    
    const bestCandidate = candidates[0]
    
    if (bestCandidate.final_confidence < config.confidence_threshold) {
      switch (config.strategy) {
        case FallbackStrategy.SAFE_DEFAULT:
          return this.routeToSafeDefault(query, config.safe_endpoints)
          
        case FallbackStrategy.CLOSEST_MATCH:
          return this.routeWithConfidencePenalty(bestCandidate)
          
        case FallbackStrategy.MULTI_OPTION:
          return this.presentMultipleOptions(candidates.slice(0, 3))
          
        case FallbackStrategy.PROGRESSIVE_CLARIFICATION:
          return this.requestClarification(query, candidates, config.clarification_prompts)
          
        case FallbackStrategy.SEMANTIC_SIMILARITY:
          return this.useSemanticSimilarity(query, candidates)
      }
    }
    
    return { success: true, endpoint: bestCandidate.endpoint, confidence: bestCandidate.final_confidence }
  }
  
  // Handle completely novel queries
  handleNovelQuery(query: string, domain: DomainConfiguration): FallbackRoutingResult {
    // Extract key terms and attempt subject-based routing
    const subjects = this.extractSubjects(query)
    const actions = this.extractActions(query)
    
    // Rule-based fallback routing
    const fallbackRules = [
      { condition: (s, a) => s.includes('demographic') || s.includes('population'), endpoint: '/demographic-insights' },
      { condition: (s, a) => s.includes('competitive') || s.includes('competition'), endpoint: '/competitive-analysis' },
      { condition: (s, a) => a.includes('compare') || s.includes('between'), endpoint: '/comparative-analysis' },
      { condition: (s, a) => s.includes('strategic') || s.includes('opportunity'), endpoint: '/strategic-analysis' },
      { condition: (s, a) => true, endpoint: '/analyze' } // Ultimate fallback
    ]
    
    for (const rule of fallbackRules) {
      if (rule.condition(subjects, actions)) {
        return {
          success: true,
          endpoint: rule.endpoint,
          confidence: 0.6, // Conservative confidence for fallback routing
          reasoning: `Fallback routing based on subject/action analysis: ${subjects.join(', ')} / ${actions.join(', ')}`
        }
      }
    }
  }
}
```

## Query Validation and Out-of-Scope Handling

### Current System Limitations

The existing system has a critical flaw: it **never fails** routing. Every query, no matter how irrelevant, always gets routed to `/strategic-analysis` as a fallback. This creates poor user experience for queries like:

- "What's the weather forecast for tomorrow?"
- "Cook me a recipe for pasta"
- "How do I fix my car engine?"

These queries should be gracefully rejected or redirected, not routed to a business analysis endpoint.

### Query Validation Framework

```typescript
enum QueryScope {
  IN_SCOPE = 'in_scope',           // Clearly within analysis domain
  BORDERLINE = 'borderline',       // Could be analysis-related with clarification
  OUT_OF_SCOPE = 'out_of_scope',   // Clearly outside analysis domain
  MALFORMED = 'malformed'          // Cannot be understood
}

interface ValidationResult {
  scope: QueryScope
  confidence: number               // 0.0-1.0 confidence in the scope assessment
  reasons: string[]               // Specific reasons for the classification
  suggestions?: string[]          // Alternative phrasings if borderline
  redirect_message?: string       // User-friendly message if out of scope
}

interface QueryValidationConfig {
  // Domain-specific validation rules
  domain_indicators: {
    required_subjects: string[]     // ['market', 'analysis', 'business', 'data']
    required_actions: string[]      // ['analyze', 'compare', 'evaluate', 'assess']
    valid_contexts: string[]        // ['geographic', 'demographic', 'competitive']
  }
  
  // Out-of-scope detection patterns
  rejection_patterns: {
    personal_requests: string[]     // ['recipe', 'cooking', 'personal advice']
    technical_support: string[]     // ['fix', 'troubleshoot', 'error', 'bug']
    general_knowledge: string[]     // ['weather', 'news', 'definition', 'explain']
    creative_tasks: string[]        // ['write', 'create', 'generate story']
  }
  
  // Confidence thresholds for different actions
  thresholds: {
    accept_threshold: number        // Above this: route normally
    clarify_threshold: number       // Above this: ask for clarification
    reject_threshold: number        // Below this: reject gracefully
  }
}

class QueryValidator {
  validateQuery(query: string, domain: DomainConfiguration): ValidationResult {
    const analysis = this.analyzeQueryScope(query, domain)
    
    // Check for clear out-of-scope indicators
    const outOfScopeScore = this.calculateOutOfScopeScore(query, domain.validation)
    if (outOfScopeScore > 0.8) {
      return {
        scope: QueryScope.OUT_OF_SCOPE,
        confidence: outOfScopeScore,
        reasons: [`Query appears to be about ${this.identifyMainTopic(query)}, which is outside our analysis domain`],
        redirect_message: this.generateRedirectMessage(query)
      }
    }
    
    // Check for domain relevance
    const domainRelevance = this.calculateDomainRelevance(query, domain.validation.domain_indicators)
    if (domainRelevance < 0.3) {
      return {
        scope: domainRelevance < 0.1 ? QueryScope.OUT_OF_SCOPE : QueryScope.BORDERLINE,
        confidence: 1 - domainRelevance,
        reasons: ['Query lacks clear analysis intent or business context'],
        suggestions: this.suggestAnalysisPhrasings(query)
      }
    }
    
    // Query appears to be in scope
    return {
      scope: QueryScope.IN_SCOPE,
      confidence: domainRelevance,
      reasons: ['Query contains analysis intent and business context']
    }
  }
  
  private generateRedirectMessage(query: string): string {
    const topic = this.identifyMainTopic(query)
    
    const redirectMap = {
      'weather': 'For weather information, try a weather service like Weather.com or AccuWeather.',
      'cooking': 'For recipes and cooking advice, try food websites like AllRecipes or Food Network.',
      'technical_support': 'For technical support, please consult the relevant product documentation or support forum.',
      'general_knowledge': 'For general information, try search engines like Google or reference sites like Wikipedia.',
      'creative_writing': 'For creative writing assistance, try tools specifically designed for content creation.',
      'default': 'This query appears to be outside our business analysis domain. Please rephrase with analysis-focused terms like "analyze", "compare", or "evaluate" if you\'re seeking business insights.'
    }
    
    return redirectMap[topic] || redirectMap.default
  }
  
  private suggestAnalysisPhrasings(query: string): string[] {
    // Analyze the query and suggest analysis-oriented rephrasings
    const suggestions = []
    
    if (this.containsLocationMentions(query)) {
      suggestions.push(`Try: "Analyze the ${this.extractLocation(query)} market for business opportunities"`)
    }
    
    if (this.containsComparisonTerms(query)) {
      suggestions.push(`Try: "Compare competitive positioning between ${this.extractComparisonSubjects(query)}"`)
    }
    
    if (this.containsPerformanceTerms(query)) {
      suggestions.push(`Try: "Evaluate performance metrics for ${this.extractPerformanceSubject(query)}"`)
    }
    
    // Always include a general suggestion
    suggestions.push(`Try: "Analyze market insights for [your specific business area]"`)
    
    return suggestions
  }
}
```

### Confidence Threshold Management

```typescript
interface ConfidenceThresholds {
  // Primary routing thresholds
  high_confidence: number         // 0.8+ - Route with full confidence
  medium_confidence: number       // 0.6+ - Route with confidence warning
  low_confidence: number          // 0.4+ - Route to fallback with explanation
  validation_threshold: number    // 0.2+ - Minimum to attempt routing
  
  // Dynamic adjustment factors
  user_feedback_weight: number    // How much to adjust based on user corrections
  historical_success_weight: number // How much to weight past routing success
  domain_specificity_bonus: number  // Bonus for domain-specific terminology
}

class AdaptiveConfidenceManager {
  private thresholds: ConfidenceThresholds
  private routingHistory: Map<string, RoutingHistoryEntry> = new Map()
  
  adjustThresholds(feedback: UserFeedback[]): void {
    // Analyze recent feedback to adjust confidence thresholds
    const recentFeedback = feedback.filter(f => f.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    
    const successRate = recentFeedback.filter(f => f.was_correct).length / recentFeedback.length
    
    if (successRate < 0.85) {
      // System is over-confident, raise thresholds
      this.thresholds.high_confidence = Math.min(0.9, this.thresholds.high_confidence + 0.05)
      this.thresholds.medium_confidence = Math.min(0.75, this.thresholds.medium_confidence + 0.05)
    } else if (successRate > 0.95) {
      // System is under-confident, lower thresholds slightly
      this.thresholds.high_confidence = Math.max(0.7, this.thresholds.high_confidence - 0.02)
      this.thresholds.medium_confidence = Math.max(0.5, this.thresholds.medium_confidence - 0.02)
    }
  }
  
  getRecommendedAction(confidence: number, validation: ValidationResult): RoutingRecommendation {
    if (validation.scope === QueryScope.OUT_OF_SCOPE) {
      return {
        action: 'reject',
        message: validation.redirect_message || 'Query is outside our analysis domain',
        confidence: validation.confidence
      }
    }
    
    if (confidence >= this.thresholds.high_confidence) {
      return { action: 'route', confidence }
    } else if (confidence >= this.thresholds.medium_confidence) {
      return { action: 'route_with_warning', confidence }
    } else if (confidence >= this.thresholds.low_confidence) {
      return { action: 'fallback_with_explanation', confidence }
    } else if (confidence >= this.thresholds.validation_threshold) {
      return { action: 'request_clarification', confidence }
    } else {
      return {
        action: 'reject',
        message: 'Query confidence too low for reliable routing',
        confidence
      }
    }
  }
}
```

### User-Friendly Response System

```typescript
interface UserResponse {
  type: 'success' | 'clarification' | 'rejection' | 'fallback'
  message: string
  endpoint?: string
  confidence?: number
  alternatives?: Array<{endpoint: string, confidence: number, description: string}>
  suggestions?: string[]
  help_resources?: Array<{title: string, url: string}>
}

class UserResponseGenerator {
  generateResponse(
    query: string, 
    routingResult: RoutingResult, 
    validation: ValidationResult,
    recommendation: RoutingRecommendation
  ): UserResponse {
    
    switch (recommendation.action) {
      case 'reject':
        return this.generateRejectionResponse(query, validation)
        
      case 'request_clarification':
        return this.generateClarificationResponse(query, routingResult, validation)
        
      case 'fallback_with_explanation':
        return this.generateFallbackResponse(query, routingResult)
        
      case 'route_with_warning':
        return this.generateWarningResponse(query, routingResult)
        
      default:
        return this.generateSuccessResponse(query, routingResult)
    }
  }
  
  private generateRejectionResponse(query: string, validation: ValidationResult): UserResponse {
    return {
      type: 'rejection',
      message: validation.redirect_message || "I can only help with business analysis queries. This request appears to be outside that domain.",
      suggestions: validation.suggestions || [
        "Try asking about market analysis, competitive insights, or demographic trends",
        "Rephrase using analysis terms like 'analyze', 'compare', or 'evaluate'",
        "Specify a business context or geographic area for analysis"
      ],
      help_resources: [
        { title: "Query Examples", url: "/help/query-examples" },
        { title: "Analysis Types", url: "/help/analysis-types" }
      ]
    }
  }
  
  private generateClarificationResponse(
    query: string, 
    routingResult: RoutingResult,
    validation: ValidationResult
  ): UserResponse {
    const topCandidates = routingResult.alternatives?.slice(0, 3) || []
    
    return {
      type: 'clarification',
      message: "I'm not completely sure what type of analysis you're looking for. Could you clarify or choose from these options?",
      alternatives: topCandidates.map(candidate => ({
        endpoint: candidate.endpoint,
        confidence: candidate.confidence,
        description: this.getEndpointDescription(candidate.endpoint)
      })),
      suggestions: validation.suggestions || [
        "Be more specific about what you want to analyze",
        "Include terms like 'demographics', 'competition', or 'market trends'",
        "Specify a geographic area or customer segment"
      ]
    }
  }
  
  private generateFallbackResponse(query: string, routingResult: RoutingResult): UserResponse {
    return {
      type: 'fallback',
      message: `I'll do my best to analyze this using general market analysis, though I'm not completely confident this matches what you're looking for.`,
      endpoint: routingResult.endpoint,
      confidence: routingResult.confidence,
      alternatives: routingResult.alternatives?.slice(0, 2).map(alt => ({
        endpoint: alt.endpoint,
        confidence: alt.confidence,
        description: this.getEndpointDescription(alt.endpoint)
      })),
      suggestions: [
        "If this doesn't match your intent, try rephrasing your query",
        "Consider using more specific business terminology",
        "Let me know if you need a different type of analysis"
      ]
    }
  }
}
```

### Integration with Hybrid Routing

```typescript
class HybridRoutingEngine {
  async route(query: string, domain: DomainConfiguration, datasetContext: DatasetContext): Promise<RoutingResult> {
    // Step 0: Query Validation (NEW)
    const validation = this.queryValidator.validateQuery(query, domain)
    
    // Early exit for clearly out-of-scope queries
    if (validation.scope === QueryScope.OUT_OF_SCOPE && validation.confidence > 0.8) {
      return {
        success: false,
        validation: validation,
        user_response: this.responseGenerator.generateResponse(query, null, validation, {
          action: 'reject',
          message: validation.redirect_message,
          confidence: validation.confidence
        })
      }
    }
    
    // Layer 1: Base Intent Classification
    const baseIntent = await this.baseIntentClassifier.classifyIntent(query)
    
    // Layer 2: Domain Vocabulary Enhancement
    const enhancedQuery = this.domainAdapter.enhanceQuery(query, baseIntent, domain)
    
    // Get initial endpoint candidates
    let candidates = this.generateCandidates(enhancedQuery, domain)
    
    // Apply avoidance filters
    candidates = this.domainAdapter.applyAvoidanceFilters(candidates, domain)
    
    // Layer 3: Context Enhancement
    const contextualCandidates = this.contextEngine.enhanceWithDatasetContext(
      enhancedQuery, candidates, datasetContext
    )
    
    // Sort by contextual score
    contextualCandidates.sort((a, b) => b.contextual_score - a.contextual_score)
    
    // Layer 4: Enhanced Fallback with Confidence Management (UPDATED)
    const topCandidate = contextualCandidates[0]
    const recommendedAction = this.confidenceManager.getRecommendedAction(
      topCandidate?.final_confidence || 0,
      validation
    )
    
    const routingResult = {
      success: recommendedAction.action === 'route' || recommendedAction.action === 'route_with_warning',
      endpoint: topCandidate?.endpoint,
      confidence: topCandidate?.final_confidence,
      validation: validation,
      reasoning: this.generateDetailedReasoning(topCandidate, enhancedQuery),
      alternatives: contextualCandidates.slice(1, 3),
      routing_layers: {
        validation: validation,
        base_intent: baseIntent,
        domain_enhancement: enhancedQuery,
        context_boost: topCandidate?.enhancements,
        final_decision: topCandidate
      }
    }
    
    // Generate appropriate user response
    routingResult.user_response = this.responseGenerator.generateResponse(
      query, routingResult, validation, recommendedAction
    )
    
    return routingResult
  }
}
```

### Testing and Validation

```typescript
interface ValidationTestSuite {
  in_scope_queries: Array<{
    query: string
    expected_endpoint: string
    min_confidence: number
  }>
  
  out_of_scope_queries: Array<{
    query: string
    expected_rejection: true
    category: string
  }>
  
  borderline_queries: Array<{
    query: string
    expected_action: 'clarification' | 'fallback'
    acceptable_endpoints: string[]
  }>
}

class ValidationTestRunner {
  async runValidationSuite(testSuite: ValidationTestSuite): Promise<ValidationTestResults> {
    const results = {
      in_scope_accuracy: 0,
      out_of_scope_rejection_rate: 0,
      borderline_appropriate_handling: 0,
      false_positives: [] as string[],  // Out-of-scope routed to endpoints
      false_negatives: [] as string[],  // In-scope queries rejected
      confidence_calibration: 0
    }
    
    // Test in-scope queries
    for (const test of testSuite.in_scope_queries) {
      const result = await this.hybridRouter.route(test.query, this.domain, this.datasetContext)
      if (result.success && result.endpoint === test.expected_endpoint && result.confidence >= test.min_confidence) {
        results.in_scope_accuracy++
      } else if (!result.success) {
        results.false_negatives.push(test.query)
      }
    }
    
    // Test out-of-scope queries
    for (const test of testSuite.out_of_scope_queries) {
      const result = await this.hybridRouter.route(test.query, this.domain, this.datasetContext)
      if (!result.success && result.validation?.scope === QueryScope.OUT_OF_SCOPE) {
        results.out_of_scope_rejection_rate++
      } else if (result.success) {
        results.false_positives.push(test.query)
      }
    }
    
    return results
  }
}

## Handling Open-Ended Questions

### Challenge Categories
```typescript
enum OpenEndedChallenges {
  NOVEL_PHRASING = 'novel_phrasing',           // "Tell me about the demographics"
  AMBIGUOUS_INTENT = 'ambiguous_intent',       // "Analyze the market"
  COMPOUND_QUERIES = 'compound_queries',       // "Compare demographics and show competition"
  DOMAIN_JARGON = 'domain_jargon',            // Industry-specific terms
  INCOMPLETE_CONTEXT = 'incomplete_context'    // "What's the best area?"
}
```

### Progressive Resolution Strategy
```typescript
class OpenEndedQueryHandler {
  handleOpenEndedQuery(query: string, domain: DomainConfiguration): Promise<RoutingResult> {
    // Step 1: Classify the type of challenge
    const challenge = this.classifyChallenge(query)
    
    // Step 2: Apply challenge-specific handling
    switch (challenge.type) {
      case OpenEndedChallenges.NOVEL_PHRASING:
        return this.handleNovelPhrasing(query, domain, challenge.details)
        
      case OpenEndedChallenges.AMBIGUOUS_INTENT:
        return this.handleAmbiguousIntent(query, domain, challenge.confidence)
        
      case OpenEndedChallenges.COMPOUND_QUERIES:
        return this.handleCompoundQuery(query, domain, challenge.components)
        
      case OpenEndedChallenges.DOMAIN_JARGON:
        return this.handleDomainJargon(query, domain, challenge.unknown_terms)
        
      case OpenEndedChallenges.INCOMPLETE_CONTEXT:
        return this.handleIncompleteContext(query, domain, challenge.missing_elements)
    }
  }
  
  handleNovelPhrasing(query: string, domain: DomainConfiguration, details: any): Promise<RoutingResult> {
    // Use semantic similarity with known successful queries
    const similarQueries = this.findSimilarQueries(query, domain.routing_history)
    
    if (similarQueries.length > 0) {
      // Route based on most similar successful query
      return this.routeBasedOnSimilarity(query, similarQueries[0])
    }
    
    // Fallback to base intent classification with confidence penalty
    return this.routeWithNovelPhrasingPenalty(query, domain)
  }
  
  handleCompoundQuery(query: string, domain: DomainConfiguration, components: string[]): Promise<RoutingResult> {
    // Break down compound query into component parts
    const subQueries = this.decomposeQuery(query, components)
    
    // Route each component
    const componentRoutes = await Promise.all(
      subQueries.map(subQuery => this.hybridRouter.route(subQuery, domain, this.datasetContext))
    )
    
    // Determine if this should be multi-endpoint or prioritized routing
    if (componentRoutes.length === 1) {
      return componentRoutes[0]
    } else {
      return this.handleMultiEndpointQuery(componentRoutes, query)
    }
  }
}
```

## Implementation Plan

### Phase 1: Foundation Layer (3-4 weeks)
1. **Base Intent Classification System**
   - Implement `BaseIntentClassifier` with signature-based matching
   - Create comprehensive intent signatures for all analysis types
   - Build intent confidence scoring and validation
   - Test against current 22-query benchmark (target: 95%+ base intent accuracy)

2. **Domain Configuration Framework**
   - Design and implement `DomainConfiguration` schema
   - Build domain configuration loader and validator
   - Create tax services domain configuration as reference implementation
   - Implement synonym expansion and entity mapping

### Phase 2: Domain Adaptation Layer (2-3 weeks)
1. **Domain Vocabulary Adapter**
   - Implement vocabulary normalization and expansion
   - Build avoidance filter system to prevent cross-contamination
   - Create domain relevance scoring
   - Test vocabulary enhancement with current queries

2. **Multi-Domain Support Framework**
   - Design domain switching mechanisms
   - Implement runtime domain configuration loading
   - Build domain-specific performance monitoring
   - Create domain migration utilities

### Phase 3: Context Enhancement Layer (2-3 weeks)
1. **Dataset Context Analysis**
   - Implement field availability and quality assessment
   - Build historical routing pattern tracking
   - Create contextual scoring algorithms
   - Implement data-driven routing optimization

2. **Performance Context Integration**
   - Track routing success rates per endpoint
   - Implement adaptive confidence thresholds
   - Build context-aware boosting mechanisms
   - Create routing performance analytics

### Phase 4: Query Validation and Fallback System (3-4 weeks)
1. **Query Validation Framework**
   - Implement `QueryValidator` with scope detection (in-scope, borderline, out-of-scope)
   - Build out-of-scope pattern detection for common irrelevant queries (weather, recipes, etc.)
   - Create domain relevance scoring algorithms
   - Implement redirect message generation for different query types

2. **Confidence Threshold Management**
   - Build `AdaptiveConfidenceManager` with dynamic threshold adjustment
   - Implement user feedback integration for threshold tuning
   - Create routing recommendation system (route, clarify, fallback, reject)
   - Build confidence calibration based on historical routing success

3. **User-Friendly Response System**
   - Implement `UserResponseGenerator` with contextual messaging
   - Create rejection responses with helpful suggestions and redirects
   - Build clarification workflows with alternative endpoint options
   - Implement fallback explanations and user guidance

4. **Conservative Fallback System**
   - Implement multiple fallback strategies beyond default `/strategic-analysis`
   - Build safe routing mechanisms for uncertain queries
   - Create progressive clarification workflows
   - Implement graceful degradation when confidence is too low

5. **Open-Ended Query Processing**
   - Build novel phrasing detection and handling
   - Implement compound query decomposition
   - Create ambiguity resolution mechanisms
   - Build query suggestion systems for borderline cases

### Phase 5: Integration and Optimization (2-3 weeks)
1. **Hybrid Engine Integration**
   - Integrate all four layers into cohesive routing engine
   - Implement layer coordination and conflict resolution
   - Build comprehensive routing result tracking
   - Create detailed reasoning and transparency features

2. **Performance Optimization**
   - Optimize routing speed (target: maintain <10ms average)
   - Implement intelligent caching strategies
   - Build parallel layer processing where possible
   - Create routing performance monitoring

### Phase 6: Validation and Deployment (3-4 weeks)
1. **Comprehensive Testing**
   - Validate against current 22-query benchmark (target: maintain 100%)
   - Create extensive open-ended query test suite
   - Build cross-domain portability tests
   - Implement A/B testing framework for gradual rollout

2. **Production Readiness**
   - Build monitoring and alerting systems
   - Create configuration management tools
   - Implement rollback and emergency fallback mechanisms
   - Create comprehensive documentation and training materials

## Success Metrics

### Quantitative Targets
- **Predefined Query Accuracy**: Maintain 100% on current 22-query test suite
- **Open-Ended Query Success**: >90% appropriate routing for novel phrasings
- **Out-of-Scope Query Rejection**: >95% accurate rejection of irrelevant queries (weather, recipes, etc.)
- **Borderline Query Handling**: >85% appropriate clarification or fallback for ambiguous queries
- **Cross-Domain Portability**: >85% accuracy on new domain with <4 hours configuration time
- **Routing Performance**: <15ms average routing time (including validation and all four layers)
- **Confidence Calibration**: >95% accuracy for high-confidence routes (>0.8)
- **False Positive Rate**: <3% of out-of-scope queries incorrectly routed to endpoints
- **False Negative Rate**: <5% of valid analysis queries incorrectly rejected
- **User Satisfaction**: >85% positive feedback on query validation and suggestions

### Qualitative Targets
- **Maintainability**: New domain setup should take <4 hours vs current ~40 hours
- **Extensibility**: Adding new analysis endpoints should require minimal changes across layers
- **Transparency**: Complete reasoning chain available for all routing decisions
- **Robustness**: Graceful degradation and useful fallbacks for all query types
- **Configuration**: Non-technical users can modify domain vocabulary with training

## Risk Mitigation

### Technical Risks
- **Complexity Management**: Five-layer system (validation + four routing layers) could become difficult to debug and maintain
  - *Mitigation*: Comprehensive logging at each layer, modular design with clear interfaces, detailed reasoning chains
- **Performance Impact**: Multiple layers plus validation could significantly slow routing
  - *Mitigation*: Parallel processing where possible, aggressive caching, performance budgets, early exit for clear rejections
- **Layer Conflict**: Different layers might provide conflicting recommendations
  - *Mitigation*: Clear conflict resolution rules, weighted voting mechanisms, validation layer precedence
- **Configuration Complexity**: Domain configurations and validation rules could become overwhelming
  - *Mitigation*: Configuration validation, templates, guided setup wizards, validation testing tools
- **False Rejection Risk**: Valid queries might be incorrectly rejected by validation layer
  - *Mitigation*: Conservative rejection thresholds, borderline query handling, user feedback integration

### Product Risks
- **Accuracy Regression**: New system might not match current 100% accuracy
  - *Mitigation*: Parallel deployment, gradual cutover with immediate rollback capability
- **User Experience**: More complex system might introduce unpredictable behavior
  - *Mitigation*: Extensive testing, user feedback integration, conservative confidence thresholds
- **Domain Migration Difficulty**: Moving to new domains might still be challenging
  - *Mitigation*: Comprehensive documentation, migration tools, professional services support

## Future Enhancements

### Advanced Intelligence
- **Machine Learning Integration**: Train models on routing decisions to improve accuracy
- **Adaptive Learning**: System learns and improves from user feedback and usage patterns
- **Conversational Context**: Multi-turn query understanding and context retention
- **Predictive Routing**: Anticipate user intent based on previous queries and context

### Enterprise Features
- **Multi-Tenant Support**: Support multiple domains and configurations simultaneously
- **Role-Based Routing**: Different routing behavior based on user roles and permissions
- **API Gateway Integration**: Enterprise-grade routing with rate limiting and authentication
- **Real-Time Configuration**: Hot-swappable domain configurations without system restart

## Conclusion

The hybrid routing architecture with integrated query validation represents the optimal balance between the precision of our current hardcoded system and the flexibility needed for cross-domain portability, open-ended query handling, and proper rejection of irrelevant requests. By implementing query validation plus four complementary routing layers that work together, we can:

1. **Preserve current accuracy** through sophisticated intent classification and domain adaptation
2. **Enable cross-domain portability** through configurable vocabulary and context systems
3. **Handle open-ended queries** through progressive resolution and intelligent fallbacks
4. **Reject inappropriate queries** through validation and graceful user guidance
5. **Maintain performance** through optimized layer coordination and early-exit validation
6. **Provide transparency** through detailed reasoning chains and alternative options

The key innovation is the separation of concerns across five layers:
- **Is this relevant?** (Query Validation)
- **What the user wants** (Base Intent)
- **How they express it** (Domain Vocabulary)
- **What data supports it** (Context Enhancement)  
- **How to handle uncertainty** (Conservative Fallback)

This architecture addresses the current system's critical flaw of never failing routing (always defaulting to `/strategic-analysis`) by implementing proper query validation that can gracefully reject queries like "weather forecast" or "cooking recipes" while providing helpful guidance to users.

The system ensures that we can maintain our hard-won 100% accuracy on predefined queries while building a foundation for true cross-domain intelligence, robust handling of the full spectrum of user questions, and proper user experience for out-of-scope requests.

---

*Last Updated: August 24, 2025*  
*Status: Ready for Implementation*  
*Estimated Timeline: 17-22 weeks total*