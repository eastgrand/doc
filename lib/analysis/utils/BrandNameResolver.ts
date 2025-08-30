/**
 * BrandNameResolver - Utility for extracting actual brand names from field aliases
 * 
 * This utility helps processors convert generic "Brand A/B" terminology into
 * actual brand names (e.g., "Nike", "Adidas") based on field-aliases configuration.
 */

export interface BrandMetric {
  value: number;
  fieldName: string;
  brandName: string;
}

export interface BrandField {
  fieldName: string;
  value: number;
  brandName: string;
  isTarget: boolean;
}

// ============================================================================
// PROJECT BRAND CONFIGURATION - EDIT HERE WHEN CHANGING PROJECTS
// ============================================================================

/**
 * Current Project: Red Bull Energy Drinks Market Analysis
 * 
 * To change to a different project:
 * 1. Update TARGET_BRAND with the primary brand field and name
 * 2. Update COMPETITOR_BRANDS with relevant competitors
 * 3. Update PROJECT_INDUSTRY name
 */
const TARGET_BRAND = {
  fieldName: 'MP12207A_B_P',  // Red Bull market share percentage
  brandName: 'Red Bull'
};

const COMPETITOR_BRANDS = [
  { fieldName: 'MP12206A_B_P', brandName: 'Monster Energy' },  // Monster market share percentage
  { fieldName: 'MP12205A_B_P', brandName: '5-Hour Energy' },   // 5-Hour Energy market share percentage
  { fieldName: 'MP12097A_B_P', brandName: 'All Energy Drinks' } // Total energy drinks market
];

const MARKET_CATEGORY = {
  fieldName: 'MP12097A_B_P',  // Total energy drinks market share percentage
  brandName: 'Total Energy Drinks Market'
};

const PROJECT_INDUSTRY = 'Energy Drinks';

// ============================================================================

export class BrandNameResolver {
  private fieldAliases: Record<string, string>;
  private brandNameCache: Map<string, string> = new Map();

  constructor(fieldAliases?: Record<string, string>) {
    this.fieldAliases = fieldAliases || {};
  }

  /**
   * Extract brand name from field alias using various parsing strategies
   * 
   * @param fieldName - The raw field name (e.g., "mp30034a_b_p")
   * @returns Brand name or null if not found
   * 
   * @example
   * // Field alias: "Nike Market Share (%)"
   * extractBrandName("mp30034a_b_p") // → "Nike"
   * 
   * // Field alias: "Adidas Purchase Frequency" 
   * extractBrandName("mp30029a_b_p") // → "Adidas"
   */
  extractBrandName(fieldName: string): string | null {
    // Check cache first for performance
    if (this.brandNameCache.has(fieldName)) {
      return this.brandNameCache.get(fieldName) || null;
    }

    const alias = this.fieldAliases[fieldName];
    if (!alias) {
      // Try fallback strategies for legacy field names
      const fallbackName = this.extractFromLegacyFieldName(fieldName);
      this.brandNameCache.set(fieldName, fallbackName || '');
      return fallbackName;
    }

    const brandName = this.parseBrandFromAlias(alias);
    this.brandNameCache.set(fieldName, brandName || '');
    return brandName;
  }

  /**
   * Parse brand name from human-readable alias
   * 
   * Handles various alias formats:
   * - "Nike Market Share (%)" → "Nike"
   * - "Brand Affinity - Adidas" → "Adidas"
   * - "Market Share: Jordan" → "Jordan"
   * - "Puma Purchase Intent Score" → "Puma"
   */
  private parseBrandFromAlias(alias: string): string | null {
    // Remove common suffixes and prefixes to isolate brand name
    const cleanAlias = alias.trim();

    // Strategy 1: Brand name at the beginning
    const brandAtStart = this.extractBrandFromStart(cleanAlias);
    if (brandAtStart) return brandAtStart;

    // Strategy 2: Brand name after separators (-, :, |)
    const brandAfterSeparator = this.extractBrandAfterSeparator(cleanAlias);
    if (brandAfterSeparator) return brandAfterSeparator;

    // Strategy 3: Brand name before common terms
    const brandBeforeTerm = this.extractBrandBeforeCommonTerm(cleanAlias);
    if (brandBeforeTerm) return brandBeforeTerm;

    return null;
  }

