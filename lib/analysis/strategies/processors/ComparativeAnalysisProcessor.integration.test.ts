import { ComparativeAnalysisProcessor } from './ComparativeAnalysisProcessor';
import { RawAnalysisResult } from '../../types';

describe('ComparativeAnalysisProcessor Integration', () => {
  it('should use actual brand names from field aliases in analysis output', () => {
    const fieldAliases = {
      'mp30034a_b_p': 'Nike Market Share (%)',
      'mp30029a_b_p': 'Adidas Market Share (%)',
      'demographic_score': 'Demographic Fit Score'
    };

    const processor = new ComparativeAnalysisProcessor(fieldAliases);

    const mockRawData: RawAnalysisResult = {
      success: true,
      results: [
        {
          ID: 'area_001',
          area_name: 'Miami, FL',
          zip_code: '33101',
          mp30034a_b_p: 25.5, // Nike market share
          mp30029a_b_p: 18.2, // Adidas market share
          demographic_score: 78.5,
          target_value: 72.3
        },
        {
          ID: 'area_002', 
          area_name: 'Orlando, FL',
          zip_code: '32801',
          mp30034a_b_p: 31.2, // Nike market share
          mp30029a_b_p: 22.8, // Adidas market share
          demographic_score: 85.1,
          target_value: 81.7
        }
      ],
      summary: 'Test comparative analysis data',
      feature_importance: []
    };

    const result = processor.process(mockRawData);

    // Verify that brand names are extracted and used
    const firstRecord = result.records[0];
    expect(firstRecord.properties.brand_a_name).toBe('Nike');
    expect(firstRecord.properties.brand_b_name).toBe('Adidas');

    // Verify summary uses actual brand names
    expect(result.summary).toContain('Nike vs competitors performance differential');
    expect(result.summary).toContain('Nike-dominant markets');
    expect(result.summary).toContain('Adidas-dominant markets');
    expect(result.summary).not.toContain('Brand A');
    expect(result.summary).not.toContain('Brand B');

    // Verify brand metrics are calculated correctly
    expect(firstRecord.properties.brand_a_share).toBe(25.5);
    expect(firstRecord.properties.brand_b_share).toBe(18.2);
    expect(firstRecord.properties.brand_dominance).toBe(25.5 - 18.2);
  });

  it('should fall back to legacy brand patterns when no field aliases provided', () => {
    const processor = new ComparativeAnalysisProcessor(); // No field aliases

    const mockRawData: RawAnalysisResult = {
      success: true,
      results: [
        {
          ID: 'area_001',
          area_name: 'Test Area',
          mp30034a_b_p: 25.5,
          mp30029a_b_p: 18.2,
          target_value: 72.3
        }
      ],
      summary: 'Test data',
      feature_importance: []
    };

    const result = processor.process(mockRawData);

    // Should fall back to legacy pattern names
    const firstRecord = result.records[0];
    expect(firstRecord.properties.brand_a_name).toBe('Legacy_Brand_A'); // From legacy pattern
    expect(firstRecord.properties.brand_b_name).toBe('Legacy_Brand_B'); // From legacy pattern
  });

  it('should handle mixed brand scenarios gracefully', () => {
    const fieldAliases = {
      'mp30034a_b_p': 'Acme Corporation Market Share (%)',
      // No alias for second field - should fall back to Brand B when field aliases exist
    };

    const processor = new ComparativeAnalysisProcessor(fieldAliases);

    const mockRawData: RawAnalysisResult = {
      success: true,
      results: [
        {
          ID: 'area_001',
          area_name: 'Test Area',
          mp30034a_b_p: 25.5, // Has alias -> Acme
          mp30029a_b_p: 18.2, // No alias -> falls back to Brand B
          target_value: 72.3
        }
      ],
      summary: 'Test data',
      feature_importance: []
    };

    const result = processor.process(mockRawData);

    const firstRecord = result.records[0];
    expect(firstRecord.properties.brand_a_name).toBe('Acme');    // From field alias
    expect(firstRecord.properties.brand_b_name).toBe('Brand B');  // Fallback when aliases exist but field not found

    // Summary should use the actual brand names
    expect(result.summary).toContain('Acme vs competitors');
  });

  it('should use Brand A/B as ultimate fallback for unknown fields', () => {
    const fieldAliases = {
      'custom_brand_x': 'Mystery Brand X Share',
      'custom_brand_y': 'Unknown Brand Y Share'
    };

    const processor = new ComparativeAnalysisProcessor(fieldAliases);

    const mockRawData: RawAnalysisResult = {
      success: true,
      results: [
        {
          ID: 'area_001',
          area_name: 'Test Area',
          custom_brand_x: 25.5, // Unknown brand -> Brand A
          custom_brand_y: 18.2, // Unknown brand -> Brand B
          target_value: 72.3
        }
      ],
      summary: 'Test data',
      feature_importance: []
    };

    const result = processor.process(mockRawData);

    const firstRecord = result.records[0];
    expect(firstRecord.properties.brand_a_name).toBe('Brand A'); // Fallback
    expect(firstRecord.properties.brand_b_name).toBe('Brand B'); // Fallback

    // Summary should use fallback names
    expect(result.summary).toContain('Brand A vs competitors');
  });

  it('should update field aliases dynamically', () => {
    const processor = new ComparativeAnalysisProcessor();

    // Initial state - no field aliases
    expect(processor['brandNameResolver']['fieldAliases']).toEqual({});

    // Update with new field aliases
    const newFieldAliases = {
      'mp30034a_b_p': 'Nike Market Share (%)',
      'mp30029a_b_p': 'Adidas Market Share (%)'
    };
    
    processor.updateFieldAliases(newFieldAliases);

    // Verify the field aliases were updated
    expect(processor['brandNameResolver']['fieldAliases']).toEqual(newFieldAliases);
  });
});