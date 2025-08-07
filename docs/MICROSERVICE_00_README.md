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

## Quick Start

### For New Projects (60 minutes):

1. **Prepare your data**: Follow [MICROSERVICE_01_DATA_PREPARATION.md](./MICROSERVICE_01_DATA_PREPARATION.md) to format and validate your dataset
2. **Deploy to Render**: Use [MICROSERVICE_02_DEPLOYMENT.md](./MICROSERVICE_02_DEPLOYMENT.md) for cloud deployment
3. **Generate endpoints**: Run scripts from [MICROSERVICE_03_ENDPOINT_GENERATION.md](./MICROSERVICE_03_ENDPOINT_GENERATION.md)
4. **Create scoring data**: Execute scripts from [MICROSERVICE_04_SCORING_SCRIPTS.md](./MICROSERVICE_04_SCORING_SCRIPTS.md)
5. **Complete integration**: Follow [MICROSERVICE_05_COMPLETE_WORKFLOW.md](./MICROSERVICE_05_COMPLETE_WORKFLOW.md)

### Critical Components:

#### Microservice Core (shap-microservice/)
- `app.py` - Flask application with API endpoints
- `train_model.py` - XGBoost model training script
- `enhanced_analysis_worker.py` - Redis queue worker for async processing
- `requirements.txt` - Python dependencies
- `render.yaml` - Render.com deployment configuration

#### Data Processing Scripts (mpiq-ai-chat/scripts/)
- `export-microservice-dataset.py` - Export training data from microservice
- `export-complete-dataset.py` - Generate complete endpoint datasets
- `scoring/*.js` - Analysis scoring algorithms (17 scripts)
- `test-*.py` - Validation and testing scripts

#### Integration Points
- `public/data/blob-urls.json` - Links client to microservice data
- `public/data/microservice-all-fields.json` - Field definitions
- `lib/analysis/ConfigurationManager.ts` - Client-side endpoint configuration

## Migration Architecture

```
Raw Data → Data Preparation → Model Training → Deployment → Endpoint Generation → Scoring
    ↓              ↓              ↓             ↓              ↓               ↓
  CSV File    Field Mapping   XGBoost Model  Render.com   Export Scripts  Score Scripts
cleaned_data.csv  ↓         xgboost_model.pkl    ↓         19 JSON files     ↓
    ↓        map_nesto_data.py      ↓        app.py + worker    ↓         Analysis endpoints
Field validation     ↓         SHAP integration     ↓      Client integration    ↓
    ↓           Standardization     ↓        API endpoints      ↓         Visualization
Training ready       ↓         Feature importance   ↓      Blob storage       ↓
                Model artifacts         ↓            ↓         ↓          User interface
                     ↓           Production service  ↓    Data pipeline       ↓
                Performance validation     ↓         ↓         ↓        Real-time analysis
```

## Workflow Overview

### Phase 1: Data Preparation (30 minutes)
1. Prepare CSV data with geographic identifiers
2. Update field mappings in `map_nesto_data.py`
3. Run data validation and standardization
4. Create training-ready dataset

### Phase 2: Model Training & Deployment (20 minutes)
1. Train XGBoost model with SHAP integration
2. Configure Render.com deployment
3. Deploy microservice with Redis worker
4. Validate API endpoints and performance

### Phase 3: Data Integration (10 minutes)
1. Export complete dataset from microservice
2. Generate 19 analysis endpoint files
3. Run scoring scripts for all analysis types
4. Upload to Vercel Blob storage and update URLs

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
- Retrain models with domain-specific features
- Adapt scoring algorithms for industry metrics

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

**Last Updated**: January 2025  
**Microservice Version**: SHAP Analytics v3.0  
**Compatibility**: Python 3.11+, XGBoost 2.0+, SHAP 0.45+