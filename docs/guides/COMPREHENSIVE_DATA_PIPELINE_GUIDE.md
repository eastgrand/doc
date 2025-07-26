# Complete Data Pipeline Guide: ArcGIS to SHAP Analysis

This guide covers the entire automated pipeline from extracting data from ArcGIS feature services to having a fully trained SHAP microservice ready for analysis.

## 🎯 **Overview: What This Pipeline Does**

```
ArcGIS Feature Services (Multiple Layers)
    ↓ [extract_arcgis_data.py]
Raw CSV Data (joined by ID field)
    ↓ [update_data_pipeline.py]
Cleaned Data + Trained Model + Precalculated SHAP
    ↓ [Ready for Analysis]
SHAP Microservice (Production Ready)
```

## 🚀 **Quick Start (3 Commands)**

```bash
# 1. Setup and configure data extraction
cd shap-microservice
python setup_arcgis_extraction.py

# 2. Extract and join ArcGIS data
python extract_arcgis_data.py --config config/feature_services.json

# 3. Process data and train model
python update_data_pipeline.py --use-existing
```

That's it! Your SHAP microservice is now ready with your data.

## 📋 **Detailed Step-by-Step Process**

### **Step 1: Configure Data Extraction**

Run the interactive setup to configure your ArcGIS data sources:

```bash
cd shap-microservice
python setup_arcgis_extraction.py
```

**What this does:**
- 🔍 Discovers all available layers in your ArcGIS service
- 📋 Shows you layer names, IDs, and field information
- 🎯 Lets you select which layers to extract
- 🔗 Identifies the ID field for joining (usually 'ID' for zip codes)
- 💾 Creates `config/feature_services.json` configuration file

**Example interaction:**
```
🚀 ArcGIS Data Extraction Setup
==================================================

📍 Enter your ArcGIS service URL: https://your-server.com/arcgis/rest/services/YourService/MapServer

📋 Available layers:
  1. Layer 0: Demographics (Feature Layer)
  2. Layer 1: Economic Indicators (Feature Layer)
  3. Layer 2: Housing Data (Feature Layer)

🎯 Which layers would you like to extract?
Enter layer numbers separated by commas (e.g., 1,2,3) or 'all' for all layers:
Selection: all

🔗 Enter the field to join on [ID]: ID

💾 Enter output CSV file path [data/nesto_merge_0.csv]: 

✅ Configuration saved to config/feature_services.json
```

### **Step 2: Extract and Join Data**

Extract data from all selected layers and join them by the ID field:

```bash
python extract_arcgis_data.py --config config/feature_services.json
```

**What this does:**
- 📥 Extracts all records from each selected ArcGIS layer
- 🔗 Joins all layers by the ID field (zip codes)
- 🧹 Cleans and preprocesses the data
- 💾 Saves the result as `data/nesto_merge_0.csv`

**Example output:**
```
🔄 Extracting data from layer 0...
📊 Layer 0 has 50000 records
✅ Extracted 50000 records from layer 0

🔗 Joining 3 layers by 'ID' field...
✅ Final joined dataset: 50000 records, 127 columns

💾 Saving data to data/nesto_merge_0.csv...
✅ Saved 50000 records with 127 columns to data/nesto_merge_0.csv

🎉 SUCCESS!
📁 Output file: data/nesto_merge_0.csv
📊 Records: 50000
📋 Columns: 127
```

### **Step 3: Process Data and Train Model**

Run the complete data pipeline to prepare everything for SHAP analysis:

```bash
python update_data_pipeline.py --use-existing
```

**What this does:**
- 🧹 **Data Cleaning**: Processes raw data, handles missing values, converts types
- 🎯 **Feature Engineering**: Creates analysis-ready features
- 🤖 **Model Training**: Trains XGBoost model on your data
- ⚡ **SHAP Precalculation**: Pre-computes SHAP values for fast responses
- 📊 **Validation**: Verifies everything works correctly
- 💾 **Version Tracking**: Backs up previous versions

**Example output:**
```
🚀 Starting data pipeline update...
📊 Data cleaning and preprocessing...
✅ Processed 50000 records with 127 features

🤖 Training XGBoost model...
✅ Model trained successfully (accuracy: 0.89)

⚡ Precalculating SHAP values...
✅ SHAP values precalculated for 1000 samples

🎉 Pipeline complete! SHAP microservice ready for analysis.
```

## 🔧 **Configuration Options**

### **Feature Services Configuration** (`config/feature_services.json`)

```json
{
  "base_url": "https://your-server.com/arcgis/rest/services/YourService/MapServer",
  "layers": [
    {
      "id": "0",
      "name": "demographics",
      "description": "Demographic data by zip code"
    },
    {
      "id": "1",
      "name": "economic",
      "description": "Economic indicators by zip code"
    }
  ],
  "id_field": "ID",
  "where_clause": "1=1",
  "output_file": "data/nesto_merge_0.csv",
  "max_records_per_request": 2000
}
```

### **Dataset Configuration** (`config/dataset.yaml`)

