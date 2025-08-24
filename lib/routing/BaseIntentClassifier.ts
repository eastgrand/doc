/**
 * BaseIntentClassifier - Domain-agnostic intent recognition
 * 
 * Extracts fundamental analytical intent without domain-specific vocabulary
 */

import { 
  BaseIntent, 
  IntentSignatures, 
  IntentClassification, 
  IntentMatchResult 
} from './types/BaseIntentTypes';

export class BaseIntentClassifier {
  private readonly INTENT_SIGNATURES: IntentSignatures = {
    [BaseIntent.DEMOGRAPHIC_ANALYSIS]: {
      subject_indicators: ['population', 'demographic', 'customer', 'people', 'residents', 'users', 'consumers'],
      analysis_indicators: ['characteristics', 'breakdown', 'composition', 'profile', 'attributes', 'traits'],
      scope_indicators: ['areas', 'regions', 'markets', 'locations', 'segments', 'communities'],
      quality_indicators: ['best', 'ideal', 'target', 'optimal', 'suitable', 'preferred']
    },
    
    [BaseIntent.COMPETITIVE_ANALYSIS]: {
      subject_indicators: ['competitive', 'competition', 'competitors', 'rivalry', 'market'],
      analysis_indicators: ['positioning', 'advantage', 'landscape', 'dynamics', 'strength', 'performance'],
      scope_indicators: ['market', 'industry', 'sector', 'space', 'environment'],
      quality_indicators: ['strong', 'weak', 'leading', 'dominant', 'superior', 'winning']
    },
    
    [BaseIntent.STRATEGIC_ANALYSIS]: {
      subject_indicators: ['strategic', 'strategy', 'business', 'investment', 'opportunity'],
      analysis_indicators: ['opportunity', 'potential', 'expansion', 'growth', 'development', 'planning'],
      scope_indicators: ['markets', 'areas', 'regions', 'territories', 'locations'],
      quality_indicators: ['top', 'best', 'priority', 'key', 'critical', 'prime']
    },
    
    [BaseIntent.COMPARATIVE_ANALYSIS]: {
      subject_indicators: ['comparison', 'compare', 'versus', 'between', 'against', 'model', 'algorithm', 'agree', 'consensus'],
      analysis_indicators: ['difference', 'similarity', 'contrast', 'evaluation', 'assessment', 'performance', 'best', 'agree', 'consensus'],
      scope_indicators: ['cities', 'regions', 'markets', 'areas', 'locations', 'prediction', 'modeling', 'models', 'predictions'],
      quality_indicators: ['better', 'worse', 'superior', 'inferior', 'different', 'best', 'optimal', 'all', 'agreement']
    },
    
    [BaseIntent.PERFORMANCE_RANKING]: {
      subject_indicators: ['performance', 'ranking', 'score', 'rating', 'results', 'factors', 'importance', 'important'],
      analysis_indicators: ['rank', 'order', 'sort', 'list', 'top', 'bottom', 'important', 'predict', 'influence'],
      scope_indicators: ['markets', 'areas', 'regions', 'locations', 'segments', 'prediction', 'usage'],
      quality_indicators: ['highest', 'lowest', 'best', 'worst', 'top', 'bottom', 'most', 'key', 'critical']
    },
    
    [BaseIntent.DIFFERENCE_ANALYSIS]: {
      subject_indicators: ['difference', 'gap', 'variation', 'disparity', 'variance'],
      analysis_indicators: ['analyze', 'examine', 'study', 'investigate', 'explore'],
      scope_indicators: ['between', 'among', 'across', 'within'],
      quality_indicators: ['significant', 'major', 'minor', 'notable', 'substantial']
    },
    
    [BaseIntent.RELATIONSHIP_ANALYSIS]: {
      subject_indicators: ['relationship', 'correlation', 'connection', 'association', 'link', 'interaction', 'interactions'],
      analysis_indicators: ['relate', 'connect', 'influence', 'affect', 'impact', 'interact'],
      scope_indicators: ['factors', 'variables', 'elements', 'components', 'demographics', 'features'],
      quality_indicators: ['strong', 'weak', 'significant', 'positive', 'negative', 'strongest', 'key']
    },
    
    [BaseIntent.TREND_ANALYSIS]: {
      subject_indicators: ['trend', 'pattern', 'direction', 'movement', 'change'],
      analysis_indicators: ['growth', 'decline', 'increase', 'decrease', 'evolution'],
      scope_indicators: ['over time', 'temporal', 'historical', 'recent'],
      quality_indicators: ['rising', 'falling', 'stable', 'volatile', 'consistent']
    },
    
    [BaseIntent.PREDICTION_MODELING]: {
      subject_indicators: ['prediction', 'forecast', 'future', 'projection', 'estimate', 'scenario', 'what if', 'if', 'ensemble', 'confidence'],
      analysis_indicators: ['predict', 'model', 'project', 'anticipate', 'expect', 'change', 'changes', 'impact', 'affect', 'ensemble', 'combined'],
      scope_indicators: ['future', 'next', 'upcoming', 'projected', 'strategy', 'pricing', 'market', 'predictions', 'highest', 'resilient'],
      quality_indicators: ['likely', 'probable', 'expected', 'anticipated', 'potential', 'resilient', 'stable', 'best', 'highest', 'most']
    },
    
    [BaseIntent.CLUSTERING_SEGMENTATION]: {
      subject_indicators: ['segment', 'cluster', 'group', 'category', 'classification', 'segmentation'],
      analysis_indicators: ['segmentation', 'clustering', 'grouping', 'classification', 'categorization', 'segment'],
      scope_indicators: ['markets', 'customers', 'areas', 'regions', 'strategies', 'targeted'],
      quality_indicators: ['similar', 'distinct', 'unique', 'homogeneous', 'heterogeneous', 'targeted', 'should']
    },
    
    [BaseIntent.ANOMALY_DETECTION]: {
      subject_indicators: ['anomaly', 'outlier', 'exception', 'unusual', 'abnormal', 'outliers', 'unique'],
      analysis_indicators: ['detect', 'identify', 'find', 'discover', 'locate', 'show'],
      scope_indicators: ['patterns', 'behavior', 'data', 'values', 'market', 'characteristics'],
      quality_indicators: ['unusual', 'rare', 'exceptional', 'unique', 'strange', 'biggest', 'opportunities']
    },
    
    [BaseIntent.OPTIMIZATION]: {
      subject_indicators: ['optimization', 'optimize', 'improve', 'enhance', 'maximize', 'adjust', 'weight', 'optimal', 'selection'],
      analysis_indicators: ['optimize', 'improve', 'enhance', 'maximize', 'minimize', 'adjust', 'change', 'select', 'choose'],
      scope_indicators: ['performance', 'results', 'outcomes', 'efficiency', 'rankings', 'weights', 'algorithm', 'geographic'],
      quality_indicators: ['optimal', 'best', 'maximum', 'minimum', 'efficient', 'sensitive', 'impact', 'each', 'area']
    },
    
    [BaseIntent.GENERAL_EXPLORATION]: {
      subject_indicators: ['explore', 'investigate', 'examine', 'study', 'research'],
      analysis_indicators: ['exploration', 'investigation', 'examination', 'study', 'research'],
      scope_indicators: ['data', 'information', 'insights', 'patterns'],
      quality_indicators: ['interesting', 'relevant', 'important', 'significant', 'notable']
    },
    
    [BaseIntent.COMPREHENSIVE_OVERVIEW]: {
      subject_indicators: ['overview', 'summary', 'comprehensive', 'complete', 'full', 'insights'],
      analysis_indicators: ['analyze', 'review', 'assess', 'evaluate', 'examine', 'provide'],
      scope_indicators: ['overall', 'general', 'broad', 'complete', 'entire', 'market'],
      quality_indicators: ['comprehensive', 'complete', 'thorough', 'detailed', 'full']
    }
  };

