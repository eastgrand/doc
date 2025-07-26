# Production Deployment Guide

## Overview

The Project Configuration Manager now includes a comprehensive production deployment system that updates **ALL** files dependent on layer configuration changes. This ensures consistency across the entire application stack.

## Files Updated During Deployment

### 1. Frontend Layer Configuration
**File**: `config/layers.ts`
- **Purpose**: Source of truth for all layer definitions
- **Contains**: Layer metadata, field definitions, rendering config, groups
- **Dependencies**: 50+ components and services import from this file

### 2. Layer Configuration Adapter
**File**: `adapters/layerConfigAdapter.ts`
- **Purpose**: Transforms layer config for different components
- **Updates**: Layer group IDs, processing logic, adapter functions
- **Dependencies**: MapApp, MapContainer, MapWidgets, data-fetcher

### 3. Field Aliases Mapping
**File**: `utils/field-aliases.ts`
- **Purpose**: Maps frontend field names to microservice canonical names
- **Updates**: Field alias mappings, microservice field references
- **Dependencies**: geospatial-chat-interface, query validation, analysis rendering

### 4. Concept Mappings
**File**: `config/concept-map.json`
- **Purpose**: AI concept mappings and field relationships
- **Updates**: Layer mappings, field mappings, synonyms, custom concepts
- **Dependencies**: AI analysis, query classification, concept mapping

### 5. Microservice Field Mappings
**Files**: 
- `shap-microservice/map_nesto_data.py` - Core field mappings and schema generation
- `shap-microservice/query_classifier.py` - Target variable mappings for query classification
- `shap-microservice/data/NESTO_FIELD_MAPPING.md` - Complete field documentation
- **Purpose**: Ensures microservice understands frontend field references
- **Updates**: Python code generation, target variables, field documentation, schema definitions

## Production Deployment Process

### Step 1: Configuration Export/Import
```bash
# Export current configuration
# Use Project Configuration Manager → Export button

# Import configuration to target environment
# Use Project Configuration Manager → Import button
```

### Step 2: Deploy Configuration
```bash
# In Project Configuration Manager
# Click "Deploy" button to update all dependent files
```

### Step 3: Verify Deployment
The deployment system will update:
- ✅ `config/layers.ts` - Layer definitions
- ✅ `adapters/layerConfigAdapter.ts` - Adapter logic
- ✅ `utils/field-aliases.ts` - Field mappings
- ✅ `config/concept-map.json` - Concept mappings
- ✅ Microservice field mappings (3 files)

## Deployment Output Example

```
🚀 Starting comprehensive production deployment...
📝 Generated layer configuration: // Auto-generated layer configuration...
🔧 Generated layer config adapter updates
🏷️ Generated field aliases updates
🗺️ Generated concept mappings: {"layerMappings": {}...
🔬 Generated microservice field mappings
✅ Configuration saved to localStorage
✅ Comprehensive deployment completed successfully!
```

## Files That Depend on Layer Configuration

### Core Configuration Files (6 files)
- `config/layers.ts` - Main layer configuration
- `config/dynamic-layers.ts` - Dynamic layer system
- `config/layers/index.ts` - Layer exports
- `config/layers/types.ts` - Layer type definitions
- `adapters/layerConfigAdapter.ts` - Layer adapter
- `utils/field-aliases.ts` - Field mappings

### Component Dependencies (25+ files)
- `components/LayerController/` - Layer management (16 files)
- `components/map/` - Map components (4 files)
- `components/geospatial/` - Geospatial components (3 files)
- `components/popup/` - Popup management (6 files)
- Main app components: MapApp, QueryInterface, AnalysisDashboard

### Service Dependencies (15+ files)
- `services/` - Data services (12 files)
- `lib/analytics/` - Analytics services (8 files)
- `utils/` - Utility services (84 files in utils/)
- API routes: `/api/features/`, `/api/claude/`

### Microservice Dependencies (3 files)
- `shap-microservice/map_nesto_data.py` - Core field mappings and schema generation
- `shap-microservice/query_classifier.py` - Query classification and target variables
- `shap-microservice/data/NESTO_FIELD_MAPPING.md` - Complete field documentation

