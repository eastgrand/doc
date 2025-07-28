#!/usr/bin/env ts-node

// Migration script to upload large endpoint files to Vercel Blob storage
// Run this once to migrate existing files: npx ts-node scripts/migrate-to-blob.ts

import { promises as fs } from 'fs';
import { join } from 'path';
import { uploadEndpointData } from '../utils/blob-data-loader';

const ENDPOINTS_DIR = join(process.cwd(), 'public/data/endpoints');

async function migrateEndpointFiles() {
  console.log('Starting migration of endpoint files to Vercel Blob storage...');

  try {
    // Check if endpoints directory exists
    try {
      await fs.access(ENDPOINTS_DIR);
    } catch (error) {
      console.log('⚠️  Endpoints directory not found - skipping migration (expected in production)');
      return;
    }

    const files = await fs.readdir(ENDPOINTS_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    if (jsonFiles.length === 0) {
      console.log('ℹ️  No endpoint files found to migrate');
      return;
    }

    console.log(`Found ${jsonFiles.length} endpoint files to migrate`);

    for (const file of jsonFiles) {
      const filePath = join(ENDPOINTS_DIR, file);
      const endpoint = file.replace('.json', '');
      
      try {
        console.log(`Migrating ${endpoint}...`);
        
        const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        const success = await uploadEndpointData(endpoint, data);
        
        if (success) {
          console.log(`✅ Successfully migrated ${endpoint}`);
        } else {
          console.log(`❌ Failed to migrate ${endpoint}`);
        }
      } catch (error) {
        console.error(`❌ Error migrating ${endpoint}:`, error);
      }
    }

    console.log('\nMigration complete!');
    console.log('Large files are now stored in Vercel Blob and can be removed from git.');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

if (require.main === module) {
  migrateEndpointFiles();
}