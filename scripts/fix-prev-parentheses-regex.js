#!/usr/bin/env node
// Fix prev-typed arrow params like `prev: any =>` -> `(prev: any) =>`
// Usage: node scripts/fix-prev-parentheses-regex.js [--dry]

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const dry = process.argv.includes('--dry');

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach((f) => {
    const fp = path.join(dir, f);
    const stat = fs.statSync(fp);
    if (stat.isDirectory()) {
      // skip node_modules and .git
      if (f === 'node_modules' || f === '.git') return;
      walk(fp, filelist);
    } else if (fp.endsWith('.tsx') || fp.endsWith('.ts') || fp.endsWith('.jsx') || fp.endsWith('.js')) {
      filelist.push(fp);
    }
  });
  return filelist;
}

const files = walk(path.join(root, 'components'))
  .concat(walk(path.join(root, 'app')).filter(p => p.includes('components') || p.endsWith('.tsx')))
  .filter(Boolean);

const matchRegex = /([A-Za-z_$][A-Za-z0-9_$]*)\s*:\s*any\s*=>/g;

let totalEdits = 0;
let fileEdits = [];

for (const file of files) {
  let src;
  try { src = fs.readFileSync(file, 'utf8'); } catch (e) { continue; }
  let m;
  let edits = 0;
  const newSrc = src.replace(matchRegex, (match, p1) => {
    edits++;
    return `(${p1}: any) =>`;
  });
  if (edits > 0) {
    fileEdits.push({ file, edits });
    totalEdits += edits;
    if (!dry) {
      fs.writeFileSync(file, newSrc, 'utf8');
    }
  }
}

if (dry) {
  console.log(`DRY RUN: ${fileEdits.length} files would be changed; ${totalEdits} param edits.`);
  fileEdits.forEach(f => console.log(`${f.file}: ${f.edits}`));
} else {
  console.log(`Applied edits to ${fileEdits.length} files; ${totalEdits} param edits.`);
  fileEdits.forEach(f => console.log(`${f.file}: ${f.edits}`));
}

if (fileEdits.length === 0) process.exit(0);
else process.exit(0);
