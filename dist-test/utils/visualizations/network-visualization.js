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
exports.NetworkVisualization = void 0;
var SimpleRenderer_1 = require("@arcgis/core/renderers/SimpleRenderer");
var SimpleLineSymbol_1 = require("@arcgis/core/symbols/SimpleLineSymbol");
var base_visualization_1 = require("./base-visualization");
var Color_1 = require("@arcgis/core/Color");
var NetworkVisualization = /** @class */ (function (_super) {
    __extends(NetworkVisualization, _super);
    function NetworkVisualization() {
        var _this = _super.call(this) || this;
        _this.title = 'Network Routes';
        _this.renderer = new SimpleRenderer_1.default({
            symbol: new SimpleLineSymbol_1.default({
                color: new Color_1.default([0, 122, 194, 0.8]),
                width: 3,
                style: 'solid'
            })
        });
        return _this;
    }
    NetworkVisualization.prototype.validateInputData = function (data) {
        var _a, _b, _c, _d, _e, _f;
        console.log('=== Validating Network Input Data ===');
        var startTime = performance.now();
        var validation = {
            hasRoutes: !!((_a = data.routes) === null || _a === void 0 ? void 0 : _a.length),
            routeCount: ((_b = data.routes) === null || _b === void 0 ? void 0 : _b.length) || 0,
            hasStops: !!((_c = data.stops) === null || _c === void 0 ? void 0 : _c.length),
            stopCount: ((_d = data.stops) === null || _d === void 0 ? void 0 : _d.length) || 0,
            hasRouteAttributes: !!((_e = data.routeAttributes) === null || _e === void 0 ? void 0 : _e.length),
            routeAttributeCount: ((_f = data.routeAttributes) === null || _f === void 0 ? void 0 : _f.length) || 0,
            validationTimeMs: 0
        };
        console.log('Input validation:', validation);
        if (!validation.hasRoutes) {
            throw new Error('No routes provided for network visualization');
        }
        if (validation.hasRouteAttributes && validation.routeAttributeCount !== validation.routeCount) {
            console.warn('Route attributes count does not match route count:', {
                routes: validation.routeCount,
                attributes: validation.routeAttributeCount
            });
        }
        validation.validationTimeMs = performance.now() - startTime;
        console.log('Input validation complete:', {
            validationTimeMs: validation.validationTimeMs.toFixed(2)
        });
    };
    NetworkVisualization.prototype.validateRoutes = function (routes) {
        console.log('=== Validating Routes ===');
        var startTime = performance.now();
        var validation = {
            total: routes.length,
            validGeometry: 0,
            validAttributes: 0,
            invalidGeometry: [],
            invalidAttributes: [],
            spatialReferences: new Set(),
            geometryTypes: new Set(),
            validationTimeMs: 0
        };
        routes.forEach(function (route, index) {
            var _a;
            // Validate geometry
            if (route.geometry) {
                validation.validGeometry++;
                validation.geometryTypes.add(route.geometry.type);
                if ((_a = route.geometry.spatialReference) === null || _a === void 0 ? void 0 : _a.wkid) {
                    validation.spatialReferences.add(route.geometry.spatialReference.wkid);
                }
            }
            else {
                validation.invalidGeometry.push(index);
            }
            // Validate attributes
            if (route.attributes && Object.keys(route.attributes).length > 0) {
                validation.validAttributes++;
            }
            else {
                validation.invalidAttributes.push(index);
            }
        });
        console.log('Route validation results:', __assign(__assign({}, validation), { geometryTypes: Array.from(validation.geometryTypes), spatialReferences: Array.from(validation.spatialReferences), validationTimeMs: (performance.now() - startTime).toFixed(2) }));
        if (validation.validGeometry === 0) {
            throw new Error('No routes have valid geometries');
        }
        if (validation.spatialReferences.size > 1) {
            console.warn('Multiple spatial references detected:', Array.from(validation.spatialReferences));
        }
    };
    NetworkVisualization.prototype.validateStops = function (stops) {
        console.log('=== Validating Stops ===');
        var startTime = performance.now();
        var validation = {
            total: stops.length,
            validGeometry: 0,
            validAttributes: 0,
            invalidGeometry: [],
            invalidAttributes: [],
            spatialReferences: new Set(),
            geometryTypes: new Set(),
            validationTimeMs: 0
        };
        stops.forEach(function (stop, index) {
            var _a;
            // Validate geometry
            if (stop.geometry) {
                validation.validGeometry++;
                validation.geometryTypes.add(stop.geometry.type);
                if ((_a = stop.geometry.spatialReference) === null || _a === void 0 ? void 0 : _a.wkid) {
                    validation.spatialReferences.add(stop.geometry.spatialReference.wkid);
                }
            }
            else {
                validation.invalidGeometry.push(index);
            }
            // Validate attributes
            if (stop.attributes && Object.keys(stop.attributes).length > 0) {
                validation.validAttributes++;
            }
            else {
                validation.invalidAttributes.push(index);
            }
        });
        console.log('Stop validation results:', __assign(__assign({}, validation), { geometryTypes: Array.from(validation.geometryTypes), spatialReferences: Array.from(validation.spatialReferences), validationTimeMs: (performance.now() - startTime).toFixed(2) }));
        if (validation.validGeometry === 0) {
            console.warn('No stops have valid geometries');
        }
        if (validation.spatialReferences.size > 1) {
            console.warn('Multiple spatial references detected:', Array.from(validation.spatialReferences));
        }
    };
    NetworkVisualization.prototype.create = function (data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var processedRoutes, processedStops, features;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Validate input data
                        this.validateData(data);
                        processedRoutes = data.routes.map(function (route) { return _this.mapFeature(route); });
                        processedStops = (_a = data.stops) === null || _a === void 0 ? void 0 : _a.map(function (stop) { return _this.mapFeature(stop); });
                        features = processedRoutes.map(function (route, index) {
                            var _a;
                            return ({
                                geometry: route.geometry,
                                attributes: __assign(__assign({ OBJECTID: index + 1 }, (((_a = data.routeAttributes) === null || _a === void 0 ? void 0 : _a[index]) || {})), route.attributes)
                            });
                        });
                        // Initialize layer with processed features
                        return [4 /*yield*/, this.initializeLayer(__assign(__assign({}, data), { features: features }), __assign(__assign({}, options), { opacity: (options === null || options === void 0 ? void 0 : options.opacity) || 0.8 }))];
                    case 1:
                        // Initialize layer with processed features
                        _b.sent();
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
    NetworkVisualization.prototype.getRenderer = function () {
        return this.renderer;
    };
    NetworkVisualization.prototype.getLegendInfo = function () {
        return {
            title: this.title,
            type: "class-breaks",
            description: "Network analysis showing connections",
            items: [{
                    label: 'Network',
                    color: 'rgba(0, 116, 217, 0.7)',
                    shape: 'square',
                    size: 16
                }]
        };
    };
    return NetworkVisualization;
}(base_visualization_1.BaseVisualization));
exports.NetworkVisualization = NetworkVisualization;