  /**
   * Classify the intent of a query
   */
  classifyIntent(query: string): IntentClassification {
    const tokens = this.tokenizeAndNormalize(query);
    const intentScores = new Map<BaseIntent, IntentMatchResult>();
    
    // Score each intent based on signature matching
    for (const [intent, signature] of Object.entries(this.INTENT_SIGNATURES)) {
      const matchResult = this.scoreIntentMatch(tokens, intent as BaseIntent, signature);
      intentScores.set(intent as BaseIntent, matchResult);
    }
    
    return this.selectTopIntents(intentScores, query);
  }

  /**
   * Tokenize and normalize query text
   */
  private tokenizeAndNormalize(query: string): string[] {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .split(/\s+/)
      .filter(token => token.length > 2) // Remove short tokens
      .filter(token => !this.isStopWord(token));
  }

  /**
   * Check if a word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
      'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could',
      'can', 'may', 'might', 'must', 'shall', 'me', 'you', 'him', 'her',
      'it', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
    ]);
    return stopWords.has(word);
  }

  /**
   * Score an intent match against a signature
   */
  private scoreIntentMatch(
    tokens: string[], 
    intent: BaseIntent, 
    signature: any
  ): IntentMatchResult {
    let totalScore = 0;
    let matchedCategories = 0;
    const matchedTerms: string[] = [];
    
    const categoryScores = {
      subject: 0,
      analysis: 0,
      scope: 0,
      quality: 0
    };

    // Subject matching (35% weight)
    const subjectMatches = this.countMatches(tokens, signature.subject_indicators);
    if (subjectMatches.count > 0) {
      categoryScores.subject = 0.35 * (subjectMatches.count / signature.subject_indicators.length);
      totalScore += categoryScores.subject;
      matchedCategories++;
      matchedTerms.push(...subjectMatches.matched);
    }
    
    // Analysis type matching (25% weight)
    const analysisMatches = this.countMatches(tokens, signature.analysis_indicators);
    if (analysisMatches.count > 0) {
      categoryScores.analysis = 0.25 * (analysisMatches.count / signature.analysis_indicators.length);
      totalScore += categoryScores.analysis;
      matchedCategories++;
      matchedTerms.push(...analysisMatches.matched);
    }
    
    // Scope matching (20% weight)
    const scopeMatches = this.countMatches(tokens, signature.scope_indicators);
    if (scopeMatches.count > 0) {
      categoryScores.scope = 0.20 * (scopeMatches.count / signature.scope_indicators.length);
      totalScore += categoryScores.scope;
      matchedCategories++;
      matchedTerms.push(...scopeMatches.matched);
    }
    
    // Quality matching (20% weight)
    const qualityMatches = this.countMatches(tokens, signature.quality_indicators);
    if (qualityMatches.count > 0) {
      categoryScores.quality = 0.20 * (qualityMatches.count / signature.quality_indicators.length);
      totalScore += categoryScores.quality;
      matchedCategories++;
      matchedTerms.push(...qualityMatches.matched);
    }
    
    // Bonus for multi-category matching
    if (matchedCategories >= 2) {
      totalScore *= 1.2;
    }
    
    return {
      intent,
      score: totalScore,
      matched_categories: matchedCategories,
      category_scores: categoryScores,
      matched_terms: [...new Set(matchedTerms)] // Remove duplicates
    };
  }

