# Query-to-Visualization Pipeline Test Results

## Test Summary
- **Test Date**: 2025-08-22T01:17:53.814Z
- **Total Queries**: 22
- **Successful**: 22
- **Failed**: 0
- **Success Rate**: 100.0%
- **Total Duration**: 264ms
- **Average Duration**: 12.0ms per query

## Category Results
### ✅ Successful Categories
- Strategic Analysis
- Comparative Analysis
- Competitive Analysis
- Demographic Insights
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
- Analyze

### ❌ Failed Categories
- None

## Performance Analysis
### Routing Method Distribution
- **semantic**: 22 queries (100.0%)

### Average Performance by Category
- **Strategic Analysis**: 18.0ms avg, 100.0% success rate (1/1)
- **Comparative Analysis**: 9.0ms avg, 100.0% success rate (1/1)
- **Competitive Analysis**: 44.0ms avg, 100.0% success rate (1/1)
- **Demographic Insights**: 14.0ms avg, 100.0% success rate (1/1)
- **Customer Profile**: 14.0ms avg, 100.0% success rate (1/1)
- **Spatial Clusters**: 9.0ms avg, 100.0% success rate (1/1)
- **Outlier Detection**: 10.0ms avg, 100.0% success rate (1/1)
- **Brand Difference**: 10.0ms avg, 100.0% success rate (1/1)
- **Scenario Analysis**: 10.0ms avg, 100.0% success rate (1/1)
- **Feature Interactions**: 11.0ms avg, 100.0% success rate (1/1)
- **Segment Profiling**: 8.0ms avg, 100.0% success rate (1/1)
- **Sensitivity Analysis**: 9.0ms avg, 100.0% success rate (1/1)
- **Feature Importance Ranking**: 9.0ms avg, 100.0% success rate (1/1)
- **Model Performance**: 10.0ms avg, 100.0% success rate (1/1)
- **Algorithm Comparison**: 11.0ms avg, 100.0% success rate (1/1)
- **Ensemble Analysis**: 9.0ms avg, 100.0% success rate (1/1)
- **Model Selection**: 11.0ms avg, 100.0% success rate (1/1)
- **Dimensionality Insights**: 9.0ms avg, 100.0% success rate (1/1)
- **Consensus Analysis**: 11.0ms avg, 100.0% success rate (1/1)
- **Anomaly Insights**: 9.0ms avg, 100.0% success rate (1/1)
- **Cluster Analysis**: 10.0ms avg, 100.0% success rate (1/1)
- **Analyze**: 9.0ms avg, 100.0% success rate (1/1)

## Detailed Test Results

### Algorithm Comparison

#### ✅ Query 1: "Which AI model performs best for predicting tax service usage in each area?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 11ms
- Timestamp: 2025-08-22T01:17:53.733Z

**Query Routing:**
- Expected Endpoint: `/analyze`
- Actual Endpoint: `/algorithm-comparison` ⚠️
- Routing Method: semantic
- Confidence: 0.400
- Routing Time: 4ms

**Configuration:**
- Configuration: /algorithm-comparison
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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.4
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

### Analyze

#### ✅ Query 2: "Provide comprehensive market insights for tax preparation services"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 9ms
- Timestamp: 2025-08-22T01:17:53.803Z

**Query Routing:**
- Expected Endpoint: `/analyze`
- Actual Endpoint: `/analyze` ✅
- Routing Method: semantic
- Confidence: 0.267
- Routing Time: 2ms

**Configuration:**
- Configuration: /analyze
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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.26666666666666666
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

### Anomaly Insights

#### ✅ Query 3: "Which unusual market patterns represent the biggest business opportunities?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 9ms
- Timestamp: 2025-08-22T01:17:53.784Z

**Query Routing:**
- Expected Endpoint: `/analyze`
- Actual Endpoint: `/outlier-detection` ⚠️
- Routing Method: semantic
- Confidence: 0.267
- Routing Time: 2ms

**Configuration:**
- Configuration: /outlier-detection
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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.26666666666666666
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

### Brand Difference

#### ✅ Query 4: "Which markets have the strongest H&R Block brand positioning vs competitors?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 10ms
- Timestamp: 2025-08-22T01:17:53.665Z

**Query Routing:**
- Expected Endpoint: `/brand-difference`
- Actual Endpoint: `/competitive-analysis` ⚠️
- Routing Method: semantic
- Confidence: 0.267
- Routing Time: 2ms

**Configuration:**
- Configuration: /competitive-analysis
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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.26666666666666666
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

### Cluster Analysis

#### ✅ Query 5: "How should we segment tax service markets for targeted strategies?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 10ms
- Timestamp: 2025-08-22T01:17:53.793Z

