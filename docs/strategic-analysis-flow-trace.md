# Strategic Analysis Flow Trace - CORRECTED

## Overview
This document traces the exact code path when a user enters "Show me the top strategic markets for housing investment" in the UnifiedAnalysisWorkflow textarea.

## DEFINITIVE Flow Path

### 1. User Input (Frontend)
**File**: `/components/unified-analysis/UnifiedAnalysisWorkflow.tsx`
- **Line 1671**: User types in textarea with `value={selectedQuery}`
- **Line 1672**: `onChange={(e) => setSelectedQuery(e.target.value)}` updates state
- **Line 1745**: User clicks submit, triggers `handleAnalysisTypeSelected(workflowState.analysisType!)`

### 2. Analysis Type Handler
**File**: `/components/unified-analysis/UnifiedAnalysisWorkflow.tsx`
- **Lines 348-639**: `handleAnalysisTypeSelected` function
- **Line 414**: Sets `query: type === 'query' ? selectedQuery : undefined`
- **Line 436**: Calls `analysisWrapper.processUnifiedRequest(request)`

### 3. Unified Analysis Wrapper
**File**: `/components/unified-analysis/UnifiedAnalysisWrapper.tsx`
- **Lines 101-146**: `processUnifiedRequest` method
- **Line 117**: Routes to `processQueryAnalysis(request)` for query type
- **Lines 249-271**: `processQueryAnalysis` method
- **Line 270**: Calls `analysisEngine.executeAnalysis(request.query, options)`

### 4. Analysis Engine
**File**: `/lib/analysis/AnalysisEngine.ts`
- **Lines 113-143**: `executeAnalysis` method entry point
- **Line 128**: `endpointRouter.selectEndpoint(query, options)` - semantic routing determines `/strategic-analysis`
- **Line 221**: `endpointRouter.callEndpoint(selectedEndpoint, query, options)` - get cached data  
- **Lines 227-232**: `dataProcessor.processResultsWithGeographicAnalysis()` - data processing
- **Lines 243-253**: Debug logging of processed results

### 5. Data Processing Chain  
**File**: `/lib/analysis/DataProcessor.ts`
- **Line 184**: `processResults(filteredRawResults, endpoint, query)` called  
- **Line 317**: `getProcessorForEndpoint(endpoint)` maps endpoint to processor
- **Line 408**: `/strategic-analysis` → `StrategicAnalysisProcessor` mapping

### 6. Strategic Analysis Processor (AI NARRATIVE SOURCE)
**File**: `/lib/analysis/strategies/processors/StrategicAnalysisProcessor.ts`
- **Lines 82-241**: `process` method - THE MAIN PROCESSING
- **Line 131**: Calls `getTopContributingFields(record)` - extracts demographic data (ECYPTAPOP, etc.)
- **Line 140**: Stores demographic fields in record properties  
- **Line 206**: Calls `generateStrategicSummary()` - **THIS GENERATES THE AI NARRATIVE**
- **Lines 504-565**: `generateStrategicSummary()` method - **SOURCE OF USER'S AI ANALYSIS**

### 7. Visualization Creation
**File**: `/lib/analysis/AnalysisEngine.ts` 
- **Line 272**: Creates visualization from processed data
- **Line 280**: Returns AnalysisResult with data + visualization + summary

### 8. Response Display
**File**: `/components/unified-analysis/UnifiedAnalysisWorkflow.tsx`
- Analysis result displayed in UI
- Map visualization updated  
- **Narrative from StrategicAnalysisProcessor.generateStrategicSummary() shown to user**

## Key Issues Identified

### Issue 1: Field Name Mismatches
- **ConfigurationManager.ts**: Fixed `strategic_analysis_score` → `strategic_score`
- **housing-generate-response route**: Fixed score extraction priority
- **Status**: SHOULD BE FIXED

### Issue 2: Demographic Data Missing
- **StrategicAnalysisProcessor**: Should add ECYPTAPOP, ECYHRIAVG fields
- **Housing route**: Should extract these fields for display
- **Status**: NEEDS VERIFICATION

### Issue 3: FSA Code Display
- **Housing route**: Added FSA regex extraction
- **Status**: NEEDS VERIFICATION

## Missing Information

### Critical Gaps in Flow Understanding:
1. **AnalysisEngine.executeAnalysis**: Need to trace this method
2. **Semantic Routing**: How does "strategic markets for housing" → `/strategic-analysis`?
3. **Geographic Join**: Where/how are analysis results joined with map polygons?
4. **Data Handoff**: Exact format of data passed from AnalysisEngine to housing route

## ROOT CAUSE ANALYSIS - CORRECTED

**DEFINITIVE ISSUE IDENTIFIED**: 

The AI narrative DOES come from Claude API calls via the housing route, NOT from `StrategicAnalysisProcessor.generateStrategicSummary()`. The logs confirm `statsCalculator.ts:611 [formatStatsForChat] Called with analysisType: "strategic-analysis"` which triggers Claude API calls.

### The REAL Problem:
1. ✅ **Data Processing Works**: StrategicAnalysisProcessor correctly extracts demographic fields (ECYPTAPOP, ECYHRIAVG, etc.) via `getTopContributingFields()`
2. ✅ **Claude API Called**: Logs confirm strategic-analysis triggers Claude calls
3. ❌ **Housing Route Condition Not Matching**: Despite `analysisType: "strategic-analysis"`, housing route debug logs don't appear
4. ❌ **Demographic Data Extraction Failing**: Housing route not extracting ECYPTAPOP, ECYHRIAVG for Claude prompts

### Example of Current vs Needed Output:

**Current Generic Output** (from generateStrategicSummary):
```
Top Strategic Markets: J9Z (100.0), J9Y (99.8), J9X (99.5)
```

**Needed Detailed Output**:
```
Top Strategic Markets:
1. J9Z: Strategic Score 100.0
   • Population: 45,234
   • Avg Income: $67,500  
   • Homeowners: 15,678 (69%)
   • Renters: 7,123 (31%)
```

### Solution Required:
Enhance `StrategicAnalysisProcessor.generateStrategicSummary()` to use the demographic data it already extracts.

## Test Query
```
"Show me the top strategic markets for housing investment"
```

Expected Result:
- Routes to /strategic-analysis endpoint
- Uses StrategicAnalysisProcessor
- Shows demographic data (population, income, housing tenure)
- Displays FSA codes like "J9Z"
- Proper color visualization

Actual Problem:
- "Demographics: Data not available"
- Generic area names instead of FSA codes
- Visualization duplication issues