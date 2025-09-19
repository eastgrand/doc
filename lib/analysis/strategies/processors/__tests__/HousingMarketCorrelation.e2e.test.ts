/* eslint-disable @typescript-eslint/no-explicit-any */
import { HousingMarketCorrelationProcessor } from '../HousingMarketCorrelationProcessor';
import { RawAnalysisResult } from '../../../types';

describe('HousingMarketCorrelationProcessor E2E', () => {
  let processor: HousingMarketCorrelationProcessor;

  beforeEach(() => {
    processor = new HousingMarketCorrelationProcessor();
  });

  describe('Housing market correlation analysis', () => {
    it('should calculate correlations between housing indices and identify patterns', () => {
      const mockRawData: RawAnalysisResult = {
        success: true,
        results: [
          {
            ID: 'ZIP_98101',
            area_name: 'Seattle Downtown, WA',
            hot_growth_market_index: 92,
            new_home_owner_index: 68,
            home_affordability_index: 15, // Low = expensive
            median_home_price: 850000,
            population_growth_rate: 3.2
          },
          {
            ID: 'ZIP_78702',
            area_name: 'Austin East, TX',  
            hot_growth_market_index: 88,
            new_home_owner_index: 75,
            home_affordability_index: 78, // High = affordable (outlier)
            median_home_price: 320000,
            population_growth_rate: 4.1
          },
          {
            ID: 'ZIP_30309',
            area_name: 'Atlanta Midtown, GA',
            hot_growth_market_index: 45,
            new_home_owner_index: 52,
            home_affordability_index: 65, // Moderate
            median_home_price: 425000,
            population_growth_rate: 1.8
          },
          {
            ID: 'ZIP_10014',
            area_name: 'NYC Meatpacking, NY',
            hot_growth_market_index: 35,
            new_home_owner_index: 25,
            home_affordability_index: 8, // Very expensive, low growth
            median_home_price: 1200000,
            population_growth_rate: 0.5
          }
        ],
        summary: 'Housing market correlation test data',
        feature_importance: [
          { feature: 'hot_growth_market_index', importance: 0.45 },
          { feature: 'home_affordability_index', importance: 0.35 },
          { feature: 'new_home_owner_index', importance: 0.20 }
        ]
      };

      const result = processor.process(mockRawData);

      // Verify basic structure
      expect(result.type).toBe('housing_market_correlation');
      expect(result.records).toHaveLength(4);
      expect(result.targetVariable).toBe('housing_correlation_score');

      // Verify correlation matrix is calculated
      expect(result.correlationMatrix).toBeDefined();
      expect((result as any).correlationMatrix.growth_vs_affordability).toBeLessThan(0); // Should be negative
      expect((result as any).correlationMatrix.growth_vs_newowners).toBeGreaterThan(0); // Should be positive

      // Verify records have correlation scores
      result.records.forEach(record => {
        expect(record.value).toBeGreaterThan(0);
        expect((record as any).housing_correlation_score).toEqual(record.value);
        expect(record.properties.hot_growth_market_index).toBeGreaterThan(0);
      });

      // Verify pattern categorization
      const seattleRecord = result.records.find(r => r.area_id === 'ZIP_98101');
      expect(seattleRecord?.category).toBe('growth_affordability_inverse'); // High growth, low affordability

      const austinRecord = result.records.find(r => r.area_id === 'ZIP_78702');
      expect(austinRecord?.category).toBe('affordability_resilient'); // High growth, high affordability (outlier)
      expect(austinRecord?.properties.outlier_status).toBe('positive_outlier');

      const atlantaRecord = result.records.find(r => r.area_id === 'ZIP_30309');
      expect(atlantaRecord?.category).toBe('balanced_market'); // Low growth, moderate affordability

      // Verify summary mentions correlation insights
      expect(result.summary).toContain('correlation');
      expect(result.summary).toContain('growth');
      expect(result.summary).toContain('affordability');

      // Verify renderer uses correct field
      expect((result as any).renderer.field).toBe('housing_correlation_score');
      expect((result as any).renderer.type).toBe('class-breaks');

      console.log('Housing Correlation Results:', {
        correlations: result.correlationMatrix,
        topRecord: result.records[0],
        summary: result.summary
      });
    });

    it('should handle missing housing indices gracefully', () => {
      const incompleteData: RawAnalysisResult = {
        success: true,
        results: [
          {
            ID: 'ZIP_12345',
            area_name: 'Incomplete Data Area',
            hot_growth_market_index: 75,
            // Missing other indices
            median_home_price: 500000
          },
          {
            ID: 'ZIP_67890', 
            area_name: 'Another Incomplete Area',
            home_affordability_index: 60,
            // Missing growth and new owner indices
          }
        ],
        summary: 'Incomplete housing data test',
        feature_importance: []
      };

      const result = processor.process(incompleteData);

      expect(result.type).toBe('housing_market_correlation');
      expect(result.records).toHaveLength(2);
      
      // Should handle missing data without crashing
      result.records.forEach(record => {
        expect(record.value).toBeGreaterThanOrEqual(0);
        expect(record.value).toBeLessThanOrEqual(100);
      });
    });

    it('should identify outlier markets correctly', () => {
      const outlierTestData: RawAnalysisResult = {
        success: true,
        results: [
          // Typical pattern: High growth, low affordability
          { ID: 'typical1', hot_growth_market_index: 85, home_affordability_index: 20, new_home_owner_index: 60 },
          { ID: 'typical2', hot_growth_market_index: 80, home_affordability_index: 25, new_home_owner_index: 65 },
          { ID: 'typical3', hot_growth_market_index: 75, home_affordability_index: 30, new_home_owner_index: 55 },
          
          // Positive outlier: High growth, high affordability  
          { ID: 'outlier_positive', hot_growth_market_index: 90, home_affordability_index: 85, new_home_owner_index: 80 },
          
          // Negative outlier: Low growth, low affordability
          { ID: 'outlier_negative', hot_growth_market_index: 25, home_affordability_index: 15, new_home_owner_index: 20 }
        ],
        summary: 'Outlier detection test',
        feature_importance: []
      };

      const result = processor.process(outlierTestData);

      // Find outliers
      const positiveOutlier = result.records.find(r => r.area_id === 'outlier_positive');
      const negativeOutlier = result.records.find(r => r.area_id === 'outlier_negative');

      expect(positiveOutlier?.properties.outlier_status).toBe('positive_outlier');
      expect(positiveOutlier?.category).toBe('affordability_resilient');

      expect(negativeOutlier?.properties.outlier_status).toBe('negative_outlier');
      expect(negativeOutlier?.category).toBe('stagnant_expensive');

      // Verify correlation strength
      expect((result as any).correlationMatrix.growth_vs_affordability).toBeLessThan(-0.5); // Strong negative
    });

    it('should use metadata targetVariable override', () => {
      const metadataOverrideData = {
        success: true,
        results: [
          {
            ID: 'meta_test',
            area_name: 'Metadata Test Area',
            custom_housing_score: 88.5,
            hot_growth_market_index: 70,
            home_affordability_index: 40
          }
        ],
        summary: 'Metadata override test',
        feature_importance: [],
        metadata: { targetVariable: 'custom_housing_score' }
      } as any;

      const result = processor.process(metadataOverrideData as any);

      expect(result.targetVariable).toBe('custom_housing_score');
      expect(result.records[0].value).toBe(88.5);
      expect((result.records[0] as any).custom_housing_score).toBe(88.5);
    });

    it('should calculate meaningful correlation statistics', () => {
      // Create data with known correlation pattern
      const correlationTestData: RawAnalysisResult = {
        success: true,
        results: Array.from({ length: 10 }, (_, i) => ({
          ID: `test_${i}`,
          area_name: `Test Area ${i}`,
          hot_growth_market_index: 100 - (i * 10), // Decreasing: 100, 90, 80, ...
          home_affordability_index: i * 10, // Increasing: 0, 10, 20, ... (perfect negative correlation)
          new_home_owner_index: 50 + (i * 2) // Slight increase with growth
        })),
        summary: 'Perfect correlation test',
        feature_importance: []
      };

      const result = processor.process(correlationTestData);

      // Should detect strong negative correlation between growth and affordability
      expect((result as any).correlationMatrix.growth_vs_affordability).toBeLessThan(-0.9);
      
      // Should detect positive correlation between growth and new owners
      expect((result as any).correlationMatrix.growth_vs_newowners).toBeGreaterThan(0);

      // Overall strength should be high
      expect((result as any).correlationMatrix.overall_strength).toBeGreaterThan(0.5);

      // Summary should mention the strong correlation
      expect(result.summary).toContain('strong negative relationship');
      expect(result.summary).toContain('r=');
    });
  });

  describe('Validation', () => {
    it('should validate data with housing indices', () => {
      const validData = {
        success: true,
        results: [
          { ID: 'test1', hot_growth_market_index: 75, home_affordability_index: 45 }
        ]
      };

      expect(processor.validate(validData as RawAnalysisResult)).toBe(true);
    });

    it('should reject invalid data', () => {
      const invalidData = {
        success: false,
        results: []
      };

      expect(processor.validate(invalidData as RawAnalysisResult)).toBe(false);
    });

    it('should reject data without housing fields', () => {
      const noHousingData = {
        success: true,
        results: [
          { ID: 'test1', random_field: 123, another_field: 'abc' }
        ]
      };

      expect(processor.validate(noHousingData as RawAnalysisResult)).toBe(false);
    });
  });
});