/**
 * Model Selection Scoring Script
 * 
 * Calculates algorithm recommendation and selection scores (0-100 scale)
 * based on dynamic model selection for each geographic area.
 * Creates model suitability and recommendation confidence scores.
 */

const fs = require('fs');
const path = require('path');

console.log('🤖 Starting Model Selection Scoring...');

// Load the model selection endpoint data
const dataPath = path.join(__dirname, '../../public/data/endpoints/model-selection.json');

if (!fs.existsSync(dataPath)) {
    console.error('❌ model-selection.json not found. Please run export-comprehensive-endpoints.py first.');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

if (!data.results || data.results.length === 0) {
    console.error('❌ No results found in model selection data');
    process.exit(1);
}

console.log(`📊 Processing ${data.results.length} records for model selection scoring...`);

// Algorithm performance benchmarks from our comprehensive training
const ALGORITHM_BENCHMARKS = {
    'xgboost': { r2: 0.608, complexity: 0.7, interpretability: 0.6 },
    'svr': { r2: 0.609, complexity: 0.8, interpretability: 0.4 },
    'random_forest': { r2: 0.513, complexity: 0.5, interpretability: 0.8 },
    'knn': { r2: 0.471, complexity: 0.3, interpretability: 0.9 },
    'neural_network': { r2: 0.284, complexity: 0.9, interpretability: 0.2 },
    'linear_regression': { r2: 0.297, complexity: 0.2, interpretability: 1.0 },
    'ridge_regression': { r2: 0.349, complexity: 0.3, interpretability: 0.9 },
    'ensemble': { r2: 0.879, complexity: 0.8, interpretability: 0.5 }
};

function calculateModelSelectionScores(record) {
    const recommendedAlgorithm = record.recommended_algorithm || 'xgboost';
    const performanceMetrics = record.performance_metrics || {};
    const dataCharacteristics = record.data_characteristics || {};
    let scores = {};
    
    // 1. RECOMMENDATION CONFIDENCE SCORE (0-100)
    // Based on how well the recommended algorithm fits this area's data
    const algorithmBench = ALGORITHM_BENCHMARKS[recommendedAlgorithm] || ALGORITHM_BENCHMARKS['xgboost'];
    const baseConfidence = algorithmBench.r2 * 100;
    
    // Bonus for high-performing algorithms
    const performanceBonus = algorithmBench.r2 > 0.6 ? 10 : 
                            algorithmBench.r2 > 0.4 ? 5 : 0;
    
    scores.recommendation_confidence_score = Math.round(Math.min(100, baseConfidence + performanceBonus));
    
    // 2. ALGORITHM SUITABILITY SCORE (0-100)
    // How well this algorithm matches the data characteristics
    let suitabilityScore = algorithmBench.r2 * 60; // Base from performance
    
    // Data size factor
    const dataSize = dataCharacteristics.sample_size || 500;
    if (dataSize > 1000) {
        // Large datasets favor complex algorithms
        if (algorithmBench.complexity > 0.6) suitabilityScore += 20;
    } else {
        // Small datasets favor simpler algorithms
        if (algorithmBench.complexity < 0.5) suitabilityScore += 15;
    }
    
    // Feature count factor
    const featureCount = dataCharacteristics.feature_count || 20;
    if (featureCount > 30) {
        // Many features favor ensemble methods
        if (['xgboost', 'random_forest', 'ensemble'].includes(recommendedAlgorithm)) {
            suitabilityScore += 15;
        }
    }
    
    scores.algorithm_suitability_score = Math.round(Math.min(100, suitabilityScore + 20));
    
    // 3. MODEL PERFORMANCE PREDICTION SCORE (0-100)
    // Predicted performance of recommended algorithm on this data
    const expectedPerformance = performanceMetrics.expected_r2 || algorithmBench.r2;
    const confidenceInterval = performanceMetrics.confidence_interval || { width: 0.1 };
    
    const performancePrediction = expectedPerformance * 80;
    const precisionBonus = Math.max(0, 20 - (confidenceInterval.width * 100));
    
    scores.model_performance_prediction_score = Math.round(performancePrediction + precisionBonus);
    
    // 4. INTERPRETABILITY BENEFIT SCORE (0-100)
    // Business value of algorithm interpretability
    const interpretabilityValue = algorithmBench.interpretability * 70;
    const businessBonus = recommendedAlgorithm === 'linear_regression' ? 30 : 
                         recommendedAlgorithm === 'random_forest' ? 20 :
                         recommendedAlgorithm === 'knn' ? 25 : 10;
    
    scores.interpretability_benefit_score = Math.round(interpretabilityValue + businessBonus);
    
    // 5. ALTERNATIVE ALGORITHM SCORE (0-100)
    // Value of having alternative algorithm options
    const alternativeOptions = record.alternative_algorithms || [];
    const alternativeCount = alternativeOptions.length;
    
    let alternativeValue = Math.min(alternativeCount * 15, 60);
    
    // Bonus if alternatives include high-performing algorithms
    if (alternativeOptions.includes('ensemble')) alternativeValue += 20;
    if (alternativeOptions.includes('svr')) alternativeValue += 15;
    
    scores.alternative_algorithm_score = Math.round(Math.min(100, alternativeValue + 20));
    
    // 6. SELECTION RELIABILITY SCORE (0-100)
    // How reliable this model selection recommendation is
    const selectionFactors = [
        scores.recommendation_confidence_score * 0.3,
        scores.algorithm_suitability_score * 0.3, 
        scores.model_performance_prediction_score * 0.2,
        Math.min(dataSize / 10, 20) // Data size reliability factor
    ];
    
    scores.selection_reliability_score = Math.round(
        selectionFactors.reduce((sum, factor) => sum + factor, 0)
    );
    
    // 7. OVERALL MODEL SELECTION SCORE (0-100)
    scores.model_selection_performance_score = Math.round(
        (scores.recommendation_confidence_score * 0.25) +
        (scores.algorithm_suitability_score * 0.25) +
        (scores.model_performance_prediction_score * 0.20) +
        (scores.interpretability_benefit_score * 0.15) +
        (scores.selection_reliability_score * 0.15)
    );
    
    // 8. Classification flags and recommendations
    scores.high_confidence_recommendation = scores.recommendation_confidence_score >= 75;
    scores.optimal_algorithm_match = scores.algorithm_suitability_score >= 80;
    scores.interpretable_choice = algorithmBench.interpretability >= 0.7;
    scores.high_performance_expected = expectedPerformance >= 0.6;
    
    // 9. Algorithm category and reasoning
    if (recommendedAlgorithm === 'ensemble') {
        scores.selection_reasoning = 'Highest accuracy (87.9%) - Best for critical predictions';
        scores.algorithm_category = 'High Performance';
    } else if (['xgboost', 'svr'].includes(recommendedAlgorithm)) {
        scores.selection_reasoning = 'Strong performance with good balance of accuracy and efficiency';
        scores.algorithm_category = 'Balanced Performance';
    } else if (['linear_regression', 'knn'].includes(recommendedAlgorithm)) {
        scores.selection_reasoning = 'High interpretability for business understanding';
        scores.algorithm_category = 'Interpretable';
    } else {
        scores.selection_reasoning = 'Specialized algorithm for specific data characteristics';
        scores.algorithm_category = 'Specialized';
    }
    
    return scores;
}

// Process each record
let processedCount = 0;
let highConfidenceRecommendations = 0;
let optimalMatches = 0;
let interpretableChoices = 0;
let highPerformanceExpected = 0;

// Track algorithm recommendation distribution
const algorithmDistribution = {};

data.results.forEach(record => {
    const scores = calculateModelSelectionScores(record);
    
    // Add all scores to the record
    Object.assign(record, scores);
    
    // Track statistics
    if (scores.high_confidence_recommendation) highConfidenceRecommendations++;
    if (scores.optimal_algorithm_match) optimalMatches++;
    if (scores.interpretable_choice) interpretableChoices++;
    if (scores.high_performance_expected) highPerformanceExpected++;
    
    // Track algorithm distribution
    const algorithm = record.recommended_algorithm || 'unknown';
    algorithmDistribution[algorithm] = (algorithmDistribution[algorithm] || 0) + 1;
    
    processedCount++;
    
    if (processedCount % 100 === 0) {
        console.log(`   ⚡ Processed ${processedCount} records...`);
    }
});

// Add summary statistics
data.scoring_summary = {
    model_selection_scoring: {
        processed_records: processedCount,
        high_confidence_recommendations: highConfidenceRecommendations,
        optimal_algorithm_matches: optimalMatches,
        interpretable_choices: interpretableChoices,
        high_performance_expected: highPerformanceExpected,
        algorithm_distribution: algorithmDistribution,
        algorithm_benchmarks: ALGORITHM_BENCHMARKS,
        scoring_timestamp: new Date().toISOString(),
        score_fields_added: [
            'recommendation_confidence_score',
            'algorithm_suitability_score',
            'model_performance_prediction_score',
            'interpretability_benefit_score',
            'alternative_algorithm_score',
            'selection_reliability_score',
            'model_selection_performance_score',
            'high_confidence_recommendation',
            'optimal_algorithm_match',
            'interpretable_choice',
            'high_performance_expected',
            'selection_reasoning',
            'algorithm_category'
        ]
    }
};

// Save the updated data
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

// Generate performance statistics
const performanceScores = data.results.map(r => r.model_selection_performance_score);
const confidenceScores = data.results.map(r => r.recommendation_confidence_score);
const suitabilityScores = data.results.map(r => r.algorithm_suitability_score);

const avgPerformance = Math.round(performanceScores.reduce((a, b) => a + b, 0) / performanceScores.length);
const avgConfidence = Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length);
const avgSuitability = Math.round(suitabilityScores.reduce((a, b) => a + b, 0) / suitabilityScores.length);

console.log('✅ Model Selection Scoring Complete!');
console.log(`   📊 Records Processed: ${processedCount}`);
console.log(`   🎯 Average Performance Score: ${avgPerformance}/100`);
console.log(`   🔮 Average Confidence Score: ${avgConfidence}/100`);
console.log(`   🎪 Average Suitability Score: ${avgSuitability}/100`);
console.log(`   ⭐ High Confidence Recommendations: ${highConfidenceRecommendations} (${Math.round(highConfidenceRecommendations/processedCount*100)}%)`);
console.log(`   🎯 Optimal Algorithm Matches: ${optimalMatches} (${Math.round(optimalMatches/processedCount*100)}%)`);
console.log(`   📖 Interpretable Choices: ${interpretableChoices} (${Math.round(interpretableChoices/processedCount*100)}%)`);
console.log(`   🚀 High Performance Expected: ${highPerformanceExpected} (${Math.round(highPerformanceExpected/processedCount*100)}%)`);
console.log(`   📊 Algorithm Distribution:`, algorithmDistribution);
console.log(`   💾 Updated: ${dataPath}`);