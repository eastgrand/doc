# Query-to-Visualization Pipeline Test Results

## Test Summary
- **Test Date**: 2025-08-22T03:59:21.475Z
- **Total Queries**: 22
- **Successful**: 3
- **Failed**: 19
- **Success Rate**: 13.6%
- **Total Duration**: 226ms
- **Average Duration**: 10.3ms per query

## Category Results
### ✅ Successful Categories
- Strategic Analysis
- Demographic Insights
- Analyze

### ❌ Failed Categories
- Comparative Analysis
- Competitive Analysis
- Customer Profile
- Spatial Clusters
- Outlier Detection
- Brand Difference
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

## Performance Analysis
### Routing Method Distribution
- **semantic**: 22 queries (100.0%)

### Average Performance by Category
- **Strategic Analysis**: 15.0ms avg, 100.0% success rate (1/1)
- **Comparative Analysis**: 4.0ms avg, 0.0% success rate (0/1)
- **Competitive Analysis**: 3.0ms avg, 0.0% success rate (0/1)
- **Demographic Insights**: 7.0ms avg, 100.0% success rate (1/1)
- **Customer Profile**: 4.0ms avg, 0.0% success rate (0/1)
- **Spatial Clusters**: 4.0ms avg, 0.0% success rate (0/1)
- **Outlier Detection**: 7.0ms avg, 0.0% success rate (0/1)
- **Brand Difference**: 63.0ms avg, 0.0% success rate (0/1)
- **Scenario Analysis**: 28.0ms avg, 0.0% success rate (0/1)
- **Feature Interactions**: 19.0ms avg, 0.0% success rate (0/1)
- **Segment Profiling**: 6.0ms avg, 0.0% success rate (0/1)
- **Sensitivity Analysis**: 8.0ms avg, 0.0% success rate (0/1)
- **Feature Importance Ranking**: 4.0ms avg, 0.0% success rate (0/1)
- **Model Performance**: 4.0ms avg, 0.0% success rate (0/1)
- **Algorithm Comparison**: 6.0ms avg, 0.0% success rate (0/1)
- **Ensemble Analysis**: 20.0ms avg, 0.0% success rate (0/1)
- **Model Selection**: 4.0ms avg, 0.0% success rate (0/1)
- **Dimensionality Insights**: 5.0ms avg, 0.0% success rate (0/1)
- **Consensus Analysis**: 4.0ms avg, 0.0% success rate (0/1)
- **Anomaly Insights**: 3.0ms avg, 0.0% success rate (0/1)
- **Cluster Analysis**: 4.0ms avg, 0.0% success rate (0/1)
- **Analyze**: 4.0ms avg, 100.0% success rate (1/1)

## Detailed Test Results

### Algorithm Comparison

#### ❌ Query 1: "Which AI model performs best for predicting tax service usage in each area?"

**Basic Info:**
- Status: FAILED
- Processing Time: 6ms
- Timestamp: 2025-08-22T03:59:21.420Z

**Query Routing:**
- Expected Endpoint: `/algorithm-comparison`
- Actual Endpoint: `/analyze` ⚠️
- Routing Method: semantic
- Confidence: 0.600
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /analyze
- Processor: StrategicAnalysisProcessor
- Target Variable: analyze_score

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
- Semantic routing successful with confidence 0.6
- ❌ ROUTING MISMATCH: Expected /algorithm-comparison, got /analyze

