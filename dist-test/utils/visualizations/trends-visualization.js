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
exports.TrendsVisualization = void 0;
var FeatureLayer_1 = require("@arcgis/core/layers/FeatureLayer");
var ClassBreaksRenderer_1 = require("@arcgis/core/renderers/ClassBreaksRenderer");
var base_visualization_1 = require("./base-visualization");
var Color_1 = require("@arcgis/core/Color");
var SimpleFillSymbol_1 = require("@arcgis/core/symbols/SimpleFillSymbol");
var Collection_1 = require("@arcgis/core/core/Collection");
var Query_1 = require("@arcgis/core/rest/support/Query");
var TrendsVisualization = /** @class */ (function (_super) {
    __extends(TrendsVisualization, _super);
    function TrendsVisualization() {
        var _this = _super.call(this) || this;
        _this.title = 'Google Trends Analysis';
        _this.STATSCAN_URL = 'https://geo.statcan.gc.ca/geo_wa/rest/services/2021/Cartographic_boundary_files/MapServer/9';
        _this.renderer = new ClassBreaksRenderer_1.default({
            field: "value",
            defaultSymbol: new SimpleFillSymbol_1.default({
                color: new Color_1.default([200, 200, 200, 0.5]),
                outline: {
                    color: new Color_1.default([128, 128, 128, 1]),
                    width: 1
                }
            }),
            classBreakInfos: [
                {
                    minValue: 0,
                    maxValue: 25,
                    symbol: new SimpleFillSymbol_1.default({
                        color: new Color_1.default([239, 59, 44, 1]),
                        outline: {
                            color: new Color_1.default([128, 128, 128, 1]),
                            width: 1
                        }
                    })
                },
                {
                    minValue: 25,
                    maxValue: 50,
                    symbol: new SimpleFillSymbol_1.default({
                        color: new Color_1.default([255, 127, 0, 1]),
                        outline: {
                            color: new Color_1.default([128, 128, 128, 1]),
                            width: 1
                        }
                    })
                },
                {
                    minValue: 50,
                    maxValue: 75,
                    symbol: new SimpleFillSymbol_1.default({
                        color: new Color_1.default([158, 215, 152, 1]),
                        outline: {
                            color: new Color_1.default([128, 128, 128, 1]),
                            width: 1
                        }
                    })
                },
                {
                    minValue: 75,
                    maxValue: 100,
                    symbol: new SimpleFillSymbol_1.default({
                        color: new Color_1.default([49, 163, 84, 1]),
                        outline: {
                            color: new Color_1.default([128, 128, 128, 1]),
                            width: 1
                        }
                    })
                }
            ]
        });
        return _this;
    }
    TrendsVisualization.prototype.create = function (data_1) {
        return __awaiter(this, arguments, void 0, function (data, options) {
            var layer, referenceLayer, allCityValues_1, query, results, features, processedFeatures_1, processedCities_1, unmatchedCities, municipalityMappings, cityToMunicipalityMap_1, _loop_1, _i, _a, _b, cityName, value, values, q1Index, q2Index, q3Index, quartiles, createQuartileRenderer, rendererResult, fallbackRenderer, i, extent, sortedCities, topCities_1, bottomCities, formattedMessage, error_1;
            var _c, _d, _e, _f, _g, _h, _j, _k;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        _l.trys.push([0, 5, , 6]);
                        console.log('TrendsVisualization.create called with data:', {
                            keyword: data.keyword,
                            geoDataLength: (_c = data.geoData) === null || _c === void 0 ? void 0 : _c.length,
                            timeSeriesLength: (_d = data.results) === null || _d === void 0 ? void 0 : _d.length
                        });
                        // Store the data for later use
                        this.data = data;
                        // Update the layer title to be more descriptive
                        this.title = "Search Interest: ".concat(data.keyword);
                        layer = new FeatureLayer_1.default({
                            source: [], // Start with empty source
                            title: this.title,
                            visible: true,
                            opacity: 0.8,
                            objectIdField: "OBJECTID",
                            geometryType: "polygon",
                            spatialReference: { wkid: 102100 },
                            fields: [
                                {
                                    name: "OBJECTID",
                                    type: "oid"
                                },
                                {
                                    name: "CSDNAME",
                                    type: "string"
                                },
                                {
                                    name: "CSDUID",
                                    type: "string"
                                },
                                {
                                    name: "value",
                                    type: "double"
                                }
                            ],
                            popupTemplate: {
                                title: "{CSDNAME}",
                                content: [
                                    {
                                        type: "text",
                                        text: "Search interest for '{CSDNAME}' relative to other cities"
                                    },
                                    {
                                        type: "fields",
                                        fieldInfos: [
                                            {
                                                fieldName: "value",
                                                label: "Interest Level",
                                                format: {
                                                    places: 0,
                                                    digitSeparator: true
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        });
                        referenceLayer = new FeatureLayer_1.default({
                            url: this.STATSCAN_URL,
                            outFields: ['*']
                        });
                        // Wait for reference layer to load
                        return [4 /*yield*/, referenceLayer.load()];
                    case 1:
                        // Wait for reference layer to load
                        _l.sent();
                        console.log('Reference layer loaded');
                        // Check if we have any data at all
                        if (!((_e = data.geoData) === null || _e === void 0 ? void 0 : _e.length)) {
                            console.error('No geographic data available from SerpApi');
                            throw new Error('No trends data available for this search term');
                        }
                        allCityValues_1 = new Map();
                        data.geoData.forEach(function (point) {
                            if (point.geoName && point.value !== undefined) {
                                allCityValues_1.set(point.geoName, point.value);
                                console.log("Added city: ".concat(point.geoName, " with value: ").concat(point.value));
                            }
                        });
                        query = new Query_1.default({
                            outFields: ['*'],
                            returnGeometry: true,
                            where: "PRUID = '35'", // Filter to Ontario
                            outSpatialReference: { wkid: 102100 }
                        });
                        return [4 /*yield*/, referenceLayer.queryFeatures(query)];
                    case 2:
                        results = _l.sent();
                        console.log('Query results:', {
                            featureCount: results.features.length,
                            fields: (_f = results.fields) === null || _f === void 0 ? void 0 : _f.map(function (f) { return ({ name: f.name, alias: f.alias }); })
                        });
                        features = results.features;
                        processedFeatures_1 = [];
                        processedCities_1 = new Map();
                        unmatchedCities = [];
                        // Log sample feature attributes to see available fields
                        if (features.length > 0) {
                            console.log('Sample feature attributes:', {
                                availableFields: Object.keys(features[0].attributes),
                                sampleValues: {
                                    CSDNAME: features[0].attributes.CSDNAME,
                                    CSDUID: features[0].attributes.CSDUID,
                                    CSDTYPE: features[0].attributes.CSDTYPE,
                                    PRNAME: features[0].attributes.PRNAME
                                }
                            });
                        }
                        municipalityMappings = {
                            'Cobden': { municipality: 'Whitewater Region', type: 'township' },
                            'Kemptville': { municipality: 'North Grenville', type: 'municipality' }
                        };
                        cityToMunicipalityMap_1 = new Map();
                        _loop_1 = function (cityName, value) {
                            var matched = false;
                            // Check if this city has a known mapping
                            var mappedInfo = municipalityMappings[cityName];
                            if (mappedInfo) {
                                console.log("Using known mapping for ".concat(cityName, ": ").concat(mappedInfo.municipality));
                                // Try to find the mapped municipality
                                var mappedMatches = features.filter(function (f) {
                                    var _a;
                                    var csdName = (_a = f.attributes) === null || _a === void 0 ? void 0 : _a.CSDNAME;
                                    return csdName && typeof csdName === 'string' &&
                                        csdName.toLowerCase() === mappedInfo.municipality.toLowerCase();
                                });
                                if (mappedMatches.length > 0) {
                                    var feature = mappedMatches[0];
                                    var clonedFeature = feature.clone();
                                    // Store the original city name in the attributes for display
                                    clonedFeature.attributes = {
                                        OBJECTID: processedFeatures_1.length + 1,
                                        CSDNAME: feature.attributes.CSDNAME,
                                        CSDUID: feature.attributes.CSDUID,
                                        value: value,
                                        originalCity: cityName // Add this to track the original city name
                                    };
                                    processedFeatures_1.push(clonedFeature);
                                    processedCities_1.set(cityName, true);
                                    // Store the mapping for UI
                                    cityToMunicipalityMap_1.set(cityName, {
                                        municipality: feature.attributes.CSDNAME,
                                        csduid: feature.attributes.CSDUID
                                    });
                                    matched = true;
                                    console.log("Matched ".concat(cityName, " to municipality: ").concat(feature.attributes.CSDNAME, " (").concat(feature.attributes.CSDTYPE, ")"));
                                    return "continue";
                                }
                            }
                            // Log all features that might contain this city name
                            var potentialMatches = features.filter(function (f) {
                                var _a, _b, _c;
                                var csdName = (_a = f.attributes) === null || _a === void 0 ? void 0 : _a.CSDNAME;
                                var csdType = (_b = f.attributes) === null || _b === void 0 ? void 0 : _b.CSDTYPE;
                                var csduid = (_c = f.attributes) === null || _c === void 0 ? void 0 : _c.CSDUID;
                                // Log more details about potential matches
                                if (csdName && typeof csdName === 'string' &&
                                    (csdName.toLowerCase().includes(cityName.toLowerCase()) ||
                                        cityName.toLowerCase().includes(csdName.toLowerCase()))) {
                                    console.log("Potential match details for ".concat(cityName, ":"), {
                                        CSDNAME: csdName,
                                        CSDTYPE: csdType,
                                        CSDUID: csduid,
                                        matchType: csdName.toLowerCase() === cityName.toLowerCase() ? 'exact' :
                                            csdName.toLowerCase().includes(cityName.toLowerCase()) ? 'contains' :
                                                'partial'
                                    });
                                }
                                return csdName && typeof csdName === 'string' &&
                                    (csdName.toLowerCase().includes(cityName.toLowerCase()) ||
                                        cityName.toLowerCase().includes(csdName.toLowerCase()));
                            });
                            // Try exact match first
                            var exactMatches = features.filter(function (f) {
                                var _a;
                                var csdName = (_a = f.attributes) === null || _a === void 0 ? void 0 : _a.CSDNAME;
                                if (csdName && typeof csdName === 'string') {
                                    var isMatch = csdName.toLowerCase() === cityName.toLowerCase();
                                    if (isMatch) {
                                        console.log("Found exact match: \"".concat(csdName, "\" = \"").concat(cityName, "\" (Type: ").concat(f.attributes.CSDTYPE, ")"));
                                    }
                                    return isMatch;
                                }
                                return false;
                            });
                            if (exactMatches.length > 0) {
                                exactMatches.forEach(function (feature) {
                                    var clonedFeature = feature.clone();
                                    clonedFeature.attributes = {
                                        OBJECTID: processedFeatures_1.length + 1,
                                        CSDNAME: feature.attributes.CSDNAME,
                                        CSDUID: feature.attributes.CSDUID,
                                        value: value
                                    };
                                    processedFeatures_1.push(clonedFeature);
                                    processedCities_1.set(cityName, true);
                                });
                                matched = true;
                                console.log("Exact match found for: ".concat(cityName));
                            }
                            // If no exact match, try partial match with additional context
                            if (!matched) {
                                var partialMatches = features.filter(function (f) {
                                    var _a, _b;
                                    var csdName = (_a = f.attributes) === null || _a === void 0 ? void 0 : _a.CSDNAME;
                                    var csdType = (_b = f.attributes) === null || _b === void 0 ? void 0 : _b.CSDTYPE;
                                    if (csdName && typeof csdName === 'string') {
                                        // Enhanced matching strategies
                                        var isPartialMatch = 
                                        // Direct inclusion
                                        csdName.toLowerCase().includes(cityName.toLowerCase()) ||
                                            cityName.toLowerCase().includes(csdName.toLowerCase()) ||
                                            // Check if city is part of a township/municipality
                                            csdName.toLowerCase().includes(cityName.toLowerCase() + ' township') ||
                                            csdName.toLowerCase().includes(cityName.toLowerCase() + ' municipality') ||
                                            // Check for village designation
                                            csdName.toLowerCase().includes(cityName.toLowerCase() + ' village') ||
                                            // Check for variations with 'town of' prefix
                                            csdName.toLowerCase().includes('town of ' + cityName.toLowerCase()) ||
                                            // Remove common suffixes for comparison
                                            csdName.toLowerCase().replace(/ (township|municipality|city|town|village|county)$/, '') === cityName.toLowerCase() ||
                                            // Check for incorporated places
                                            csdName.toLowerCase().replace(/^(township of|town of|village of|municipality of|county of) /, '') === cityName.toLowerCase();
                                        if (isPartialMatch) {
                                            console.log("Found partial match: \"".concat(csdName, "\" (Type: ").concat(csdType, ") matches \"").concat(cityName, "\" using enhanced matching"));
                                        }
                                        return isPartialMatch;
                                    }
                                    return false;
                                });
                                if (partialMatches.length > 0) {
                                    // Sort partial matches by length and type
                                    var typeOrder_1 = ['CY', 'T', 'VL', 'TV', 'TP', 'M', 'MU']; // City, Town, Village, Town Village, Township, Municipality
                                    var sortedMatches = partialMatches.sort(function (a, b) {
                                        var aName = a.attributes.CSDNAME;
                                        var bName = b.attributes.CSDNAME;
                                        // Prefer shorter names (more likely to be the core municipality)
                                        if (aName.length !== bName.length) {
                                            return aName.length - bName.length;
                                        }
                                        // If lengths are equal, prefer certain types
                                        var aTypeIndex = typeOrder_1.indexOf(a.attributes.CSDTYPE);
                                        var bTypeIndex = typeOrder_1.indexOf(b.attributes.CSDTYPE);
                                        return aTypeIndex - bTypeIndex;
                                    });
                                    // Log all potential matches for debugging
                                    console.log("Sorted matches for ".concat(cityName, ":"), sortedMatches.map(function (m) { return ({
                                        CSDNAME: m.attributes.CSDNAME,
                                        CSDTYPE: m.attributes.CSDTYPE,
                                        score: typeOrder_1.indexOf(m.attributes.CSDTYPE)
                                    }); }));
                                    // Use the best match
                                    var bestMatch = sortedMatches[0];
                                    var clonedFeature = bestMatch.clone();
                                    clonedFeature.attributes = {
                                        OBJECTID: processedFeatures_1.length + 1,
                                        CSDNAME: bestMatch.attributes.CSDNAME,
                                        CSDUID: bestMatch.attributes.CSDUID,
                                        value: value
                                    };
                                    processedFeatures_1.push(clonedFeature);
                                    processedCities_1.set(cityName, true);
                                    matched = true;
                                    console.log("Using best match for ".concat(cityName, ": ").concat(bestMatch.attributes.CSDNAME, " (").concat(bestMatch.attributes.CSDTYPE, ")"));
                                }
                            }
                            if (!matched) {
                                unmatchedCities.push(cityName);
                                console.log("No match found for: ".concat(cityName, ". Available types in area:"), features
                                    .filter(function (f) { var _a; return (_a = f.attributes.CSDNAME) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(cityName.substring(0, 3).toLowerCase()); })
                                    .map(function (f) { return ({
                                    CSDNAME: f.attributes.CSDNAME,
                                    CSDTYPE: f.attributes.CSDTYPE,
                                    CSDUID: f.attributes.CSDUID
                                }); }));
                            }
                        };
                        // Process each city from trends data
                        for (_i = 0, _a = allCityValues_1.entries(); _i < _a.length; _i++) {
                            _b = _a[_i], cityName = _b[0], value = _b[1];
                            _loop_1(cityName, value);
                        }
                        values = Array.from(allCityValues_1.values()).sort(function (a, b) { return a - b; });
                        q1Index = Math.floor(values.length * 0.25);
                        q2Index = Math.floor(values.length * 0.5);
                        q3Index = Math.floor(values.length * 0.75);
                        quartiles = {
                            q1: values[q1Index],
                            q2: values[q2Index],
                            q3: values[q3Index]
                        };
                        console.log('Quartile values:', quartiles);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../createQuartileRenderer'); })];
                    case 3:
                        createQuartileRenderer = (_l.sent()).createQuartileRenderer;
                        // Set source first so the layer has data for the renderer to query
                        layer.source = new Collection_1.default(processedFeatures_1);
                        // Set layer metadata to indicate this is a Google Trends layer
                        layer.set('metadata', {
                            isGoogleTrendsLayer: true,
                            valueType: 'interest',
                            valueField: 'value'
                        });
                        // Add field mapping to ensure renderer can find the value field
                        layer.set('fieldsMap', {
                            thematic_value: 'value'
                        });
                        // Use the createQuartileRenderer function for consistent rendering
                        console.log('[TrendsVisualization] Creating quartile renderer');
                        return [4 /*yield*/, createQuartileRenderer({
                                layer: layer,
                                field: 'value',
                                opacity: 0.7,
                                outlineWidth: 0.5,
                                outlineColor: [128, 128, 128],
                                isCompositeIndex: false
                            })];
                    case 4:
                        rendererResult = _l.sent();
                        if (rendererResult && rendererResult.renderer) {
                            console.log('[TrendsVisualization] Successfully created quartile renderer');
                            layer.renderer = rendererResult.renderer;
                            this.renderer = rendererResult.renderer;
                        }
                        else {
                            console.error('[TrendsVisualization] Failed to create quartile renderer, falling back to manual renderer');
                            fallbackRenderer = new ClassBreaksRenderer_1.default({
                                field: "value",
                                defaultSymbol: new SimpleFillSymbol_1.default({
                                    color: new Color_1.default([200, 200, 200, 0.5]),
                                    outline: {
                                        color: new Color_1.default([128, 128, 128, 1]),
                                        width: 1
                                    }
                                }),
                                classBreakInfos: [
                                    {
                                        minValue: 0,
                                        maxValue: quartiles.q1,
                                        symbol: new SimpleFillSymbol_1.default({
                                            color: new Color_1.default([239, 59, 44, 0.7]),
                                            outline: {
                                                color: new Color_1.default([128, 128, 128, 1]),
                                                width: 1
                                            }
                                        })
                                    },
                                    {
                                        minValue: quartiles.q1,
                                        maxValue: quartiles.q2,
                                        symbol: new SimpleFillSymbol_1.default({
                                            color: new Color_1.default([255, 127, 0, 0.7]),
                                            outline: {
                                                color: new Color_1.default([128, 128, 128, 1]),
                                                width: 1
                                            }
                                        })
                                    },
                                    {
                                        minValue: quartiles.q2,
                                        maxValue: quartiles.q3,
                                        symbol: new SimpleFillSymbol_1.default({
                                            color: new Color_1.default([158, 215, 152, 0.7]),
                                            outline: {
                                                color: new Color_1.default([128, 128, 128, 1]),
                                                width: 1
                                            }
                                        })
                                    },
                                    {
                                        minValue: quartiles.q3,
                                        maxValue: Math.max.apply(Math, values),
                                        symbol: new SimpleFillSymbol_1.default({
                                            color: new Color_1.default([49, 163, 84, 0.7]),
                                            outline: {
                                                color: new Color_1.default([128, 128, 128, 1]),
                                                width: 1
                                            }
                                        })
                                    }
                                ]
                            });
                            layer.renderer = fallbackRenderer;
                            this.renderer = fallbackRenderer;
                        }
                        // Store the layer and extent
                        this.layer = layer;
                        this.extent = (_j = (_h = (_g = processedFeatures_1[0]) === null || _g === void 0 ? void 0 : _g.geometry) === null || _h === void 0 ? void 0 : _h.extent) === null || _j === void 0 ? void 0 : _j.clone();
                        // If we have multiple features, expand the extent
                        if (processedFeatures_1.length > 1) {
                            for (i = 1; i < processedFeatures_1.length; i++) {
                                extent = (_k = processedFeatures_1[i].geometry) === null || _k === void 0 ? void 0 : _k.extent;
                                if (extent && this.extent) {
                                    this.extent.union(extent);
                                }
                            }
                        }
                        // Expand the extent slightly for better visibility
                        if (this.extent) {
                            this.extent.expand(1.5);
                        }
                        sortedCities = Array.from(allCityValues_1.entries())
                            .sort(function (_a, _b) {
                            var a = _a[1];
                            var b = _b[1];
                            return b - a;
                        });
                        topCities_1 = sortedCities.slice(0, 5);
                        bottomCities = sortedCities.slice(-5).reverse();
                        formattedMessage = "Search interest for \"".concat(data.keyword, "\":\n\nTop 5 Cities by Interest:\n").concat(topCities_1.map(function (_a, index) {
                            var _b;
                            var city = _a[0], value = _a[1];
                            var mappingInfo = cityToMunicipalityMap_1.get(city);
                            var displayInfo = mappingInfo ? " (part of ".concat(mappingInfo.municipality, ")") : '';
                            var cityId = ((_b = processedFeatures_1.find(function (f) {
                                return f.attributes.CSDNAME.toLowerCase() === city.toLowerCase() ||
                                    f.attributes.originalCity === city;
                            })) === null || _b === void 0 ? void 0 : _b.attributes.CSDUID) || '';
                            return "".concat(index + 1, ". <button class=\"clickable-text\" data-city-id=\"").concat(cityId, "\" data-city-name=\"").concat(city, "\">").concat(city, "</button>: ").concat(Math.round(value)).concat(displayInfo);
                        }).join('\n'), "\n\nCities with Lowest Interest:\n").concat(bottomCities.filter(function (_a) {
                            var city = _a[0];
                            return !topCities_1.some(function (_a) {
                                var topCity = _a[0];
                                return topCity === city;
                            });
                        })
                            .slice(0, 5)
                            .map(function (_a, index) {
                            var _b;
                            var city = _a[0], value = _a[1];
                            var mappingInfo = cityToMunicipalityMap_1.get(city);
                            var displayInfo = mappingInfo ? " (part of ".concat(mappingInfo.municipality, ")") : '';
                            var cityId = ((_b = processedFeatures_1.find(function (f) {
                                return f.attributes.CSDNAME.toLowerCase() === city.toLowerCase() ||
                                    f.attributes.originalCity === city;
                            })) === null || _b === void 0 ? void 0 : _b.attributes.CSDUID) || '';
                            return "".concat(index + 1, ". <button class=\"clickable-text\" data-city-id=\"").concat(cityId, "\" data-city-name=\"").concat(city, "\">").concat(city, "</button>: ").concat(Math.round(value)).concat(displayInfo);
                        }).join('\n'), "\n\nTime Period: ").concat(data.timeframe || 'past 30 days', "\nSearch Type: ").concat(data.searchType || 'web', "\n").concat(data.category !== '0' ? "Category: ".concat(data.category) : '', "\n\nThe visualization shows relative search interest across different cities in Ontario:\n\u2B1B Low (0-").concat(Math.round(quartiles.q1), ")\n\u2B1B Medium-Low (").concat(Math.round(quartiles.q1), "-").concat(Math.round(quartiles.q2), ")\n\u2B1B Medium-High (").concat(Math.round(quartiles.q2), "-").concat(Math.round(quartiles.q3), ")\n\u2B1B High (").concat(Math.round(quartiles.q3), "-100)").concat(unmatchedCities.length > 0 ? "\n\nNote: Some cities (".concat(unmatchedCities.join(', '), ") are shown with approximate locations based on their regions.") : '');
                        // Store the formatted message
                        this.data.formattedMessage = formattedMessage;
                        // Return with explicit visibility settings
                        return [2 /*return*/, {
                                layer: this.layer,
                                extent: this.extent,
                                renderer: this.renderer,
                                legendInfo: this.getLegendInfo(),
                                options: {
                                    visible: true,
                                    opacity: 0.8
                                }
                            }];
                    case 5:
                        error_1 = _l.sent();
                        console.error('Error creating trends visualization:', error_1);
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    TrendsVisualization.prototype.buildDefinitionExpression = function (cityValues) {
        var cityNames = Array.from(cityValues.keys())
            .map(function (name) { return "'".concat(name, "'"); })
            .join(',');
        return "LOWER(CSDNAME) IN (".concat(cityNames, ")");
    };
    TrendsVisualization.prototype.getLegendInfo = function () {
        var _a, _b;
        return {
            title: this.title,
            type: "class-breaks",
            description: "Trends analysis for ".concat(((_a = this.data) === null || _a === void 0 ? void 0 : _a.timeframe) || 'time period', " in ").concat(((_b = this.data) === null || _b === void 0 ? void 0 : _b.geo) || 'location'),
            items: [{
                    label: 'Trend',
                    color: 'rgba(0, 116, 217, 0.7)',
                    shape: 'square',
                    size: 16
                }]
        };
    };
    return TrendsVisualization;
}(base_visualization_1.BaseVisualization));
exports.TrendsVisualization = TrendsVisualization;
