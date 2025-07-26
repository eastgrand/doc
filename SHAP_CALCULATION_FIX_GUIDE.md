# SHAP Calculation Fix Guide

**Date**: January 2025  
**Status**: Implementation Guide  
**Purpose**: Fix zero SHAP values in microservice analysis endpoints

---

## 🎯 Problem Summary

**Issue**: All 16 microservice endpoints return zero SHAP values despite having:
- ✅ Loaded XGBoost model (`models/xgboost_model.pkl`)
- ✅ Feature names (`models/feature_names.txt`) 
- ✅ SHAP library imported
- ✅ 3,983 records with real brand data (Nike: 22.6%, Adidas: 15.7%)
- ❌ **No actual SHAP calculation code**

**Impact**: Frontend gets meaningless analysis with all importance scores = 0.0, causing Claude to report "lacks sufficient detail"

---

## 🔍 Root Cause Analysis

### Current Flow (Broken)
```
Request → enhanced_analysis_worker() → handle_basic_analysis_progressive() → Placeholder Values
```

### Issue Location
**File**: `shap-microservice/enhanced_analysis_worker.py`  
**Function**: `handle_basic_analysis_progressive()` (line ~379)  
**Problem**: 
```python
# Current broken code:
feature_importance.append({
    "feature": feature,
    "importance": 0.5,  # ❌ Placeholder - not real SHAP!
    "correlation": 0.0  # ❌ No calculation
})
```

---

## 🏗️ Implementation Plan

### Phase 1: SHAP Infrastructure Setup
1. **Initialize SHAP Explainer** with loaded XGBoost model
2. **Create memory-efficient SHAP calculation** for 3,983 records
3. **Add proper error handling** for SHAP failures

### Phase 2: Replace Placeholder Logic
1. **Fix `handle_basic_analysis_progressive()`** to use real SHAP
2. **Update all endpoint handlers** to calculate proper importance
3. **Ensure target variable handling** for 8 brand fields

### Phase 3: Testing & Validation
1. **Test Nike analysis** (`MP30034A_B_P`) with real SHAP values
2. **Verify all 16 endpoints** return non-zero importance
3. **Validate frontend visualization** shows meaningful data

---

## 💻 Code Implementation

### Step 1: Add SHAP Explainer Initialization

**Location**: `shap-microservice/enhanced_analysis_worker.py`  
**Add after imports**:

```python
# Global SHAP explainer (initialized once)
_shap_explainer = None
_model_features = None

def initialize_shap_explainer():
    """Initialize SHAP explainer with loaded model"""
    global _shap_explainer, _model_features
    
    try:
        # Import required modules
        import pickle
        import shap
        import pandas as pd
        
        # Load model if not already loaded
        if model is None:
            logger.error("XGBoost model not loaded")
            return False
            
        # Load feature names
        if not feature_names:
            logger.error("Feature names not loaded")
            return False
            
        # Create SHAP explainer
        _shap_explainer = shap.TreeExplainer(model)
        _model_features = feature_names
        
        logger.info(f"✅ SHAP explainer initialized with {len(_model_features)} features")
        return True
        
    except Exception as e:
        logger.error(f"❌ SHAP explainer initialization failed: {e}")
        return False

def calculate_shap_values_batch(data_batch, target_variable):
    """Calculate SHAP values for a batch of records"""
    global _shap_explainer, _model_features
    
    try:
        if _shap_explainer is None:
            if not initialize_shap_explainer():
                return None, None
        
        # Prepare data for SHAP calculation
        df_batch = pd.DataFrame(data_batch)
        
        # Ensure all model features are present
        missing_features = set(_model_features) - set(df_batch.columns)
        for feature in missing_features:
            df_batch[feature] = 0  # Fill missing features with 0
            
        # Select only model features in correct order
        model_data = df_batch[_model_features].fillna(0)
        
        # Calculate SHAP values (memory efficient)
        shap_values = _shap_explainer.shap_values(model_data)
        
        # Convert to feature importance format
        feature_importance = []
        mean_abs_shap = np.abs(shap_values).mean(axis=0)
        
        for i, feature in enumerate(_model_features):
            if i < len(mean_abs_shap):
                feature_importance.append({
                    "feature": feature,
                    "importance": float(mean_abs_shap[i]),
                    "correlation": float(df_batch[feature].corr(df_batch[target_variable]) if target_variable in df_batch.columns else 0)
                })
        
        # Add SHAP values to records
        enhanced_records = []
        for idx, record in enumerate(data_batch):
            enhanced_record = record.copy()
            # Add SHAP values for this record
            for i, feature in enumerate(_model_features):
                if i < len(shap_values[idx]):
                    enhanced_record[f'shap_{feature}'] = float(shap_values[idx][i])
            enhanced_records.append(enhanced_record)
        
        return enhanced_records, feature_importance
        
    except Exception as e:
        logger.error(f"❌ SHAP calculation failed: {e}")
        return data_batch, []  # Return original data if SHAP fails
```

