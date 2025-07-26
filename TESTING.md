# Testing Reference

This document tracks the test cases for the application, their status, and any relevant notes.

## Production Testing Requirements

### Critical Requirements
- All tests must use real production data and live service endpoints
- No mocking or dummy data allowed in production testing
- All layer URLs must be actual ArcGIS service endpoints
- All spatial queries must be executed against real feature services
- Performance metrics must be measured with actual data volumes
- Network conditions must be tested in real-world scenarios

### Data Requirements
- Use actual demographic data from production services
- Test with real business location data
- Verify against live spending and psychographic datasets
- All layer configurations must match production settings
- Feature counts and geometries must match production data

### Service Requirements
- All ArcGIS services must be production endpoints
- Authentication must use real credentials
- Rate limits must be respected as per production settings
- Service response times must be measured against actual endpoints
- Error handling must be tested with real service responses

### Performance Benchmarks
- Layer loading times must be measured with actual data volumes
- Query response times must be benchmarked against real services
- Memory usage must be monitored with production data
- Network bandwidth must be measured in real-world conditions
- Browser performance must be tested with actual feature counts

### Security Requirements
- All tests must use production authentication
- Access control must be tested with real user roles
- Data encryption must be verified with actual services
- API keys and tokens must be production credentials
- Security headers and policies must match production

## Layer Management Tests

### Layer Controller
- [x] Layer visibility toggle
  - Test: Toggle layer visibility on/off for demographics layer (Population Density Index)
  - Status: Passed
  - Notes: Tested with real production endpoint: https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__1025f3822c784873/FeatureServer/0
  - Expected: Layer should toggle visibility in map view, state should persist

- [x] Layer opacity adjustment
  - Test: Adjust opacity for businesses layer (Urban Centers)
  - Status: Passed
  - Notes: Tested with real production endpoint: https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__1025f3822c784873/FeatureServer/6
  - Expected: Opacity changes should be reflected immediately in map view

- [x] Layer group expansion/collapse
  - Test: Expand and collapse demographics-group
  - Status: Passed
  - Notes: Group contains Population Density Index and Income Level Index layers
  - Expected: Group state should persist between sessions

- [x] Layer reordering
  - Test: Drag and drop layers within demographics-group
  - Status: Passed
  - Notes: Testing with real feature services
  - Expected: Layer order should update in map view and persist

### Layer Filtering
- [x] Text search filtering
  - Test: Search for "Population" in layer names
  - Status: Passed
  - Notes: Successfully matched Population Density Index and Income Level Index
  - Expected: Only matching layers should be visible in list

- [x] Group filtering
  - Test: Filter layers by demographics-group
  - Status: Passed
  - Notes: Group contains Population Density Index and Income Level Index
  - Expected: Only layers in selected group should be visible

## Spatial Query Tests

### Drawing Tools
- [ ] Polygon drawing
  - Test: Draw polygon and verify geometry
  - Status: Not Started
  - Notes: Check vertex placement and closure

- [ ] Circle drawing
  - Test: Draw circle and verify radius
  - Status: Not Started
  - Notes: Verify circle geometry creation

- [ ] Rectangle drawing
  - Test: Draw rectangle and verify extent
  - Status: Not Started
  - Notes: Check corner placement

- [ ] Route drawing
  - Test: Draw route/polyline
  - Status: Not Started
  - Notes: Verify vertex placement

### Spatial Operations
- [ ] Intersects operation
  - Test: Query features that intersect drawn geometry
  - Status: Not Started
  - Notes: Verify correct feature selection

- [ ] Contains operation
  - Test: Query features contained within drawn geometry
  - Status: Not Started
  - Notes: Check boundary conditions

- [ ] Buffer operation
  - Test: Create buffer around drawn geometry
  - Status: Not Started
  - Notes: Verify buffer distance accuracy

## Visualization Tests

### Custom Visualization Panel
- [x] Visualization type selection
  - Test: Change visualization type
  - Status: Passed
  - Notes: Successfully tested all visualization types
  - Expected: Renderer updates correctly

- [x] Color scheme changes
  - Test: Apply different color schemes
  - Status: Passed
  - Notes: Color schemes applied correctly
  - Expected: Colors update in visualization

- [x] Opacity adjustment
  - Test: Adjust layer opacity
  - Status: Passed
  - Notes: Opacity changes reflected properly
  - Expected: Visualization transparency changes

### Renderer Optimization
- [x] Clustering toggle
  - Test: Enable/disable clustering
  - Status: Passed
  - Notes: Performance improvement observed
  - Expected: Clustering reduces rendering load

- [x] Feature reduction
  - Test: Apply feature reduction
  - Status: Passed
  - Notes: Feature reduction applied successfully for large datasets
  - Expected: Rendering performance improves while maintaining data integrity

## Layer Sharing Tests

### Share Settings
- [ ] Edit permissions
  - Test: Toggle edit permissions
  - Status: Not Started
  - Notes: Verify permission enforcement

- [ ] Download permissions
  - Test: Toggle download permissions
  - Status: Not Started
  - Notes: Check download restrictions

- [ ] Share link generation
  - Test: Generate shareable link
  - Status: Not Started
  - Notes: Verify link functionality

## Performance Tests

### Layer Loading
- [ ] Initial load time
  - Test: Measure time to load all layers
  - Status: Not Started
  - Notes: Set baseline performance metrics

- [ ] Layer state persistence
  - Test: Save and restore layer states
  - Status: Not Started
  - Notes: Check state restoration accuracy

### Query Performance
- [ ] Spatial query response time
  - Test: Measure query execution time
  - Status: Not Started
  - Notes: Set performance benchmarks

- [ ] Large dataset handling
  - Test: Query with large feature sets
  - Status: Not Started
  - Notes: Check memory usage and response time

## Error Handling Tests

### Input Validation
- [ ] Invalid geometry handling
  - Test: Handle invalid drawn geometries
  - Status: Not Started
  - Notes: Verify error messages

- [ ] Invalid query parameters
  - Test: Handle invalid query settings
  - Status: Not Started
  - Notes: Check error feedback

### Network Errors
- [ ] Connection loss handling
  - Test: Handle network interruptions
  - Status: Not Started
  - Notes: Verify recovery behavior

- [ ] Timeout handling
  - Test: Handle query timeouts
  - Status: Not Started
  - Notes: Check timeout recovery

## Test Status Legend
- Not Started: Test case identified but not implemented
- In Progress: Test case is being implemented
- Passed: Test case implemented and passing
- Failed: Test case implemented but failing
- Blocked: Test case blocked by dependencies or issues

## Testing Status Summary (Updated: May 29, 2025)

The following components have been thoroughly tested:

1. **Layer Management System** ✅
   - Layer visibility toggle, opacity adjustment, group expansion/collapse
   - Layer reordering, filtering, comparison tools
   - Layer statistics and metadata display

2. **Visualization System** ✅
   - All visualization types tested
   - Renderer optimization validated
   - Performance metrics collected

3. **SHAP Microservice Integration** ✅
   - API endpoints and asynchronous processing
   - Feature augmentation and AI explanation generation

4. **Geospatial Chat Interface** ✅
   - Processing steps and visualization integration
   - Layer management and SHAP integration

See [test_report.md](./test_report.md) for detailed test results. 