# Predictive Query Implementation Plan

## Overview
Implementation plan for supporting predictive queries like "what are the biggest factors that predict a high conversion rate?" in the geospatial AI system.

**Target Query Examples:**
- "What are the biggest factors that predict a high conversion rate?"
- "Which variables influence low crime rates?"
- "What drives high property values?"
- "What factors correlate with population growth?"

## Implementation Strategy

### **Recommended Visualization Approach: Factor Importance + Geographic Context**

**Primary Visualization**: Factor Importance Map (Choropleth colored by most important predictive factor)
**Secondary Feature**: Interactive Factor Ranking Panel  
**Tertiary Feature**: Factor Interaction Heatmap (advanced users)

**Why This Works:**
1. **Geographic Context**: Shows WHERE factors matter most
2. **Ranking Clarity**: Clear hierarchy of factor importance  
3. **Interactive Discovery**: Users can explore different factors
4. **Actionable Insights**: Geographic specificity enables targeted action
5. **Statistical Rigor**: Built on SHAP values and correlation analysis

---

## Phase 1: Query Detection & Routing ⏱️ 2 hours

### Step 1: Add Predictive Query Pattern Detection
**File**: `app/api/claude/generate-response/route.ts`
**Location**: Around line 1825, before existing ranking query detection

```typescript
// Add this before the existing isRankingQuery check
const isPredictiveQuery = /(?:predict|factor|influence|correlat|relationship|driver|cause|impact).*(?:high|low|conversion|rate|outcome)/i.test(userQuery) ||
                         /(?:what|which).*(?:predict|factor|influence|correlat|drive|cause|impact)/i.test(userQuery) ||
                         /(?:biggest|main|key|important|significant).*(?:factor|predictor|driver|influence)/i.test(userQuery) ||
                         /factors.*that.*predict/i.test(userQuery);
```

### Step 2: Create Factor Analysis Prompt Template
**File**: `app/api/claude/generate-response/route.ts`
**Location**: Add new conditional block for predictive queries

```typescript
if (isPredictiveQuery) {
  userMessage = `Analyze the factors that predict ${primaryFieldDisplayName}. Address: \"${userQuery}\".
${analysisPrompt}

YOUR ANALYSIS MUST FOCUS ON PREDICTIVE FACTORS. Follow this structure strictly:

1. FACTOR IMPORTANCE RANKING (MOST IMPORTANT):
   - Identify and rank the TOP 5 factors that predict ${primaryFieldDisplayName}
   - For EACH factor, you MUST:
      a) State its importance rank (e.g., "#1 Most Predictive Factor:", "#2:", etc.)
      b) Provide correlation strength if available (e.g., "r=0.73")
      c) Explain HOW this factor influences ${primaryFieldDisplayName}
      d) Give specific geographic examples from the data
      e) Use "${primaryFieldDisplayName}" when discussing the outcome

2. Factor Interactions: Explain how the top factors work together or independently

3. Geographic Distribution: Where are these predictive relationships strongest?

4. Actionable Insights: What can be done to improve ${primaryFieldDisplayName} based on these factors?

CRITICAL REQUIREMENTS:
- Focus on PREDICTIVE POWER, not just correlation
- Rank factors by their importance/strength
- Provide specific examples from the data
- Explain practical implications

CRITICAL FORMATTING REQUIREMENTS:
1. Numeric Value Formatting:
- Always format currency values with dollar signs and commas (e.g., $1,234,567)
- For larger values, use appropriate suffixes: $1.2M, $3.5B
- Always format percentages with the % symbol (e.g., 12.5%)
- Present correlation coefficients as decimals (e.g., r=0.75)
- Present ranges with proper formatting on both ends (e.g., $50K-$75K, 15%-25%)
IMPORTANT: Connect your observations directly to predicting ${primaryFieldDisplayName}.
`;
} else if (isRankingQuery) {
  // ... existing ranking logic
}
```

---

## Phase 2: Visualization Implementation ⏱️ 4-6 hours

