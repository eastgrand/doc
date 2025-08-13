# Strategic Analysis Debug Flow

## 1. When User Enters Query: "Show me strategic expansion opportunities"

### Step 1: Query Classification (geospatial-chat-interface.tsx)
- Query goes through `handleSendMessage()`
- Calls `AnalysisEngine.executeAnalysis()`

### Step 2: Endpoint Selection (CachedEndpointRouter.ts)
- `selectEndpoint()` determines it's a strategic query
- Returns `/strategic-analysis` endpoint

### Step 3: Data Processing (DataProcessor.ts)
- `processResultsWithGeographicAnalysis()` processes the data
- Should preserve `strategic_value_score` with exact decimals (79.34, 79.17)

### Step 4: AI Narrative Generation (generate-response/route.ts)
The system should build the prompt with these components:

```
dynamicSystemPrompt = 
  ${selectedPersona.systemPrompt}           // 1. Strategist persona base
  + ANTI-HALLUCINATION RULES                // 2. Global rules
  + ${enhancedFieldContext}                 // 3. Field interpretations  
  + ${analysisSpecificPrompt}               // 4. Strategic analysis context
  + ${rankingContextPrompt}                 // 5. Top/bottom N focus
  + ${clusteringInstructions}               // 6. If clustered
  + DECIMAL PRECISION REQUIREMENTS          // 7. Don't round scores
  + FIELD TYPE INSTRUCTIONS                 // 8. Percentage vs count
  + MODEL ATTRIBUTION REQUIREMENTS          // 9. End attribution
```

## Current Issues to Debug:

### Issue 1: Incomplete Prompts?
**Symptom**: AI response seems generic, not using all context
**Debug Check**: Look for `🔍 [PROMPT COMPONENTS]` in console
- Should show all 5+ components with lengths > 0
- Strategic analysis prompt should be ~3000+ chars

### Issue 2: Lost Formatting
**Symptom**: Response is single paragraph, no sections
**Debug Check**: Look for `🔍 [RESPONSE FORMAT DEBUG]`
- Should have sections: YES
- Should have headers: YES  
- Should have model attribution: YES

### Issue 3: Spatial Filtering Not Applied?
**Symptom**: AI analyzes all data, not just selected features
**Debug Check**: Look for `🔍 [SPATIAL FILTER DEBUG]`
- Filter IDs count should match selection
- Features after filtering should be reduced

## Prompt Components Detail:

### 1. Strategist Persona (strategist.ts)
```typescript
systemPrompt: `${baseSystemPrompt}
STRATEGIC PERSPECTIVE:
As a strategic business advisor...
STRATEGIC FOCUS AREAS:
- Market opportunity assessment...
```

### 2. Strategic Analysis Prompt (analysis-prompts.ts)
```typescript
strategic_analysis: `
STRATEGIC ANALYSIS TECHNICAL CONTEXT:
You are analyzing strategic value data...
DATA STRUCTURE:
- strategic_value_score: Primary ranking metric...
CRITICAL REQUIREMENTS:
1. ALWAYS preserve exact score precision...
```

### 3. Expected Response Structure:
```
STRATEGIC MARKET OPPORTUNITIES

Top Expansion Markets:
1. ZIP 10001 (Score: 79.34) - NOT 79.3!
   - Market Gap: 65.2%
   - Demographics: ...

Strategic Implications:
...

Implementation Priorities:
...

---
**Model Attribution:**
• **Model Used:** Ensemble
• **R² Score:** 87.9%
```

## Test Query for Debugging:

```javascript
// In browser console:
await handleSendMessage("Show me top 5 strategic expansion opportunities in NYC with exact scores");
```

Then check console for:
1. `🔍 [PROMPT DEBUG]` - Initial setup
2. `🔍 [PROMPT COMPONENTS]` - Each part's length
3. `🔍 [STRATEGIC PROMPT DEBUG]` - Validation
4. `🔍 [SPATIAL FILTER DEBUG]` - Data subsetting
5. `🔍 [RESPONSE FORMAT DEBUG]` - Output structure

## Fix Priority:

1. **Verify prompt assembly** - All components included?
2. **Check data flow** - Exact decimals preserved?
3. **Response validation** - Formatting instructions followed?
4. **Spatial filtering** - Subset properly applied?