# Microservice Endpoint Fixes Documentation

## Executive Summary

**Current Status**: 3 out of 16 endpoints are working (18.8% success rate)
- ✅ Working: `/analyze`, `/feature-interactions`, `/competitive-analysis`
- ❌ Failing: 13 endpoints with specific code issues

## Analysis of Failing Endpoints

### 🔴 **Code Error Issues** (5 endpoints - HIGH PRIORITY)

#### 1. `/outlier-detection` & `/scenario-analysis` - Missing `resolve_field_name` Function
**Error**: `NameError: name 'resolve_field_name' is not defined`

**Root Cause**: The `resolve_field_name` function is defined inside the `/analyze` endpoint (lines 206-318 in `app.py`) but is not imported or available in other endpoints.

**Fix Required**:
```python
# BEFORE (line 818 in outlier-detection):
actual_target_field = resolve_field_name(target_field)

# AFTER: Move resolve_field_name to a shared module or copy function
```

**Files to Modify**:
- `shap-microservice/app.py` lines 818, 1041
- **Solution**: Extract `resolve_field_name` function to a shared utility module or copy the function definition to the top of `app.py`

#### 2. `/segment-profiling` - Missing `RandomForestRegressor` Import  
**Error**: `NameError: name 'RandomForestRegressor' is not defined`

**Root Cause**: `RandomForestRegressor` is imported locally within other endpoints but not in segment-profiling.

**Fix Required**:
```python
# BEFORE (line 1494 in segment-profiling):
model = RandomForestRegressor(n_estimators=100, random_state=42)

# AFTER: Add import at function start
from sklearn.ensemble import RandomForestRegressor
model = RandomForestRegressor(n_estimators=100, random_state=42)
```

**Files to Modify**:
- `shap-microservice/app.py` line 1494 (add import before model creation)

#### 3. `/comparative-analysis` - Missing Grouping Field Logic
**Error**: `KeyError` when grouping_field is None or invalid

**Root Cause**: The endpoint expects a `grouping_field` parameter but doesn't have proper fallback logic when it's missing.

**Fix Required**:
```python
# BEFORE (line 1638):
if grouping_field not in df.columns:
    return safe_jsonify({"error": f"Grouping field '{grouping_field}' not found in dataset"}, 400)

# AFTER: Add fallback logic
if not grouping_field:
    # Auto-detect grouping field or use a default categorical field
    categorical_fields = df.select_dtypes(include=['object', 'category']).columns.tolist()
    if categorical_fields:
        grouping_field = categorical_fields[0]
    else:
        return safe_jsonify({"error": "No grouping field specified and no categorical fields found"}, 400)

if grouping_field not in df.columns:
    return safe_jsonify({"error": f"Grouping field '{grouping_field}' not found in dataset"}, 400)
```

#### 4. `/spatial-clusters` - NaN Handling in KMeans
**Error**: `ValueError: Input contains NaN, infinity or a value too large for dtype('float64')`

**Root Cause**: KMeans clustering fails when data contains NaN values, even after fillna() operation.

**Fix Required**:
```python
# BEFORE (line 2245):
X_scaled = scaler.fit_transform(X)
cluster_labels = kmeans.fit_predict(X_scaled)

# AFTER: Add robust NaN handling
# Ensure no NaN values remain
X_clean = X.fillna(X.median())
# Double-check for any remaining NaN or infinite values
X_clean = X_clean.replace([np.inf, -np.inf], np.nan).fillna(X_clean.median())
# Verify no NaN values
if X_clean.isnull().any().any():
    X_clean = X_clean.fillna(0)

X_scaled = scaler.fit_transform(X_clean)
cluster_labels = kmeans.fit_predict(X_scaled)
```

#### 5. `/factor-importance` - Inconsistent Field Resolution
**Error**: Occasional field resolution failures for certain brand fields

**Root Cause**: Uses different field resolution logic than the working `/analyze` endpoint.

**Fix Required**: Use the same `resolve_field_name` function as `/analyze` endpoint.

---

### 🔴 **Timeout Issues** (6 endpoints - MEDIUM PRIORITY)

The following endpoints timeout due to performance issues:

1. **`/time-series-analysis`** - Line 1959: Large SHAP calculation without optimization
2. **`/brand-affinity`** - Line 2102: Multiple model training without caching  
3. **`/lifecycle-analysis`** - Line 2744: Excessive SHAP calculations per lifecycle stage
4. **`/economic-sensitivity`** - Complex scenario modeling without optimization
5. **`/penetration-optimization`** - Line 3087: Large dataset operations
6. **`/market-risk`** - Complex risk calculations

**Common Performance Issues**:
- Large SHAP calculations without sampling limits
- No model caching between requests
- Excessive data processing in single request
- Missing async processing for heavy operations

**Fix Strategy**:
1. **Reduce SHAP sample sizes**: Limit to 50-100 samples max
2. **Add model caching**: Cache trained models between requests
3. **Implement batch processing**: Break large operations into smaller chunks
4. **Add timeout handling**: Graceful degradation for long operations

---

### 🟡 **Request Format Issues** (2 endpoints - LOW PRIORITY)

#### `/threshold-analysis` & `/market-risk`
**Error**: `400 Bad Request` - Missing required parameters

**Root Cause**: Endpoints expect different parameter formats than provided in test script.

**Fix Required**: Update parameter validation and add default values.

---

## Implementation Priority

### **Phase 1: Critical Code Fixes** (1-2 days)
1. Extract `resolve_field_name` to shared utility module
2. Add missing `RandomForestRegressor` import in segment-profiling
3. Add grouping field fallback logic in comparative-analysis
4. Fix NaN handling in spatial-clusters

### **Phase 2: Performance Optimization** (3-5 days)  
1. Implement model caching system
2. Reduce SHAP sample sizes across all endpoints
3. Add async processing for heavy operations
4. Implement timeout handling

### **Phase 3: Parameter Validation** (1 day)
1. Standardize parameter validation across endpoints
2. Add better error messages
3. Implement parameter defaults

---

## Expected Results After Fixes

**Target Success Rate**: 14-15 out of 16 endpoints (87-93%)

**Phase 1 Complete**: 8-9 working endpoints (50-56%)
**Phase 2 Complete**: 14-15 working endpoints (87-93%)
**Phase 3 Complete**: 16 working endpoints (100%)

---

## Code Locations Summary

**Files Requiring Changes**:
- `shap-microservice/app.py` (primary file - 13 specific line ranges)
- New file: `shap-microservice/field_utils.py` (for shared resolve_field_name)
- New file: `shap-microservice/model_cache.py` (for performance optimization)

**Total Lines of Code to Modify**: ~50-75 lines
**New Code Required**: ~200-300 lines (utilities and optimizations)

This is a manageable scope that can significantly improve the endpoint success rate from 18.8% to 87-93%. 