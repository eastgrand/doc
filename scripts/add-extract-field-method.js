const fs = require('fs');
const path = require('path');

/**
 * Add extractFieldValue method to processors that are missing it
 */

const processorsDir = path.join(__dirname, '../lib/analysis/strategies/processors');
const processorFiles = fs.readdirSync(processorsDir)
  .filter(f => f.endsWith('.ts') && !f.includes('test') && f !== 'index.ts');

console.log(`Checking ${processorFiles.length} processor files...`);

processorFiles.forEach(file => {
  const filePath = path.join(processorsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if the file uses extractFieldValue but doesn't define it
  const usesMethod = content.includes('this.extractFieldValue(');
  const definesMethod = content.includes('private extractFieldValue(');
  
  if (usesMethod && !definesMethod) {
    console.log(`Adding extractFieldValue method to ${file}`);
    
    const methodToAdd = `
  /**
   * Extract field value from multiple possible field names
   */
  private extractFieldValue(record: any, fieldNames: string[]): number {
    for (const fieldName of fieldNames) {
      const value = Number(record[fieldName]);
      if (!isNaN(value) && value > 0) {
        return value;
      }
    }
    return 0;
  }
`;

    // Insert before the last closing brace
    content = content.replace(/(\n\s*}\s*)$/, `${methodToAdd}$1`);
    fs.writeFileSync(filePath, content);
    console.log(`✅ Added method to ${file}`);
  } else if (definesMethod) {
    console.log(`✅ ${file} already has the method`);
  } else {
    console.log(`⏭️  ${file} doesn't need the method`);
  }
});

console.log('\n✨ Method addition completed!');