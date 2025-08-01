// Enhanced Query Analyzer Test - Tests the ACTUAL production component we fixed
// This tests the specific EnhancedQueryAnalyzer improvements without requiring full AnalysisEngine

import { EnhancedQueryAnalyzer } from './lib/analysis/EnhancedQueryAnalyzer';
import fs from 'fs';

interface TestResult {
  query: string;
  category: string;
  bestEndpoint: string;
  mentionedFields: string[];
  expectedFields: string[];
  missingFields: string[];
  score: number;
  success: boolean;
  issues: string[];
}

// COMPREHENSIVE TEST QUERIES - All 98+ system fields represented
const TEST_QUERIES = {
  // Brand Analysis Queries
  'Brand Rankings': [
    'Show me the top 10 areas with highest Nike purchases',
    'Which areas have the most Adidas buyers?',
    'Rank areas by Jordan athletic shoe purchases',
    'Top performing regions for New Balance shoes',
    'Best areas for Puma athletic shoe sales',
    'ASICS athletic shoe market penetration',
    'Converse shoe purchase patterns by region',
    'Reebok athletic footwear performance',
    'Skechers brand loyalty analysis'
  ],
  
  // Brand Comparisons
  'Brand Comparisons': [
    'Compare Nike vs Adidas purchases across regions',
    'Nike vs Jordan performance comparison',
    'Adidas vs Puma market share analysis', 
    'Compare all athletic shoe brands performance',
    'Brand preference differences between areas',
    'New Balance vs ASICS competitive analysis',
    'Premium vs budget shoe brand preferences'
  ],
  
  // Demographic Analysis - Core Demographics
  'Core Demographics': [
    'Asian population vs athletic shoe preferences',
    'Black population athletic shoe trends',
    'White population brand preferences',
    'Millennial generation athletic shoe trends',
    'Gen Z athletic footwear preferences',
    'Generation Alpha shoe purchasing patterns',
    'Age correlation with athletic shoe buying',
    'Income correlation with athletic shoe buying',
    'High income areas and premium shoe brands'
  ],
  
  // Hispanic Demographics - Comprehensive Coverage
  'Hispanic Demographics': [
    'Hispanic population athletic shoe preferences',
    'Latino community brand preferences analysis',
    'Hispanic demographic correlation with athletic purchases',
    'Hispanic white population vs shoe purchases',
    'Latino millennials athletic footwear trends',
    'Hispanic black population athletic shoe analysis',
    'Hispanic American Indian athletic preferences',
    'Hispanic Pacific Islander shoe purchasing patterns',
    'Hispanic other race population brand preferences',
    'Latina demographic athletic shoe trends',
    'Hispanic Asian population footwear analysis'
  ],
  
  // Specialty Demographics
  'Specialty Demographics': [
    'American Indian population athletic shoe preferences',
    'Pacific Islander demographics and shoe trends',
    'Multi-racial population athletic footwear analysis',
    'Other race populations and brand preferences',
    'Household population vs athletic purchases',
    'Family population athletic shoe trends',
    'Wealth index correlation with shoe purchases',
    'Diversity index and brand preferences'
  ],
  
  // Geographic Analysis
  'Geographic Patterns': [
    'Athletic shoe purchase clusters on the map',
    'Regional patterns in sports participation',
    'Geographic distribution of Nike buyers',
    'Spatial analysis of athletic retail stores',
    'Hot spots for athletic shoe purchases',
    'ZIP code description analysis',
    'Location data correlation with purchases'
  ],
  
  // Sports & Activities - Complete Coverage
  'Sports Participation': [
    'Running participation vs running shoe purchases',
    'Basketball players vs basketball shoe sales',
    'Cross-training participation and shoe preferences',
    'Jogging activity correlation with shoe purchases',
    'General athletic participation vs purchases',
    'Sports fan demographics and shoe preferences',
    'Active lifestyle indicators and footwear'
  ],
  
  // Sports Fans - All Categories
  'Sports Fans': [
    'MLB fans athletic shoe preferences',
    'NBA fans basketball shoe trends',
    'NFL fans athletic footwear analysis',
    'NASCAR fans athletic shoe preferences',
    'NHL fans and athletic footwear trends',
    'International soccer fans shoe purchasing patterns',
    'MLS soccer fans brand preferences'
  ],
  
  // Retail & Market Analysis
  'Retail Analysis': [
    "Dick's Sporting Goods shoppers vs Nike purchases",
    'Foot Locker customers and brand preferences',
    'Retail channel analysis for athletic shoes',
    'Shopping behavior vs athletic shoe purchases',
    'Market penetration analysis for brands'
  ],
  
  // Spending & Economic Patterns - Complete Coverage
  'Spending Analysis': [
    'Sports clothing spending correlation with shoe purchases',
    'Athletic wear spending vs brand preferences',
    'High sports equipment spenders shoe buying patterns',
    'Sports clothing budget correlation with footwear choices',
    'Equipment investment vs athletic shoe preferences',
    'Premium sports spending demographic analysis',
    'Sports gear spending patterns by region',
    'High athletic wear spenders brand loyalty',
    'Survey data correlation with spending patterns'
  ],
  
  // Fitness & Lifestyle Activities
  'Fitness Activities': [
    'Yoga participation and athletic shoe preferences',
    'Weight lifting correlation with shoe purchases',
    'Gym membership vs athletic footwear',
    'Fitness center usage and shoe trends',
    'Health and wellness lifestyle indicators',
    'Active fitness demographic analysis'
  ],
  
  // Specific Shoe Types
  'Shoe Type Analysis': [
    'Basketball shoes purchase patterns by region',
    'Cross-training shoes vs fitness participation',
    'Running shoes correlation with jogging activity',
    'Basketball shoe brands regional preferences',
    'Cross-training footwear market analysis',
    'Running shoe purchase demographics by age',
    'Basketball vs running shoe preference differences',
    'Athletic footwear category analysis'
  ],
  
  // Complex Multi-factor Analysis
  'Multi-factor Analysis': [
    'Age, income, and sports participation vs Nike purchases',
    'Multiple demographic factors affecting shoe choices',
    'Brand preferences by age, income, and activity level',
    'Complex market segmentation analysis',
    'Multi-variable athletic market modeling',
    'Lifestyle and demographic intersection analysis'
  ],
  
  // Difference & Comparison Analysis
  'Difference Analysis': [
    'Difference in Nike vs Adidas market share',
    'Brand performance gap analysis',
    'Market share differences between regions',
    'Premium vs budget shoe preference differences',
    'Age group differences in brand preferences',
    'Income level brand preference gaps'
  ]
};

