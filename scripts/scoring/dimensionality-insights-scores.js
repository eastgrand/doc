/**
 * Dimensionality Insights Scoring Script
 * 
 * Calculates feature space analysis and dimensionality reduction scores (0-100 scale)
 * based on PCA results (10 components explaining 91.7% variance).
 * Creates feature importance and data compression opportunity scores.
 */

const fs = require('fs');
const path = require('path');

console.log('📐 Starting Dimensionality Insights Scoring...');

// Load the dimensionality insights endpoint data
const dataPath = path.join(__dirname, '../../public/data/endpoints/dimensionality-insights.json');

if (!fs.existsSync(dataPath)) {
    console.error('❌ dimensionality-insights.json not found. Please run export-comprehensive-endpoints.py first.');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

if (!data.results || data.results.length === 0) {
    console.error('❌ No results found in dimensionality insights data');
    process.exit(1);
}

console.log(`📊 Processing ${data.results.length} records for dimensionality insights scoring...`);

// PCA benchmarks from our model results
const PCA_BENCHMARKS = {
    n_components: 10,
    total_variance_explained: 0.917,  // 91.7% variance explained
    first_component_variance: 0.400,  // 40.0% from first component
    optimal_components: 8,            // Components needed for 90% variance
    feature_reduction_ratio: 0.75     // 75% feature reduction efficiency
};

function calculateDimensionalityInsightsScores(record) {
    const componentWeights = record.component_weights || {};
    const featureLoadings = record.feature_loadings || {};
    const varianceExplained = record.variance_explained || 0.5;
    const componentId = record.component_id || 0;
    let scores = {};
    
    // 1. FEATURE COMPRESSION SCORE (0-100)
    // How well this area's data compresses to lower dimensions
    const compressionEfficiency = varianceExplained / PCA_BENCHMARKS.total_variance_explained;
    const baseCompression = compressionEfficiency * 80;
    const efficiencyBonus = varianceExplained > 0.85 ? 20 : 
                           varianceExplained > 0.70 ? 10 : 0;
    
    scores.feature_compression_score = Math.round(Math.min(100, baseCompression + efficiencyBonus));
    
    // 2. COMPONENT SIGNIFICANCE SCORE (0-100)
    // Importance of this record's primary component
    const componentVariance = componentWeights[`component_${componentId}`] || 0;
    const significanceBase = (componentVariance / PCA_BENCHMARKS.first_component_variance) * 70;
    const componentBonus = componentId === 0 ? 30 : // First component bonus
                          componentId < 3 ? 15 :    // Top 3 components bonus
                          componentId < 5 ? 10 : 5; // Other components
    
    scores.component_significance_score = Math.round(Math.min(100, significanceBase + componentBonus));
    
    // 3. FEATURE RELATIONSHIP STRENGTH SCORE (0-100)
    // How strong the feature relationships are (loadings magnitude)
    const loadingValues = Object.values(featureLoadings).map(Math.abs);
    if (loadingValues.length > 0) {
        const avgLoading = loadingValues.reduce((a, b) => a + b, 0) / loadingValues.length;
        const maxLoading = Math.max(...loadingValues);
        
        const relationshipStrength = (avgLoading * 50) + (maxLoading * 30);
        scores.feature_relationship_strength_score = Math.round(Math.min(100, relationshipStrength + 20));
    } else {
        scores.feature_relationship_strength_score = 50; // Default middle value
    }
    
    // 4. DIMENSIONALITY REDUCTION BENEFIT SCORE (0-100)
    // Business value of dimensionality reduction for this area
    const originalDimensions = Object.keys(featureLoadings).length || 44; // Our feature count
    const effectiveDimensions = PCA_BENCHMARKS.n_components;
    const reductionRatio = (originalDimensions - effectiveDimensions) / originalDimensions;
    
    const reductionBenefit = reductionRatio * 60;
    const varianceRetention = varianceExplained * 40;
    
    scores.dimensionality_reduction_benefit_score = Math.round(reductionBenefit + varianceRetention);
    
    // 5. DATA COMPLEXITY SCORE (0-100)
    // How complex the data patterns are in this area
    const componentCount = Object.keys(componentWeights).length;
    let complexityScore = 50; // Base complexity
    
    // More components needed = higher complexity
    if (componentCount >= 8) complexityScore += 30;
    else if (componentCount >= 5) complexityScore += 20;
    else if (componentCount >= 3) complexityScore += 10;
    
    // High loadings = more structured (less complex)
    const structureBonus = scores.feature_relationship_strength_score > 70 ? -10 : 0;
    
    scores.data_complexity_score = Math.round(Math.max(0, Math.min(100, complexityScore + structureBonus)));
    
    // 6. FEATURE IMPORTANCE CLARITY SCORE (0-100)
    // How clearly important features are identified
    const sortedLoadings = loadingValues.sort((a, b) => b - a);
    if (sortedLoadings.length >= 3) {
        // Clear separation between top features indicates good clarity
        const topThree = sortedLoadings.slice(0, 3);
        const avgTop = topThree.reduce((a, b) => a + b, 0) / 3;
        const restAvg = sortedLoadings.length > 3 ? 
            sortedLoadings.slice(3).reduce((a, b) => a + b, 0) / (sortedLoadings.length - 3) : 0;
        
        const separation = avgTop - restAvg;
        scores.feature_importance_clarity_score = Math.round(Math.min(100, (separation * 100) + 30));
    } else {
        scores.feature_importance_clarity_score = 40;
    }
    
    // 7. OVERALL DIMENSIONALITY PERFORMANCE SCORE (0-100)
    scores.dimensionality_performance_score = Math.round(
        (scores.feature_compression_score * 0.25) +
        (scores.component_significance_score * 0.20) +
        (scores.feature_relationship_strength_score * 0.20) +
        (scores.dimensionality_reduction_benefit_score * 0.20) +
        (scores.feature_importance_clarity_score * 0.15)
    );
    
    // 8. Classification flags
    scores.high_compression_efficiency = scores.feature_compression_score >= 75;
    scores.strong_feature_relationships = scores.feature_relationship_strength_score >= 70;
    scores.clear_feature_hierarchy = scores.feature_importance_clarity_score >= 65;
    scores.significant_dimensionality_reduction = scores.dimensionality_reduction_benefit_score >= 70;
    
    // 9. Data characteristics classification
    if (scores.data_complexity_score >= 80) {
        scores.data_complexity_category = 'High Complexity';
    } else if (scores.data_complexity_score >= 60) {
        scores.data_complexity_category = 'Moderate Complexity';
    } else {
        scores.data_complexity_category = 'Low Complexity';
    }
    
    // 10. Primary component interpretation
    const primaryComponent = componentId;
    const componentInterpretations = {
        0: 'Demographic-Economic Profile',
        1: 'Geographic-Market Factors', 
        2: 'Consumer Behavior Patterns',
        3: 'Infrastructure-Accessibility',
        4: 'Cultural-Social Dynamics',
        5: 'Economic-Development Level',
        6: 'Population-Density Factors',
        7: 'Market-Competition Intensity',
        8: 'Growth-Opportunity Potential',
        9: 'Risk-Stability Indicators'
    };
    
    scores.primary_component_interpretation = componentInterpretations[primaryComponent] || 'Mixed Factors';
    
    return scores;
}

// Process each record
let processedCount = 0;
let highCompressionEfficiency = 0;
let strongFeatureRelationships = 0;
let clearFeatureHierarchy = 0;
let significantReduction = 0;

// Track component distribution
const componentDistribution = {};
const complexityDistribution = { 'High Complexity': 0, 'Moderate Complexity': 0, 'Low Complexity': 0 };

data.results.forEach(record => {
    const scores = calculateDimensionalityInsightsScores(record);
    
    // Add all scores to the record
    Object.assign(record, scores);
    
    // Track statistics
    if (scores.high_compression_efficiency) highCompressionEfficiency++;
    if (scores.strong_feature_relationships) strongFeatureRelationships++;
    if (scores.clear_feature_hierarchy) clearFeatureHierarchy++;
    if (scores.significant_dimensionality_reduction) significantReduction++;
    
    // Track distributions
    const componentId = record.component_id || 0;
    componentDistribution[componentId] = (componentDistribution[componentId] || 0) + 1;
    complexityDistribution[scores.data_complexity_category]++;
    
    processedCount++;
    
    if (processedCount % 100 === 0) {
        console.log(`   ⚡ Processed ${processedCount} records...`);
    }
});

// Add summary statistics
data.scoring_summary = {
    dimensionality_insights_scoring: {
        processed_records: processedCount,
        high_compression_efficiency: highCompressionEfficiency,
        strong_feature_relationships: strongFeatureRelationships,
        clear_feature_hierarchy: clearFeatureHierarchy,
        significant_dimensionality_reduction: significantReduction,
        component_distribution: componentDistribution,
        complexity_distribution: complexityDistribution,
        pca_benchmarks: PCA_BENCHMARKS,
        scoring_timestamp: new Date().toISOString(),
        score_fields_added: [
            'feature_compression_score',
            'component_significance_score',
            'feature_relationship_strength_score',
            'dimensionality_reduction_benefit_score',
            'data_complexity_score',
            'feature_importance_clarity_score',
            'dimensionality_performance_score',
            'high_compression_efficiency',
            'strong_feature_relationships',
            'clear_feature_hierarchy',
            'significant_dimensionality_reduction',
            'data_complexity_category',
            'primary_component_interpretation'
        ]
    }
};

// Save the updated data
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

// Generate performance statistics
const performanceScores = data.results.map(r => r.dimensionality_performance_score);
const compressionScores = data.results.map(r => r.feature_compression_score);
const clarityScores = data.results.map(r => r.feature_importance_clarity_score);

const avgPerformance = Math.round(performanceScores.reduce((a, b) => a + b, 0) / performanceScores.length);
const avgCompression = Math.round(compressionScores.reduce((a, b) => a + b, 0) / compressionScores.length);
const avgClarity = Math.round(clarityScores.reduce((a, b) => a + b, 0) / clarityScores.length);

console.log('✅ Dimensionality Insights Scoring Complete!');
console.log(`   📊 Records Processed: ${processedCount}`);
console.log(`   🎯 Average Performance Score: ${avgPerformance}/100`);
console.log(`   🗜️ Average Compression Score: ${avgCompression}/100`);
console.log(`   🔍 Average Clarity Score: ${avgClarity}/100`);
console.log(`   ⭐ High Compression Efficiency: ${highCompressionEfficiency} (${Math.round(highCompressionEfficiency/processedCount*100)}%)`);
console.log(`   💪 Strong Feature Relationships: ${strongFeatureRelationships} (${Math.round(strongFeatureRelationships/processedCount*100)}%)`);
console.log(`   📈 Clear Feature Hierarchy: ${clearFeatureHierarchy} (${Math.round(clearFeatureHierarchy/processedCount*100)}%)`);
console.log(`   🚀 Significant Reduction: ${significantReduction} (${Math.round(significantReduction/processedCount*100)}%)`);
console.log(`   📊 Component Distribution:`, componentDistribution);
console.log(`   🧠 Complexity Distribution:`, complexityDistribution);
console.log(`   💾 Updated: ${dataPath}`);