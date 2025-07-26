# SHAP Microservice Data Update Guide

This guide explains how to update the data in the SHAP microservice when you have new data. The system is designed to handle complete data pipeline updates with automatic backup and version tracking.

## 🏗️ **Data Pipeline Architecture**

### Current Data Flow
```
New Raw Data (CSV)
    ↓
nesto_merge_0.csv (Raw data with descriptive field names)
    ↓ [map_nesto_data.py]
cleaned_data.csv (Processed data with canonical field names)
    ↓ [train_model.py]
xgboost_model.pkl + feature_names.txt (Trained model)
    ↓ [precalculate_shap.py]
precalculated/*.pkl (Pre-computed SHAP values for fast responses)
```

### Key Components
1. **Raw Data**: `data/nesto_merge_0.csv` - Your source data with descriptive field names
2. **Cleaned Data**: `data/cleaned_data.csv` - Processed data ready for ML
3. **Field Mappings**: `map_nesto_data.py` - Maps raw field names to canonical names
4. **Model Files**: `models/xgboost_model.pkl` + `models/feature_names.txt`
5. **SHAP Cache**: `precalculated/` - Pre-computed SHAP values for performance

## 🚀 **Quick Start: Update Data Pipeline**

### Option 1: Automated Full Pipeline Update (Recommended)
```bash
cd shap-microservice

# With new data file
python update_data_pipeline.py --data-file /path/to/your/new_data.csv

# Using existing nesto_merge_0.csv
python update_data_pipeline.py --use-existing

# Create backup only (no updates)
python update_data_pipeline.py --backup-only
```

### Option 2: Manual Step-by-Step Process
```bash
cd shap-microservice

# 1. Backup existing data (optional but recommended)
python update_data_pipeline.py --backup-only

# 2. Install new data
cp /path/to/your/new_data.csv data/nesto_merge_0.csv

# 3. Clean and preprocess data
python map_nesto_data.py

# 4. Train new model
python train_model.py

# 5. Precalculate SHAP values
python precalculate_shap.py

# 6. Restart the microservice
# (Render will auto-restart, or restart your local instance)
```

## 📊 **Data Requirements**

### Required Fields
Your data must contain these core fields (exact names matter):
- `CONVERSION_RATE` - Target variable for the model
- `FREQUENCY` - Total number of applications
- `SUM_FUNDED` - Total funded applications
- Geographic identifier (FSA/postal code)

### Recommended Fields
The system works best with demographic and economic data:
- Population demographics (age groups, gender, ethnicity)
- Income and economic indicators
- Housing characteristics (type, tenure, age)
- Geographic and area measurements

### Data Format
- **Format**: CSV file
- **Encoding**: UTF-8
- **Size**: The system handles large datasets (1M+ rows)
- **Missing Values**: Automatically filled with column medians
- **Field Names**: Descriptive names are preferred (they get mapped to canonical names)

## 🔧 **Field Mapping System**

### Core Field Mappings
The system maps descriptive field names to canonical names used by the model:

```python
CORE_FIELD_MAPPINGS = {
    'FREQUENCY': 'FREQUENCY',
    'SUM_FUNDED': 'mortgage_approvals', 
    'CONVERSION_RATE': 'conversion_rate',
    '2024 Household Average Income (Current Year $)': 'median_income',
    '2024 Household Discretionary Aggregate Income': 'disposable_income',
    '2024 Condominium Status - In Condo (%)': 'condo_ownership_pct',
    '2024 Visible Minority Total Population (%)': 'visible_minority_population_pct'
}
```

### Adding New Field Mappings
If your data has different field names, update `map_nesto_data.py`:

1. **Edit Core Mappings**:
```python
CORE_FIELD_MAPPINGS = {
    'Your_Field_Name': 'canonical_name',
    # ... existing mappings
}
```

2. **Update Documentation**:
Edit `data/NESTO_FIELD_MAPPING.md` to document the new mappings.

## 🎯 **Model Training Details**

### Training Process
The `train_model.py` script:
1. Loads cleaned data from `data/cleaned_data.csv`
2. Performs feature selection and engineering
3. Trains an XGBoost model with hyperparameter optimization
4. Saves model to `models/xgboost_model.pkl`
5. Saves feature names to `models/feature_names.txt`
6. Tracks model version in `versions/model_versions.json`

### Model Configuration
Key training parameters (in `train_model.py`):
- **Target Variable**: `conversion_rate` (or from `TARGET_VARIABLE`)
- **Model Type**: XGBoost Regressor
- **Memory Optimization**: Enabled for Render deployment
- **Feature Selection**: Automatic based on importance
- **Validation**: Train/test split with performance metrics

### Memory Optimization
The system includes memory optimization for cloud deployment:
- Data sampling for large datasets
- Efficient data types (float32 vs float64)
- Garbage collection during training
- Progressive model complexity reduction if needed

