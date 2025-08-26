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
      const data = await loadEndpointData(endpoint);
      
      if (data) {
        console.log(`   ✅ Loaded successfully`);
        console.log(`   📊 Records: ${data.results?.length || 'unknown'}`);
        console.log(`   🔍 Sample record ID: ${data.results?.[0]?.ID || 'N/A'}`);
        console.log(`   📝 Sample description: ${data.results?.[0]?.DESCRIPTION || 'N/A'}`);
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
    const response = await fetch('/data/blob-urls-energy.json');
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