### Step 3: Create Factor Importance Visualization Class
**File**: `utils/visualizations/factor-importance-visualization.ts` ✅ **COMPLETED**

Key features implemented:
- Factor importance ranking and visualization
- Geographic choropleth map showing primary factor influence
- Interactive popup with all factor rankings
- Customizable color schemes
- Integration with SHAP analysis results

### Step 4: Add Visualization Type Detection
**File**: `utils/visualization-factory.ts`
**Location**: In `determineVisualizationType` method

```typescript
// Add to the method around line 321
// Check for predictive/factor analysis queries first
const isPredictiveQuery = /(?:predict|factor|influence|correlat|relationship|driver|cause|impact).*(?:high|low|conversion|rate|outcome)/i.test(query) ||
                         /(?:what|which).*(?:predict|factor|influence|correlat|drive|cause|impact)/i.test(query) ||
                         /(?:biggest|main|key|important|significant).*(?:factor|predictor|driver|influence)/i.test(query);

if (isPredictiveQuery) {
  console.log('Detected predictive/factor analysis query');
  return 'factor-importance';
}
```

### Step 5: Add Visualization Factory Method
**File**: `utils/visualization-factory.ts`
**Location**: In the switch statement within `createVisualization` method

```typescript
case 'factor-importance': {
  result = await this.createFactorImportanceVisualization(localLayerResults, options);
  break;
}
```

### Step 6: Implement Factory Method
**File**: `utils/visualization-factory.ts`
**Location**: Add new private method

```typescript
private async createFactorImportanceVisualization(
  layerResults: LocalLayerResult[],
  options: VisualizationOptions
): Promise<VisualizationResult> {
  try {
    const { FactorImportanceVisualization } = await import('./visualizations/factor-importance-visualization');
    
    // Get enhanced analysis for factor data
    const { enhancedAnalysis } = this.visualizationIntegration;
    
    // Prepare factor importance data from SHAP analysis or correlation
    const factorData = {
      factors: this.extractFactorImportance(layerResults, enhancedAnalysis),
      features: layerResults[0].features,
      layerName: layerResults[0].layer.name || 'Factor Analysis',
      targetVariable: options.primaryField || 'outcome'
    };
    
    const factorViz = new FactorImportanceVisualization();
    return await factorViz.create(factorData, {
      ...options,
      showTopN: 5,
      colorScheme: 'importance',
      title: `Factor Analysis: ${factorData.targetVariable}`
    });
  } catch (error) {
    console.error('Error creating factor importance visualization:', error);
    return { layer: null, extent: null };
  }
}

private extractFactorImportance(layerResults: LocalLayerResult[], enhancedAnalysis: any) {
  // Extract factor importance from analysis results
  // This will integrate with Phase 3 SHAP enhancements
  const relevantFields = enhancedAnalysis?.relevantFields || [];
  
  return relevantFields.map((field: string, index: number) => ({
    name: field,
    importance: 0.8 - (index * 0.1), // Placeholder - will be replaced with SHAP values
    correlation: 0.7 - (index * 0.05), // Placeholder
    description: `Factor ${index + 1} contributing to prediction`,
    exampleAreas: ['Area1', 'Area2'] // Placeholder
  }));
}
```

---

## Phase 3: SHAP Integration Enhancement ⏱️ 3-4 hours

### Step 7: Enhance SHAP Microservice
**File**: `shap-microservice/app.py`
**Add new endpoint**:

