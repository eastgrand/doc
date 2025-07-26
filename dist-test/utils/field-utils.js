"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preferPercentage = void 0;
const field_aliases_1 = require("./field-aliases");
const preferPercentage = (fieldCode) => {
    // If already a percentage field, leave unchanged
    if (!fieldCode)
        return fieldCode;
    if (fieldCode.endsWith('_P'))
        return fieldCode;
    const percentVersion = `${fieldCode}_P`;
    // If alias table contains percentVersion mapping to itself, assume it exists
    if (field_aliases_1.FIELD_ALIASES[percentVersion.toLowerCase()] === percentVersion) {
        return percentVersion;
    }
    return fieldCode;
};
exports.preferPercentage = preferPercentage;
