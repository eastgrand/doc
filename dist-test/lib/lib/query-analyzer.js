"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeQuery = analyzeQuery;
const field_aliases_1 = require("../utils/field-aliases");
const field_utils_1 = require("../utils/field-utils");
const queryTypeToStrategy = {
    'jointHigh': 'joint high',
    'correlation': 'correlation',
    'choropleth': 'choropleth',
    'topN': 'ranking',
    'distribution': 'distribution',
    'comparison': 'multivariate',
    'simple_display': 'simple_display',
    'bivariate': 'correlation',
    'ranking': 'ranking',
    'temporal': 'temporal',
    'spatial': 'spatial',
    'difference': 'difference'
};
const demographicFields = [
    'total_minority_population_pct',
    'visible_minority_population_pct',
    'population',
    'median_income',
    'disposable_income'
];
// Brand field codes
const BRAND_FIELD_CODES = {
    'nike': 'MP30034A_B',
    'jordan': 'MP30032A_B',
    'converse': 'MP30031A_B',
    'adidas': 'MP30029A_B',
    'puma': 'MP30035A_B',
    'reebok': 'MP30036A_B',
    'newbalance': 'MP30033A_B',
    'new balance': 'MP30033A_B',
    'asics': 'MP30030A_B',
    'skechers': 'MP30037A_B'
};
// ============================================================================
// SYSTEMATIC FIELD MAPPING GENERATION
// ============================================================================
// Build field name mapping dynamically from all available field aliases
function buildFieldNameMap() {
    const fieldNameMap = {};
    // Add basic demographic mappings
    fieldNameMap['conversionrate'] = 'TOTPOP_CY'; // No conversion rate available, use population
    fieldNameMap['visibleminorityhouseholdpopulation'] = 'ASIAN_CY'; // Map to Asian population
    fieldNameMap['averageincome'] = 'MEDDI_CY'; // Median Disposable Income
    fieldNameMap['medianincome'] = 'MEDDI_CY'; // Median Disposable Income
    fieldNameMap['medianhouseholdincome'] = 'MEDDI_CY'; // Median Disposable Income
    fieldNameMap['household_average_income'] = 'MEDDI_CY'; // Median Disposable Income
    fieldNameMap['householdincome'] = 'MEDDI_CY'; // Median Disposable Income
    fieldNameMap['income'] = 'MEDDI_CY'; // Median Disposable Income
    fieldNameMap['disposableincome'] = 'MEDDI_CY'; // Median Disposable Income
    fieldNameMap['disposable_income'] = 'MEDDI_CY'; // Median Disposable Income
    fieldNameMap['totalpopulation'] = 'TOTPOP_CY'; // Total Population
    fieldNameMap['population'] = 'TOTPOP_CY'; // Total Population
    fieldNameMap['asian'] = 'ASIAN_CY'; // Asian Population
    fieldNameMap['asianpopulation'] = 'ASIAN_CY'; // Asian Population
    fieldNameMap['black'] = 'BLACK_CY'; // Black Population
    fieldNameMap['blackpopulation'] = 'BLACK_CY'; // Black Population
    fieldNameMap['africanamerican'] = 'BLACK_CY'; // Black Population
    fieldNameMap['white'] = 'WHITE_CY'; // White Population
    fieldNameMap['whitepopulation'] = 'WHITE_CY'; // White Population
    fieldNameMap['amerind'] = 'AMERIND_CY'; // American Indian Population
    fieldNameMap['americanindian'] = 'AMERIND_CY'; // American Indian Population
    fieldNameMap['nativeamerican'] = 'AMERIND_CY'; // American Indian Population
    fieldNameMap['diversity'] = 'DIVINDX_CY'; // Diversity Index
    fieldNameMap['diversityindex'] = 'DIVINDX_CY'; // Diversity Index
    fieldNameMap['hispanic'] = 'HISPWHT_CY'; // Hispanic White Population
    fieldNameMap['latino'] = 'HISPWHT_CY'; // Hispanic White Population
    // Legacy application mappings
    fieldNameMap['applications'] = 'TOTPOP_CY'; // No applications field, use population
    fieldNameMap['numberofapplications'] = 'TOTPOP_CY'; // No applications field, use population
    fieldNameMap['application'] = 'TOTPOP_CY'; // No applications field, use population
    fieldNameMap['mortgageapprovals'] = 'TOTPOP_CY'; // No mortgage approvals field, use population
    fieldNameMap['mortgage_approvals'] = 'TOTPOP_CY'; // No mortgage approvals field, use population
    fieldNameMap['approvals'] = 'TOTPOP_CY'; // No approvals field, use population
    // *** SYSTEMATIC MAPPING FROM FIELD_ALIASES ***
    // Extract brand names and key terms from field aliases automatically
    Object.entries(field_aliases_1.FIELD_ALIASES).forEach(([alias, fieldCode]) => {
        const lowerAlias = alias.toLowerCase();
        // Extract brand names from athletic shoe purchase fields
        const brandMatch = lowerAlias.match(/bought (\w+) athletic shoes/);
        if (brandMatch) {
            const brand = brandMatch[1];
            fieldNameMap[brand] = fieldCode;
            fieldNameMap[brand + 'purchases'] = fieldCode;
        }
        // Extract other meaningful terms
        const meaningfulTerms = extractMeaningfulTerms(lowerAlias);
        meaningfulTerms.forEach(term => {
            // Only map if not already mapped to avoid conflicts
            if (!fieldNameMap[term]) {
                fieldNameMap[term] = fieldCode;
            }
        });
    });
    fieldNameMap['age'] = 'GENZ_CY'; // Generic age metric fallback
    fieldNameMap['ages'] = 'GENZ_CY';
    fieldNameMap['medianage'] = 'MILLENN_CY';
    fieldNameMap['young'] = 'GENZ_CY';
    fieldNameMap['younger'] = 'GENZ_CY';
    fieldNameMap['old'] = 'MILLENN_CY';
    fieldNameMap['older'] = 'MILLENN_CY';
    fieldNameMap['millennial'] = 'MILLENN_CY';
    fieldNameMap['millennials'] = 'MILLENN_CY';
    fieldNameMap['genz'] = 'GENZ_CY';
    fieldNameMap['gen z'] = 'GENZ_CY';
    fieldNameMap['generationz'] = 'GENZ_CY';
    fieldNameMap['generation z'] = 'GENZ_CY';
    fieldNameMap['generation alpha'] = 'GENALPHACY';
    fieldNameMap['genalpha'] = 'GENALPHACY';
    fieldNameMap['alpha'] = 'GENALPHACY';
    // Retail terms
    fieldNameMap['dicks'] = 'MP31035A_B'; // Dick's Sporting Goods
    fieldNameMap['footlocker'] = 'MP31042A_B'; // Foot Locker
    fieldNameMap['sportinggoods'] = 'MP31035A_B';
    fieldNameMap['retail'] = 'MP31035A_B';
    // Sports participation
    fieldNameMap['running'] = 'MP33020A_B';
    fieldNameMap['jogging'] = 'MP33020A_B';
    fieldNameMap['yoga'] = 'MP33032A_B';
    fieldNameMap['weightlifting'] = 'MP33031A_B';
    fieldNameMap['basketball'] = 'MP30018A_B';
    // Diversity & population terms
    fieldNameMap['populationdiversity'] = 'DIVINDX_CY';
    return fieldNameMap;
}
// Extract meaningful terms from field aliases for mapping
function extractMeaningfulTerms(alias) {
    const stopwords = new Set([
        'the', 'of', 'and', 'or', 'for', 'to', 'in', 'at', 'on', 'by', 'last', 'mo',
        'year', 'current', 'total', 'bought', 'spent', 'participated', 'shopped',
        'athletic', 'shoes', 'shoe', 'store', 'sport', 'sports', 'percent', 'percentage',
        '2024', 'esri', '(%)', 'scale', 'super', 'fan'
    ]);
    return alias
        .replace(/[^\w\s]/g, ' ') // Replace non-word chars with spaces
        .split(/\s+/)
        .filter(token => token.length > 2 &&
        !stopwords.has(token) &&
        !/^\d+$/.test(token) // Remove pure numbers
    );
}
function selectCorrelationFields(query, allFields) {
    // For queries like "relationship between X and Y", intelligently select the 2 most relevant fields
    // NOTE: allFields already have percentage preference applied, so we work with _P fields
    // Create field categories for better matching (handle both _P and non-_P variants)
    const fieldCategories = {
        yoga: allFields.filter(f => f.includes('33032')), // MP33032A_B_P - Yoga
        athleticShoes: allFields.filter(f => f.includes('30016')), // MP30016A_B_P - Athletic Shoes  
        brands: allFields.filter(f => f.match(/MP3003[0-9]A_B/)), // All brand fields MP30030-39
        sports: allFields.filter(f => f.match(/MP3302[0-9]A_B|MP3303[0-9]A_B/)), // Sports participation
        demographics: allFields.filter(f => f.match(/^(TOTPOP|MEDDI|DIVINDX|WHITE|BLACK|ASIAN|HISPWHT|GENZ|MILLENN)/)),
        retail: allFields.filter(f => f.match(/MP3103[0-9]A_B|MP3104[0-9]A_B/)) // Store shopping
    };
    // Query-specific field detection
    const selectedFields = [];
    // Detect yoga - prefer percentage field (_P) to match Nike vs Adidas behavior
    if (/\byoga\b/i.test(query)) {
        const yogaField = fieldCategories.yoga.find(f => f.includes('_P')) || fieldCategories.yoga[0];
        if (yogaField)
            selectedFields.push(yogaField);
    }
    // Detect athletic shoes (general) - prefer percentage field (_P)
    if (/\bathletic\s+shoe/i.test(query) && !/\b(nike|adidas|jordan|converse|puma|reebok|new balance|asics|skechers)\b/i.test(query)) {
        const athleticField = fieldCategories.athleticShoes.find(f => f.includes('_P')) || fieldCategories.athleticShoes[0];
        if (athleticField)
            selectedFields.push(athleticField);
    }
    // Detect specific brands
    const brandKeywords = {
        nike: /\bnike\b/i,
        adidas: /\badidas\b/i,
        jordan: /\bjordan\b/i,
        converse: /\bconverse\b/i,
        puma: /\bpuma\b/i,
        reebok: /\breebok\b/i,
        newbalance: /\bnew\s+balance\b/i,
        asics: /\basics\b/i,
        skechers: /\bskechers\b/i
    };
    Object.entries(brandKeywords).forEach(([brand, regex]) => {
        if (regex.test(query)) {
            const brandField = allFields.find(f => f.includes(BRAND_FIELD_CODES[brand]?.replace('A_B', 'A_B')));
            if (brandField && !selectedFields.includes(brandField)) {
                selectedFields.push(brandField);
            }
        }
    });
    // Detect demographics
    if (/\b(income|age|population|demographic|diversity)\b/i.test(query)) {
        let demoField;
        if (/\bincome\b/i.test(query)) {
            demoField = fieldCategories.demographics.find(f => f.includes('MEDDI'));
        }
        else if (/\bage\b/i.test(query)) {
            demoField = fieldCategories.demographics.find(f => f.includes('GENZ'));
        }
        else if (/\bpopulation\b/i.test(query)) {
            demoField = fieldCategories.demographics.find(f => f.includes('TOTPOP'));
        }
        else {
            demoField = fieldCategories.demographics[0];
        }
        if (demoField && !selectedFields.includes(demoField)) {
            selectedFields.push(demoField);
        }
    }
    // If we have exactly 2 fields, return them
    if (selectedFields.length === 2) {
        return selectedFields;
    }
    // If we have 1 field, try to find a logical second field
    if (selectedFields.length === 1) {
        const firstField = selectedFields[0];
        // If first field is yoga, pair with general athletic shoes
        if (firstField.includes('33032')) {
            const athleticField = fieldCategories.athleticShoes[0];
            if (athleticField)
                return [firstField, athleticField];
        }
        // If first field is a brand, pair with demographics or another brand
        if (fieldCategories.brands.includes(firstField)) {
            const demoField = fieldCategories.demographics.find(f => f.includes('MEDDI'));
            if (demoField)
                return [firstField, demoField];
        }
    }
    // Fallback: return first 2 fields with highest priority
    const priorityOrder = [
        ...fieldCategories.yoga,
        ...fieldCategories.athleticShoes,
        ...fieldCategories.brands,
        ...fieldCategories.demographics,
        ...fieldCategories.sports,
        ...fieldCategories.retail
    ];
    const prioritizedFields = priorityOrder.filter(f => allFields.includes(f));
    return prioritizedFields.slice(0, 2);
}
async function analyzeQuery(query, conceptMap, context) {
    const lowerQuery = query.toLowerCase().replace(/['?]/g, '');
    // Default target variable – use Nike athletic shoe purchases as project default
    let targetVariable = 'MP30034A_B';
    let queryType = 'unknown';
    let explanation = '';
    // Check for brand mentions (both single and multiple)
    const brandMentions = Object.keys(BRAND_FIELD_CODES)
        .filter(brand => lowerQuery.includes(brand));
    console.log('[QueryAnalyzer] Brand detection:', {
        query: lowerQuery,
        brandMentions,
        brandCount: brandMentions.length
    });
    // Handle brand comparisons (2+ brands) - expanded pattern to catch difference queries
    if (brandMentions.length >= 2 && /\b(compare|vs|versus|against|between|higher|lower|stronger|weaker|better|worse|outperform|beat|dominates?|leads?|wins?|difference|differences)\b/.test(lowerQuery)) {
        // For brand comparisons, use the first mentioned brand as target (with percentage preference)
        const firstBrand = brandMentions[0];
        const firstBrandField = BRAND_FIELD_CODES[firstBrand];
        targetVariable = (0, field_utils_1.preferPercentage)(firstBrandField);
        // Determine query type based on specific language patterns
        if (brandMentions.length === 2) {
            // Check for joint/both patterns that indicate joint-high analysis
            const jointHighPatterns = /\b(both|and|high.*both|where.*both|areas.*both|regions.*both)\b/i;
            const competitivePatterns = /\b(vs|versus|against|better|dominates?|leads?|wins?|beats?|outperforms?|higher|lower|stronger|weaker|worse|difference|differences)\b/i;
            if (jointHighPatterns.test(lowerQuery) && !competitivePatterns.test(lowerQuery)) {
                queryType = 'jointHigh';
                explanation = `Identified a joint-high analysis for areas with both ${brandMentions.join(' and ')}.`;
            }
            else {
                // For 2-brand queries, default to difference analysis (competitive comparison)
                queryType = 'difference';
                explanation = `Identified a competitive difference comparison between ${brandMentions.join(' and ')}.`;
            }
        }
        else {
            queryType = 'comparison';
            explanation = `Identified a multi-brand comparison between ${brandMentions.join(', ')}.`;
        }
        // Add ALL mentioned brands to matched fields (with percentage preference)
        const brandFields = brandMentions.map(brand => (0, field_utils_1.preferPercentage)(BRAND_FIELD_CODES[brand]));
        conceptMap.matchedFields = [...new Set([...conceptMap.matchedFields, ...brandFields])];
        // Log for debugging
        console.log('[QueryAnalyzer] Brand comparison detected:', {
            brands: brandMentions,
            brandCount: brandMentions.length,
            queryType,
            target: targetVariable,
            brandFields: brandFields,
            matchedFields: conceptMap.matchedFields
        });
        // Return early for brand comparisons with ALL brand fields (with percentage preference)
        return {
            queryType,
            targetVariable,
            explanation,
            relevantLayers: [],
            entities: [],
            intent: 'comparison',
            confidence: 1,
            layers: [],
            timeframe: '',
            searchType: 'web',
            relevantFields: brandFields, // All brands with percentage preference
            visualizationStrategy: queryType === 'jointHigh' ? 'joint high' :
                queryType === 'difference' ? 'difference' : 'multivariate'
        };
    }
    // Handle multiple brand queries without explicit comparison keywords
    if (brandMentions.length >= 2 && !/\b(compare|vs|versus|against|between)\b/.test(lowerQuery)) {
        // Check if this is a joint-high query (e.g., "areas with high Nike and Adidas")
        const jointHighPatterns = /\b(both|and|high.*both|where.*both|areas.*both|regions.*both|high.*and)\b/i;
        if (jointHighPatterns.test(lowerQuery)) {
            const firstBrand = brandMentions[0];
            const firstBrandField = BRAND_FIELD_CODES[firstBrand];
            targetVariable = (0, field_utils_1.preferPercentage)(firstBrandField);
            const brandFields = brandMentions.map(brand => (0, field_utils_1.preferPercentage)(BRAND_FIELD_CODES[brand]));
            conceptMap.matchedFields = [...new Set([...conceptMap.matchedFields, ...brandFields])];
            console.log('[QueryAnalyzer] Joint-high brand query detected:', {
                brands: brandMentions,
                target: targetVariable,
                brandFields: brandFields,
                matchedFields: conceptMap.matchedFields
            });
            return {
                queryType: 'jointHigh',
                targetVariable,
                explanation: `Identified a joint-high analysis for areas with high ${brandMentions.join(' and ')}.`,
                relevantLayers: [],
                entities: [],
                intent: 'comparison',
                confidence: 1,
                layers: [],
                timeframe: '',
                searchType: 'web',
                relevantFields: brandFields,
                visualizationStrategy: 'joint high'
            };
        }
    }
    // Handle single brand queries
    if (brandMentions.length === 1) {
        const brand = brandMentions[0];
        const brandField = BRAND_FIELD_CODES[brand];
        const preferredBrandField = (0, field_utils_1.preferPercentage)(brandField);
        targetVariable = preferredBrandField;
        // Add the brand field to matched fields (with percentage preference)
        conceptMap.matchedFields = [...new Set([...conceptMap.matchedFields, preferredBrandField])];
        console.log('[QueryAnalyzer] Single brand detected:', {
            brand,
            brandField: preferredBrandField,
            target: targetVariable,
            matchedFields: conceptMap.matchedFields
        });
    }
    // ---------------------------------------------------------------------------
    // Heuristic: infer brand fields for generic "premium" / "budget" brand queries
    // ---------------------------------------------------------------------------
    if (brandMentions.length === 0) {
        const premiumKeywords = /(premium|high\s*end|luxury)/i;
        const budgetKeywords = /(budget|low\s*cost|affordable|value)/i;
        const hasPremium = premiumKeywords.test(lowerQuery);
        const hasBudget = budgetKeywords.test(lowerQuery);
        if (hasPremium || hasBudget) {
            const inferredBrands = [];
            if (hasPremium) {
                inferredBrands.push('nike', 'jordan');
            }
            if (hasBudget) {
                inferredBrands.push('skechers', 'puma', 'reebok');
            }
            inferredBrands.forEach(b => {
                const fieldCode = BRAND_FIELD_CODES[b];
                if (fieldCode) {
                    const preferredFieldCode = (0, field_utils_1.preferPercentage)(fieldCode);
                    conceptMap.matchedFields = [...new Set([...conceptMap.matchedFields, preferredFieldCode])];
                }
            });
            if (inferredBrands.length > 0) {
                console.log('[QueryAnalyzer] Inferred brand fields from premium/budget keywords:', {
                    inferredBrands,
                    matchedFields: conceptMap.matchedFields
                });
            }
        }
    }
    const fieldNameMap = buildFieldNameMap();
    // CRITICAL FIX: Preserve original case for field codes, use FIELD_ALIASES for normalization
    const normalizedMatchedFields = conceptMap.matchedFields.map(f => {
        // If it's already a proper field code (uppercase), keep it
        if (/^[A-Z0-9_]+$/.test(f)) {
            return (0, field_utils_1.preferPercentage)(f);
        }
        // Otherwise, try to normalize using FIELD_ALIASES
        const lowerF = f.toLowerCase();
        const canonical = field_aliases_1.FIELD_ALIASES[lowerF] || f;
        return (0, field_utils_1.preferPercentage)(canonical);
    });
    // ----- variable declarations -----
    let demographic_filters = [];
    const highMentions = (lowerQuery.match(/\b(high|highest|concentration|most)\b/ig) || []).length;
    const lowMentions = (lowerQuery.match(/\b(low|lowest)\b/ig) || []).length;
    const isComparisonQuery = lowMentions > 0 && highMentions > 0 && normalizedMatchedFields.length >= 2;
    const hasDemographicField = normalizedMatchedFields.some(f => demographicFields.includes(f.toLowerCase()));
    // Correctly ordered classification logic - TopN queries should be checked first
    if ((/\b(do|does|how does)\b/i.test(lowerQuery) ||
        /\b(relationship|correlation|correlate|relate|connection|between)\b/i.test(lowerQuery)) &&
        normalizedMatchedFields.length >= 2) {
        queryType = 'correlation';
        explanation = 'Identified a direct question about a relationship between two variables.';
        // CRITICAL FIX: For correlation queries, intelligently select the 2 most relevant fields
        // instead of returning all matched fields
        const correlationFields = selectCorrelationFields(lowerQuery, normalizedMatchedFields);
        if (correlationFields.length >= 2) {
            // Override normalizedMatchedFields with just the 2 correlation fields
            normalizedMatchedFields.length = 0;
            normalizedMatchedFields.push(...correlationFields);
            console.log('[QueryAnalyzer] Correlation field selection:', {
                query: lowerQuery,
                selectedFields: correlationFields,
                originalFieldCount: conceptMap.matchedFields.length
            });
        }
    }
    else if (/(rank|top|most|highest|lowest)\b/i.test(lowerQuery) ||
        /\b(top|highest|best|leading|maximum)\s+\d+/i.test(lowerQuery) ||
        /\b(show|display|find|list|get)\s+(?:me\s+)?(?:the\s+)?(?:top|highest|best|leading|maximum)/i.test(lowerQuery)) {
        queryType = 'topN';
        explanation = 'Identified a ranking query for the top results.';
    }
    else if (isComparisonQuery) {
        queryType = 'correlation';
        explanation = 'Identified a comparison between low and high values.';
    }
    else if ((lowMentions === 0 && highMentions >= 1 && normalizedMatchedFields.length >= 2) ||
        (lowMentions === 0 && highMentions >= 1 && hasDemographicField)) {
        queryType = 'jointHigh';
        explanation = 'Identified a search for areas with multiple high values, possibly including a demographic.';
        demographic_filters = normalizedMatchedFields
            .filter(field => {
            const lowerField = field.toLowerCase();
            return lowerField !== 'mortgage_applications' && lowerField !== 'frequency' && lowerField !== 'thematic_value';
        })
            .map(field => ({ field, condition: '>' }));
    }
    else if (normalizedMatchedFields.length >= 2) {
        queryType = 'correlation';
        explanation = 'Multiple fields were mentioned, implying a correlation.';
    }
    else if (normalizedMatchedFields.length > 0) {
        queryType = 'choropleth';
        explanation = 'A single field was mentioned, defaulting to a thematic map.';
    }
    else {
        queryType = 'unknown';
        explanation = 'Could not determine the query type based on the input.';
    }
    // Select visualization strategy directly from mapping; do not override for comparison queries.
    let visualizationStrategy = queryTypeToStrategy[queryType] || 'choropleth';
    // ------------------------------------------------------------
    // Choose a safe target variable (special handling for correlation queries)
    // ------------------------------------------------------------
    if (queryType === 'correlation') {
        // For correlation queries, we want to keep both variables
        // Use the first non-application field as primary target
        const nonAppFields = normalizedMatchedFields.filter(f => !['applications', 'application', 'numberofapplications', 'number_of_applications', 'frequency'].includes(f.toLowerCase()));
        targetVariable = nonAppFields[0] || 'MEDDI_CY';
    }
    else if (queryType === 'topN') {
        // For topN queries, use the first matched field directly
        const validFields = normalizedMatchedFields.filter(f => !['applications', 'application', 'numberofapplications', 'number_of_applications', 'frequency', 'mortgage_applications'].includes(f.toLowerCase()));
        targetVariable = validFields[0] || 'MP30034A_B';
        console.log('[QueryAnalyzer] TopN query - using target variable:', targetVariable, 'from fields:', validFields);
    }
    else {
        const excludeSet = new Set([
            'mortgage_applications',
            'mortgage_approvals',
            'applications',
            'application',
            'numberofapplications',
            'number_of_applications',
            'frequency',
        ]);
        const filtered = normalizedMatchedFields.filter((f) => !excludeSet.has(f.toLowerCase()));
        const preferred = filtered.find((f) => !demographicFields.includes(f.toLowerCase()));
        targetVariable = preferred || filtered[0] || 'MP30034A_B';
        if (targetVariable === 'mortgage_approvals') {
            targetVariable = 'MP30034A_B';
        }
    }
    // Guard against picking any applications-related field as the target (except for correlation queries)
    if (queryType !== 'correlation' && queryType !== 'topN') {
        if ([
            'applications',
            'application',
            'numberofapplications',
            'number_of_applications',
            'mortgage_applications',
            'frequency',
        ].includes(targetVariable.toLowerCase())) {
            targetVariable = 'MP30034A_B';
        }
        // Final safeguard: ensure the targetVariable is neither empty nor an
        // applications-related synonym. If it is, fall back to a stable metric.
        const invalidTargets = new Set([
            '',
            'frequency',
            'applications',
            'application',
            'numberofapplications',
            'number_of_applications',
            'mortgage_applications',
            'mortgage_approvals',
        ]);
        if (invalidTargets.has(targetVariable.toLowerCase())) {
            targetVariable = 'MP30034A_B';
        }
    }
    // Ensure we prefer percentage form for target variable when available
    targetVariable = (0, field_utils_1.preferPercentage)(targetVariable);
    if (isComparisonQuery) {
        visualizationStrategy = 'ranking';
    }
    // Reset: retain original mapping when the previous override set 'ranking'.
    if (isComparisonQuery && visualizationStrategy === 'ranking') {
        visualizationStrategy = queryTypeToStrategy[queryType] || 'choropleth';
    }
    const result = {
        queryType,
        visualizationStrategy,
        relevantLayers: conceptMap.matchedLayers,
        targetVariable,
        targetField: targetVariable,
        relevantFields: normalizedMatchedFields,
        intent: 'visualization_request',
        confidence: 0.85,
        explanation,
        entities: [],
        layers: conceptMap.matchedLayers.map(l => ({
            layerId: l,
            relevance: 1,
            matchMethod: 'keyword',
            confidence: 0.8,
            reasons: []
        })),
        timeframe: 'not_specified',
        searchType: 'web',
        isCrossGeography: false,
        originalQueryType: 'unknown',
        originalQuery: query,
        trendsKeyword: '',
        populationLookup: new Map(),
        reasoning: '',
        metrics: { r: 0 },
        correlationMetrics: { r: 0 },
        thresholds: {},
        category: '',
        demographic_filters,
    };
    return result;
}
