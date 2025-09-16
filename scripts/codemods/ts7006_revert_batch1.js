#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const ROOT = process.cwd();
const BACKUP = path.join(ROOT, 'diagnostics', 'backups');
const DIAG = path.join(ROOT, 'diagnostics');

if (!fs.existsSync(BACKUP)) {
  console.error('No backups found at', BACKUP); process.exit(1);
}

const files = fs.readdirSync(BACKUP).filter(f=>f.endsWith('.bak'));
for (const bf of files) {
  const original = bf.replace(/__/g, '/').replace(/\.bak$/, '');
  const backupPath = path.join(BACKUP, bf);
  const targetPath = path.join(ROOT, original);
  try {
    fs.copyFileSync(backupPath, targetPath);
    console.log('Restored', original);
  } catch (e) {
    console.error('Failed to restore', original, e.message || e);
  }
}

// Run tsc and write output
try {
  const out = child_process.execSync('npx tsc --noEmit', { cwd: ROOT, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] });
  fs.writeFileSync(path.join(DIAG, 'tsc_after_ts7006_revert.txt'), out, 'utf8');
  console.log('tsc success; output written to diagnostics/tsc_after_ts7006_revert.txt');
} catch (err) {
  const out = (err.stdout || '') + '\n' + (err.stderr || '');
  fs.writeFileSync(path.join(DIAG, 'tsc_after_ts7006_revert.txt'), out, 'utf8');
  console.log('tsc completed with errors; output written to diagnostics/tsc_after_ts7006_revert.txt');
}
