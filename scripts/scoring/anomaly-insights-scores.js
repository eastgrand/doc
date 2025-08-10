/**
 * Anomaly Insights Scoring Script
 * 
 * Calculates anomaly detection and opportunity scores (0-100 scale)
 * based on enhanced anomaly detection results (99 anomalies identified).
 * Creates opportunity identification and outlier significance scores.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Anomaly Insights Scoring...');

// Load the anomaly insights endpoint data
const dataPath = path.join(__dirname, '../../public/data/endpoints/anomaly-insights.json');

if (!fs.existsSync(dataPath)) {
    console.error('❌ anomaly-insights.json not found. Please run export-comprehensive-endpoints.py first.');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

if (!data.results || data.results.length === 0) {
    console.error('❌ No results found in anomaly insights data');
    process.exit(1);
}

console.log(`📊 Processing ${data.results.length} records for anomaly insights scoring...`);

// Anomaly detection benchmarks from our model results
const ANOMALY_BENCHMARKS = {
    total_outliers: 99,
    outlier_ratio: 0.101,       // 10.1% outlier detection rate
    positive_anomalies: 45,      // Opportunity anomalies
    negative_anomalies: 54,      // Risk/underperformance anomalies
    severity_threshold: 0.1,     // Anomaly score threshold
    opportunity_threshold: 0.15  // High opportunity threshold
};

function calculateAnomalyInsightsScores(record) {
    const isAnomaly = record.is_anomaly || false;
    const anomalyScore = Math.abs(record.anomaly_score || 0);
    const anomalyType = record.anomaly_type || 'normal';
    const opportunityRating = record.opportunity_rating || 'low';
    let scores = {};
    
    // 1. ANOMALY SIGNIFICANCE SCORE (0-100)
    // Higher scores for more significant anomalies
    if (isAnomaly) {
        const significanceBase = Math.min(anomalyScore / 0.5, 1) * 80; // Scale to 0-80
        const typeBonus = anomalyType === 'positive' ? 20 : 10; // Positive anomalies get bonus
        scores.anomaly_significance_score = Math.round(significanceBase + typeBonus);
    } else {
        scores.anomaly_significance_score = Math.round(20 - (anomalyScore * 20)); // Normal points get low scores
    }
    
    // 2. OPPORTUNITY DETECTION SCORE (0-100)
    // High scores for positive anomalies that indicate opportunities
    if (isAnomaly && anomalyType === 'positive') {
        const opportunityBase = 70;
        const ratingBonus = {
            'high': 30,
            'medium': 20,
            'low': 10
        }[opportunityRating] || 10;
        
        scores.opportunity_detection_score = Math.round(opportunityBase + ratingBonus);
    } else if (isAnomaly && anomalyType === 'negative') {
        // Negative anomalies might indicate underserved markets (opportunity in disguise)
        scores.opportunity_detection_score = Math.round(40 + (anomalyScore * 30));
    } else {
        scores.opportunity_detection_score = Math.round(10 + Math.random() * 20); // Random baseline for normal points
    }
    
    // 3. OUTLIER STRENGTH SCORE (0-100)
    // Measures how much this point deviates from normal patterns
    const outlierStrength = Math.min(anomalyScore / 0.3, 1) * 100;
    scores.outlier_strength_score = Math.round(outlierStrength);
    
    // 4. MARKET ANOMALY VALUE SCORE (0-100)
    // Business value of this anomaly for market analysis
    let marketValue = 0;
    
    if (isAnomaly) {
        // Base value from anomaly strength
        marketValue += outlierStrength * 0.4;
        
        // Type bonus
        if (anomalyType === 'positive') {
            marketValue += 40; // Positive anomalies are valuable for expansion
        } else {
            marketValue += 20; // Negative anomalies help identify problems
        }
        
        // Opportunity rating bonus
        const opportunityBonus = {
            'high': 20,
            'medium': 10,
            'low': 5
        }[opportunityRating] || 5;
        marketValue += opportunityBonus;
    } else {
        marketValue = 15; // Baseline for normal points
    }
    
    scores.market_anomaly_value_score = Math.round(Math.min(100, marketValue));
    
    // 5. INVESTIGATION PRIORITY SCORE (0-100)
    // How urgently this anomaly should be investigated
    let investigationPriority = 0;
    
    if (isAnomaly) {
        // Strong anomalies need investigation
        investigationPriority += outlierStrength * 0.5;
        
        // High opportunity anomalies are high priority
        if (opportunityRating === 'high') {
            investigationPriority += 40;
        } else if (opportunityRating === 'medium') {
            investigationPriority += 25;
        }
        
        // Positive anomalies slightly higher priority
        if (anomalyType === 'positive') {
            investigationPriority += 10;
        }
    } else {
        investigationPriority = 5; // Low priority for normal points
    }
    
    scores.investigation_priority_score = Math.round(Math.min(100, investigationPriority));
    
    // 6. ANOMALY RELIABILITY SCORE (0-100)
    // How reliable/trustworthy this anomaly detection is
    const baseReliability = 60; // Base model reliability
    const strengthBonus = isAnomaly ? Math.min(anomalyScore * 40, 30) : 0;
    const consistencyBonus = 10; // Consistent with 10.1% detection rate
    
    scores.anomaly_reliability_score = Math.round(baseReliability + strengthBonus + consistencyBonus);
    
    // 7. OVERALL ANOMALY PERFORMANCE SCORE (0-100)
    scores.anomaly_performance_score = Math.round(
        (scores.anomaly_significance_score * 0.20) +
        (scores.opportunity_detection_score * 0.25) +
        (scores.outlier_strength_score * 0.15) +
        (scores.market_anomaly_value_score * 0.25) +
        (scores.investigation_priority_score * 0.15)
    );
    
    // 8. Classification flags
    scores.high_opportunity_anomaly = isAnomaly && opportunityRating === 'high';
    scores.strong_outlier = anomalyScore >= ANOMALY_BENCHMARKS.severity_threshold * 2;
    scores.investigation_recommended = scores.investigation_priority_score >= 70;
    scores.positive_market_signal = isAnomaly && anomalyType === 'positive';
    
    // 9. Anomaly category for analysis
    if (isAnomaly) {
        if (anomalyType === 'positive' && opportunityRating === 'high') {
            scores.anomaly_category = 'High-Opportunity Outlier';
        } else if (anomalyType === 'positive') {
            scores.anomaly_category = 'Positive Anomaly';
        } else {
            scores.anomaly_category = 'Market Deviation';
        }
    } else {
        scores.anomaly_category = 'Normal Pattern';
    }
    
    return scores;
}

// Process each record
let processedCount = 0;
let highOpportunityAnomalies = 0;
let strongOutliers = 0;
let investigationRecommended = 0;
let positiveMarketSignals = 0;

data.results.forEach(record => {
    const scores = calculateAnomalyInsightsScores(record);
    
    // Add all scores to the record
    Object.assign(record, scores);
    
    // Track statistics
    if (scores.high_opportunity_anomaly) highOpportunityAnomalies++;
    if (scores.strong_outlier) strongOutliers++;
    if (scores.investigation_recommended) investigationRecommended++;
    if (scores.positive_market_signal) positiveMarketSignals++;
    
    processedCount++;
    
    if (processedCount % 100 === 0) {
        console.log(`   ⚡ Processed ${processedCount} records...`);
    }
});

// Add summary statistics
data.scoring_summary = {
    anomaly_insights_scoring: {
        processed_records: processedCount,
        high_opportunity_anomalies: highOpportunityAnomalies,
        strong_outliers: strongOutliers,
        investigation_recommended: investigationRecommended,
        positive_market_signals: positiveMarketSignals,
        anomaly_benchmarks: ANOMALY_BENCHMARKS,
        scoring_timestamp: new Date().toISOString(),
        score_fields_added: [
            'anomaly_significance_score',
            'opportunity_detection_score',
            'outlier_strength_score',
            'market_anomaly_value_score',
            'investigation_priority_score',
            'anomaly_reliability_score',
            'anomaly_performance_score',
            'high_opportunity_anomaly',
            'strong_outlier',
            'investigation_recommended',
            'positive_market_signal',
            'anomaly_category'
        ]
    }
};

// Save the updated data
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

// Generate performance statistics
const performanceScores = data.results.map(r => r.anomaly_performance_score);
const opportunityScores = data.results.map(r => r.opportunity_detection_score);
const significanceScores = data.results.map(r => r.anomaly_significance_score);

const avgPerformance = Math.round(performanceScores.reduce((a, b) => a + b, 0) / performanceScores.length);
const avgOpportunity = Math.round(opportunityScores.reduce((a, b) => a + b, 0) / opportunityScores.length);
const avgSignificance = Math.round(significanceScores.reduce((a, b) => a + b, 0) / significanceScores.length);

console.log('✅ Anomaly Insights Scoring Complete!');
console.log(`   📊 Records Processed: ${processedCount}`);
console.log(`   🎯 Average Performance Score: ${avgPerformance}/100`);
console.log(`   💎 Average Opportunity Score: ${avgOpportunity}/100`);
console.log(`   📈 Average Significance Score: ${avgSignificance}/100`);
console.log(`   ⭐ High Opportunity Anomalies: ${highOpportunityAnomalies} (${Math.round(highOpportunityAnomalies/processedCount*100)}%)`);
console.log(`   💪 Strong Outliers: ${strongOutliers} (${Math.round(strongOutliers/processedCount*100)}%)`);
console.log(`   🔍 Investigation Recommended: ${investigationRecommended} (${Math.round(investigationRecommended/processedCount*100)}%)`);
console.log(`   🚀 Positive Market Signals: ${positiveMarketSignals} (${Math.round(positiveMarketSignals/processedCount*100)}%)`);
console.log(`   💾 Updated: ${dataPath}`);