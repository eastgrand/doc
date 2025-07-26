import { QueryClassifier, classifyQuery, enhanceAnalysisWithVisualization } from './query-classifier';
import { VisualizationType } from "../reference/dynamic-layers";

interface AnalysisResult {
  intent: string;
  relevantLayers: string[];
  relevantFields?: string[];
  queryType: string;
  confidence: number;
  explanation: string;
  visualizationType?: VisualizationType;
}

describe('QueryClassifier', () => {
  let classifier: QueryClassifier;

  beforeEach(() => {
    classifier = new QueryClassifier();
  });

  afterEach(() => {
    classifier.dispose();
  });

  const testCases = [
    // Scatter plot tests
    {
      query: "show all property locations",
      expected: VisualizationType.SCATTER,
      description: "Basic scatter plot query"
    },
    {
      query: "display individual points on the map",
      expected: VisualizationType.SCATTER,
      description: "Alternative scatter plot query"
    },
    {
      query: "plot each location separately",
      expected: VisualizationType.SCATTER,
      description: "Another scatter plot variation"
    },

    // Cluster tests
    {
      query: "group similar properties together",
      expected: VisualizationType.CLUSTER,
      description: "Basic cluster query"
    },
    {
      query: "cluster properties by type",
      expected: VisualizationType.CLUSTER,
      description: "Cluster with category"
    },
    {
      query: "aggregate similar locations",
      expected: VisualizationType.CLUSTER,
      description: "Cluster with aggregation"
    },

    // Trends tests
    {
      query: "show how property values changed over time",
      expected: VisualizationType.TRENDS,
      description: "Basic trends query"
    },
    {
      query: "display the evolution of prices",
      expected: VisualizationType.TRENDS,
      description: "Alternative trends query"
    },
    {
      query: "what has changed in the last year",
      expected: VisualizationType.TRENDS,
      description: "Temporal trends query"
    },

    // Buffer tests
    {
      query: "show properties within 5 miles",
      expected: VisualizationType.BUFFER,
      description: "Basic buffer query"
    },
    {
      query: "find locations within 2km radius",
      expected: VisualizationType.BUFFER,
      description: "Buffer with metric units"
    },

    // Hotspot tests
    {
      query: "identify crime hotspots",
      expected: VisualizationType.HOTSPOT,
      description: "Basic hotspot query"
    },
    {
      query: "show statistically significant clusters",
      expected: VisualizationType.HOTSPOT,
      description: "Hotspot with statistical significance"
    },

    // Network tests
    {
      query: "show connections between locations",
      expected: VisualizationType.NETWORK,
      description: "Basic network query"
    },
    {
      query: "display commuting patterns",
      expected: VisualizationType.NETWORK,
      description: "Network with specific context"
    },

    // Multivariate tests
    {
      query: "analyze multiple variables together",
      expected: VisualizationType.MULTIVARIATE,
      description: "Basic multivariate query"
    },
    {
      query: "show relationship between several factors",
      expected: VisualizationType.MULTIVARIATE,
      description: "Multivariate with relationship context"
    },

    // Bivariate tests
    {
      query: "compare two variables",
      expected: VisualizationType.BIVARIATE,
      description: "Basic bivariate query"
    },
    {
      query: "show relationship between two factors",
      expected: VisualizationType.BIVARIATE,
      description: "Bivariate with relationship context"
    },

    // Correlation tests
    {
      query: "show correlation between variables",
      expected: VisualizationType.CORRELATION,
      description: "Basic correlation query"
    },
    {
      query: "how do these factors relate",
      expected: VisualizationType.CORRELATION,
      description: "Correlation with question format"
    },

    // Categorical tests
    {
      query: "group by category",
      expected: VisualizationType.CATEGORICAL,
      description: "Basic categorical query"
    },
    {
      query: "show types by color",
      expected: VisualizationType.CATEGORICAL,
      description: "Categorical with color context"
    }
  ];

  testCases.forEach(({ query, expected, description }) => {
    test(`should correctly classify "${query}" as ${expected}`, async () => {
      const result = await classifier.classifyQuery(query);
      expect(result.visualizationType).toBe(expected);
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  // Test ambiguous queries
  const ambiguousQueries = [
    "show data",
    "display points",
    "what is this",
    "how to visualize",
    "show locations"
  ];

  ambiguousQueries.forEach(query => {
    test(`should handle ambiguous query "${query}" with lower confidence`, async () => {
      const result = await classifier.classifyQuery(query);
      expect(result.confidence).toBeLessThan(0.7);
    });
  });

  // Test negative context
  const negativeContextQueries = [
    "show points not in clusters",
    "display locations without grouping",
    "show data without categories"
  ];

  negativeContextQueries.forEach(query => {
    test(`should handle negative context in "${query}"`, async () => {
      const result = await classifier.classifyQuery(query);
      expect(result.visualizationType).not.toBe(VisualizationType.CLUSTER);
    });
  });

  // Test mixed intent
  const mixedIntentQueries = [
    "show clustered points over time",
    "display grouped locations with trends",
    "plot categorized data with correlation"
  ];

  mixedIntentQueries.forEach(query => {
    test(`should handle mixed intent in "${query}"`, async () => {
      const result = await classifier.classifyQuery(query);
      expect(result.confidence).toBeLessThan(0.8);
    });
  });

  describe('Complex Classification', () => {
    const complexTestCases = [
      {
        query: 'Show me the distribution of individual points and how they cluster together',
        expected: VisualizationType.CLUSTER,
        description: 'Complex scatter/cluster combination'
      },
      {
        query: 'Display how specific locations have changed and group similar ones together',
        expected: VisualizationType.CLUSTER,
        description: 'Complex trends/cluster combination'
      },
      {
        query: 'Plot each point and show how they relate to each other over time',
        expected: VisualizationType.TRENDS,
        description: 'Complex scatter/trends combination'
      }
    ];

    complexTestCases.forEach(({ query, expected, description }) => {
      test(`should handle complex queries: "${description}"`, async () => {
        const result = await classifyQuery(query);
        expect(result.visualizationType).toBe(expected);
        expect(result.confidence).toBeGreaterThan(0.6);
      });
    });
  });

  describe('Confidence Scoring', () => {
    test('should return high confidence for clear scatter plot requests', async () => {
      const result = await classifier.classifyQuery('Show me each individual location');
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.visualizationType).toBe(VisualizationType.SCATTER);
    });

    test('should return high confidence for clear cluster requests', async () => {
      const result = await classifier.classifyQuery('Group similar locations together');
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.visualizationType).toBe(VisualizationType.CLUSTER);
    });

    test('should return high confidence for clear trends requests', async () => {
      const result = await classifier.classifyQuery('Show me changes over time');
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.visualizationType).toBe(VisualizationType.TRENDS);
    });

    test('should return lower confidence for ambiguous requests', async () => {
      const result = await classifier.classifyQuery('Show me the data');
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('Analysis Result Enhancement', () => {
    test('should enhance analysis result with correct visualization type', async () => {
      const analysisResult = {
        intent: 'visualization',
        relevantLayers: ['businesses'],
        queryType: 'unknown',
        confidence: 0,
        explanation: '',
        originalQuery: 'Show me each individual business location',
        visualizationType: VisualizationType.CHOROPLETH
      };

      const enhanced = await enhanceAnalysisWithVisualization(analysisResult);
      expect(enhanced.visualizationType).toBe(VisualizationType.SCATTER);
    });

    test('should preserve original query type when enhancing', async () => {
      const analysisResult = {
        intent: 'visualization',
        relevantLayers: ['businesses'],
        queryType: 'custom_type',
        confidence: 0,
        explanation: '',
        originalQuery: 'Show me each individual business location',
        visualizationType: VisualizationType.CHOROPLETH
      };

      const enhanced = await enhanceAnalysisWithVisualization(analysisResult);
      expect(enhanced.originalQueryType).toBe('custom_type');
    });
  });

  describe('Enhanced Pattern Matching', () => {
    // Test helper function
    const expectClassification = async (
      query: string,
      expectedType: VisualizationType,
      minConfidence: number = 0.6
    ) => {
      const result = await classifier.classifyQuery(query);
      expect(result.visualizationType).toBe(expectedType);
      expect(result.confidence).toBeGreaterThanOrEqual(minConfidence);
    };

    describe('SCATTER visualization', () => {
      it('should classify direct location requests', async () => {
        await expectClassification(
          'show all locations',
          VisualizationType.SCATTER,
          0.7
        );
        await expectClassification(
          'display each point on the map',
          VisualizationType.SCATTER,
          0.7
        );
        await expectClassification(
          'map every place in the area',
          VisualizationType.SCATTER,
          0.7
        );
      });

      it('should handle negative context correctly', async () => {
        // Should NOT be classified as scatter due to negative context
        const result = await classifier.classifyQuery('show all locations grouped by type');
        expect(result.visualizationType).not.toBe(VisualizationType.SCATTER);
      });
    });

    describe('TRENDS visualization', () => {
      it('should classify temporal analysis requests', async () => {
        await expectClassification(
          'show changes over time',
          VisualizationType.TRENDS,
          0.75
        );
        await expectClassification(
          'how has it changed between 2010 and 2020',
          VisualizationType.TRENDS,
          0.75
        );
      });

      it('should handle negative context correctly', async () => {
        // Should NOT be classified as trends due to negative context
        const result = await classifier.classifyQuery('show current values');
        expect(result.visualizationType).not.toBe(VisualizationType.TRENDS);
      });
    });

    describe('CORRELATION visualization', () => {
      it('should classify relationship analysis requests', async () => {
        await expectClassification(
          'show correlation between income and education',
          VisualizationType.CORRELATION,
          0.8
        );
        await expectClassification(
          'how does population density relate to crime rates',
          VisualizationType.CORRELATION,
          0.8
        );
      });

      it('should handle negative context correctly', async () => {
        // Should NOT be classified as correlation due to negative context
        const result = await classifier.classifyQuery('compare income versus education');
        expect(result.visualizationType).not.toBe(VisualizationType.CORRELATION);
      });
    });

    describe('Confidence Scoring', () => {
      it('should provide appropriate confidence scores', async () => {
        const result = await classifier.classifyQuery('show all locations');
        expect(result.confidence).toBeGreaterThanOrEqual(0.7);
        expect(result.confidence).toBeLessThanOrEqual(1.0);
      });

      it('should handle ambiguous queries with lower confidence', async () => {
        const result = await classifier.classifyQuery('show locations');
        expect(result.confidence).toBeLessThan(0.7);
      });
    });

    describe('Context Awareness', () => {
      it('should boost confidence with matching context', async () => {
        const result1 = await classifier.classifyQuery('show all locations');
        const result2 = await classifier.classifyQuery('show all locations in the geographic area');
        expect(result2.confidence).toBeGreaterThanOrEqual(result1.confidence);
      });

      it('should reduce confidence with negative context', async () => {
        const result1 = await classifier.classifyQuery('show all locations');
        const result2 = await classifier.classifyQuery('show all locations grouped together');
        expect(result2.confidence).toBeLessThanOrEqual(result1.confidence);
      });
    });

    describe('Priority Handling', () => {
      it('should respect pattern priorities', async () => {
        // Higher priority pattern should win
        const result = await classifier.classifyQuery('show all locations on the map');
        expect(result.visualizationType).toBe(VisualizationType.SCATTER);
        expect(result.confidence).toBeGreaterThan(0.7);
      });
    });
  });

  describe('Edge Cases and Complex Scenarios', () => {
    describe('Ambiguous Queries', () => {
      it('should handle queries with multiple visualization indicators', async () => {
        const result = await classifier.classifyQuery(
          'Show me how individual points cluster together over time'
        );
        expect(result.confidence).toBeLessThan(0.9);
        expect(result.visualizationType).toBe(VisualizationType.CLUSTER);
      });

      it('should handle queries with conflicting indicators', async () => {
        const result = await classifier.classifyQuery(
          'Show me individual points grouped by area'
        );
        expect(result.confidence).toBeLessThan(0.8);
        expect(result.visualizationType).toBe(VisualizationType.CLUSTER);
      });

      it('should handle queries with temporal and spatial indicators', async () => {
        const result = await classifier.classifyQuery(
          'Show me how locations have changed over time'
        );
        expect(result.confidence).toBeLessThan(0.9);
        expect(result.visualizationType).toBe(VisualizationType.TRENDS);
      });
    });

    describe('Context-Sensitive Classification', () => {
      it('should consider negative context in classification', async () => {
        const result = await classifier.classifyQuery(
          'Show me all locations except those in clusters'
        );
        expect(result.visualizationType).toBe(VisualizationType.SCATTER);
        expect(result.confidence).toBeGreaterThan(0.6);
      });

      it('should handle queries with multiple negative contexts', async () => {
        const result = await classifier.classifyQuery(
          'Show me current values that are not grouped or clustered'
        );
        expect(result.visualizationType).toBe(VisualizationType.SCATTER);
        expect(result.confidence).toBeGreaterThan(0.5);
      });

      it('should consider priority in conflicting contexts', async () => {
        const result = await classifier.classifyQuery(
          'Show me individual points that are similar to each other'
        );
        expect(result.visualizationType).toBe(VisualizationType.SCATTER);
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });

    describe('Pattern Weight and Priority', () => {
      it('should respect pattern weights in classification', async () => {
        const result = await classifier.classifyQuery(
          'Show me the relationship between income and education using colors'
        );
        expect(result.visualizationType).toBe(VisualizationType.BIVARIATE);
        expect(result.confidence).toBeGreaterThan(0.8);
      });

      it('should consider pattern priority in classification', async () => {
        const result = await classifier.classifyQuery(
          'Show me how income and education relate to each other'
        );
        expect(result.visualizationType).toBe(VisualizationType.CORRELATION);
        expect(result.confidence).toBeGreaterThan(0.7);
      });

      it('should handle multiple matching patterns with different weights', async () => {
        const result = await classifier.classifyQuery(
          'Show me the correlation between income and education using colors'
        );
        expect(result.visualizationType).toBe(VisualizationType.BIVARIATE);
        expect(result.confidence).toBeGreaterThan(0.8);
      });
    });

    describe('Confidence Scoring Improvements', () => {
      it('should provide higher confidence for exact pattern matches', async () => {
        const result = await classifier.classifyQuery(
          'Show me all individual locations on the map'
        );
        expect(result.confidence).toBeGreaterThan(0.8);
        expect(result.visualizationType).toBe(VisualizationType.SCATTER);
      });

      it('should provide lower confidence for partial matches', async () => {
        const result = await classifier.classifyQuery(
          'Show me locations'
        );
        expect(result.confidence).toBeLessThan(0.7);
        expect(result.visualizationType).toBe(VisualizationType.SCATTER);
      });

      it('should consider context matches in confidence scoring', async () => {
        const result = await classifier.classifyQuery(
          'Show me how population has changed over the years'
        );
        expect(result.confidence).toBeGreaterThan(0.7);
        expect(result.visualizationType).toBe(VisualizationType.TRENDS);
      });

      it('should penalize confidence for conflicting contexts', async () => {
        const result = await classifier.classifyQuery(
          'Show me individual points that are grouped together'
        );
        expect(result.confidence).toBeLessThan(0.8);
        expect(result.visualizationType).toBe(VisualizationType.CLUSTER);
      });
    });
  });

  describe('ML Classification', () => {
    test('should initialize ML classifier when requested', async () => {
      const mlClassifier = new QueryClassifier(true);
      expect(mlClassifier.shouldUseML()).toBe(true);
      mlClassifier.dispose();
    });

    test('should fall back to pattern matching when ML fails', async () => {
      const mlClassifier = new QueryClassifier(true);
      const result = await mlClassifier.classifyQuery('show all property locations');
      expect(result.visualizationType).toBe(VisualizationType.SCATTER);
      expect(result.confidence).toBeGreaterThan(0.6);
      mlClassifier.dispose();
    });
  });

  describe('Field-based Classification', () => {
    test('should classify based on spatial fields', async () => {
      const result = await classifier.classifyAnalysisResult({
        intent: '',
        relevantLayers: [],
        relevantFields: ['latitude', 'longitude'],
        queryType: 'unknown',
        confidence: 0,
        explanation: '',
        visualizationType: undefined
      });
      expect(result).toBe(VisualizationType.SCATTER);
    });

    test('should classify based on temporal fields', async () => {
      const result = await classifier.classifyAnalysisResult({
        intent: '',
        relevantLayers: [],
        relevantFields: ['date', 'time'],
        queryType: 'unknown',
        confidence: 0,
        explanation: '',
        visualizationType: undefined
      });
      expect(result).toBe(VisualizationType.TRENDS);
    });

    test('should classify based on multiple fields', async () => {
      const result = await classifier.classifyAnalysisResult({
        intent: '',
        relevantLayers: [],
        relevantFields: ['latitude', 'longitude', 'date', 'value'],
        queryType: 'unknown',
        confidence: 0,
        explanation: '',
        visualizationType: undefined
      });
      expect(result).toBe(VisualizationType.TRENDS);
    });
  });

  describe('Pattern Matching Edge Cases', () => {
    test('should handle empty queries', async () => {
      const result = await classifier.classifyQuery('');
      expect(result.confidence).toBeLessThan(0.6);
      expect(result.visualizationType).toBeUndefined();
    });

    test('should handle very long queries', async () => {
      const longQuery = 'show me all the individual property locations and how they are distributed across the map and what their values are and how they relate to each other and what patterns emerge from their spatial distribution'.repeat(3);
      const result = await classifier.classifyQuery(longQuery);
      expect(result.confidence).toBeLessThan(0.8);
    });

    test('should handle queries with special characters', async () => {
      const result = await classifier.classifyQuery('show @#$%^&*() locations!');
      expect(result.visualizationType).toBe(VisualizationType.SCATTER);
    });
  });

  describe('Confidence Scoring Refinements', () => {
    test('should return highest confidence for exact matches', async () => {
      const result = await classifier.classifyQuery('show property categories by color');
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.visualizationType).toBe(VisualizationType.CATEGORICAL);
    });

    test('should return lower confidence for mixed intent', async () => {
      const result = await classifier.classifyQuery('show clustered points over time');
      expect(result.confidence).toBeLessThan(0.8);
    });

    test('should return lowest confidence for ambiguous queries', async () => {
      const result = await classifier.classifyQuery('show data');
      expect(result.confidence).toBeLessThan(0.6);
    });
  });

  describe('Analysis Result Enhancement', () => {
    test('should enhance analysis result with visualization type', async () => {
      const analysisResult = {
        intent: '',
        relevantLayers: [],
        queryType: 'unknown',
        confidence: 0,
        explanation: '',
        visualizationType: undefined
      };
      const enhanced = await enhanceAnalysisWithVisualization(analysisResult);
      expect(enhanced.visualizationType).toBeDefined();
    });

    test('should preserve original query type in enhanced result', async () => {
      const analysisResult = {
        intent: '',
        relevantLayers: [],
        queryType: 'custom',
        confidence: 0,
        explanation: '',
        visualizationType: undefined,
        originalQueryType: 'custom'
      };
      const enhanced = await enhanceAnalysisWithVisualization(analysisResult);
      expect(enhanced.originalQueryType).toBe('custom');
    });
  });

  describe('Error Handling', () => {
    test('should handle classification errors gracefully', async () => {
      const result = await classifier.classifyQuery(null as any);
      expect(result.error).toBeDefined();
      expect(result.confidence).toBe(0);
    });

    test('should handle analysis result errors gracefully', async () => {
      const result = await classifier.classifyAnalysisResult(null as any);
      expect(result).toBeUndefined();
    });

    test('should handle invalid queries', async () => {
      const result = await classifier.classifyQuery('!@#$%^&*()');
      expect(result.confidence).toBeLessThan(0.6);
      expect(result.visualizationType).toBeUndefined();
    });
  });

  describe('Joint High Tests', () => {
    const jointHighTestCases = [
      {
        query: 'Show areas with high income and high education',
        expected: VisualizationType.JOINT_HIGH,
        description: 'Basic joint high query'
      },
      {
        query: 'Find locations with highest conversion rates and highest sales',
        expected: VisualizationType.JOINT_HIGH,
        description: 'Joint high with "highest"'
      },
      {
        query: 'Which areas have both high population and high number of stores?',
        expected: VisualizationType.JOINT_HIGH,
        description: 'Joint high with question format'
      },
      {
        query: 'Show me places that have high crime rates and low police presence',
        expected: VisualizationType.JOINT_HIGH,
        description: 'Joint high with mixed high/low (should still be joint high)'
      }
    ];

    jointHighTestCases.forEach(({ query, expected, description }) => {
      test(`should correctly classify "${query}" as ${expected} - ${description}`, async () => {
        const result = await classifier.classifyQuery(query);
        expect(result.visualizationType).toBe(expected);
        expect(result.confidence).toBeGreaterThanOrEqual(0.9);
      });
    });
  });

  describe('Special Case Classification', () => {
    const expectClassification = async (
      query: string,
      expectedType: VisualizationType,
      minConfidence: number = 0.6
    ) => {
      const result = await classifier.classifyQuery(query);
      expect(result.visualizationType).toBe(expectedType);
      expect(result.confidence).toBeGreaterThanOrEqual(minConfidence);
    };

    // Add more tests for special case classification
  });
}); 