```python
from pydantic import BaseModel
from typing import List, Dict, Any

class FactorImportanceRequest(BaseModel):
    target_field: str
    features: List[str]
    method: str = "shap"
    max_factors: int = 10

class FactorData(BaseModel):
    name: str
    importance: float
    correlation: float
    description: str
    shap_values: List[float]
    example_areas: List[str]

class FactorImportanceResponse(BaseModel):
    factors: List[FactorData]
    target_variable: str
    model_accuracy: float
    method_used: str

@app.post("/factor-importance", response_model=FactorImportanceResponse)
async def calculate_factor_importance(request: FactorImportanceRequest):
    """Calculate feature importance for predictive analysis"""
    
    try:
        # 1. Load and prepare data
        df = load_analysis_data()
        
        # 2. Identify numeric features for analysis
        numeric_features = df.select_dtypes(include=[np.number]).columns.tolist()
        if request.target_field in numeric_features:
            numeric_features.remove(request.target_field)
        
        # 3. Prepare X (features) and y (target)
        X = df[numeric_features].fillna(0)
        y = df[request.target_field].fillna(0)
        
        # 4. Train a simple model for SHAP analysis
        from sklearn.ensemble import RandomForestRegressor
        from sklearn.model_selection import train_test_split
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        # 5. Calculate SHAP values
        import shap
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_test)
        
        # 6. Calculate feature importance
        feature_importance = np.abs(shap_values).mean(0)
        
        # 7. Calculate correlations
        correlations = X.corrwith(y).abs()
        
        # 8. Combine and rank factors
        factors = []
        for i, feature in enumerate(numeric_features):
            if feature in request.features or len(request.features) == 0:
                # Find example areas with high values for this feature
                top_areas = df.nlargest(3, feature)['CSDNAME'].tolist() if 'CSDNAME' in df.columns else ['Area1', 'Area2', 'Area3']
                
                factors.append(FactorData(
                    name=feature,
                    importance=float(feature_importance[i]),
                    correlation=float(correlations.get(feature, 0)),
                    description=f"Factor analyzing {feature} impact on {request.target_field}",
                    shap_values=shap_values[:, i].tolist()[:10],  # First 10 SHAP values
                    example_areas=top_areas
                ))
        
        # 9. Sort by importance and limit
        factors.sort(key=lambda x: x.importance, reverse=True)
        factors = factors[:request.max_factors]
        
        # 10. Calculate model accuracy
        model_accuracy = model.score(X_test, y_test)
        
        return FactorImportanceResponse(
            factors=factors,
            target_variable=request.target_field,
            model_accuracy=float(model_accuracy),
            method_used=request.method
        )
        
    except Exception as e:
        logger.error(f"Error in factor importance calculation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Factor importance calculation failed: {str(e)}")
```

### Step 8: Update Query Processing for Factor Analysis
**File**: `app/api/claude/generate-response/route.ts`
**Location**: In the main POST handler, after data processing

```typescript
// Add this after processing featureData but before Claude API call
if (isPredictiveQuery && primaryAnalysisField) {
  try {
    console.log('[Claude] Calling SHAP microservice for factor importance...');
    
    const factorResponse = await fetch(`${SHAP_MICROSERVICE_URL}/factor-importance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_field: primaryAnalysisField,
        features: [], // Empty means use all available features
        method: 'shap',
        max_factors: 10
      })
    });
    
    if (factorResponse.ok) {
      const factorData = await factorResponse.json();
      
      // Add factor analysis to the analysis prompt
      const factorSummary = factorData.factors.slice(0, 5).map((factor: any, index: number) => 
        `#${index + 1}: ${factor.name} (importance: ${(factor.importance * 100).toFixed(1)}%, correlation: ${factor.correlation.toFixed(3)})`
      ).join('\n');
      
      analysisPrompt += `\n\nFACTOR IMPORTANCE ANALYSIS (from SHAP):
${factorSummary}

Model Accuracy: ${(factorData.model_accuracy * 100).toFixed(1)}%
Target Variable: ${factorData.target_variable}`;
      
      console.log('[Claude] Factor importance analysis added to prompt');
    }
  } catch (error) {
    console.error('[Claude] Error calling SHAP factor importance:', error);
    // Continue without factor analysis if it fails
  }
}
```

---

## Phase 4: Visualization Factory Integration ⏱️ 2-3 hours

### Step 9: Update Dynamic Visualization Factory
**File**: `utils/dynamic-visualization-factory.ts`
**Add method for factor importance**:

```typescript
/**
 * Creates a factor importance visualization showing predictive factors
 */
