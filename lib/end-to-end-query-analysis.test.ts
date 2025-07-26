import { conceptMapping } from './concept-mapping';
import { analyzeQuery } from './query-analyzer';
import { ANALYSIS_CATEGORIES } from '../components/chat/chat-constants';

describe('End-to-End Query Analysis Pipeline', () => {
  const allQueries = Object.values(ANALYSIS_CATEGORIES).flat();

  test.each(allQueries)('should produce a valid analysis result for query: "%s"', async (query) => {
    // Step 1: Concept Mapping
    const conceptMap = await conceptMapping(query);

    // Step 2: Query Analysis
    const analysisResult = await analyzeQuery(query, conceptMap);

    // Step 3: Validation
    expect(analysisResult).toBeDefined();
    expect(analysisResult.queryType).not.toBe('unknown');
    expect(analysisResult.relevantLayers).toBeDefined();
    expect(analysisResult.relevantLayers.length).toBeGreaterThan(0);
    expect(analysisResult.relevantFields).toBeDefined();
    expect(analysisResult.relevantFields!.length).toBeGreaterThan(0);

    if (analysisResult.queryType === 'jointHigh') {
      expect((analysisResult as any).demographic_filters).toBeDefined();
      expect((analysisResult as any).demographic_filters.length).toBeGreaterThan(0);
      expect((analysisResult as any).demographic_filters.length).toBeLessThanOrEqual(2);
    }
    
    console.log(`Query: "${query}" PASSED`);
    console.log('Analysis Result:', {
      queryType: analysisResult.queryType,
      relevantLayers: analysisResult.relevantLayers,
      relevantFields: analysisResult.relevantFields,
      sql: (analysisResult as any).sqlQuery
    });
  });
}); 