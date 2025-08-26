#!/usr/bin/env ts-node

/**
 * Fix ZIP codes in local endpoint JSON files
 * 
 * This script extracts 5-digit ZIP codes from DESCRIPTION fields and uses them 
 * to overwrite the ID field values in local endpoint JSON files.
 * 
 * The current fix endpoint script was flawed because it was using OBJECTID values
 * for the ID field instead of extracting ZIP codes from DESCRIPTION fields.
 * 
 * This script ONLY modifies local files - it does NOT upload to blob storage.
 * Run this script first to fix local data, then run the existing blob upload script.
 */

import { promises as fs } from 'fs';
import { join } from 'path';

const ENDPOINTS_DIR = join(process.cwd(), 'public/data/endpoints');

interface EndpointRecord {
  OBJECTID: number;
  DESCRIPTION: string;
  ID: string;
  ZIP?: string | number;  // ZIP field might exist
  _originalId?: string;   // Original ID for reference
  _zipExtractionFailed?: boolean;  // Flag for failed extractions
  [key: string]: any;
}

interface EndpointData {
  success: boolean;
  total_records: number;
  results: EndpointRecord[];
}

interface ProcessResult {
  success: boolean;
  endpoint: string;
  stats?: any;
  error?: string;
}

/**
 * Extract 5-digit ZIP code from DESCRIPTION field
 * Matches patterns like "00065 (Plumas National Park)" or "92084 (Vista)" 
 */