  /**
   * Extract brand name from the beginning of alias
   * "Nike Market Share (%)" → "Nike"
   * "H&R Block Market Share (%)" → "H&R Block"
   */
  private extractBrandFromStart(alias: string): string | null {
    const knownBrands = this.getKnownBrandNames();
    
    // Sort by length descending to match longer brand names first (e.g., "H&R Block" before "Block")
    const sortedBrands = knownBrands.sort((a, b) => b.length - a.length);
    
    for (const brand of sortedBrands) {
      if (alias.toLowerCase().startsWith(brand.toLowerCase())) {
        // Verify it's a word boundary (not partial match)
        const nextChar = alias[brand.length];
        if (!nextChar || /\s|[^\w]/.test(nextChar)) {
          return this.capitalizeFirstLetter(brand);
        }
      }
    }
    
    // Fallback: try to extract first 1-3 words before common terms
    const commonTerms = ['market', 'share', 'brand', 'purchase', 'loyalty', 'affinity'];
    const corporateTerms = ['corporation', 'corp', 'company', 'inc', 'ltd', 'llc', 'customer', 'index']; // Terms to exclude from brand names
    const words = alias.split(/\s+/);
    
    for (let wordCount = 3; wordCount >= 1; wordCount--) {
      const candidateBrand = words.slice(0, wordCount).join(' ');
      const remainingWords = words.slice(wordCount);
      
      // Check if any remaining words are common terms (indicating this is likely a brand name)
      if (remainingWords.some(word => commonTerms.includes(word.toLowerCase()))) {
        // Make sure candidate doesn't contain common terms or corporate terms itself
        const candidateLower = candidateBrand.toLowerCase();
        if (!commonTerms.some(term => candidateLower.includes(term)) && 
            !corporateTerms.some(term => candidateLower.includes(term))) {
          return candidateBrand;
        }
      }
    }
    
    return null;
  }

