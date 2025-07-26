import { analyzeQuery } from '../lib/query-analyzer';
import { conceptMapping } from '../lib/concept-mapping';
import { ANALYSIS_CATEGORIES } from '../components/chat/chat-constants';

describe('Predefined Query Classification', () => {

  // Get all queries from the ANALYSIS_CATEGORIES object
  const allQueries = Object.values(ANALYSIS_CATEGORIES).flat();

  // Test each query to ensure it's classified correctly
  test.each(allQueries)('should classify "%s" without being "unknown"', async (query) => {
    // Run the same analysis pipeline as the application
    const conceptMap = await conceptMapping(query);
    const analysisResult = await analyzeQuery(query, conceptMap);

    // Log the result for visibility
    console.log(`Query: "${query}" ==> Classified as: ${analysisResult.queryType}`);

    // Assert that the queryType is not 'unknown'
    expect(analysisResult.queryType).not.toBe('unknown');
  });

}); 