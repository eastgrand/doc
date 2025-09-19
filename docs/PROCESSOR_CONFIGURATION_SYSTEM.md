# Processor Configuration System Implementation Plan

## Overview

Currently, our analysis processors are hardcoded for retail/brand competition scenarios. This document outlines a plan to make all processors configurable and reusable across different project types (retail, real estate, demographics, etc.) without modifying the core processor logic.

## Current State

### Existing Processors

- `ComparativeAnalysisProcessor` - Brand vs brand comparison
- `CompetitiveAnalysisProcessor` - Market competition analysis  
- `DemographicDataProcessor` - Population characteristics
- `StrategicAnalysisProcessor` - Strategic market insights
- `TrendAnalysisProcessor` - Temporal trend analysis
- `SpatialClustersProcessor` - Geographic clustering
- `EnsembleAnalysisProcessor` - Combined analysis methods
- `BrandDifferenceProcessor` - Brand differentiation analysis
- `ConsensusAnalysisProcessor` - Multi-method consensus
- `CustomerProfileProcessor` - Customer segmentation

### Current Project Types

- **Retail/Brand Competition** (current default)
  - Focus on brand market share, competitive advantages
  - Metrics: brand_a_share, brand_b_share, competitive_advantage_score
  - Language: "Brand A vs Brand B", "market dominance", "competitive positioning"

## Proposed Architecture

### 1. Configuration Structure

```typescript
// config/analysis-contexts.ts
export interface AnalysisContext {
  projectType: 'retail' | 'real-estate' | 'demographics' | 'healthcare' | 'finance';
  domain: string;
  
  // Field mappings for data extraction
  fieldMappings: {
    primaryMetric: string[];        // Priority order for main score
    secondaryMetrics: string[];     // Supporting metrics
    populationField: string[];      // Population/size indicators
    incomeField: string[];         // Income/value indicators
    geographicId: string[];        // Area identifier fields
    descriptiveFields: string[];   // Human-readable descriptions
  };
  
  // Display and messaging
  terminology: {
    entityType: string;            // "areas", "markets", "regions", "stores"
    metricName: string;           // "performance", "income", "market share"
    scoreDescription: string;     // What the score represents
    comparisonContext: string;    // What we're comparing
  };
  
  // Score interpretation thresholds and meanings
  scoreRanges: {
    excellent: { min: number; description: string; actionable: string; };
    good: { min: number; description: string; actionable: string; };
    moderate: { min: number; description: string; actionable: string; };
    poor: { min: number; description: string; actionable: string; };
  };
  
  // Summary templates with placeholders
  summaryTemplates: {
    analysisTitle: string;
    methodologyExplanation: string;
    insightPatterns: string[];
    recommendationPatterns: string[];
  };
  
  // Processor-specific configurations
  processorConfig: {
    comparative?: ComparativeConfig;
    competitive?: CompetitiveConfig;
    demographic?: DemographicConfig;
    strategic?: StrategicConfig;
    trend?: TrendConfig;
    spatial?: SpatialConfig;
    ensemble?: EnsembleConfig;
  };
}

interface ComparativeConfig {
  comparisonType: 'geographic' | 'temporal' | 'categorical';
  groupingStrategy: 'city' | 'region' | 'store' | 'timeframe';
  normalizationMethod: 'global' | 'grouped' | 'percentile';
  entityLabels: { primary: string; secondary: string; };
}

// Similar interfaces for other processor types...
```

### 2. Project Type Configurations

#### Real Estate Configuration

