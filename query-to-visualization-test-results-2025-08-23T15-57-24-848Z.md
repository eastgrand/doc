# Query-to-Visualization Pipeline Test Results

## Test Summary
- **Test Date**: 2025-08-23T15:57:24.849Z
- **Total Queries**: 22
- **Successful**: 19
- **Failed**: 3
- **Success Rate**: 86.4%
- **Total Duration**: 59ms
- **Average Duration**: 2.7ms per query

## Category Results
### ✅ Successful Categories
- Strategic Analysis
- Comparative Analysis
- Brand Difference
- Customer Profile
- Spatial Clusters
- Outlier Detection
- Scenario Analysis
- Feature Interactions
- Segment Profiling
- Sensitivity Analysis
- Feature Importance Ranking
- Model Performance
- Algorithm Comparison
- Ensemble Analysis
- Model Selection
- Dimensionality Insights
- Consensus Analysis
- Anomaly Insights
- Cluster Analysis

### ❌ Failed Categories
- Demographic Insights
- Competitive Analysis
- Analyze

## Performance Analysis
### Routing Method Distribution
- **keyword**: 22 queries (100.0%)

### Average Performance by Category
- **Strategic Analysis**: 5.0ms avg, 100.0% success rate (1/1)
- **Comparative Analysis**: 2.0ms avg, 100.0% success rate (1/1)
- **Brand Difference**: 2.0ms avg, 100.0% success rate (1/1)
- **Demographic Insights**: 2.0ms avg, 0.0% success rate (0/1)
- **Customer Profile**: 2.0ms avg, 100.0% success rate (1/1)
- **Spatial Clusters**: 3.0ms avg, 100.0% success rate (1/1)
- **Outlier Detection**: 2.0ms avg, 100.0% success rate (1/1)
- **Competitive Analysis**: 2.0ms avg, 0.0% success rate (0/1)
- **Scenario Analysis**: 2.0ms avg, 100.0% success rate (1/1)
- **Feature Interactions**: 2.0ms avg, 100.0% success rate (1/1)
- **Segment Profiling**: 2.0ms avg, 100.0% success rate (1/1)
- **Sensitivity Analysis**: 10.0ms avg, 100.0% success rate (1/1)
- **Feature Importance Ranking**: 2.0ms avg, 100.0% success rate (1/1)
- **Model Performance**: 1.0ms avg, 100.0% success rate (1/1)
- **Algorithm Comparison**: 2.0ms avg, 100.0% success rate (1/1)
- **Ensemble Analysis**: 2.0ms avg, 100.0% success rate (1/1)
- **Model Selection**: 4.0ms avg, 100.0% success rate (1/1)
- **Dimensionality Insights**: 2.0ms avg, 100.0% success rate (1/1)
- **Consensus Analysis**: 3.0ms avg, 100.0% success rate (1/1)
- **Anomaly Insights**: 2.0ms avg, 100.0% success rate (1/1)
- **Cluster Analysis**: 3.0ms avg, 100.0% success rate (1/1)
- **Analyze**: 2.0ms avg, 0.0% success rate (0/1)

## Detailed Test Results

### Algorithm Comparison

#### ✅ Query 1: "Which AI model performs best for predicting tax service usage in each area?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 2ms
- Timestamp: 2025-08-23T15:57:24.826Z

**Query Routing:**
- Expected Endpoint: `/algorithm-comparison`
- Actual Endpoint: `/algorithm-comparison` ✅
- Routing Method: keyword
- Routing Time: 1ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /algorithm-comparison
- Processor: StrategicAnalysisProcessor
- Target Variable: algorithm_comparison_score

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /algorithm-comparison (score: 18.0) - Primary keywords: ai model, model performs best, performs best; Context matches: which ai model, ai model performs, model performs best

---

### Analyze

#### ❌ Query 2: "Provide comprehensive market insights for tax preparation services"

**Basic Info:**
- Status: FAILED
- Processing Time: 2ms
- Timestamp: 2025-08-23T15:57:24.846Z

**Query Routing:**
- Expected Endpoint: `/analyze`
- Actual Endpoint: `/customer-profile` ⚠️
- Routing Method: keyword
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /customer-profile
- Processor: StrategicAnalysisProcessor
- Target Variable: customer_profile_score

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /customer-profile (score: 4.4) - Context matches: for tax preparation, tax preparation services
- ❌ ROUTING MISMATCH: Expected /analyze, got /customer-profile

