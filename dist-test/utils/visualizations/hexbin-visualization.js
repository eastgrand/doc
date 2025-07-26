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
exports.HexbinVisualization = void 0;
var SimpleRenderer_1 = require("@arcgis/core/renderers/SimpleRenderer");
var SimpleFillSymbol_1 = require("@arcgis/core/symbols/SimpleFillSymbol");
var Polygon_1 = require("@arcgis/core/geometry/Polygon");
var base_visualization_1 = require("./base-visualization");
var Color_1 = require("@arcgis/core/Color");
var ColorVariable_1 = require("@arcgis/core/renderers/visualVariables/ColorVariable");
var d3_array_1 = require("d3-array");
var Graphic_1 = require("@arcgis/core/Graphic");
var HexbinVisualization = /** @class */ (function (_super) {
    __extends(HexbinVisualization, _super);
    function HexbinVisualization() {
        var _this = _super.call(this) || this;
        _this.title = 'Hexbin Analysis';
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
    HexbinVisualization.prototype.calculateBreaks = function (values, numBreaks) {
        if (numBreaks === void 0) { numBreaks = 5; }
        console.log('Calculating breaks:', {
            totalValues: values.length,
            numBreaks: numBreaks,
            sampleValues: values.slice(0, 5)
        });
        var sortedValues = values.filter(function (v) { return v != null; }).sort(function (a, b) { return a - b; });
        var breaks = Array.from({ length: numBreaks - 1 }, function (_, i) {
            var p = (i + 1) / numBreaks;
            return (0, d3_array_1.quantile)(sortedValues, p) || 0;
        });
        console.log('Calculated breaks:', {
            breaks: breaks,
            min: sortedValues[0],
            max: sortedValues[sortedValues.length - 1]
        });
        return breaks;
    };
    HexbinVisualization.prototype.getColorFromValue = function (value, breaks) {
        var index = breaks.findIndex(function (b) { return value <= b; });
        var colorValues = index === -1 ?
            this.colorRamp[this.colorRamp.length - 1] :
            this.colorRamp[index];
        return new Color_1.default(colorValues);
    };
    HexbinVisualization.prototype.createHexagon = function (center, size) {
        var angles = Array.from({ length: 6 }, function (_, i) { return (i * Math.PI) / 3; });
        return angles.map(function (angle) { return [
            center[0] + size * Math.cos(angle),
            center[1] + size * Math.sin(angle)
        ]; });
    };
    HexbinVisualization.prototype.createHexGrid = function (extent, cellSize) {
        console.log('Creating hex grid:', {
            extent: {
                xmin: extent.xmin,
                ymin: extent.ymin,
                xmax: extent.xmax,
                ymax: extent.ymax
            },
            cellSize: cellSize
        });
        var hexbins = new Map();
        var sqrt3 = Math.sqrt(3);
        // Calculate grid dimensions
        var width = extent.width;
        var height = extent.height;
        var cols = Math.ceil(width / (cellSize * 1.5));
        var rows = Math.ceil(height / (cellSize * sqrt3));
        console.log('Grid dimensions:', {
            width: width,
            height: height,
            cols: cols,
            rows: rows,
            estimatedCells: cols * rows
        });
        // Calculate starting point (top-left of the grid)
        var startX = extent.xmin;
        var startY = extent.ymax;
        // Create hexagon centers
        for (var row = 0; row < rows; row++) {
            for (var col = 0; col < cols; col++) {
                var x = startX + col * cellSize * 1.5;
                var y = startY - row * cellSize * sqrt3;
                var offset = row % 2 === 0 ? 0 : cellSize * 0.75;
                var key = "".concat(Math.floor(x + offset), "_").concat(Math.floor(y));
                hexbins.set(key, []);
            }
        }
        console.log('Hex grid created:', {
            totalBins: hexbins.size,
            sampleKeys: Array.from(hexbins.keys()).slice(0, 5)
        });
        return hexbins;
    };
    HexbinVisualization.prototype.aggregatePoints = function (points, hexbins, cellSize, field, aggregationType) {
        var _this = this;
        if (aggregationType === void 0) { aggregationType = 'count'; }
        console.log('=== Starting Point Aggregation ===');
        console.log('Input data:', {
            totalPoints: points.length,
            totalHexbins: hexbins.size,
            cellSize: cellSize,
            field: field,
            aggregationType: aggregationType
        });
        // Validate input points
        var validPoints = points.filter(function (point) {
            var _a;
            if (!(point === null || point === void 0 ? void 0 : point.geometry) || point.geometry.type !== 'point') {
                console.warn('Invalid point geometry:', {
                    hasGeometry: !!(point === null || point === void 0 ? void 0 : point.geometry),
                    type: (_a = point === null || point === void 0 ? void 0 : point.geometry) === null || _a === void 0 ? void 0 : _a.type
                });
                return false;
            }
            return true;
        });
        console.log('Point validation:', {
            total: points.length,
            valid: validPoints.length,
            invalid: points.length - validPoints.length
        });
        var sqrt3 = Math.sqrt(3);
        // Assign points to hexbins
        validPoints.forEach(function (point) {
            var geometry = point.geometry;
            var x = geometry.x;
            var y = geometry.y;
            // Find the nearest hexagon center
            var col = Math.round(x / (cellSize * 1.5));
            var row = Math.round(y / (cellSize * sqrt3));
            var offset = row % 2 === 0 ? 0 : cellSize * 0.75;
            var key = "".concat(Math.floor(x + offset), "_").concat(Math.floor(y));
            var bin = hexbins.get(key);
            if (bin) {
                bin.push(point);
            }
        });
        // Create hexagon features
        var hexFeatures = Array.from(hexbins.entries())
            .filter(function (_a) {
            var _ = _a[0], points = _a[1];
            return points.length > 0;
        })
            .map(function (_a) {
            var key = _a[0], points = _a[1];
            var _b = key.split('_').map(Number), x = _b[0], y = _b[1];
            // Calculate value based on aggregation type
            var value;
            try {
                switch (aggregationType) {
                    case 'sum':
                        value = points.reduce(function (sum, p) {
                            var fieldValue = p.attributes[field];
                            if (typeof fieldValue !== 'number' || isNaN(fieldValue)) {
                                console.warn("Invalid field value for sum aggregation:", {
                                    field: field,
                                    value: fieldValue
                                });
                                return sum;
                            }
                            return sum + fieldValue;
                        }, 0);
                        break;
                    case 'mean':
                        var validValues = points.map(function (p) { return p.attributes[field]; })
                            .filter(function (v) { return typeof v === 'number' && !isNaN(v); });
                        value = validValues.length > 0
                            ? validValues.reduce(function (sum, v) { return sum + v; }, 0) / validValues.length
                            : 0;
                        break;
                    case 'count':
                    default:
                        value = points.length;
                }
            }
            catch (error) {
                console.error('Error calculating aggregated value:', error);
                value = 0;
            }
            // Create hexagon geometry
            var hexagonRings = [_this.createHexagon([x, y], cellSize)];
            var polygon = new Polygon_1.default({
                rings: hexagonRings,
                spatialReference: points[0].geometry.spatialReference
            });
            return new Graphic_1.default({
                geometry: polygon,
                attributes: {
                    value: value,
                    count: points.length,
                    OBJECTID: Math.floor(Math.random() * 1000000)
                }
            });
        });
        console.log('Aggregation complete:', {
            totalHexagons: hexFeatures.length,
            aggregationType: aggregationType,
            valueStats: {
                min: Math.min.apply(Math, hexFeatures.map(function (f) { return f.attributes.value; })),
                max: Math.max.apply(Math, hexFeatures.map(function (f) { return f.attributes.value; })),
                avg: hexFeatures.reduce(function (sum, f) { return sum + f.attributes.value; }, 0) / hexFeatures.length
            }
        });
        return hexFeatures;
    };
    HexbinVisualization.prototype.create = function (data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var processedFeatures, hexbins, hexFeatures, colorVariable;
            var _this = this;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        // Validate input data
                        this.validateData(data);
                        processedFeatures = data.features.map(function (feature) { return _this.mapFeature(feature); });
                        hexbins = this.generateHexbins(processedFeatures, data.cellSize || 1000);
                        hexFeatures = hexbins.map(function (bin, index) {
                            return new Graphic_1.default({
                                geometry: bin.polygon,
                                attributes: __assign({ OBJECTID: index + 1, count: bin.count, density: bin.density }, bin.attributes)
                            });
                        });
                        colorVariable = new ColorVariable_1.default({
                            field: 'density',
                            stops: [
                                { value: 0, color: new Color_1.default(this.colorRamp[0]) },
                                { value: Math.max.apply(Math, hexbins.map(function (b) { return b.density; })), color: new Color_1.default(this.colorRamp[4]) }
                            ]
                        });
                        // Update renderer
                        this.renderer = new SimpleRenderer_1.default({
                            symbol: new SimpleFillSymbol_1.default({
                                color: [0, 0, 0, 0],
                                outline: {
                                    color: ((_b = (_a = options === null || options === void 0 ? void 0 : options.symbolConfig) === null || _a === void 0 ? void 0 : _a.outline) === null || _b === void 0 ? void 0 : _b.color) || [255, 255, 255, 0.5],
                                    width: ((_d = (_c = options === null || options === void 0 ? void 0 : options.symbolConfig) === null || _c === void 0 ? void 0 : _c.outline) === null || _d === void 0 ? void 0 : _d.width) || 0.5
                                }
                            }),
                            visualVariables: [colorVariable]
                        });
                        // Initialize layer with hexbin features
                        return [4 /*yield*/, this.initializeLayer(__assign(__assign({}, data), { features: hexFeatures }), options)];
                    case 1:
                        // Initialize layer with hexbin features
                        _e.sent();
                        if (!this.layer || !this.extent) {
                            throw new Error('Layer or extent not initialized');
                        }
                        return [2 /*return*/, {
                                layer: this.layer,
                                extent: this.extent,
                                renderer: this.renderer,
                                legendInfo: this.getLegendInfo()
                            }];
                }
            });
        });
    };
    HexbinVisualization.prototype.generateHexbins = function (features, cellSize) {
        // Implementation of hexbin generation...
        // This is a placeholder - you'll need to implement the actual hexbin generation logic
        return [];
    };
    HexbinVisualization.prototype.getLegendInfo = function () {
        var _a, _b;
        return {
            title: this.title,
            type: 'class-breaks',
            description: "Hexbin analysis showing density of ".concat(((_a = this.data) === null || _a === void 0 ? void 0 : _a.field) || 'points', " with ").concat(((_b = this.data) === null || _b === void 0 ? void 0 : _b.cellSize) || 1000, "m cell size"),
            items: [{
                    label: 'Hexbin',
                    color: 'rgba(0, 116, 217, 0.7)',
                    shape: 'square',
                    size: 16
                }]
        };
    };
    return HexbinVisualization;
}(base_visualization_1.BaseVisualization));
exports.HexbinVisualization = HexbinVisualization;
