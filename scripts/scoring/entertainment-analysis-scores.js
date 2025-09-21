/**
 * Entertainment Analysis Scoring Script for The Doors Documentary
 * 
 * Creates entertainment analysis scores targeting classic rock demographics (Age 45-70)
 * across 5 real 2025 ESRI Tapestry segments in Midwest markets (IL, IN, WI).
 * 
 * Composite Scoring Formula:
 * Music Affinity (40%) + Cultural Engagement (25%) + Spending Capacity (20%) + Market Accessibility (15%)
 * 
 * Target Segments:
 * K1 - Established Suburbanites (Weight: 1.0)
 * K2 - Mature Suburban Families (Weight: 0.9)  
 * I1 - Rural Established (Weight: 0.7)
 * J1 - Active Seniors (Weight: 1.0)
 * L1 - Savvy Suburbanites (Weight: 1.1)
 */

const fs = require('fs');
const path = require('path');

console.log('🎸 Starting Entertainment Analysis Scoring for The Doors Documentary...');

// Load the microservice data
const dataPath = path.join(__dirname, '../../public/data/microservice-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Access correlation_analysis dataset
const correlationData = data.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

console.log(`📊 Processing ${correlationData.results.length} records for entertainment analysis scoring...`);

// Tapestry segment weights for classic rock audience appeal
const TAPESTRY_WEIGHTS = {
  K1: 1.0,  // Established Suburbanites - High entertainment spending, cultural engagement
  K2: 0.9,  // Mature Suburban Families - Moderate engagement, family-focused entertainment
  I1: 0.7,  // Rural Established - Traditional entertainment preferences, moderate engagement  
  J1: 1.0,  // Active Seniors - High cultural engagement, documentary interest
  L1: 1.1   // Savvy Suburbanites - Premium entertainment consumers, tech-savvy
};

function calculateEntertainmentScore(record) {
  // Extract Tapestry segment percentages (5 real 2025 segments)
  const tapestryK1 = Number(record.TAPESTRY_K1_PCT) || Number(record.established_suburbanites_pct) || 0;
  const tapestryK2 = Number(record.TAPESTRY_K2_PCT) || Number(record.mature_suburban_families_pct) || 0;
  const tapestryI1 = Number(record.TAPESTRY_I1_PCT) || Number(record.rural_established_pct) || 0;
  const tapestryJ1 = Number(record.TAPESTRY_J1_PCT) || Number(record.active_seniors_pct) || 0;
  const tapestryL1 = Number(record.TAPESTRY_L1_PCT) || Number(record.savvy_suburbanites_pct) || 0;
  
  // Extract demographic and behavioral data
  const totalPop = Number(record.total_population) || Number(record.TOTPOP_CY) || 0;
  const medianIncome = Number(record.median_income) || Number(record.AVGHINC_CY) || 0;
  const strategicScore = Number(record.strategic_value_score) || 0;
  const demographicScore = Number(record.demographic_opportunity_score) || 0;
  
  // Extract entertainment-specific metrics (estimated from available data)
  const classicRockListening = Number(record.classic_rock_listening_hours) || (strategicScore * 0.6); // Estimate
  const concertAttendance = Number(record.concert_attendance_frequency) || (demographicScore * 0.4); // Estimate  
  const documentaryConsumption = Number(record.documentary_consumption_rate) || (medianIncome / 1000); // Income-based estimate
  const theaterDensity = Number(record.theater_density_2mile_radius) || Math.min(totalPop / 10000, 10); // Population-based estimate
  
  let entertainmentScore = 0;
  
  // 1. Music Affinity Score (40 points)
  // Classic rock preference and music engagement
  const tapestryMusicAffinity = (
    (tapestryK1 * TAPESTRY_WEIGHTS.K1 * 0.85) + // High music engagement
    (tapestryK2 * TAPESTRY_WEIGHTS.K2 * 0.70) + // Family music preferences
    (tapestryI1 * TAPESTRY_WEIGHTS.I1 * 0.75) + // Traditional/country rock mix
    (tapestryJ1 * TAPESTRY_WEIGHTS.J1 * 0.95) + // Peak classic rock demographic
    (tapestryL1 * TAPESTRY_WEIGHTS.L1 * 0.80)   // Premium music experiences
  ) / 100;
  
  const musicBehaviorScore = (classicRockListening / 100) * 15 + (concertAttendance / 100) * 15;
  const musicAffinityScore = (tapestryMusicAffinity * 25) + Math.min(musicBehaviorScore, 15);
  entertainmentScore += Math.min(musicAffinityScore, 40);
  
  // 2. Cultural Engagement Score (25 points)
  // Documentary consumption and cultural participation
  const segmentCulturalEngagement = (
    (tapestryK1 * 0.80) + // High cultural engagement
    (tapestryK2 * 0.60) + // Moderate cultural participation
    (tapestryI1 * 0.50) + // Traditional cultural activities
    (tapestryJ1 * 0.90) + // Premium cultural participation
    (tapestryL1 * 0.75)   // Digital-first cultural engagement
  ) / 100;
  
  const documentaryAppeal = Math.min(documentaryConsumption / 100, 1) * 10;
  const culturalScore = (segmentCulturalEngagement * 15) + documentaryAppeal;
  entertainmentScore += Math.min(culturalScore, 25);
  
  // 3. Spending Capacity Score (20 points)
  // Entertainment spending willingness and premium content capacity
  const incomeCapacity = medianIncome >= 80000 ? 10 : medianIncome >= 60000 ? 8 : medianIncome >= 45000 ? 6 : 4;
  
  const segmentSpendingCapacity = (
    (tapestryK1 * 0.85) + // High spending capacity
    (tapestryK2 * 0.70) + // Moderate-high spending
    (tapestryI1 * 0.55) + // Moderate spending
    (tapestryJ1 * 0.80) + // High spending capacity (seniors)
    (tapestryL1 * 0.90)   // Premium spending capacity
  ) / 100;
  
  const spendingScore = incomeCapacity + (segmentSpendingCapacity * 10);
  entertainmentScore += Math.min(spendingScore, 20);
  
  // 4. Market Accessibility Score (15 points)
  // Demographics alignment and infrastructure
  const totalTargetSegments = tapestryK1 + tapestryK2 + tapestryI1 + tapestryJ1 + tapestryL1;
  const segmentConcentration = Math.min(totalTargetSegments / 50, 1) * 8; // Up to 8 points for segment concentration
  
  const infrastructureScore = Math.min(theaterDensity / 5, 1) * 4; // Up to 4 points for theater infrastructure
  const populationScore = totalPop >= 50000 ? 3 : totalPop >= 25000 ? 2 : totalPop >= 10000 ? 1 : 0;
  
  const accessibilityScore = segmentConcentration + infrastructureScore + populationScore;
  entertainmentScore += Math.min(accessibilityScore, 15);
  
  // Apply final scaling and bounds
  const finalScore = Math.min(Math.max(entertainmentScore, 0), 100);
  
  return {
    entertainment_score: Math.round(finalScore * 100) / 100,
    music_affinity_score: Math.round(Math.min(musicAffinityScore, 40) * 100) / 100,
    cultural_engagement_score: Math.round(Math.min(culturalScore, 25) * 100) / 100,
    spending_capacity_score: Math.round(Math.min(spendingScore, 20) * 100) / 100,
    market_accessibility_score: Math.round(Math.min(accessibilityScore, 15) * 100) / 100,
    
    // Tapestry segment analysis
    tapestry_k1_established_suburbanites: tapestryK1,
    tapestry_k2_mature_suburban_families: tapestryK2,
    tapestry_i1_rural_established: tapestryI1,
    tapestry_j1_active_seniors: tapestryJ1,
    tapestry_l1_savvy_suburbanites: tapestryL1,
    total_target_segments_pct: totalTargetSegments,
    
    // Entertainment behavior estimates
    classic_rock_listening_hours: Math.round(classicRockListening * 100) / 100,
    concert_attendance_frequency: Math.round(concertAttendance * 100) / 100,
    documentary_consumption_rate: Math.round(documentaryConsumption * 100) / 100,
    theater_density_2mile_radius: Math.round(theaterDensity * 100) / 100
  };
}

// Process all records
let processedCount = 0;
let errorCount = 0;

const results = correlationData.results.map(record => {
  try {
    const scores = calculateEntertainmentScore(record);
    processedCount++;
    
    return {
      ...record,
      ...scores
    };
  } catch (error) {
    errorCount++;
    console.warn(`⚠️  Error processing record ${record.ID || 'unknown'}: ${error.message}`);
    return record;
  }
});

console.log(`✅ Entertainment analysis scoring completed:`);
console.log(`   📊 ${processedCount} records processed successfully`);
console.log(`   ⚠️  ${errorCount} records had errors`);

// Calculate summary statistics
const validScores = results
  .filter(r => r.entertainment_score !== undefined)
  .map(r => r.entertainment_score);

if (validScores.length > 0) {
  const avgScore = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
  const minScore = Math.min(...validScores);
  const maxScore = Math.max(...validScores);
  
  console.log(`📈 Score Statistics:`);
  console.log(`   Average: ${avgScore.toFixed(2)}`);
  console.log(`   Range: ${minScore.toFixed(2)} - ${maxScore.toFixed(2)}`);
  
  // Distribution analysis
  const excellent = validScores.filter(s => s >= 75).length;
  const good = validScores.filter(s => s >= 60 && s < 75).length;
  const moderate = validScores.filter(s => s >= 45 && s < 60).length;
  const poor = validScores.filter(s => s < 45).length;
  
  console.log(`🎯 Entertainment Market Distribution:`);
  console.log(`   🌟 Premium Markets (75-100): ${excellent} areas`);
  console.log(`   ⭐ Strong Markets (60-74): ${good} areas`);
  console.log(`   ⚡ Moderate Markets (45-59): ${moderate} areas`);
  console.log(`   📍 Limited Markets (0-44): ${poor} areas`);
}

// Update the dataset
const updatedData = {
  ...data,
  datasets: {
    ...data.datasets,
    correlation_analysis: {
      ...correlationData,
      results: results
    }
  }
};

// Save the updated data
fs.writeFileSync(dataPath, JSON.stringify(updatedData, null, 2));
console.log(`💾 Updated data saved to ${dataPath}`);

// Create entertainment-specific dataset export
const entertainmentResults = results.filter(r => r.entertainment_score !== undefined);
const entertainmentDataPath = path.join(__dirname, '../../public/data/entertainment-analysis-export.json');

const entertainmentExport = {
  metadata: {
    generated_at: new Date().toISOString(),
    analysis_type: 'entertainment_analysis',
    target_audience: 'Classic rock demographics (Age 45-70)',
    geographic_scope: 'Midwest United States (IL, IN, WI)',
    tapestry_segments: ['K1 - Established Suburbanites', 'K2 - Mature Suburban Families', 'I1 - Rural Established', 'J1 - Active Seniors', 'L1 - Savvy Suburbanites'],
    scoring_methodology: 'Music Affinity (40%) + Cultural Engagement (25%) + Spending Capacity (20%) + Market Accessibility (15%)',
    record_count: entertainmentResults.length
  },
  results: entertainmentResults
};

fs.writeFileSync(entertainmentDataPath, JSON.stringify(entertainmentExport, null, 2));
console.log(`🎸 Entertainment analysis export saved to ${entertainmentDataPath}`);

console.log('🎬 Entertainment Analysis Scoring for The Doors Documentary completed successfully!');
console.log('🎯 Ready for classic rock audience targeting and documentary screening analysis');