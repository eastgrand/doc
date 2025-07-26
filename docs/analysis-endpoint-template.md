# Analysis Endpoint Template & Process Documentation

This document provides a standardized template for implementing and fixing analysis endpoints in the MPIQ AI Chat system. Use this as a reference when debugging or implementing new analysis types.

## 📋 Table of Contents

1. [Analysis Architecture Overview](#analysis-architecture-overview)
2. [Data Flow Process](#data-flow-process)
3. [Working Examples (Strategic & Competitive)](#working-examples)
4. [Implementation Checklist](#implementation-checklist)
5. [Common Issues & Solutions](#common-issues--solutions)
6. [Testing & Verification](#testing--verification)

## 🏗️ Analysis Architecture Overview

### Core Components

```
Raw Data → DataProcessor → VisualizationRenderer → Claude Response
     ↓            ↓               ↓                    ↓
  JSON Files  Processors     ChoroplethRenderer   Enhanced Metrics
              ↓              ↓                    ↓
            Statistics    Legend/Colors       Analysis Prompts
```

### File Structure
```
lib/analysis/
├── strategies/
│   ├── processors/
│   │   ├── StrategicAnalysisProcessor.ts    ✅ Working
│   │   ├── CompetitiveDataProcessor.ts      ✅ Working
│   │   ├── DemographicDataProcessor.ts      🔧 Needs Fix
│   │   ├── ClusterDataProcessor.ts          🔧 Needs Fix
│   │   └── [Other]Processor.ts              🔧 Needs Fix
│   └── renderers/
│       ├── ChoroplethRenderer.ts            ✅ Working
│       └── CompetitiveRenderer.ts           ✅ Working
├── VisualizationRenderer.ts                 ✅ Working
└── AnalysisEngine.ts                        ✅ Working

app/api/claude/
├── generate-response/route.ts               ✅ Working
└── shared/analysis-prompts.ts               ✅ Working
```

## 🔄 Data Flow Process

### 1. Data Input
- **Source**: `public/data/endpoints/{endpoint-name}.json`
- **Structure**: Array of records with geographic and metric data
- **Key Fields**: ID, location info, target score field, supporting metrics

### 2. Data Processing (Processor Layer)

#### A. Validation
```typescript
validate(rawData: RawAnalysisResult): boolean {
  // Check for required fields specific to analysis type
  return rawData.results.some(record => 
    record && 
    (record.area_id || record.id || record.ID) &&
    record.{TARGET_SCORE_FIELD} !== undefined
  );
}
```

#### B. Record Processing
```typescript
process(rawData: RawAnalysisResult): ProcessedAnalysisData {
  const processedRecords = rawData.results.map((record, index) => {
    const primaryScore = Number(record.{TARGET_SCORE_FIELD});
    const areaName = this.generateAreaName(record);
    
    return {
      area_id: recordId,
      area_name: areaName,
      value: primaryScore,
      {TARGET_SCORE_FIELD}: primaryScore, // ⚠️ CRITICAL: Add at top level
      rank: 0,
      properties: {
        ...record,
        {TARGET_SCORE_FIELD}: primaryScore,
        // Additional computed fields...
      }
    };
  });
  
  return {
    type: '{analysis_type}',
    records: rankedRecords,
    summary,
    featureImportance,
    statistics,
    targetVariable: '{TARGET_SCORE_FIELD}' // ⚠️ CRITICAL: Must match field name
  };
}
```

### 3. Visualization (Renderer Layer)

#### A. Field Selection
```typescript
// In VisualizationRenderer.ts
private determineValueField(data: ProcessedAnalysisData): string {
  if (data.type === '{analysis_type}' && data.targetVariable) {
    return data.targetVariable; // ⚠️ CRITICAL: Use targetVariable
  }
  return 'value'; // Fallback
}
```

#### B. Legend Generation
- **Range**: Automatically calculated from actual score values
- **Colors**: Quartile-based (4 classes) using standardized color scheme
- **Title**: Formatted from `targetVariable` name

### 4. Claude Response (Enhanced Metrics)

#### A. Analysis-Specific Metrics
```typescript
// In route.ts addEndpointSpecificMetrics()
case '{analysis_type}':
  topFeatures.forEach((feature, index) => {
    const props = feature.properties;
    // Use target score directly, not target_value
    const targetScore = props?.{TARGET_SCORE_FIELD} || 
                       feature?.{TARGET_SCORE_FIELD} || 
                       props?.target_value;
    metricsSection += `   {Score Name}: ${targetScore || 'N/A'}\n`;
  });
```

#### B. Analysis Prompts
- **Technical Context**: Explain scoring methodology
- **Requirements**: Specify ranking criteria and focus areas
- **Field Usage**: Clarify which fields to use for ranking vs context

## ✅ Working Examples

### Strategic Analysis
```typescript
// StrategicAnalysisProcessor.ts
{
  type: 'strategic_analysis',
  targetVariable: 'strategic_value_score',
  records: [{
    area_id: 'ZIP_12345',
    area_name: 'Downtown Seattle',
    value: 79.34,
    strategic_value_score: 79.34, // At top level for visualization
    properties: {
      strategic_value_score: 79.34,
      market_gap: 45.2,
      nike_market_share: 22.6,
      // ...other fields
    }
  }]
}
```

### Competitive Analysis
```typescript
// CompetitiveDataProcessor.ts
{
  type: 'competitive_analysis',
  targetVariable: 'competitive_advantage_score',
  records: [{
    area_id: 'ZIP_12345',
    area_name: 'Downtown Seattle',
    value: 5.2,
    competitive_advantage_score: 5.2, // At top level for visualization
    properties: {
      competitive_advantage_score: 5.2,
      nike_market_share: 22.6,
      adidas_market_share: 18.3,
      // ...other fields
    }
  }]
}
```

## ✅ Implementation Checklist

### 📊 Data Processor
- [ ] Validate required fields for analysis type
- [ ] Extract primary score from correct field (no fallbacks unless necessary)
- [ ] Generate consistent area names using `value_DESCRIPTION` or similar
- [ ] **Add target score field at top level of record**
- [ ] Set correct `targetVariable` in return object
- [ ] Set correct `type` in return object
- [ ] Calculate statistics from processed values
- [ ] Rank records by primary score (highest first)

### 🎨 Visualization Renderer
- [ ] **Update `determineValueField()` to check for analysis type and use `targetVariable`**
- [ ] Verify legend shows correct field name and range
- [ ] Ensure quartile color scheme is applied consistently
- [ ] Check popup template shows relevant fields

### 🤖 Claude Integration
- [ ] **Update enhanced metrics section in `route.ts` to use target score field directly**
- [ ] Verify analysis prompt explains scoring methodology
- [ ] Test that Claude references correct score type in responses
- [ ] Ensure field units and terminology are correct

### 🧪 Testing
- [ ] Verify legend shows correct score range (not market share range)
- [ ] Check visualization colors match legend
- [ ] Test Claude response mentions correct score type
- [ ] Validate data flow from processor to visualization

## 🚨 Common Issues & Solutions

### Issue 1: Wrong Legend Values
**Symptom**: Legend shows 15-45 range instead of 1-10 score range
**Cause**: Visualization using wrong field (often market share instead of target score)
**Solution**: 
1. Add target score field at top level in processor
2. Update `determineValueField()` in VisualizationRenderer
3. Update enhanced metrics in Claude route

### Issue 2: Claude References Wrong Metrics
**Symptom**: Claude talks about market share when should discuss competitive scores
**Cause**: Enhanced metrics section using `target_value` instead of specific field
**Solution**: Update `addEndpointSpecificMetrics()` to use target score field directly

### Issue 3: Missing Name Fields
**Symptom**: Areas show as "Unknown Area" or IDs
**Cause**: Processor not finding name field in data
**Solution**: Update `generateAreaName()` to check for `value_DESCRIPTION`, `DESCRIPTION`, etc.

### Issue 4: All Scores Identical
**Symptom**: All areas show same score value
**Cause**: Data corruption or field mapping error
**Solution**: Check data source and field extraction logic

## 🧪 Testing & Verification

### Quick Test Script Template
```javascript
// test-{endpoint}-fix.js
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./public/data/endpoints/{endpoint}.json', 'utf8'));
const targetScores = data.results.map(r => r.{TARGET_SCORE_FIELD}).filter(s => s !== undefined);

console.log('📊 Score Range Verification:');
console.log(`  ${TARGET_SCORE_FIELD}: ${Math.min(...targetScores)} to ${Math.max(...targetScores)}`);
console.log(`  Expected: Correct range for this analysis type`);
console.log(`  Unique values: ${new Set(targetScores).size} (should be > 1)`);
```

### Browser Testing
1. Load endpoint in UI
2. Check legend title and range
3. Verify visualization colors
4. Test Claude response content
5. Inspect data in browser console

### Key Verification Points
- [ ] Legend title matches target variable
- [ ] Legend range matches data range  
- [ ] Claude mentions correct score type
- [ ] No fallback names ("Unknown Area")
- [ ] Unique score values across records

## 📝 Templates for New Endpoints

### Processor Template
```typescript
export class {AnalysisType}Processor implements DataProcessorStrategy {
  validate(rawData: RawAnalysisResult): boolean {
    return rawData.results.some(record => 
      record && 
      (record.area_id || record.id || record.ID) &&
      record.{target_score_field} !== undefined
    );
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    const processedRecords = rawData.results.map((record, index) => {
      const primaryScore = Number(record.{target_score_field});
      const areaName = this.generateAreaName(record);
      
      return {
        area_id: record.ID || record.id || `area_${index}`,
        area_name: areaName,
        value: primaryScore,
        {target_score_field}: primaryScore, // Add at top level
        rank: 0,
        properties: {
          ...record,
          {target_score_field}: primaryScore,
          score_source: '{target_score_field}'
        }
      };
    });
    
    // Sort by score and assign ranks
    const rankedRecords = processedRecords
      .sort((a, b) => b.value - a.value)
      .map((record, index) => ({ ...record, rank: index + 1 }));
    
    return {
      type: '{analysis_type}',
      records: rankedRecords,
      summary: this.generateSummary(rankedRecords),
      featureImportance: this.processFeatureImportance(rawData.feature_importance || []),
      statistics: this.calculateStatistics(rankedRecords),
      targetVariable: '{target_score_field}'
    };
  }
}
```

### Enhanced Metrics Template
```typescript
case '{analysis_type}':
  metricsSection += '{Analysis Name} - Enhanced with context:\n\n';
  topFeatures.forEach((feature: any, index: number) => {
    const props = feature.properties;
    metricsSection += `${index + 1}. ${props?.area_name || 'Unknown Area'}:\n`;
    
    // Use target score directly, not target_value
    const targetScore = props?.{target_score_field} || 
                       feature?.{target_score_field} || 
                       props?.target_value;
    metricsSection += `   {Score Display Name}: ${targetScore || 'N/A'}\n`;
    
    // Add relevant context fields...
    metricsSection += '\n';
  });
  break;
```

---

## 🎯 Next Steps

Use this template to systematically fix the remaining endpoints:
1. **Demographic Insights** - Fix demographic score field mapping
2. **Spatial Clusters** - Fix cluster performance scoring  
3. **Brand Analysis** - Fix brand strength field mapping
4. **Market Sizing** - Fix market opportunity scoring
5. **Real Estate Analysis** - Fix location quality scoring

For each endpoint, follow the checklist and use the working examples as reference.