## ⚡ **SHAP Precalculation**

### Why Precalculate?
SHAP analysis is computationally expensive. The system precalculates SHAP values for common scenarios to achieve sub-second response times.

### Precalculation Process
```bash
python precalculate_shap.py
```

This creates:
- `precalculated/shap_values.pkl.gz` - Compressed SHAP values
- `precalculated/metadata.pkl` - Analysis metadata
- `precalculated/models/metadata.json` - Model metadata

### SHAP Configuration
The precalculation handles:
- Multiple model versions
- Different analysis types (ranking, correlation, heatmap)
- Query-aware feature selection
- Memory-efficient storage (gzip compression)

## 🔄 **Version Tracking**

### Automatic Version Tracking
The system automatically tracks:
- **Dataset Versions**: `versions/dataset_versions.json`
- **Model Versions**: `versions/model_versions.json`

### Version Information
Each version includes:
- Timestamp
- File paths and sizes
- Training metrics
- Status information

### Rollback Capability
The automated pipeline creates backups in `backups/backup_YYYYMMDD_HHMMSS/` with:
- Previous data files
- Previous model files
- Previous SHAP calculations

## 🚨 **Troubleshooting**

### Common Issues

#### 1. Memory Errors During Training
```bash
# Enable memory optimization
export MEMORY_OPTIMIZATION=true
python train_model.py
```

#### 2. Field Mapping Errors
Check that your data contains the required core fields:
```python
python -c "
import pandas as pd
df = pd.read_csv('data/nesto_merge_0.csv')
print('Available columns:', df.columns.tolist())
print('Required fields present:', 'CONVERSION_RATE' in df.columns)
"
```

#### 3. Model Training Fails
Check data quality:
```python
python -c "
import pandas as pd
df = pd.read_csv('data/cleaned_data.csv')
print('Data shape:', df.shape)
print('Missing values:', df.isnull().sum().sum())
print('Target variable stats:', df['conversion_rate'].describe())
"
```

#### 4. SHAP Precalculation Fails
This is non-critical - the system will calculate SHAP on-demand:
```bash
# Check if model and data are available
ls -la models/xgboost_model.pkl
ls -la data/cleaned_data.csv
```

### Recovery Procedures

#### Restore from Backup
```bash
# List available backups
ls -la backups/

# Restore from specific backup
cp backups/backup_YYYYMMDD_HHMMSS/* ./
```

#### Reset to Clean State
```bash
# Remove all generated files
rm -rf data/cleaned_data.csv models/ precalculated/

# Restart pipeline
python update_data_pipeline.py --use-existing
```

## 🔗 **Integration with Frontend**

### Project Configuration Manager
When you update the microservice data, you may also need to update the frontend configuration:

1. **Field Mappings**: Update `utils/field-aliases.ts` in the main project
2. **Layer Configuration**: Update `config/layers.ts` if new geographic data
3. **Concept Mappings**: Update `config/concept-map.json` for AI features

### Deployment Synchronization
Use the Project Configuration Manager's deployment system to ensure both frontend and microservice are synchronized:

```typescript
// In the frontend Project Configuration Manager
await deployConfiguration(config, { 
  updateMicroservice: true,
  simulationMode: false 
});
```

## 📋 **Checklist for Data Updates**

### Before Update
- [ ] Backup existing data and models
- [ ] Verify new data format and required fields
- [ ] Check available memory/storage space
- [ ] Note current model performance metrics

### During Update
- [ ] Run automated pipeline or manual steps
- [ ] Monitor logs for errors or warnings
- [ ] Verify each step completes successfully
- [ ] Check generated file sizes and formats

### After Update
- [ ] Verify model training metrics
- [ ] Test SHAP analysis endpoints
- [ ] Update frontend configuration if needed
- [ ] Monitor system performance
- [ ] Document any field mapping changes

### Production Deployment
- [ ] Test in development environment first
- [ ] Schedule maintenance window if needed
- [ ] Deploy to production (Render auto-deploys)
- [ ] Verify production endpoints
- [ ] Monitor error rates and response times

## 🎯 **Best Practices**

1. **Always Backup**: Use `--backup-only` before major updates
2. **Test Locally**: Run the full pipeline locally before production
3. **Monitor Memory**: Use memory optimization for large datasets
4. **Document Changes**: Update field mappings documentation
5. **Version Control**: Commit configuration changes to git
6. **Gradual Rollout**: Test with small data samples first
7. **Performance Monitoring**: Check response times after updates

## 📞 **Support**

If you encounter issues:
1. Check the logs for specific error messages
2. Verify data format and required fields
3. Try the manual step-by-step process
4. Use backup restoration if needed
5. Check system resources (memory, disk space)

The automated pipeline includes detailed logging and error handling to help diagnose issues quickly. 