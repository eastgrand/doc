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
exports.TopNVisualization = void 0;
var FeatureLayer_1 = require("@arcgis/core/layers/FeatureLayer");
var SimpleRenderer_1 = require("@arcgis/core/renderers/SimpleRenderer");
var SimpleFillSymbol_1 = require("@arcgis/core/symbols/SimpleFillSymbol");
var SimpleMarkerSymbol_1 = require("@arcgis/core/symbols/SimpleMarkerSymbol");
var base_visualization_1 = require("./base-visualization");
var Extent_1 = require("@arcgis/core/geometry/Extent");
var Graphic_1 = require("@arcgis/core/Graphic");
var SpatialReference_1 = require("@arcgis/core/geometry/SpatialReference");
var lodash_1 = require("lodash");
var Polygon_1 = require("@arcgis/core/geometry/Polygon");
var Point_1 = require("@arcgis/core/geometry/Point");
var Polyline_1 = require("@arcgis/core/geometry/Polyline");
var TopNVisualization = /** @class */ (function (_super) {
    __extends(TopNVisualization, _super);
    function TopNVisualization() {
        var _this = _super.call(this) || this;
        // Create basic renderers that will be configured with actual data values later
        _this.polygonRenderer = new SimpleRenderer_1.default({
            symbol: new SimpleFillSymbol_1.default({
                color: [49, 163, 84, 0.9],
                outline: { color: [0, 0, 0, 0.8], width: 1 }
            })
        });
        _this.pointRenderer = new SimpleRenderer_1.default({
            symbol: new SimpleMarkerSymbol_1.default({
                color: [49, 163, 84, 0.9],
                size: 10,
                outline: { color: [0, 0, 0, 0.8], width: 1.5 }
            })
        });
        return _this;
    }
    TopNVisualization.prototype.configureRenderer = function (field, values) {
        // Sort values in descending order
        var sortedValues = __spreadArray([], values, true).sort(function (a, b) { return b - a; });
        // Calculate breaks using actual data values
        var maxValue = sortedValues[0];
        var q2 = sortedValues[Math.floor(sortedValues.length * 0.25)] || maxValue * 0.75;
        var q3 = sortedValues[Math.floor(sortedValues.length * 0.5)] || maxValue * 0.5;
        // Configure polygon renderer
        this.polygonRenderer = new SimpleRenderer_1.default({
            symbol: new SimpleFillSymbol_1.default({
                color: [49, 163, 84, 0.9],
                outline: { color: [0, 0, 0, 0.8], width: 1 }
            }),
            visualVariables: [{
                    type: "color",
                    field: field,
                    stops: [
                        { value: maxValue, color: [230, 0, 0, 0.9] }, // Highest values - Red
                        { value: q2, color: [49, 163, 84, 0.9] }, // High values - Green
                        { value: q3, color: [161, 217, 155, 0.8] } // Lower values - Light green
                    ]
                }, {
                    type: "size",
                    field: field,
                    stops: [
                        { value: maxValue, size: 2 },
                        { value: q2, size: 1 },
                        { value: q3, size: 0.5 }
                    ],
                    target: "outline"
                }]
        });
        // Configure point renderer
        this.pointRenderer = new SimpleRenderer_1.default({
            symbol: new SimpleMarkerSymbol_1.default({
                color: [49, 163, 84, 0.9],
                size: 10,
                outline: { color: [0, 0, 0, 0.8], width: 1.5 }
            }),
            visualVariables: [{
                    type: "color",
                    field: field,
                    stops: [
                        { value: maxValue, color: [230, 0, 0, 0.9] }, // Highest values - Red
                        { value: q2, color: [49, 163, 84, 0.9] }, // High values - Green
                        { value: q3, color: [161, 217, 155, 0.8] } // Lower values - Light green
                    ]
                }]
        });
    };
    TopNVisualization.prototype.getRendererForGeometryType = function (geometryType) {
        return geometryType === 'point' ? this.pointRenderer : this.polygonRenderer;
    };
    TopNVisualization.prototype.validateInput = function (data) {
        console.log('=== Validating TopN Input Data ===');
        var errors = [];
        var validation = {
            isValid: true,
            errors: [],
            validationTimeMs: '0'
        };
        // Validate required fields
        if (!data.features || data.features.length === 0) {
            errors.push('No features provided');
            validation.isValid = false;
        }
        if (!data.field) {
            errors.push('No field specified for sorting');
            validation.isValid = false;
        }
        if (!data.n || data.n <= 0) {
            errors.push('Invalid N value');
            validation.isValid = false;
        }
        validation.errors = errors;
        console.log('Input validation:', validation);
        console.log('Input validation complete');
        return validation;
    };
    TopNVisualization.prototype.validateFeatures = function (features) {
        var startTime = performance.now();
        var validation = {
            total: features.length,
            validGeometry: 0,
            validAttributes: 0,
            geometryTypes: new Set(),
            spatialReferences: new Set()
        };
        var errors = [];
        if (!(features === null || features === void 0 ? void 0 : features.length)) {
            errors.push('No features provided');
            return {
                isValid: false,
                errors: errors,
                validationTimeMs: (performance.now() - startTime).toFixed(2)
            };
        }
        features.forEach(function (feature, index) {
            var _a, _b;
            // Validate geometry
            if (feature.geometry) {
                var geomType = (_a = feature.geometry.type) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                validation.geometryTypes.add(geomType);
                // Check for valid polygon geometry
                if (geomType === 'polygon') {
                    var rings = feature.geometry.rings;
                    if (Array.isArray(rings) && rings.length > 0) {
                        // Validate ring structure
                        var hasValidRings = rings.every(function (ring) {
                            return Array.isArray(ring) &&
                                ring.length >= 3 &&
                                ring.every(function (coord) {
                                    return Array.isArray(coord) &&
                                        coord.length === 2 &&
                                        typeof coord[0] === 'number' &&
                                        typeof coord[1] === 'number' &&
                                        !isNaN(coord[0]) &&
                                        !isNaN(coord[1]);
                                });
                        });
                        if (hasValidRings) {
                            validation.validGeometry++;
                        }
                        else {
                            console.warn("Feature ".concat(index, " has invalid ring structure:"), rings);
                        }
                    }
                }
                // Track spatial reference
                if ((_b = feature.geometry.spatialReference) === null || _b === void 0 ? void 0 : _b.wkid) {
                    validation.spatialReferences.add(feature.geometry.spatialReference.wkid);
                }
            }
            // Validate attributes
            if (feature.attributes && Object.keys(feature.attributes).length > 0) {
                validation.validAttributes++;
            }
        });
        // Check for validation issues
        if (validation.validGeometry === 0) {
            errors.push('No features have valid geometries');
        }
        if (validation.validAttributes === 0) {
            errors.push('No features have valid attributes');
        }
        if (validation.spatialReferences.size > 1) {
            console.warn('Multiple spatial references detected:', Array.from(validation.spatialReferences));
        }
        console.log('Feature validation:', {
            total: validation.total,
            validGeometry: validation.validGeometry,
            validAttributes: validation.validAttributes,
            geometryTypes: Array.from(validation.geometryTypes),
            spatialReferences: Array.from(validation.spatialReferences)
        });
        return {
            isValid: errors.length === 0,
            errors: errors,
            validationTimeMs: (performance.now() - startTime).toFixed(2)
        };
    };
    TopNVisualization.prototype.applyFilterConditions = function (features, conditions) {
        console.log('Applying filter conditions:', conditions);
        return features.filter(function (feature) {
            return conditions.every(function (condition) {
                var value = feature.attributes[condition.field];
                if (typeof value !== 'number' || !(0, lodash_1.isFinite)(value)) {
                    console.warn("Invalid value for field ".concat(condition.field, ":"), value);
                    return false;
                }
                switch (condition.operator) {
                    case '>':
                        return value > condition.value;
                    case '<':
                        return value < condition.value;
                    case '>=':
                        return value >= condition.value;
                    case '<=':
                        return value <= condition.value;
                    case '==':
                        return value === condition.value;
                    case '!=':
                        return value !== condition.value;
                    default:
                        return false;
                }
            });
        });
    };
    TopNVisualization.prototype.calculateTopN = function (features, field, n) {
        var _this = this;
        console.log('Calculating top N features:', {
            totalFeatures: features.length,
            field: field,
            n: n
        });
        // Filter valid features (has geometry and valid field value)
        var validFeatures = features.filter(function (f) {
            var _a;
            var rawValue = f.attributes[field];
            var value = Number(rawValue);
            console.log('Processing feature value:', {
                raw: rawValue,
                converted: value,
                attributes: Object.keys(f.attributes),
                type: typeof rawValue
            });
            var hasValidValue = (0, lodash_1.isFinite)(value);
            var geometry = f.geometry;
            // Generic geometry validation
            var hasValidGeometry = _this.validateGeometry(geometry);
            if (!hasValidValue || !hasValidGeometry) {
                console.warn('Invalid feature:', {
                    value: value,
                    hasValidValue: hasValidValue,
                    hasValidGeometry: hasValidGeometry,
                    geometryType: geometry === null || geometry === void 0 ? void 0 : geometry.type,
                    spatialReference: (_a = geometry === null || geometry === void 0 ? void 0 : geometry.spatialReference) === null || _a === void 0 ? void 0 : _a.wkid
                });
            }
            return hasValidValue && hasValidGeometry;
        });
        console.log('Valid features:', {
            count: validFeatures.length,
            sampleFeatures: validFeatures.slice(0, 3).map(function (f) {
                var _a;
                return ({
                    value: f.attributes[field],
                    geometryType: f.geometry.type,
                    spatialReference: (_a = f.geometry.spatialReference) === null || _a === void 0 ? void 0 : _a.wkid
                });
            })
        });
        // Sort features by value in descending order
        var sortedFeatures = validFeatures.sort(function (a, b) {
            var valueA = Number(a.attributes[field]);
            var valueB = Number(b.attributes[field]);
            return valueB - valueA;
        });
        // Take top N features
        var topFeatures = sortedFeatures.slice(0, n);
        // Find the name/description field for feature descriptions
        var nameField = this.findNameField(validFeatures[0]);
        console.log('Selected features:', {
            total: topFeatures.length,
            sampleFeatures: topFeatures.map(function (f) { return ({
                value: f.attributes[field],
                attributes: f.attributes
            }); })
        });
        // Create ranked features
        var rankedFeatures = topFeatures.map(function (feature, index) {
            var _a, _b, _c;
            var rank = index + 1;
            var value = Number(feature.attributes[field]);
            try {
                // Create a new geometry with explicit spatial reference
                var sourceGeometry = feature.geometry;
                var targetSpatialReference = sourceGeometry.spatialReference || new SpatialReference_1.default({ wkid: 102100 });
                var newGeometry = _this.createGeometry(sourceGeometry, targetSpatialReference);
                if (!newGeometry) {
                    throw new Error('Failed to create valid geometry');
                }
                // Create a descriptive label using available fields
                var description = _this.createFeatureDescription(feature, field, rank, nameField);
                return new Graphic_1.default({
                    geometry: newGeometry,
                    attributes: __assign(__assign({ OBJECTID: feature.attributes.OBJECTID || index + 1 }, feature.attributes), { RANK: rank, DESCRIPTION: description })
                });
            }
            catch (error) {
                console.error('Error creating ranked feature:', error, {
                    featureId: feature.attributes.OBJECTID,
                    rank: rank,
                    geometryType: (_a = feature.geometry) === null || _a === void 0 ? void 0 : _a.type,
                    spatialReference: (_c = (_b = feature.geometry) === null || _b === void 0 ? void 0 : _b.spatialReference) === null || _c === void 0 ? void 0 : _c.wkid
                });
                return null;
            }
        }).filter(function (f) { return f !== null; });
        console.log('Ranked features:', {
            count: rankedFeatures.length,
            sampleFeatures: rankedFeatures.slice(0, 3).map(function (f) { return ({
                rank: f.attributes.RANK,
                value: f.attributes[field],
                description: f.attributes.DESCRIPTION,
                geometryType: f.geometry.type
            }); })
        });
        return rankedFeatures;
    };
    TopNVisualization.prototype.validateGeometry = function (geometry) {
        var _a, _b;
        if (!geometry || !geometry.type)
            return false;
        switch (geometry.type.toLowerCase()) {
            case 'polygon':
                var poly = geometry;
                return !!(((_a = poly.rings) === null || _a === void 0 ? void 0 : _a.length) > 0 && poly.rings.every(function (ring) {
                    return Array.isArray(ring) && ring.length >= 3 && ring.every(function (coord) {
                        return Array.isArray(coord) && coord.length === 2 &&
                            (0, lodash_1.isFinite)(coord[0]) && (0, lodash_1.isFinite)(coord[1]);
                    });
                }));
            case 'point':
                var point = geometry;
                return !!((0, lodash_1.isFinite)(point.x) && (0, lodash_1.isFinite)(point.y));
            case 'polyline':
                var line = geometry;
                return !!(((_b = line.paths) === null || _b === void 0 ? void 0 : _b.length) > 0 && line.paths.every(function (path) {
                    return Array.isArray(path) && path.length >= 2 && path.every(function (coord) {
                        return Array.isArray(coord) && coord.length === 2 &&
                            (0, lodash_1.isFinite)(coord[0]) && (0, lodash_1.isFinite)(coord[1]);
                    });
                }));
            default:
                return false;
        }
    };
    TopNVisualization.prototype.findNameField = function (feature) {
        if (!(feature === null || feature === void 0 ? void 0 : feature.attributes))
            return null;
        // Common name field patterns
        var namePatterns = [
            /^name$/i,
            /^description$/i,
            /^title$/i,
            /^label$/i,
            /.*name.*/i,
            /.*description.*/i,
            /.*title.*/i,
            /.*label.*/i
        ];
        var _loop_1 = function (pattern) {
            var field = Object.keys(feature.attributes).find(function (key) { return pattern.test(key); });
            if (field)
                return { value: field };
        };
        // Try to find a matching field
        for (var _i = 0, namePatterns_1 = namePatterns; _i < namePatterns_1.length; _i++) {
            var pattern = namePatterns_1[_i];
            var state_1 = _loop_1(pattern);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return null;
    };
    TopNVisualization.prototype.createGeometry = function (sourceGeometry, targetSpatialReference) {
        switch (sourceGeometry.type.toLowerCase()) {
            case 'polygon':
                var poly = sourceGeometry;
                var validRings = poly.rings.map(function (ring) {
                    return ring.map(function (coord) {
                        var x = coord[0], y = coord[1];
                        return [
                            typeof x === 'number' && (0, lodash_1.isFinite)(x) ? x : 0,
                            typeof y === 'number' && (0, lodash_1.isFinite)(y) ? y : 0
                        ];
                    });
                }).filter(function (ring) { return ring.length >= 3; });
                if (!validRings.length) {
                    throw new Error('No valid rings after normalization');
                }
                return new Polygon_1.default({
                    rings: validRings,
                    spatialReference: targetSpatialReference
                });
            case 'point':
                var point = sourceGeometry;
                return new Point_1.default({
                    x: point.x,
                    y: point.y,
                    spatialReference: targetSpatialReference
                });
            case 'polyline':
                var line = sourceGeometry;
                var validPaths = line.paths.map(function (path) {
                    return path.map(function (coord) {
                        var x = coord[0], y = coord[1];
                        return [
                            typeof x === 'number' && (0, lodash_1.isFinite)(x) ? x : 0,
                            typeof y === 'number' && (0, lodash_1.isFinite)(y) ? y : 0
                        ];
                    });
                }).filter(function (path) { return path.length >= 2; });
                if (!validPaths.length) {
                    throw new Error('No valid paths after normalization');
                }
                return new Polyline_1.default({
                    paths: validPaths,
                    spatialReference: targetSpatialReference
                });
            default:
                throw new Error("Unsupported geometry type: ".concat(sourceGeometry.type));
        }
    };
    TopNVisualization.prototype.createFeatureDescription = function (feature, field, rank, nameField) {
        var value = Number(feature.attributes[field]);
        var name = nameField ? feature.attributes[nameField] : '';
        var formattedValue = "$".concat(value.toLocaleString());
        if (name) {
            return "".concat(rank, ". ").concat(name, ": ").concat(formattedValue);
        }
        else {
            return "".concat(rank, ". ").concat(field, " = ").concat(formattedValue);
        }
    };
    TopNVisualization.prototype.create = function (data_1) {
        return __awaiter(this, arguments, void 0, function (data, options) {
            var inputValidation, processedFeatures, values, featureValidation, geometryType, primaryFieldConfig, primaryFieldLabel, layerConfig, commonSpatialReference, layer;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        console.log('=== Creating TopN Visualization ===');
                        inputValidation = this.validateInput(data);
                        if (!inputValidation.isValid) {
                            throw new Error("Invalid input data: ".concat(inputValidation.errors.join(', ')));
                        }
                        processedFeatures = ((_a = data.filterConditions) === null || _a === void 0 ? void 0 : _a.length)
                            ? this.applyFilterConditions(data.features, data.filterConditions)
                            : data.features;
                        values = processedFeatures
                            .map(function (f) { return Number(f.attributes[data.field]); })
                            .filter(function (v) { return (0, lodash_1.isFinite)(v); });
                        // Configure renderers with actual data values
                        this.configureRenderer(data.field, values);
                        // Calculate top N features
                        processedFeatures = this.calculateTopN(processedFeatures, data.field, data.n);
                        featureValidation = this.validateFeatures(processedFeatures);
                        if (!featureValidation.isValid) {
                            throw new Error("Feature validation failed: ".concat(featureValidation.errors.join(', ')));
                        }
                        geometryType = ((_d = (_c = (_b = processedFeatures[0]) === null || _b === void 0 ? void 0 : _b.geometry) === null || _c === void 0 ? void 0 : _c.type) === null || _d === void 0 ? void 0 : _d.toLowerCase()) || 'polygon';
                        this.renderer = this.getRendererForGeometryType(geometryType);
                        primaryFieldConfig = data.layerConfig.fields.find(function (f) { return f.name === data.field; });
                        primaryFieldLabel = (primaryFieldConfig === null || primaryFieldConfig === void 0 ? void 0 : primaryFieldConfig.label) || (primaryFieldConfig === null || primaryFieldConfig === void 0 ? void 0 : primaryFieldConfig.alias) || data.field;
                        layerConfig = {
                            fields: __spreadArray(__spreadArray([], data.layerConfig.fields, true), [
                                {
                                    name: 'rank',
                                    type: 'integer',
                                    label: 'Rank',
                                    alias: 'Rank'
                                }
                            ], false)
                        };
                        commonSpatialReference = ((_f = (_e = processedFeatures[0]) === null || _e === void 0 ? void 0 : _e.geometry) === null || _f === void 0 ? void 0 : _f.spatialReference) ||
                            new SpatialReference_1.default({ wkid: 102100 });
                        layer = new FeatureLayer_1.default({
                            source: processedFeatures,
                            objectIdField: "OBJECTID",
                            fields: layerConfig.fields,
                            geometryType: geometryType,
                            spatialReference: commonSpatialReference,
                            renderer: this.renderer,
                            title: options.title || "Top ".concat(data.n, " Areas by ").concat(primaryFieldLabel),
                            visible: true,
                            opacity: 0.8
                        });
                        this.layer = layer;
                        // Calculate extent from processed features
                        return [4 /*yield*/, this.calculateExtent(processedFeatures)];
                    case 1:
                        // Calculate extent from processed features
                        _o.sent();
                        // Log layer creation details
                        console.log('TopN layer created:', {
                            layerId: this.layer.id,
                            title: this.layer.title,
                            featureCount: processedFeatures.length,
                            geometryType: this.layer.geometryType,
                            spatialReference: (_g = this.layer.spatialReference) === null || _g === void 0 ? void 0 : _g.wkid,
                            visible: this.layer.visible,
                            opacity: this.layer.opacity,
                            extent: this.extent ? {
                                xmin: this.extent.xmin,
                                ymin: this.extent.ymin,
                                xmax: this.extent.xmax,
                                ymax: this.extent.ymax,
                                spatialReference: (_h = this.extent.spatialReference) === null || _h === void 0 ? void 0 : _h.wkid
                            } : null,
                            sampleFeature: processedFeatures[0] ? {
                                hasGeometry: !!processedFeatures[0].geometry,
                                geometryType: (_j = processedFeatures[0].geometry) === null || _j === void 0 ? void 0 : _j.type,
                                rings: (_k = processedFeatures[0].geometry.rings) === null || _k === void 0 ? void 0 : _k.length,
                                spatialReference: (_m = (_l = processedFeatures[0].geometry) === null || _l === void 0 ? void 0 : _l.spatialReference) === null || _m === void 0 ? void 0 : _m.wkid
                            } : null
                        });
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
    TopNVisualization.prototype.getRenderer = function (geometryType) {
        if (geometryType === void 0) { geometryType = 'polygon'; }
        return this.getRendererForGeometryType(geometryType);
    };
    TopNVisualization.prototype.getLegendInfo = function () {
        var _a, _b, _c;
        var renderer = this.getRendererForGeometryType('polygon');
        var visualVariable = (_a = renderer.visualVariables) === null || _a === void 0 ? void 0 : _a[0];
        return {
            title: 'Rank',
            type: 'class-breaks',
            description: "Top ".concat(((_b = this.data) === null || _b === void 0 ? void 0 : _b.n) || 10, " areas by ").concat(((_c = this.data) === null || _c === void 0 ? void 0 : _c.field) || 'value'),
            items: (visualVariable === null || visualVariable === void 0 ? void 0 : visualVariable.stops.map(function (stop) { return ({
                label: stop.value.toString(),
                color: "rgba(".concat(stop.color.toRgba().join(','), ")"),
                shape: 'square',
                size: 16
            }); })) || []
        };
    };
    TopNVisualization.prototype.calculateExtent = function (features, options) {
        var _a, _b, _c, _d;
        if (options === void 0) { options = {}; }
        console.log('=== Calculating TopN Extent ===', {
            totalFeatures: features.length,
            geometryType: (_b = (_a = features[0]) === null || _a === void 0 ? void 0 : _a.geometry) === null || _b === void 0 ? void 0 : _b.type,
            sampleFeature: features[0]
        });
        if (!features.length) {
            console.warn('[TopNVisualization] No features provided for extent calculation');
            return null;
        }
        var xmin = Infinity;
        var ymin = Infinity;
        var xmax = -Infinity;
        var ymax = -Infinity;
        var hasValidExtent = false;
        for (var _i = 0, features_1 = features; _i < features_1.length; _i++) {
            var feature = features_1[_i];
            if (!((_c = feature.geometry) === null || _c === void 0 ? void 0 : _c.extent)) {
                console.log('Feature has no geometry extent:', {
                    hasGeometry: !!feature.geometry,
                    geometryType: (_d = feature.geometry) === null || _d === void 0 ? void 0 : _d.type,
                    attributes: feature.attributes
                });
                continue;
            }
            var extent = feature.geometry.extent;
            if ((0, lodash_1.isFinite)(extent.xmin) && (0, lodash_1.isFinite)(extent.ymin) &&
                (0, lodash_1.isFinite)(extent.xmax) && (0, lodash_1.isFinite)(extent.ymax)) {
                xmin = Math.min(xmin, extent.xmin);
                ymin = Math.min(ymin, extent.ymin);
                xmax = Math.max(xmax, extent.xmax);
                ymax = Math.max(ymax, extent.ymax);
                hasValidExtent = true;
            }
        }
        if (!hasValidExtent) {
            console.error('[TopNVisualization] Failed to calculate extent: no valid extents found');
            return null;
        }
        var extentObj = new Extent_1.default({
            xmin: xmin,
            ymin: ymin,
            xmax: xmax,
            ymax: ymax,
            spatialReference: features[0].geometry.spatialReference
        });
        // Add padding to the extent for better visualization
        var paddingFactor = options.padding || 1.2;
        extentObj.expand(paddingFactor);
        // Store the extent for later use
        this.extent = extentObj;
        return extentObj;
    };
    return TopNVisualization;
}(base_visualization_1.BaseVisualization));
exports.TopNVisualization = TopNVisualization;