// Expected fields for validation - COMPREHENSIVE COVERAGE with value_ prefix
const EXPECTED_FIELDS = {
  // Athletic Shoe Brands
  'nike': ['value_MP30034A_B', 'value_MP30034A_B_P'],
  'adidas': ['value_MP30029A_B', 'value_MP30029A_B_P'],
  'jordan': ['value_MP30032A_B', 'value_MP30032A_B_P'],
  'puma': ['value_MP30035A_B', 'value_MP30035A_B_P'],
  'new balance': ['value_MP30033A_B', 'value_MP30033A_B_P'],
  'asics': ['value_MP30030A_B', 'value_MP30030A_B_P'],
  'converse': ['value_MP30031A_B', 'value_MP30031A_B_P'],
  'reebok': ['value_MP30036A_B', 'value_MP30036A_B_P'],
  'skechers': ['value_MP30037A_B', 'value_MP30037A_B_P'],
  'athletic shoes': ['value_MP30016A_B', 'value_MP30016A_B_P'],
  
  // Specific Shoe Types
  'basketball': ['value_MP30018A_B', 'value_MP30018A_B_P'],
  'running': ['value_MP30021A_B', 'value_MP30021A_B_P', 'value_MP33020A_B', 'value_MP33020A_B_P'],
  'cross-training': ['value_MP30019A_B', 'value_MP30019A_B_P'],
  'jogging': ['value_MP30021A_B', 'value_MP30021A_B_P', 'value_MP33020A_B', 'value_MP33020A_B_P'],
  
  // Core Demographics
  'asian': ['value_ASIAN_CY', 'value_ASIAN_CY_P'],
  'black': ['value_BLACK_CY', 'value_BLACK_CY_P'],
  'white': ['value_WHITE_CY', 'value_WHITE_CY_P'],
  'millennial': ['value_MILLENN_CY', 'value_MILLENN_CY_P'],
  'gen z': ['value_GENZ_CY', 'value_GENZ_CY_P'],
  'generation alpha': ['value_GENALPHACY', 'value_GENALPHACY_P'],
  'age': ['Age'],
  'income': ['value_MEDDI_CY'],
  'wealth': ['value_WLTHINDXCY'],
  
  // Hispanic Demographics - All Subcategories
  'hispanic': ['value_HISPWHT_CY', 'value_HISPWHT_CY_P', 'value_HISPBLK_CY', 'value_HISPBLK_CY_P', 'value_HISPAI_CY', 'value_HISPAI_CY_P', 'value_HISPPI_CY', 'value_HISPPI_CY_P', 'value_HISPOTH_CY', 'value_HISPOTH_CY_P'],
  'latino': ['value_HISPWHT_CY', 'value_HISPWHT_CY_P', 'value_HISPBLK_CY', 'value_HISPBLK_CY_P', 'value_HISPAI_CY', 'value_HISPAI_CY_P', 'value_HISPPI_CY', 'value_HISPPI_CY_P', 'value_HISPOTH_CY', 'value_HISPOTH_CY_P'],
  'latina': ['value_HISPWHT_CY', 'value_HISPWHT_CY_P', 'value_HISPBLK_CY', 'value_HISPBLK_CY_P', 'value_HISPAI_CY', 'value_HISPAI_CY_P', 'value_HISPPI_CY', 'value_HISPPI_CY_P', 'value_HISPOTH_CY', 'value_HISPOTH_CY_P'],
  
  // Specialty Demographics
  'american indian': ['value_AMERIND_CY', 'value_AMERIND_CY_P', 'value_HISPAI_CY', 'value_HISPAI_CY_P'],
  'pacific islander': ['value_PACIFIC_CY', 'value_PACIFIC_CY_P', 'value_HISPPI_CY', 'value_HISPPI_CY_P'],
  'multi-racial': ['value_RACE2UP_CY', 'value_RACE2UP_CY_P'],
  'other race': ['value_OTHRACE_CY', 'value_OTHRACE_CY_P', 'value_HISPOTH_CY', 'value_HISPOTH_CY_P'],
  'household': ['value_HHPOP_CY', 'value_HHPOP_CY_P'],
  'family': ['value_FAMPOP_CY', 'value_FAMPOP_CY_P'],
  'diversity': ['value_DIVINDX_CY'],
  
  // Geographic
  'zip': ['value_DESCRIPTION'],
  'location': ['value_X9051_X', 'value_X9051_X_A'],
  
  // Sports Fans
  'mlb': ['value_MP33104A_B', 'value_MP33104A_B_P'],
  'nba': ['value_MP33106A_B', 'value_MP33106A_B_P'],
  'nfl': ['value_MP33107A_B', 'value_MP33107A_B_P'],
  'nascar': ['value_MP33105A_B', 'value_MP33105A_B_P'],
  'nhl': ['value_MP33108A_B', 'value_MP33108A_B_P'],
  'soccer': ['value_MP33119A_B', 'value_MP33119A_B_P', 'value_MP33120A_B', 'value_MP33120A_B_P'],
  'mls': ['value_MP33120A_B', 'value_MP33120A_B_P'],
  
  // Retail
  'dicks': ['value_MP31035A_B', 'value_MP31035A_B_P'],
  'foot locker': ['value_MP31042A_B', 'value_MP31042A_B_P'],
  
  // Spending Patterns
  'sports clothing': ['value_MP07109A_B', 'value_MP07109A_B_P'],
  'athletic wear': ['value_MP07111A_B', 'value_MP07111A_B_P'],
  'spending': ['value_MP07109A_B', 'value_MP07109A_B_P', 'value_MP07111A_B', 'value_MP07111A_B_P', 'value_PSIV7UMKVALM'],
  'equipment': ['value_X9051_X', 'value_X9051_X_A'],
  'survey': ['value_PSIV7UMKVALM'],
  
  // Fitness Activities
  'yoga': ['value_MP33032A_B', 'value_MP33032A_B_P'],
  'weight lifting': ['value_MP33031A_B', 'value_MP33031A_B_P'],
  'gym': ['value_MP33031A_B', 'value_MP33031A_B_P'], // Weight lifting as proxy
  'fitness': ['value_MP30016A_B', 'value_MP30016A_B_P'], // Athletic footwear as proxy
  
  // Population (general - avoid for race-specific queries)
  'population': ['TOTPOP_CY', 'value_HHPOP_CY', 'value_FAMPOP_CY']
};

