#!/usr/bin/env node

/**
 * Configuration Generation Script
 * 
 * Generate configuration files from project templates with safe deployment
 * and rollback capabilities.
 * 
 * Usage: node scripts/migration/generate-config.js [options]
 */

const fs = require('fs').promises;
const path = require('path');

// CLI options parsing
const args = process.argv.slice(2);
const options = {
  template: getArgValue('--template') || getArgValue('-t'),
  output: getArgValue('--output') || getArgValue('-o') || './generated-config',
  deploy: args.includes('--deploy') || args.includes('-d'),
  dryRun: args.includes('--dry-run') || args.includes('--dry'),
  force: args.includes('--force') || args.includes('-f'),
  list: args.includes('--list') || args.includes('-l'),
  validate: args.includes('--validate') || args.includes('-v'),
  rollback: getArgValue('--rollback') || getArgValue('-r'),
  help: args.includes('--help') || args.includes('-h')
};

function getArgValue(argName) {
  const index = args.indexOf(argName);
  return index !== -1 && index + 1 < args.length ? args[index + 1] : null;
}

if (options.help) {
  printHelp();
  process.exit(0);
}

// Main execution
async function main() {
  try {
    // Handle different commands
    if (options.list) {
      await listTemplates();
    } else if (options.rollback) {
      await rollbackDeployment(options.rollback);
    } else if (options.validate) {
      await validateTemplate(options.template);
    } else if (options.template) {
      await generateConfiguration();
    } else {
      console.error('❌ Error: No template specified. Use --template [name] or --help for usage information.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack && process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

async function listTemplates() {
  console.log('📋 Available Templates:');
  console.log('=====================');
  
  try {
    // Try to list templates using TypeScript (if available)
    await tryListTemplatesFromTS();
  } catch (error) {
    // Fallback: List template files from directory
    await listTemplateFiles();
  }
}

async function tryListTemplatesFromTS() {
  try {
    require('ts-node/register');
    
    const { TemplateEngine } = require('../../lib/migration/TemplateEngine');
    const { EnergyDrinksTemplate } = require('../../templates/energy-drinks.template');
    
    const engine = new TemplateEngine();
    engine.registerTemplate(EnergyDrinksTemplate);
    
    const templates = engine.getTemplates();
    
    if (templates.length === 0) {
      console.log('No templates registered.');
      return;
    }
    
    templates.forEach((template, index) => {
      console.log(`\n${index + 1}. ${template.name}`);
      console.log(`   Industry: ${template.industry}`);
      console.log(`   Domain: ${template.domain}`);
      console.log(`   Brands: ${template.brands.length} (Target: ${template.brands.find(b => b.role === 'target')?.name || 'None'})`);
      console.log(`   Endpoints: ${template.endpointMappings?.length || 0}`);
    });
    
    console.log(`\nTotal: ${templates.length} template(s) available`);
    console.log('\nUsage: node scripts/migration/generate-config.js --template [template-name]');
    
  } catch (error) {
    throw new Error(`Failed to list templates: ${error.message}`);
  }
}

async function listTemplateFiles() {
  try {
    const templateDir = './templates';
    const files = await fs.readdir(templateDir);
    const templateFiles = files.filter(f => f.endsWith('.template.ts') || f.endsWith('.template.js'));
    
    if (templateFiles.length === 0) {
      console.log('No template files found in ./templates directory');
      return;
    }
    
    templateFiles.forEach((file, index) => {
      const name = file.replace(/\.(template\.(ts|js))$/, '');
      console.log(`${index + 1}. ${name} (${file})`);
    });
    
    console.log(`\nTotal: ${templateFiles.length} template file(s) found`);
    console.log('\nNote: Install ts-node for full template information');
    
  } catch (error) {
    console.log('Could not read templates directory');
  }
}

async function validateTemplate(templateName) {
  if (!templateName) {
    console.error('❌ Error: No template specified for validation');
    process.exit(1);
  }

  console.log(`🔍 Validating template: ${templateName}`);
  
  try {
    require('ts-node/register');
    
    const { TemplateEngine, TemplateEngineValidator } = require('../../lib/migration/TemplateEngine');
    const { EnergyDrinksTemplate } = require('../../templates/energy-drinks.template');
    
    const engine = new TemplateEngine();
    engine.registerTemplate(EnergyDrinksTemplate);
    
    const validator = new TemplateEngineValidator();
    const result = await validator.validate(templateName);
    
    console.log(validator.formatResult(result));
    
    if (!result.isValid) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`❌ Template validation failed: ${error.message}`);
    process.exit(1);
  }
}

async function generateConfiguration() {
  const templateName = options.template;
  
  console.log('⚙️ Configuration Generation');
  console.log('==========================');
  console.log(`Template: ${templateName}`);
  console.log(`Output: ${options.output}`);
  console.log(`Deploy: ${options.deploy ? 'Yes' : 'No'}`);
  console.log(`Dry Run: ${options.dryRun ? 'Yes' : 'No'}`);
  console.log('');

  if (options.deploy) {
    await deployConfiguration(templateName);
  } else {
    await generateOnly(templateName);
  }
}

async function generateOnly(templateName) {
  try {
    require('ts-node/register');
    
    const { TemplateEngine } = require('../../lib/migration/TemplateEngine');
    const { EnergyDrinksTemplate } = require('../../templates/energy-drinks.template');
    
    const engine = new TemplateEngine();
    engine.registerTemplate(EnergyDrinksTemplate);
    
    console.log('🔄 Generating configuration files...');
    const result = await engine.generateAllConfigurations(templateName, options.output);
    
    if (result.success) {
      console.log(`\n✅ Configuration generation completed successfully!`);
      console.log(`📁 Output directory: ${result.outputDirectory}`);
      console.log(`📊 Generated ${result.summary.successful}/${result.summary.total} files`);
      
      if (result.results.length > 0) {
        console.log('\n📋 Generated files:');
        result.results.forEach(r => {
          const status = r.success ? '✅' : '❌';
          const size = r.contentLength ? ` (${formatBytes(r.contentLength)})` : '';
          console.log(`  ${status} ${r.generator}: ${r.outputPath}${size}`);
        });
      }
      
      if (result.summary.errors.length > 0) {
        console.log('\n⚠️ Errors:');
        result.summary.errors.forEach(error => {
          console.log(`  • ${error.message}`);
        });
      }
      
      console.log(`\n🚀 To deploy these configurations: --deploy`);
      console.log(`🔍 To validate before deploy: --deploy --dry-run`);
      
    } else {
      console.error('\n❌ Configuration generation failed');
      result.summary.errors.forEach(error => {
        console.error(`  • ${error.message}`);
      });
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`❌ Generation failed: ${error.message}`);
    process.exit(1);
  }
}

async function deployConfiguration(templateName) {
  try {
    require('ts-node/register');
    
    const { SafeConfigurationDeployer } = require('../../lib/migration/SafeConfigurationDeployer');
    const { TemplateEngine } = require('../../lib/migration/TemplateEngine');
    const { EnergyDrinksTemplate } = require('../../templates/energy-drinks.template');
    
    // Register template first
    const engine = new TemplateEngine();
    engine.registerTemplate(EnergyDrinksTemplate);
    
    const deployer = new SafeConfigurationDeployer(engine);
    const deploymentOptions = {
      dryRun: options.dryRun,
      force: options.force
    };
    
    console.log('🚀 Starting safe configuration deployment...');
    const result = await deployer.safeDeployConfiguration(templateName, deploymentOptions);
    
    if (result.success) {
      console.log(`\n✅ ${result.dryRun ? 'Dry run' : 'Deployment'} completed successfully!`);
      console.log(`⏱️ Duration: ${result.duration}ms`);
      
      if (result.backup) {
        console.log(`💾 Backup created: ${result.backup.id}`);
        console.log(`📁 Backup location: ${result.backup.backupPath}`);
      }
      
      if (result.deployedFiles && result.deployedFiles.length > 0) {
        console.log(`\n📦 Deployed files (${result.deployedFiles.length}):`);
        result.deployedFiles.forEach(file => {
          console.log(`  ✅ ${file.targetPath} (${formatBytes(file.size)})`);
        });
      }
      
      if (result.dryRun) {
        console.log('\n🧪 This was a dry run - no files were actually deployed');
        console.log('🚀 Remove --dry-run flag to perform actual deployment');
      } else {
        console.log(`\n🎉 Configuration deployment completed successfully!`);
        console.log(`📋 Summary: ${result.summary}`);
        console.log(`\n💡 If you need to rollback: --rollback ${result.backup?.id || 'backup-id'}`);
      }
      
    } else {
      console.error(`\n❌ ${result.dryRun ? 'Dry run' : 'Deployment'} failed`);
      console.error(`📋 Summary: ${result.summary}`);
      
      if (result.errors && result.errors.length > 0) {
        console.error('\n⚠️ Errors:');
        result.errors.forEach(error => {
          console.error(`  • [${error.severity}] ${error.message}`);
        });
      }
      
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`❌ Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

async function rollbackDeployment(backupId) {
  try {
    require('ts-node/register');
    
    const { SafeConfigurationDeployer } = require('../../lib/migration/SafeConfigurationDeployer');
    
    console.log(`🔄 Rolling back deployment: ${backupId}`);
    
    const deployer = new SafeConfigurationDeployer();
    const result = await deployer.rollbackDeployment(backupId);
    
    if (result.success) {
      console.log(`\n✅ Rollback completed successfully!`);
      console.log(`📋 ${result.summary}`);
      console.log(`📦 Restored ${result.restoredFiles.length} files`);
      
      if (result.restoredFiles.length > 0) {
        console.log('\n📄 Restored files:');
        result.restoredFiles.forEach(file => {
          console.log(`  ✅ ${file}`);
        });
      }
      
    } else {
      console.error(`\n❌ Rollback failed`);
      console.error(`📋 ${result.summary}`);
      
      if (result.errors.length > 0) {
        console.error('\n⚠️ Errors:');
        result.errors.forEach(error => {
          console.error(`  • ${error}`);
        });
      }
      
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`❌ Rollback failed: ${error.message}`);
    process.exit(1);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function printHelp() {
  console.log(`
Configuration Generation Tool

USAGE:
  node scripts/migration/generate-config.js [options]

OPTIONS:
  --template, -t <name>     Template name to use for generation
  --output, -o <dir>        Output directory (default: ./generated-config)
  --deploy, -d              Deploy configurations to target locations
  --dry-run, --dry          Perform dry run (generate and validate without deploying)
  --force, -f               Force deployment even if validation fails
  --list, -l                List available templates
  --validate, -v <name>     Validate a specific template
  --rollback, -r <id>       Rollback to a previous configuration backup
  --help, -h                Show this help message

EXAMPLES:
  # List available templates
  node scripts/migration/generate-config.js --list
  
  # Generate configurations (no deployment)
  node scripts/migration/generate-config.js --template energy-drinks
  
  # Generate and deploy with dry run validation
  node scripts/migration/generate-config.js --template energy-drinks --deploy --dry-run
  
  # Deploy configurations
  node scripts/migration/generate-config.js --template energy-drinks --deploy
  
  # Validate template
  node scripts/migration/generate-config.js --validate energy-drinks
  
  # Rollback deployment
  node scripts/migration/generate-config.js --rollback deploy_123456_abc123

SAFETY FEATURES:
  • Automatic backup before deployment
  • Dry run validation
  • Rollback capability
  • Configuration validation
  • Force override for emergencies

For more information, see the Migration Automation Roadmap documentation.
`);
}

// Execute main function
if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { main, generateConfiguration, deployConfiguration };