**Error Details:**
```
Error: Routing failed: Expected endpoint /algorithm-comparison but got /analyze for query "Which AI model performs best for predicting tax service usage in each area?"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /algorithm-comparison but got /analyze for query "Which AI model performs best for predicting tax service usage in each area?"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1227:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Analyze

#### ✅ Query 2: "Provide comprehensive market insights for tax preparation services"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 4ms
- Timestamp: 2025-08-22T03:59:21.469Z

**Query Routing:**
- Expected Endpoint: `/analyze`
- Actual Endpoint: `/analyze` ✅
- Routing Method: semantic
- Confidence: 0.600
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /analyze
- Processor: StrategicAnalysisProcessor
- Target Variable: analyze_score

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
- Semantic routing successful with confidence 0.6

---

### Anomaly Insights

#### ❌ Query 3: "Which unusual market patterns represent the biggest business opportunities?"

**Basic Info:**
- Status: FAILED
- Processing Time: 3ms
- Timestamp: 2025-08-22T03:59:21.461Z

**Query Routing:**
- Expected Endpoint: `/anomaly-insights`
- Actual Endpoint: `/analyze` ⚠️
- Routing Method: semantic
- Confidence: 0.600
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /analyze
- Processor: StrategicAnalysisProcessor
- Target Variable: analyze_score

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
- Semantic routing successful with confidence 0.6
- ❌ ROUTING MISMATCH: Expected /anomaly-insights, got /analyze

**Error Details:**
```
Error: Routing failed: Expected endpoint /anomaly-insights but got /analyze for query "Which unusual market patterns represent the biggest business opportunities?"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /anomaly-insights but got /analyze for query "Which unusual market patterns represent the biggest business opportunities?"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1227:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Brand Difference

#### ❌ Query 4: "Which markets have the strongest H&R Block brand positioning vs competitors?"

**Basic Info:**
- Status: FAILED
- Processing Time: 63ms
- Timestamp: 2025-08-22T03:59:21.284Z

**Query Routing:**
- Expected Endpoint: `/brand-difference`
- Actual Endpoint: `/competitive-analysis` ⚠️
- Routing Method: semantic
- Confidence: 0.900
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /competitive-analysis
- Processor: StrategicAnalysisProcessor
- Target Variable: competitive_advantage_score

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
- Semantic routing successful with confidence 0.9
- ❌ ROUTING MISMATCH: Expected /brand-difference, got /competitive-analysis

**Error Details:**
```
Error: Routing failed: Expected endpoint /brand-difference but got /competitive-analysis for query "Which markets have the strongest H&R Block brand positioning vs competitors?"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /brand-difference but got /competitive-analysis for query "Which markets have the strongest H&R Block brand positioning vs competitors?"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1227:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Cluster Analysis

#### ❌ Query 5: "How should we segment tax service markets for targeted strategies?"

**Basic Info:**
- Status: FAILED
- Processing Time: 4ms
- Timestamp: 2025-08-22T03:59:21.465Z

**Query Routing:**
- Expected Endpoint: `/cluster-analysis`
- Actual Endpoint: `/analyze` ⚠️
- Routing Method: semantic
- Confidence: 0.600
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /analyze
- Processor: StrategicAnalysisProcessor
- Target Variable: analyze_score

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
- Semantic routing successful with confidence 0.6
- ❌ ROUTING MISMATCH: Expected /cluster-analysis, got /analyze

**Error Details:**
```
Error: Routing failed: Expected endpoint /cluster-analysis but got /analyze for query "How should we segment tax service markets for targeted strategies?"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /cluster-analysis but got /analyze for query "How should we segment tax service markets for targeted strategies?"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1227:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Comparative Analysis

#### ❌ Query 6: "Compare H&R Block usage between Alachua County and Miami-Dade County"

**Basic Info:**
- Status: FAILED
- Processing Time: 4ms
- Timestamp: 2025-08-22T03:59:21.253Z

**Query Routing:**
- Expected Endpoint: `/comparative-analysis`
- Actual Endpoint: `/analyze` ⚠️
- Routing Method: semantic
- Confidence: 0.600
- Routing Time: 1ms

**Geographic Processing:**
- Entities Detected: detected-county
- ZIP Codes: 10
- Processing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /analyze
- Processor: StrategicAnalysisProcessor
- Target Variable: analyze_score

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
- Semantic routing successful with confidence 0.6
- ❌ ROUTING MISMATCH: Expected /comparative-analysis, got /analyze

