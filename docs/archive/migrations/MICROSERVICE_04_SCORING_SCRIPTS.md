# Microservice Scoring and Analysis Scripts Guide

This guide covers the scoring algorithms and analysis scripts that transform raw microservice data into specialized analysis endpoints with calculated scores and insights.

## Table of Contents

1. [Scoring System Overview](#scoring-system-overview)
2. [Strategic Analysis Scoring](#strategic-analysis-scoring)
3. [Competitive Analysis Scoring](#competitive-analysis-scoring)
4. [Demographic Analysis Scoring](#demographic-analysis-scoring)
5. [Statistical Analysis Scripts](#statistical-analysis-scripts)
6. [Advanced Analysis Scripts](#advanced-analysis-scripts)
7. [Script Execution Workflow](#script-execution-workflow)

## Scoring System Overview

### 1. Architecture and Purpose

The scoring system transforms raw data into actionable insights through calculated scores:

```
Raw Microservice Data → Scoring Scripts → Analysis Endpoints → Client Visualization
        ↓                      ↓               ↓                    ↓
   Field values         Algorithm calculations  Scored datasets   User insights
   SHAP explanations    Business logic         Rankings          Decision support
   Statistical data     Domain expertise       Comparisons       Action plans
```

### 2. Available Scoring Scripts

**Primary Analysis Scripts (17 total):**

| Script | Purpose | Key Metrics |
|--------|---------|-------------|
| `strategic-value-scores.js` | Market opportunity scoring | Strategic value (0-100) |
| `competitive-analysis-scores.js` | Brand competition analysis | Competitive advantage |
| `demographic-opportunity-scores.js` | Population insights | Demographic opportunity |
| `correlation-strength-scores.js` | Statistical correlations | Correlation strength |
| `spatial-cluster-assignments.js` | Geographic clustering | Cluster membership |
| `anomaly-detection-scores.js` | Statistical outlier detection | Anomaly scores |
| `trend-strength-scores.js` | Temporal pattern analysis | Trend strength |
| `feature-importance-scores.js` | Feature ranking | Importance weights |
| `feature-interaction-scores.js` | Variable interactions | Interaction strength |
| `predictive-modeling-scores.js` | Forecasting models | Prediction accuracy |
| `scenario-analysis-scores.js` | What-if analysis | Scenario impact |
| `segment-profiling-scores.js` | Market segmentation | Segment characteristics |
| `outlier-detection-scores.js` | Data quality analysis | Outlier probability |
| `sensitivity-analysis-scores.js` | Parameter sensitivity | Sensitivity scores |
| `market-sizing-scores.js` | Market potential | Market size estimates |
| `real-estate-analysis-scores.js` | Location scoring | Property values |
| `brand-analysis-scores.js` | Multi-brand comparison | Brand performance |

### 3. Scoring Methodology

Each script follows a standardized approach:

```javascript
// 1. Load and validate input data
const data = loadMicroserviceData();
validateDataQuality(data);

// 2. Apply domain-specific scoring algorithm
function calculateScore(record) {
    const components = extractComponents(record);
    const weights = getWeights();
    return weightedScore(components, weights);
}

// 3. Generate statistics and insights
const statistics = calculateDistribution(scores);
const insights = generateInsights(data, statistics);

// 4. Save enhanced dataset
saveWithScores(data, scores, insights);
```

## Strategic Analysis Scoring

### 1. Strategic Value Formula

The strategic analysis uses a comprehensive 4-component formula:

```javascript
// Strategic Value Score = (
//   0.35 × Market Opportunity +
//   0.30 × Competitive Position +
//   0.20 × Data Reliability +
//   0.15 × Market Scale
// )

function calculateStrategicValueScore(record) {
    // Market Opportunity (35% weight)
    const demographicScore = record.demographic_opportunity_score || 0;
    const marketGap = Math.max(0, 100 - record.nike_market_share);
    const marketOpportunity = (0.60 * demographicScore) + (0.40 * marketGap);
    
    // Competitive Position (30% weight)
    const competitiveAdvantage = record.competitive_advantage_score || 0;
    const brandPositioning = Math.min((record.nike_market_share / 50) * 100, 100);
    const competitivePosition = (0.67 * competitiveAdvantage) + (0.33 * brandPositioning);
    
    // Data Reliability (20% weight)
    const correlationStrength = record.correlation_strength_score || 0;
    const clusterConsistency = record.cluster_performance_score || 50;
    const dataReliability = (0.75 * correlationStrength) + (0.25 * clusterConsistency);
    
    // Market Scale (15% weight)
    const populationScale = Math.min((record.total_population / 100000) * 100, 100);
    const economicScale = Math.min((record.median_income / 150000) * 100, 100);
    const marketScale = (0.60 * populationScale) + (0.40 * economicScale);
    
    return (0.35 * marketOpportunity) + 
           (0.30 * competitivePosition) + 
           (0.20 * dataReliability) + 
           (0.15 * marketScale);
}
```

### 2. Strategic Score Categories

Results are categorized for business interpretation:

```javascript
const STRATEGIC_CATEGORIES = {
    'Exceptional Strategic Value': { min: 90, max: 100, color: '#ff6b35' },
    'High Strategic Value': { min: 75, max: 89, color: '#f7931e' },
    'Good Strategic Value': { min: 60, max: 74, color: '#ffc425' },
    'Moderate Strategic Value': { min: 45, max: 59, color: '#4caf50' },
    'Limited Strategic Value': { min: 0, max: 44, color: '#9e9e9e' }
};
```

### 3. Strategic Script Execution

```bash
# Run strategic analysis scoring
cd scripts/scoring
node strategic-value-scores.js

# Expected output:
# 🎯 Starting Strategic Value Scoring...
# 📊 Processing 1,247 records...
# 📈 Score range: 12.3 - 94.7
# 🏆 Top opportunities identified
# ✅ Strategic value scoring complete!
```

## Competitive Analysis Scoring

### 1. Competitive Advantage Algorithm

Analyzes brand competition and market positioning:

```javascript
function calculateCompetitiveScore(record) {
    const nikeShare = record.nike_market_share || 0;
    const adidasShare = record.adidas_market_share || 0;
    const pumaShare = record.puma_market_share || 0;
    const newBalanceShare = record.new_balance_share || 0;
    
    // Direct competitive advantage vs. main competitor (Adidas)
    const directAdvantage = nikeShare - adidasShare;
    
    // Market dominance (Nike vs. all competitors)
    const totalCompetitors = adidasShare + pumaShare + newBalanceShare;
    const marketDominance = nikeShare - (totalCompetitors / 3);
    
    // Market leadership (Nike as % of top 4 brands)
    const totalTop4 = nikeShare + adidasShare + pumaShare + newBalanceShare;
    const marketLeadership = totalTop4 > 0 ? (nikeShare / totalTop4) * 100 : 0;
    
    // Competitive positioning strength
    const positioningStrength = nikeShare > 20 ? 100 : 
                               nikeShare > 15 ? 80 : 
                               nikeShare > 10 ? 60 : 
                               nikeShare > 5 ? 40 : 20;
    
    // Weighted competitive score
    return (0.40 * normalize(directAdvantage, -20, 30)) +
           (0.25 * normalize(marketDominance, -10, 40)) +
           (0.20 * normalize(marketLeadership, 0, 80)) +
           (0.15 * positioningStrength);
}
```

### 2. Market Position Categories

```javascript
const COMPETITIVE_POSITIONS = {
    'Market Leader': { threshold: 80, description: 'Dominant market position' },
    'Strong Competitor': { threshold: 65, description: 'Strong competitive position' },
    'Competitive': { threshold: 50, description: 'Competitive in market' },
    'Challenged': { threshold: 35, description: 'Facing competitive pressure' },
    'Disadvantaged': { threshold: 0, description: 'Weak competitive position' }
};
```

### 3. Competitive Script Features

```javascript
// Key outputs from competitive-analysis-scores.js
const competitiveMetrics = {
    competitive_advantage_score: calculateCompetitiveScore(record),
    market_dominance: calculateMarketDominance(record),
    competitive_position: determinePosition(record),
    competitor_gap: calculateCompetitorGap(record),
    market_share_trend: estimateTrend(record),
    competitive_threats: identifyThreats(record),
    opportunities: identifyOpportunities(record)
};
```

## Demographic Analysis Scoring

### 1. Demographic Opportunity Formula

Calculates demographic attractiveness for target markets:

```javascript
function calculateDemographicScore(record) {
    // Age demographics (30% weight) - Target young adults
    const age25_34 = record.age_25_34_pct || 0;
    const age35_44 = record.age_35_44_pct || 0;
    const ageScore = (age25_34 * 0.6) + (age35_44 * 0.4);
    
    // Income demographics (25% weight) - Target higher income
    const highIncome = record.income_100k_plus_pct || 0;
    const medianIncome = record.median_income || 0;
    const incomeScore = (highIncome * 0.7) + 
                       (Math.min(medianIncome / 150000 * 100, 100) * 0.3);
    
    // Education demographics (20% weight) - Target educated consumers
    const universityEd = record.university_educated_pct || 0;
    const collegeEd = record.college_educated_pct || 0;
    const educationScore = (universityEd * 0.7) + (collegeEd * 0.3);
    
    // Lifestyle demographics (15% weight) - Athletic/active lifestyle indicators
    const sportsParticipation = record.sports_participation_pct || 0;
    const fitnessSpending = record.fitness_spending_index || 50;
    const lifestyleScore = (sportsParticipation * 0.6) + 
                          ((fitnessSpending / 100) * 40);
    
    // Population density (10% weight) - Urban vs suburban preference
    const populationDensity = record.population_density || 0;
    const densityScore = Math.min(populationDensity / 5000 * 100, 100);
    
    return (0.30 * ageScore) +
           (0.25 * incomeScore) +
           (0.20 * educationScore) +
           (0.15 * lifestyleScore) +
           (0.10 * densityScore);
}
```

### 2. Demographic Segments

```javascript
const DEMOGRAPHIC_SEGMENTS = {
    'Premium Demographics': { min: 80, characteristics: ['High income', 'Educated', 'Young adults'] },
    'Core Demographics': { min: 65, characteristics: ['Good income', 'Active lifestyle', 'Urban'] },
    'Emerging Demographics': { min: 50, characteristics: ['Growing income', 'Mixed age', 'Suburban'] },
    'Secondary Demographics': { min: 35, characteristics: ['Moderate income', 'Family-focused'] },
    'Limited Demographics': { min: 0, characteristics: ['Budget-conscious', 'Rural', 'Older'] }
};
```

## Statistical Analysis Scripts

### 1. Correlation Strength Scoring

Measures statistical relationships between variables:

```javascript
// correlation-strength-scores.js
function calculateCorrelationScore(record, targetField, allRecords) {
    const correlations = calculateFieldCorrelations(record, targetField, allRecords);
    
    // Strength of correlation with target variable
    const primaryCorrelation = Math.abs(correlations.primary);
    
    // Number of significant correlations
    const significantCorrelations = correlations.secondary.filter(c => Math.abs(c.value) > 0.3).length;
    
    // Consistency across similar records
    const consistency = calculateConsistency(record, allRecords);
    
    return (0.50 * primaryCorrelation * 100) +
           (0.30 * Math.min(significantCorrelations * 10, 100)) +
           (0.20 * consistency * 100);
}
```

### 2. Anomaly Detection Scoring

Identifies statistical outliers and unusual patterns:

```javascript
// anomaly-detection-scores.js
function calculateAnomalyScore(record, fieldStats) {
    let anomalyScore = 0;
    let anomalyCount = 0;
    
    // Check each numeric field for anomalies
    for (const field in record) {
        if (fieldStats[field] && typeof record[field] === 'number') {
            const value = record[field];
            const stats = fieldStats[field];
            
            // Z-score calculation
            const zScore = Math.abs((value - stats.mean) / stats.stdDev);
            
            // Anomaly thresholds
            if (zScore > 3.0) anomalyScore += 100;      // Extreme outlier
            else if (zScore > 2.5) anomalyScore += 75;  // Strong outlier
            else if (zScore > 2.0) anomalyScore += 50;  // Moderate outlier
            else if (zScore > 1.5) anomalyScore += 25;  // Weak outlier
            
            anomalyCount++;
        }
    }
    
    return anomalyCount > 0 ? Math.min(anomalyScore / anomalyCount, 100) : 0;
}
```

### 3. Trend Analysis Scoring

Analyzes temporal patterns and trends:

```javascript
// trend-strength-scores.js
function calculateTrendScore(record, historicalData) {
    if (!historicalData || historicalData.length < 3) return 0;
    
    // Calculate trend strength using linear regression
    const trendSlope = calculateTrendSlope(historicalData);
    const trendR2 = calculateR2(historicalData);
    
    // Trend consistency
    const consistency = calculateTrendConsistency(historicalData);
    
    // Recent momentum
    const recentMomentum = calculateRecentMomentum(historicalData);
    
    return (0.40 * Math.abs(trendSlope) * 100) +
           (0.30 * trendR2 * 100) +
           (0.20 * consistency * 100) +
           (0.10 * recentMomentum * 100);
}
```

## Advanced Analysis Scripts

### 1. Feature Importance Scoring

Calculates SHAP-based feature importance:

```javascript
// feature-importance-scores.js
function processFeatureImportance(records) {
    const featureImpacts = {};
    
    // Aggregate SHAP values across all records
    records.forEach(record => {
        const shap = record.shap_explanation?.shap_values || {};
        
        for (const [feature, value] of Object.entries(shap)) {
            if (!featureImpacts[feature]) {
                featureImpacts[feature] = [];
            }
            featureImpacts[feature].push(Math.abs(value));
        }
    });
    
    // Calculate global importance scores
    const importance = Object.entries(featureImpacts).map(([feature, impacts]) => ({
        feature,
        importance: impacts.reduce((sum, val) => sum + val, 0) / impacts.length,
        frequency: impacts.length,
        max_impact: Math.max(...impacts),
        consistency: 1 - (standardDeviation(impacts) / mean(impacts))
    }));
    
    return importance.sort((a, b) => b.importance - a.importance);
}
```

### 2. Spatial Clustering

Performs geographic clustering analysis:

```javascript
// spatial-cluster-assignments.js
function performSpatialClustering(records, targetField) {
    // Extract geographic and target variable data
    const dataPoints = records.map(record => ({
        lat: record.latitude,
        lng: record.longitude,
        value: record[targetField] || 0,
        id: record.ID
    })).filter(point => point.lat && point.lng);
    
    // K-means clustering with geographic weighting
    const clusters = performWeightedKMeans(dataPoints, {
        k: 5,
        geographicWeight: 0.7,
        valueWeight: 0.3,
        maxIterations: 100
    });
    
    // Calculate cluster characteristics
    clusters.forEach(cluster => {
        cluster.avgValue = mean(cluster.points.map(p => p.value));
        cluster.geographic_center = calculateCentroid(cluster.points);
        cluster.cohesion = calculateCohesion(cluster.points);
        cluster.separation = calculateSeparation(cluster, clusters);
    });
    
    return clusters;
}
```

### 3. Scenario Analysis

Performs what-if scenario modeling:

```javascript
// scenario-analysis-scores.js
function generateScenarios(baseRecord, scenarios) {
    const results = [];
    
    scenarios.forEach(scenario => {
        const modifiedRecord = { ...baseRecord };
        
        // Apply scenario modifications
        scenario.modifications.forEach(mod => {
            modifiedRecord[mod.field] = applyModification(
                baseRecord[mod.field], 
                mod.type, 
                mod.value
            );
        });
        
        // Recalculate scores with modified data
        const scenarioScore = calculateStrategicValueScore(modifiedRecord);
        const impact = scenarioScore - baseRecord.strategic_value_score;
        
        results.push({
            scenario: scenario.name,
            description: scenario.description,
            original_score: baseRecord.strategic_value_score,
            scenario_score: scenarioScore,
            impact: impact,
            impact_pct: (impact / baseRecord.strategic_value_score) * 100,
            feasibility: scenario.feasibility || 'medium'
        });
    });
    
    return results.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
}
```

## Script Execution Workflow

### 1. Sequential Execution Order

Execute scripts in dependency order:

```bash
#!/bin/bash
# run-all-scoring.sh

echo "🚀 Starting complete scoring workflow..."

# Phase 1: Base statistical analysis
echo "📊 Phase 1: Statistical foundations..."
node scoring/correlation-strength-scores.js
node scoring/anomaly-detection-scores.js
node scoring/outlier-detection-scores.js

# Phase 2: Demographic and competitive analysis
echo "👥 Phase 2: Market analysis..."
node scoring/demographic-opportunity-scores.js
node scoring/competitive-analysis-scores.js
node scoring/brand-analysis-scores.js

# Phase 3: Advanced analysis (depends on Phase 1-2)
echo "🧠 Phase 3: Advanced analysis..."
node scoring/strategic-value-scores.js
node scoring/feature-importance-scores.js
node scoring/feature-interaction-scores.js

# Phase 4: Predictive and scenario analysis
echo "🔮 Phase 4: Predictive analysis..."
node scoring/predictive-modeling-scores.js
node scoring/scenario-analysis-scores.js
node scoring/trend-strength-scores.js

# Phase 5: Specialized analysis
echo "🎯 Phase 5: Specialized scoring..."
node scoring/spatial-cluster-assignments.js
node scoring/segment-profiling-scores.js
node scoring/sensitivity-analysis-scores.js
node scoring/market-sizing-scores.js

echo "✅ All scoring complete!"
```

### 2. Automated Workflow Script

Create `run-complete-scoring.py` for automated execution:

```python
import subprocess
import json
import time
from pathlib import Path

def run_scoring_workflow():
    """Execute all scoring scripts in correct order"""
    
    # Define script execution order and dependencies
    script_phases = [
        {
            'name': 'Statistical Foundations',
            'scripts': [
                'correlation-strength-scores.js',
                'anomaly-detection-scores.js',
                'outlier-detection-scores.js'
            ]
        },
        {
            'name': 'Market Analysis', 
            'scripts': [
                'demographic-opportunity-scores.js',
                'competitive-analysis-scores.js',
                'brand-analysis-scores.js'
            ]
        },
        {
            'name': 'Advanced Analysis',
            'scripts': [
                'strategic-value-scores.js',
                'feature-importance-scores.js',
                'feature-interaction-scores.js'
            ]
        },
        {
            'name': 'Predictive Analysis',
            'scripts': [
                'predictive-modeling-scores.js',
                'scenario-analysis-scores.js',
                'trend-strength-scores.js'
            ]
        },
        {
            'name': 'Specialized Analysis',
            'scripts': [
                'spatial-cluster-assignments.js',
                'segment-profiling-scores.js',
                'sensitivity-analysis-scores.js',
                'market-sizing-scores.js'
            ]
        }
    ]
    
    total_scripts = sum(len(phase['scripts']) for phase in script_phases)
    executed_scripts = 0
    
    print(f"🚀 Starting complete scoring workflow ({total_scripts} scripts)...")
    start_time = time.time()
    
    for phase in script_phases:
        print(f"\n📊 {phase['name']}...")
        
        for script in phase['scripts']:
            script_path = Path('scoring') / script
            
            if script_path.exists():
                print(f"   Running {script}...")
                
                result = subprocess.run([
                    'node', str(script_path)
                ], capture_output=True, text=True)
                
                if result.returncode == 0:
                    print(f"   ✅ {script} completed successfully")
                else:
                    print(f"   ❌ {script} failed: {result.stderr}")
                    return False
                
                executed_scripts += 1
            else:
                print(f"   ⚠️ {script} not found, skipping...")
    
    elapsed_time = time.time() - start_time
    print(f"\n✅ Scoring workflow complete!")
    print(f"📊 Executed {executed_scripts}/{total_scripts} scripts")
    print(f"⏱️ Total time: {elapsed_time:.1f} seconds")
    
    return True

if __name__ == "__main__":
    success = run_scoring_workflow()
    exit(0 if success else 1)
```

### 3. Validation and Testing

Validate scoring results:

```bash
# Validate all scoring results
python validate-scoring-results.py

# Test specific analysis
python test-strategic-analysis.py

# Generate scoring report
python generate-scoring-report.py
```

## Scoring Scripts Checklist

### Pre-Execution Setup
- [ ] Microservice data exported to `microservice-export.json`
- [ ] All required Node.js dependencies installed
- [ ] Scoring scripts directory exists and contains all 17 scripts
- [ ] Input data validation passes quality checks

### Execution Workflow
- [ ] Phase 1 scripts complete (statistical foundations)
- [ ] Phase 2 scripts complete (market analysis)  
- [ ] Phase 3 scripts complete (advanced analysis)
- [ ] Phase 4 scripts complete (predictive analysis)
- [ ] Phase 5 scripts complete (specialized analysis)
- [ ] No script execution errors or failures

### Output Validation
- [ ] All records have calculated scores in expected ranges (0-100)
- [ ] Score distributions are reasonable (not all zeros or extremes)
- [ ] Top/bottom rankings make business sense
- [ ] Statistical metadata is generated for each analysis type
- [ ] Enhanced datasets saved successfully

### Integration Testing
- [ ] Scored data loads correctly in endpoint generation
- [ ] Client application can parse and display scores
- [ ] Visualizations render score-based insights properly
- [ ] Rankings and comparisons work as expected

---

**Next Steps**: Once scoring is complete, proceed to [MICROSERVICE_05_COMPLETE_WORKFLOW.md](./MICROSERVICE_05_COMPLETE_WORKFLOW.md) for the complete end-to-end migration workflow.

**Last Updated**: January 2025  
**Compatibility**: Node.js 16+, Python 3.11+, Statistical libraries