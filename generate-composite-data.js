const fs = require('fs');

/**
 * Generate comprehensive composite index data with all demographic data and delta calculations
 */

function calculateDelta(current, future, label = '') {
  const delta = future - current;
  const percentChange = current > 0 ? (delta / current) * 100 : 0;
  
  if (label) {
    console.log(`  ${label}: ${current} -> ${future} (Δ${delta}, ${percentChange.toFixed(1)}%)`);
  }
  
  return {
    absolute: Math.round(delta),
    percent: Math.round(percentChange * 100) / 100 // Round to 2 decimal places
  };
}

/**
 * Calculate composite indices for all FSA records
 */
function calculateCompositeIndices(data) {
  console.log('   📊 Calculating normalization values...');
  
  // Calculate max values for normalization
  const maxValues = {
    hhGrowth: Math.max(...data.map(d => Math.max(0, d.TOTAL_HH_DELTA_2024_2034.percent))),
    incomeGrowth: Math.max(...data.map(d => Math.max(0, d.HH_INCOME_MEDIAN_DELTA_2024_2029.percent))),
    ownedGrowth: Math.max(...data.map(d => Math.max(0, d.OWNED_DELTA_2024_2034.percent))),
    population: Math.max(...data.map(d => d.POPULATION_2024)),
    rentalPercent: Math.max(...data.map(d => d.RENTED_PERCENT_2024))
  };
  
  console.log('   🔥 Calculating Hot Growth Index...');
  data.forEach(record => {
    record.HOT_GROWTH_INDEX = calculateHotGrowthIndex(record, maxValues);
  });
  
  console.log('   🏠 Calculating New Homeowner Index...');
  data.forEach(record => {
    record.NEW_HOMEOWNER_INDEX = calculateNewHomeownerIndex(record);
  });
  
  console.log('   💰 Calculating Housing Affordability Index...');
  data.forEach(record => {
    record.HOUSING_AFFORDABILITY_INDEX = calculateHousingAffordabilityIndex(record, maxValues);
  });
  
  // Calculate index statistics
  const indexStats = {
    hotGrowth: {
      avg: Math.round(data.reduce((sum, d) => sum + d.HOT_GROWTH_INDEX, 0) / data.length * 100) / 100,
      max: Math.max(...data.map(d => d.HOT_GROWTH_INDEX)),
      min: Math.min(...data.map(d => d.HOT_GROWTH_INDEX))
    },
    newHomeowner: {
      avg: Math.round(data.reduce((sum, d) => sum + d.NEW_HOMEOWNER_INDEX, 0) / data.length * 100) / 100,
      max: Math.max(...data.map(d => d.NEW_HOMEOWNER_INDEX)),
      min: Math.min(...data.map(d => d.NEW_HOMEOWNER_INDEX))
    },
    affordability: {
      avg: Math.round(data.reduce((sum, d) => sum + d.HOUSING_AFFORDABILITY_INDEX, 0) / data.length * 100) / 100,
      max: Math.max(...data.map(d => d.HOUSING_AFFORDABILITY_INDEX)),
      min: Math.min(...data.map(d => d.HOUSING_AFFORDABILITY_INDEX))
    }
  };
  
  console.log('\n   📈 Index Statistics:');
  console.log(`     Hot Growth - Avg: ${indexStats.hotGrowth.avg}, Range: ${indexStats.hotGrowth.min}-${indexStats.hotGrowth.max}`);
  console.log(`     New Homeowner - Avg: ${indexStats.newHomeowner.avg}, Range: ${indexStats.newHomeowner.min}-${indexStats.newHomeowner.max}`);
  console.log(`     Affordability - Avg: ${indexStats.affordability.avg}, Range: ${indexStats.affordability.min}-${indexStats.affordability.max}`);
}

/**
 * Calculate Hot Growth Index (0-100 scale)
 */
