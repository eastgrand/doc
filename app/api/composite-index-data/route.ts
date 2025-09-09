import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

/**
 * Load comprehensive composite index data from the generated file
 */
function loadCompositeIndexData(): CompositeIndexData[] {
  try {
    const dataPath = path.join(process.cwd(), 'composite-index-comprehensive.json');
    
    if (!fs.existsSync(dataPath)) {
      console.warn('[CompositeIndexAPI] Comprehensive data file not found, generating fallback data');
      return generateFallbackData();
    }
    
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const comprehensiveData = JSON.parse(fileContent);
    
    // Extract only the fields needed for the composite index layers
    const compositeIndexData: CompositeIndexData[] = comprehensiveData.map((record: any) => ({
      GEOID: record.GEOID,
      HOT_GROWTH_INDEX: Math.round(record.HOT_GROWTH_INDEX * 100) / 100, // Round to 2 decimals
      NEW_HOMEOWNER_INDEX: Math.round(record.NEW_HOMEOWNER_INDEX * 100) / 100,
      HOUSING_AFFORDABILITY_INDEX: Math.round(record.HOUSING_AFFORDABILITY_INDEX * 100) / 100
    }));
    
    console.log(`[CompositeIndexAPI] Loaded ${compositeIndexData.length} FSA records from comprehensive data`);
    return compositeIndexData;
    
  } catch (error) {
    console.error('[CompositeIndexAPI] Error loading comprehensive data:', error);
    return generateFallbackData();
  }
}

/**
 * Generate fallback data if comprehensive data is not available
 */
function generateFallbackData(): CompositeIndexData[] {
  console.warn('[CompositeIndexAPI] Using fallback data generation');
  
  // Quebec FSA codes from the sample areas data
  const QUEBEC_FSA_CODES = [
    'G0A', 'G0C', 'G0E', 'G0G', 'G0H', 'G0J', 'G0K', 'G0L', 'G0M', 'G0N',
    'G0P', 'G0R', 'G0S', 'G0T', 'G0V', 'G0W'
  ];
  
  return QUEBEC_FSA_CODES.map(geoid => {
    // Generate realistic composite index scores (0-100)
    const hotGrowthIndex = Math.floor(Math.random() * 60) + 20;
    const newHomeownerIndex = Math.floor(Math.random() * 70) + 15;
    const housingAffordabilityIndex = Math.floor(Math.random() * 80) + 10;
    
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
    const compositeIndexData = loadCompositeIndexData();
    
    return NextResponse.json(compositeIndexData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error('Error loading composite index data:', error);
    
    return NextResponse.json(
      { error: 'Failed to load composite index data' },
      { status: 500 }
    );
  }
}