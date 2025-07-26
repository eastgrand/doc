import { ANALYSIS_CATEGORIES } from '../components/chat/chat-constants';
import { conceptMapping } from '../lib/concept-mapping';
import { analyzeQuery } from '../lib/query-analyzer';
import { buildMicroserviceRequest } from '../lib/build-microservice-request';

// Poly-fill global fetch in Node <=17 or any environment where it is missing
// eslint-disable-next-line @typescript-eslint/no-var-requires
if (typeof global.fetch === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    // @ts-ignore – node-fetch types not included in runtime build
    global.fetch = require('node-fetch');
  } catch {
    throw new Error('Global fetch is undefined and node-fetch is not installed. Please use Node 18+ or install node-fetch.');
  }
}

type AnalysisServiceRequest = {
  analysis_type: string;
  query: string;
  conversationContext: string;
  minApplications: number;
  top_n: number;
  target_variable: string;
  relevant_layers: string[];
  relevantLayers: string[];
  demographic_filters: any[];
};

const allQueries: string[] = [
  ...Object.values(ANALYSIS_CATEGORIES).flat(),
];

// Expected variable codes & visualization strategy per query (where known)
const EXPECTATIONS: Record<string, { expectedTarget?: string; expectedVisualization?: string }> = {
  /** Athletic Shoes Rankings **/
  'Show me the top 10 areas with highest Nike athletic shoe purchases': { expectedTarget: 'MP30034A_B', expectedVisualization: 'ranking' },
  'Which areas have the highest overall athletic shoe purchases?': { expectedTarget: 'MP30016A_B', expectedVisualization: 'ranking' },
  'Rank areas by Adidas athletic shoe sales': { expectedTarget: 'MP30029A_B', expectedVisualization: 'ranking' },
  'Show top 15 regions for Jordan athletic shoe purchases': { expectedTarget: 'MP30032A_B', expectedVisualization: 'ranking' },

  /** Brand Performance Comparisons **/
  'Compare Nike vs Adidas athletic shoe purchases across regions': { expectedTarget: 'MP30034A_B', expectedVisualization: 'correlation' },
  'How do Jordan sales compare to Converse sales?': { expectedTarget: 'MP30032A_B', expectedVisualization: 'correlation' },
  'Compare athletic shoe purchases between Nike, Puma, and New Balance': { expectedTarget: 'MP30034A_B', expectedVisualization: 'multivariate' },
  'Analyze performance differences between premium brands (Nike, Jordan) vs budget brands (Skechers)': { expectedTarget: 'MP30034A_B', expectedVisualization: 'correlation' },

  /** Demographics vs Athletic Shoe Purchases **/
  'What is the relationship between income and Nike athletic shoe purchases?': { expectedTarget: 'MP30034A_B', expectedVisualization: 'correlation' },
  'How does age demographics correlate with athletic shoe buying patterns?': { expectedTarget: 'MP30016A_B', expectedVisualization: 'correlation' },
  'Analyze the correlation between population diversity and premium athletic shoe purchases': { expectedTarget: 'MP30034A_B', expectedVisualization: 'correlation' },
  'What factors influence athletic shoe purchasing behavior?': { expectedTarget: 'MP30016A_B', expectedVisualization: 'correlation' },

  /** Geographic Athletic Market Analysis **/
  'Find high-performing Nike markets in high-income areas': { expectedTarget: 'MP30034A_B', expectedVisualization: 'joint high' },
  'Show athletic shoe purchase patterns by geographic region': { expectedTarget: 'MP30016A_B', expectedVisualization: 'choropleth' },
  'Identify emerging markets for premium athletic footwear': { expectedTarget: 'MP30034A_B', expectedVisualization: 'choropleth' },
  'Map athletic shoe brand preferences across different ZIP codes': { expectedTarget: 'MP30016A_B', expectedVisualization: 'choropleth' },

  /** Sports Participation vs Shoe Purchases **/
  'Correlate running participation with running shoe purchases': { expectedTarget: 'MP33020A_B', expectedVisualization: 'correlation' },
  'How do basketball participation rates affect Jordan shoe sales?': { expectedTarget: 'MP30032A_B', expectedVisualization: 'correlation' },
  'Analyze the relationship between yoga participation and athletic shoe purchases': { expectedTarget: 'MP33032A_B', expectedVisualization: 'correlation' },
  'Compare shoe buying patterns in areas with high vs low sports participation': { expectedTarget: 'MP30016A_B', expectedVisualization: 'correlation' },

  /** Retail Channel Analysis **/
  "Correlate Dick's Sporting Goods shopping with Nike purchases": { expectedTarget: 'MP31035A_B', expectedVisualization: 'correlation' },
  'How do Foot Locker shopping patterns relate to athletic shoe purchases?': { expectedTarget: 'MP31042A_B', expectedVisualization: 'correlation' },
  'Find areas with high sporting goods retail activity and athletic shoe sales': { expectedTarget: 'MP30016A_B', expectedVisualization: 'joint high' },
  'Analyze the relationship between retail access and brand preferences': { expectedTarget: 'MP30016A_B', expectedVisualization: 'correlation' },

  /** Generational Athletic Preferences **/
  'How do Millennial areas differ in athletic shoe preferences vs Gen Z areas?': { expectedTarget: 'MP30016A_B', expectedVisualization: 'correlation' },
  'Compare athletic shoe purchasing between different age demographics': { expectedTarget: 'MP30016A_B', expectedVisualization: 'correlation' },
  'Analyze brand loyalty patterns across generational groups': { expectedTarget: 'MP30016A_B', expectedVisualization: 'correlation' },
  'What athletic brands are most popular among younger demographics?': { expectedTarget: 'MP30016A_B', expectedVisualization: 'choropleth' },

  /** Premium vs Budget Athletic Market **/
  'Find areas where premium athletic shoes (Nike, Jordan) outperform budget options': { expectedTarget: 'MP30034A_B', expectedVisualization: 'correlation' },
  'Compare purchasing patterns between high-end and affordable athletic brands': { expectedTarget: 'MP30034A_B', expectedVisualization: 'correlation' },
  'Analyze income thresholds for premium athletic shoe purchases': { expectedTarget: 'MP30034A_B', expectedVisualization: 'choropleth' },
  'Identify markets with potential for premium athletic brand expansion': { expectedTarget: 'MP30034A_B', expectedVisualization: 'choropleth' },
};