**Error Details:**
```
Error: Routing failed: Expected endpoint /comparative-analysis but got /analyze for query "Compare H&R Block usage between Alachua County and Miami-Dade County"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /comparative-analysis but got /analyze for query "Compare H&R Block usage between Alachua County and Miami-Dade County"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1227:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Competitive Analysis

#### ❌ Query 7: "Show me the market share difference between H&R Block and TurboTax"

**Basic Info:**
- Status: FAILED
- Processing Time: 3ms
- Timestamp: 2025-08-22T03:59:21.257Z

**Query Routing:**
- Expected Endpoint: `/competitive-analysis`
- Actual Endpoint: `/brand-difference` ⚠️
- Routing Method: semantic
- Confidence: 0.850
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
- Semantic routing successful with confidence 0.85
- ❌ ROUTING MISMATCH: Expected /competitive-analysis, got /brand-difference

**Error Details:**
```
Error: Routing failed: Expected endpoint /competitive-analysis but got /brand-difference for query "Show me the market share difference between H&R Block and TurboTax"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /competitive-analysis but got /brand-difference for query "Show me the market share difference between H&R Block and TurboTax"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1227:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Consensus Analysis

#### ❌ Query 8: "Where do all our AI models agree on tax service predictions?"

**Basic Info:**
- Status: FAILED
- Processing Time: 4ms
- Timestamp: 2025-08-22T03:59:21.456Z

**Query Routing:**
- Expected Endpoint: `/consensus-analysis`
- Actual Endpoint: `/analyze` ⚠️
- Routing Method: semantic
- Confidence: 0.600
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /analyze
- Processor: StrategicAnalysisProcessor
- Target Variable: analyze_score

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
- Semantic routing successful with confidence 0.6
- ❌ ROUTING MISMATCH: Expected /consensus-analysis, got /analyze

**Error Details:**
```
Error: Routing failed: Expected endpoint /consensus-analysis but got /analyze for query "Where do all our AI models agree on tax service predictions?"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /consensus-analysis but got /analyze for query "Where do all our AI models agree on tax service predictions?"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1227:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Customer Profile

#### ❌ Query 9: "Show me areas with ideal customer personas for tax preparation services"

**Basic Info:**
- Status: FAILED
- Processing Time: 4ms
- Timestamp: 2025-08-22T03:59:21.267Z

**Query Routing:**
- Expected Endpoint: `/customer-profile`
- Actual Endpoint: `/analyze` ⚠️
- Routing Method: semantic
- Confidence: 0.600
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /analyze
- Processor: StrategicAnalysisProcessor
- Target Variable: analyze_score

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
- Semantic routing successful with confidence 0.6
- ❌ ROUTING MISMATCH: Expected /customer-profile, got /analyze

**Error Details:**
```
Error: Routing failed: Expected endpoint /customer-profile but got /analyze for query "Show me areas with ideal customer personas for tax preparation services"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /customer-profile but got /analyze for query "Show me areas with ideal customer personas for tax preparation services"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1227:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Demographic Insights

#### ✅ Query 10: "Which areas have the best customer demographics for tax preparation services?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 7ms
- Timestamp: 2025-08-22T03:59:21.260Z

**Query Routing:**
- Expected Endpoint: `/demographic-insights`
- Actual Endpoint: `/demographic-insights` ✅
- Routing Method: semantic
- Confidence: 0.800
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /demographic-insights
- Processor: StrategicAnalysisProcessor
- Target Variable: demographic_insights_score

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
- Semantic routing successful with confidence 0.8

---

### Dimensionality Insights

#### ❌ Query 11: "Which factors explain most of the variation in tax service market performance?"

**Basic Info:**
- Status: FAILED
- Processing Time: 5ms
- Timestamp: 2025-08-22T03:59:21.451Z

