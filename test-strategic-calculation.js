/**
 * Test script to verify strategic value score calculation
 * Tests the CoreAnalysisProcessor strategic calculation logic
 */

// Mock data similar to what we'd get from correlation analysis
const testData = [
  {
    ID: "10001",
    DESCRIPTION: "ZIP 10001",
    value_MP30034A_B_P: 15.5,  // Nike market share
    value_MP30029A_B_P: 12.3,  // Adidas market share  
    value_TOTPOP_CY: 45000,    // Total population
    value_AVGHINC_CY: 75000    // Average income
  },
  {
    ID: "10002", 
    DESCRIPTION: "ZIP 10002",
    value_MP30034A_B_P: 8.2,   // Nike market share
    value_MP30029A_B_P: 18.7,  // Adidas market share
    value_TOTPOP_CY: 32000,    // Total population  
    value_AVGHINC_CY: 52000    // Average income
  },
  {
    ID: "10003",
    DESCRIPTION: "ZIP 10003", 
    value_MP30034A_B_P: 22.1,  // Nike market share
    value_MP30029A_B_P: 9.4,   // Adidas market share
    value_TOTPOP_CY: 67000,    // Total population
    value_AVGHINC_CY: 95000    // Average income
  },
  {
    ID: "10004",
    DESCRIPTION: "ZIP 10004",
    value_MP30034A_B_P: 3.2,   // Nike market share
    value_MP30029A_B_P: 4.1,   // Adidas market share  
    value_TOTPOP_CY: 18000,    // Total population
    value_AVGHINC_CY: 38000    // Average income
  },
  {
    ID: "10005",
    DESCRIPTION: "ZIP 10005",
    value_MP30034A_B_P: 12.8,  // Nike market share
    value_MP30029A_B_P: 15.2,  // Adidas market share
    value_TOTPOP_CY: 89000,    // Total population
    value_AVGHINC_CY: 110000   // Average income
  }
];

console.log('🧪 TESTING STRATEGIC VALUE CALCULATION LOGIC 🧪\n');

testData.forEach((record, index) => {
  console.log(`=== RECORD ${index + 1}: ${record.DESCRIPTION} ===`);
  
  // Get actual brand values from the data
  const nikeValue = Number(record.value_MP30034A_B_P) || 0;
  const adidasValue = Number(record.value_MP30029A_B_P) || 0; 
  const totalPop = Number(record.value_TOTPOP_CY) || 1;
  const medianIncome = Number(record.value_AVGHINC_CY) || 50000;
  
  console.log(`Raw Data:`, {
    nike_share: nikeValue + '%',
    adidas_share: adidasValue + '%', 
    population: totalPop.toLocaleString(),
    income: '$' + medianIncome.toLocaleString()
  });
  
  // Calculate market gap
  const marketGap = Math.max(0, 100 - nikeValue - adidasValue);
  
  // IMPROVED: 5-component strategic value calculation (0-10 scale)
  
  // 1. Market Opportunity (0-3 points): Based on untapped market potential
  const marketOpportunity = Math.min(3, (marketGap / 100) * 3);
  
  // 2. Economic Attractiveness (0-2 points): Income-adjusted population
  const economicScore = Math.min(2, 
    (Math.max(0, (medianIncome - 30000) / 70000) * 1) + // Income factor (0-1)
    (Math.min(totalPop / 100000, 1) * 1)                // Population factor (0-1)
  );
  
  // 3. Competitive Position (0-2 points): Nike's current standing
  const competitiveScore = Math.min(2,
    (Math.max(0, nikeValue / 50) * 1) +           // Nike strength (0-1)
    (Math.max(0, (nikeValue - adidasValue) / 25) * 1) // Relative advantage (0-1)
  );
  
  // 4. Growth Potential (0-2 points): Based on market dynamics
  const growthPotential = Math.min(2,
    (marketGap > 80 ? 1 : marketGap / 80) +      // High untapped market (0-1)
    (medianIncome > 60000 ? 1 : 0)               // High-income bonus (0-1)
  );
  
  // 5. Strategic Fit (0-1 points): Urban/suburban preference
  const strategicFit = Math.min(1, 
    totalPop > 25000 ? 1 : totalPop / 25000      // Urban density preference
  );
  
  // Composite strategic value score (0-10 scale)
  const strategicValueScore = Math.min(10, 
    marketOpportunity + economicScore + competitiveScore + growthPotential + strategicFit
  );
  
  console.log(`Calculation Components:`, {
    market_gap: marketGap.toFixed(1) + '%',
    market_opportunity: marketOpportunity.toFixed(2) + '/3',
    economic_score: economicScore.toFixed(2) + '/2', 
    competitive_score: competitiveScore.toFixed(2) + '/2',
    growth_potential: growthPotential.toFixed(2) + '/2',
    strategic_fit: strategicFit.toFixed(2) + '/1'
  });
  
  console.log(`🎯 FINAL STRATEGIC VALUE SCORE: ${strategicValueScore.toFixed(2)}/10\n`);
});

console.log('✅ Test completed. Scores should vary based on market conditions.');
console.log('💡 Each component contributes differently based on market characteristics.');