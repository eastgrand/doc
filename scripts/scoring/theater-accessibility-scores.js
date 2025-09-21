/**
 * Theater Accessibility Scoring Script for The Doors Documentary
 * 
 * Analyzes theater infrastructure and venue accessibility for documentary screening locations.
 * Evaluates venue density, capacity, accessibility features, and market infrastructure.
 * 
 * Assessment Framework:
 * Venue Density (30%) + Capacity Assessment (25%) + Accessibility Features (20%) + 
 * Market Infrastructure (15%) + Location Suitability (10%)
 * 
 * Venue Types Analyzed:
 * - Traditional movie theaters and multiplexes
 * - Arts centers and cultural venues  
 * - Community centers with screening capabilities
 * - Historic theaters and specialty venues
 */

const fs = require('fs');
const path = require('path');

console.log('🎭 Starting Theater Accessibility Scoring for The Doors Documentary...');

// Load the microservice data
const dataPath = path.join(__dirname, '../../public/data/microservice-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Access correlation_analysis dataset
const correlationData = data.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

console.log(`📊 Processing ${correlationData.results.length} records for theater accessibility analysis...`);

function calculateTheaterAccessibilityScore(record) {
  // Extract demographic context
  const totalPop = Number(record.total_population) || Number(record.TOTPOP_CY) || 0;
  const medianIncome = Number(record.median_income) || Number(record.AVGHINC_CY) || 0;
  const strategicScore = Number(record.strategic_value_score) || 0;
  const demographicScore = Number(record.demographic_opportunity_score) || 0;
  
  // Estimate theater infrastructure metrics from available data
  // In absence of direct theater data, use population and economic indicators
  const populationDensity = totalPop > 0 ? (totalPop / 2.59) : 0; // Approximate density per sq mile for hex area
  
  // Theater density estimation based on population and economic factors
  const estimatedTheaterDensity = Math.min(
    (totalPop / 15000) * // Base theaters per population
    (medianIncome / 50000) * // Income factor for theater viability
    (strategicScore / 100), // Strategic location factor
    10 // Maximum 10 theaters per 2-mile radius
  );
  
  // Theater capacity estimation based on population and market strength
  const estimatedCapacity = Math.min(
    (totalPop * 0.5) * // Base capacity ratio
    (demographicScore / 100) * // Market strength factor
    (medianIncome / 45000), // Income-based capacity scaling
    100000 // Maximum 100k total capacity
  );
  
  // Sales volume estimation based on economic indicators
  const estimatedSalesVolume = Math.min(
    (totalPop * medianIncome * 0.02) * // Per capita entertainment spending estimate
    (strategicScore / 100), // Location multiplier
    5000000 // Maximum $5M annual sales
  );
  
  // Employee count estimation
  const estimatedEmployees = Math.min(estimatedSalesVolume / 150000, 50); // Employees based on revenue
  
  // Accessibility rating estimation based on income and demographics
  const estimatedAccessibility = Math.min(
    60 + // Base accessibility level
    (medianIncome >= 60000 ? 20 : medianIncome >= 45000 ? 15 : 10) + // Income-based accessibility
    (demographicScore / 100) * 20, // Market strength factor
    100
  );
  
  // Parking and transit estimates
  const estimatedParking = Math.min(estimatedTheaterDensity * 50, 500); // Parking spaces per theater
  const estimatedTransitAccess = Math.min(
    (populationDensity / 1000) * 50 + // Density-based transit
    (totalPop >= 100000 ? 30 : totalPop >= 50000 ? 20 : 10), // Population tier bonus
    100
  );
  
  let theaterScore = 0;
  
  // 1. Venue Density Score (30 points)
  // Number of theaters within 2-mile radius
  const densityScore = Math.min((estimatedTheaterDensity / 8) * 30, 30); // Scale to 30 points max
  theaterScore += densityScore;
  
  // 2. Capacity Assessment Score (25 points)
  // Total seating capacity and venue size distribution
  const capacityScore = Math.min((estimatedCapacity / 60000) * 25, 25); // Scale to 25 points max
  theaterScore += capacityScore;
  
  // 3. Accessibility Features Score (20 points)
  // ADA compliance, parking, transit access
  const accessibilityWeight = 0.5;
  const parkingWeight = 0.3;
  const transitWeight = 0.2;
  
  const accessibilityScore = 
    (estimatedAccessibility / 100) * 20 * accessibilityWeight +
    Math.min(estimatedParking / 200, 1) * 20 * parkingWeight +
    (estimatedTransitAccess / 100) * 20 * transitWeight;
  
  theaterScore += Math.min(accessibilityScore, 20);
  
  // 4. Market Infrastructure Score (15 points)
  // Sales volume and operational health
  const infrastructureScore = Math.min(
    (estimatedSalesVolume / 2000000) * 10 + // Sales volume component
    (estimatedEmployees / 30) * 5, // Employment component
    15
  );
  theaterScore += infrastructureScore;
  
  // 5. Location Suitability Score (10 points)
  // Population density and market match
  const locationScore = Math.min(
    (populationDensity / 3000) * 6 + // Density component
    (totalPop >= 50000 ? 4 : totalPop >= 25000 ? 3 : totalPop >= 10000 ? 2 : 1), // Population tier
    10
  );
  theaterScore += locationScore;
  
  const finalScore = Math.min(Math.max(theaterScore, 0), 100);
  
  return {
    theater_accessibility_score: Math.round(finalScore * 100) / 100,
    
    // Component scores
    venue_density_score: Math.round(densityScore * 100) / 100,
    capacity_assessment_score: Math.round(capacityScore * 100) / 100,
    accessibility_features_score: Math.round(accessibilityScore * 100) / 100,
    market_infrastructure_score: Math.round(infrastructureScore * 100) / 100,
    location_suitability_score: Math.round(locationScore * 100) / 100,
    
    // Infrastructure estimates
    theater_density_2mile_radius: Math.round(estimatedTheaterDensity * 100) / 100,
    total_theater_capacity_sqft: Math.round(estimatedCapacity),
    theater_sales_volume_annual: Math.round(estimatedSalesVolume),
    theater_employee_count: Math.round(estimatedEmployees),
    
    // Accessibility metrics
    venue_accessibility_rating: Math.round(estimatedAccessibility * 100) / 100,
    parking_capacity_total: Math.round(estimatedParking),
    public_transit_accessibility: Math.round(estimatedTransitAccess * 100) / 100,
    
    // Analysis results
    venue_infrastructure_strength: getVenueInfrastructureStrength(estimatedTheaterDensity, estimatedCapacity, estimatedSalesVolume),
    screening_capacity_assessment: getScreeningCapacityAssessment(estimatedTheaterDensity, estimatedCapacity),
    venue_type_recommendations: getVenueTypeRecommendations(estimatedTheaterDensity, estimatedCapacity, estimatedAccessibility),
    accessibility_compliance_level: getAccessibilityComplianceLevel(estimatedAccessibility),
    market_size_venue_match: getMarketSizeVenueMatch(totalPop, estimatedTheaterDensity, estimatedCapacity),
    
    // Performance metrics
    venue_revenue_per_capita: totalPop > 0 ? Math.round((estimatedSalesVolume / totalPop) * 100) / 100 : 0,
    seats_per_1000_residents: totalPop > 0 ? Math.round(((estimatedCapacity / totalPop) * 1000) * 100) / 100 : 0,
    population_density_per_sqmile: Math.round(populationDensity)
  };
}

function getVenueInfrastructureStrength(density, capacity, sales) {
  const infraScore = ((density * 15) + (capacity / 1000) + (sales / 100000)) / 3;
  
  if (infraScore >= 80) return 'Exceptional Venue Infrastructure - Multiple premium theaters with high capacity';
  if (infraScore >= 65) return 'Strong Theater Market - Good venue selection with adequate capacity';
  if (infraScore >= 50) return 'Moderate Venue Options - Limited but viable screening locations';
  if (infraScore >= 35) return 'Basic Venue Infrastructure - Minimal theater options available';
  return 'Limited Venue Infrastructure - Very few or no suitable theaters';
}

function getScreeningCapacityAssessment(density, capacity) {
  if (density >= 8 && capacity >= 50000) return 'Wide Release Capable - Support multiple concurrent screenings';
  if (density >= 5 && capacity >= 25000) return 'Limited Release Suitable - Adequate for standard theatrical release';
  if (density >= 3 && capacity >= 10000) return 'Selective Release Appropriate - Best for targeted screenings';
  if (density >= 1 && capacity >= 2000) return 'Special Screening Only - Single venue, limited capacity';
  return 'Not Suitable for Theatrical Release - Consider digital distribution';
}

function getVenueTypeRecommendations(density, capacity, accessibility) {
  if (density >= 6 && accessibility >= 80) {
    return 'Premium theater chains, arts centers, historic venues with full accessibility';
  }
  if (density >= 4 && accessibility >= 60) {
    return 'Standard multiplexes, community theaters with good accessibility';
  }
  if (density >= 2) {
    return 'Community centers, local theaters, alternative screening venues';
  }
  if (density >= 1) {
    return 'Single venue options: community center, library auditorium, or mobile screening';
  }
  return 'Consider outdoor screening, pop-up venues, or digital-only distribution';
}

function getAccessibilityComplianceLevel(accessibilityRating) {
  if (accessibilityRating >= 90) return 'Fully ADA Compliant - Excellent accessibility features';
  if (accessibilityRating >= 75) return 'Good Accessibility - Most ADA requirements met';
  if (accessibilityRating >= 60) return 'Basic Accessibility - Minimum compliance standards';
  if (accessibilityRating >= 40) return 'Limited Accessibility - Some barriers may exist';
  return 'Accessibility Concerns - May require venue modifications or alternative options';
}

function getMarketSizeVenueMatch(population, venueCount, capacity) {
  const venuesPerThousand = population > 0 ? (venueCount / (population / 1000)) : 0;
  const capacityPerThousand = population > 0 ? (capacity / (population / 1000)) : 0;
  
  if (venuesPerThousand >= 0.5 && capacityPerThousand >= 50) {
    return 'Excellent Market-Venue Match - High venue density and capacity for population';
  }
  if (venuesPerThousand >= 0.3 && capacityPerThousand >= 30) {
    return 'Good Market-Venue Balance - Adequate venues for market size';
  }
  if (venuesPerThousand >= 0.1 && capacityPerThousand >= 15) {
    return 'Moderate Venue Coverage - Limited but proportional to market';
  }
  if (venuesPerThousand >= 0.05) {
    return 'Minimal Venue Options - Under-served market relative to population';
  }
  return 'Venue Desert - Insufficient theater infrastructure for market size';
}

// Process all records
let processedCount = 0;
let errorCount = 0;

const results = correlationData.results.map(record => {
  try {
    const scores = calculateTheaterAccessibilityScore(record);
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

console.log(`✅ Theater accessibility analysis completed:`);
console.log(`   📊 ${processedCount} records processed successfully`);
console.log(`   ⚠️  ${errorCount} records had errors`);

// Calculate infrastructure statistics
const validScores = results.filter(r => r.theater_accessibility_score !== undefined);

if (validScores.length > 0) {
  const scores = validScores.map(r => r.theater_accessibility_score);
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  
  const totalVenues = validScores.reduce((sum, r) => sum + r.theater_density_2mile_radius, 0);
  const totalCapacity = validScores.reduce((sum, r) => sum + r.total_theater_capacity_sqft, 0);
  const avgVenuesPerArea = totalVenues / validScores.length;
  
  console.log(`📈 Theater Infrastructure Statistics:`);
  console.log(`   Average Score: ${avgScore.toFixed(2)}`);
  console.log(`   Score Range: ${minScore.toFixed(2)} - ${maxScore.toFixed(2)}`);
  console.log(`   Total Estimated Venues: ${Math.round(totalVenues)}`);
  console.log(`   Total Estimated Capacity: ${Math.round(totalCapacity).toLocaleString()}`);
  console.log(`   Average Venues per Area: ${avgVenuesPerArea.toFixed(1)}`);
  
  // Infrastructure classification
  const exceptional = scores.filter(s => s >= 80).length;
  const strong = scores.filter(s => s >= 65 && s < 80).length;
  const moderate = scores.filter(s => s >= 50 && s < 65).length;
  const limited = scores.filter(s => s < 50).length;
  
  const highCapacity = validScores.filter(r => r.total_theater_capacity_sqft >= 25000).length;
  const accessible = validScores.filter(r => r.venue_accessibility_rating >= 75).length;
  
  console.log(`🎭 Theater Market Classification:`);
  console.log(`   🌟 Exceptional Infrastructure (80-100): ${exceptional} areas`);
  console.log(`   ⭐ Strong Infrastructure (65-79): ${strong} areas`);
  console.log(`   ⚡ Moderate Infrastructure (50-64): ${moderate} areas`);
  console.log(`   📍 Limited Infrastructure (0-49): ${limited} areas`);
  console.log(`   🏢 High Capacity Markets (25k+ seats): ${highCapacity} areas`);
  console.log(`   ♿ Accessible Venues (75+ rating): ${accessible} areas`);
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

// Create theater-specific dataset export
const theaterResults = results.filter(r => r.theater_accessibility_score !== undefined);
const theaterDataPath = path.join(__dirname, '../../public/data/theater-accessibility-export.json');

const theaterExport = {
  metadata: {
    generated_at: new Date().toISOString(),
    analysis_type: 'theater_accessibility_analysis',
    target_audience: 'Documentary screening venues',
    geographic_scope: 'Midwest United States (IL, IN, WI)',
    venue_types: [
      'Traditional movie theaters and multiplexes',
      'Arts centers and cultural venues',
      'Community centers with screening capabilities',
      'Historic theaters and specialty venues'
    ],
    scoring_methodology: 'Venue Density (30%) + Capacity Assessment (25%) + Accessibility Features (20%) + Market Infrastructure (15%) + Location Suitability (10%)',
    estimation_note: 'Theater metrics estimated from demographic and economic indicators',
    record_count: theaterResults.length
  },
  results: theaterResults
};

fs.writeFileSync(theaterDataPath, JSON.stringify(theaterExport, null, 2));
console.log(`🎭 Theater accessibility analysis export saved to ${theaterDataPath}`);

console.log('🎬 Theater Accessibility Analysis for The Doors Documentary completed successfully!');
console.log('🎯 Ready for venue selection and screening location optimization');