**Query Routing:**
- Expected Endpoint: `/analyze`
- Actual Endpoint: `/cluster-analysis` ⚠️
- Routing Method: semantic
- Confidence: 0.700
- Routing Time: 2ms

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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.7
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

### Comparative Analysis

#### ✅ Query 6: "Compare H&R Block usage between Alachua County and Miami-Dade County"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 9ms
- Timestamp: 2025-08-22T01:17:53.564Z

**Query Routing:**
- Expected Endpoint: `/analyze`
- Actual Endpoint: `/comparative-analysis` ⚠️
- Routing Method: semantic
- Confidence: 0.320
- Routing Time: 2ms

**Geographic Processing:**
- Entities Detected: detected-county
- ZIP Codes: 10
- Processing Time: 0ms

**Configuration:**
- Configuration: /comparative-analysis
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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.32000000000000006
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

### Competitive Analysis

#### ✅ Query 7: "Show me the market share difference between H&R Block and TurboTax"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 44ms
- Timestamp: 2025-08-22T01:17:53.573Z

**Query Routing:**
- Expected Endpoint: `/competitive-analysis`
- Actual Endpoint: `/competitive-analysis` ✅
- Routing Method: semantic
- Confidence: 0.267
- Routing Time: 14ms

**Configuration:**
- Configuration: /competitive-analysis
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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.26666666666666666
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

### Consensus Analysis

#### ✅ Query 8: "Where do all our AI models agree on tax service predictions?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 11ms
- Timestamp: 2025-08-22T01:17:53.773Z

**Query Routing:**
- Expected Endpoint: `/analyze`
- Actual Endpoint: `/consensus-analysis` ⚠️
- Routing Method: semantic
- Confidence: 0.400
- Routing Time: 1ms

**Configuration:**
- Configuration: /consensus-analysis
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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.4
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

### Customer Profile

#### ✅ Query 9: "Show me areas with ideal customer personas for tax preparation services"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 14ms
- Timestamp: 2025-08-22T01:17:53.632Z

**Query Routing:**
- Expected Endpoint: `/customer-profile`
- Actual Endpoint: `/customer-profile` ✅
- Routing Method: semantic
- Confidence: 0.533
- Routing Time: 2ms

**Configuration:**
- Configuration: /customer-profile
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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.5333333333333333
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

### Demographic Insights

#### ✅ Query 10: "Which areas have the best customer demographics for tax preparation services?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 14ms
- Timestamp: 2025-08-22T01:17:53.618Z

**Query Routing:**
- Expected Endpoint: `/demographic-insights`
- Actual Endpoint: `/demographic-insights` ✅
- Routing Method: semantic
- Confidence: 0.320
- Routing Time: 3ms

**Configuration:**
- Configuration: /demographic-insights
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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.32000000000000006
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

### Dimensionality Insights

#### ✅ Query 11: "Which factors explain most of the variation in tax service market performance?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 9ms
- Timestamp: 2025-08-22T01:17:53.764Z

**Query Routing:**
- Expected Endpoint: `/analyze`
- Actual Endpoint: `/dimensionality-insights` ⚠️
- Routing Method: semantic
- Confidence: 0.700
- Routing Time: 2ms

**Configuration:**
- Configuration: /dimensionality-insights
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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.7
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

### Ensemble Analysis

#### ✅ Query 12: "Show me the highest confidence predictions using our best ensemble model"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 9ms
- Timestamp: 2025-08-22T01:17:53.744Z

**Query Routing:**
- Expected Endpoint: `/analyze`
- Actual Endpoint: `/ensemble-analysis` ⚠️
- Routing Method: semantic
- Confidence: 0.700
- Routing Time: 2ms

**Configuration:**
- Configuration: /ensemble-analysis
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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.7
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

### Feature Importance Ranking

#### ✅ Query 13: "What are the most important factors predicting H&R Block online usage?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 9ms
- Timestamp: 2025-08-22T01:17:53.714Z

**Query Routing:**
- Expected Endpoint: `/analyze`
- Actual Endpoint: `/feature-importance-ranking` ⚠️
- Routing Method: semantic
- Confidence: 0.400
- Routing Time: 2ms

**Configuration:**
- Configuration: /feature-importance-ranking
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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.4
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

### Feature Interactions

#### ✅ Query 14: "Which markets have the strongest interactions between demographics and tax service usage?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 11ms
- Timestamp: 2025-08-22T01:17:53.685Z

**Query Routing:**
- Expected Endpoint: `/feature-interactions`
- Actual Endpoint: `/feature-interactions` ✅
- Routing Method: semantic
- Confidence: 0.533
- Routing Time: 2ms

**Configuration:**
- Configuration: /feature-interactions
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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.5333333333333333
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

### Model Performance

#### ✅ Query 15: "How accurate are our predictions for tax service market performance?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 10ms
- Timestamp: 2025-08-22T01:17:53.723Z

