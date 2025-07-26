const fs = require('fs');

console.log('🔬 TESTING ANALYSIS ENGINE INTEGRATION');
console.log('=' * 60);

// Test the AnalysisEngine typescript compilation
console.log('📦 1. CHECKING TYPESCRIPT COMPILATION');

const analysisEngineFile = 'lib/analysis/AnalysisEngine.ts';
if (fs.existsSync(analysisEngineFile)) {
  const content = fs.readFileSync(analysisEngineFile, 'utf8');
  
  console.log('✅ AnalysisEngine.ts exists');
  console.log('- Uses CachedEndpointRouter:', content.includes('CachedEndpointRouter'));
  console.log('- Has executeAnalysis method:', content.includes('executeAnalysis'));
  console.log('- Uses VisualizationRenderer:', content.includes('VisualizationRenderer'));
  console.log('- Uses DataProcessor:', content.includes('DataProcessor'));
  
  // Check for potential syntax errors
  if (content.includes('async executeAnalysis(')) {
    console.log('✅ executeAnalysis method is async');
  } else {
    console.log('❌ executeAnalysis method not found or not async');
  }
} else {
  console.log('❌ AnalysisEngine.ts missing');
}

// Test the CachedEndpointRouter  
console.log('\n📡 2. TESTING CACHED ENDPOINT ROUTER');

const cachedRouterFile = 'lib/analysis/CachedEndpointRouter.ts';
if (fs.existsSync(cachedRouterFile)) {
  const content = fs.readFileSync(cachedRouterFile, 'utf8');
  
  console.log('✅ CachedEndpointRouter.ts exists');
  console.log('- Has callEndpoint method:', content.includes('callEndpoint'));
  console.log('- Uses caching:', content.includes('cache') || content.includes('Map'));
  console.log('- Has competitive-analysis endpoint:', content.includes('competitive-analysis'));
} else {
  console.log('❌ CachedEndpointRouter.ts missing');
}

// Test the cached data file existence and structure
console.log('\n💾 3. TESTING CACHED DATA AVAILABILITY');

const endpointDataPath = 'public/data/endpoints/competitive-analysis.json';
if (fs.existsSync(endpointDataPath)) {
  try {
    const data = JSON.parse(fs.readFileSync(endpointDataPath, 'utf8'));
    console.log('✅ Competitive analysis cache file exists');
    console.log(`- Records: ${data.results?.length || 0}`);
    console.log('- Success flag:', data.success);
    console.log('- Has feature_importance:', !!data.feature_importance);
    console.log('- Structure looks valid:', !!(data.results && Array.isArray(data.results)));
  } catch (e) {
    console.log('❌ Cache file exists but is invalid JSON:', e.message);
  }
} else {
  console.log('❌ Competitive analysis cache file missing');
}

// Test the boundary data
const boundaryDataPath = 'public/data/boundaries/zip_boundaries.json';
if (fs.existsSync(boundaryDataPath)) {
  try {
    const data = JSON.parse(fs.readFileSync(boundaryDataPath, 'utf8'));
    console.log('✅ Boundary data file exists');
    console.log(`- Features: ${data.features?.length || 0}`);
    console.log('- Has centroids:', data.features?.[0]?.properties?.centroid ? 'Yes' : 'No');
    console.log('- Structure looks valid:', !!(data.features && Array.isArray(data.features)));
  } catch (e) {
    console.log('❌ Boundary file exists but is invalid JSON:', e.message);
  }
} else {
  console.log('❌ Boundary data file missing');
}

// Test the processors and renderers
console.log('\n🧩 4. TESTING PROCESSORS AND RENDERERS');

const requiredFiles = [
  'lib/analysis/strategies/processors/CompetitiveDataProcessor.ts',
  'lib/analysis/strategies/renderers/CompetitiveRenderer.ts',
  'lib/analysis/VisualizationRenderer.ts',
  'lib/analysis/DataProcessor.ts'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Test the frontend integration
console.log('\n🖥️ 5. TESTING FRONTEND INTEGRATION');

const frontendFile = 'components/geospatial-chat-interface.tsx';
if (fs.existsSync(frontendFile)) {
  const content = fs.readFileSync(frontendFile, 'utf8');
  
  console.log('✅ Frontend component exists');
  console.log('- Has executeAnalysis call:', content.includes('executeAnalysis'));
  console.log('- Has applyAnalysisEngineVisualization:', content.includes('applyAnalysisEngineVisualization'));
  console.log('- Has onVisualizationLayerCreated:', content.includes('onVisualizationLayerCreated'));
  console.log('- Uses AnalysisEngine import:', content.includes('import') && content.includes('AnalysisEngine'));
} else {
  console.log('❌ Frontend component missing');
}

// Test the package.json and dependencies
console.log('\n📋 6. TESTING BUILD CONFIGURATION');

if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('✅ package.json exists');
  console.log('- Has build script:', !!pkg.scripts?.build);
  console.log('- Has dev script:', !!pkg.scripts?.dev);
  console.log('- TypeScript setup:', !!pkg.devDependencies?.typescript);
} else {
  console.log('❌ package.json missing');
}

// Final diagnosis
console.log('\n🎯 ANALYSIS ENGINE DIAGNOSTIC SUMMARY:');
console.log('If all components above show ✅, the issue is likely:');
console.log('1. Runtime error in the frontend during executeAnalysis call');
console.log('2. Async/await handling issue');  
console.log('3. Missing import or module resolution issue');
console.log('4. Error in the visualization pipeline after analysis completes');
console.log('');
console.log('Next step: Check browser console for JavaScript/TypeScript errors');
console.log('Look for: Import errors, async errors, or undefined module errors');