```typescript
export const REAL_ESTATE_CONTEXT: AnalysisContext = {
  projectType: 'real-estate',
  domain: 'Quebec Housing Market Analysis',
  
  fieldMappings: {
    primaryMetric: ['thematic_value', 'ECYHRIAVG', 'household_income', 'value'],
    secondaryMetrics: ['ECYCDOOWCO', 'ECYPTAPOP', 'population', 'total_population'],
    populationField: ['ECYPTAPOP', 'population', 'total_population'],
    incomeField: ['ECYHRIAVG', 'household_income', 'median_income'],
    geographicId: ['ID', 'FSA_ID', 'area_id', 'zipcode'],
    descriptiveFields: ['DESCRIPTION', 'area_name', 'name']
  },
  
  terminology: {
    entityType: 'geographic areas',
    metricName: 'household income levels',
    scoreDescription: 'economic prosperity and housing market strength',
    comparisonContext: 'regional housing market performance'
  },
  
  scoreRanges: {
    excellent: { 
      min: 75, 
      description: 'Premium housing markets with exceptional economic indicators',
      actionable: 'Ideal for luxury developments and high-end investments'
    },
    good: { 
      min: 50, 
      description: 'Strong housing markets with above-average economic performance',
      actionable: 'Suitable for quality residential projects and solid investments'
    },
    moderate: { 
      min: 25, 
      description: 'Developing housing markets with moderate economic activity',
      actionable: 'Opportunities for affordable housing and emerging market strategies'
    },
    poor: { 
      min: 0, 
      description: 'Challenging markets requiring development or revitalization',
      actionable: 'Consider government partnerships or community development initiatives'
    }
  },
  
  summaryTemplates: {
    analysisTitle: '🏠 Real Estate Market Comparative Analysis',
    methodologyExplanation: 'This analysis compares {metricName} across {entityType} using household income and demographic data on a unified 0-100 scale.',
    insightPatterns: [
      'Average household income across analyzed {entityType}: ${avgIncome}',
      '{cityCount} cities analyzed with {totalAreas} total {entityType}',
      'Income distribution shows {distributionPattern} across regions'
    ],
    recommendationPatterns: [
      '{excellentCount} {entityType} identified for premium real estate development',
      '{goodCount} {entityType} suitable for standard residential projects',
      '{moderateCount} {entityType} present affordable housing opportunities',
      '{poorCount} {entityType} may benefit from revitalization initiatives'
    ]
  },
  
  processorConfig: {
    comparative: {
      comparisonType: 'geographic',
      groupingStrategy: 'city',
      normalizationMethod: 'global',
      entityLabels: { primary: 'Montreal', secondary: 'Quebec City' }
    },
    demographic: {
      focusMetrics: ['household_income', 'population_density', 'age_distribution'],
      segmentationCriteria: 'income_quintiles'
    }
  }
};
```

#### Retail Configuration  

```typescript
export const RETAIL_CONTEXT: AnalysisContext = {
  projectType: 'retail',
  domain: 'Brand Competition Analysis',
  
  fieldMappings: {
    primaryMetric: ['competitive_advantage_score', 'brand_performance_gap', 'comparison_score'],
    secondaryMetrics: ['brand_a_share', 'brand_b_share', 'market_penetration'],
    populationField: ['total_population', 'market_size', 'customer_base'],
    incomeField: ['median_income', 'spending_power', 'disposable_income'],
    geographicId: ['ID', 'store_id', 'market_id', 'zipcode'],
    descriptiveFields: ['DESCRIPTION', 'market_name', 'store_name']
  },
  
  terminology: {
    entityType: 'markets',
    metricName: 'competitive positioning',
    scoreDescription: 'brand performance and market advantage',
    comparisonContext: 'brand competition and market dynamics'
  },
  
  // ... similar structure with retail-specific content
};
```

## Implementation Plan

### Phase 1: Configuration Infrastructure (Week 1)

1. **Create Configuration Files**

   ```
   /config/analysis-contexts/
   ├── index.ts                    # Export all contexts
   ├── real-estate-context.ts      # Real estate configuration
   ├── retail-context.ts           # Retail/brand configuration  
   ├── demographic-context.ts      # Demographics configuration
   └── base-context.ts             # Base interfaces and types
   ```

2. **Add Configuration Manager**

   ```typescript
   // lib/analysis/ConfigurationManager.ts
   export class AnalysisConfigurationManager {
     private static instance: AnalysisConfigurationManager;
     private currentContext: AnalysisContext;
     
     static getInstance(): AnalysisConfigurationManager;
     setProjectType(projectType: string): void;
     getCurrentContext(): AnalysisContext;
     getFieldMapping(category: string): string[];
     getTerminology(): TerminologyConfig;
     getScoreInterpretation(score: number): ScoreRange;
   }
   ```

