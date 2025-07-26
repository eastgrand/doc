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
exports.PointLayerVisualization = void 0;
/* eslint-disable prefer-const */
var FeatureLayer_1 = require("@arcgis/core/layers/FeatureLayer");
var SimpleRenderer_1 = require("@arcgis/core/renderers/SimpleRenderer");
var SimpleMarkerSymbol_1 = require("@arcgis/core/symbols/SimpleMarkerSymbol");
var base_visualization_1 = require("./base-visualization");
var Graphic_1 = require("@arcgis/core/Graphic");
var Point_1 = require("@arcgis/core/geometry/Point");
var field_mapping_1 = require("../field-mapping");
var legend_1 = require("@/types/legend");
var PointLayerVisualization = /** @class */ (function (_super) {
    __extends(PointLayerVisualization, _super);
    function PointLayerVisualization() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PointLayerVisualization.prototype.extractZipCode = function (address) {
        var zipRegex = /\b\d{5}(?:-\d{4})?\b/;
        var match = address.match(zipRegex);
        return match ? match[0] : null;
    };
    PointLayerVisualization.prototype.initializeLayer = function (data_1) {
        return __awaiter(this, arguments, void 0, function (data, options) {
            var primaryField, hasPrimaryField, existingField, mappedFeature, fields, graphics, error_1;
            var _this = this;
            var _a, _b;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log('=== Point Layer Visualization Initialize ===', {
                            featureCount: data.features.length,
                            layerName: data.layerName,
                            rendererField: data.rendererField,
                            layerConfig: data.layerConfig,
                            firstFeature: data.features[0]
                        });
                        // Ensure layer config exists with proper field mapping
                        if (!data.layerConfig) {
                            data.layerConfig = {
                                fields: []
                            };
                        }
                        primaryField = this.determinePrimaryField(data);
                        hasPrimaryField = data.layerConfig.fields.some(function (f) {
                            return f.name === primaryField ||
                                f.alias === primaryField ||
                                (f.alternateNames && f.alternateNames.includes(primaryField));
                        });
                        if (!hasPrimaryField) {
                            data.layerConfig.fields.push({
                                name: primaryField,
                                type: 'string',
                                alias: 'Store Name',
                                label: 'Store Name',
                                alternateNames: ['NAME', 'CONAME', 'COMPANY_NAME', 'BUSINESS_NAME', 'StoreName', 'STORE_NAME']
                            });
                        }
                        else {
                            existingField = data.layerConfig.fields.find(function (f) {
                                return f.name === primaryField ||
                                    f.alias === primaryField ||
                                    (f.alternateNames && f.alternateNames.includes(primaryField));
                            });
                            if (existingField) {
                                existingField.alternateNames = existingField.alternateNames || [];
                                if (!existingField.alternateNames.includes('CONAME')) {
                                    existingField.alternateNames.push('CONAME');
                                }
                            }
                        }
                        // Store data for use in other methods
                        this.data = data;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        mappedFeature = this.mapFeature(data.features[0]);
                        fields = this.createFields(mappedFeature);
                        // Create renderer before creating the layer
                        this.renderer = this.getRenderer(options.symbolConfig);
                        console.log('=== Creating Feature Layer ===', {
                            primaryField: primaryField,
                            mappedFeatureAttributes: mappedFeature.attributes,
                            fields: fields.map(function (f) { return ({ name: f.name, type: f.type, alias: f.alias }); })
                        });
                        graphics = data.features.map(function (f) { return _this.mapFeature(f); });
                        // Log sample graphics for debugging
                        console.log('=== Sample Graphics ===', {
                            count: graphics.length,
                            firstGraphic: graphics[0],
                            hasGeometry: graphics.every(function (g) { return g.geometry !== undefined; }),
                            geometryTypes: __spreadArray([], new Set(graphics.map(function (g) { var _a; return (_a = g.geometry) === null || _a === void 0 ? void 0 : _a.type; })), true)
                        });
                        this.layer = new FeatureLayer_1.default({
                            source: graphics,
                            objectIdField: "OBJECTID",
                            fields: fields,
                            renderer: this.renderer, // Use the already created renderer
                            opacity: (_a = options.opacity) !== null && _a !== void 0 ? _a : 0.8,
                            title: options.title || data.layerName,
                            visible: (_b = options.visible) !== null && _b !== void 0 ? _b : true,
                        });
                        // CRITICAL FIX: Store a reference to this visualization on the layer
                        // This allows MapApp to find the visualization and get legend info
                        this.layer.set('visualization', this);
                        return [4 /*yield*/, this.calculateExtent(graphics)];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _c.sent();
                        console.error('Error initializing layer:', error_1);
                        if (error_1 instanceof Error) {
                            throw new Error("Failed to initialize layer: ".concat(error_1.message));
                        }
                        throw new Error('Failed to initialize layer: Unknown error');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PointLayerVisualization.prototype.create = function (data_1) {
        return __awaiter(this, arguments, void 0, function (data, options) {
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Validate input data using base class method
                        this.validateData(data);
                        // Initialize layer using overridden initializeLayer method
                        return [4 /*yield*/, this.initializeLayer(data, options)];
                    case 1:
                        // Initialize layer using overridden initializeLayer method
                        _a.sent();
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
    PointLayerVisualization.prototype.getRenderer = function (symbolConfig) {
        var _a, _b;
        var defaultSymbol = new SimpleMarkerSymbol_1.default({
            color: (symbolConfig === null || symbolConfig === void 0 ? void 0 : symbolConfig.color) || [0, 122, 194, 0.8],
            size: (symbolConfig === null || symbolConfig === void 0 ? void 0 : symbolConfig.size) || 8,
            outline: {
                color: ((_a = symbolConfig === null || symbolConfig === void 0 ? void 0 : symbolConfig.outline) === null || _a === void 0 ? void 0 : _a.color) || [255, 255, 255, 0.8],
                width: ((_b = symbolConfig === null || symbolConfig === void 0 ? void 0 : symbolConfig.outline) === null || _b === void 0 ? void 0 : _b.width) || 1
            }
        });
        return new SimpleRenderer_1.default({
            symbol: defaultSymbol
        });
    };
    PointLayerVisualization.prototype.getLegendInfo = function () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        // Ensure renderer exists and has a symbol before accessing
        if (!this.renderer || !this.renderer.symbol) {
            // Create a default renderer if none exists
            this.renderer = this.getRenderer();
        }
        var symbol = this.renderer.symbol;
        var rendererField = (_a = this.data) === null || _a === void 0 ? void 0 : _a.rendererField;
        var items = [];
        if (rendererField && ((_b = this.layer) === null || _b === void 0 ? void 0 : _b.source)) {
            // Get values from the layer
            var values = this.layer.source.toArray()
                .map(function (g) { return g.attributes[rendererField]; })
                .filter(function (v) { return typeof v === 'number' && !isNaN(v); });
            if (values.length > 0) {
                // Calculate min and max values
                var minValue = Math.min.apply(Math, values);
                var maxValue = Math.max.apply(Math, values);
                items = [{
                        label: "".concat(minValue.toLocaleString(), " - ").concat(maxValue.toLocaleString()),
                        color: (0, legend_1.colorToRgba)(symbol.color),
                        outlineColor: ((_c = symbol.outline) === null || _c === void 0 ? void 0 : _c.color) ? (0, legend_1.colorToRgba)(symbol.outline.color) : undefined,
                        shape: (0, legend_1.getSymbolShape)(symbol),
                        size: (0, legend_1.getSymbolSize)(symbol)
                    }];
            }
        }
        // Fallback to single item if no values found
        if (items.length === 0) {
            items = [{
                    label: ((_d = this.layer) === null || _d === void 0 ? void 0 : _d.title) || "Points",
                    color: (0, legend_1.colorToRgba)(symbol.color),
                    outlineColor: ((_e = symbol.outline) === null || _e === void 0 ? void 0 : _e.color) ? (0, legend_1.colorToRgba)(symbol.outline.color) : undefined,
                    shape: (0, legend_1.getSymbolShape)(symbol),
                    size: (0, legend_1.getSymbolSize)(symbol)
                }];
        }
        return {
            title: ((_f = this.layer) === null || _f === void 0 ? void 0 : _f.title) || "Points",
            type: 'simple',
            description: "Point layer showing ".concat(((_h = (_g = this.data) === null || _g === void 0 ? void 0 : _g.features) === null || _h === void 0 ? void 0 : _h.length) || 0, " locations"),
            items: items
        };
    };
    PointLayerVisualization.prototype.mapFeature = function (feature) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        console.log('=== Point Layer Feature Mapping ===', {
            hasProperties: !!feature.properties,
            hasAttributes: !!feature.attributes,
            properties: feature.properties,
            attributes: feature.attributes,
            rendererField: (_a = feature.properties) === null || _a === void 0 ? void 0 : _a.rendererField,
            rendererValue: (_b = feature.properties) === null || _b === void 0 ? void 0 : _b.rendererValue,
            geometry: feature.geometry
        });
        // Create point geometry from coordinates
        var geometry;
        if (((_c = feature.geometry) === null || _c === void 0 ? void 0 : _c.type) === 'point' && Array.isArray(feature.geometry.coordinates)) {
            geometry = new Point_1.default({
                x: feature.geometry.coordinates[0],
                y: feature.geometry.coordinates[1],
                spatialReference: { wkid: 4326 }
            });
        }
        // Map the fields using the field mapping utility
        var mappedAttributes = (0, field_mapping_1.mapFeatureFields)(feature, ((_e = (_d = this.data) === null || _d === void 0 ? void 0 : _d.layerConfig) === null || _e === void 0 ? void 0 : _e.fields) || []);
        // Create a new attributes object combining mapped fields and ensuring OBJECTID
        var combinedAttributes = __assign(__assign({}, mappedAttributes), { OBJECTID: ((_f = feature.attributes) === null || _f === void 0 ? void 0 : _f.OBJECTID) || ((_g = feature.properties) === null || _g === void 0 ? void 0 : _g.OBJECTID) || Date.now() });
        // Ensure renderer field and value are set
        if (((_h = feature.properties) === null || _h === void 0 ? void 0 : _h.rendererField) && ((_j = feature.properties) === null || _j === void 0 ? void 0 : _j.rendererValue)) {
            combinedAttributes[feature.properties.rendererField] = feature.properties.rendererValue;
        }
        // Create the feature with combined attributes
        var mappedFeature = new Graphic_1.default({
            geometry: geometry,
            attributes: combinedAttributes
        });
        console.log('=== Point Layer Mapping Result ===', {
            hasGeometry: !!mappedFeature.geometry,
            attributes: mappedFeature.attributes,
            mappedFields: Object.keys(mappedFeature.attributes)
        });
        return mappedFeature;
    };
    PointLayerVisualization.prototype.determinePrimaryField = function (data) {
        var _a, _b, _c;
        // First try renderer field from data
        if (data.rendererField) {
            return data.rendererField;
        }
        // Then check layer config
        if ((_a = data.layerConfig) === null || _a === void 0 ? void 0 : _a.fields) {
            // Look for fields with name-like properties
            var nameFields = data.layerConfig.fields.filter(function (f) {
                return /name|title|label/i.test(f.name) ||
                    /name|title|label/i.test(f.alias || '');
            });
            if (nameFields.length > 0) {
                return nameFields[0].name;
            }
        }
        // Check first feature for common name fields
        if ((_b = data.features[0]) === null || _b === void 0 ? void 0 : _b.attributes) {
            var commonFields = ['name', 'title', 'label', 'displayName'];
            for (var _i = 0, commonFields_1 = commonFields; _i < commonFields_1.length; _i++) {
                var field = commonFields_1[_i];
                if (data.features[0].attributes[field]) {
                    return field;
                }
            }
        }
        // Default to first string field
        if ((_c = data.layerConfig) === null || _c === void 0 ? void 0 : _c.fields) {
            var stringField = data.layerConfig.fields.find(function (f) { return f.type === 'string'; });
            if (stringField) {
                return stringField.name;
            }
        }
        // Final fallback
        return 'name';
    };
    return PointLayerVisualization;
}(base_visualization_1.BaseVisualization));
exports.PointLayerVisualization = PointLayerVisualization;
