import { RawAnalysisResult, ProcessedAnalysisData, DataProcessorStrategy } from './types';
import { ConfigurationManager } from './ConfigurationManager';
import { CityAnalysisUtils, CityAnalysisResult } from './CityAnalysisUtils';

// Import specialized processors
import { CoreAnalysisProcessor } from './strategies/processors/CoreAnalysisProcessor';
import { ClusterDataProcessor } from './strategies/processors/ClusterDataProcessor';
import { CompetitiveDataProcessor } from './strategies/processors/CompetitiveDataProcessor';
import { DemographicDataProcessor } from './strategies/processors/DemographicDataProcessor';
import { CorrelationAnalysisProcessor } from './strategies/processors/CorrelationAnalysisProcessor';
import { TrendAnalysisProcessor } from './strategies/processors/TrendAnalysisProcessor';
import { AnomalyDetectionProcessor } from './strategies/processors/AnomalyDetectionProcessor';
import { FeatureInteractionProcessor } from './strategies/processors/FeatureInteractionProcessor';
import { OutlierDetectionProcessor } from './strategies/processors/OutlierDetectionProcessor';
import { ComparativeAnalysisProcessor } from './strategies/processors/ComparativeAnalysisProcessor';
import { PredictiveModelingProcessor } from './strategies/processors/PredictiveModelingProcessor';
import { SegmentProfilingProcessor } from './strategies/processors/SegmentProfilingProcessor';
import { ScenarioAnalysisProcessor } from './strategies/processors/ScenarioAnalysisProcessor';
import { MarketSizingProcessor } from './strategies/processors/MarketSizingProcessor';
import { BrandAnalysisProcessor } from './strategies/processors/BrandAnalysisProcessor';
import { RealEstateAnalysisProcessor } from './strategies/processors/RealEstateAnalysisProcessor';
import { RiskDataProcessor } from './strategies/processors/RiskDataProcessor';
import { StrategicAnalysisProcessor } from './strategies/processors/StrategicAnalysisProcessor';
import { CustomerProfileProcessor } from './strategies/processors/CustomerProfileProcessor';

/**
 * DataProcessor - Standardizes raw microservice data into consistent format
 * 
 * Now uses specialized processor strategies for each endpoint type,
 * providing enhanced data processing capabilities tailored to specific
 * analysis requirements.
 */
export class DataProcessor {
  private configManager: ConfigurationManager;
  private processors: Map<string, DataProcessorStrategy>;

  constructor(configManager: ConfigurationManager) {
    this.configManager = configManager;
    this.processors = new Map();
    this.initializeProcessors();
  }

  /**
   * Process raw results with city analysis support
   */
  processResultsWithCityAnalysis(rawResults: RawAnalysisResult, endpoint: string, query: string = ''): ProcessedAnalysisData & { cityAnalysis?: CityAnalysisResult } {
    const processedData = this.processResults(rawResults, endpoint);
    
    // Perform city analysis if query contains city references
    if (query) {
      const cityAnalysis = CityAnalysisUtils.analyzeQuery(query, processedData.records, processedData.targetVariable);
      
      if (cityAnalysis.isCityQuery) {
        console.log(`[DataProcessor] City analysis detected:`, {
          cities: cityAnalysis.detectedCities,
          isComparison: cityAnalysis.isComparison,
          filteredRecords: cityAnalysis.filteredData.length
        });
        
        // Update processed data with city-filtered results if applicable
        if (cityAnalysis.filteredData.length > 0 && cityAnalysis.filteredData.length < processedData.records.length) {
          processedData.records = cityAnalysis.filteredData;
          console.log(`[DataProcessor] Filtered data to ${cityAnalysis.filteredData.length} city-specific records`);
        }
        
        return { ...processedData, cityAnalysis };
      }
    }
    
    return processedData;
  }

