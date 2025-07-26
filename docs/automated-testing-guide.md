# Automated Query Testing System

## Overview

This system automatically tests all predefined queries from `components/chat/chat-constants.ts` through the complete pipeline: submission → analysis → visualization → effects.

## Quick Start

### Method 1: Simple Script Run
```bash
node scripts/run-query-tests.js
```

### Method 2: Direct TypeScript Execution  
```bash
npx ts-node scripts/test-all-queries.ts
```

### Method 3: Jest Test Suite
```bash
npm test -- __tests__/automated-query-pipeline.test.ts
```

## Features

### 🔍 **Complete Pipeline Testing**
- **Query Processing**: Tests analysis engine query interpretation
- **Endpoint Routing**: Validates correct endpoint selection
- **Data Processing**: Checks data transformation and validation
- **Visualization Generation**: Tests renderer selection and configuration
- **Effects Integration**: Validates firefly effects, hover animations, gradients

### 📊 **Comprehensive Reporting**
- **Success/Failure Analysis**: Category-by-category breakdown
- **Performance Metrics**: Execution times, data volumes, bottlenecks
- **Visualization Validation**: Renderer types, effect flags, legend generation
- **Effects Testing**: Firefly particles, hover animations, gradient systems
- **Error Categorization**: Network, analysis, visualization, and effects errors

### 📈 **Export Formats**
- **JSON**: Detailed results for programmatic analysis
- **CSV**: Summary data for spreadsheet analysis  
- **Markdown**: Human-readable reports
- **Console**: Real-time progress and summary

## Test Coverage

### **ANALYSIS_CATEGORIES (7 categories, 14 queries)**
```javascript
'ranking': 2 queries        // Market ranking and opportunity analysis
'comparison': 2 queries     // Nike vs Adidas, risk comparisons  
'bivariate': 2 queries      // Relationship and correlation analysis
'difference': 2 queries     // Growth vs performance differences
'multivariate': 2 queries   // Comprehensive multi-endpoint analysis
'simple': 2 queries         // Basic competitive and demographic analysis
'hotspot': 2 queries        // Investment and opportunity hotspots
```

### **TRENDS_CATEGORIES (5 categories, 17 queries)**
```javascript  
'Single Endpoint Analysis': 4 queries     // Spatial, anomaly, trend, outlier
'Multi-Endpoint Correlation': 4 queries   // Cross-analysis correlations
'Predictive and Risk Analysis': 4 queries // Forecasting and risk modeling
'Advanced Multi-Endpoint': 4 queries      // Complex strategic analysis
'Diagnostic Analysis': 3 queries          // Root cause analysis
```

## Command Line Options

```bash
# Basic run
npm run test-queries

# Verbose output
npm run test-queries -- --verbose

# Skip exports  
npm run test-queries -- --no-export

# Test specific categories
npm run test-queries -- --categories ranking,comparison

# Show help
npm run test-queries -- --help
```

## Sample Output

```
🚀 Starting automated testing of all predefined queries...

📋 Testing category: ranking
  🔍 Testing: "Rank the top markets for Nike expansion considering comp..."
    ✅ Success: competitive visualization with 247 points + effects

📋 Testing category: comparison  
  🔍 Testing: "Compare Nike vs Adidas performance across demographic..."
    ✅ Success: multi-symbol visualization with 198 points + effects

📊 AUTOMATED QUERY TEST REPORT
================================================================================

🔍 OVERVIEW:
   Total Queries Tested: 31
   Successful: 28 (90.3%)
   Failed: 3 (9.7%)
   Average Execution Time: 2847ms

📋 CATEGORY PERFORMANCE:
   ANALYSIS_CATEGORIES:ranking: 2/2 (100.0%)
   ANALYSIS_CATEGORIES:comparison: 2/2 (100.0%)
   TRENDS_CATEGORIES:Single Endpoint Analysis: 3/4 (75.0%)
   
🎯 ENDPOINT UTILIZATION:
   /competitive-analysis: 12 queries
   /spatial-clustering: 8 queries
   /demographic-analysis: 5 queries

🎨 VISUALIZATION TYPE DISTRIBUTION:
   competitive: 12 visualizations
   choropleth: 9 visualizations  
   cluster: 7 visualizations

✨ EFFECTS INTEGRATION TESTING:
   Queries with Effects: 15
   Effects Working: 14/15
   Effect Types Tested:
     firefly: 12 instances
     hover: 15 instances
     gradient: 9 instances
```

## Configuration

Edit `test-config.json` to customize:

### **Test Behavior**
```json
{
  "testConfig": {
    "timeout": 30000,
    "retryFailedQueries": false,
    "parallelExecution": false
  }
}
```

### **Category Selection**
```json
{
  "categories": {
    "ANALYSIS_CATEGORIES": {
      "enabled": true,
      "categories": ["ranking", "comparison"]
    }
  }
}
```

### **Effects Testing**
```json
{
  "effects": {
    "testFireflyEffects": true,
    "performanceThresholds": {
      "maxParticles": 200,
      "minSuccessRate": 0.8
    }
  }
}
```

## Integration with CI/CD

### **GitHub Actions Example**
```yaml
- name: Run Query Tests
  run: |
    npm install
    npm run test-queries -- --no-export
    
- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: query-test-results
    path: test-results/
```

### **Performance Monitoring**
```bash
# Set thresholds in test-config.json
{
  "thresholds": {
    "minimumSuccessRate": 0.8,
    "maximumAverageExecutionTime": 5000
  }
}
```

## Troubleshooting

### **Common Issues**

#### **Tests Failing to Start**
```bash
# Install dependencies
npm install ts-node typescript

# Check TypeScript config
npx tsc --showConfig
```

#### **Network/API Errors** 
- Check API endpoint availability
- Verify authentication credentials
- Review rate limiting settings

#### **Visualization Errors**
- Ensure ArcGIS dependencies are loaded
- Check renderer compatibility
- Validate data format requirements

#### **Effects Not Working**
- Verify EffectsManager initialization  
- Check renderer flag detection
- Validate canvas/WebGL support

### **Performance Issues**
```bash
# Reduce test scope
npm run test-queries -- --categories simple

# Skip effects testing
# Edit test-config.json: "testEffects": false

# Use parallel execution (experimental)
npm run test-queries -- --parallel
```

## Results Analysis

### **JSON Export Structure**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "summary": {
    "totalQueries": 31,
    "successfulQueries": 28,
    "effectsTestResults": { ... }
  },
  "detailedResults": [
    {
      "query": "Rank the top markets...",
      "success": true,
      "executionTime": 2847,
      "visualizationType": "competitive",
      "effectsEnabled": true
    }
  ]
}
```

### **Performance Metrics**
- **Execution Time**: Individual and average query processing times
- **Data Volume**: Number of records processed per query
- **Success Rates**: Overall and category-specific success rates
- **Effects Performance**: Particle counts, rendering efficiency

This testing system provides comprehensive validation of the entire query processing pipeline, ensuring reliability, performance, and proper effects integration across all predefined query types.