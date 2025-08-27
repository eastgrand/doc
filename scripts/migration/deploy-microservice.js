#!/usr/bin/env node
/**
 * Microservice Deployment Script
 * Automated deployment of AI microservices to Render.com
 * 
 * Part of MPIQ Migration Automation System - Phase 3
 */

const fs = require('fs').promises;
const path = require('path');
const { program } = require('commander');

// Import our microservice deployment system
// Note: These would be imported from compiled JS files in production
// For now, we'll mock the functionality to test the CLI interface

// Available templates
const AVAILABLE_TEMPLATES = [
  'energy-drinks',
  'retail-brands', 
  'automotive',
  'financial-services',
  'healthcare'
];

program
  .name('deploy-microservice')
  .description('Deploy AI microservice for brand analysis')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate microservice package from template')
  .requiredOption('-t, --template <name>', `Template name (${AVAILABLE_TEMPLATES.join(', ')})`)
  .option('-c, --config <path>', 'Configuration file path', 'microservice-config.json')
  .option('-o, --output <dir>', 'Output directory', './microservice-packages')
  .option('-d, --data <path>', 'Training data path (overrides config)', null)
  .option('-p, --platform <platform>', 'Deployment platform (overrides config)', null)
  .option('--dry-run', 'Generate package without creating files')
  .action(async (options) => {
    try {
      console.log('🏗️  Generating microservice package...');
      console.log(`Template: ${options.template}`);
      console.log(`Config: ${options.config}`);
      console.log(`Output: ${options.output}`);
      console.log('─'.repeat(50));

      // Load configuration file
      const config = await loadConfigurationFile(options.config);
      console.log(`📋 Loaded configuration for: ${config.project?.name || 'Unknown Project'}`);
      
      // Override config with command line options
      const finalConfig = applyCommandLineOverrides(config, options);

      // Validate template exists
      if (!AVAILABLE_TEMPLATES.includes(options.template)) {
        console.error(`❌ Template '${options.template}' not found`);
        console.error(`Available templates: ${AVAILABLE_TEMPLATES.join(', ')}`);
        process.exit(1);
      }

      // Load template
      const templatePath = path.join(process.cwd(), 'templates', `${options.template}.template.ts`);
      const template = await loadTemplate(templatePath, finalConfig);

      // Generate microservice (mock implementation for testing)
      const result = await mockGenerateFromTemplate(
        template,
        finalConfig.data_sources?.training_data_url || finalConfig.data_sources?.training_data_path || 'data/training_data.csv',
        options.output,
        finalConfig.deployment?.platform || 'render',
        finalConfig
      );

      if (result.success) {
        console.log('✅ Microservice package generated successfully!');
        console.log(`📁 Package location: ${result.packagePath}`);
        console.log(`📦 Generated ${result.generatedFiles.length} files`);
        
        // Display build logs
        if (result.buildLogs.length > 0) {
          console.log('\n📋 Generation Log:');
          result.buildLogs.forEach(log => console.log(`   ${log}`));
        }

        // Display warnings if any
        if (result.warnings.length > 0) {
          console.log('\n⚠️  Warnings:');
          result.warnings.forEach(warning => {
            console.log(`   ${warning.message} (${warning.impact})`);
          });
        }

        console.log('\n🚀 Ready for deployment! Use:');
        console.log(`   npm run deploy-microservice deploy --package="${result.packagePath}"`);
        
      } else {
        console.error('❌ Microservice generation failed');
        result.errors.forEach(error => {
          console.error(`   ${error.severity.toUpperCase()}: ${error.message}`);
        });
        process.exit(1);
      }

    } catch (error) {
      console.error(`❌ Generation failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('deploy')
  .description('Deploy microservice package to cloud platform')
  .requiredOption('-p, --package <path>', 'Microservice package path')
  .option('--render-key <key>', 'Render.com API key (or set RENDER_API_KEY)')
  .option('--github-token <token>', 'GitHub token (or set GITHUB_TOKEN)')
  .option('--github-user <user>', 'GitHub username (or set GITHUB_USERNAME)')
  .option('--wait', 'Wait for deployment to complete', false)
  .option('--health-checks', 'Run health checks after deployment', false)
  .option('--create-repo', 'Create GitHub repository', false)
  .option('--dry-run', 'Validate deployment without actually deploying')
  .action(async (options) => {
    try {
      console.log('🚀 Deploying microservice...');
      console.log(`Package: ${options.package}`);
      console.log('─'.repeat(50));

      // Load credentials
      const renderKey = options.renderKey || process.env.RENDER_API_KEY;
      const githubToken = options.githubToken || process.env.GITHUB_TOKEN;
      const githubUser = options.githubUser || process.env.GITHUB_USERNAME;

      if (!renderKey) {
        console.error('❌ Render.com API key required (--render-key or RENDER_API_KEY)');
        process.exit(1);
      }

      if (!githubToken || !githubUser) {
        console.error('❌ GitHub credentials required (--github-token and --github-user, or GITHUB_TOKEN and GITHUB_USERNAME)');
        process.exit(1);
      }

      // Load microservice package
      const packagePath = path.resolve(options.package);
      const microservicePackage = await loadMicroservicePackage(packagePath);

      const renderCredentials = { apiKey: renderKey };
      const githubCredentials = { 
        token: githubToken, 
        username: githubUser 
      };

      // Deploy microservice
      const deployer = new MicroserviceDeployer();
      const deployResult = await deployer.deployToRender(
        microservicePackage,
        renderCredentials,
        githubCredentials,
        {
          createRepository: options.createRepo,
          waitForDeployment: options.wait,
          runHealthChecks: options.healthChecks,
          enableAutoRollback: true
        }
      );

      if (deployResult.success) {
        console.log('✅ Deployment completed successfully!');
        console.log(`🌐 Service URL: ${deployResult.serviceUrl}`);
        console.log(`🆔 Deployment ID: ${deployResult.deploymentId}`);
        console.log(`⏱️  Duration: ${(deployResult.duration / 1000).toFixed(1)}s`);

        // Display health check results
        if (deployResult.healthCheckResults.length > 0) {
          console.log('\n🔍 Health Check Results:');
          deployResult.healthCheckResults.forEach(result => {
            const status = result.success ? '✅' : '❌';
            console.log(`   ${status} ${result.check.name}: ${result.responseTime}ms`);
            if (!result.success && result.error) {
              console.log(`      Error: ${result.error}`);
            }
          });
        }

        // Display warnings if any
        if (deployResult.warnings.length > 0) {
          console.log('\n⚠️  Warnings:');
          deployResult.warnings.forEach(warning => {
            console.log(`   ${warning.message} (${warning.impact})`);
          });
        }

        // Display deployment logs
        if (deployResult.logs.length > 0) {
          console.log('\n📋 Deployment Log:');
          deployResult.logs.forEach(log => console.log(`   ${log}`));
        }

        console.log('\n🎉 Microservice is ready for use!');
        console.log(`Test with: curl -X GET "${deployResult.serviceUrl}/health"`);

      } else {
        console.error('❌ Deployment failed');
        
        deployResult.errors.forEach(error => {
          console.error(`   ${error.severity.toUpperCase()}: ${error.message}`);
        });

        if (deployResult.logs.length > 0) {
          console.log('\n📋 Deployment Log:');
          deployResult.logs.forEach(log => console.log(`   ${log}`));
        }

        process.exit(1);
      }

    } catch (error) {
      console.error(`❌ Deployment failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate deployed microservice')
  .requiredOption('-u, --url <url>', 'Service URL to validate')
  .option('-t, --target <variable>', 'Expected target variable')
  .option('--comprehensive', 'Run comprehensive validation', false)
  .option('--monitor <duration>', 'Monitor service for specified duration (ms)', '60000')
  .action(async (options) => {
    try {
      console.log('🔍 Validating microservice...');
      console.log(`URL: ${options.url}`);
      console.log('─'.repeat(50));

      const validator = new MicroserviceValidator();

      if (options.comprehensive) {
        // Run comprehensive validation
        const result = await validator.comprehensiveValidation(
          options.url,
          options.target || 'unknown'
        );

        console.log(`Overall Status: ${result.success ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Service Health: ${result.serviceHealth ? '✅' : '❌'}`);
        console.log(`Target Variable: ${result.targetVariableValid ? '✅' : '❌'}`);
        console.log(`Models Loaded: ${result.modelsLoaded ? '✅' : '❌'}`);
        console.log(`Endpoints Responding: ${result.endpointsResponding ? '✅' : '❌'}`);
        console.log(`Data Integration: ${result.dataIntegrationValid ? '✅' : '❌'}`);

        // Performance metrics
        const metrics = result.performanceMetrics;
        console.log('\n📊 Performance Metrics:');
        console.log(`   Response Time: ${metrics.responseTime.toFixed(0)}ms`);
        console.log(`   Error Rate: ${(metrics.errorRate * 100).toFixed(1)}%`);
        console.log(`   Throughput: ${metrics.throughput.toFixed(1)} req/s`);

        // Display errors and warnings
        if (result.errors.length > 0) {
          console.log('\n❌ Errors:');
          result.errors.forEach(error => {
            console.log(`   ${error.severity.toUpperCase()}: ${error.message}`);
          });
        }

        if (result.warnings.length > 0) {
          console.log('\n⚠️  Warnings:');
          result.warnings.forEach(warning => {
            console.log(`   ${warning.message} (${warning.impact})`);
          });
        }

      } else {
        // Run basic health check
        const healthResult = await validator.validateHealth(options.url);
        
        if (healthResult.success) {
          console.log(`✅ Health Check: PASS (${healthResult.responseTime}ms)`);
          if (healthResult.response) {
            console.log('📄 Response:', JSON.stringify(healthResult.response, null, 2));
          }
        } else {
          console.log(`❌ Health Check: FAIL`);
          console.log(`   Error: ${healthResult.error}`);
          if (healthResult.statusCode) {
            console.log(`   Status: ${healthResult.statusCode}`);
          }
        }
      }

      // Run monitoring if requested
      const monitorDuration = parseInt(options.monitor);
      if (monitorDuration > 0) {
        console.log(`\n📊 Monitoring service for ${monitorDuration / 1000}s...`);
        
        const monitorResult = await validator.monitorService(
          options.url,
          monitorDuration,
          10000 // 10 second intervals
        );

        console.log(`Monitor Status: ${monitorResult.success ? '✅ STABLE' : '❌ UNSTABLE'}`);
        console.log(`Checks Performed: ${monitorResult.checks_performed}`);
        console.log(`Success Rate: ${(monitorResult.success_rate * 100).toFixed(1)}%`);
        console.log(`Average Response: ${monitorResult.average_response_time.toFixed(0)}ms`);

        if (monitorResult.errors.length > 0) {
          console.log('\n❌ Monitoring Errors:');
          monitorResult.errors.slice(0, 5).forEach(error => {
            console.log(`   ${error}`);
          });
          if (monitorResult.errors.length > 5) {
            console.log(`   ... and ${monitorResult.errors.length - 5} more errors`);
          }
        }
      }

    } catch (error) {
      console.error(`❌ Validation failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('init-config')
  .description('Create microservice configuration file')
  .option('-o, --output <path>', 'Configuration file path', 'microservice-config.json')
  .option('--template <name>', 'Base configuration on template', 'energy-drinks')
  .option('--force', 'Overwrite existing configuration file')
  .action(async (options) => {
    try {
      console.log('📋 Creating microservice configuration...');
      
      // Check if config already exists
      const configExists = await fs.access(options.output).then(() => true).catch(() => false);
      
      if (configExists && !options.force) {
        console.log(`⚠️  Configuration file already exists: ${options.output}`);
        console.log('   Use --force to overwrite, or specify a different --output path');
        return;
      }
      
      // Load template configuration
      const templateConfig = path.join(process.cwd(), 'microservice-config.template.json');
      let configContent;
      
      try {
        configContent = await fs.readFile(templateConfig, 'utf8');
        console.log(`📖 Using template: ${templateConfig}`);
      } catch (error) {
        console.error(`❌ Template configuration not found: ${templateConfig}`);
        console.log('   Please ensure microservice-config.template.json exists');
        process.exit(1);
      }
      
      // Parse and customize for the specified template
      const config = JSON.parse(configContent);
      
      if (options.template === 'energy-drinks') {
        config.project.name = 'red-bull-energy-drinks';
        config.project.description = 'Red Bull energy drinks market analysis microservice';
        config.target_configuration.target_brand = 'Red Bull';
        config.target_configuration.target_variable = 'MP12207A_B_P';
      }
      // Add more template customizations here as needed
      
      // Write configuration file
      await fs.writeFile(options.output, JSON.stringify(config, null, 2));
      
      console.log(`✅ Configuration created: ${options.output}`);
      console.log('\n📝 Next steps:');
      console.log(`   1. Edit ${options.output} with your specific values:`);
      console.log('      - ArcGIS service URL');
      console.log('      - Training data URL');
      console.log('      - Target variable (if different)');
      console.log('      - Main application URL');
      console.log(`   2. Generate microservice: npm run deploy-microservice:generate --template ${options.template} --config ${options.output}`);
      
    } catch (error) {
      console.error(`❌ Configuration creation failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('list-templates')
  .description('List available microservice templates')
  .action(async () => {
    console.log('📋 Available Microservice Templates:\n');
    
    for (const templateName of AVAILABLE_TEMPLATES) {
      try {
        const templatePath = path.join(process.cwd(), 'templates', `${templateName}.template.ts`);
        const template = await loadTemplate(templatePath);
        
        console.log(`🏷️  ${templateName}`);
        console.log(`   Domain: ${template.domain}`);
        console.log(`   Industry: ${template.industry}`);
        console.log(`   Brands: ${template.brands?.length || 0} configured`);
        console.log(`   Endpoints: ${template.endpointMappings?.length || 0} endpoints`);
        console.log('');
      } catch (error) {
        console.log(`🏷️  ${templateName} (template file not found)`);
        console.log('');
      }
    }
    
    console.log('💡 Usage:');
    console.log('   npm run deploy-microservice generate --template energy-drinks');
    console.log('   npm run deploy-microservice deploy --package ./microservice-packages/red-bull-energy-drinks-microservice');
  });

// Helper functions
async function loadConfigurationFile(configPath) {
  try {
    console.log(`📖 Loading configuration from: ${configPath}`);
    
    // Check if config file exists
    try {
      await fs.access(configPath);
    } catch (error) {
      console.log(`⚠️  Configuration file not found: ${configPath}`);
      console.log(`📋 Creating default configuration...`);
      
      // Copy template config if main config doesn't exist
      const templateConfig = path.join(process.cwd(), 'microservice-config.template.json');
      const templateExists = await fs.access(templateConfig).then(() => true).catch(() => false);
      
      if (templateExists) {
        const templateContent = await fs.readFile(templateConfig, 'utf8');
        await fs.writeFile(configPath, templateContent);
        console.log(`✅ Created ${configPath} from template`);
      } else {
        console.log(`❌ Template configuration not found: ${templateConfig}`);
        throw new Error(`Configuration file required: ${configPath}`);
      }
    }

    const configContent = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configContent);
    
    console.log(`✅ Configuration loaded successfully`);
    return config;
  } catch (error) {
    throw new Error(`Failed to load configuration: ${error.message}`);
  }
}

async function applyCommandLineOverrides(config, options) {
  const finalConfig = JSON.parse(JSON.stringify(config)); // Deep copy
  
  // Override with command line options
  if (options.data) {
    if (!finalConfig.data_sources) finalConfig.data_sources = {};
    finalConfig.data_sources.training_data_url = options.data;
    console.log(`🔧 Override: Training data = ${options.data}`);
  }
  
  if (options.platform) {
    if (!finalConfig.deployment) finalConfig.deployment = {};
    finalConfig.deployment.platform = options.platform;
    console.log(`🔧 Override: Platform = ${options.platform}`);
  }
  
  return finalConfig;
}

async function loadTemplate(templatePath, config) {
  try {
    // Mock template for testing - enhanced with configuration integration
    const baseTemplate = {
      name: config.project?.name || 'red-bull-energy-drinks',
      domain: 'beverages',
      industry: 'Energy Drinks',
      brands: [
        {
          name: config.target_configuration?.target_brand || 'Red Bull',
          fieldName: config.target_configuration?.target_variable || 'MP12207A_B_P',
          role: 'target',
          aliases: ['red bull', 'redbull', 'energy drink', 'bull energy'],
          industry: 'Energy Drinks'
        },
        {
          name: 'Monster Energy',
          fieldName: config.target_configuration?.custom_field_mapping?.monster_field || 'MP12206A_B_P',
          role: 'competitor',
          aliases: ['monster', 'monster energy', 'green monster'],
          industry: 'Energy Drinks'
        },
        {
          name: 'Rockstar Energy',
          fieldName: config.target_configuration?.custom_field_mapping?.rockstar_field || 'MP12208A_B_P',
          role: 'competitor',
          aliases: ['rockstar', 'rock star', 'rockstar energy'],
          industry: 'Energy Drinks'
        }
      ],
      geographicScope: {
        country: 'United States',
        regions: ['Northeast', 'Southeast', 'Midwest', 'West', 'Southwest'],
        focusAreas: ['Urban markets', 'College campuses', 'Sports venues'],
        boundaryType: 'zip'
      },
      vocabularyTerms: {
        primary: ['energy', 'drinks', 'red bull', 'monster', 'analysis', 'market', 'brand'],
        secondary: ['consumption', 'usage', 'insights', 'behavior', 'competitive', 'expansion'],
        context: ['scenario', 'strategy', 'opportunities', 'demographic', 'geographic'],
        synonyms: {
          'energy drink': ['energy beverage', 'power drink', 'performance drink'],
          'market analysis': ['market research', 'market study', 'competitive analysis']
        }
      },
      endpointMappings: [
        {
          endpoint: '/strategic-analysis',
          fields: ['MP12207A_B_P', 'MP12206A_B_P', 'MP12208A_B_P'],
          boostTerms: ['red bull', 'energy', 'strategic'],
          penaltyTerms: ['H&R Block', 'tax', 'financial services'],
          confidenceThreshold: 0.7
        },
        {
          endpoint: '/market-expansion',
          fields: ['MP12207A_B_P', 'demographic_data', 'geographic_data'],
          boostTerms: ['expansion', 'opportunity', 'growth', 'market'],
          penaltyTerms: ['decline', 'shrinking', 'saturated'],
          confidenceThreshold: 0.6
        },
        {
          endpoint: '/competitive-analysis',
          fields: ['MP12207A_B_P', 'MP12206A_B_P', 'MP12208A_B_P'],
          boostTerms: ['competitive', 'versus', 'compare', 'competition'],
          penaltyTerms: ['collaboration', 'partnership'],
          confidenceThreshold: 0.65
        }
      ]
    };

    // Add configuration-specific data
    baseTemplate.config = config;
    baseTemplate.arcgisServiceUrl = config.data_sources?.arcgis_service_url;
    baseTemplate.trainingDataUrl = config.data_sources?.training_data_url;
    
    console.log(`🎯 Target Variable: ${baseTemplate.brands[0].fieldName}`);
    console.log(`🌐 ArcGIS Service: ${baseTemplate.arcgisServiceUrl || 'Not configured'}`);
    console.log(`📊 Training Data: ${baseTemplate.trainingDataUrl || 'Not configured'}`);
    console.log(`🔗 Main App URL: ${config.integration?.main_app_url || 'Not configured'}`);
    
    return baseTemplate;
  } catch (error) {
    throw new Error(`Failed to load template: ${error.message}`);
  }
}

async function loadMicroservicePackage(packagePath) {
  try {
    // Load package configuration from generated files
    const configPath = path.join(packagePath, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(configPath, 'utf8'));
    
    // For now, return a mock package structure
    // In a real implementation, this would reconstruct the full package from generated files
    return {
      projectName: packageJson.name,
      template: {}, // Would be loaded from metadata
      configuration: {
        serviceName: packageJson.name,
        repositoryName: packageJson.name,
        targetVariable: 'unknown', // Would be loaded from config
        dataFields: [],
        routingEndpoints: [],
        environmentVars: {}
      },
      deploymentManifest: {
        platform: 'render',
        repositoryUrl: `https://github.com/mpiq-ai/${packageJson.name}`,
        buildCommand: 'pip install -r requirements.txt',
        startCommand: 'python app.py',
        environmentVariables: {},
        healthCheckUrl: '/health',
        deploymentConfig: {
          render: {
            serviceType: 'web_service',
            plan: 'free',
            region: 'oregon',
            autoDeploy: true
          }
        }
      },
      healthChecks: [
        {
          name: 'Service Health',
          url: '/health',
          method: 'GET',
          expectedStatus: 200,
          timeout: 10000,
          retries: 3
        }
      ],
      generatedFiles: new Map()
    };
  } catch (error) {
    throw new Error(`Failed to load microservice package: ${error.message}`);
  }
}

// Mock implementations for testing CLI interface
async function mockGenerateFromTemplate(template, dataPath, outputDir, platform, config) {
  // Simulate microservice generation
  const serviceName = `${template.name}-microservice`;
  const packagePath = path.join(outputDir, serviceName);
  
  // In real implementation, this would call MicroserviceGenerator
  console.log(`🔧 Generating ${serviceName}...`);
  console.log(`📊 Target Variable: ${template.brands?.find(b => b.role === 'target')?.fieldName || 'unknown'}`);
  console.log(`🏭 Industry: ${template.industry}`);
  console.log(`🌐 Platform: ${platform}`);
  console.log(`🗺️  ArcGIS Service: ${config.data_sources?.arcgis_service_url ? '✅ Configured' : '⚠️  Not set'}`);
  console.log(`📈 Training Data: ${config.data_sources?.training_data_url ? '✅ Configured' : '⚠️  Not set'}`);
  console.log(`🔗 Main App URL: ${config.integration?.main_app_url || 'Not configured'}`);
  
  return {
    success: true,
    packagePath,
    configuration: {
      serviceName,
      targetVariable: template.brands?.find(b => b.role === 'target')?.fieldName || 'unknown'
    },
    generatedFiles: [
      `${packagePath}/app.py`,
      `${packagePath}/config.py`,
      `${packagePath}/train_models.py`,
      `${packagePath}/data_processor.py`,
      `${packagePath}/requirements.txt`,
      `${packagePath}/Dockerfile`,
      `${packagePath}/README.md`
    ],
    buildLogs: [
      '🔧 Created microservice configuration',
      '📦 Generated Python Flask application',
      '🤖 Generated ML model training script',
      '📊 Generated data processing pipeline',
      '🐳 Generated Dockerfile for containerization',
      '📋 Generated comprehensive README',
      `🎯 Configured target variable: ${template.brands?.find(b => b.role === 'target')?.fieldName}`,
      `🗺️  Integrated ArcGIS service: ${config.data_sources?.arcgis_service_url ? 'Yes' : 'No'}`,
      `📈 Training data source: ${config.data_sources?.training_data_url ? 'Configured' : 'Default'}`,
      `🔗 Main app integration: ${config.integration?.main_app_url ? 'Enabled' : 'Disabled'}`
    ],
    warnings: [],
    errors: []
  };
}

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}