/**
 * Dynamic Field Detection Utility
 * 
 * Replaces hardcoded field mappings in processors with intelligent field detection
 * based on field patterns, naming conventions, and data characteristics.
 */

export interface FieldMapping {
  field: string;
  patterns: string[];
  importance: number;
  category: 'demographic' | 'economic' | 'geographic' | 'brand' | 'score' | 'calculated';
  dataType?: 'number' | 'string' | 'percentage';
  calculated?: boolean;
}

export interface DetectedField {
  field: string;
  source: string;
  importance: number;
  category: string;
  confidence: number;
}

export class DynamicFieldDetector {
  
  /**
   * Standard field patterns for different analysis types
   */
  private static FIELD_PATTERNS: Record<string, FieldMapping[]> = {
    demographic: [
      {
        field: 'total_population',
        patterns: ['total_population', 'population', 'TOTPOP_CY', 'TOTPOP', 'POP_TOTAL', 'tot_pop'],
        importance: 20,
        category: 'demographic',
        dataType: 'number'
      },
      {
        field: 'median_income',
        patterns: ['median_income', 'AVGHINC_CY', 'MEDDI_CY', 'income_median', 'med_income', 'household_income'],
        importance: 18,
        category: 'economic',
        dataType: 'number'
      },
      {
        field: 'diversity_index',
        patterns: ['diversity_index', 'DIVINDX_CY', 'diversity', 'div_index'],
        importance: 10,
        category: 'demographic',
        dataType: 'number'
      },
      {
        field: 'age_median',
        patterns: ['median_age', 'MEDAGE_CY', 'age_median', 'avg_age'],
        importance: 8,
        category: 'demographic',
        dataType: 'number'
      }
    ],
    brand: [
      {
        field: 'target_brand_share',
        patterns: ['target_brand_share', 'brand_share', 'market_share', 'share_pct'],
        importance: 25,
        category: 'brand',
        dataType: 'percentage'
      },
      {
        field: 'competitor_share',
        patterns: ['competitor_share', 'comp_share', 'competitive_share'],
        importance: 20,
        category: 'brand',
        dataType: 'percentage'
      },
      {
        field: 'brand_awareness',
        patterns: ['brand_awareness', 'awareness', 'brand_recognition'],
        importance: 15,
        category: 'brand',
        dataType: 'percentage'
      }
    ],
    score: [
      {
        field: 'competitive_advantage_score',
        patterns: ['competitive_advantage_score', 'comp_advantage', 'advantage_score'],
        importance: 25,
        category: 'score',
        dataType: 'number'
      },
      {
        field: 'demographic_opportunity_score',
        patterns: ['demographic_opportunity_score', 'demo_opportunity', 'opportunity_score'],
        importance: 15,
        category: 'score',
        dataType: 'number'
      },
      {
        field: 'strategic_value_score',
        patterns: ['strategic_value_score', 'strategic_score', 'value_score'],
        importance: 30,
        category: 'score',
        dataType: 'number'
      }
    ],
    performance: [
      {
        field: 'accuracy_score',
        patterns: ['accuracy_score', 'accuracy', 'model_accuracy'],
        importance: 25,
        category: 'score',
        dataType: 'number'
      },
      {
        field: 'precision_score',
        patterns: ['precision_score', 'precision', 'model_precision'],
        importance: 20,
        category: 'score',
        dataType: 'number'
      },
      {
        field: 'recall_score',
        patterns: ['recall_score', 'recall', 'model_recall'],
        importance: 18,
        category: 'score',
        dataType: 'number'
      },
      {
        field: 'f1_score',
        patterns: ['f1_score', 'f1', 'f_score'],
        importance: 15,
        category: 'score',
        dataType: 'number'
      }
    ]
  };

  /**
   * Dynamically detect relevant fields from dataset records
   */
  static detectFields(
    records: any[],
    analysisType: string,
    maxFields: number = 6
  ): DetectedField[] {
    if (!records || records.length === 0) {
      return [];
    }

    const sampleRecord = records[0];
    const availableFields = Object.keys(sampleRecord);
    const detectedFields: DetectedField[] = [];

    // Get relevant field patterns for the analysis type
    const relevantPatterns = this.getRelevantPatterns(analysisType);

    console.log(`[DynamicFieldDetector] Detecting fields for ${analysisType}:`, {
      availableFields: availableFields.length,
      patterns: relevantPatterns.length
    });

    // Match available fields to patterns
    for (const pattern of relevantPatterns) {
      const matchedField = this.findBestFieldMatch(availableFields, pattern);
      if (matchedField) {
        detectedFields.push({
          field: pattern.field,
          source: matchedField.field,
          importance: pattern.importance,
          category: pattern.category,
          confidence: matchedField.confidence
        });
      }
    }

    // Add any high-value fields that weren't matched by patterns
    const unmatched = this.findUnmatchedHighValueFields(availableFields, detectedFields, records[0]);
    detectedFields.push(...unmatched);

    // Sort by importance and confidence, then take top N
    return detectedFields
      .sort((a, b) => (b.importance * b.confidence) - (a.importance * a.confidence))
      .slice(0, maxFields);
  }

