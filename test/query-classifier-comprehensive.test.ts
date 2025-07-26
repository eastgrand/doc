import { QueryClassifier } from '../lib/query-classifier';
import { VisualizationType } from '../config/dynamic-layers';

// Define the AnalysisResult interface to match the one in query-classifier.ts
interface AnalysisResult {
  intent: string;
  relevantLayers: string[];
  relevantFields?: string[]; 
  comparisonParty?: string; 
  queryType: string;
  confidence: number;
  explanation: string;
  topN?: number;
  isCrossGeography?: boolean;
  originalQueryType?: string;
  originalQuery?: string;
  trendsKeyword?: string;
  populationLookup?: Map<string, number>;
  reasoning?: string;
  metrics?: { r: number; pValue?: number };
  correlationMetrics?: { r: number; pValue?: number };
  thresholds?: Record<string, number>;
  timeframe?: string;
  searchType?: string;
  category?: string;
  visualizationType?: VisualizationType;
}

describe('QueryClassifier Comprehensive Tests', () => {
  let classifier: QueryClassifier;

  beforeEach(() => {
    classifier = new QueryClassifier();
  });

  // Test cases for each visualization type
  const testCases = [
    {
      type: VisualizationType.CHOROPLETH,
      queries: [
        'show me income by county',
        'display population density by state',
        'map unemployment rates by region',
        'show the distribution of property values',
        'visualize crime rates by neighborhood',
        'show me the average income across different neighborhoods',
        'display the percentage of college graduates by state',
        'map the median home values by zip code',
        'show me the distribution of household sizes',
        'visualize the poverty rates by census tract'
      ]
    },
    {
      type: VisualizationType.HEATMAP,
      queries: [
        'show density of restaurants',
        'display concentration of crime incidents',
        'map population density',
        'show where accidents occur most frequently',
        'visualize traffic congestion',
        'show me the intensity of air pollution',
        'display the concentration of retail stores',
        'map the density of public transportation stops',
        'show me where noise complaints are most common',
        'visualize the distribution of emergency calls'
      ]
    },
    {
      type: VisualizationType.SCATTER,
      queries: [
        'plot restaurants on the map',
        'show me all the schools',
        'display crime incidents as points',
        'map all the parks',
        'show me the locations of hospitals',
        'plot all bus stops in the city',
        'show me where all the libraries are',
        'display the locations of recycling centers',
        'map all the public restrooms',
        'show me where all the ATMs are located'
      ]
    },
    {
      type: VisualizationType.CLUSTER,
      queries: [
        'group similar locations together',
        'cluster restaurants by area',
        'show me where points are concentrated',
        'group schools by neighborhood',
        'cluster crime incidents',
        'group similar businesses together',
        'show me clusters of public facilities',
        'group similar land uses together',
        'cluster similar demographic areas',
        'show me where similar activities occur'
      ]
    },
    {
      type: VisualizationType.CATEGORICAL,
      queries: [
        'show different types of land use',
        'display building types by area',
        'map zoning categories',
        'show me the various types of businesses',
        'group areas by type',
        'show me the different types of housing',
        'display the various types of infrastructure',
        'map different types of public facilities',
        'show me the categories of commercial properties',
        'visualize different types of residential areas'
      ]
    },
    {
      type: VisualizationType.TRENDS,
      queries: [
        'how has income changed over time',
        'show me population trends',
        'display crime rate changes',
        'map property value trends',
        'show me how unemployment has changed',
        'show me the historical changes in housing prices',
        'display how education levels have changed',
        'map the changes in population density',
        'show me how crime rates have evolved',
        'visualize changes in public transportation usage'
      ]
    },
    {
      type: VisualizationType.CORRELATION,
      queries: [
        'compare income with education',
        'show relationship between crime and poverty',
        'how does population density affect property values',
        'correlate unemployment with education levels',
        'show me if income relates to crime',
        'analyze the relationship between housing prices and school quality',
        'show me how population density correlates with public transportation',
        'compare crime rates with income levels',
        'analyze the relationship between education and employment',
        'show me how housing prices relate to neighborhood amenities'
      ]
    },
    {
      type: VisualizationType.JOINT_HIGH,
      queries: [
        'where are both income and education high',
        'show areas with high income and low crime',
        'find places with good schools and high property values',
        'where do we have high employment and low poverty',
        'show me areas with high income and good schools',
        'find neighborhoods with high walkability and low crime',
        'show me areas with high property values and good schools',
        'where are both income and life expectancy high',
        'find places with high employment and good public transportation',
        'show me areas with high income and low pollution'
      ]
    },
    {
      type: VisualizationType.PROPORTIONAL_SYMBOL,
      queries: [
        'show income with symbol size',
        'display population using circle size',
        'map crime rates with proportional symbols',
        'show me property values using symbol size',
        'visualize unemployment with circle size',
        'show me store revenue using symbol size',
        'display traffic volume with proportional circles',
        'map emergency response times with symbol size',
        'show me hospital capacity using circle size',
        'visualize school enrollment with proportional symbols'
      ]
    },
    {
      type: VisualizationType.COMPARISON,
      queries: [
        'compare income against national average',
        'show income relative to state average',
        'compare crime rates between neighborhoods',
        'how do property values compare to city average',
        'show me how unemployment compares to state level',
        'compare school performance to district average',
        'show me how housing prices compare to regional average',
        'compare public transportation usage to city average',
        'show me how crime rates compare to national average',
        'compare air quality to state standards'
      ]
    },
    {
      type: VisualizationType.TOP_N,
      queries: [
        'show top 10 areas for income',
        'display highest crime rate areas',
        'find the best performing schools',
        'show me the most expensive neighborhoods',
        'list areas with highest population growth',
        'show me the top 5 areas for business growth',
        'display the highest rated neighborhoods',
        'find the most walkable areas',
        'show me the best performing districts',
        'list the areas with highest quality of life'
      ]
    },
    {
      type: VisualizationType.HEXBIN,
      queries: [
        'show income in hexagonal bins',
        'display crime density in hexagons',
        'map population using hexbins',
        'show me property values in hexagons',
        'visualize unemployment in hexagonal bins',
        'show me traffic patterns in hexbins',
        'display population density in hexagonal cells',
        'map crime incidents using hexbins',
        'show me housing density in hexagons',
        'visualize public transportation usage in hexbins'
      ]
    },
    {
      type: VisualizationType.BIVARIATE,
      queries: [
        'compare income and education with color matrix',
        'show relationship between crime and poverty using colors',
        'map income and education together',
        'display property values and crime rates together',
        'show me income and unemployment together',
        'compare population density and income using colors',
        'show me housing prices and school quality together',
        'map crime rates and income levels using color matrix',
        'display education and employment together',
        'show me property values and amenities using colors'
      ]
    },
    {
      type: VisualizationType.BUFFER,
      queries: [
        'show buffer of 5 miles around restaurants',
        'display 10km radius around schools',
        'map areas within 2 miles of parks',
        'show me zones within 3km of hospitals',
        'visualize areas within 1 mile of transit stops',
        'show me areas within 5km of shopping centers',
        'display zones within 2 miles of libraries',
        'map areas within 1km of public transportation',
        'show me regions within 3 miles of universities',
        'visualize areas within 2km of emergency services'
      ]
    },
    {
      type: VisualizationType.HOTSPOT,
      queries: [
        'find hotspots of income',
        'show me crime hotspots',
        'display property value hotspots',
        'map unemployment hotspots',
        'find areas with high population density',
        'show me hotspots of business activity',
        'display areas with high traffic congestion',
        'map hotspots of public transportation usage',
        'show me areas with high air pollution',
        'find hotspots of emergency incidents'
      ]
    },
    {
      type: VisualizationType.NETWORK,
      queries: [
        'show network between origin cities and destination cities',
        'display connections between neighborhoods',
        'map traffic flow between areas',
        'show me commuting patterns',
        'visualize migration flows',
        'show me the network of public transportation routes',
        'display connections between business districts',
        'map the flow of goods between regions',
        'show me the network of emergency response routes',
        'visualize the connections between educational institutions'
      ]
    },
    {
      type: VisualizationType.MULTIVARIATE,
      queries: [
        'multivariate analysis of income, education, and age',
        'show me multiple factors affecting property values',
        'analyze several variables together',
        'display multiple indicators by area',
        'map several demographic factors',
        'show me the relationship between multiple economic indicators',
        'analyze various factors affecting crime rates',
        'display multiple environmental factors together',
        'map several social indicators simultaneously',
        'show me how multiple factors affect quality of life'
      ]
    }
  ];

  // Test each visualization type
  testCases.forEach(({ type, queries }) => {
    describe(`${type} Classification`, () => {
      queries.forEach(query => {
        test(`classifies "${query}" as ${type}`, async () => {
          const result = await classifier.classifyQuery(query);
          expect(result.visualizationType).toBe(type);
          expect(result.confidence).toBeGreaterThan(0.5);
        });
      });
    });
  });

  // Test edge cases and special scenarios
  describe('Edge Cases and Special Scenarios', () => {
    test('handles queries with multiple visualization keywords', async () => {
      const queries = [
        'show me a heatmap of income correlation',
        'display a choropleth map with proportional symbols',
        'create a bivariate map with hotspots',
        'show me trends with a heatmap overlay',
        'visualize correlation using a choropleth',
        'show me a multivariate analysis with hexbins',
        'display a network map with buffer zones',
        'create a categorical map with proportional symbols',
        'show me trends with a scatter plot overlay',
        'visualize correlation using a bivariate map'
      ];

      for (const query of queries) {
        const result = await classifier.classifyQuery(query);
        expect(result.visualizationType).toBeDefined();
        expect(result.confidence).toBeGreaterThan(0.3);
      }
    });

    test('handles ambiguous queries', async () => {
      const queries = [
        'show me the data',
        'display the information',
        'map the results',
        'visualize the analysis',
        'show me what you found',
        'what can you tell me about this area',
        'give me an overview of the situation',
        'what does the data show',
        'help me understand the patterns',
        'what insights can you provide'
      ];

      for (const query of queries) {
        const result = await classifier.classifyQuery(query);
        expect(result.visualizationType).toBeDefined();
        expect(result.confidence).toBeLessThan(0.5);
      }
    });

    test('handles queries with temporal and spatial components', async () => {
      const queries = [
        'how has income changed by region over time',
        'show me crime trends in different neighborhoods',
        'display population changes by area',
        'map property value trends by district',
        'visualize unemployment changes by county',
        'show me how education levels have changed by region',
        'display crime rate changes by neighborhood',
        'map population growth by district',
        'show me housing price trends by area',
        'visualize demographic changes by region'
      ];

      for (const query of queries) {
        const result = await classifier.classifyQuery(query);
        expect(result.visualizationType).toBeDefined();
        expect(result.confidence).toBeGreaterThan(0.3);
      }
    });

    test('handles complex multi-part queries', async () => {
      const queries = [
        'show me income trends and compare with education levels by neighborhood',
        'display crime hotspots and correlate with poverty rates over time',
        'map property values and show their relationship to school quality by district',
        'show me population density and its correlation with public transportation usage',
        'visualize income levels and compare them with housing prices by region',
        'show me crime rates and their relationship to education levels by area',
        'display unemployment trends and correlate with income levels by neighborhood',
        'map housing prices and show their relationship to amenities by district',
        'show me population changes and their impact on infrastructure by region',
        'visualize education levels and their correlation with employment rates by area'
      ];

      for (const query of queries) {
        const result = await classifier.classifyQuery(query);
        expect(result.visualizationType).toBeDefined();
        expect(result.confidence).toBeGreaterThan(0.3);
      }
    });
  });

  // Test analysis result enhancement
  describe('Analysis Result Enhancement', () => {
    test('enhances analysis with appropriate visualization type', async () => {
      const testCases = [
        {
          query: 'show me income by county',
          expectedType: VisualizationType.CHOROPLETH
        },
        {
          query: 'compare income with education',
          expectedType: VisualizationType.CORRELATION
        },
        {
          query: 'where are both income and education high',
          expectedType: VisualizationType.JOINT_HIGH
        },
        {
          query: 'how has income changed over time',
          expectedType: VisualizationType.TRENDS
        },
        {
          query: 'show density of restaurants',
          expectedType: VisualizationType.HEATMAP
        },
        {
          query: 'show me the top 10 areas for income',
          expectedType: VisualizationType.TOP_N
        },
        {
          query: 'display crime density in hexagons',
          expectedType: VisualizationType.HEXBIN
        },
        {
          query: 'compare income and education with color matrix',
          expectedType: VisualizationType.BIVARIATE
        },
        {
          query: 'show buffer of 5 miles around restaurants',
          expectedType: VisualizationType.BUFFER
        },
        {
          query: 'find hotspots of income',
          expectedType: VisualizationType.HOTSPOT
        }
      ];

      for (const { query, expectedType } of testCases) {
        const analysisResult: AnalysisResult = {
          queryType: 'unknown',
          originalQuery: query,
          intent: 'visualize data',
          explanation: 'user wants to see data visualization',
          reasoning: 'appropriate visualization needed',
          relevantLayers: [],
          confidence: 0.8
        };

        const enhanced = await classifier.enhanceAnalysisResult(analysisResult);
        expect(enhanced.visualizationType).toBe(expectedType);
        expect(enhanced.queryType).toBe(expectedType);
      }
    });

    test('preserves existing visualization type', async () => {
      const testCases = [
        VisualizationType.CHOROPLETH,
        VisualizationType.CORRELATION,
        VisualizationType.JOINT_HIGH,
        VisualizationType.TRENDS,
        VisualizationType.HEATMAP,
        VisualizationType.TOP_N,
        VisualizationType.HEXBIN,
        VisualizationType.BIVARIATE,
        VisualizationType.BUFFER,
        VisualizationType.HOTSPOT
      ];

      for (const type of testCases) {
        const analysisResult: AnalysisResult = {
          queryType: type,
          originalQuery: 'test query',
          intent: 'visualize data',
          explanation: 'user wants to see data visualization',
          reasoning: 'appropriate visualization needed',
          relevantLayers: [],
          confidence: 0.8
        };

        const enhanced = await classifier.enhanceAnalysisResult(analysisResult);
        expect(enhanced.visualizationType).toBe(type);
        expect(enhanced.queryType).toBe(type);
      }
    });

    test('handles analysis results with multiple fields', async () => {
      const testCases = [
        {
          fields: ['income', 'education'],
          expectedType: VisualizationType.CORRELATION
        },
        {
          fields: ['crime', 'poverty', 'education'],
          expectedType: VisualizationType.MULTIVARIATE
        },
        {
          fields: ['population', 'density'],
          expectedType: VisualizationType.HEATMAP
        },
        {
          fields: ['income', 'property_values'],
          expectedType: VisualizationType.BIVARIATE
        },
        {
          fields: ['crime', 'income'],
          expectedType: VisualizationType.CORRELATION
        }
      ];

      for (const { fields, expectedType } of testCases) {
        const analysisResult: AnalysisResult = {
          queryType: 'unknown',
          originalQuery: 'test query',
          intent: 'visualize data',
          explanation: 'user wants to see data visualization',
          reasoning: 'appropriate visualization needed',
          relevantLayers: [],
          relevantFields: fields,
          confidence: 0.8
        };

        const enhanced = await classifier.enhanceAnalysisResult(analysisResult);
        expect(enhanced.visualizationType).toBe(expectedType);
      }
    });
  });

  // Test ML classifier integration
  describe('ML Classifier Integration', () => {
    beforeEach(async () => {
      await classifier.initializeML(true);
    });

    test('uses ML classification when available', async () => {
      const queries = [
        'show me income distribution by neighborhood',
        'compare crime rates with education levels',
        'find areas with high income and good schools',
        'show me how population has changed over time',
        'display the density of restaurants in the area'
      ];

      for (const query of queries) {
        const result = await classifier.classifyQuery(query);
        expect(result.visualizationType).toBeDefined();
        expect(result.confidence).toBeGreaterThan(0.3);
      }
    });

    test('falls back to pattern matching when ML is not confident', async () => {
      const queries = [
        'show me something interesting',
        'what can you tell me about this area',
        'give me an overview',
        'what does the data show',
        'help me understand the patterns'
      ];

      for (const query of queries) {
        const result = await classifier.classifyQuery(query);
        expect(result.visualizationType).toBeDefined();
        expect(result.confidence).toBeLessThan(0.5);
      }
    });
  });

  // Test query context analysis
  describe('Query Context Analysis', () => {
    test('analyzes temporal references', async () => {
      const queries = [
        'how has income changed over time',
        'show me population trends',
        'display crime rate changes',
        'map property value trends',
        'show me how unemployment has changed'
      ];

      for (const query of queries) {
        const result = await classifier.classifyQuery(query);
        expect(result.visualizationType).toBe(VisualizationType.TRENDS);
        expect(result.confidence).toBeGreaterThan(0.5);
      }
    });

    test('analyzes spatial references', async () => {
      const queries = [
        'show me income by county',
        'display population by neighborhood',
        'map crime rates by district',
        'show me property values by region',
        'visualize unemployment by area'
      ];

      for (const query of queries) {
        const result = await classifier.classifyQuery(query);
        expect(result.visualizationType).toBe(VisualizationType.CHOROPLETH);
        expect(result.confidence).toBeGreaterThan(0.5);
      }
    });

    test('analyzes comparison references', async () => {
      const queries = [
        'compare income with education',
        'show relationship between crime and poverty',
        'how does population density affect property values',
        'correlate unemployment with education levels',
        'show me if income relates to crime'
      ];

      for (const query of queries) {
        const result = await classifier.classifyQuery(query);
        expect(result.visualizationType).toBe(VisualizationType.CORRELATION);
        expect(result.confidence).toBeGreaterThan(0.5);
      }
    });

    test('analyzes joint high references', async () => {
      const queries = [
        'where are both income and education high',
        'show areas with high income and low crime',
        'find places with good schools and high property values',
        'where do we have high employment and low poverty',
        'show me areas with high income and good schools'
      ];

      for (const query of queries) {
        const result = await classifier.classifyQuery(query);
        expect(result.visualizationType).toBe(VisualizationType.JOINT_HIGH);
        expect(result.confidence).toBeGreaterThan(0.5);
      }
    });
  });
}); 