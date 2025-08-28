# MPIQ AI Chat - Data Migration Documentation

This directory contains comprehensive documentation for migrating the MPIQ AI Chat system to new data sources and projects.

## Documentation Overview

### 📖 [MIGRATION_01_MAIN_GUIDE.md](./MIGRATION_01_MAIN_GUIDE.md)
**Primary migration guide** - Complete technical instructions for updating the system with new data sources.
- Data architecture overview
- Step-by-step migration process
- Field configuration procedures  
- Geographic data setup
- Testing and validation

### 🚀 [MIGRATION_02_QUICK_REFERENCE.md](./MIGRATION_02_QUICK_REFERENCE.md)
**Quick start guide** - Essential files and 30-minute migration checklist for experienced developers.
- TL;DR file list
- Data format templates
- Upload script usage
- Testing checklist

### 🔍 [MIGRATION_03_DATA_SOURCES.md](./MIGRATION_03_DATA_SOURCES.md)
**Complete data inventory** - Catalogs ALL data sources throughout the entire system.
- 50+ ArcGIS layer configurations
- Widget data dependencies
- External service integrations  
- Hardcoded configurations
- Migration impact matrix

### 🤖 [MIGRATION_04_AUTOMATION.md](./MIGRATION_04_AUTOMATION.md)
**Automation tools** - Scripts and future improvements for streamlining migrations.
- Existing upload scripts
- Validation automation
- Future UI tools
- Testing automation

## Quick Start

### For New Projects (30 minutes):

1. **Review the scope**: Start with [MIGRATION_03_DATA_SOURCES.md](./MIGRATION_03_DATA_SOURCES.md) to understand ALL data touchpoints
2. **Follow the process**: Use [MIGRATION_01_MAIN_GUIDE.md](./MIGRATION_01_MAIN_GUIDE.md) for complete instructions  
3. **Use quick reference**: Refer to [MIGRATION_02_QUICK_REFERENCE.md](./MIGRATION_02_QUICK_REFERENCE.md) for essential files
4. **Automate where possible**: Use scripts from [MIGRATION_04_AUTOMATION.md](./MIGRATION_04_AUTOMATION.md)

### Critical Files to Update:

#### Core Analysis Data (19 files)
- `public/data/blob-urls.json` - Blob storage URLs
- `public/data/endpoints/*.json` - 19 endpoint data files  
- `public/data/microservice-all-fields.json` - Field definitions

#### Map and Widget Data (50+ configurations)
- `config/layers.ts` - 50+ ArcGIS layer configurations
- `lib/geo/GeoDataManager.ts` - Geographic regions and ZIP codes
- `lib/analysis/ConfigurationManager.ts` - Endpoint configurations

#### Component Configuration
- `components/tabs/AITab.tsx` - Default layer URL
- `components/analysis/AnalysisEndpointSelector.tsx` - Endpoint categories
- Various hardcoded configurations throughout components

## Migration Workflow

```
1. Data Preparation
   ├── Prepare CSV data with geographic identifiers
   ├── Create 19 endpoint JSON files
   └── Update field mappings

2. Core Configuration  
   ├── Update endpoint configurations
   ├── Update field mappings in processors
   └── Update geographic data (if needed)

3. Layer & Widget Configuration
   ├── Update 50+ ArcGIS service URLs  
   ├── Update component configurations
   └── Update hardcoded constants

4. Upload & Deploy
   ├── Upload large files to Vercel Blob
   ├── Update blob URLs
   └── Copy fallback files locally

5. Testing & Validation
   ├── Test main analysis pipeline
   ├── Test all widgets and components
   ├── Test external service integrations
   └── Validate geographic functionality
```

## Support

### Common Issues
- **Layer list not showing**: Check ArcGIS service URLs in `config/layers.ts`
- **Geographic queries failing**: Verify city/ZIP mappings in `GeoDataManager.ts`
- **Analysis errors**: Check field mappings in data processors
- **Widget configuration errors**: Review hardcoded configurations

### Getting Help
1. Check the troubleshooting sections in each guide
2. Review console logs for specific errors  
3. Test with small data samples first
4. Verify all external service URLs are accessible

---

**Last Updated**: January 2025  
**System Version**: MPIQ AI Chat v2.0  
**Compatibility**: Next.js 14, TypeScript 5+