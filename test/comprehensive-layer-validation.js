#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 COMPREHENSIVE LAYER VALIDATION TEST');
console.log('=====================================\n');

try {
  // Read the actual layers file
  const layersPath = path.join(__dirname, '../config/layers.ts');
  const layersContent = fs.readFileSync(layersPath, 'utf8');
  
  // Extract all field aliases
  const fieldMatches = layersContent.match(/"alias":\s*"([^"]+)"/g) || [];
  const allFields = fieldMatches.map(match => match.match(/"([^"]+)"/)[1]);
  
  console.log(`📊 Found ${allFields.length} total fields in configuration`);
  
  // Categorize fields by type
  const categories = {
    population: allFields.filter(f => f.toLowerCase().includes('population')),
    income: allFields.filter(f => f.toLowerCase().includes('income') || f.toLowerCase().includes('disposable')),
    race: allFields.filter(f => f.toLowerCase().includes('white') || f.toLowerCase().includes('black') || f.toLowerCase().includes('asian') || f.toLowerCase().includes('hispanic')),
    brands: allFields.filter(f => f.toLowerCase().includes('nike') || f.toLowerCase().includes('adidas') || f.toLowerCase().includes('jordan') || f.toLowerCase().includes('converse')),
    sports: allFields.filter(f => f.toLowerCase().includes('nba') || f.toLowerCase().includes('nfl') || f.toLowerCase().includes('running') || f.toLowerCase().includes('yoga')),
    retail: allFields.filter(f => f.toLowerCase().includes('dick') || f.toLowerCase().includes('foot locker')),
    age: allFields.filter(f => f.toLowerCase().includes('age') || f.toLowerCase().includes('millennial') || f.toLowerCase().includes('gen')),
    other: []
  };
  
  console.log('\n📈 FIELD ANALYSIS BY CATEGORY:');
  Object.entries(categories).forEach(([category, fields]) => {
    if (fields.length > 0) {
      console.log(`   ${category}: ${fields.length} fields`);
      console.log(`     Examples: ${fields.slice(0, 3).join(', ')}`);
    }
  });
  
  // Test if mapping files exist and contain relevant content
  console.log('\n🧪 TESTING FIELD MAPPING FILES...');
  
  let conceptMappingExists = false;
  let queryAnalyzerExists = false;
  let mappingCoverage = 0;
  
  try {
    const conceptPath = path.join(__dirname, '../lib/concept-mapping.ts');
    const conceptContent = fs.readFileSync(conceptPath, 'utf8');
    conceptMappingExists = true;
    
    // Count how many fields are mentioned in concept mapping
    const mappedInConcept = allFields.filter(field => 
      conceptContent.toLowerCase().includes(field.toLowerCase())
    ).length;
    
    console.log(`   concept-mapping.ts: ✅ (${mappedInConcept} fields referenced)`);
  } catch (error) {
    console.log(`   concept-mapping.ts: ❌ (${error.message})`);
  }
  
  try {
    const queryPath = path.join(__dirname, '../lib/query-analyzer.ts');
    const queryContent = fs.readFileSync(queryPath, 'utf8');
    queryAnalyzerExists = true;
    
    // Count how many fields are mentioned in query analyzer
    const mappedInQuery = allFields.filter(field => 
      queryContent.toLowerCase().includes(field.toLowerCase())
    ).length;
    
    console.log(`   query-analyzer.ts: ✅ (${mappedInQuery} fields referenced)`);
  } catch (error) {
    console.log(`   query-analyzer.ts: ❌ (${error.message})`);
  }
  
  // Calculate rough coverage estimate
  if (conceptMappingExists && queryAnalyzerExists) {
    // Simple heuristic: check if key terms are present in mapping files
    const keyTerms = ['nike', 'adidas', 'jordan', 'converse', 'population', 'income', 'nba', 'running'];
    const conceptContent = fs.readFileSync(path.join(__dirname, '../lib/concept-mapping.ts'), 'utf8').toLowerCase();
    const queryContent = fs.readFileSync(path.join(__dirname, '../lib/query-analyzer.ts'), 'utf8').toLowerCase();
    
    const mappedTerms = keyTerms.filter(term => 
      conceptContent.includes(term) || queryContent.includes(term)
    );
    
    mappingCoverage = (mappedTerms.length / keyTerms.length) * 100;
    console.log(`   Estimated coverage: ${mappingCoverage.toFixed(1)}% (${mappedTerms.length}/${keyTerms.length} key terms)`);
  }
  
  // Test critical queries
  console.log('\n🧪 TESTING CRITICAL QUERIES...');
  
  const criticalQueries = [
    'How do Jordan sales compare to Converse sales?',
    'Show me areas with highest population',
    'What is the relationship between income and demographics?',
    'Compare Nike vs Adidas purchases',
    'Show NBA fan demographics'
  ];
  
  let passedQueries = 0;
  
  criticalQueries.forEach(query => {
    // Simple test: check if query terms have corresponding fields
    const queryTerms = query.toLowerCase().split(' ');
    const hasMatchingFields = queryTerms.some(term => 
      allFields.some(field => field.toLowerCase().includes(term))
    );
    
    if (hasMatchingFields) {
      passedQueries++;
      console.log(`   ✅ "${query}"`);
    } else {
      console.log(`   ❌ "${query}" - No matching fields found`);
    }
  });
  
  // Generate final report
  console.log('\n📋 VALIDATION REPORT');
  console.log('='.repeat(50));
  
  const issues = [];
  
  if (!conceptMappingExists) issues.push('concept-mapping.ts missing or unreadable');
  if (!queryAnalyzerExists) issues.push('query-analyzer.ts missing or unreadable');
  if (mappingCoverage < 80) issues.push(`Field mapping coverage too low: ${mappingCoverage.toFixed(1)}%`);
  if (passedQueries < criticalQueries.length) issues.push(`${criticalQueries.length - passedQueries} critical queries failing`);
  
  console.log(`Total Fields: ${allFields.length}`);
  console.log(`Mapping Coverage: ${mappingCoverage.toFixed(1)}%`);
  console.log(`Critical Query Success: ${passedQueries}/${criticalQueries.length}`);
  
  if (issues.length > 0) {
    console.log(`\n🚨 CRITICAL ISSUES:`);
    issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
    console.log('\n❌ VALIDATION FAILED - Issues must be fixed before production');
    process.exit(1);
  } else {
    console.log('\n✅ VALIDATION PASSED - All systems ready');
    process.exit(0);
  }
  
} catch (error) {
  console.error('❌ Validation failed:', error.message);
  process.exit(1);
}
