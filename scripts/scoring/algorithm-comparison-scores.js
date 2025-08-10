/**
 * Algorithm Comparison Scoring Script
 * 
 * Calculates algorithm performance and reliability scores (0-100 scale)
 * based on 8 supervised algorithms performance comparison.
 * Creates comprehensive model reliability and recommendation scores.
 */

const fs = require('fs');
const path = require('path');

console.log('🧠 Starting Algorithm Comparison Scoring...');

// Load the algorithm comparison endpoint data
const dataPath = path.join(__dirname, '../../public/data/endpoints/algorithm-comparison.json');

if (!fs.existsSync(dataPath)) {
    console.error('❌ algorithm-comparison.json not found. Please run export-comprehensive-endpoints.py first.');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

if (!data.results || data.results.length === 0) {
    console.error('❌ No results found in algorithm comparison data');
    process.exit(1);
}

console.log(`📊 Processing ${data.results.length} records for algorithm comparison scoring...`);

// Known R² scores from our comprehensive model training
const ALGORITHM_BENCHMARKS = {
    'xgboost': 0.608,
    'svr': 0.609,
    'random_forest': 0.513,
    'knn': 0.471,
    'ridge_regression': 0.349,
    'linear_regression': 0.297,
    'neural_network': 0.284,
    'lasso_regression': 0.265
};

function calculateAlgorithmComparisonScores(record) {
    const predictions = record.algorithm_predictions || {};
    let scores = {};
    
    // 1. ALGORITHM RELIABILITY SCORE (0-100)
    // Based on R² performance and prediction consistency
    let reliabilitySum = 0;
    let reliabilityCount = 0;
    
    Object.keys(predictions).forEach(algorithm => {
        if (ALGORITHM_BENCHMARKS[algorithm]) {
            const r2Score = predictions[algorithm].r2_score || ALGORITHM_BENCHMARKS[algorithm];
            const confidence = predictions[algorithm].confidence || 0.5;
            
            // Reliability = (R² * 100) * confidence_weight
            const reliability = (r2Score * 100) * (0.7 + confidence * 0.3);
            reliabilitySum += reliability;
            reliabilityCount++;
        }
    });
    
    scores.algorithm_reliability_score = reliabilityCount > 0 ? 
        Math.round(reliabilitySum / reliabilityCount) : 50;
    
    // 2. PREDICTION CONSENSUS SCORE (0-100)
    // Higher when algorithms agree, lower when they disagree
    const predictionValues = Object.values(predictions).map(p => p.prediction || 0);
    if (predictionValues.length > 1) {
        const mean = predictionValues.reduce((a, b) => a + b, 0) / predictionValues.length;
        const variance = predictionValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / predictionValues.length;
        const standardDev = Math.sqrt(variance);
        
        // Lower standard deviation = higher consensus
        const consensusScore = Math.max(0, 100 - (standardDev * 20));
        scores.prediction_consensus_score = Math.round(consensusScore);
    } else {
        scores.prediction_consensus_score = 50;
    }
    
    // 3. BEST ALGORITHM CONFIDENCE SCORE (0-100)
    const bestAlgorithm = record.best_algorithm;
    if (bestAlgorithm && predictions[bestAlgorithm]) {
        const bestConfidence = predictions[bestAlgorithm].confidence || 0.5;
        const bestR2 = predictions[bestAlgorithm].r2_score || ALGORITHM_BENCHMARKS[bestAlgorithm] || 0.5;
        
        // Confidence score combines model confidence and R² performance
        scores.best_algorithm_confidence_score = Math.round((bestConfidence * 60) + (bestR2 * 40));
    } else {
        scores.best_algorithm_confidence_score = 50;
    }
    
    // 4. MODEL DIVERSITY BENEFIT SCORE (0-100)
    // Higher scores when multiple algorithms provide value
    const algorithmCount = Object.keys(predictions).length;
    const highPerformingAlgorithms = Object.entries(predictions)
        .filter(([_, pred]) => (pred.r2_score || 0) > 0.4).length;
    
    const diversityBonus = Math.min(algorithmCount * 10, 50);
    const performanceBonus = Math.min(highPerformingAlgorithms * 15, 50);
    scores.model_diversity_benefit_score = Math.round(diversityBonus + performanceBonus);
    
    // 5. OVERALL ALGORITHM PERFORMANCE SCORE (0-100)
    // Weighted combination of all factors
    scores.algorithm_performance_score = Math.round(
        (scores.algorithm_reliability_score * 0.3) +
        (scores.prediction_consensus_score * 0.25) +
        (scores.best_algorithm_confidence_score * 0.25) +
        (scores.model_diversity_benefit_score * 0.2)
    );
    
    return scores;
}

// Process each record
let processedCount = 0;
data.results.forEach(record => {
    const scores = calculateAlgorithmComparisonScores(record);
    
    // Add all scores to the record
    Object.assign(record, scores);
    
    processedCount++;
    
    if (processedCount % 100 === 0) {
        console.log(`   ⚡ Processed ${processedCount} records...`);
    }
});

// Add summary statistics
data.scoring_summary = {
    algorithm_comparison_scoring: {
        processed_records: processedCount,
        scoring_timestamp: new Date().toISOString(),
        algorithm_benchmarks: ALGORITHM_BENCHMARKS,
        score_fields_added: [
            'algorithm_reliability_score',
            'prediction_consensus_score', 
            'best_algorithm_confidence_score',
            'model_diversity_benefit_score',
            'algorithm_performance_score'
        ]
    }
};

// Save the updated data
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

// Generate performance statistics
const reliabilityScores = data.results.map(r => r.algorithm_reliability_score);
const consensusScores = data.results.map(r => r.prediction_consensus_score);
const performanceScores = data.results.map(r => r.algorithm_performance_score);

const avgReliability = Math.round(reliabilityScores.reduce((a, b) => a + b, 0) / reliabilityScores.length);
const avgConsensus = Math.round(consensusScores.reduce((a, b) => a + b, 0) / consensusScores.length);
const avgPerformance = Math.round(performanceScores.reduce((a, b) => a + b, 0) / performanceScores.length);

console.log('✅ Algorithm Comparison Scoring Complete!');
console.log(`   📊 Records Processed: ${processedCount}`);
console.log(`   🎯 Average Algorithm Reliability: ${avgReliability}/100`);
console.log(`   🤝 Average Prediction Consensus: ${avgConsensus}/100`);
console.log(`   ⚡ Average Performance Score: ${avgPerformance}/100`);
console.log(`   💾 Updated: ${dataPath}`);