function extractZipFromDescription(description: string): string | null {
  const match = description.match(/^(\d{5})\s*\(/);
  return match ? match[1] : null;
}

/**
 * Fix ZIP codes in endpoint data by replacing ID field with extracted ZIP codes
 */
function fixZipCodesInData(data: EndpointData): { fixed: EndpointData; stats: any } {
  let fixedCount = 0;
  let errorCount = 0;
  const errors: string[] = [];
  const originalIds: string[] = [];
  const newIds: string[] = [];

  console.log(`  🔍 Processing ${data.results.length} records...`);

  const fixedResults = data.results.map((record, index) => {
    const originalId = String(record.ID || record.OBJECTID || `unknown_${index}`);
    const zipFromDescription = extractZipFromDescription(record.DESCRIPTION || '');
    
    if (zipFromDescription) {
      fixedCount++;
      originalIds.push(originalId);
      newIds.push(zipFromDescription);
      
      // Log first few transformations for verification
      if (index < 5) {
        console.log(`    Record ${index}: "${record.DESCRIPTION}" -> ID: "${originalId}" → "${zipFromDescription}"`);
      }
      
      return {
        ...record,
        ID: zipFromDescription,  // Replace ID field with extracted ZIP code
        ZIP: zipFromDescription, // Also update ZIP field for consistency
        // Keep OBJECTID as is - it's the original record identifier
        _originalId: originalId  // Store original ID for reference/debugging
      };
    } else {
      errorCount++;
      const errorMsg = `Record ${index} (ID: ${originalId}): Could not extract ZIP from "${record.DESCRIPTION}"`;
      errors.push(errorMsg);
      
      console.warn(`    ⚠️  ${errorMsg}`);
      
      // CRITICAL: Always return the record, even if we can't extract ZIP
      // This ensures we never lose records
      return {
        ...record,
        _originalId: originalId,  // Store original ID for reference
        _zipExtractionFailed: true
      };
    }
  });

  // Verify we didn't lose any records
  if (fixedResults.length !== data.results.length) {
    throw new Error(`CRITICAL: Lost records during processing! Original: ${data.results.length}, Fixed: ${fixedResults.length}`);
  }

  // Check for duplicate ZIP codes that might cause issues
  const zipCounts = new Map<string, number>();
  fixedResults.forEach(record => {
    if (record.ID && !record._zipExtractionFailed) {
      zipCounts.set(record.ID, (zipCounts.get(record.ID) || 0) + 1);
    }
  });
  
  const duplicateZips = Array.from(zipCounts.entries()).filter(([zip, count]) => count > 1);
  
  return {
    fixed: {
      ...data,
      results: fixedResults
    },
    stats: {
      totalRecords: data.results.length,
      fixedCount,
      errorCount,
      duplicateZips: duplicateZips.length,
      duplicateZipList: duplicateZips.map(([zip, count]) => `${zip} (${count} times)`),
      errors: errors.slice(0, 10), // Show first 10 errors
      successRate: ((fixedCount / data.results.length) * 100).toFixed(1),
      sampleTransformations: originalIds.slice(0, 5).map((orig, i) => `${orig} → ${newIds[i]}`)
    }
  };
}

/**
 * Process a single endpoint file
 */
async function fixSingleEndpointFile(filePath: string, endpoint: string): Promise<ProcessResult> {
  console.log(`\n📝 Processing ${endpoint}...`);
  
  try {
    // Read the original file
    const rawData = await fs.readFile(filePath, 'utf-8');
    const originalData: EndpointData = JSON.parse(rawData);
    
    console.log(`  📊 Original data: ${originalData.results.length} records`);
    
    // Fix ZIP codes in the data
    const { fixed, stats } = fixZipCodesInData(originalData);
    
    // CRITICAL CHECK: Verify record count hasn't changed
    if (fixed.results.length !== originalData.results.length) {
      console.error(`❌ CRITICAL ERROR: Record count mismatch for ${endpoint}!`);
      console.error(`   Original: ${originalData.results.length} records`);
      console.error(`   Fixed: ${fixed.results.length} records`);
      console.error(`   Lost ${originalData.results.length - fixed.results.length} records!`);
      throw new Error(`Record count mismatch - aborting ${endpoint}`);
    }
    
    // Show stats
    console.log(`  📈 Stats: ${stats.fixedCount}/${stats.totalRecords} records fixed (${stats.successRate}%)`);
    console.log(`  ✅ Record count verified: ${fixed.results.length} records (no records lost)`);
    
    if (stats.errorCount > 0) {
      console.log(`  ⚠️  ${stats.errorCount} records with extraction errors`);
    }
    
    if (stats.duplicateZips > 0) {
      console.log(`  🔄 ${stats.duplicateZips} duplicate ZIP codes found:`, stats.duplicateZipList.slice(0, 3));
    }
    
    // Create a backup of the original file
    const backupPath = filePath.replace('.json', '.backup.json');
    await fs.writeFile(backupPath, rawData, 'utf-8');
    console.log(`  💾 Backup created: ${backupPath}`);
    
    // Write the fixed data back to the original file
    await fs.writeFile(filePath, JSON.stringify(fixed, null, 2), 'utf-8');
    console.log(`  ✅ Fixed data written to: ${filePath}`);
    
    return {
      success: true,
      endpoint,
      stats
    };
    
  } catch (error) {
    console.error(`❌ Error processing ${endpoint}:`, error);
    return {
      success: false,
      endpoint,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Fix ZIP codes in all local endpoint JSON files
 */
async function fixAllLocalEndpointFiles() {
  console.log('🚀 Starting ZIP code fix for local endpoint files...');
  console.log('This script ONLY modifies local files - it does NOT upload to blob storage.\n');

  try {
    // Check if endpoints directory exists
    try {
      await fs.access(ENDPOINTS_DIR);
    } catch (error) {
      console.error('❌ Endpoints directory not found:', ENDPOINTS_DIR);
      process.exit(1);
    }

    const files = await fs.readdir(ENDPOINTS_DIR);
    const jsonFiles = files.filter(file => 
      file.endsWith('.json') && 
      !file.includes('blob-urls') && 
      !file.includes('all_endpoints') &&
      !file.includes('comprehensive_generation_summary') &&
      !file.includes('.backup')  // Skip backup files
    );

    if (jsonFiles.length === 0) {
      console.log('ℹ️  No endpoint files found to fix');
      return;
    }

    console.log(`Found ${jsonFiles.length} endpoint files to fix:`);
    jsonFiles.forEach(file => console.log(`  - ${file}`));

    const results: ProcessResult[] = [];
    const overallStats = {
      totalFiles: jsonFiles.length,
      successfulFiles: 0,
      failedFiles: 0,
      totalRecords: 0,
      totalFixed: 0,
      totalErrors: 0
    };

    // Process each file
    for (const file of jsonFiles) {
      const filePath = join(ENDPOINTS_DIR, file);
      const endpoint = file.replace('.json', '');
      
      const result = await fixSingleEndpointFile(filePath, endpoint);
      results.push(result);
      
      if (result.success) {
        overallStats.successfulFiles++;
        overallStats.totalRecords += result.stats.totalRecords;
        overallStats.totalFixed += result.stats.fixedCount;
        overallStats.totalErrors += result.stats.errorCount;
      } else {
        overallStats.failedFiles++;
      }
      
      // Small delay to be gentle on the file system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Summary report
    console.log('\n🎉 Local ZIP code fix complete!');
    console.log(`📊 Overall Statistics:`);
    console.log(`   Files processed: ${overallStats.successfulFiles}/${overallStats.totalFiles}`);
    console.log(`   Failed files: ${overallStats.failedFiles}`);
    console.log(`   Records processed: ${overallStats.totalRecords}`);
    console.log(`   Records fixed: ${overallStats.totalFixed}`);
    console.log(`   Records with errors: ${overallStats.totalErrors}`);
    console.log(`   Success rate: ${((overallStats.totalFixed / overallStats.totalRecords) * 100).toFixed(1)}%`);
    
    // Show failed files
    const failedFiles = results.filter(r => !r.success);
    if (failedFiles.length > 0) {
      console.log(`\n❌ Failed files:`);
      failedFiles.forEach(f => console.log(`   - ${f.endpoint}: ${f.error}`));
    }
    
    console.log('\n💡 Next steps:');
    console.log('   1. Review the fixed files to ensure data integrity');
    console.log('   2. Run the existing blob upload script to update cloud storage');
    console.log('   3. Test the endpoints to verify they work correctly');
    
  } catch (error) {
    console.error('❌ ZIP code fix failed:', error);
    process.exit(1);
  }
}

/**
 * Restore files from backup (utility function)
 */
async function restoreFromBackup() {
  console.log('🔄 Restoring files from backup...');
  
  const files = await fs.readdir(ENDPOINTS_DIR);
  const backupFiles = files.filter(file => file.includes('.backup.json'));
  
  for (const backupFile of backupFiles) {
    const backupPath = join(ENDPOINTS_DIR, backupFile);
    const originalPath = backupPath.replace('.backup.json', '.json');
    
    try {
      const backupData = await fs.readFile(backupPath, 'utf-8');
      await fs.writeFile(originalPath, backupData, 'utf-8');
      console.log(`✅ Restored ${originalPath} from backup`);
    } catch (error) {
      console.error(`❌ Error restoring ${originalPath}:`, error);
    }
  }
  
  console.log('🎉 Restore complete!');
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'restore') {
    restoreFromBackup();
  } else {
    fixAllLocalEndpointFiles();
  }
}

export { 
  fixAllLocalEndpointFiles, 
  fixSingleEndpointFile, 
  extractZipFromDescription, 
  restoreFromBackup 
};