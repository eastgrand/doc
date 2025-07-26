interface DebugStep {
  start: number;
  end: number;
  success: boolean;
  data: any;
}

interface DebugResults {
  analysisRecords: number;
  geographicFeatures: number;
  matchedFeatures: number;
  validFeatures: number;
  visualizationCreated: boolean;
  narrativeGenerated: boolean;
}

export interface GeospatialDebugReport {
  query: string;
  startTime: number;
  selectedTarget: string;
  selectedPersona: string;
  steps: {
    queryAnalysis: DebugStep;
    microserviceRequest: DebugStep;
    dataLoading: DebugStep;
    dataJoining: DebugStep;
    visualization: DebugStep;
    narrativeGeneration: DebugStep;
  };
  results: DebugResults;
  errors: string[];
  totalTime: number;
}

export class GeospatialDebugReporter {
  private report: GeospatialDebugReport;

  constructor(query: string, selectedTarget: string, selectedPersona: string) {
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

  startStep(stepName: keyof GeospatialDebugReport['steps']) {
    this.report.steps[stepName].start = Date.now();
  }

  endStep(stepName: keyof GeospatialDebugReport['steps'], success: boolean, data?: any) {
    this.report.steps[stepName].end = Date.now();
    this.report.steps[stepName].success = success;
    this.report.steps[stepName].data = data;
  }

  setResult(key: keyof DebugResults, value: number | boolean) {
    (this.report.results as any)[key] = value;
  }

  addError(error: string) {
    this.report.errors.push(error);
  }

  // Helper method to track data flow between steps
  trackDataFlow(stepName: string, inputCount: number, outputCount: number, details?: any) {
    console.log(`📊 [${stepName}] Data Flow: ${inputCount} → ${outputCount}`, details);
  }

  // Helper method to track performance bottlenecks
  identifyBottlenecks(): string[] {
    const bottlenecks: string[] = [];
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
    
    const formatTime = (ms: number) => ms > 0 ? `${ms}ms` : '0ms';
    const formatStep = (step: DebugStep) => `${step.success ? '✅' : '❌'} ${formatTime(step.end - step.start)}`;
    
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

    // Also export to window for easy access
    (window as any).lastGeospatialDebugReport = this.report;
    console.log('💾 Full debug report exported to window.lastGeospatialDebugReport');
    
    // Additional detailed logs for debugging
    console.groupCollapsed('🔍 Detailed Step Data');
    Object.entries(this.report.steps).forEach(([stepName, stepData]) => {
      if (stepData.data) {
        console.log(`${stepName}:`, stepData.data);
      }
    });
    console.groupEnd();
  }

  getReport(): GeospatialDebugReport {
    return { ...this.report };
  }

  // Static helper method for quick debugging without instantiating the class
  static quickLog(message: string, data?: any) {
    console.log(`🚀 [GeospatialDebug] ${message}`, data || '');
  }
} 