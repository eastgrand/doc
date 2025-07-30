#!/usr/bin/env node

// Debug the actual execution by checking console logs
const fs = require('fs');
const path = require('path');

console.log('🔍 DEBUGGING ACTUAL EXECUTION FLOW');
console.log('==================================');

// Function to check if dev server is running
function checkServer() {
  const http = require('http');
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 404);
    }).on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function debugExecution() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Dev server not running on localhost:3000');
    console.log('💡 Please run: npm run dev');
    return;
  }
  
  console.log('✅ Dev server is running');
  console.log('');
  
  console.log('🎯 EXECUTION TRACING CHECKLIST:');
  console.log('1. Open http://localhost:3000');
  console.log('2. Open browser console (F12)');
  console.log('3. Enable clustering (click Clustering button, toggle enabled)');
  console.log('4. Enter: "Show me the top strategic markets for Nike expansion"');
  console.log('5. Check console for these logs in ORDER:');
  console.log('');
  
  console.log('📋 EXPECTED LOG SEQUENCE:');
  console.log('   ✓ [CLUSTER STATE DEBUG] enabled: true');
  console.log('   ✓ [EXECUTION TRACE] About to check clustering condition');
  console.log('   ✓ [CLUSTERING DEBUG] conditionResult: true');
  console.log('   ✓ [CLUSTERING] Applying clustering AFTER geometry join');
  console.log('   ✓ [ClusteringService] Successfully applied clustering');
  console.log('   ✓ [CLUSTER ANALYSIS] About to generate endpoint-specific cluster analysis');
  console.log('   ✓ [CLUSTER ANALYSIS METHOD] Starting cluster analysis generation');
  console.log('   ✓ [CLUSTER ANALYSIS METHOD] Successfully generated cluster analysis');
  console.log('   ✓ [ClusteringService] Enhanced summary with clustering');
  console.log('');
  
  console.log('🔍 DIAGNOSTIC QUESTIONS:');
  console.log('A. Do you see all the logs above? (Yes/No)');
  console.log('B. What does the final analysis text show? (Territories or ZIP codes?)');
  console.log('C. Does the visualization show colored territories? (Yes/No)');
  console.log('');
  
  console.log('🚨 CRITICAL CHECK POINTS:');
  console.log('If you see "[CLUSTER ANALYSIS METHOD] Successfully generated cluster analysis":');
  console.log('  - The cluster analysis IS being generated correctly');
  console.log('  - The issue is in how it\'s being used/displayed');
  console.log('  - Check what the "preview" shows in that log');
  console.log('');
  console.log('If you DON\'T see "[CLUSTER ANALYSIS] About to generate":');
  console.log('  - The clustering service is not calling the analysis generation');
  console.log('  - Issue is in the ClusteringService.enhanceAnalysisWithClusters method');
  console.log('');
  console.log('If you DON\'T see "[CLUSTERING] Applying clustering":');
  console.log('  - The clustering condition is failing');
  console.log('  - Check the [CLUSTERING DEBUG] conditionResult value');
  console.log('');
  
  console.log('⚡ Run the test and report EXACTLY which logs you see vs don\'t see!');
}

debugExecution();