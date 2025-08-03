#!/usr/bin/env node

/**
 * Field Coverage Analysis
 * Analyzes which fields are covered in test queries and identifies gaps
 */

// All field codes from field-aliases.ts
const ALL_FIELD_CODES = [
  'AMERIND_CY_P', 'AMERIND_CY', 'ASIAN_CY_P', 'ASIAN_CY', 'BLACK_CY_P', 'BLACK_CY',
  'DESCRIPTION', 'DIVINDX_CY', 'FAMPOP_CY_P', 'FAMPOP_CY', 'GENALPHACY_P', 'GENALPHACY',
  'GENZ_CY_P', 'GENZ_CY', 'HHPOP_CY_P', 'HHPOP_CY', 'HISPAI_CY_P', 'HISPAI_CY',
  'HISPBLK_CY_P', 'HISPBLK_CY', 'HISPOTH_CY_P', 'HISPOTH_CY', 'HISPPI_CY_P', 'HISPPI_CY',
  'HISPWHT_CY_P', 'HISPWHT_CY', 'ID', 'MEDDI_CY', 'MILLENN_CY_P', 'MILLENN_CY',
  'MP07109A_B_P', 'MP07109A_B', 'MP07111A_B_P', 'MP07111A_B', 'MP30016A_B_P', 'MP30016A_B',
  'MP30018A_B_P', 'MP30018A_B', 'MP30019A_B_P', 'MP30019A_B', 'MP30021A_B_P', 'MP30021A_B',
  'MP30029A_B_P', 'MP30029A_B', 'MP30030A_B_P', 'MP30030A_B', 'MP30031A_B_P', 'MP30031A_B',
  'MP30032A_B_P', 'MP30032A_B', 'MP30033A_B_P', 'MP30033A_B', 'MP30034A_B_P', 'MP30034A_B',
  'MP30035A_B_P', 'MP30035A_B', 'MP30036A_B_P', 'MP30036A_B', 'MP30037A_B_P', 'MP30037A_B',
  'MP31035A_B_P', 'MP31035A_B', 'MP31042A_B_P', 'MP31042A_B', 'MP33020A_B_P', 'MP33020A_B',
  'MP33031A_B_P', 'MP33031A_B', 'MP33032A_B_P', 'MP33032A_B', 'MP33104A_B_P', 'MP33104A_B',
  'MP33105A_B_P', 'MP33105A_B', 'MP33106A_B_P', 'MP33106A_B', 'MP33107A_B_P', 'MP33107A_B',
  'MP33108A_B_P', 'MP33108A_B', 'MP33119A_B_P', 'MP33119A_B', 'MP33120A_B_P', 'MP33120A_B',
  'OBJECTID', 'OTHRACE_CY_P', 'OTHRACE_CY', 'PACIFIC_CY_P', 'PACIFIC_CY', 'PSIV7UMKVALM',
  'RACE2UP_CY_P', 'RACE2UP_CY', 'TOTPOP_CY', 'WHITE_CY_P', 'WHITE_CY', 'WLTHINDXCY',
  'X9051_X_A', 'X9051_X'
];