### Phase 2: Processor Refactoring (Week 2-3)

Modify each processor to use configuration instead of hardcoded values:

#### 2.1 Base Processor Class

```typescript
// lib/analysis/strategies/processors/BaseProcessor.ts
export abstract class BaseProcessor implements DataProcessorStrategy {
  protected config: AnalysisContext;
  protected configManager: AnalysisConfigurationManager;
  
  constructor() {
    this.configManager = AnalysisConfigurationManager.getInstance();
    this.config = this.configManager.getCurrentContext();
  }
  
  // Common methods all processors can use
  protected extractPrimaryMetric(record: any): number;
  protected extractSecondaryMetrics(record: any): Record<string, number>;
  protected generateAreaName(record: any): string;
  protected getScoreInterpretation(score: number): string;
  protected buildSummaryFromTemplate(templateKey: string, data: any): string;
}
```

#### 2.2 Update Each Processor

**Files to modify:**

- `ComparativeAnalysisProcessor.ts`
- `CompetitiveAnalysisProcessor.ts`
- `DemographicDataProcessor.ts`
- `StrategicAnalysisProcessor.ts`
- `TrendAnalysisProcessor.ts`
- `SpatialClustersProcessor.ts`
- `EnsembleAnalysisProcessor.ts`
- `BrandDifferenceProcessor.ts`
- `ConsensusAnalysisProcessor.ts`
- `CustomerProfileProcessor.ts`

**Key changes for each processor:**

1. Extend `BaseProcessor` instead of standalone implementation
2. Replace hardcoded field names with `config.fieldMappings.*`
3. Replace hardcoded terminology with `config.terminology.*`
4. Use template system for summary generation
5. Use configuration-driven score interpretation

### Phase 3: Project Type Switching (Week 4)

1. **Environment Detection**

   ```typescript
   // utils/project-detection.ts
   export function detectProjectType(): string {
     // Check environment variables first
     if (process.env.PROJECT_TYPE) {
       return process.env.PROJECT_TYPE;
     }
     
     // Check configuration file
     const projectConfig = require('../config/project.json');
     return projectConfig.type || 'retail'; // default fallback
   }
   ```

2. **Initialization System**

   ```typescript
   // lib/analysis/AnalysisEngine.ts - modify constructor
   constructor(config?: AnalysisEngineConfig) {
     // ... existing code
     
     // Set project type from config or environment
     const projectType = config?.projectType || detectProjectType();
     AnalysisConfigurationManager.getInstance().setProjectType(projectType);
   }
   ```

3. **Runtime Configuration**

   ```typescript
   // Add to API routes for manual override
   app.post('/api/claude/housing-generate-response', (req, res) => {
     const projectType = req.body.metadata?.projectType || 'real-estate';
     AnalysisConfigurationManager.getInstance().setProjectType(projectType);
     // ... continue with processing
   });
   ```

## Adding New Project Types

### Step-by-Step Guide

#### 1. Create Project Configuration

