"use strict";
/**
 * AI Visualization Integration Test
 *
 * This script tests the integration between the AI chat interface and the
 * visualization system to ensure the AI can properly access and use all
 * available visualization types.
 */
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
var dynamic_layers_1 = require("../config/dynamic-layers");
var query_classifier_1 = require("../lib/query-classifier");
/**
 * Generate test queries for all visualization types
 * @returns {Array<{query: string, expectedType: string, context: string}>} Array of test cases
 */
function generateTestQueries() {
    var testQueries = [];
    // Generate standard test queries from visualization metadata
    for (var _i = 0, _a = Object.entries(dynamic_layers_1.visualizationTypesConfig); _i < _a.length; _i++) {
        var _b = _a[_i], type = _b[0], metadata = _b[1];
        // Get example query patterns from metadata
        var patterns = metadata.aiQueryPatterns || [];
        // For each pattern, create a concrete query by filling in placeholders
        for (var i = 0; i < Math.min(patterns.length, 2); i++) {
            var pattern = patterns[i];
            // Replace placeholders with sample values
            var query = pattern
                .replace('{field}', 'income')
                .replace('{field1}', 'income')
                .replace('{field2}', 'education')
                .replace('{field3}', 'population')
                .replace('{region}', 'county')
                .replace('{regions}', 'counties')
                .replace('{points}', 'restaurants')
                .replace('{features}', 'neighborhoods')
                .replace('{n}', '10')
                .replace('{benchmark}', 'national average')
                .replace('{distance}', '5 miles')
                .replace('{unit}', 'mile')
                .replace('{variables}', 'income, education, and age')
                .replace('{relationship}', 'trade between countries')
                .replace('{list}', 'income, education, and poverty')
                .replace('{source}', 'origin cities')
                .replace('{destination}', 'destination cities')
                .replace('{nodes}', 'cities');
            // Add to test cases
            testQueries.push({
                query: query,
                expectedType: type,
                context: "Generated from pattern: ".concat(pattern)
            });
        }
    }
    // Add some more natural language variations
    var naturalQueries = [
        {
            query: "Can you show me a map of income distribution?",
            expectedType: dynamic_layers_1.VisualizationType.CHOROPLETH,
            context: "Natural language choropleth request"
        },
        {
            query: "I'd like to see where restaurants are concentrated in the city",
            expectedType: dynamic_layers_1.VisualizationType.HEATMAP,
            context: "Natural language heatmap request"
        },
        {
            query: "Show me which areas have both high income and good schools",
            expectedType: dynamic_layers_1.VisualizationType.JOINT_HIGH,
            context: "Natural language joint high analysis"
        },
        {
            query: "What's the relationship between education and property values?",
            expectedType: dynamic_layers_1.VisualizationType.CORRELATION,
            context: "Natural language correlation request"
        },
        {
            query: "Plot all the bike-sharing stations",
            expectedType: dynamic_layers_1.VisualizationType.SCATTER,
            context: "Natural language scatter plot request"
        },
        {
            query: "Group the coffee shops by neighborhood",
            expectedType: dynamic_layers_1.VisualizationType.CLUSTER,
            context: "Natural language cluster request"
        },
        {
            query: "How has population changed from 2010 to 2020?",
            expectedType: dynamic_layers_1.VisualizationType.TRENDS,
            context: "Natural language trends request"
        },
        {
            query: "Which are the 5 neighborhoods with the highest property values?",
            expectedType: dynamic_layers_1.VisualizationType.TOP_N,
            context: "Natural language top-n request"
        }
    ];
    // Combine all test queries
    return __spreadArray(__spreadArray([], testQueries, true), naturalQueries, true);
}
/**
 * Test query classification for all visualization types
 */