// Current test queries (extracted from test file)
const CURRENT_TEST_QUERIES = [
  // Brand Rankings
  'Show me the top 10 areas with highest Nike purchases',
  'Which areas have the most Adidas buyers?',
  'Rank areas by Jordan athletic shoe purchases', 
  'Top performing regions for New Balance shoes',
  'Best areas for Puma athletic shoe sales',
  
  // Brand Comparisons
  'Compare Nike vs Adidas purchases across regions',
  'Nike vs Jordan performance comparison',
  'Adidas vs Puma market share analysis',
  'Compare all athletic shoe brands performance',
  'Brand preference differences between areas',
  
  // Demographics vs Purchases
  'Relationship between age and Nike purchases',
  'Income correlation with athletic shoe buying',
  'Asian population vs athletic shoe preferences',
  'Millennial generation athletic shoe trends',
  'High income areas and premium shoe brands',
  
  // Geographic Patterns
  'Athletic shoe purchase clusters on the map',
  'Regional patterns in sports participation',
  'Geographic distribution of Nike buyers',
  'Spatial analysis of athletic retail stores',
  'Hot spots for athletic shoe purchases',
  
  // Sports Participation
  'Running participation vs running shoe purchases',
  'Basketball players vs basketball shoe sales',
  'Yoga participation and athletic shoe preferences',
  'Gym membership correlation with shoe purchases',
  'Sports fan demographics and shoe preferences',
  
  // Retail Analysis
  "Dick's Sporting Goods shoppers vs Nike purchases",
  'Foot Locker customers and brand preferences',
  'Retail channel analysis for athletic shoes',
  'Shopping behavior vs athletic shoe purchases',
  'Market penetration analysis for brands',
  
  // Multi-factor Analysis
  'Age, income, and sports participation vs Nike purchases',
  'Multiple demographic factors affecting shoe choices',
  'Brand preferences by age, income, and activity level',
  'Complex market segmentation analysis',
  'Multi-variable athletic market modeling',
  
  // Difference Analysis
  'Difference in Nike vs Adidas market share',
  'Brand performance gap analysis',
  'Market share differences between regions',
  'Premium vs budget shoe preference differences',
  'Age group differences in brand preferences',
  
  // Market Segmentation
  'Cluster areas by athletic shoe purchase patterns',
  'Market segments for athletic footwear',
  'Customer segmentation by purchase behavior',
  'Geographic clustering of sports enthusiasts',
  'Behavioral segments in athletic market',
  
  // Trends & Patterns
  'Athletic shoe purchase trends over time',
  'Seasonal patterns in shoe purchases',
  'Brand popularity trends by region',
  'Emerging markets for athletic footwear',
  'Growth patterns in athletic participation'
];

// Field categorization for analysis
const FIELD_CATEGORIES = {
  'Demographics - Population': {
    fields: ['TOTPOP_CY', 'HHPOP_CY', 'HHPOP_CY_P', 'FAMPOP_CY', 'FAMPOP_CY_P'],
    keywords: ['population', 'household', 'family', 'people', 'residents']
  },
  
  'Demographics - Race/Ethnicity': {
    fields: ['WHITE_CY', 'WHITE_CY_P', 'BLACK_CY', 'BLACK_CY_P', 'ASIAN_CY', 'ASIAN_CY_P', 
             'AMERIND_CY', 'AMERIND_CY_P', 'PACIFIC_CY', 'PACIFIC_CY_P', 'OTHRACE_CY', 'OTHRACE_CY_P',
             'RACE2UP_CY', 'RACE2UP_CY_P'],
    keywords: ['white', 'black', 'asian', 'american indian', 'pacific islander', 'race', 'ethnicity']
  },
  
  'Demographics - Hispanic Origin': {
    fields: ['HISPWHT_CY', 'HISPWHT_CY_P', 'HISPBLK_CY', 'HISPBLK_CY_P', 'HISPAI_CY', 'HISPAI_CY_P',
             'HISPPI_CY', 'HISPPI_CY_P', 'HISPOTH_CY', 'HISPOTH_CY_P'],
    keywords: ['hispanic', 'latino', 'latina', 'latinx']
  },
  
  'Demographics - Generations': {
    fields: ['MILLENN_CY', 'MILLENN_CY_P', 'GENZ_CY', 'GENZ_CY_P', 'GENALPHACY', 'GENALPHACY_P'],
    keywords: ['millennial', 'gen z', 'generation z', 'gen alpha', 'generation alpha', 'age', 'young']
  },
  
  'Economics': {
    fields: ['MEDDI_CY', 'WLTHINDXCY', 'DIVINDX_CY'],
    keywords: ['income', 'wealth', 'disposable income', 'economic', 'diversity index']
  },
  
  'Athletic Shoe Brands': {
    fields: ['MP30016A_B', 'MP30016A_B_P', 'MP30029A_B', 'MP30029A_B_P', 'MP30030A_B', 'MP30030A_B_P',
             'MP30031A_B', 'MP30031A_B_P', 'MP30032A_B', 'MP30032A_B_P', 'MP30033A_B', 'MP30033A_B_P',
             'MP30034A_B', 'MP30034A_B_P', 'MP30035A_B', 'MP30035A_B_P', 'MP30036A_B', 'MP30036A_B_P',
             'MP30037A_B', 'MP30037A_B_P'],
    keywords: ['nike', 'adidas', 'jordan', 'new balance', 'puma', 'reebok', 'skechers', 'asics', 'converse', 'athletic shoes']
  },
  
  'Shoe Types': {
    fields: ['MP30018A_B', 'MP30018A_B_P', 'MP30019A_B', 'MP30019A_B_P', 'MP30021A_B', 'MP30021A_B_P'],
    keywords: ['basketball shoes', 'cross training', 'running shoes', 'jogging shoes']
  },
  
  'Sports Activities': {
    fields: ['MP33020A_B', 'MP33020A_B_P', 'MP33031A_B', 'MP33031A_B_P', 'MP33032A_B', 'MP33032A_B_P'],
    keywords: ['running', 'jogging', 'weight lifting', 'yoga', 'fitness', 'exercise']
  },
  
  'Sports Fans': {
    fields: ['MP33104A_B', 'MP33104A_B_P', 'MP33105A_B', 'MP33105A_B_P', 'MP33106A_B', 'MP33106A_B_P',
             'MP33107A_B', 'MP33107A_B_P', 'MP33108A_B', 'MP33108A_B_P', 'MP33119A_B', 'MP33119A_B_P',
             'MP33120A_B', 'MP33120A_B_P'],
    keywords: ['mlb', 'nascar', 'nba', 'nfl', 'nhl', 'soccer', 'mls', 'sports fan', 'super fan']
  },
  
  'Retail Shopping': {
    fields: ['MP31035A_B', 'MP31035A_B_P', 'MP31042A_B', 'MP31042A_B_P'],
    keywords: ['dicks sporting goods', 'foot locker', 'retail', 'shopping', 'store']
  },
  
  'Spending Patterns': {
    fields: ['MP07109A_B', 'MP07109A_B_P', 'MP07111A_B', 'MP07111A_B_P', 'PSIV7UMKVALM',
             'X9051_X', 'X9051_X_A'],
    keywords: ['spending', 'spent', 'sports clothing', 'athletic wear', 'equipment', 'money', 'cost', 'price']
  },
  
  'System Fields': {
    fields: ['OBJECTID', 'ID', 'DESCRIPTION'],
    keywords: ['id', 'object', 'description', 'zip code', 'area code']
  }
};