```typescript
// config/analysis-contexts/new-project-context.ts
export const NEW_PROJECT_CONTEXT: AnalysisContext = {
  projectType: 'new-project',
  domain: 'Your Domain Description',
  
  fieldMappings: {
    // Map your data fields to standard categories
    primaryMetric: ['your_main_score_field', 'backup_field'],
    secondaryMetrics: ['supporting_field_1', 'supporting_field_2'],
    // ... etc
  },
  
  terminology: {
    entityType: 'your_entities',        // e.g., "hospitals", "schools", "districts"
    metricName: 'your_metric',          // e.g., "patient satisfaction", "test scores"
    scoreDescription: 'what_it_means',  // e.g., "educational quality"
    comparisonContext: 'comparison_focus' // e.g., "academic performance"
  },
  
  // Define score ranges meaningful to your domain
  scoreRanges: {
    excellent: { min: 80, description: '...', actionable: '...' },
    // ... etc
  },
  
  // Create domain-specific summary templates
  summaryTemplates: {
    analysisTitle: '📊 Your Domain Analysis',
    methodologyExplanation: 'Explain how analysis works in your domain...',
    insightPatterns: ['Pattern 1: {data}', 'Pattern 2: {data}'],
    recommendationPatterns: ['Recommendation 1', 'Recommendation 2']
  },
  
  // Configure processor-specific behavior
  processorConfig: {
    comparative: {
      comparisonType: 'geographic', // or 'temporal', 'categorical'
      groupingStrategy: 'your_grouping', // how to group entities
      normalizationMethod: 'global', // or 'grouped', 'percentile'
      entityLabels: { primary: 'Group A', secondary: 'Group B' }
    }
    // ... other processor configs as needed
  }
};
```

#### 2. Register the New Project Type

```typescript
// config/analysis-contexts/index.ts
import { NEW_PROJECT_CONTEXT } from './new-project-context';

export const ANALYSIS_CONTEXTS: Record<string, AnalysisContext> = {
  'retail': RETAIL_CONTEXT,
  'real-estate': REAL_ESTATE_CONTEXT,
  'new-project': NEW_PROJECT_CONTEXT,  // Add your new context
};

export type ProjectType = 'retail' | 'real-estate' | 'new-project';
```

#### 3. Update TypeScript Types

```typescript
// lib/analysis/types.ts
export type SupportedProjectTypes = 'retail' | 'real-estate' | 'new-project';
```

#### 4. Test Your Configuration

```typescript
// Create test file: __tests__/new-project-analysis.test.ts
describe('New Project Analysis', () => {
  beforeEach(() => {
    AnalysisConfigurationManager.getInstance().setProjectType('new-project');
  });
  
  test('should use correct field mappings', () => {
    // Test that your field mappings work correctly
  });
  
  test('should generate appropriate summaries', () => {
    // Test that summaries use your terminology
  });
});
```

#### 5. Environment Configuration

Add to your deployment configuration:

```bash
# .env or deployment config
PROJECT_TYPE=new-project
```

Or via API calls:

```typescript
// In your API route
const projectType = req.body.metadata?.projectType || 'new-project';
AnalysisConfigurationManager.getInstance().setProjectType(projectType);
```

### Files That Need Modification for New Project Types

#### Required Changes

1. **Configuration Files**
   - `/config/analysis-contexts/new-project-context.ts` (create)
   - `/config/analysis-contexts/index.ts` (register new type)

2. **Type Definitions**
   - `/lib/analysis/types.ts` (add to ProjectType union)

3. **Tests**
   - `/__tests__/new-project-*.test.ts` (create test suite)

#### Optional Changes

1. **Processor-Specific Logic**
   - Only if your domain needs special processing logic
   - Add to `processorConfig` section of your context
   - Override specific methods in processors if needed

2. **Custom Field Extractors**
   - Only if standard field mapping isn't sufficient
   - Create domain-specific field extraction logic

3. **Visualization Customization**
   - Modify renderer configurations for domain-specific visualizations
   - Update legend and color schemes if needed

## Benefits of This Approach

1. **Reusability**: Processors work across all project types without modification
2. **Maintainability**: Single source of truth for project-specific configurations  
3. **Extensibility**: Easy to add new project types without touching core logic
4. **Consistency**: All processors use the same configuration system
5. **Testability**: Each project type can be tested independently
6. **Flexibility**: Runtime project type switching for multi-tenant scenarios

## Migration Strategy

1. **Phase 1**: Implement configuration infrastructure without breaking changes
2. **Phase 2**: Migrate processors one by one, maintaining backward compatibility
3. **Phase 3**: Add new project types and test thoroughly
4. **Phase 4**: Remove hardcoded fallbacks and finalize implementation

This approach ensures we can support both retail and real estate use cases (and future project types) without losing the domain-specific intelligence we've built into each processor.
