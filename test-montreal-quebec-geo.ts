// Test Montreal and Quebec City Geographic Filtering
// This test verifies that the geo-awareness system properly filters FSAs for Canadian cities

import { GeoAwarenessEngine } from './lib/geo/GeoAwarenessEngine';

// Mock Quebec dataset with realistic FSA data
const MOCK_QUEBEC_DATASET = [
  // Montreal FSAs (H-series)
  { ID: 'H1A', area_name: 'H1A', DESCRIPTION: 'Montréal (Centre-Sud)', value_homeownership: 45.2 },
  { ID: 'H2K', area_name: 'H2K', DESCRIPTION: 'Montréal (Plateau-Mont-Royal)', value_homeownership: 35.8 },
  { ID: 'H3G', area_name: 'H3G', DESCRIPTION: 'Montréal (Westmount)', value_homeownership: 65.1 },
  { ID: 'H4B', area_name: 'H4B', DESCRIPTION: 'Montréal (Verdun)', value_homeownership: 52.3 },
  
  // Quebec City FSAs (G1/G2-series)
  { ID: 'G1A', area_name: 'G1A', DESCRIPTION: 'Québec (Vieux-Québec)', value_homeownership: 42.7 },
  { ID: 'G1K', area_name: 'G1K', DESCRIPTION: 'Québec (Saint-Jean-Baptiste)', value_homeownership: 38.9 },
  { ID: 'G2B', area_name: 'G2B', DESCRIPTION: 'Québec (Neufchâtel-Est)', value_homeownership: 67.8 },
  { ID: 'G2G', area_name: 'G2G', DESCRIPTION: 'Québec (Sainte-Foy)', value_homeownership: 58.4 },
  
  // Laval FSAs (H7-series) - should NOT be included in Montreal/Quebec City comparison
  { ID: 'H7A', area_name: 'H7A', DESCRIPTION: 'Laval (Pont-Viau)', value_homeownership: 78.2 },
  { ID: 'H7H', area_name: 'H7H', DESCRIPTION: 'Laval (Sainte-Rose)', value_homeownership: 82.1 },
  
  // Gatineau FSAs (J8/J9-series) - should NOT be included  
  { ID: 'J8T', area_name: 'J8T', DESCRIPTION: 'Gatineau (Hull)', value_homeownership: 63.5 },
  { ID: 'J9A', area_name: 'J9A', DESCRIPTION: 'Gatineau (Aylmer)', value_homeownership: 74.9 }
];

async function testMontrealQuebecFiltering() {
  console.log('🧪 Testing Montreal and Quebec City Geographic Filtering\n');
  
  const geoEngine = GeoAwarenessEngine.getInstance();
  
  // Test 1: Montreal filtering
  console.log('📍 Test 1: Montreal filtering');
  const montrealQuery = "show me high income areas in Montreal";
  const montrealResult = await geoEngine.processGeoQuery(montrealQuery, MOCK_QUEBEC_DATASET, '/comparative-analysis');
  
  console.log(`Query: "${montrealQuery}"`);
  console.log(`Entities detected:`, montrealResult.matchedEntities.map(e => ({ name: e.name, type: e.type })));
  console.log(`Records filtered: ${MOCK_QUEBEC_DATASET.length} -> ${montrealResult.filteredRecords.length}`);
  console.log(`Filter method: ${montrealResult.filterStats.filterMethod}`);
  
  const montrealFSAs = montrealResult.filteredRecords.map(r => r.ID);
  console.log(`Montreal FSAs found:`, montrealFSAs);
  console.log(`Expected H-series FSAs, got:`, montrealFSAs.filter(fsa => fsa.startsWith('H')));
  
  // Test 2: Quebec City filtering  
  console.log('\n📍 Test 2: Quebec City filtering');
  const quebecQuery = "show me homeownership rates in Quebec City";
  const quebecResult = await geoEngine.processGeoQuery(quebecQuery, MOCK_QUEBEC_DATASET, '/comparative-analysis');
  
  console.log(`Query: "${quebecQuery}"`);
  console.log(`Entities detected:`, quebecResult.matchedEntities.map(e => ({ name: e.name, type: e.type })));
  console.log(`Records filtered: ${MOCK_QUEBEC_DATASET.length} -> ${quebecResult.filteredRecords.length}`);
  console.log(`Filter method: ${quebecResult.filterStats.filterMethod}`);
  
  const quebecFSAs = quebecResult.filteredRecords.map(r => r.ID);
  console.log(`Quebec City FSAs found:`, quebecFSAs);
  console.log(`Expected G-series FSAs, got:`, quebecFSAs.filter(fsa => fsa.startsWith('G')));
  
  // Test 3: Comparative query
  console.log('\n📍 Test 3: Comparative Montreal vs Quebec City');
  const comparativeQuery = "Compare homeownership rates between Montreal and Quebec City";
  const comparativeResult = await geoEngine.processGeoQuery(comparativeQuery, MOCK_QUEBEC_DATASET, '/comparative-analysis');
  
  console.log(`Query: "${comparativeQuery}"`);
  console.log(`Entities detected:`, comparativeResult.matchedEntities.map(e => ({ name: e.name, type: e.type })));
  console.log(`Records filtered: ${MOCK_QUEBEC_DATASET.length} -> ${comparativeResult.filteredRecords.length}`);
  console.log(`Filter method: ${comparativeResult.filterStats.filterMethod}`);
  
  const comparativeFSAs = comparativeResult.filteredRecords.map(r => r.ID);
  console.log(`Combined FSAs found:`, comparativeFSAs);
  console.log(`Montreal (H-series):`, comparativeFSAs.filter(fsa => fsa.startsWith('H') && !fsa.startsWith('H7')));
  console.log(`Quebec City (G-series):`, comparativeFSAs.filter(fsa => fsa.startsWith('G')));
  
  // Validation
  console.log('\n✅ Validation Results:');
  
  const montrealSuccess = montrealFSAs.length > 0 && montrealFSAs.every(fsa => fsa.startsWith('H') && !fsa.startsWith('H7'));
  const quebecSuccess = quebecFSAs.length > 0 && quebecFSAs.every(fsa => fsa.startsWith('G'));
  const comparativeSuccess = comparativeFSAs.length > 0 && 
    comparativeFSAs.some(fsa => fsa.startsWith('H') && !fsa.startsWith('H7')) &&
    comparativeFSAs.some(fsa => fsa.startsWith('G'));
  
  console.log(`Montreal filtering: ${montrealSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Quebec City filtering: ${quebecSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Comparative filtering: ${comparativeSuccess ? '✅ PASS' : '❌ FAIL'}`);
  
  if (montrealSuccess && quebecSuccess && comparativeSuccess) {
    console.log('\n🎉 All tests passed! Geographic filtering is working correctly.');
  } else {
    console.log('\n❌ Some tests failed. Geographic filtering needs debugging.');
  }
}

// Run the test
testMontrealQuebecFiltering().catch(console.error);