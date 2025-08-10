/**
 * Consensus Analysis Scoring Script
 * 
 * Calculates multi-model consensus and uncertainty quantification scores (0-100 scale)
 * based on predictions from multiple models with voting and confidence measures.
 * Creates prediction reliability and consensus strength scores.
 */

const fs = require('fs');
const path = require('path');

console.log('🤝 Starting Consensus Analysis Scoring...');

// Load the consensus analysis endpoint data
const dataPath = path.join(__dirname, '../../public/data/endpoints/consensus-analysis.json');

if (!fs.existsSync(dataPath)) {
    console.error('❌ consensus-analysis.json not found. Please run export-comprehensive-endpoints.py first.');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

if (!data.results || data.results.length === 0) {
    console.error('❌ No results found in consensus analysis data');
    process.exit(1);
}

console.log(`📊 Processing ${data.results.length} records for consensus analysis scoring...`);

// Consensus analysis benchmarks
const CONSENSUS_BENCHMARKS = {
    models_used: ['xgboost', 'svr', 'random_forest', 'ensemble'],
    ensemble_weight: 0.4,      // Higher weight for ensemble model
    agreement_threshold: 0.8,   // High agreement threshold
    confidence_threshold: 0.75, // High confidence threshold
    uncertainty_tolerance: 0.15 // Low uncertainty tolerance
};

function calculateConsensusAnalysisScores(record) {
    const modelPredictions = record.model_predictions || {};
    const consensusPrediction = record.consensus_prediction || 0;
    const votingResults = record.voting_results || {};
    const uncertaintyMeasures = record.uncertainty_measures || {};
    let scores = {};
    
    // 1. MODEL AGREEMENT SCORE (0-100)
    // How much the different models agree on the prediction
    const predictionValues = Object.values(modelPredictions);
    if (predictionValues.length > 1) {
        const mean = predictionValues.reduce((a, b) => a + b, 0) / predictionValues.length;
        const variance = predictionValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / predictionValues.length;
        const standardDev = Math.sqrt(variance);
        
        // Lower standard deviation = higher agreement
        const agreementBase = Math.max(0, 100 - (standardDev * 50));
        const consistencyBonus = standardDev < 0.1 ? 20 : standardDev < 0.2 ? 10 : 0;
        
        scores.model_agreement_score = Math.round(Math.min(100, agreementBase + consistencyBonus));
    } else {
        scores.model_agreement_score = 50; // Default for single model
    }
    
    // 2. CONSENSUS CONFIDENCE SCORE (0-100)
    // Confidence in the consensus prediction
    const ensemblePrediction = modelPredictions.ensemble || consensusPrediction;
    const otherModels = Object.entries(modelPredictions)
        .filter(([model, _]) => model !== 'ensemble')
        .map(([_, prediction]) => prediction);
    
    let confidenceScore = 50; // Base confidence
    
    // Ensemble model bonus (our best model with R² = 0.879)
    if (ensemblePrediction) {
        confidenceScore += 25; // Strong bonus for ensemble
    }
    
    // Agreement with ensemble bonus
    if (otherModels.length > 0 && ensemblePrediction) {
        const avgOthers = otherModels.reduce((a, b) => a + b, 0) / otherModels.length;
        const ensembleAgreement = 1 - Math.abs(ensemblePrediction - avgOthers) / Math.max(ensemblePrediction, avgOthers);
        confidenceScore += ensembleAgreement * 25;
    }
    
    scores.consensus_confidence_score = Math.round(Math.min(100, confidenceScore));
    
    // 3. PREDICTION RELIABILITY SCORE (0-100)
    // Overall reliability of the consensus prediction
    const modelCount = Object.keys(modelPredictions).length;
    const diversityBonus = Math.min(modelCount * 15, 50);
    
    // High-performing model presence bonus
    let performanceBonus = 0;
    if (modelPredictions.ensemble) performanceBonus += 30; // Best model
    if (modelPredictions.svr) performanceBonus += 15;      // Second best
    if (modelPredictions.xgboost) performanceBonus += 15;  // Third best
    
    scores.prediction_reliability_score = Math.round(
        Math.min(100, (scores.model_agreement_score * 0.4) + diversityBonus + performanceBonus)
    );
    
    // 4. UNCERTAINTY QUANTIFICATION SCORE (0-100)
    // How well uncertainty is quantified and communicated
    const uncertaintyMean = uncertaintyMeasures.mean || 0.1;
    const uncertaintyStd = uncertaintyMeasures.std || 0.05;
    const confidenceInterval = uncertaintyMeasures.confidence_interval || { width: 0.2 };
    
    // Lower uncertainty = higher score
    const uncertaintyBase = Math.max(0, 100 - (uncertaintyMean * 200));
    const precisionBonus = Math.max(0, 30 - (confidenceInterval.width * 100));
    const stabilityBonus = uncertaintyStd < 0.03 ? 15 : uncertaintyStd < 0.07 ? 10 : 5;
    
    scores.uncertainty_quantification_score = Math.round(
        Math.min(100, uncertaintyBase + precisionBonus + stabilityBonus)
    );
    
    // 5. VOTING CONSENSUS STRENGTH SCORE (0-100)
    // Strength of the voting consensus among models
    const totalVotes = Object.values(votingResults).reduce((sum, votes) => sum + votes, 0);
    if (totalVotes > 0) {
        const voteValues = Object.values(votingResults);
        const maxVotes = Math.max(...voteValues);
        const consensusRatio = maxVotes / totalVotes;
        
        const votingStrength = consensusRatio * 80;
        const participationBonus = totalVotes >= 4 ? 20 : totalVotes * 5;
        
        scores.voting_consensus_strength_score = Math.round(votingStrength + participationBonus);
    } else {
        scores.voting_consensus_strength_score = scores.model_agreement_score; // Fallback to agreement
    }
    
    // 6. MULTI-MODEL VALUE SCORE (0-100)
    // Business value of using multiple models vs single model
    const singleModelConfidence = 60; // Baseline single model confidence
    const multiModelBonus = (modelCount - 1) * 10;
    const diversityValue = modelCount >= 4 ? 25 : modelCount >= 3 ? 15 : 10;
    const consensusValue = scores.model_agreement_score > 70 ? 15 : 5;
    
    scores.multi_model_value_score = Math.round(
        Math.min(100, singleModelConfidence + multiModelBonus + diversityValue + consensusValue)
    );
    
    // 7. OVERALL CONSENSUS PERFORMANCE SCORE (0-100)
    scores.consensus_performance_score = Math.round(
        (scores.model_agreement_score * 0.20) +
        (scores.consensus_confidence_score * 0.25) +
        (scores.prediction_reliability_score * 0.20) +
        (scores.uncertainty_quantification_score * 0.15) +
        (scores.voting_consensus_strength_score * 0.10) +
        (scores.multi_model_value_score * 0.10)
    );
    
    // 8. Classification flags
    scores.high_model_agreement = scores.model_agreement_score >= 80;
    scores.reliable_consensus = scores.prediction_reliability_score >= 75;
    scores.low_uncertainty = uncertaintyMean <= CONSENSUS_BENCHMARKS.uncertainty_tolerance;
    scores.strong_voting_consensus = scores.voting_consensus_strength_score >= 75;
    scores.ensemble_included = 'ensemble' in modelPredictions;
    
    // 9. Consensus quality classification
    if (scores.consensus_performance_score >= 85) {
        scores.consensus_quality = 'Excellent';
        scores.recommendation_confidence = 'Very High';
    } else if (scores.consensus_performance_score >= 70) {
        scores.consensus_quality = 'Good';
        scores.recommendation_confidence = 'High';
    } else if (scores.consensus_performance_score >= 55) {
        scores.consensus_quality = 'Fair';
        scores.recommendation_confidence = 'Moderate';
    } else {
        scores.consensus_quality = 'Poor';
        scores.recommendation_confidence = 'Low';
    }
    
    // 10. Model contribution analysis
    const modelContributions = {};
    Object.entries(modelPredictions).forEach(([model, prediction]) => {
        const weight = model === 'ensemble' ? CONSENSUS_BENCHMARKS.ensemble_weight : 
                      (1 - CONSENSUS_BENCHMARKS.ensemble_weight) / (Object.keys(modelPredictions).length - 1);
        modelContributions[model] = {
            prediction,
            weight,
            contribution: prediction * weight
        };
    });
    scores.model_contributions = modelContributions;
    
    return scores;
}

// Process each record
let processedCount = 0;
let highModelAgreement = 0;
let reliableConsensus = 0;
let lowUncertainty = 0;
let strongVotingConsensus = 0;
let ensembleIncluded = 0;

// Track consensus quality distribution
const consensusQualityDistribution = { 'Excellent': 0, 'Good': 0, 'Fair': 0, 'Poor': 0 };

data.results.forEach(record => {
    const scores = calculateConsensusAnalysisScores(record);
    
    // Add all scores to the record
    Object.assign(record, scores);
    
    // Track statistics
    if (scores.high_model_agreement) highModelAgreement++;
    if (scores.reliable_consensus) reliableConsensus++;
    if (scores.low_uncertainty) lowUncertainty++;
    if (scores.strong_voting_consensus) strongVotingConsensus++;
    if (scores.ensemble_included) ensembleIncluded++;
    
    // Track quality distribution
    consensusQualityDistribution[scores.consensus_quality]++;
    
    processedCount++;
    
    if (processedCount % 100 === 0) {
        console.log(`   ⚡ Processed ${processedCount} records...`);
    }
});

// Add summary statistics
data.scoring_summary = {
    consensus_analysis_scoring: {
        processed_records: processedCount,
        high_model_agreement: highModelAgreement,
        reliable_consensus: reliableConsensus,
        low_uncertainty: lowUncertainty,
        strong_voting_consensus: strongVotingConsensus,
        ensemble_included: ensembleIncluded,
        consensus_quality_distribution: consensusQualityDistribution,
        consensus_benchmarks: CONSENSUS_BENCHMARKS,
        scoring_timestamp: new Date().toISOString(),
        score_fields_added: [
            'model_agreement_score',
            'consensus_confidence_score',
            'prediction_reliability_score',
            'uncertainty_quantification_score',
            'voting_consensus_strength_score',
            'multi_model_value_score',
            'consensus_performance_score',
            'high_model_agreement',
            'reliable_consensus',
            'low_uncertainty',
            'strong_voting_consensus',
            'ensemble_included',
            'consensus_quality',
            'recommendation_confidence',
            'model_contributions'
        ]
    }
};

// Save the updated data
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

// Generate performance statistics
const performanceScores = data.results.map(r => r.consensus_performance_score);
const agreementScores = data.results.map(r => r.model_agreement_score);
const reliabilityScores = data.results.map(r => r.prediction_reliability_score);

const avgPerformance = Math.round(performanceScores.reduce((a, b) => a + b, 0) / performanceScores.length);
const avgAgreement = Math.round(agreementScores.reduce((a, b) => a + b, 0) / agreementScores.length);
const avgReliability = Math.round(reliabilityScores.reduce((a, b) => a + b, 0) / reliabilityScores.length);

console.log('✅ Consensus Analysis Scoring Complete!');
console.log(`   📊 Records Processed: ${processedCount}`);
console.log(`   🎯 Average Performance Score: ${avgPerformance}/100`);
console.log(`   🤝 Average Agreement Score: ${avgAgreement}/100`);
console.log(`   🔒 Average Reliability Score: ${avgReliability}/100`);
console.log(`   ⭐ High Model Agreement: ${highModelAgreement} (${Math.round(highModelAgreement/processedCount*100)}%)`);
console.log(`   💪 Reliable Consensus: ${reliableConsensus} (${Math.round(reliableConsensus/processedCount*100)}%)`);
console.log(`   📊 Low Uncertainty: ${lowUncertainty} (${Math.round(lowUncertainty/processedCount*100)}%)`);
console.log(`   🗳️ Strong Voting Consensus: ${strongVotingConsensus} (${Math.round(strongVotingConsensus/processedCount*100)}%)`);
console.log(`   🎯 Ensemble Included: ${ensembleIncluded} (${Math.round(ensembleIncluded/processedCount*100)}%)`);
console.log(`   🏆 Quality Distribution:`, consensusQualityDistribution);
console.log(`   💾 Updated: ${dataPath}`);