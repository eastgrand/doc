#!/usr/bin/env node

import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color output for better visibility
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkFile(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readComponent(componentPath) {
  try {
    const content = await fs.readFile(componentPath, 'utf-8');
    return content;
  } catch (error) {
    return null;
  }
}

async function analyzeComponent(name, path) {
  log(`\n=== Testing ${name} ===`, 'cyan');
  
  const exists = await checkFile(path);
  if (!exists) {
    log(`  ❌ Component file not found`, 'red');
    return false;
  }
  
  log(`  ✅ Component file exists`, 'green');
  
  const content = await readComponent(path);
  if (!content) {
    log(`  ❌ Could not read component`, 'red');
    return false;
  }
  
  // Check for common issues
  const issues = [];
  
  // Check if feature flag is properly imported
  if (!content.includes('isPhase4FeatureEnabled')) {
    issues.push('Missing feature flag import');
  }
  
  // Check if component returns null when disabled
  if (!content.includes('if (!isEnabled)') && !content.includes('if (!enabled)')) {
    issues.push('Missing feature flag check');
  }
  
  // Check for proper prop types
  if (!content.includes('analysisContext')) {
    issues.push('Missing analysisContext prop');
  }
  
  // Check for error boundaries
  if (!content.includes('try') && !content.includes('catch')) {
    issues.push('No error handling found');
  }
  
  // Check for loading states
  if (!content.includes('isLoading') && !content.includes('loading')) {
    issues.push('No loading state management');
  }
  
  // Report issues
  if (issues.length > 0) {
    log(`  ⚠️  Issues found:`, 'yellow');
    issues.forEach(issue => log(`    - ${issue}`, 'yellow'));
  } else {
    log(`  ✅ Component structure looks good`, 'green');
  }
  
  // Check imports
  const importIssues = [];
  
  // Check for service imports that might not exist
  const libPath = path.join(__dirname, 'lib/integrations');
  if (content.includes('scholarly-research-service')) {
    const servicePath = path.join(libPath, 'scholarly-research-service.ts');
    if (!await checkFile(servicePath)) {
      importIssues.push('scholarly-research-service might not exist');
    }
  }
  
  if (content.includes('real-time-data-service')) {
    const servicePath = path.join(libPath, 'real-time-data-service.ts');
    if (!await checkFile(servicePath)) {
      importIssues.push('real-time-data-service might not exist');
    }
  }
  
  if (importIssues.length > 0) {
    log(`  ⚠️  Import issues:`, 'yellow');
    importIssues.forEach(issue => log(`    - ${issue}`, 'yellow'));
  }
  
  return issues.length === 0 && importIssues.length === 0;
}

async function testPhase4Integration() {
  log('🚀 Phase 4 Component Testing', 'magenta');
  log('================================', 'magenta');
  
  // Check feature configuration
  log('\n=== Feature Configuration ===', 'cyan');
  const configPath = path.join(__dirname, 'config/phase4-features.ts');
  const configExists = await checkFile(configPath);
  
  if (configExists) {
    log('  ✅ Feature config file exists', 'green');
    const config = await readComponent(configPath);
    
    // Check which features are enabled
    const features = ['scholarlyResearch', 'realTimeDataStreams', 'advancedVisualization', 'aiInsights'];
    features.forEach(feature => {
      const regex = new RegExp(`${feature}:\\s*{[^}]*enabled:\\s*(true|false)`, 's');
      const match = config.match(regex);
      if (match && match[1] === 'true') {
        log(`  ✅ ${feature}: ENABLED`, 'green');
      } else {
        log(`  ❌ ${feature}: DISABLED`, 'red');
      }
    });
  } else {
    log('  ❌ Feature config file not found', 'red');
  }
  
  // Test individual components
  const components = [
    {
      name: 'Phase4IntegrationWrapper',
      path: path.join(__dirname, 'components/phase4/Phase4IntegrationWrapper.tsx')
    },
    {
      name: 'ScholarlyResearchPanel',
      path: path.join(__dirname, 'components/phase4/ScholarlyResearchPanel.tsx')
    },
    {
      name: 'RealTimeDataDashboard',
      path: path.join(__dirname, 'components/phase4/RealTimeDataDashboard.tsx')
    },
    {
      name: 'AIInsightGenerator',
      path: path.join(__dirname, 'components/phase4/AIInsightGenerator.tsx')
    },
    {
      name: 'AdvancedVisualizationSuite',
      path: path.join(__dirname, 'components/phase4/AdvancedVisualizationSuite.tsx')
    }
  ];
  
  let allPassed = true;
  for (const component of components) {
    const passed = await analyzeComponent(component.name, component.path);
    if (!passed) allPassed = false;
  }
  
  // Test integration services
  log('\n=== Integration Services ===', 'cyan');
  const services = [
    {
      name: 'Scholarly Research Service',
      path: path.join(__dirname, 'lib/integrations/scholarly-research-service.ts')
    },
    {
      name: 'Real-Time Data Service',
      path: path.join(__dirname, 'lib/integrations/real-time-data-service.ts')
    }
  ];
  
  for (const service of services) {
    const exists = await checkFile(service.path);
    if (exists) {
      log(`  ✅ ${service.name} exists`, 'green');
      
      // Check for API functions
      const content = await readComponent(service.path);
      if (content) {
        const hasExports = content.includes('export');
        const hasAsyncFunctions = content.includes('async');
        const hasCache = content.includes('cache');
        
        if (hasExports && hasAsyncFunctions) {
          log(`    ✅ Has async functions and exports`, 'green');
        }
        if (hasCache) {
          log(`    ✅ Implements caching`, 'green');
        }
      }
    } else {
      log(`  ❌ ${service.name} not found`, 'red');
      allPassed = false;
    }
  }
  
  // Check UnifiedAnalysisWorkflow integration
  log('\n=== UnifiedAnalysisWorkflow Integration ===', 'cyan');
  const workflowPath = path.join(__dirname, 'components/unified-analysis/UnifiedAnalysisWorkflow.tsx');
  const workflowContent = await readComponent(workflowPath);
  
  if (workflowContent) {
    if (workflowContent.includes('Phase4IntegrationWrapper')) {
      log('  ✅ Phase4IntegrationWrapper imported', 'green');
    } else {
      log('  ❌ Phase4IntegrationWrapper not imported', 'red');
      allPassed = false;
    }
    
    if (workflowContent.includes('isPhase4FeatureEnabled')) {
      log('  ✅ Feature flag check implemented', 'green');
    } else {
      log('  ❌ Feature flag check missing', 'red');
      allPassed = false;
    }
    
    if (workflowContent.includes('TabsTrigger value="advanced"')) {
      log('  ✅ Advanced tab exists', 'green');
    } else {
      log('  ❌ Advanced tab not found', 'red');
      allPassed = false;
    }
  }
  
  // Summary
  log('\n=== Summary ===', 'magenta');
  if (allPassed) {
    log('✅ All Phase 4 components are properly structured', 'green');
  } else {
    log('❌ Some issues found - review the warnings above', 'red');
  }
  
  // Recommendations
  log('\n=== Recommendations ===', 'blue');
  log('1. Ensure all Phase 4 features are enabled in config/phase4-features.ts', 'blue');
  log('2. Test with mock data first before connecting to live APIs', 'blue');
  log('3. Check browser console for runtime errors', 'blue');
  log('4. Verify analysisContext is properly passed from UnifiedAnalysisWorkflow', 'blue');
}

// Run the test
testPhase4Integration().catch(console.error);