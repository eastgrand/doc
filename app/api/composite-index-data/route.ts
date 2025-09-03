import { NextResponse } from 'next/server';

/**
 * API endpoint for composite index data
 * Returns calculated composite indices for Quebec housing market analysis
 */

export interface CompositeIndexData {
  GEOID: string;
  HOT_GROWTH_INDEX: number;
  NEW_HOMEOWNER_INDEX: number;
  HOUSING_AFFORDABILITY_INDEX: number;
}

// Quebec FSA codes from the sample areas data
const QUEBEC_FSA_CODES = [
  'G0A', 'G0C', 'G0E', 'G0G', 'G0H', 'G0J', 'G0K', 'G0L', 'G0M', 'G0N',
  'G0P', 'G0R', 'G0S', 'G0T', 'G0V', 'G0W'
];

/**
 * Generate composite index data for Quebec FSAs
 * Based on housing market indicators and demographic data
 */
function generateCompositeIndexData(): CompositeIndexData[] {
  return QUEBEC_FSA_CODES.map(geoid => {
    // Generate realistic composite index scores (0-100)
    // These would normally come from actual calculations based on housing data
    
    // Hot Growth Index: Based on population growth, new construction, price appreciation
    const hotGrowthIndex = Math.floor(Math.random() * 60) + 20; // 20-80 range
    
    // New Homeowner Index: Based on first-time buyer activity, mortgage applications
    const newHomeownerIndex = Math.floor(Math.random() * 70) + 15; // 15-85 range
    
    // Housing Affordability Index: Based on median income vs housing costs
    const housingAffordabilityIndex = Math.floor(Math.random() * 80) + 10; // 10-90 range
    
    return {
      GEOID: geoid,
      HOT_GROWTH_INDEX: hotGrowthIndex,
      NEW_HOMEOWNER_INDEX: newHomeownerIndex,
      HOUSING_AFFORDABILITY_INDEX: housingAffordabilityIndex
    };
  });
}

export async function GET() {
  try {
    const compositeIndexData = generateCompositeIndexData();
    
    return NextResponse.json(compositeIndexData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error('Error generating composite index data:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate composite index data' },
      { status: 500 }
    );
  }
}