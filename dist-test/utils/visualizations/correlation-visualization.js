"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.CorrelationVisualization = void 0;
var FeatureLayer_1 = require("@arcgis/core/layers/FeatureLayer");
var SimpleFillSymbol_1 = require("@arcgis/core/symbols/SimpleFillSymbol");
var base_visualization_1 = require("./base-visualization");
var Graphic_1 = require("@arcgis/core/Graphic");
var createQuartileRenderer_1 = require("../createQuartileRenderer");
var ClassBreaksRenderer_1 = require("@arcgis/core/renderers/ClassBreaksRenderer");
var SpatialReference_1 = require("@arcgis/core/geometry/SpatialReference");
var projection = require("@arcgis/core/geometry/projection");
var geometryEngineAsync = require("@arcgis/core/geometry/geometryEngineAsync");
var lodash_1 = require("lodash");
var rbush_1 = require("rbush");
// --- End Linter Fix ---
// Comment out missing module for now
// import { calculateCorrelationScore } from './correlation-calculation'; 
var popup_utils_1 = require("@/utils/popup-utils");
var legend_1 = require("@/types/legend");
var microservice_types_1 = require("@/types/microservice-types");
var CorrelationVisualization = /** @class */ (function (_super) {
    __extends(CorrelationVisualization, _super);
    function CorrelationVisualization() {
        var _this = _super.call(this) || this;
        _this.data = null; // Add data property to hold input
        _this.options = {}; // Track options like SingleLayer
        _this.renderer = new ClassBreaksRenderer_1.default({
            field: "correlation_score", // Using correlation_score as the primary field
            classBreakInfos: [
                {
                    minValue: -1,
                    maxValue: -0.5,
                    symbol: new SimpleFillSymbol_1.default({
                        color: [239, 59, 44, 0.7], // red
                        outline: { color: [128, 128, 128, 0.5], width: 0.5 }
                    }),
                    label: "Strong Negative"
                },
                {
                    minValue: -0.5,
                    maxValue: 0,
                    symbol: new SimpleFillSymbol_1.default({
                        color: [255, 127, 0, 0.7], // orange
                        outline: { color: [128, 128, 128, 0.5], width: 0.5 }
                    }),
                    label: "Weak Negative"
                },
                {
                    minValue: 0,
                    maxValue: 0.5,
                    symbol: new SimpleFillSymbol_1.default({
                        color: [158, 215, 152, 0.7], // light green
                        outline: { color: [128, 128, 128, 0.5], width: 0.5 }
                    }),
                    label: "Weak Positive"
                },
                {
                    minValue: 0.5,
                    maxValue: 1,
                    symbol: new SimpleFillSymbol_1.default({
                        color: [49, 163, 84, 0.7], // green
                        outline: { color: [128, 128, 128, 0.5], width: 0.5 }
                    }),
                    label: "Strong Positive"
                }
            ],
            legendOptions: {
                title: "Correlation Strength"
            },
            defaultSymbol: new SimpleFillSymbol_1.default({
                color: [200, 200, 200, 0.5], // Use a light gray for No Data
                outline: { color: [150, 150, 150, 0.5], width: 0.5 }
            }),
            defaultLabel: "No Data"
        });
        return _this;
    }
    CorrelationVisualization.prototype.findVisualizationField = function (feature, fieldName) {
        console.log('[CorrViz FindField] Finding visualization field:', {
            fieldName: fieldName,
            availableFields: Object.keys(feature.attributes || {}),
            hasProperties: !!feature.properties,
            propertyFields: feature.properties ? Object.keys(feature.properties) : []
        });
        // Combine attributes and properties for searching
        var combinedAttrs = __assign(__assign({}, (feature.attributes || {})), (feature.properties || {}));
        // First try the specified field in the combined attributes
        if (combinedAttrs[fieldName] !== undefined) {
            console.log("[CorrViz FindField] Found specified field '".concat(fieldName, "'"));
            return fieldName;
        }
        // Look for numeric fields as fallback
        var numericFields = Object.entries(combinedAttrs)
            .filter(function (_a) {
            var _ = _a[0], value = _a[1];
            return typeof value === 'number' && !isNaN(value);
        })
            .map(function (_a) {
            var key = _a[0];
            return key;
        });
        if (numericFields.length > 0) {
            console.log('[CorrViz FindField] Using fallback numeric field:', numericFields[0]);
            return numericFields[0];
        }
        throw new Error("No suitable numeric field found for correlation analysis. Available fields: ".concat(Object.keys(combinedAttrs).join(', ')));
    };
    // Override the base validateData method
    CorrelationVisualization.prototype.validateData = function (data) {
        var _a;
        console.log('[CorrViz ValidateData] Validating correlation input data:', {
            featureCount: (_a = data.features) === null || _a === void 0 ? void 0 : _a.length,
            primaryField: data.primaryField,
            comparisonField: data.comparisonField,
            layerId: data.layerId
        });
        // Call the parent validateData first
        _super.prototype.validateData.call(this, data);
        // Ensure features is an array
        if (!Array.isArray(data.features)) {
            throw new Error('Invalid data format: features must be an array');
        }
        // Check if there are features to validate fields against
        if (data.features.length === 0) {
            console.warn('[CorrViz ValidateData] No features provided for validation.');
            return;
        }
        var sampleFeature = data.features[0];
        console.log('[CorrViz ValidateData] Sample feature attributes:', {
            availableFields: Object.keys(sampleFeature.attributes || {}),
            primaryField: data.primaryField,
            comparisonField: data.comparisonField
        });
        // Validate that fields exist in features
        var primaryExists = data.features.some(function (f) {
            var attrs = f.attributes || {};
            var exists = attrs[data.primaryField] !== undefined;
            if (!exists) {
                console.warn("[CorrViz ValidateData] Primary field \"".concat(data.primaryField, "\" not found in feature. Available fields:"), Object.keys(attrs));
            }
            return exists;
        });
        var comparisonExists = data.features.some(function (f) {
            var attrs = f.attributes || {};
            var exists = attrs[data.comparisonField] !== undefined;
            if (!exists) {
                console.warn("[CorrViz ValidateData] Comparison field \"".concat(data.comparisonField, "\" not found in feature. Available fields:"), Object.keys(attrs));
            }
            return exists;
        });
        if (!primaryExists) {
            throw new Error("Primary field \"".concat(data.primaryField, "\" not found in features"));
        }
        if (!comparisonExists) {
            throw new Error("Comparison field \"".concat(data.comparisonField, "\" not found in features"));
        }
        console.log('[CorrViz ValidateData] Field validation successful:', {
            primaryField: data.primaryField,
            comparisonField: data.comparisonField
        });
    };
    /**
     * Process raw features to ArcGIS Graphics with proper attributes and geometry
     * Following SingleLayerVisualization pattern
     */
    CorrelationVisualization.prototype.processFeatures = function (features) {
        return __awaiter(this, void 0, void 0, function () {
            var primaryFeatures, comparisonFeatures, primaryMap, comparisonMap, commonIds, targetSR, result, _loop_1, this_1, _i, commonIds_1, id;
            var _this = this;
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        console.log("[CorrViz processFeatures] Processing ".concat(features.length, " features (primaryField=").concat((_a = this.data) === null || _a === void 0 ? void 0 : _a.primaryField, ", comparisonField=").concat((_b = this.data) === null || _b === void 0 ? void 0 : _b.comparisonField, ")"));
                        if (!((_c = this.data) === null || _c === void 0 ? void 0 : _c.primaryField) || !((_d = this.data) === null || _d === void 0 ? void 0 : _d.comparisonField)) {
                            console.error('[CorrViz processFeatures] Missing correlation data fields');
                            return [2 /*return*/, []];
                        }
                        primaryFeatures = features.filter(function (f) { var _a; return ((_a = f.attributes) === null || _a === void 0 ? void 0 : _a._layerId) === _this.data.layerId; });
                        comparisonFeatures = features.filter(function (f) { var _a; return ((_a = f.attributes) === null || _a === void 0 ? void 0 : _a._layerId) !== _this.data.layerId; });
                        console.log('[CorrViz processFeatures] Layer split counts:', {
                            primary: primaryFeatures.length,
                            comparison: comparisonFeatures.length
                        });
                        primaryMap = new Map();
                        primaryFeatures.forEach(function (f) {
                            var key = String(f.attributes.ID);
                            if (key)
                                primaryMap.set(key, f);
                        });
                        comparisonMap = new Map();
                        comparisonFeatures.forEach(function (f) {
                            var key = String(f.attributes.ID);
                            if (key)
                                comparisonMap.set(key, f);
                        });
                        commonIds = __spreadArray([], primaryMap.keys(), true).filter(function (id) { return comparisonMap.has(id); });
                        console.log('[CorrViz processFeatures] Common ID count:', commonIds.length);
                        targetSR = new SpatialReference_1.default({ wkid: 102100 });
                        if (projection.isLoaded()) return [3 /*break*/, 2];
                        return [4 /*yield*/, projection.load()];
                    case 1:
                        _f.sent();
                        _f.label = 2;
                    case 2:
                        result = [];
                        _loop_1 = function (id) {
                            var pf, cf, v1, v2, geom, pg, _g, attrs;
                            var _h;
                            return __generator(this, function (_j) {
                                switch (_j.label) {
                                    case 0:
                                        pf = primaryMap.get(id);
                                        cf = comparisonMap.get(id);
                                        v1 = this_1.parseNumericValue(pf.attributes[this_1.data.primaryField], this_1.data.primaryField, 0);
                                        v2 = this_1.parseNumericValue(cf.attributes[this_1.data.comparisonField], this_1.data.comparisonField, 0);
                                        if (v1 == null || v2 == null)
                                            return [2 /*return*/, "continue"];
                                        geom = pf.geometry;
                                        if (!(((_e = geom.spatialReference) === null || _e === void 0 ? void 0 : _e.wkid) !== targetSR.wkid)) return [3 /*break*/, 4];
                                        _j.label = 1;
                                    case 1:
                                        _j.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, projection.project(geom, targetSR)];
                                    case 2:
                                        pg = _j.sent();
                                        geom = Array.isArray(pg) ? pg[0] : pg;
                                        return [3 /*break*/, 4];
                                    case 3:
                                        _g = _j.sent();
                                        return [2 /*return*/, "continue"];
                                    case 4:
                                        if (!geom)
                                            return [2 /*return*/, "continue"];
                                        attrs = (_h = {
                                                OBJECTID: result.length + 1
                                            },
                                            _h[this_1.data.primaryField] = v1,
                                            _h[this_1.data.comparisonField] = v2,
                                            _h.ID = id,
                                            _h);
                                        // Copy identifier fields from primary
                                        ['FEDNAME', 'CSDNAME', 'CFSAUID', 'PRNAME', 'DESCRIPTION'].forEach(function (fld) {
                                            if (pf.attributes[fld] !== undefined)
                                                attrs[fld] = pf.attributes[fld];
                                        });
                                        result.push(new Graphic_1.default({ geometry: geom, attributes: attrs }));
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, commonIds_1 = commonIds;
                        _f.label = 3;
                    case 3:
                        if (!(_i < commonIds_1.length)) return [3 /*break*/, 6];
                        id = commonIds_1[_i];
                        return [5 /*yield**/, _loop_1(id)];
                    case 4:
                        _f.sent();
                        _f.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        console.log("[CorrViz processFeatures] Created ".concat(result.length, " graphics from ").concat(features.length, " features"));
                        return [2 /*return*/, result];
                }
            });
        });
    };
    // Helper to parse numeric values safely
    CorrelationVisualization.prototype.parseNumericValue = function (value, fieldName, index) {
        if (value === null || value === undefined) {
            return null;
        }
        if (typeof value === 'number' && (0, lodash_1.isFinite)(value)) {
            return value;
        }
        if (typeof value === 'string') {
            var noDataStrings = ["", " ", "N/A", "NA", "-", "--", "null", "undefined"];
            var trimmedValue = value.trim();
            if (noDataStrings.includes(trimmedValue)) {
                return null;
            }
            var parsed = parseFloat(trimmedValue.replace(/,/g, ''));
            if (!isNaN(parsed) && (0, lodash_1.isFinite)(parsed)) {
                return parsed;
            }
        }
        return null;
    };
    CorrelationVisualization.prototype.calculateCorrelationScores = function (features, // Expects processed Graphics
    field1, field2) {
        var _this = this;
        console.log('[CorrViz CalcScores] Starting R-tree spatial clustering for correlation calculation');
        var startTime = performance.now();
        // Extract numeric values, explicitly filtering non-finite numbers
        var primaryValues = features.map(function (f) { return f.attributes[field1]; })
            .filter(function (v) { return typeof v === 'number' && (0, lodash_1.isFinite)(v); });
        var comparisonValues = features.map(function (f) { return f.attributes[field2]; })
            .filter(function (v) { return typeof v === 'number' && (0, lodash_1.isFinite)(v); });
        if (primaryValues.length === 0 || comparisonValues.length === 0) {
            console.warn('[CorrViz CalcScores] Not enough valid data in one or both fields.');
            // Return array of nulls if insufficient data
            return features.map(function () { return null; });
        }
        // Calculate stats based *only* on valid, finite numbers
        var meanPrimary = primaryValues.reduce(function (sum, v) { return sum + v; }, 0) / primaryValues.length;
        var stdDevPrimary = Math.sqrt(primaryValues.reduce(function (sum, v) { return sum + Math.pow(v - meanPrimary, 2); }, 0) / primaryValues.length) || 1;
        var meanComparison = comparisonValues.reduce(function (sum, v) { return sum + v; }, 0) / comparisonValues.length;
        var stdDevComparison = Math.sqrt(comparisonValues.reduce(function (sum, v) { return sum + Math.pow(v - meanComparison, 2); }, 0) / comparisonValues.length) || 1;
        // Calculate global correlation using only features that have valid pairs
        var validPairs = features
            .map(function (f) { return ({ p: f.attributes[field1], c: f.attributes[field2] }); })
            .filter(function (pair) {
            return typeof pair.p === 'number' && (0, lodash_1.isFinite)(pair.p) &&
                typeof pair.c === 'number' && (0, lodash_1.isFinite)(pair.c);
        });
        var globalCorrelation = this.calculatePearsonCorrelation(validPairs.map(function (pair) { return pair.p; }), // Safe cast after filter
        validPairs.map(function (pair) { return pair.c; }) // Safe cast after filter
        );
        var validGlobalCorrelation = (0, lodash_1.isFinite)(globalCorrelation) ? globalCorrelation : 0;
        // Build R-tree spatial index for fast proximity queries
        // This significantly improves performance for 4,000+ zip code polygons
        var spatialIndex = new rbush_1.default();
        var featuresWithCentroids = [];
        // First pass: calculate centroids and build index
        features.forEach(function (feature, index) {
            if (!feature.geometry)
                return;
            try {
                // For polygons, use polygon centroid; for points, use point coordinates
                var centroid = void 0;
                if (feature.geometry.type === "polygon") {
                    // Get polygon centroid using standard ArcGIS methods
                    var polygonGeom = feature.geometry;
                    if (polygonGeom.centroid) {
                        centroid = { x: polygonGeom.centroid.x, y: polygonGeom.centroid.y };
                    }
                    else {
                        // Fallback to extent center if centroid not available
                        var extent = polygonGeom.extent;
                        centroid = { x: (extent.xmin + extent.xmax) / 2, y: (extent.ymin + extent.ymax) / 2 };
                    }
                }
                else if (feature.geometry.type === "point") {
                    centroid = { x: feature.geometry.x, y: feature.geometry.y };
                }
                else {
                    // For other geometry types, calculate a simple centroid from extent
                    var extent = feature.geometry.extent;
                    if (!extent)
                        return;
                    centroid = {
                        x: (extent.xmin + extent.xmax) / 2,
                        y: (extent.ymin + extent.ymax) / 2
                    };
                }
                featuresWithCentroids.push({ feature: feature, centroid: centroid, index: index });
                // Add to spatial index
                spatialIndex.insert({
                    minX: centroid.x,
                    minY: centroid.y,
                    maxX: centroid.x,
                    maxY: centroid.y,
                    feature: feature,
                    index: index
                });
            }
            catch (error) {
                console.warn("[CorrViz CalcScores] Error calculating centroid for feature ".concat(index, ":"), error);
            }
        });
        console.log("[CorrViz CalcScores] Built spatial index with ".concat(featuresWithCentroids.length, " features"));
        // Define radius for local clusters (2000 meters for zip code clusters)
        var proximityRadius = 2000; // In meters (for Web Mercator)
        // Calculate local correlation score for each original feature
        var scores = features.map(function (feature, featureIndex) {
            var primaryVal = feature.attributes[field1];
            var comparisonVal = feature.attributes[field2];
            // Check if both current values are valid numbers and std devs are valid
            if (typeof primaryVal === 'number' && (0, lodash_1.isFinite)(primaryVal) &&
                typeof comparisonVal === 'number' && (0, lodash_1.isFinite)(comparisonVal) &&
                stdDevPrimary > 0 && stdDevComparison > 0 &&
                feature.geometry) {
                // Find centroid data for current feature
                var featureWithCentroid = featuresWithCentroids.find(function (f) { return f.index === featureIndex; });
                if (!featureWithCentroid)
                    return null;
                // Find nearby features using R-tree spatial index (much faster than brute force)
                var nearbyFeatures = spatialIndex.search({
                    minX: featureWithCentroid.centroid.x - proximityRadius,
                    minY: featureWithCentroid.centroid.y - proximityRadius,
                    maxX: featureWithCentroid.centroid.x + proximityRadius,
                    maxY: featureWithCentroid.centroid.y + proximityRadius
                });
                // Calculate local correlation using nearby features
                if (nearbyFeatures.length > 3) { // Require minimum 3 nearby features for stability
                    // Extract values from nearby features that have valid values
                    var localPrimaryValues_1 = [];
                    var localComparisonValues_1 = [];
                    nearbyFeatures.forEach(function (item) {
                        var f = item.feature;
                        var p = f.attributes[field1];
                        var c = f.attributes[field2];
                        if (typeof p === 'number' && (0, lodash_1.isFinite)(p) &&
                            typeof c === 'number' && (0, lodash_1.isFinite)(c)) {
                            localPrimaryValues_1.push(p);
                            localComparisonValues_1.push(c);
                        }
                    });
                    // Calculate local correlation if we have enough data points
                    if (localPrimaryValues_1.length >= 3) {
                        var localCorrelation_1 = _this.calculatePearsonCorrelation(localPrimaryValues_1, localComparisonValues_1);
                        // Blend local and global correlation
                        // Weight is based on number of local data points (more points = more weight to local)
                        var localWeight = Math.min(0.8, localPrimaryValues_1.length / 20);
                        var globalWeight = 1 - localWeight;
                        var score_1 = globalWeight * validGlobalCorrelation + localWeight * localCorrelation_1;
                        var validScore = (0, lodash_1.isFinite)(score_1) ? score_1 : validGlobalCorrelation;
                        // Ensure score is within valid range (-1 to 1)
                        return Math.max(-1, Math.min(1, validScore));
                    }
                }
                // If spatial neighborhood calculation fails, fall back to z-score method
                var zPrimary = (primaryVal - meanPrimary) / stdDevPrimary;
                var zComparison = (comparisonVal - meanComparison) / stdDevComparison;
                var localCorrelation = Math.max(-1, Math.min(1, zPrimary * zComparison / 4)); // Scale and clamp
                // Weighted combination favoring global correlation (more stable fallback)
                var score = 0.7 * validGlobalCorrelation + 0.3 * localCorrelation;
                return (0, lodash_1.isFinite)(score) ? score : validGlobalCorrelation;
            }
            else {
                // Assign null if current data is invalid or stdDevs are zero
                return null;
            }
        });
        var endTime = performance.now();
        console.log("[CorrViz CalcScores] R-tree spatial correlation calculation completed in ".concat(Math.round(endTime - startTime), "ms"));
        return scores;
    };
    CorrelationVisualization.prototype.calculatePearsonCorrelation = function (x, y) {
        if (x.length !== y.length || x.length === 0) {
            return 0; // Return 0 if arrays are mismatched or empty
        }
        var n = x.length;
        var sumX = x.reduce(function (a, b) { return a + b; }, 0);
        var sumY = y.reduce(function (a, b) { return a + b; }, 0);
        var sumXY = x.reduce(function (sum, val, i) { return sum + val * y[i]; }, 0);
        var sumX2 = x.reduce(function (sum, val) { return sum + val * val; }, 0);
        var sumY2 = y.reduce(function (sum, val) { return sum + val * val; }, 0);
        var numerator = n * sumXY - sumX * sumY;
        var denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        return denominator === 0 ? 0 : numerator / denominator;
    };
    /**
     * Process microservice response into correlation visualization data
     * @param response The response from the microservice
     * @returns Processed data ready for correlation visualization
     * @throws Error if response is invalid or malformed
     */
    CorrelationVisualization.prototype.processMicroserviceResponse = function (response) {
        // Check if response is an error
        if ((0, microservice_types_1.isMicroserviceError)(response)) {
            throw new Error("Microservice error: ".concat(response.error, " (").concat(response.error_type, ")"));
        }
        // Validate response structure
        if (!(0, microservice_types_1.isValidMicroserviceResponse)(response)) {
            throw new Error('Invalid microservice response format');
        }
        // Convert response to visualization data
        var data = (0, microservice_types_1.convertToVisualizationData)(response);
        // Create features array from predictions and SHAP values
        var features = data.predictions.map(function (prediction, index) {
            // Calculate correlation metrics using SHAP values
            var shapValues = data.shapValues[index] || [];
            var totalImpact = shapValues.reduce(function (sum, val) { return sum + Math.abs(val); }, 0);
            return {
                attributes: __assign({ OBJECTID: index + 1, primary_value: prediction, comparison_value: totalImpact, correlation_strength: Math.abs(prediction - totalImpact) }, Object.fromEntries(data.featureNames.map(function (name, i) { return [
                    "shap_".concat(name),
                    shapValues[i] || 0
                ]; })))
            };
        });
        var layerId = "correlation-".concat(Date.now());
        return {
            features: features,
            layerName: "Correlation Analysis (".concat(data.modelType, ")"),
            primaryField: 'primary_value',
            comparisonField: 'comparison_value',
            layerId: layerId,
            layerConfig: {
                type: 'point',
                symbolConfig: {
                    color: [255, 255, 255, 0.5],
                    shape: 'circle',
                    outline: {
                        color: [0, 0, 0, 0.5],
                        width: 1
                    }
                },
                id: layerId,
                name: "Correlation Analysis (".concat(data.modelType, ")"),
                url: '', // Required by BaseLayerConfig
                status: 'active', // Required by BaseLayerConfig
                geographicType: 'custom', // Required by BaseLayerConfig
                geographicLevel: 'local', // Required by BaseLayerConfig
                group: 'analysis', // Required by BaseLayerConfig
                metadata: {
                    provider: 'microservice',
                    updateFrequency: 'realtime',
                    geographicType: 'custom',
                    geographicLevel: 'local'
                },
                processing: {}, // Required by BaseLayerConfig
                caching: {}, // Required by BaseLayerConfig
                performance: {}, // Required by BaseLayerConfig
                security: {
                    requiresAuthentication: false,
                    accessLevels: ['read']
                },
                fields: __spreadArray([
                    { name: 'OBJECTID', type: 'oid' },
                    { name: 'primary_value', type: 'double' },
                    { name: 'comparison_value', type: 'double' },
                    { name: 'correlation_strength', type: 'double' }
                ], data.featureNames.map(function (name) { return ({
                    name: "shap_".concat(name),
                    type: 'double'
                }); }), true)
            }
        };
    };
    /**
     * Create correlation visualization from microservice response
     * @param response The response from the microservice
     * @param options Visualization options
     */
    CorrelationVisualization.prototype.createFromMicroservice = function (response, options) {
        return __awaiter(this, void 0, void 0, function () {
            var data, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        data = this.processMicroserviceResponse(response);
                        return [4 /*yield*/, this.create(data, options)];
                    case 1:
                        result = _a.sent();
                        // Apply popup template if provided
                        if (result.layer && (options === null || options === void 0 ? void 0 : options.popupConfig)) {
                            result.layer.popupTemplate = (0, popup_utils_1.createPopupTemplateFromConfig)(options.popupConfig);
                        }
                        return [2 /*return*/, result];
                    case 2:
                        error_1 = _a.sent();
                        console.error('[CorrelationViz] Error processing microservice response:', error_1);
                        return [2 /*return*/, { layer: null, extent: null }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create method for generating correlation visualization
     * Following the same pattern as SingleLayerVisualization for consistency
     */
    CorrelationVisualization.prototype.create = function (data_1) {
        return __awaiter(this, arguments, void 0, function (data, options) {
            var startTime, processedGraphics, correlationScores_1, validScores, graphicsWithScores, sortedGraphics, top25Percent, topGraphics, layerTitle, objectIdField, geometryType, fields, firstGraphicAttrs, idFields, _loop_2, _i, idFields_1, idField, layer, rendererResult, geometriesToUnion, _a, extentError_1, endTime, error_2;
            var _b, _c, _d, _e, _f, _g, _h, _j;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        startTime = performance.now();
                        console.log('[CorrViz Create] Starting correlation visualization', {
                            featureCount: (_b = data.features) === null || _b === void 0 ? void 0 : _b.length,
                            primaryField: data.primaryField,
                            comparisonField: data.comparisonField,
                            layerId: data.layerId
                        });
                        // Store input data and options
                        this.data = data;
                        this.options = options;
                        // --- 1. Basic validation ---
                        if (!data.features || data.features.length === 0) {
                            console.warn('[CorrViz Create] No input features provided, returning empty result');
                            return [2 /*return*/, { layer: null, extent: null }];
                        }
                        if (!data.primaryField || !data.comparisonField) {
                            console.error('[CorrViz Create] Missing required fields: primaryField or comparisonField');
                            return [2 /*return*/, { layer: null, extent: null }];
                        }
                        _k.label = 1;
                    case 1:
                        _k.trys.push([1, 9, , 10]);
                        // --- 2. Process features into ArcGIS graphics ---
                        console.log('[CorrViz Create] Processing features into ArcGIS graphics');
                        return [4 /*yield*/, this.processFeatures(data.features)];
                    case 2:
                        processedGraphics = _k.sent();
                        if (processedGraphics.length === 0) {
                            console.warn('[CorrViz Create] No valid graphics after processing, returning empty result');
                            return [2 /*return*/, { layer: null, extent: null }];
                        }
                        console.log("[CorrViz Create] Processed ".concat(processedGraphics.length, " valid graphics from ").concat(data.features.length, " input features"));
                        correlationScores_1 = this.calculateCorrelationScores(processedGraphics, data.primaryField, data.comparisonField);
                        validScores = correlationScores_1.filter(function (score) { return score !== null; });
                        console.log('[CorrViz Create] Correlation statistics:', {
                            totalScores: correlationScores_1.length,
                            validScores: validScores.length,
                            min: validScores.length > 0 ? Math.min.apply(Math, validScores).toFixed(4) : 'N/A',
                            max: validScores.length > 0 ? Math.max.apply(Math, validScores).toFixed(4) : 'N/A',
                            average: validScores.length > 0 ? (validScores.reduce(function (sum, val) { return sum + val; }, 0) / validScores.length).toFixed(4) : 'N/A'
                        });
                        graphicsWithScores = processedGraphics
                            .map(function (graphic, i) {
                            var score = correlationScores_1[i];
                            if (score !== null) {
                                return new Graphic_1.default({
                                    geometry: graphic.geometry,
                                    attributes: __assign(__assign({}, graphic.attributes), { correlation_score: parseFloat(score.toFixed(4)) })
                                });
                            }
                            return null;
                        })
                            .filter(function (g) { return g !== null; });
                        console.log("[CorrViz Create] Found ".concat(graphicsWithScores.length, " features with valid correlation scores"));
                        // If no features have valid scores, return empty result
                        if (graphicsWithScores.length === 0) {
                            console.warn('[CorrViz Create] No features with valid correlation scores');
                            return [2 /*return*/, { layer: null, extent: null }];
                        }
                        sortedGraphics = __spreadArray([], graphicsWithScores, true).sort(function (a, b) {
                            return Math.abs(b.attributes.correlation_score) - Math.abs(a.attributes.correlation_score);
                        });
                        top25Percent = Math.ceil(sortedGraphics.length * 0.25);
                        topGraphics = sortedGraphics.slice(0, top25Percent);
                        console.log("[CorrViz Create] Filtered to top ".concat(topGraphics.length, " features (25%) with strongest correlations"));
                        layerTitle = options.title || "Correlation: ".concat(data.primaryField, " vs ").concat(data.comparisonField);
                        objectIdField = "OBJECTID";
                        geometryType = (_c = topGraphics[0].geometry) === null || _c === void 0 ? void 0 : _c.type;
                        console.log("[CorrViz Create] Creating layer with ".concat(topGraphics.length, " features. Geometry type: ").concat(geometryType));
                        fields = [
                            { name: objectIdField, alias: 'Object ID', type: 'oid' },
                            { name: 'correlation_score', alias: 'Correlation Score', type: 'double' },
                            { name: data.primaryField, alias: data.primaryField, type: 'double' },
                            { name: data.comparisonField, alias: data.comparisonField, type: 'double' }
                        ];
                        firstGraphicAttrs = topGraphics[0].attributes;
                        idFields = ['FEDNAME', 'CSDNAME', 'CFSAUID', 'PRNAME', 'ID', 'ZIPCODE', 'DESCRIPTION'];
                        _loop_2 = function (idField) {
                            if (firstGraphicAttrs.hasOwnProperty(idField) && !fields.some(function (f) { return f.name === idField; })) {
                                fields.push({
                                    name: idField,
                                    alias: idField,
                                    type: typeof firstGraphicAttrs[idField] === 'string' ? 'string' : 'double'
                                });
                            }
                        };
                        for (_i = 0, idFields_1 = idFields; _i < idFields_1.length; _i++) {
                            idField = idFields_1[_i];
                            _loop_2(idField);
                        }
                        layer = new FeatureLayer_1.default({
                            source: topGraphics, // Use top 25% of features
                            objectIdField: objectIdField,
                            fields: fields,
                            title: layerTitle,
                            geometryType: geometryType,
                            spatialReference: (_d = topGraphics[0].geometry) === null || _d === void 0 ? void 0 : _d.spatialReference
                        });
                        return [4 /*yield*/, (0, createQuartileRenderer_1.createQuartileRenderer)({
                                layer: layer,
                                field: 'correlation_score',
                                colorStops: [
                                    [239, 59, 44], // red (strong negative)
                                    [255, 127, 0], // orange (weak negative)
                                    [158, 215, 152], // light green (weak positive)
                                    [49, 163, 84] // green (strong positive)
                                ],
                                opacity: 0.7,
                                outlineWidth: 0.5,
                                outlineColor: [128, 128, 128]
                            })];
                    case 3:
                        rendererResult = _k.sent();
                        if (rendererResult) {
                            layer.renderer = rendererResult.renderer;
                            this.renderer = rendererResult.renderer;
                        }
                        // Store the layer in the instance
                        this.layer = layer;
                        // CRITICAL FIX: Store a reference to this visualization on the layer
                        // This allows MapApp to find the visualization and get legend info
                        this.layer.set('visualization', this);
                        // --- 6. Calculate extent ---
                        console.log('[CorrViz Create] Calculating extent');
                        _k.label = 4;
                    case 4:
                        _k.trys.push([4, 7, , 8]);
                        geometriesToUnion = topGraphics
                            .map(function (g) { return g.geometry; })
                            .filter(function (g) { return g != null; });
                        if (!(geometriesToUnion.length > 0)) return [3 /*break*/, 6];
                        _a = this;
                        return [4 /*yield*/, geometryEngineAsync.union(geometriesToUnion)];
                    case 5:
                        _a.extent = ((_e = (_k.sent())) === null || _e === void 0 ? void 0 : _e.extent) || null;
                        _k.label = 6;
                    case 6:
                        console.log('[CorrViz Create] Extent calculation result:', this.extent ? {
                            xmin: (_f = this.extent.xmin) === null || _f === void 0 ? void 0 : _f.toFixed(2),
                            ymin: (_g = this.extent.ymin) === null || _g === void 0 ? void 0 : _g.toFixed(2),
                            xmax: (_h = this.extent.xmax) === null || _h === void 0 ? void 0 : _h.toFixed(2),
                            ymax: (_j = this.extent.ymax) === null || _j === void 0 ? void 0 : _j.toFixed(2),
                            valid: _super.prototype.isValidExtent.call(this, this.extent)
                        } : 'null');
                        return [3 /*break*/, 8];
                    case 7:
                        extentError_1 = _k.sent();
                        console.error('[CorrViz Create] Error calculating extent:', extentError_1);
                        this.extent = null;
                        return [3 /*break*/, 8];
                    case 8:
                        // --- 7. Apply popup template ---
                        if (layer) {
                            this.applyPopupTemplate(layer, options === null || options === void 0 ? void 0 : options.popupConfig);
                            console.log('[CorrViz Create] Applied popup template');
                        }
                        endTime = performance.now();
                        console.log("[CorrViz Create] Correlation visualization completed in ".concat(Math.round(endTime - startTime), "ms"));
                        return [2 /*return*/, {
                                layer: this.layer,
                                extent: this.extent,
                                renderer: this.renderer,
                                legendInfo: this.getLegendInfo()
                            }];
                    case 9:
                        error_2 = _k.sent();
                        console.error('[CorrViz Create] Error creating correlation visualization:', error_2);
                        return [2 /*return*/, { layer: null, extent: null }];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    CorrelationVisualization.prototype.getLegendInfo = function () {
        var _a, _b, _c, _d, _e;
        var items = ((_a = this.renderer.classBreakInfos) === null || _a === void 0 ? void 0 : _a.map(function (info) {
            var _a;
            var symbol = info.symbol;
            return {
                label: info.label || "".concat(info.minValue, " to ").concat(info.maxValue),
                color: (0, legend_1.colorToRgba)(symbol.color),
                outlineColor: 'outline' in symbol && ((_a = symbol.outline) === null || _a === void 0 ? void 0 : _a.color)
                    ? (0, legend_1.colorToRgba)(symbol.outline.color)
                    : undefined,
                shape: (0, legend_1.getSymbolShape)(symbol),
                size: (0, legend_1.getSymbolSize)(symbol)
            };
        })) || [];
        // Get the actual layer names from the data
        var primaryLayerName = ((_c = (_b = this.data) === null || _b === void 0 ? void 0 : _b.layerConfig) === null || _c === void 0 ? void 0 : _c.name) || ((_d = this.data) === null || _d === void 0 ? void 0 : _d.primaryField) || 'Primary Layer';
        var comparisonLayerName = ((_e = this.data) === null || _e === void 0 ? void 0 : _e.comparisonField) || 'Comparison Layer';
        return {
            title: "Correlation: ".concat(primaryLayerName, " vs ").concat(comparisonLayerName),
            type: "class-breaks",
            description: this.data ? "Correlation between ".concat(primaryLayerName, " and ").concat(comparisonLayerName) : "",
            items: items
        };
    };
    return CorrelationVisualization;
}(base_visualization_1.BaseVisualization));
exports.CorrelationVisualization = CorrelationVisualization;
