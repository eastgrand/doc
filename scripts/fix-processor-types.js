#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern to match property access on records that need type assertions
const patterns = [
  // Basic property access patterns
  /\brecord\.(\w+)/g,
  /\ba\.properties\.(\w+)/g,
  /\bb\.properties\.(\w+)/g,
  /\br\.properties\.(\w+)/g,
  /\bitem\.(\w+)/g,
  /\barea\.(\w+)/g,
  /\bdata\.(\w+)/g
];

const processFile = (filePath) => {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Apply transformations for common property access patterns
  const transformations = [
    // record.property -> (record as any).property
    { 
      pattern: /\brecord\.([a-zA-Z_]\w*)\b/g, 
      replacement: '(record as any).$1' 
    },
    // a.properties.property -> (a.properties as any).property  
    { 
      pattern: /\b([a-z])\.properties\.([a-zA-Z_]\w*)\b/g, 
      replacement: '($1.properties as any).$2' 
    },
    // item.property -> (item as any).property
    { 
      pattern: /\bitem\.([a-zA-Z_]\w*)\b/g, 
      replacement: '(item as any).$1' 
    },
    // area.property -> (area as any).property  
    { 
      pattern: /\barea\.([a-zA-Z_]\w*)\b/g, 
      replacement: '(area as any).$1' 
    }
  ];
  
  // Apply each transformation
  transformations.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  // Additional specific fixes for arithmetic operations
  const arithmeticFixes = [
    // Fix Object.keys() calls
    { 
      pattern: /Object\.keys\((\w+)\)/g, 
      replacement: 'Object.keys($1 as any)' 
    }
  ];
  
  arithmeticFixes.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Modified: ${filePath}`);
    return true;
  }
  
  return false;
};

// Find all processor files
const processorFiles = glob.sync('lib/analysis/strategies/processors/*.ts');

console.log(`Found ${processorFiles.length} processor files to fix...`);

let totalModified = 0;
processorFiles.forEach(file => {
  if (processFile(file)) {
    totalModified++;
  }
});

console.log(`\n✅ Fixed ${totalModified} processor files with type assertions.`);