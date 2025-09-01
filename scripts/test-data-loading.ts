#!/usr/bin/env ts-node

// Test script to debug data loading issues

import { loadEndpointData } from '../utils/blob-data-loader';

async function testDataLoading() {
  console.log('🧪 Testing data loading for Red Bull strategic analysis...\n');

  // Test strategic analysis endpoint
  const endpoints = ['strategic-analysis', 'market-intelligence-report'];
  
  for (const endpoint of endpoints) {
    console.log(`📋 Testing endpoint: ${endpoint}`);
    
    try {
    const data = (await loadEndpointData(endpoint)) as { results?: Array<Record<string, unknown>> } | null;
      
      if (data) {
        console.log(`   ✅ Loaded successfully`);
          const count = Array.isArray(data.results) ? data.results.length : 'unknown';
          const first = Array.isArray(data.results) && data.results.length > 0 ? data.results[0] : undefined;
          console.log(`   📊 Records: ${count}`);
          console.log(`   🔍 Sample record ID: ${first?.ID || 'N/A'}`);
          console.log(`   📝 Sample description: ${first?.DESCRIPTION || 'N/A'}`);
      } else {
        console.log(`   ❌ No data returned`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
    }
    
    console.log('');
  }

  // Test blob URL mappings loading
  console.log('📋 Testing blob URL mappings...');
  
  try {
    const response = await fetch('/data/blob-urls.json');
    if (response.ok) {
      const mappings = await response.json();
      console.log(`   ✅ Blob mappings loaded`);
      console.log(`   📊 Available endpoints: ${Object.keys(mappings).length}`);
      console.log(`   🔍 Strategic analysis URL: ${mappings['strategic-analysis'] ? '✅ EXISTS' : '❌ MISSING'}`);
      console.log(`   🔍 Market intelligence URL: ${mappings['market-intelligence-report'] ? '✅ EXISTS' : '❌ MISSING'}`);
    } else {
      console.log(`   ❌ Failed to load blob mappings: HTTP ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error loading blob mappings: ${error}`);
  }
}

testDataLoading().catch(console.error);