function analyzeFieldCoverage() {
  console.log('🔍 Field Coverage Analysis');
  console.log('='.repeat(60));
  
  const allQueries = CURRENT_TEST_QUERIES.join(' ').toLowerCase();
  const coveredFields = new Set();
  const uncoveredFields = [];
  const categoryResults = {};
  
  // Analyze each category
  Object.entries(FIELD_CATEGORIES).forEach(([categoryName, categoryData]) => {
    const { fields, keywords } = categoryData;
    const categoryCoveredFields = [];
    const categoryUncoveredFields = [];
    
    fields.forEach(field => {
      let isCovered = false;
      
      // Check if any keyword for this field appears in queries
      keywords.forEach(keyword => {
        if (allQueries.includes(keyword.toLowerCase())) {
          isCovered = true;
          coveredFields.add(field);
        }
      });
      
      if (isCovered) {
        categoryCoveredFields.push(field);
      } else {
        categoryUncoveredFields.push(field);
        uncoveredFields.push({ field, category: categoryName, keywords });
      }
    });
    
    const coveragePercent = (categoryCoveredFields.length / fields.length * 100).toFixed(1);
    
    categoryResults[categoryName] = {
      total: fields.length,
      covered: categoryCoveredFields.length,
      uncovered: categoryUncoveredFields.length,
      coveragePercent,
      coveredFields: categoryCoveredFields,
      uncoveredFields: categoryUncoveredFields
    };
  });
  
  // Overall statistics
  const totalFields = ALL_FIELD_CODES.length;
  const totalCovered = coveredFields.size;
  const overallCoverage = (totalCovered / totalFields * 100).toFixed(1);
  
  console.log(`📊 Overall Coverage: ${totalCovered}/${totalFields} fields (${overallCoverage}%)`);
  console.log(`📝 Total Test Queries: ${CURRENT_TEST_QUERIES.length}`);
  console.log();
  
  // Category breakdown
  console.log('📂 Coverage by Category:');
  console.log('-'.repeat(60));
  
  Object.entries(categoryResults)
    .sort(([,a], [,b]) => parseFloat(b.coveragePercent) - parseFloat(a.coveragePercent))
    .forEach(([categoryName, results]) => {
      const status = results.coveragePercent >= 80 ? '✅' : 
                    results.coveragePercent >= 50 ? '⚠️' : '❌';
      console.log(`${status} ${categoryName}: ${results.covered}/${results.total} (${results.coveragePercent}%)`);
      
      if (results.uncoveredFields.length > 0 && results.coveragePercent < 100) {
        console.log(`   Missing: ${results.uncoveredFields.slice(0, 3).join(', ')}${results.uncoveredFields.length > 3 ? '...' : ''}`);
      }
    });
  
  console.log();
  console.log('❌ Uncovered Fields Requiring Test Queries:');
  console.log('-'.repeat(60));
  
  // Group uncovered fields by category for easier query generation
  const uncoveredByCategory = {};
  uncoveredFields.forEach(({ field, category, keywords }) => {
    if (!uncoveredByCategory[category]) {
      uncoveredByCategory[category] = [];
    }
    uncoveredByCategory[category].push({ field, keywords });
  });
  
  Object.entries(uncoveredByCategory).forEach(([category, fields]) => {
    console.log(`\n📂 ${category} (${fields.length} missing fields):`);
    fields.forEach(({ field, keywords }) => {
      console.log(`   • ${field} - Keywords: ${keywords.slice(0, 3).join(', ')}`);
    });
  });
  
  return {
    totalFields,
    totalCovered,
    overallCoverage: parseFloat(overallCoverage),
    categoryResults,
    uncoveredFields,
    uncoveredByCategory
  };
}

