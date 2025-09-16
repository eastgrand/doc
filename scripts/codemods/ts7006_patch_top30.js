#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = process.cwd();
const OUT_PATH = path.join(ROOT, 'diagnostics', 'ts7006_patch_preview_top30.txt');
const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'out', 'diagnostics']);

function walkDir(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.isDirectory()) {
      if (IGNORED_DIRS.has(ent.name)) continue;
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

  visit(sourceFile);
  return edits;
}

function charPosToLineIndex(text, pos) {
  const prefix = text.slice(0, pos);
  return prefix.split('\n').length - 1; // 0-based line index
}

function makePatchForFile(filePath, edits) {
  const src = fs.readFileSync(filePath, 'utf8');
  const lines = src.split('\n');
  const sorted = edits.slice().sort((a,b)=>a.pos-b.pos);
  // build suggested text
  let newText = src;
  for (let i = sorted.length -1; i>=0; --i) {
    const e = sorted[i];
    newText = newText.slice(0, e.pos) + e.insertText + newText.slice(e.pos);
  }
  const newLines = newText.split('\n');

  // determine affected line ranges (collect lines near each insertion)
  const affected = new Set();
  for (const e of sorted) {
    const li = charPosToLineIndex(src, e.pos);
    for (let k = Math.max(0, li-3); k <= Math.min(lines.length-1, li+3); k++) affected.add(k);
  }
  const idxs = Array.from(affected).sort((a,b)=>a-b);
  // produce hunks by grouping contiguous indices
  const hunks = [];
  let cur = null;
  for (const i of idxs) {
    if (!cur) cur = { start:i, end:i };
    else if (i === cur.end + 1) cur.end = i;
    else { hunks.push(cur); cur = { start:i, end:i }; }
  }
  if (cur) hunks.push(cur);

  const parts = [];
  parts.push('*** FILE: ' + path.relative(ROOT, filePath));
  for (const h of hunks) {
    parts.push(`@@ lines ${h.start+1}-${h.end+1} @@`);
    for (let i = h.start; i <= h.end; i++) {
      parts.push('- ' + lines[i]);
    }
    parts.push('---');
    for (let i = h.start; i <= Math.min(h.end + 3, newLines.length-1); i++) {
      parts.push('+ ' + newLines[i]);
    }
  }
  parts.push('\n');
  return parts.join('\n');
}

function main() {
  const editsByFile = {};
  walkDir(ROOT, (filePath) => {
    if (!isTargetFile(filePath)) return;
    try {
      const edits = collectEditsForFile(filePath);
      if (edits.length) editsByFile[filePath] = edits;
    } catch (err) {
      // ignore parse errors
    }
  });

  const files = Object.entries(editsByFile).map(([f,ed])=>({file:f, count:ed.length, edits:ed}));
  files.sort((a,b)=>b.count - a.count);
  const top = files.slice(0,30);

  const header = `TS7006 patch-style preview (top ${top.length} files)\nGenerated: ${new Date().toISOString()}\nTotal files with edits: ${Object.keys(editsByFile).length}\nTotal suggested annotations: ${Object.values(editsByFile).reduce((s,a)=>s+a.length,0)}\n\n`;
  const blocks = [header];
  for (const f of top) {
    try {
      blocks.push(makePatchForFile(f.file, f.edits));
    } catch (e) {
      blocks.push(`*** FILE: ${path.relative(ROOT,f.file)} -- ERROR generating patch: ${String(e)}`);
    }
  }

  try { fs.mkdirSync(path.join(ROOT,'diagnostics'), { recursive: true }); } catch(e){}
  fs.writeFileSync(OUT_PATH, blocks.join('\n'), 'utf8');
  console.log('WROTE:', OUT_PATH);
}

main();
