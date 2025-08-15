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
   */
  private extractBrandFromStart(alias: string): string | null {
    const knownBrands = this.getKnownBrandNames();
    
    for (const brand of knownBrands) {
      if (alias.toLowerCase().startsWith(brand.toLowerCase())) {
        // Verify it's a word boundary (not partial match)
        const nextChar = alias[brand.length];
        if (!nextChar || /\s|[^\w]/.test(nextChar)) {
          return this.capitalizeFirstLetter(brand);
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
   * Uses heuristics to identify brand-like words
   */
  private extractPotentialBrands(alias: string): string[] {
    const brands: string[] = [];
    const words = alias.split(/\s+|[-:|()\[\]]/);
    
    for (const word of words) {
      const cleanWord = word.trim().replace(/[^\w]/g, '');
      if (this.looksLikeBrandName(cleanWord)) {
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
}