public async createFactorImportanceVisualization(
  layerResults: ProcessedLayerResult[],
  options: { 
    primaryField?: string; 
    factorData?: any;
    title?: string 
  }
): Promise<VisualizationResult> {
  
  console.log('[DYN_FACTORY] Creating factor importance visualization');
  
  if (!layerResults || layerResults.length === 0) {
    throw new Error('[FactorImportance] No layer results provided');
  }
  
  const primaryLayer = layerResults[0];
  const primaryField = options.primaryField || this.findPrimaryField(primaryLayer);
  
  // Convert features to Graphics
  const graphicsForViz = primaryLayer.features
    .map((feature, index) => {
      const geometry = createGeometry(
        feature.properties?._originalEsriGeometry || feature.geometry
      );
      
      if (!geometry) return null;
      
      return new Graphic({
        geometry,
        attributes: {
          ...feature.properties,
          ...feature.attributes,
          OBJECTID: index + 1,
          primary_factor_value: feature.properties?.[primaryField] || 0
        }
      });
    })
    .filter((g): g is ArcGISGraphic => g !== null);
  
  // Prepare factor importance data
  const factorData = {
    factors: options.factorData?.factors || this.generatePlaceholderFactors(primaryField),
    features: graphicsForViz,
    layerName: primaryLayer.layer.name || 'Factor Analysis',
    targetVariable: primaryField
  };
  
  // Create visualization
  const { FactorImportanceVisualization } = await import('./visualizations/factor-importance-visualization');
  const factorViz = new FactorImportanceVisualization();
  
  return await factorViz.create(factorData, {
    ...options,
    showTopN: 5,
    colorScheme: 'importance',
    title: options.title || `Factors Predicting ${primaryField}`
  });
}

private generatePlaceholderFactors(targetField: string) {
  // Placeholder factor data when SHAP analysis isn't available
  return [
    {
      name: 'demographic_density',
      importance: 0.73,
      correlation: 0.68,
      description: 'Population density impact',
      exampleAreas: ['High density area 1', 'High density area 2']
    },
    {
      name: 'economic_indicators',
      importance: 0.65,
      correlation: 0.61,
      description: 'Economic conditions influence',
      exampleAreas: ['Economic hub 1', 'Economic hub 2']
    },
    {
      name: 'infrastructure_access',
      importance: 0.58,
      correlation: 0.54,
      description: 'Infrastructure availability',
      exampleAreas: ['Well-connected area 1', 'Well-connected area 2']
    }
  ];
}
```

---

## Phase 5: UI/UX Integration ⏱️ 3-4 hours

### Step 10: Create Factor Analysis Panel Component
**File**: `components/FactorAnalysisPanel.tsx`

```typescript
import React from 'react';

interface FactorData {
  name: string;
  importance: number;
  correlation: number;
  description: string;
  exampleAreas: string[];
}

interface FactorAnalysisPanelProps {
  factors: FactorData[];
  onFactorSelect: (factor: string) => void;
  targetVariable: string;
  modelAccuracy?: number;
}

export function FactorAnalysisPanel({ 
  factors, 
  onFactorSelect, 
  targetVariable,
  modelAccuracy 
}: FactorAnalysisPanelProps) {
  return (
    <div className="factor-analysis-panel bg-white shadow-lg rounded-lg p-4 max-w-md">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Factors Predicting {targetVariable}
        </h3>
        {modelAccuracy && (
          <p className="text-sm text-gray-600">
            Model Accuracy: {(modelAccuracy * 100).toFixed(1)}%
          </p>
        )}
      </div>
      
      <div className="space-y-3">
        {factors.map((factor, index) => (
          <FactorCard 
            key={factor.name}
            rank={index + 1}
            factor={factor}
            onClick={() => onFactorSelect(factor.name)}
          />
        ))}
      </div>
    </div>
  );
}

interface FactorCardProps {
  rank: number;
  factor: FactorData;
  onClick: () => void;
}

