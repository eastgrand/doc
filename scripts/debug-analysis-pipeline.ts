#!/usr/bin/env ts-node

// Debug the entire analysis pipeline to find where data is lost

import { loadEndpointData } from '../utils/blob-data-loader';
import { ConfigurationManager } from '../lib/analysis/ConfigurationManager';

async function debugAnalysisPipeline() {
  console.log('🔍 DEBUGGING ANALYSIS PIPELINE\n');

  // Step 1: Test blob URL mappings loading
  console.log('1️⃣  Testing blob URL mappings...');
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const energyFilePath = path.join(process.cwd(), 'public/data/blob-urls-energy.json');
    const mappings = JSON.parse(await fs.readFile(energyFilePath, 'utf-8'));
    
    console.log(`   ✅ Loaded ${Object.keys(mappings).length} blob URL mappings`);
    console.log(`   📋 Available endpoints: ${Object.keys(mappings).join(', ')}`);
    
    // Test key endpoints
    const testEndpoints = ['strategic-analysis', 'market-intelligence-report', 'analyze'];
    for (const endpoint of testEndpoints) {
      if (mappings[endpoint]) {
        console.log(`   ✅ ${endpoint}: ${mappings[endpoint].substring(0, 50)}...`);
      } else {
        console.log(`   ❌ ${endpoint}: MISSING`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Error loading blob mappings: ${error}`);
  }

  console.log('\n2️⃣  Testing endpoint data loading...');
  
  // Step 2: Test each endpoint data loading
  const testEndpoints = ['strategic-analysis', 'market-intelligence-report', 'analyze'];
  
  for (const endpoint of testEndpoints) {
    console.log(`\n   📋 Testing ${endpoint}:`);
    
    try {
      const data = await loadEndpointData(endpoint);
      
      if (data) {
        console.log(`      ✅ Data loaded successfully`);
        console.log(`      📊 Structure: ${JSON.stringify(Object.keys(data))}`);
        console.log(`      🔢 Results length: ${data.results?.length || 'N/A'}`);
        
        if (data.results?.length > 0) {
          const firstRecord = data.results[0];
          console.log(`      📝 First record keys: ${Object.keys(firstRecord).join(', ')}`);
          console.log(`      🆔 First record ID: ${firstRecord.ID || firstRecord.OBJECTID || 'N/A'}`);
          console.log(`      📍 First record DESC: ${firstRecord.DESCRIPTION?.substring(0, 30) || 'N/A'}...`);
        } else {
          console.log(`      ❌ No results array or empty results`);
        }
      } else {
        console.log(`      ❌ No data returned`);
      }
    } catch (error) {
      console.log(`      ❌ Error: ${error}`);
    }
  }

  // Step 3: Skip ConfigurationManager (private constructor)
  console.log('\n3️⃣  Skipping ConfigurationManager (private constructor)...');

  // Step 4: Test direct blob URL access
  console.log('\n4️⃣  Testing direct blob URL access...');
  
  const testUrls = [
    'https://tao6dvjnrqq6hwa0.public.blob.vercel-storage.com/energy/strategic-analysis-HvTt39WWGx6bsQYmUROFUhzYcylUic.json',
    'https://tao6dvjnrqq6hwa0.public.blob.vercel-storage.com/energy/analyze-1XBxgLYQ5zHh7v7nZYVluakRnPCq22.json'
  ];
  
  for (const url of testUrls) {
    const endpointName = url.split('/').pop()?.split('-')[0] || 'unknown';
    console.log(`\n   🌐 Testing ${endpointName} URL directly:`);
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log(`      ✅ Direct fetch successful`);
        console.log(`      📊 Records: ${data.results?.length || 'N/A'}`);
        console.log(`      🔍 Sample ID: ${data.results?.[0]?.ID || 'N/A'}`);
      } else {
        console.log(`      ❌ HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`      ❌ Fetch error: ${error}`);
    }
  }

  // Step 5: Check for common issues
  console.log('\n5️⃣  Checking for common issues...');
  
  // Check if customer-profile endpoint exists (since logs show it's being used instead)
  try {
    const data = await loadEndpointData('customer-profile');
    if (data && data.results?.length > 0) {
      console.log(`   🎯 customer-profile endpoint: ✅ ${data.results.length} records`);
      console.log(`   📝 This might be why you're seeing customer profile data instead of strategic analysis`);
    } else {
      console.log(`   ❌ customer-profile endpoint: No data`);
    }
  } catch (error) {
    console.log(`   ❌ customer-profile endpoint error: ${error}`);
  }

  console.log('\n🏁 DEBUGGING COMPLETE');
  console.log('\nIf all tests pass but you still see 0 areas:');
  console.log('1. The issue is in the frontend/browser');
  console.log('2. Clear browser cache completely');
  console.log('3. Check browser console for errors');
  console.log('4. Restart development server');
}

debugAnalysisPipeline().catch(console.error);