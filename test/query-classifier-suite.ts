import { classifyQueryWithLayers } from '../lib/query-classifier';
import * as fs from 'fs';
import * as path from 'path';

interface TestCase {
  query: string;
  expected: {
    visualizationType: string;
    intent: string;
    relevantLayers: string[];
    topN?: number;
  };
}

interface TestResult {
  query: string;
  expectedViz: string;
  actualViz: string;
  expectedIntent: string;
  actualIntent: string;
  layersMatch: boolean;
  status: '✅ PASS' | '❌ FAIL';
}

async function runTests() {
  const queriesPath = path.join(__dirname, 'test-queries.json');
  const testCases: TestCase[] = JSON.parse(fs.readFileSync(queriesPath, 'utf-8'));

  const results: TestResult[] = [];

  for (const testCase of testCases) {
    const analysisResult = await classifyQueryWithLayers(testCase.query);

    const actual = {
      visualizationType: analysisResult.visualizationType || 'N/A',
      intent: analysisResult.intent || 'N/A',
      relevantLayers: analysisResult.relevantLayers || [],
    };

    const layersMatch = actual.relevantLayers.sort().join(',') === testCase.expected.relevantLayers.sort().join(',');
    const status =
      actual.visualizationType.toLowerCase() === testCase.expected.visualizationType.toLowerCase() &&
      (actual.intent === testCase.expected.intent || actual.intent === `${testCase.expected.visualizationType.toLowerCase()}_analysis`) &&
      layersMatch
        ? '✅ PASS'
        : '❌ FAIL';

    results.push({
      query: testCase.query,
      expectedViz: testCase.expected.visualizationType,
      actualViz: actual.visualizationType,
      expectedIntent: testCase.expected.intent,
      actualIntent: actual.intent,
      layersMatch: layersMatch,
      status: status,
    });
  }

  // Generate Markdown report
  let report = `
# Query Classifier Test Report

| Query | Expected Viz | Actual Viz | Expected Intent | Actual Intent | Layers Match | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
`;

  results.forEach(res => {
    report += `| ${res.query} | ${res.expectedViz} | ${res.actualViz} | ${res.expectedIntent} | ${res.actualIntent} | ${res.layersMatch ? '✅' : '❌'} | ${res.status} |\n`;
  });

  const reportPath = path.join(__dirname, 'test-report.md');
  fs.writeFileSync(reportPath, report);

  console.log(`Test report generated at: ${reportPath}`);
}

runTests().catch(error => {
  console.error('Error running test suite:', error);
}); 