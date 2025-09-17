const fs = require('fs');

// Files with React import issues identified from TSC output
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

// React named imports that should be default imports in newer React versions
const namedImportPatterns = [
  { from: /\bSuspense\b/g, to: 'Suspense' },
  { from: /\bComponentProps\b/g, to: 'ComponentProps' },
  { from: /\buseImperativeHandle\b/g, to: 'useImperativeHandle' },
  { from: /\bFC\b/g, to: 'FC' },
  { from: /\bPropsWithChildren\b/g, to: 'PropsWithChildren' }
];

function fixReactImports(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${filePath} - file not found`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let modifiedContent = content;
  let hasChanges = false;

  // Pattern to match React import statements
  const reactImportRegex = /import\s+(?:React,?\s*)?\{([^}]+)\}\s+from\s+['"]react['"];?/g;
  
  modifiedContent = modifiedContent.replace(reactImportRegex, (match, namedImports) => {
    // Split named imports and clean them
    const imports = namedImports
      .split(',')
      .map(imp => imp.trim())
      .filter(imp => imp.length > 0);
    
    // Check if we need to fix any of these imports
    const needsFix = imports.some(imp => 
      namedImportPatterns.some(pattern => pattern.from.test(imp))
    );
    
    if (needsFix) {
      hasChanges = true;
      console.log(`🔧 Fixing React imports in ${filePath}`);
      console.log(`   Original: ${match}`);
      
      // For now, keep all as named imports but ensure React is also imported as default
      // This is a safer approach than converting to default imports
      const hasReactDefault = content.includes('import React') && !content.includes('import React,') && !content.includes('import { React');
      
      if (hasReactDefault) {
        return match; // Keep original if React default import exists elsewhere
      } else {
        // Add React as default import alongside named imports
        const result = `import React, { ${imports.join(', ')} } from 'react';`;
        console.log(`   Fixed:    ${result}`);
        return result;
      }
    }
    
    return match;
  });

  // Also handle cases where React is imported as default but named imports are separate
  const hasReactDefault = /import\s+React\s+from\s+['"]react['"];?/.test(modifiedContent);
  const hasNamedImports = /import\s+\{[^}]+\}\s+from\s+['"]react['"];?/.test(modifiedContent);
  
  if (hasReactDefault && hasNamedImports) {
    // Combine into single import statement
    const reactDefaultMatch = modifiedContent.match(/import\s+React\s+from\s+['"]react['"];?/);
    const namedImportMatch = modifiedContent.match(/import\s+\{([^}]+)\}\s+from\s+['"]react['"];?/);
    
    if (reactDefaultMatch && namedImportMatch) {
      const namedImports = namedImportMatch[1].trim();
      const combinedImport = `import React, { ${namedImports} } from 'react';`;
      
      modifiedContent = modifiedContent
        .replace(reactDefaultMatch[0], '')
        .replace(namedImportMatch[0], combinedImport);
      
      hasChanges = true;
      console.log(`🔧 Combined React imports in ${filePath}`);
      console.log(`   Combined: ${combinedImport}`);
    }
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, modifiedContent);
    console.log(`✅ Fixed React imports in ${filePath}`);
    return true;
  }

  return false;
}

console.log('🚀 Starting React imports fix...\n');

let fixedFiles = 0;
let totalFiles = 0;

for (const file of filesToFix) {
  totalFiles++;
  if (fixReactImports(file)) {
    fixedFiles++;
  }
}

console.log(`\n✅ React imports fix complete!`);
console.log(`📊 Fixed ${fixedFiles}/${totalFiles} files`);

if (fixedFiles > 0) {
  console.log('\n🔍 Please run `npx tsc --noEmit` to verify the fixes resolved the React import errors.');
}