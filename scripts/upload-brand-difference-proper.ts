#!/usr/bin/env ts-node

/**
 * Upload brand-difference.json to Vercel Blob Storage using the proper uploadEndpointData function
 * This matches how other endpoints were uploaded
 */

import { config } from 'dotenv';
import { promises as fs } from 'fs';
import { join } from 'path';
import { uploadEndpointData } from '../utils/blob-data-loader';

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') });

async function uploadBrandDifference() {
  console.log('Uploading brand-difference.json to Vercel Blob storage...');

  try {
    // Check if BLOB_READ_WRITE_TOKEN is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ BLOB_READ_WRITE_TOKEN is not configured in environment variables');
      console.log('Please add BLOB_READ_WRITE_TOKEN to your .env.local file');
      process.exit(1);
    }

    // Load the brand-difference.json file
    const filePath = join(process.cwd(), 'public/data/endpoints/brand-difference.json');
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      console.error('❌ brand-difference.json not found at:', filePath);
      console.log('Please ensure the file exists before uploading');
      process.exit(1);
    }

    // Get file stats
    const stats = await fs.stat(filePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`📊 File size: ${sizeMB}MB`);

    // Load and parse the data
    console.log('📖 Reading brand-difference.json...');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    // Validate data structure
    if (!data.results || !Array.isArray(data.results)) {
      console.error('❌ Invalid data structure - missing results array');
      process.exit(1);
    }
    
    console.log(`✅ Loaded ${data.results.length} records`);
    
    // Count available brands
    if (data.results.length > 0) {
      const firstRecord = data.results[0];
      const brandFields = Object.keys(firstRecord).filter(key => key.match(/value_MP300(29|30|31|32|33|34|35|36|37)A_B_P/));
      console.log(`🏷️  Available brand fields: ${brandFields.length}`);
    }

    // Upload using the proper uploadEndpointData function
    console.log('🚀 Uploading to Vercel Blob storage...');
    const success = await uploadEndpointData('brand-difference', data);
    
    if (success) {
      console.log('✅ Successfully uploaded brand-difference.json to blob storage');
      console.log('');
      console.log('📋 Next steps:');
      console.log('1. The blob URL will be automatically available for the system to use');
      console.log('2. Test the brand difference query: "Show me the market share difference between Skechers and New Balance"');
      console.log('3. The system should now detect all 9 brands instead of just 3');
    } else {
      console.log('❌ Failed to upload brand-difference.json');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error uploading brand-difference.json:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
    process.exit(1);
  }
}

// Run the upload
if (require.main === module) {
  uploadBrandDifference();
}