  /**
   * Count matches between tokens and indicators
   */
  private countMatches(tokens: string[], indicators: string[]): { count: number; matched: string[] } {
    const matched: string[] = [];
    let count = 0;
    
    for (const indicator of indicators) {
      const indicatorTokens = indicator.toLowerCase().split(/\s+/);
      
      if (indicatorTokens.length === 1) {
        // Single word indicator
        if (tokens.includes(indicatorTokens[0])) {
          count++;
          matched.push(indicator);
        }
      } else {
        // Multi-word indicator - check for phrase match
        const queryText = tokens.join(' ');
        if (queryText.includes(indicator.toLowerCase())) {
          count++;
          matched.push(indicator);
        }
      }
    }
    
    return { count, matched };
  }

  /**
   * Select top intents from scored results
   */
  private selectTopIntents(
    intentScores: Map<BaseIntent, IntentMatchResult>, 
    originalQuery: string
  ): IntentClassification {
    const sortedResults = Array.from(intentScores.values())
      .sort((a, b) => b.score - a.score);
    
    if (sortedResults.length === 0 || sortedResults[0].score === 0) {
      return {
        primary_intent: BaseIntent.GENERAL_EXPLORATION,
        confidence: 0.1,
        secondary_intents: [],
        matched_categories: 0,
        reasoning: ['No clear intent detected, defaulting to general exploration']
      };
    }
    
    const topResult = sortedResults[0];
    const secondaryIntents = sortedResults
      .slice(1, 3)
      .filter(result => result.score > 0.1)
      .map(result => ({
        intent: result.intent,
        confidence: result.score
      }));
    
    const reasoning = [
      `Primary intent: ${topResult.intent} (${(topResult.score * 100).toFixed(1)}% confidence)`,
      `Matched categories: ${topResult.matched_categories}/4`,
      `Key terms: ${topResult.matched_terms.join(', ')}`
    ];
    
    if (topResult.category_scores.subject > 0) {
      reasoning.push(`Subject indicators: ${(topResult.category_scores.subject * 100).toFixed(1)}%`);
    }
    if (topResult.category_scores.analysis > 0) {
      reasoning.push(`Analysis indicators: ${(topResult.category_scores.analysis * 100).toFixed(1)}%`);
    }
    
    return {
      primary_intent: topResult.intent,
      confidence: topResult.score,
      secondary_intents: secondaryIntents,
      matched_categories: topResult.matched_categories,
      reasoning
    };
  }

  /**
   * Get detailed scoring breakdown for debugging
   */
  getDetailedScoring(query: string): Map<BaseIntent, IntentMatchResult> {
    const tokens = this.tokenizeAndNormalize(query);
    const intentScores = new Map<BaseIntent, IntentMatchResult>();
    
    for (const [intent, signature] of Object.entries(this.INTENT_SIGNATURES)) {
      const matchResult = this.scoreIntentMatch(tokens, intent as BaseIntent, signature);
      intentScores.set(intent as BaseIntent, matchResult);
    }
    
    return intentScores;
  }

  /**
   * Test intent classification with sample queries
   */
  testClassification(queries: string[]): Array<{
    query: string;
    classification: IntentClassification;
    processingTime: number;
  }> {
    const results = [];
    
    for (const query of queries) {
      const startTime = performance.now();
      const classification = this.classifyIntent(query);
      const endTime = performance.now();
      
      results.push({
        query,
        classification,
        processingTime: endTime - startTime
      });
    }
    
    return results;
  }
}