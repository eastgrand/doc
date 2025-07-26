#!/usr/bin/env node

/**
 * Simple Node.js runner for query tests (no TypeScript dependency)
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting automated query tests...');

const scriptPath = path.join(__dirname, 'test-all-queries.ts');

// Try to run with ts-node, fallback to npx ts-node
const child = spawn('npx', ['ts-node', scriptPath], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

child.on('error', (error) => {
  console.error('❌ Failed to run tests:', error.message);
  console.log('\n💡 Make sure you have ts-node installed:');
  console.log('   npm install -g ts-node');
  console.log('   or: npx ts-node scripts/test-all-queries.ts');
  process.exit(1);
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log('\n✅ All tests completed successfully!');
  } else {
    console.log(`\n❌ Tests completed with exit code ${code}`);
  }
  process.exit(code);
});