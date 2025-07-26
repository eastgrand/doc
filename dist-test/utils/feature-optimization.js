"use strict";
// Feature optimization utility for reducing data payload size
// and efficiently separating geometry from attributes for analysis
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimizeFeatures = optimizeFeatures;
exports.checkBlobSize = checkBlobSize;
exports.optimizeAnalysisFeatures = optimizeAnalysisFeatures;
/**
 * Creates an optimized version of feature data by removing geometries
 * and only including essential attributes for analysis
 */
function optimizeFeatures(features, layerConfig, options) {
    try {
        var _a = options.includeFields, includeFields_2 = _a === void 0 ? [] : _a, _b = options.excludeFields, excludeFields_1 = _b === void 0 ? [] : _b, _c = options.metadataFields, metadataFields = _c === void 0 ? [] : _c, _d = options.addLayerMetadata, addLayerMetadata = _d === void 0 ? true : _d, renderField = options.renderField, _e = options.removeGeometry // Default to false to preserve geometry
        , removeGeometry_1 = _e === void 0 ? true : _e // Default to false to preserve geometry
        ;
        // Get the renderer field from options, layer config, or use a default
        var rendererField_1 = renderField || (layerConfig === null || layerConfig === void 0 ? void 0 : layerConfig.rendererField) || 'value';
        console.log('[OptimizeFeatures Helper] Using renderer field:', rendererField_1);
        console.log('[OptimizeFeatures Helper] Received options.includeFields:', includeFields_2);
        console.log('[OptimizeFeatures Helper] Geometry will be ' + (removeGeometry_1 ? 'removed' : 'preserved'));
        // Collect a sample of unique feature property/attribute keys
        var featureAttrs = [];
        var includedAttrs = [];
        // Process feature attributes to gather metadata and optimize storage
        // Use a smaller sample size for performance on large datasets
        var sampleSize = Math.min(features.length, 100);
        var sampleFeatures = features.slice(0, sampleSize);
        // --- Enhanced feature processing ---
        for (var _i = 0, sampleFeatures_1 = sampleFeatures; _i < sampleFeatures_1.length; _i++) {
            var feature = sampleFeatures_1[_i];
            // Get attributes from either attributes or properties
            var attrs = __assign(__assign({}, feature.attributes), feature.properties);
            // Create a set of keys for metadata
            var attrKeys = new Set(Object.keys(attrs));
            featureAttrs.push(attrKeys);
            // Prepare the optimized attribute object
            var included = {};
            // Always include renderField and thematic_value as these are critical for visualization
            // and AI analysis alignment
            if (rendererField_1 && attrs[rendererField_1] !== undefined) {
                included[rendererField_1] = attrs[rendererField_1];
            }
            // Always ensure thematic_value exists, copy from rendererField if needed
            if (attrs.thematic_value !== undefined) {
                included.thematic_value = attrs.thematic_value;
            }
            else if (rendererField_1 && attrs[rendererField_1] !== undefined) {
                // If thematic_value is missing but rendererField exists, copy the value
                included.thematic_value = attrs[rendererField_1];
            }
            // Process the include fields
            for (var _f = 0, includeFields_1 = includeFields_2; _f < includeFields_1.length; _f++) {
                var field = includeFields_1[_f];
                if (field === rendererField_1 || field === 'thematic_value')
                    continue; // Already handled
                if (attrs[field] !== undefined) {
                    included[field] = attrs[field];
                }
            }
            includedAttrs.push(included);
        }
        console.log('[OptimizeFeatures Helper] Sample of included fields:', includedAttrs.length > 0 ? Object.keys(includedAttrs[0]) : []);
        // Make sure all features in the dataset have the required fields
        // Especially thematic_value which is critical for visualization
        var optimizedFeatures = features.map(function (feature) {
            var _a;
            // Get attributes from either attributes or properties
            var attrs = __assign(__assign({}, feature.attributes), feature.properties);
            // Create a new properties object for GeoJSON output
            var properties = {};
            // Always include renderer field and thematic_value
            if (rendererField_1 && attrs[rendererField_1] !== undefined) {
                properties[rendererField_1] = attrs[rendererField_1];
            }
            // Ensure thematic_value exists, derive from rendererField if needed
            if (attrs.thematic_value !== undefined) {
                properties.thematic_value = attrs.thematic_value;
            }
            else if (rendererField_1 && attrs[rendererField_1] !== undefined) {
                // Copy renderer field value to thematic_value
                properties.thematic_value = attrs[rendererField_1];
            }
            // Include all other specified fields
            for (var _i = 0, includeFields_3 = includeFields_2; _i < includeFields_3.length; _i++) {
                var field = includeFields_3[_i];
                if (field === rendererField_1 || field === 'thematic_value')
                    continue; // Already handled
                var fieldExists = attrs[field] !== undefined;
                if (fieldExists && !excludeFields_1.includes(field)) {
                    properties[field] = attrs[field];
                }
            }
            // Keep the original geometry unless removeGeometry is true
            var geometry = removeGeometry_1 ? null : feature.geometry;
            // If original geometry is in the properties, use it as a fallback
            if (!removeGeometry_1 && !geometry && ((_a = feature.properties) === null || _a === void 0 ? void 0 : _a._originalEsriGeometry)) {
                geometry = feature.properties._originalEsriGeometry;
            }
            return {
                type: 'Feature',
                geometry: geometry,
                properties: properties
            };
        });
        // Return the optimized result with a thematic_value validation flag
        var finalResult = {
            features: [
                {
                    type: 'FeatureCollection',
                    features: optimizedFeatures,
                    metadata: {
                        count: optimizedFeatures.length,
                        rendererField: rendererField_1,
                        fields: __spreadArray([], new Set(__spreadArray(__spreadArray([], includeFields_2, true), [rendererField_1, 'thematic_value'], false)), true),
                        hasThematicValue: optimizedFeatures.some(function (f) {
                            return f.properties && f.properties.thematic_value !== undefined;
                        }),
                        geometryPreserved: !removeGeometry_1
                    }
                }
            ],
            totalFeatures: features.length,
            timestamp: new Date().toISOString(),
            isComplete: true
        };
        console.log('[OptimizeFeatures Helper] Optimization complete:', {
            originalCount: features.length,
            optimizedCount: optimizedFeatures.length,
            rendererField: rendererField_1,
            hasThematicValue: finalResult.features[0].metadata.hasThematicValue,
            geometryPreserved: !removeGeometry_1
        });
        return finalResult;
    }
    catch (error) {
        console.error('Error in optimizeFeatures:', error);
        return {
            features: [],
            totalFeatures: 0,
            timestamp: new Date().toISOString(),
            isComplete: false,
            error: error instanceof Error ? error.message : 'Unknown error in optimizeFeatures'
        };
    }
}
// Helper to find a suitable identifier field
function getIdentifierField(attributes, layerConfig) {
    // If attributes is undefined or null, return Unknown
    if (!attributes) {
        return 'Unknown';
    }
    // Make sure we can safely access Object.keys
    try {
        if (typeof attributes !== 'object' || attributes === null) {
            console.warn('Invalid attributes object:', attributes);
            return 'Unknown';
        }
    }
    catch (e) {
        console.error('Error accessing attributes:', e);
        return 'Unknown';
    }
    // First check for specified display or ID fields in layer config
    if (layerConfig) {
        // Try display field first
        if (layerConfig.displayField && attributes[layerConfig.displayField] !== undefined) {
            return String(attributes[layerConfig.displayField] || '');
        }
        // Then try objectId field
        if (layerConfig.objectIdField && attributes[layerConfig.objectIdField] !== undefined) {
            return String(attributes[layerConfig.objectIdField] || '');
        }
        // Then try any fields specifically marked for identification in config
        if (layerConfig.fields) {
            var idFields_3 = layerConfig.fields
                .filter(function (f) { return f.type === 'id' || f.isIdentifier || f.isPrimary; })
                .map(function (f) { return f.name; });
            for (var _i = 0, idFields_1 = idFields_3; _i < idFields_1.length; _i++) {
                var field = idFields_1[_i];
                if (field && attributes[field] !== undefined) {
                    return String(attributes[field] || '');
                }
            }
        }
    }
    // Common name fields (fallback) - removed FEDNAME
    var nameFields = ['NAME', 'CSDNAME', 'name', 'Name', 'title', 'PLACENAME', 'DESCRIPTION'];
    // Common ID fields (fallback) - removed FEDUID
    var idFields = ['OBJECTID', 'FID', 'CSDUID', 'id', 'ID', 'CODE', 'UID'];
    // Try name fields first
    for (var _a = 0, nameFields_1 = nameFields; _a < nameFields_1.length; _a++) {
        var field = nameFields_1[_a];
        if (attributes[field] !== undefined) {
            return String(attributes[field] || '');
        }
    }
    // Try ID fields next
    for (var _b = 0, idFields_2 = idFields; _b < idFields_2.length; _b++) {
        var field = idFields_2[_b];
        if (attributes[field] !== undefined) {
            return String(attributes[field] || '');
        }
    }
    return 'Unknown';
}
// Helper to generate metadata
function generateMetadata(features, metadataFields, rendererField, layerConfig) {
    var statsFields = __spreadArray([rendererField], metadataFields, true).filter(Boolean);
    var metadata = {
        rendererField: rendererField,
        fieldType: 'numeric',
        description: (layerConfig === null || layerConfig === void 0 ? void 0 : layerConfig.description) || "Data for ".concat((layerConfig === null || layerConfig === void 0 ? void 0 : layerConfig.name) || 'unknown layer'),
        totalFeatures: features.length,
        validFeatures: features.filter(function (f) {
            return f && (f.attributes || f.properties) && !f.placeholder;
        }).length
    };
    // Calculate statistics for each field
    statsFields.forEach(function (field) {
        if (!field)
            return;
        try {
            var values = features
                .filter(function (f) {
                // Get attributes from either attributes or properties
                var attrs = (f === null || f === void 0 ? void 0 : f.attributes) || (f === null || f === void 0 ? void 0 : f.properties) || {};
                return (f &&
                    attrs &&
                    attrs[field] !== undefined &&
                    attrs[field] !== null &&
                    !isNaN(Number(attrs[field])) &&
                    !f.placeholder);
            })
                .map(function (f) {
                // Get the value from attributes or properties
                var attrs = (f === null || f === void 0 ? void 0 : f.attributes) || (f === null || f === void 0 ? void 0 : f.properties) || {};
                return Number(attrs[field]);
            })
                .filter(function (v) { return typeof v === 'number' && !isNaN(v); });
            if (values.length > 0) {
                metadata["".concat(field, "_min")] = Math.min.apply(Math, values);
                metadata["".concat(field, "_max")] = Math.max.apply(Math, values);
                metadata["".concat(field, "_avg")] = values.reduce(function (sum, val) { return sum + val; }, 0) / values.length;
                metadata["".concat(field, "_count")] = values.length;
            }
            else {
                // Set default values if no valid values found
                metadata["".concat(field, "_min")] = 0;
                metadata["".concat(field, "_max")] = 0;
                metadata["".concat(field, "_avg")] = 0;
                metadata["".concat(field, "_count")] = 0;
            }
        }
        catch (error) {
            console.warn("Error calculating statistics for field ".concat(field, ":"), error);
            metadata["".concat(field, "_error")] = 'Error calculating statistics';
        }
    });
    return metadata;
}
// Helper to check blob size
function checkBlobSize(data, maxSizeMB) {
    if (maxSizeMB === void 0) { maxSizeMB = 100; }
    try {
        var stringified = typeof data === 'string' ? data : JSON.stringify(data);
        var bytes = new TextEncoder().encode(stringified).length;
        var sizeMB = bytes / 1024 / 1024;
        return sizeMB <= maxSizeMB;
    }
    catch (error) {
        console.error('[Feature Optimization] Error checking blob size:', error);
        return false;
    }
}
/**
 * Creates an optimized version of feature data for analysis, with support for QueryAnalysis
 * This function can be imported dynamically in components
 */
