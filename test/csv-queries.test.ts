import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { analyzeQuery } from '../lib/query-analyzer';
import { conceptMapping } from '../lib/concept-mapping';

// Define the structure of a row in the CSV
interface QueryTestRecord {
  Query: string;
  Fields: string;
  Visualization: string;
}

// Load and parse the CSV file
const csvFilePath = path.resolve(__dirname, '../questions.csv');
const csvFileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
const records: QueryTestRecord[] = parse(csvFileContent, {
  columns: true,
  skip_empty_lines: true,
});

describe('CSV-based Query Analysis Tests', () => {
  // Dynamically create a test for each row in the CSV
  records.forEach((record) => {
    it(`should correctly analyze the query: "${record.Query}"`, async () => {
      console.log(`\n--- Testing Query: "${record.Query}" ---`);

      // 1. Concept Mapping
      const conceptMap = await conceptMapping(record.Query);
      console.log('Concept Map:', conceptMap);

      // 2. Query Analysis
      const analysisResult = await analyzeQuery(record.Query, conceptMap, '');
      console.log('Analysis Result:', analysisResult);

      // 3. Assertions
      const expectedFields = record.Fields.split(';').map(f => f.trim());
      const expectedVisualization = record.Visualization.trim();

      // Check visualization strategy
      expect(analysisResult.visualizationStrategy).toEqual(expectedVisualization);

      // Check if the analysis identified the correct fields.
      const actualFields = [
        analysisResult.targetVariable,
        ...(analysisResult.relevantFields || []),
      ].filter((f): f is string => !!f);

      // Check that all expected fields are included in the analysis result.
      const lowerCaseActualFields = actualFields.map(f => f.toLowerCase());
      expectedFields.forEach(field => {
        expect(lowerCaseActualFields).toContain(field.toLowerCase());
      });

      console.log('--- Test Passed ---');
    });
  });
});