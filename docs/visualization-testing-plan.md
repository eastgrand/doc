# Visualization Testing Plan

This document outlines the testing strategy for the enhanced dynamic visualization system to ensure all visualization types work correctly and the query classification system accurately identifies the appropriate visualization type.

## Unit Testing

### 1. Query Classification Tests

- **File**: `__tests__/query-classifier.test.ts`
- **Purpose**: Verify that the query classifier correctly identifies visualization types from natural language queries.
- **Test Cases**:
  - For each visualization type, test at least 5 different query variations
  - Test ambiguous queries to ensure the default fallback works correctly
  - Test ML classification (when available) against pattern matching

```typescript
// Example test case
it('should identify choropleth queries correctly', () => {
  const queries = [
    'Show me income distribution across neighborhoods',
    'Map income levels by zip code',
    'Display population density',
    'Visualize income distribution by county'
  ];
  
  for (const query of queries) {
    const result = queryClassifier.classifyQuery(query);
    expect(result).toBe(VisualizationType.CHOROPLETH);
  }
});
```

### 2. Visualization Factory Tests

- **File**: `__tests__/dynamic-visualization-factory.test.ts`
- **Purpose**: Verify that the visualization factory correctly creates visualizations based on type.
- **Test Cases**:
  - Test creation of each visualization type
  - Test with various option combinations
  - Test caching mechanism
  - Test error handling with invalid inputs

```typescript
// Example test case
it('should create a hexbin visualization', async () => {
  const factory = new DynamicVisualizationFactory(mockMapView);
  const result = await factory.createVisualization(
    VisualizationType.HEXBIN,
    'testLayerId',
    { fields: ['population'] }
  );
  
  expect(result.layer).not.toBeNull();
  expect(result.layer.renderer.type).toBe('heatmap');
  // Additional assertions about the specific renderer properties
});
```

### 3. Individual Visualization Class Tests

- **Directory**: `__tests__/visualizations/`
- **Purpose**: Verify each visualization class works correctly in isolation.
- **Test Cases**:
  - For each visualization class, test basic creation
  - Test with various data shapes and geometries
  - Test renderer generation
  - Test legend generation
  - Test error handling

## Integration Testing

### 1. End-to-End Query to Visualization Tests

- **File**: `__tests__/integration/query-to-visualization.test.ts`
- **Purpose**: Test the full pipeline from query to rendered visualization.
- **Test Cases**:
  - For each visualization type, test a complete query flow
  - Include edge cases like partial data or missing fields
  - Test visualization switching based on changed queries

### 2. UI Integration Tests

- **File**: `__tests__/integration/visualization-ui.test.tsx`
- **Purpose**: Test interaction between visualization system and UI components.
- **Test Cases**:
  - Test legend generation for each visualization type
  - Test interaction between chat queries and visualization rendering
  - Test visualization controls for each type

## Manual Testing

### 1. Visual Inspection Checklist

For each visualization type, manually verify:

- Correct colors and symbology according to configuration
- Proper scaling of symbols/features
- Appropriate legend generation
- Correct handling of extreme values
- Proper handling of null/missing values
- UI responsiveness with large datasets

### 2. Query Recognition Testing

Test each of the following query patterns to ensure they match the expected visualization type:

#### Choropleth
- "Show me income distribution across neighborhoods"
- "Map income levels by zip code"

#### Heatmap
- "Show density of restaurants"
- "Heat map of crime incidents"

#### Scatter
- "Plot all store locations"
- "Show individual data points for rainfall"

#### Cluster
- "Cluster the coffee shops"
- "Group points by location"

#### Bivariate
- "Show relationship between income and education with colors"
- "Create a bivariate map of income and population"

#### Buffer
- "Create a 5 mile radius around hospitals"
- "Show areas within 10 km of schools"

#### Hotspot
- "Find hotspots of crime incidents"
- "Identify statistically significant clusters of high income"

#### Network
- "Show connections between cities based on migration"
- "Create a flow diagram of trade between countries"

#### Multivariate
- "Compare population, income, and education levels"
- "Show income with size, education with color, and age with opacity"

## Performance Testing

### 1. Load Testing

- **Purpose**: Verify the system performs well under load.
- **Test Cases**:
  - Test with 1,000+ features for each visualization type
  - Measure rendering time and memory usage
  - Test visualization caching mechanism effectiveness

### 2. Concurrency Testing

- **Purpose**: Verify multiple visualizations can be created/managed simultaneously.
- **Test Cases**:
  - Create multiple visualizations in parallel
  - Switch rapidly between visualization types
  - Test with multiple map views

## Specific Features to Test

1. **Dynamic Import System**
   - Verify correct lazy loading of visualization classes
   - Test error handling when a visualization module fails to load

2. **Caching System**
   - Verify visualizations are correctly cached
   - Test cache invalidation
   - Verify cache size limits work correctly

3. **Query Classification**
   - Test accuracy of pattern matching
   - Test ML classification when available
   - Test fallback mechanisms

4. **Renderer Generation**
   - Verify appropriate renderers are created for each visualization type
   - Test with different data distributions
   - Verify renderers handle edge cases (all zeros, negative values, etc.)

## Test Data Requirements

For comprehensive testing, prepare test datasets with the following characteristics:

1. **Point Data**
   - Points with various attributes
   - Clustered points
   - Randomly distributed points

2. **Polygon Data**
   - Polygons of various sizes
   - Polygons with multiple attributes
   - Polygons with missing data

3. **Line Data**
   - Network or flow data
   - Lines with direction attributes
   - Lines with varying thicknesses

4. **Temporal Data**
   - Data with time stamps
   - Time series data
   - Seasonal patterns

## Test Schedule

1. **Unit Tests**: Should be run with every PR and code change
2. **Integration Tests**: Should be run daily in CI pipeline
3. **Performance Tests**: Should be run weekly
4. **Manual Testing**: Should be performed before major releases

## Test Environment

- **Development**: Local environment with sample data
- **Staging**: Production-like environment with synthetic data
- **Production Validation**: Limited test suite with real data

## Reporting

Test results should be documented in:
1. Automated test reports in CI/CD pipeline
2. Weekly test summary for the team
3. Pre-release test report for stakeholders

## Responsible Team Members

- **Unit Tests**: Development team
- **Integration Tests**: QA team and development team
- **Performance Tests**: Performance engineering team
- **Manual Testing**: QA team and product managers 