  /**
   * Process raw results into standardized format using endpoint-specific processors
   */
  processResults(rawResults: RawAnalysisResult, endpoint: string): ProcessedAnalysisData {
    console.log(`🚨🚨🚨 [DataProcessor] processResults called with endpoint: "${endpoint}" 🚨🚨🚨`);
    
    try {
      // Get the appropriate processor for this endpoint
      const processor = this.getProcessorForEndpoint(endpoint);
      
      console.log(`🔥🔥🔥 [DataProcessor] Processing ${endpoint} with processor: ${processor.constructor.name} 🔥🔥🔥`);
      console.log(`🔥 [DataProcessor] Raw data has ${rawResults.results?.length || 0} records`);
      
      // CRITICAL DEBUG: Show first record to confirm data structure
      if (rawResults.results && rawResults.results.length > 0) {
        const firstRecord = rawResults.results[0];
        console.log(`🔥 [DataProcessor] First record sample:`, {
          area_id: firstRecord.area_id,
          has_nike_share: firstRecord.value_MP30034A_B_P !== undefined,
          nike_share_value: firstRecord.value_MP30034A_B_P,
          has_adidas_share: firstRecord.value_MP30029A_B_P !== undefined,
          recordKeys: Object.keys(firstRecord).slice(0, 10)
        });
      }
      
      // FORCE competitive analysis to always use CompetitiveDataProcessor
      if (endpoint === '/competitive-analysis') {
        console.log(`🔥🔥🔥 [DataProcessor] COMPETITIVE ANALYSIS ENDPOINT DETECTED 🔥🔥🔥`);
      }
      
      // Validate raw data first
      const validationResult = processor.validate(rawResults);
      console.log(`🔥 [DataProcessor] Validation result for ${processor.constructor.name}: ${validationResult}`);
      
      if (!validationResult) {
        console.error(`🚨🚨🚨 [DataProcessor] VALIDATION FAILED for ${endpoint} using ${processor.constructor.name} 🚨🚨🚨`);
        throw new Error(`Data validation failed for ${endpoint}. The ${processor.constructor.name} processor could not validate the data structure. This endpoint requires specific data fields.`);
      }

      // Process the data with specialized processor
      const processedData = processor.process(rawResults);
      
      // Override targetVariable with ConfigurationManager setting
      const scoreConfig = this.configManager.getScoreConfig(endpoint);
      if (scoreConfig) {
        processedData.targetVariable = scoreConfig.targetVariable;
        console.log(`🚨🚨🚨 [DataProcessor] Set targetVariable from ConfigurationManager: ${scoreConfig.targetVariable} 🚨🚨🚨`);
      }
      
      console.log(`[DataProcessor] Successfully processed ${processedData.records.length} records using ${endpoint} processor`);
      console.log(`🔥 [DataProcessor] First processed record value:`, processedData.records[0]?.value);
      console.log(`🔥 [DataProcessor] First processed record properties:`, processedData.records[0]?.properties);
      
      return processedData;
      
    } catch (error) {
      console.error(`[DataProcessor] Error processing ${endpoint}:`, error);
      
      // No fallback - throw explicit error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to process ${endpoint} data: ${errorMessage}`);
    }
  }

  /**
   * Get available processor types
   */
  getAvailableProcessors(): string[] {
    return Array.from(this.processors.keys());
  }