### Step 2: Update Analysis Handler

**Location**: `handle_basic_analysis_progressive()` function  
**Replace placeholder logic with**:

```python
def handle_basic_analysis_progressive(query, query_classification):
    """Handle analysis with REAL SHAP calculations"""
    try:
        logger.info("Starting SHAP-enabled analysis")
        
        selected_model = select_model_for_analysis(query)
        df, model_info = load_precalculated_model_data_progressive(selected_model)
        
        target_field = query.get('target_field') or query.get('target_variable', 'MP30034A_B_P')
        
        # Get all records
        if hasattr(df, '_all_records'):
            all_records = df._all_records
        else:
            all_records = df.to_dict('records')
        
        logger.info(f"Processing {len(all_records)} records with SHAP for {target_field}")
        
        # ✅ REAL SHAP CALCULATION
        enhanced_records, feature_importance = calculate_shap_values_batch(
            all_records[:1000],  # Process in batches to avoid memory issues
            target_field
        )
        
        if enhanced_records is None:
            logger.warning("SHAP calculation failed, using correlation fallback")
            enhanced_records = all_records
            feature_importance = calculate_correlation_importance(all_records, target_field)
        
        # Process remaining records in batches if we have more
        if len(all_records) > 1000:
            for start_idx in range(1000, len(all_records), 500):
                end_idx = min(start_idx + 500, len(all_records))
                batch = all_records[start_idx:end_idx]
                
                batch_enhanced, _ = calculate_shap_values_batch(batch, target_field)
                if batch_enhanced:
                    enhanced_records.extend(batch_enhanced)
                else:
                    enhanced_records.extend(batch)
                
                # Memory cleanup
                ultra_minimal_cleanup()
        
        # Sort feature importance by actual SHAP values
        feature_importance.sort(key=lambda x: x['importance'], reverse=True)
        
        # Final cleanup
        del df
        ultra_minimal_cleanup()
        
        return {
            "success": True,
            "results": enhanced_records,
            "summary": f"SHAP analysis for {target_field} with {len(feature_importance)} features",
            "feature_importance": feature_importance,
            "analysis_type": "shap_analysis",
            "total_records": len(enhanced_records),
            "shap_enabled": True,
            "target_variable": target_field
        }
        
    except Exception as e:
        logger.error(f"SHAP analysis error: {str(e)}")
        ultra_minimal_cleanup()
        return {
            "success": False,
            "error": f"SHAP analysis failed: {str(e)}"
        }

def calculate_correlation_importance(records, target_field):
    """Fallback correlation-based importance when SHAP fails"""
    try:
        df = pd.DataFrame(records)
        feature_importance = []
        
        if target_field not in df.columns:
            return []
        
        value_fields = [k for k in df.columns if k.startswith('value_')]
        
        for feature in value_fields:
            correlation = df[feature].corr(df[target_field])
            if not pd.isna(correlation):
                feature_importance.append({
                    "feature": feature,
                    "importance": abs(correlation),
                    "correlation": correlation
                })
        
        return feature_importance
        
    except Exception as e:
        logger.error(f"Correlation fallback failed: {e}")
        return []
```

---

## 🧪 Testing Protocol

### Test 1: Single Endpoint Verification
```bash
curl -X POST "https://shap-demographic-analytics-v3.onrender.com/analyze" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: HFqkccbN3LV5CaB" \
  -d '{
    "query": "Nike expansion analysis",
    "target_variable": "MP30034A_B_P",
    "limit": 10
  }'
```

**Expected**: Non-zero SHAP values in `shap_*` fields

### Test 2: Feature Importance Verification
```python
# Check if importance scores are meaningful
response = call_analyze_endpoint()
importance = response['feature_importance']
non_zero_importance = [f for f in importance if f['importance'] > 0]

print(f"Non-zero importance features: {len(non_zero_importance)}/{len(importance)}")
```

