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
exports.SingleLayerVisualization = void 0;
/* eslint-disable no-prototype-builtins */
/* eslint-disable prefer-const */
var FeatureLayer_1 = require("@arcgis/core/layers/FeatureLayer");
var SimpleRenderer_1 = require("@arcgis/core/renderers/SimpleRenderer");
var SimpleFillSymbol_1 = require("@arcgis/core/symbols/SimpleFillSymbol");
var ClassBreaksRenderer_1 = require("@arcgis/core/renderers/ClassBreaksRenderer");
var Graphic_1 = require("@arcgis/core/Graphic");
var SpatialReference_1 = require("@arcgis/core/geometry/SpatialReference");
var geometryEngineAsync = require("@arcgis/core/geometry/geometryEngineAsync");
var labelPointOperator = require("@arcgis/core/geometry/operators/labelPointOperator.js");
var projection = require("@arcgis/core/geometry/projection");
var base_visualization_1 = require("./base-visualization");
var createQuartileRenderer_1 = require("../createQuartileRenderer");
var geometry_1 = require("../geometry");
var popup_utils_1 = require("@/utils/popup-utils");
var density_clustering_1 = require("density-clustering");
var microservice_types_1 = require("@/types/microservice-types");
var SingleLayerVisualization = /** @class */ (function (_super) {
    __extends(SingleLayerVisualization, _super);
    function SingleLayerVisualization() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.layer = null;
        _this.renderer = null;
        _this.extent = null;
        _this.data = null;
        _this.options = {};
        return _this;
    }
    SingleLayerVisualization.prototype.calculateBreakPoints = function (values) {
        if (values.length === 0)
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
    SingleLayerVisualization.prototype.formatBreakLabel = function (value) {
        return value.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };
    SingleLayerVisualization.prototype.processFeatures = function (features) {
        return __awaiter(this, void 0, void 0, function () {
            var rendererFieldName, validGraphics, i, feature, safeIndex, sourceAttrs, rendererValue, numericValue, parsed, originalEsriGeom, geom, simplifiedGeom, outputAttributes, graphic, error_1;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        // *** ADDED: Log the received layerConfig ***
                        console.log('[processFeatures] Received layerConfig:', (_a = this.data) === null || _a === void 0 ? void 0 : _a.layerConfig);
                        rendererFieldName = (_b = this.data) === null || _b === void 0 ? void 0 : _b.rendererField;
                        console.log("[processFeatures] Using rendererField from data: ".concat(rendererFieldName));
                        if (!rendererFieldName) {
                            console.error("[processFeatures] Critical error: rendererField is missing from data object.");
                            return [2 /*return*/, []]; // Cannot proceed without knowing which field to use
                        }
                        console.log("[processFeatures] Starting simplified processing of ".concat(features.length, " features"));
                        validGraphics = [];
                        i = 0;
                        _d.label = 1;
                    case 1:
                        if (!(i < features.length)) return [3 /*break*/, 8];
                        feature = features[i];
                        safeIndex = (i % 2147483647) + 1;
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 6, , 7]);
                        sourceAttrs = __assign(__assign({}, feature.attributes), feature.properties);
                        rendererValue = sourceAttrs[rendererFieldName];
                        numericValue = null;
                        if (typeof rendererValue === 'number' && !isNaN(rendererValue)) {
                            numericValue = rendererValue;
                        }
                        else if (typeof rendererValue === 'string') {
                            parsed = parseFloat(rendererValue.replace(/,/g, ''));
                            numericValue = !isNaN(parsed) ? parsed : null;
                        }
                        originalEsriGeom = (_c = feature.properties) === null || _c === void 0 ? void 0 : _c._originalEsriGeometry;
                        if (!originalEsriGeom) {
                            console.warn("Feature ".concat(i, " missing geometry, skipping"));
                            return [3 /*break*/, 7];
                        }
                        geom = (0, geometry_1.createGeometry)(originalEsriGeom);
                        if (!geom || geom.type !== 'polygon') {
                            console.warn("Feature ".concat(i, " invalid geometry type, skipping"));
                            return [3 /*break*/, 7];
                        }
                        return [4 /*yield*/, geometryEngineAsync.isSimple(geom)];
                    case 3:
                        if (_d.sent()) return [3 /*break*/, 5];
                        console.log("Feature ".concat(i, " has non-simple geometry, attempting to simplify"));
                        return [4 /*yield*/, geometryEngineAsync.simplify(geom)];
                    case 4:
                        simplifiedGeom = _d.sent();
                        // If simplification succeeded, use the simplified geometry
                        if (simplifiedGeom) {
                            geom = simplifiedGeom;
                        }
                        else {
                            console.warn("Failed to simplify feature ".concat(i, ", using original geometry"));
                        }
                        _d.label = 5;
                    case 5:
                        outputAttributes = {
                            OBJECTID: safeIndex,
                            thematic_value: numericValue,
                            // *** ADDED: Copy essential fields ***
                            TOTPOP_CY: sourceAttrs['TOTPOP_CY'] || 0, // Default to 0 if missing
                            DESCRIPTION: sourceAttrs['DESCRIPTION'] || "Feature ".concat(safeIndex) // Default description
                        };
                        graphic = new Graphic_1.default({
                            geometry: geom,
                            attributes: outputAttributes
                        });
                        validGraphics.push(graphic);
                        // Log progress
                        if (i % 500 === 0) {
                            console.log("[processFeatures] Processed ".concat(i, "/").concat(features.length, " features"));
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _d.sent();
                        console.warn("Error processing feature ".concat(i, ":"), error_1);
                        return [3 /*break*/, 7];
                    case 7:
                        i++;
                        return [3 /*break*/, 1];
                    case 8:
                        console.log("[processFeatures] Successfully created ".concat(validGraphics.length, " graphics out of ").concat(features.length, " features"));
                        return [2 /*return*/, validGraphics];
                }
            });
        });
    };
    SingleLayerVisualization.prototype.calculateBreaks = function (values, numBreaks) {
        var sorted = values.slice().sort(function (a, b) { return a - b; });
        var breaks = [];
        var step = sorted.length / numBreaks;
        for (var i = 1; i < numBreaks; i++) {
            var index = Math.floor(step * i);
            breaks.push(sorted[index]);
        }
        return breaks;
    };
    SingleLayerVisualization.prototype.getColorRamp = function (count) {
        // Use a green color ramp for distribution visualization
        var colors = [];
        for (var i = 0; i < count; i++) {
            var intensity = i / (count - 1);
            colors.push([
                Math.round(200 * (1 - intensity)),
                Math.round(200 + (55 * intensity)),
                Math.round(200 * (1 - intensity))
            ]);
        }
        return colors;
    };
    SingleLayerVisualization.prototype.createFieldsFromSample = function (sampleFeature) {
        // --- REMOVE MINIMAL FIELDS DEBUGGING BLOCK --- 
        // console.warn("[createFieldsFromSample] REVERTING TO SIMPLIFIED FIELDS FOR DEBUGGING: OBJECTID and thematic_value (double) ONLY.");
        // const fields: __esri.FieldProperties[] = [
        //     { name: "OBJECTID", type: "oid", alias: "OBJECTID" },
        //     { name: "thematic_value", type: "double", alias: "Value" } // Assume double for simplicity
        // ];
        // console.log('[createFieldsFromSample] Simplified fields defined for FeatureLayer:', fields);
        // return fields;
        // --- END REMOVAL ---
        var _a;
        // --- RESTORE REFINED FIELD DEFINITION --- 
        // --- REFINED FIELD DEFINITION ---
        if (!(sampleFeature === null || sampleFeature === void 0 ? void 0 : sampleFeature.attributes)) {
            console.warn("[createFieldsFromSample] Sample feature has no attributes. Defining minimal fields.");
            return [
                { name: "OBJECTID", type: "oid", alias: "OBJECTID" },
                { name: "thematic_value", type: "double", alias: "Value" } // Fallback
            ];
        }
        var fields = [
            { name: "OBJECTID", type: "oid", alias: "OBJECTID" } // Always include OBJECTID
        ];
        var essentialPopupFields = ['ID', 'DESCRIPTION', 'CreationDate', 'EditDate'];
        var attributes = sampleFeature.attributes;
        // 1. Determine type and existence of thematic_value
        var rendererFieldName = (_a = this.data) === null || _a === void 0 ? void 0 : _a.rendererField;
        var thematicValueType = 'double'; // Default type
        var thematicValueExistsInSample = attributes.hasOwnProperty('thematic_value');
        if (thematicValueExistsInSample) {
            thematicValueType = this.getFieldType(attributes['thematic_value'], 'thematic_value');
        }
        else if (rendererFieldName && attributes.hasOwnProperty(rendererFieldName)) {
            // If thematic_value wasn't in the processed attributes, derive type from original field
            thematicValueType = this.getFieldType(attributes[rendererFieldName], rendererFieldName);
        }
        else {
            console.warn("[createFieldsFromSample] Cannot determine type for thematic_value. Defaulting to double.");
        }
        // 2. Always add thematic_value definition
        fields.push({ name: "thematic_value", type: thematicValueType, alias: "Value" });
        var _loop_1 = function (key) {
            if (attributes.hasOwnProperty(key)) {
                // Avoid duplicate definition if rendererField happens to be an essential field
                if (!fields.some(function (f) { return f.name === key; })) {
                    fields.push({
                        name: key,
                        type: this_1.getFieldType(attributes[key], key),
                        alias: key // Use key as alias
                    });
                }
            }
        };
        var this_1 = this;
        // 3. Add definitions ONLY for essential popup fields if they exist in the sample
        for (var _i = 0, essentialPopupFields_1 = essentialPopupFields; _i < essentialPopupFields_1.length; _i++) {
            var key = essentialPopupFields_1[_i];
            _loop_1(key);
        }
        console.log('[createFieldsFromSample] Refined fields defined for FeatureLayer:', fields.map(function (f) { return ({ name: f.name, type: f.type }); }));
        return fields;
        // --- END REFINED FIELD DEFINITION ---
        // --- END RESTORE --- 
        /* --- PREVIOUS SIMPLIFIED FIELDS (COMMENTED OUT) ---
        // ...
        */
        /* --- ORIGINAL DETAILED FIELD CREATION (COMMENTED OUT) ---
        if (!sampleFeature?.attributes) return [];
        const fields: __esri.FieldProperties[] = [];
        // Ensure OBJECTID is first
        fields.push({ name: "OBJECTID", type: "oid", alias: "OBJECTID" });
    
        // *** ADDED: Get the renderer field name from data ***
        const rendererFieldName = this.data?.rendererField;
        let thematicValueType: FieldType = 'double'; // Default type
        let thematicValueExists = false;
    
        for (const [key, value] of Object.entries(sampleFeature.attributes)) {
          if (key === 'OBJECTID') continue;
    
          // *** ADDED: Specifically handle thematic_value or determine its type ***
          if (key === 'thematic_value') {
              thematicValueExists = true;
              thematicValueType = this.getFieldType(value, key); // Get type from the processed value
              fields.push({
                 name: key,
                 type: thematicValueType,
                 alias: "Value" // Use a user-friendly alias
              });
          } else if (key === rendererFieldName) {
              // If the original renderer field is still present and *not* thematic_value,
              // capture its type in case thematic_value wasn't set in the sample.
              if (!thematicValueExists) {
                  thematicValueType = this.getFieldType(value, key);
              }
              // Optionally add the original field too, or skip it if thematic_value is preferred
               fields.push({
                 name: key,
                 type: this.getFieldType(value, key),
                 alias: key // Use key as alias for simplicity
               });
          } else {
              // Add other fields
              fields.push({
                name: key,
                type: this.getFieldType(value, key),
                alias: key // Use key as alias for simplicity
              });
          }
        }
    
        // *** ADDED: Ensure 'thematic_value' field is defined even if not in sample attributes ***
        if (!thematicValueExists) {
            console.warn(`[createFieldsFromSample] 'thematic_value' was not present in the sample feature's processed attributes. Adding definition manually using type: ${thematicValueType}`);
            fields.push({
                name: "thematic_value",
                type: thematicValueType, // Use type derived from original rendererField or default
                alias: "Value"
            });
        }
    
        console.log('[createFieldsFromSample] Final fields defined for FeatureLayer:', fields.map(f => ({ name: f.name, type: f.type })));
        return fields;
        */
    };
    SingleLayerVisualization.prototype.getFieldType = function (value, fieldName) {
        if (fieldName === 'OBJECTID')
            return 'oid';
        if (fieldName === 'latitude' || fieldName === 'longitude')
            return 'double';
        if (typeof value === 'string')
            return 'string';
        if (typeof value === 'number') {
            if (Number.isInteger(value))
                return 'integer';
            return 'double';
        }
        if (value instanceof Date)
            return 'date';
        // Basic check for potential GUID
        if (typeof value === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)) {
            return 'guid';
        }
        return 'string'; // Default fallback
    };
    SingleLayerVisualization.prototype.createFieldInfos = function (fields) {
        return fields.map(function (field) { return ({
            name: field.name,
            type: field.type,
            alias: field.label || field.name // Use label if available, otherwise name
        }); });
    };
    SingleLayerVisualization.prototype.calculateExtentFromFeatures = function (features) {
        return __awaiter(this, void 0, void 0, function () {
            var validGeometries, finalExtent, i;
            var _a, _b;
            return __generator(this, function (_c) {
                if (!features || features.length === 0) {
                    console.warn('[calculateExtent] No features provided.');
                    return [2 /*return*/, null];
                }
                // --- LOGGING: Initial feature count ---
                console.log("[calculateExtent] Starting extent calculation for ".concat(features.length, " input features."));
                validGeometries = features
                    .map(function (f) { return f.geometry; })
                    .filter(function (g) {
                    return g !== null &&
                        g !== undefined &&
                        g.type === 'polygon' &&
                        !!g.extent &&
                        isFinite(g.extent.xmin) &&
                        isFinite(g.extent.ymin) &&
                        isFinite(g.extent.xmax) &&
                        isFinite(g.extent.ymax) &&
                        g.extent.width > 1e-6 && // Use a small tolerance instead of zero
                        g.extent.height > 1e-6;
                } // Use a small tolerance instead of zero
                );
                // --- LOGGING: Count after filtering ---
                console.log("[calculateExtent] Found ".concat(validGeometries.length, " valid geometries with non-zero dimension extents after filtering."));
                finalExtent = null;
                try {
                    if (validGeometries.length > 0) {
                        // --- LOGGING: First valid extent ---
                        console.log('[calculateExtent] First valid geometry extent:', JSON.stringify(validGeometries[0].extent.toJSON()));
                        // --- END LOGGING ---
                        // Initialize with the first valid extent
                        finalExtent = validGeometries[0].extent.clone();
                        // Loop through the rest and union their extents
                        for (i = 1; i < validGeometries.length; i++) {
                            if ((_a = validGeometries[i]) === null || _a === void 0 ? void 0 : _a.extent) { // Double check extent exists
                                finalExtent = finalExtent.union(validGeometries[i].extent);
                            }
                        }
                        // --- LOGGING: Final unioned extent ---
                        console.log('[calculateExtent] Final unioned extent before validation:', finalExtent ? JSON.stringify(finalExtent.toJSON()) : 'null');
                        // --- END LOGGING ---
                        // Validate the final combined extent
                        if (!finalExtent || !isFinite(finalExtent.xmin) || !isFinite(finalExtent.ymin) ||
                            !isFinite(finalExtent.xmax) || !isFinite(finalExtent.ymax) ||
                            finalExtent.width <= 1e-6 || finalExtent.height <= 1e-6) {
                            console.warn('[calculateExtent] Final unioned extent is invalid or has zero dimensions:', finalExtent ? JSON.stringify(finalExtent.toJSON()) : 'null');
                            // Fallback to the first valid extent if union fails validation
                            finalExtent = validGeometries[0].extent.clone();
                            console.log('[calculateExtent] Using fallback extent (first valid): ', finalExtent ? JSON.stringify(finalExtent.toJSON()) : 'null');
                        }
                    }
                    else {
                        // This case should ideally not be reached due to the check above
                        console.warn('[calculateExtent] No valid geometries found after filtering, returning null.');
                        return [2 /*return*/, null]; // Return null explicitly
                    }
                    console.log('[calculateExtent] Returning final calculated extent:', finalExtent ? JSON.stringify(finalExtent.toJSON()) : 'null');
                    return [2 /*return*/, finalExtent ? finalExtent.clone() : null];
                }
                catch (error) {
                    console.error('[calculateExtent] Error during extent union:', error);
                    // Fallback to the first valid extent on error
                    if (validGeometries.length > 0 && ((_b = validGeometries[0]) === null || _b === void 0 ? void 0 : _b.extent)) {
                        console.log('[calculateExtent] Error fallback: Returning first valid extent.');
                        return [2 /*return*/, validGeometries[0].extent.clone()];
                    }
                    else {
                        console.log('[calculateExtent] Error fallback: No valid extent to return, returning null.');
                        return [2 /*return*/, null]; // No valid extent to fall back to
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    SingleLayerVisualization.prototype.getRendererFromValues = function (values, field) {
        var breaks = this.calculateBreaks(values, 5);
        var colors = this.getColorRamp(breaks.length + 1);
        return new ClassBreaksRenderer_1.default({
            field: field,
            defaultSymbol: new SimpleFillSymbol_1.default({
                color: [200, 200, 200, 0.6],
                outline: { color: [128, 128, 128, 0.5], width: 0.5 }
            }),
            classBreakInfos: breaks.map(function (breakValue, index) { return ({
                minValue: index === 0 ? Math.min.apply(Math, values) : breaks[index - 1],
                maxValue: breakValue,
                symbol: new SimpleFillSymbol_1.default({
                    color: __spreadArray(__spreadArray([], colors[index], true), [0.7], false),
                    outline: { color: [128, 128, 128, 0.5], width: 0.5 }
                })
            }); })
        });
    };
    SingleLayerVisualization.prototype.create = function (data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var analysisContext, populationLookup, mapView, identifierField, sampleKey, arcGisGraphics, firstValue, processError_1, rendererField, sampleAttrs_1, fallbackField, values, percentileValue, filteredGraphics, activePopulationLookup, requiresPopulationFilter, populationLayerUrl, populationLayer, idsToFetch, whereClause, populationQuery, populationResults, fetchedPopulationMap_1, fetchError_1, pointsForDbscan_1, webMercatorSR, requiresProjection, i, graphic, geometry, targetGeometry, projectedResult, labelPoint, eps, minPoints, dbscan, dataset, clusters, clusteredGraphicsMap_1, finalGraphicsFromClusters, minClusterSize, minClusterPopulation, _loop_2, clusterId, finalGraphics, finalValues, sourceFields, tempLayer, _a, firstBreakInfo, defaultPopupConfig, layerError_1, calculatedExtent, geometriesToUnion, extentError_1;
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
            return __generator(this, function (_x) {
                switch (_x.label) {
                    case 0:
                        this.data = data;
                        this.options = options || {};
                        analysisContext = options === null || options === void 0 ? void 0 : options.analysisContext;
                        populationLookup = analysisContext === null || analysisContext === void 0 ? void 0 : analysisContext.populationLookup;
                        mapView = options === null || options === void 0 ? void 0 : options.mapView;
                        identifierField = (options === null || options === void 0 ? void 0 : options.identifierField) || 'ID';
                        // ++ LOGGING: Inputs ++
                        console.log("[SingleLayerViz DEBUG] create() called. Input data features: ".concat((_b = data.features) === null || _b === void 0 ? void 0 : _b.length, ", RendererField from options: ").concat(options === null || options === void 0 ? void 0 : options.rendererField));
                        console.log("[SingleLayerViz DEBUG] Options:", { rendererField: options === null || options === void 0 ? void 0 : options.rendererField, identifierField: identifierField, hasMapView: !!mapView, analysisContextKeys: analysisContext ? Object.keys(analysisContext) : 'null' });
                        console.log("[SingleLayerViz DEBUG] Population Lookup: Map size = ".concat(populationLookup ? populationLookup.size : 0));
                        if (populationLookup && populationLookup.size > 0) {
                            sampleKey = populationLookup.keys().next().value;
                            if (sampleKey) {
                                console.log("[SingleLayerViz DEBUG] Population Lookup Sample: Key='".concat(sampleKey, "', Value=").concat(populationLookup.get(sampleKey)));
                            }
                        }
                        // ++ END LOGGING ++
                        if (!data.features || data.features.length === 0) {
                            console.warn('[SingleLayerViz] No features provided in data.');
                            return [2 /*return*/, { layer: null, extent: null }];
                        }
                        // <<< STEP 1: Process input features (LocalGeospatialFeature[]) into ArcGIS Graphics >>>
                        console.log('[SingleLayerViz CREATE STEP 1] Calling this.processFeatures to convert input...');
                        arcGisGraphics = [];
                        _x.label = 1;
                    case 1:
                        _x.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.processFeatures(data.features)];
                    case 2:
                        arcGisGraphics = _x.sent();
                        console.log("[SingleLayerViz CREATE STEP 1] processFeatures returned ".concat(arcGisGraphics.length, " ArcGIS Graphics."));
                        // +++ LOG: Inspect processed graphics +++
                        if (arcGisGraphics.length > 0) {
                            console.log("[SingleLayerViz LOG 1a] First processed graphic attributes:", JSON.stringify(arcGisGraphics[0].attributes));
                            firstValue = (_c = arcGisGraphics[0].attributes) === null || _c === void 0 ? void 0 : _c.thematic_value;
                            console.log("[SingleLayerViz LOG 1b] First processed graphic thematic_value: ".concat(firstValue, " (Type: ").concat(typeof firstValue, ")"));
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        processError_1 = _x.sent();
                        console.error('[SingleLayerViz CREATE STEP 1] Error calling processFeatures:', processError_1);
                        return [2 /*return*/, { layer: null, extent: null }];
                    case 4:
                        if (arcGisGraphics.length === 0) {
                            console.warn('[SingleLayerViz CREATE STEP 1] processFeatures returned 0 graphics.');
                            return [2 /*return*/, { layer: null, extent: null }];
                        }
                        rendererField = (options === null || options === void 0 ? void 0 : options.rendererField) || this.findBestRendererField(arcGisGraphics);
                        // +++ LOG: Renderer Field +++
                        console.log("[SingleLayerViz LOG 2] Determined rendererField value: ".concat(rendererField));
                        // +++ END LOG +++
                        if (!rendererField) {
                            console.error("SingleLayerVisualization: Cannot determine renderer field.");
                            sampleAttrs_1 = (_d = arcGisGraphics[0]) === null || _d === void 0 ? void 0 : _d.attributes;
                            fallbackField = null;
                            if (sampleAttrs_1) {
                                fallbackField = Object.keys(sampleAttrs_1).find(function (key) { return typeof sampleAttrs_1[key] === 'number'; });
                            }
                            if (!fallbackField) {
                                console.error("Could not find any fallback numeric renderer field.");
                                return [2 /*return*/, { layer: null, extent: null }]; // Return null if no field can be determined
                            }
                            console.warn("Using fallback renderer field: ".concat(fallbackField));
                            // Cannot reassign const, so we might need to rethink this part or pass explicitly.
                            // For now, we will likely fail if options.rendererField is missing and findBestRendererField returns null.
                            return [2 /*return*/, { layer: null, extent: null }];
                        }
                        values = arcGisGraphics
                            .map(function (g) { return g.attributes[rendererField]; }) // <<< USE attributes
                            .filter(function (v) { return typeof v === 'number' && !isNaN(v); });
                        console.log("[SingleLayerViz CHECK 1] Found ".concat(values.length, " valid numeric values for field '").concat(rendererField, "'."));
                        if (values.length === 0) {
                            console.warn("SingleLayerVisualization: No valid numeric data found for renderer field:", rendererField);
                            return [2 /*return*/, { layer: null, extent: null }];
                        }
                        percentileValue = this.calculatePercentile(values, 75);
                        filteredGraphics = arcGisGraphics.filter(function (g) {
                            var attrValue = g.attributes[rendererField]; // <<< USE attributes
                            return typeof attrValue === 'number' &&
                                attrValue >= percentileValue &&
                                g.geometry;
                        });
                        console.log("[SingleLayerViz DEBUG] Initial filter: ".concat(arcGisGraphics.length, " -> ").concat(filteredGraphics.length, " features (>= 75th percentile: ").concat(percentileValue, ")"));
                        activePopulationLookup = populationLookup;
                        requiresPopulationFilter = true;
                        if (!(requiresPopulationFilter && (!activePopulationLookup || activePopulationLookup.size === 0) && filteredGraphics.length > 0)) return [3 /*break*/, 10];
                        console.log("[SingleLayerViz DEBUG] Population lookup missing or empty. Fetching required population data...");
                        _x.label = 5;
                    case 5:
                        _x.trys.push([5, 9, , 10]);
                        populationLayerUrl = "https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/8";
                        populationLayer = new FeatureLayer_1.default({ url: populationLayerUrl });
                        idsToFetch = __spreadArray([], new Set(filteredGraphics.map(function (g) { return g.attributes[identifierField]; }).filter(function (id) { return id != null; }).map(String)), true);
                        if (!(idsToFetch.length > 0)) return [3 /*break*/, 7];
                        whereClause = "ID IN (".concat(idsToFetch.map(function (id) { return "'".concat(id.replace(/'/g, "''"), "'"); }).join(','), ")");
                        populationQuery = populationLayer.createQuery();
                        populationQuery.where = whereClause;
                        populationQuery.outFields = ["ID", "TOTPOP_CY"];
                        populationQuery.returnGeometry = false;
                        populationQuery.num = 4000; // Use max record count from service info
                        console.log("[SingleLayerViz DEBUG] Querying population layer: ".concat(idsToFetch.length, " IDs"));
                        return [4 /*yield*/, populationLayer.queryFeatures(populationQuery)];
                    case 6:
                        populationResults = _x.sent();
                        fetchedPopulationMap_1 = new Map();
                        populationResults.features.forEach(function (feature) {
                            var id = feature.attributes.ID;
                            var pop = feature.attributes.TOTPOP_CY;
                            if (id != null && typeof pop === 'number' && !isNaN(pop)) {
                                fetchedPopulationMap_1.set(String(id), pop);
                            }
                        });
                        activePopulationLookup = fetchedPopulationMap_1; // Use the fetched map
                        console.log("[SingleLayerViz DEBUG] Successfully fetched and created population lookup: ".concat(activePopulationLookup.size, " entries."));
                        return [3 /*break*/, 8];
                    case 7:
                        console.warn("[SingleLayerViz DEBUG] No valid IDs found in filtered graphics to fetch population for.");
                        _x.label = 8;
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        fetchError_1 = _x.sent();
                        console.error("[SingleLayerViz DEBUG] Error fetching population data:", fetchError_1);
                        // Decide how to proceed: skip filtering, throw error, or continue without population?
                        // For now, log warning and potentially skip population-dependent filtering.
                        activePopulationLookup = new Map(); // Ensure it's an empty map
                        return [3 /*break*/, 10];
                    case 10:
                        if (!(filteredGraphics.length > 0 && activePopulationLookup)) return [3 /*break*/, 13];
                        console.log('[SingleLayerViz DEBUG] Starting DBSCAN clustering...');
                        pointsForDbscan_1 = [];
                        webMercatorSR = new SpatialReference_1.default({ wkid: 3857 });
                        requiresProjection = false;
                        if (!((_g = (_f = (_e = filteredGraphics[0]) === null || _e === void 0 ? void 0 : _e.geometry) === null || _f === void 0 ? void 0 : _f.spatialReference) === null || _g === void 0 ? void 0 : _g.isGeographic)) return [3 /*break*/, 12];
                        console.log('[SingleLayerViz DEBUG] Geometries are geographic, will project to Web Mercator for DBSCAN.');
                        requiresProjection = true;
                        if (projection.isLoaded()) return [3 /*break*/, 12];
                        return [4 /*yield*/, projection.load()];
                    case 11:
                        _x.sent();
                        _x.label = 12;
                    case 12:
                        console.log('[SingleLayerViz DEBUG] Calculating label points for DBSCAN...');
                        for (i = 0; i < filteredGraphics.length; i++) {
                            graphic = filteredGraphics[i];
                            geometry = graphic.geometry;
                            if (!geometry) {
                                console.warn("[SingleLayerViz DEBUG] Filtered graphic index ".concat(i, " missing geometry. Skipping."));
                                continue;
                            }
                            try {
                                targetGeometry = geometry;
                                // Project geometry if necessary
                                if (requiresProjection && ((_h = geometry.spatialReference) === null || _h === void 0 ? void 0 : _h.wkid) !== 3857) {
                                    projectedResult = projection.project(geometry, webMercatorSR);
                                    // Handle potential array result from projection
                                    if (Array.isArray(projectedResult)) {
                                        targetGeometry = projectedResult.length > 0 ? projectedResult[0] : null;
                                    }
                                    else {
                                        targetGeometry = projectedResult;
                                    }
                                    if (!targetGeometry) { // Check again after handling array
                                        console.warn("[SingleLayerViz DEBUG] Projection failed for graphic index ".concat(i, ". Skipping."));
                                        continue;
                                    }
                                }
                                // Calculate label point (safer than centroid)
                                // Ensure targetGeometry is not null before proceeding
                                if (!targetGeometry) {
                                    console.warn("[SingleLayerViz DEBUG] Target geometry became null for index ".concat(i, " after potential projection. Skipping."));
                                    continue;
                                }
                                labelPoint = labelPointOperator.execute(targetGeometry);
                                if (labelPoint) {
                                    pointsForDbscan_1.push({ point: [labelPoint.x, labelPoint.y], graphicIndex: i });
                                }
                                else {
                                    console.warn("[SingleLayerViz DEBUG] Could not calculate label point for graphic index ".concat(i, ". Skipping."));
                                }
                            }
                            catch (pointError) {
                                console.warn("[SingleLayerViz DEBUG] Error calculating label point for graphic index ".concat(i, ":"), pointError, "Skipping.");
                            }
                        }
                        console.log("[SingleLayerViz DEBUG] Prepared ".concat(pointsForDbscan_1.length, " points for DBSCAN."));
                        // --- End Point Preparation ---
                        if (pointsForDbscan_1.length > 0) {
                            eps = 5000;
                            if (mapView && mapView.extent)
                                eps = mapView.extent.width * 0.01;
                            // Adjust eps if projection happened and map extent is large/small
                            if (requiresProjection) {
                                // Example adjustment: clamp eps to a reasonable range like 1km to 50km
                                eps = Math.max(1000, Math.min(50000, eps));
                            }
                            minPoints = 5;
                            console.log("[SingleLayerViz DEBUG] Running DBSCAN with: eps=".concat(eps.toFixed(2), ", minPoints=").concat(minPoints, " on ").concat(pointsForDbscan_1.length, " points (Projected: ").concat(requiresProjection, ")."));
                            dbscan = new density_clustering_1.DBSCAN();
                            dataset = pointsForDbscan_1.map(function (d) { return d.point; });
                            clusters = dbscan.run(dataset, eps, minPoints);
                            console.log("[SingleLayerViz DEBUG] DBSCAN found ".concat(clusters.length, " clusters and ").concat(dbscan.noise.length, " noise points."));
                            clusteredGraphicsMap_1 = {};
                            clusters.forEach(function (clusterIndices, clusterId) {
                                clusteredGraphicsMap_1[clusterId] = clusterIndices.map(function (centroidIndex) {
                                    return filteredGraphics[pointsForDbscan_1[centroidIndex].graphicIndex];
                                } // Get graphic using the stored index
                                );
                            });
                            finalGraphicsFromClusters = [];
                            minClusterSize = 5;
                            minClusterPopulation = 10000;
                            _loop_2 = function (clusterId) {
                                var cluster = clusteredGraphicsMap_1[clusterId];
                                var clusterPopulation = 0;
                                cluster.forEach(function (graphic) {
                                    var id = graphic.attributes[identifierField];
                                    // <<< Use activePopulationLookup here >>>
                                    if (id && activePopulationLookup && activePopulationLookup.has(String(id))) {
                                        clusterPopulation += activePopulationLookup.get(String(id)) || 0;
                                    }
                                });
                                if (cluster.length >= minClusterSize && clusterPopulation >= minClusterPopulation) {
                                    finalGraphicsFromClusters.push.apply(finalGraphicsFromClusters, cluster);
                                }
                            };
                            for (clusterId in clusteredGraphicsMap_1) {
                                _loop_2(clusterId);
                            }
                            console.log("[SingleLayerViz DEBUG] Clustering filter result: ".concat(filteredGraphics.length, " -> ").concat(finalGraphicsFromClusters.length, " features"));
                            filteredGraphics = finalGraphicsFromClusters; // Update filteredGraphics
                        }
                        else {
                            console.warn("[SingleLayerViz DEBUG] No valid points prepared for DBSCAN. Skipping clustering.");
                            filteredGraphics = [];
                        }
                        return [3 /*break*/, 14];
                    case 13:
                        if (filteredGraphics.length > 0 && !populationLookup) {
                            console.warn("[SingleLayerViz DEBUG] Population lookup not provided or required. Skipping clustering filter.");
                        }
                        _x.label = 14;
                    case 14:
                        finalGraphics = filteredGraphics;
                        console.log("[SingleLayerViz CHECK 2] Final graphics count for layer creation: ".concat(finalGraphics.length, "."));
                        if (finalGraphics.length === 0) {
                            console.warn("[SingleLayerViz DEBUG] No features remaining after all filtering. Returning empty layer.");
                            return [2 /*return*/, { layer: null, extent: null }];
                        }
                        finalValues = finalGraphics
                            .map(function (g) { return g.attributes[rendererField]; }) // <<< USE attributes
                            .filter(function (v) { return typeof v === 'number' && !isNaN(v); });
                        if (finalValues.length === 0) {
                            console.warn("SingleLayerVisualization: No valid numeric data found for renderer field in final graphics:", rendererField);
                            return [2 /*return*/, { layer: null, extent: null }];
                        }
                        console.log('[SingleLayerViz CREATE] Calling this.createFieldsFromSample...');
                        sourceFields = this.createFieldsFromSample(finalGraphics[0]);
                        // +++ LOG: Layer Fields +++
                        console.log("[SingleLayerViz LOG 3a] Fields definition for FeatureLayer:", JSON.stringify(sourceFields.map(function (f) { return ({ name: f.name, type: f.type }); })));
                        // +++ END LOG +++
                        console.log("[SingleLayerViz DEBUG] Creating FeatureLayer instance.");
                        _x.label = 15;
                    case 15:
                        _x.trys.push([15, 17, , 18]);
                        console.log('[SingleLayerViz CREATE] Instantiating FeatureLayer...');
                        tempLayer = new FeatureLayer_1.default({
                            source: finalGraphics, // <<< PASS final graphics
                            objectIdField: "OBJECTID",
                            fields: sourceFields,
                            title: data.layerName || 'Filtered Layer',
                            // renderer: this.renderer, // Remove initial renderer assignment
                            geometryType: 'polygon',
                            spatialReference: new SpatialReference_1.default({ wkid: 4326 }),
                            popupEnabled: true,
                            // Popup config logic remains, might need adjustment if default relies on renderer
                            popupTemplate: (options === null || options === void 0 ? void 0 : options.popupConfig)
                                ? (0, popup_utils_1.createPopupTemplateFromConfig)(options.popupConfig)
                                : undefined // Handle default popup later if needed
                        });
                        this.layer = tempLayer; // Assign to class property
                        // +++ LOG: Layer Source Count +++
                        console.log("[SingleLayerViz LOG 3b] FeatureLayer source count after creation: ".concat((_j = this.layer.source) === null || _j === void 0 ? void 0 : _j.length));
                        // +++ END LOG +++
                        // --- ADD RENDERER CREATION HERE ---
                        console.log('[SingleLayerViz CREATE STEP 4] Calling this.createRenderer...');
                        // Now 'this.layer' is guaranteed to be a FeatureLayer instance
                        // Pass the correct field name to createRenderer
                        _a = this;
                        return [4 /*yield*/, this.createRenderer(this.layer, rendererField)];
                    case 16:
                        // Now 'this.layer' is guaranteed to be a FeatureLayer instance
                        // Pass the correct field name to createRenderer
                        _a.renderer = _x.sent();
                        // +++ LOG: Renderer Result +++
                        console.log("[SingleLayerViz LOG 4] Renderer creation result:", this.renderer ? "Type: ".concat(this.renderer.type) : 'null');
                        if (this.renderer && this.renderer.type === 'class-breaks') {
                            console.log("[SingleLayerViz LOG 4b] Class breaks count: ".concat((_k = this.renderer.classBreakInfos) === null || _k === void 0 ? void 0 : _k.length));
                            firstBreakInfo = (_l = this.renderer.classBreakInfos) === null || _l === void 0 ? void 0 : _l[0];
                            if ((_m = firstBreakInfo === null || firstBreakInfo === void 0 ? void 0 : firstBreakInfo.symbol) === null || _m === void 0 ? void 0 : _m.color) {
                                console.log("[SingleLayerViz LOG 4c] First class break color: ".concat(JSON.stringify(firstBreakInfo.symbol.color.toRgba())));
                            }
                        }
                        // +++ END LOG +++
                        // --- Assign the created renderer to the layer ---
                        this.layer.renderer = this.renderer;
                        // CRITICAL FIX: Store a reference to this visualization on the layer
                        // This allows MapApp to find the visualization and get legend info
                        this.layer.set('visualization', this);
                        // --- Assign default popup template *after* renderer exists (if needed) ---
                        if (!(options === null || options === void 0 ? void 0 : options.popupConfig) && this.layer) {
                            defaultPopupConfig = (0, popup_utils_1.createDefaultPopupConfig)(this.layer);
                            if (defaultPopupConfig) {
                                // Convert the configuration object to a PopupTemplate instance
                                this.layer.popupTemplate = (0, popup_utils_1.createPopupTemplateFromConfig)(defaultPopupConfig);
                            }
                        }
                        // --- END RENDERER CREATION ---
                        console.log('[SingleLayerViz CREATE] FeatureLayer instantiated and configured:', {
                            layerId: this.layer.id,
                            title: this.layer.title,
                            sourceCount: (_o = this.layer.source) === null || _o === void 0 ? void 0 : _o.length, // Source is now Graphic[]
                            rendererType: (_p = this.layer.renderer) === null || _p === void 0 ? void 0 : _p.type
                        });
                        return [3 /*break*/, 18];
                    case 17:
                        layerError_1 = _x.sent();
                        console.error('[SingleLayerViz CREATE] Error instantiating FeatureLayer:', layerError_1);
                        return [2 /*return*/, { layer: null, extent: null }];
                    case 18:
                        console.log('[SingleLayerViz CREATE] Calculating extent...');
                        calculatedExtent = null;
                        _x.label = 19;
                    case 19:
                        _x.trys.push([19, 23, , 24]);
                        geometriesToUnion = finalGraphics.map(function (g) { return g.geometry; }).filter(function (g) { return g != null; });
                        if (!(geometriesToUnion.length > 0)) return [3 /*break*/, 21];
                        return [4 /*yield*/, geometryEngineAsync.union(geometriesToUnion)];
                    case 20:
                        calculatedExtent = ((_q = (_x.sent())) === null || _q === void 0 ? void 0 : _q.extent) || null;
                        return [3 /*break*/, 22];
                    case 21:
                        calculatedExtent = null;
                        _x.label = 22;
                    case 22:
                        this.extent = calculatedExtent;
                        console.log('[SingleLayerViz CREATE] Extent calculated:', this.extent ? 'Valid Extent' : 'Null Extent');
                        return [3 /*break*/, 24];
                    case 23:
                        extentError_1 = _x.sent();
                        console.error('[SingleLayerViz CREATE] Error calculating extent:', extentError_1);
                        this.extent = null;
                        return [3 /*break*/, 24];
                    case 24:
                        // +++ LOG: Final Renderer Check +++
                        console.log("[SingleLayerViz LOG 5] Final assigned renderer type: ".concat((_s = (_r = this.layer) === null || _r === void 0 ? void 0 : _r.renderer) === null || _s === void 0 ? void 0 : _s.type));
                        if (((_u = (_t = this.layer) === null || _t === void 0 ? void 0 : _t.renderer) === null || _u === void 0 ? void 0 : _u.type) === 'class-breaks') {
                            console.log("[SingleLayerViz LOG 5b] Final Class breaks: ".concat(JSON.stringify((_v = this.layer.renderer.classBreakInfos) === null || _v === void 0 ? void 0 : _v.map(function (info) { var _a, _b; return ({ label: info.label, color: (_b = (_a = info.symbol) === null || _a === void 0 ? void 0 : _a.color) === null || _b === void 0 ? void 0 : _b.toHex() }); }))));
                        }
                        // +++ END LOG +++
                        console.log('[SingleLayerViz CREATE] Returning result:', {
                            hasLayer: !!this.layer,
                            layerId: (_w = this.layer) === null || _w === void 0 ? void 0 : _w.id,
                            hasExtent: !!this.extent
                        });
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
    // Helper to find the best field if not provided
    SingleLayerVisualization.prototype.findBestRendererField = function (graphics) {
        // Implementation of findBestRendererField method
        // This is a placeholder and should be implemented based on your specific requirements
        // <<< ADD LOGGING >>>
        console.log('[SingleLayerViz DEBUG] findBestRendererField called (Placeholder - returns null)');
        return null; // Placeholder return, actual implementation needed
    };
    SingleLayerVisualization.prototype.calculatePercentile = function (values, percentile) {
        // <<< REMOVE LOGGING >>>
        // console.log('[SingleLayerViz DEBUG] calculatePercentile called (Placeholder - returns 0)');
        // --- Correct Percentile Calculation --- 
        if (!values || values.length === 0) {
            console.warn('[calculatePercentile] Input array is empty.');
            return 0; // Or potentially NaN or throw error
        }
        // Ensure percentile is between 0 and 100
        var validPercentile = Math.max(0, Math.min(100, percentile));
        // Sort the array in ascending order
        var sortedValues = __spreadArray([], values, true).sort(function (a, b) { return a - b; });
        // Calculate the index (rank)
        // Using the NIST method (R-7): (N-1) * p/100 + 1, then linear interpolation
        var n = sortedValues.length;
        if (n === 1) {
            return sortedValues[0]; // Only one value
        }
        var index = (validPercentile / 100) * (n - 1); // 0-based index
        var lowerIndex = Math.floor(index);
        var upperIndex = Math.ceil(index);
        var weight = index - lowerIndex;
        // Handle boundary cases for index
        if (upperIndex >= n) {
            return sortedValues[n - 1]; // Return max value if percentile is 100 or index calculation goes slightly over
        }
        if (lowerIndex < 0) {
            return sortedValues[0]; // Should not happen with validPercentile, but safety check
        }
        // Linear interpolation between the two closest ranks
        if (lowerIndex === upperIndex) {
            return sortedValues[lowerIndex];
        }
        else {
            return sortedValues[lowerIndex] * (1 - weight) + sortedValues[upperIndex] * weight;
        }
        // --- End Correct Percentile Calculation ---
        // return 0; // Old placeholder return
    };
    // Updated createRenderer to accept the FeatureLayer instance and field
    SingleLayerVisualization.prototype.createRenderer = function (layer, field) {
        return __awaiter(this, void 0, void 0, function () {
            var configForQuartile, rendererResult, error_2;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        // +++ LOG: Entering createRenderer +++
                        console.log("[SingleLayerViz.createRenderer LOG A] ENTERING for field: '".concat(field, "'"));
                        // +++ END LOG +++
                        console.log("[SingleLayerVisualization.createRenderer] Calling external createQuartileRenderer for field: ".concat(field));
                        configForQuartile = {
                            layer: layer,
                            field: field,
                            // Explicitly pass the RED-to-GREEN color stops
                            colorStops: [
                                [239, 59, 44], // red
                                [255, 127, 0], // orange
                                [158, 215, 152], // light green
                                [49, 163, 84] // green
                            ],
                            opacity: this.options.opacity || 0.8, // Pass opacity from options
                        };
                        console.log("[SingleLayerViz.createRenderer LOG B] Config being passed to createQuartileRenderer:", { field: configForQuartile.field, colorStops: configForQuartile.colorStops, opacity: configForQuartile.opacity, layerId: (_a = configForQuartile.layer) === null || _a === void 0 ? void 0 : _a.id });
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, createQuartileRenderer_1.createQuartileRenderer)(configForQuartile)];
                    case 2:
                        rendererResult = _e.sent();
                        // +++ LOG: Result from createQuartileRenderer +++
                        console.log("[SingleLayerViz.createRenderer LOG C] Result from createQuartileRenderer:", rendererResult ? "Type: ".concat((_b = rendererResult.renderer) === null || _b === void 0 ? void 0 : _b.type) : 'null');
                        if (((_c = rendererResult === null || rendererResult === void 0 ? void 0 : rendererResult.renderer) === null || _c === void 0 ? void 0 : _c.type) === 'class-breaks') {
                            console.log("[SingleLayerViz.createRenderer LOG D] Breaks received: ".concat(JSON.stringify((_d = rendererResult.renderer.classBreakInfos) === null || _d === void 0 ? void 0 : _d.map(function (info) { var _a, _b; return ({ label: info.label, color: (_b = (_a = info.symbol) === null || _a === void 0 ? void 0 : _a.color) === null || _b === void 0 ? void 0 : _b.toHex() }); }))));
                        }
                        // +++ END LOG +++
                        if (rendererResult && rendererResult.renderer) {
                            console.log('[SingleLayerVisualization.createRenderer] Successfully created renderer using external function.');
                            // Ensure the returned renderer is either ClassBreaksRenderer or SimpleRenderer
                            if (rendererResult.renderer instanceof ClassBreaksRenderer_1.default || rendererResult.renderer instanceof SimpleRenderer_1.default) {
                                // +++ LOG: Returning valid renderer +++
                                console.log("[SingleLayerViz.createRenderer LOG E] Returning valid renderer of type: ".concat(rendererResult.renderer.type));
                                // +++ END LOG +++
                                return [2 /*return*/, rendererResult.renderer];
                            }
                            else {
                                console.warn('[SingleLayerVisualization.createRenderer] External function returned unexpected renderer type. Falling back to simple.');
                                // Fallback if type is wrong (shouldn't happen with ClassBreaksRenderer)
                                return [2 /*return*/, new SimpleRenderer_1.default({
                                        symbol: new SimpleFillSymbol_1.default({
                                            color: [150, 150, 150, 0.6],
                                            outline: { color: [50, 50, 50, 0.8], width: 0.5 }
                                        })
                                    })];
                            }
                        }
                        else {
                            console.warn('[SingleLayerVisualization.createRenderer] createQuartileRenderer returned null or no renderer. Falling back to simple.');
                            return [2 /*return*/, new SimpleRenderer_1.default({
                                    symbol: new SimpleFillSymbol_1.default({
                                        color: [150, 150, 150, 0.6],
                                        outline: { color: [50, 50, 50, 0.8], width: 0.5 }
                                    })
                                })];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _e.sent();
                        console.error('[SingleLayerVisualization.createRenderer] Error calling createQuartileRenderer:', error_2);
                        // Fallback to a simple error renderer
                        return [2 /*return*/, new SimpleRenderer_1.default({
                                symbol: new SimpleFillSymbol_1.default({
                                    color: [255, 0, 0, 0.5], // Red error color
                                    outline: { color: [0, 0, 0, 1], width: 1 }
                                })
                            })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Override the base class method to maintain compatibility
    SingleLayerVisualization.prototype.getRenderer = function () {
        return this.renderer;
    };
    SingleLayerVisualization.prototype.getLegendInfo = function () {
        var _this = this;
        var _a, _b, _c, _d;
        // Get values from the layer for dynamic breaks
        var rendererField = ((_a = this.data) === null || _a === void 0 ? void 0 : _a.rendererField) || 'value';
        var values = ((_c = (_b = this.layer) === null || _b === void 0 ? void 0 : _b.source) === null || _c === void 0 ? void 0 : _c.toArray().map(function (g) { return g.attributes[rendererField]; }).filter(function (v) { return typeof v === 'number' && !isNaN(v); })) || [];
        var breakPoints = this.calculateBreakPoints(values);
        var colorRamp = this.getColorRamp(breakPoints.length + 1);
        var items = __spreadArray([
            {
                label: "< ".concat(this.formatBreakLabel(breakPoints[0])),
                color: "rgba(".concat(colorRamp[0].join(', '), ", 0.8)"),
                shape: 'square',
                size: 12
            }
        ], breakPoints.map(function (breakPoint, index) { return ({
            label: index === breakPoints.length - 1
                ? "> ".concat(_this.formatBreakLabel(breakPoint))
                : "".concat(_this.formatBreakLabel(breakPoint), " - ").concat(_this.formatBreakLabel(breakPoints[index + 1])),
            color: "rgba(".concat(colorRamp[index + 1].join(', '), ", 0.8)"),
            shape: 'square',
            size: 12
        }); }), true);
        return {
            title: ((_d = this.data) === null || _d === void 0 ? void 0 : _d.layerName) || "Value Distribution",
            type: "class-breaks",
            description: "Distribution of ".concat(rendererField, " across ").concat(values.length, " features"),
            items: items
        };
    };
    /**
     * Process microservice response into visualization data
     * @param response The response from the microservice
     * @returns Processed data ready for visualization
     * @throws Error if response is invalid or malformed
     */
    SingleLayerVisualization.prototype.processMicroserviceResponse = function (response) {
        // Check if response is an error
        if ((0, microservice_types_1.isMicroserviceError)(response)) {
            throw new Error("Microservice error: ".concat(response.error, " (").concat(response.error_type, ")"));
        }
        // Validate response structure
        if (!(0, microservice_types_1.isValidMicroserviceResponse)(response)) {
            throw new Error('Invalid microservice response format');
        }
        // Convert response to visualization data
        var data = (0, microservice_types_1.convertToVisualizationData)(response);
        // Create features array from predictions and SHAP values
        var features = data.predictions.map(function (prediction, index) { return ({
            attributes: __assign({ OBJECTID: index + 1, thematic_value: prediction }, Object.fromEntries(data.featureNames.map(function (name, i) {
                var _a;
                return [
                    "shap_".concat(name),
                    ((_a = data.shapValues[index]) === null || _a === void 0 ? void 0 : _a[i]) || 0
                ];
            })))
        }); });
        return {
            features: features,
            layerName: "Prediction Results (".concat(data.modelType, ")"),
            rendererField: 'thematic_value',
            layerConfig: {
                fields: __spreadArray([
                    { name: 'OBJECTID', type: 'oid' },
                    { name: 'thematic_value', type: 'double' }
                ], data.featureNames.map(function (name) { return ({
                    name: "shap_".concat(name),
                    type: 'double'
                }); }), true)
            }
        };
    };
    /**
     * Create visualization from microservice response
     * @param response The response from the microservice
     * @param options Visualization options
     */
    SingleLayerVisualization.prototype.createFromMicroservice = function (response, options) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                try {
                    data = this.processMicroserviceResponse(response);
                    // Create visualization using processed data
                    return [2 /*return*/, this.create(data, options)];
                }
                catch (error) {
                    console.error('[SingleLayerViz] Error processing microservice response:', error);
                    return [2 /*return*/, { layer: null, extent: null }];
                }
                return [2 /*return*/];
            });
        });
    };
    return SingleLayerVisualization;
}(base_visualization_1.BaseVisualization));
exports.SingleLayerVisualization = SingleLayerVisualization;
