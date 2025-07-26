"use strict";
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
exports.calculateQuantiles = exports.createQuartileRenderer = void 0;
var Color_1 = require("@arcgis/core/Color");
var ClassBreaksRenderer_1 = require("@arcgis/core/renderers/ClassBreaksRenderer");
var SimpleFillSymbol_1 = require("@arcgis/core/symbols/SimpleFillSymbol");
var SimpleMarkerSymbol_1 = require("@arcgis/core/symbols/SimpleMarkerSymbol");
var DEFAULT_COLOR_STOPS = [
    [49, 163, 84], // green
    [158, 215, 152], // light green
    [255, 127, 0], // orange
    [239, 59, 44] // red
];
// Grey color for filtered-out features
var FILTERED_OUT_COLOR = [150, 150, 150]; // Grey
var calculateQuantiles = function (layer_1, field_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([layer_1, field_1], args_1, true), void 0, function (layer, field, options) {
        var _a, excludeZeros, _b, numBreaks, _c, isNormalized, query, featureSet, values, min_1, max_1, breaks, i, index, validIndex, uniqueBreaks, min_2, max_2, error_1;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = options.excludeZeros, excludeZeros = _a === void 0 ? false : _a, _b = options.numBreaks, numBreaks = _b === void 0 ? 4 : _b, _c = options.isNormalized, isNormalized = _c === void 0 ? false : _c;
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 5, , 6]);
                    if (!layer || !field) {
                        console.warn('Invalid layer or field for calculating quantiles');
                        return [2 /*return*/, [25, 50, 75, 100]]; // Default values
                    }
                    if (layer.loaded) return [3 /*break*/, 3];
                    return [4 /*yield*/, layer.load()];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3:
                    query = layer.createQuery();
                    query.where = excludeZeros ? "".concat(field, " > 0") : "1=1";
                    query.outFields = [field];
                    query.returnGeometry = false;
                    return [4 /*yield*/, layer.queryFeatures(query)];
                case 4:
                    featureSet = _d.sent();
                    if (!featureSet || !featureSet.features || featureSet.features.length === 0) {
                        console.warn("No valid features found for field ".concat(field, " when calculating quantiles"));
                        return [2 /*return*/, [25, 50, 75, 100]]; // Default breaks
                    }
                    values = featureSet.features
                        .map(function (f) { return f.attributes[field]; })
                        .filter(function (val) { return val !== null && val !== undefined && !isNaN(val); });
                    // Handle normalization if requested
                    if (isNormalized) {
                        min_1 = Math.min.apply(Math, values);
                        max_1 = Math.max.apply(Math, values);
                        // Normalize to 0-100 scale
                        if (max_1 > min_1) {
                            values = values.map(function (v) { return Math.round(((v - min_1) / (max_1 - min_1)) * 100); });
                        }
                        else {
                            // If all values are the same, normalize based on absolute value
                            values = values.map(function (v) { return v > 0 ? 100 : 0; });
                        }
                    }
                    // Sort values
                    values.sort(function (a, b) { return a - b; });
                    breaks = [];
                    for (i = 1; i <= numBreaks; i++) {
                        index = Math.floor((i / numBreaks) * values.length) - 1;
                        validIndex = Math.max(0, Math.min(index, values.length - 1));
                        breaks.push(values[validIndex]);
                    }
                    // Make sure the last break is the max value
                    if (values.length > 0 && breaks[breaks.length - 1] !== values[values.length - 1]) {
                        breaks[breaks.length - 1] = values[values.length - 1];
                    }
                    uniqueBreaks = __spreadArray([], new Set(breaks), true).sort(function (a, b) { return a - b; });
                    // If we couldn't get enough unique breaks, fill with evenly spaced values
                    if (uniqueBreaks.length < numBreaks) {
                        min_2 = uniqueBreaks[0] || 0;
                        max_2 = uniqueBreaks[uniqueBreaks.length - 1] || 100;
                        return [2 /*return*/, Array.from({ length: numBreaks }, function (_, i) {
                                return Math.round(min_2 + (i + 1) * ((max_2 - min_2) / numBreaks));
                            })];
                    }
                    return [2 /*return*/, uniqueBreaks];
                case 5:
                    error_1 = _d.sent();
                    console.error("Error calculating quantiles for field ".concat(field, ":"), error_1);
                    return [2 /*return*/, [25, 50, 75, 100]]; // Default values
                case 6: return [2 /*return*/];
            }
        });
    });
};
exports.calculateQuantiles = calculateQuantiles;
var createQuartileRenderer = function (config) { return __awaiter(void 0, void 0, void 0, function () {
    var layer, field, _a, colorStops, _b, isCurrency, _c, isCompositeIndex, _d, opacity, _e, outlineWidth, _f, outlineColor, customBreaks, filterField, filterThreshold // New: threshold value for filtering
    , fieldInfo, isGoogleTrendsLayer, breaks, _g, finalBreaks_1, isPointLayer_1, effectiveColorStops_1, lowestCategoryColor, defaultSymbol, createSymbol_1, formatCurrency_1, typedLayer, isCount_1, startLabel_1, endLabel_1, renderer_1, statistics, error_2;
    var _h, _j, _k, _l, _m;
    return __generator(this, function (_o) {
        switch (_o.label) {
            case 0:
                layer = config.layer, field = config.field, _a = config.colorStops, colorStops = _a === void 0 ? DEFAULT_COLOR_STOPS : _a, _b = config.isCurrency, isCurrency = _b === void 0 ? false : _b, _c = config.isCompositeIndex, isCompositeIndex = _c === void 0 ? false : _c, _d = config.opacity, opacity = _d === void 0 ? 0.7 : _d, _e = config.outlineWidth, outlineWidth = _e === void 0 ? 0.5 : _e, _f = config.outlineColor, outlineColor = _f === void 0 ? [128, 128, 128] : _f, customBreaks = config.customBreaks, filterField = config.filterField, filterThreshold = config.filterThreshold;
                if (!layer || !field) {
                    console.warn('Invalid inputs for renderer creation');
                    return [2 /*return*/, null];
                }
                _o.label = 1;
            case 1:
                _o.trys.push([1, 6, , 7]);
                if (layer.loaded) return [3 /*break*/, 3];
                return [4 /*yield*/, layer.load()];
            case 2:
                _o.sent();
                _o.label = 3;
            case 3:
                fieldInfo = (_h = layer.fields) === null || _h === void 0 ? void 0 : _h.find(function (f) { return f.name === field; });
                if (!fieldInfo) {
                    throw new Error("Field '".concat(field, "' (expected 'thematic_value') not found in visualization layer '").concat(layer.title, "'"));
                }
                isGoogleTrendsLayer = (((_j = layer.title) === null || _j === void 0 ? void 0 : _j.toLowerCase().includes("trends")) ||
                    ((_k = layer.title) === null || _k === void 0 ? void 0 : _k.toLowerCase().includes("google")) ||
                    ((_l = layer.metadata) === null || _l === void 0 ? void 0 : _l.isGoogleTrendsLayer));
                console.log("Creating renderer for layer '".concat(layer.title, "'. Is Google Trends layer: ").concat(isGoogleTrendsLayer));
                _g = customBreaks;
                if (_g) return [3 /*break*/, 5];
                return [4 /*yield*/, calculateQuantiles(layer, field, {
                        excludeZeros: !isCompositeIndex,
                        isNormalized: isGoogleTrendsLayer // Normalize Google Trends values
                    })];
            case 4:
                _g = (_o.sent());
                _o.label = 5;
            case 5:
                breaks = _g;
                console.log("Calculated breaks for layer '".concat(layer.title, "' (").concat(field, "):"), breaks);
                finalBreaks_1 = customBreaks ? __spreadArray([0], breaks, true) : breaks;
                isPointLayer_1 = layer.geometryType === 'point';
                effectiveColorStops_1 = colorStops;
                lowestCategoryColor = effectiveColorStops_1[0] || [239, 59, 44];
                defaultSymbol = isPointLayer_1
                    ? new SimpleMarkerSymbol_1.default({
                        style: "circle",
                        size: 6,
                        color: new Color_1.default(__spreadArray(__spreadArray([], lowestCategoryColor, true), [opacity], false)),
                        outline: {
                            color: new Color_1.default(__spreadArray(__spreadArray([], outlineColor, true), [opacity], false)),
                            width: outlineWidth
                        }
                    })
                    : new SimpleFillSymbol_1.default({
                        color: new Color_1.default(__spreadArray(__spreadArray([], lowestCategoryColor, true), [opacity], false)),
                        outline: {
                            color: new Color_1.default(__spreadArray(__spreadArray([], outlineColor, true), [opacity], false)),
                            width: outlineWidth
                        }
                    });
                createSymbol_1 = function (colorArray, value) {
                    if (isPointLayer_1) {
                        return {
                            type: "simple-marker",
                            style: "circle",
                            color: new Color_1.default(__spreadArray(__spreadArray([], colorArray, true), [opacity], false)),
                            size: value === 0 && !isCompositeIndex ? "4px" : "8px",
                            outline: {
                                width: 0
                            }
                        };
                    }
                    return {
                        type: "simple-fill",
                        color: new Color_1.default(__spreadArray(__spreadArray([], colorArray, true), [opacity], false)),
                        outline: {
                            width: 0.5,
                            color: [255, 255, 255, 0.5]
                        }
                    };
                };
                formatCurrency_1 = function (value) {
                    return new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    }).format(value);
                };
                typedLayer = layer;
                isCount_1 = ((_m = typedLayer.metadata) === null || _m === void 0 ? void 0 : _m.valueType) === 'count';
                startLabel_1 = "";
                endLabel_1 = "";
                // If filtering is enabled with both filterField and filterThreshold
                if (filterField && filterThreshold !== undefined) {
                    console.log("Creating filtered renderer for '".concat(layer.title, "' using filter field '").concat(filterField, "' with threshold ").concat(filterThreshold));
                    // Create a class-breaks renderer with Arcade expression
                    renderer_1 = new ClassBreaksRenderer_1.default({
                        valueExpression: "\n          // Get the feature's filter field value\n          var filterValue = $feature[\"".concat(filterField, "\"];\n          \n          // If filter value is below threshold or null, return -1 (special value for filtered out)\n          if (filterValue == null || filterValue < ").concat(filterThreshold, ") {\n            return -1;\n          }\n          \n          // Otherwise return the actual value for normal class breaks rendering\n          return $feature[\"").concat(field, "\"];\n        "),
                        defaultLabel: "No data",
                        defaultSymbol: createSymbol_1(isGoogleTrendsLayer ? effectiveColorStops_1[0] : [150, 150, 150], 0)
                    });
                    // Add a special break for filtered out values
                    renderer_1.addClassBreakInfo({
                        minValue: -1,
                        maxValue: 0,
                        symbol: createSymbol_1(FILTERED_OUT_COLOR, 0),
                        label: "Below threshold (< ".concat(filterThreshold, " applications)")
                    });
                    // Add normal breaks for values above threshold
                    finalBreaks_1.forEach(function (breakValue, i) {
                        var colorIndex = isCompositeIndex ? (finalBreaks_1.length - 1 - i) : i;
                        var colorArray = effectiveColorStops_1[colorIndex] || effectiveColorStops_1[0];
                        // Format the value based on whether it's a count or currency
                        var formattedValue = isCount_1
                            ? Math.round(breakValue).toLocaleString()
                            : isCurrency
                                ? formatCurrency_1(breakValue)
                                : breakValue.toLocaleString();
                        renderer_1.addClassBreakInfo({
                            minValue: i === 0 ? 0 : finalBreaks_1[i - 1],
                            maxValue: breakValue,
                            symbol: createSymbol_1(colorArray, breakValue),
                            label: i === 0
                                ? "".concat(startLabel_1 || "", " ").concat(formattedValue)
                                : i === finalBreaks_1.length - 1
                                    ? "".concat(endLabel_1 || "", " ").concat(formattedValue)
                                    : formattedValue
                        });
                    });
                }
                else {
                    // Use standard class breaks renderer if no filtering is needed
                    renderer_1 = new ClassBreaksRenderer_1.default({
                        field: field,
                        defaultLabel: "No data",
                        defaultSymbol: createSymbol_1(isGoogleTrendsLayer ? effectiveColorStops_1[0] : [150, 150, 150], 0),
                        classBreakInfos: finalBreaks_1.map(function (breakValue, i) {
                            var colorIndex = isCompositeIndex ? (finalBreaks_1.length - 1 - i) : i;
                            var colorArray = effectiveColorStops_1[colorIndex] || effectiveColorStops_1[0];
                            // Format the value based on whether it's a count or currency
                            var formattedValue = isCount_1
                                ? Math.round(breakValue).toLocaleString()
                                : isCurrency
                                    ? formatCurrency_1(breakValue)
                                    : breakValue.toLocaleString();
                            return {
                                minValue: i === 0 ? 0 : finalBreaks_1[i - 1],
                                maxValue: breakValue,
                                symbol: createSymbol_1(colorArray, breakValue),
                                label: i === 0
                                    ? "".concat(startLabel_1 || "", " ").concat(formattedValue)
                                    : i === finalBreaks_1.length - 1
                                        ? "".concat(endLabel_1 || "", " ").concat(formattedValue)
                                        : formattedValue
                            };
                        })
                    });
                }
                statistics = {
                    min: finalBreaks_1[0],
                    max: finalBreaks_1[finalBreaks_1.length - 1],
                    mean: finalBreaks_1.reduce(function (a, b) { return a + b; }, 0) / finalBreaks_1.length,
                    median: finalBreaks_1[Math.floor(finalBreaks_1.length / 2)]
                };
                return [2 /*return*/, {
                        renderer: renderer_1,
                        breaks: finalBreaks_1,
                        statistics: statistics
                    }];
            case 6:
                error_2 = _o.sent();
                console.error("Error creating renderer for layer ".concat(layer.title, ":"), error_2);
                return [2 /*return*/, null];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.createQuartileRenderer = createQuartileRenderer;
