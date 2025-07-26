import { VisualizationType } from "../../reference/dynamic-layers";
import { QueryClassifier, classifyQuery } from '../../lib/query-classifier';

describe('QueryClassifier', () => {
  let queryClassifier: QueryClassifier;

  beforeEach(() => {
    queryClassifier = new QueryClassifier();
  });

  describe('classifyQuery', () => {
    it('should classify choropleth queries correctly', async () => {
      const queries = [
        'Show me income distribution across neighborhoods',
        'Map income levels by zip code',
        'Display population density',
        'Visualize income distribution by county'
      ];
      
      for (const query of queries) {
        const result = await classifyQuery(query);
        expect(result.visualizationType).toBe(VisualizationType.CHOROPLETH);
      }
    });

    it('should classify heatmap queries correctly', async () => {
      const queries = [
        'Show a heatmap of crime',
        'Display concentration of restaurants',
        'Heat map of traffic accidents',
        'Where are customers concentrated'
      ];
      
      for (const query of queries) {
        const result = await classifyQuery(query);
        expect(result.visualizationType).toBe(VisualizationType.HEATMAP);
      }
    });

    it('should classify scatter queries correctly', async () => {
      const queries = [
        'Plot all store locations',
        'Show me all schools',
        'Mark the positions of fire hydrants',
        'Display individual data points for rainfall'
      ];
      
      for (const query of queries) {
        const result = await classifyQuery(query);
        expect(result.visualizationType).toBe(VisualizationType.SCATTER);
      }
    });

    it('should classify buffer queries correctly', async () => {
      const queries = [
        'Show a 5 mile buffer around hospitals',
        'Create a 10km radius around schools',
        'Areas within 2 kilometers of fire stations',
        'Show proximity zone of 500 meters from parks'
      ];
      
      for (const query of queries) {
        const result = await classifyQuery(query);
        expect(result.visualizationType).toBe(VisualizationType.BUFFER);
      }
    });

    it('should classify hotspot queries correctly', async () => {
      const queries = [
        'Find hotspots of crime',
        'Where are income hotspots located',
        'Identify clusters of high population density',
        'Show statistically significant areas of poverty'
      ];
      
      for (const query of queries) {
        const result = await classifyQuery(query);
        expect(result.visualizationType).toBe(VisualizationType.HOTSPOT);
      }
    });

    it('should classify network queries correctly', async () => {
      const queries = [
        'Show network between cities and airports',
        'Visualize connections from suppliers to stores',
        'Display flow of migration between states',
        'Show relationships between schools and libraries'
      ];
      
      for (const query of queries) {
        const result = await classifyQuery(query);
        expect(result.visualizationType).toBe(VisualizationType.NETWORK);
      }
    });

    it('should classify multivariate queries correctly', async () => {
      const queries = [
        'Compare population, income, and education',
        'Multivariate analysis of age, income, and health',
        'Show relationship between multiple variables income, education, and employment',
        'Visualize income with size, education with color, and health with opacity'
      ];
      
      for (const query of queries) {
        const result = await classifyQuery(query);
        expect(result.visualizationType).toBe(VisualizationType.MULTIVARIATE);
      }
    });
  });

  describe('classifyAnalysisResult', () => {
    it('should classify based on query in analysisResult', async () => {
      const analysisResult = {
        intent: 'visualization',
        relevantLayers: ['populationLayer'],
        queryType: 'visualization',
        confidence: 0.9,
        explanation: 'User wants to visualize data',
        originalQuery: 'Show hotspots of income',
        visualizationType: VisualizationType.CHOROPLETH
      };
      
      const visualizationType = await queryClassifier.classifyAnalysisResult(analysisResult);
      expect(visualizationType).toBe(VisualizationType.HOTSPOT);
    });
    
    it('should use relevantFields for better classification', async () => {
      const analysisResult = {
        intent: 'visualization',
        relevantLayers: ['populationLayer', 'incomeLayer'],
        relevantFields: ['population', 'income', 'education'],
        queryType: 'comparison',
        confidence: 0.9,
        explanation: 'User wants to compare multiple variables',
        originalQuery: 'Compare demographics',
        visualizationType: VisualizationType.CHOROPLETH
      };
      
      const visualizationType = await queryClassifier.classifyAnalysisResult(analysisResult);
      expect(visualizationType).toBe(VisualizationType.MULTIVARIATE);
    });
  });

  describe('Pattern matching', () => {
    it('should detect buffer distances correctly', async () => {
      const query = 'Show me schools within 5 miles of downtown';
      const result = await classifyQuery(query);
      expect(result.visualizationType).toBe(VisualizationType.BUFFER);
    });
    
    it('should detect network relationships correctly', async () => {
      const query = 'Show connections from New York to Chicago';
      const result = await classifyQuery(query);
      expect(result.visualizationType).toBe(VisualizationType.NETWORK);
    });
    
    it('should detect bivariate patterns correctly', async () => {
      const query = 'Create a bivariate map of income and education';
      const result = await classifyQuery(query);
      expect(result.visualizationType).toBe(VisualizationType.BIVARIATE);
    });
  });
}); 