  /**
   * Extract brand name after common separators
   * "Brand Affinity - Nike" → "Nike"
   * "Market Share: Adidas" → "Adidas"
   */
  private extractBrandAfterSeparator(alias: string): string | null {
    const separators = [' - ', ': ', ' | ', ' / ', ' (', ' – '];
    const knownBrands = this.getKnownBrandNames();
    
    for (const separator of separators) {
      if (alias.includes(separator)) {
        const parts = alias.split(separator);
        for (let i = 1; i < parts.length; i++) {
          const part = parts[i].trim().replace(/[^\w\s]/g, ''); // Remove punctuation
          const words = part.split(/\s+/);
          
          // Check if first word(s) match known brands
          for (const brand of knownBrands) {
            if (words[0]?.toLowerCase() === brand.toLowerCase()) {
              return this.capitalizeFirstLetter(brand);
            }
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Extract brand name before common market research terms
   * "Nike Purchase Intent" → "Nike"  
   * "Adidas Brand Loyalty" → "Adidas"
   */
  private extractBrandBeforeCommonTerm(alias: string): string | null {
    const commonTerms = [
      'market share', 'purchase', 'brand', 'loyalty', 'affinity', 
      'preference', 'intent', 'awareness', 'consideration', 'share',
      'frequency', 'penetration', 'reach', 'adoption'
    ];
    
    const knownBrands = this.getKnownBrandNames();
    const aliasLower = alias.toLowerCase();
    
    for (const term of commonTerms) {
      if (aliasLower.includes(term)) {
        // Look for brand names before this term
        const beforeTerm = aliasLower.substring(0, aliasLower.indexOf(term)).trim();
        const words = beforeTerm.split(/\s+/);
        
        for (const brand of knownBrands) {
          if (words.includes(brand.toLowerCase())) {
            return this.capitalizeFirstLetter(brand);
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Fallback strategy: extract brand from legacy field names
   * Uses pattern matching without hardcoded brand assumptions
   */
  private extractFromLegacyFieldName(fieldName: string): string | null {
    // Only try pattern-based extraction if we have no field aliases
    // This prevents falling back to hardcoded brands when we should be project-agnostic
    if (Object.keys(this.fieldAliases).length > 0) {
      return null;
    }

    // Legacy patterns - but we'll only return generic identifiers
    // The actual brand names should come from field aliases in the current project
    const legacyPatterns = [
      /mp30034a?_?b?_?p?/i,  // Pattern for first brand
      /mp30029a?_?b?_?p?/i,  // Pattern for second brand  
      /mp30032a?_?b?_?p?/i,  // Pattern for third brand
    ];

    for (let i = 0; i < legacyPatterns.length; i++) {
      if (legacyPatterns[i].test(fieldName)) {
        // Return generic brand identifier instead of hardcoded names
        return `Legacy_Brand_${String.fromCharCode(65 + i)}`; // Legacy_Brand_A, Legacy_Brand_B, etc.
      }
    }

    return null;
  }

  /**
   * Get list of brand names dynamically from field aliases
   * This extracts brands only from the current project's data
   */
  private getKnownBrandNames(): string[] {
    const brands = new Set<string>();
    
    // Extract potential brand names from all field aliases
    for (const alias of Object.values(this.fieldAliases)) {
      const extractedBrands = this.extractPotentialBrands(alias);
      extractedBrands.forEach(brand => brands.add(brand));
    }
    
    return Array.from(brands);
  }

  /**
   * Extract potential brand names from a single alias
   * Uses heuristics to identify brand-like words and multi-word brands
   */
  private extractPotentialBrands(alias: string): string[] {
    const brands: string[] = [];
    
    // Strategy 1: Look for multi-word brands before common terms
    const commonTerms = ['market', 'share', 'brand', 'purchase', 'loyalty', 'affinity', 'preference'];
    const words = alias.split(/\s+/);
    
    // Try 1-3 word combinations at the start
    for (let wordCount = 3; wordCount >= 1; wordCount--) {
      if (words.length >= wordCount) {
        const candidateBrand = words.slice(0, wordCount).join(' ');
        const remainingWords = words.slice(wordCount);
        
        // Check if this looks like a brand name followed by common terms
        if (remainingWords.some(word => commonTerms.includes(word.toLowerCase()))) {
          if (!commonTerms.some(term => candidateBrand.toLowerCase().includes(term))) {
            brands.push(candidateBrand);
          }
        }
      }
    }
    
    // Strategy 2: Look for individual words that look like brand names
    const splitWords = alias.split(/\s+|[-:|()\[\]]/);
    for (const word of splitWords) {
      const cleanWord = word.trim().replace(/[^\w&]/g, ''); // Keep & for brands like H&R
      if (this.looksLikeBrandName(cleanWord) && !brands.some(b => b.includes(cleanWord))) {
        brands.push(this.capitalizeFirstLetter(cleanWord));
      }
    }
    
    return brands;
  }

  /**
   * Heuristic to determine if a word looks like a brand name
   * Brand names are typically:
   * - Capitalized words
   * - 2+ characters long
   * - Not common market research terms
   */
  private looksLikeBrandName(word: string): boolean {
    if (!word || word.length < 2) return false;
    
    // Skip common market research terms
    const commonTerms = new Set([
      'market', 'share', 'brand', 'purchase', 'loyalty', 'affinity', 
      'preference', 'intent', 'awareness', 'consideration', 'frequency',
      'penetration', 'reach', 'adoption', 'score', 'index', 'value',
      'customer', 'consumer', 'demographic', 'segment', 'analysis',
      'overall', 'satisfaction', 'total', 'average', 'mean', 'median',
      'performance', 'growth', 'trend', 'competitive', 'strategic'
    ]);
    
    if (commonTerms.has(word.toLowerCase())) return false;
    
    // Must start with capital letter (brand names are proper nouns)
    return /^[A-Z]/.test(word);
  }

  /**
   * Normalize brand name capitalization while preserving internal capitals (like GlobalTech)
   */
  private capitalizeFirstLetter(brand: string): string {
    if (!brand) return brand;
    
    // If the brand is already properly capitalized (starts with capital, has mixed case), keep it as-is
    if (/^[A-Z]/.test(brand) && /[a-z]/.test(brand) && /[A-Z].*[A-Z]/.test(brand)) {
      return brand;
    }
    
    // Otherwise, just capitalize the first letter and lowercase the rest
    return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
  }

  /**
   * Replace generic brand terminology with actual brand names
   * 
   * @param text - Text containing "Brand A" or "Brand B" 
   * @param brandAName - Actual name for Brand A
   * @param brandBName - Actual name for Brand B (optional)
   * @returns Text with branded terminology
   * 
   * @example
   * getBrandedText(
   *   "Brand A vs competitors performance differential", 
   *   "Nike", 
   *   "Adidas"
   * )
   * // → "Nike vs competitors performance differential"
   */
  getBrandedText(text: string, brandAName: string, brandBName?: string): string {
    let brandedText = text.replace(/Brand A/g, brandAName);
    
    if (brandBName) {
      brandedText = brandedText.replace(/Brand B/g, brandBName);
    }
    
    return brandedText;
  }

  /**
   * Get branded version of a term/phrase
   * 
   * @example
   * getBrandedTerm("Brand A dominance", "Nike") 
   * // → "Nike dominance"
   */
  getBrandedTerm(genericTerm: string, brandName: string): string {
    return this.getBrandedText(genericTerm, brandName);
  }

  /**
   * Clear the brand name cache (useful for testing or when field aliases change)
   */
  clearCache(): void {
    this.brandNameCache.clear();
  }

  /**
   * Get cache statistics for monitoring performance
   */
  getCacheStats(): { size: number; hitRate?: number } {
    return { 
      size: this.brandNameCache.size 
      // Hit rate tracking could be added if needed for performance monitoring
    };
  }

  /**
   * Get project-specific brand fields from a data record
   * Only returns brands defined in the project configuration
   * 
   * @param record - Data record to scan for brand fields
   * @returns Array of brand fields with resolved names (only project-relevant brands)
   */
  detectBrandFields(record: any): BrandField[] {
    const brandFields: BrandField[] = [];
    
    // Add target brand if present (check both original and lowercase versions)
    const targetField = TARGET_BRAND.fieldName;
    const targetValue = record[targetField] ?? record[targetField.toLowerCase()];
    
    if (targetValue !== undefined && targetValue !== null) {
      const numValue = Number(targetValue);
      if (!isNaN(numValue)) {
        brandFields.push({
          fieldName: targetField,
          value: numValue,
          brandName: TARGET_BRAND.brandName,
          isTarget: true
        });
      }
    }
    
    // Add competitor brands if present (check both original and lowercase versions)
    for (const competitor of COMPETITOR_BRANDS) {
      const fieldName = competitor.fieldName;
      const fieldValue = record[fieldName] ?? record[fieldName.toLowerCase()];
      
      if (fieldValue !== undefined && fieldValue !== null) {
        const numValue = Number(fieldValue);
        if (!isNaN(numValue)) {
          brandFields.push({
            fieldName,
            value: numValue,
            brandName: competitor.brandName,
            isTarget: false
          });
        }
      }
    }
    
    // Sort by value descending to prioritize major brands
    return brandFields.sort((a, b) => b.value - a.value);
  }

  /**
   * Get the target brand field name from project configuration
   * 
   * @returns Target brand field name (e.g., MP10128A_B_P for H&R Block)
   */
  getTargetBrandField(): string {
    return TARGET_BRAND.fieldName;
  }

  /**
   * Get the target brand name from project configuration
   * 
   * @returns Target brand name (e.g., "H&R Block")
   */
  getTargetBrandName(): string {
    return TARGET_BRAND.brandName;
  }

  /**
   * Calculate market gap dynamically from actual competitor data
   * 
   * @param record - Data record with brand market share data
   * @returns Market gap percentage (5-95% realistic bounds)
   */
  calculateMarketGap(record: any): number {
    const target = this.getTargetBrandField();
    const targetShare = Number(record[target] ?? record[target.toLowerCase()]) || 0;
    
    // Get all competitor brand shares
    const allBrandFields = this.detectBrandFields(record);
    const competitorShares = allBrandFields
      .filter(field => field.fieldName !== target)
      .map(field => field.value);
    
    const totalCompetitorShare = competitorShares.reduce((sum, share) => sum + share, 0);
    const totalKnownShare = targetShare + totalCompetitorShare;
    
    // Market gap = 100% - total known market shares
    const rawGap = Math.max(0, 100 - totalKnownShare);
    
    // Ensure realistic bounds (5-95%)
    const marketGap = Math.max(5, Math.min(95, rawGap));
    
    return Math.round(marketGap * 100) / 100;
  }

  /**
   * Get competitor brand information excluding the target brand
   * 
   * @param record - Data record with brand data
   * @returns Array of competitor brand information
   */
  getCompetitorBrands(record: any): BrandField[] {
    const target = this.getTargetBrandField();
    const allBrands = this.detectBrandFields(record);
    
    return allBrands.filter(brand => brand.fieldName !== target);
  }

}