function optimizeAnalysisFeatures(features, layerConfig, context) {
    return __awaiter(this, void 0, void 0, function () {
        var analysisContext, includeFields, optimizeOptions, result;
        return __generator(this, function (_a) {
            try {
                analysisContext = isQueryAnalysis(context)
                    ? convertQueryAnalysisToContext(context)
                    : context;
                includeFields = determineFieldsToInclude(analysisContext, layerConfig);
                optimizeOptions = {
                    includeFields: includeFields,
                    removeGeometry: false, // Keep geometry for visualization
                    renderField: (layerConfig === null || layerConfig === void 0 ? void 0 : layerConfig.rendererField) || 'value',
                    addLayerMetadata: true
                };
                result = optimizeFeatures(features, layerConfig, optimizeOptions);
                // Enhance the result with context information
                result.context = {
                    query: analysisContext.query,
                    analysisType: analysisContext.analysisType,
                    requiredFields: includeFields,
                    rendererField: optimizeOptions.renderField
                };
                // Add layer information if available
                if (layerConfig) {
                    result.layerId = layerConfig.id || '';
                    result.layerName = layerConfig.name || '';
                    result.layerType = layerConfig.type || '';
                }
                return [2 /*return*/, result];
            }
            catch (error) {
                console.error('[Feature Optimization] Error optimizing features:', error);
                // Return error result
                return [2 /*return*/, {
                        features: [],
                        totalFeatures: 0,
                        timestamp: new Date().toISOString(),
                        isComplete: false,
                        error: error instanceof Error ? error.message : String(error)
                    }];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Helper to check if an object is a QueryAnalysis
 */
function isQueryAnalysis(obj) {
    return obj &&
        typeof obj === 'object' &&
        'queryType' in obj &&
        'entities' in obj &&
        'intent' in obj;
}
/**
 * Convert a QueryAnalysis object to an AnalysisContext
 */
function convertQueryAnalysisToContext(analysis) {
    return {
        query: analysis.explanation || '',
        analysisType: analysis.queryType || 'unknown',
        intent: analysis.intent,
        confidence: analysis.confidence,
        timeframe: analysis.timeframe,
        relevantLayers: analysis.relevantLayers,
        explanation: analysis.explanation,
        requiredFields: analysis.relevantFields,
        populationLookup: analysis.populationLookup,
        additionalContext: {
            entities: analysis.entities,
            comparisonParty: analysis.comparisonParty,
            topN: analysis.topN,
            isCrossGeography: analysis.isCrossGeography,
            originalQueryType: analysis.originalQueryType,
            trendsKeyword: analysis.trendsKeyword,
            metrics: analysis.metrics,
            thresholds: analysis.thresholds
        }
    };
}
/**
 * Determine which fields to include based on the analysis type
 */
function determineFieldsToInclude(context, layerConfig) {
    var baseFields = ['OBJECTID', 'FID', 'NAME', 'NAME_ALIAS', 'STATE_NAME', 'COUNTY', 'CITY'];
    var rendererField = (layerConfig === null || layerConfig === void 0 ? void 0 : layerConfig.rendererField) || 'value';
    // Always include the renderer field and any required fields from the analysis
    var fields = __spreadArray(__spreadArray([], baseFields, true), [rendererField], false);
    if (context.requiredFields && context.requiredFields.length > 0) {
        fields.push.apply(fields, context.requiredFields);
    }
    // Include specific fields based on analysis type
    switch (context.analysisType) {
        case 'correlation':
            fields.push('population', 'median_income', 'households');
            break;
        case 'trend':
        case 'trends':
            fields.push('year', 'date', 'timestamp', 'period', 'value');
            break;
        case 'distribution':
            fields.push('population', 'density', 'area');
            break;
        case 'topN':
            fields.push('rank', 'score', 'rating');
            break;
    }
    // Return unique fields only
    return __spreadArray([], new Set(fields), true);
}
