import { VisualizationType } from "../../reference/dynamic-layers";
import { classifyQuery, enhanceAnalysisWithVisualization } from '../../lib/query-classifier';

describe('Comprehensive Query Classifier Tests', () => {
  jest.setTimeout(30000); // Allow more time for tests

  describe('Testing all 16 visualization types with multiple query variations', () => {
    const testCases = [
      // 1. CHOROPLETH
      { type: VisualizationType.CHOROPLETH, queries: [
        'Show me income distribution across counties',
        'Map education levels by state',
        'Display population density by neighborhood',
        'Visualize home values by zip code',
        'Show poverty rates across the region',
        'Create a thematic map of income levels'
      ]},
      
      // 2. HEATMAP
      { type: VisualizationType.HEATMAP, queries: [
        'Show density of restaurants in the city',
        'Create a heat map of crime incidents',
        'Where are traffic accidents concentrated?',
        'Heat map of customer locations',
        'Show concentration of emergency calls',
        'Display the density of tourist activity'
      ]},
      
      // 3. SCATTER
      { type: VisualizationType.SCATTER, queries: [
        'Plot all store locations',
        'Show individual ATM locations',
        'Map the position of all fire hydrants',
        'Display school locations',
        'Show all bus stops on the map',
        'Mark each earthquake epicenter on the map'
      ]},
      
      // 4. CLUSTER
      { type: VisualizationType.CLUSTER, queries: [
        'Cluster the coffee shops by location',
        'Group restaurants into clusters',
        'Show clustered patient locations',
        'Create clusters of event venues',
        'Cluster the bike-sharing stations',
        'Group similar businesses by type and location'
      ]},
      
      // 5. CATEGORICAL
      { type: VisualizationType.CATEGORICAL, queries: [
        'Show land use categories on the map',
        'Categorize neighborhoods by dominant industry',
        'Show building types across the city',
        'Display zoning categories',
        'Map schools by type (public, private, charter)',
        'Show property categories by color'
      ]},
      
      // 6. TRENDS
      { type: VisualizationType.TRENDS, queries: [
        'Show population change from 2010 to 2020',
        'How has home value changed over the past 5 years?',
        'Display income growth by county',
        'Show trend in unemployment rates',
        'Map the change in air quality over time',
        'Historical trend of crime rates by neighborhood'
      ]},
      
      // 7. CORRELATION
      { type: VisualizationType.CORRELATION, queries: [
        'Show correlation between income and education',
        'Compare home prices and crime rates',
        'How does income relate to health outcomes?',
        'Relationship between school funding and test scores',
        'Compare pollution levels and asthma rates',
        'Is there a correlation between income and commute time?'
      ]},
      
      // 8. JOINT_HIGH
      { type: VisualizationType.JOINT_HIGH, queries: [
        'Find neighborhoods with both high income and good schools',
        'Show areas where both pollution and asthma rates are high',
        'Identify regions with high quality of life and low crime',
        'Where are income and education levels both high?',
        'Find areas with high housing prices and high walkability',
        'Show places with both good schools and parks'
      ]},
      
      // 9. PROPORTIONAL_SYMBOL
      { type: VisualizationType.PROPORTIONAL_SYMBOL, queries: [
        'Show cities with symbol size based on population',
        'Use proportional symbols to show earthquake magnitude',
        'Map sales by store with circle size',
        'Display revenue by location with bubbles sized by value',
        'Show COVID cases with symbol size by county',
        'Create a bubble map of business revenue'
      ]},
      
      // 10. TOP_N
      { type: VisualizationType.TOP_N, queries: [
        'Show top 10 counties by income',
        'Highlight the 5 neighborhoods with highest property values',
        'Which 15 districts have the best schools?',
        'Map the top 20 areas for business growth',
        'Show 10 cities with highest quality of life scores',
        'Display the top 5 most populous areas'
      ]},
      
      // 11. HEXBIN
      { type: VisualizationType.HEXBIN, queries: [
        'Create a hexbin map of customer locations',
        'Show store density using hexagonal bins',
        'Aggregate incident reports into hexbins',
        'Use hexbin to show tourist concentration',
        'Create hexagonal grid of population density',
        'Visualize traffic patterns with hexbin aggregation'
      ]},
      
      // 12. BIVARIATE
      { type: VisualizationType.BIVARIATE, queries: [
        'Create a bivariate map of income and education',
        'Show income and poverty relationship with a color matrix',
        'Map population density against home values using bivariate colors',
        'Create a two-variable map of age and income',
        'Show the relationship between health outcomes and education using a bivariate map',
        'Bivariate visualization of rainfall and temperature'
      ]},
      
      // 13. BUFFER
      { type: VisualizationType.BUFFER, queries: [
        'Show 5 mile buffer around hospitals',
        'Create a 10km radius around schools',
        'What areas are within 2 miles of parks?',
        'Create 500 meter buffers around transit stops',
        'Show 1 mile service area around fire stations',
        'Display neighborhoods within 3km of downtown'
      ]},
      
      // 14. HOTSPOT
      { type: VisualizationType.HOTSPOT, queries: [
        'Find hotspots of crime incidents',
        'Show statistically significant clusters of high income',
        'Identify disease hotspots in the region',
        'Where are the significant clusters of business activity?',
        'Show hotspots of accident reports',
        'Map spatial clusters of high unemployment'
      ]},
      
      // 15. NETWORK
      { type: VisualizationType.NETWORK, queries: [
        'Show transportation connections between cities',
        'Create a network diagram of trade between countries',
        'Visualize commuter flows from suburbs to downtown',
        'Show migration patterns between states',
        'Map supply chain connections between facilities',
        'Display flight routes between major airports'
      ]},
      
      // 16. MULTIVARIATE
      { type: VisualizationType.MULTIVARIATE, queries: [
        'Compare population, income, and education levels',
        'Show a multivariate analysis of demographic factors',
        'Visualize age, income, and health metrics together',
        'Create a multi-factor analysis of neighborhood quality',
        'Show income with color, population with size, and education with opacity',
        'Analyze crime, property value, and school quality in one visualization'
      ]},
    ];

    // Test each visualization type with its queries
    for (const { type, queries } of testCases) {
      describe(`${type} visualization type`, () => {
        for (const query of queries) {
          it(`should classify "${query}" as ${type}`, async () => {
            const result = await classifyQuery(query);
            expect(result).toBe(type);
          });
        }
      });
    }
  });

  describe('Edge cases and mixed queries', () => {
    it('should handle mixed signals with reasonable defaults', async () => {
      const mixedQueries = [
        { query: 'Show top 5 areas with both high income and education', expected: VisualizationType.JOINT_HIGH },
        { query: 'Create a heatmap of income distribution', expected: VisualizationType.HEATMAP },
        { query: 'Map schools within 2 miles of high income neighborhoods', expected: VisualizationType.BUFFER },
        { query: 'Show network of cities with highest populations', expected: VisualizationType.NETWORK },
        { query: 'Compare the top 10 neighborhoods by multiple factors', expected: VisualizationType.TOP_N }
      ];

      for (const { query, expected } of mixedQueries) {
        const result = await classifyQuery(query);
        expect(result).toBe(expected);
      }
    });

    it('should prefer more specific visualization types over general ones', async () => {
      // Testing queries that could match multiple patterns
      const result1 = await classifyQuery('Show top 5 areas with high income');
      expect(result1).toBe(VisualizationType.TOP_N);
      
      const result2 = await classifyQuery('Create hexbin visualization of population density');
      expect(result2).toBe(VisualizationType.HEXBIN);
      
      const result3 = await classifyQuery('Show correlation between factors using multivariate analysis');
      expect(result3).toBe(VisualizationType.MULTIVARIATE);
    });
  });

  describe('enhanceAnalysisWithVisualization function', () => {
    it('should enhance analysis result with the correct visualization type', async () => {
      const analysisTypes = [
        { type: 'top_n', expected: VisualizationType.TOP_N },
        { type: 'hexbin', expected: VisualizationType.HEXBIN },
        { type: 'bivariate', expected: VisualizationType.BIVARIATE },
        { type: 'buffer', expected: VisualizationType.BUFFER },
        { type: 'hotspot', expected: VisualizationType.HOTSPOT },
        { type: 'network', expected: VisualizationType.NETWORK },
        { type: 'multivariate', expected: VisualizationType.MULTIVARIATE }
      ];

      for (const { type, expected } of analysisTypes) {
        const analysisResult = {
          intent: 'visualization',
          relevantLayers: ['testLayer'],
          queryType: type,
          confidence: 0.9,
          explanation: 'Test',
          originalQuery: `Show ${type} visualization`
        };
        
        const enhanced = await enhanceAnalysisWithVisualization(analysisResult);
        expect(enhanced.visualizationType).toBe(expected);
      }
    });

    it('should handle topN parameter in analysis result', async () => {
      const analysisResult = {
        intent: 'visualization',
        relevantLayers: ['testLayer'],
        queryType: 'unknown',
        confidence: 0.9,
        explanation: 'Test',
        originalQuery: 'Show the best areas',
        topN: 5
      };
      
      const enhanced = await enhanceAnalysisWithVisualization(analysisResult);
      expect(enhanced.visualizationType).toBe(VisualizationType.TOP_N);
    });
  });
}); 