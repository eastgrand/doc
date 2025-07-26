#!/usr/bin/env node

/**
 * Automated Deployment Testing Script
 * Validates all generated configuration files before deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeploymentTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async runAllTests() {
    console.log('🧪 Starting comprehensive deployment testing...\n');

    // Phase 1: Static Validation
    await this.testTypeScriptCompilation();
    await this.testPythonSyntax();
    await this.testJSONValidation();

    // Phase 2: Import Testing
    await this.testTypeScriptImports();
    await this.testPythonImports();

    // Phase 3: Configuration Validation
    await this.testConfigurationStructure();
    await this.testFieldMappings();

    // Phase 4: Integration Testing
    await this.testComponentIntegration();

    // Summary
    this.printSummary();
    return this.results.failed === 0;
  }

  async testTypeScriptCompilation() {
    console.log('📝 Testing TypeScript compilation...');
    
    const files = [
      'config/layers.ts',
      'adapters/layerConfigAdapter.ts',
      'utils/field-aliases.ts'
    ];

    for (const file of files) {
      try {
        if (fs.existsSync(file)) {
          execSync(`npx tsc --noEmit ${file}`, { stdio: 'pipe' });
          this.pass(`✅ ${file} compiles successfully`);
        } else {
          this.fail(`❌ ${file} does not exist`);
        }
      } catch (error) {
        this.fail(`❌ ${file} compilation failed: ${error.message}`);
      }
    }
  }

  async testPythonSyntax() {
    console.log('\n🐍 Testing Python syntax...');
    
    const files = [
      '../shap-microservice/map_nesto_data.py',
      '../shap-microservice/query_classifier.py'
    ];

    for (const file of files) {
      try {
        if (fs.existsSync(file)) {
          execSync(`python -m py_compile ${file}`, { stdio: 'pipe' });
          this.pass(`✅ ${file} syntax valid`);
        } else {
          this.fail(`❌ ${file} does not exist`);
        }
      } catch (error) {
        this.fail(`❌ ${file} syntax error: ${error.message}`);
      }
    }
  }

  async testJSONValidation() {
    console.log('\n📄 Testing JSON validation...');
    
    const files = [
      'config/concept-map.json'
    ];

    for (const file of files) {
      try {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          JSON.parse(content);
          this.pass(`✅ ${file} is valid JSON`);
        } else {
          this.fail(`❌ ${file} does not exist`);
        }
      } catch (error) {
        this.fail(`❌ ${file} invalid JSON: ${error.message}`);
      }
    }
  }

  async testTypeScriptImports() {
    console.log('\n📦 Testing TypeScript imports...');
    
    // Create temporary test file
    const testFile = 'temp-import-test.js';
    const testCode = `
      try {
        const layers = require('./config/layers');
        const adapter = require('./adapters/layerConfigAdapter');
        const aliases = require('./utils/field-aliases');
        
        console.log('Layers loaded:', Object.keys(layers.layers || {}).length);
        console.log('Field aliases loaded:', Object.keys(aliases.FIELD_ALIASES || {}).length);
        
        process.exit(0);
      } catch (error) {
        console.error('Import failed:', error.message);
        process.exit(1);
      }
    `;

    try {
      fs.writeFileSync(testFile, testCode);
      execSync(`node ${testFile}`, { stdio: 'pipe' });
      this.pass('✅ TypeScript imports successful');
    } catch (error) {
      this.fail(`❌ TypeScript imports failed: ${error.message}`);
    } finally {
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
  }

  async testPythonImports() {
    console.log('\n🐍 Testing Python imports...');
    
    // Create temporary test file
    const testFile = '../shap-microservice/temp_import_test.py';
    const testCode = `
import sys
import os
sys.path.append(os.path.dirname(__file__))

try:
    from map_nesto_data import CORE_FIELD_MAPPINGS
    print(f"Field mappings loaded: {len(CORE_FIELD_MAPPINGS)}")
    
    # Test query classifier import (if it exists)
    try:
        from query_classifier import QueryClassifier
        print("Query classifier imported successfully")
    except ImportError as e:
        print(f"Query classifier import note: {e}")
    
    print("Python imports successful")
except Exception as e:
    print(f"Import failed: {e}")
    sys.exit(1)
    `;

    try {
      fs.writeFileSync(testFile, testCode);
      execSync(`cd ../shap-microservice && python temp_import_test.py`, { stdio: 'pipe' });
      this.pass('✅ Python imports successful');
    } catch (error) {
      this.fail(`❌ Python imports failed: ${error.message}`);
    } finally {
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
  }

  async testConfigurationStructure() {
    console.log('\n⚙️ Testing configuration structure...');
    
    try {
      // Test layer configuration structure
      if (fs.existsSync('config/layers.ts')) {
        const content = fs.readFileSync('config/layers.ts', 'utf8');
        
        // Check for required exports
        const hasLayers = content.includes('export const layers');
        const hasBaseConfigs = content.includes('export const baseLayerConfigs');
        const hasProjectConfig = content.includes('export const projectLayerConfig');
        
        if (hasLayers && hasBaseConfigs && hasProjectConfig) {
          this.pass('✅ Layer configuration structure valid');
        } else {
          this.fail('❌ Layer configuration missing required exports');
        }
      } else {
        this.fail('❌ Layer configuration file not found');
      }
    } catch (error) {
      this.fail(`❌ Configuration structure test failed: ${error.message}`);
    }
  }

  async testFieldMappings() {
    console.log('\n🏷️ Testing field mappings...');
    
    try {
      if (fs.existsSync('utils/field-aliases.ts')) {
        const content = fs.readFileSync('utils/field-aliases.ts', 'utf8');
        
        // Check for required exports
        const hasFieldAliases = content.includes('FIELD_ALIASES');
        const hasExport = content.includes('export');
        
        if (hasFieldAliases && hasExport) {
          this.pass('✅ Field aliases structure valid');
        } else {
          this.fail('❌ Field aliases missing required exports');
        }
      } else {
        this.fail('❌ Field aliases file not found');
      }
    } catch (error) {
      this.fail(`❌ Field mappings test failed: ${error.message}`);
    }
  }

  async testComponentIntegration() {
    console.log('\n🔗 Testing component integration...');
    
    // This would test actual component integration
    // For now, we'll do basic structural checks
    
    const criticalFiles = [
      'config/layers.ts',
      'adapters/layerConfigAdapter.ts',
      'utils/field-aliases.ts',
      'config/concept-map.json'
    ];

    let allFilesExist = true;
    for (const file of criticalFiles) {
      if (!fs.existsSync(file)) {
        this.fail(`❌ Critical file missing: ${file}`);
        allFilesExist = false;
      }
    }

    if (allFilesExist) {
      this.pass('✅ All critical files present for integration');
    }
  }

  pass(message) {
    console.log(message);
    this.results.passed++;
  }

  fail(message) {
    console.log(message);
    this.results.failed++;
    this.results.errors.push(message);
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 DEPLOYMENT TESTING SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Tests Passed: ${this.results.passed}`);
    console.log(`❌ Tests Failed: ${this.results.failed}`);
    
    if (this.results.failed > 0) {
      console.log('\n🚨 FAILURES:');
      this.results.errors.forEach(error => console.log(`  ${error}`));
      console.log('\n❌ DEPLOYMENT NOT RECOMMENDED - Fix issues first');
    } else {
      console.log('\n🎉 ALL TESTS PASSED - DEPLOYMENT READY!');
    }
    
    console.log('='.repeat(60));
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new DeploymentTester();
  tester.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = DeploymentTester; 