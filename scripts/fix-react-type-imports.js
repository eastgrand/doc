const fs = require('fs');

// Files with type-only React imports that need fixing
const filesToFix = [
  'components/ai-elements/actions.tsx',
  'components/ai-elements/branch.tsx',
  'components/ai-elements/code-block.tsx', 
  'components/ai-elements/conversation.tsx',
  'components/ai-elements/message.tsx'
];

function fixTypeOnlyReactImports(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${filePath} - file not found`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let modifiedContent = content;
  let hasChanges = false;

  // Pattern to match type-only React imports
  const typeOnlyImportRegex = /import\s+type\s+\{([^}]+)\}\s+from\s+['"]react['"];?/g;
  
  modifiedContent = modifiedContent.replace(typeOnlyImportRegex, (match, typeImports) => {
    // Check if this contains React types that need to be regular imports
    const imports = typeImports.split(',').map(imp => imp.trim());
    const problematicTypes = ['ComponentProps', 'FC', 'PropsWithChildren', 'ReactElement', 'HTMLAttributes'];
    
    const needsRegularImport = imports.some(imp => 
      problematicTypes.some(problematic => imp.includes(problematic))
    );
    
    if (needsRegularImport) {
      hasChanges = true;
      console.log(`🔧 Converting type-only React imports in ${filePath}`);
      console.log(`   Original: ${match}`);
      
      // Convert to regular import
      const result = `import { ${typeImports} } from 'react';`;
      console.log(`   Fixed:    ${result}`);
      return result;
    }
    
    return match;
  });

  if (hasChanges) {
    fs.writeFileSync(filePath, modifiedContent);
    console.log(`✅ Fixed type-only React imports in ${filePath}`);
    return true;
  }

  return false;
}

console.log('🚀 Starting type-only React imports fix...\n');

let fixedFiles = 0;
let totalFiles = 0;

for (const file of filesToFix) {
  totalFiles++;
  if (fixTypeOnlyReactImports(file)) {
    fixedFiles++;
  }
}

console.log(`\n✅ Type-only React imports fix complete!`);
console.log(`📊 Fixed ${fixedFiles}/${totalFiles} files`);

if (fixedFiles > 0) {
  console.log('\n🔍 Please run `npx tsc --noEmit` to verify the fixes resolved the React import errors.');
}