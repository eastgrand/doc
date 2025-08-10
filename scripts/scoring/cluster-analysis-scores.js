/**
 * Cluster Analysis Scoring Script
 * 
 * Calculates cluster quality and segmentation scores (0-100 scale)
 * based on K-means clustering results (8 clusters identified).
 * Creates market segmentation opportunity and cluster strength scores.
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Starting Cluster Analysis Scoring...');

// Load the cluster analysis endpoint data
const dataPath = path.join(__dirname, '../../public/data/endpoints/cluster-analysis.json');

if (!fs.existsSync(dataPath)) {
    console.error('❌ cluster-analysis.json not found. Please run export-comprehensive-endpoints.py first.');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

if (!data.results || data.results.length === 0) {
    console.error('❌ No results found in cluster analysis data');
    process.exit(1);
}

console.log(`📊 Processing ${data.results.length} records for cluster analysis scoring...`);

// Cluster analysis benchmarks from our model results
const CLUSTER_BENCHMARKS = {
    n_clusters: 8,
    silhouette_score: 0.156,  // Our actual silhouette score
    optimal_cluster_size_min: 50,   // Minimum viable cluster size
    optimal_cluster_size_max: 300,  // Maximum efficient cluster size
    distance_threshold: 0.5          // Distance threshold for cluster strength
};

// Define cluster profiles based on typical segmentation patterns
const CLUSTER_PROFILES = {
    0: { name: 'Suburban Families', opportunity_weight: 0.8 },
    1: { name: 'Urban Professionals', opportunity_weight: 0.9 },
    2: { name: 'Rural Communities', opportunity_weight: 0.6 },
    3: { name: 'College Towns', opportunity_weight: 0.85 },
    4: { name: 'Retirement Areas', opportunity_weight: 0.5 },
    5: { name: 'High-Income Urban', opportunity_weight: 0.95 },
    6: { name: 'Mixed Demographics', opportunity_weight: 0.7 },
    7: { name: 'Emerging Markets', opportunity_weight: 0.75 }
};

function calculateClusterAnalysisScores(record) {
    const clusterId = record.cluster_id;
    const distanceToCentroid = record.distance_to_centroid || 0;
    const clusterProfile = record.cluster_profile || {};
    let scores = {};
    
    // 1. CLUSTER MEMBERSHIP STRENGTH SCORE (0-100)
    // Based on distance to centroid - closer = stronger membership
    const maxDistance = 1.0; // Normalized distance
    const membershipStrength = Math.max(0, 100 - (distanceToCentroid / maxDistance) * 100);
    scores.cluster_membership_strength_score = Math.round(membershipStrength);
    
    // 2. CLUSTER QUALITY SCORE (0-100)
    // Based on silhouette score and cluster characteristics
    const baseQuality = (CLUSTER_BENCHMARKS.silhouette_score + 1) * 50; // Normalize silhouette to 0-100
    const membershipBonus = membershipStrength > 70 ? 15 : 0;
    scores.cluster_quality_score = Math.round(Math.min(100, baseQuality + membershipBonus));
    
    // 3. SEGMENTATION OPPORTUNITY SCORE (0-100)  
    // Based on cluster profile characteristics and market potential
    const clusterInfo = CLUSTER_PROFILES[clusterId] || { opportunity_weight: 0.7 };
    const avgIncome = clusterProfile.avg_income || 50000;
    const avgPopulation = clusterProfile.avg_population || 15000;
    
    // Income factor (optimal range: $40K-$120K)
    const incomeFactor = avgIncome >= 40000 && avgIncome <= 120000 ? 1.0 : 
                        avgIncome > 120000 ? 0.9 : 0.7;
    
    // Population factor (optimal range for market efficiency)
    const populationFactor = avgPopulation >= CLUSTER_BENCHMARKS.optimal_cluster_size_min && 
                            avgPopulation <= CLUSTER_BENCHMARKS.optimal_cluster_size_max ? 1.0 : 0.8;
    
    scores.segmentation_opportunity_score = Math.round(
        clusterInfo.opportunity_weight * 80 * incomeFactor * populationFactor + 20
    );
    
    // 4. CLUSTER DISTINCTIVENESS SCORE (0-100)
    // Higher scores for well-separated, distinct clusters
    const distinctivenessBase = scores.cluster_membership_strength_score;
    const profileStrength = Object.keys(clusterProfile).length * 5; // More characteristics = more distinct
    scores.cluster_distinctiveness_score = Math.round(
        Math.min(100, distinctivenessBase + profileStrength)
    );
    
    // 5. MARKET SEGMENT VALUE SCORE (0-100)
    // Overall value of this market segment for targeting
    const primaryCharacteristics = clusterProfile.primary_characteristics || [];
    let segmentValueBonus = 0;
    
    // Bonus for valuable demographic characteristics
    if (primaryCharacteristics.includes('high_income')) segmentValueBonus += 15;
    if (primaryCharacteristics.includes('urban')) segmentValueBonus += 10;
    if (primaryCharacteristics.includes('educated')) segmentValueBonus += 10;
    if (primaryCharacteristics.includes('young_adults')) segmentValueBonus += 12;
    
    scores.market_segment_value_score = Math.round(
        Math.min(100, scores.segmentation_opportunity_score + segmentValueBonus)
    );
    
    // 6. CLUSTER TARGETING PRIORITY SCORE (0-100)
    // Prioritization score for marketing targeting
    scores.cluster_targeting_priority_score = Math.round(
        (scores.cluster_quality_score * 0.2) +
        (scores.segmentation_opportunity_score * 0.3) +
        (scores.cluster_distinctiveness_score * 0.2) +
        (scores.market_segment_value_score * 0.3)
    );
    
    // 7. OVERALL CLUSTER PERFORMANCE SCORE (0-100)
    scores.cluster_performance_score = Math.round(
        (scores.cluster_membership_strength_score * 0.15) +
        (scores.cluster_quality_score * 0.15) +
        (scores.segmentation_opportunity_score * 0.25) +
        (scores.cluster_distinctiveness_score * 0.15) +
        (scores.market_segment_value_score * 0.30)
    );
    
    // 8. Classification flags
    scores.high_value_segment = scores.market_segment_value_score >= 75;
    scores.strong_cluster_membership = scores.cluster_membership_strength_score >= 70;
    scores.priority_targeting_segment = scores.cluster_targeting_priority_score >= 80;
    
    // Add cluster profile information
    scores.cluster_name = clusterInfo.name;
    scores.cluster_opportunity_rating = clusterInfo.opportunity_weight >= 0.8 ? 'High' :
                                       clusterInfo.opportunity_weight >= 0.6 ? 'Medium' : 'Low';
    
    return scores;
}

// Process each record
let processedCount = 0;
let highValueSegments = 0;
let priorityTargetingSegments = 0;
let strongMemberships = 0;

// Track cluster distribution
const clusterDistribution = {};

data.results.forEach(record => {
    const scores = calculateClusterAnalysisScores(record);
    
    // Add all scores to the record
    Object.assign(record, scores);
    
    // Track statistics
    if (scores.high_value_segment) highValueSegments++;
    if (scores.priority_targeting_segment) priorityTargetingSegments++;
    if (scores.strong_cluster_membership) strongMemberships++;
    
    // Track cluster distribution
    const clusterId = record.cluster_id;
    clusterDistribution[clusterId] = (clusterDistribution[clusterId] || 0) + 1;
    
    processedCount++;
    
    if (processedCount % 100 === 0) {
        console.log(`   ⚡ Processed ${processedCount} records...`);
    }
});

// Add summary statistics
data.scoring_summary = {
    cluster_analysis_scoring: {
        processed_records: processedCount,
        high_value_segments: highValueSegments,
        priority_targeting_segments: priorityTargetingSegments,
        strong_memberships: strongMemberships,
        cluster_distribution: clusterDistribution,
        cluster_benchmarks: CLUSTER_BENCHMARKS,
        cluster_profiles: CLUSTER_PROFILES,
        scoring_timestamp: new Date().toISOString(),
        score_fields_added: [
            'cluster_membership_strength_score',
            'cluster_quality_score',
            'segmentation_opportunity_score',
            'cluster_distinctiveness_score',
            'market_segment_value_score',
            'cluster_targeting_priority_score',
            'cluster_performance_score',
            'high_value_segment',
            'strong_cluster_membership',
            'priority_targeting_segment',
            'cluster_name',
            'cluster_opportunity_rating'
        ]
    }
};

// Save the updated data
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

// Generate performance statistics
const performanceScores = data.results.map(r => r.cluster_performance_score);
const opportunityScores = data.results.map(r => r.segmentation_opportunity_score);
const valueScores = data.results.map(r => r.market_segment_value_score);

const avgPerformance = Math.round(performanceScores.reduce((a, b) => a + b, 0) / performanceScores.length);
const avgOpportunity = Math.round(opportunityScores.reduce((a, b) => a + b, 0) / opportunityScores.length);
const avgValue = Math.round(valueScores.reduce((a, b) => a + b, 0) / valueScores.length);

console.log('✅ Cluster Analysis Scoring Complete!');
console.log(`   📊 Records Processed: ${processedCount}`);
console.log(`   🎯 Average Performance Score: ${avgPerformance}/100`);
console.log(`   💎 Average Opportunity Score: ${avgOpportunity}/100`);
console.log(`   💰 Average Segment Value Score: ${avgValue}/100`);
console.log(`   ⭐ High Value Segments: ${highValueSegments} (${Math.round(highValueSegments/processedCount*100)}%)`);
console.log(`   🎯 Priority Targeting Segments: ${priorityTargetingSegments} (${Math.round(priorityTargetingSegments/processedCount*100)}%)`);
console.log(`   💪 Strong Cluster Memberships: ${strongMemberships} (${Math.round(strongMemberships/processedCount*100)}%)`);
console.log(`   📊 Cluster Distribution:`, clusterDistribution);
console.log(`   💾 Updated: ${dataPath}`);