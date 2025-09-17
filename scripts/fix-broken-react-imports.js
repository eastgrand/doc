const fs = require('fs');

// Files with broken React imports that need to be fixed
const filesToFix = [
  'app/map/page.tsx',
  'components/ai-elements/actions.tsx',
  'components/ai-elements/branch.tsx',
  'components/ai-elements/code-block.tsx',
  'components/ai-elements/conversation.tsx',
  'components/ai-elements/inline-citation.tsx',
  'components/ai-elements/message.tsx',
  'components/ApplianceLayerController.tsx',
  'components/LayerController/LayerController.tsx'
];

function fixBrokenReactImports(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${filePath} - file not found`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let modifiedContent = content;
  let hasChanges = false;

  // Fix broken imports like "import { React.ComponentProps }" -> proper imports
  const brokenImportPatterns = [
    /import\s*{\s*React\.ComponentProps([^}]*)\}\s*from\s*['"]react['"];?/g,
    /import\s*{\s*React\.ReactElement([^}]*)\}\s*from\s*['"]react['"];?/g,
    /import\s*{\s*React\.HTMLAttributes([^}]*)\}\s*from\s*['"]react['"];?/g,
    /import\s*{\s*React\.ReactNode([^}]*)\}\s*from\s*['"]react['"];?/g,
    /import\s*{\s*React\.FC([^}]*)\}\s*from\s*['"]react['"];?/g,
    /import\s*{\s*React\.useImperativeHandle([^}]*)\}\s*from\s*['"]react['"];?/g
  ];

  for (const pattern of brokenImportPatterns) {
    modifiedContent = modifiedContent.replace(pattern, (match) => {
      hasChanges = true;
      console.log(`🔧 Fixing broken import in ${filePath}: ${match}`);
      return ''; // Remove broken import entirely
    });
  }

  // Ensure React default import exists at the top
  if (modifiedContent.includes('React.') && !modifiedContent.includes('import React')) {
    const firstImport = modifiedContent.indexOf('import');
    if (firstImport !== -1) {
      modifiedContent = modifiedContent.slice(0, firstImport) + 
        "import React from 'react';\n" +
        modifiedContent.slice(firstImport);
      hasChanges = true;
      console.log(`🔧 Added React default import to ${filePath}`);
    }
  }

  // Clean up empty lines
  modifiedContent = modifiedContent.replace(/\n\s*\n\s*\n/g, '\n\n');

  if (hasChanges) {
    fs.writeFileSync(filePath, modifiedContent);
    console.log(`✅ Fixed broken React imports in ${filePath}`);
    return true;
  }

  return false;
}

console.log('🚀 Starting broken React imports fix...\n');

let fixedFiles = 0;
let totalFiles = 0;

for (const file of filesToFix) {
  totalFiles++;
  if (fixBrokenReactImports(file)) {
    fixedFiles++;
  }
}

console.log(`\n✅ Broken React imports fix complete!`);
console.log(`📊 Fixed ${fixedFiles}/${totalFiles} files`);

if (fixedFiles > 0) {
  console.log('\n🔍 Please run `npx tsc --noEmit` to verify the syntax errors are resolved.');
}