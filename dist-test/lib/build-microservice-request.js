"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMicroserviceRequest = buildMicroserviceRequest;
const field_aliases_1 = require("../utils/field-aliases");
const field_utils_1 = require("../utils/field-utils");
/**
 * Convert CamelCase / PascalCase → snake_case (same helper used in the UI)
 */
const toSnake = (str) => str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
/**
 * Build the exact payload sent by the geospatial chat UI to the SHAP micro-service.
 * Keeping the logic in one place guarantees tests exercise the same request format.
 */
function buildMicroserviceRequest(analysisResult, query, selectedTargetVariable, conversationContext = '') {
    // Helper: decide whether a string already looks like a dataset column (e.g. MP30034A_B, TOTPOP_CY)
    const looksLikeDatasetCode = (s) => /^[A-Z0-9_]{4,}$/.test(s);
    // 1️⃣  Map all analysisResult.relevantFields into dataset codes -----------------
    const mappedMatched = (analysisResult.relevantFields || []).map((field) => {
        const aliasKey = field.toLowerCase();
        let mapped = field_aliases_1.FIELD_ALIASES[aliasKey] || (looksLikeDatasetCode(field.toUpperCase()) ? field.toUpperCase() : toSnake(field));
        mapped = (0, field_utils_1.preferPercentage)(mapped);
        return mapped;
    });
    // 2️⃣  Ensure the target variable itself is present in matched_fields ---------
    const initialTarget = selectedTargetVariable || analysisResult.targetVariable || '';
    const initialKey = initialTarget.toLowerCase();
    let effectiveTarget = field_aliases_1.FIELD_ALIASES[initialKey] || (looksLikeDatasetCode(initialTarget.toUpperCase()) ? initialTarget.toUpperCase() : toSnake(initialTarget));
    effectiveTarget = (0, field_utils_1.preferPercentage)(effectiveTarget);
    // 2.5️⃣ Special handling for brand comparison queries (Nike vs Adidas, etc.) ----
    let allFields = [effectiveTarget, ...mappedMatched].filter(Boolean);
    // Detect brand comparison patterns in the query
    const queryLower = query.toLowerCase();
    const brandFields = [];
    if ((queryLower.includes('nike') || queryLower.includes('adidas') || queryLower.includes('jordan') ||
        queryLower.includes('converse') || queryLower.includes('puma') || queryLower.includes('reebok')) &&
        (queryLower.includes('vs') || queryLower.includes('versus') || queryLower.includes('compare'))) {
        // This is a brand comparison query - add all mentioned brand fields
        const brandMap = {
            'nike': 'MP30034A_B',
            'adidas': 'MP30029A_B',
            'jordan': 'MP30032A_B',
            'converse': 'MP30031A_B',
            'puma': 'MP30035A_B',
            'reebok': 'MP30036A_B',
            'new balance': 'MP30033A_B',
            'asics': 'MP30030A_B'
        };
        Object.entries(brandMap).forEach(([brand, fieldCode]) => {
            if (queryLower.includes(brand)) {
                brandFields.push((0, field_utils_1.preferPercentage)(fieldCode));
            }
        });
        // For brand comparisons, include all detected brand fields
        if (brandFields.length >= 2) {
            allFields = [...brandFields, ...allFields];
        }
    }
    // Remove duplicates while maintaining order (Set can reorder elements)
    const seen = new Set();
    const matchedWithTarget = allFields.filter(field => {
        if (seen.has(field))
            return false;
        seen.add(field);
        return true;
    });
    // 3️⃣  Decide analysis_type and top_n ----------------------------------------
    const analysisTypeForApi = analysisResult.visualizationStrategy || 'choropleth';
    // Ranking queries need a positive top_n; others omit it.
    const isRanking = analysisTypeForApi === 'ranking' || analysisTypeForApi === 'joint high';
    const topN = isRanking ? (analysisResult.limit || 25) : undefined;
    // 4️⃣  For correlation / joint_high build a metrics array (backend expects it)
    const needsMetrics = analysisTypeForApi === 'correlation' || analysisTypeForApi === 'joint high';
    const metrics = needsMetrics ? matchedWithTarget : undefined;
    const base = {
        query,
        analysis_type: analysisTypeForApi,
        conversationContext,
        target_variable: effectiveTarget,
        matched_fields: matchedWithTarget,
        relevant_layers: analysisResult.relevantLayers.map((l) => toSnake(l)),
        relevantLayers: analysisResult.relevantLayers,
        demographic_filters: analysisResult.demographic_filters || [],
    }; // allow extra fields
    const payload = {
        ...base,
        ...(topN !== undefined ? { top_n: topN } : {}),
        ...(metrics ? { metrics } : {}),
    };
    return payload;
}
