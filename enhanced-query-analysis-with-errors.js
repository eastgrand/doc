#!/usr/bin/env node

/**
 * ENHANCED QUERY ANALYSIS WITH INTELLIGENT ERROR HANDLING
 * 
 * Provides specific, helpful error messages for different query issues:
 * 1. Missing demographic data
 * 2. Overly vague queries  
 * 3. Unsupported analysis types
 * 4. Field mapping issues
 */

console.log('🧠 ENHANCED QUERY ANALYSIS WITH INTELLIGENT ERROR HANDLING');
console.log('Providing specific, helpful feedback for query issues');
console.log('='.repeat(80));

/**
 * Enhanced Query Analysis with Error Detection
 */
function enhancedAnalyzeQuery(query, mockConceptMap = null) {
  const lowerQuery = query.toLowerCase().replace(/['?]/g, '');
  
  // Step 1: Extract information
  const extractedBrands = improvedExtractBrandsFromQuery(lowerQuery);
  const extractedFields = improvedExtractFieldsFromQuery(lowerQuery, extractedBrands);
  const requiredDemographics = detectRequiredDemographics(lowerQuery);
  
  // Step 2: Error Detection and Validation
  const errorCheck = validateQuery(lowerQuery, extractedBrands, extractedFields, requiredDemographics);
  
  if (errorCheck.hasError) {
    return {
      success: false,
      error: errorCheck.error,
      errorType: errorCheck.errorType,
      suggestion: errorCheck.suggestion,
      queryType: 'error',
      visualizationStrategy: 'error',
      explanation: errorCheck.explanation,
      extractedFields: [],
      extractedBrands: [],
      confidence: 0
    };
  }
  
  // Step 3: Normal analysis (if no errors)
  let queryType = 'unknown';
  let explanation = '';
  
  // Enhanced correlation detection
  if ((/\b(correlate|correlation|relationship|relate|connection|between|affect)\b/i.test(lowerQuery)) ||
      (/\b(do|does|how does)\b/i.test(lowerQuery) && extractedFields.length >= 2) ||
      (/\b(analyze.*relationship|analyze.*correlation)\b/i.test(lowerQuery)) ||
      (/\b(participation.*with|participation.*shoe)\b/i.test(lowerQuery))) {
    queryType = 'correlation';
    explanation = 'Identified a relationship/correlation query with enhanced detection.';
  } 
  // Enhanced ranking detection
  else if ((/\b(top|most|highest|rank|popular.*among)\b/i.test(lowerQuery) && extractedFields.length < 3) ||
           (/\b(what.*brands.*most|which.*brands.*popular)\b/i.test(lowerQuery))) {
    queryType = 'topN';
    explanation = 'Identified a ranking query with enhanced pattern matching.';
  } 
  // Enhanced comparison detection
  else if ((/\b(compare|vs|versus|differ|differences|patterns.*between)\b/i.test(lowerQuery)) ||
           (/\b(high-end.*vs.*affordable|premium.*vs.*budget)\b/i.test(lowerQuery))) {
    queryType = 'correlation';
    explanation = 'Identified a comparison query with enhanced detection.';
  }
  // Enhanced joint high detection
  else if ((/\b(find)\b/i.test(lowerQuery) && /\b(high)\b/i.test(lowerQuery)) ||
           (/\b(areas with)\b/i.test(lowerQuery) && /\b(high)\b/i.test(lowerQuery))) {
    queryType = 'jointHigh';
    explanation = 'Identified a search for areas with multiple high values.';
  }
  // Enhanced analysis detection
  else if ((/\b(analyze|analysis)\b/i.test(lowerQuery)) && 
           (extractedFields.length >= 2 || 
            /\b(patterns|loyalty|thresholds|behavior)\b/i.test(lowerQuery))) {
    queryType = 'correlation';
    explanation = 'Identified an analysis query with correlation intent.';
  }
  // Enhanced geographic detection with vagueness check
  else if ((/\b(show|display|patterns|by region|map)\b/i.test(lowerQuery) && extractedFields.length <= 2) ||
           /\b(emerging markets|brand preferences|across.*zip)\b/i.test(lowerQuery)) {
    
    // Check for overly vague geographic queries
    if (/\b(identify.*markets.*potential|markets.*expansion|emerging markets)\b/i.test(lowerQuery) && 
        !(/\b(high-income|specific.*region|zip.*code|demographic)\b/i.test(lowerQuery))) {
      return {
        success: false,
        error: "Can you be more specific about what markets you're interested in? For example, ask about high-income areas, specific geographic regions, or demographic characteristics.",
        errorType: 'query_too_vague',
        suggestion: "Try: 'Find high-income areas with potential for premium athletic brand expansion' or 'Show premium athletic shoe sales patterns by region'",
        queryType: 'error',
        visualizationStrategy: 'error',
        explanation: 'Query is too vague for meaningful geographic analysis.',
        extractedFields: extractedFields,
        extractedBrands: extractedBrands,
        confidence: 0
      };
    }
    
    queryType = 'choropleth';
    explanation = 'Identified a geographic display query.';
  }
  // Multiple fields mentioned
  else if (extractedFields.length >= 2) {
    queryType = 'correlation';
    explanation = 'Multiple fields detected, implying correlation.';
  } 
  // Single field mentioned
  else if (extractedFields.length > 0) {
    queryType = 'choropleth';
    explanation = 'Single field detected, defaulting to thematic map.';
  }
  
  // Map query type to visualization strategy
  const queryTypeToStrategy = {
    'jointHigh': 'joint high',
    'correlation': 'correlation',
    'choropleth': 'choropleth',
    'topN': 'ranking',
    'distribution': 'distribution',
    'comparison': 'comparison'
  };
  
  const visualizationStrategy = queryTypeToStrategy[queryType] || 'choropleth';
  
  return {
    success: true,
    queryType,
    visualizationStrategy,
    explanation,
    extractedFields,
    extractedBrands,
    extractedDemographics: extractDemographicsFromQuery(lowerQuery),
    confidence: 0.9,
    relevantLayers: extractedFields,
    intent: determineIntent(lowerQuery)
  };
}

/**
 * Detect required demographics from query context
 */
function detectRequiredDemographics(lowerQuery) {
  const required = [];
  
  if (/\b(younger.*demographic|among.*younger|age.*demographic|different.*age)\b/i.test(lowerQuery)) {
    required.push('age');
  }
  if (/\b(income.*threshold|high.*income|income.*correlation)\b/i.test(lowerQuery)) {
    required.push('income');
  }
  if (/\b(millennial.*vs.*gen|generational.*group|across.*generation)\b/i.test(lowerQuery)) {
    required.push('generational');
  }
  if (/\b(population.*diversity|diversity.*correlation)\b/i.test(lowerQuery)) {
    required.push('diversity');
  }
  
  return required;
}

/**
 * Comprehensive Query Validation with Specific Error Messages
 */
function validateQuery(lowerQuery, extractedBrands, extractedFields, requiredDemographics) {
  // Error Type 1: Missing Age Demographics
  if (requiredDemographics.includes('age') && 
      !extractedFields.some(field => field.includes('MEDAGE') || field.includes('MILLENNIAL') || field.includes('GENZ'))) {
    
    return {
      hasError: true,
      errorType: 'missing_demographic_data',
      error: "I don't have age demographic data to answer this query. Try asking about specific brands or geographic patterns instead.",
      suggestion: "Try: 'Which areas have the highest Nike purchases?' or 'Compare Nike vs Adidas sales across regions'",
      explanation: 'Query requires age demographic data that is not available in the current dataset.'
    };
  }
  
  // Error Type 2: Missing Income Data
  if (requiredDemographics.includes('income') && 
      !extractedFields.some(field => field.includes('MEDDI'))) {
    
    return {
      hasError: true,
      errorType: 'missing_demographic_data',
      error: "I don't have detailed income data to answer this query. Try asking about brand comparisons or geographic patterns instead.",
      suggestion: "Try: 'Compare premium vs budget athletic shoe purchases' or 'Show Nike purchase patterns by region'",
      explanation: 'Query requires income demographic data that is not available in the current dataset.'
    };
  }
  
  // Error Type 3: No Brands Detected from Context
  if ((/\b(brand.*preference|retail.*access.*brand)\b/i.test(lowerQuery)) && 
      extractedBrands.length === 0) {
    
    return {
      hasError: true,
      errorType: 'missing_brand_context',
      error: "I need more specific brand information to answer this query. Which athletic brands are you interested in?",
      suggestion: "Try: 'Analyze the relationship between retail access and Nike preferences' or 'How does Foot Locker access relate to athletic shoe purchases?'",
      explanation: 'Query mentions brand preferences but no specific brands were detected.'
    };
  }
  
  // Error Type 4: Unsupported Analysis Type
  if (/\b(machine.*learning|predictive.*analysis|forecast|predict)\b/i.test(lowerQuery)) {
    
    return {
      hasError: true,
      errorType: 'unsupported_analysis',
      error: "I can't perform predictive or machine learning analysis. I can help with correlations, rankings, and geographic patterns.",
      suggestion: "Try: 'What's the correlation between income and Nike purchases?' or 'Show top areas for athletic shoe sales'",
      explanation: 'Query requests advanced analytics that are not supported by the current system.'
    };
  }
  
  // Error Type 5: No Data Fields Detected
  if (extractedFields.length === 0 && extractedBrands.length === 0) {
    
    return {
      hasError: true,
      errorType: 'no_data_detected',
      error: "I couldn't identify specific data fields from your query. Try mentioning specific brands, demographics, or geographic terms.",
      suggestion: "Try: 'Show Nike sales by region' or 'Compare athletic shoe purchases across age groups'",
      explanation: 'Query does not contain recognizable data fields or brand mentions.'
    };
  }
  
  // No errors detected
  return { hasError: false };
}

// Import helper functions from previous implementation
function improvedExtractBrandsFromQuery(lowerQuery) {
  const brands = [];
  
  // Direct brand mentions
  if (lowerQuery.includes('nike')) brands.push('Nike');
  if (lowerQuery.includes('adidas')) brands.push('Adidas');
  if (lowerQuery.includes('jordan')) brands.push('Jordan');
  if (lowerQuery.includes('converse')) brands.push('Converse');
  if (lowerQuery.includes('puma')) brands.push('Puma');
  if (lowerQuery.includes('new balance')) brands.push('New Balance');
  if (lowerQuery.includes('reebok')) brands.push('Reebok');
  if (lowerQuery.includes('skechers')) brands.push('Skechers');
  
  // Premium brand mapping
  if ((/\b(premium.*athletic|premium.*shoe|premium.*footwear)\b/i.test(lowerQuery) ||
       /\b(high-end.*athletic|high-end.*shoe|high-end.*brand)\b/i.test(lowerQuery)) && 
       brands.length === 0) {
    brands.push('Nike', 'Jordan');
  }
  
  // Budget brand mapping
  if ((/\b(budget.*athletic|budget.*shoe|affordable.*athletic|affordable.*brand)\b/i.test(lowerQuery)) && 
       brands.length === 0) {
    brands.push('Skechers');
  }
  
  // Context-based brand detection
  if ((/\b(shoe.*buying|shoe.*purchase|shoe.*pattern|shoe.*sales)\b/i.test(lowerQuery) ||
       /\b(athletic.*footwear|footwear.*purchase)\b/i.test(lowerQuery) ||
       /\b(brand.*preference|brand.*loyalty|brand.*pattern)\b/i.test(lowerQuery)) && 
       brands.length === 0) {
    brands.push('Athletic Shoes');
  }
  
  // Abstract brand queries
  if ((/\b(athletic.*brands.*most|brands.*most.*popular|brands.*popular.*among)\b/i.test(lowerQuery) ||
       /\b(brand.*loyalty.*pattern|loyalty.*pattern)\b/i.test(lowerQuery)) && 
       brands.length === 0) {
    brands.push('Nike', 'Adidas', 'Jordan');
  }
  
  // General categories
  if ((lowerQuery.includes('athletic shoe') || lowerQuery.includes('athletic footwear')) && 
      brands.length === 0) {
    brands.push('Athletic Shoes');
  }
  if (lowerQuery.includes('running shoe') || (lowerQuery.includes('running') && lowerQuery.includes('shoe'))) {
    brands.push('Running Shoes');
  }
  if (lowerQuery.includes('basketball shoe')) {
    brands.push('Basketball Shoes');
  }
  
  return brands;
}

function improvedExtractFieldsFromQuery(lowerQuery, extractedBrands) {
  const fields = [];
  
  // Brand-specific fields
  if (extractedBrands.includes('Nike')) {
    fields.push('MP30034A_B', 'MP30034A_B_P');
  }
  if (extractedBrands.includes('Adidas')) {
    fields.push('MP30029A_B', 'MP30029A_B_P');
  }
  if (extractedBrands.includes('Jordan')) {
    fields.push('MP30032A_B', 'MP30032A_B_P');
  }
  if (extractedBrands.includes('Converse')) {
    fields.push('MP30031A_B', 'MP30031A_B_P');
  }
  if (extractedBrands.includes('Puma')) {
    fields.push('MP30035A_B', 'MP30035A_B_P');
  }
  if (extractedBrands.includes('New Balance')) {
    fields.push('MP30033A_B', 'MP30033A_B_P');
  }
  if (extractedBrands.includes('Reebok')) {
    fields.push('MP30036A_B', 'MP30036A_B_P');
  }
  if (extractedBrands.includes('Skechers')) {
    fields.push('MP30037A_B', 'MP30037A_B_P');
  }
  if (extractedBrands.includes('Athletic Shoes')) {
    fields.push('MP30016A_B', 'MP30016A_B_P');
  }
  if (extractedBrands.includes('Running Shoes')) {
    fields.push('MP30033A_B', 'MP30033A_B_P');
  }
  
  // Demographic fields
  if (lowerQuery.includes('income')) {
    fields.push('MEDDI_CY');
  }
  if (lowerQuery.includes('age')) {
    fields.push('MEDAGE_CY');
  }
  if (lowerQuery.includes('population') && !lowerQuery.includes('diversity')) {
    fields.push('TOTPOP_CY');
  }
  if (lowerQuery.includes('diversity')) {
    fields.push('DIVERSITY_INDEX');
  }
  if (lowerQuery.includes('millennial')) {
    fields.push('MILLENNIAL_POP');
  }
  if (lowerQuery.includes('gen z')) {
    fields.push('GENZ_POP');
  }
  
  // Sports participation
  if (lowerQuery.includes('running') || lowerQuery.includes('jogging')) {
    fields.push('MP30045A_B');
  }
  if (lowerQuery.includes('basketball')) {
    fields.push('MP30031A_B');
  }
  if (lowerQuery.includes('yoga')) {
    fields.push('MP33032A_B');
  }
  if (/\b(sports.*participation|participation.*sport)\b/i.test(lowerQuery)) {
    fields.push('MP30045A_B');
  }
  
  // Retail fields
  if (lowerQuery.includes('dick') || lowerQuery.includes('sporting goods')) {
    fields.push('MP30043A_B');
  }
  if (lowerQuery.includes('foot locker')) {
    fields.push('MP30044A_B');
  }
  if (/\b(retail.*access|retail.*activity)\b/i.test(lowerQuery)) {
    fields.push('MP30043A_B', 'MP30044A_B');
  }
  
  return fields;
}

function extractDemographicsFromQuery(lowerQuery) {
  const demographics = [];
  
  if (lowerQuery.includes('income')) demographics.push('income');
  if (lowerQuery.includes('age')) demographics.push('age');
  if (lowerQuery.includes('population')) demographics.push('population');
  if (lowerQuery.includes('sports') || lowerQuery.includes('participation')) demographics.push('sports_participation');
  if (lowerQuery.includes('retail') || lowerQuery.includes('shopping')) demographics.push('retail');
  if (lowerQuery.includes('generational') || lowerQuery.includes('millennial') || lowerQuery.includes('gen z')) {
    demographics.push('generational');
  }
  
  return demographics;
}

function determineIntent(lowerQuery) {
  if (lowerQuery.includes('compare') || lowerQuery.includes('correlation') || lowerQuery.includes('relationship')) {
    return 'correlation';
  }
  if (lowerQuery.includes('top') || lowerQuery.includes('highest') || lowerQuery.includes('ranking')) {
    return 'ranking';
  }
  if (lowerQuery.includes('show') || lowerQuery.includes('display') || lowerQuery.includes('visualize')) {
    return 'visualization_request';
  }
  if (lowerQuery.includes('find') || lowerQuery.includes('identify')) {
    return 'location';
  }
  if (lowerQuery.includes('analyze') || lowerQuery.includes('analysis')) {
    return 'correlation';
  }
  return 'information';
}

/**
 * Test the error handling on the two failing queries
 */
function testErrorHandling() {
  const testQueries = [
    'What athletic brands are most popular among younger demographics?',
    'Identify markets with potential for premium athletic brand expansion',
    'Analyze the relationship between retail access and brand preferences'
  ];
  
  console.log('\n🧪 TESTING ERROR HANDLING ON PROBLEMATIC QUERIES');
  console.log('='.repeat(60));
  
  testQueries.forEach((query, index) => {
    console.log(`\n📝 Test ${index + 1}: ${query}`);
    console.log('-'.repeat(50));
    
    const result = enhancedAnalyzeQuery(query);
    
    if (result.success) {
      console.log('✅ SUCCESS');
      console.log(`Query Type: ${result.queryType}`);
      console.log(`Visualization: ${result.visualizationStrategy}`);
      console.log(`Brands: [${result.extractedBrands.join(', ')}]`);
      console.log(`Fields: [${result.extractedFields.join(', ')}]`);
    } else {
      console.log('🚨 ERROR DETECTED');
      console.log(`Error Type: ${result.errorType}`);
      console.log(`Error Message: "${result.error}"`);
      console.log(`Suggestion: "${result.suggestion}"`);
      console.log(`Explanation: ${result.explanation}`);
    }
  });
}

// Run the error handling test
if (require.main === module) {
  testErrorHandling();
}

module.exports = { enhancedAnalyzeQuery, testErrorHandling }; 