```yaml
# This file is automatically updated by the pipeline
dataset:
  name: "Custom ArcGIS Dataset"
  source: "ArcGIS Feature Services"
  created: "2024-01-15T10:30:00Z"
  records: 50000
  features: 127
  target_column: "auto_detected"
  
preprocessing:
  missing_value_strategy: "fill_zeros"
  categorical_encoding: "label_encoding"
  feature_scaling: false
  
model:
  type: "xgboost"
  parameters:
    max_depth: 6
    n_estimators: 100
    learning_rate: 0.1
```

## 🎛️ **Advanced Usage**

### **Manual Configuration**

If you prefer to configure manually instead of using the interactive setup:

```bash
# Create config manually
python extract_arcgis_data.py --create-config

# Edit config/feature_services.json with your settings

# Extract data
python extract_arcgis_data.py --config config/feature_services.json
```

### **Command Line Options**

```bash
# Extract specific layers only
python extract_arcgis_data.py \
  --url "https://your-server.com/arcgis/rest/services/YourService/MapServer" \
  --layers "0,1,2" \
  --id-field "ID" \
  --output "data/my_custom_data.csv"

# Use custom data file for pipeline
python update_data_pipeline.py --data-file "data/my_custom_data.csv"
```

### **Updating Existing Data**

When you have new data and want to update the pipeline:

```bash
# Option 1: Re-extract from ArcGIS (if source data changed)
python extract_arcgis_data.py --config config/feature_services.json
python update_data_pipeline.py --use-existing

# Option 2: Use new CSV file directly
python update_data_pipeline.py --data-file "path/to/new_data.csv"
```

## 🔍 **Data Requirements**

### **ID Field Requirements**
- Must exist in ALL layers you want to join
- Should be unique identifiers (zip codes, FIPS codes, etc.)
- Common names: `ID`, `OBJECTID`, `ZIP`, `ZIPCODE`, `GEOID`, `FIPS`

### **Data Types Supported**
- **Numeric**: Population, income, percentages, counts
- **Categorical**: Status fields, classifications
- **Geographic**: Zip codes, FIPS codes (as ID fields)

### **Automatic Data Cleaning**
The pipeline automatically handles:
- ✅ Missing values (filled with appropriate defaults)
- ✅ Type conversion (string numbers → numeric)
- ✅ Empty columns removal
- ✅ Duplicate records
- ✅ Invalid characters in field names

## 🚨 **Troubleshooting**

### **Common Issues**

**1. "No layers found in service"**
```bash
# Check if URL is correct and accessible
curl "https://your-server.com/arcgis/rest/services/YourService/MapServer?f=json"
```

**2. "ID field not found"**
- Verify the ID field exists in all layers
- Check field name case sensitivity
- Use `--id-field` parameter to specify correct field name

**3. "Failed to extract data"**
- Check network connectivity
- Verify service permissions
- Try reducing `max_records_per_request` in config

**4. "Model training failed"**
- Ensure you have enough numeric features
- Check for data quality issues
- Review the cleaned data in `data/cleaned_data.csv`

### **Validation Commands**

```bash
# Check ArcGIS service accessibility
python -c "import requests; print(requests.get('YOUR_SERVICE_URL?f=json').status_code)"

# Validate extracted data
python -c "import pandas as pd; df=pd.read_csv('data/nesto_merge_0.csv'); print(f'Records: {len(df)}, Columns: {len(df.columns)}')"

# Test SHAP microservice
python -c "import requests; print(requests.get('http://localhost:5000/health').json())"
```

## 📊 **Expected Results**

After running the complete pipeline, you should have:

### **Files Created**
- `data/nesto_merge_0.csv` - Raw joined data from ArcGIS
- `data/cleaned_data.csv` - Processed data ready for ML
- `models/xgboost_model.pkl` - Trained XGBoost model
- `models/feature_names.txt` - List of features used in model
- `precalculated/shap_values.pkl.gz` - Pre-computed SHAP values
- `versions/` - Backup versions of data and models

### **SHAP Microservice Ready**
Your SHAP microservice will be able to:
- ✅ Analyze any zip code in your dataset
- ✅ Provide SHAP explanations for predictions
- ✅ Handle queries about your specific data fields
- ✅ Generate insights based on your actual data patterns

### **Integration with Frontend**
The Project Configuration Manager will automatically:
- ✅ Generate proper field mappings for your data
- ✅ Create layer configurations matching your ArcGIS structure
- ✅ Update all dependent files across both projects
- ✅ Ensure frontend queries work with your SHAP microservice

## 🎉 **Success Indicators**

You'll know everything worked when:

1. **Data extraction shows**: "SUCCESS! Records: XXXXX, Columns: XXX"
2. **Pipeline shows**: "Pipeline complete! SHAP microservice ready"
3. **Health check passes**: `curl http://localhost:5000/health` returns 200
4. **Analysis works**: SHAP explanations are generated for your data

## 🔄 **Regular Updates**

To keep your data current:

```bash
# Weekly/monthly data refresh
cd shap-microservice
python extract_arcgis_data.py --config config/feature_services.json
python update_data_pipeline.py --use-existing

# The system automatically handles version tracking and rollback
```

This pipeline transforms your ArcGIS feature services into a production-ready SHAP analysis system with zero manual data processing required! 