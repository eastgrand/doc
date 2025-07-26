# Microservice Export Script Guide

**Date**: January 2025  
**Script**: `scripts/export-microservice-dataset.py`  
**Purpose**: Export complete cached dataset from ML microservice

## 🎯 Overview

This script solves the **missing cached dataset problem** by calling the ML microservice for all FSA regions and aggregating the results into a single cached dataset file that the frontend can use.

---

## 🚀 Quick Start

### **Prerequisites**
1. **ML microservice running** (local or remote)
2. **Python 3.9+** with required dependencies
3. **API key** (if microservice requires authentication)

### **Installation**
```bash
# Install dependencies
cd scripts
pip install -r requirements.txt
```

### **Environment Variables**
```bash
# Required: Microservice URL
export MICROSERVICE_URL="http://localhost:5000"

# Optional: API key (if microservice requires authentication)
export API_KEY="your_secret_api_key"
```

### **Run Export**
```bash
# From project root
python scripts/export-microservice-dataset.py
```

---

## 📊 What the Script Does

### **1. Connection Test**
- Tests microservice connectivity
- Validates API key (if provided)
- Ensures `/ping` endpoint responds

### **2. Data Export**
For each FSA region (100 sample regions), calls microservice with:
- **Nike analysis**: "Show Nike purchase patterns in {fsa_id}"
- **Adidas analysis**: "Show Adidas purchase patterns in {fsa_id}"
- **Correlation analysis**: "Show correlation between income and athletic shoe purchases in {fsa_id}"
- **Ranking analysis**: "Show top athletic shoe brands in {fsa_id}"
- **Demographic analysis**: "Show demographic patterns for athletic purchases in {fsa_id}"
- **Multivariate analysis**: "Compare Nike, Adidas, and Puma purchases in {fsa_id}"

### **3. Data Aggregation**
Combines all responses for each FSA region into a single record with:
- **Brand purchase data**: `nike_purchases`, `adidas_purchases`, etc.
- **SHAP values**: `shap_nike`, `shap_adidas`, `shap_income`, etc.
- **Demographics**: `median_income`, `avg_age`, `population_density`
- **Analysis metrics**: `thematic_value`, `percentile_rank`, `confidence_score`

### **4. File Output**
Creates two files:
- **`public/data/microservice-export.json`** - Main cached dataset
- **`public/data/microservice-export-metadata.json`** - Export statistics and metadata

---

## 📋 Output Format

### **Main Dataset Structure**
```json
{
  "metadata": {
    "export_date": "2025-01-15T10:30:00Z",
    "version": "1.0",
    "total_records": 100,
    "microservice_url": "http://localhost:5000",
    "fields": ["FSA_ID", "nike_purchases", "adidas_purchases", "..."],
    "brand_mappings": { "nike": "MP30034A_B", "adidas": "MP30029A_B" },
    "query_templates": { "nike_analysis": "Show Nike purchase patterns in {fsa_id}" }
  },
  "data": [
    {
      "FSA_ID": "M5V",
      "export_timestamp": "2025-01-15T10:30:15Z",
      "nike_purchases": 150,
      "adidas_purchases": 120,
      "puma_purchases": 90,
      "jordan_purchases": 75,
      "newbalance_purchases": 60,
      "converse_purchases": 45,
      "skechers_purchases": 30,
      "shap_nike": 0.23,
      "shap_adidas": -0.15,
      "shap_income": 0.08,
      "shap_age": -0.02,
      "median_income": 65000,
      "avg_age": 35,
      "population_density": 1200,
      "thematic_value": 150,
      "percentile_rank": 75,
      "confidence_score": 0.85
    }
    // ... 99 more FSA records
  ]
}
```

### **Export Metadata**
```json
{
  "start_time": "2025-01-15T10:30:00Z",
  "end_time": "2025-01-15T10:45:00Z",
  "duration_seconds": 900,
  "total_regions": 100,
  "successful_exports": 98,
  "failed_exports": 2,
  "total_requests": 600,
  "success_rate": 98.0,
  "output_file": "/path/to/public/data/microservice-export.json",
  "file_size_mb": 2.5,
  "errors": [
    {
      "fsa_id": "M1X",
      "analysis_type": "correlation_analysis", 
      "status_code": 500,
      "error": "Internal server error"
    }
  ]
}
```