function testQuery(query: string, category: string): TestResult {
  const analyzer = new EnhancedQueryAnalyzer();
  
  try {
    // Test the actual production methods
    const endpointScores = analyzer.analyzeQuery(query);
    const bestEndpoint = analyzer.getBestEndpoint(query);
    const queryFields = analyzer.getQueryFields(query);
    const mentionedFields = queryFields.map(f => f.field);
    
    // Find expected fields for this query
    const queryLower = query.toLowerCase();
    const expectedFields: string[] = [];
    
    Object.entries(EXPECTED_FIELDS).forEach(([keyword, fields]) => {
      if (queryLower.includes(keyword)) {
        // Special case: don't expect generic 'population' fields for race-specific queries
        if (keyword === 'population' && 
            (queryLower.includes('race') || queryLower.includes('hispanic') || 
             queryLower.includes('asian') || queryLower.includes('black') || 
             queryLower.includes('white') || queryLower.includes('american indian') || 
             queryLower.includes('pacific islander'))) {
          // Skip generic population fields for race-specific queries
          return;
        }
        expectedFields.push(...fields);
      }
    });
    
    // Check for missing fields
    const missingFields = expectedFields.filter(expected => 
      !mentionedFields.some(actual => actual.toLowerCase().includes(expected.toLowerCase()))
    );
    
    // Calculate score
    let score = 100;
    const issues: string[] = [];
    
    if (missingFields.length > 0) {
      score -= missingFields.length * 20;
      issues.push(`Missing fields: ${missingFields.join(', ')}`);
    }
    
    if (!bestEndpoint) {
      score -= 25;
      issues.push('No endpoint selected');
    }
    
    if (mentionedFields.length === 0) {
      score -= 30;
      issues.push('No fields detected');
    }
    
    return {
      query,
      category,
      bestEndpoint,
      mentionedFields,
      expectedFields,
      missingFields,
      score: Math.max(0, score),
      success: score >= 70,
      issues
    };
    
  } catch (error) {
    return {
      query,
      category,
      bestEndpoint: '',
      mentionedFields: [],
      expectedFields: [],
      missingFields: [],
      score: 0,
      success: false,
      issues: [`Error: ${error instanceof Error ? error.message : String(error)}`]
    };
  }
}