function testAIQueryClassification() {
    return __awaiter(this, void 0, void 0, function () {
        var testCases, matched, mismatched, results, _i, testCases_1, testCase, query, expectedType, context, analysisResult, result, match, _a, _b, _c, type, stats, s, matchRate;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log("\n=== TESTING AI CHAT QUERY CLASSIFICATION ===\n");
                    testCases = generateTestQueries();
                    console.log("Generated ".concat(testCases.length, " test queries covering all visualization types"));
                    matched = 0;
                    mismatched = 0;
                    results = {};
                    _i = 0, testCases_1 = testCases;
                    _d.label = 1;
                case 1:
                    if (!(_i < testCases_1.length)) return [3 /*break*/, 4];
                    testCase = testCases_1[_i];
                    query = testCase.query, expectedType = testCase.expectedType, context = testCase.context;
                    analysisResult = {
                        intent: 'visualization',
                        relevantLayers: ['testLayer'],
                        relevantFields: ['income', 'education', 'population'],
                        queryType: 'unknown',
                        confidence: 1.0,
                        explanation: 'User wants to visualize data',
                        originalQuery: query
                    };
                    return [4 /*yield*/, query_classifier_1.queryClassifier.classifyAnalysisResult(analysisResult)];
                case 2:
                    result = _d.sent();
                    match = result === expectedType;
                    if (match) {
                        matched++;
                    }
                    else {
                        mismatched++;
                    }
                    // Track results by visualization type
                    if (!results[expectedType]) {
                        results[expectedType] = { matched: 0, mismatched: 0, total: 0 };
                    }
                    results[expectedType].total++;
                    if (match) {
                        results[expectedType].matched++;
                    }
                    else {
                        results[expectedType].mismatched++;
                    }
                    // Log result
                    console.log("\nQuery: \"".concat(query, "\""));
                    console.log("Context: ".concat(context));
                    console.log("Expected: ".concat(expectedType));
                    console.log("Result: ".concat(result));
                    console.log("Match: ".concat(match ? '✅' : '❌'));
                    _d.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    // Log summary
                    console.log("\n=== CLASSIFICATION SUMMARY ===");
                    console.log("Total queries: ".concat(testCases.length));
                    console.log("Matched: ".concat(matched, " (").concat((matched / testCases.length * 100).toFixed(2), "%)"));
                    console.log("Mismatched: ".concat(mismatched, " (").concat((mismatched / testCases.length * 100).toFixed(2), "%)"));
                    console.log("\nResults by visualization type:");
                    for (_a = 0, _b = Object.entries(results); _a < _b.length; _a++) {
                        _c = _b[_a], type = _c[0], stats = _c[1];
                        s = stats;
                        matchRate = (s.matched / s.total * 100).toFixed(2);
                        console.log("  ".concat(type, ": ").concat(s.matched, "/").concat(s.total, " (").concat(matchRate, "%)"));
                    }
                    return [2 /*return*/, results];
            }
        });
    });
}
/**
 * Verify the metadata for all visualization types
 */
function checkVisualizationMetadata() {
    console.log("\n=== VERIFYING VISUALIZATION METADATA ===\n");
    for (var _i = 0, _a = Object.entries(dynamic_layers_1.visualizationTypesConfig); _i < _a.length; _i++) {
        var _b = _a[_i], type = _b[0], metadata = _b[1];
        console.log("\nChecking ".concat(type, ":"));
        // Check label and description
        console.log("  Label: ".concat(metadata.label || 'MISSING'));
        console.log("  Description: ".concat(metadata.description || 'MISSING'));
        // Check query patterns
        var patterns = metadata.aiQueryPatterns || [];
        console.log("  Query patterns: ".concat(patterns.length));
        if (patterns.length === 0) {
            console.log("  \u274C No query patterns defined");
        }
        else if (patterns.length < 3) {
            console.log("  \u26A0\uFE0F Only ".concat(patterns.length, " query patterns defined"));
        }
        else {
            console.log("  \u2705 ".concat(patterns.length, " query patterns defined"));
        }
        // Check supported geometry types
        console.log("  Supports geometry types: ".concat(metadata.supportsGeometryTypes.join(', ')));
        // Check required fields
        console.log("  Required fields: ".concat(metadata.requiresFields));
    }
}
/**
 * Main test function
 */
function runTests() {
    return __awaiter(this, void 0, void 0, function () {
        var classificationResults, totalMatched, totalTests, _i, _a, stats, s, overallSuccessRate;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("=== AI VISUALIZATION INTEGRATION TEST ===");
                    // Check visualization metadata
                    checkVisualizationMetadata();
                    return [4 /*yield*/, testAIQueryClassification()];
                case 1:
                    classificationResults = _b.sent();
                    totalMatched = 0;
                    totalTests = 0;
                    for (_i = 0, _a = Object.values(classificationResults); _i < _a.length; _i++) {
                        stats = _a[_i];
                        s = stats;
                        totalMatched += s.matched;
                        totalTests += s.total;
                    }
                    overallSuccessRate = Number((totalMatched / totalTests * 100).toFixed(2));
                    console.log("\n=== OVERALL RESULTS ===");
                    console.log("AI classification success rate: ".concat(overallSuccessRate, "%"));
                    if (overallSuccessRate >= 90) {
                        console.log("✅ SUCCESS: AI can effectively access all visualization types");
                    }
                    else if (overallSuccessRate >= 75) {
                        console.log("⚠️ PARTIAL SUCCESS: AI can access most visualization types but some improvements needed");
                    }
                    else {
                        console.log("❌ NEEDS IMPROVEMENT: AI has difficulty accessing many visualization types");
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// Run the tests
runTests();
// Export for use in Node.js environments
if (typeof module !== 'undefined') {
    module.exports = {
        runTests: runTests,
        generateTestQueries: generateTestQueries,
        testAIQueryClassification: testAIQueryClassification,
        checkVisualizationMetadata: checkVisualizationMetadata
    };
}
