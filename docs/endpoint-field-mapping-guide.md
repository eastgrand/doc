# Endpoint Field Mapping Guide

## Overview

This guide explains how to add new analysis endpoints or update existing ones using the centralized field mapping system. The system eliminates the need for multiple if statements throughout the codebase and ensures consistent data handling across all endpoints.

## Quick Start: Adding a New Endpoint

To add a new analysis endpoint, you only need to update **one file**:

### 1. Add Field Mapping Configuration

Edit `/lib/analysis/utils/FieldMappingConfig.ts` and add your endpoint to the `ENDPOINT_FIELD_MAPPINGS` object:

```typescript
// Example: Adding a new "customer_sentiment" endpoint
'customer_sentiment': {
  primaryScoreField: 'sentiment_score',
  displayName: 'Customer Sentiment Score',
  expectedRange: { min: -100, max: 100 },
  formatter: (value) => `${value > 0 ? '+' : ''}${value.toFixed(1)}`
},
```

### 2. That's It!

No other code changes are needed. The system will automatically:
- ✅ Use the correct field for visualization
- ✅ Apply proper quartile rendering
- ✅ Handle data joins correctly
- ✅ Format values appropriately

## Field Mapping Configuration Options

```typescript
interface EndpointFieldMapping {
  // Required: The main field containing the score/metric
  primaryScoreField: string;
  
  // Optional: Backup fields if primary is missing
  fallbackFields?: string[];
  
  // Optional: Human-readable name for legends/popups
  displayName?: string;
  
  // Optional: Expected value range for validation
  expectedRange?: {
    min: number;
    max: number;
  };
  
  // Optional: Treat values as percentages
  isPercentage?: boolean;
  
  // Optional: Custom display formatter
  formatter?: (value: number) => string;
}
```

## Examples

### Basic Score Field
```typescript
'market_analysis': {
  primaryScoreField: 'market_score',
  displayName: 'Market Score'
}
```

### With Fallback Fields
```typescript
'customer_analysis': {
  primaryScoreField: 'customer_satisfaction_score',
  fallbackFields: ['customer_score', 'satisfaction_index'],
  displayName: 'Customer Satisfaction'
}
```

### Percentage Values
```typescript
'conversion_analysis': {
  primaryScoreField: 'conversion_rate',
  displayName: 'Conversion Rate',
  isPercentage: true,
  expectedRange: { min: 0, max: 100 }
}
```

### Custom Formatting
```typescript
'financial_analysis': {
  primaryScoreField: 'roi_score',
  displayName: 'Return on Investment',
  formatter: (value) => `$${(value * 1000).toLocaleString()}`
}
```

### Correlation Scores
```typescript
'correlation_analysis': {
  primaryScoreField: 'correlation_coefficient',
  displayName: 'Correlation',
  expectedRange: { min: -1, max: 1 },
  formatter: (value) => value.toFixed(3)
}
```

## Data File Requirements

Your endpoint's data file should contain records with the specified score field:

```json
{
  "results": [
    {
      "ID": "12345",
      "value_DESCRIPTION": "Location Name",
      "your_score_field": 85.3,
      "other_data_field": "some value"
    }
  ]
}
```

## Testing Your New Endpoint

1. **Add the mapping** to `FieldMappingConfig.ts`
2. **Create or update** your data file in `/public/data/endpoints/`
3. **Test a query** that triggers your analysis type
4. **Verify the visualization** uses correct values and ranges

## Naming Conventions

### Analysis Types
- Use snake_case: `customer_sentiment`, `market_analysis`
- Match your processor's `type` field exactly
- Be descriptive but concise

### Score Fields
- Use descriptive names: `sentiment_score`, `market_potential_score`
- Include "score" in the name for clarity
- Use snake_case consistently

### Display Names
- Use Title Case: "Customer Sentiment Score"
- Keep under 30 characters for legends
- Be user-friendly, not technical

## Advanced Configuration

### Multiple Score Types
```typescript
'multi_metric_analysis': {
  primaryScoreField: 'primary_score',
  fallbackFields: ['secondary_score', 'tertiary_score'],
  displayName: 'Multi-Metric Score'
}
```

### Conditional Formatting
```typescript
'risk_analysis': {
  primaryScoreField: 'risk_score',
  displayName: 'Risk Level',
  formatter: (value) => {
    if (value < 30) return `Low Risk (${value.toFixed(1)})`;
    if (value < 70) return `Medium Risk (${value.toFixed(1)})`;
    return `High Risk (${value.toFixed(1)})`;
  }
}
```

## Troubleshooting

### Common Issues

1. **Gray Visualization**
   - Check if your `primaryScoreField` exists in the data
   - Verify field name spelling matches exactly
   - Ensure values are numeric

2. **Wrong Value Range in Legend**
   - Update `expectedRange` in your mapping
   - Check if values need scaling/formatting

3. **Field Not Found**
   - Add `fallbackFields` for alternative field names
   - Check data file structure

### Debugging

Add logging to see what field is being used:
```typescript
console.log('Field mapping for', analysisType, ':', getFieldMapping(analysisType));
console.log('Primary score field:', getPrimaryScoreField(analysisType));
```

## Migration from Old System

If you have existing if statements in the code:

### Before (Old Way)
```typescript
// DON'T DO THIS
let field = 'value';
if (data.type === 'competitive_analysis') {
  field = 'competitive_advantage_score';
} else if (data.type === 'strategic_analysis') {
  field = 'strategic_value_score';
}
// ... 14+ more if statements
```

### After (New Way)
```typescript
// DO THIS INSTEAD
const field = getPrimaryScoreField(data.type, data.targetVariable);
```

## Best Practices

1. **Use descriptive field names** that clearly indicate what they measure
2. **Include expected ranges** to help with validation and debugging
3. **Add fallback fields** for backward compatibility
4. **Use custom formatters** sparingly - only when default formatting isn't appropriate
5. **Test with real data** to ensure values display correctly
6. **Document any special requirements** in comments

## Future Enhancements

The field mapping system can be extended to support:
- Multiple score fields per endpoint
- Conditional field selection based on data characteristics
- Dynamic range calculation
- Field validation and error reporting
- Automatic legend generation based on field characteristics

## Need Help?

If you encounter issues:
1. Check the console logs for field mapping debug information
2. Verify your data file structure matches the expected format
3. Test with a simple configuration first, then add complexity
4. Review existing working examples in the configuration file

Remember: The goal is to make adding new endpoints as simple as possible while maintaining consistency across the entire system.