# Complete Project Setup Guide: Claude-Flow + Automation Pipeline

**Transform any ArcGIS service into a fully functional analysis platform in 30-45 minutes**

This document provides step-by-step instructions for setting up a new project using the claude-flow development acceleration system combined with the complete automation pipeline.

**What is Claude-Flow?**
Claude-flow is a **development acceleration system** that speeds up the creation of analysis processors, scoring scripts, and configurations by 75-90%. It does NOT create new architectural patterns - instead, it accelerates the development of components that work within the existing MPIQ query-to-visualization system.

## 🆕 **Latest Update: Composite Index Methodology**

**Current Project**: The Doors Documentary Market Analysis demonstrates the new **composite index approach** for complex target variable creation:

- **Problem**: Single entertainment metrics too narrow for documentary marketing
- **Solution**: Multi-dimensional "Doors Audience Score" combining 4 behavioral components
- **Result**: 27-69 score range with R² = 0.999-1.000 model performance
- **Innovation**: Automated microservice configuration and deployment

**This guide now includes composite index generation and automated microservice setup.**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Phase 1: Claude-Flow Development Environment Setup](#phase-1-claude-flow-development-environment-setup)
3. [Phase 2: Project-Specific Configuration](#phase-2-project-specific-configuration)
4. [Phase 3: ArcGIS Data Automation Pipeline (Part 1)](#phase-3-arcgis-data-automation-pipeline-part-1)
5. [Phase 4: Composite Index Generation (Optional)](#phase-4-composite-index-generation-optional)
6. [Phase 5: Automated Microservice Deployment](#phase-5-automated-microservice-deployment)
7. [Phase 6: Complete Automation Pipeline (Part 2)](#phase-6-complete-automation-pipeline-part-2)
8. [Phase 7: Post-Automation Integration](#phase-7-post-automation-integration)
9. [Phase 8: Validation and Testing](#phase-8-validation-and-testing)
10. [Phase 9: Production Deployment](#phase-9-production-deployment)
11. [Troubleshooting](#troubleshooting)
12. [Success Checklist](#success-checklist)

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

### Step 2.3: Visualization Integration (Automated)

**✅ IMPORTANT: No Manual Visualization Components Required**

The MPIQ platform uses a sophisticated **query-to-visualization system** that automatically handles all visualization needs. The automation pipeline will:

1. **Auto-generate layer configurations** based on your analysis context
2. **Create appropriate renderers** for your data visualization 
3. **Configure popup templates** with relevant field information
4. **Set up interactive features** through the existing LayerController system

**What the automation provides automatically:**
- ✅ **Hexagonal grid visualization** with your project-specific color schemes
- ✅ **Interactive popups** showing analysis results and metrics
- ✅ **Dynamic legends** with score ranges and descriptions
- ✅ **Click handlers** for detailed analysis panels
- ✅ **Layer controls** for toggling visibility and opacity
- ✅ **Filtering capabilities** based on score ranges or geographic areas

**No React components need to be manually created** - the existing system handles all visualization through configuration-driven layers that integrate seamlessly with the query system.

**Next Step:** The automation pipeline will generate all necessary layer configurations and visualization elements based on your analysis context defined in Step 1.3.

### Step 2.4: Create SHAP-Based Scoring Scripts

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

## Phase 3: ArcGIS Data Automation Pipeline (Part 1)

**This phase runs BEFORE microservice deployment and PAUSES for manual deployment.**

### Step 3.0: Clean Up Previous Projects (Required)

**IMPORTANT: Clean up old project files before starting new automation to reduce app size**

```bash
# Navigate to project root
cd /path/to/your/mpiq-ai-chat

# Remove old project directories (keep only current project)
# Example: Keep only the project you're currently working on
rm -rf projects/old_project_1 projects/old_project_2 projects/test_* projects/*_v2 projects/*_v3

# Remove backup files to free up space
find . -name "*.backup*" -type f -delete

# Check space saved
du -sh projects/ 2>/dev/null || echo "Projects directory cleaned"
```

**Benefits:**
- Reduces app size significantly (can save 100+ MB)
- Prevents accumulation of old automation artifacts
- Maintains clean project structure
- Old app versions are already saved elsewhere

**What gets removed:**
- ✅ Old project directories with extracted data
- ✅ Backup endpoint files (*.backup.json)
- ✅ Previous automation logs and artifacts
- ✅ Duplicate project versions (_v2, _v3, test_*)

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

**Example - Single Target Variable:**
```bash
python run_complete_automation.py \
  "https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer" \
  --project athletic_brands \
  --target MP30034A_B_P
```

**Example - Composite Index (Current Best Practice):**
```bash
# The Doors Documentary approach - first run automation to extract data
python run_complete_automation.py \
  "https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer" \
  --project doors_documentary \
  --target entertainment_score  # Will fail but extract data

# Then proceed to Phase 4 for composite index generation
```

### Step 3.3: Monitor Automation Progress (Part 1)

The automation will run through initial phases then **PAUSE for microservice deployment**:

1. **Phase 1**: Service inspection and field analysis  
2. **Phase 2**: Data extraction with parallel processing (11,584+ records)
3. **Phase 3**: Intelligent field mapping (auto-discovers 120+ layers)
4. **Phase 4**: Model training and microservice package creation

**⚠️ AUTOMATION PAUSES HERE**
```
🚨 PIPELINE PAUSE: Manual Microservice Deployment Required
📦 Microservice package created at: projects/YOUR_PROJECT_NAME/microservice_package/
```

**If target variable not found**: Proceed to Phase 4 for composite index generation first  
**If target exists**: Automation continues to model training, then pauses

---

## Phase 4: Composite Index Generation (Optional)

### When to Use Composite Index

**Use composite index when:**
- Single variables are too narrow for complex analysis
- You need multi-dimensional audience scoring
- Business objectives require sophisticated market segmentation
- Target audience has multiple behavioral components

**Example**: The Doors Documentary needed to combine:
- Classic Rock Affinity (40%) - Genre alignment
- Documentary Engagement (25%) - Format preference  
- Music Consumption (20%) - Platform behavior
- Cultural Engagement (15%) - Entertainment seeking

### Step 4.1: Create Project-Specific Composite Index Generator

**Create**: `scripts/automation/generate_PROJECT_composite_index.py`

**Template** (adapt from Doors Documentary approach):

```python
#!/usr/bin/env python3
"""
PROJECT_NAME Composite Index Generator

Creates a composite index scoring markets for PROJECT_OBJECTIVE
by combining multiple PROJECT_RELEVANT behavioral indicators.

Composite Index Formula:
- Component 1 (X%): Description
- Component 2 (Y%): Description  
- Component 3 (Z%): Description
- Component 4 (W%): Description

Output: project_target_score (0-100 scale)
"""

import pandas as pd
import numpy as np
from pathlib import Path
import json
import logging
from typing import Dict, List, Optional

class ProjectCompositeIndexGenerator:
    """Generate PROJECT_NAME Composite Score"""
    
    def __init__(self, project_path: str):
        self.project_path = Path(project_path)
        self.data_file = self.project_path / "merged_dataset.csv"
        self.output_file = self.project_path / "project_composite_data.csv"
        
        # Component field mappings with weights
        self.index_components = {
            "component_1": {
                "weight": 0.40,  # Adjust based on importance
                "fields": [
                    # Add your relevant field codes here
                ]
            },
            "component_2": {
                "weight": 0.25,
                "fields": [
                    # Add your relevant field codes here
                ]
            },
            # Add more components as needed
        }
    
    # ... (rest of implementation follows Doors Documentary pattern)
```

### Step 4.2: Run Composite Index Generation

```bash
# Generate your project's composite index
cd scripts/automation
source ../venv/bin/activate
python generate_PROJECT_composite_index.py /path/to/projects/PROJECT_NAME

# Output:
# 🎯 PROJECT Composite Score Generated!
# 📁 Enhanced dataset: projects/PROJECT_NAME/project_composite_data.csv
# 🎯 Target variable: project_target_score
```

### Step 4.3: Replace Dataset and Continue Automation

```bash
# Replace merged dataset with composite-enhanced version
cd projects/PROJECT_NAME
cp project_composite_data.csv merged_dataset.csv

# Continue with model training using composite target
cd ../../scripts/automation
python automated_model_trainer.py ../projects/PROJECT_NAME/merged_dataset.csv --target project_target_score
```

---

## Phase 5: Automated Microservice Deployment

### Current State: Manual Process (Improving to Full Automation)

**The user identified this process as "hacky and disjointed" and requested automation of these steps:**
1. Copy data to shap-microservice
2. Update configuration
3. Project-specific file updates

### Step 5.1: Automated Microservice Configuration (New)

**Create: `scripts/automation/configure_microservice.py`**

```python
#!/usr/bin/env python3
"""
Automated Microservice Configuration Script

Automates the previously manual steps:
1. Copy data to shap-microservice
2. Update project configuration 
3. Handle YAML and other project-specific files
4. Prepare for deployment

Usage: python configure_microservice.py PROJECT_NAME TARGET_VARIABLE
"""

import os
import shutil
import json
from pathlib import Path
import argparse
import logging

class MicroserviceConfigurator:
    def __init__(self, project_name: str, target_variable: str):
        self.project_name = project_name
        self.target_variable = target_variable
        
        # Paths
        self.mpiq_root = Path(__file__).parent.parent.parent
        self.project_path = self.mpiq_root / "projects" / project_name
        self.microservice_path = self.mpiq_root.parent / "shap-microservice"
        
        # Verify paths exist
        if not self.project_path.exists():
            raise FileNotFoundError(f"Project not found: {self.project_path}")
        if not self.microservice_path.exists():
            raise FileNotFoundError(f"Microservice not found: {self.microservice_path}")
    
    def copy_training_data(self):
        """Copy enhanced dataset to microservice"""
        source_data = self.project_path / "microservice_package" / "data" / "training_data.csv"
        target_data = self.microservice_path / "data" / "training_data.csv"
        
        if not source_data.exists():
            # Fallback to merged dataset
            source_data = self.project_path / "merged_dataset.csv"
        
        print(f"📋 Copying training data: {source_data} -> {target_data}")
        shutil.copy2(source_data, target_data)
        
        # Verify target variable exists in data
        with open(target_data, 'r') as f:
            headers = f.readline().strip().split(',')
            if self.target_variable not in headers:
                print(f"⚠️  Warning: Target variable '{self.target_variable}' not found in data headers")
                print(f"   Available columns: {', '.join(headers[:10])}...")
    
    def update_project_config(self):
        """Update microservice project configuration"""
        config_file = self.microservice_path / "project_config.py"
        
        if not config_file.exists():
            print(f"⚠️  project_config.py not found, creating...")
            self.create_project_config()
            return
        
        # Read current config
        with open(config_file, 'r') as f:
            content = f.read()
        
        # Update target variable
        import re
        content = re.sub(
            r'TARGET_VARIABLE:\s*str\s*=\s*["\'][^"\']*["\']',
            f'TARGET_VARIABLE: str = "{self.target_variable}"',
            content
        )
        
        # Update project name and description
        project_display = self.project_name.replace('_', ' ').title()
        content = re.sub(
            r'PROJECT_NAME\s*=\s*["\'][^"\']*["\']',
            f'PROJECT_NAME = "{project_display} Analysis"',
            content
        )
        
        content = re.sub(
            r'PROJECT_DESCRIPTION\s*=\s*["\'][^"\']*["\']',
            f'PROJECT_DESCRIPTION = "AI-powered analysis for {project_display} market optimization"',
            content
        )
        
        with open(config_file, 'w') as f:
            f.write(content)
        
        print(f"✅ Updated project configuration")
    
    def create_project_config(self):
        """Create project configuration if it doesn't exist"""
        config_file = self.microservice_path / "project_config.py"
        project_display = self.project_name.replace('_', ' ').title()
        
        config_content = f'''# Project Configuration
TARGET_VARIABLE: str = "{self.target_variable}"
PROJECT_NAME = "{project_display} Analysis"
PROJECT_DESCRIPTION = "AI-powered analysis for {project_display} market optimization"

# Model Configuration
MODELS_TO_TRAIN = [
    "linear_regression", "lasso_regression", "ridge_regression",
    "random_forest", "xgboost", "neural_network", "knn", "svr"
]

# Feature Selection
MAX_FEATURES = 50
FEATURE_SELECTION_METHOD = "shap"

# Training Configuration
TEST_SIZE = 0.2
VALIDATION_SIZE = 0.2
RANDOM_STATE = 42
'''
        
        with open(config_file, 'w') as f:
            f.write(config_content)
        
        print(f"✅ Created project configuration")
    
    def update_yaml_files(self):
        """Update YAML configuration files"""
        yaml_files = list(self.microservice_path.glob("*.yml")) + list(self.microservice_path.glob("*.yaml"))
        
        for yaml_file in yaml_files:
            print(f"📝 Updating YAML file: {yaml_file.name}")
            
            with open(yaml_file, 'r') as f:
                content = f.read()
            
            # Update common YAML fields
            import re
            content = re.sub(r'name:\s*.*', f'name: {self.project_name}-microservice', content)
            content = re.sub(r'TARGET_VARIABLE:\s*.*', f'TARGET_VARIABLE: {self.target_variable}', content)
            
            with open(yaml_file, 'w') as f:
                f.write(content)
    
    def copy_models(self):
        """Copy trained models if they exist"""
        source_models = self.project_path / "microservice_package" / "trained_models"
        target_models = self.microservice_path / "models"
        
        if source_models.exists():
            if target_models.exists():
                shutil.rmtree(target_models)
            shutil.copytree(source_models, target_models)
            print(f"✅ Copied trained models")
        else:
            print(f"ℹ️  No trained models found to copy")
    
    def run_configuration(self):
        """Run complete microservice configuration"""
        print(f"🚀 Configuring microservice for {self.project_name}...")
        print(f"   Target Variable: {self.target_variable}")
        print(f"   Microservice Path: {self.microservice_path}")
        
        try:
            self.copy_training_data()
            self.update_project_config()
            self.update_yaml_files()
            self.copy_models()
            
            print(f"\n✅ Microservice configuration completed!")
            print(f"📁 Ready for deployment from: {self.microservice_path}")
            print(f"\nNext steps:")
            print(f"  1. cd {self.microservice_path}")
            print(f"  2. Test locally: python -m uvicorn main:app --reload")
            print(f"  3. Deploy to production: git add . && git commit -m 'Deploy {self.project_name}' && git push")
            
        except Exception as e:
            print(f"❌ Configuration failed: {e}")
            raise

def main():
    parser = argparse.ArgumentParser(description="Configure microservice for deployment")
    parser.add_argument("project_name", help="Project name (e.g., doors_documentary)")
    parser.add_argument("target_variable", help="Target variable name (e.g., doors_audience_score)")
    
    args = parser.parse_args()
    
    configurator = MicroserviceConfigurator(args.project_name, args.target_variable)
    configurator.run_configuration()

if __name__ == "__main__":
    main()
```

### Step 5.2: Usage - Automated Configuration

```bash
# Navigate to automation directory
cd scripts/automation

# Run automated microservice configuration
python configure_microservice.py doors_documentary doors_audience_score

# Expected output:
# 🚀 Configuring microservice for doors_documentary...
# 📋 Copying training data: projects/doors_documentary/microservice_package/data/training_data.csv -> ../shap-microservice/data/training_data.csv
# ✅ Updated project configuration
# 📝 Updating YAML file: deploy.yml
# ✅ Copied trained models
# ✅ Microservice configuration completed!
```

### Step 5.3: Deploy to Render Using Blueprint

**Render automatically detects the `render.yaml` blueprint file and deploys accordingly.**

```bash
# Navigate to microservice directory  
cd /path/to/shap-microservice

# Verify render.yaml exists and is configured
cat render.yaml

# Expected YAML structure:
# services:
#   - type: web
#     name: your-project-microservice
#     env: python
#     plan: starter
#     startCommand: gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --threads 4 --timeout 180
#     buildCommand: pip install -r requirements_py313.txt

# Deploy to production (triggers automatic Blueprint deployment)
git add .
git commit -m "Deploy your_project microservice - automated configuration"
git push origin main
```

### Step 5.4: Render Blueprint Deployment Process

**Render will automatically:**

1. **Detect Blueprint**: Render reads `render.yaml` from your repository root
2. **Create Services**: Automatically provisions web service and worker (if configured)
3. **Install Dependencies**: Runs `buildCommand` from YAML (pip install requirements)
4. **Start Application**: Executes `startCommand` from YAML (gunicorn with specified settings)
5. **Configure Environment**: Sets environment variables defined in YAML

**⚠️ IMPORTANT: Microservice Usage**
- **The deployed microservice is used ONLY during automation setup**
- **It exports data to JSON files that the main app reads**
- **The main app does NOT make API calls to the microservice**
- **Keep microservice deployed for future data updates/re-training**

**Go to Render Dashboard:**

1. **Visit**: https://dashboard.render.com
2. **Connect Repository**: Click "New" → "Blueprint"
3. **Select Repository**: Choose your `project-microservice` repository
4. **Review Configuration**: Render shows services from `render.yaml`
5. **Deploy**: Click "Create Services" - deployment starts automatically

**Monitor Deployment:**
- **Build Logs**: Shows dependency installation progress
- **Deploy Logs**: Shows application startup
- **Service URL**: Provided once deployment completes
- **Expected URL**: `https://your-project-microservice.onrender.com`

### Step 5.5: Create Project-Specific GitHub Repository

**IMPORTANT: Each project needs its own microservice repository to avoid overwriting existing deployments.**

```bash
# Create new GitHub repository for your project
# Example repository names:
# - doors-documentary-microservice
# - athletic-brands-microservice  
# - your-project-microservice

# You need to:
# 1. Go to https://github.com and create a new repository
# 2. Use naming convention: [project-name]-microservice
# 3. Make it public (for Render free tier) or private (with paid plan)
# 4. Do NOT initialize with README, .gitignore, or license
```

**Example repositories:**
- Doors Documentary: `https://github.com/eastgrand/doc-microservice.git`
- Athletic Brands: `https://github.com/eastgrand/athletic-microservice.git`
- Real Estate: `https://github.com/eastgrand/real-estate-microservice.git`

### Step 5.6: Update Microservice Git Remote

```bash
# Navigate to microservice directory
cd /path/to/shap-microservice  # or your microservice directory

# Update git remote to new project-specific repository
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_PROJECT-microservice.git

# Verify the remote was updated
git remote -v
# Should show: origin https://github.com/YOUR_USERNAME/YOUR_PROJECT-microservice.git
```

### Step 5.7: Integration with Main Automation

**Update: `scripts/automation/run_complete_automation.py`**

```python
# Add to the end of the automation pipeline
if microservice_package_created:
    print("\n🤖 Running automated microservice configuration...")
    
    import subprocess
    result = subprocess.run([
        "python", "configure_microservice.py", 
        project_name, target_variable
    ], capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ Microservice automatically configured!")
        print(result.stdout)
        
        # Prompt for GitHub repository URL
        print("\n📝 Next: Set up project-specific GitHub repository")
        print("   1. Create new repository: https://github.com/new")
        print("   2. Use name: {}-microservice".format(project_name))
        print("   3. Update git remote in microservice directory")
    else:
        print("⚠️  Automated configuration failed, falling back to manual process")
        print(result.stderr)
```

---

## Phase 6: Complete Automation Pipeline (Part 2)

**This phase runs AFTER microservice deployment to complete the automation.**

### Understanding the Automation Flow

1. **Part 1** (Phase 3): Extract data → Train models → Create package → **PAUSE**
2. **Manual** (Phase 5): Deploy microservice to Render
3. **Part 2** (Phase 6): Generate endpoints → Export JSON → Complete setup

## Phase 7: Post-Automation Integration

### Understanding the Microservice Role

**IMPORTANT: The microservice is deployed to Render but is NOT directly called by the main application.**

**How it works:**
1. **Microservice exports data** → JSON files (`microservice-export.json`)
2. **JSON files stored** → `public/data/` directory in main app
3. **Main app reads** → JSON files directly (no API calls to microservice)
4. **Microservice remains deployed** → For future data updates/re-training

**The microservice serves as a data processing pipeline, not a runtime dependency.**

### Step 7.1: Export Microservice Data to Main App

```bash
# After microservice deployment, export data to main app
cd /path/to/your/mpiq-ai-chat

# The automation pipeline should have already created these files:
# - public/data/microservice-export.json (main analysis data)
# - public/data/endpoints/*.json (26 analysis endpoints)
# - public/data/blob-urls.json (URLs for large datasets)

# Verify the export exists
ls -la public/data/microservice-export.json

# Check that your target variable is in the exported data
grep "doors_audience_score" public/data/microservice-export.json | head -1
```

### Step 7.2: Update Environment Configuration

**Update: `.env.local`**
```bash
# Note: MICROSERVICE_URL is NOT needed for runtime
# The app uses exported JSON files, not live API calls

# Add blob storage token (if available) for large datasets
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### Step 7.3: Verify Data Export Integration

```bash
# Verify all required data files are present
ls -la public/data/microservice-export.json
ls -la public/data/endpoints/*.json
ls -la public/data/blob-urls.json

# Check data structure
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/microservice-export.json', 'utf8'));
console.log('Datasets available:', Object.keys(data.datasets));
console.log('Total records:', data.datasets.correlation_analysis.results.length);
"
```

### Step 6.1: Continue Automation After Microservice Deployment

**After the microservice is deployed to Render, continue the automation pipeline:**

```bash
# Navigate to automation directory
cd scripts/automation

# Step 1: Generate comprehensive endpoints from trained models
python endpoint_generator.py \
  ../../projects/doors_documentary/trained_models \
  ../../projects/doors_documentary/merged_dataset.csv \
  ../../projects/doors_documentary/generated_endpoints

# Step 2: Export microservice data to JSON format
cd ../..
python scripts/export-complete-dataset.py

# Step 3: Run scoring scripts to generate analysis scores
bash scripts/run-complete-scoring.sh

# Step 4: Generate layer configurations
cd scripts/automation
python layer_config_generator.py \
  "https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer" \
  --project doors_documentary

# Step 5: Run post-automation field mapping
python semantic_field_resolver.py

# Step 6: Run layer categorization
python layer_categorization_post_processor.py

# Step 7: Generate map constraints
cd ../..
npm run generate-map-constraints

# Step 8: Upload to blob storage (if configured)
cd scripts/automation
python upload_comprehensive_endpoints.py
```

### Step 7.4: Update Geographic Data (if needed)

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

## Phase 8: Validation and Testing

### Step 8.1: Start Application

```bash
# Start your application
npm start
# OR
npm run dev
```

### Step 8.2: Test Core Functionality

**Manual Testing:**
1. **Open** your application in browser
2. **Navigate** to different analysis pages:
   - Strategic Analysis
   - Competitive Analysis  
   - Demographic Analysis
   - Your new project-specific analysis
3. **Verify** data loads correctly
4. **Check** for error messages in browser console (F12)

### Step 8.3: Run Automated Tests

```bash
# Test routing accuracy
npm test -- __tests__/hybrid-routing-detailed.test.ts --verbose

# Test your new processor
npm test -- lib/analysis/strategies/processors/YourProjectAnalysisProcessor.test.ts

# Test random query optimization
npm test -- __tests__/hybrid-routing-random-query-optimization.test.ts --verbose
```

### Step 8.4: Validate Data Integrity

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

### Step 8.5: Test Geographic Features

```bash
# Test geographic queries
# Open browser console and test:
# analyzeBusiness("Compare [YourCity1] vs [YourCity2]")
# analyzeBusiness("Show [YourCounty] data")
# analyzeBusiness("[YourBrand] vs [CompetitorBrand] analysis")
```

---

## Phase 9: Production Deployment

### Step 9.1: Environment Setup

```bash
# Set production environment variables
export NODE_ENV=production
# Note: MICROSERVICE_URL not needed - app uses JSON exports

# Build production version
npm run build
```

### Step 9.2: Deploy to Production

**For Vercel:**
```bash
# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard:
# BLOB_READ_WRITE_TOKEN=your_blob_token
# (NO MICROSERVICE_URL needed)
```

**For other platforms:**
```bash
# Follow your platform's deployment instructions
# Only set blob storage token if using large datasets
```

### Step 9.3: Production Verification

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

#### **App Size Too Large / Performance Issues**
```bash
# Clean up old projects and backups (can save 100+ MB)
rm -rf projects/old_project_* projects/*_v2 projects/*_v3 projects/test_*
find . -name "*.backup*" -type f -delete

# Check current project size
du -sh projects/
du -sh .

# This cleanup should be done before every new project
# See Step 3.0 in Phase 3 for details
```

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
- [ ] **OLD PROJECTS CLEANED UP** (Step 3.0 - saves 100+ MB)
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