### Microservice Architecture Flow
The SHAP microservice processes field mappings through this flow:
1. **Frontend Layer Config** → Field definitions with microserviceField properties
2. **Project Config Manager** → Generates Python code and documentation
3. **map_nesto_data.py** → Core field mappings (CORE_FIELD_MAPPINGS dict)
4. **query_classifier.py** → Target variable mappings (target_variables dict)
5. **app.py** → Field resolution using resolve_field_name() function
6. **enhanced_analysis_worker.py** → Query-aware analysis with resolved fields

### Generated Code Structure
**Python Field Mappings (map_nesto_data.py)**:
```python
CORE_FIELD_MAPPINGS = {
    'Frontend Field Name': 'canonical_microservice_name',
    '2024 Total Population': 'total_population',
    '2024 Household Average Income': 'median_income'
}
```

**Query Classifier Mappings (query_classifier.py)**:
```python
self.target_variables = {
    "population": "total_population",
    "income": "median_income",
    "condo ownership": "condo_ownership_pct"
}
```

## Production Checklist

### Before Deployment
- [ ] Export current configuration as backup
- [ ] Test configuration in development environment
- [ ] Verify all layer URLs are accessible
- [ ] Check field mappings are correct
- [ ] Validate microservice compatibility

### During Deployment
- [ ] Import configuration to production
- [ ] Run comprehensive deployment
- [ ] Verify all files updated successfully
- [ ] Check console for deployment errors
- [ ] Test key functionality

### After Deployment
- [ ] Verify layer loading works
- [ ] Test query functionality
- [ ] Check AI analysis responses
- [ ] Validate field mappings work
- [ ] Monitor for errors

## Rollback Procedure

### If Deployment Fails
1. **Import Previous Configuration**: Use backup JSON file
2. **Redeploy**: Click Deploy button to restore previous state
3. **Verify Restoration**: Test core functionality
4. **Debug Issues**: Check console errors and fix configuration

### Emergency Rollback
```bash
# Restore from git if needed
git checkout HEAD~1 -- config/layers.ts
git checkout HEAD~1 -- adapters/layerConfigAdapter.ts
git checkout HEAD~1 -- utils/field-aliases.ts
```

## Maintenance

### Adding New Layers
When adding new layers, the deployment system automatically:
- Generates layer configuration code
- Updates adapter group mappings
- Creates field alias mappings
- Updates microservice field mappings
- Maintains concept mappings

### Modifying Field Mappings
Field mapping changes are propagated to:
- Frontend field aliases
- Microservice field mappings
- Query classification logic
- Analysis rendering system

### Best Practices
1. **Always Export Before Changes**: Create configuration backups
2. **Test in Development**: Verify changes work before production
3. **Monitor Deployment**: Check all files update successfully
4. **Validate End-to-End**: Test complete query → analysis → visualization flow
5. **Document Changes**: Update field mapping documentation

## Troubleshooting

### Common Issues

**Deployment Fails**
- Check console for specific error messages
- Verify configuration JSON is valid
- Ensure all required fields are present

**Field Mappings Not Working**
- Check `utils/field-aliases.ts` was updated
- Verify microservice field mappings
- Test query classification

**Layers Not Loading**
- Check `config/layers.ts` generation
- Verify adapter updates in `adapters/layerConfigAdapter.ts`
- Test layer URLs are accessible

**AI Analysis Broken**
- Check concept mappings updated
- Verify field aliases are correct
- Test microservice field mappings

### Support
For deployment issues:
1. Check deployment console output
2. Verify all dependent files were updated
3. Test individual components
4. Use configuration export/import for recovery

## Architecture Benefits

This comprehensive deployment system ensures:
- **Consistency**: All dependent files stay in sync
- **Reliability**: No manual file updates required
- **Traceability**: All changes tracked and logged
- **Rollback**: Easy recovery from issues
- **Scalability**: Handles large configuration changes
- **Maintainability**: Single source of truth for all updates 