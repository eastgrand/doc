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
exports.BivariateVisualization = void 0;
var UniqueValueRenderer_1 = require("@arcgis/core/renderers/UniqueValueRenderer");
var SimpleFillSymbol_1 = require("@arcgis/core/symbols/SimpleFillSymbol");
var base_visualization_1 = require("./base-visualization");
var Color_1 = require("@arcgis/core/Color");
var BivariateVisualization = /** @class */ (function (_super) {
    __extends(BivariateVisualization, _super);
    function BivariateVisualization() {
        var _this = _super.call(this) || this;
        _this.title = 'Bivariate Analysis';
        _this.renderer = new UniqueValueRenderer_1.default();
        _this.colorMatrix = _this.createColorMatrix();
        return _this;
    }
    BivariateVisualization.prototype.calculateBreaks = function (values, numBreaks) {
        if (numBreaks === void 0) { numBreaks = 3; }
        console.log('Calculating breaks:', {
            totalValues: values.length,
            numBreaks: numBreaks,
            sampleValues: values.slice(0, 5)
        });
        var sortedValues = values.sort(function (a, b) { return a - b; });
        var breaks = [];
        for (var i = 1; i < numBreaks; i++) {
            var index = Math.floor((i / numBreaks) * sortedValues.length);
            breaks.push(sortedValues[index]);
        }
        console.log('Calculated breaks:', {
            breaks: breaks,
            min: sortedValues[0],
            max: sortedValues[sortedValues.length - 1]
        });
        return breaks;
    };
    BivariateVisualization.prototype.getBivariateClass = function (value1, value2, breaks1, breaks2) {
        var getLevel = function (value, breaks) {
            if (value <= breaks[0])
                return 'low';
            if (value <= breaks[1])
                return 'med';
            return 'high';
        };
        var level1 = getLevel(value1, breaks1);
        var level2 = getLevel(value2, breaks2);
        return "".concat(level1, "-").concat(level2);
    };
    BivariateVisualization.prototype.createColorMatrix = function () {
        return {
            'low-low': [247, 247, 247, 255], // Light gray
            'low-med': [201, 148, 199, 255], // Light purple
            'low-high': [122, 1, 119, 255], // Dark purple
            'med-low': [166, 219, 160, 255], // Light green
            'med-med': [140, 136, 140, 255], // Medium gray
            'med-high': [90, 0, 101, 255], // Dark purple-green
            'high-low': [0, 136, 55, 255], // Dark green
            'high-med': [27, 120, 55, 255], // Medium green
            'high-high': [0, 68, 27, 255] // Darkest green
        };
    };
    BivariateVisualization.prototype.create = function (data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, breaks1, breaks2, validFeatures, processedFeatures, uniqueValueInfos;
            var _this = this;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startTime = performance.now();
                        console.log('=== Bivariate Visualization Create ===');
                        // Validate input data
                        this.validateData(data);
                        breaks1 = this.calculateBreaks(data.features.map(function (f) { return f.attributes[data.field1]; }), ((_a = data.field1Breaks) === null || _a === void 0 ? void 0 : _a.length) || 3);
                        breaks2 = this.calculateBreaks(data.features.map(function (f) { return f.attributes[data.field2]; }), ((_b = data.field2Breaks) === null || _b === void 0 ? void 0 : _b.length) || 3);
                        validFeatures = data.features.filter(function (feature) {
                            var value1 = feature.attributes[data.field1];
                            var value2 = feature.attributes[data.field2];
                            return typeof value1 === 'number' && !isNaN(value1) &&
                                typeof value2 === 'number' && !isNaN(value2);
                        });
                        if (validFeatures.length === 0) {
                            throw new Error('No valid features found for bivariate analysis');
                        }
                        processedFeatures = validFeatures.map(function (feature) {
                            var mappedFeature = _this.mapFeature(feature);
                            var value1 = feature.attributes[data.field1];
                            var value2 = feature.attributes[data.field2];
                            var bivariateClass = _this.getBivariateClass(value1, value2, breaks1, breaks2);
                            mappedFeature.attributes.bivariateBin = bivariateClass;
                            mappedFeature.attributes.field1_class = _this.getLevel(value1, breaks1);
                            mappedFeature.attributes.field2_class = _this.getLevel(value2, breaks2);
                            return mappedFeature;
                        });
                        uniqueValueInfos = Object.entries(this.colorMatrix).map(function (_a) {
                            var key = _a[0], color = _a[1];
                            return ({
                                value: key,
                                symbol: new SimpleFillSymbol_1.default({
                                    color: new Color_1.default(color),
                                    outline: {
                                        color: [128, 128, 128, 0.5],
                                        width: 0.5
                                    }
                                })
                            });
                        });
                        // Update renderer
                        this.renderer = new UniqueValueRenderer_1.default({
                            field: "bivariateBin",
                            defaultSymbol: new SimpleFillSymbol_1.default({
                                color: [200, 200, 200, 0.5],
                                outline: {
                                    color: [128, 128, 128, 0.5],
                                    width: 0.5
                                }
                            }),
                            uniqueValueInfos: uniqueValueInfos
                        });
                        // Initialize layer with processed features
                        return [4 /*yield*/, this.initializeLayer(__assign(__assign({}, data), { features: processedFeatures }), options)];
                    case 1:
                        // Initialize layer with processed features
                        _c.sent();
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
    BivariateVisualization.prototype.getLevel = function (value, breaks) {
        if (value <= breaks[0])
            return 'low';
        if (value <= breaks[1])
            return 'med';
        return 'high';
    };
    BivariateVisualization.prototype.getRenderer = function () {
        return this.renderer;
    };
    BivariateVisualization.prototype.getLegendInfo = function () {
        var _a, _b;
        return {
            title: this.title,
            type: 'class-breaks',
            description: "Bivariate analysis showing relationship between ".concat(((_a = this.data) === null || _a === void 0 ? void 0 : _a.field1Label) || 'Variable 1', " and ").concat(((_b = this.data) === null || _b === void 0 ? void 0 : _b.field2Label) || 'Variable 2'),
            items: Object.entries(this.colorMatrix).map(function (_a) {
                var key = _a[0], color = _a[1];
                return ({
                    label: key.replace('-', ' / ').toUpperCase(),
                    color: "rgba(".concat(color.join(','), ")"),
                    shape: 'square',
                    size: 16
                });
            })
        };
    };
    return BivariateVisualization;
}(base_visualization_1.BaseVisualization));
exports.BivariateVisualization = BivariateVisualization;
