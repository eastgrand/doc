# Microservice Data Preparation and Model Training Guide

This guide provides comprehensive instructions for preparing training data and training machine learning models for the SHAP microservice that powers MPIQ AI Chat analytics.

## Table of Contents

1. [Data Format Requirements](#data-format-requirements)
2. [Field Mapping and Standardization](#field-mapping-and-standardization)
3. [Data Validation and Quality Checks](#data-validation-and-quality-checks)
4. [Model Training Process](#model-training-process)
5. [SHAP Integration](#shap-integration)
6. [Performance Optimization](#performance-optimization)
7. [Local Testing](#local-testing)

## Data Format Requirements

### 1. CSV Data Structure

Your training data must be in CSV format with the following requirements:

```csv
ID,GEOID,Forward Sortation Area,Total Population,Median Income,Nike_Sales_Pct,...
M3H,M3H,M3H,12534,75000,15.2,...
M4A,M4A,M4A,8967,82000,18.7,...
```

**Required Fields:**
- **Geographic Identifier**: One of `ID`, `GEOID`, `Forward Sortation Area`, `zip_code`
- **Target Variables**: Numeric fields for analysis (brand sales, demographic metrics, etc.)
- **Feature Fields**: Demographic, economic, and behavioral data for predictions

**Supported Geographic Identifiers:**
- **Canadian FSA**: Forward Sortation Area (e.g., "M3H", "K1A")
- **US ZIP Codes**: 5-digit ZIP codes (e.g., "90210", "10001")
- **Generic Area IDs**: Custom geographic identifiers

### 2. Field Naming Conventions

Use consistent naming patterns for better processing:

```
Brand Sales: [Brand]_Sales_Pct (e.g., Nike_Sales_Pct, Adidas_Sales_Pct)
Demographics: Total_Population, Median_Income, Age_25_34_Pct
Economics: Household_Income_100K_Plus_Pct, Disposable_Income_Median
Geography: Forward_Sortation_Area, Province, City
```

**Percentage Fields:**
- Must end with `_Pct` or `(%)` in the header
- Values should be 0-100 range, not 0-1 decimals
- Example: `Nike_Sales_Pct: 15.2` (not `Nike_Sales: 0.152`)

## Field Mapping and Standardization

### 1. Update Field Mappings

Edit the `map_nesto_data.py` script in your microservice directory:

```python
# File: shap-microservice/map_nesto_data.py

FIELD_MAPPINGS = {
    # Geographic identifiers
    'Forward Sortation Area': 'FSA_ID',
    'zip_code': 'ZIP_CODE',
    'postal_code': 'ZIP_CODE',
    
    # Brand sales (your specific brands)
    'Nike Market Share (%)': 'Nike_Sales_Pct',
    'Adidas Market Share (%)': 'Adidas_Sales_Pct',
    'Jordan Brand Sales': 'Jordan_Sales_Pct',
    
    # Demographics
    'Total Population': 'Total_Population',
    'Median Household Income': 'Median_Income',
    'Age 25-34 (%)': 'Age_25_34_Pct',
    'Age 35-44 (%)': 'Age_35_44_Pct',
    
    # Economics
    'Household Income $100K+ (%)': 'Income_100K_Plus_Pct',
    'University Education (%)': 'University_Educated_Pct',
    
    # Add your custom fields here
    'Your_Custom_Field': 'Standardized_Name'
}

# Set your primary target variable for analysis
TARGET_VARIABLE = 'Nike_Sales_Pct'  # Change to your main target
```

### 2. Geographic Mapping

Update geographic handling for your region:

```python
# Geographic standardization
GEOGRAPHIC_MAPPINGS = {
    # Canadian FSA to standardized format
    'M3H': 'M3H',  # Toronto area
    'K1A': 'K1A',  # Ottawa area
    
    # US ZIP codes
    '90210': '90210',  # Beverly Hills
    '10001': '10001',  # New York
    
    # Your custom geographic codes
    'CUSTOM_001': 'STD_AREA_001'
}
```

### 3. Data Type Validation

Ensure proper data types for model training:

```python
# Data type specifications
FIELD_TYPES = {
    'FSA_ID': str,
    'Total_Population': int,
    'Median_Income': float,
    'Nike_Sales_Pct': float,
    'Age_25_34_Pct': float,
    # Add specifications for all your fields
}

# Percentage fields (will be validated to be 0-100 range)
PERCENTAGE_FIELDS = [
    'Nike_Sales_Pct',
    'Adidas_Sales_Pct',
    'Age_25_34_Pct',
    'Income_100K_Plus_Pct'
]
```

## Data Validation and Quality Checks

### 1. Run Data Validation

Use the provided validation script:

```bash
cd shap-microservice
python validate_data.py
```

This script checks:
- **Missing Values**: Identifies fields with high missing data percentages
- **Data Types**: Verifies numeric fields are properly formatted
- **Range Validation**: Ensures percentage fields are 0-100
- **Geographic Coverage**: Validates geographic identifiers
- **Outlier Detection**: Identifies unusual values that might indicate data quality issues

### 2. Data Quality Report

The validation generates a report:

```
Data Validation Report
======================
Dataset: cleaned_data.csv
Records: 1,247
Fields: 156

Geographic Coverage:
✅ Geographic ID field: FSA_ID
✅ Unique areas: 1,247
✅ Coverage: Complete

Missing Data Analysis:
✅ Nike_Sales_Pct: 0.2% missing (3 records)
⚠️  Median_Income: 5.1% missing (64 records)
❌ Custom_Field: 25.3% missing (316 records)

Range Validation:
✅ Nike_Sales_Pct: 0.1% - 45.2% (valid range)
✅ Age_25_34_Pct: 8.3% - 32.1% (valid range)
❌ Invalid_Field: -12.3% - 120.4% (invalid percentage)

Recommendations:
- Fix Invalid_Field percentage values
- Consider imputation for Median_Income
- Review Custom_Field data collection
```

### 3. Data Cleaning

Apply automatic cleaning:

```bash
# Run data cleaning script
python clean_data.py

# This will:
# - Fix percentage value ranges
# - Handle missing values with appropriate imputation
# - Standardize field names
# - Remove outliers beyond reasonable thresholds
```

## Model Training Process

### 1. Prepare Training Environment

Set up your training environment:

```bash
# Navigate to microservice directory
cd shap-microservice

# Install dependencies
pip install -r requirements.txt

# Apply SHAP compatibility patches
python patch_shap.py
```

### 2. Run Model Training

Execute the model training script:

```bash
# Full model training with cross-validation
python train_model.py

# Or with specific parameters
python train_model.py --target Nike_Sales_Pct --cv-folds 5 --test-size 0.2
```

**Training Process:**
1. **Data Loading**: Loads `cleaned_data.csv` and applies field mappings
2. **Feature Engineering**: Creates derived features and handles categorical variables
3. **Train/Test Split**: Splits data for validation (default: 80/20)
4. **Hyperparameter Tuning**: Uses cross-validation to optimize model parameters
5. **Model Training**: Trains XGBoost model with optimal parameters
6. **SHAP Integration**: Calculates SHAP values for feature importance
7. **Model Validation**: Tests performance on holdout data
8. **Model Saving**: Saves trained model and artifacts

### 3. Training Output

Training produces several files:

```
models/
├── xgboost_model.pkl       # Trained XGBoost model
├── feature_names.txt       # List of features used
├── model_metrics.json      # Performance metrics
├── shap_explainer.pkl      # SHAP explainer object
└── training_log.txt        # Detailed training log
```

**Performance Metrics Example:**
```json
{
  "r2_score": 0.847,
  "rmse": 3.21,
  "mae": 2.18,
  "cross_val_score": 0.823,
  "feature_count": 142,
  "training_samples": 997,
  "test_samples": 250
}
```

## SHAP Integration

### 1. SHAP Explainer Setup

The model automatically integrates SHAP for explainable AI:

```python
# SHAP explainer configuration
import shap
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# Save for use in microservice
with open('models/shap_explainer.pkl', 'wb') as f:
    pickle.dump(explainer, f)
```

### 2. Feature Importance Calculation

SHAP provides multiple importance metrics:

```python
# Global feature importance
feature_importance = np.abs(shap_values).mean(0)

# Local explanations for individual predictions
local_explanation = explainer.shap_values(single_sample)

# Feature interactions
shap_interaction_values = explainer.shap_interaction_values(X_sample)
```

### 3. SHAP Optimization

For production deployment, optimize SHAP calculations:

```python
# Memory-optimized SHAP settings
SHAP_CONFIG = {
    'max_evals': 1000,        # Reduce for memory constraints
    'batch_size': 100,        # Process in batches
    'approximate': True,      # Use approximation for speed
    'tree_limit': 100         # Limit tree traversal depth
}
```

## Performance Optimization

### 1. Memory Management

Configure memory usage for production:

```python
# Memory optimization settings
MEMORY_CONFIG = {
    'max_memory_mb': 450,           # Leave headroom for 512MB limit
    'aggressive_cleanup': True,     # Force garbage collection
    'batch_processing': True,       # Process data in batches
    'model_compression': True       # Compress model features
}
```

### 2. Feature Selection

Reduce model complexity:

```bash
# Train model with feature selection
python train_model.py --feature-selection --max-features 50

# Or use correlation-based selection
python train_model.py --correlation-threshold 0.1
```

### 3. Model Compression

Create lightweight models for deployment:

```bash
# Create compressed model
python create_minimal_model.py

# This creates:
# - Reduced feature set (top 20 most important)
# - Simplified tree structure
# - Optimized for memory usage
```

## Local Testing

### 1. Test Model Performance

Validate your trained model:

```bash
# Test model accuracy
python test_model_accuracy.py

# Test SHAP calculations
python test_shap_values.py

# Test memory usage
python test_memory_usage.py
```

### 2. API Testing

Test the microservice locally:

```bash
# Start the microservice
python app.py

# In another terminal, test API endpoints
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: test-key" \
  -d '{
    "analysis_type": "correlation",
    "target_variable": "Nike_Sales_Pct",
    "limit": 10
  }'
```

### 3. Integration Testing

Test with client application:

```bash
# Test data export
python ../scripts/export-microservice-dataset.py

# Test endpoint generation
python ../scripts/export-complete-dataset.py

# Validate data quality
python ../scripts/test-all-endpoints-comprehensive.py
```

## Data Preparation Checklist

### Pre-Training Validation
- [ ] CSV data is properly formatted with headers
- [ ] Geographic identifiers are present and valid
- [ ] Target variables are numeric and in correct ranges
- [ ] Percentage fields use 0-100 scale, not 0-1 decimals
- [ ] Missing values are below 20% for critical fields
- [ ] Data types are correctly specified

### Field Mapping Configuration
- [ ] Updated `FIELD_MAPPINGS` in `map_nesto_data.py`
- [ ] Set correct `TARGET_VARIABLE` for your use case
- [ ] Configured geographic mappings if needed
- [ ] Specified proper data types for all fields
- [ ] Listed all percentage fields for validation

### Training Environment
- [ ] Installed all dependencies from `requirements.txt`
- [ ] Applied SHAP compatibility patches
- [ ] Data validation script runs without errors
- [ ] Model training completes successfully
- [ ] SHAP explainer is created and saved
- [ ] Performance metrics meet quality thresholds

### Testing and Validation
- [ ] Local API testing passes all endpoints
- [ ] Model accuracy meets business requirements
- [ ] Memory usage stays within deployment limits
- [ ] SHAP calculations complete without errors
- [ ] Integration with client application works

## Troubleshooting

### Common Data Issues

**1. Geographic Identifier Problems**
```
Error: No valid geographic identifiers found
Solution: Check field names match FIELD_MAPPINGS
```

**2. Percentage Field Issues**
```
Error: Percentage values outside 0-100 range
Solution: Convert decimal values to percentages (multiply by 100)
```

**3. Missing Target Variable**
```
Error: Target variable not found in dataset
Solution: Update TARGET_VARIABLE in map_nesto_data.py
```

### Training Issues

**1. Memory Errors During Training**
```
Solution: Reduce dataset size or feature count
python train_model.py --max-features 50 --sample-size 1000
```

**2. SHAP Calculation Failures**
```
Solution: Enable SHAP approximation
python train_model.py --shap-approximate
```

**3. Poor Model Performance**
```
Solution: Check data quality and feature engineering
- Verify target variable distributions
- Check for outliers and missing values
- Consider feature scaling or transformation
```

---

**Next Steps**: Once data preparation is complete, proceed to [MICROSERVICE_02_DEPLOYMENT.md](./MICROSERVICE_02_DEPLOYMENT.md) for deployment instructions.

**Last Updated**: January 2025  
**Compatibility**: Python 3.11+, XGBoost 2.0+, SHAP 0.45+