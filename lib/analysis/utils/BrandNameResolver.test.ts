import { BrandNameResolver } from './BrandNameResolver';

describe('BrandNameResolver', () => {
  describe('extractBrandName', () => {
    it('should extract brand names from field aliases', () => {
      const fieldAliases = {
        'mp30034a_b_p': 'Nike Market Share (%)',
        'mp30029a_b_p': 'Adidas Purchase Frequency',
        'value_MP30032A_B_P': 'Jordan Brand Loyalty Score',
        'brand_pref_001': 'Brand Affinity - Puma',
        'market_share_apple': 'Market Share: Apple',
        'customer_loyalty': 'Starbucks Customer Loyalty Index'
      };

      const resolver = new BrandNameResolver(fieldAliases);

      expect(resolver.extractBrandName('mp30034a_b_p')).toBe('Nike');
      expect(resolver.extractBrandName('mp30029a_b_p')).toBe('Adidas');
      expect(resolver.extractBrandName('value_MP30032A_B_P')).toBe('Jordan');
      expect(resolver.extractBrandName('brand_pref_001')).toBe('Puma');
      expect(resolver.extractBrandName('market_share_apple')).toBe('Apple');
      expect(resolver.extractBrandName('customer_loyalty')).toBe('Starbucks');
    });

    it('should use legacy field name patterns as fallback when no aliases provided', () => {
      const resolver = new BrandNameResolver(); // No field aliases

      expect(resolver.extractBrandName('mp30034a_b_p')).toBe('Legacy_Brand_A');
      expect(resolver.extractBrandName('value_MP30029A_B_P')).toBe('Legacy_Brand_B');
      expect(resolver.extractBrandName('mp30032a_b')).toBe('Legacy_Brand_C');
    });

    it('should return null for unknown fields', () => {
      const resolver = new BrandNameResolver();

      expect(resolver.extractBrandName('unknown_field')).toBeNull();
      expect(resolver.extractBrandName('generic_metric')).toBeNull();
    });

    it('should cache results for performance', () => {
      const fieldAliases = { 'test_field': 'Nike Test Metric' };
      const resolver = new BrandNameResolver(fieldAliases);

      // First call
      const result1 = resolver.extractBrandName('test_field');
      // Second call should use cache
      const result2 = resolver.extractBrandName('test_field');

      expect(result1).toBe('Nike');
      expect(result2).toBe('Nike');
      expect(resolver.getCacheStats().size).toBe(1);
    });
  });

  describe('getBrandedText', () => {
    it('should replace Brand A and Brand B with actual names', () => {
      const resolver = new BrandNameResolver();

      const result = resolver.getBrandedText(
        'Brand A vs competitors performance differential. Brand B shows strong competitive pressure.',
        'Nike',
        'Adidas'
      );

      expect(result).toBe('Nike vs competitors performance differential. Adidas shows strong competitive pressure.');
    });

    it('should replace only Brand A when Brand B name not provided', () => {
      const resolver = new BrandNameResolver();

      const result = resolver.getBrandedText(
        'Brand A dominates with 67% market share',
        'Nike'
      );

      expect(result).toBe('Nike dominates with 67% market share');
    });
  });

  describe('brand name parsing strategies', () => {
    it('should handle various alias formats', () => {
      const testCases = [
        { alias: 'Nike Market Share (%)', expected: 'Nike' },
        { alias: 'Brand Affinity - Adidas', expected: 'Adidas' },
        { alias: 'Market Share: Jordan', expected: 'Jordan' },
        { alias: 'Puma Purchase Intent Score', expected: 'Puma' },
        { alias: 'Apple Brand Loyalty', expected: 'Apple' },
        { alias: 'Customer Satisfaction | Samsung', expected: 'Samsung' },
        { alias: 'Toyota (Brand Preference)', expected: 'Toyota' }
      ];

      const resolver = new BrandNameResolver();

      testCases.forEach(({ alias, expected }) => {
        const fieldAliases = { 'test_field': alias };
        const testResolver = new BrandNameResolver(fieldAliases);
        expect(testResolver.extractBrandName('test_field')).toBe(expected);
      });
    });

    it('should extract brand names dynamically from project field aliases', () => {
      const fieldAliases = {
        'brand_x': 'Acme Corporation Market Share',
        'brand_y': 'GlobalTech Purchase Frequency Index',
        'generic_metric': 'Overall Satisfaction Score'
      };

      const resolver = new BrandNameResolver(fieldAliases);

      expect(resolver.extractBrandName('brand_x')).toBe('Acme');
      expect(resolver.extractBrandName('brand_y')).toBe('GlobalTech'); 
      expect(resolver.extractBrandName('generic_metric')).toBeNull(); // No clear brand name
    });
  });
});