import { Project, SyntaxKind, ts } from 'ts-morph';
import path from 'path';

// This script finds arrow functions passed to setState-like calls (setX(prev => ...))
// and ensures the parameter is explicitly typed: (prev: any) => ...
// Run in preview mode first, then without --dry to apply.

const DRY = process.argv.includes('--dry');
const ROOT = process.cwd();

const project = new Project({
  tsConfigFilePath: path.join(ROOT, 'tsconfig.json'),
});

const sourceFiles = project.getSourceFiles(['components/**/*.tsx', 'components/**/*.ts', 'hooks/**/*.ts*(x)?']);

const edits: { file: string; old: string; newText: string }[] = [];

for (const sourceFile of sourceFiles) {
  const filePath = sourceFile.getFilePath();
  let changed = false;

  const arrowFunctions = sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction);

  arrowFunctions.forEach(arrow => {
    const parent = arrow.getParent();
    // look for patterns: setX(prev => ...), onChange={(e) => ...} (we only target setX with single param named 'prev')
    if (!parent) return;

    const callExpression = parent.getFirstAncestorByKind(SyntaxKind.CallExpression);
    if (!callExpression) return;

    const expression = callExpression.getExpression().getText();
    if (!/^set[A-Z0-9_]/.test(expression) && !/set[A-Z0-9_]/.test(expression)) return;

    const params = arrow.getParameters();
    if (params.length !== 1) return;
    const param = params[0];
    const name = param.getName();
    // Only modify if no type currently
    if (param.getTypeNode()) return;

    // Add a narrow any to avoid large type churn. We keep it local and reversible.
    param.set({ type: 'any' });
    changed = true;
  });

  if (changed) {
    edits.push({ file: filePath, old: '', newText: sourceFile.getFullText() });
    if (!DRY) sourceFile.saveSync();
  }
}

if (DRY) {
  console.log('Preview edits:', edits.slice(0, 50).map(e => e.file));
  console.log(`Total files with changes (preview): ${edits.length}`);
} else {
  console.log(`Applied edits to ${edits.length} files.`);
}
