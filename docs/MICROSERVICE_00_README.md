# MPIQ AI Chat - Microservice Migration Documentation

This directory contains comprehensive documentation for migrating and deploying the SHAP microservice that powers the MPIQ AI Chat system's machine learning analytics.

## Documentation Overview

### 📖 [MICROSERVICE_01_DATA_PREPARATION.md](./MICROSERVICE_01_DATA_PREPARATION.md)
**Data preparation and training guide** - Complete instructions for preparing training data and model training.

- Data format requirements and validation
- Field mapping and standardization
- Model training and optimization
- SHAP integration and feature importance

### 🚀 [MICROSERVICE_02_DEPLOYMENT.md](./MICROSERVICE_02_DEPLOYMENT.md)
**Deployment guide for Render.com** - Step-by-step deployment instructions for new projects.

- Render.com setup and configuration
- Environment variables and secrets
- Memory optimization strategies
- Worker configuration and scaling

### 🔧 [MICROSERVICE_03_ENDPOINT_GENERATION.md](./MICROSERVICE_03_ENDPOINT_GENERATION.md)
**Endpoint dataset creation** - Scripts and processes for generating analysis endpoints.

- Export scripts for endpoint data
- SHAP value calculation and integration
- Data transformation and optimization
- Quality validation and testing

### ⚡ [MICROSERVICE_04_SCORING_SCRIPTS.md](./MICROSERVICE_04_SCORING_SCRIPTS.md)
**Scoring and analysis scripts** - Complete workflow for generating analysis scores.

- Strategic analysis scoring
- Competitive analysis algorithms
- Demographic insights calculation
- Feature importance and interactions

### 🔄 [MICROSERVICE_05_COMPLETE_WORKFLOW.md](./MICROSERVICE_05_COMPLETE_WORKFLOW.md)
**End-to-end workflow** - Complete migration process from data to deployment.

- Project migration checklist
- Automation scripts and tools
- Testing and validation procedures
- Troubleshooting and maintenance

## 🚀 **NEW: Complete Automation Pipeline**

**Transform ArcGIS services into production microservices in 30-50 minutes**

### Key Features:
- **32 Analysis Endpoints**: 19 standard + 13 comprehensive model endpoints (**100% model utilization**)
- **17 AI Models**: 6 specialized + 8 algorithm diversity + 3 unsupervised (**all actively used**)
- **Complete Model Attribution**: Full traceability from predictions to specific models with R² scores
- **22 Scoring Algorithms**: Complete analysis coverage
- **Intelligent Cleanup**: Automated storage optimization
- **One-Command Deployment**: Fully automated pipeline with pause for manual deployment

### Usage:
```bash
# Navigate to automation directory
cd scripts/automation

# Run complete automation pipeline
python run_complete_automation.py "https://services8.arcgis.com/.../FeatureServer" --project HRB_v2 --target MP10128A_B_P

# The script will:
# 1. Auto-discover and extract data from ArcGIS service
# 2. Train 17 comprehensive AI models
# 3. PAUSE for manual microservice deployment to Render
# 4. Generate 26 analysis endpoints with scoring
# 5. Update layer configurations
# 6. Offer cleanup recommendations
```

## Quick Start

### For New Projects (30-50 minutes with Automation):

**🚀 RECOMMENDED: Use Complete Automation Pipeline**
```bash
python scripts/automation/run_complete_automation.py "YOUR_ARCGIS_URL" --project project_name --target TARGET_VARIABLE
```

**Manual Process (60+ minutes):**
1. **Prepare your data**: Follow [MICROSERVICE_01_DATA_PREPARATION.md](./MICROSERVICE_01_DATA_PREPARATION.md) to format and validate your dataset
2. **Deploy to Render**: Use [MICROSERVICE_02_DEPLOYMENT.md](./MICROSERVICE_02_DEPLOYMENT.md) for cloud deployment
3. **Generate endpoints**: Run scripts from [MICROSERVICE_03_ENDPOINT_GENERATION.md](./MICROSERVICE_03_ENDPOINT_GENERATION.md)
4. **Create scoring data**: Execute scripts from [MICROSERVICE_04_SCORING_SCRIPTS.md](./MICROSERVICE_04_SCORING_SCRIPTS.md)
5. **Complete integration**: Follow [MICROSERVICE_05_COMPLETE_WORKFLOW.md](./MICROSERVICE_05_COMPLETE_WORKFLOW.md)
6. **Clean up storage**: Use automated cleanup recommendations

### Critical Components:

#### Microservice Core (shap-microservice/)
- `app.py` - Flask application with 26 API endpoints and comprehensive model support
- `automated_model_trainer.py` - Multi-algorithm model training (17 models total)
- `enhanced_analysis_worker.py` - Redis-free synchronous processing
- `requirements.txt` - Python dependencies with all dependencies
- `render.yaml` - Render.com deployment configuration

#### Comprehensive Model Architecture (17 Models)
- **6 Specialized Models**: Strategic, Competitive, Demographic, Correlation, Predictive, Ensemble
- **8 Algorithm Models**: XGBoost, Random Forest, Linear, Ridge, Lasso, SVR, KNN, Neural Network  
- **3 Unsupervised Models**: Anomaly Detection, Clustering, Dimensionality Reduction

