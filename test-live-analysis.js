/**
 * Live Analysis Test Guide
 * Step-by-step testing instructions for validating the full pipeline
 */

console.log('🧪 LIVE ANALYSIS TESTING GUIDE');
console.log('============================\n');

const testQueries = [
  {
    category: 'Strategic Analysis',
    query: 'Show me the top strategic markets for Nike expansion in the Northeast region',
    expectedEndpoint: '/analyze',
    expectedScore: 'strategic_value_score',
    validationChecks: [
      'Top markets should have high strategic scores (70+)',
      'Should include major metro areas like NYC, Boston',
      'Markets should have good population + income combination',
      'Visualization should show clear ranking by strategic score'
    ]
  },
  {
    category: 'Competitive Analysis', 
    query: 'Where does Nike have the biggest competitive advantages against Adidas in California?',
    expectedEndpoint: '/competitive-analysis',
    expectedScore: 'competitive_advantage_score',
    validationChecks: [
      'Top markets should have high competitive scores (7+)',
      'Should focus on California markets only',
      'Markets with higher Nike share should rank higher',
      'Should explain competitive advantages in analysis'
    ]
  },
  {
    category: 'Market Sizing',
    query: 'Which markets have the largest market opportunities for major Nike investment',
    expectedEndpoint: '/market-sizing', 
    expectedScore: 'market_sizing_score',
    validationChecks: [
      'Top markets should have large populations (50k+)',
      'Should include major metropolitan areas',
      'High-income areas should rank highly',
      'Score should correlate with population * income'
    ]
  },
  {
    category: 'Brand Analysis',
    query: 'Where is Nike\'s brand strongest and where does it need development?',
    expectedEndpoint: '/brand-analysis',
    expectedScore: 'brand_analysis_score', 
    validationChecks: [
      'Top markets should have high Nike market share (20%+)',
      'Should identify both strong and weak brand markets',
      'Strong brand markets should have high brand scores (60+)',
      'Analysis should mention specific Nike share percentages'
    ]
  },
  {
    category: 'Demographics',
    query: 'Which markets have the best demographic fit for Nike\'s target customer profile?',
    expectedEndpoint: '/demographic-insights',
    expectedScore: 'demographic_opportunity_score',
    validationChecks: [
      'Top markets should have high demographic scores (80+)',
      'Should include affluent, younger demographics',
      'Should correlate with higher income levels',
      'Analysis should explain demographic characteristics'
    ]
  },
  {
    category: 'Real Estate',
    query: 'Which locations are best for new Nike flagship stores?',
    expectedEndpoint: '/real-estate-analysis', 
    expectedScore: 'real_estate_analysis_score',
    validationChecks: [
      'Top locations should have high foot traffic potential',
      'Should favor urban/suburban areas with good access',
      'Should consider both demographics and location quality',
      'High-income, high-population areas should rank well'
    ]
  }
];

console.log('📋 TESTING CHECKLIST');
console.log('For each query below:\n');

testQueries.forEach((test, index) => {
  console.log(`${index + 1}. ${test.category.toUpperCase()}`);
  console.log(`   Query: "${test.query}"`);
  console.log(`   Expected Endpoint: ${test.expectedEndpoint}`);
  console.log(`   Expected Score Field: ${test.expectedScore}`);
  console.log('   Validation Checks:');
  test.validationChecks.forEach(check => {
    console.log(`   □ ${check}`);
  });
  console.log();
});

console.log('🔍 STEP-BY-STEP TESTING PROCESS');
console.log('================================');
console.log('1. Open the application in your browser');
console.log('2. Open browser Developer Tools (F12) → Network tab');
console.log('3. Type each query above into the chat');
console.log('4. For each query, verify:');
console.log('   a) Correct API endpoint is called (check Network tab)');
console.log('   b) Response contains expected score field');  
console.log('   c) Top results make business sense');
console.log('   d) Visualization renders properly');
console.log('   e) Claude analysis mentions relevant factors');
console.log('5. Check console for any processor errors');
console.log('6. Verify map/chart shows data correctly\n');

console.log('⚠️  COMMON ISSUES TO WATCH FOR');
console.log('===============================');
console.log('• Wrong endpoint triggered (check Network tab URL)');
console.log('• Default processor used instead of dedicated processor');
console.log('• Scores all zero or missing from results');
console.log('• Top markets don\'t make business sense');
console.log('• Visualization shows wrong data or fails to render'); 
console.log('• Claude analysis is generic instead of analysis-specific');
console.log('• Error messages in browser console\n');

console.log('✅ SUCCESS CRITERIA');
console.log('===================');
console.log('• All queries trigger correct endpoints');
console.log('• All dedicated processors work without errors');
console.log('• Top results are logical for each analysis type');
console.log('• Visualizations render with correct data');
console.log('• Claude provides analysis-specific insights');
console.log('• No console errors or warnings\n');

console.log('📊 QUICK DATA VALIDATION');
console.log('Run this first: node test-analysis-accuracy.js');
console.log('This will show you what the top markets should be for each analysis type.\n');

console.log('🚀 START TESTING!');
console.log('Begin with Strategic Analysis query and work through the list.');
console.log('Document any issues you find for debugging.');