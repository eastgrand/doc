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
exports.DensityVisualization = void 0;
var FeatureLayer_1 = require("@arcgis/core/layers/FeatureLayer");
var HeatmapRenderer_1 = require("@arcgis/core/renderers/HeatmapRenderer");
var base_visualization_1 = require("./base-visualization");
var DensityVisualization = /** @class */ (function (_super) {
    __extends(DensityVisualization, _super);
    function DensityVisualization() {
        var _this = _super.call(this) || this;
        _this.title = 'Density Analysis';
        return _this;
    }
    DensityVisualization.prototype.create = function (data_1) {
        return __awaiter(this, arguments, void 0, function (data, options) {
            var startTime, totalWeight, validWeightCount, validPoints, validationTime, weightStats, weights, avg_1, variance, layerStartTime, layer, extent_1, layerEndTime, endTime, error_1;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_q) {
                switch (_q.label) {
                    case 0:
                        startTime = performance.now();
                        console.log('=== Creating Density Visualization ===');
                        console.log('Input data:', {
                            pointCount: (_a = data.points) === null || _a === void 0 ? void 0 : _a.length,
                            weightField: data.weightField,
                            radius: data.radius,
                            minDensity: data.minDensity,
                            maxDensity: data.maxDensity,
                            spatialReference: (_e = (_d = (_c = (_b = data.points) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.geometry) === null || _d === void 0 ? void 0 : _d.spatialReference) === null || _e === void 0 ? void 0 : _e.wkid
                        });
                        // Validate input data
                        if (!((_f = data.points) === null || _f === void 0 ? void 0 : _f.length)) {
                            throw new Error('No points provided for density visualization');
                        }
                        if (!((_h = (_g = data.points[0]) === null || _g === void 0 ? void 0 : _g.geometry) === null || _h === void 0 ? void 0 : _h.spatialReference)) {
                            throw new Error('Points must have a valid spatial reference');
                        }
                        if (data.radius <= 0) {
                            throw new Error('Radius must be greater than 0');
                        }
                        if (data.minDensity !== undefined && data.maxDensity !== undefined && data.minDensity >= data.maxDensity) {
                            throw new Error('minDensity must be less than maxDensity');
                        }
                        totalWeight = 0;
                        validWeightCount = 0;
                        validPoints = data.points.filter(function (point, index) {
                            var _a, _b;
                            try {
                                if (!(point === null || point === void 0 ? void 0 : point.geometry) || point.geometry.type !== 'point') {
                                    console.warn("Invalid point geometry at index ".concat(index, ":"), {
                                        hasGeometry: !!(point === null || point === void 0 ? void 0 : point.geometry),
                                        type: (_a = point === null || point === void 0 ? void 0 : point.geometry) === null || _a === void 0 ? void 0 : _a.type
                                    });
                                    return false;
                                }
                                if (data.weightField) {
                                    var weight = (_b = point.attributes) === null || _b === void 0 ? void 0 : _b[data.weightField];
                                    if (weight == null) {
                                        console.warn("Missing weight field \"".concat(data.weightField, "\" at index ").concat(index));
                                        return false;
                                    }
                                    if (typeof weight !== 'number' || isNaN(weight)) {
                                        console.warn("Invalid weight value at index ".concat(index, ":"), weight);
                                        return false;
                                    }
                                    totalWeight += weight;
                                    validWeightCount++;
                                }
                                return true;
                            }
                            catch (error) {
                                console.error("Error processing point at index ".concat(index, ":"), error);
                                return false;
                            }
                        });
                        validationTime = performance.now();
                        console.log('Point validation:', {
                            total: data.points.length,
                            valid: validPoints.length,
                            invalid: data.points.length - validPoints.length,
                            validationTimeMs: (validationTime - startTime).toFixed(2)
                        });
                        if (validPoints.length === 0) {
                            throw new Error('No valid points for density visualization');
                        }
                        if (data.weightField && validWeightCount === 0) {
                            throw new Error("No valid weights found for field \"".concat(data.weightField, "\""));
                        }
                        if (data.weightField) {
                            weights = validPoints
                                .map(function (p) {
                                var _a;
                                var value = (_a = p.attributes) === null || _a === void 0 ? void 0 : _a[data.weightField];
                                return typeof value === 'number' ? value : null;
                            })
                                .filter(function (v) { return v !== null; });
                            if (weights.length > 0) {
                                avg_1 = totalWeight / validWeightCount;
                                variance = weights.reduce(function (sum, w) { return sum + Math.pow(w - avg_1, 2); }, 0) / weights.length;
                                weightStats = {
                                    min: Math.min.apply(Math, weights),
                                    max: Math.max.apply(Math, weights),
                                    avg: avg_1,
                                    stdDev: Math.sqrt(variance)
                                };
                                console.log('Weight field statistics:', weightStats);
                            }
                        }
                        // Create feature layer with heatmap renderer
                        console.log('Creating feature layer with heatmap renderer');
                        layerStartTime = performance.now();
                        _q.label = 1;
                    case 1:
                        _q.trys.push([1, 3, , 4]);
                        layer = new FeatureLayer_1.default({
                            title: options.title || this.title,
                            source: validPoints,
                            renderer: new HeatmapRenderer_1.default({
                                field: data.weightField || "cluster_count",
                                colorStops: [
                                    { ratio: 0, color: [255, 255, 255, 0] },
                                    { ratio: 0.2, color: [255, 255, 0, 0.5] },
                                    { ratio: 0.5, color: [255, 128, 0, 0.7] },
                                    { ratio: 0.8, color: [255, 0, 0, 0.9] },
                                    { ratio: 1, color: [128, 0, 0, 1] }
                                ],
                                radius: data.radius,
                                minDensity: (_j = data.minDensity) !== null && _j !== void 0 ? _j : ((weightStats === null || weightStats === void 0 ? void 0 : weightStats.min) || 0),
                                maxDensity: (_k = data.maxDensity) !== null && _k !== void 0 ? _k : ((weightStats === null || weightStats === void 0 ? void 0 : weightStats.max) || 100),
                                legendOptions: {
                                    title: data.weightField ? "Heat Intensity (".concat(data.weightField, ")") : "Heat Intensity",
                                    minLabel: "Low",
                                    maxLabel: "High"
                                }
                            }),
                            opacity: options.opacity || 0.7,
                            visible: (_l = options.visible) !== null && _l !== void 0 ? _l : true,
                            popupTemplate: {
                                title: "Location Details",
                                content: [
                                    {
                                        type: "fields",
                                        fieldInfos: __spreadArray(__spreadArray([], (data.weightField ? [{
                                                fieldName: data.weightField,
                                                label: "Weight",
                                                format: {
                                                    digitSeparator: true,
                                                    places: 2
                                                }
                                            }] : []), true), [
                                            {
                                                fieldName: "x",
                                                label: "Longitude",
                                                format: {
                                                    digitSeparator: false,
                                                    places: 6
                                                }
                                            },
                                            {
                                                fieldName: "y",
                                                label: "Latitude",
                                                format: {
                                                    digitSeparator: false,
                                                    places: 6
                                                }
                                            }
                                        ], false)
                                    }
                                ]
                            }
                        });
                        extent_1 = null;
                        try {
                            if ((_o = (_m = validPoints[0]) === null || _m === void 0 ? void 0 : _m.geometry) === null || _o === void 0 ? void 0 : _o.extent) {
                                extent_1 = validPoints[0].geometry.extent.clone();
                                validPoints.forEach(function (point) {
                                    var _a;
                                    if ((_a = point.geometry) === null || _a === void 0 ? void 0 : _a.extent) {
                                        extent_1 === null || extent_1 === void 0 ? void 0 : extent_1.union(point.geometry.extent);
                                    }
                                });
                                // Add padding to extent for better visualization of heatmap
                                extent_1.expand(1.5);
                            }
                            else {
                                throw new Error('First point has no valid extent');
                            }
                        }
                        catch (error) {
                            console.error('Error calculating extent:', error);
                            throw new Error('Failed to calculate extent from points');
                        }
                        if (!extent_1) {
                            throw new Error('Failed to calculate valid extent');
                        }
                        // Wait for layer to load and validate
                        return [4 /*yield*/, layer.load()];
                    case 2:
                        // Wait for layer to load and validate
                        _q.sent();
                        layerEndTime = performance.now();
                        console.log('Layer loaded successfully:', {
                            id: layer.id,
                            title: layer.title,
                            loaded: layer.loaded,
                            geometryType: layer.geometryType,
                            features: validPoints.length,
                            spatialReference: (_p = layer.spatialReference) === null || _p === void 0 ? void 0 : _p.wkid,
                            loadTimeMs: (layerEndTime - layerStartTime).toFixed(2)
                        });
                        endTime = performance.now();
                        console.log('=== Density Visualization Complete ===');
                        console.log('Performance metrics:', {
                            totalTimeMs: (endTime - startTime).toFixed(2),
                            validationTimeMs: (validationTime - startTime).toFixed(2),
                            layerCreationTimeMs: (layerEndTime - layerStartTime).toFixed(2)
                        });
                        return [2 /*return*/, { layer: layer, extent: extent_1 }];
                    case 3:
                        error_1 = _q.sent();
                        console.error('Error creating density layer:', error_1);
                        throw new Error('Failed to create density visualization layer');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DensityVisualization.prototype.getRenderer = function () {
        return new HeatmapRenderer_1.default({
            colorStops: [
                { ratio: 0, color: [255, 255, 255, 0] },
                { ratio: 0.2, color: [255, 255, 0, 0.5] },
                { ratio: 0.4, color: [255, 170, 0, 0.75] },
                { ratio: 0.6, color: [255, 85, 0, 0.9] },
                { ratio: 0.8, color: [255, 0, 0, 0.95] },
                { ratio: 1, color: [178, 0, 0, 1] }
            ],
            radius: 10
        });
    };
    DensityVisualization.prototype.getLegendInfo = function () {
        return {
            title: "Density Heatmap",
            type: "class-breaks",
            description: "Shows density of points across the map",
            items: [
                { ratio: 0, color: [255, 255, 255, 0], label: "Low" },
                { ratio: 0.5, color: [255, 170, 0, 0.75], label: "Medium" },
                { ratio: 1, color: [178, 0, 0, 1], label: "High" }
            ].map(function (stop) { return ({
                label: stop.label,
                color: "rgba(".concat(stop.color.join(','), ")"),
                shape: 'square',
                size: 16
            }); })
        };
    };
    return DensityVisualization;
}(base_visualization_1.BaseVisualization));
exports.DensityVisualization = DensityVisualization;
