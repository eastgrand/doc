// Demo script to show the enhanced debug report in action
// Run this in your browser console to see the output

// Simulate the GeospatialDebugReporter class
class GeospatialDebugReporter {
  constructor(query, selectedTarget, selectedPersona) {
    this.report = {
      query,
      startTime: Date.now(),
      selectedTarget,
      selectedPersona,
      steps: {
        queryAnalysis: { start: 0, end: 0, success: false, data: null },
        microserviceRequest: { start: 0, end: 0, success: false, data: null },
        dataLoading: { start: 0, end: 0, success: false, data: null },
        dataJoining: { start: 0, end: 0, success: false, data: null },
        visualization: { start: 0, end: 0, success: false, data: null },
        narrativeGeneration: { start: 0, end: 0, success: false, data: null }
      },
      results: {
        analysisRecords: 0,
        geographicFeatures: 0,
        matchedFeatures: 0,
        validFeatures: 0,
        visualizationCreated: false,
        narrativeGenerated: false
      },
      errors: [],
      totalTime: 0
    };
  }

  startStep(stepName) {
    this.report.steps[stepName].start = Date.now();
  }

  endStep(stepName, success, data) {
    this.report.steps[stepName].end = Date.now();
    this.report.steps[stepName].success = success;
    this.report.steps[stepName].data = data;
  }

  setResult(key, value) {
    this.report.results[key] = value;
  }

  addError(error) {
    this.report.errors.push(error);
  }

  identifyBottlenecks() {
    const bottlenecks = [];
    const stepTimes = Object.entries(this.report.steps).map(([name, step]) => ({
      name,
      time: step.end - step.start,
      success: step.success
    }));

    const avgTime = stepTimes.reduce((sum, step) => sum + step.time, 0) / stepTimes.length;
    
    stepTimes.forEach(step => {
      if (step.time > avgTime * 2) {
        bottlenecks.push(`${step.name} (${step.time}ms - ${Math.round(step.time/avgTime)}x avg)`);
      }
    });

    return bottlenecks;
  }