function FactorCard({ rank, factor, onClick }: FactorCardProps) {
  const importancePercentage = (factor.importance * 100).toFixed(1);
  const correlationValue = factor.correlation.toFixed(3);
  
  return (
    <div 
      className="factor-card border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <span className="rank-badge bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full mr-2">
            #{rank}
          </span>
          <h4 className="font-medium text-gray-800 text-sm">
            {factor.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h4>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
        <div>
          <span className="font-medium">Importance:</span> {importancePercentage}%
        </div>
        <div>
          <span className="font-medium">Correlation:</span> {correlationValue}
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mb-2">{factor.description}</p>
      
      <div className="text-xs text-gray-500">
        <span className="font-medium">Examples:</span> {factor.exampleAreas.slice(0, 2).join(', ')}
      </div>
    </div>
  );
}
```

### Step 11: Integrate with Map Component
**File**: Update your main map component

```typescript
// Add to your map component state
const [factorAnalysisData, setFactorAnalysisData] = useState<FactorData[] | null>(null);
const [selectedFactor, setSelectedFactor] = useState<string | null>(null);

// Add factor selection handler
const handleFactorSelection = async (factorName: string) => {
  setSelectedFactor(factorName);
  
  // Re-render map with new factor as primary
  // This would trigger a new visualization request with the selected factor
  if (mapView && currentLayer) {
    try {
      // Update the visualization to highlight the selected factor
      await updateMapVisualization({
        primaryField: factorName,
        visualizationType: 'factor-importance',
        highlightFactor: factorName
      });
    } catch (error) {
      console.error('Error updating map for factor selection:', error);
    }
  }
};

// Add to your component's JSX
{factorAnalysisData && (
  <FactorAnalysisPanel
    factors={factorAnalysisData}
    onFactorSelect={handleFactorSelection}
    targetVariable={currentTargetVariable}
    modelAccuracy={currentModelAccuracy}
  />
)}
```

---

## Implementation Timeline & Priorities

### **Total Estimated Time**: 14-19 hours

1. **Phase 1** (2 hours) - Query detection and routing ⭐ **HIGH PRIORITY**
2. **Phase 3** (3-4 hours) - SHAP integration ⭐ **HIGH PRIORITY**
3. **Phase 2** (4-6 hours) - Visualization implementation ⭐ **MEDIUM PRIORITY**
4. **Phase 4** (2-3 hours) - Factory integration ⭐ **MEDIUM PRIORITY**
5. **Phase 5** (3-4 hours) - UI/UX components ⭐ **LOW PRIORITY**

### **Implementation Order**:
1. **Start with Phase 1** - Immediate impact, enables query detection
2. **Move to Phase 3** - Core SHAP functionality, provides data for visualization
3. **Implement Phase 2** - Creates the visualization capabilities
4. **Add Phase 4** - Integrates everything together
5. **Polish with Phase 5** - Enhanced user experience

### **Success Criteria**:
- ✅ System detects predictive queries correctly
- ✅ SHAP microservice returns factor importance data
- ✅ Geographic visualization shows factor influence
- ✅ Interactive factor selection works
- ✅ Analysis explains predictive relationships clearly

---

## Testing Queries

Use these queries to test the implementation:

```
✅ "What are the biggest factors that predict a high conversion rate?"
✅ "Which variables influence property values?"
✅ "What drives population growth in urban areas?"
✅ "What factors correlate with crime rates?"
✅ "Which demographics predict voting patterns?"
```

## Files to Create/Modify

### New Files:
- ✅ `utils/visualizations/factor-importance-visualization.ts`
- `components/FactorAnalysisPanel.tsx`

### Files to Modify:
- `app/api/claude/generate-response/route.ts`
- `utils/visualization-factory.ts`
- `utils/dynamic-visualization-factory.ts`
- `shap-microservice/app.py`
- Main map component (location depends on your setup)

---

*This document serves as the master reference for implementing predictive query support in the geospatial AI system.* 