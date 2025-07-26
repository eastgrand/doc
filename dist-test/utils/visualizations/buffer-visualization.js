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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferVisualization = void 0;
var FeatureLayer_1 = require("@arcgis/core/layers/FeatureLayer");
var SimpleRenderer_1 = require("@arcgis/core/renderers/SimpleRenderer");
var SimpleFillSymbol_1 = require("@arcgis/core/symbols/SimpleFillSymbol");
var Extent_1 = require("@arcgis/core/geometry/Extent");
var base_visualization_1 = require("./base-visualization");
var geometryEngine_1 = require("@arcgis/core/geometry/geometryEngine");
var Color_1 = require("@arcgis/core/Color");
var Graphic_1 = require("@arcgis/core/Graphic");
var lodash_1 = require("lodash");
var SpatialReference_1 = require("@arcgis/core/geometry/SpatialReference");
var BufferVisualization = /** @class */ (function (_super) {
    __extends(BufferVisualization, _super);
    function BufferVisualization() {
        var _this = _super.call(this) || this;
        _this.renderer = new SimpleRenderer_1.default({
            symbol: new SimpleFillSymbol_1.default({
                color: new Color_1.default([65, 174, 118, 0.4]),
                outline: {
                    color: [39, 121, 77, 0.8],
                    width: 1
                }
            })
        });
        _this.title = 'Buffer Zones';
        return _this;
    }
    BufferVisualization.prototype.validateInputData = function (data) {
        var _a, _b, _c;
        console.log('=== Validating Buffer Input Data ===');
        var startTime = performance.now();
        var validation = {
            hasFeatures: !!((_a = data.sourceFeatures) === null || _a === void 0 ? void 0 : _a.length),
            featureCount: ((_b = data.sourceFeatures) === null || _b === void 0 ? void 0 : _b.length) || 0,
            hasDistance: typeof data.distance === 'number' && (0, lodash_1.isFinite)(data.distance),
            distance: data.distance,
            hasValidUnits: ['meters', 'kilometers', 'miles'].includes(data.units),
            units: data.units,
            dissolve: (_c = data.dissolve) !== null && _c !== void 0 ? _c : true,
            validationTimeMs: 0
        };
        console.log('Input validation:', validation);
        if (!validation.hasFeatures) {
            throw new Error('No source features provided for buffer visualization');
        }
        if (!validation.hasDistance) {
            throw new Error('Invalid buffer distance provided');
        }
        if (!validation.hasValidUnits) {
            throw new Error("Invalid units provided: ".concat(data.units, ". Must be one of: meters, kilometers, miles"));
        }
        validation.validationTimeMs = performance.now() - startTime;
        console.log('Input validation complete:', {
            validationTimeMs: validation.validationTimeMs.toFixed(2)
        });
    };
    BufferVisualization.prototype.validateSourceFeatures = function (features) {
        console.log('=== Validating Source Features ===');
        var startTime = performance.now();
        var validation = {
            total: features.length,
            validGeometry: 0,
            validAttributes: 0,
            invalidGeometry: [],
            invalidAttributes: [],
            spatialReferences: new Set(),
            geometryTypes: new Set(),
            validationTimeMs: 0
        };
        features.forEach(function (feature, index) {
            var _a;
            // Validate geometry
            if (feature.geometry) {
                validation.validGeometry++;
                validation.geometryTypes.add(feature.geometry.type);
                if ((_a = feature.geometry.spatialReference) === null || _a === void 0 ? void 0 : _a.wkid) {
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
        console.log('Feature validation results:', __assign(__assign({}, validation), { geometryTypes: Array.from(validation.geometryTypes), spatialReferences: Array.from(validation.spatialReferences), validationTimeMs: (performance.now() - startTime).toFixed(2) }));
        if (validation.validGeometry === 0) {
            throw new Error('No features have valid geometries');
        }
        if (validation.spatialReferences.size > 1) {
            console.warn('Multiple spatial references detected:', Array.from(validation.spatialReferences));
        }
    };
    BufferVisualization.prototype.create = function (data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, bufferStartTime, bufferGeometries, featureStartTime, features, dissolvedGeometry, layerStartTime, layer, extentStartTime, xmin_1, ymin_1, xmax_1, ymax_1, hasValidExtent_1, extent, totalTime, err_1, error;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startTime = performance.now();
                        console.log('=== Buffer Visualization Create ===');
                        // Validate input data
                        this.validateInputData(data);
                        this.validateSourceFeatures(data.sourceFeatures);
                        // Create buffer for each feature
                        console.log('=== Creating Buffers ===');
                        bufferStartTime = performance.now();
                        bufferGeometries = data.sourceFeatures.map(function (feature, index) {
                            try {
                                var bufferGeom = (0, geometryEngine_1.buffer)(feature.geometry, data.distance, data.units);
                                if (!bufferGeom) {
                                    console.warn("Failed to create buffer for feature ".concat(index));
                                    return null;
                                }
                                return bufferGeom;
                            }
                            catch (error) {
                                console.error("Error creating buffer for feature ".concat(index, ":"), error);
                                return null;
                            }
                        }).filter(function (geom) { return geom !== null; });
                        console.log('Buffer creation results:', {
                            total: data.sourceFeatures.length,
                            successful: bufferGeometries.length,
                            failed: data.sourceFeatures.length - bufferGeometries.length,
                            processingTimeMs: (performance.now() - bufferStartTime).toFixed(2)
                        });
                        if (bufferGeometries.length === 0) {
                            throw new Error('Failed to create any valid buffer geometries');
                        }
                        // Create features array
                        console.log('=== Creating Features ===');
                        featureStartTime = performance.now();
                        if (data.dissolve) {
                            // Dissolve overlapping buffers into a single polygon
                            console.log('Dissolving overlapping buffers...');
                            dissolvedGeometry = (0, geometryEngine_1.union)(bufferGeometries);
                            if (!dissolvedGeometry) {
                                throw new Error('Failed to dissolve buffer geometries');
                            }
                            features = [new Graphic_1.default({
                                    geometry: dissolvedGeometry,
                                    attributes: {
                                        OBJECTID: 1,
                                        distance: data.distance,
                                        units: data.units,
                                        count: data.sourceFeatures.length,
                                        area: (0, geometryEngine_1.planarArea)(dissolvedGeometry, "square-meters")
                                    }
                                })];
                        }
                        else {
                            // Keep individual buffer zones
                            features = bufferGeometries.map(function (geometry, index) {
                                var _a;
                                return new Graphic_1.default({
                                    geometry: geometry,
                                    attributes: {
                                        OBJECTID: index + 1,
                                        distance: data.distance,
                                        units: data.units,
                                        sourceId: ((_a = data.sourceFeatures[index].attributes) === null || _a === void 0 ? void 0 : _a.OBJECTID) || index,
                                        area: (0, geometryEngine_1.planarArea)(geometry, "square-meters")
                                    }
                                });
                            });
                        }
                        console.log('Features created:', {
                            count: features.length,
                            processingTimeMs: (performance.now() - featureStartTime).toFixed(2)
                        });
                        // Create feature layer
                        console.log('=== Creating Feature Layer ===');
                        layerStartTime = performance.now();
                        layer = new FeatureLayer_1.default({
                            title: (options === null || options === void 0 ? void 0 : options.title) || this.title,
                            source: features,
                            renderer: this.renderer,
                            spatialReference: new SpatialReference_1.default({ wkid: 102100 }),
                        });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, layer.load()];
                    case 2:
                        _b.sent();
                        console.log('Layer created successfully:', {
                            id: layer.id,
                            title: layer.title,
                            loaded: layer.loaded,
                            geometryType: layer.geometryType,
                            features: features.length,
                            spatialReference: (_a = layer.spatialReference) === null || _a === void 0 ? void 0 : _a.wkid,
                            creationTimeMs: (performance.now() - layerStartTime).toFixed(2)
                        });
                        // Calculate extent from all buffer features
                        console.log('=== Calculating Extent ===');
                        extentStartTime = performance.now();
                        xmin_1 = Infinity;
                        ymin_1 = Infinity;
                        xmax_1 = -Infinity;
                        ymax_1 = -Infinity;
                        hasValidExtent_1 = false;
                        features.forEach(function (feature) {
                            var _a;
                            if ((_a = feature.geometry) === null || _a === void 0 ? void 0 : _a.extent) {
                                var extent_1 = feature.geometry.extent;
                                if ((0, lodash_1.isFinite)(extent_1.xmin) && (0, lodash_1.isFinite)(extent_1.ymin) &&
                                    (0, lodash_1.isFinite)(extent_1.xmax) && (0, lodash_1.isFinite)(extent_1.ymax)) {
                                    xmin_1 = Math.min(xmin_1, extent_1.xmin);
                                    ymin_1 = Math.min(ymin_1, extent_1.ymin);
                                    xmax_1 = Math.max(xmax_1, extent_1.xmax);
                                    ymax_1 = Math.max(ymax_1, extent_1.ymax);
                                    hasValidExtent_1 = true;
                                }
                            }
                        });
                        extent = hasValidExtent_1 ? new Extent_1.default({
                            xmin: xmin_1,
                            ymin: ymin_1,
                            xmax: xmax_1,
                            ymax: ymax_1,
                            spatialReference: { wkid: 102100 }
                        }) : layer.fullExtent;
                        // Add padding for better visualization
                        extent.expand(1.1);
                        console.log('Extent calculated:', {
                            xmin: extent.xmin.toFixed(2),
                            ymin: extent.ymin.toFixed(2),
                            xmax: extent.xmax.toFixed(2),
                            ymax: extent.ymax.toFixed(2),
                            width: (extent.xmax - extent.xmin).toFixed(2),
                            height: (extent.ymax - extent.ymin).toFixed(2),
                            spatialReference: extent.spatialReference.wkid,
                            calculationTimeMs: (performance.now() - extentStartTime).toFixed(2)
                        });
                        totalTime = performance.now() - startTime;
                        console.log('=== Buffer Visualization Complete ===');
                        console.log('Performance summary:', {
                            totalTimeMs: totalTime.toFixed(2),
                            validationTimeMs: (bufferStartTime - startTime).toFixed(2),
                            bufferTimeMs: (featureStartTime - bufferStartTime).toFixed(2),
                            featureTimeMs: (layerStartTime - featureStartTime).toFixed(2),
                            layerTimeMs: (extentStartTime - layerStartTime).toFixed(2),
                            extentTimeMs: (performance.now() - extentStartTime).toFixed(2)
                        });
                        return [2 /*return*/, { layer: layer, extent: extent }];
                    case 3:
                        err_1 = _b.sent();
                        console.error('Error creating layer:', err_1);
                        error = err_1;
                        throw new Error("Failed to create buffer layer: ".concat(error.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BufferVisualization.prototype.getRenderer = function () {
        return this.renderer;
    };
    BufferVisualization.prototype.getLegendInfo = function () {
        var symbol = this.renderer.symbol;
        return {
            title: this.title,
            type: 'simple',
            description: '',
            items: [{
                    label: 'Buffer Zone',
                    color: "rgba(".concat(symbol.color.toRgba().join(','), ")"),
                    shape: 'square',
                    size: 16
                }]
        };
    };
    return BufferVisualization;
}(base_visualization_1.BaseVisualization));
exports.BufferVisualization = BufferVisualization;