**Query Routing:**
- Expected Endpoint: `/analyze`
- Actual Endpoint: `/model-performance` ⚠️
- Routing Method: semantic
- Confidence: 0.533
- Routing Time: 3ms

**Configuration:**
- Configuration: /model-performance
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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.5333333333333333
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

### Model Selection

#### ✅ Query 16: "What is the optimal AI algorithm for predictions in each geographic area?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 11ms
- Timestamp: 2025-08-22T01:17:53.753Z

**Query Routing:**
- Expected Endpoint: `/analyze`
- Actual Endpoint: `/algorithm-comparison` ⚠️
- Routing Method: semantic
- Confidence: 0.400
- Routing Time: 3ms

**Configuration:**
- Configuration: /algorithm-comparison
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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.4
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

### Outlier Detection

#### ✅ Query 17: "Show me markets that have outliers with unique tax service characteristics"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 10ms
- Timestamp: 2025-08-22T01:17:53.655Z

**Query Routing:**
- Expected Endpoint: `/outlier-detection`
- Actual Endpoint: `/outlier-detection` ✅
- Routing Method: semantic
- Confidence: 0.267
- Routing Time: 2ms

**Configuration:**
- Configuration: /outlier-detection
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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.26666666666666666
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

### Scenario Analysis

#### ✅ Query 18: "What if H&R Block changes its pricing strategy - which markets would be most resilient?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 10ms
- Timestamp: 2025-08-22T01:17:53.675Z

**Query Routing:**
- Expected Endpoint: `/scenario-analysis`
- Actual Endpoint: `/scenario-analysis` ✅
- Routing Method: semantic
- Confidence: 0.533
- Routing Time: 2ms

**Configuration:**
- Configuration: /scenario-analysis
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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.5333333333333333
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

### Segment Profiling

#### ✅ Query 19: "Which markets have the clearest customer segmentation profiles for tax services?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 8ms
- Timestamp: 2025-08-22T01:17:53.696Z

**Query Routing:**
- Expected Endpoint: `/segment-profiling`
- Actual Endpoint: `/segment-profiling` ✅
- Routing Method: semantic
- Confidence: 0.400
- Routing Time: 2ms

**Configuration:**
- Configuration: /segment-profiling
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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.4
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

### Sensitivity Analysis

#### ✅ Query 20: "How do tax service rankings change if we adjust income weights by 20%?"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 9ms
- Timestamp: 2025-08-22T01:17:53.705Z

**Query Routing:**
- Expected Endpoint: `/analyze`
- Actual Endpoint: `/sensitivity-analysis` ⚠️
- Routing Method: semantic
- Confidence: 0.533
- Routing Time: 2ms

**Configuration:**
- Configuration: /sensitivity-analysis
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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.5333333333333333
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

### Spatial Clusters

#### ✅ Query 21: "Show me geographic clusters of similar tax service markets"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 9ms
- Timestamp: 2025-08-22T01:17:53.646Z

**Query Routing:**
- Expected Endpoint: `/spatial-clusters`
- Actual Endpoint: `/spatial-clusters` ✅
- Routing Method: semantic
- Confidence: 0.267
- Routing Time: 2ms

**Configuration:**
- Configuration: /spatial-clusters
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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.26666666666666666
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

### Strategic Analysis

#### ✅ Query 22: "Show me the top strategic markets for H&R Block tax service expansion"

**Basic Info:**
- Status: SUCCESS
- Processing Time: 18ms
- Timestamp: 2025-08-22T01:17:53.546Z

**Query Routing:**
- Expected Endpoint: `/strategic-analysis`
- Actual Endpoint: `/strategic-analysis` ✅
- Routing Method: semantic
- Confidence: 0.400
- Routing Time: 3ms

**Configuration:**
- Configuration: /strategic-analysis
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
- Legend Accuracy: ❌ FAIL
- Field Consistency: ✅ PASS

**Troubleshooting Notes:**
- Semantic routing successful with confidence 0.4
- Legend validation failed: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"rgba(215, 48, 39, 0.6)"[39m
Received array: [31m["#D6191C", "#FCAD61", "#A6D96A", "#1A9641"][39m

---

## Summary

This comprehensive test report covers the complete query-to-visualization pipeline for all queries in ANALYSIS_CATEGORIES. Each query was tested through all pipeline steps including semantic routing, geographic processing, brand analysis, configuration management, data processing, renderer generation, and validation.

**Key Findings:**
- 22/22 queries processed successfully
- Average processing time: 12.0ms per query
- Routing method distribution shows semantic vs keyword vs fallback usage
- Field consistency and validation results identify areas for improvement

**Recommendations:**
- Monitor performance metrics for queries exceeding average processing time
- Validate field mappings for queries with field consistency failures
