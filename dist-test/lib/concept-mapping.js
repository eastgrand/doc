"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIELD_KEYWORDS = void 0;
exports.conceptMapping = conceptMapping;
exports.mapToConcepts = mapToConcepts;
const query_classifier_1 = require("./query-classifier");
const field_aliases_1 = require("../utils/field-aliases");
const layers_1 = require("../config/layers");
// ============================================================================
// SYSTEMATIC FIELD MAPPING GENERATION
// ============================================================================
// Instead of hardcoded mappings, automatically extract ALL fields from the 
// layer configuration and build comprehensive keyword mappings
// Build comprehensive field keywords from layer configuration
function buildFieldKeywordsFromLayers() {
    const fieldKeywords = {};
    // Extract all fields from all layers
    layers_1.baseLayerConfigs.forEach(layer => {
        if (layer.fields) {
            layer.fields.forEach(field => {
                const fieldName = field.name;
                const fieldAlias = field.alias || field.label || fieldName;
                // Skip system fields
                if (['OBJECTID', 'Shape__Area', 'Shape__Length', 'CreationDate', 'EditDate', 'Creator', 'Editor'].includes(fieldName)) {
                    return;
                }
                if (!fieldKeywords[fieldName]) {
                    fieldKeywords[fieldName] = [];
                }
                // Add the field name itself (lowercase)
                fieldKeywords[fieldName].push(fieldName.toLowerCase());
                // Add the alias (lowercase)
                if (fieldAlias && fieldAlias !== fieldName) {
                    fieldKeywords[fieldName].push(fieldAlias.toLowerCase());
                }
                // Extract meaningful keywords from the alias
                const aliasKeywords = extractKeywordsFromAlias(fieldAlias);
                fieldKeywords[fieldName].push(...aliasKeywords);
            });
        }
    });
    // Also include mappings from ALIAS_MAP
    Object.entries(field_aliases_1.FIELD_ALIASES).forEach(([alias, fieldCode]) => {
        if (!fieldKeywords[fieldCode]) {
            fieldKeywords[fieldCode] = [];
        }
        fieldKeywords[fieldCode].push(alias.toLowerCase());
        // Extract keywords from the alias
        const aliasKeywords = extractKeywordsFromAlias(alias);
        fieldKeywords[fieldCode].push(...aliasKeywords);
    });
    // Deduplicate and clean up keywords for each field
    Object.keys(fieldKeywords).forEach(fieldCode => {
        fieldKeywords[fieldCode] = Array.from(new Set(fieldKeywords[fieldCode]));
    });
    return fieldKeywords;
}
// Extract meaningful keywords from field aliases
function extractKeywordsFromAlias(alias) {
    const stopwords = new Set([
        'the', 'of', 'and', 'or', 'for', 'to', 'in', 'at', 'on', 'by', 'last', 'mo',
        'year', 'current', 'total', 'bought', 'spent', 'participated', 'shopped',
        'athletic', 'shoes', 'shoe', 'store', 'sport', 'sports', 'percent', 'percentage',
        '2024', 'esri', '(%)', 'scale', 'super', 'fan'
        // NOTE: Removed nike, adidas, jordan, converse from stopwords - these are CRITICAL brand keywords!
    ]);
    return alias
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Replace non-word chars with spaces
        .split(/\s+/)
        .filter(token => token.length > 2 &&
        !stopwords.has(token) &&
        !/^\d+$/.test(token) // Remove pure numbers
    );
}
// Build the comprehensive field keywords mapping
const FIELD_KEYWORDS = buildFieldKeywordsFromLayers();
exports.FIELD_KEYWORDS = FIELD_KEYWORDS;
// CRITICAL FIX: Add enhanced demographic and age field mappings
const ENHANCED_FIELD_MAPPINGS = {
    // Age and generational demographics
    'GENZ_CY': ['age', 'young', 'youth', 'gen z', 'generation z', 'demographics', 'generational'],
    'GENZ_CY_P': ['age', 'young', 'youth', 'gen z', 'generation z', 'demographics', 'generational'],
    'MILLENN_CY': ['age', 'millennial', 'millennials', 'demographics', 'generational'],
    'MILLENN_CY_P': ['age', 'millennial', 'millennials', 'demographics', 'generational'],
    'GENALPHACY': ['age', 'young', 'youth', 'gen alpha', 'generation alpha', 'demographics', 'generational'],
    'GENALPHACY_P': ['age', 'young', 'youth', 'gen alpha', 'generation alpha', 'demographics', 'generational'],
    // Income and wealth demographics
    'MEDDI_CY': ['income', 'earnings', 'wealth', 'affluent', 'rich', 'poor', 'disposable income', 'median income', 'demographics'],
    'WLTHINDXCY': ['wealth', 'wealthy', 'affluent', 'rich', 'income', 'demographics'],
    // Population and diversity
    'TOTPOP_CY': ['population', 'people', 'residents', 'demographics'],
    'DIVINDX_CY': ['diversity', 'diverse', 'multicultural', 'ethnic', 'demographics'],
    // Racial/ethnic demographics
    'WHITE_CY': ['white', 'caucasian', 'demographics', 'ethnicity', 'race'],
    'WHITE_CY_P': ['white', 'caucasian', 'demographics', 'ethnicity', 'race'],
    'BLACK_CY': ['black', 'african american', 'demographics', 'ethnicity', 'race'],
    'BLACK_CY_P': ['black', 'african american', 'demographics', 'ethnicity', 'race'],
    'ASIAN_CY': ['asian', 'demographics', 'ethnicity', 'race'],
    'ASIAN_CY_P': ['asian', 'demographics', 'ethnicity', 'race'],
    'HISPWHT_CY': ['hispanic', 'latino', 'demographics', 'ethnicity', 'race'],
    'HISPWHT_CY_P': ['hispanic', 'latino', 'demographics', 'ethnicity', 'race'],
    // Sports participation - CRITICAL for sports queries
    'MP33020A_B': ['running', 'jogging', 'run', 'jog', 'participation', 'sports', 'exercise', 'fitness'],
    'MP33020A_B_P': ['running', 'jogging', 'run', 'jog', 'participation', 'sports', 'exercise', 'fitness'],
    'MP33032A_B': ['yoga', 'participation', 'sports', 'exercise', 'fitness'],
    'MP33032A_B_P': ['yoga', 'participation', 'sports', 'exercise', 'fitness'],
    'MP33031A_B': ['weight lifting', 'weightlifting', 'weights', 'gym', 'participation', 'sports', 'exercise', 'fitness'],
    'MP33031A_B_P': ['weight lifting', 'weightlifting', 'weights', 'gym', 'participation', 'sports', 'exercise', 'fitness'],
    // Sports fandom
    'MP33106A_B': ['basketball', 'nba', 'sports', 'fan'],
    'MP33106A_B_P': ['basketball', 'nba', 'sports', 'fan'],
    'MP33107A_B': ['football', 'nfl', 'sports', 'fan'],
    'MP33107A_B_P': ['football', 'nfl', 'sports', 'fan'],
    // Retail shopping
    'MP31035A_B': ['dicks', "dick's", 'sporting goods', 'retail', 'shopping'],
    'MP31035A_B_P': ['dicks', "dick's", 'sporting goods', 'retail', 'shopping'],
    'MP31042A_B': ['foot locker', 'footlocker', 'retail', 'shopping'],
    'MP31042A_B_P': ['foot locker', 'footlocker', 'retail', 'shopping'],
    // Athletic shoe types
    'MP30016A_B': ['athletic shoes', 'athletic shoe', 'sneakers', 'sneaker', 'overall', 'general'],
    'MP30016A_B_P': ['athletic shoes', 'athletic shoe', 'sneakers', 'sneaker', 'overall', 'general'],
    'MP30018A_B': ['basketball shoes', 'basketball shoe', 'basketball'],
    'MP30018A_B_P': ['basketball shoes', 'basketball shoe', 'basketball'],
    'MP30019A_B': ['cross training', 'cross-training', 'training shoes'],
    'MP30019A_B_P': ['cross training', 'cross-training', 'training shoes'],
    'MP30021A_B': ['running shoes', 'running shoe', 'jogging shoes', 'running', 'jogging'],
    'MP30021A_B_P': ['running shoes', 'running shoe', 'jogging shoes', 'running', 'jogging'],
};
// Merge enhanced mappings with existing field keywords
Object.entries(ENHANCED_FIELD_MAPPINGS).forEach(([fieldCode, keywords]) => {
    if (!FIELD_KEYWORDS[fieldCode]) {
        FIELD_KEYWORDS[fieldCode] = [];
    }
    FIELD_KEYWORDS[fieldCode] = [...new Set([...FIELD_KEYWORDS[fieldCode], ...keywords])];
});
console.log(`[ConceptMapping] Built field keywords for ${Object.keys(FIELD_KEYWORDS).length} fields`);
// Add some debug logging for key brand fields
['MP30032A_B', 'MP30031A_B', 'MP30034A_B', 'MP30029A_B'].forEach(fieldCode => {
    if (FIELD_KEYWORDS[fieldCode]) {
        console.log(`[ConceptMapping] ${fieldCode} keywords:`, FIELD_KEYWORDS[fieldCode]);
    }
});
// DEBUG: Test specific age demographics query
const testAgeQuery = "How does age demographics correlate with athletic shoe buying patterns?";
console.log(`[ConceptMapping] Testing age query: "${testAgeQuery}"`);
const testAgeMatches = [];
Object.entries(FIELD_KEYWORDS).forEach(([fieldCode, keywords]) => {
    const matchedKeywords = keywords.filter(keyword => {
        const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
        return keywordRegex.test(testAgeQuery.toLowerCase());
    });
    if (matchedKeywords.length > 0) {
        testAgeMatches.push({ fieldCode, matchedKeywords });
    }
});
console.log(`[ConceptMapping] Test matches for age demographics:`, testAgeMatches);
// DEBUG: Test Jordan vs Converse query specifically
const testQuery = "How do Jordan sales compare to Converse sales?";
console.log(`[ConceptMapping] Testing query: "${testQuery}"`);
const testMatches = [];
Object.entries(FIELD_KEYWORDS).forEach(([fieldCode, keywords]) => {
    const matchedKeywords = keywords.filter(keyword => {
        const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
        return keywordRegex.test(testQuery.toLowerCase());
    });
    if (matchedKeywords.length > 0) {
        testMatches.push({ fieldCode, matchedKeywords });
    }
});
console.log(`[ConceptMapping] Test matches for Jordan vs Converse:`, testMatches);
// ============================================================================
// LAYER MAPPING (keep existing approach)
// ============================================================================
// Define specific layer mapping based on keywords - map to actual layer IDs, not groups
const LAYER_KEYWORDS = {
    // Conversion and application metrics
    conversionRate: ['conversion', 'rate', 'success', 'approval', 'funded', 'purchase conversion'],
    applications: ['application', 'applications', 'apply', 'request', 'submission', 'purchases'],
    // Demographics and population
    totalPopulation: ['population', 'people', 'residents', 'total population'],
    visibleMinorityPopulation: ['minority', 'visible minority', 'diversity', 'ethnic', 'multicultural'],
    // Income (using available household_average_income field)
    householdIncome: ['income', 'earnings', 'salary', 'wage', 'affluence', 'wealth'],
    averageHouseholdIncome: ['average income', 'mean income'],
    medianHouseholdIncome: ['median household income', 'median income', 'income'],
    // Housing
    totalHouseholds: ['household', 'households', 'family', 'families'],
    ownerOccupied: ['owner', 'owned', 'ownership'],
    renterOccupied: ['renter', 'rental', 'rent'],
    condominium: ['condo', 'condominium', 'apartment'],
    condominiumOwnershipPct: ['condo ownership', 'condominium ownership', 'condo percentage', 'condominium percentage', 'condo ownership percentage', 'condominium ownership percentage'],
    // Age demographics
    maintainersMedianAge: ['age', 'median age', 'older', 'younger'],
    // Specific ethnic populations
    chineseHouseholdPopulation: ['chinese', 'china'],
    southAsianHouseholdPopulation: ['south asian', 'indian', 'pakistan', 'bangladesh'],
    filipinoHouseholdPopulation: ['filipino', 'philippines'],
    blackHouseholdPopulation: ['black', 'african'],
    arabHouseholdPopulation: ['arab', 'middle east'],
    latinAmericanHouseholdPopulation: ['latin', 'hispanic', 'spanish'],
    southeastAsianHouseholdPopulation: ['southeast asian', 'vietnam', 'thailand'],
    westAsianHouseholdPopulation: ['west asian', 'persian', 'iranian'],
    koreanHouseholdPopulation: ['korean', 'korea'],
    japaneseHouseholdPopulation: ['japanese', 'japan'],
    diversityIndex: ['diversity', 'ethnic diversity', 'cultural diversity', 'visible minority'],
    athleticShoePurchases: ['athletic shoe', 'sneaker', 'nike', 'adidas', 'jordan', 'converse', 'running shoe', 'basketball shoe'],
};
async function conceptMapping(query, context) {
    const lowerQuery = query.toLowerCase();
    const matchedLayers = new Set();
    const matchedFields = new Set();
    const keywords = [];
    const layerScores = {};
    const fieldScores = {};
    // Prioritize application-related matches first
    if (lowerQuery.includes('application')) {
        matchedLayers.add('applications');
        matchedFields.add('TOTPOP_CY');
        layerScores['applications'] = 10; // Give it a high score
        fieldScores['TOTPOP_CY'] = 10; // Give it a high score
    }
    // If context is provided, use it to enhance the query understanding
    if (context) {
        // Extract last mentioned layer/entity from context
        const lastLayerMatch = context.match(/layer ['"]([\w-]+)['"]/i) || context.match(/about ([\w\s]+)\./i);
        const lastEntity = lastLayerMatch ? lastLayerMatch[1] : undefined;
        // If query contains pronouns and we have a last entity, replace them
        if (lastEntity) {
            const pronounPattern = /\b(it|that|those|the previous|the last one|the above)\b/gi;
            if (pronounPattern.test(query)) {
                query = query.replace(pronounPattern, lastEntity);
            }
        }
        // If query is very short or vague, and context has a clear last entity, append it
        if (query.trim().length < 6 && lastEntity) {
            query = `${query} ${lastEntity}`.trim();
        }
        // If query is a follow-up like "now by city", prepend last entity
        if (/^now\b|^by\b|^compare\b|^show\b|^and\b|^also\b|^then\b/i.test(query) && lastEntity) {
            query = `${lastEntity} ${query}`.trim();
        }
    }
    // Extract keywords from query
    const queryWords = lowerQuery.split(/\s+/);
    // Score-based matching for more intelligent layer selection
    Object.entries(LAYER_KEYWORDS).forEach(([layerId, layerKeywords]) => {
        let score = 0;
        layerKeywords.forEach(keyword => {
            const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
            if (keywordRegex.test(lowerQuery)) {
                score += keyword.split(' ').length * 2;
                // Boost score for application-related keywords
                if (keyword.includes('application')) {
                    score += 5;
                }
            }
        });
        if (score > 0) {
            layerScores[layerId] = (layerScores[layerId] || 0) + score;
            keywords.push(...layerKeywords.filter(k => new RegExp(`\\b${k}\\b`, 'i').test(lowerQuery)));
        }
    });
    // Select top scoring layers
    const maxLayersAllowed = 5; // Default max
    // Filter layers based on score to be more selective
    const layerSelectionDetails = Object.entries(layerScores)
        .sort(([, a], [, b]) => b - a);
    const finalLayers = layerSelectionDetails.map(([layerId]) => layerId).slice(0, maxLayersAllowed);
    finalLayers.forEach(layer => matchedLayers.add(layer));
    // CRITICAL FIX: Direct brand field matching for Nike/Adidas/Jordan/Converse queries
    const brandFieldMap = {
        'nike': 'MP30034A_B_P',
        'adidas': 'MP30029A_B_P',
        'jordan': 'MP30032A_B_P',
        'converse': 'MP30031A_B_P',
        'puma': 'MP30035A_B_P',
        'reebok': 'MP30036A_B_P',
        'new balance': 'MP30033A_B_P',
        'asics': 'MP30030A_B_P',
        'skechers': 'MP30037A_B_P'
    };
    // Check for direct brand mentions and add their fields
    Object.entries(brandFieldMap).forEach(([brand, fieldCode]) => {
        if (lowerQuery.includes(brand)) {
            matchedFields.add(fieldCode);
            fieldScores[fieldCode] = 100; // High score for direct brand matches
            matchedLayers.add('athleticShoePurchases'); // Ensure athletic shoe layer is included
            // console.log(`[ConceptMapping] Direct brand match: ${brand} -> ${fieldCode}`);
        }
    });
    // Match fields based on keywords with scoring
    Object.entries(FIELD_KEYWORDS).forEach(([fieldName, fieldKeywords]) => {
        let score = 0;
        const matchedKeywords = [];
        fieldKeywords.forEach(keyword => {
            const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
            if (keywordRegex.test(lowerQuery)) {
                score += keyword.split(' ').length * 2;
                matchedKeywords.push(keyword);
            }
        });
        if (score > 0) {
            fieldScores[fieldName] = score;
            keywords.push(...fieldKeywords.filter(k => new RegExp(`\\b${k}\\b`, 'i').test(lowerQuery)));
            // DEBUG: Log field matches for Jordan/Converse queries
            if (lowerQuery.includes('jordan') || lowerQuery.includes('converse')) {
                console.log(`[ConceptMapping] Field match: ${fieldName} (score: ${score}) matched keywords:`, matchedKeywords);
            }
        }
    });
    Object.keys(fieldScores).forEach(field => matchedFields.add(field));
    // Remove renderer-only fields that should never be used for analysis
    const RENDERER_ONLY_FIELDS = ['thematic_value'];
    RENDERER_ONLY_FIELDS.forEach(f => {
        matchedFields.delete(f);
        delete fieldScores[f];
    });
    // If no specific matches, use the query classifier as a fallback
    if (matchedLayers.size === 0) {
        console.log('[ConceptMapping] No layers matched, using classifier fallback...');
        const classification = await query_classifier_1.queryClassifier.classifyQuery(query);
        if (classification.visualizationType) {
            // Attempt to map visualization type to a default layer
            const vizToLayerMap = {
                'choropleth': ['totalPopulation', 'applications'],
                'heatmap': ['applications'],
                'correlation': ['conversionRate', 'householdIncome'],
                'joint_high': ['conversionRate', 'householdIncome'],
            };
            const defaultLayers = vizToLayerMap[classification.visualizationType];
            if (defaultLayers) {
                defaultLayers.forEach(l => matchedLayers.add(l));
                console.log(`[ConceptMapping] Fallback to layers for ${classification.visualizationType}:`, defaultLayers);
            }
        }
    }
    // If query is about applications, don't add default layers
    if (!matchedLayers.has('applications')) {
        // Only apply defaults if not an application query
        if (matchedLayers.size === 0) {
            matchedLayers.add('totalPopulation');
            matchedLayers.add('applications');
            console.log('[ConceptMapping] Applying generic default layers.');
        }
    }
    // Calculate confidence based on scoring
    const totalScore = Object.values(layerScores).reduce((sum, score) => sum + score, 0) +
        Object.values(fieldScores).reduce((sum, score) => sum + score, 0);
    const confidence = Math.min(1, (matchedLayers.size + matchedFields.size) / 5);
    // More aggressive keyword matching
    const allKeywords = Array.from(new Set(keywords.flatMap(k => k.split(/\s+/))));
    allKeywords.forEach(keyword => {
        // Search in layer names and descriptions
        for (const [layerId, layerData] of Object.entries(LAYER_KEYWORDS)) {
            if (layerData.some((lk) => lk.includes(keyword))) {
                layerScores[layerId] = (layerScores[layerId] || 0) + 2;
            }
        }
        // Search in field names and aliases
        for (const [fieldName, fieldData] of Object.entries(FIELD_KEYWORDS)) {
            if (fieldData.some((fk) => fk.includes(keyword))) {
                fieldScores[fieldName] = (fieldScores[fieldName] || 0) + 2;
            }
        }
    });
    // Log final results for debugging
    console.log(`[ConceptMapping] Query: "${query}" -> ${matchedFields.size} fields, ${matchedLayers.size} layers`);
    // DEBUG: Log specific details for Jordan/Converse queries
    if (lowerQuery.includes('jordan') || lowerQuery.includes('converse')) {
        console.log(`[ConceptMapping] Jordan/Converse query final results:`);
        console.log(`  Matched fields:`, Array.from(matchedFields));
        console.log(`  Field scores:`, fieldScores);
        console.log(`  Matched layers:`, Array.from(matchedLayers));
    }
    return {
        matchedLayers: Array.from(matchedLayers),
        matchedFields: Array.from(matchedFields),
        confidence,
        keywords: Array.from(new Set(keywords)),
        layerScores,
        fieldScores,
    };
}
const layerIdToConceptMapping = {
    'conversionRate': 'conversions',
    'householdIncome': 'demographics',
    'maintainersMedianAge': 'demographics',
};
const fieldNameToConceptMapping = {
    'CONVERSIONRATE': 'thematic_value',
    'thematic_value': 'household_average_income',
    'SUM_FUNDED': 'funded_amount',
    'condominium': 'condo_ownership_pct',
    'applications': 'frequency',
    'application': 'frequency',
    'numberOfApplications': 'frequency',
    'number_of_applications': 'frequency',
    'household_average_income': 'household_average_income',
};
function mapToConcepts(matchedLayers, matchedFields) {
    const mappedLayers = matchedLayers.map(id => layerIdToConceptMapping[id] || id);
    const mappedFields = matchedFields.map(name => fieldNameToConceptMapping[name] || name);
    return {
        layers: Array.from(new Set(mappedLayers)),
        fields: Array.from(new Set(mappedFields)),
    };
}
