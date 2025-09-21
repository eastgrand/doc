/**
 * Tapestry Entertainment Scoring Script for The Doors Documentary
 * 
 * Specialized analysis of 5 real 2025 ESRI Tapestry segments for classic rock audience targeting.
 * Focus on segment concentration, entertainment preferences, and documentary appeal patterns.
 * 
 * Target Segments Analysis:
 * K1 - Established Suburbanites (Group K: Suburban Shine, Age 45+)
 * K2 - Mature Suburban Families (Group K: Suburban Shine, Age 45+)
 * I1 - Rural Established (Group I: Countryscapes, Age 55+)
 * J1 - Active Seniors (Group J: Mature Reflections, Age 55+)
 * L1 - Savvy Suburbanites (Group L: Premier Estates, Age 45-64)
 * 
 * Scoring Framework:
 * Segment Concentration (40%) + Entertainment Affinity (30%) + Documentary Appeal (20%) + Market Viability (10%)
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Starting Tapestry Entertainment Scoring for The Doors Documentary...');

// Load the microservice data
const dataPath = path.join(__dirname, '../../public/data/microservice-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Access correlation_analysis dataset
const correlationData = data.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

console.log(`📊 Processing ${correlationData.results.length} records for Tapestry entertainment analysis...`);

// 2025 ESRI Tapestry segment characteristics for entertainment analysis
const SEGMENT_PROFILES = {
  K1: {
    name: 'Established Suburbanites',
    group: 'K: Suburban Shine',
    age: '45+',
    entertainment_affinity: 0.85,
    documentary_appeal: 0.75,
    music_preference: 0.85, // High classic rock affinity
    cultural_engagement: 0.80,
    spending_capacity: 0.85,
    weight: 1.0
  },
  K2: {
    name: 'Mature Suburban Families',
    group: 'K: Suburban Shine', 
    age: '45+',
    entertainment_affinity: 0.70,
    documentary_appeal: 0.60,
    music_preference: 0.70, // Mainstream classic rock
    cultural_engagement: 0.60,
    spending_capacity: 0.70,
    weight: 0.9
  },
  I1: {
    name: 'Rural Established',
    group: 'I: Countryscapes',
    age: '55+',
    entertainment_affinity: 0.60,
    documentary_appeal: 0.50,
    music_preference: 0.75, // Traditional country/rock mix
    cultural_engagement: 0.50,
    spending_capacity: 0.55,
    weight: 0.7
  },
  J1: {
    name: 'Active Seniors',
    group: 'J: Mature Reflections',
    age: '55+',
    entertainment_affinity: 0.90,
    documentary_appeal: 0.85,
    music_preference: 0.95, // Peak classic rock demographic
    cultural_engagement: 0.90,
    spending_capacity: 0.80,
    weight: 1.0
  },
  L1: {
    name: 'Savvy Suburbanites',
    group: 'L: Premier Estates',
    age: '45-64',
    entertainment_affinity: 0.80,
    documentary_appeal: 0.70,
    music_preference: 0.80, // Premium music experiences
    cultural_engagement: 0.75,
    spending_capacity: 0.90,
    weight: 1.1
  }
};

function calculateTapestryEntertainmentScore(record) {
  // Extract Tapestry segment percentages
  const segments = {
    K1: Number(record.TAPESTRY_K1_PCT) || Number(record.established_suburbanites_pct) || 0,
    K2: Number(record.TAPESTRY_K2_PCT) || Number(record.mature_suburban_families_pct) || 0,
    I1: Number(record.TAPESTRY_I1_PCT) || Number(record.rural_established_pct) || 0,
    J1: Number(record.TAPESTRY_J1_PCT) || Number(record.active_seniors_pct) || 0,
    L1: Number(record.TAPESTRY_L1_PCT) || Number(record.savvy_suburbanites_pct) || 0
  };
  
  // Extract supporting demographic data
  const totalPop = Number(record.total_population) || Number(record.TOTPOP_CY) || 0;
  const medianIncome = Number(record.median_income) || Number(record.AVGHINC_CY) || 0;
  
  let tapestryScore = 0;
  
  // 1. Segment Concentration Score (40 points)
  // Higher concentrations of target segments = better audience potential
  const totalTargetSegments = segments.K1 + segments.K2 + segments.I1 + segments.J1 + segments.L1;
  const concentrationScore = Math.min(totalTargetSegments / 2.5, 40); // Scale to 40 points max
  tapestryScore += concentrationScore;
  
  // 2. Entertainment Affinity Score (30 points)
  // Weighted entertainment preferences by segment concentration
  let entertainmentAffinity = 0;
  let totalWeight = 0;
  
  Object.keys(segments).forEach(segmentCode => {
    const percentage = segments[segmentCode];
    const profile = SEGMENT_PROFILES[segmentCode];
    
    if (percentage > 0) {
      const segmentContribution = (percentage / 100) * profile.entertainment_affinity * profile.weight;
      entertainmentAffinity += segmentContribution;
      totalWeight += (percentage / 100) * profile.weight;
    }
  });
  
  const affinityScore = totalWeight > 0 ? (entertainmentAffinity / totalWeight) * 30 : 0;
  tapestryScore += affinityScore;
  
  // 3. Documentary Appeal Score (20 points)
  // Segment-specific documentary consumption patterns
  let documentaryAppeal = 0;
  let documentaryWeight = 0;
  
  Object.keys(segments).forEach(segmentCode => {
    const percentage = segments[segmentCode];
    const profile = SEGMENT_PROFILES[segmentCode];
    
    if (percentage > 0) {
      const appealContribution = (percentage / 100) * profile.documentary_appeal * profile.weight;
      documentaryAppeal += appealContribution;
      documentaryWeight += (percentage / 100) * profile.weight;
    }
  });
  
  const appealScore = documentaryWeight > 0 ? (documentaryAppeal / documentaryWeight) * 20 : 0;
  tapestryScore += appealScore;
  
  // 4. Market Viability Score (10 points)
  // Population size and income capacity
  const populationViability = totalPop >= 50000 ? 5 : totalPop >= 25000 ? 4 : totalPop >= 10000 ? 3 : 2;
  const incomeViability = medianIncome >= 70000 ? 5 : medianIncome >= 55000 ? 4 : medianIncome >= 45000 ? 3 : 2;
  const viabilityScore = Math.min(populationViability + incomeViability, 10);
  tapestryScore += viabilityScore;
  
  // Determine dominant segment
  const dominantSegment = Object.keys(segments).reduce((max, current) => 
    segments[current] > segments[max] ? current : max
  );
  
  // Calculate segment diversity index (Shannon diversity)
  const totalPercentage = Object.values(segments).reduce((sum, pct) => sum + pct, 0);
  let diversityIndex = 0;
  
  if (totalPercentage > 0) {
    Object.values(segments).forEach(percentage => {
      if (percentage > 0) {
        const proportion = percentage / totalPercentage;
        diversityIndex -= proportion * Math.log(proportion);
      }
    });
    diversityIndex = (diversityIndex / Math.log(5)) * 100; // Normalize to 0-100
  }
  
  const finalScore = Math.min(Math.max(tapestryScore, 0), 100);
  
  return {
    tapestry_entertainment_score: Math.round(finalScore * 100) / 100,
    
    // Component scores
    segment_concentration_score: Math.round(concentrationScore * 100) / 100,
    entertainment_affinity_score: Math.round(affinityScore * 100) / 100,
    documentary_appeal_score: Math.round(appealScore * 100) / 100,
    market_viability_score: Math.round(viabilityScore * 100) / 100,
    
    // Segment analysis
    tapestry_k1_established_suburbanites_pct: segments.K1,
    tapestry_k2_mature_suburban_families_pct: segments.K2,
    tapestry_i1_rural_established_pct: segments.I1,
    tapestry_j1_active_seniors_pct: segments.J1,
    tapestry_l1_savvy_suburbanites_pct: segments.L1,
    
    // Analysis results
    dominant_tapestry_segment: `${dominantSegment} - ${SEGMENT_PROFILES[dominantSegment].name}`,
    dominant_segment_percentage: segments[dominantSegment],
    segment_diversity_index: Math.round(diversityIndex * 100) / 100,
    total_target_segments_pct: totalTargetSegments,
    
    // Entertainment profiles
    entertainment_profile: getEntertainmentProfile(dominantSegment),
    documentary_appeal_rating: getDocumentaryAppealRating(dominantSegment, segments[dominantSegment]),
    music_preference_profile: getMusicPreferenceProfile(dominantSegment),
    cultural_engagement_level: getCulturalEngagementLevel(dominantSegment),
    spending_capacity_assessment: getSpendingCapacityAssessment(dominantSegment, medianIncome)
  };
}

function getEntertainmentProfile(segmentCode) {
  const profiles = {
    K1: 'Premium Entertainment Consumers - High spending on concerts, theater, documentaries',
    K2: 'Family Entertainment Focus - Selective premium content, group activities',
    I1: 'Traditional Entertainment Preferences - Classic music, local venues, community events',
    J1: 'Cultural Enthusiasts - High documentary consumption, educational content, arts patronage',
    L1: 'Digital-First Premium Consumers - Streaming services, tech-enabled experiences, premium content'
  };
  return profiles[segmentCode] || 'Mixed Entertainment Preferences';
}

function getDocumentaryAppealRating(segmentCode, percentage) {
  const baseAppeal = {
    K1: 75, K2: 60, I1: 50, J1: 85, L1: 70
  }[segmentCode] || 50;
  
  const concentrationMultiplier = Math.min(percentage / 20, 2.0);
  const adjustedAppeal = baseAppeal * concentrationMultiplier;
  
  if (adjustedAppeal >= 80) return 'Exceptional Documentary Appeal';
  if (adjustedAppeal >= 65) return 'High Documentary Interest';
  if (adjustedAppeal >= 50) return 'Moderate Documentary Appeal';
  if (adjustedAppeal >= 35) return 'Limited Documentary Interest';
  return 'Minimal Documentary Appeal';
}

function getMusicPreferenceProfile(segmentCode) {
  const profiles = {
    K1: 'Classic Rock Core Audience - High concert attendance, vinyl collectors, music history interest',
    K2: 'Mainstream Classic Rock - Radio listening, streaming classics, family-friendly concerts',
    I1: 'Traditional Country/Rock Mix - Local venues, classic radio, community music events',
    J1: 'Classic Rock Golden Age - Peak demographic, original fans, high nostalgia factor',
    L1: 'Premium Music Experiences - High-end concerts, streaming subscriptions, music documentaries'
  };
  return profiles[segmentCode] || 'Diverse Music Preferences';
}

function getCulturalEngagementLevel(segmentCode) {
  const levels = {
    K1: 'High Cultural Engagement',
    K2: 'Moderate Cultural Participation',
    I1: 'Traditional Cultural Activities', 
    J1: 'Premium Cultural Participation',
    L1: 'Digital-First Cultural Engagement'
  };
  return levels[segmentCode] || 'Mixed Cultural Engagement';
}

function getSpendingCapacityAssessment(segmentCode, medianIncome) {
  const baseCapacity = {
    K1: 'High Spending Capacity',
    K2: 'Moderate-High Spending Capacity',
    I1: 'Moderate Spending Capacity',
    J1: 'High Spending Capacity',
    L1: 'Premium Spending Capacity'
  }[segmentCode] || 'Moderate Spending Capacity';
  
  if (medianIncome >= 80000) return `${baseCapacity} - Affluent Income Level`;
  if (medianIncome >= 60000) return `${baseCapacity} - Above Average Income`;
  if (medianIncome >= 45000) return `${baseCapacity} - Average Income Level`;
  return `${baseCapacity} - Below Average Income`;
}

// Process all records
let processedCount = 0;
let errorCount = 0;

const results = correlationData.results.map(record => {
  try {
    const scores = calculateTapestryEntertainmentScore(record);
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

console.log(`✅ Tapestry entertainment analysis completed:`);
console.log(`   📊 ${processedCount} records processed successfully`);
console.log(`   ⚠️  ${errorCount} records had errors`);

// Calculate segment distribution statistics
const segmentStats = {
  K1: { total: 0, count: 0 },
  K2: { total: 0, count: 0 },
  I1: { total: 0, count: 0 },
  J1: { total: 0, count: 0 },
  L1: { total: 0, count: 0 }
};

const validScores = results.filter(r => r.tapestry_entertainment_score !== undefined);

validScores.forEach(record => {
  ['K1', 'K2', 'I1', 'J1', 'L1'].forEach(segment => {
    const pct = record[`tapestry_${segment.toLowerCase()}_${
      segment === 'K1' ? 'established_suburbanites' :
      segment === 'K2' ? 'mature_suburban_families' :
      segment === 'I1' ? 'rural_established' :
      segment === 'J1' ? 'active_seniors' : 'savvy_suburbanites'
    }_pct`] || 0;
    
    if (pct > 0) {
      segmentStats[segment].total += pct;
      segmentStats[segment].count++;
    }
  });
});

console.log(`🎯 Tapestry Segment Analysis:`);
Object.keys(segmentStats).forEach(segment => {
  const profile = SEGMENT_PROFILES[segment];
  const stats = segmentStats[segment];
  const avgPct = stats.count > 0 ? (stats.total / stats.count).toFixed(1) : 0;
  
  console.log(`   ${segment} - ${profile.name}: ${stats.count} areas, ${avgPct}% avg concentration`);
});

if (validScores.length > 0) {
  const scores = validScores.map(r => r.tapestry_entertainment_score);
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  
  console.log(`📈 Tapestry Score Statistics:`);
  console.log(`   Average: ${avgScore.toFixed(2)}`);
  console.log(`   Range: ${minScore.toFixed(2)} - ${maxScore.toFixed(2)}`);
  
  // Market classification
  const excellent = scores.filter(s => s >= 75).length;
  const good = scores.filter(s => s >= 60 && s < 75).length;
  const moderate = scores.filter(s => s >= 45 && s < 60).length;
  const poor = scores.filter(s => s < 45).length;
  
  console.log(`🎸 Classic Rock Market Classification:`);
  console.log(`   🌟 Premium Tapestry Markets (75-100): ${excellent} areas`);
  console.log(`   ⭐ Strong Tapestry Markets (60-74): ${good} areas`);
  console.log(`   ⚡ Moderate Tapestry Markets (45-59): ${moderate} areas`);
  console.log(`   📍 Limited Tapestry Markets (0-44): ${poor} areas`);
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

// Create Tapestry-specific dataset export
const tapestryResults = results.filter(r => r.tapestry_entertainment_score !== undefined);
const tapestryDataPath = path.join(__dirname, '../../public/data/tapestry-entertainment-export.json');

const tapestryExport = {
  metadata: {
    generated_at: new Date().toISOString(),
    analysis_type: 'tapestry_entertainment_analysis',
    target_audience: 'Classic rock demographics (Age 45-70)',
    geographic_scope: 'Midwest United States (IL, IN, WI)',
    tapestry_segments: [
      'K1 - Established Suburbanites (Group K: Suburban Shine, Age 45+)',
      'K2 - Mature Suburban Families (Group K: Suburban Shine, Age 45+)',
      'I1 - Rural Established (Group I: Countryscapes, Age 55+)',
      'J1 - Active Seniors (Group J: Mature Reflections, Age 55+)',
      'L1 - Savvy Suburbanites (Group L: Premier Estates, Age 45-64)'
    ],
    scoring_methodology: 'Segment Concentration (40%) + Entertainment Affinity (30%) + Documentary Appeal (20%) + Market Viability (10%)',
    segment_weights: SEGMENT_PROFILES,
    record_count: tapestryResults.length
  },
  results: tapestryResults
};

fs.writeFileSync(tapestryDataPath, JSON.stringify(tapestryExport, null, 2));
console.log(`🎯 Tapestry entertainment analysis export saved to ${tapestryDataPath}`);

console.log('🎬 Tapestry Entertainment Analysis for The Doors Documentary completed successfully!');
console.log('📊 Ready for segment-specific targeting and audience concentration analysis');