**Query Routing:**
- Expected Endpoint: `/dimensionality-insights`
- Actual Endpoint: `/analyze` ⚠️
- Routing Method: semantic
- Confidence: 0.600
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /analyze
- Processor: StrategicAnalysisProcessor
- Target Variable: analyze_score

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
- Semantic routing successful with confidence 0.6
- ❌ ROUTING MISMATCH: Expected /dimensionality-insights, got /analyze

**Error Details:**
```
Error: Routing failed: Expected endpoint /dimensionality-insights but got /analyze for query "Which factors explain most of the variation in tax service market performance?"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /dimensionality-insights but got /analyze for query "Which factors explain most of the variation in tax service market performance?"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1227:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Ensemble Analysis

#### ❌ Query 12: "Show me the highest confidence predictions using our best ensemble model"

**Basic Info:**
- Status: FAILED
- Processing Time: 20ms
- Timestamp: 2025-08-22T03:59:21.426Z

**Query Routing:**
- Expected Endpoint: `/ensemble-analysis`
- Actual Endpoint: `/analyze` ⚠️
- Routing Method: semantic
- Confidence: 0.600
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /analyze
- Processor: StrategicAnalysisProcessor
- Target Variable: analyze_score

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
- Semantic routing successful with confidence 0.6
- ❌ ROUTING MISMATCH: Expected /ensemble-analysis, got /analyze

**Error Details:**
```
Error: Routing failed: Expected endpoint /ensemble-analysis but got /analyze for query "Show me the highest confidence predictions using our best ensemble model"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /ensemble-analysis but got /analyze for query "Show me the highest confidence predictions using our best ensemble model"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1227:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Feature Importance Ranking

#### ❌ Query 13: "What are the most important factors predicting H&R Block online usage?"

**Basic Info:**
- Status: FAILED
- Processing Time: 4ms
- Timestamp: 2025-08-22T03:59:21.411Z

**Query Routing:**
- Expected Endpoint: `/feature-importance-ranking`
- Actual Endpoint: `/analyze` ⚠️
- Routing Method: semantic
- Confidence: 0.600
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /analyze
- Processor: StrategicAnalysisProcessor
- Target Variable: analyze_score

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
- Semantic routing successful with confidence 0.6
- ❌ ROUTING MISMATCH: Expected /feature-importance-ranking, got /analyze

**Error Details:**
```
Error: Routing failed: Expected endpoint /feature-importance-ranking but got /analyze for query "What are the most important factors predicting H&R Block online usage?"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /feature-importance-ranking but got /analyze for query "What are the most important factors predicting H&R Block online usage?"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1227:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Feature Interactions

#### ❌ Query 14: "Which markets have the strongest interactions between demographics and tax service usage?"

**Basic Info:**
- Status: FAILED
- Processing Time: 19ms
- Timestamp: 2025-08-22T03:59:21.377Z

**Query Routing:**
- Expected Endpoint: `/feature-interactions`
- Actual Endpoint: `/demographic-insights` ⚠️
- Routing Method: semantic
- Confidence: 0.800
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /demographic-insights
- Processor: StrategicAnalysisProcessor
- Target Variable: demographic_insights_score

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
- Semantic routing successful with confidence 0.8
- ❌ ROUTING MISMATCH: Expected /feature-interactions, got /demographic-insights

**Error Details:**
```
Error: Routing failed: Expected endpoint /feature-interactions but got /demographic-insights for query "Which markets have the strongest interactions between demographics and tax service usage?"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /feature-interactions but got /demographic-insights for query "Which markets have the strongest interactions between demographics and tax service usage?"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1227:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Model Performance

#### ❌ Query 15: "How accurate are our predictions for tax service market performance?"

**Basic Info:**
- Status: FAILED
- Processing Time: 4ms
- Timestamp: 2025-08-22T03:59:21.416Z