#### Data Processing Scripts (mpiq-ai-chat/scripts/)
- `automation/run_complete_automation.py` - **Complete automated pipeline (RECOMMENDED)**
- `automation/comprehensive_endpoint_generator.py` - Generate all 26 endpoints
- `automation/automated_score_calculator.py` - 22 scoring algorithms
- `automation/cleanup_automation_artifacts.py` - Storage optimization
- `export-microservice-dataset.py` - Export training data from microservice
- `export-complete-dataset.py` - Generate complete endpoint datasets
- `scoring/*.js` - Analysis scoring algorithms (26 scripts total)
- `test-*.py` - Validation and testing scripts

#### Integration Points
- `public/data/blob-urls.json` - Links client to microservice data
- `public/data/microservice-all-fields.json` - Field definitions
- `lib/analysis/ConfigurationManager.ts` - Client-side endpoint configuration

## Migration Architecture

```
🚀 AUTOMATED PIPELINE (RECOMMENDED)
ArcGIS URL → Complete Automation → 26 Endpoints + Cleanup
    ↓              ↓                      ↓
Service Discovery  17 ML Models          Storage Optimization
    ↓              ↓                      ↓
Data Extraction    Deployment           Client Integration
    ↓              ↓                      ↓
Field Mapping      26 JSON files        Real-time Analysis

🔧 MANUAL PROCESS (Advanced Users)
Raw Data → Data Preparation → Comprehensive Training → Deployment → Endpoint Generation → Scoring → Cleanup
    ↓              ↓                   ↓                ↓              ↓               ↓        ↓
  CSV File    Field Mapping      17 ML Models        Render.com   Export Scripts  Score Scripts Storage Opt
cleaned_data.csv  ↓           (8 Supervised +         ↓         26 JSON files     ↓        ↓
    ↓        map_nesto_data.py   3 Unsupervised +   app.py (Redis-free) ↓      22 Algorithms  Cleanup
Field validation     ↓          6 Specialized)         ↓      Client integration    ↓   Recommendations
    ↓           Standardization   Ensemble R²=0.879    ↓         Visualization      ↓
Training ready       ↓          SHAP + Feature Imp.   ↓      Blob storage       ↓
                Model artifacts        ↓               ↓         ↓          User interface
                     ↓          Production service     ↓    Data pipeline       ↓
                Algorithm diversity        ↓           ↓         ↓        Real-time analysis
```

## Workflow Overview

### Phase 1: Data Preparation (30 minutes)
1. Prepare CSV data with geographic identifiers
2. Update field mappings in `map_nesto_data.py`
3. Run data validation and standardization
4. Create training-ready dataset

### Phase 2: Comprehensive Model Training & Deployment (25 minutes)
1. Train 17 models using comprehensive multi-algorithm pipeline
2. Configure Render.com deployment with enhanced model support
3. Deploy microservice with Redis-free synchronous processing
4. Validate 26 API endpoints and ensemble model performance (R²=0.879)

### Phase 3: Data Integration (10 minutes)
1. Export complete dataset from microservice
2. Generate 26 analysis endpoint files (19 standard + 7 comprehensive)
3. Run 22 scoring algorithms for all analysis types
4. Upload to Vercel Blob storage and update URLs
5. Execute cleanup recommendations for storage optimization

### Phase 4: Client Integration (5 minutes)
1. Update field mappings in client application
2. Configure endpoint routing and processors
3. Test end-to-end analysis pipeline
4. Validate visualizations and user interface

## Common Migration Scenarios

### Scenario 1: New Geographic Region
- Update geographic identifiers and city mappings
- Retrain model with region-specific data
- Update scoring algorithms for local market conditions
- Deploy region-specific microservice instance

### Scenario 2: New Industry/Domain
- Replace industry-specific field mappings
- Update brand/competitor target variables
- Retrain all 17 models with domain-specific features and algorithm diversity
- Adapt 22 scoring algorithms for industry metrics with ensemble optimization
- Generate 26 comprehensive endpoints for complete industry coverage

### Scenario 3: Data Source Change
- Update data pipeline and validation rules
- Retrain all models with new data schema
- Update field mappings and transformations
- Validate analysis accuracy and performance

## Support and Troubleshooting

### Common Issues
- **Model training failures**: Check data format and missing values
- **Deployment timeouts**: Enable model training skip feature
- **Memory errors**: Adjust batch sizes and optimization thresholds
- **API errors**: Verify authentication and endpoint configurations

### Getting Help
1. Check troubleshooting sections in each guide
2. Review microservice logs in Render dashboard
3. Test with sample data first
4. Validate field mappings and data transformations

---

**Last Updated**: August 2025  
**Microservice Version**: SHAP Analytics v4.0 - Comprehensive Model Architecture  
**Model Architecture**: 17 Models (6 Specialized + 8 Algorithm + 3 Unsupervised)  
**Performance**: Ensemble R² = 0.879 (87.9% variance explained)  
**Compatibility**: Python 3.11+, XGBoost 2.0+, SHAP 0.45+, scikit-learn 1.3+