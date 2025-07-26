"use strict";
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
exports.BaseVisualization = void 0;
var FeatureLayer_1 = require("@arcgis/core/layers/FeatureLayer");
var Graphic_1 = require("@arcgis/core/Graphic");
var Polygon_1 = require("@arcgis/core/geometry/Polygon");
var projection = require("@arcgis/core/geometry/projection");
var SpatialReference_1 = require("@arcgis/core/geometry/SpatialReference");
var popup_utils_1 = require("@/utils/popup-utils");
var legend_1 = require("@/types/legend");
// Define Web Mercator spatial reference constant
var webMercator = new SpatialReference_1.default({ wkid: 102100 });
var BaseVisualization = /** @class */ (function () {
    function BaseVisualization() {
        this.layer = null;
        this.renderer = null;
        this.extent = null;
        this.data = null;
    }
    BaseVisualization.prototype.initializeLayer = function (data_1) {
        return __awaiter(this, arguments, void 0, function (data, options, fields) {
            var spatialRef, mappedFeatures, stats, layerFields, error_1;
            var _this = this;
            var _a, _b, _c, _d, _e;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        this.data = data;
                        console.log('=== Base Visualization Initialize ===', {
                            layerName: data.layerName,
                            rendererField: data.rendererField,
                            featureCount: (_a = data.features) === null || _a === void 0 ? void 0 : _a.length,
                            configuredFields: (_c = (_b = data.layerConfig) === null || _b === void 0 ? void 0 : _b.fields) === null || _c === void 0 ? void 0 : _c.map(function (f) { return ({
                                name: f.name,
                                type: f.type,
                                label: f.label
                            }); })
                        });
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 3, , 4]);
                        spatialRef = data.spatialReference || { wkid: 102100 };
                        mappedFeatures = data.features.map(function (f, i) { return _this.mapFeature(f, i); });
                        stats = {
                            total: mappedFeatures.length,
                            withGeometry: mappedFeatures.filter(function (f) { return f.geometry; }).length,
                            withoutGeometry: mappedFeatures.filter(function (f) { return !f.geometry; }).length,
                            geometryTypes: new Set(mappedFeatures.filter(function (f) { return f.geometry; }).map(function (f) { return f.geometry.type; }))
                        };
                        console.log('Feature mapping summary:', stats);
                        layerFields = fields || this.createFields(mappedFeatures[0]);
                        // Create layer with mapped features
                        this.layer = new FeatureLayer_1.default({
                            source: mappedFeatures,
                            objectIdField: "OBJECTID",
                            fields: layerFields,
                            renderer: this.renderer || undefined,
                            opacity: (_d = options.opacity) !== null && _d !== void 0 ? _d : 0.8,
                            title: options.title || data.layerName,
                            visible: (_e = options.visible) !== null && _e !== void 0 ? _e : true,
                            spatialReference: spatialRef,
                        });
                        // Calculate extent after layer creation
                        return [4 /*yield*/, this.calculateExtent(mappedFeatures)];
                    case 2:
                        // Calculate extent after layer creation
                        _f.sent();
                        // Ensure renderer is properly set
                        if (this.renderer) {
                            this.layer.renderer = this.renderer;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _f.sent();
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
    BaseVisualization.prototype.findPrimaryNumericField = function (fields, attributes) {
        console.log('Finding primary numeric field:', {
            availableFields: fields.map(function (f) { return ({ name: f.name, type: f.type }); }),
            attributeKeys: Object.keys(attributes)
        });
        // First check configured fields that are numeric and exist in attributes
        var numericFields = fields.filter(function (field) {
            return ['double', 'single', 'integer', 'small-integer'].includes(field.type) &&
                attributes[field.name] !== undefined &&
                typeof attributes[field.name] === 'number';
        });
        if (numericFields.length > 0) {
            console.log('Using configured numeric field:', numericFields[0].name);
            return numericFields[0].name;
        }
        // If no configured numeric fields found, check attributes
        var numericAttributes = Object.entries(attributes)
            .filter(function (_a) {
            var _ = _a[0], value = _a[1];
            return typeof value === 'number' && !isNaN(value);
        })
            .map(function (_a) {
            var key = _a[0];
            return key;
        });
        if (numericAttributes.length > 0) {
            console.log('Using numeric attribute:', numericAttributes[0]);
            return numericAttributes[0];
        }
        console.warn('No numeric fields found');
        return null;
    };
    BaseVisualization.prototype.mapFeature = function (feature, index) {
        var _a;
        if (index === void 0) { index = 0; }
        // Combine attributes and properties
        var combinedAttributes = __assign(__assign(__assign({}, feature.attributes), feature.properties), { OBJECTID: index + 1 });
        // Get geometry from feature
        var mappedGeometry = feature.geometry;
        if (!mappedGeometry) {
            return new Graphic_1.default({
                attributes: combinedAttributes
            });
        }
        // Ensure geometry has a type
        if (!mappedGeometry.type) {
            return new Graphic_1.default({
                attributes: combinedAttributes
            });
        }
        // Set spatial references
        var sourceSpatialRef = mappedGeometry.spatialReference || { wkid: 4326 }; // Default to WGS84
        var targetSpatialRef = { wkid: 102100 }; // Web Mercator
        // Only log first feature spatial reference
        if (index === 0) {
            console.log('Feature spatial reference:', {
                source: sourceSpatialRef,
                target: targetSpatialRef,
                needsProjection: sourceSpatialRef.wkid !== targetSpatialRef.wkid
            });
        }
        try {
            // Load projection engine if needed
            if (!projection.isLoaded()) {
                projection.load();
            }
            // Handle polygon geometry (both ArcGIS and GeoJSON formats)
            if ((_a = mappedGeometry.type) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('polygon')) {
                // Get rings from either format
                var rings = [];
                if (mappedGeometry.rings) {
                    rings = mappedGeometry.rings;
                }
                else if (mappedGeometry.coordinates) {
                    if (Array.isArray(mappedGeometry.coordinates[0]) && Array.isArray(mappedGeometry.coordinates[0][0])) {
                        rings = mappedGeometry.coordinates;
                    }
                    else if (Array.isArray(mappedGeometry.coordinates[0])) {
                        rings = [mappedGeometry.coordinates];
                    }
                }
                if (!rings || !rings.length) {
                    return new Graphic_1.default({
                        attributes: combinedAttributes
                    });
                }
                // Validate and clean rings
                var validRings = rings.map(function (ring) {
                    if (!Array.isArray(ring) || ring.length < 3)
                        return null;
                    var validCoords = ring.filter(function (coord) {
                        return Array.isArray(coord) &&
                            coord.length >= 2 &&
                            typeof coord[0] === 'number' &&
                            typeof coord[1] === 'number' &&
                            !isNaN(coord[0]) &&
                            !isNaN(coord[1]);
                    });
                    return validCoords.length >= 3 ? validCoords : null;
                }).filter(function (ring) { return ring !== null; });
                if (!validRings.length) {
                    return new Graphic_1.default({
                        attributes: combinedAttributes
                    });
                }
                // Create polygon with source spatial reference
                var polygon = new Polygon_1.default({
                    rings: validRings,
                    spatialReference: sourceSpatialRef
                });
                // Project to Web Mercator if needed
                if (sourceSpatialRef.wkid !== targetSpatialRef.wkid) {
                    try {
                        mappedGeometry = projection.project(polygon, targetSpatialRef);
                    }
                    catch (projError) {
                        console.error('Error projecting polygon:', projError);
                        mappedGeometry = polygon;
                    }
                }
                else {
                    mappedGeometry = polygon;
                }
            }
            return new Graphic_1.default({
                geometry: mappedGeometry,
                attributes: combinedAttributes
            });
        }
        catch (error) {
            console.error("Error mapping feature ".concat(index, ":"), error);
            return new Graphic_1.default({
                attributes: combinedAttributes
            });
        }
    };
    BaseVisualization.prototype.createFields = function (sampleFeature) {
        var _this = this;
        var fields = [];
        // Add OBJECTID field
        fields.push({
            name: 'OBJECTID',
            type: 'oid',
            alias: 'Object ID'
        });
        // Add fields from sample feature attributes
        Object.entries(sampleFeature.attributes).forEach(function (_a) {
            var _b, _c, _d;
            var name = _a[0], value = _a[1];
            if (name === 'OBJECTID')
                return;
            // Try to find field in layer config
            var configField = (_d = (_c = (_b = _this.data) === null || _b === void 0 ? void 0 : _b.layerConfig) === null || _c === void 0 ? void 0 : _c.fields) === null || _d === void 0 ? void 0 : _d.find(function (f) { return f.name === name; });
            if (configField) {
                fields.push({
                    name: configField.name,
                    type: configField.type,
                    alias: configField.label || configField.alias || configField.name
                });
            }
            else {
                // Determine field type from value
                var type = void 0;
                if (typeof value === 'number') {
                    type = Number.isInteger(value) ? 'integer' : 'double';
                }
                else if (typeof value === 'string') {
                    type = 'string';
                }
                else if (value instanceof Date) {
                    type = 'date';
                }
                else {
                    type = 'string'; // Default to string for unknown types
                }
                fields.push({
                    name: name,
                    type: type,
                    alias: name
                });
            }
        });
        console.log('Created fields:', fields.map(function (f) { return ({
            name: f.name,
            type: f.type,
            alias: f.alias
        }); }));
        return fields;
    };
    BaseVisualization.prototype.createPopupFields = function (fields) {
        return fields.map(function (field) { return ({
            fieldName: field.name || 'unknown',
            label: field.alias || field.name || 'Unknown Field',
            format: {
                places: field.type === 'double' || field.type === 'single' ? 2 : 0,
                digitSeparator: true
            }
        }); });
    };
    BaseVisualization.prototype.calculateExtent = function (features, options) {
        var _a;
        if (options === void 0) { options = {}; }
        var _b = options.padding, padding = _b === void 0 ? 1.2 : _b, _c = options.spatialReference, spatialReference = _c === void 0 ? webMercator : _c;
        console.log("[calculateExtent] Starting extent calculation with", features.length, "features");
        console.log("[calculateExtent] Target spatial reference:", spatialReference === null || spatialReference === void 0 ? void 0 : spatialReference.toJSON());
        if (!features || features.length === 0) {
            console.warn("[calculateExtent] No features provided for extent calculation");
            return null;
        }
        // Track extents for each feature
        var validExtents = [];
        var firstFeature = null;
        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            if (!feature || !feature.geometry) {
                continue;
            }
            if (!firstFeature) {
                firstFeature = feature;
                console.log("[calculateExtent] First feature geometry type:", feature.geometry.type, "with spatial reference:", (_a = feature.geometry.spatialReference) === null || _a === void 0 ? void 0 : _a.toJSON());
            }
            try {
                // Get extent from feature geometry
                var featureExtent = feature.geometry.extent;
                if (!featureExtent) {
                    console.warn("[calculateExtent] Feature ".concat(i, " has no extent"));
                    continue;
                }
                console.log("[calculateExtent] Feature ".concat(i, " raw extent:"), featureExtent.toJSON());
                // Ensure extent is in the target spatial reference
                var projectedExtent = featureExtent;
                if (featureExtent.spatialReference &&
                    spatialReference &&
                    featureExtent.spatialReference.wkid !== spatialReference.wkid) {
                    try {
                        console.log("[calculateExtent] Projecting extent from ".concat(featureExtent.spatialReference.wkid, " to ").concat(spatialReference.wkid));
                        projectedExtent = projection.project(featureExtent, spatialReference);
                        console.log("[calculateExtent] Projected extent:", projectedExtent.toJSON());
                    }
                    catch (error) {
                        console.error("[calculateExtent] Error projecting extent for feature ".concat(i, ":"), error);
                        // Skip this extent if projection fails
                        continue;
                    }
                }
                // Validate extent before adding
                if (this.isValidExtent(projectedExtent)) {
                    validExtents.push(projectedExtent);
                }
                else {
                    console.warn("[calculateExtent] Feature ".concat(i, " has invalid extent:"), projectedExtent.toJSON());
                }
            }
            catch (error) {
                console.error("[calculateExtent] Error processing extent for feature ".concat(i, ":"), error);
            }
        }
        console.log("[calculateExtent] Collected", validExtents.length, "valid extents");
        if (validExtents.length === 0) {
            console.warn("[calculateExtent] No valid extents found among features");
            return null;
        }
        // Combine all valid extents
        var finalExtent = validExtents[0].clone();
        for (var i = 1; i < validExtents.length; i++) {
            finalExtent = finalExtent.union(validExtents[i]);
        }
        console.log("[calculateExtent] Combined extent before padding:", finalExtent.toJSON());
        // Expand the extent by the padding factor
        finalExtent = finalExtent.expand(padding);
        console.log("[calculateExtent] Final extent after padding:", finalExtent.toJSON());
        // Final validation
        if (!this.isValidExtent(finalExtent)) {
            console.warn("[calculateExtent] Final extent is invalid:", finalExtent.toJSON());
            return null;
        }
        return finalExtent;
    };
    // Helper method to validate an extent
    BaseVisualization.prototype.isValidExtent = function (extent) {
        // Check for NaN values
        if (isNaN(extent.xmin) ||
            isNaN(extent.ymin) ||
            isNaN(extent.xmax) ||
            isNaN(extent.ymax)) {
            console.warn("[isValidExtent] Extent contains NaN values:", extent.toJSON());
            return false;
        }
        // Check for unreasonably large values (likely projection errors)
        var MAX_REASONABLE_COORDINATE = 50000000; // 50 million (larger than Earth's circumference in meters)
        if (Math.abs(extent.xmin) > MAX_REASONABLE_COORDINATE ||
            Math.abs(extent.ymin) > MAX_REASONABLE_COORDINATE ||
            Math.abs(extent.xmax) > MAX_REASONABLE_COORDINATE ||
            Math.abs(extent.ymax) > MAX_REASONABLE_COORDINATE) {
            console.warn("[isValidExtent] Extent contains extreme coordinate values:", extent.toJSON());
            return false;
        }
        // Check for zero or negative width/height
        if (extent.width <= 0 || extent.height <= 0) {
            console.warn("[isValidExtent] Extent has zero or negative dimensions - width:", extent.width, "height:", extent.height);
            return false;
        }
        return true;
    };
    BaseVisualization.prototype.validateData = function (data) {
        var _a;
        if (!((_a = data.features) === null || _a === void 0 ? void 0 : _a.length)) {
            throw new Error('No features provided');
        }
        if (!data.layerName) {
            throw new Error('Layer name is required');
        }
        // Validate features have required properties
        data.features.forEach(function (feature, index) {
            if (!feature.geometry) {
                throw new Error("Feature at index ".concat(index, " is missing geometry"));
            }
            if (!feature.attributes) {
                throw new Error("Feature at index ".concat(index, " is missing attributes"));
            }
        });
    };
    BaseVisualization.prototype.getLayer = function () {
        return this.layer;
    };
    BaseVisualization.prototype.getRenderer = function () {
        return this.renderer;
    };
    BaseVisualization.prototype.getExtent = function () {
        return this.extent;
    };
    /**
     * Apply popup template to a layer
     * This centralized method ensures consistent popup application across all visualization types
     */
    BaseVisualization.prototype.applyPopupTemplate = function (layer, popupConfig) {
        if (!layer)
            return;
        // Use the provided popup config or generate a default one
        var config = popupConfig || (0, popup_utils_1.createDefaultPopupConfig)(layer);
        var popupTemplate = (0, popup_utils_1.createPopupTemplateFromConfig)(config);
        layer.popupTemplate = popupTemplate;
    };
    // Add helper method to convert renderer to standardized legend data
    BaseVisualization.prototype.convertRendererToLegendData = function (title, type, description) {
        var _a;
        if (!this.renderer) {
            return {
                title: title,
                type: type,
                description: description,
                items: []
            };
        }
        var items = [];
        // Handle ClassBreaksRenderer
        if (this.renderer.type === 'class-breaks') {
            var classRenderer = this.renderer;
            classRenderer.classBreakInfos
                .filter(function (breakInfo) {
                return breakInfo.minValue !== 88888888 &&
                    breakInfo.maxValue !== 88888888 &&
                    breakInfo.label !== "No Data";
            })
                .forEach(function (breakInfo) {
                var _a;
                var symbol = breakInfo.symbol;
                if (!(symbol === null || symbol === void 0 ? void 0 : symbol.color))
                    return;
                var outlineColor = 'outline' in symbol && ((_a = symbol.outline) === null || _a === void 0 ? void 0 : _a.color)
                    ? (0, legend_1.colorToRgba)(symbol.outline.color)
                    : undefined;
                items.push({
                    label: breakInfo.label || "".concat(breakInfo.minValue, " - ").concat(breakInfo.maxValue),
                    color: (0, legend_1.colorToRgba)(symbol.color),
                    outlineColor: outlineColor,
                    shape: (0, legend_1.getSymbolShape)(symbol),
                    size: (0, legend_1.getSymbolSize)(symbol)
                });
            });
        }
        // Handle UniqueValueRenderer
        else if (this.renderer.type === 'unique-value') {
            var uniqueRenderer = this.renderer;
            uniqueRenderer.uniqueValueInfos.forEach(function (info) {
                var _a;
                var symbol = info.symbol;
                if (!(symbol === null || symbol === void 0 ? void 0 : symbol.color))
                    return;
                var outlineColor = 'outline' in symbol && ((_a = symbol.outline) === null || _a === void 0 ? void 0 : _a.color)
                    ? (0, legend_1.colorToRgba)(symbol.outline.color)
                    : undefined;
                items.push({
                    label: info.label || String(info.value),
                    color: (0, legend_1.colorToRgba)(symbol.color),
                    outlineColor: outlineColor,
                    shape: (0, legend_1.getSymbolShape)(symbol),
                    size: (0, legend_1.getSymbolSize)(symbol)
                });
            });
        }
        // Handle SimpleRenderer
        else if (this.renderer.type === 'simple') {
            var simpleRenderer = this.renderer;
            var symbol = simpleRenderer.symbol;
            if (symbol === null || symbol === void 0 ? void 0 : symbol.color) {
                var outlineColor = 'outline' in symbol && ((_a = symbol.outline) === null || _a === void 0 ? void 0 : _a.color)
                    ? (0, legend_1.colorToRgba)(symbol.outline.color)
                    : undefined;
                items.push({
                    label: title,
                    color: (0, legend_1.colorToRgba)(symbol.color),
                    outlineColor: outlineColor,
                    shape: (0, legend_1.getSymbolShape)(symbol),
                    size: (0, legend_1.getSymbolSize)(symbol)
                });
            }
        }
        return {
            title: title,
            type: type,
            description: description,
            items: items
        };
    };
    return BaseVisualization;
}());
exports.BaseVisualization = BaseVisualization;
