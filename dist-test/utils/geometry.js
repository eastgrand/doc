"use strict";
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
exports.createGeometry = exports.traceCoordinates = void 0;
var Point_1 = require("@arcgis/core/geometry/Point");
var Polygon_1 = require("@arcgis/core/geometry/Polygon");
var SpatialReference_1 = require("@arcgis/core/geometry/SpatialReference");
var projection = require("@arcgis/core/geometry/projection");
// Initialize projection engine
if (projection.isLoaded && !projection.isLoaded()) {
    projection.load();
}
// Define spatial references
var webMercator = new SpatialReference_1.default({ wkid: 102100 });
var wgs84 = new SpatialReference_1.default({ wkid: 4326 });
// Max values for web mercator coordinates
var MAX_MERCATOR_X = 20037508.3427892;
var MAX_MERCATOR_Y = 20048966.1040891;
// Add these constants and function at the top
var projectionEngineInitialized = false;
function initializeProjectionEngine() {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (projectionEngineInitialized)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, projection.load()];
                case 2:
                    _a.sent();
                    projectionEngineInitialized = true;
                    console.log("[Geometry] Projection engine initialized");
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("[Geometry] Failed to initialize projection engine:", error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Helper function to trace coordinates for debugging
 * @param coordinates - The coordinates to trace
 * @param label - A label for the log
 * @param spatialReference - Optional spatial reference
 */
var traceCoordinates = function (coordinates, label, spatialReference) {
    if (!coordinates) {
        // console.log(`[traceCoordinates] ${label}: Empty coordinates`);
        return;
    }
    // Log structure type to help debug
    // console.log(`[traceCoordinates] ${label} type: ${typeof coordinates}, isArray: ${Array.isArray(coordinates)}`);
    if (Array.isArray(coordinates)) {
        if (coordinates.length === 0) {
            // console.log(`[traceCoordinates] ${label}: Empty array`);
            return;
        }
        // Point coordinates [x, y]
        if (coordinates.length === 2 && typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
            // console.log(`[traceCoordinates] ${label}: Point [${coordinates[0]}, ${coordinates[1]}] SR: ${JSON.stringify(spatialReference)}`);
            return;
        }
        // Polygon with rings
        if (Array.isArray(coordinates[0])) {
            // console.log(`[traceCoordinates] ${label}: ${coordinates.length} polygon rings/linestrings SR: ${JSON.stringify(spatialReference)}`);
            // Sample first ring/linestring
            if (coordinates[0].length > 0) {
                // console.log(`[traceCoordinates] First item sample:`, 
                //   Array.isArray(coordinates[0][0]) ? 
                //     `Ring with ${coordinates[0].length} points` : 
                //     `Coordinates: ${JSON.stringify(coordinates[0])}`
                // );
                // Additional detail for diagnostic purposes
                if (Array.isArray(coordinates[0][0])) {
                    // console.log(`[traceCoordinates] First point sample: ${JSON.stringify(coordinates[0][0])}`);
                }
            }
            return;
        }
    }
    // console.log(`[traceCoordinates] ${label}: Unusual coordinates structure, keys:`, 
    //   typeof coordinates === 'object' ? Object.keys(coordinates) : typeof coordinates);
};
exports.traceCoordinates = traceCoordinates;
/**
 * Normalize ring coordinates to ensure they're within valid Web Mercator bounds
 * @param rings - The polygon rings to normalize
 * @param wkid - The spatial reference WKID (to determine bounds)
 * @returns - Normalized rings
 */
function normalizeCoordinates(rings, wkid) {
    var MAX_WEB_MERCATOR = 20037508.3427892; // Web Mercator bounds
    var MAX_WGS84 = 180; // WGS84 bounds (degrees)
    var maxValue = wkid === 102100 || wkid === 3857 ? MAX_WEB_MERCATOR : MAX_WGS84;
    // console.log(`[normalizeCoordinates] Normalizing coordinates for WKID ${wkid}, max value ${maxValue}`);
    return rings.map(function (ring) {
        // Filter out invalid coordinates
        var validCoords = ring.filter(function (coord) {
            if (!Array.isArray(coord) || coord.length < 2)
                return false;
            return !isNaN(coord[0]) && !isNaN(coord[1]);
        });
        // Skip rings with too few valid coordinates
        if (validCoords.length < 3)
            return [];
        // Normalize coordinates to bounds
        return validCoords.map(function (coord) {
            // Clamp values to reasonable range
            var x = Math.min(Math.max(coord[0], -maxValue), maxValue);
            var y = Math.min(Math.max(coord[1], -maxValue), maxValue);
            // If we had to clamp significantly, log it
            // if (Math.abs(x - coord[0]) > maxValue * 0.1 || Math.abs(y - coord[1]) > maxValue * 0.1) {
            // console.warn(`[normalizeCoordinates] Significant coordinate clamping: [${coord[0]}, ${coord[1]}] -> [${x}, ${y}]`);
            // }
            return [x, y];
        });
    }).filter(function (ring) { return ring.length >= 3; }); // Filter out empty or invalid rings
}
/**
 * Create an ESRI geometry from a GeoJSON-like geometry object
 * @param geometry - The geometry to create
 * @param targetSpatialReference - Optional target spatial reference
 * @returns - The ArcGIS geometry or null if it cannot be created
 */
var createGeometry = function (geometry, targetSpatialReference) {
    if (targetSpatialReference === void 0) { targetSpatialReference = webMercator; }
    if (!geometry) {
        // console.log("[createGeometry] Null or undefined geometry provided");
        return null;
    }
    // Add detailed logging of input geometry
    // console.log(`[createGeometry] Input geometry type: ${geometry.type || typeof geometry}`);
    // console.log(`[createGeometry] Input spatial reference:`, geometry.spatialReference || 'undefined');
    // Use our tracing helper to log input coordinates
    // if (geometry.x !== undefined && geometry.y !== undefined) {
    //   traceCoordinates([geometry.x, geometry.y], "Input Point geometry", geometry.spatialReference);
    // } else if (geometry.points) {
    //   traceCoordinates(geometry.points, "Input MultiPoint geometry", geometry.spatialReference);
    // } else if (geometry.paths) {
    //   traceCoordinates(geometry.paths, "Input Polyline geometry", geometry.spatialReference);
    // } else if (geometry.rings) {
    //   traceCoordinates(geometry.rings, "Input Polygon geometry", geometry.spatialReference);
    // } else if (geometry.coordinates) {
    //   traceCoordinates(geometry.coordinates, "Input GeoJSON geometry", geometry.spatialReference);
    // }
    try {
        // Point geometry
        if (geometry.type === "Point" || geometry.type === "point" || (geometry.x !== undefined && geometry.y !== undefined)) {
            // Handle extreme coordinates before creating the Point
            var x = void 0, y = void 0;
            if (geometry.type === "Point" && Array.isArray(geometry.coordinates)) {
                x = geometry.coordinates[0];
                y = geometry.coordinates[1];
            }
            else {
                x = geometry.x;
                y = geometry.y;
            }
            // Check for extreme values
            if (Math.abs(x) > 1e10 || Math.abs(y) > 1e10) {
                // console.warn(`[createGeometry] EXTREME COORDINATES DETECTED in Point: [${x}, ${y}]`);
            }
            // Create point geometry
            var point = void 0;
            if (geometry.type === "Point" && Array.isArray(geometry.coordinates)) {
                point = new Point_1.default({
                    x: geometry.coordinates[0],
                    y: geometry.coordinates[1],
                    spatialReference: wgs84
                });
                // console.log(`[createGeometry] Created Point from GeoJSON: [${point.x}, ${point.y}], SR: ${point.spatialReference.wkid}`);
            }
            else {
                // Use the spatial reference from the input geometry or default to WGS84
                var sr = geometry.spatialReference || wgs84;
                point = new Point_1.default({
                    x: geometry.x,
                    y: geometry.y,
                    spatialReference: sr
                });
                // console.log(`[createGeometry] Created Point from ESRI format: [${point.x}, ${point.y}], SR: ${point.spatialReference.wkid}`);
            }
            // Project to target spatial reference if needed
            if (targetSpatialReference && point.spatialReference.wkid !== targetSpatialReference.wkid) {
                // console.log(`[createGeometry] Projecting Point from SR: ${point.spatialReference.wkid} to SR: ${targetSpatialReference.wkid}`);
                // Check if projection engine is ready
                if (!projection.isLoaded()) {
                    // console.warn('[createGeometry] Projection engine not loaded - projection may fail');
                    // Continue anyway - the projection will either work or fail in the try/catch
                }
                try {
                    var projectedPoint = projection.project(point, targetSpatialReference);
                    // console.log(`[createGeometry] Projected Point: [${projectedPoint.x}, ${projectedPoint.y}], SR: ${projectedPoint.spatialReference.wkid}`);
                    // Check for extreme values after projection
                    if (Math.abs(projectedPoint.x) > 1e10 || Math.abs(projectedPoint.y) > 1e10) {
                        // console.error(`[createGeometry] EXTREME COORDINATES AFTER PROJECTION: [${projectedPoint.x}, ${projectedPoint.y}]`);
                    }
                    return projectedPoint;
                }
                catch (projectionError) {
                    // console.error(`[createGeometry] Projection error for Point:`, projectionError);
                    // Return unprojected point as fallback
                    return point;
                }
            }
            return point;
        }
        // Polygon geometry
        if (geometry.type === "Polygon" || geometry.type === "polygon" || geometry.rings) {
            var rings = void 0;
            var sr = wgs84;
            // Log more details about the geometry structure
            // console.log(`[createGeometry] Polygon geometry details:`, {
            //   hasType: !!geometry.type,
            //   type: geometry.type,
            //   hasCoordinates: !!geometry.coordinates,
            //   coordsType: geometry.coordinates ? typeof geometry.coordinates : 'undefined',
            //   isArray: geometry.coordinates ? Array.isArray(geometry.coordinates) : false,
            //   hasRings: !!geometry.rings,
            //   ringsType: geometry.rings ? typeof geometry.rings : 'undefined'
            // });
            if ((geometry.type === "Polygon" || geometry.type === "polygon") && geometry.coordinates && Array.isArray(geometry.coordinates)) {
                rings = geometry.coordinates;
                // console.log(`[createGeometry] Creating Polygon from GeoJSON with ${rings.length} rings`);
            }
            else if (geometry.rings && Array.isArray(geometry.rings)) {
                rings = geometry.rings;
                sr = geometry.spatialReference || wgs84;
                // console.log(`[createGeometry] Creating Polygon from ESRI format with ${rings.length} rings, SR: ${sr.wkid}`);
            }
            else if (geometry.type === "polygon" && !geometry.coordinates && !geometry.rings) {
                // Special case: GeoJSON geometry with lowercase type but missing coordinates
                // Try to find coordinates elsewhere in the object
                // console.log(`[createGeometry] Trying to find rings in polygon with missing coordinates property`);
                // Look for coordinates in the geometry object
                var potentialCoords = Object.entries(geometry)
                    .filter(function (_a) {
                    var key = _a[0], value = _a[1];
                    return key !== 'type' && Array.isArray(value);
                })
                    .map(function (_a) {
                    var key = _a[0], value = _a[1];
                    return ({ key: key, value: value });
                });
                // console.log(`[createGeometry] Found ${potentialCoords.length} potential coordinate arrays`);
                if (potentialCoords.length > 0) {
                    // Use the first array found that looks like coordinates
                    var coordCandidate = potentialCoords[0].value;
                    // console.log(`[createGeometry] Using ${potentialCoords[0].key} as potential rings`, coordCandidate);
                    // Check if it's nested arrays (common for polygon rings)
                    if (Array.isArray(coordCandidate[0])) {
                        rings = coordCandidate;
                        // console.log(`[createGeometry] Using recovered rings with ${rings.length} elements`);
                    }
                }
                if (!rings) {
                    // console.error("[createGeometry] Could not recover valid rings from polygon geometry");
                    return null;
                }
            }
            else {
                // console.error("[createGeometry] Invalid Polygon geometry - missing valid rings/coordinates");
                return null;
            }
            // Validate polygon rings
            if (!rings || !Array.isArray(rings) || rings.length === 0) {
                // console.error("[createGeometry] Invalid Polygon rings:", rings);
                return null;
            }
            // Trace rings for debugging
            // traceCoordinates(rings, "Polygon rings before creating geometry", sr);
            // Check for extreme values in rings
            var hasExtremeValues_1 = false;
            rings.forEach(function (ring, ringIndex) {
                if (Array.isArray(ring)) {
                    ring.forEach(function (coord, coordIndex) {
                        if (Array.isArray(coord) && coord.length >= 2) {
                            if (Math.abs(coord[0]) > 1e10 || Math.abs(coord[1]) > 1e10) {
                                // console.warn(`[createGeometry] EXTREME COORDINATES in ring ${ringIndex}, coord ${coordIndex}: [${coord[0]}, ${coord[1]}]`);
                                hasExtremeValues_1 = true;
                            }
                        }
                    });
                }
            });
            // Normalize rings if extreme values were found
            if (hasExtremeValues_1) {
                // console.log(`[createGeometry] Found extreme coordinates in input rings, normalizing before polygon creation`);
                var wkid = sr.wkid || 4326; // Default to WGS84 if no wkid
                rings = normalizeCoordinates(rings, wkid);
                if (rings.length === 0) {
                    // console.error(`[createGeometry] Failed to normalize input rings, no valid rings left`);
                    return null;
                }
                // console.log(`[createGeometry] Successfully normalized input rings to ${rings.length} valid rings`);
            }
            // Create polygon
            var polygon = new Polygon_1.default({
                rings: rings,
                spatialReference: sr
            });
            // console.log(`[createGeometry] Created Polygon with ${polygon.rings.length} rings, SR: ${polygon.spatialReference.wkid}`);
            // Project to target spatial reference if needed
            if (targetSpatialReference && polygon.spatialReference.wkid !== targetSpatialReference.wkid) {
                // console.log(`[createGeometry] Projecting Polygon from SR: ${polygon.spatialReference.wkid} to SR: ${targetSpatialReference.wkid}`);
                // Check if projection engine is ready
                if (!projection.isLoaded()) {
                    // console.warn('[createGeometry] Projection engine not loaded - projection may fail');
                    // Continue anyway - the projection will either work or fail in the try/catch
                }
                try {
                    var projectedPolygon = projection.project(polygon, targetSpatialReference);
                    // console.log(`[createGeometry] Projected Polygon has ${projectedPolygon.rings.length} rings, SR: ${projectedPolygon.spatialReference.wkid}`);
                    // Check for extreme values after projection
                    var hasExtremeValues_2 = false;
                    projectedPolygon.rings.forEach(function (ring, ringIndex) {
                        ring.forEach(function (coord, coordIndex) {
                            if (Array.isArray(coord) && coord.length >= 2) {
                                if (Math.abs(coord[0]) > 1e10 || Math.abs(coord[1]) > 1e10) {
                                    // console.error(`[createGeometry] EXTREME COORDINATES AFTER PROJECTION in ring ${ringIndex}, coord ${coordIndex}: [${coord[0]}, ${coord[1]}]`);
                                    hasExtremeValues_2 = true;
                                }
                            }
                        });
                    });
                    if (hasExtremeValues_2) {
                        console.error("[createGeometry] Projection resulted in extreme coordinates. Original SR: ".concat(polygon.spatialReference.wkid, ", Target SR: ").concat(targetSpatialReference.wkid));
                        // Try to normalize the extreme coordinates
                        // console.log(`[createGeometry] Attempting to normalize extreme coordinates`);
                        var normalizedRings = normalizeCoordinates(projectedPolygon.rings, targetSpatialReference.wkid);
                        // If we have valid rings after normalization, create a new polygon
                        if (normalizedRings.length > 0) {
                            // console.log(`[createGeometry] Creating new polygon with normalized coordinates`);
                            var normalizedPolygon = new Polygon_1.default({
                                rings: normalizedRings,
                                spatialReference: targetSpatialReference
                            });
                            return normalizedPolygon;
                        }
                        else {
                            // console.warn(`[createGeometry] Normalization failed, returning original polygon`);
                        }
                    }
                    return projectedPolygon;
                }
                catch (projectionError) {
                    // console.error(`[createGeometry] Projection error for Polygon:`, projectionError);
                    // Try to create a polygon in the target SR directly by normalizing the input coordinates
                    try {
                        // console.log(`[createGeometry] Attempting direct conversion to target SR without projection`);
                        var normalizedRings = normalizeCoordinates(polygon.rings, targetSpatialReference.wkid);
                        if (normalizedRings.length > 0) {
                            var directPolygon = new Polygon_1.default({
                                rings: normalizedRings,
                                spatialReference: targetSpatialReference
                            });
                            // console.log(`[createGeometry] Created polygon directly in target SR: ${targetSpatialReference.wkid}`);
                            return directPolygon;
                        }
                    }
                    catch (directError) {
                        // console.error(`[createGeometry] Direct conversion failed:`, directError);
                    }
                    // Return unprojected polygon as fallback
                    return polygon;
                }
            }
            return polygon;
        }
        // Unsupported geometry type
        // console.error(`[createGeometry] Unsupported geometry type: ${geometry.type || typeof geometry}`);
        return null;
    }
    catch (error) {
        console.error("[createGeometry] Error creating geometry:", error);
        return null;
    }
};
exports.createGeometry = createGeometry;
