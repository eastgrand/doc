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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotspotVisualization = void 0;
var Point_1 = require("@arcgis/core/geometry/Point");
var Polygon_1 = require("@arcgis/core/geometry/Polygon");
var geometryEngine = require("@arcgis/core/geometry/geometryEngine");
var renderers_1 = require("@arcgis/core/renderers");
var symbols_1 = require("@arcgis/core/symbols");
var FeatureLayer_1 = require("@arcgis/core/layers/FeatureLayer");
var Graphic_1 = require("@arcgis/core/Graphic");
var base_visualization_1 = require("./base-visualization");
var Color_1 = require("@arcgis/core/Color");
var lodash_1 = require("lodash");
var Extent_1 = require("@arcgis/core/geometry/Extent");
var ColorVariable_1 = require("@arcgis/core/renderers/visualVariables/ColorVariable");
var SizeVariable_1 = require("@arcgis/core/renderers/visualVariables/SizeVariable");
var SpatialIndex = /** @class */ (function () {
    function SpatialIndex(points, cellSize) {
        if (cellSize === void 0) { cellSize = 10000; }
        this.grid = new Map();
        this.cellSize = cellSize;
        this.buildIndex(points);
    }
    SpatialIndex.prototype.buildIndex = function (points) {
        var _this = this;
        points.forEach(function (point) {
            var cellKey = _this.getCellKey(point);
            if (!_this.grid.has(cellKey)) {
                _this.grid.set(cellKey, []);
            }
            _this.grid.get(cellKey).push(point);
        });
    };
    SpatialIndex.prototype.getCellKey = function (point) {
        var x = Math.floor(point.x / this.cellSize);
        var y = Math.floor(point.y / this.cellSize);
        return "".concat(x, ",").concat(y);
    };
    SpatialIndex.prototype.getNearbyPoints = function (point, radius) {
        var nearbyPoints = [];
        var cellRadius = Math.ceil(radius / this.cellSize);
        var centerCell = this.getCellKey(point);
        var _a = centerCell.split(',').map(Number), centerX = _a[0], centerY = _a[1];
        // Check cells within radius
        for (var dx = -cellRadius; dx <= cellRadius; dx++) {
            for (var dy = -cellRadius; dy <= cellRadius; dy++) {
                var cellKey = "".concat(centerX + dx, ",").concat(centerY + dy);
                var cellPoints = this.grid.get(cellKey);
                if (cellPoints) {
                    nearbyPoints.push.apply(nearbyPoints, cellPoints);
                }
            }
        }
        return nearbyPoints;
    };
    return SpatialIndex;
}());
var HotspotVisualization = /** @class */ (function (_super) {
    __extends(HotspotVisualization, _super);
    function HotspotVisualization() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderer = null;
        _this.layer = null;
        _this.extent = null;
        _this.title = 'Hotspot Analysis';
        _this.spatialIndex = null;
        _this.featurePoints = [];
        return _this;
    }
    HotspotVisualization.prototype.create = function (data_1) {
        return __awaiter(this, arguments, void 0, function (data, options) {
            var error_1;
            var _a;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        console.log('Creating hotspot visualization:', {
                            featureCount: (_a = data.features) === null || _a === void 0 ? void 0 : _a.length,
                            layerName: data.layerName,
                            analysisType: data.analysisType
                        });
                        // Initialize layer
                        return [4 /*yield*/, this.initializeLayer(data, options)];
                    case 1:
                        // Initialize layer
                        _b.sent();
                        if (!this.layer || !this.extent) {
                            throw new Error('Failed to initialize layer or calculate extent');
                        }
                        return [2 /*return*/, {
                                layer: this.layer,
                                extent: this.extent,
                                renderer: this.renderer || undefined,
                                legendInfo: this.getLegendInfo()
                            }];
                    case 2:
                        error_1 = _b.sent();
                        console.error('Error creating hotspot visualization:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    HotspotVisualization.prototype.getLegendInfo = function () {
        var _a, _b, _c, _d;
        var colorVariable = (_b = (_a = this.renderer) === null || _a === void 0 ? void 0 : _a.visualVariables) === null || _b === void 0 ? void 0 : _b.find(function (v) { return v.type === 'color'; });
        var stops = (colorVariable && 'stops' in colorVariable ? colorVariable.stops : []);
        return {
            title: ((_c = this.layer) === null || _c === void 0 ? void 0 : _c.title) || "Hotspot Analysis",
            type: "class-breaks",
            description: "Hotspot analysis showing ".concat(((_d = this.data) === null || _d === void 0 ? void 0 : _d.analysisType) || 'density', " patterns"),
            items: stops.map(function (stop) { return ({
                label: stop.value.toString(),
                color: "rgba(".concat(stop.color.toRgba().join(','), ")"),
                shape: 'square',
                size: 16
            }); })
        };
    };
    HotspotVisualization.prototype.processFeatures = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var processedFeatures, batchSize, i, batch, error_2;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        console.log('Processing features:', {
                            featureCount: data.features.length,
                            analysisType: data.analysisType,
                            hasAdditionalLayers: !!((_a = data.layers) === null || _a === void 0 ? void 0 : _a.length)
                        });
                        // Convert all features to points once
                        this.featurePoints = data.features.map(function (feature) {
                            try {
                                var point = null;
                                if (feature.geometry.type === 'point') {
                                    // Handle point geometry
                                    if (feature.geometry.x !== undefined && feature.geometry.y !== undefined &&
                                        !isNaN(feature.geometry.x) && !isNaN(feature.geometry.y)) {
                                        // Create point directly if x/y are valid numbers
                                        point = new Point_1.default({
                                            x: feature.geometry.x,
                                            y: feature.geometry.y,
                                            spatialReference: { wkid: 102100 }
                                        });
                                    }
                                    else if (Array.isArray(feature.geometry.coordinates) &&
                                        feature.geometry.coordinates.length >= 2) {
                                        var _a = feature.geometry.coordinates, x = _a[0], y = _a[1];
                                        if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
                                            // Create point from coordinates array if values are valid numbers
                                            point = new Point_1.default({
                                                x: x,
                                                y: y,
                                                spatialReference: { wkid: 102100 }
                                            });
                                        }
                                    }
                                }
                                else if (feature.geometry.type === 'polygon') {
                                    // Handle polygon geometry
                                    var rings = feature.geometry.rings ||
                                        (Array.isArray(feature.geometry.coordinates) ?
                                            feature.geometry.coordinates : null);
                                    if (rings && Array.isArray(rings[0]) && rings[0].length >= 3) {
                                        var polygon = new Polygon_1.default({
                                            rings: rings,
                                            spatialReference: { wkid: 102100 }
                                        });
                                        point = polygon.centroid;
                                    }
                                }
                                // Validate point before returning
                                if (point && (0, lodash_1.isFinite)(point.x) && (0, lodash_1.isFinite)(point.y)) {
                                    return point;
                                }
                                return null;
                            }
                            catch (error) {
                                console.warn('Error converting feature to point:', error);
                                return null;
                            }
                        }).filter(function (p) { return p !== null; });
                        // Log point conversion results
                        console.log('Point conversion summary:', {
                            totalFeatures: data.features.length,
                            convertedPoints: this.featurePoints.length,
                            samplePoints: this.featurePoints.slice(0, 3).map(function (p) {
                                var _a;
                                return ({
                                    x: p.x,
                                    y: p.y,
                                    spatialReference: (_a = p.spatialReference) === null || _a === void 0 ? void 0 : _a.wkid
                                });
                            })
                        });
                        if (this.featurePoints.length === 0) {
                            throw new Error('No valid points could be created from features');
                        }
                        // Initialize spatial index with converted points
                        this.spatialIndex = new SpatialIndex(this.featurePoints);
                        processedFeatures = this.featurePoints.map(function (point, index) {
                            var _a, _b;
                            return new Graphic_1.default({
                                geometry: point,
                                attributes: {
                                    OBJECTID: index + 1,
                                    score: 0, // Will be calculated later
                                    CONAME: ((_a = data.features[index].properties) === null || _a === void 0 ? void 0 : _a.CONAME) ||
                                        ((_b = data.features[index].attributes) === null || _b === void 0 ? void 0 : _b.CONAME) ||
                                        "Location ".concat(index + 1)
                                }
                            });
                        });
                        batchSize = 100;
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < processedFeatures.length)) return [3 /*break*/, 4];
                        batch = processedFeatures.slice(i, i + batchSize);
                        return [4 /*yield*/, Promise.all(batch.map(function (graphic) { return __awaiter(_this, void 0, void 0, function () {
                                var point, score;
                                var _a;
                                return __generator(this, function (_b) {
                                    try {
                                        point = graphic.geometry;
                                        score = data.analysisType === 'interaction' && ((_a = data.layers) === null || _a === void 0 ? void 0 : _a.length)
                                            ? this.calculateInteractionScore(point, data.layers)
                                            : this.calculateDensityScore(point);
                                        graphic.attributes.score = score;
                                    }
                                    catch (error) {
                                        console.warn("Error calculating score for feature ".concat(graphic.attributes.OBJECTID, ":"), error);
                                    }
                                    return [2 /*return*/];
                                });
                            }); }))];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        i += batchSize;
                        return [3 /*break*/, 1];
                    case 4:
                        console.log('Feature processing complete:', {
                            inputCount: data.features.length,
                            processedCount: processedFeatures.length,
                            sampleFeature: processedFeatures[0] ? {
                                geometry: {
                                    type: processedFeatures[0].geometry.type,
                                    x: processedFeatures[0].geometry.x,
                                    y: processedFeatures[0].geometry.y
                                },
                                attributes: processedFeatures[0].attributes
                            } : 'none'
                        });
                        return [2 /*return*/, processedFeatures];
                    case 5:
                        error_2 = _b.sent();
                        console.error('Error in processFeatures:', error_2);
                        throw error_2;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    HotspotVisualization.prototype.initializeLayer = function (data_1) {
        return __awaiter(this, arguments, void 0, function (data, options) {
            var validFeatures, scores, q1Index, q2Index, q3Index, quartiles, points, xCoords, yCoords, xmin, ymin, xmax, ymax, error_3;
            var _a;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        // Single entry point log with essential info
                        console.log('[HotspotVisualization] Initializing:', {
                            featureCount: data.features.length,
                            layerName: data.layerName || this.title,
                            analysisType: data.analysisType || 'density'
                        });
                        return [4 /*yield*/, this.processFeatures(data)];
                    case 1:
                        validFeatures = _b.sent();
                        if (validFeatures.length === 0) {
                            throw new Error('No valid features for hotspot analysis');
                        }
                        scores = validFeatures.map(function (f) { return f.attributes.score; }).sort(function (a, b) { return a - b; });
                        q1Index = Math.floor(scores.length * 0.25);
                        q2Index = Math.floor(scores.length * 0.5);
                        q3Index = Math.floor(scores.length * 0.75);
                        quartiles = {
                            q1: scores[q1Index],
                            q2: scores[q2Index],
                            q3: scores[q3Index]
                        };
                        console.log('Score quartiles:', quartiles);
                        // Create renderer with visualization parameters
                        this.renderer = new renderers_1.SimpleRenderer({
                            symbol: new symbols_1.SimpleMarkerSymbol({
                                color: [255, 255, 255, 0.6],
                                size: 12,
                                outline: {
                                    color: [128, 128, 128, 0.5],
                                    width: 1
                                }
                            }),
                            visualVariables: [
                                new ColorVariable_1.default({
                                    field: 'score',
                                    stops: [
                                        { value: scores[0], color: new Color_1.default([239, 59, 44, 0.7]) }, // red
                                        { value: quartiles.q1, color: new Color_1.default([255, 127, 0, 0.7]) }, // orange
                                        { value: quartiles.q2, color: new Color_1.default([158, 215, 152, 0.7]) }, // light green
                                        { value: quartiles.q3, color: new Color_1.default([49, 163, 84, 0.7]) } // green
                                    ],
                                    legendOptions: {
                                        title: data.analysisType === 'interaction'
                                            ? "Interaction Strength (".concat(((_a = data.layers) === null || _a === void 0 ? void 0 : _a.length) || 1, " layers)")
                                            : "Concentration",
                                        showLegend: true
                                    }
                                }),
                                new SizeVariable_1.default({
                                    field: 'score',
                                    stops: [
                                        { value: scores[0], size: 8 },
                                        { value: quartiles.q1, size: 12 },
                                        { value: quartiles.q2, size: 16 },
                                        { value: quartiles.q3, size: 20 }
                                    ]
                                })
                            ]
                        });
                        // Create feature layer with explicit geometry configuration
                        this.layer = new FeatureLayer_1.default({
                            source: validFeatures,
                            objectIdField: "OBJECTID",
                            fields: [
                                {
                                    name: "OBJECTID",
                                    type: "oid",
                                    alias: "Object ID"
                                },
                                {
                                    name: "score",
                                    type: "double",
                                    alias: "Score"
                                },
                                {
                                    name: "CONAME",
                                    type: "string",
                                    alias: "Name"
                                }
                            ],
                            geometryType: "point",
                            hasZ: false,
                            hasM: false,
                            spatialReference: { wkid: 102100 },
                            renderer: this.renderer,
                            title: options.title || data.layerName || this.title,
                            displayField: "CONAME",
                        });
                        // Calculate extent from features
                        if (validFeatures.length > 0) {
                            points = validFeatures
                                .map(function (f) { return f.geometry; })
                                .filter(function (p) { return p && typeof p.x === 'number' && typeof p.y === 'number'; });
                            if (points.length > 0) {
                                xCoords = points.map(function (p) { return p.x; });
                                yCoords = points.map(function (p) { return p.y; });
                                xmin = Math.min.apply(Math, xCoords);
                                ymin = Math.min.apply(Math, yCoords);
                                xmax = Math.max.apply(Math, xCoords);
                                ymax = Math.max.apply(Math, yCoords);
                                this.extent = new Extent_1.default({
                                    xmin: xmin,
                                    ymin: ymin,
                                    xmax: xmax,
                                    ymax: ymax,
                                    spatialReference: { wkid: 102100 }
                                });
                                // Add padding to extent
                                this.extent.expand(1.2);
                            }
                        }
                        console.log('[HotspotVisualization] Layer state:', {
                            title: this.layer.title,
                            geometryType: this.layer.geometryType,
                            loaded: this.layer.loaded,
                            featureCount: validFeatures.length,
                            hasValidExtent: !!this.extent,
                            sampleFeature: validFeatures[0] ? {
                                geometry: {
                                    x: validFeatures[0].geometry.x,
                                    y: validFeatures[0].geometry.y
                                },
                                attributes: validFeatures[0].attributes
                            } : 'none'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _b.sent();
                        console.error('Error in initializeLayer:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    HotspotVisualization.prototype.calculateInteractionScore = function (point, layers) {
        var totalScore = 0;
        var totalFeatures = 0;
        var layerScores = {};
        // Calculate score based on proximity to features in all layers
        layers.forEach(function (layer) {
            var layerScore = 0;
            var layerFeatureCount = 0;
            layer.features.forEach(function (feature) {
                try {
                    // Get feature location
                    var featurePoint = void 0;
                    if (feature.geometry.type === 'point') {
                        var coordinates = Array.isArray(feature.geometry.coordinates) ?
                            feature.geometry.coordinates.slice(0, 2).map(Number) : [0, 0];
                        featurePoint = new Point_1.default({
                            x: feature.geometry.x || coordinates[0],
                            y: feature.geometry.y || coordinates[1],
                            spatialReference: { wkid: 102100 }
                        });
                    }
                    else if (feature.geometry.type === 'polygon') {
                        var rings = feature.geometry.rings ||
                            (Array.isArray(feature.geometry.coordinates) && Array.isArray(feature.geometry.coordinates[0]) ?
                                [feature.geometry.coordinates] :
                                [[]]);
                        var polygon = new Polygon_1.default({
                            rings: rings,
                            spatialReference: { wkid: 102100 }
                        });
                        featurePoint = polygon.centroid;
                    }
                    else {
                        return;
                    }
                    // Calculate distance-based score
                    var distance = geometryEngine.distance(point, featurePoint, 'meters');
                    if (distance !== null) {
                        // Score decreases with distance, max score at 0 distance
                        var score = Math.max(0, 1 - (distance / 10000)); // 10km radius
                        layerScore += score;
                        layerFeatureCount++;
                    }
                }
                catch (error) {
                    console.warn('Error calculating interaction score:', error);
                }
            });
            if (layerFeatureCount > 0) {
                layerScores[layer.name] = layerScore / layerFeatureCount;
                totalScore += layerScore;
                totalFeatures += layerFeatureCount;
            }
        });
        // Calculate weighted average of layer scores
        var layerCount = Object.keys(layerScores).length;
        if (layerCount > 0) {
            // Normalize scores to account for number of layers
            return totalFeatures > 0 ? (totalScore / totalFeatures) * (layerCount / layers.length) : 0;
        }
        return 0;
    };
    HotspotVisualization.prototype.calculateDensityScore = function (point) {
        if (!this.spatialIndex)
            return 0;
        var searchRadius = 15000; // 15km radius
        var nearbyPoints = this.spatialIndex.getNearbyPoints(point, searchRadius);
        if (nearbyPoints.length <= 1)
            return 0;
        var totalScore = 0;
        var weightSum = 0;
        // Use squared distance for faster comparison
        var searchRadiusSquared = searchRadius * searchRadius;
        nearbyPoints.forEach(function (nearbyPoint) {
            // Skip self
            if (nearbyPoint.x === point.x && nearbyPoint.y === point.y) {
                return;
            }
            // Calculate squared distance (faster than exact distance)
            var dx = nearbyPoint.x - point.x;
            var dy = nearbyPoint.y - point.y;
            var distanceSquared = dx * dx + dy * dy;
            if (distanceSquared <= searchRadiusSquared) {
                // Use inverse distance weighting
                var distance = Math.sqrt(distanceSquared);
                var weight = 1 / (1 + distance / searchRadius);
                totalScore += weight;
                weightSum += 1;
            }
        });
        // Return raw score - we'll use quartiles in the renderer
        return weightSum > 0 ? totalScore / weightSum : 0;
    };
    return HotspotVisualization;
}(base_visualization_1.BaseVisualization));
exports.HotspotVisualization = HotspotVisualization;