---

## 🔧 Configuration Options

### **FSA Regions**
The script includes 100 sample FSA regions. To customize:

```python
# Edit SAMPLE_FSA_REGIONS in the script
SAMPLE_FSA_REGIONS = [
    'M5V', 'M5S', 'M5T',  # Toronto downtown
    'V6B', 'V6C', 'V6E',  # Vancouver downtown  
    'H3A', 'H3B', 'H3C',  # Montreal downtown
    # Add your specific regions
]
```

### **Query Templates**
Customize the analysis types by editing:

```python
QUERY_TEMPLATES = {
    'nike_analysis': 'Show Nike purchase patterns in {fsa_id}',
    'custom_analysis': 'Your custom query template for {fsa_id}',
    # Add more analysis types
}
```

### **Brand Mappings**
Update brand field codes if needed:

```python
BRAND_MAPPINGS = {
    'nike': 'MP30034A_B',
    'adidas': 'MP30029A_B',
    'new_brand': 'MP30099A_B',  # Add new brands
}
```

---

## 🚨 Error Handling

### **Common Issues**

1. **Microservice Connection Failed**
   ```bash
   ❌ Cannot connect to microservice: Connection refused
   ```
   **Solution**: Ensure microservice is running and URL is correct

2. **Authentication Failed**
   ```bash
   ❌ Microservice returned status 401
   ```
   **Solution**: Set correct API_KEY environment variable

3. **Partial Export**
   ```bash
   ✅ Exported 85/100 regions successfully (85.0%)
   ```
   **Solution**: Check metadata file for specific errors, retry failed regions

### **Recovery Options**
- Script automatically retries failed requests
- Partial exports are saved (don't lose successful data)
- Error details logged in metadata file
- Can resume from failed regions by editing FSA_REGIONS list

---

## 📈 Performance

### **Expected Timing**
- **100 regions × 6 queries = 600 requests**
- **~1 second per request = ~10 minutes total**
- **File size: ~2-5 MB** (depending on SHAP complexity)

### **Optimization Tips**
1. **Enable Redis caching** on microservice for faster responses
2. **Run during off-peak hours** to avoid server overload
3. **Adjust sleep delays** between requests if needed
4. **Use smaller FSA region sets** for testing

---

## 🔄 Integration with Frontend

### **After Export Completes**
1. **Cached dataset available** at `public/data/microservice-export.json`
2. **Frontend will automatically use** this file (when cache loader is implemented)
3. **No more empty visualizations** - all queries will have real data
4. **System works offline** - no microservice calls needed

### **Cache Validation**
The frontend cache system will:
- Check file existence and age
- Validate record count and data integrity  
- Fall back gracefully if cache is invalid
- Provide meaningful error messages

---

## 📋 Usage Checklist

### **Before Running**
- [ ] ML microservice is running and accessible
- [ ] Environment variables set (MICROSERVICE_URL, API_KEY)
- [ ] Python dependencies installed
- [ ] Sufficient disk space (~10MB)

### **During Export**
- [ ] Monitor progress logs
- [ ] Check for error messages
- [ ] Verify success rate is acceptable (>90%)

### **After Export**
- [ ] Verify output files exist
- [ ] Check file sizes are reasonable
- [ ] Review metadata for errors
- [ ] Test frontend with new cached data

---

## 🔮 Future Enhancements

### **Planned Improvements**
1. **Incremental updates** - Only export changed FSA regions
2. **Parallel processing** - Multiple concurrent requests
3. **Data validation** - Schema validation and integrity checks
4. **Automated scheduling** - Regular cache updates
5. **Compression** - Reduce file sizes for large datasets

### **Integration Options**
1. **CI/CD pipeline** - Automated exports on microservice updates
2. **Admin interface** - Trigger exports from web UI
3. **Monitoring** - Track export success rates and performance
4. **Backup/versioning** - Keep historical cached datasets

---

This script is the **missing piece** that will make the frontend visualizations work with real data instead of empty results! 