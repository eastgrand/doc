# Complete Project Setup Guide: Claude-Flow + Automation Pipeline

**Transform any ArcGIS service into a fully functional analysis platform in 30-45 minutes**

This document provides step-by-step instructions for setting up a new project using the claude-flow development acceleration system combined with the complete automation pipeline.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Phase 1: Claude-Flow Development Environment Setup](#phase-1-claude-flow-development-environment-setup)
3. [Phase 2: Project-Specific Configuration](#phase-2-project-specific-configuration)
4. [Phase 3: ArcGIS Data Automation Pipeline](#phase-3-arcgis-data-automation-pipeline)
5. [Phase 4: Microservice Deployment](#phase-4-microservice-deployment)
6. [Phase 5: Post-Automation Integration](#phase-5-post-automation-integration)
7. [Phase 6: Validation and Testing](#phase-6-validation-and-testing)
8. [Phase 7: Production Deployment](#phase-7-production-deployment)
9. [Troubleshooting](#troubleshooting)
10. [Success Checklist](#success-checklist)

---

## Prerequisites

### Required Information
- **ArcGIS Service URL** (example: `https://services8.arcgis.com/.../FeatureServer`)
- **Project Name** (no spaces, lowercase recommended, e.g., `athletic_brands`)
- **Industry/Domain** (e.g., `Athletic Footwear`, `Entertainment`, `Banking`)
- **Target Variable** for model training (e.g., `MP30034A_B_P`)
- **Geographic Scope** (states/regions covered by your data)
- **Primary Brand/Service** for analysis focus
- **Competitor Brands** (2-4 main competitors)

### Required Accounts
- **GitHub account** (free at github.com)
- **Render account** (free at render.com)
- **Vercel account** (for blob storage - optional but recommended)

### System Requirements
- **Computer** with internet connection
- **Node.js** and npm installed
- **Python 3.8+** with pip
- **Git** installed and configured

---

## Phase 1: Claude-Flow Development Environment Setup

### Step 1.1: Initialize Project Structure

```bash
# Navigate to project root
cd /path/to/your/mpiq-ai-chat

# Create claude-flow directory structure if not exists
mkdir -p claude-flow/{agents,workflows,integration,scripts}

# Create project-specific directory
mkdir -p projects/{PROJECT_NAME}
```

### Step 1.2: Create Claude-Flow Configuration

**Create/Update: `claude-flow/claude-flow.config.json`**

```json
{
  "project": {
    "name": "YOUR_PROJECT_NAME",
    "version": "1.0.0",
    "description": "YOUR_PROJECT_DESCRIPTION",
    "base_architecture": "MPIQ AI Chat Platform v2.0",
    "project_type": "YOUR_DOMAIN_TYPE",
    "target_audience": "YOUR_TARGET_DEMOGRAPHICS"
  },
  "system_architecture": {
    "base_platform": "Next.js 14 with TypeScript",
    "existing_processors": 35,
    "analysis_endpoints": 16,
    "routing_system": "Semantic Enhanced Hybrid Router",
    "analysis_engine": "Multi-endpoint with BaseProcessor architecture",
    "data_pipeline": "SHAP-based scoring with automated generation",
    "visualization": "ArcGIS-powered interactive maps",
    "configuration_system": "Project-type driven processor configuration"
  },
  "automation": {
    "integration_status": "PHASE_2_REQUIRED",
    "automation_pipeline_steps": [
      "Phase 1: Service inspection and data extraction",
      "Phase 2: Intelligent field mapping and model training", 
      "Phase 3: Endpoint generation with 26 analysis types",
      "Phase 4: Microservice deployment to Render",
      "Phase 5: Post-automation integration and validation"
    ],
    "target_service": "YOUR_ARCGIS_SERVICE_URL",
    "target_variable": "YOUR_TARGET_VARIABLE"
  },
  "data_sources": {
    "primary": {
      "arcgis_feature_service": {
        "url": "YOUR_ARCGIS_SERVICE_URL",
        "description": "YOUR_DATA_DESCRIPTION",
        "target_audience_coverage": "100%"
      }
    },
    "geographic": {
      "states": ["STATE1", "STATE2", "STATE3"],
      "region": "YOUR_GEOGRAPHIC_REGION"
    }
  }
}
```

### Step 1.3: Create Project-Specific Analysis Context

**Create: `config/analysis-contexts/{project-type}-context.ts`**

```typescript
import { AnalysisContext } from './base-context';

/**
 * YOUR_PROJECT Analysis Configuration
 * Optimized for YOUR_TARGET_AUDIENCE
 */
export const YOUR_PROJECT_CONTEXT: AnalysisContext = {
  projectType: 'your-project-type',
  domain: 'Your Project Domain Analysis',
  
  fieldMappings: {
    primaryMetric: ['primary_score', 'main_metric', 'target_variable'],
    secondaryMetrics: ['secondary_metric_1', 'secondary_metric_2'],
    populationField: ['total_population', 'TOTPOP_CY', 'population'],
    incomeField: ['median_household_income', 'AVGHINC_CY', 'household_income'],
    geographicId: ['id', 'area_id', 'ID', 'GEOID'],
    descriptiveFields: ['area_description', 'name', 'DESCRIPTION'],
    
    // Project-specific field categories
    brandFields: ['brand_field_1', 'brand_field_2'],
    competitiveFields: ['competitor_1_field', 'competitor_2_field']
  },
  
  terminology: {
    entityType: 'market areas',
    metricName: 'your metric description',
    scoreDescription: 'what your score represents',
    comparisonContext: 'your comparison context'
  },
  
  scoreRanges: {
    excellent: { 
      min: 75, 
      description: 'Premium markets with exceptional potential',
      actionable: 'Ideal for premium strategies and high investment'
    },
    good: { 
      min: 60, 
      description: 'Strong markets with solid performance',
      actionable: 'Suitable for standard strategies and targeted investment'
    },
    moderate: { 
      min: 45, 
      description: 'Developing markets with moderate potential',
      actionable: 'Consider growth strategies and market development'
    },
    poor: { 
      min: 0, 
      description: 'Challenging markets requiring strategic intervention',
      actionable: 'Focus on market development or alternative approaches'
    }
  },
  
  processorConfig: {
    // Add your specific processor configurations
  }
};
```

### Step 1.4: Register New Context

**Update: `config/analysis-contexts/index.ts`**

```typescript
// Add import
import { YOUR_PROJECT_CONTEXT } from './your-project-context';

// Add export
export { YOUR_PROJECT_CONTEXT } from './your-project-context';

// Add to registry
export const ANALYSIS_CONTEXTS: Record<string, AnalysisContext> = {
  'retail': RETAIL_CONTEXT,
  'real-estate': REAL_ESTATE_CONTEXT,
  'entertainment': ENTERTAINMENT_CONTEXT,
  'your-project-type': YOUR_PROJECT_CONTEXT, // Add your context
};
```

### Step 1.5: Update Base Context Types

**Update: `config/analysis-contexts/base-context.ts`**

```typescript
// Add your project type to the union
export type ProjectType = 'retail' | 'real-estate' | 'entertainment' | 'your-project-type' | 'demographics' | 'healthcare' | 'finance';
```

---

## Phase 2: Project-Specific Configuration

### Step 2.1: Create Project-Specific Analysis Processor

**Create: `lib/analysis/strategies/processors/YourProjectAnalysisProcessor.ts`**

```typescript
import { RawAnalysisResult, ProcessedAnalysisData } from '../../types';
import { getTopFieldDefinitions, getPrimaryScoreField } from './HardcodedFieldDefs';
import { BaseProcessor } from './BaseProcessor';

/**
 * YOUR_PROJECT Analysis Processor
 * Analyzes YOUR_TARGET_AUDIENCE for YOUR_BUSINESS_OBJECTIVE
 * 
 * Scoring Framework:
 * - Component 1 (X%): Description
 * - Component 2 (Y%): Description
 * - Component 3 (Z%): Description
 */
export class YourProjectAnalysisProcessor extends BaseProcessor {
  constructor() {
    super(); // Initialize BaseProcessor with your project configuration
  }

  validate(rawData: RawAnalysisResult): boolean {
    return rawData && rawData.success && Array.isArray(rawData.results) && rawData.results.length > 0;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    if (!rawData.success) {
      throw new Error(rawData.error || 'Your project analysis failed');
    }

    const rawResults = rawData.results as unknown[];
    const scoreField = getPrimaryScoreField('your_project_analysis', (rawData as any)?.metadata ?? undefined) || 'your_project_score';
    
    const records = rawResults.map((recordRaw: unknown, index: number) => {
      const record = (recordRaw && typeof recordRaw === 'object') ? recordRaw as Record<string, unknown> : {};
      
      // Extract your project-specific metrics
      const primaryMetric = this.extractPrimaryMetric(record);
      const totalPop = this.extractNumericValue(record, this.configManager.getFieldMapping('populationField'), 0);
      const medianIncome = this.extractNumericValue(record, this.configManager.getFieldMapping('incomeField'), 0);
      
      // Extract project-specific data points
      const metric1 = this.extractNumericValue(record, ['your_metric_1_field'], 0);
      const metric2 = this.extractNumericValue(record, ['your_metric_2_field'], 0);
      const metric3 = this.extractNumericValue(record, ['your_metric_3_field'], 0);
      
      // Calculate composite score using your methodology
      const projectScore = this.calculateYourProjectScore({
        metric1, metric2, metric3, income: medianIncome, population: totalPop
      });
      
      // Geographic context for stakeholder communication
      const zipCode = this.extractFieldValue(record, ['zip_code', 'admin4_name', 'ZIP_CODE']) || 'N/A';
      const county = this.extractFieldValue(record, ['county', 'admin3_name', 'COUNTY']) || 'N/A';
      const state = this.extractFieldValue(record, ['state', 'admin2_name', 'STATE']) || 'N/A';
      
      return {
        area_id: this.extractGeographicId(record),
        area_name: this.generateAreaName(record),
        value: projectScore,
        rank: index + 1,
        category: this.categorizeProjectPotential(projectScore),
        coordinates: this.extractCoordinates(record),
        
        properties: {
          [scoreField]: projectScore,
          
          // Your project-specific metrics
          your_metric_1: metric1,
          your_metric_2: metric2,
          your_metric_3: metric3,
          
          // Geographic context
          zip_code_context: zipCode,
          county_context: county,
          state_context: state,
          
          // Raw demographic data
          population: totalPop,
          median_income: medianIncome
        },
        shapValues: (record.shap_values || {}) as Record<string, number>
      };
    });

    // Use BaseProcessor ranking and statistics
    const rankedRecords = this.rankRecords(records);
    const statistics = this.calculateStatistics(rankedRecords.map(r => r.value));
    const summary = this.buildSummaryFromTemplates(rankedRecords, statistics, {});

    return this.createProcessedData(
      'your_project_analysis',
      rankedRecords,
      summary,
      statistics,
      { featureImportance: rawData.feature_importance || [] }
    );
  }

  private calculateYourProjectScore(metrics: {
    metric1: number, metric2: number, metric3: number, 
    income: number, population: number
  }): number {
    // Implement your scoring methodology here
    // Example composite scoring:
    let score = 0;
    
    // Component 1 (40%)
    const component1 = (metrics.metric1 / 100) * 40;
    score += component1;
    
    // Component 2 (35%)
    const component2 = (metrics.metric2 / 100) * 35;
    score += component2;
    
    // Component 3 (25%)
    const component3 = (metrics.metric3 / 100) * 25;
    score += component3;
    
    return Math.min(Math.max(score, 0), 100);
  }

  private categorizeProjectPotential(score: number): string {
    const scoreRange = this.getScoreInterpretation(score);
    return scoreRange.description;
  }

  private extractCoordinates(record: Record<string, unknown>): [number, number] {
    if (record['coordinates'] && Array.isArray(record['coordinates'])) {
      const coords = record['coordinates'] as unknown as number[];
      return [coords[0] || 0, coords[1] || 0];
    }
    const lat = Number((record['latitude'] || record['lat'] || 0) as unknown as number);
    const lng = Number((record['longitude'] || record['lng'] || 0) as unknown as number);
    return [lng, lat];
  }
}
```

### Step 2.2: Register New Processor

**Update: `lib/analysis/strategies/processors/index.ts`**

```typescript
// Add export
export { YourProjectAnalysisProcessor } from './YourProjectAnalysisProcessor';

// Add processor type
export const PROCESSOR_TYPES = {
  // ... existing types
  YOUR_PROJECT_ANALYSIS: 'your_project_analysis',
  // ... rest
} as const;
```

### Step 2.3: Create SHAP-Based Scoring Scripts

**Create: `scripts/scoring/your-project-analysis-scores.js`**

```javascript
/**
 * YOUR_PROJECT Analysis Scoring Script
 * 
 * Creates scores by analyzing YOUR_ANALYSIS_FACTORS
 * 
 * Formula: Component 1 (X%) + Component 2 (Y%) + Component 3 (Z%)
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Starting YOUR_PROJECT Analysis Scoring...');

// Load the microservice data
const dataPath = path.join(__dirname, '../../public/data/microservice-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const correlationData = data.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

console.log(`📊 Processing ${correlationData.results.length} records for YOUR_PROJECT analysis scoring...`);

function calculateYourProjectScore(record) {
  // Extract your project-specific fields
  const metric1 = Number(record.YOUR_FIELD_1) || 0;
  const metric2 = Number(record.YOUR_FIELD_2) || 0;
  const metric3 = Number(record.YOUR_FIELD_3) || 0;
  
  const totalPop = Number(record.total_population) || 0;
  const medianIncome = Number(record.median_income) || 0;
  
  let projectScore = 0;
  
  // Component 1 (40%)
  const component1Score = (metric1 / 100) * 40;
  projectScore += component1Score;
  
  // Component 2 (35%)
  const component2Score = (metric2 / 100) * 35;
  projectScore += component2Score;
  
  // Component 3 (25%)
  const component3Score = (metric3 / 100) * 25;
  projectScore += component3Score;
  
  const finalScore = Math.min(Math.max(projectScore, 0), 100);
  
  return {
    your_project_score: Math.round(finalScore * 100) / 100,
    component_1_score: Math.round(component1Score * 100) / 100,
    component_2_score: Math.round(component2Score * 100) / 100,
    component_3_score: Math.round(component3Score * 100) / 100,
    
    // Raw metrics
    your_metric_1: metric1,
    your_metric_2: metric2,
    your_metric_3: metric3
  };
}

// Process all records
let processedCount = 0;
let errorCount = 0;

const results = correlationData.results.map(record => {
  try {
    const scores = calculateYourProjectScore(record);
    processedCount++;
    return { ...record, ...scores };
  } catch (error) {
    errorCount++;
    console.warn(`⚠️  Error processing record ${record.ID || 'unknown'}: ${error.message}`);
    return record;
  }
});

console.log(`✅ YOUR_PROJECT analysis scoring completed:`);
console.log(`   📊 ${processedCount} records processed successfully`);
console.log(`   ⚠️  ${errorCount} records had errors`);

// Update and save data
const updatedData = {
  ...data,
  datasets: {
    ...data.datasets,
    correlation_analysis: { ...correlationData, results: results }
  }
};

fs.writeFileSync(dataPath, JSON.stringify(updatedData, null, 2));
console.log(`💾 Updated data saved to ${dataPath}`);

console.log('🎯 YOUR_PROJECT Analysis Scoring completed successfully!');
```

### Step 2.4: Update Brand Configuration

**Update: `lib/analysis/utils/BrandNameResolver.ts`**

```typescript
const TARGET_BRAND = {
  fieldName: 'YOUR_PRIMARY_BRAND_FIELD', // e.g., 'MP30034A_B_P'
  brandName: 'Your Primary Brand'       // e.g., 'Nike'
};

const COMPETITOR_BRANDS = [
  { fieldName: 'YOUR_COMPETITOR_1_FIELD', brandName: 'Competitor 1' },
  { fieldName: 'YOUR_COMPETITOR_2_FIELD', brandName: 'Competitor 2' },
  { fieldName: 'YOUR_COMPETITOR_3_FIELD', brandName: 'Competitor 3' }
];

const PROJECT_INDUSTRY = 'Your Industry'; // e.g., 'Athletic Footwear'
```

---

## Phase 3: ArcGIS Data Automation Pipeline

### Step 3.1: Prepare Environment

```bash
# Navigate to automation directory
cd scripts/automation

# Activate Python virtual environment
source ../venv/bin/activate

# Verify environment
python --version
pip list | grep pandas
```

### Step 3.2: Run Complete Automation Pipeline

```bash
# Run the complete automation with your project parameters
python run_complete_automation.py \
  "YOUR_ARCGIS_SERVICE_URL" \
  --project YOUR_PROJECT_NAME \
  --target YOUR_TARGET_VARIABLE
```

**Example:**
```bash
python run_complete_automation.py \
  "https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer" \
  --project athletic_brands \
  --target MP30034A_B_P
```

### Step 3.3: Monitor Automation Progress

The automation will run through 8 phases:

1. **Phase 1**: Service inspection and field analysis
2. **Phase 2**: Data extraction with parallel processing  
3. **Phase 3**: Intelligent field mapping
4. **Phase 4**: Model training (17 AI models)
5. **Phase 5**: Endpoint generation (26 analysis types)
6. **Phase 6**: Score calculation (15 algorithms)
7. **Phase 7**: Layer configuration generation
8. **Phase 8**: Blob storage upload and integration

**The automation will PAUSE at Phase 4 for microservice deployment.**

---

## Phase 4: Microservice Deployment

### Step 4.1: Prepare Microservice Package

When automation pauses, you'll see:
```
🚨 PIPELINE PAUSE: Manual Microservice Deployment Required
📦 Microservice package created at: projects/YOUR_PROJECT_NAME/microservice_package/
```

### Step 4.2: Deploy to Render.com

**Option A: Deploy from Local Files**

1. **Go to**: https://render.com
2. **Sign in** to your account
3. **Click** "New" → "Web Service"
4. **Select** "Build and deploy from a Git repository"

**Option B: Deploy via GitHub**

1. **Go to**: https://github.com
2. **Create new repository**: `your-project-microservice`
3. **Upload files** from `projects/YOUR_PROJECT_NAME/microservice_package/`
4. **Return to Render** and connect the repository

### Step 4.3: Configure Render Service

**Service Settings:**
- **Name**: `your-project-microservice`
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn -w 4 -b 0.0.0.0:$PORT app:app`
- **Auto-Deploy**: `Yes`

### Step 4.4: Wait for Deployment

1. **Monitor** the deployment logs
2. **Wait** for "Build successful" message (5-10 minutes)
3. **Copy** your service URL: `https://your-project-microservice.onrender.com`

### Step 4.5: Verify Microservice Health

```bash
# Test health endpoint
curl https://your-project-microservice.onrender.com/health

# Expected response:
# {"status": "healthy"}
```

### Step 4.6: Resume Automation

```bash
# Return to automation terminal and press Enter to continue
# The automation will complete the remaining phases automatically
```

---

## Phase 5: Post-Automation Integration

### Step 5.1: Update Environment Configuration

**Update: `.env.local`**
```bash
# Add your microservice URL
MICROSERVICE_URL=https://your-project-microservice.onrender.com

# Add blob storage token (if available)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### Step 5.2: Update Project Configuration

**Update any config files that reference microservice URLs:**

```bash
# Search for old microservice references
grep -r "microservice.*onrender" config/
grep -r "MICROSERVICE_URL" config/

# Update found files with your new URL
```

### Step 5.3: Run Post-Automation Tasks

**The automation automatically runs these, but verify completion:**

```bash
# Field mapping update (should be automatic)
python scripts/automation/semantic_field_resolver.py

# Layer categorization (should be automatic)
python scripts/automation/layer_categorization_post_processor.py

# Generate map constraints (REQUIRED - run manually)
npm run generate-map-constraints

# Upload to blob storage (automatic if token configured)
python scripts/automation/upload_comprehensive_endpoints.py
```

### Step 5.4: Update Geographic Data (if needed)

**If your project covers different geographic areas than the default:**

**Update: `lib/geo/GeoDataManager.ts`**

```typescript
// Replace with your project's geographic data
const states = [
  { name: 'YourState', abbr: 'XX', aliases: ['XX', 'State Nickname'] }
];

const cities = [
  {
    name: 'Your City',
    aliases: ['City Nickname'],
    parentCounty: 'your county',
    zipCodes: ['12345', '12346', '12347']
  }
];

// Update counties, metros, etc. to match your project area
```

---

## Phase 6: Validation and Testing

### Step 6.1: Start Application

```bash
# Start your application
npm start
# OR
npm run dev
```

### Step 6.2: Test Core Functionality

**Manual Testing:**
1. **Open** your application in browser
2. **Navigate** to different analysis pages:
   - Strategic Analysis
   - Competitive Analysis  
   - Demographic Analysis
   - Your new project-specific analysis
3. **Verify** data loads correctly
4. **Check** for error messages in browser console (F12)

### Step 6.3: Run Automated Tests

```bash
# Test routing accuracy
npm test -- __tests__/hybrid-routing-detailed.test.ts --verbose

# Test your new processor
npm test -- lib/analysis/strategies/processors/YourProjectAnalysisProcessor.test.ts

# Test random query optimization
npm test -- __tests__/hybrid-routing-random-query-optimization.test.ts --verbose
```

### Step 6.4: Validate Data Integrity

```bash
# Create a validation script for your project
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/microservice-export.json', 'utf8'));
console.log('Records:', data.datasets.correlation_analysis.results.length);
console.log('Sample record keys:', Object.keys(data.datasets.correlation_analysis.results[0]));
console.log('Your project score field present:', 
  data.datasets.correlation_analysis.results[0].your_project_score !== undefined);
"
```

### Step 6.5: Test Geographic Features

```bash
# Test geographic queries
# Open browser console and test:
# analyzeBusiness("Compare [YourCity1] vs [YourCity2]")
# analyzeBusiness("Show [YourCounty] data")
# analyzeBusiness("[YourBrand] vs [CompetitorBrand] analysis")
```

---

## Phase 7: Production Deployment

### Step 7.1: Environment Setup

```bash
# Set production environment variables
export NODE_ENV=production
export MICROSERVICE_URL=https://your-project-microservice.onrender.com

# Build production version
npm run build
```

### Step 7.2: Deploy to Production

**For Vercel:**
```bash
# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard:
# MICROSERVICE_URL=https://your-project-microservice.onrender.com
# BLOB_READ_WRITE_TOKEN=your_blob_token
```

**For other platforms:**
```bash
# Follow your platform's deployment instructions
# Ensure environment variables are set correctly
```

### Step 7.3: Production Verification

```bash
# Test production deployment
curl https://your-production-url/health
curl https://your-production-url/api/analyze

# Verify microservice connectivity
curl https://your-project-microservice.onrender.com/health
```

---

## Troubleshooting

### Common Issues and Solutions

#### **Automation Script Fails**
```bash
# Check Python environment
python --version
pip list

# Reinstall dependencies if needed
pip install -r requirements.txt

# Check for missing target variable
# Verify your target variable exists in the ArcGIS service
```

#### **Microservice Deployment Fails**
```bash
# Check Render logs for errors
# Common issues:
# - Missing requirements.txt
# - Python version mismatch
# - Port configuration issues

# Verify files in microservice package:
ls projects/YOUR_PROJECT_NAME/microservice_package/
# Should contain: app.py, requirements.txt, models/, etc.
```

#### **Application Won't Start**
```bash
# Check for TypeScript errors
npm run typecheck

# Check for missing dependencies
npm install

# Verify environment variables
echo $MICROSERVICE_URL
grep MICROSERVICE_URL .env.local
```

#### **Data Not Loading**
```bash
# Check microservice health
curl https://your-project-microservice.onrender.com/health

# Check browser console for errors (F12)
# Common issues:
# - CORS errors (microservice not responding)
# - Wrong microservice URL
# - Missing endpoint data
```

#### **Geographic Queries Failing**
```bash
# Check GeoDataManager configuration
# Verify ZIP codes match your data
# Update geographic entities for your project area

# Test geographic resolution:
node -e "
const { GeoDataManager } = require('./lib/geo/GeoDataManager.ts');
const geo = new GeoDataManager();
console.log(geo.resolveLocation('your test city'));
"
```

#### **Brand Analysis Not Working**
```bash
# Check BrandNameResolver configuration
# Verify field codes match your data

# Test brand detection:
node -e "
const resolver = require('./lib/analysis/utils/BrandNameResolver.ts');
console.log('Target brand:', resolver.getTargetBrandName());
console.log('Competitors:', resolver.getCompetitorBrands());
"
```

---

## Success Checklist

### Phase 1: Development Environment ✅
- [ ] Claude-flow configuration created
- [ ] Project-specific analysis context created  
- [ ] New analysis processor implemented
- [ ] SHAP scoring scripts created
- [ ] Brand configuration updated

### Phase 2: Automation Pipeline ✅
- [ ] Automation script ran successfully
- [ ] 26 analysis endpoints generated
- [ ] 17 AI models trained
- [ ] Microservice package created

### Phase 3: Deployment ✅
- [ ] Microservice deployed to Render
- [ ] Microservice health check passes
- [ ] Environment variables configured
- [ ] Application starts without errors

### Phase 4: Integration ✅
- [ ] Data loads correctly in all analysis pages
- [ ] Field mappings updated automatically
- [ ] Layer categorization applied  
- [ ] Map constraints generated
- [ ] Geographic data updated (if needed)

### Phase 5: Validation ✅
- [ ] Routing accuracy tests pass (100%)
- [ ] Project-specific processor tests pass
- [ ] Manual testing completed successfully
- [ ] Browser console shows no errors
- [ ] Data integrity validated

### Phase 6: Production ✅
- [ ] Production build successful
- [ ] Production deployment completed
- [ ] Production health checks pass
- [ ] End-to-end functionality verified

### Phase 7: Documentation ✅
- [ ] Project configuration documented
- [ ] Custom field mappings documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide updated

---

## Time Estimates

| Phase | Traditional | With Automation | With Claude-Flow |
|-------|-------------|-----------------|------------------|
| **Development Environment** | 2-3 weeks | 1 week | **2-3 hours** |
| **Data Integration** | 3-4 weeks | 1-2 hours | **5-10 minutes** |
| **Model Training** | 2-3 weeks | 1-2 hours | **10-15 minutes** |
| **Processor Development** | 2-3 weeks | 1 week | **1-2 hours** |
| **Testing & Validation** | 1-2 weeks | 2-3 hours | **30-45 minutes** |
| **Deployment** | 1 week | 1-2 hours | **15-20 minutes** |
| **Total** | **11-16 weeks** | **1-2 weeks** | **4-6 hours** |

### **Target Achievement: 75-85% Time Reduction**

---

**🎉 Congratulations! You now have a complete, production-ready analysis platform with AI-powered insights, automated data processing, and comprehensive visualization capabilities.**

**📚 Keep this document for future projects - simply update the project-specific parameters and follow the same workflow for consistent, rapid deployment.**