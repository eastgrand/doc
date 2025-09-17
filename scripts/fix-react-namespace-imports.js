const fs = require('fs');

// Files with React import issues that need namespace access
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

function fixReactNamespaceImports(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${filePath} - file not found`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let modifiedContent = content;
  let hasChanges = false;

  // Ensure React is imported as default
  if (!modifiedContent.includes('import React')) {
    const firstImport = modifiedContent.indexOf('import');
    if (firstImport !== -1) {
      modifiedContent = modifiedContent.slice(0, firstImport) + 
        "import React from 'react';\n" +
        modifiedContent.slice(firstImport);
      hasChanges = true;
      console.log(`🔧 Added React default import to ${filePath}`);
    }
  }

  // Replace problematic named imports with namespace access
  const replacements = [
    { from: /\bSuspense\b/g, to: 'React.Suspense' },
    { from: /\bComponentProps\b/g, to: 'React.ComponentProps' },
    { from: /\buseImperativeHandle\b/g, to: 'React.useImperativeHandle' },
    { from: /\bFC\b/g, to: 'React.FC' },
    { from: /\bPropsWithChildren\b/g, to: 'React.PropsWithChildren' },
    { from: /\bReactElement\b/g, to: 'React.ReactElement' },
    { from: /\bHTMLAttributes\b/g, to: 'React.HTMLAttributes' },
    { from: /\bReactNode\b/g, to: 'React.ReactNode' },
    { from: /\bKeyboardEventHandler\b/g, to: 'React.KeyboardEventHandler' }
  ];

  for (const { from, to } of replacements) {
    const before = modifiedContent;
    modifiedContent = modifiedContent.replace(from, to);
    if (modifiedContent !== before) {
      hasChanges = true;
      console.log(`🔧 Replaced ${from.source} with ${to} in ${filePath}`);
    }
  }

  // Remove now-unnecessary named imports
  const unnecessaryImports = [
    'Suspense', 'ComponentProps', 'useImperativeHandle', 'FC', 
    'PropsWithChildren', 'ReactElement', 'HTMLAttributes', 'ReactNode',
    'KeyboardEventHandler'
  ];

  // Fix import statements - remove problematic imports from React imports
  modifiedContent = modifiedContent.replace(
    /import\s+(?:React,?\s*)?\{([^}]+)\}\s+from\s+['"]react['"];?/g,
    (match, namedImports) => {
      const imports = namedImports
        .split(',')
        .map(imp => imp.trim())
        .filter(imp => {
          // Remove type prefix and check if it's an unnecessary import
          const cleanImp = imp.replace(/^type\s+/, '');
          return !unnecessaryImports.includes(cleanImp);
        })
        .filter(imp => imp.length > 0);

      if (imports.length === 0) {
        hasChanges = true;
        return ''; // Remove the entire import if no imports remain
      }
      
      return `import { ${imports.join(', ')} } from 'react';`;
    }
  );

  // Clean up empty lines left by removed imports
  modifiedContent = modifiedContent.replace(/\n\s*\n/g, '\n');

  if (hasChanges) {
    fs.writeFileSync(filePath, modifiedContent);
    console.log(`✅ Fixed React namespace imports in ${filePath}`);
    return true;
  }

  return false;
}

console.log('🚀 Starting React namespace imports fix...\n');

let fixedFiles = 0;
let totalFiles = 0;

for (const file of filesToFix) {
  totalFiles++;
  if (fixReactNamespaceImports(file)) {
    fixedFiles++;
  }
}

console.log(`\n✅ React namespace imports fix complete!`);
console.log(`📊 Fixed ${fixedFiles}/${totalFiles} files`);

if (fixedFiles > 0) {
  console.log('\n🔍 Please run `npx tsc --noEmit` to verify the React namespace fixes resolved the TS2614 errors.');
}