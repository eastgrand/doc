#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'diagnostics', 'ts7006_dryrun_v2_preview.txt');
const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'out', 'diagnostics', '__tests__', '__mocks__']);

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

function isTargetFile(f) { return f.endsWith('.ts') || f.endsWith('.tsx'); }

function collectEdits(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const sf = ts.createSourceFile(filePath, src, ts.ScriptTarget.Latest, true, filePath.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  const edits = [];

  function visit(node) {
    if ((ts.isArrowFunction(node) || ts.isFunctionExpression(node) || ts.isFunctionDeclaration(node)) && node.parameters) {
      for (const param of node.parameters) {
        if (param.type) continue;
        if (!param.name || !ts.isIdentifier(param.name)) continue;
        if (param.dotDotDotToken) continue;

        // Determine if this arrow function uses single-identifier without parens
        if (ts.isArrowFunction(node) && node.parameters.length === 1) {
          // find slice from param.start to token '=>'
          const afterParam = src.slice(param.end, param.end + 20);
          const arrowIdx = src.indexOf('=>', param.end);
          if (arrowIdx === -1) continue;
          // Check if there's an opening paren before param
          const before = src.slice(Math.max(0, param.pos-2), param.pos);
          const hasParen = before.includes('(');
          if (!hasParen) {
            // replace from param.pos to arrowIdx+2 with `(${name}: any) =>`
            edits.push({ start: param.pos, end: arrowIdx + 2, replacement: `(${param.name.text}: any) =>` });
            continue;
          }
        }

        // Default: insert ': any' after the identifier
        edits.push({ start: param.name.end, end: param.name.end, replacement: ': any' });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return edits;
}

function applyPreview(editsByFile) {
  const blocks = [];
  const files = Object.keys(editsByFile);
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    const edits = editsByFile[f].slice().sort((a,b)=>a.start-b.start);
    let newText = '';
    let last = 0;
    for (const e of edits) {
      newText += src.slice(last, e.start) + e.replacement;
      last = e.end;
    }
    newText += src.slice(last);

    blocks.push('=== FILE: ' + path.relative(ROOT, f) + ' ===');
    blocks.push('--- original (first 120 lines) ---');
    blocks.push(src.split('\n').slice(0,120).join('\n'));
    blocks.push('--- suggested (first 120 lines) ---');
    blocks.push(newText.split('\n').slice(0,120).join('\n'));
    blocks.push('\n');
  }
  return blocks.join('\n');
}

function main() {
  const editsByFile = {};
  walkDir(ROOT, (p) => {
    if (!isTargetFile(p)) return;
    if (p.includes('__tests__') || p.includes('/__tests__/') || p.includes('/tests/')) return; // skip tests
    try {
      const edits = collectEdits(p);
      if (edits.length) editsByFile[p] = edits;
    } catch (e) {
      // skip parse failures
    }
  });

  const totalFiles = Object.keys(editsByFile).length;
  const totalEdits = Object.values(editsByFile).reduce((s,a)=>s+a.length,0);
  const header = `TS7006 dry-run v2 preview\nGenerated: ${new Date().toISOString()}\nFiles with suggested edits: ${totalFiles}\nTotal edits: ${totalEdits}\n\n`;
  const body = applyPreview(editsByFile);
  fs.mkdirSync(path.join(ROOT,'diagnostics'), { recursive: true });
  fs.writeFileSync(OUT, header + body, 'utf8');
  console.log('WROTE PREVIEW:', OUT);
}

main();
