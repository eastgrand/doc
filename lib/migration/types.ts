// Migration Types & Interfaces
// Core types for the migration automation system

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  recommendations: string[];
  score: number; // 0-1, where 1 is perfect
}

export interface ValidationError {
  code: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  file?: string;
  line?: number;
  suggestion?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  impact: string;
  recommendation?: string;
}

export interface FieldDefinition {
  fieldName: string;
  endpoint: string;
  dataType: 'score' | 'demographic' | 'geographic' | 'competitive';
  required: boolean;
  description: string;
  aliases?: string[];
}

export interface BrandDefinition {
  name: string;
  fieldName: string;
  role: 'target' | 'competitor' | 'market_category';
  aliases: string[];
  industry?: string;
}

export interface ProjectTemplate {
  name: string;
  domain: string;
  industry: string;
  brands: BrandDefinition[];
  geographicScope: GeographicScope;
  vocabularyTerms: DomainVocabulary;
  endpointMappings: EndpointMapping[];
}

export interface GeographicScope {
  country: string;
  regions: string[];
  focusAreas: string[];
  boundaryType: 'zip' | 'county' | 'state' | 'custom';
}

export interface DomainVocabulary {
  primary: string[];
  secondary: string[];
  context: string[];
  synonyms: Record<string, string[]>;
}

export interface EndpointMapping {
  endpoint: string;
  fields: string[];
  boostTerms: string[];
  penaltyTerms: string[];
  confidenceThreshold: number;
}

export interface ConfigurationFile {
  path: string;
  type: 'typescript' | 'javascript' | 'json';
  purpose: string;
  dependencies: string[];
}

export interface SystemSnapshot {
  id: string;
  timestamp: Date;
  configurations: Map<string, ConfigurationBackup>;
  systemHealth: SystemHealthCheck;
  description: string;
}

export interface ConfigurationBackup {
  filePath: string;
  content: string;
  checksum: string;
  lastModified: Date;
}

export interface SystemHealthCheck {
  routingAccuracy: number;
  endpointHealth: boolean;
  dataIntegrity: boolean;
  performanceMetrics: PerformanceMetrics;
  timestamp: Date;
}

export interface PerformanceMetrics {
  averageRoutingTime: number;
  queriesPerSecond: number;
  memoryUsage: number;
  errorRate: number;
}

export interface MigrationOptions {
  projectName: string;
  template: string;
  dataSourceUrl?: string;
  dryRun: boolean;
  skipTests: boolean;
  force: boolean;
  deployMicroservice: boolean;
  createSnapshot: boolean;
}

export interface MigrationResult {
  success: boolean;
  duration: number;
  stepsCompleted: number;
  stepsTotal: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  snapshotId?: string;
  microserviceUrl?: string;
  summary: string;
}

// Base class for all validation steps
export abstract class BaseValidator {
  abstract name: string;
  abstract description: string;
  
  abstract validate(context?: any): Promise<ValidationResult>;
  
  protected createError(code: string, message: string, severity: ValidationError['severity'], file?: string): ValidationError {
    return { code, message, severity, file };
  }
  
  protected createWarning(code: string, message: string, impact: string): ValidationWarning {
    return { code, message, impact };
  }
}

// Base class for migration steps
export abstract class BaseMigrationStep {
  abstract name: string;
  abstract description: string;
  abstract requiredInputs: string[];
  
  abstract execute(options: MigrationOptions, previousResults: StepResult[]): Promise<StepResult>;
  
  protected getRequiredInput(key: string, previousResults: StepResult[]): any {
    const result = previousResults.find(r => r.outputs.has(key));
    if (!result) {
      throw new Error(`Required input '${key}' not found in previous step results`);
    }
    return result.outputs.get(key);
  }
}

export interface StepResult {
  stepName: string;
  success: boolean;
  duration: number;
  outputs: Map<string, any>;
  error?: Error;
  validationResult?: ValidationResult;
}

export class MigrationError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'MigrationError';
  }
}