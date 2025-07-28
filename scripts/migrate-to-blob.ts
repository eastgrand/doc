#!/usr/bin/env ts-node

// Migration script to upload large endpoint files to Vercel Blob storage
// Run this once to migrate existing files: npx ts-node scripts/migrate-to-blob.ts

import { config } from 'dotenv';
import { promises as fs } from 'fs';
import { join } from 'path';
import { uploadEndpointData } from '../utils/blob-data-loader';

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') });

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
    
    // Process smaller files first, then larger ones
    const filesSorted = await Promise.all(
      jsonFiles.map(async (file) => {
        const stats = await fs.stat(join(ENDPOINTS_DIR, file));
        return { file, size: stats.size };
      })
    );
    filesSorted.sort((a, b) => a.size - b.size);

    for (const { file } of filesSorted) {
      const filePath = join(ENDPOINTS_DIR, file);
      const endpoint = file.replace('.json', '');
      
      try {
        const stats = await fs.stat(filePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
        console.log(`Migrating ${endpoint} (${sizeMB}MB)...`);
        
        const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        const success = await uploadEndpointData(endpoint, data);
        
        if (success) {
          console.log(`✅ Successfully migrated ${endpoint} (${sizeMB}MB)`);
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