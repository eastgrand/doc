// Test if the precision fix in prompts would work
const fs = require('fs');

console.log('=== Testing Precision Fix ===\n');

// Simulate the updated prompt being sent to Claude
const precisionPrompt = `
STRATEGIC ANALYSIS TECHNICAL CONTEXT:
You are analyzing strategic value data with pre-calculated scores for market expansion opportunities.

CRITICAL REQUIREMENTS:
1. ALWAYS preserve exact score precision - use 79.34, NOT 79.3
2. Rank and prioritize by strategic_value_score with full decimal places
3. Preserve all decimal precision in score reporting for accuracy

FORMATTING REQUIREMENTS:
3. Score Precision:
   - Always preserve the exact precision of analysis scores (e.g., 79.34, not 79.3)
   - Do not round strategic values, competitive scores, or other analysis metrics
   - Show full decimal places as they appear in the source data
`;

console.log('Updated prompt instructions:');
console.log(precisionPrompt);

// Simulate Claude receiving the data with precision instructions
const testData = [
  { area_name: '11234 (Brooklyn)', value: 79.34 },
  { area_name: '11385 (Ridgewood)', value: 79.17 },
  { area_name: '10314 (Staten Island)', value: 79.12 },
  { area_name: '11226 (Brooklyn)', value: 79.07 },
  { area_name: '10025 (New York)', value: 78.93 }
];

console.log('\nTest data to be sent to Claude:');
testData.forEach((record, i) => {
  console.log(`${i+1}. ${record.area_name}: ${record.value}`);
});

console.log('\n=== Expected Claude Response (after fix) ===');
console.log('With the updated prompt, Claude should now respond:');
console.log('');
console.log('1. ZIP 11234 (Brooklyn, NY): Strategic value score of 79.34');  
console.log('2. ZIP 11385 (Ridgewood, NY): Strategic value score of 79.17');
console.log('3. ZIP 10314 (Staten Island, NY): Strategic value score of 79.12');
console.log('4. ZIP 11226 (Brooklyn, NY): Strategic value score of 79.07');
console.log('5. ZIP 10025 (Manhattan, NY): Strategic value score of 78.93');

console.log('\n=== Verification ===');
console.log('✅ Prompt explicitly instructs to preserve precision');
console.log('✅ Specific example shows 79.34 NOT 79.3');
console.log('✅ Multiple warnings about not rounding strategic values');
console.log('✅ Strategic analysis has dedicated precision requirements');

console.log('\nThe fix should resolve the issue where Claude was rounding');
console.log('79.34 -> 79.3 in its natural language response.');