async function runEnhancedQueryAnalyzerTest(): Promise<void> {
  console.log('🚀 Testing Enhanced Query Analyzer - Production Component');
  console.log('🎯 Validating fixes for Hispanic Demographics and Spending Analysis');
  console.log('=' .repeat(80));
  
  const results: TestResult[] = [];
  let totalQueries = 0;
  
  // Count total queries
  Object.values(TEST_QUERIES).forEach(queries => {
    totalQueries += queries.length;
  });
  
  console.log(`📊 Testing ${totalQueries} queries across ${Object.keys(TEST_QUERIES).length} categories\n`);
  
  // Run tests
  for (const [category, queries] of Object.entries(TEST_QUERIES)) {
    console.log(`\n🏷️  Category: ${category}`);
    console.log('-'.repeat(60));
    
    for (const query of queries) {
      const result = testQuery(query, category);
      results.push(result);
      
      const statusIcon = result.success ? '✅' : '❌';
      const fieldsFound = result.mentionedFields.length;
      const expectedCount = result.expectedFields.length;
      
      console.log(`${statusIcon} ${result.score}/100 | Fields: ${fieldsFound}/${expectedCount} | "${query}"`);
      
      if (result.issues.length > 0) {
        result.issues.forEach(issue => console.log(`     ⚠️  ${issue}`));
      }
    }
  }
  
  // Generate summary report
  console.log('\n' + '='.repeat(80));
  console.log('📈 ENHANCED QUERY ANALYZER TEST RESULTS');
  console.log('='.repeat(80));
  
  const totalTests = results.length;
  const successfulTests = results.filter(r => r.success).length;
  const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalTests;
  
  console.log(`\n📊 Overall Results:`);
  console.log(`   • Total Tests: ${totalTests}`);
  console.log(`   • Successful: ${successfulTests} (${(successfulTests/totalTests*100).toFixed(1)}%)`);
  console.log(`   • Average Score: ${averageScore.toFixed(1)}/100`);
  
  // Category breakdown
  console.log(`\n📂 Category Performance:`);
  Object.keys(TEST_QUERIES).forEach(category => {
    const categoryResults = results.filter(r => r.category === category);
    const categorySuccess = categoryResults.filter(r => r.success).length;
    const categoryAverage = categoryResults.reduce((sum, r) => sum + r.score, 0) / categoryResults.length;
    
    console.log(`   • ${category}: ${categoryAverage.toFixed(1)}/100 (${categorySuccess}/${categoryResults.length} success)`);
  });
  
  // Most common issues
  const allIssues = results.flatMap(r => r.issues);
  const issueFrequency = allIssues.reduce((acc, issue) => {
    acc[issue] = (acc[issue] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  if (Object.keys(issueFrequency).length > 0) {
    console.log(`\n❌ Most Common Issues:`);
    Object.entries(issueFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([issue, count]) => {
        console.log(`   • ${issue} (${count} occurrences)`);
      });
  }
  
  // Export results
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests,
      successfulTests,
      successRate: successfulTests / totalTests * 100,
      averageScore
    },
    results
  };
  
  const filename = `enhanced-query-analyzer-test-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  fs.writeFileSync(filename, JSON.stringify(reportData, null, 2));
  console.log(`\n💾 Results exported to: ${filename}`);
  
  console.log('\n' + '='.repeat(80));
  
  // Key findings summary
  const hispanicResults = results.filter(r => r.category === 'Hispanic Demographics');
  const spendingResults = results.filter(r => r.category === 'Spending Analysis');
  
  console.log('🔍 KEY FINDINGS:');
  console.log(`   Hispanic Demographics: ${hispanicResults.filter(r => r.success).length}/${hispanicResults.length} success`);
  console.log(`   Spending Analysis: ${spendingResults.filter(r => r.success).length}/${spendingResults.length} success`);
  
  if (successfulTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED - Production fixes successful!');
  } else {
    console.log(`⚠️  ${totalTests - successfulTests} tests still failing - additional fixes needed`);
  }
}

// Run the test
if (require.main === module) {
  runEnhancedQueryAnalyzerTest().catch(console.error);
}

export { runEnhancedQueryAnalyzerTest };