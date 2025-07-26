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
exports.ChoroplethVisualization = void 0;
var FeatureLayer_1 = require("@arcgis/core/layers/FeatureLayer");
var ClassBreaksRenderer_1 = require("@arcgis/core/renderers/ClassBreaksRenderer");
var SimpleFillSymbol_1 = require("@arcgis/core/symbols/SimpleFillSymbol");
var base_visualization_1 = require("./base-visualization");
var Color_1 = require("@arcgis/core/Color");
var lodash_1 = require("lodash");
var d3_array_1 = require("d3-array");
var ChoroplethVisualization = /** @class */ (function (_super) {
    __extends(ChoroplethVisualization, _super);
    function ChoroplethVisualization() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderer = null;
        _this.colorSchemes = {
            sequential: {
                colors: [
                    [237, 248, 251],
                    [179, 205, 227],
                    [140, 150, 198],
                    [136, 86, 167],
                    [129, 15, 124]
                ],
                labels: ['Very Low', 'Low', 'Medium', 'High', 'Very High']
            },
            diverging: {
                colors: [
                    [215, 48, 39],
                    [252, 141, 89],
                    [254, 224, 144],
                    [145, 207, 96],
                    [26, 152, 80]
                ],
                labels: ['Strongly Negative', 'Negative', 'Neutral', 'Positive', 'Strongly Positive']
            },
            qualitative: {
                colors: [
                    [166, 206, 227],
                    [31, 120, 180],
                    [178, 223, 138],
                    [51, 160, 44],
                    [251, 154, 153]
                ],
                labels: ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5']
            }
        };
        return _this;
    }
    ChoroplethVisualization.prototype.validateInputData = function (data) {
        var _a, _b;
        var validation = {
            hasField: !!data.field,
            field: data.field,
            hasBreaks: !!((_a = data.breaks) === null || _a === void 0 ? void 0 : _a.length),
            breakCount: ((_b = data.breaks) === null || _b === void 0 ? void 0 : _b.length) || 0,
            hasValidColorScheme: ['sequential', 'diverging', 'qualitative'].includes(data.colorScheme),
            colorScheme: data.colorScheme
        };
        if (!validation.hasField) {
            throw new Error('No field specified for choropleth visualization');
        }
        if (!validation.hasBreaks) {
            throw new Error('No breaks specified for choropleth visualization');
        }
        if (!validation.hasValidColorScheme) {
            throw new Error("Invalid color scheme: ".concat(data.colorScheme, ". Must be one of: sequential, diverging, qualitative"));
        }
    };
    ChoroplethVisualization.prototype.calculateBreaks = function (features, field, numBreaks) {
        var values = features
            .map(function (f) { return f.attributes[field]; })
            .filter(function (v) { return typeof v === 'number' && (0, lodash_1.isFinite)(v); })
            .sort(function (a, b) { return a - b; });
        if (values.length === 0) {
            throw new Error("No valid values found for field: ".concat(field));
        }
        var breaks = [];
        for (var i = 0; i <= numBreaks; i++) {
            breaks.push((0, d3_array_1.quantile)(values, i / numBreaks) || 0);
        }
        return breaks;
    };
    ChoroplethVisualization.prototype.initializeLayer = function (data_1) {
        return __awaiter(this, arguments, void 0, function (data, options) {
            var breaks, scheme;
            var _this = this;
            var _a, _b;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        breaks = data.breaks.length > 0 ? data.breaks : this.calculateBreaks(data.features, data.field, 5);
                        scheme = this.colorSchemes[data.colorScheme];
                        this.renderer = new ClassBreaksRenderer_1.default({
                            field: data.field,
                            defaultSymbol: new SimpleFillSymbol_1.default({
                                color: [200, 200, 200, 0.5],
                                outline: {
                                    color: [128, 128, 128, 0.5],
                                    width: "0.5px"
                                }
                            }),
                            classBreakInfos: breaks.map(function (break_, index) {
                                var _a;
                                return ({
                                    minValue: break_,
                                    maxValue: data.breaks[index + 1] || Infinity,
                                    symbol: new SimpleFillSymbol_1.default({
                                        color: new Color_1.default(scheme.colors[index]),
                                        outline: {
                                            color: [128, 128, 128, 0.5],
                                            width: "0.5px"
                                        }
                                    }),
                                    label: "".concat(scheme.labels[index], " (").concat(break_.toFixed(1), " - ").concat(((_a = data.breaks[index + 1]) === null || _a === void 0 ? void 0 : _a.toFixed(1)) || '∞', ")")
                                });
                            })
                        });
                        // Create feature layer
                        this.layer = new FeatureLayer_1.default({
                            title: options.title || "Choropleth Analysis",
                            source: data.features.map(function (feature) { return _this.mapFeature(feature); }),
                            renderer: this.renderer,
                            opacity: (_a = options.opacity) !== null && _a !== void 0 ? _a : 0.7,
                            visible: (_b = options.visible) !== null && _b !== void 0 ? _b : true,
                            popupTemplate: {
                                title: "{" + data.field + "}",
                                content: [
                                    {
                                        type: "fields",
                                        fieldInfos: [
                                            {
                                                fieldName: data.field,
                                                label: data.field,
                                                format: {
                                                    places: 2,
                                                    digitSeparator: true
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        });
                        // Calculate extent using base class's method
                        return [4 /*yield*/, this.calculateExtent(data.features)];
                    case 1:
                        // Calculate extent using base class's method
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ChoroplethVisualization.prototype.create = function (data_1) {
        return __awaiter(this, arguments, void 0, function (data, options) {
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Validate input data
                        this.validateData(data);
                        this.validateInputData(data);
                        // Initialize layer using overridden initializeLayer method
                        return [4 /*yield*/, this.initializeLayer(data, options)];
                    case 1:
                        // Initialize layer using overridden initializeLayer method
                        _a.sent();
                        return [2 /*return*/, {
                                layer: this.layer,
                                extent: this.extent,
                                renderer: this.renderer || undefined,
                                legendInfo: this.getLegendInfo()
                            }];
                }
            });
        });
    };
    ChoroplethVisualization.prototype.getLegendInfo = function () {
        var _a, _b;
        var renderer = this.renderer;
        return {
            title: ((_a = this.layer) === null || _a === void 0 ? void 0 : _a.title) || "Choropleth Analysis",
            type: "class-breaks",
            description: "Choropleth visualization showing distribution of ".concat(((_b = this.data) === null || _b === void 0 ? void 0 : _b.field) || 'values'),
            items: (renderer === null || renderer === void 0 ? void 0 : renderer.classBreakInfos.map(function (info) { return ({
                label: info.label,
                color: "rgba(".concat(info.symbol.color.toRgba().join(','), ")"),
                shape: 'square',
                size: 16
            }); })) || []
        };
    };
    return ChoroplethVisualization;
}(base_visualization_1.BaseVisualization));
exports.ChoroplethVisualization = ChoroplethVisualization;