**Query Routing:**
- Expected Endpoint: `/model-performance`
- Actual Endpoint: `/analyze` ⚠️
- Routing Method: semantic
- Confidence: 0.600
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /analyze
- Processor: StrategicAnalysisProcessor
- Target Variable: analyze_score

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
- Semantic routing successful with confidence 0.6
- ❌ ROUTING MISMATCH: Expected /model-performance, got /analyze

**Error Details:**
```
Error: Routing failed: Expected endpoint /model-performance but got /analyze for query "How accurate are our predictions for tax service market performance?"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /model-performance but got /analyze for query "How accurate are our predictions for tax service market performance?"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1227:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Model Selection

#### ❌ Query 16: "What is the optimal AI algorithm for predictions in each geographic area?"

**Basic Info:**
- Status: FAILED
- Processing Time: 4ms
- Timestamp: 2025-08-22T03:59:21.446Z

**Query Routing:**
- Expected Endpoint: `/model-selection`
- Actual Endpoint: `/analyze` ⚠️
- Routing Method: semantic
- Confidence: 0.600
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /analyze
- Processor: StrategicAnalysisProcessor
- Target Variable: analyze_score

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
- Semantic routing successful with confidence 0.6
- ❌ ROUTING MISMATCH: Expected /model-selection, got /analyze

**Error Details:**
```
Error: Routing failed: Expected endpoint /model-selection but got /analyze for query "What is the optimal AI algorithm for predictions in each geographic area?"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /model-selection but got /analyze for query "What is the optimal AI algorithm for predictions in each geographic area?"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1227:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Outlier Detection

#### ❌ Query 17: "Show me markets that have outliers with unique tax service characteristics"

**Basic Info:**
- Status: FAILED
- Processing Time: 7ms
- Timestamp: 2025-08-22T03:59:21.276Z

**Query Routing:**
- Expected Endpoint: `/outlier-detection`
- Actual Endpoint: `/analyze` ⚠️
- Routing Method: semantic
- Confidence: 0.600
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /analyze
- Processor: StrategicAnalysisProcessor
- Target Variable: analyze_score

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
- Semantic routing successful with confidence 0.6
- ❌ ROUTING MISMATCH: Expected /outlier-detection, got /analyze

**Error Details:**
```
Error: Routing failed: Expected endpoint /outlier-detection but got /analyze for query "Show me markets that have outliers with unique tax service characteristics"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /outlier-detection but got /analyze for query "Show me markets that have outliers with unique tax service characteristics"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1227:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Scenario Analysis

#### ❌ Query 18: "What if H&R Block changes its pricing strategy - which markets would be most resilient?"

**Basic Info:**
- Status: FAILED
- Processing Time: 28ms
- Timestamp: 2025-08-22T03:59:21.348Z

**Query Routing:**
- Expected Endpoint: `/scenario-analysis`
- Actual Endpoint: `/analyze` ⚠️
- Routing Method: semantic
- Confidence: 0.600
- Routing Time: 2ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /analyze
- Processor: StrategicAnalysisProcessor
- Target Variable: analyze_score

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
- Semantic routing successful with confidence 0.6
- ❌ ROUTING MISMATCH: Expected /scenario-analysis, got /analyze

**Error Details:**
```
Error: Routing failed: Expected endpoint /scenario-analysis but got /analyze for query "What if H&R Block changes its pricing strategy - which markets would be most resilient?"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /scenario-analysis but got /analyze for query "What if H&R Block changes its pricing strategy - which markets would be most resilient?"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1227:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Segment Profiling

#### ❌ Query 19: "Which markets have the clearest customer segmentation profiles for tax services?"

**Basic Info:**
- Status: FAILED
- Processing Time: 6ms
- Timestamp: 2025-08-22T03:59:21.396Z

**Query Routing:**
- Expected Endpoint: `/segment-profiling`
- Actual Endpoint: `/analyze` ⚠️
- Routing Method: semantic
- Confidence: 0.600
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /analyze
- Processor: StrategicAnalysisProcessor
- Target Variable: analyze_score

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
- Semantic routing successful with confidence 0.6
- ❌ ROUTING MISMATCH: Expected /segment-profiling, got /analyze

