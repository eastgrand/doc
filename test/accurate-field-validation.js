#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 ACCURATE FIELD VALIDATION TEST');
console.log('=================================\n');

try {
  // Read the actual layers file
  const layersPath = path.join(__dirname, '../config/layers.ts');
  const layersContent = fs.readFileSync(layersPath, 'utf8');
  
  // Extract ONLY meaningful data fields (exclude system fields)
  const allAliases = layersContent.match(/"alias":\s*"([^"]+)"/g) || [];
  const meaningfulFields = allAliases
    .map(match => match.match(/"([^"]+)"/)[1])
    .filter(alias => !alias.match(/Object ID|Shape__|CreationDate|Creator|EditDate|Editor|Internal|^ZIP Code$|^ID$/));
  
  console.log(`📊 Found ${meaningfulFields.length} meaningful data fields (excluding ${allAliases.length - meaningfulFields.length} system fields)`);
  
  // Categorize the meaningful fields
  const categories = {
    brands: meaningfulFields.filter(f => f.toLowerCase().includes('nike') || f.toLowerCase().includes('adidas') || f.toLowerCase().includes('jordan') || f.toLowerCase().includes('converse')),
    population: meaningfulFields.filter(f => f.toLowerCase().includes('population')),
    income: meaningfulFields.filter(f => f.toLowerCase().includes('income') || f.toLowerCase().includes('disposable')),
    race: meaningfulFields.filter(f => f.toLowerCase().includes('white') || f.toLowerCase().includes('black') || f.toLowerCase().includes('asian') || f.toLowerCase().includes('hispanic')),
    sports: meaningfulFields.filter(f => f.toLowerCase().includes('nba') || f.toLowerCase().includes('nfl') || f.toLowerCase().includes('running') || f.toLowerCase().includes('yoga')),
    retail: meaningfulFields.filter(f => f.toLowerCase().includes('dick') || f.toLowerCase().includes('foot locker')),
    age: meaningfulFields.filter(f => f.toLowerCase().includes('age') || f.toLowerCase().includes('millennial') || f.toLowerCase().includes('gen'))
  };
  
  console.log('\n📈 MEANINGFUL FIELD ANALYSIS:');
  Object.entries(categories).forEach(([category, fields]) => {
    if (fields.length > 0) {
      console.log(`   ${category}: ${fields.length} fields`);
      console.log(`     Examples: ${fields.slice(0, 2).join(', ')}`);
    }
  });
  
  // Test specific critical fields
  console.log('\n🎯 CRITICAL FIELD VERIFICATION:');
  
  const criticalFields = [
    { name: 'Jordan', pattern: /jordan/i, expected: true },
    { name: 'Converse', pattern: /converse/i, expected: true },
    { name: 'Nike', pattern: /nike/i, expected: true },
    { name: 'Adidas', pattern: /adidas/i, expected: true },
    { name: 'Population', pattern: /population/i, expected: true },
    { name: 'Income', pattern: /income/i, expected: true }
  ];
  
  let criticalFieldsFound = 0;
  
  criticalFields.forEach(({ name, pattern, expected }) => {
    const found = meaningfulFields.some(field => pattern.test(field));
    if (found) {
      criticalFieldsFound++;
      console.log(`   ✅ ${name}: Found`);
    } else {
      console.log(`   ❌ ${name}: Missing`);
    }
  });
  
  // Test if these fields are accessible to the query system
  console.log('\n🧪 TESTING QUERY SYSTEM ACCESS...');
  
  let conceptMappingScore = 0;
  let queryAnalyzerScore = 0;
  
  try {
    const conceptContent = fs.readFileSync(path.join(__dirname, '../lib/concept-mapping.ts'), 'utf8').toLowerCase();
    
    // Test if key terms are in concept mapping
    const conceptTests = ['jordan', 'converse', 'nike', 'adidas', 'population', 'income'];
    const conceptMatches = conceptTests.filter(term => conceptContent.includes(term));
    conceptMappingScore = (conceptMatches.length / conceptTests.length) * 100;
    
    console.log(`   concept-mapping.ts: ${conceptMappingScore.toFixed(1)}% (${conceptMatches.length}/${conceptTests.length} terms)`);
    console.log(`     Found: ${conceptMatches.join(', ')}`);
    
  } catch (error) {
    console.log(`   concept-mapping.ts: ❌ Error reading file`);
  }
  
  try {
    const queryContent = fs.readFileSync(path.join(__dirname, '../lib/query-analyzer.ts'), 'utf8').toLowerCase();
    
    // Test if key terms are in query analyzer
    const queryTests = ['jordan', 'converse', 'nike', 'adidas', 'population', 'income'];
    const queryMatches = queryTests.filter(term => queryContent.includes(term));
    queryAnalyzerScore = (queryMatches.length / queryTests.length) * 100;
    
    console.log(`   query-analyzer.ts: ${queryAnalyzerScore.toFixed(1)}% (${queryMatches.length}/${queryTests.length} terms)`);
    console.log(`     Found: ${queryMatches.join(', ')}`);
    
  } catch (error) {
    console.log(`   query-analyzer.ts: ❌ Error reading file`);
  }
  
  // Generate final assessment
  console.log('\n📋 VALIDATION SUMMARY');
  console.log('='.repeat(40));
  
  console.log(`Meaningful Data Fields: ${meaningfulFields.length}`);
  console.log(`Critical Fields Found: ${criticalFieldsFound}/${criticalFields.length}`);
  console.log(`Concept Mapping Coverage: ${conceptMappingScore.toFixed(1)}%`);
  console.log(`Query Analyzer Coverage: ${queryAnalyzerScore.toFixed(1)}%`);
  
  const issues = [];
  
  if (criticalFieldsFound < criticalFields.length) {
    issues.push(`Missing ${criticalFields.length - criticalFieldsFound} critical fields in layer config`);
  }
  
  if (conceptMappingScore < 80) {
    issues.push(`Concept mapping coverage too low: ${conceptMappingScore.toFixed(1)}%`);
  }
  
  if (queryAnalyzerScore < 80) {
    issues.push(`Query analyzer coverage too low: ${queryAnalyzerScore.toFixed(1)}%`);
  }
  
  if (issues.length > 0) {
    console.log(`\n🚨 ISSUES FOUND:`);
    issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
    
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. The fields exist in config - the issue is in the mapping services');
    console.log('   2. Update concept-mapping.ts to include all field terms');
    console.log('   3. Update query-analyzer.ts to include all field terms');
    console.log('   4. Test queries in the actual UI');
    
    console.log('\n❌ VALIDATION FAILED - Mapping services need updates');
    process.exit(1);
  } else {
    console.log('\n✅ VALIDATION PASSED - All systems properly configured');
    process.exit(0);
  }
  
} catch (error) {
  console.error('❌ Validation failed:', error.message);
  process.exit(1);
}
