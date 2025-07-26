/**
 * Fix literal \n characters in processor files
 */

const fs = require('fs');
const path = require('path');

const processorDir = '/Users/voldeck/code/mpiq-ai-chat/lib/analysis/strategies/processors/';
const files = fs.readdirSync(processorDir).filter(f => f.endsWith('.ts'));

console.log('🔧 Fixing literal \\n characters in processor files...');

files.forEach(file => {
  const filePath = path.join(processorDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Count literal \n occurrences
  const beforeCount = (content.match(/\\n/g) || []).length;
  
  if (beforeCount > 0) {
    // Replace literal \n with actual newlines, but be careful about context
    // Only replace \n that appear in template literals
    content = content.replace(/`([^`]*?)\\n([^`]*?)`/g, (match, before, after) => {
      return `\`${before}\n${after}\``;
    });
    
    // Also handle cases where \n appears at the end of lines in template strings
    content = content.replace(/\\n(\s*summary \+= )/g, '\n$1');
    content = content.replace(/(\`[^`]*?)\\n(\s*\`)/g, '$1\n$2');
    
    const afterCount = (content.match(/\\n/g) || []).length;
    
    if (beforeCount !== afterCount) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed ${file}: ${beforeCount - afterCount} \\n characters replaced`);
    } else {
      console.log(`⚠️  ${file}: ${beforeCount} \\n characters found but not replaced (may need manual fix)`);
    }
  } else {
    console.log(`✅ ${file}: No issues found`);
  }
});

console.log('🏁 Newline fix complete!');