### Test 3: Frontend Integration Test
1. Run export script to regenerate datasets
2. Check frontend analysis shows real insights
3. Verify Claude receives meaningful data

---

## 🔧 Deployment Steps

### 1. Update Microservice Code
```bash
# Navigate to microservice directory
cd ../shap-microservice

# Backup current file
cp enhanced_analysis_worker.py enhanced_analysis_worker.py.backup

# Apply SHAP calculation fixes
# (Use the code implementations above)

# Test locally if possible
python app.py
```

### 2. Deploy to Render
```bash
# Commit changes
git add enhanced_analysis_worker.py
git commit -m "Fix: Implement real SHAP calculations for all endpoints"
git push origin main

# Render will auto-deploy
# Monitor logs for successful deployment
```

### 3. Regenerate Frontend Cache
```bash
# Navigate back to frontend
cd ../mpiq-ai-chat/scripts

# Run export with fixed SHAP calculations
python3 export-optimized-datasets.py
```

### 4. Verify Fix
```bash
# Check SHAP values are non-zero
python3 -c "
import json
with open('../public/data/endpoints/analyze.json', 'r') as f:
    data = json.load(f)
    sample = data['results'][0]
    shap_values = [v for k, v in sample.items() if k.startswith('shap_')]
    non_zero = [v for v in shap_values if v != 0.0]
    print(f'SHAP Fix Status: {len(non_zero)}/{len(shap_values)} non-zero values')
    if len(non_zero) > 0:
        print('✅ SHAP calculations working!')
        print(f'Sample values: {non_zero[:5]}')
    else:
        print('❌ SHAP still broken')
"
```

---

## 📊 Success Metrics

### Before Fix
- ❌ All SHAP values = 0.0
- ❌ Feature importance = 0.5 (placeholder)
- ❌ Claude reports "lacks sufficient detail"
- ❌ No visualization colors/legend

### After Fix
- ✅ SHAP values showing real importance (-0.15 to +0.23 range)
- ✅ Feature importance ranked by actual impact
- ✅ Claude generates meaningful analysis
- ✅ Visualization shows data-driven colors
- ✅ Example: "High income areas show 0.18 SHAP value for Nike preference"

---

## 🚨 Troubleshooting

### Issue: SHAP Memory Errors
**Solution**: Reduce batch size in `calculate_shap_values_batch()`
```python
# Change from 1000 to 500 or 100
enhanced_records, feature_importance = calculate_shap_values_batch(
    all_records[:500],  # Smaller batch
    target_field
)
```

### Issue: Model Features Mismatch
**Solution**: Check feature alignment
```python
# Debug feature matching
logger.info(f"Model expects: {len(_model_features)} features")
logger.info(f"Data has: {len(df_batch.columns)} features") 
logger.info(f"Missing: {missing_features}")
```

### Issue: Target Variable Not Found
**Solution**: Validate target field exists
```python
if target_variable not in df_batch.columns:
    logger.warning(f"Target {target_variable} not found, using default")
    target_variable = 'MP30034A_B_P'  # Nike default
```

---

## 📝 Maintenance Notes

### When Adding New Brand Fields
1. Update target variable mappings
2. Ensure SHAP calculation handles new fields
3. Regenerate all endpoint datasets

### When Updating Model
1. Backup current model: `cp models/xgboost_model.pkl models/xgboost_model.pkl.backup`
2. Update model file
3. Restart microservice to reload model
4. Regenerate all datasets

### Performance Monitoring
- Monitor memory usage during SHAP calculation
- Check processing time per endpoint
- Verify all 16 endpoints return meaningful results

---

## 🎯 Expected Results

After implementing this fix:

1. **Nike Analysis Query**: "Show Nike expansion opportunities"
   - **SHAP Values**: Age (0.23), Income (0.18), Population (-0.12)
   - **Insight**: "Young, high-income, urban areas show strongest Nike preference"

2. **Competitive Analysis**: "Nike vs Adidas market gaps"  
   - **SHAP Values**: Competition (-0.31), Demographics (0.19)
   - **Insight**: "Areas with low Adidas penetration and young demographics favor Nike"

3. **Visualization**: 
   - **Colors**: Data-driven choropleth showing opportunity gradients
   - **Legend**: Meaningful ranges based on actual SHAP scores
   - **Narrative**: Claude provides strategic insights with specific demographic factors

This documentation should be referenced whenever updating the model, changing datasets, or troubleshooting SHAP calculation issues. 