// Check if the issue is in data precision
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./public/data/endpoints/strategic-analysis.json', 'utf8'));

console.log('=== Strategic Analysis Data Check ===\n');
console.log('Top 10 records strategic_value_score values:');

data.results.slice(0, 10).forEach((record, i) => {
  const score = record.strategic_value_score;
  console.log(`${i+1}. ${record.DESCRIPTION}: ${score} (type: ${typeof score})`);
});

console.log('\n=== Potential Issues ===');

// Check if all scores are the same
const scores = data.results.slice(0, 10).map(r => r.strategic_value_score);
const uniqueScores = [...new Set(scores)];

if (uniqueScores.length === 1) {
  console.log('🚨 PROBLEM: All top 10 scores are identical:', uniqueScores[0]);
} else {
  console.log('✅ Good: Found', uniqueScores.length, 'unique scores in top 10');
  console.log('Unique values:', uniqueScores.sort((a,b) => b-a));
}

// Check if there's a 'value' field that might be interfering
console.log('\nChecking for interfering "value" field:');
const hasValue = data.results[0].hasOwnProperty('value');
const hasOpportunityScore = data.results[0].hasOwnProperty('opportunity_score');

console.log('First record has "value" field:', hasValue);
console.log('First record has "opportunity_score" field:', hasOpportunityScore);

if (hasValue) {
  console.log('First record "value":', data.results[0].value);
}
if (hasOpportunityScore) {
  console.log('First record "opportunity_score":', data.results[0].opportunity_score);
}