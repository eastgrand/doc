#!/usr/bin/env node

/**
 * Upload the new brand-difference.json to Vercel Blob Storage
 */

const fs = require('fs').promises;
const path = require('path');

async function uploadToBlobStorage() {
  try {
    // Read the brand-difference.json file
    const filePath = path.join(process.cwd(), 'public/data/endpoints/brand-difference.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    console.log('Read brand-difference.json, size:', (fileContent.length / 1024 / 1024).toFixed(2), 'MB');
    
    // First, get the upload URL from our API
    const uploadUrlResponse = await fetch('http://localhost:3000/api/blob/upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: 'endpoints/brand-difference.json',
        contentType: 'application/json',
      }),
    });
    
    if (!uploadUrlResponse.ok) {
      const error = await uploadUrlResponse.text();
      throw new Error(`Failed to get upload URL: ${error}`);
    }
    
    const { url, uploadUrl, pathname } = await uploadUrlResponse.json();
    console.log('Got blob URL:', url);
    console.log('Pathname:', pathname);
    
    // Now upload the actual content to the blob URL
    const uploadResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-blob-overwrite': 'true',
      },
      body: fileContent,
    });
    
    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      throw new Error(`Failed to upload to blob: ${error}`);
    }
    
    console.log('✅ Successfully uploaded brand-difference.json to blob storage');
    console.log('📋 New blob URL:', url);
    console.log('\n⚠️  IMPORTANT: Update public/data/blob-urls.json with this URL:');
    console.log(`"brand-difference": "${url}"`);
    
    // Write the URL to a file for easy copying
    await fs.writeFile('brand-difference-blob-url.txt', url);
    console.log('\n💾 URL saved to brand-difference-blob-url.txt');
    
  } catch (error) {
    console.error('❌ Error uploading to blob storage:', error);
    process.exit(1);
  }
}

// Run the upload
uploadToBlobStorage();