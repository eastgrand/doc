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
exports.mapFeatureFields = mapFeatureFields;
exports.convertFieldValue = convertFieldValue;
exports.createFieldDefinitions = createFieldDefinitions;
exports.createPopupFieldInfos = createPopupFieldInfos;
/**
 * Maps feature attributes to standardized fields based on layer configuration
 */
function mapFeatureFields(feature, configuredFields, options) {
    var _a;
    if (options === void 0) { options = {}; }
    console.log('=== Field Mapping Start ===', {
        hasProperties: !!feature.properties,
        hasAttributes: !!feature.attributes,
        rendererField: feature.rendererField,
        configuredFields: configuredFields === null || configuredFields === void 0 ? void 0 : configuredFields.map(function (f) { return ({
            name: f.name,
            type: f.type,
            label: f.label
        }); })
    });
    // Combine all possible sources of attributes
    var combinedAttributes = __assign(__assign(__assign({}, feature.properties), feature.attributes), (feature.rendererField && feature.rendererValue ? (_a = {}, _a[feature.rendererField] = feature.rendererValue, _a) : {}));
    // Create standardized attributes
    var standardizedAttributes = {};
    // Process configured fields first
    if (configuredFields === null || configuredFields === void 0 ? void 0 : configuredFields.length) {
        configuredFields.forEach(function (field) {
            // Get all possible names for this field
            var possibleNames = __spreadArray([
                field.name,
                field.alias,
                field.label
            ], (field.alternateNames || []), true).filter(function (name) { return typeof name === 'string'; });
            // Try exact matches first
            var found = false;
            for (var _i = 0, possibleNames_1 = possibleNames; _i < possibleNames_1.length; _i++) {
                var name_1 = possibleNames_1[_i];
                if (name_1 in combinedAttributes) {
                    var value = combinedAttributes[name_1];
                    // Convert and validate the value based on field type
                    standardizedAttributes[field.name] = convertFieldValue(value, field.type);
                    if (name_1 !== field.name) {
                        standardizedAttributes[name_1] = value; // Preserve original field name and value
                    }
                    console.log("Mapped field ".concat(field.name, ":"), {
                        originalName: name_1,
                        originalValue: value,
                        convertedValue: standardizedAttributes[field.name],
                        fieldType: field.type
                    });
                    found = true;
                    break;
                }
            }
            // If no exact match, try case-insensitive matching
            if (!found) {
                var lowerCaseFields = Object.keys(combinedAttributes).map(function (k) { return k.toLowerCase(); });
                for (var _a = 0, possibleNames_2 = possibleNames; _a < possibleNames_2.length; _a++) {
                    var name_2 = possibleNames_2[_a];
                    var lowerName = name_2.toLowerCase();
                    var index = lowerCaseFields.indexOf(lowerName);
                    if (index !== -1) {
                        var originalKey = Object.keys(combinedAttributes)[index];
                        var value = combinedAttributes[originalKey];
                        standardizedAttributes[field.name] = convertFieldValue(value, field.type);
                        if (originalKey !== field.name) {
                            standardizedAttributes[originalKey] = value;
                        }
                        console.log("Case-insensitive mapped field ".concat(field.name, ":"), {
                            originalName: originalKey,
                            originalValue: value,
                            convertedValue: standardizedAttributes[field.name],
                            fieldType: field.type
                        });
                        break;
                    }
                }
            }
        });
    }
    // Include unmapped fields if requested
    if (options.includeUnmappedFields) {
        Object.entries(combinedAttributes).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            if (!(key in standardizedAttributes)) {
                // Try to determine field type for unmapped fields
                var fieldType = 'string';
                if (typeof value === 'number') {
                    fieldType = Number.isInteger(value) ? 'integer' : 'double';
                }
                else if (value instanceof Date) {
                    fieldType = 'date';
                }
                standardizedAttributes[key] = convertFieldValue(value, fieldType);
            }
        });
    }
    console.log('=== Field Mapping Result ===', {
        mappedFields: Object.keys(standardizedAttributes),
        numericFields: Object.entries(standardizedAttributes)
            .filter(function (_a) {
            var _ = _a[0], v = _a[1];
            return typeof v === 'number';
        })
            .map(function (_a) {
            var k = _a[0];
            return k;
        })
    });
    return standardizedAttributes;
}
/**
 * Converts a field value to the appropriate type
 */
function convertFieldValue(value, type) {
    if (value === null || value === undefined) {
        return value;
    }
    switch (type) {
        case 'integer':
        case 'small-integer':
            return Math.round(Number(value));
        case 'double':
        case 'single':
            return Number(value);
        case 'date':
            return value instanceof Date ? value : new Date(value);
        case 'string':
            return String(value);
        default:
            return value;
    }
}
/**
 * Creates ArcGIS field definitions from feature attributes
 */
function createFieldDefinitions(attributes, configuredFields) {
    var fields = [
        {
            name: "OBJECTID",
            type: "oid"
        }
    ];
    // Add configured fields first
    if (configuredFields === null || configuredFields === void 0 ? void 0 : configuredFields.length) {
        configuredFields.forEach(function (field) {
            if (field.name !== "OBJECTID") {
                fields.push({
                    name: field.name,
                    type: field.type,
                    alias: field.alias || field.label || field.name
                });
            }
        });
    }
    // Add any remaining fields from attributes
    Object.entries(attributes).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        if (key !== "OBJECTID" && !fields.some(function (f) { return f.name === key; })) {
            var fieldType = void 0;
            if (typeof value === 'number') {
                fieldType = Number.isInteger(value) ? "integer" : "double";
            }
            else if (typeof value === 'boolean') {
                fieldType = "small-integer";
            }
            else if (value instanceof Date) {
                fieldType = "date";
            }
            else {
                fieldType = "string";
            }
            fields.push({
                name: key,
                type: fieldType,
                alias: key
            });
        }
    });
    return fields;
}
/**
 * Creates popup template field infos from field definitions
 */
function createPopupFieldInfos(fields, configuredFields) {
    return fields
        .filter(function (field) {
        return field.type !== "oid" && typeof field.name === "string";
    })
        .map(function (field) {
        var configField = configuredFields === null || configuredFields === void 0 ? void 0 : configuredFields.find(function (f) { return f.name === field.name; });
        return {
            fieldName: field.name,
            label: (configField === null || configField === void 0 ? void 0 : configField.label) || field.alias || field.name,
            visible: true,
            format: getFieldFormat(field.type)
        };
    });
}
/**
 * Gets appropriate format configuration for field type
 */
function getFieldFormat(fieldType) {
    switch (fieldType) {
        case "double":
        case "single":
            return {
                places: 2,
                digitSeparator: true
            };
        case "integer":
        case "small-integer":
            return {
                places: 0,
                digitSeparator: true
            };
        case "date":
            return {
                dateFormat: "short-date-short-time"
            };
        default:
            return undefined;
    }
}
