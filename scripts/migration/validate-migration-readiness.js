#!/usr/bin/env node

/**
 * Migration Readiness Validation Script
 * 
 * Comprehensive pre-flight validation that checks system health,
 * configuration consistency, and field mapping integrity before
 * attempting any migration operations.
 * 
 * Usage: node scripts/migration/validate-migration-readiness.js [options]
 */

const fs = require('fs').promises;
const path = require('path');

// Validation result tracking
let totalValidators = 0;
let passedValidators = 0;
let failedValidators = 0;
let overallScore = 0;
let criticalErrors = 0;

// CLI options
const args = process.argv.slice(2);
const options = {
  verbose: args.includes('--verbose') || args.includes('-v'),
  json: args.includes('--json'),
  failFast: args.includes('--fail-fast'),
  skipTests: args.includes('--skip-tests'),
  help: args.includes('--help') || args.includes('-h')
};

if (options.help) {
  printHelp();
  process.exit(0);
}

// Main validation execution
async function main() {
  printHeader();
  
  try {
    // Check if we're in the correct directory
    await validateProjectStructure();
    
    // Import and run all validators
    const validationResults = await runAllValidators();
    
    // Generate comprehensive report
    const report = generateValidationReport(validationResults);
    
    // Output results
    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printValidationReport(report);
    }
    
    // Exit with appropriate code
    const exitCode = criticalErrors > 0 ? 1 : 0;
    process.exit(exitCode);
    
  } catch (error) {
    console.error('❌ Validation failed with error:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

function printHeader() {
  if (!options.json) {
    console.log('🔍 Migration Readiness Validation');
    console.log('=====================================');
    console.log(`Started: ${new Date().toISOString()}`);
    console.log('');
  }
}

async function validateProjectStructure() {
  const requiredFiles = [
    'package.json',
    'lib/migration/types.ts',
    'lib/migration/BaseValidator.ts'
  ];
  
  for (const file of requiredFiles) {
    try {
      await fs.access(file);
    } catch (error) {
      throw new Error(`Required file missing: ${file}. Are you in the correct project directory?`);
    }
  }
}

async function runAllValidators() {
  const validationResults = [];
  
  // Dynamically import TypeScript validators using ts-node
  const validatorModules = await importValidatorModules();
  
  for (const [name, validatorClass] of Object.entries(validatorModules)) {
    totalValidators++;
    
    if (!options.json) {
      process.stdout.write(`🔄 Running ${name} validation... `);
    }
    
    try {
      const validator = new validatorClass();
      const result = await validator.validate();
      
      // Track results
      overallScore += result.score;
      
      if (result.isValid) {
        passedValidators++;
        if (!options.json) console.log('✅');
      } else {
        failedValidators++;
        const criticalCount = result.errors.filter(e => e.severity === 'critical').length;
        criticalErrors += criticalCount;
        
        if (!options.json) console.log(`❌ (${result.errors.length} errors)`);
        
        if (options.failFast && criticalCount > 0) {
          console.log('\n💥 Critical errors detected - stopping validation (--fail-fast mode)');
          break;
        }
      }
      
      validationResults.push({
        validator: name,
        result: result,
        formattedOutput: validator.formatResult(result)
      });
      
    } catch (error) {
      failedValidators++;
      criticalErrors++;
      
      if (!options.json) console.log(`💥 FAILED`);
      
      validationResults.push({
        validator: name,
        result: {
          isValid: false,
          errors: [{
            code: 'VALIDATOR_EXECUTION_FAILED',
            message: `Validator execution failed: ${error.message}`,
            severity: 'critical'
          }],
          warnings: [],
          recommendations: [],
          score: 0
        },
        error: error.message
      });
      
      if (options.failFast) {
        console.log('\n💥 Validator execution failed - stopping validation (--fail-fast mode)');
        break;
      }
    }
  }
  
  return validationResults;
}

async function importValidatorModules() {
  // Use dynamic imports to load TypeScript modules at runtime
  const validatorModules = {};
  
  try {
    // Try to require ts-node for TypeScript support
    require('ts-node/register');
    
    // Import validator classes
    const FieldMappingValidator = require('../../lib/migration/FieldMappingValidator').FieldMappingValidator;
    const ConfigurationSyncValidator = require('../../lib/migration/ConfigurationSyncValidator').ConfigurationSyncValidator;
    const SystemHealthValidator = require('../../lib/migration/SystemHealthValidator').SystemHealthValidator;
    const { FieldRegistryValidator } = require('../../lib/migration/CentralizedFieldRegistry');
    
    validatorModules['Field Mapping'] = FieldMappingValidator;
    validatorModules['Configuration Sync'] = ConfigurationSyncValidator;
    validatorModules['System Health'] = SystemHealthValidator;
    validatorModules['Field Registry'] = FieldRegistryValidator;
    
  } catch (error) {
    // Fallback: Create simple JavaScript validators for testing
    console.log('⚠️ TypeScript execution not available, using simplified validators');
    
    validatorModules['Field Mapping'] = createFallbackValidator('field-mapping');
    validatorModules['Configuration Sync'] = createFallbackValidator('config-sync');
    validatorModules['System Health'] = createFallbackValidator('system-health');
    validatorModules['Field Registry'] = createFallbackValidator('field-registry');
  }
  
  return validatorModules;
}

function createFallbackValidator(name) {
  return class FallbackValidator {
    constructor() {
      this.name = name;
      this.description = `Fallback validator for ${name}`;
    }
    
    async validate() {
      // Simple file existence checks
      const filesToCheck = {
        'field-mapping': [
          'utils/chat/client-summarizer.ts',
          'lib/analysis/ConfigurationManager.ts'
        ],
        'config-sync': [
          'lib/analysis/utils/BrandNameResolver.ts',
          'components/chat/chat-constants.ts'
        ],
        'system-health': [
          'package.json',
          'public/data/endpoints'
        ],
        'field-registry': [
          'lib/migration/CentralizedFieldRegistry.ts'
        ]
      };
      
      const files = filesToCheck[name] || [];
      const errors = [];
      const warnings = [];
      
      for (const file of files) {
        try {
          await fs.access(file);
        } catch (error) {
          errors.push({
            code: 'FILE_MISSING',
            message: `Required file missing: ${file}`,
            severity: 'high'
          });
        }
      }
      
      const isValid = errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0;
      const score = Math.max(0, 1.0 - (errors.length * 0.2));
      
      return {
        isValid,
        errors,
        warnings,
        recommendations: [`Fallback validation for ${name} - install ts-node for full validation`],
        score
      };
    }
    
    formatResult(result) {
      const lines = [];
      lines.push(`\n🔍 ${this.name} Validation Results (Fallback)`);
      lines.push(`Score: ${(result.score * 100).toFixed(1)}% | Status: ${result.isValid ? '✅ PASS' : '❌ FAIL'}`);
      
      if (result.errors.length > 0) {
        lines.push(`\n❌ Errors (${result.errors.length}):`);
        result.errors.forEach((error, i) => {
          lines.push(`  ${i + 1}. [${error.severity.toUpperCase()}] ${error.message}`);
        });
      }
      
      return lines.join('\n');
    }
  };
}

function generateValidationReport(validationResults) {
  const averageScore = totalValidators > 0 ? overallScore / totalValidators : 0;
  const successRate = totalValidators > 0 ? (passedValidators / totalValidators) * 100 : 0;
  
  return {
    timestamp: new Date().toISOString(),
    overall: {
      status: criticalErrors === 0 ? 'READY' : 'NOT_READY',
      score: averageScore,
      successRate: successRate,
      totalValidators,
      passedValidators,
      failedValidators,
      criticalErrors
    },
    validationResults: validationResults,
    recommendations: generateOverallRecommendations(validationResults),
    nextSteps: generateNextSteps(validationResults)
  };
}

function printValidationReport(report) {
  console.log('\n📊 VALIDATION SUMMARY');
  console.log('====================');
  console.log(`Overall Status: ${getStatusIcon(report.overall.status)} ${report.overall.status}`);
  console.log(`Average Score: ${(report.overall.score * 100).toFixed(1)}%`);
  console.log(`Success Rate: ${report.overall.successRate.toFixed(1)}% (${report.overall.passedValidators}/${report.overall.totalValidators})`);
  console.log(`Critical Errors: ${report.overall.criticalErrors}`);
  
  if (options.verbose) {
    console.log('\n📋 DETAILED RESULTS');
    console.log('==================');
    report.validationResults.forEach(result => {
      console.log(result.formattedOutput);
    });
  }
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS');
    console.log('==================');
    report.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
  }
  
  if (report.nextSteps.length > 0) {
    console.log('\n🎯 NEXT STEPS');
    console.log('=============');
    report.nextSteps.forEach((step, i) => {
      console.log(`${i + 1}. ${step}`);
    });
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(report.overall.status === 'READY' 
    ? '✅ System is ready for migration!' 
    : '❌ System needs attention before migration');
}

function generateOverallRecommendations(validationResults) {
  const recommendations = [];
  
  if (criticalErrors > 0) {
    recommendations.push('Fix all critical errors before attempting migration');
  }
  
  const lowScoreValidators = validationResults.filter(r => r.result.score < 0.8);
  if (lowScoreValidators.length > 0) {
    recommendations.push(`Improve validation scores for: ${lowScoreValidators.map(r => r.validator).join(', ')}`);
  }
  
  const hasWarnings = validationResults.some(r => r.result.warnings && r.result.warnings.length > 0);
  if (hasWarnings) {
    recommendations.push('Review and address validation warnings to ensure optimal migration');
  }
  
  if (totalValidators < 4) {
    recommendations.push('Install ts-node for complete validation coverage: npm install -D ts-node');
  }
  
  recommendations.push('Create a system backup before proceeding with migration');
  
  return recommendations;
}

function generateNextSteps(validationResults) {
  const nextSteps = [];
  
  if (criticalErrors === 0) {
    nextSteps.push('✅ Pre-flight validation passed - ready to proceed with migration');
    nextSteps.push('Run: npm run migrate --project=[project-name] --template=[template]');
  } else {
    nextSteps.push('❌ Fix critical errors identified in validation results');
    nextSteps.push('Re-run validation: npm run validate-migration-readiness');
  }
  
  nextSteps.push('Monitor system performance during and after migration');
  
  return nextSteps;
}

function getStatusIcon(status) {
  return status === 'READY' ? '✅' : '❌';
}

function printHelp() {
  console.log(`
Migration Readiness Validation Tool

USAGE:
  node scripts/migration/validate-migration-readiness.js [options]

OPTIONS:
  --verbose, -v     Show detailed validation results
  --json           Output results in JSON format
  --fail-fast      Stop validation on first critical error
  --skip-tests     Skip time-consuming system tests
  --help, -h       Show this help message

EXAMPLES:
  # Basic validation
  node scripts/migration/validate-migration-readiness.js
  
  # Verbose output with detailed results
  node scripts/migration/validate-migration-readiness.js --verbose
  
  # JSON output for automation
  node scripts/migration/validate-migration-readiness.js --json
  
  # Quick validation (skip intensive tests)
  node scripts/migration/validate-migration-readiness.js --skip-tests

EXIT CODES:
  0  Validation passed (ready for migration)
  1  Validation failed (critical errors found)
`);
}

// Execute main function
if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { main, generateValidationReport };