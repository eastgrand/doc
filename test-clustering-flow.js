#!/usr/bin/env node

const http = require('http');
const fs = require('fs');

// Test the clustering flow by monitoring console output from the dev server
console.log('🧪 Testing clustering flow...');
console.log('📊 This will simulate the user query: "Show me the top strategic markets for Nike expansion"');
console.log('🔧 With clustering enabled');
console.log('');

// Function to make HTTP request to test if server is responding
function testServer() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Server is responding on port 3000');
        resolve(true);
      } else {
        console.log(`❌ Server responded with status ${res.statusCode}`);
        reject(false);
      }
    });
    
    req.on('error', (err) => {
      console.log('❌ Server is not accessible:', err.message);
      reject(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Server request timed out');
      req.destroy();
      reject(false);
    });
  });
}

// Instructions for manual testing
async function runTest() {
  try {
    await testServer();
    
    console.log('');
    console.log('🎯 MANUAL TESTING INSTRUCTIONS:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Enable clustering in the UI (set enabled: true, clusters: 5)');
    console.log('3. Enter query: "Show me the top strategic markets for Nike expansion"');
    console.log('4. Watch browser console for these debug logs:');
    console.log('   - 🚨🚨🚨 [CLUSTER STATE DEBUG] Cluster config state:');
    console.log('   - 🚨🚨🚨 [CLUSTERING DEBUG] Checking clustering condition:');
    console.log('   - 🎯 [CLUSTERING] Applying clustering AFTER geometry join');
    console.log('   - [ClusteringService] logs from the service');
    console.log('');
    console.log('🔍 Expected outcome:');
    console.log('   - Map should show colored territories (not individual ZIP codes)');
    console.log('   - Legend should show cluster names');
    console.log('   - Analysis text should mention "territories" and clustering');
    console.log('');
    console.log('❌ If clustering is NOT working, you should see:');
    console.log('   - [CLUSTER STATE DEBUG] enabled: false');
    console.log('   - [CLUSTERING DEBUG] conditionResult: false');
    console.log('   - Individual ZIP codes colored by strategic value (not territories)');
    console.log('');
    console.log('⚡ The dev server is running. Test it now!');
    
  } catch (error) {
    console.log('❌ Cannot test - dev server is not running');
    console.log('💡 Run: npm run dev');
  }
}

runTest();