  /**
   * Validate if a processor exists for an endpoint
   */
  hasProcessorForEndpoint(endpoint: string): boolean {
    return this.processors.has(endpoint) || this.processors.has('default');
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private initializeProcessors(): void {
    // Register specialized processors for specific endpoints
    this.processors.set('/analyze', new CoreAnalysisProcessor());
    this.processors.set('/spatial-clusters', new ClusterDataProcessor());
    this.processors.set('/competitive-analysis', new CompetitiveDataProcessor());
    this.processors.set('/demographic-insights', new DemographicDataProcessor());
    this.processors.set('/trend-analysis', new TrendAnalysisProcessor());
    this.processors.set('/anomaly-detection', new AnomalyDetectionProcessor());
    this.processors.set('/risk-analysis', new RiskDataProcessor());
    
    // Register the same processors for related endpoints
    this.processors.set('/correlation-analysis', new CorrelationAnalysisProcessor());
    this.processors.set('/threshold-analysis', new CoreAnalysisProcessor());
    this.processors.set('/feature-interactions', new FeatureInteractionProcessor());
    this.processors.set('/outlier-detection', new OutlierDetectionProcessor());
    this.processors.set('/comparative-analysis', new ComparativeAnalysisProcessor());
    this.processors.set('/predictive-modeling', new PredictiveModelingProcessor());
    this.processors.set('/segment-profiling', new SegmentProfilingProcessor());
    this.processors.set('/scenario-analysis', new ScenarioAnalysisProcessor());
    this.processors.set('/strategic-analysis', new StrategicAnalysisProcessor()); // Use dedicated StrategicAnalysisProcessor
    this.processors.set('/market-sizing', new MarketSizingProcessor());
    this.processors.set('/customer-profile', new CustomerProfileProcessor()); // Customer profile analysis processor
    this.processors.set('/brand-analysis', new BrandAnalysisProcessor());
    this.processors.set('/real-estate-analysis', new RealEstateAnalysisProcessor());
    
    // All 16 endpoints now have dedicated processors!
    // this.processors.set('/penetration-optimization', new OptimizationDataProcessor());
    
    // Default processor for unspecified endpoints
    this.processors.set('default', new CoreAnalysisProcessor());
    
    console.log(`[DataProcessor] Initialized ${this.processors.size} specialized processors`);
  }

  private getProcessorForEndpoint(endpoint: string): DataProcessorStrategy {
    console.log(`🔥 [DataProcessor] getProcessorForEndpoint called with endpoint: "${endpoint}"`);
    console.log(`🔥 [DataProcessor] Available processors:`, Array.from(this.processors.keys()));
    
    // SPECIFIC FIX: Only force CompetitiveDataProcessor for competitive analysis endpoints
    if (endpoint.includes('competitive') || endpoint === '/competitive-analysis') {
      const competitiveProcessor = this.processors.get('/competitive-analysis')!;
      console.log(`🔥 [DataProcessor] FORCING CompetitiveDataProcessor for ${endpoint}`);
      console.log(`🔥 [DataProcessor] Using processor:`, competitiveProcessor.constructor.name);
      return competitiveProcessor;
    }
    
    // Try to get specific processor for endpoint
    if (this.processors.has(endpoint)) {
      const processor = this.processors.get(endpoint)!;
      console.log(`🔥 [DataProcessor] Found specific processor for ${endpoint}:`, processor.constructor.name);
      return processor;
    }
    
    // Fallback to default processor
    console.log(`🔥 [DataProcessor] No specific processor found for ${endpoint}, using default processor`);
    return this.processors.get('default')!;
  }

  private processFallbackData(rawResults: RawAnalysisResult, endpoint: string): ProcessedAnalysisData {
    // Use default processor for fallback processing
    const defaultProcessor = this.processors.get('default')!;
    
    try {
      return defaultProcessor.process(rawResults);
    } catch (error) {
      console.error(`[DataProcessor] Fallback processing also failed for ${endpoint}:`, error);
      return this.createFallbackData(rawResults, endpoint);
    }
  }

  private createFallbackData(rawResults: RawAnalysisResult, endpoint: string): ProcessedAnalysisData {
    // Create minimal valid data structure when all processing fails
    return {
      type: endpoint.replace('/', ''),
      records: [],
      summary: rawResults.summary || 'Analysis completed with limited data processing',
      featureImportance: rawResults.feature_importance || [],
      statistics: {
        total: 0,
        mean: 0,
        median: 0,
        min: 0,
        max: 0,
        stdDev: 0
      },
      targetVariable: rawResults.model_info?.target_variable || 'unknown'
    };
  }
}

/**
 * Default data processor - handles basic data standardization
 * Used as fallback when no specialized processor is available
 */
class DefaultDataProcessor implements DataProcessorStrategy {
  validate(rawData: RawAnalysisResult): boolean {
    return rawData && typeof rawData === 'object' && rawData.success !== undefined;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    if (!rawData.success) {
      throw new Error(rawData.error || 'Analysis failed');
    }

    const records = (rawData.results || []).map((record: any, index: number) => ({
      area_id: record.area_id || record.id || `area_${index}`,
      area_name: record.area_name || record.name || `Area ${index + 1}`,
      value: typeof record.value === 'number' ? record.value : 
             typeof record.score === 'number' ? record.score : 0,
      rank: record.rank || index + 1,
      category: record.category || 'default',
      coordinates: record.coordinates || [0, 0],
      properties: this.extractProperties(record),
      shapValues: record.shap_values || {}
    }));

    // Calculate basic statistics
    const values = records.map(r => r.value).filter(v => !isNaN(v));
    const statistics = this.calculateStatistics(values);

    return {
      type: 'default_analysis',
      records,
      summary: rawData.summary || `Processed ${records.length} records using default processor`,
      featureImportance: rawData.feature_importance || [],
      statistics,
      targetVariable: rawData.model_info?.target_variable || 'value'
    };
  }

  private extractProperties(record: any): Record<string, any> {
    const internalFields = new Set([
      'area_id', 'id', 'area_name', 'name', 'value', 'score', 
      'coordinates', 'shap_values', 'rank', 'category'
    ]);
    
    const properties: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(record)) {
      if (!internalFields.has(key)) {
        properties[key] = value;
      }
    }
    
    return properties;
  }

  private calculateStatistics(values: number[]) {
    if (values.length === 0) {
      return {
        total: 0,
        mean: 0,
        median: 0,
        min: 0,
        max: 0,
        stdDev: 0
      };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const total = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / total;
    
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / total;
    const stdDev = Math.sqrt(variance);
    
    const median = total % 2 === 0 
      ? (sorted[total / 2 - 1] + sorted[total / 2]) / 2
      : sorted[Math.floor(total / 2)];

    return {
      total,
      mean,
      median,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      stdDev
    };
  }
} 