function calculateHotGrowthIndex(record, maxValues) {
  // HH Growth Score (40% weight)
  const hhGrowthScore = maxValues.hhGrowth > 0 ? 
    (Math.max(0, record.TOTAL_HH_DELTA_2024_2034.percent) / maxValues.hhGrowth) * 100 : 0;
  
  // Income Growth Score (25% weight)  
  const incomeGrowthScore = maxValues.incomeGrowth > 0 ? 
    (Math.max(0, record.HH_INCOME_MEDIAN_DELTA_2024_2029.percent) / maxValues.incomeGrowth) * 100 : 0;
  
  // Ownership Growth Score (20% weight)
  const ownershipGrowthScore = maxValues.ownedGrowth > 0 ? 
    (Math.max(0, record.OWNED_DELTA_2024_2034.percent) / maxValues.ownedGrowth) * 100 : 0;
  
  // Population Density Score (15% weight)
  const populationScore = maxValues.population > 0 ? 
    (record.POPULATION_2024 / maxValues.population) * 100 : 0;
  
  // Weighted average
  const hotGrowthIndex = (
    (hhGrowthScore * 0.40) + 
    (incomeGrowthScore * 0.25) + 
    (ownershipGrowthScore * 0.20) + 
    (populationScore * 0.15)
  );
  
  return Math.round(Math.min(100, Math.max(0, hotGrowthIndex)) * 100) / 100;
}

/**
 * Calculate New Homeowner Index (0-100 scale)
 */
function calculateNewHomeownerIndex(record) {
  // Affordability Score (35% weight) - inverse of price-to-income ratio
  const priceToIncome = record.HH_INCOME_MEDIAN_2024 > 0 ? 
    record.HOUSING_VALUE_2024 / record.HH_INCOME_MEDIAN_2024 : 0;
  const affordabilityScore = Math.max(0, 100 - (priceToIncome * 25));
  
  // Young Maintainer Score (30% weight)
  const youngMaintainerRatio = record.TOTAL_HH_2024 > 0 ? 
    (record.MAINTAINERS_25_34_2024 / record.TOTAL_HH_2024) * 1000 : 0;
  const youngMaintainerScore = Math.min(100, youngMaintainerRatio);
  
  // Rental to Own Transition Score (25% weight)
  const ownershipChange = record.OWNED_PERCENT_2029 - record.OWNED_PERCENT_2024;
  const transitionScore = Math.min(100, Math.max(0, (ownershipChange + 5) * 10));
  
  // Growth Stability Score (10% weight)
  const growthDiff = Math.abs(
    record.TOTAL_HH_DELTA_2024_2029.percent - record.TOTAL_HH_DELTA_2029_2034.percent
  );
  const stabilityScore = Math.max(0, 100 - (growthDiff * 5));
  
  // Weighted average
  const newHomeownerIndex = (
    (affordabilityScore * 0.35) + 
    (youngMaintainerScore * 0.30) + 
    (transitionScore * 0.25) + 
    (stabilityScore * 0.10)
  );
  
  return Math.round(Math.min(100, Math.max(0, newHomeownerIndex)) * 100) / 100;
}

/**
 * Calculate Housing Affordability Index (0-100 scale)
 */
function calculateHousingAffordabilityIndex(record, maxValues) {
  // Debt Service Ratio Score (50% weight)
  const debtServiceScore = calculateDebtServiceRatioScore(record);
  
  // Rental Market Score (25% weight)
  const rentalScore = maxValues.rentalPercent > 0 ? 
    (record.RENTED_PERCENT_2024 / maxValues.rentalPercent) * 100 : 0;
  
  // Income Growth Score (15% weight)
  const incomeGrowthScore = maxValues.incomeGrowth > 0 ? 
    (Math.max(0, record.HH_INCOME_MEDIAN_DELTA_2024_2029.percent) / maxValues.incomeGrowth) * 100 : 0;
  
  // Housing Supply Score (10% weight)
  const supplyScore = maxValues.hhGrowth > 0 ? 
    (Math.max(0, record.TOTAL_HH_DELTA_2024_2034.percent) / maxValues.hhGrowth) * 100 : 0;
  
  // Weighted average
  const affordabilityIndex = (
    (debtServiceScore * 0.50) + 
    (rentalScore * 0.25) + 
    (incomeGrowthScore * 0.15) + 
    (supplyScore * 0.10)
  );
  
  return Math.round(Math.min(100, Math.max(0, affordabilityIndex)) * 100) / 100;
}

/**
 * Calculate Debt Service Ratio Score based on Canadian lending standards
 */
