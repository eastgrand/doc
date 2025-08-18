#!/usr/bin/env node
/**
 * Upload Endpoints to Blob Storage
 * Uses the correct @vercel/blob package instead of direct REST API calls
 */

const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

// Check for required environment variable
if (!process.env.HRB_READ_WRITE_TOKEN) {
  console.error('❌ HRB_READ_WRITE_TOKEN environment variable is required');
  process.exit(1);
}

async function uploadEndpointToBlob(endpointName, data) {
  try {
    console.log(`📤 Uploading ${endpointName}...`);
    
    const filename = `hrb/${endpointName}.json`;
    const jsonData = JSON.stringify(data, null, 2);
    
    const blob = await put(filename, jsonData, {
      access: 'public',
      addRandomSuffix: true,
      token: process.env.HRB_READ_WRITE_TOKEN,
    });
    
    console.log(`✅ Uploaded ${endpointName}: ${blob.url}`);
    return blob.url;
  } catch (error) {
    console.error(`❌ Failed to upload ${endpointName}:`, error.message);
    return null;
  }
}

async function uploadBoundaryFile(boundaryName, data) {
  try {
    console.log(`🗺️  Uploading boundary file ${boundaryName}...`);
    
    const filename = `hrb/boundaries/${boundaryName}.json`;
    const jsonData = JSON.stringify(data, null, 2);
    
    const blob = await put(filename, jsonData, {
      access: 'public',
      addRandomSuffix: true,
      token: process.env.HRB_READ_WRITE_TOKEN,
    });
    
    console.log(`✅ Uploaded boundary ${boundaryName}: ${blob.url}`);
    return blob.url;
  } catch (error) {
    console.error(`❌ Failed to upload boundary ${boundaryName}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting blob upload with @vercel/blob package...\n');
  
  const endpointsDir = path.join(__dirname, '../public/data/endpoints');
  const boundariesDir = path.join(__dirname, '../public/data/boundaries');
  const blobUrlsFile = path.join(__dirname, '../public/data/blob-urls-hrb.json');
  
  const blobUrls = {};
  let successCount = 0;
  let failCount = 0;
  
  // Upload endpoint files
  console.log('📊 Uploading endpoint files...');
  const endpointFiles = fs.readdirSync(endpointsDir).filter(f => f.endsWith('.json'));
  
  for (const file of endpointFiles) {
    const endpointName = path.basename(file, '.json');
    const filePath = path.join(endpointsDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const blobUrl = await uploadEndpointToBlob(endpointName, data);
    if (blobUrl) {
      blobUrls[endpointName] = blobUrl;
      successCount++;
    } else {
      failCount++;
    }
  }
  
  // Upload boundary files if they exist
  if (fs.existsSync(boundariesDir)) {
    console.log('\n🗺️  Uploading boundary files...');
    const boundaryFiles = fs.readdirSync(boundariesDir).filter(f => f.endsWith('.json'));
    
    for (const file of boundaryFiles) {
      const boundaryName = path.basename(file, '.json');
      const filePath = path.join(boundariesDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const blobUrl = await uploadBoundaryFile(boundaryName, data);
      if (blobUrl) {
        blobUrls[`boundaries/${boundaryName}`] = blobUrl;
        successCount++;
      } else {
        failCount++;
      }
    }
  }
  
  // Save blob URLs
  console.log('\n💾 Saving blob URL mappings...');
  fs.writeFileSync(blobUrlsFile, JSON.stringify(blobUrls, null, 2));
  
  // Summary
  console.log('\n📊 UPLOAD SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successfully uploaded: ${successCount}`);
  console.log(`❌ Failed uploads: ${failCount}`);
  console.log(`📁 Blob URLs saved to: ${blobUrlsFile}`);
  
  if (successCount > 0) {
    console.log('\n🎉 Upload completed successfully!');
    console.log('🔗 Endpoints are now accessible via blob storage URLs');
  }
}

// Run the upload
main().catch(error => {
  console.error('💥 Upload failed:', error);
  process.exit(1);
});