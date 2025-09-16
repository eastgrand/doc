#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DRY = process.argv.includes('--dry');
let totalFiles = 0;
let totalEdits = 0;

function walk(dir, filelist = []){
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      if (file === 'node_modules' || file === '.git') return;
      walk(filepath, filelist);
    } else {
      if (/\.(tsx?|jsx?)$/.test(file)) filelist.push(filepath);
    }
  });
  return filelist;
}

const targets = walk(path.join(ROOT, 'components'))
  .concat(fs.existsSync(path.join(ROOT,'hooks')) ? walk(path.join(ROOT,'hooks')) : [])
  .filter(p => p.includes('/components/') || p.includes('/hooks/'));

const regex1 = /(\bset[A-Za-z0-9_]*\s*\(\s*)([A-Za-z_$][A-Za-z0-9_$]*)(\s*=>)/g; // setX(prev =>
const regex2 = /(\bset[A-Za-z0-9_]*\s*\(\s*\(\s*)([A-Za-z_$][A-Za-z0-9_$]*)(\s*\)\s*=>)/g; // setX((prev) =>

const changedFiles = [];

for (const f of targets) {
  let text = fs.readFileSync(f, 'utf8');
  let original = text;
  let edits = 0;

  text = text.replace(regex2, (m, p1, name, p3) => {
    // skip if already has type like (prev: Type) -> then won't match
    edits++;
    return `${p1}${name}: any${p3}`;
  });

  text = text.replace(regex1, (m, p1, name, p3) => {
    // skip if already typed
    edits++;
    return `${p1}${name}: any${p3}`;
  });

  if (edits > 0) {
    totalFiles++;
    totalEdits += edits;
    changedFiles.push({ file: f, edits });
    if (!DRY) {
      fs.writeFileSync(f, text, 'utf8');
    }
  }
}

if (DRY) {
  console.log(`DRY RUN: ${changedFiles.length} files would be changed; ${totalEdits} param edits.`);
  changedFiles.slice(0, 50).forEach(cf => console.log(cf.file + ' -> ' + cf.edits + ' edits'));
} else {
  console.log(`Applied edits to ${changedFiles.length} files; ${totalEdits} param edits.`);
}

process.exit(0);
