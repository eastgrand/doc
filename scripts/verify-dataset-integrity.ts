#!/usr/bin/env ts-node

// Verify dataset integrity after blob upload
// Check that all records from local files are present in blob storage

import { promises as fs } from 'fs';
import { join } from 'path';

const ENDPOINTS_DIR = join(process.cwd(), 'public/data/endpoints');
const BLOB_MAPPING_FILE = join(process.cwd(), 'public/data/blob-urls.json');

interface EndpointData {
  success: boolean;
  total_records: number;
  results: unknown[];
}

interface VerificationResult {
  endpoint: string;
  localRecords: number;
  blobRecords: number;
  match: boolean;
  error?: string;
}

async function fetchBlobData(url: string): Promise<EndpointData | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch blob data:`, error);
    return null;
  }
}

async function verifyDatasetIntegrity(): Promise<void> {
  console.log('🔍 Verifying dataset integrity...\n');

  try {
    // Load blob URL mappings
    const blobMappings = JSON.parse(await fs.readFile(BLOB_MAPPING_FILE, 'utf-8'));
    
    // Get all endpoint files
    const files = await fs.readdir(ENDPOINTS_DIR);
    const jsonFiles = files.filter(file => 
      file.endsWith('.json') && 
      !file.includes('blob-urls') && 
      !file.includes('all_endpoints') &&
      !file.includes('comprehensive_generation_summary') &&
      !file.includes('customer-profile') &&
      !file.includes('market-intelligence-sample')
    );

    const results: VerificationResult[] = [];
    let totalLocalRecords = 0;
    let totalBlobRecords = 0;
    let matchCount = 0;
    let errorCount = 0;

    for (const file of jsonFiles) {
      const endpoint = file.replace('.json', '');
      const filePath = join(ENDPOINTS_DIR, file);
      
      console.log(`📋 Checking ${endpoint}...`);

      try {
        // Read local file
        const localData: EndpointData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        const localRecords = localData.results?.length || 0;

        // Check if blob URL exists
        const blobUrl = blobMappings[endpoint];
        if (!blobUrl) {
          results.push({
            endpoint,
            localRecords,
            blobRecords: 0,
            match: false,
            error: 'No blob URL found'
          });
          errorCount++;
          console.log(`   ❌ No blob URL found`);
          continue;
        }

        // Fetch blob data
        const blobData = await fetchBlobData(blobUrl);
        if (!blobData) {
          results.push({
            endpoint,
            localRecords,
            blobRecords: 0,
            match: false,
            error: 'Failed to fetch blob data'
          });
          errorCount++;
          console.log(`   ❌ Failed to fetch blob data`);
          continue;
        }

        const blobRecords = blobData.results?.length || 0;
        const match = localRecords === blobRecords;

        results.push({
          endpoint,
          localRecords,
          blobRecords,
          match,
          error: match ? undefined : `Record count mismatch: local=${localRecords}, blob=${blobRecords}`
        });

        totalLocalRecords += localRecords;
        totalBlobRecords += blobRecords;

        if (match) {
          matchCount++;
          console.log(`   ✅ ${localRecords} records (match)`);
        } else {
          errorCount++;
          console.log(`   ❌ Local: ${localRecords}, Blob: ${blobRecords} (MISMATCH)`);
        }

      } catch (error) {
        results.push({
          endpoint,
          localRecords: 0,
          blobRecords: 0,
          match: false,
          error: `Processing error: ${error}`
        });
        errorCount++;
        console.log(`   ❌ Error: ${error}`);
      }
    }

    // Summary
    console.log('\n📊 VERIFICATION SUMMARY:');
    console.log(`Files checked: ${results.length}`);
    console.log(`Matches: ${matchCount}`);
    console.log(`Mismatches: ${errorCount}`);
    console.log(`Total local records: ${totalLocalRecords.toLocaleString()}`);
    console.log(`Total blob records: ${totalBlobRecords.toLocaleString()}`);
    console.log(`Overall match: ${totalLocalRecords === totalBlobRecords ? '✅ YES' : '❌ NO'}`);

    // Show detailed results for mismatches
    const mismatches = results.filter(r => !r.match);
    if (mismatches.length > 0) {
      console.log('\n⚠️  DETAILED MISMATCH REPORT:');
      mismatches.forEach(result => {
        console.log(`${result.endpoint}:`);
        console.log(`   Local: ${result.localRecords} records`);
        console.log(`   Blob: ${result.blobRecords} records`);
        console.log(`   Error: ${result.error}`);
      });
    }

    // Exit with error code if there are mismatches
    if (errorCount > 0) {
      console.log('\n❌ Dataset integrity verification FAILED');
      process.exit(1);
    } else {
      console.log('\n✅ Dataset integrity verification PASSED');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyDatasetIntegrity();
}

export { verifyDatasetIntegrity };