function calculateDebtServiceRatioScore(record) {
  if (record.HH_INCOME_MEDIAN_2024 <= 0) return 0;
  
  // Assume 5% of housing value as annual housing costs (mortgage, taxes, utilities)
  const annualHousingCosts = record.HOUSING_VALUE_2024 * 0.05;
  const monthlyIncome = record.HH_INCOME_MEDIAN_2024 / 12;
  const monthlyHousingCosts = annualHousingCosts / 12;
  
  // GDS Ratio (Gross Debt Service) - housing costs only
  const gdsRatio = monthlyIncome > 0 ? monthlyHousingCosts / monthlyIncome : 0;
  const gdsScore = Math.max(0, 100 - ((gdsRatio / 0.39) * 100)); // 39% threshold
  
  // TDS Ratio (Total Debt Service) - assume 15% additional debt load
  const tdsRatio = gdsRatio * 1.15;
  const tdsScore = Math.max(0, 100 - ((tdsRatio / 0.44) * 100)); // 44% threshold
  
  // Combined score: 60% GDS, 40% TDS
  return (gdsScore * 0.6) + (tdsScore * 0.4);
}

async function generateCompositeData() {
  console.log('🏗️  Generating comprehensive composite index data...');
  
  try {
    // Fetch the Quebec housing data
    console.log('📥 Fetching Quebec housing dataset...');
    const response = await fetch('https://tao6dvjnrqq6hwa0.public.blob.vercel-storage.com/real/comparative-analysis-DhTEoxEELgy7WD8Hxhcj9iyFpNULe1.json');
    const dataset = await response.json();
    
    console.log(`📊 Processing ${dataset.results.length} FSA records...`);
    
    // Generate comprehensive data with deltas
    const compositeData = dataset.results.map((record, index) => {
      const geoid = record.ID;
      
      // Show progress for first few records
      if (index < 3) {
        console.log(`\n🔍 Processing ${geoid} (${record.DESCRIPTION}):`);
      }
      
      // Base demographic data
      const baseData = {
        GEOID: geoid,
        DESCRIPTION: record.DESCRIPTION,
        
        // Population data
        POPULATION_2024: record.ECYPTAPOP || 0,
        
        // Total Households
        TOTAL_HH_2024: record.ECYTENHHD || 0,
        TOTAL_HH_2029: record.P5YTENHHD || 0,
        TOTAL_HH_2034: record.P0YTENHHD || 0,
        
        // Owned Housing
        OWNED_2024: record.ECYTENOWN || 0,
        OWNED_2029: record.P5YTENOWN || 0,
        OWNED_2034: record.P0YTENOWN || 0,
        
        // Rented Housing
        RENTED_2024: record.ECYTENRENT || 0,
        RENTED_2029: record.P5YTENRENT || 0,
        RENTED_2034: record.P0YTENRENT || 0,
        
        // Income data
        HH_INCOME_AVG_2024: record.ECYHRIAVG || 0,
        HH_INCOME_AVG_2029: record.P5YHRIAVG || 0,
        HH_INCOME_MEDIAN_2024: record.ECYHNIMED || 0,
        HH_INCOME_MEDIAN_2029: record.P5YHNIMED || 0,
        HH_INCOME_AGGREGATE_2024: record.ECYHRIAGG || 0,
        HH_INCOME_AGGREGATE_2029: record.P5YHRIAGG || 0,
        
        // Housing values and other metrics
        HOUSING_VALUE_2024: record.HSTE001_A || 0,
        
        // Condo data
        CONDO_TOTAL_2024: record.ECYCDOCO || 0,
        CONDO_OWNED_2024: record.ECYCDOOWCO || 0,
        CONDO_RENTED_2024: record.ECYCDORECO || 0,
        
        // Percentages (already calculated)
        OWNED_PERCENT_2024: record.ECYTENOWN_P || 0,
        OWNED_PERCENT_2029: record.P5YTENOWN_P || 0,
        OWNED_PERCENT_2034: record.P0YTENOWN_P || 0,
        
        RENTED_PERCENT_2024: record.ECYTENRENT_P || 0,
        RENTED_PERCENT_2029: record.P5YTENRENT_P || 0,
        RENTED_PERCENT_2034: record.P0YTENRENT_P || 0,
        
        // Maintainer age groups (if available)
        MAINTAINERS_15_24_2024: record.ECYMTN1524 || 0,
        MAINTAINERS_25_34_2024: record.ECYMTN2534 || 0,
      };
      
      // Calculate delta fields
      const deltas = {
        // Total Households deltas
        TOTAL_HH_DELTA_2024_2029: calculateDelta(
          baseData.TOTAL_HH_2024, 
          baseData.TOTAL_HH_2029,
          index < 3 ? 'Total HH 2024-2029' : ''
        ),
        TOTAL_HH_DELTA_2029_2034: calculateDelta(
          baseData.TOTAL_HH_2029, 
          baseData.TOTAL_HH_2034,
          index < 3 ? 'Total HH 2029-2034' : ''
        ),
        TOTAL_HH_DELTA_2024_2034: calculateDelta(
          baseData.TOTAL_HH_2024, 
          baseData.TOTAL_HH_2034,
          index < 3 ? 'Total HH 2024-2034' : ''
        ),
        
        // Owned Housing deltas
        OWNED_DELTA_2024_2029: calculateDelta(
          baseData.OWNED_2024, 
          baseData.OWNED_2029,
          index < 3 ? 'Owned 2024-2029' : ''
        ),
        OWNED_DELTA_2029_2034: calculateDelta(
          baseData.OWNED_2029, 
          baseData.OWNED_2034,
          index < 3 ? 'Owned 2029-2034' : ''
        ),
        OWNED_DELTA_2024_2034: calculateDelta(
          baseData.OWNED_2024, 
          baseData.OWNED_2034,
          index < 3 ? 'Owned 2024-2034' : ''
        ),
        
        // Rented Housing deltas
        RENTED_DELTA_2024_2029: calculateDelta(
          baseData.RENTED_2024, 
          baseData.RENTED_2029,
          index < 3 ? 'Rented 2024-2029' : ''
        ),
        RENTED_DELTA_2029_2034: calculateDelta(
          baseData.RENTED_2029, 
          baseData.RENTED_2034,
          index < 3 ? 'Rented 2029-2034' : ''
        ),
        RENTED_DELTA_2024_2034: calculateDelta(
          baseData.RENTED_2024, 
          baseData.RENTED_2034,
          index < 3 ? 'Rented 2024-2034' : ''
        ),
        
        // Income deltas (Average)
        HH_INCOME_AVG_DELTA_2024_2029: calculateDelta(
          baseData.HH_INCOME_AVG_2024, 
          baseData.HH_INCOME_AVG_2029,
          index < 3 ? 'Avg Income 2024-2029' : ''
        ),
        
        // Income deltas (Median)
        HH_INCOME_MEDIAN_DELTA_2024_2029: calculateDelta(
          baseData.HH_INCOME_MEDIAN_2024, 
          baseData.HH_INCOME_MEDIAN_2029,
          index < 3 ? 'Median Income 2024-2029' : ''
        ),
        
        // Income deltas (Aggregate)
        HH_INCOME_AGGREGATE_DELTA_2024_2029: calculateDelta(
          baseData.HH_INCOME_AGGREGATE_2024, 
          baseData.HH_INCOME_AGGREGATE_2029,
          index < 3 ? 'Aggregate Income 2024-2029' : ''
        ),
        
        // Ownership percentage deltas
        OWNED_PERCENT_DELTA_2024_2029: calculateDelta(
          baseData.OWNED_PERCENT_2024, 
          baseData.OWNED_PERCENT_2029,
          index < 3 ? 'Owned % 2024-2029' : ''
        ),
        OWNED_PERCENT_DELTA_2029_2034: calculateDelta(
          baseData.OWNED_PERCENT_2029, 
          baseData.OWNED_PERCENT_2034,
          index < 3 ? 'Owned % 2029-2034' : ''
        ),
        OWNED_PERCENT_DELTA_2024_2034: calculateDelta(
          baseData.OWNED_PERCENT_2024, 
          baseData.OWNED_PERCENT_2034,
          index < 3 ? 'Owned % 2024-2034' : ''
        ),
      };
      
      // Combine base data with deltas
      return {
        ...baseData,
        ...deltas,
        
        // Placeholder for composite index scores (calculated after all records processed)
        HOT_GROWTH_INDEX: 0,
        NEW_HOMEOWNER_INDEX: 0,
        HOUSING_AFFORDABILITY_INDEX: 0
      };
    });
    
    // Sort by GEOID for consistent ordering
    compositeData.sort((a, b) => a.GEOID.localeCompare(b.GEOID));

    // Calculate composite indices
    console.log('\n🧮 Calculating composite indices...');
    calculateCompositeIndices(compositeData);
    
    // Calculate summary statistics
    const stats = {
      totalFSAs: compositeData.length,
      sampleRecord: compositeData[0],
      fieldCount: Object.keys(compositeData[0]).length,
      
      // Growth trends summary
      totalHHGrowth: {
        avgGrowth2024_2029: Math.round(compositeData.reduce((sum, d) => sum + d.TOTAL_HH_DELTA_2024_2029.percent, 0) / compositeData.length * 100) / 100,
        avgGrowth2029_2034: Math.round(compositeData.reduce((sum, d) => sum + d.TOTAL_HH_DELTA_2029_2034.percent, 0) / compositeData.length * 100) / 100,
        avgGrowth2024_2034: Math.round(compositeData.reduce((sum, d) => sum + d.TOTAL_HH_DELTA_2024_2034.percent, 0) / compositeData.length * 100) / 100,
      },
      
      incomeGrowth: {
        avgIncomeGrowth: Math.round(compositeData.reduce((sum, d) => sum + d.HH_INCOME_AVG_DELTA_2024_2029.percent, 0) / compositeData.length * 100) / 100,
        medianIncomeGrowth: Math.round(compositeData.reduce((sum, d) => sum + d.HH_INCOME_MEDIAN_DELTA_2024_2029.percent, 0) / compositeData.length * 100) / 100,
      }
    };
    
    console.log('\n📈 Growth Statistics Summary:');
    console.log(`   Total FSAs processed: ${stats.totalFSAs}`);
    console.log(`   Fields per record: ${stats.fieldCount}`);
    console.log(`   Avg HH Growth 2024-2029: ${stats.totalHHGrowth.avgGrowth2024_2029}%`);
    console.log(`   Avg HH Growth 2029-2034: ${stats.totalHHGrowth.avgGrowth2029_2034}%`);
    console.log(`   Avg HH Growth 2024-2034: ${stats.totalHHGrowth.avgGrowth2024_2034}%`);
    console.log(`   Avg Income Growth: ${stats.incomeGrowth.avgIncomeGrowth}%`);
    console.log(`   Median Income Growth: ${stats.incomeGrowth.medianIncomeGrowth}%`);
    
    // Show field structure
    console.log('\n📋 Data Structure:');
    const fieldNames = Object.keys(compositeData[0]);
    const baseFields = fieldNames.filter(f => !f.includes('DELTA') && !f.includes('INDEX'));
    const deltaFields = fieldNames.filter(f => f.includes('DELTA'));
    const indexFields = fieldNames.filter(f => f.includes('INDEX'));
    
    console.log(`   Base fields (${baseFields.length}): ${baseFields.slice(0, 10).join(', ')}...`);
    console.log(`   Delta fields (${deltaFields.length}): ${deltaFields.slice(0, 5).join(', ')}...`);
    console.log(`   Index fields (${indexFields.length}): ${indexFields.join(', ')}`);
    
    // Write comprehensive data to file
    console.log('\n💾 Writing comprehensive composite data...');
    fs.writeFileSync('./composite-index-comprehensive.json', JSON.stringify(compositeData, null, 2));
    console.log(`✅ Generated composite-index-comprehensive.json with ${compositeData.length} FSAs and ${stats.fieldCount} fields each`);
    
    console.log('\n🎯 Next Step: Now we can discuss how to calculate meaningful composite index scores using:');
    console.log('   • Growth trends (delta fields)');
    console.log('   • Current market conditions (base fields)'); 
    console.log('   • Population and income dynamics');
    console.log('   • Housing tenure patterns');
    
    return compositeData;
    
  } catch (error) {
    console.error('❌ Error generating composite data:', error);
    throw error;
  }
}

// Run the generator
generateCompositeData()
  .then(() => {
    console.log('🎉 Comprehensive data generation completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Failed to generate composite data:', error);
    process.exit(1);
  });