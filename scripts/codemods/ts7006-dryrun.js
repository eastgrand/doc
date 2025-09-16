#!/usr/bin/env node
/*
 * Conservative TS7006 dry-run codemod
 * Scans .ts/.tsx files and proposes adding `: any` to un-typed identifier parameters
 * in arrow functions and function expressions. Does NOT modify files — outputs a preview.
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = process.cwd();
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
    // Handle ArrowFunction and FunctionExpression
    if ((ts.isArrowFunction(node) || ts.isFunctionExpression(node) || ts.isFunctionDeclaration(node)) && node.parameters && node.parameters.length) {
      const paramEdits = [];
      for (const param of node.parameters) {
        // skip if already has type or is binding pattern or rest element
        if (param.type) continue;
        if (!param.name || !ts.isIdentifier(param.name)) continue;
        if (param.dotDotDotToken) continue;
        // compute insertion position after parameter name
        const nameEnd = param.name.end;
        paramEdits.push({ pos: nameEnd, insertText: ': any' });
      }
      if (paramEdits.length) {
        edits.push(...paramEdits.map(e => ({ filePath, ...e })));
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return edits;
}

function applyPreview(editsByFile) {
  // Produce a unified-style preview per file (original snippet + suggested snippet)
  const blocks = [];
  for (const [file, edits] of Object.entries(editsByFile)) {
    if (!edits.length) continue;
    const src = fs.readFileSync(file, 'utf8');
    // Apply edits in reverse order to produce new text
    const sorted = edits.slice().sort((a,b)=>b.pos-a.pos);
    let newText = src;
    for (const e of sorted) {
      newText = newText.slice(0, e.pos) + e.insertText + newText.slice(e.pos);
    }
    blocks.push('=== FILE: ' + path.relative(ROOT, file) + ' ===');
    blocks.push('--- original ---');
    blocks.push(src.split('\n').slice(0,200).join('\n'));
    blocks.push('--- suggested (first 200 lines) ---');
    blocks.push(newText.split('\n').slice(0,200).join('\n'));
    blocks.push('\n');
  }
  return blocks.join('\n');
}

function main() {
  const editsByFile = {};
  walkDir(ROOT, (filePath) => {
    if (!isTargetFile(filePath)) return;
    const edits = collectEditsForFile(filePath);
    if (edits.length) editsByFile[filePath] = edits;
  });

  const totalFiles = Object.keys(editsByFile).length;
  const totalEdits = Object.values(editsByFile).reduce((s,a)=>s+a.length,0);
  const header = `TS7006 dry-run preview\nGenerated: ${new Date().toISOString()}\nFiles with edits: ${totalFiles}\nTotal param annotations suggested: ${totalEdits}\n\n`;
  const body = applyPreview(editsByFile);
  const out = header + body;
  const outPath = path.join(ROOT, 'diagnostics', 'ts7006_dryrun_preview.txt');
  try { fs.mkdirSync(path.join(ROOT, 'diagnostics'), { recursive: true }); } catch(e){}
  fs.writeFileSync(outPath, out, 'utf8');
  console.log('WROTE PREVIEW:', outPath);
}

main();
