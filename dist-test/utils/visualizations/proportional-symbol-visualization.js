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
exports.ProportionalSymbolVisualization = void 0;
var SimpleRenderer_1 = require("@arcgis/core/renderers/SimpleRenderer");
var SimpleMarkerSymbol_1 = require("@arcgis/core/symbols/SimpleMarkerSymbol");
var Extent_1 = require("@arcgis/core/geometry/Extent");
var base_visualization_1 = require("./base-visualization");
var Color_1 = require("@arcgis/core/Color");
var SizeVariable_1 = require("@arcgis/core/renderers/visualVariables/SizeVariable");
var ColorVariable_1 = require("@arcgis/core/renderers/visualVariables/ColorVariable");
var d3_array_1 = require("d3-array");
var ProportionalSymbolVisualization = /** @class */ (function (_super) {
    __extends(ProportionalSymbolVisualization, _super);
    function ProportionalSymbolVisualization() {
        var _this = _super.call(this) || this;
        _this.title = 'Proportional Symbol Analysis';
        _this.colorRamp = [
            [237, 248, 251],
            [179, 205, 227],
            [140, 150, 198],
            [136, 86, 167],
            [129, 15, 124]
        ];
        _this.renderer = new SimpleRenderer_1.default();
        return _this;
    }
    ProportionalSymbolVisualization.prototype.calculateBreaks = function (values, numBreaks) {
        if (numBreaks === void 0) { numBreaks = 5; }
        var sortedValues = values.filter(function (v) { return v != null; }).sort(function (a, b) { return a - b; });
        return Array.from({ length: numBreaks - 1 }, function (_, i) {
            var p = (i + 1) / numBreaks;
            return (0, d3_array_1.quantile)(sortedValues, p) || 0;
        });
    };
    ProportionalSymbolVisualization.prototype.getColorFromValue = function (value, breaks) {
        var index = breaks.findIndex(function (b) { return value <= b; });
        var colorValues = index === -1 ?
            this.colorRamp[this.colorRamp.length - 1] :
            this.colorRamp[index];
        return new Color_1.default(colorValues);
    };
    ProportionalSymbolVisualization.prototype.validateFeatures = function (features) {
        console.log('=== Validating Features ===');
        var startTime = performance.now();
        var validation = {
            total: features.length,
            validGeometry: 0,
            validAttributes: 0,
            invalidGeometry: [],
            invalidAttributes: [],
            spatialReferences: new Set()
        };
        features.forEach(function (feature, index) {
            var _a, _b, _c;
            // Validate geometry
            if (((_a = feature.geometry) === null || _a === void 0 ? void 0 : _a.type) === 'point' || ((_b = feature.geometry) === null || _b === void 0 ? void 0 : _b.type) === 'polygon') {
                validation.validGeometry++;
                if ((_c = feature.geometry.spatialReference) === null || _c === void 0 ? void 0 : _c.wkid) {
                    validation.spatialReferences.add(feature.geometry.spatialReference.wkid);
                }
            }
            else {
                validation.invalidGeometry.push(index);
            }
            // Validate attributes
            if (feature.attributes && Object.keys(feature.attributes).length > 0) {
                validation.validAttributes++;
            }
            else {
                validation.invalidAttributes.push(index);
            }
        });
        console.log('Feature validation results:', __assign(__assign({}, validation), { spatialReferences: Array.from(validation.spatialReferences), validationTimeMs: (performance.now() - startTime).toFixed(2) }));
        if (validation.validGeometry === 0) {
            throw new Error('No features have valid geometries');
        }
        if (validation.spatialReferences.size > 1) {
            console.warn('Multiple spatial references detected:', Array.from(validation.spatialReferences));
        }
    };
    ProportionalSymbolVisualization.prototype.validateFields = function (features, sizeField, colorField) {
        var _a;
        console.log('=== Validating Fields ===');
        var startTime = performance.now();
        var fieldStats = {
            size: {
                valid: 0,
                invalid: 0,
                min: Infinity,
                max: -Infinity,
                sum: 0,
                nullCount: 0
            },
            color: colorField ? {
                valid: 0,
                invalid: 0,
                min: Infinity,
                max: -Infinity,
                sum: 0,
                nullCount: 0
            } : undefined
        };
        features.forEach(function (feature, index) {
            // Validate size field
            var sizeValue = feature.attributes[sizeField];
            if (typeof sizeValue === 'number' && !isNaN(sizeValue)) {
                fieldStats.size.valid++;
                fieldStats.size.min = Math.min(fieldStats.size.min, sizeValue);
                fieldStats.size.max = Math.max(fieldStats.size.max, sizeValue);
                fieldStats.size.sum += sizeValue;
            }
            else if (sizeValue === null || sizeValue === undefined) {
                fieldStats.size.nullCount++;
            }
            else {
                fieldStats.size.invalid++;
                console.warn("Invalid size value at index ".concat(index, ":"), sizeValue);
            }
            // Validate color field if present
            if (colorField && fieldStats.color) {
                var colorValue = feature.attributes[colorField];
                if (typeof colorValue === 'number' && !isNaN(colorValue)) {
                    fieldStats.color.valid++;
                    fieldStats.color.min = Math.min(fieldStats.color.min, colorValue);
                    fieldStats.color.max = Math.max(fieldStats.color.max, colorValue);
                    fieldStats.color.sum += colorValue;
                }
                else if (colorValue === null || colorValue === undefined) {
                    fieldStats.color.nullCount++;
                }
                else {
                    fieldStats.color.invalid++;
                    console.warn("Invalid color value at index ".concat(index, ":"), colorValue);
                }
            }
        });
        console.log('Field validation results:', {
            size: __assign(__assign({}, fieldStats.size), { mean: fieldStats.size.valid > 0 ? fieldStats.size.sum / fieldStats.size.valid : 0 }),
            color: fieldStats.color ? __assign(__assign({}, fieldStats.color), { mean: fieldStats.color.valid > 0 ? fieldStats.color.sum / fieldStats.color.valid : 0 }) : undefined,
            validationTimeMs: (performance.now() - startTime).toFixed(2)
        });
        if (fieldStats.size.valid === 0) {
            throw new Error("No valid numeric values found for size field \"".concat(sizeField, "\""));
        }
        if (colorField && ((_a = fieldStats.color) === null || _a === void 0 ? void 0 : _a.valid) === 0) {
            throw new Error("No valid numeric values found for color field \"".concat(colorField, "\""));
        }
    };
    ProportionalSymbolVisualization.prototype.validateInputData = function (data) {
        var _a, _b, _c, _d;
        console.log('=== Validating Input Data ===');
        var startTime = performance.now();
        var validation = {
            hasFeatures: !!((_a = data.features) === null || _a === void 0 ? void 0 : _a.length),
            featureCount: ((_b = data.features) === null || _b === void 0 ? void 0 : _b.length) || 0,
            hasSizeField: !!data.sizeField,
            hasColorField: !!data.colorField,
            hasSizeLabel: !!data.sizeLabel,
            hasColorLabel: !!data.colorLabel,
            hasSizeBreaks: !!((_c = data.sizeBreaks) === null || _c === void 0 ? void 0 : _c.length),
            hasColorBreaks: !!((_d = data.colorBreaks) === null || _d === void 0 ? void 0 : _d.length),
            minSize: data.minSize || 8,
            maxSize: data.maxSize || 48,
            validationTimeMs: 0
        };
        console.log('Input data validation:', validation);
        if (!validation.hasFeatures) {
            throw new Error('No features provided for visualization');
        }
        if (!validation.hasSizeField) {
            throw new Error('Size field is required for proportional symbol visualization');
        }
        if (validation.minSize >= validation.maxSize) {
            throw new Error("Invalid size range: minSize (".concat(validation.minSize, ") must be less than maxSize (").concat(validation.maxSize, ")"));
        }
        validation.validationTimeMs = performance.now() - startTime;
        console.log('Input validation complete:', {
            validationTimeMs: validation.validationTimeMs.toFixed(2)
        });
    };
    ProportionalSymbolVisualization.prototype.validateBreaks = function (breaks, fieldName) {
        console.log("=== Validating ".concat(fieldName, " Breaks ==="));
        var startTime = performance.now();
        if (!(breaks === null || breaks === void 0 ? void 0 : breaks.length)) {
            throw new Error("No break points provided for ".concat(fieldName));
        }
        // Check for valid numbers
        var invalidBreaks = breaks.filter(function (b) { return typeof b !== 'number' || isNaN(b); });
        if (invalidBreaks.length > 0) {
            throw new Error("Invalid break points found for ".concat(fieldName, ": ").concat(invalidBreaks.join(', ')));
        }
        // Check for ascending order
        var isAscending = breaks.every(function (b, i) { return i === 0 || b >= breaks[i - 1]; });
        if (!isAscending) {
            throw new Error("Break points for ".concat(fieldName, " must be in ascending order"));
        }
        // Check for duplicates
        var uniqueBreaks = new Set(breaks);
        if (uniqueBreaks.size !== breaks.length) {
            throw new Error("Duplicate break points found for ".concat(fieldName));
        }
        console.log("".concat(fieldName, " breaks validation complete:"), {
            breakCount: breaks.length,
            min: breaks[0],
            max: breaks[breaks.length - 1],
            validationTimeMs: (performance.now() - startTime).toFixed(2)
        });
    };
    ProportionalSymbolVisualization.prototype.validateSpatialReference = function (features) {
        console.log('=== Validating Spatial Reference ===');
        var startTime = performance.now();
        var spatialRefs = new Set();
        features.forEach(function (feature) {
            var _a, _b;
            if ((_b = (_a = feature.geometry) === null || _a === void 0 ? void 0 : _a.spatialReference) === null || _b === void 0 ? void 0 : _b.wkid) {
                spatialRefs.add(feature.geometry.spatialReference.wkid);
            }
        });
        if (spatialRefs.size === 0) {
            throw new Error('No spatial reference found in features');
        }
        if (spatialRefs.size > 1) {
            console.warn('Multiple spatial references detected:', Array.from(spatialRefs));
        }
        console.log('Spatial reference validation complete:', {
            uniqueRefs: spatialRefs.size,
            refs: Array.from(spatialRefs),
            validationTimeMs: (performance.now() - startTime).toFixed(2)
        });
    };
    ProportionalSymbolVisualization.prototype.calculateExtent = function (features) {
        var _a;
        if (!features.length) {
            console.warn('No features provided for extent calculation');
            return null;
        }
        console.log('=== Calculating Proportional Symbol Extent ===', {
            totalFeatures: features.length,
            geometryType: (_a = features[0].geometry) === null || _a === void 0 ? void 0 : _a.type
        });
        var xMin = Infinity;
        var yMin = Infinity;
        var xMax = -Infinity;
        var yMax = -Infinity;
        var validCoordinates = 0;
        features.forEach(function (feature, index) {
            if (!feature.geometry) {
                console.warn("Feature ".concat(index, " has no geometry"));
                return;
            }
            var geometry = feature.geometry;
            // Handle point geometries
            if (geometry.type === 'point' && typeof geometry.x === 'number' && typeof geometry.y === 'number') {
                xMin = Math.min(xMin, geometry.x);
                yMin = Math.min(yMin, geometry.y);
                xMax = Math.max(xMax, geometry.x);
                yMax = Math.max(yMax, geometry.y);
                validCoordinates++;
            }
            // Handle polygon geometries
            else if (geometry.rings) {
                geometry.rings.forEach(function (ring) {
                    ring.forEach(function (_a) {
                        var x = _a[0], y = _a[1];
                        if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
                            xMin = Math.min(xMin, x);
                            yMin = Math.min(yMin, y);
                            xMax = Math.max(xMax, x);
                            yMax = Math.max(yMax, y);
                            validCoordinates++;
                        }
                    });
                });
            }
        });
        if (validCoordinates > 0) {
            // Add padding for better visualization
            var padding = 0.1;
            var width = xMax - xMin;
            var height = yMax - yMin;
            var xPadding = width * padding;
            var yPadding = height * padding;
            var extent = new Extent_1.default({
                xmin: xMin - xPadding,
                ymin: yMin - yPadding,
                xmax: xMax + xPadding,
                ymax: yMax + yPadding,
                spatialReference: features[0].geometry.spatialReference || { wkid: 102100 }
            });
            console.log('Extent calculated:', {
                xmin: extent.xmin,
                ymin: extent.ymin,
                xmax: extent.xmax,
                ymax: extent.ymax,
                spatialReference: extent.spatialReference.wkid
            });
            // Also set the extent property for compatibility
            this.extent = extent;
            return extent;
        }
        else {
            console.error('No valid coordinates found for extent calculation');
            return null;
        }
    };
    ProportionalSymbolVisualization.prototype.calculateQuartileBreaks = function (values) {
        if (!values.length)
            return [];
        // Sort values
        var sortedValues = __spreadArray([], values, true).sort(function (a, b) { return a - b; });
        // Calculate quartile positions
        var q1Index = Math.floor(sortedValues.length * 0.25);
        var q2Index = Math.floor(sortedValues.length * 0.5);
        var q3Index = Math.floor(sortedValues.length * 0.75);
        // Get quartile values
        return [
            sortedValues[q1Index], // 25th percentile
            sortedValues[q2Index], // 50th percentile (median)
            sortedValues[q3Index] // 75th percentile
        ];
    };
    ProportionalSymbolVisualization.prototype.create = function (data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var sizeValues, sizeBreaks, sizeVariable, colorVariable, error_1;
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 2, , 3]);
                        // Validate input data
                        this.validateData(data);
                        sizeValues = data.features
                            .map(function (f) { var _a; return (_a = f.attributes) === null || _a === void 0 ? void 0 : _a[data.sizeField]; })
                            .filter(function (v) { return typeof v === 'number' && !isNaN(v); });
                        if (!sizeValues.length) {
                            throw new Error("No valid numeric values found for size field \"".concat(data.sizeField, "\""));
                        }
                        sizeBreaks = this.calculateQuartileBreaks(sizeValues);
                        console.log('Size breaks calculated:', {
                            min: Math.min.apply(Math, sizeValues),
                            breaks: sizeBreaks,
                            max: Math.max.apply(Math, sizeValues)
                        });
                        sizeVariable = new SizeVariable_1.default({
                            field: data.sizeField,
                            stops: [
                                { value: Math.min.apply(Math, sizeValues), size: data.minSymbolSize || 8 },
                                { value: sizeBreaks[0], size: (data.minSymbolSize || 8) + (data.maxSymbolSize || 40) * 0.25 },
                                { value: sizeBreaks[1], size: (data.minSymbolSize || 8) + (data.maxSymbolSize || 40) * 0.5 },
                                { value: sizeBreaks[2], size: (data.minSymbolSize || 8) + (data.maxSymbolSize || 40) * 0.75 },
                                { value: Math.max.apply(Math, sizeValues), size: data.maxSymbolSize || 40 }
                            ]
                        });
                        colorVariable = data.colorField ? new ColorVariable_1.default({
                            field: data.colorField,
                            stops: [
                                { value: data.minColor || 0, color: new Color_1.default(this.colorRamp[0]) },
                                { value: data.maxColor || 100, color: new Color_1.default(this.colorRamp[4]) }
                            ]
                        }) : undefined;
                        this.renderer = new SimpleRenderer_1.default({
                            symbol: new SimpleMarkerSymbol_1.default({
                                color: ((_a = options === null || options === void 0 ? void 0 : options.symbolConfig) === null || _a === void 0 ? void 0 : _a.color) || [0, 122, 194, 0.8],
                                outline: {
                                    color: ((_c = (_b = options === null || options === void 0 ? void 0 : options.symbolConfig) === null || _b === void 0 ? void 0 : _b.outline) === null || _c === void 0 ? void 0 : _c.color) || [255, 255, 255, 0.8],
                                    width: ((_e = (_d = options === null || options === void 0 ? void 0 : options.symbolConfig) === null || _d === void 0 ? void 0 : _d.outline) === null || _e === void 0 ? void 0 : _e.width) || 1
                                }
                            }),
                            visualVariables: __spreadArray([
                                sizeVariable
                            ], (colorVariable ? [colorVariable] : []), true)
                        });
                        // Initialize layer with original data
                        return [4 /*yield*/, this.initializeLayer(data, options)];
                    case 1:
                        // Initialize layer with original data
                        _f.sent();
                        if (!this.layer || !this.extent) {
                            throw new Error('Failed to initialize layer or calculate extent');
                        }
                        // Update layer with renderer
                        this.layer.renderer = this.renderer;
                        return [2 /*return*/, {
                                layer: this.layer,
                                extent: this.extent,
                                renderer: this.renderer,
                                legendInfo: this.getLegendInfo()
                            }];
                    case 2:
                        error_1 = _f.sent();
                        console.error('Error in ProportionalSymbolVisualization.create:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ProportionalSymbolVisualization.prototype.getLegendInfo = function () {
        var _a;
        return {
            title: this.title,
            type: "class-breaks",
            description: "Proportional symbols showing ".concat(((_a = this.data) === null || _a === void 0 ? void 0 : _a.sizeField) || 'values'),
            items: [{
                    label: 'Symbol',
                    color: 'rgba(0, 116, 217, 0.7)',
                    shape: 'circle',
                    size: 16
                }]
        };
    };
    return ProportionalSymbolVisualization;
}(base_visualization_1.BaseVisualization));
exports.ProportionalSymbolVisualization = ProportionalSymbolVisualization;
