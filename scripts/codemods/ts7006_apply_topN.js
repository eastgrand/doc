#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const ROOT = process.cwd();
const DIAG = path.join(ROOT, 'diagnostics');
const BACKUP = path.join(DIAG, 'backups');
const PREVIEW = path.join(DIAG, 'ts7006_dryrun_preview.txt');
const APPLY_OUT = path.join(DIAG, 'ts7006_apply_batch1_files.txt');

const N = Number(process.argv[2] || 10);

if (!fs.existsSync(PREVIEW)) {
  console.error('Preview not found:', PREVIEW); process.exit(1);
}

// Parse the preview generated earlier to find files and suggested insertions
const content = fs.readFileSync(PREVIEW, 'utf8');
const fileSections = content.split(/=== FILE: /g).slice(1);

const files = fileSections.map(sec => {
  const firstLine = sec.split('\n',1)[0].trim();
  const file = firstLine.replace(/ ===$/, '').trim();
  return file;
}).slice(0, N);

if (!fs.existsSync(BACKUP)) fs.mkdirSync(BACKUP, { recursive: true });

function applyAnnotationsToFile(filePath) {
  const abs = path.join(ROOT, filePath);
  if (!fs.existsSync(abs)) return { file: filePath, ok: false, reason: 'missing' };
  const src = fs.readFileSync(abs, 'utf8');
  // naive approach: replace occurrences of '(identifier =>', '(identifier) =>' and 'map((x) =>' without type
  // We'll add ': any' after simple identifier params using regex — conservative and reversible via backup
  const modified = src
    .replace(/(\bmap\s*\(\s*)([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=>/g, (m, p1, id) => `${p1}${id}: any =>`)
    .replace(/\((\s*)([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\)\s*=>/g, (m, p1, id) => `(${p1}${id}: any) =>`)
    .replace(/\b([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=>/g, (m, id) => `${id}: any =>`);

  const backupPath = path.join(BACKUP, filePath.replace(/[\/]/g,'__') + '.bak');
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.writeFileSync(backupPath, src, 'utf8');
  fs.writeFileSync(abs, modified, 'utf8');
  return { file: filePath, ok: true };
}

const results = [];
for (const f of files) {
  try { results.push(applyAnnotationsToFile(f)); } catch(e) { results.push({ file:f, ok:false, reason:String(e) }); }
}

fs.writeFileSync(APPLY_OUT, JSON.stringify({ applied: results, generatedAt: new Date().toISOString() }, null, 2));
console.log('Applied to files:', results.filter(r=>r.ok).length, 'of', results.length);

// Run tsc and capture output
try {
  const tsc = child_process.execSync('npx tsc --noEmit', { cwd: ROOT, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] });
  fs.writeFileSync(path.join(DIAG, 'tsc_after_ts7006_batch1.txt'), tsc, 'utf8');
  console.log('tsc completed successfully (no errors printed).');
} catch (err) {
  const out = (err.stdout || '') + '\n' + (err.stderr || '');
  fs.writeFileSync(path.join(DIAG, 'tsc_after_ts7006_batch1.txt'), out, 'utf8');
  console.log('tsc completed with errors; output written to diagnostics/tsc_after_ts7006_batch1.txt');
}
