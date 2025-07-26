/**
 * AI Visualization Integration Test
 * 
 * This script tests the integration between the AI chat interface and the
 * visualization system to ensure the AI can properly access and use all
 * available visualization types.
 */

import { VisualizationType, visualizationTypesConfig } from '../config/dynamic-layers';
import { queryClassifier } from '../lib/query-classifier';

describe('AI Visualization Integration E2E', () => {
  // Generate test queries for all visualization types
  function generateTestQueries() {
    const testQueries = [];
    for (const [type, metadata] of Object.entries(visualizationTypesConfig)) {
      const patterns = metadata.aiQueryPatterns || [];
      for (let i = 0; i < Math.min(patterns.length, 2); i++) {
        const pattern = patterns[i];
        const query = pattern
          .replace('{field}', 'income')
          .replace('{field1}', 'income')
          .replace('{field2}', 'education')
          .replace('{field3}', 'population')
          .replace('{region}', 'county')
          .replace('{regions}', 'counties')
          .replace('{points}', 'restaurants')
          .replace('{features}', 'neighborhoods')
          .replace('{n}', '10')
          .replace('{benchmark}', 'national average')
          .replace('{distance}', '5 miles')
          .replace('{unit}', 'mile')
          .replace('{variables}', 'income, education, and age')
          .replace('{relationship}', 'trade between countries')
          .replace('{list}', 'income, education, and poverty')
          .replace('{source}', 'origin cities')
          .replace('{destination}', 'destination cities')
          .replace('{nodes}', 'cities');
        testQueries.push({ query, expectedType: type });
      }
    }
    const naturalQueries = [
      { query: "Can you show me a map of income distribution?", expectedType: VisualizationType.CHOROPLETH },
      { query: "I'd like to see where restaurants are concentrated in the city", expectedType: VisualizationType.HEATMAP },
      { query: "Show me which areas have both high income and good schools", expectedType: VisualizationType.JOINT_HIGH },
      { query: "What's the relationship between education and property values?", expectedType: VisualizationType.CORRELATION },
      { query: "Plot all the bike-sharing stations", expectedType: VisualizationType.SCATTER },
      { query: "Group the coffee shops by neighborhood", expectedType: VisualizationType.CLUSTER },
      { query: "How has population changed from 2010 to 2020?", expectedType: VisualizationType.TRENDS },
      { query: "Which are the 5 neighborhoods with the highest property values?", expectedType: VisualizationType.TOP_N }
    ];
    return [...testQueries, ...naturalQueries];
  }

  // Helper to extract relevant fields from a query
  function extractRelevantFields(query: string): string[] {
    // Look for comma-separated or 'and' separated variables
    const match = query.match(/(income|education|age|population|poverty|employment|unemployment|crime|property values|values|metrics|variables|factors|attributes)/gi);
    if (match && match.length > 0) {
      // Remove duplicates
      const unique = Array.from(new Set(match.map(f => f.toLowerCase())));
      // If only one variable, return just that
      if (unique.length === 1) return [unique[0]];
      // If the query is of the form 'Show me {field} by {region}', only the first variable is relevant
      if (/show me \w+ by (county|region|area|zone|district|neighborhood|polygon|counties|regions|areas|zones|districts|neighborhoods|polygons)/i.test(query)) {
        return [unique[0]];
      }
      return unique;
    }
    // Default to ['income'] for single variable
    return ['income'];
  }

  it('should classify all queries to the correct visualization type', async () => {
    const allQueries = generateTestQueries();
    for (const { query, expectedType } of allQueries) {
      const relevantFields = extractRelevantFields(query);
      const analysisResult = {
        intent: 'visualization',
        relevantLayers: ['testLayer'],
        relevantFields,
        queryType: 'unknown',
        confidence: 1.0,
        explanation: 'User wants to visualize data',
        originalQuery: query
      };
      const result = await queryClassifier.classifyAnalysisResult(analysisResult);
      if (result !== expectedType) {
        // eslint-disable-next-line no-console
        console.error(`Query failed: "${query}"
Expected: ${expectedType}
Received: ${result}`);
      }
      expect(result).toBe(expectedType);
    }
  });
}); 