  /**
   * Get relevant field patterns for an analysis type
   */
  private static getRelevantPatterns(analysisType: string): FieldMapping[] {
    const patterns: FieldMapping[] = [];
    
    // Always include demographic and geographic basics
    patterns.push(...this.FIELD_PATTERNS.demographic);

    // Add analysis-specific patterns
    switch (analysisType.toLowerCase().replace(/[-_]/g, '')) {
      case 'strategic':
      case 'strategicanalysis':
        patterns.push(...this.FIELD_PATTERNS.brand);
        patterns.push(...this.FIELD_PATTERNS.score);
        break;
      case 'competitive':
      case 'competitiveanalysis':
        patterns.push(...this.FIELD_PATTERNS.brand);
        break;
      case 'modelperformance':
      case 'performance':
        patterns.push(...this.FIELD_PATTERNS.performance);
        break;
      case 'brandanalysis':
      case 'branddifference':
        patterns.push(...this.FIELD_PATTERNS.brand);
        break;
      default:
        // Generic analysis - include score patterns
        patterns.push(...this.FIELD_PATTERNS.score);
    }

    return patterns;
  }

  /**
   * Find the best matching field for a pattern
   */
  private static findBestFieldMatch(
    availableFields: string[],
    pattern: FieldMapping
  ): { field: string; confidence: number } | null {
    let bestMatch = { field: '', confidence: 0 };

    for (const field of availableFields) {
      for (const searchPattern of pattern.patterns) {
        const confidence = this.calculateFieldMatchConfidence(field, searchPattern);
        if (confidence > bestMatch.confidence && confidence >= 0.6) {
          bestMatch = { field, confidence };
        }
      }
    }

    return bestMatch.confidence > 0 ? bestMatch : null;
  }

  /**
   * Calculate confidence score for field pattern matching
   */
  private static calculateFieldMatchConfidence(field: string, pattern: string): number {
    const fieldLower = field.toLowerCase();
    const patternLower = pattern.toLowerCase();

    // Exact match
    if (fieldLower === patternLower) return 1.0;

    // Contains match
    if (fieldLower.includes(patternLower) || patternLower.includes(fieldLower)) {
      return 0.8;
    }

    // Word boundary match
    const fieldWords = fieldLower.split(/[_\s-]+/);
    const patternWords = patternLower.split(/[_\s-]+/);
    
    let matchedWords = 0;
    for (const patternWord of patternWords) {
      if (fieldWords.some(fw => fw === patternWord || fw.includes(patternWord))) {
        matchedWords++;
      }
    }
    
    const wordMatchRatio = matchedWords / patternWords.length;
    if (wordMatchRatio >= 0.5) {
      return 0.6 + (wordMatchRatio * 0.2);
    }

    // Fuzzy similarity for common abbreviations
    if (this.isFuzzySimilar(fieldLower, patternLower)) {
      return 0.5;
    }

    return 0;
  }

  /**
   * Check for fuzzy similarity (common abbreviations)
   */
  private static isFuzzySimilar(field: string, pattern: string): boolean {
    const abbreviations: Record<string, string[]> = {
      'pop': ['population', 'pop_total', 'totpop'],
      'inc': ['income', 'household_income', 'median_income'],
      'div': ['diversity', 'diversity_index'],
      'comp': ['competitive', 'comparison', 'competitor'],
      'demo': ['demographic', 'demographics'],
      'strat': ['strategic', 'strategy']
    };

    for (const [abbrev, expansions] of Object.entries(abbreviations)) {
      if ((field.includes(abbrev) && expansions.some(exp => pattern.includes(exp))) ||
          (pattern.includes(abbrev) && expansions.some(exp => field.includes(exp)))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Find unmatched fields that appear to be high-value based on data characteristics
   */
  private static findUnmatchedHighValueFields(
    availableFields: string[],
    detectedFields: DetectedField[],
    sampleRecord: any
  ): DetectedField[] {
    const matchedSources = new Set(detectedFields.map(df => df.source));
    const unmatchedFields: DetectedField[] = [];

    for (const field of availableFields) {
      if (matchedSources.has(field)) continue;

      const value = sampleRecord[field];
      
      // Skip non-numeric fields for now
      if (typeof value !== 'number' || isNaN(value)) continue;

      // Identify potential score fields
      if (this.looksLikeScoreField(field, value)) {
        unmatchedFields.push({
          field: `dynamic_${field}`,
          source: field,
          importance: 5, // Lower importance for unmatched
          category: 'score',
          confidence: 0.4
        });
      }
    }

    return unmatchedFields.slice(0, 2); // Limit to 2 additional fields
  }

  /**
   * Check if a field looks like it contains score/metric data
   */
  private static looksLikeScoreField(field: string, value: number): boolean {
    const fieldLower = field.toLowerCase();
    
    // Contains score-like keywords
    if (['score', 'index', 'metric', 'rate', 'ratio', 'pct', 'percent'].some(keyword => 
        fieldLower.includes(keyword))) {
      return true;
    }

    // Numeric value in reasonable score range
    if (value >= 0 && value <= 1000 && !fieldLower.includes('id') && !fieldLower.includes('code')) {
      return true;
    }

    return false;
  }

  /**
   * Create dynamic field definitions for backward compatibility
   */
  static createFieldDefinitions(detectedFields: DetectedField[]): Array<{
    field: string;
    source: string | string[];
    importance: number;
    calculated?: boolean;
  }> {
    return detectedFields.map(df => ({
      field: df.field,
      source: df.source,
      importance: df.importance,
      calculated: false
    }));
  }
}