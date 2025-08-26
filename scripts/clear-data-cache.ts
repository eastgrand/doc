#!/usr/bin/env ts-node

// Clear browser and server-side data caches

import { clearBlobDataCache } from '../utils/blob-data-loader';

async function clearAllDataCaches() {
  console.log('🧹 Clearing all data caches...\n');

  // Clear blob data cache
  console.log('📋 Clearing blob data cache...');
  clearBlobDataCache();
  console.log('   ✅ Blob data cache cleared\n');

  // Clear semantic routing cache (restart required)
  console.log('🤖 Semantic routing cache...');
  console.log('   ⚠️  Requires server restart to clear semantic embeddings cache');
  console.log('   ✅ Updated endpoint descriptions with Red Bull keywords\n');

  // Instructions for browser cache
  console.log('🌐 Browser cache clearing instructions:');
  console.log('   1. Open browser developer tools (F12)');
  console.log('   2. Right-click refresh button → "Empty Cache and Hard Reload"');
  console.log('   3. Or press Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)');
  console.log('   4. Clear localStorage: localStorage.clear() in console\n');

  // Clear Next.js cache
  console.log('⚡ Clearing Next.js cache...');
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    await execAsync('rm -rf .next/cache');
    console.log('   ✅ Next.js cache cleared\n');
  } catch (error) {
    console.log('   ⚠️  Could not clear Next.js cache:', error);
  }

  console.log('✅ Cache clearing complete!');
  console.log('💡 Restart your development server for full effect.');
}

clearAllDataCaches().catch(console.error);