// Collect summary rows for afterAll report
const testResults: Array<{ query: string; status: number; errorMsg?: string; expectedTarget?: string; actualTarget: string; expectedViz?: string; actualViz: string }> = [];

describe('Chat-Constants integration – live micro-service validations', () => {
  // Allow plenty of time – each query hits a remote API
  jest.setTimeout(300_000); // 5 min

  const msBase = process.env.NEXT_PUBLIC_SHAP_MICROSERVICE_URL ||
                 'https://shap-demographic-analytics-v3.onrender.com';
  const analyzeUrl = `${msBase.replace(/\/$/, '')}/analyze`;
  const apiKey = process.env.NEXT_PUBLIC_SHAP_MICROSERVICE_API_KEY;

  for (const query of allQueries) {
    const { expectedTarget, expectedVisualization } = EXPECTATIONS[query] || {};

    test(`"${query}" → micro-service 200 OK`, async () => {
      // 1. Concept mapping & intent analysis
      const concept = await conceptMapping(query);
      const analysis = await analyzeQuery(query, concept);

      expect(analysis.targetVariable).toBeTruthy();
      expect(analysis.visualizationStrategy).not.toBe('unknown');

      // 2. Build live request payload using the same helper as the UI
      const payload = buildMicroserviceRequest(analysis, query, undefined, '');

      // 3. POST to micro-service
      const res = await fetch(analyzeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'X-API-KEY': apiKey }),
        },
        body: JSON.stringify(payload),
      });

      const statusCode = res.status;
      let json: any = {};
      try {
        json = await res.json();
      } catch (_) {
        /* ignore */
      }

      const errorMsg = json?.error || json?.message || (statusCode >= 400 ? `HTTP ${statusCode}` : undefined);

      // Save summary entry regardless of pass/fail
      testResults.push({
        query,
        status: statusCode,
        errorMsg,
        expectedTarget,
        actualTarget: analysis.targetVariable || '',
        expectedViz: expectedVisualization,
        actualViz: analysis.visualizationStrategy || '',
      });

      // Basic expectation: 200 OK
      expect(statusCode).toBe(200);
      expect(errorMsg).toBeUndefined();

      if (json && Array.isArray(json.results)) {
        expect(Array.isArray(json.results)).toBe(true);
      }

      // Comparison assertions if expectations provided
      if (expectedTarget) {
        expect(analysis.targetVariable).toBe(expectedTarget);
      }
      if (expectedVisualization) {
        expect(analysis.visualizationStrategy).toBe(expectedVisualization);
      }
    });
  }

  afterAll(() => {
    // eslint-disable-next-line no-console
    console.log('\n===== Chat-Constants Integration Report =====');
    // eslint-disable-next-line no-console
    console.table(testResults);
  });
}); 