  printReport() {
    this.report.totalTime = Date.now() - this.report.startTime;
    
    const formatTime = (ms) => ms > 0 ? `${ms}ms` : '0ms';
    const formatStep = (step) => `${step.success ? '✅' : '❌'} ${formatTime(step.end - step.start)}`;
    
    const bottlenecks = this.identifyBottlenecks();
    const successRate = Object.values(this.report.steps).filter(step => step.success).length / 6 * 100;
    
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                          🧪 GEOSPATIAL QUERY DEBUG REPORT                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ QUERY: ${this.report.query.substring(0, 120)}${this.report.query.length > 120 ? '...' : ''}
║ TARGET: ${this.report.selectedTarget} | PERSONA: ${this.report.selectedPersona} | TOTAL TIME: ${Math.round(this.report.totalTime/1000)}s | SUCCESS: ${Math.round(successRate)}%
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ STEP BREAKDOWN:
║ ├─ Query Analysis:        ${formatStep(this.report.steps.queryAnalysis)}
║ ├─ Microservice Request:  ${formatStep(this.report.steps.microserviceRequest)}
║ ├─ Data Loading:          ${formatStep(this.report.steps.dataLoading)}
║ ├─ Data Joining:          ${formatStep(this.report.steps.dataJoining)}
║ ├─ Visualization:         ${formatStep(this.report.steps.visualization)}
║ └─ Narrative Generation:  ${formatStep(this.report.steps.narrativeGeneration)}
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ DATA FLOW:
║ ├─ Analysis Records:      ${this.report.results.analysisRecords} (from microservice)
║ ├─ Geographic Features:   ${this.report.results.geographicFeatures} (from ArcGIS)
║ ├─ Matched Features:      ${this.report.results.matchedFeatures} (joined successfully)
║ ├─ Valid Features:        ${this.report.results.validFeatures} (passed geometry validation)
║ ├─ Visualization:         ${this.report.results.visualizationCreated ? '✅ Created' : '❌ Failed'}
║ └─ Narrative:             ${this.report.results.narrativeGenerated ? '✅ Generated' : '❌ Failed'}
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ PERFORMANCE INSIGHTS:
${bottlenecks.length > 0 ? 
  bottlenecks.map(bottleneck => `║ 🐌 BOTTLENECK: ${bottleneck}`).join('\n') :
  '║ ✅ No significant performance bottlenecks detected'
}
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ ERRORS: ${this.report.errors.length === 0 ? 'None' : ''}
${this.report.errors.map(error => `║ ❌ ${error.substring(0, 140)}`).join('\n')}
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
    `);

    window.lastGeospatialDebugReport = this.report;
    console.log('💾 Full debug report exported to window.lastGeospatialDebugReport');
  }
}

// Demo function to simulate a query processing scenario
function demoSuccessfulQuery() {
  console.log('🚀 Running SUCCESSFUL query demo...\n');
  
  const debugReporter = new GeospatialDebugReporter(
    'Show me the top 10 areas with highest Nike athletic shoe purchases',
    'MP30034A_B',
    'strategist'
  );

  // Simulate query analysis
  debugReporter.startStep('queryAnalysis');
  setTimeout(() => {
    debugReporter.endStep('queryAnalysis', true, { queryType: 'ranking', targetVariable: 'MP30034A_B' });
    
    // Simulate microservice request (slow)
    debugReporter.startStep('microserviceRequest');
    setTimeout(() => {
      debugReporter.endStep('microserviceRequest', true, { resultsCount: 10 });
      debugReporter.setResult('analysisRecords', 10);
      
      // Simulate data loading
      debugReporter.startStep('dataLoading');
      setTimeout(() => {
        debugReporter.endStep('dataLoading', true, { featuresLoaded: 41356 });
        debugReporter.setResult('geographicFeatures', 41356);
        
        // Simulate data joining
        debugReporter.startStep('dataJoining');
        setTimeout(() => {
          debugReporter.endStep('dataJoining', true, { joined: 41366, valid: 41366 });
          debugReporter.setResult('matchedFeatures', 41366);
          debugReporter.setResult('validFeatures', 41366);
          
          // Simulate visualization
          debugReporter.startStep('visualization');
          setTimeout(() => {
            debugReporter.endStep('visualization', true, { layerCreated: true });
            debugReporter.setResult('visualizationCreated', true);
            
            // Simulate narrative generation (slow)
            debugReporter.startStep('narrativeGeneration');
            setTimeout(() => {
              debugReporter.endStep('narrativeGeneration', true, { narrativeGenerated: true });
              debugReporter.setResult('narrativeGenerated', true);
              
              // Print final report
              debugReporter.printReport();
            }, 2341);
          }, 789);
        }, 456);
      }, 1205);
    }, 8943);
  }, 234);
}

function demoFailedQuery() {
  console.log('💥 Running FAILED query demo...\n');
  
  const debugReporter = new GeospatialDebugReporter(
    'Show me something that will fail',
    'INVALID_TARGET',
    'strategist'
  );

  // Simulate query analysis failure
  debugReporter.startStep('queryAnalysis');
  setTimeout(() => {
    debugReporter.endStep('queryAnalysis', false, { error: 'Unknown query type' });
    debugReporter.addError('Query analysis failed - unknown query type');
    
    // Simulate microservice failure
    debugReporter.startStep('microserviceRequest');
    setTimeout(() => {
      debugReporter.endStep('microserviceRequest', false, { error: 'API failed' });
      debugReporter.addError('Microservice failed: 500 Internal Server Error');
      
      // Skip remaining steps due to failure
      debugReporter.printReport();
    }, 1000);
  }, 500);
}

// Export to global scope for easy testing
window.demoSuccessfulQuery = demoSuccessfulQuery;
window.demoFailedQuery = demoFailedQuery;

console.log('🧪 Debug Report Demo Loaded!');
console.log('Run demoSuccessfulQuery() to see a successful query report');
console.log('Run demoFailedQuery() to see a failed query report');
