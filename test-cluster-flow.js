#!/usr/bin/env node

// Test clustering flow by simulating the request
const http = require('http');

console.log('🧪 Testing Clustering Flow');
console.log('==========================');

// Test server connectivity first
function testServer() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000', (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        console.log('✅ Server is accessible');
        resolve(true);
      } else {
        console.log(`❌ Server responded with status ${res.statusCode}`);
        reject(false);
      }
    });
    
    req.on('error', (err) => {
      console.log('❌ Server connection failed:', err.message);
      reject(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Server request timed out');
      req.destroy();
      reject(false);
    });
  });
}

async function runTest() {
  try {
    await testServer();
    
    console.log('');
    console.log('🎯 CLUSTERING FLOW DEBUG STEPS:');
    console.log('1. Open http://localhost:3000 in browser');
    console.log('2. Enable clustering (click "Clustering" button, toggle to enabled)');
    console.log('3. Enter query: "Show me the top strategic markets for Nike expansion"');
    console.log('4. Open browser console and look for these debug logs:');
    console.log('');
    console.log('📋 EXPECTED LOG SEQUENCE:');
    console.log('   🚨🚨🚨 [CLUSTER STATE DEBUG] enabled: true');
    console.log('   🚨🚨🚨 [CLUSTERING DEBUG] conditionResult: true');
    console.log('   🎯 [CLUSTERING] Applying clustering AFTER geometry join');
    console.log('   [ClusteringService] Successfully applied clustering');
    console.log('   🎯 [CLUSTER ANALYSIS] About to generate endpoint-specific cluster analysis');
    console.log('   🎯 [CLUSTER ANALYSIS METHOD] Starting cluster analysis generation');
    console.log('   🎯 [CLUSTER ANALYSIS METHOD] Successfully generated cluster analysis');
    console.log('');
    console.log('🔍 DEBUG ANALYSIS:');
    console.log('   - If you see all logs: Cluster analysis is working, check if it\'s displayed');
    console.log('   - If missing CLUSTER ANALYSIS logs: Clustering service not generating analysis');
    console.log('   - If missing ClusteringService logs: Algorithm is failing');
    console.log('   - If missing CLUSTERING DEBUG: Configuration issue');
    console.log('');
    console.log('⚡ Run the test and report which logs appear vs missing!');
    
  } catch (error) {
    console.log('❌ Server not accessible - make sure dev server is running');
    console.log('💡 Run: npm run dev');
  }
}

runTest();