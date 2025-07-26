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
exports.JointHighVisualization = void 0;
var FeatureLayer_1 = require("@arcgis/core/layers/FeatureLayer");
var SimpleFillSymbol_1 = require("@arcgis/core/symbols/SimpleFillSymbol");
var base_visualization_1 = require("./base-visualization");
var Graphic_1 = require("@arcgis/core/Graphic");
var legend_1 = require("@/types/legend");
var SpatialReference_1 = require("@arcgis/core/geometry/SpatialReference");
var projection = require("@arcgis/core/geometry/projection");
var geometryEngineAsync = require("@arcgis/core/geometry/geometryEngineAsync");
var ClassBreaksRenderer_1 = require("@arcgis/core/renderers/ClassBreaksRenderer");
var createQuartileRenderer_1 = require("../createQuartileRenderer");
var lodash_1 = require("lodash");
var JointHighVisualization = /** @class */ (function (_super) {
    __extends(JointHighVisualization, _super);
    function JointHighVisualization() {
        var _this = _super.call(this) || this;
        _this.data = null;
        _this.options = {};
        _this.renderer = new ClassBreaksRenderer_1.default({
            field: "joint_score",
            classBreakInfos: [
                {
                    minValue: 0,
                    maxValue: 0.25,
                    symbol: new SimpleFillSymbol_1.default({
                        color: [239, 59, 44, 0.7], // red
                        outline: { color: [128, 128, 128, 0.5], width: 0.5 }
                    }),
                    label: "Low"
                },
                {
                    minValue: 0.25,
                    maxValue: 0.5,
                    symbol: new SimpleFillSymbol_1.default({
                        color: [255, 127, 0, 0.7], // orange
                        outline: { color: [128, 128, 128, 0.5], width: 0.5 }
                    }),
                    label: "Medium"
                },
                {
                    minValue: 0.5,
                    maxValue: 0.75,
                    symbol: new SimpleFillSymbol_1.default({
                        color: [158, 215, 152, 0.7], // light green
                        outline: { color: [128, 128, 128, 0.5], width: 0.5 }
                    }),
                    label: "High"
                },
                {
                    minValue: 0.75,
                    maxValue: 1,
                    symbol: new SimpleFillSymbol_1.default({
                        color: [49, 163, 84, 0.7], // green
                        outline: { color: [128, 128, 128, 0.5], width: 0.5 }
                    }),
                    label: "Very High"
                }
            ],
            legendOptions: {
                title: "Joint Score"
            },
            defaultSymbol: new SimpleFillSymbol_1.default({
                color: [200, 200, 200, 0.5],
                outline: { color: [150, 150, 150, 0.5], width: 0.5 }
            }),
            defaultLabel: "No Data"
        });
        return _this;
    }
    // Override the base validateData method
    JointHighVisualization.prototype.validateData = function (data) {
        var _a;
        console.log('[JointHighViz ValidateData] Validating joint high input data:', {
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
            console.warn('[JointHighViz ValidateData] No features provided for validation.');
            return;
        }
        var sampleFeature = data.features[0];
        console.log('[JointHighViz ValidateData] Sample feature attributes:', {
            availableFields: Object.keys(sampleFeature.attributes || {}),
            primaryField: data.primaryField,
            comparisonField: data.comparisonField
        });
        // Validate that fields exist in features
        var primaryExists = data.features.some(function (f) {
            var attrs = f.attributes || {};
            var exists = attrs[data.primaryField] !== undefined;
            if (!exists) {
                console.warn("[JointHighViz ValidateData] Primary field \"".concat(data.primaryField, "\" not found in feature. Available fields:"), Object.keys(attrs));
            }
            return exists;
        });
        var comparisonExists = data.features.some(function (f) {
            var attrs = f.attributes || {};
            var exists = attrs[data.comparisonField] !== undefined;
            if (!exists) {
                console.warn("[JointHighViz ValidateData] Comparison field \"".concat(data.comparisonField, "\" not found in feature. Available fields:"), Object.keys(attrs));
            }
            return exists;
        });
        if (!primaryExists) {
            throw new Error("Primary field \"".concat(data.primaryField, "\" not found in features"));
        }
        if (!comparisonExists) {
            throw new Error("Comparison field \"".concat(data.comparisonField, "\" not found in features"));
        }
        console.log('[JointHighViz ValidateData] Field validation successful:', {
            primaryField: data.primaryField,
            comparisonField: data.comparisonField
        });
    };
    JointHighVisualization.prototype.processFeatures = function (features) {
        return __awaiter(this, void 0, void 0, function () {
            var targetSR, validScores, _i, features_1, feature, attrs, primaryValue, comparisonValue, jointScore, top25Percent, topFeatures, result, idx, _loop_1, this_1, _a, topFeatures_1, _b, feature, score;
            var _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        console.log("[JointHighViz processFeatures] Processing ".concat(features.length, " features (primaryField=").concat((_c = this.data) === null || _c === void 0 ? void 0 : _c.primaryField, ", comparisonField=").concat((_d = this.data) === null || _d === void 0 ? void 0 : _d.comparisonField, ")"));
                        if (!((_e = this.data) === null || _e === void 0 ? void 0 : _e.primaryField) || !((_f = this.data) === null || _f === void 0 ? void 0 : _f.comparisonField)) {
                            console.error('[JointHighViz processFeatures] Missing joint high data fields');
                            return [2 /*return*/, []];
                        }
                        targetSR = new SpatialReference_1.default({ wkid: 102100 });
                        if (projection.isLoaded()) return [3 /*break*/, 2];
                        return [4 /*yield*/, projection.load()];
                    case 1:
                        _h.sent();
                        _h.label = 2;
                    case 2:
                        validScores = [];
                        for (_i = 0, features_1 = features; _i < features_1.length; _i++) {
                            feature = features_1[_i];
                            attrs = __assign(__assign({}, (feature.attributes || {})), (feature.properties || {}));
                            primaryValue = this.parseNumericValue(attrs[this.data.primaryField], this.data.primaryField, 0);
                            comparisonValue = this.parseNumericValue(attrs[this.data.comparisonField], this.data.comparisonField, 0);
                            if (primaryValue == null || comparisonValue == null)
                                continue;
                            jointScore = (primaryValue + comparisonValue) / 2;
                            validScores.push({ feature: feature, score: jointScore });
                        }
                        if (validScores.length === 0) {
                            console.warn('[JointHighViz processFeatures] No valid scores found');
                            return [2 /*return*/, []];
                        }
                        // Sort by score and take top 25%
                        validScores.sort(function (a, b) { return b.score - a.score; });
                        top25Percent = Math.ceil(validScores.length * 0.25);
                        topFeatures = validScores.slice(0, top25Percent);
                        console.log("[JointHighViz processFeatures] Filtered to top ".concat(topFeatures.length, " features (25%)"));
                        result = [];
                        idx = 1;
                        _loop_1 = function (feature, score) {
                            var geom, pg, _j, attrs, outputAttrs;
                            var _k;
                            return __generator(this, function (_l) {
                                switch (_l.label) {
                                    case 0:
                                        geom = feature.geometry;
                                        if (!(((_g = geom.spatialReference) === null || _g === void 0 ? void 0 : _g.wkid) !== targetSR.wkid)) return [3 /*break*/, 4];
                                        _l.label = 1;
                                    case 1:
                                        _l.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, projection.project(geom, targetSR)];
                                    case 2:
                                        pg = _l.sent();
                                        geom = Array.isArray(pg) ? pg[0] : pg;
                                        return [3 /*break*/, 4];
                                    case 3:
                                        _j = _l.sent();
                                        return [2 /*return*/, "continue"];
                                    case 4:
                                        if (!geom)
                                            return [2 /*return*/, "continue"];
                                        attrs = __assign(__assign({}, (feature.attributes || {})), (feature.properties || {}));
                                        outputAttrs = (_k = {
                                                OBJECTID: idx++
                                            },
                                            _k[this_1.data.primaryField] = this_1.parseNumericValue(attrs[this_1.data.primaryField], this_1.data.primaryField, 0),
                                            _k[this_1.data.comparisonField] = this_1.parseNumericValue(attrs[this_1.data.comparisonField], this_1.data.comparisonField, 0),
                                            _k.joint_score = score,
                                            _k);
                                        // Copy identifier fields if they exist
                                        ['FEDNAME', 'CSDNAME', 'CFSAUID', 'PRNAME', 'DESCRIPTION'].forEach(function (fld) {
                                            if (attrs[fld] !== undefined)
                                                outputAttrs[fld] = attrs[fld];
                                        });
                                        result.push(new Graphic_1.default({
                                            geometry: geom,
                                            attributes: outputAttrs
                                        }));
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _a = 0, topFeatures_1 = topFeatures;
                        _h.label = 3;
                    case 3:
                        if (!(_a < topFeatures_1.length)) return [3 /*break*/, 6];
                        _b = topFeatures_1[_a], feature = _b.feature, score = _b.score;
                        return [5 /*yield**/, _loop_1(feature, score)];
                    case 4:
                        _h.sent();
                        _h.label = 5;
                    case 5:
                        _a++;
                        return [3 /*break*/, 3];
                    case 6:
                        console.log("[JointHighViz processFeatures] Created ".concat(result.length, " graphics from ").concat(features.length, " features"));
                        return [2 /*return*/, result];
                }
            });
        });
    };
    JointHighVisualization.prototype.parseNumericValue = function (value, fieldName, index) {
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
    JointHighVisualization.prototype.create = function (data_1) {
        return __awaiter(this, arguments, void 0, function (data, options) {
            var startTime, processedGraphics, sortedGraphics, top25Percent, topGraphics, layerTitle, objectIdField, geometryType, fields, firstGraphicAttrs, idFields, _loop_2, _i, idFields_1, idField, layer, rendererResult, geometriesToUnion, _a, extentError_1, endTime, error_1;
            var _b, _c, _d, _e, _f, _g, _h, _j;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        startTime = performance.now();
                        console.log('[JointHighViz Create] Starting joint high visualization', {
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
                            console.warn('[JointHighViz Create] No input features provided, returning empty result');
                            return [2 /*return*/, { layer: null, extent: null }];
                        }
                        if (!data.primaryField || !data.comparisonField) {
                            console.error('[JointHighViz Create] Missing required fields: primaryField or comparisonField');
                            return [2 /*return*/, { layer: null, extent: null }];
                        }
                        _k.label = 1;
                    case 1:
                        _k.trys.push([1, 9, , 10]);
                        // --- 2. Process features into ArcGIS graphics ---
                        console.log('[JointHighViz Create] Processing features into ArcGIS graphics');
                        return [4 /*yield*/, this.processFeatures(data.features)];
                    case 2:
                        processedGraphics = _k.sent();
                        if (processedGraphics.length === 0) {
                            console.warn('[JointHighViz Create] No valid graphics after processing, returning empty result');
                            return [2 /*return*/, { layer: null, extent: null }];
                        }
                        console.log("[JointHighViz Create] Processed ".concat(processedGraphics.length, " valid graphics from ").concat(data.features.length, " input features"));
                        sortedGraphics = __spreadArray([], processedGraphics, true).sort(function (a, b) {
                            return b.attributes.joint_score - a.attributes.joint_score;
                        });
                        top25Percent = Math.ceil(sortedGraphics.length * 0.25);
                        topGraphics = sortedGraphics.slice(0, top25Percent);
                        console.log("[JointHighViz Create] Filtered to top ".concat(topGraphics.length, " features (25%) with highest joint scores"));
                        layerTitle = options.title || "Joint High: ".concat(data.primaryField, " & ").concat(data.comparisonField);
                        objectIdField = "OBJECTID";
                        geometryType = (_c = topGraphics[0].geometry) === null || _c === void 0 ? void 0 : _c.type;
                        console.log("[JointHighViz Create] Creating layer with ".concat(topGraphics.length, " features. Geometry type: ").concat(geometryType));
                        fields = [
                            { name: objectIdField, alias: 'Object ID', type: 'oid' },
                            { name: 'joint_score', alias: 'Joint Score', type: 'double' },
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
                                field: 'joint_score',
                                colorStops: [
                                    [239, 59, 44], // red (low)
                                    [255, 127, 0], // orange (medium)
                                    [158, 215, 152], // light green (high)
                                    [49, 163, 84] // green (very high)
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
                        this.layer.set('visualization', this);
                        // --- 4. Calculate extent ---
                        console.log('[JointHighViz Create] Calculating extent');
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
                        console.log('[JointHighViz Create] Extent calculation result:', this.extent ? {
                            xmin: (_f = this.extent.xmin) === null || _f === void 0 ? void 0 : _f.toFixed(2),
                            ymin: (_g = this.extent.ymin) === null || _g === void 0 ? void 0 : _g.toFixed(2),
                            xmax: (_h = this.extent.xmax) === null || _h === void 0 ? void 0 : _h.toFixed(2),
                            ymax: (_j = this.extent.ymax) === null || _j === void 0 ? void 0 : _j.toFixed(2),
                            valid: _super.prototype.isValidExtent.call(this, this.extent)
                        } : 'null');
                        return [3 /*break*/, 8];
                    case 7:
                        extentError_1 = _k.sent();
                        console.error('[JointHighViz Create] Error calculating extent:', extentError_1);
                        this.extent = null;
                        return [3 /*break*/, 8];
                    case 8:
                        endTime = performance.now();
                        console.log("[JointHighViz Create] Joint high visualization completed in ".concat(Math.round(endTime - startTime), "ms"));
                        return [2 /*return*/, {
                                layer: this.layer,
                                extent: this.extent,
                                renderer: this.renderer,
                                legendInfo: this.getLegendInfo()
                            }];
                    case 9:
                        error_1 = _k.sent();
                        console.error('[JointHighViz Create] Error creating joint high visualization:', error_1);
                        return [2 /*return*/, { layer: null, extent: null }];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    JointHighVisualization.prototype.getLegendInfo = function () {
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
            title: "Joint High: ".concat(primaryLayerName, " & ").concat(comparisonLayerName),
            type: "class-breaks",
            description: this.data ? "Average of ".concat(primaryLayerName, " and ").concat(comparisonLayerName) : "",
            items: items
        };
    };
    return JointHighVisualization;
}(base_visualization_1.BaseVisualization));
exports.JointHighVisualization = JointHighVisualization;
exports.default = JointHighVisualization;
