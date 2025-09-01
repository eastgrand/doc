const fs = require('fs');
const path = require('path');

/**
 * Script to replace hardcoded field definitions with dynamic field detection
 * across all analysis processors
 */

const processorsDir = path.join(__dirname, '../lib/analysis/strategies/processors');
const processorFiles = fs.readdirSync(processorsDir)
  .filter(f => f.endsWith('.ts') && f !== 'DynamicFieldDetector.ts' && f !== 'index.ts')
  .filter(f => !f.includes('StrategicAnalysisProcessor')); // Already updated

console.log(`Processing ${processorFiles.length} processor files...`);

processorFiles.forEach(file => {
  const filePath = path.join(processorsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Ensure processors reference the canonical HardcodedFieldDefs helper
  if (!content.includes('HardcodedFieldDefs')) {
    content = content.replace(
      /import.*from.*types.*;/,
      `$&\nimport { getTopFieldDefinitions } from './HardcodedFieldDefs';`
    );
    modified = true;
  }

  // Replace hardcoded fieldDefinitions arrays
  const fieldDefinitionsRegex = /const fieldDefinitions = \[([\s\S]*?)\];/g;
  if (fieldDefinitionsRegex.test(content)) {
    // Get analysis type from filename
    const analysisType = file
      .replace('Processor.ts', '')
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .substring(1);

    content = content.replace(fieldDefinitionsRegex, (match) => {
      modified = true;
      return `// Use canonical top field definitions for ${analysisType}
    const fieldDefinitions = getTopFieldDefinitions('${analysisType}');
    console.log(\`[${file.replace('.ts', '')}] Using hardcoded top field definitions\`);`;
    });
  }

  // Replace common hardcoded field access patterns
  const replacements = [
    // Total population
    [
      /\(record as any\)\.total_population \|\| \(record as any\)\.value_TOTPOP_CY/g,
      "this.extractFieldValue(record, ['total_population', 'value_TOTPOP_CY', 'TOTPOP_CY', 'population'])"
    ],
    // Median income
    [
      /\(record as any\)\.median_income \|\| \(record as any\)\.value_AVGHINC_CY/g,
      "this.extractFieldValue(record, ['median_income', 'value_AVGHINC_CY', 'AVGHINC_CY', 'household_income'])"
    ]
  ];

  replacements.forEach(([pattern, replacement]) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  // Add extractFieldValue helper method if it doesn't exist
  if (!content.includes('extractFieldValue') && modified) {
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
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${file}`);
  } else {
    console.log(`⏭️  Skipped ${file} (no changes needed)`);
  }
});

console.log('\n✨ Hardcoded field removal completed!');