**Error Details:**
```
Error: Routing failed: Expected endpoint /analyze but got /customer-profile for query "Provide comprehensive market insights for tax preparation services"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /analyze but got /customer-profile for query "Provide comprehensive market insights for tax preparation services"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1220:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Anomaly Insights

#### ✅ Query 3: "Which unusual market patterns represent the biggest business opportunities?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 2ms
- Timestamp: 2025-08-23T15:57:24.840Z

**Query Routing:**
- Expected Endpoint: `/anomaly-insights`
- Actual Endpoint: `/anomaly-insights` ✅
- Routing Method: keyword
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /anomaly-insights
- Processor: StrategicAnalysisProcessor
- Target Variable: unknown

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /anomaly-insights (score: 3.6) - Primary keywords: business opportunities

---

### Brand Difference

#### ✅ Query 4: "Show me the market share difference between H&R Block and TurboTax"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 2ms
- Timestamp: 2025-08-23T15:57:24.794Z

**Query Routing:**
- Expected Endpoint: `/brand-difference`
- Actual Endpoint: `/brand-difference` ✅
- Routing Method: keyword
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /brand-difference
- Processor: StrategicAnalysisProcessor
- Target Variable: brand_difference_score

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /brand-difference (score: 21.2) - Primary keywords: market share difference, difference between, market share; Context matches: h&r block and turbotax, between h&r block; Brand comparison context: hrblock vs turbotax

---

### Cluster Analysis

#### ✅ Query 5: "How should we segment tax service markets for targeted strategies?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 3ms
- Timestamp: 2025-08-23T15:57:24.842Z

**Query Routing:**
- Expected Endpoint: `/cluster-analysis`
- Actual Endpoint: `/cluster-analysis` ✅
- Routing Method: keyword
- Routing Time: 1ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /cluster-analysis
- Processor: StrategicAnalysisProcessor
- Target Variable: unknown

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /cluster-analysis (score: 14.4) - Primary keywords: how should we segment, targeted strategies; Context matches: how should we, for targeted strategies, markets for targeted

---

### Comparative Analysis

#### ✅ Query 6: "Compare H&R Block usage between Alachua County and Miami-Dade County"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 2ms
- Timestamp: 2025-08-23T15:57:24.792Z

**Query Routing:**
- Expected Endpoint: `/comparative-analysis`
- Actual Endpoint: `/comparative-analysis` ✅
- Routing Method: keyword
- Routing Time: 0ms

**Geographic Processing:**
- Entities Detected: detected-county
- ZIP Codes: 10
- Processing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /comparative-analysis
- Processor: StrategicAnalysisProcessor
- Target Variable: comparative_analysis_score

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /comparative-analysis (score: 5.7) - Primary keywords: compare, between

---

### Competitive Analysis

#### ❌ Query 7: "Show me areas with the best competitive positioning"

**Basic Info:**
- Status: FAILED
- Processing Time: 2ms
- Timestamp: 2025-08-23T15:57:24.805Z

**Query Routing:**
- Expected Endpoint: `/competitive-analysis`
- Actual Endpoint: `/strategic-analysis` ⚠️
- Routing Method: keyword
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /strategic-analysis
- Processor: StrategicAnalysisProcessor
- Target Variable: strategic_analysis_score

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /strategic-analysis (score: 3.0) - Intent bonus: ranking (+3)
- ❌ ROUTING MISMATCH: Expected /competitive-analysis, got /strategic-analysis

**Error Details:**
```
Error: Routing failed: Expected endpoint /competitive-analysis but got /strategic-analysis for query "Show me areas with the best competitive positioning"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /competitive-analysis but got /strategic-analysis for query "Show me areas with the best competitive positioning"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1220:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Consensus Analysis

#### ✅ Query 8: "Where do all our AI models agree on tax service predictions?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 3ms
- Timestamp: 2025-08-23T15:57:24.836Z

**Query Routing:**
- Expected Endpoint: `/consensus-analysis`
- Actual Endpoint: `/consensus-analysis` ✅
- Routing Method: keyword
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /consensus-analysis
- Processor: StrategicAnalysisProcessor
- Target Variable: consensus_analysis_score

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /consensus-analysis (score: 9.1) - Primary keywords: models agree; Context matches: all our ai models, models agree on

---

### Customer Profile

#### ✅ Query 9: "Show me areas with ideal customer personas for tax preparation services"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 2ms
- Timestamp: 2025-08-23T15:57:24.798Z

**Query Routing:**
- Expected Endpoint: `/customer-profile`
- Actual Endpoint: `/customer-profile` ✅
- Routing Method: keyword
- Routing Time: 1ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /customer-profile
- Processor: StrategicAnalysisProcessor
- Target Variable: customer_profile_score

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /customer-profile (score: 17.6) - Primary keywords: customer, personas; Context matches: ideal customer, ideal customer personas, customer personas, for tax preparation, tax preparation services

---

### Demographic Insights

#### ❌ Query 10: "Which areas have the best customer demographics for tax preparation services?"

**Basic Info:**
- Status: FAILED
- Processing Time: 2ms
- Timestamp: 2025-08-23T15:57:24.796Z

