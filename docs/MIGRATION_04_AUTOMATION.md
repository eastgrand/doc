# Migration Automation Scripts

This document outlines automation opportunities and provides scripts to streamline the data migration process.

## Existing Upload Scripts

The system already includes several upload scripts in the `scripts/` directory:

### 1. Individual Endpoint Upload
```bash
# Upload single endpoint
npm run upload-endpoint -- strategic-analysis
```

### 2. Batch Upload Script
**Location**: `scripts/migrate-batch.ts`
```bash
# Upload multiple endpoints at once
npm run migrate-batch
```

### 3. Blob Migration
**Location**: `scripts/migrate-to-blob.ts`
```bash
# Migrate all local files to blob storage
npm run migrate-to-blob
```

## Recommended Automation Improvements

### 1. Field Mapping Validator

Create a script to validate field mappings:

```typescript
// scripts/validate-field-mappings.ts
import { readFileSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateFieldMappings(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    // Check field definitions
    const fieldsPath = join(process.cwd(), 'public/data/microservice-all-fields.json');
    const fieldsData = JSON.parse(readFileSync(fieldsPath, 'utf-8'));
    
    if (!fieldsData.fields || !Array.isArray(fieldsData.fields)) {
      result.errors.push('microservice-all-fields.json missing fields array');
      result.isValid = false;
    }

    // Check endpoint configurations
    // (Add ConfigurationManager validation here)
    
    return result;
  } catch (error) {
    result.errors.push(`Field mapping validation failed: ${error}`);
    result.isValid = false;
    return result;
  }
}
```

### 2. Data Format Validator

```typescript
// scripts/validate-data-format.ts
export function validateEndpointData(endpointName: string, data: any): boolean {
  const requiredFields = ['success', 'results'];
  const requiredRecordFields = ['ID', 'DESCRIPTION'];

  // Check top-level structure
  for (const field of requiredFields) {
    if (!(field in data)) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }

  // Check records structure
  if (!Array.isArray(data.results)) {
    console.error('results must be an array');
    return false;
  }

  // Check first record
  if (data.results.length > 0) {
    const firstRecord = data.results[0];
    for (const field of requiredRecordFields) {
      if (!(field in firstRecord)) {
        console.error(`Missing required record field: ${field}`);
        return false;
      }
    }
  }

  return true;
}
```

### 3. Complete Migration Script

```typescript
// scripts/complete-migration.ts
import { uploadEndpointData } from '../utils/blob-data-loader';
import { validateFieldMappings, validateEndpointData } from './validators';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ENDPOINTS = [
  'strategic-analysis',
  'competitive-analysis',
  'comparative-analysis',
  'demographic-insights',
  'correlation-analysis',
  'trend-analysis',
  'spatial-clusters',
  'anomaly-detection',
  'predictive-modeling',
  'scenario-analysis',
  'segment-profiling',
  'sensitivity-analysis',
  'feature-interactions',
  'feature-importance-ranking',
  'model-performance',
  'outlier-detection',
  'analyze'
];

async function completeMigration() {
  console.log('🚀 Starting complete data migration...');

  // Step 1: Validate field mappings
  console.log('📋 Validating field mappings...');
  const validation = validateFieldMappings();
  if (!validation.isValid) {
    console.error('❌ Field mapping validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    return false;
  }

  // Step 2: Validate and upload endpoint data
  const endpointsDir = join(process.cwd(), 'public/data/endpoints');
  const blobUrls: Record<string, string> = {};

  for (const endpoint of ENDPOINTS) {
    console.log(`📤 Processing ${endpoint}...`);
    
    try {
      // Load and validate data
      const filePath = join(endpointsDir, `${endpoint}.json`);
      const data = JSON.parse(readFileSync(filePath, 'utf-8'));
      
      if (!validateEndpointData(endpoint, data)) {
        console.error(`❌ Data validation failed for ${endpoint}`);
        continue;
      }

      // Upload to blob storage if file is large
      const fileSize = Buffer.byteLength(JSON.stringify(data), 'utf8');
      if (fileSize > 10 * 1024 * 1024) { // > 10MB
        console.log(`📦 Uploading ${endpoint} to blob storage (${Math.round(fileSize/1024/1024)}MB)...`);
        const success = await uploadEndpointData(endpoint, data);
        if (success) {
          console.log(`✅ ${endpoint} uploaded successfully`);
        } else {
          console.error(`❌ Failed to upload ${endpoint}`);
        }
      } else {
        console.log(`📁 ${endpoint} is small enough for local storage`);
      }

    } catch (error) {
      console.error(`❌ Error processing ${endpoint}:`, error);
    }
  }

  // Step 3: Update blob URLs
  console.log('🔗 Updating blob URLs...');
  // (Implementation would update blob-urls.json)

  console.log('✅ Migration complete!');
  return true;
}

// Run migration
if (require.main === module) {
  completeMigration().catch(console.error);
}
```

## Usage Instructions

### For New Projects

1. **Prepare your data**:
   ```bash
   # Place your 17 endpoint JSON files in public/data/endpoints/
   # Update public/data/microservice-all-fields.json
   ```

2. **Run validation**:
   ```bash
   npm run validate-data
   ```

3. **Run migration**:
   ```bash
   npm run complete-migration
   ```

4. **Test the system**:
   ```bash
   npm run dev
   # Test queries in the UI
   ```

### Automated Testing

Create automated tests for data migration:

```typescript
// tests/data-migration.test.ts
describe('Data Migration', () => {
  test('should load all endpoint data', async () => {
    for (const endpoint of ENDPOINTS) {
      const data = await loadEndpointData(endpoint);
      expect(data).toBeDefined();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.results)).toBe(true);
    }
  });

  test('should have required fields', async () => {
    const strategicData = await loadEndpointData('strategic-analysis');
    expect(strategicData.results[0]).toHaveProperty('ID');
    expect(strategicData.results[0]).toHaveProperty('DESCRIPTION');
  });
});
```

## Package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "validate-data": "ts-node scripts/validate-field-mappings.ts",
    "complete-migration": "ts-node scripts/complete-migration.ts",
    "upload-endpoint": "ts-node scripts/upload-single-endpoint.ts",
    "migrate-batch": "ts-node scripts/migrate-batch.ts",
    "test-migration": "jest tests/data-migration.test.ts"
  }
}
```

## Future UI-Based Migration Tool

### Recommended Features

1. **File Upload Interface**:
   - Drag & drop CSV files
   - Automatic field detection
   - Preview data before processing

2. **Field Mapping UI**:
   - Visual field mapping editor
   - Automatic suggestions based on field names
   - Validation with real-time feedback

3. **Progress Tracking**:
   - Upload progress bars
   - Validation status indicators
   - Error reporting with suggestions

4. **Configuration Generator**:
   - Automatic endpoint configuration generation
   - Geographic data detection
   - Score field identification

### Implementation Approach

```typescript
// components/DataMigrationWizard.tsx
export function DataMigrationWizard() {
  const [step, setStep] = useState<'upload' | 'validate' | 'configure' | 'deploy'>('upload');
  
  return (
    <div className="migration-wizard">
      {step === 'upload' && <FileUploadStep />}
      {step === 'validate' && <ValidationStep />}
      {step === 'configure' && <ConfigurationStep />}
      {step === 'deploy' && <DeploymentStep />}
    </div>
  );
}
```

This would provide a user-friendly interface for non-technical users to perform data migrations without touching code files.

---

The automation scripts above can significantly reduce the time and effort required for data migration while ensuring data quality and consistency.