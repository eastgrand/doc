/**
 * Geo-Awareness System Test
 * 
 * Test the new geographic filtering system with sample data and queries
 */

import { GeoAwarenessEngine } from './GeoAwarenessEngine';

// Sample test data that mimics the structure from various endpoints
const sampleData = [
  {
    area_id: 'NYC_001',
    DESCRIPTION: 'Manhattan Financial District (New York)',
    ZIP_CODE: '10001',
    value: 85.5,
    coordinates: [-74.0059, 40.7128]
  },
  {
    area_id: 'NYC_002', 
    DESCRIPTION: 'Brooklyn Heights (Brooklyn)',
    ZIP_CODE: '11201',
    value: 78.2,
    coordinates: [-73.9969, 40.6962]
  },
  {
    area_id: 'LA_001',
    DESCRIPTION: 'Hollywood District (Los Angeles)',
    ZIP_CODE: '90028',
    value: 92.1,
    coordinates: [-118.3267, 34.0928]
  },
  {
    area_id: 'CHI_001',
    DESCRIPTION: 'Loop Business District (Chicago)',
    ZIP_CODE: '60601',
    value: 87.3,
    coordinates: [-87.6298, 41.8781]
  },
  {
    area_id: 'SF_001',
    DESCRIPTION: 'Financial District (San Francisco)',
    ZIP_CODE: '94104',
    value: 94.7,
    coordinates: [-122.4194, 37.7749]
  },
  {
    area_id: 'PHILLY_001',
    DESCRIPTION: 'Center City (Philadelphia)',
    ZIP_CODE: '19102',
    value: 76.8,
    coordinates: [-75.1652, 39.9526]
  },
  {
    area_id: 'MIA_001',
    DESCRIPTION: 'Downtown Miami (Miami)',
    ZIP_CODE: '33101',
    value: 81.4,
    coordinates: [-80.1918, 25.7617]
  },
  {
    area_id: 'ATL_001',
    DESCRIPTION: 'Midtown Atlanta (Atlanta)',
    ZIP_CODE: '30309',
    value: 79.6,
    coordinates: [-84.3880, 33.7490]
  }
];

// Test queries that should work with the new system
const testQueries = [
  'Show me data for New York',
  'Compare NYC vs LA performance',
  'Find stores in Philadelphia',  
  'What about San Francisco?',
  'Analyze trends in ZIP code 10001',
  'Show me California cities',
  'Northeast region analysis',
  'Bay Area performance metrics',
  'How is Chicago doing?',
  'Miami and Atlanta comparison',
  'West Coast vs East Coast',
  'Show me data for the Pacific Northwest'
];

/**
 * Test the geo-awareness engine with various queries
 */
export async function testGeoAwarenessSystem() {
  console.log('🔍 Testing Geo-Awareness System\n');
  console.log('='.repeat(50));
  
  const geoEngine = GeoAwarenessEngine.getInstance();
  
  console.log(`\n📊 Sample Data: ${sampleData.length} records`);
  console.log('Sample locations:', sampleData.map(d => d.DESCRIPTION).slice(0, 3).join(', '), '...\n');
  
  for (const query of testQueries) {
    console.log(`\n🔎 Query: "${query}"`);
    console.log('-'.repeat(40));
    
    try {
      const result = await geoEngine.processGeoQuery(query, sampleData, 'test-endpoint');
      
      console.log(`✅ Entities Found: ${result.matchedEntities.length}`);
      if (result.matchedEntities.length > 0) {
        result.matchedEntities.forEach(entity => {
          console.log(`   - ${entity.name} (${entity.type})`);
        });
      }
      
      console.log(`📍 Filter Method: ${result.filterStats.filterMethod}`);
      console.log(`📈 Results: ${result.filteredRecords.length}/${result.filterStats.totalRecords} records (${Math.round(result.filteredRecords.length / result.filterStats.totalRecords * 100)}%)`);
      console.log(`⏱️  Processing Time: ${result.filterStats.processingTimeMs}ms`);
      
      if (result.warnings && result.warnings.length > 0) {
        console.log(`⚠️  Warnings: ${result.warnings.join(', ')}`);
      }
      
      if (result.fallbackUsed) {
        console.log('🔄 Fallback filtering was used');
      }
      
      // Show matched records
      if (result.filteredRecords.length > 0 && result.filteredRecords.length < sampleData.length) {
        console.log('🎯 Matched Records:');
        result.filteredRecords.forEach(record => {
          console.log(`   - ${record.DESCRIPTION} (${record.value})`);
        });
      }
      
    } catch (error) {
      console.error(`❌ Error processing query:`, error);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Geo-Awareness System Test Complete');
}

/**
 * Test specific geographic features
 */
export async function testSpecificFeatures() {
  console.log('\n🧪 Testing Specific Geographic Features\n');
  
  const geoEngine = GeoAwarenessEngine.getInstance();
  
  // Test 1: Direct city matching
  console.log('📍 Test 1: Direct City Matching');
  const directResult = await geoEngine.processGeoQuery('Show me New York data', sampleData);
  console.log(`Direct match result: ${directResult.filteredRecords.length} records`);
  
  // Test 2: ZIP code matching  
  console.log('\n📮 Test 2: ZIP Code Matching');
  const zipResult = await geoEngine.processGeoQuery('Analyze ZIP code 10001', sampleData);
  console.log(`ZIP code match result: ${zipResult.filteredRecords.length} records`);
  
  // Test 3: Alias matching
  console.log('\n🏷️  Test 3: Alias Matching');
  const aliasResult = await geoEngine.processGeoQuery('Show me NYC performance', sampleData);
  console.log(`Alias match result: ${aliasResult.filteredRecords.length} records`);
  
  // Test 4: Regional matching
  console.log('\n🗺️  Test 4: Regional Matching');
  const regionalResult = await geoEngine.processGeoQuery('West Coast analysis', sampleData);
  console.log(`Regional match result: ${regionalResult.filteredRecords.length} records`);
  
  // Test 5: Multi-city comparison
  console.log('\n⚖️  Test 5: Multi-City Comparison');
  const comparisonResult = await geoEngine.processGeoQuery('Compare NYC vs LA vs Chicago', sampleData);
  console.log(`Comparison match result: ${comparisonResult.filteredRecords.length} records`);
  console.log(`Matched entities: ${comparisonResult.matchedEntities.map(e => e.name).join(', ')}`);
}

// Run tests if this file is executed directly
if (require.main === module) {
  (async () => {
    await testGeoAwarenessSystem();
    await testSpecificFeatures();
  })().catch(console.error);
}