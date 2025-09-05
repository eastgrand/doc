#!/usr/bin/env node
const fs = require('fs');
const cp = require('child_process');
const path = require('path');

function runJestOnPaths(paths) {
  const args = ['jest', '--runTestsByPath', ...paths, '--runInBand', '--json', '--outputFile=/tmp/jest_result.json'];
  try {
    const res = cp.spawnSync('npx', args, { stdio: 'inherit', shell: false, cwd: process.cwd(), env: process.env, maxBuffer: 1024 * 1024 * 10 });
    return res.status === 0;
  } catch (error) {
    console.error('Error running jest:', error);
    return false;
  }
}

function readJestList(file) {
  const raw = fs.readFileSync(file, 'utf8');
  try {
    const arr = JSON.parse(raw);
    return arr.map(p => path.resolve(p));
  } catch (err) {
    console.error('Failed to parse jest list json:', err);
    process.exit(2);
  }
}

function readResult() {
  try {
    const raw = fs.readFileSync('/tmp/jest_result.json', 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function testFailedInResult(resultJson, targetPath) {
  if (!resultJson || !resultJson.testResults) return false;
  const tr = resultJson.testResults.find(t => path.resolve(t.name) === path.resolve(targetPath));
  if (!tr) return false;
  return tr.status !== 'passed';
}

function usage() {
  console.log('Usage: node tools/test-order-bisect.js --target <relative/path/to/target.test.ts> --list /tmp/jest_tests.json');
}

async function main() {
  const argv = process.argv.slice(2);
  const targetIndex = argv.indexOf('--target');
  const listIndex = argv.indexOf('--list');
  if (targetIndex === -1 || listIndex === -1) return usage();
  const target = argv[targetIndex + 1];
  const listFile = argv[listIndex + 1];
  if (!target || !listFile) return usage();

  const all = readJestList(listFile);
  const targetAbs = path.resolve(target);
  const targets = all.filter(p => p.endsWith(path.sep + target) || p === targetAbs || p.includes(target));
  if (targets.length === 0) {
    console.error('Target test not found in list. Looked for:', target);
    process.exit(3);
  }
  const targetPath = targets[0];
  console.log('Found target:', targetPath);

  const others = all.filter(p => p !== targetPath);
  let culprit = null;

  // Quick check: does full-suite reproduce failure?
  console.log('Running full-suite (all tests) to confirm behavior...');
  const fullPaths = [...others, targetPath];
  runJestOnPaths(fullPaths);
  const fullRes = readResult();
  const fullFail = testFailedInResult(fullRes, targetPath);
  if (!fullFail) {
    console.log('Target does NOT fail in full-suite run. Aborting bisect.');
    process.exit(0);
  }

  console.log('Target fails in full-suite. Starting group bisect...');
  let left = 0, right = others.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const group = others.slice(0, mid + 1);
    const runPaths = [...group, targetPath];
    console.log(`Testing group size ${group.length} (0..${mid}) then target...`);
    runJestOnPaths(runPaths);
    const res = readResult();
    const fail = testFailedInResult(res, targetPath);
    if (fail) {
      // culprit in this group
      culprit = group.slice();
      // narrow to first half
      right = mid - 1;
    } else {
      // culprit after mid
      left = mid + 1;
    }
    // stop if group size is 1
    if (left === right) break;
  }

  if (culprit && culprit.length > 0) {
    console.log('\nPotential culprit group (first occurrence):');
    console.log(culprit.slice(0, 10).join('\n'));
    console.log('\nIf group length > 1, run the same approach narrowed to that group to find the single test.');
  } else {
    console.log('Could not identify a culprit group via this bisect approach.');
  }
}

main();
