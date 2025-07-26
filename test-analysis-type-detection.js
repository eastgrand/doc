// Test what analysisType is being passed for strategic queries
console.log('=== Testing Analysis Type Detection ===\n');

// The key issue: what value is in metadata.analysisType for strategic queries?
console.log('Possible sources of metadata.analysisType:');
console.log('1. From UI request metadata');
console.log('2. From endpoint routing (/strategic-analysis)');
console.log('3. From query analysis/detection');
console.log('4. Default fallback');

console.log('\nIf metadata.analysisType is not set correctly, it falls back to "default"');
console.log('And "default" uses the generic prompt without precision requirements');

console.log('\n=== The Fix Needed ===');
console.log('We need to ensure that when endpoint="/strategic-analysis"');
console.log('Then metadata.analysisType="strategic" or "strategic-analysis"');
console.log('So it uses the strategic_analysis prompt with precision requirements');

console.log('\n=== Testing Current Behavior ===');

// Test what happens with different metadata.analysisType values
const testCases = [
  { analysisType: undefined, expected: 'default (WRONG - uses generic prompt)' },
  { analysisType: 'default', expected: 'default (WRONG - uses generic prompt)' },
  { analysisType: 'strategic', expected: 'strategic_analysis (CORRECT)' },
  { analysisType: 'strategic-analysis', expected: 'strategic_analysis (CORRECT)' },
  { analysisType: 'strategic_analysis', expected: 'strategic_analysis (CORRECT)' }
];

testCases.forEach(test => {
  const personaAnalysisType = test.analysisType || 'default';
  console.log(`metadata.analysisType: ${test.analysisType || 'undefined'}`);
  console.log(`  -> personaAnalysisType: "${personaAnalysisType}"`);
  console.log(`  -> Expected prompt: ${test.expected}`);
  console.log('');
});

console.log('CONCLUSION: We need to find where metadata.analysisType is set');
console.log('and ensure it\'s "strategic" when endpoint="/strategic-analysis"');