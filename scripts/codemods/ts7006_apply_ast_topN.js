#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const ts = require('typescript');

const ROOT = process.cwd();
const DIAG = path.join(ROOT, 'diagnostics');
const BACKUP = path.join(DIAG, 'backups_ast');
const OUT_JSON = path.join(DIAG, 'ts7006_apply_ast_batch1.json');
const TSC_OUT = path.join(DIAG, 'tsc_after_ts7006_ast_batch1.txt');
const SUMMARY = path.join(DIAG, 'ts7006_apply_ast_batch1_result.txt');

const N = Number(process.argv[2] || 10);

function walkDir(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.isDirectory()) {
      if (['node_modules', '.git', 'dist', 'build', 'out', 'diagnostics'].includes(ent.name)) continue;
      walkDir(path.join(dir, ent.name), cb);
    } else if (ent.isFile()) {
      cb(path.join(dir, ent.name));
    }
  }
}

function isTargetFile(filePath) {
  return filePath.endsWith('.ts') || filePath.endsWith('.tsx');
}

function collectEditsForFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, src, ts.ScriptTarget.Latest, true, filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const edits = [];

  function visit(node) {
    if ((ts.isArrowFunction(node) || ts.isFunctionExpression(node) || ts.isFunctionDeclaration(node)) && node.parameters && node.parameters.length) {
      for (const param of node.parameters) {
        if (param.type) continue;
        if (!param.name || !ts.isIdentifier(param.name)) continue;
        if (param.dotDotDotToken) continue;
        const nameEnd = param.name.end;
        edits.push({ pos: nameEnd, insertText: ': any' });
      }
    }
    ts.forEachChild(node, visit);
  }

  try { visit(sourceFile); } catch (e) { return []; }
  return edits;
}

function applyEditsToFile(filePath, edits) {
  const abs = filePath;
  const src = fs.readFileSync(abs, 'utf8');
  const sorted = edits.slice().sort((a,b)=>b.pos-a.pos);
  let newText = src;
  for (const e of sorted) {
    newText = newText.slice(0, e.pos) + e.insertText + newText.slice(e.pos);
  }
  // backup
  const rel = path.relative(ROOT, abs).replace(/[\/]/g,'__');
  const backupPath = path.join(BACKUP, rel + '.bak');
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.writeFileSync(backupPath, src, 'utf8');
  fs.writeFileSync(abs, newText, 'utf8');
}

function revertBackups() {
  if (!fs.existsSync(BACKUP)) return;
  const files = fs.readdirSync(BACKUP).filter(f=>f.endsWith('.bak'));
  for (const bf of files) {
    const rel = bf.replace(/\.bak$/, '');
    const target = path.join(ROOT, rel.replace(/__/g, path.sep));
    const src = path.join(BACKUP, bf);
    try { fs.copyFileSync(src, target); } catch(e) { console.error('revert failed for', target, e); }
  }
}

function countErrors(tsOutput) {
  const m = tsOutput.match(/error TS/g);
  return m ? m.length : 0;
}

// load previous totalErrors if available
let prevErrors = null;
try {
  const summary = JSON.parse(fs.readFileSync(path.join(DIAG, 'ts_diagnostics_summary.json'),'utf8'));
  prevErrors = summary.totalErrors;
} catch(e) {}

const fileEdits = {};
walkDir(ROOT, (p)=>{ if (isTargetFile(p)) { const edits = collectEditsForFile(p); if (edits.length) fileEdits[p]=edits; } });
const ranked = Object.entries(fileEdits).map(([f,e])=>({file:f, count:e.length, edits:e})).sort((a,b)=>b.count-a.count);
const top = ranked.slice(0, N);

if (top.length === 0) { console.log('No edits to apply'); process.exit(0); }

fs.mkdirSync(BACKUP, { recursive: true });
const applied = [];
for (const item of top) {
  try { applyEditsToFile(item.file, item.edits); applied.push({file:item.file, edits: item.edits.length}); }
  catch(e){ applied.push({file:item.file, error:String(e)}); }
}

fs.writeFileSync(OUT_JSON, JSON.stringify({ applied, prevErrors, generatedAt: new Date().toISOString() }, null, 2));

// run tsc
let tscOut = '';
try {
  tscOut = child_process.execSync('npx tsc --noEmit', { cwd: ROOT, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] });
  fs.writeFileSync(TSC_OUT, tscOut, 'utf8');
} catch (err) {
  tscOut = (err.stdout || '') + '\n' + (err.stderr || '');
  fs.writeFileSync(TSC_OUT, tscOut, 'utf8');
}

const newCount = countErrors(tscOut);
let summary = `Applied edits to ${applied.length} files. Previous errors: ${prevErrors ?? 'unknown'}. New errors: ${newCount}.\n`;
if (prevErrors !== null && newCount > prevErrors) {
  summary += 'ERRORS INCREASED after applying patch — reverting backups.\n';
  revertBackups();
  // run tsc again after revert
  try { const out2 = child_process.execSync('npx tsc --noEmit', { cwd: ROOT, encoding: 'utf8' }); fs.writeFileSync(path.join(DIAG,'tsc_after_ts7006_ast_batch1_revert.txt'), out2, 'utf8'); summary += 'Reverted. tsc output saved to diagnostics/tsc_after_ts7006_ast_batch1_revert.txt\n'; }
  catch (err) { const out2 = (err.stdout||'')+'\n'+(err.stderr||''); fs.writeFileSync(path.join(DIAG,'tsc_after_ts7006_ast_batch1_revert.txt'), out2, 'utf8'); summary += 'Reverted (tsc produced errors). See diagnostics/tsc_after_ts7006_ast_batch1_revert.txt\n'; }
  fs.writeFileSync(SUMMARY, summary, 'utf8');
  console.log(summary);
  process.exit(0);
}

summary += 'Changes kept. tsc output saved to diagnostics/tsc_after_ts7006_ast_batch1.txt\n';
fs.writeFileSync(SUMMARY, summary, 'utf8');
console.log(summary);