**Query Routing:**
- Expected Endpoint: `/demographic-insights`
- Actual Endpoint: `/customer-profile` ⚠️
- Routing Method: keyword
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /customer-profile
- Processor: StrategicAnalysisProcessor
- Target Variable: customer_profile_score

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /customer-profile (score: 7.7) - Primary keywords: customer; Context matches: for tax preparation, tax preparation services
- ❌ ROUTING MISMATCH: Expected /demographic-insights, got /customer-profile

**Error Details:**
```
Error: Routing failed: Expected endpoint /demographic-insights but got /customer-profile for query "Which areas have the best customer demographics for tax preparation services?"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /demographic-insights but got /customer-profile for query "Which areas have the best customer demographics for tax preparation services?"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1220:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Dimensionality Insights

#### ✅ Query 11: "Which factors explain most of the variation in tax service market performance?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 2ms
- Timestamp: 2025-08-23T15:57:24.834Z

**Query Routing:**
- Expected Endpoint: `/dimensionality-insights`
- Actual Endpoint: `/dimensionality-insights` ✅
- Routing Method: keyword
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /dimensionality-insights
- Processor: StrategicAnalysisProcessor
- Target Variable: dimensionality_insights_score

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /dimensionality-insights (score: 10.0) - Primary keywords: factors explain, variation; Context matches: market performance, factors explain most

---

### Ensemble Analysis

#### ✅ Query 12: "Show me the highest confidence predictions using our best ensemble model"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 2ms
- Timestamp: 2025-08-23T15:57:24.828Z

**Query Routing:**
- Expected Endpoint: `/ensemble-analysis`
- Actual Endpoint: `/ensemble-analysis` ✅
- Routing Method: keyword
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /ensemble-analysis
- Processor: StrategicAnalysisProcessor
- Target Variable: ensemble_analysis_score

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /ensemble-analysis (score: 23.4) - Primary keywords: ensemble, highest confidence, best ensemble model, confidence predictions; Context matches: using our best ensemble, ensemble model, highest confidence predictions

---

### Feature Importance Ranking

#### ✅ Query 13: "What are the most important factors predicting H&R Block online usage?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 2ms
- Timestamp: 2025-08-23T15:57:24.823Z

**Query Routing:**
- Expected Endpoint: `/feature-importance-ranking`
- Actual Endpoint: `/feature-importance-ranking` ✅
- Routing Method: keyword
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /feature-importance-ranking
- Processor: StrategicAnalysisProcessor
- Target Variable: feature_importance_ranking_score

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /feature-importance-ranking (score: 16.0) - Primary keywords: important, most important, factors, predicting; Context matches: most important factors, what are the most

---

### Feature Interactions

#### ✅ Query 14: "Which markets have the strongest interactions between demographics and tax service usage?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 2ms
- Timestamp: 2025-08-23T15:57:24.809Z

**Query Routing:**
- Expected Endpoint: `/feature-interactions`
- Actual Endpoint: `/feature-interactions` ✅
- Routing Method: keyword
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /feature-interactions
- Processor: StrategicAnalysisProcessor
- Target Variable: feature_interactions_score

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /feature-interactions (score: 15.6) - Primary keywords: interactions, interactions between; Context matches: between demographics, demographics and, strongest interactions

---

### Model Performance

#### ✅ Query 15: "How accurate are our predictions for tax service market performance?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 1ms
- Timestamp: 2025-08-23T15:57:24.825Z

**Query Routing:**
- Expected Endpoint: `/model-performance`
- Actual Endpoint: `/model-performance` ✅
- Routing Method: keyword
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /model-performance
- Processor: StrategicAnalysisProcessor
- Target Variable: model_performance_score

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /model-performance (score: 15.6) - Primary keywords: accurate, performance, how accurate; Context matches: accurate are our predictions, market performance

---

### Model Selection

#### ✅ Query 16: "What is the optimal AI algorithm for predictions in each geographic area?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 4ms
- Timestamp: 2025-08-23T15:57:24.830Z

**Query Routing:**
- Expected Endpoint: `/model-selection`
- Actual Endpoint: `/model-selection` ✅
- Routing Method: keyword
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /model-selection
- Processor: StrategicAnalysisProcessor
- Target Variable: algorithm_category

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /model-selection (score: 10.4) - Primary keywords: optimal, optimal ai algorithm; Context matches: each geographic area

---

### Outlier Detection

#### ✅ Query 17: "Show me markets that have outliers with unique tax service characteristics"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 2ms
- Timestamp: 2025-08-23T15:57:24.803Z

**Query Routing:**
- Expected Endpoint: `/outlier-detection`
- Actual Endpoint: `/outlier-detection` ✅
- Routing Method: keyword
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /outlier-detection
- Processor: StrategicAnalysisProcessor
- Target Variable: outlier_detection_score

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /outlier-detection (score: 5.0) - Primary keywords: outliers; Context matches: unique tax service characteristics

---

### Scenario Analysis

#### ✅ Query 18: "What if H&R Block changes its pricing strategy - which markets would be most resilient?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 2ms
- Timestamp: 2025-08-23T15:57:24.807Z

**Query Routing:**
- Expected Endpoint: `/scenario-analysis`
- Actual Endpoint: `/scenario-analysis` ✅
- Routing Method: keyword
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /scenario-analysis
- Processor: StrategicAnalysisProcessor
- Target Variable: scenario_analysis_score

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /scenario-analysis (score: 19.5) - Primary keywords: what if, pricing strategy, resilient; Context matches: what if h&r block changes, pricing strategy, most resilient

---

### Segment Profiling

#### ✅ Query 19: "Which markets have the clearest customer segmentation profiles for tax services?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 2ms
- Timestamp: 2025-08-23T15:57:24.811Z

**Query Routing:**
- Expected Endpoint: `/segment-profiling`
- Actual Endpoint: `/segment-profiling` ✅
- Routing Method: keyword
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /segment-profiling
- Processor: StrategicAnalysisProcessor
- Target Variable: segment_profiling_score

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /segment-profiling (score: 18.0) - Primary keywords: clearest customer segmentation, customer segmentation profiles, which markets have; Context matches: clearest, segmentation profiles for, customer segmentation

---

### Sensitivity Analysis

#### ✅ Query 20: "How do tax service rankings change if we adjust income weights by 20%?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 10ms
- Timestamp: 2025-08-23T15:57:24.813Z

**Query Routing:**
- Expected Endpoint: `/sensitivity-analysis`
- Actual Endpoint: `/sensitivity-analysis` ✅
- Routing Method: keyword
- Routing Time: 1ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /sensitivity-analysis
- Processor: StrategicAnalysisProcessor
- Target Variable: sensitivity_analysis_score

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /sensitivity-analysis (score: 16.8) - Primary keywords: adjust, rankings change; Context matches: if we adjust, adjust income weights, rankings change if, weights by

---

### Spatial Clusters

#### ✅ Query 21: "Show me geographic clusters of similar tax service markets"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 3ms
- Timestamp: 2025-08-23T15:57:24.800Z

**Query Routing:**
- Expected Endpoint: `/spatial-clusters`
- Actual Endpoint: `/spatial-clusters` ✅
- Routing Method: keyword
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /spatial-clusters
- Processor: StrategicAnalysisProcessor
- Target Variable: spatial_clusters_score

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /spatial-clusters (score: 6.0) - Primary keywords: clusters, geographic clusters

---

### Strategic Analysis

#### ✅ Query 22: "Show me the top strategic markets for H&R Block tax service expansion"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 5ms
- Timestamp: 2025-08-23T15:57:24.787Z

**Query Routing:**
- Expected Endpoint: `/strategic-analysis`
- Actual Endpoint: `/strategic-analysis` ✅
- Routing Method: keyword
- Routing Time: 1ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /strategic-analysis
- Processor: StrategicAnalysisProcessor
- Target Variable: strategic_analysis_score

**Data Analysis:**
- Record Count: 2
- Score Range: 85.30 - 92.10
- Mean: 88.70
- Median: 92.10
- Std Dev: 3.40

**Visualization:**
- Renderer Type: class-breaks
- Renderer Field: strategic_analysis_score
- Class Breaks: 4
- Colors: rgb(215, 48, 39), rgb(253, 174, 97), rgb(166, 217, 106), rgb(26, 152, 80)

**Validation Results:**
- Analysis Quality: ✅ PASS
- Legend Accuracy: ✅ PASS
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing failed, used keyword fallback: Error: Semantic routing disabled for testing - using keyword fallback
- Keyword routing: /strategic-analysis (score: 9.0) - Primary keywords: strategic, expansion; Intent bonus: ranking (+3)

---

## Summary

This comprehensive test report covers the complete query-to-visualization pipeline for all queries in ANALYSIS_CATEGORIES. Each query was tested through all pipeline steps including semantic routing, geographic processing, brand analysis, configuration management, data processing, renderer generation, and validation.

**Key Findings:**
- 19/22 queries processed successfully
- Average processing time: 2.7ms per query
- Routing method distribution shows semantic vs keyword vs fallback usage
- Field consistency and validation results identify areas for improvement

**Recommendations:**
- Review failed queries and error patterns to improve routing accuracy
- Focus on categories with lower success rates for targeted improvements
- Monitor performance metrics for queries exceeding average processing time
- Validate field mappings for queries with field consistency failures