**Error Details:**
```
Error: Routing failed: Expected endpoint /segment-profiling but got /analyze for query "Which markets have the clearest customer segmentation profiles for tax services?"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /segment-profiling but got /analyze for query "Which markets have the clearest customer segmentation profiles for tax services?"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1227:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Sensitivity Analysis

#### ❌ Query 20: "How do tax service rankings change if we adjust income weights by 20%?"

**Basic Info:**
- Status: FAILED
- Processing Time: 8ms
- Timestamp: 2025-08-22T03:59:21.403Z

**Query Routing:**
- Expected Endpoint: `/sensitivity-analysis`
- Actual Endpoint: `/demographic-insights` ⚠️
- Routing Method: semantic
- Confidence: 0.800
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /demographic-insights
- Processor: StrategicAnalysisProcessor
- Target Variable: demographic_insights_score

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
- Semantic routing successful with confidence 0.8
- ❌ ROUTING MISMATCH: Expected /sensitivity-analysis, got /demographic-insights

**Error Details:**
```
Error: Routing failed: Expected endpoint /sensitivity-analysis but got /demographic-insights for query "How do tax service rankings change if we adjust income weights by 20%?"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /sensitivity-analysis but got /demographic-insights for query "How do tax service rankings change if we adjust income weights by 20%?"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1227:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Spatial Clusters

#### ❌ Query 21: "Show me geographic clusters of similar tax service markets"

**Basic Info:**
- Status: FAILED
- Processing Time: 4ms
- Timestamp: 2025-08-22T03:59:21.271Z

**Query Routing:**
- Expected Endpoint: `/spatial-clusters`
- Actual Endpoint: `/analyze` ⚠️
- Routing Method: semantic
- Confidence: 0.600
- Routing Time: 0ms

**Brand Analysis:**
- Target Brand: H&R Block
- Brands Detected: H&R Block, TurboTax
- Competitors: TurboTax

**Configuration:**
- Configuration: /analyze
- Processor: StrategicAnalysisProcessor
- Target Variable: analyze_score

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
- Semantic routing successful with confidence 0.6
- ❌ ROUTING MISMATCH: Expected /spatial-clusters, got /analyze

**Error Details:**
```
Error: Routing failed: Expected endpoint /spatial-clusters but got /analyze for query "Show me geographic clusters of similar tax service markets"
```

**Stack Trace:**
```
Error: Routing failed: Expected endpoint /spatial-clusters but got /analyze for query "Show me geographic clusters of similar tax service markets"
    at Object.<anonymous> (/Users/voldeck/code/mpiq-ai-chat/__tests__/query-to-visualization-pipeline.test.ts:1227:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
```

---

### Strategic Analysis

#### ✅ Query 22: "Show me the top strategic markets for H&R Block tax service expansion"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 15ms
- Timestamp: 2025-08-22T03:59:21.238Z

**Query Routing:**
- Expected Endpoint: `/strategic-analysis`
- Actual Endpoint: `/strategic-analysis` ✅
- Routing Method: semantic
- Confidence: 0.900
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
- Semantic routing successful with confidence 0.9

---

## Summary

This comprehensive test report covers the complete query-to-visualization pipeline for all queries in ANALYSIS_CATEGORIES. Each query was tested through all pipeline steps including semantic routing, geographic processing, brand analysis, configuration management, data processing, renderer generation, and validation.

**Key Findings:**
- 3/22 queries processed successfully
- Average processing time: 10.3ms per query
- Routing method distribution shows semantic vs keyword vs fallback usage
- Field consistency and validation results identify areas for improvement

**Recommendations:**
- Review failed queries and error patterns to improve routing accuracy
- Focus on categories with lower success rates for targeted improvements
- Monitor performance metrics for queries exceeding average processing time
- Validate field mappings for queries with field consistency failures
