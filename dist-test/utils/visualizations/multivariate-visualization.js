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
exports.MultivariateVisualization = void 0;
var FeatureLayer_1 = require("@arcgis/core/layers/FeatureLayer");
var UniqueValueRenderer_1 = require("@arcgis/core/renderers/UniqueValueRenderer");
var SimpleFillSymbol_1 = require("@arcgis/core/symbols/SimpleFillSymbol");
var base_visualization_1 = require("./base-visualization");
var Color_1 = require("@arcgis/core/Color");
var Graphic_1 = require("@arcgis/core/Graphic");
var PopupTemplate_1 = require("@arcgis/core/PopupTemplate");
var popup_utils_1 = require("@/utils/popup-utils");
var MultivariateVisualization = /** @class */ (function (_super) {
    __extends(MultivariateVisualization, _super);
    function MultivariateVisualization() {
        var _this = _super.call(this) || this;
        _this.renderer = null;
        _this.layer = null;
        _this.extent = null;
        _this.data = null;
        _this.profileColors = {};
        _this.fieldsUsed = [];
        _this.title = 'Multivariate Pattern Analysis';
        return _this;
    }
    MultivariateVisualization.prototype.calculateZScores = function (values) {
        var validValues = values.filter(function (v) { return typeof v === 'number' && isFinite(v); });
        if (validValues.length === 0) {
            return values.map(function () { return null; });
        }
        var mean = validValues.reduce(function (sum, v) { return sum + v; }, 0) / validValues.length;
        var stdDev = Math.sqrt(validValues.reduce(function (sum, v) { return sum + Math.pow(v - mean, 2); }, 0) / validValues.length);
        var safeStdDev = stdDev === 0 ? 1 : stdDev;
        return values.map(function (v) {
            if (typeof v === 'number' && isFinite(v)) {
                return Math.max(-3, Math.min(3, (v - mean) / safeStdDev));
            }
            return null;
        });
    };
    MultivariateVisualization.prototype.classifyValue = function (zScore, numBins) {
        if (numBins === void 0) { numBins = 3; }
        if (zScore === null)
            return 'N/A';
        if (numBins === 3) {
            if (zScore < -0.5)
                return 'Low';
            if (zScore > 0.5)
                return 'High';
            return 'Medium';
        }
        else {
            if (zScore < 0)
                return 'Low';
            return 'High';
        }
    };
    MultivariateVisualization.prototype.assignProfileType = function (normalizedValues, fields, numBins) {
        var _this = this;
        if (numBins === void 0) { numBins = 3; }
        var classifications = fields.map(function (field) { var _a; return _this.classifyValue((_a = normalizedValues[field]) !== null && _a !== void 0 ? _a : null, numBins); });
        return classifications.join('-');
    };
    MultivariateVisualization.prototype.generateDistinctColors = function (count) {
        var colors = [];
        for (var i = 0; i < count; i++) {
            var hue = (i * (360 / count)) % 360;
            var rgb = this.hslToRgb(hue / 360, 0.7, 0.5);
            colors.push(new Color_1.default(rgb));
        }
        return colors;
    };
    MultivariateVisualization.prototype.hslToRgb = function (h, s, l) {
        var r, g, b;
        if (s === 0) {
            r = g = b = l;
        }
        else {
            var hue2rgb = function (p, q, t) {
                if (t < 0)
                    t += 1;
                if (t > 1)
                    t -= 1;
                if (t < 1 / 6)
                    return p + (q - p) * 6 * t;
                if (t < 1 / 2)
                    return q;
                if (t < 2 / 3)
                    return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    };
    MultivariateVisualization.prototype.create = function (data_1) {
        return __awaiter(this, arguments, void 0, function (data, options) {
            var startTime, numBins, targetSR, normalizationStartTime, normalizedFeatures, fullExtent, skippedCount, valuesByField, zScoresByField, i, feature, isValid, normalizedValues, originalValues, _i, _a, field, zScore, originalValue, classificationStartTime, classifiedFeatures, rendererStartTime, uniqueProfileTypes, uniqueColors, uniqueValueInfos, sourceGraphics, layerCreationTime, oidField, layerFields, uniqueLayerFields, endTime;
            var _this = this;
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_p) {
                switch (_p.label) {
                    case 0:
                        startTime = performance.now();
                        console.log('=== Creating Multivariate Visualization ===');
                        console.log('Input data:', {
                            featureCount: (_b = data.features) === null || _b === void 0 ? void 0 : _b.length,
                            correlationFields: data.correlationFields,
                            title: data.title,
                            spatialReference: (_f = (_e = (_d = (_c = data.features) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.geometry) === null || _e === void 0 ? void 0 : _e.spatialReference) === null || _f === void 0 ? void 0 : _f.wkid
                        });
                        this.data = data;
                        this.title = options.title || data.title || 'Multivariate Analysis';
                        this.fieldsUsed = __spreadArray([], data.correlationFields, true);
                        numBins = options.numBins || 3;
                        if (!((_g = data.features) === null || _g === void 0 ? void 0 : _g.length))
                            throw new Error('No features provided.');
                        if (!((_h = data.correlationFields) === null || _h === void 0 ? void 0 : _h.length))
                            throw new Error('No correlationFields provided.');
                        if (!((_k = (_j = data.features[0]) === null || _j === void 0 ? void 0 : _j.geometry) === null || _k === void 0 ? void 0 : _k.spatialReference))
                            throw new Error('Features lack spatial reference.');
                        targetSR = data.features[0].geometry.spatialReference;
                        console.log('Normalizing data and validating features...');
                        normalizationStartTime = performance.now();
                        normalizedFeatures = [];
                        fullExtent = null;
                        skippedCount = 0;
                        valuesByField = {};
                        data.correlationFields.forEach(function (field) {
                            valuesByField[field] = data.features.map(function (f) { var _a; return (_a = f.attributes) === null || _a === void 0 ? void 0 : _a[field]; });
                        });
                        zScoresByField = {};
                        data.correlationFields.forEach(function (field) {
                            zScoresByField[field] = _this.calculateZScores(valuesByField[field]);
                        });
                        for (i = 0; i < data.features.length; i++) {
                            feature = data.features[i];
                            isValid = true;
                            normalizedValues = {};
                            originalValues = {};
                            for (_i = 0, _a = data.correlationFields; _i < _a.length; _i++) {
                                field = _a[_i];
                                zScore = zScoresByField[field][i];
                                originalValue = valuesByField[field][i];
                                if (zScore === null || originalValue === null || originalValue === undefined) {
                                    isValid = false;
                                    break;
                                }
                                normalizedValues[field] = zScore;
                                originalValues[field] = originalValue;
                            }
                            if (!feature.geometry) {
                                isValid = false;
                            }
                            if (isValid) {
                                normalizedFeatures.push({
                                    graphic: feature,
                                    normalizedValues: normalizedValues,
                                    originalValues: originalValues
                                });
                                if ((_l = feature.geometry) === null || _l === void 0 ? void 0 : _l.extent) {
                                    if (fullExtent) {
                                        fullExtent = fullExtent.union(feature.geometry.extent);
                                    }
                                    else {
                                        fullExtent = feature.geometry.extent.clone();
                                    }
                                }
                            }
                            else {
                                skippedCount++;
                            }
                        }
                        console.log("Normalization & Validation complete: ".concat(normalizedFeatures.length, " valid features, ").concat(skippedCount, " skipped. Time: ").concat((performance.now() - normalizationStartTime).toFixed(2), "ms"));
                        if (normalizedFeatures.length === 0) {
                            throw new Error('No valid features remain after normalization and validation.');
                        }
                        if (!(!fullExtent || !_super.prototype.isValidExtent.call(this, fullExtent))) return [3 /*break*/, 2];
                        console.warn("Calculated extent is invalid, attempting fallback.");
                        return [4 /*yield*/, _super.prototype.calculateExtent.call(this, normalizedFeatures.map(function (f) { return f.graphic; }))];
                    case 1:
                        fullExtent = _p.sent();
                        if (!fullExtent || !_super.prototype.isValidExtent.call(this, fullExtent)) {
                            throw new Error("Failed to calculate a valid extent for the features.");
                        }
                        _p.label = 2;
                    case 2:
                        this.extent = fullExtent.expand(1.1);
                        console.log("Classifying features into ".concat(numBins, " bins per field..."));
                        classificationStartTime = performance.now();
                        classifiedFeatures = normalizedFeatures.map(function (nf) { return (__assign(__assign({}, nf), { profileType: _this.assignProfileType(nf.normalizedValues, data.correlationFields, numBins) })); });
                        console.log("Classification complete. Time: ".concat((performance.now() - classificationStartTime).toFixed(2), "ms"));
                        console.log('Creating Unique Value Renderer...');
                        rendererStartTime = performance.now();
                        uniqueProfileTypes = __spreadArray([], new Set(classifiedFeatures.map(function (cf) { return cf.profileType; })), true);
                        console.log("Found ".concat(uniqueProfileTypes.length, " unique profile types."));
                        uniqueColors = this.generateDistinctColors(uniqueProfileTypes.length);
                        this.profileColors = {};
                        uniqueValueInfos = uniqueProfileTypes.map(function (profile, index) {
                            var color = uniqueColors[index % uniqueColors.length];
                            _this.profileColors[profile] = color;
                            return {
                                value: profile,
                                symbol: new SimpleFillSymbol_1.default({
                                    color: new Color_1.default([color.r, color.g, color.b, 0.7]),
                                    outline: { color: new Color_1.default([100, 100, 100, 0.5]), width: 0.7 }
                                }),
                                label: profile
                            };
                        });
                        this.renderer = new UniqueValueRenderer_1.default({
                            field: 'profile_type',
                            uniqueValueInfos: uniqueValueInfos,
                            defaultSymbol: new SimpleFillSymbol_1.default({
                                color: new Color_1.default([200, 200, 200, 0.5]),
                                outline: { color: new Color_1.default([150, 150, 150, 0.5]), width: 0.5 }
                            }),
                            defaultLabel: "Other/No Data",
                            legendOptions: {
                                title: "".concat(this.title, " Profiles")
                            }
                        });
                        console.log("Renderer created. Time: ".concat((performance.now() - rendererStartTime).toFixed(2), "ms"));
                        sourceGraphics = classifiedFeatures.map(function (cf) {
                            return new Graphic_1.default({
                                geometry: cf.graphic.geometry,
                                attributes: __assign(__assign(__assign({}, cf.graphic.attributes), cf.originalValues), { profile_type: cf.profileType })
                            });
                        });
                        console.log('Creating Feature Layer...');
                        layerCreationTime = performance.now();
                        oidField = this.findObjectIdField(((_m = sourceGraphics[0]) === null || _m === void 0 ? void 0 : _m.attributes) || {});
                        layerFields = __spreadArray([
                            { name: oidField, alias: 'Object ID', type: 'oid' },
                            { name: 'profile_type', alias: 'Profile Type', type: 'string' }
                        ], this.fieldsUsed.map(function (fieldName) { return ({
                            name: fieldName,
                            alias: fieldName,
                            type: 'double'
                        }); }), true);
                        uniqueLayerFields = layerFields.filter(function (field, index, self) {
                            return index === self.findIndex(function (f) { return f.name === field.name; });
                        });
                        this.layer = new FeatureLayer_1.default({
                            title: this.title,
                            source: sourceGraphics,
                            objectIdField: oidField,
                            fields: uniqueLayerFields,
                            renderer: this.renderer,
                            opacity: (_o = options.opacity) !== null && _o !== void 0 ? _o : 0.8,
                            spatialReference: targetSR,
                        });
                        this.applyPopupTemplate(this.layer, options.popupConfig);
                        console.log("Feature Layer created. Time: ".concat((performance.now() - layerCreationTime).toFixed(2), "ms"));
                        endTime = performance.now();
                        console.log("=== Multivariate Visualization Complete. Total Time: ".concat((endTime - startTime).toFixed(2), "ms ==="));
                        return [2 /*return*/, { layer: this.layer, extent: this.extent }];
                }
            });
        });
    };
    MultivariateVisualization.prototype.applyPopupTemplate = function (layer, popupConfig) {
        if (popupConfig) {
            layer.popupTemplate = (0, popup_utils_1.createPopupTemplateFromConfig)(popupConfig);
        }
        else {
            layer.popupTemplate = new PopupTemplate_1.default({
                title: "".concat(this.title, ": {profile_type}"),
                content: [{
                        type: 'fields',
                        fieldInfos: __spreadArray([
                            { fieldName: 'profile_type', label: 'Assigned Profile' }
                        ], this.fieldsUsed.map(function (fieldName) { return ({
                            fieldName: fieldName,
                            label: fieldName,
                            format: {
                                places: 2,
                                digitSeparator: true
                            }
                        }); }), true)
                    }]
            });
        }
        console.log('[MultivariateVisualization] Applied popup template.');
    };
    MultivariateVisualization.prototype.getRenderer = function () {
        return this.renderer;
    };
    MultivariateVisualization.prototype.getLegendInfo = function () {
        var _a;
        if (!this.renderer || !this.layer) {
            return null;
        }
        var legendElements = this.renderer.uniqueValueInfos.map(function (info) { return ({
            label: info.label || String(info.value),
            symbol: info.symbol
        }); });
        return {
            title: ((_a = this.renderer.legendOptions) === null || _a === void 0 ? void 0 : _a.title) || this.layer.title || "Multivariate Profiles",
            type: "unique-value",
            elements: legendElements
        };
    };
    MultivariateVisualization.prototype.findObjectIdField = function (attributes) {
        var commonOidFields = ['OBJECTID', 'ObjectID', 'FID', 'OID', '__OBJECTID', 'objectid', 'fid'];
        for (var _i = 0, commonOidFields_1 = commonOidFields; _i < commonOidFields_1.length; _i++) {
            var fieldName = commonOidFields_1[_i];
            if (attributes && attributes.hasOwnProperty(fieldName)) {
                console.log("[findObjectIdField] Found OID field: ".concat(fieldName));
                return fieldName;
            }
        }
        console.warn('[findObjectIdField] Could not find standard OID field, defaulting to "OBJECTID". Ensure your data has a unique identifier.');
        return 'OBJECTID';
    };
    return MultivariateVisualization;
}(base_visualization_1.BaseVisualization));
exports.MultivariateVisualization = MultivariateVisualization;
