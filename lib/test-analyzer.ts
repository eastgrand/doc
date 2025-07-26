import { analyzeQuery } from './query-analyzer';
import { conceptMapping } from './concept-mapping';

async function testQueries() {
  const queries = [
    "which areas have the most applications",
    "show me areas with high application numbers",
    "where do we see the highest number of mortgage applications",
    "top regions by application count",
    "areas with many loan applications"
  ];

  for (const query of queries) {
    console.log('\nTesting query:', query);
    try {
      const conceptMap = await conceptMapping(query);
      console.log('Concept mapping result:', {
        matchedLayers: conceptMap.matchedLayers,
        matchedFields: conceptMap.matchedFields,
        fieldScores: conceptMap.fieldScores
      });

      const analysis = await analyzeQuery(query, conceptMap);
      console.log('Analysis result:', {
        queryType: analysis.queryType,
        targetVariable: analysis.targetVariable,
        targetField: analysis.targetField,
        demographic_filters: analysis.demographic_filters
      });
    } catch (error) {
      console.error('Error analyzing query:', error);
    }
  }
}

testQueries().catch(console.error); 