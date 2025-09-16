import { 
  AnalysisContext, 
  ProjectType, 
  FieldMappings, 
  Terminology, 
  ScoreRange,
  ScoreRanges,
  SummaryTemplates,
  ProcessorConfig
} from '../../config/analysis-contexts/base-context';
import { 
  getAnalysisContext, 
  isProjectTypeSupported, 
  getAvailableProjectTypes,
  RETAIL_CONTEXT 
} from '../../config/analysis-contexts';

/**
 * Singleton manager for analysis configuration
 * Provides centralized access to project-specific configurations
 */
export class AnalysisConfigurationManager {
  private static instance: AnalysisConfigurationManager | null = null;
  private currentContext: AnalysisContext;
  private currentProjectType: string;

  private constructor() {
    // Default to retail for backward compatibility
    this.currentProjectType = 'retail';
    this.currentContext = RETAIL_CONTEXT;
    
    console.log('[AnalysisConfigurationManager] Initialized with default project type: retail');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AnalysisConfigurationManager {
    if (!AnalysisConfigurationManager.instance) {
      AnalysisConfigurationManager.instance = new AnalysisConfigurationManager();
    }
    return AnalysisConfigurationManager.instance;
  }

  /**
   * Set the current project type and load its configuration
   */
  public setProjectType(projectType: string): void {
    if (!isProjectTypeSupported(projectType)) {
      console.warn(`[AnalysisConfigurationManager] Unsupported project type: ${projectType}`);
      console.log(`[AnalysisConfigurationManager] Available types: ${getAvailableProjectTypes().join(', ')}`);
      return;
    }

    this.currentProjectType = projectType;
    this.currentContext = getAnalysisContext(projectType);
    
    console.log(`[AnalysisConfigurationManager] Switched to project type: ${projectType}`);
    console.log(`[AnalysisConfigurationManager] Domain: ${this.currentContext.domain}`);
  }

  /**
   * Get the current analysis context
   */
  public getCurrentContext(): AnalysisContext {
    return this.currentContext;
  }

  /**
   * Get the current project type
   */
  public getCurrentProjectType(): string {
    return this.currentProjectType;
  }

  /**
   * Get field mappings for data extraction
   */
  public getFieldMappings(): FieldMappings {
    return this.currentContext.fieldMappings;
  }

  /**
   * Get specific field mapping category
   */
  public getFieldMapping(category: keyof FieldMappings): string[] {
    return this.currentContext.fieldMappings[category] || [];
  }

  /**
   * Get terminology configuration
   */
  public getTerminology(): Terminology {
    return this.currentContext.terminology;
  }

  /**
   * Get score interpretation for a given score
   */
  public getScoreInterpretation(score: number): ScoreRange {
    const ranges = this.currentContext.scoreRanges;
    
    if (score >= ranges.excellent.min) return ranges.excellent;
    if (score >= ranges.good.min) return ranges.good;
    if (score >= ranges.moderate.min) return ranges.moderate;
    return ranges.poor;
  }

  /**
   * Get all score ranges
   */
  public getScoreRanges(): ScoreRanges {
    return this.currentContext.scoreRanges;
  }

  /**
   * Get summary templates
   */
  public getSummaryTemplates(): SummaryTemplates {
    return this.currentContext.summaryTemplates;
  }

  /**
   * Get processor-specific configuration
   */
  public getProcessorConfig(): ProcessorConfig {
    return this.currentContext.processorConfig;
  }

  /**
   * Get configuration for a specific processor
   */
  public getProcessorSpecificConfig<T>(processorType: keyof ProcessorConfig): T | undefined {
    return this.currentContext.processorConfig[processorType] as T;
  }

  /**
   * Extract primary metric from a record using configured field mappings
   */
  public extractPrimaryMetric(record: any): number {
    const primaryFields = this.getFieldMapping('primaryMetric');

    // Try configured primary fields first
    for (const field of primaryFields) {
      if (record[field] !== undefined && record[field] !== null) {
        const value = Number(record[field]);
        if (!isNaN(value)) {
          return value;
        }
      }
    }

    // Conservative fallbacks for common legacy or analysis-specific fields
    // - Accept 'strategic_analysis_score' which appears in some payloads
    // - Accept any field that looks like a value_* numeric field (e.g., value_TOTPOP_CY)
    if (record['strategic_analysis_score'] !== undefined && record['strategic_analysis_score'] !== null) {
      const v = Number(record['strategic_analysis_score']);
      if (!isNaN(v)) return v;
    }

    for (const key of Object.keys(record)) {
      if (/^value_/i.test(key)) {
        const v = Number(record[key]);
        if (!isNaN(v)) return v;
      }
    }

    console.warn('[AnalysisConfigurationManager] No primary metric found in record', {
      availableFields: Object.keys(record),
      expectedFields: primaryFields
    });

    return 0; // Fallback
  }

  /**
   * Extract geographic ID from a record using configured field mappings
   */
  public extractGeographicId(record: any): string {
    const geoFields = this.getFieldMapping('geographicId');
    
    for (const field of geoFields) {
      if (record[field] !== undefined && record[field] !== null) {
        return String(record[field]);
      }
    }
    
    return 'unknown';
  }

  /**
   * Extract descriptive name from a record using configured field mappings
   */
  public extractDescriptiveName(record: any): string {
    const descriptiveFields = this.getFieldMapping('descriptiveFields');
    
    for (const field of descriptiveFields) {
      if (record[field] !== undefined && record[field] !== null) {
        const value = String(record[field]);
        if (value.trim() && !value.toLowerCase().includes('unknown')) {
          return value;
        }
      }
    }
    
    // Fallback to geographic ID
    return this.extractGeographicId(record);
  }

  /**
   * Apply template substitutions to a string
   */
  public applyTemplate(template: string, substitutions: Record<string, any>): string {
    let result = template;
    
    // Apply terminology substitutions
    const terminology = this.getTerminology();
    result = result.replace(/\{metricName\}/g, terminology.metricName);
    result = result.replace(/\{entityType\}/g, terminology.entityType);
    result = result.replace(/\{scoreDescription\}/g, terminology.scoreDescription);
    result = result.replace(/\{comparisonContext\}/g, terminology.comparisonContext);
    
    // Apply custom substitutions
    Object.entries(substitutions).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, String(value));
    });
    
    return result;
  }

  /**
   * Reset to default configuration
   */
  public reset(): void {
    this.setProjectType('retail');
  }

  /**
   * Get debug information about current configuration
   */
  public getDebugInfo(): any {
    return {
      projectType: this.currentProjectType,
      domain: this.currentContext.domain,
      terminology: this.currentContext.terminology,
      primaryMetricFields: this.getFieldMapping('primaryMetric'),
      availableProcessors: Object.keys(this.currentContext.processorConfig),
      scoreRangeCount: Object.keys(this.currentContext.scoreRanges).length
    };
  }
}