function generateMissingTestQueries(analysisResults) {
  console.log('\n🚀 Suggested Test Queries for Missing Fields:');
  console.log('='.repeat(60));
  
  const { uncoveredByCategory } = analysisResults;
  const suggestedQueries = {};
  
  Object.entries(uncoveredByCategory).forEach(([category, fields]) => {
    const queries = [];
    
    switch (category) {
      case 'Demographics - Race/Ethnicity':
        fields.forEach(({ field, keywords }) => {
          if (field.includes('AMERIND')) queries.push(`American Indian population vs athletic shoe purchases`);
          if (field.includes('PACIFIC')) queries.push(`Pacific Islander demographics and shoe preferences`);
          if (field.includes('OTHRACE')) queries.push(`Other race populations and athletic footwear trends`);
          if (field.includes('RACE2UP')) queries.push(`Multi-racial population athletic shoe analysis`);
        });
        break;
        
      case 'Demographics - Hispanic Origin':
        queries.push(`Hispanic population athletic shoe preferences`);
        queries.push(`Latino community brand preferences analysis`);
        queries.push(`Hispanic demographic correlation with athletic purchases`);
        break;
        
      case 'Sports Fans':
        fields.forEach(({ field }) => {
          if (field.includes('MP33105')) queries.push(`NASCAR fans athletic shoe preferences`);
          if (field.includes('MP33108')) queries.push(`NHL fans and athletic footwear trends`);
          if (field.includes('MP33119')) queries.push(`International soccer fans shoe purchasing patterns`);
          if (field.includes('MP33120')) queries.push(`MLS soccer fans brand preferences`);
        });
        break;
        
      case 'Spending Patterns':
        queries.push(`Sports equipment spending correlation with shoe purchases`);
        queries.push(`Athletic wear spending vs shoe brand preferences`);
        queries.push(`High sports clothing spenders shoe buying patterns`);
        queries.push(`Equipment investment correlation with footwear choices`);
        break;
        
      case 'Shoe Types':
        // Most shoe types are covered, but add any missing ones
        break;
        
      default:
        // Generic queries for other categories
        fields.forEach(({ keywords }) => {
          if (keywords.length > 0) {
            queries.push(`${keywords[0]} correlation with athletic shoe purchases`);
          }
        });
    }
    
    if (queries.length > 0) {
      suggestedQueries[category] = [...new Set(queries)]; // Remove duplicates
    }
  });
  
  Object.entries(suggestedQueries).forEach(([category, queries]) => {
    console.log(`\n📂 ${category}:`);
    queries.forEach((query, index) => {
      console.log(`   ${index + 1}. "${query}"`);
    });
  });
  
  return suggestedQueries;
}

// Run the analysis
const results = analyzeFieldCoverage();
const suggestedQueries = generateMissingTestQueries(results);

console.log(`\n💡 Recommendations:`);
console.log(`   • Add ${Object.values(suggestedQueries).flat().length} new test queries`);
console.log(`   • Focus on categories with <80% coverage`);
console.log(`   • Test edge cases for uncovered demographic groups`);
console.log(`   • Verify field mapping for specialty sports fans`);

export { analyzeFieldCoverage, generateMissingTestQueries, FIELD_CATEGORIES };