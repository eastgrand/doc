# Query System Testing Framework

A comprehensive testing framework for validating the query processing pipeline, including field selection, endpoint routing, and performance analysis.

**🎯 Complete Field Coverage**: Tests all 98+ fields from the system with 82+ comprehensive queries across 13+ categories.

## 🚀 Quick Start

### Prerequisites

Install the required TypeScript runner:
```bash
npm install -g tsx
# OR
npm install -g ts-node
```

### Run the Test

```bash
# Run complete test suite
npm run test:query-system

# Open interactive dashboard (starts local server)
npm run test:query-dashboard

# Alternative: Run test and open dashboard
node run-query-test.js

# Clean up old test files
node run-query-test.js --clean

# Show help
node run-query-test.js --help
```

## 📊 What Gets Tested

### Query Categories (13 Categories, 82+ Queries)
- **Brand Rankings**: "Show me top 10 Nike purchases", "Best Adidas areas"
- **Brand Comparisons**: "Nike vs Adidas performance", "Compare all brands"
- **Demographics**: "Age vs shoe purchases", "Income correlation with brands"
- **Geographic**: "Athletic shoe clusters", "Regional patterns"
- **Sports Participation**: "Running vs running shoes", "Basketball participation"
- **Retail Analysis**: "Dick's shoppers vs Nike", "Foot Locker preferences"
- **Multi-factor**: "Age, income, sports vs purchases"
- **Difference Analysis**: "Nike vs Adidas gaps", "Premium vs budget"
- **Segmentation**: "Cluster by purchase patterns"
- **Trends**: "Purchase trends over time"
- **Hispanic Demographics**: "Latino community preferences", "Hispanic population analysis" 
- **Shoe Type Analysis**: "Basketball vs running shoes", "Cross-training analysis"
- **Spending Analysis**: "Sports clothing correlation", "Equipment investment patterns"
- **Specialty Demographics**: "American Indian preferences", "NASCAR fans analysis"

### Pipeline Steps Tested

1. **Concept Mapping**
   - Field detection accuracy
   - Keyword extraction
   - Layer matching
   - Processing time

2. **Query Analysis**
   - Query type classification
   - Target variable identification
   - Relevant field selection
   - Visualization strategy

3. **Endpoint Selection**
   - Routing logic validation
   - Endpoint appropriateness
   - Alternative suggestions
   - Confidence scoring

4. **Request Building**
   - Payload construction
   - Field mapping accuracy
   - Parameter validation
   - Size optimization

5. **Validation & Analysis**
   - Expected vs actual fields
   - Missing field detection
   - Duplicate field identification
   - Overall scoring (0-100)

## 📈 Results & Analysis

### Output Files

The test generates several output files:
- `query-system-test-results-[timestamp].json` - Complete detailed results
- `query-system-test-summary-[timestamp].csv` - Summary for spreadsheet analysis

### Dashboard Features

Two dashboard options are available:

**Interactive Dashboard** (http://localhost:3002/query-test-dashboard.html):
- **Real-time Data**: Loads actual test results from JSON files
- **Interactive Filtering**: Filter by category, score range, issues
- **Detailed Table**: Query-by-query breakdown with all metrics
- **Sortable Columns**: Click headers to sort results
- **Query Details**: Hover over queries to see full text

**Static Summary Dashboard** (http://localhost:3002/query-test-dashboard-embedded.html):
- **Overview Statistics**: Success rates, average scores, processing times
- **Category Performance**: Breakdown by test category
- **Issue Analysis**: Common problems and recommendations
- **Performance Insights**: Bottleneck identification
- **Next Steps**: Recommended actions and improvements

### Scoring System

Queries are scored from 0-100 based on:
- **Field Detection** (30 points): Are expected fields found?
- **Endpoint Selection** (25 points): Is the right endpoint chosen?
- **Processing Success** (20 points): Does the pipeline complete?
- **Performance** (15 points): Reasonable processing time?
- **Data Quality** (10 points): No duplicates, clean data?

### Score Interpretation
- **90-100**: Excellent - Pipeline working perfectly
- **70-89**: Good - Minor issues, mostly functional
- **50-69**: Warning - Some problems, needs attention
- **0-49**: Poor - Significant issues, requires fixes

## 🔧 Customization

### Adding New Test Queries

Edit `COMPREHENSIVE_TEST_QUERIES` in `test-query-system-comprehensive.ts`:

```typescript
'Your Category': [
  'Your test query here',
  'Another test query',
  // ... more queries
],
```

### Modifying Expected Results

Update the validation logic in the `analyzeResults` function:

```typescript
// Add new field mappings
const EXPECTED_FIELD_MAPPINGS = {
  'your_brand': ['FIELD_CODE_A', 'FIELD_CODE_B'],
  // ...
};

// Add new endpoint expectations
const EXPECTED_ENDPOINTS = {
  'your_query_type': 'your-expected-endpoint',
  // ...
};
```

### Custom Validation Rules

Add custom validation in the `analyzeResults` function:

```typescript
// Custom validation example
if (queryLower.includes('your_keyword')) {
  if (!actualFields.some(field => field.includes('YOUR_EXPECTED_FIELD'))) {
    issues.push('Missing your custom field');
    recommendations.push('Check your custom logic');
  }
}
```

## 🐛 Troubleshooting

### Common Issues

**"tsx/ts-node not found"**
```bash
npm install -g tsx
```

**"Test file not found"**
- Ensure `test-query-system-comprehensive.ts` exists
- Check file permissions

**"Results file not found"**
- Test may have crashed
- Check console output for errors
- Look for partial results files

**"Dashboard won't open"**
- Manually open `query-test-dashboard.html`
- Check browser security settings
- Try different browser

### Debug Mode

Add debug logging to the test file:

```typescript
// Add at the top of test functions
console.log('[DEBUG] Processing query:', query);
console.log('[DEBUG] Concept result:', conceptResult);
```

### Performance Issues

For large test sets:
- Reduce query count in `COMPREHENSIVE_TEST_QUERIES`
- Increase timeout values
- Run tests in smaller batches

## 📋 Test Results Interpretation

### High-Priority Issues to Address

1. **Missing Expected Fields**: Core functionality problem
2. **Wrong Endpoint Selection**: User gets wrong analysis type  
3. **Processing Failures**: System crashes or errors
4. **Poor Performance**: >5 seconds per query

### Medium-Priority Issues

1. **Duplicate Fields**: Inefficient but functional
2. **Suboptimal Endpoints**: Works but not ideal
3. **Slow Performance**: 2-5 seconds per query

### Low-Priority Issues

1. **Minor Field Variations**: Different but valid fields
2. **Confidence Scores**: Cosmetic scoring issues

## 🎯 Best Practices

### Running Tests

1. **Regular Testing**: Run after major changes
2. **Baseline Comparison**: Compare results over time
3. **Category Focus**: Test specific areas after changes
4. **Performance Monitoring**: Track processing time trends

### Analyzing Results

1. **Start with Overview**: Check overall success rate
2. **Identify Patterns**: Look for category-specific issues
3. **Prioritize Fixes**: Address high-impact problems first
4. **Document Changes**: Track improvements over time

### Making Improvements

1. **Test-Driven**: Write tests before fixing issues
2. **Incremental**: Make small, focused changes
3. **Validate**: Re-run tests after each fix
4. **Monitor**: Watch for regressions in other areas

## 🤝 Contributing

To add new test scenarios:

1. Add queries to appropriate category in `COMPREHENSIVE_TEST_QUERIES`
2. Update expected field mappings if needed
3. Add validation rules for new patterns
4. Test your changes with `node run-query-test.js`
5. Update this README with new patterns

## 📝 Example Usage

```bash
# Run complete test suite
node run-query-test.js

# Expected output:
# 🚀 Starting Query System Test...
# 📊 Testing 50 queries across 10 categories
# 
# [1/50] Testing...
# 🧪 Testing: "Show me the top 10 areas with highest Nike purchases"
# 📂 Category: Brand Rankings
#    📍 Fields: 3 | Keywords: 5 | Success: true
#    🔍 Type: ranking | Target: MP30034A_B | Fields: 3
#    🎯 Endpoint: competitive-analysis | Reason: ranking/competitive analysis
#    🚀 Payload: 245 bytes | Success: true
#    ✅ Score: 95/100 | Issues: 0
# 
# ... (continues for all queries)
# 
# 📈 COMPREHENSIVE TEST RESULTS
# ════════════════════════════════════════
# 📊 Overall Statistics:
#    • Total Queries: 50
#    • Successful Queries (Score ≥70): 47 (94.0%)
#    • Average Score: 87.3/100
#    • Average Processing Time: 234.5ms
# 
# 🌐 Opening test dashboard...
# 📊 Dashboard opened in your default browser
```

The dashboard will open automatically, showing detailed results and allowing interactive analysis of the test results.