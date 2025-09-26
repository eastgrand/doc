#!/usr/bin/env ts-node

/**
 * Run Claude-Flow Acceleration for Doors Documentary
 * Expected to reduce development time by 75% (from 13 weeks to 6-7 weeks)
 */

import { DoorsDocumentaryAccelerationWorkflow } from './workflows/doors-documentary-acceleration';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║          CLAUDE-FLOW DEVELOPMENT ACCELERATION SYSTEM          ║');
  console.log('║                  Doors Documentary Project                     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log();
  console.log('🎯 Target: 75% development time reduction');
  console.log('📊 Traditional approach: 7-11 weeks (280-440 hours)');
  console.log('⚡ Claude-Flow approach: 4-8 hours');
  console.log();
  console.log('═══════════════════════════════════════════════════════════════');
  
  const workflow = new DoorsDocumentaryAccelerationWorkflow();
  
  try {
    // Execute the acceleration workflow
    const result = await workflow.execute();
    
    if (result.success) {
      console.log();
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('✅ ACCELERATION WORKFLOW COMPLETED SUCCESSFULLY');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log();
      console.log('📈 Performance Metrics:');
      console.log(`  • Total time: ${result.metrics.actualTimeHours.toFixed(2)} hours`);
      console.log(`  • Time saved: ${result.metrics.timeSavingsPercent.toFixed(1)}%`);
      console.log(`  • Components created: ${result.metrics.componentsCreated}`);
      console.log(`  • Lines of code generated: ~${result.metrics.linesOfCodeGenerated.toLocaleString()}`);
      console.log();
      console.log('📦 Generated Artifacts:');
      result.phases?.forEach(phase => {
        console.log(`  ${phase.phase}:`);
        phase.artifacts.forEach(artifact => {
          console.log(`    ✓ ${artifact}`);
        });
      });
      
      // Save results to file
      const resultsPath = path.join(__dirname, 'acceleration-results.json');
      fs.writeFileSync(resultsPath, JSON.stringify(result, null, 2));
      console.log();
      console.log(`💾 Results saved to: ${resultsPath}`);
      
    } else {
      console.error('❌ Workflow failed:', result.message);
      if (result.error) {
        console.error('Error details:', result.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
  
  console.log();
  console.log('═══════════════════════════════════════════════════════════════');
  console.log();
  console.log('🎬 Next Steps:');
  console.log('1. Review generated processors in lib/analysis/strategies/processors/');
  console.log('2. Test federated layer service with: npm run test:federated');
  console.log('3. Run SHAP scoring pipeline: npm run generate:scores');
  console.log('4. Deploy to staging: npm run deploy:staging');
  console.log();
  console.log('📚 Documentation:');
  console.log('  • Implementation guide: docs/CLAUDE-FLOW_IMPLEMENTATION_PROGRESS.md');
  console.log('  • API documentation: docs/API_DOCUMENTATION.md');
  console.log('  • Testing guide: docs/TESTING_GUIDE.md');
  console.log();
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});