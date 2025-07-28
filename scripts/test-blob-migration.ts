#!/usr/bin/env ts-node

// Test script to upload one small endpoint file to Vercel Blob storage

import { config } from 'dotenv';
import { promises as fs } from 'fs';
import { join } from 'path';
import { uploadEndpointData } from '../utils/blob-data-loader';

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') });

async function testMigration() {
  console.log('Testing blob migration with strategic-analysis.json (9.7MB)...');
  
  const filePath = join(process.cwd(), 'public/data/endpoints/strategic-analysis.json');
  
  try {
    console.log('Reading file...');
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    console.log(`File loaded, attempting upload...`);
    
    const success = await uploadEndpointData('strategic-analysis', data);
    
    if (success) {
      console.log('✅ Test migration successful!');
    } else {
      console.log('❌ Test migration failed');
    }
  } catch (error) {
    console.error('❌ Test migration error:', error);
  }
}

if (require.main === module) {
  testMigration();
}