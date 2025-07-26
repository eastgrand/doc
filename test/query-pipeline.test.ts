import { analyzeQuery } from '../lib/query-analyzer';
import { conceptMapping, mapToConcepts } from '../lib/concept-mapping';
import { callAnalysisService } from '../utils/analysis-service';
import { AnalysisServiceRequest } from '../lib/analytics/types';

// Mock the analysis service so we can inspect the request it receives
jest.mock('../utils/analysis-service');
const mockedCallAnalysisService = callAnalysisService as jest.Mock;

describe('Query to Microservice Pipeline', () => {

  // Clear mocks before each test
  beforeEach(() => {
    mockedCallAnalysisService.mockClear();
  });

  it('should create a correct microservice request for a joint_high query', async () => {
    const query = "Which areas have high median disposable income and high conversion rates";

    // 1. Simulate the client-side analysis from geospatial-chat-interface.tsx
    const conceptMap = await conceptMapping(query);
    const analysisResult = await analyzeQuery(query, conceptMap);

    // Map the technical names to conceptual names for the request
    const { layers: conceptualLayers, fields: conceptualFields } = mapToConcepts(
      analysisResult.relevantLayers,
      conceptMap.matchedFields
    );

    // 2. Simulate the creation of the request object
    const microserviceRequest: AnalysisServiceRequest = {
      query: query,
      analysis_type: analysisResult?.queryType || 'correlation',
      conversationContext: '',
      minApplications: 1,
      target_variable: analysisResult.targetVariable || 'CONVERSION_RATE',
      demographic_filters: [],
      relevantLayers: conceptualLayers,
      matchedFields: conceptualFields,
    };
    
    // 3. Simulate the call to the microservice
    await mockedCallAnalysisService(microserviceRequest);

    // 4. Assert that the request was made and is correct
    expect(mockedCallAnalysisService).toHaveBeenCalledTimes(1);
    
    const actualRequest = mockedCallAnalysisService.mock.calls[0][0];

    // Check that the analysis type is correct
    expect(actualRequest.analysis_type).toBe('jointHigh');
    
    // Check that all relevant layers and fields were identified
    expect(actualRequest.relevantLayers).toEqual(expect.arrayContaining(['demographics', 'conversions']));
    expect(actualRequest.matchedFields).toEqual(expect.arrayContaining(['median_disposable_income', 'conversion_rate']));
  });
}); 