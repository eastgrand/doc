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
exports.DynamicVisualizationFactory = void 0;
exports.mapAnalysisTypeToVisualization = mapAnalysisTypeToVisualization;
exports.createCompatibilityAdapter = createCompatibilityAdapter;
var dynamic_layers_1 = require("../config/dynamic-layers");
var query_classifier_1 = require("./query-classifier");
/**
 * Class responsible for creating visualizations dynamically based on analysis results
 * This factory bridges the gap between the geospatial-chat-interface and the layer registry system
 */
var DynamicVisualizationFactory = /** @class */ (function () {
    function DynamicVisualizationFactory(mapView, useML) {
        if (useML === void 0) { useML = false; }
        this._mapView = null;
        this._initialized = false;
        this._visualizationLayers = new Map();
        this.visualizationCache = new Map();
        this.CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes default TTL
        this.MAX_CACHE_SIZE = 20; // Maximum number of cached visualizations
        this.useMLClassification = false; // Whether to use ML for query classification
        if (mapView) {
            this._mapView = mapView;
            this._initialized = true;
        }
        this.useMLClassification = useML;
    }
    /**
     * Initialize the factory with a map view
     * This should be called before using the factory
     */
    DynamicVisualizationFactory.prototype.initialize = function (mapView_1) {
        return __awaiter(this, arguments, void 0, function (mapView, useML) {
            var existingConfigs, error_1;
            if (useML === void 0) { useML = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._mapView = mapView;
                        this.useMLClassification = useML;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        existingConfigs = this._mapView.map.allLayers
                            .filter(function (layer) { return layer.type === 'feature'; })
                            .map(function (layer) {
                            var featureLayer = layer;
                            // Extract basic metadata from existing layers to populate registry
                            return {
                                id: featureLayer.id,
                                name: featureLayer.title,
                                url: featureLayer.url,
                                geometryType: featureLayer.geometryType,
                                // Additional properties could be extracted here
                            };
                        });
                        // Log detected layers
                        console.log('Detected existing layers:', existingConfigs.length);
                        if (!this.useMLClassification) return [3 /*break*/, 3];
                        console.log('Initializing ML query classifier');
                        return [4 /*yield*/, query_classifier_1.queryClassifier.initializeML(true, {
                                confidenceThreshold: 0.65 // Start with a slightly lower threshold
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        this._initialized = true;
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('Failed to initialize DynamicVisualizationFactory:', error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get a suggested visualization type based on the layer and query
     * This combines registry suggestions with additional heuristics
     */
    DynamicVisualizationFactory.prototype.suggestVisualizationType = function (query, layerId, geometryType, numFields) {
        return __awaiter(this, void 0, void 0, function () {
            var analysisResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        analysisResult = {
                            intent: '',
                            relevantLayers: [layerId],
                            queryType: 'unknown',
                            confidence: 0,
                            explanation: '',
                            originalQuery: query
                        };
                        return [4 /*yield*/, query_classifier_1.queryClassifier.classifyAnalysisResult(analysisResult)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Create a visualization based on the provided type, layer ID, and options
     * @param vizType Visualization type to create
     * @param layerId ID of the layer to use for visualization
     * @param options Options for configuring the visualization
     * @returns Visualization result with layer and extent
     */
    DynamicVisualizationFactory.prototype.createVisualization = function (vizType_1, layerId_1) {
        return __awaiter(this, arguments, void 0, function (vizType, layerId, options) {
            var visualizationType, cacheKey, cachedResult, layerInfo, vizOptions, result, _a, ChoroplethVisualization, choroplethViz, DensityVisualization, heatViz, PointLayerVisualization, scatterViz, ClusterVisualization, clusterViz, CorrelationVisualization, corrViz, JointHighVisualization, jointViz, ProportionalSymbolVisualization, propViz, TrendsVisualization, trendsViz, TopNVisualization, topNViz, CategoricalViz, categoricalViz, categoricalOptions, HexbinVisualization, hexbinViz, BivariateVisualization, bivariateViz, BufferVisualization, bufferViz, HotspotVisualization, hotspotViz, NetworkVisualization, networkViz, MultivariateVisualization, multivariateViz, DefaultViz, defaultViz, error_2;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this._initialized || !this._mapView) {
                            throw new Error("Factory not initialized. Call initialize() first.");
                        }
                        visualizationType = vizType;
                        cacheKey = this.generateCacheKey(visualizationType, layerId, options);
                        cachedResult = this.getCachedVisualization(cacheKey);
                        if (cachedResult) {
                            console.log("Using cached visualization for type: ".concat(visualizationType, ", layer: ").concat(layerId));
                            return [2 /*return*/, cachedResult];
                        }
                        console.log("Creating visualization of type: ".concat(visualizationType, " for layer: ").concat(layerId));
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 54, , 55]);
                        layerInfo = dynamic_layers_1.layerRegistry.getLayerConfig(layerId);
                        if (!layerInfo) {
                            throw new Error("Layer ".concat(layerId, " not found in registry"));
                        }
                        vizOptions = __assign(__assign({}, options), { layer: layerInfo, mapView: this._mapView });
                        result = void 0;
                        _a = visualizationType;
                        switch (_a) {
                            case dynamic_layers_1.VisualizationType.CHOROPLETH: return [3 /*break*/, 2];
                            case dynamic_layers_1.VisualizationType.HEATMAP: return [3 /*break*/, 5];
                            case dynamic_layers_1.VisualizationType.SCATTER: return [3 /*break*/, 8];
                            case dynamic_layers_1.VisualizationType.CLUSTER: return [3 /*break*/, 11];
                            case dynamic_layers_1.VisualizationType.CORRELATION: return [3 /*break*/, 14];
                            case dynamic_layers_1.VisualizationType.JOINT_HIGH: return [3 /*break*/, 17];
                            case dynamic_layers_1.VisualizationType.PROPORTIONAL_SYMBOL: return [3 /*break*/, 20];
                            case dynamic_layers_1.VisualizationType.TRENDS: return [3 /*break*/, 23];
                            case dynamic_layers_1.VisualizationType.TOP_N: return [3 /*break*/, 26];
                            case dynamic_layers_1.VisualizationType.CATEGORICAL: return [3 /*break*/, 29];
                            case dynamic_layers_1.VisualizationType.HEXBIN: return [3 /*break*/, 32];
                            case dynamic_layers_1.VisualizationType.BIVARIATE: return [3 /*break*/, 35];
                            case dynamic_layers_1.VisualizationType.BUFFER: return [3 /*break*/, 38];
                            case dynamic_layers_1.VisualizationType.HOTSPOT: return [3 /*break*/, 41];
                            case dynamic_layers_1.VisualizationType.NETWORK: return [3 /*break*/, 44];
                            case dynamic_layers_1.VisualizationType.MULTIVARIATE: return [3 /*break*/, 47];
                        }
                        return [3 /*break*/, 50];
                    case 2: return [4 /*yield*/, Promise.resolve().then(function () { return require("../utils/visualizations/choropleth-visualization"); })];
                    case 3:
                        ChoroplethVisualization = (_b.sent()).ChoroplethVisualization;
                        choroplethViz = new ChoroplethVisualization();
                        return [4 /*yield*/, choroplethViz.create(vizOptions)];
                    case 4:
                        result = _b.sent();
                        return [3 /*break*/, 53];
                    case 5: return [4 /*yield*/, Promise.resolve().then(function () { return require("../utils/visualizations/density-visualization"); })];
                    case 6:
                        DensityVisualization = (_b.sent()).DensityVisualization;
                        heatViz = new DensityVisualization();
                        return [4 /*yield*/, heatViz.create(vizOptions)];
                    case 7:
                        result = _b.sent();
                        return [3 /*break*/, 53];
                    case 8: return [4 /*yield*/, Promise.resolve().then(function () { return require("../utils/visualizations/point-layer-visualization"); })];
                    case 9:
                        PointLayerVisualization = (_b.sent()).PointLayerVisualization;
                        scatterViz = new PointLayerVisualization();
                        return [4 /*yield*/, scatterViz.create(vizOptions)];
                    case 10:
                        result = _b.sent();
                        return [3 /*break*/, 53];
                    case 11: return [4 /*yield*/, Promise.resolve().then(function () { return require("../utils/visualizations/cluster-visualization"); })];
                    case 12:
                        ClusterVisualization = (_b.sent()).ClusterVisualization;
                        clusterViz = new ClusterVisualization();
                        return [4 /*yield*/, clusterViz.create(vizOptions)];
                    case 13:
                        result = _b.sent();
                        return [3 /*break*/, 53];
                    case 14: return [4 /*yield*/, Promise.resolve().then(function () { return require("../utils/visualizations/correlation-visualization"); })];
                    case 15:
                        CorrelationVisualization = (_b.sent()).CorrelationVisualization;
                        corrViz = new CorrelationVisualization();
                        return [4 /*yield*/, corrViz.create(vizOptions)];
                    case 16:
                        result = _b.sent();
                        return [3 /*break*/, 53];
                    case 17: return [4 /*yield*/, Promise.resolve().then(function () { return require("../utils/visualizations/joint-visualization"); })];
                    case 18:
                        JointHighVisualization = (_b.sent()).JointHighVisualization;
                        jointViz = new JointHighVisualization();
                        return [4 /*yield*/, jointViz.create(vizOptions)];
                    case 19:
                        result = _b.sent();
                        return [3 /*break*/, 53];
                    case 20: return [4 /*yield*/, Promise.resolve().then(function () { return require("../utils/visualizations/proportional-symbol-visualization"); })];
                    case 21:
                        ProportionalSymbolVisualization = (_b.sent()).ProportionalSymbolVisualization;
                        propViz = new ProportionalSymbolVisualization();
                        return [4 /*yield*/, propViz.create(vizOptions)];
                    case 22:
                        result = _b.sent();
                        return [3 /*break*/, 53];
                    case 23: return [4 /*yield*/, Promise.resolve().then(function () { return require("../utils/visualizations/trends-visualization"); })];
                    case 24:
                        TrendsVisualization = (_b.sent()).TrendsVisualization;
                        trendsViz = new TrendsVisualization();
                        return [4 /*yield*/, trendsViz.create(vizOptions)];
                    case 25:
                        result = _b.sent();
                        return [3 /*break*/, 53];
                    case 26: return [4 /*yield*/, Promise.resolve().then(function () { return require("../utils/visualizations/top-n-visualization"); })];
                    case 27:
                        TopNVisualization = (_b.sent()).TopNVisualization;
                        topNViz = new TopNVisualization();
                        return [4 /*yield*/, topNViz.create(vizOptions)];
                    case 28:
                        result = _b.sent();
                        return [3 /*break*/, 53];
                    case 29: return [4 /*yield*/, Promise.resolve().then(function () { return require("../utils/visualizations/single-layer-visualization"); })];
                    case 30:
                        CategoricalViz = (_b.sent()).SingleLayerVisualization;
                        categoricalViz = new CategoricalViz();
                        categoricalOptions = __assign(__assign({}, vizOptions), { rendererType: 'categorical' });
                        return [4 /*yield*/, categoricalViz.create(categoricalOptions)];
                    case 31:
                        result = _b.sent();
                        return [3 /*break*/, 53];
                    case 32: return [4 /*yield*/, Promise.resolve().then(function () { return require("../utils/visualizations/hexbin-visualization"); })];
                    case 33:
                        HexbinVisualization = (_b.sent()).HexbinVisualization;
                        hexbinViz = new HexbinVisualization();
                        return [4 /*yield*/, hexbinViz.create(vizOptions)];
                    case 34:
                        result = _b.sent();
                        return [3 /*break*/, 53];
                    case 35: return [4 /*yield*/, Promise.resolve().then(function () { return require("../utils/visualizations/bivariate-visualization"); })];
                    case 36:
                        BivariateVisualization = (_b.sent()).BivariateVisualization;
                        bivariateViz = new BivariateVisualization();
                        return [4 /*yield*/, bivariateViz.create(vizOptions)];
                    case 37:
                        result = _b.sent();
                        return [3 /*break*/, 53];
                    case 38: return [4 /*yield*/, Promise.resolve().then(function () { return require("../utils/visualizations/buffer-visualization"); })];
                    case 39:
                        BufferVisualization = (_b.sent()).BufferVisualization;
                        bufferViz = new BufferVisualization();
                        return [4 /*yield*/, bufferViz.create(vizOptions)];
                    case 40:
                        result = _b.sent();
                        return [3 /*break*/, 53];
                    case 41: return [4 /*yield*/, Promise.resolve().then(function () { return require("../utils/visualizations/hotspot-visualization"); })];
                    case 42:
                        HotspotVisualization = (_b.sent()).HotspotVisualization;
                        hotspotViz = new HotspotVisualization();
                        return [4 /*yield*/, hotspotViz.create(vizOptions)];
                    case 43:
                        result = _b.sent();
                        return [3 /*break*/, 53];
                    case 44: return [4 /*yield*/, Promise.resolve().then(function () { return require("../utils/visualizations/network-visualization"); })];
                    case 45:
                        NetworkVisualization = (_b.sent()).NetworkVisualization;
                        networkViz = new NetworkVisualization();
                        return [4 /*yield*/, networkViz.create(vizOptions)];
                    case 46:
                        result = _b.sent();
                        return [3 /*break*/, 53];
                    case 47: return [4 /*yield*/, Promise.resolve().then(function () { return require("../utils/visualizations/multivariate-visualization"); })];
                    case 48:
                        MultivariateVisualization = (_b.sent()).MultivariateVisualization;
                        multivariateViz = new MultivariateVisualization();
                        return [4 /*yield*/, multivariateViz.create(vizOptions)];
                    case 49:
                        result = _b.sent();
                        return [3 /*break*/, 53];
                    case 50: return [4 /*yield*/, Promise.resolve().then(function () { return require("../utils/visualizations/single-layer-visualization"); })];
                    case 51:
                        DefaultViz = (_b.sent()).SingleLayerVisualization;
                        defaultViz = new DefaultViz();
                        return [4 /*yield*/, defaultViz.create(vizOptions)];
                    case 52:
                        result = _b.sent();
                        return [3 /*break*/, 53];
                    case 53:
                        // Store the visualization layer for later reference
                        if (result.layer) {
                            this._visualizationLayers.set(layerId, result.layer);
                        }
                        // Cache the visualization result
                        this.cacheVisualization(cacheKey, result);
                        return [2 /*return*/, result];
                    case 54:
                        error_2 = _b.sent();
                        console.error("Error creating visualization for layer ".concat(layerId, ":"), error_2);
                        return [2 /*return*/, { layer: null, extent: null }];
                    case 55: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a temporary provider for a layer not in the registry
     * This allows working with layers dynamically without prior configuration
     */
    DynamicVisualizationFactory.prototype._createTemporaryProvider = function (layerId, options) {
        var _a, _b;
        // Find layer in the map
        var mapLayer = (_a = this._mapView) === null || _a === void 0 ? void 0 : _a.map.findLayerById(layerId);
        if (!mapLayer) {
            throw new Error("Layer ".concat(layerId, " not found in map"));
        }
        // Create temporary config based on the existing layer
        var tempConfig = {
            id: layerId,
            name: mapLayer.title || layerId,
            description: mapLayer.title || '',
            type: 'feature-service', // Use a consistent type value
            url: mapLayer.url,
            geometryType: mapLayer.geometryType,
            // Additional layer properties to help with visualization
            fields: (_b = mapLayer.fields) === null || _b === void 0 ? void 0 : _b.map(function (f) { return ({
                name: f.name,
                alias: f.alias,
                type: f.type
            }); })
        };
        return dynamic_layers_1.LayerProviderFactory.createProvider('feature-service', tempConfig);
    };
    /**
     * Get a previously created visualization layer
     */
    DynamicVisualizationFactory.prototype.getVisualizationLayer = function (layerId) {
        return this._visualizationLayers.get(layerId) || null;
    };
    /**
     * Update an existing visualization with new options
     */
    DynamicVisualizationFactory.prototype.updateVisualization = function (layerId, newOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var layer;
            return __generator(this, function (_a) {
                layer = this._visualizationLayers.get(layerId);
                if (!layer) {
                    console.warn("Layer ".concat(layerId, " not found in visualization layers"));
                    return [2 /*return*/, { layer: null, extent: null }];
                }
                try {
                    // Implementation would update the existing layer's renderer, etc.
                    // For now, just return the existing layer
                    return [2 /*return*/, {
                            layer: layer,
                            extent: layer.fullExtent || null
                        }];
                }
                catch (error) {
                    console.error('Failed to update visualization:', error);
                    return [2 /*return*/, { layer: null, extent: null }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Clean up resources
     */
    DynamicVisualizationFactory.prototype.destroy = function () {
        this._mapView = null;
        this._initialized = false;
        this._visualizationLayers.clear();
    };
    /**
     * Generates a unique cache key for the visualization
     */
    DynamicVisualizationFactory.prototype.generateCacheKey = function (type, layerId, options) {
        var key = {
            type: type,
            layerId: layerId,
            // Only include relevant properties for caching
            options: JSON.stringify({
                fields: options.fields,
                where: options.where,
                outFields: options.outFields,
                renderer: options.renderer ? options.renderer.type : undefined,
                colorRamp: options.colorRamp,
                classification: options.classification,
                normalizeField: options.normalizeField,
                orderBy: options.orderBy
            })
        };
        return "".concat(key.type, "|").concat(key.layerId, "|").concat(key.options);
    };
    /**
     * Retrieves a visualization from the cache if it exists and is not expired
     */
    DynamicVisualizationFactory.prototype.getCachedVisualization = function (cacheKey) {
        var cached = this.visualizationCache.get(cacheKey);
        if (cached) {
            // Check if cache entry is expired
            if (Date.now() > cached.expiresAt) {
                // Remove expired cache entry
                this.visualizationCache.delete(cacheKey);
                return null;
            }
            return cached.result;
        }
        return null;
    };
    /**
     * Caches a visualization result
     */
    DynamicVisualizationFactory.prototype.cacheVisualization = function (cacheKey, result) {
        // Manage cache size - if we're at max capacity, remove oldest entry
        if (this.visualizationCache.size >= this.MAX_CACHE_SIZE) {
            var oldestKey = null;
            var oldestTimestamp = Infinity;
            // Find the oldest cache entry
            for (var _i = 0, _a = this.visualizationCache.entries(); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], entry = _b[1];
                if (entry.timestamp < oldestTimestamp) {
                    oldestTimestamp = entry.timestamp;
                    oldestKey = key;
                }
            }
            // Delete the oldest entry
            if (oldestKey) {
                this.visualizationCache.delete(oldestKey);
            }
        }
        // Add new cache entry
        var now = Date.now();
        this.visualizationCache.set(cacheKey, {
            result: result,
            timestamp: now,
            expiresAt: now + this.CACHE_TTL_MS
        });
    };
    /**
     * Clears all cached visualizations
     */
    DynamicVisualizationFactory.prototype.clearCache = function () {
        this.visualizationCache.clear();
        console.log('Visualization cache cleared');
    };
    /**
     * Sets the cache time-to-live in milliseconds
     */
    DynamicVisualizationFactory.prototype.setCacheTTL = function (ttlMs) {
        if (ttlMs < 0) {
            throw new Error('Cache TTL must be a positive number');
        }
        this.CACHE_TTL_MS = ttlMs;
    };
    /**
     * Enable or disable ML classification
     */
    DynamicVisualizationFactory.prototype.toggleMLClassification = function (enable) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.useMLClassification = enable;
                        return [4 /*yield*/, query_classifier_1.queryClassifier.initializeML(enable)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update ML configuration
     */
    DynamicVisualizationFactory.prototype.updateMLConfig = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.useMLClassification) return [3 /*break*/, 2];
                        // Use proper method to update configuration instead of direct property access
                        return [4 /*yield*/, query_classifier_1.queryClassifier.initializeML(true, config)];
                    case 1:
                        // Use proper method to update configuration instead of direct property access
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    return DynamicVisualizationFactory;
}());
exports.DynamicVisualizationFactory = DynamicVisualizationFactory;
/**
 * Map analysis type to visualization type
 */
function mapAnalysisTypeToVisualization(analysisType) {
    switch (analysisType.toLowerCase()) {
        case 'correlation':
            return dynamic_layers_1.VisualizationType.CORRELATION;
        case 'distribution':
        case 'thematic':
            return dynamic_layers_1.VisualizationType.CHOROPLETH;
        case 'cluster':
            return dynamic_layers_1.VisualizationType.CLUSTER;
        case 'joint_high':
        case 'joint-high':
            return dynamic_layers_1.VisualizationType.JOINT_HIGH;
        case 'trends':
            return dynamic_layers_1.VisualizationType.TRENDS;
        case 'categorical':
            return dynamic_layers_1.VisualizationType.CATEGORICAL;
        case 'heatmap':
        case 'density':
            return dynamic_layers_1.VisualizationType.HEATMAP;
        case 'point':
        case 'point_scatter':
            return dynamic_layers_1.VisualizationType.SCATTER;
        case 'top_n':
        case 'top-n':
        case 'ranking':
            return dynamic_layers_1.VisualizationType.TOP_N;
        case 'hexbin':
        case 'hex_bin':
        case 'hexagonal':
            return dynamic_layers_1.VisualizationType.HEXBIN;
        case 'bivariate':
        case 'dual_variable':
            return dynamic_layers_1.VisualizationType.BIVARIATE;
        case 'buffer':
        case 'proximity':
        case 'distance':
            return dynamic_layers_1.VisualizationType.BUFFER;
        case 'hotspot':
        case 'hot_spot':
        case 'coldspot':
        case 'significant_cluster':
            return dynamic_layers_1.VisualizationType.HOTSPOT;
        case 'network':
        case 'flow':
        case 'connection':
        case 'link':
            return dynamic_layers_1.VisualizationType.NETWORK;
        case 'multivariate':
        case 'multi_variable':
        case 'complex_analysis':
            return dynamic_layers_1.VisualizationType.MULTIVARIATE;
        default:
            return dynamic_layers_1.VisualizationType.CHOROPLETH;
    }
}
/**
 * Create a compatibility adapter for legacy code
 */
function createCompatibilityAdapter(factory) {
    var _this = this;
    return {
        createVisualization: function (type, layerId, options) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, factory.createVisualization(type, layerId, options)];
            });
        }); },
        updateVisualization: function (layerId, options) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, factory.updateVisualization(layerId, options)];
            });
        }); }
    };
}
