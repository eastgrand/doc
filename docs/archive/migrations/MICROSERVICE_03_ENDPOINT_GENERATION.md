# Microservice Endpoint Dataset Generation Guide

This guide covers the process of generating analysis endpoint datasets from your deployed microservice, including data export, SHAP integration, and quality validation.

## Table of Contents

1. [Overview of Endpoint Generation](#overview-of-endpoint-generation)
2. [Data Export Process](#data-export-process)
3. [SHAP Value Integration](#shap-value-integration)
4. [Dataset Transformation](#dataset-transformation)
5. [Quality Validation](#quality-validation)
6. [Blob Storage Upload](#blob-storage-upload)
7. [Local Fallback Setup](#local-fallback-setup)

## Overview of Endpoint Generation

### 1. Purpose and Workflow

The endpoint generation process creates **26 comprehensive analysis datasets** from your microservice with 17-model architecture:

```
17-Model Microservice → Export Scripts → Raw Analysis Data → Transformation → 26 Endpoint Files  
        ↓                    ↓               ↓               ↓              ↓
   Comprehensive ML     API Calls to       SHAP Values +   Format for UI   Client Integration
   (8 Supervised +      16 Endpoints       Ensemble +      with Algorithm   with Enhanced
   3 Unsupervised +                       Clustering      Diversity        Analytics
   6 Specialized)
```

**19 Standard Endpoints:**
1. `strategic-analysis.json` - Strategic market opportunities
2. `competitive-analysis.json` - Brand competition analysis  
3. `comparative-analysis.json` - Geographic comparisons
4. `demographic-insights.json` - Population demographics
5. `correlation-analysis.json` - Statistical correlations
6. `trend-analysis.json` - Temporal patterns
7. `spatial-clusters.json` - Geographic clustering
8. `anomaly-detection.json` - Statistical outliers
9. `predictive-modeling.json` - Forecasting models
10. `scenario-analysis.json` - What-if scenarios
11. `segment-profiling.json` - Market segmentation
12. `sensitivity-analysis.json` - Parameter sensitivity
13. `feature-interactions.json` - Variable interactions
14. `feature-importance-ranking.json` - Feature rankings
15. `model-performance.json` - ML model metrics
16. `outlier-detection.json` - Data outliers
17. `analyze.json` - General analysis
18. `brand-difference.json` - Brand differential analysis
19. `customer-profile.json` - Customer profiling (optional)

**🆕 7 New Endpoints (Comprehensive Model Architecture):**
20. `algorithm-comparison.json` - Performance across 8 supervised algorithms
21. `ensemble-analysis.json` - Deep analysis with outstanding ensemble model (R² = 0.879)
22. `model-selection.json` - Dynamic algorithm recommendations per area
23. `cluster-analysis.json` - Advanced market segmentation (8 clusters)
24. `anomaly-insights.json` - Enhanced outlier detection (99 anomalies identified)
25. `dimensionality-insights.json` - Feature space analysis (91.7% variance explained)
26. `consensus-analysis.json` - Multi-model consensus predictions with uncertainty

### 2. Comprehensive Architecture Overview

```
┌─────────────────────┐    ┌─────────────────┐    ┌─────────────────────┐
│  17-Model Service   │───▶│  Export Scripts │───▶│  26 Endpoint Files  │
│  (Comprehensive)    │    │  (Enhanced)     │    │  (JSON Format)      │
└─────────────────────┘    └─────────────────┘    └─────────────────────┘
        │                           │                       │
        ├─ /analyze (legacy)        ├─ export-complete-     ├─ 19 Standard Files
        ├─ /ensemble-analysis ★     │   dataset.py          ├─ + 7 New Files:
        ├─ /algorithm-comparison    ├─ export-comprehensive-├─ algorithm-comparison.json
        ├─ /cluster-analysis        │   endpoints.py        ├─ ensemble-analysis.json ★
        ├─ /anomaly-insights        └─ enhanced scoring     ├─ cluster-analysis.json
        ├─ /consensus-analysis                              ├─ anomaly-insights.json
        └─ + 10 more endpoints                              └─ consensus-analysis.json

★ Outstanding Performance: R² = 0.879 (87.9% accuracy)
```

## Data Export Process

### 1. Primary Export Script

The main export script generates comprehensive datasets:

```bash
cd scripts

# Run comprehensive export (generates all 26 endpoints)
python export-comprehensive-endpoints.py

# Legacy: Export original 19 endpoints  
python export-complete-dataset.py

# Alternative: Export from microservice API directly
python export-microservice-dataset.py
```

### 2. Export Configuration

Configure the export in `export-complete-dataset.py`:

```python
# Microservice configuration
MICROSERVICE_URL = "https://your-project-shap.onrender.com"
API_KEY = "your-secure-api-key"

# Target variables for different analyses
ANALYSIS_TARGETS = {
    'strategic': 'Nike_Sales_Pct',        # Primary strategic target
    'competitive': 'Nike_Sales_Pct',      # Competition analysis
    'demographic': 'Total_Population',    # Demographics
    'economic': 'Median_Income',          # Economic analysis
    'brand_difference': 'Adidas_Sales_Pct' # Brand comparison
}

# Export parameters
EXPORT_CONFIG = {
    'max_records': 5000,          # Maximum records per endpoint
    'include_shap': True,         # Include SHAP values
    'batch_size': 500,            # API request batch size
    'timeout': 300,               # Request timeout (seconds)
    'retry_attempts': 3           # Retry failed requests
}
```

### 3. API Integration

The export process calls multiple microservice endpoints:

```python
# Strategic analysis
strategic_payload = {
    "query": "Strategic market analysis for geographic expansion opportunities",
    "analysis_type": "strategic",
    "target_variable": "Nike_Sales_Pct",
    "include_shap": True,
    "limit": 5000
}

# Competitive analysis  
competitive_payload = {
    "query": "Brand competition analysis across all market areas",
    "analysis_type": "competitive",
    "target_variable": "Nike_Sales_Pct", 
    "competitor_fields": ["Adidas_Sales_Pct", "Puma_Sales_Pct"],
    "include_shap": True,
    "limit": 5000
}

# Demographic insights
demographic_payload = {
    "query": "Demographic patterns and population insights",
    "analysis_type": "demographic",
    "target_variable": "Total_Population",
    "demographic_fields": ["Age_25_34_Pct", "Income_100K_Plus_Pct"],
    "include_shap": True,
    "limit": 5000
}
```

### 4. Batch Processing

Handle large datasets with batch processing:

```python
def export_with_batching(endpoint, base_payload, total_records):
    """Export data in batches to handle memory constraints"""
    all_results = []
    batch_size = EXPORT_CONFIG['batch_size']
    
    for offset in range(0, total_records, batch_size):
        batch_payload = base_payload.copy()
        batch_payload.update({
            'limit': batch_size,
            'offset': offset
        })
        
        response = call_microservice_endpoint(endpoint, batch_payload)
        if response and response.get('results'):
            all_results.extend(response['results'])
            
    return all_results
```

## SHAP Value Integration

### 1. SHAP Data Structure

Each endpoint includes SHAP explanations:

```json
{
  "success": true,
  "total_records": 1247,
  "results": [
    {
      "ID": "M3H",
      "Nike_Sales_Pct": 15.2,
      "strategic_value_score": 78.5,
      "shap_explanation": {
        "base_value": 12.3,
        "shap_values": {
          "Median_Income": 2.1,
          "Age_25_34_Pct": 1.8,
          "University_Educated_Pct": -0.7,
          "Total_Population": 0.3
        },
        "prediction": 15.8,
        "prediction_confidence": 0.91
      }
    }
  ],
  "feature_importance": [
    {"feature": "Median_Income", "importance": 0.24},
    {"feature": "Age_25_34_Pct", "importance": 0.19},
    {"feature": "University_Educated_Pct", "importance": 0.16}
  ],
  "summary": "Analysis shows strong correlation between income and Nike sales"
}
```

### 2. SHAP Processing

Process SHAP values for client consumption:

```python
def process_shap_values(raw_shap_data):
    """Convert microservice SHAP format to client format"""
    processed_data = {
        'base_value': raw_shap_data.get('base_value', 0),
        'feature_contributions': {},
        'prediction_confidence': raw_shap_data.get('confidence', 0)
    }
    
    # Convert SHAP values to percentage contributions
    shap_values = raw_shap_data.get('shap_values', {})
    total_contribution = sum(abs(v) for v in shap_values.values())
    
    for feature, value in shap_values.items():
        if total_contribution > 0:
            contribution_pct = (abs(value) / total_contribution) * 100
            processed_data['feature_contributions'][feature] = {
                'value': value,
                'contribution_pct': round(contribution_pct, 2),
                'impact': 'positive' if value > 0 else 'negative'
            }
    
    return processed_data
```

### 3. Feature Importance Aggregation

Aggregate feature importance across records:

```python
def calculate_global_feature_importance(results):
    """Calculate global feature importance from all SHAP explanations"""
    feature_impacts = defaultdict(list)
    
    for record in results:
        shap_data = record.get('shap_explanation', {})
        shap_values = shap_data.get('shap_values', {})
        
        for feature, value in shap_values.items():
            feature_impacts[feature].append(abs(value))
    
    # Calculate average importance
    global_importance = []
    for feature, impacts in feature_impacts.items():
        avg_impact = np.mean(impacts)
        global_importance.append({
            'feature': feature,
            'importance': round(avg_impact, 4),
            'frequency': len(impacts),
            'max_impact': round(max(impacts), 4)
        })
    
    return sorted(global_importance, key=lambda x: x['importance'], reverse=True)
```

## Dataset Transformation

### 1. Format Standardization

Transform microservice data to client-expected format:

```python
def transform_to_client_format(microservice_data, analysis_type):
    """Transform microservice response to client-expected format"""
    
    transformed = {
        'success': True,
        'total_records': len(microservice_data.get('results', [])),
        'analysis_type': analysis_type,
        'timestamp': datetime.now().isoformat(),
        'results': [],
        'summary': microservice_data.get('summary', ''),
        'feature_importance': []
    }
    
    # Transform each record
    for record in microservice_data.get('results', []):
        transformed_record = {
            'ID': record.get('FSA_ID') or record.get('ID'),
            'DESCRIPTION': record.get('DESCRIPTION', 'Unknown Area')
        }
        
        # Copy all data fields
        for key, value in record.items():
            if key not in ['FSA_ID', 'ID', 'shap_explanation']:
                transformed_record[key] = value
        
        # Add processed SHAP data
        if 'shap_explanation' in record:
            transformed_record['shap_explanation'] = process_shap_values(record['shap_explanation'])
        
        transformed['results'].append(transformed_record)
    
    # Add global feature importance
    transformed['feature_importance'] = calculate_global_feature_importance(transformed['results'])
    
    return transformed
```

### 2. Score Calculation

Add calculated scores for each analysis type:

```python
def add_analysis_scores(data, analysis_type):
    """Add analysis-specific calculated scores"""
    
    if analysis_type == 'strategic':
        for record in data['results']:
            # Strategic value score based on multiple factors
            income_score = normalize_score(record.get('Median_Income', 0), 30000, 150000)
            education_score = normalize_score(record.get('University_Educated_Pct', 0), 10, 60)
            population_score = normalize_score(record.get('Total_Population', 0), 5000, 50000)
            
            record['strategic_value_score'] = round((income_score * 0.4 + education_score * 0.3 + population_score * 0.3), 2)
    
    elif analysis_type == 'competitive':
        for record in data['results']:
            # Competitive advantage score
            nike_sales = record.get('Nike_Sales_Pct', 0)
            adidas_sales = record.get('Adidas_Sales_Pct', 0)
            
            record['competitive_advantage_score'] = round(nike_sales - adidas_sales, 2)
            record['market_dominance'] = 'high' if nike_sales > 20 else 'medium' if nike_sales > 10 else 'low'
    
    elif analysis_type == 'demographic':
        for record in data['results']:
            # Demographic opportunity score
            young_adults = record.get('Age_25_34_Pct', 0)
            high_income = record.get('Income_100K_Plus_Pct', 0)
            
            record['demographic_opportunity_score'] = round((young_adults * 0.6 + high_income * 0.4), 2)
    
    return data
```

### 3. Data Validation

Validate transformed datasets:

```python
def validate_endpoint_data(data, endpoint_name):
    """Validate endpoint data meets client requirements"""
    
    validation_results = {
        'valid': True,
        'errors': [],
        'warnings': []
    }
    
    # Required fields check
    required_fields = ['success', 'total_records', 'results']
    for field in required_fields:
        if field not in data:
            validation_results['errors'].append(f"Missing required field: {field}")
            validation_results['valid'] = False
    
    # Data quality checks
    if data.get('results'):
        sample_record = data['results'][0]
        
        # Geographic identifier check
        if not (sample_record.get('ID') or sample_record.get('GEOID')):
            validation_results['errors'].append("Records missing geographic identifier")
            validation_results['valid'] = False
        
        # SHAP data check
        shap_count = sum(1 for record in data['results'] if 'shap_explanation' in record)
        if shap_count < len(data['results']) * 0.5:
            validation_results['warnings'].append(f"Only {shap_count}/{len(data['results'])} records have SHAP explanations")
    
    return validation_results
```

## Quality Validation

### 1. Data Quality Checks

Run comprehensive quality validation:

```bash
# Validate all generated endpoints
python validate-endpoint-quality.py

# Check specific endpoint
python validate-endpoint-quality.py --endpoint strategic-analysis.json
```

### 2. Statistical Validation

Validate statistical properties:

```python
def validate_statistical_quality(data):
    """Validate statistical properties of the data"""
    
    results = data.get('results', [])
    if not results:
        return {'valid': False, 'error': 'No data to validate'}
    
    validation = {
        'record_count': len(results),
        'field_coverage': {},
        'value_ranges': {},
        'outliers': {},
        'missing_data': {}
    }
    
    # Analyze each numeric field
    for field in get_numeric_fields(results[0]):
        values = [record.get(field) for record in results if record.get(field) is not None]
        
        if values:
            validation['field_coverage'][field] = len(values) / len(results)
            validation['value_ranges'][field] = {
                'min': min(values),
                'max': max(values),
                'mean': np.mean(values),
                'std': np.std(values)
            }
            
            # Outlier detection
            q1, q3 = np.percentile(values, [25, 75])
            iqr = q3 - q1
            outliers = [v for v in values if v < q1 - 1.5*iqr or v > q3 + 1.5*iqr]
            validation['outliers'][field] = len(outliers)
        
        validation['missing_data'][field] = len(results) - len(values)
    
    return validation
```

### 3. SHAP Quality Assessment

Validate SHAP value quality:

```python
def validate_shap_quality(data):
    """Validate SHAP explanation quality"""
    
    shap_records = [r for r in data.get('results', []) if 'shap_explanation' in r]
    
    if not shap_records:
        return {'valid': False, 'error': 'No SHAP explanations found'}
    
    validation = {
        'shap_coverage': len(shap_records) / len(data.get('results', [])),
        'average_features': 0,
        'confidence_distribution': {},
        'feature_consistency': {}
    }
    
    # Analyze SHAP explanations
    feature_counts = []
    confidences = []
    feature_frequencies = defaultdict(int)
    
    for record in shap_records:
        shap_data = record['shap_explanation']
        
        # Feature count
        shap_values = shap_data.get('shap_values', {})
        feature_counts.append(len(shap_values))
        
        # Confidence
        confidence = shap_data.get('prediction_confidence', 0)
        confidences.append(confidence)
        
        # Feature frequency
        for feature in shap_values.keys():
            feature_frequencies[feature] += 1
    
    validation['average_features'] = np.mean(feature_counts)
    validation['confidence_distribution'] = {
        'mean': np.mean(confidences),
        'min': min(confidences) if confidences else 0,
        'max': max(confidences) if confidences else 0
    }
    
    # Most common features
    total_records = len(shap_records)
    validation['feature_consistency'] = {
        feature: frequency / total_records 
        for feature, frequency in feature_frequencies.items()
    }
    
    return validation
```

## Blob Storage Upload

### 1. Upload Process

Upload generated files to Vercel Blob storage:

```bash
# Upload all endpoint files
for file in ../public/data/endpoints/*.json; do
    npm run upload-endpoint -- $(basename "$file" .json)
done

# Or use the batch upload script
python upload-all-endpoints.py
```

### 2. Batch Upload Script

Create `upload-all-endpoints.py`:

```python
import subprocess
import json
import os
from pathlib import Path

def upload_endpoint_files():
    """Upload all endpoint files to Vercel Blob storage"""
    
    endpoints_dir = Path("../public/data/endpoints")
    blob_urls = {}
    
    for json_file in endpoints_dir.glob("*.json"):
        endpoint_name = json_file.stem
        
        print(f"Uploading {endpoint_name}...")
        
        # Run upload script
        result = subprocess.run([
            "npm", "run", "upload-endpoint", "--", endpoint_name
        ], capture_output=True, text=True, cwd="..")
        
        if result.returncode == 0:
            # Extract blob URL from output
            blob_url = extract_blob_url(result.stdout)
            if blob_url:
                blob_urls[endpoint_name] = blob_url
                print(f"✅ {endpoint_name}: {blob_url}")
            else:
                print(f"⚠️ {endpoint_name}: Upload succeeded but couldn't extract URL")
        else:
            print(f"❌ {endpoint_name}: Upload failed")
            print(result.stderr)
    
    # Update blob URLs file
    blob_urls_file = Path("../public/data/blob-urls.json")
    with open(blob_urls_file, 'w') as f:
        json.dump(blob_urls, f, indent=2)
    
    print(f"\n📁 Updated {blob_urls_file} with {len(blob_urls)} endpoints")
    return blob_urls

if __name__ == "__main__":
    upload_endpoint_files()
```

### 3. URL Validation

Validate uploaded blob URLs:

```python
def validate_blob_urls():
    """Validate all blob URLs are accessible"""
    
    with open("../public/data/blob-urls.json", 'r') as f:
        blob_urls = json.load(f)
    
    for endpoint, url in blob_urls.items():
        try:
            response = requests.head(url, timeout=10)
            if response.status_code == 200:
                print(f"✅ {endpoint}: Accessible")
            else:
                print(f"❌ {endpoint}: HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint}: {str(e)}")
```

## Local Fallback Setup

### 1. Copy Files Locally

Ensure local fallbacks exist:

```bash
# Copy all endpoint files to local fallback directory
mkdir -p ../public/data/endpoints
cp generated-endpoints/*.json ../public/data/endpoints/

# Verify all files are present
ls -la ../public/data/endpoints/
```

### 2. Fallback Validation

Validate local fallback files:

```python
def validate_local_fallbacks():
    """Ensure all endpoint files exist locally as fallbacks"""
    
    # Original 19 endpoints
    standard_endpoints = [
        'strategic-analysis', 'competitive-analysis', 'demographic-insights',
        'correlation-analysis', 'trend-analysis', 'spatial-clusters',
        'anomaly-detection', 'predictive-modeling', 'scenario-analysis',
        'segment-profiling', 'sensitivity-analysis', 'feature-interactions',
        'feature-importance-ranking', 'model-performance', 'outlier-detection',
        'analyze', 'brand-difference', 'comparative-analysis', 'customer-profile'
    ]
    
    # New comprehensive model endpoints (7 additional)
    comprehensive_endpoints = [
        'algorithm-comparison', 'ensemble-analysis', 'model-selection',
        'cluster-analysis', 'anomaly-insights', 'dimensionality-insights',
        'consensus-analysis'
    ]
    
    expected_endpoints = standard_endpoints + comprehensive_endpoints
    
    fallback_dir = Path("../public/data/endpoints")
    
    for endpoint in expected_endpoints:
        file_path = fallback_dir / f"{endpoint}.json"
        
        if file_path.exists():
            # Validate file is not empty and contains valid JSON
            try:
                with open(file_path, 'r') as f:
                    data = json.load(f)
                
                if data.get('results'):
                    print(f"✅ {endpoint}: {len(data['results'])} records")
                else:
                    print(f"⚠️ {endpoint}: No results data")
            except Exception as e:
                print(f"❌ {endpoint}: Invalid JSON - {str(e)}")
        else:
            print(f"❌ {endpoint}: File missing")
```

## Endpoint Generation Checklist

### Pre-Generation Setup
- [ ] Microservice is deployed and accessible
- [ ] API key is configured and working
- [ ] Export scripts are configured with correct URLs
- [ ] Local directories exist for output files

### Data Export Process  
- [ ] All 26 comprehensive endpoint files are generated successfully
- [ ] Standard 19 endpoints maintain backward compatibility
- [ ] New 7 endpoints leverage comprehensive model architecture
- [ ] SHAP values are included in supervised model data
- [ ] Ensemble predictions achieve R² = 0.879 accuracy
- [ ] Clustering analysis provides 8-cluster segmentation
- [ ] Anomaly detection identifies opportunity outliers  
- [ ] Algorithm comparison shows model diversity benefits
- [ ] Records counts meet minimum thresholds (>100 records per endpoint)
- [ ] Data quality validation passes all checks
- [ ] Statistical properties are within expected ranges

### File Upload and Storage
- [ ] All endpoint files uploaded to Vercel Blob storage
- [ ] Blob URLs are updated in `blob-urls.json`
- [ ] Local fallback files are copied to `public/data/endpoints/`
- [ ] URL accessibility validation passes
- [ ] File sizes are within reasonable limits (<50MB per file)

### Integration Validation
- [ ] Client application can load endpoint data
- [ ] SHAP explanations render correctly in UI
- [ ] Analysis results are accurate and meaningful
- [ ] Performance is acceptable for user interactions

---

**Next Steps**: Once endpoint generation is complete, proceed to [MICROSERVICE_04_SCORING_SCRIPTS.md](./MICROSERVICE_04_SCORING_SCRIPTS.md) for scoring algorithm configuration.

**Last Updated**: August 2025  
**Architecture**: 26 Endpoints (19 Standard + 7 Comprehensive Model)  
**Performance**: Ensemble R² = 0.879, 8 Algorithm Diversity, 99 Anomalies Detected  
**Compatibility**: Python 3.11+, Vercel Blob Storage, JSON format, 17-Model Architecture