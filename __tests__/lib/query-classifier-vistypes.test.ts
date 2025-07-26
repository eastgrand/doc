import { VisualizationType } from "../../reference/dynamic-layers";
import { classifyQuery } from '../../lib/query-classifier';

describe('Query Classifier Visualization Types', () => {
  jest.setTimeout(30000); // Allow more time for tests
  
  test('should recognize all visualization types from example queries', async () => {
    // Test cases for each visualization type
    const testCases = [
      // Standard visualization types
      { query: 'Show me income distribution by county', expected: VisualizationType.CHOROPLETH },
      { query: 'Display density of restaurants', expected: VisualizationType.HEATMAP },
      { query: 'Plot all store locations', expected: VisualizationType.SCATTER },
      { query: 'Group the coffee shops by location', expected: VisualizationType.CLUSTER },
      { query: 'Show land use categories', expected: VisualizationType.CATEGORICAL },
      { query: 'Show population change from 2010 to 2020', expected: VisualizationType.TRENDS },
      { query: 'Show correlation between income and education', expected: VisualizationType.CORRELATION },
      { query: 'Find areas with both high income and good schools', expected: VisualizationType.JOINT_HIGH },
      
      // Recently added visualization types
      { query: 'Show cities with symbol size based on population', expected: VisualizationType.PROPORTIONAL_SYMBOL },
      { query: 'Show top 10 counties by income', expected: VisualizationType.TOP_N },
      { query: 'Create a hexbin map of customer locations', expected: VisualizationType.HEXBIN },
      { query: 'Create a bivariate map of income and education', expected: VisualizationType.BIVARIATE },
      { query: 'Show 5 mile buffer around hospitals', expected: VisualizationType.BUFFER },
      { query: 'Find hotspots of crime incidents', expected: VisualizationType.HOTSPOT },
      { query: 'Show transportation connections between cities', expected: VisualizationType.NETWORK },
      { query: 'Compare population, income, and education levels', expected: VisualizationType.MULTIVARIATE },
    ];
    
    // Run tests for each case
    for (const { query, expected } of testCases) {
      const result = await classifyQuery(query);
      expect(result.visualizationType).toBe(expected);
    }
  });
}); 