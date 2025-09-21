# The Doors Documentary - Adaptive Field Mapping System

> **Purpose**: Automatically inspect and adapt to actual ArcGIS Feature Service fields  
> **Integration**: Works with Federated Layer Architecture and Entertainment Processors  
> **Flexibility**: Adjusts calculations and field mappings based on discovered schema  
> **Fallback**: Graceful degradation when expected fields are missing  

---

## 📋 Executive Summary

### 🎯 **The Challenge**

When the user provides actual ArcGIS Feature Service URLs for IL, IN, WI, the field schema may differ from our anticipated structure:

- **Field Names**: May use different naming conventions (e.g., `TAPESTRY_K1` vs `TAP_K1_PCT` vs `SEGMENT_K1`)
- **Data Types**: Numbers vs strings, different precision levels
- **Missing Fields**: Some expected Tapestry segments or demographic fields may not exist
- **Additional Fields**: Unexpected fields that could be valuable for analysis
- **Different Standards**: Each state may use different field naming conventions

### 🧠 **Intelligent Adaptation Strategy**

Instead of rigid field expectations, we'll build a smart mapping system that:

1. **Inspects** actual service schemas
2. **Maps** discovered fields to our analysis requirements
3. **Adapts** calculations based on available data
4. **Reports** what data is available vs missing
5. **Optimizes** analysis based on data quality

---

## 🔍 Service Schema Discovery System

### **Automated Field Inspection**

#### **FeatureServiceInspector.ts**
```typescript
interface FieldMapping {
  expectedField: string;
  discoveredField: string | null;
  fieldType: 'string' | 'number' | 'date';
  confidence: number; // 0-1 score for mapping accuracy
  sampleValues?: any[];
}

interface ServiceSchema {
  serviceUrl: string;
  state: 'IL' | 'IN' | 'WI';
  layerIndex: number;
  totalFeatures: number;
  fields: FieldMeta[];
  hexagonFields: FieldMapping[];
  tapestryFields: FieldMapping[];
  demographicFields: FieldMapping[];
  geographicFields: FieldMapping[];
  qualityScore: number; // Overall data quality assessment
}

class FeatureServiceInspector {
  async inspectService(serviceUrl: string, state: string): Promise<ServiceSchema> {
    console.log(`[Inspector] Analyzing ${state} service: ${serviceUrl}`);
    
    // 1. Get service metadata
    const serviceInfo = await this.getServiceInfo(serviceUrl);
    
    // 2. Identify hexagon layer (look for H3, hexagon, or geographic features)
    const hexagonLayer = await this.findHexagonLayer(serviceInfo);
    
    if (!hexagonLayer) {
      throw new Error(`No hexagon layer found in ${state} service`);
    }
    
    // 3. Inspect field schema
    const fields = await this.getLayerFields(serviceUrl, hexagonLayer.id);
    
    // 4. Map fields to our expected schema
    const mappings = await this.createFieldMappings(fields);
    
    // 5. Assess data quality with sample queries
    const qualityScore = await this.assessDataQuality(serviceUrl, hexagonLayer.id, mappings);
    
    return {
      serviceUrl,
      state: state as 'IL' | 'IN' | 'WI',
      layerIndex: hexagonLayer.id,
      totalFeatures: hexagonLayer.count,
      fields,
      hexagonFields: mappings.hexagon,
      tapestryFields: mappings.tapestry,
      demographicFields: mappings.demographic,
      geographicFields: mappings.geographic,
      qualityScore
    };
  }
  
  private async createFieldMappings(fields: FieldMeta[]): Promise<FieldMappings> {
    const mappings = {
      hexagon: await this.mapHexagonFields(fields),
      tapestry: await this.mapTapestryFields(fields),
      demographic: await this.mapDemographicFields(fields),
      geographic: await this.mapGeographicFields(fields)
    };
    
    console.log('[Inspector] Field mapping results:', mappings);
    return mappings;
  }
  
  private async mapTapestryFields(fields: FieldMeta[]): Promise<FieldMapping[]> {
    const expectedSegments = ['K1', 'K2', 'I1', 'J1', 'L1'];
    const mappings: FieldMapping[] = [];
    
    for (const segment of expectedSegments) {
      const mapping = this.findBestFieldMatch(fields, [
        `TAPESTRY_${segment}`,
        `TAP_${segment}_PCT`,
        `SEGMENT_${segment}`,
        `${segment}_PCT`,
        `LifeMode_${segment}`,
        segment
      ]);
      
      mappings.push({
        expectedField: `TAPESTRY_${segment}_PCT`,
        discoveredField: mapping?.name || null,
        fieldType: mapping?.type || 'number',
        confidence: mapping?.confidence || 0,
        sampleValues: mapping?.sampleValues
      });
    }
    
    return mappings;
  }
  
  private findBestFieldMatch(fields: FieldMeta[], patterns: string[]): FieldMatch | null {
    let bestMatch: FieldMatch | null = null;
    let highestConfidence = 0;
    
    for (const field of fields) {
      for (const pattern of patterns) {
        const confidence = this.calculateFieldSimilarity(field.name, pattern);
        if (confidence > highestConfidence && confidence > 0.7) {
          bestMatch = {
            name: field.name,
            type: field.type,
            confidence,
            sampleValues: [] // Will be populated by sampling
          };
          highestConfidence = confidence;
        }
      }
    }
    
    return bestMatch;
  }
  
  private calculateFieldSimilarity(fieldName: string, pattern: string): number {
    const field = fieldName.toLowerCase();
    const pat = pattern.toLowerCase();
    
    // Exact match
    if (field === pat) return 1.0;
    
    // Contains pattern
    if (field.includes(pat)) return 0.9;
    if (pat.includes(field)) return 0.8;
    
    // Similar patterns (fuzzy matching)
    const similarity = this.levenshteinSimilarity(field, pat);
    return similarity > 0.6 ? similarity : 0;
  }
  
  private async assessDataQuality(serviceUrl: string, layerIndex: number, mappings: FieldMappings): Promise<number> {
    // Sample 100 features to assess data quality
    const sampleQuery = `${serviceUrl}/${layerIndex}/query?where=1=1&outFields=*&resultRecordCount=100&f=json`;
    
    try {
      const response = await fetch(sampleQuery);
      const data = await response.json();
      
      if (!data.features || data.features.length === 0) {
        return 0.1; // Very poor quality - no data
      }
      
      let qualityScore = 0;
      let totalFields = 0;
      
      // Check each mapping for data availability and quality
      [mappings.hexagon, mappings.tapestry, mappings.demographic, mappings.geographic].flat().forEach(mapping => {
        if (mapping.discoveredField) {
          totalFields++;
          const hasData = data.features.some(f => 
            f.attributes[mapping.discoveredField] !== null && 
            f.attributes[mapping.discoveredField] !== undefined &&
            f.attributes[mapping.discoveredField] !== ''
          );
          
          if (hasData) {
            qualityScore += mapping.confidence;
          }
        }
      });
      
      return totalFields > 0 ? qualityScore / totalFields : 0.1;
    } catch (error) {
      console.error('[Inspector] Quality assessment failed:', error);
      return 0.2; // Poor quality due to access issues
    }
  }
}
```

### **Field Pattern Recognition**

#### **Smart Field Matching**
```typescript
class FieldPatternMatcher {
  // Hexagon identification patterns
  private hexagonPatterns = [
    'H3_INDEX', 'H3_ID', 'HEX_ID', 'HEXAGON_ID', 'GRID_ID',
    'H3INDEX', 'H3ID', 'HEXID', 'HEX_INDEX'
  ];
  
  // ZIP code patterns
  private zipCodePatterns = [
    'ZIP_CODE', 'ZIPCODE', 'ZIP', 'POSTAL_CODE', 'ZIP_CD', 'GEOID'
  ];
  
  // Display ID patterns
  private displayIdPatterns = [
    'DISPLAY_ID', 'HEXAGON_DISPLAY_ID', 'HEX_DISPLAY', 'GRID_DISPLAY',
    'DISPLAY_NUMBER', 'HEX_NUM', 'CELL_ID'
  ];
  
  // 2025 Tapestry segment patterns
  private tapestryPatterns = {
    K1: ['TAPESTRY_K1', 'TAP_K1_PCT', 'SEGMENT_K1', 'K1_PCT', 'LIFEMODE_K1', 'EST_SUB_PCT'],
    K2: ['TAPESTRY_K2', 'TAP_K2_PCT', 'SEGMENT_K2', 'K2_PCT', 'LIFEMODE_K2', 'MAT_FAM_PCT'],
    I1: ['TAPESTRY_I1', 'TAP_I1_PCT', 'SEGMENT_I1', 'I1_PCT', 'LIFEMODE_I1', 'RUR_EST_PCT'],
    J1: ['TAPESTRY_J1', 'TAP_J1_PCT', 'SEGMENT_J1', 'J1_PCT', 'LIFEMODE_J1', 'ACT_SEN_PCT'],
    L1: ['TAPESTRY_L1', 'TAP_L1_PCT', 'SEGMENT_L1', 'L1_PCT', 'LIFEMODE_L1', 'SAV_SUB_PCT']
  };
  
  // Demographic field patterns
  private demographicPatterns = {
    totalPopulation: ['TOTPOP', 'TOTAL_POP', 'POPULATION', 'POP_TOTAL', 'TOT_POP'],
    medianAge: ['MEDAGE', 'MEDIAN_AGE', 'AGE_MEDIAN', 'MED_AGE'],
    medianIncome: ['MEDINC', 'MEDIAN_INCOME', 'INCOME_MED', 'MED_INCOME', 'HH_INCOME'],
    totalHouseholds: ['TOTHH', 'TOTAL_HH', 'HOUSEHOLDS', 'HH_TOTAL'],
    homeOwnership: ['OWNER_OCC', 'HOMEOWNER', 'OWNER_PCT', 'OWN_OCC_PCT']
  };
  
  matchFieldPatterns(fields: FieldMeta[]): FieldMappings {
    return {
      hexagon: this.matchPatternGroup(fields, {
        hexagonId: this.hexagonPatterns,
        zipCode: this.zipCodePatterns,
        displayId: this.displayIdPatterns
      }),
      tapestry: this.matchTapestryPatterns(fields),
      demographic: this.matchPatternGroup(fields, this.demographicPatterns),
      geographic: this.matchGeographicPatterns(fields)
    };
  }
  
  private matchTapestryPatterns(fields: FieldMeta[]): FieldMapping[] {
    const mappings: FieldMapping[] = [];
    
    Object.entries(this.tapestryPatterns).forEach(([segment, patterns]) => {
      const match = this.findBestMatch(fields, patterns);
      mappings.push({
        expectedField: `TAPESTRY_${segment}_PCT`,
        discoveredField: match?.name || null,
        fieldType: 'number',
        confidence: match?.confidence || 0
      });
    });
    
    return mappings;
  }
}
```

---

## 🔄 Adaptive Calculation Engine

### **Dynamic Processor Configuration**

#### **AdaptiveProcessorFactory.ts**
```typescript
interface ProcessorConfiguration {
  availableFields: FieldMapping[];
  calculationMode: 'full' | 'limited' | 'fallback';
  missingFields: string[];
  alternativeFields: string[];
  qualityWarnings: string[];
}

class AdaptiveProcessorFactory {
  createEntertainmentProcessor(schema: ServiceSchema): EntertainmentAnalysisProcessor {
    const config = this.analyzeProcessorRequirements(schema, 'entertainment');
    
    if (config.calculationMode === 'full') {
      return new FullEntertainmentProcessor(config);
    } else if (config.calculationMode === 'limited') {
      return new LimitedEntertainmentProcessor(config);
    } else {
      return new FallbackEntertainmentProcessor(config);
    }
  }
  
  createTapestryProcessor(schema: ServiceSchema): TapestryAnalysisProcessor {
    const config = this.analyzeTapestryRequirements(schema);
    
    // Determine which segments are available
    const availableSegments = schema.tapestryFields
      .filter(mapping => mapping.confidence > 0.7)
      .map(mapping => mapping.expectedField);
    
    if (availableSegments.length >= 4) {
      return new FullTapestryProcessor(config, availableSegments);
    } else if (availableSegments.length >= 2) {
      return new PartialTapestryProcessor(config, availableSegments);
    } else {
      return new DemographicFallbackProcessor(config);
    }
  }
  
  private analyzeProcessorRequirements(schema: ServiceSchema, type: string): ProcessorConfiguration {
    const requirements = this.getProcessorRequirements(type);
    const availableFields = this.findAvailableFields(schema, requirements);
    const missingFields = requirements.filter(req => !availableFields.some(field => field.expectedField === req));
    
    let calculationMode: ProcessorConfiguration['calculationMode'];
    if (missingFields.length === 0) {
      calculationMode = 'full';
    } else if (missingFields.length <= requirements.length * 0.3) {
      calculationMode = 'limited';
    } else {
      calculationMode = 'fallback';
    }
    
    return {
      availableFields,
      calculationMode,
      missingFields,
      alternativeFields: this.findAlternativeFields(schema, missingFields),
      qualityWarnings: this.generateQualityWarnings(schema, missingFields)
    };
  }
  
  private generateQualityWarnings(schema: ServiceSchema, missingFields: string[]): string[] {
    const warnings: string[] = [];
    
    if (schema.qualityScore < 0.7) {
      warnings.push(`Low data quality detected for ${schema.state} (${(schema.qualityScore * 100).toFixed(1)}%)`);
    }
    
    missingFields.forEach(field => {
      if (field.includes('TAPESTRY')) {
        warnings.push(`Missing Tapestry segment: ${field} - will use demographic proxies`);
      } else if (field.includes('INCOME')) {
        warnings.push(`Missing income data - entertainment scoring may be less accurate`);
      }
    });
    
    return warnings;
  }
}
```

### **Calculation Adaptation**

#### **Adaptive Scoring Algorithms**
```typescript
class AdaptiveEntertainmentScorer {
  calculateEntertainmentScore(hexagonData: any, config: ProcessorConfiguration): EntertainmentScore {
    // Base scoring approach
    if (config.calculationMode === 'full') {
      return this.calculateFullScore(hexagonData, config);
    } else if (config.calculationMode === 'limited') {
      return this.calculateLimitedScore(hexagonData, config);
    } else {
      return this.calculateFallbackScore(hexagonData, config);
    }
  }
  
  private calculateFullScore(data: any, config: ProcessorConfiguration): EntertainmentScore {
    // Use all expected fields for comprehensive scoring
    const musicAffinity = this.calculateMusicAffinity(data, config.availableFields);
    const culturalEngagement = this.calculateCulturalEngagement(data, config.availableFields);
    const spendingCapacity = this.calculateSpendingCapacity(data, config.availableFields);
    const marketAccess = this.calculateMarketAccess(data, config.availableFields);
    
    return {
      composite: (musicAffinity * 0.4) + (culturalEngagement * 0.25) + (spendingCapacity * 0.2) + (marketAccess * 0.15),
      components: { musicAffinity, culturalEngagement, spendingCapacity, marketAccess },
      confidence: 1.0,
      methodology: 'full-entertainment-analysis'
    };
  }
  
  private calculateLimitedScore(data: any, config: ProcessorConfiguration): EntertainmentScore {
    // Adapt weights based on available fields
    const availableComponents = this.identifyAvailableComponents(config.availableFields);
    const adaptedWeights = this.calculateAdaptedWeights(availableComponents);
    
    let composite = 0;
    let totalWeight = 0;
    
    if (availableComponents.musicAffinity) {
      const score = this.calculateMusicAffinity(data, config.availableFields);
      composite += score * adaptedWeights.musicAffinity;
      totalWeight += adaptedWeights.musicAffinity;
    }
    
    if (availableComponents.spendingCapacity) {
      const score = this.calculateSpendingCapacity(data, config.availableFields);
      composite += score * adaptedWeights.spendingCapacity;
      totalWeight += adaptedWeights.spendingCapacity;
    }
    
    // Normalize by actual total weight
    if (totalWeight > 0) {
      composite = composite / totalWeight;
    }
    
    return {
      composite,
      components: availableComponents,
      confidence: totalWeight / 1.0, // Reduced confidence due to missing data
      methodology: 'limited-entertainment-analysis',
      warnings: config.qualityWarnings
    };
  }
  
  private calculateFallbackScore(data: any, config: ProcessorConfiguration): EntertainmentScore {
    // Use basic demographic proxies
    const demographics = this.extractAvailableDemographics(data, config.availableFields);
    
    // Simple proxy scoring based on available demographics
    let composite = 0.5; // Neutral baseline
    
    if (demographics.medianAge) {
      // Classic rock demographic (age 45-70) scoring
      const ageScore = this.scoreAgeForClassicRock(demographics.medianAge);
      composite = (composite + ageScore) / 2;
    }
    
    if (demographics.medianIncome) {
      // Higher income generally correlates with entertainment spending
      const incomeScore = Math.min(demographics.medianIncome / 75000, 1.0);
      composite = (composite + incomeScore) / 2;
    }
    
    return {
      composite,
      components: { demographic: composite },
      confidence: 0.3, // Low confidence for fallback method
      methodology: 'demographic-fallback',
      warnings: [...config.qualityWarnings, 'Using demographic fallback due to limited entertainment data']
    };
  }
  
  private scoreAgeForClassicRock(medianAge: number): number {
    // Optimal age range for classic rock (Doors) demographic is 45-70
    if (medianAge >= 45 && medianAge <= 70) {
      return 0.9 - Math.abs(medianAge - 57.5) / 50; // Peak at 57.5 years
    } else if (medianAge >= 35 && medianAge < 45) {
      return 0.5 + (medianAge - 35) / 20; // Rising from 35-45
    } else if (medianAge > 70 && medianAge <= 80) {
      return 0.7 - (medianAge - 70) / 25; // Declining after 70
    } else {
      return 0.3; // Lower scores for very young or very old areas
    }
  }
}
```

---

## 📊 Data Quality Assessment and Reporting

### **Quality Metrics Dashboard**

#### **ServiceQualityReporter.ts**
```typescript
interface QualityReport {
  overall: {
    score: number; // 0-1
    status: 'excellent' | 'good' | 'fair' | 'poor';
    recommendation: string;
  };
  byState: {
    [state: string]: StateQualityMetrics;
  };
  fieldAvailability: {
    tapestrySegments: FieldAvailabilityReport;
    demographics: FieldAvailabilityReport;
    geographic: FieldAvailabilityReport;
  };
  adaptations: {
    processorAdjustments: string[];
    fallbackMethods: string[];
    qualityWarnings: string[];
  };
}

class ServiceQualityReporter {
  generateQualityReport(schemas: ServiceSchema[]): QualityReport {
    const overall = this.calculateOverallQuality(schemas);
    const byState = this.analyzeStateQuality(schemas);
    const fieldAvailability = this.analyzeFieldAvailability(schemas);
    const adaptations = this.summarizeAdaptations(schemas);
    
    return {
      overall,
      byState,
      fieldAvailability,
      adaptations
    };
  }
  
  private analyzeFieldAvailability(schemas: ServiceSchema[]): any {
    const tapestrySegments = this.analyzeTapestryAvailability(schemas);
    const demographics = this.analyzeDemographicAvailability(schemas);
    const geographic = this.analyzeGeographicAvailability(schemas);
    
    return {
      tapestrySegments: {
        K1: this.calculateAvailability(schemas, 'TAPESTRY_K1_PCT'),
        K2: this.calculateAvailability(schemas, 'TAPESTRY_K2_PCT'),
        I1: this.calculateAvailability(schemas, 'TAPESTRY_I1_PCT'),
        J1: this.calculateAvailability(schemas, 'TAPESTRY_J1_PCT'),
        L1: this.calculateAvailability(schemas, 'TAPESTRY_L1_PCT'),
        overall: tapestrySegments.overall
      },
      demographics: {
        population: this.calculateAvailability(schemas, 'TOTAL_POPULATION'),
        income: this.calculateAvailability(schemas, 'MEDIAN_INCOME'),
        age: this.calculateAvailability(schemas, 'MEDIAN_AGE'),
        households: this.calculateAvailability(schemas, 'TOTAL_HOUSEHOLDS'),
        overall: demographics.overall
      },
      geographic: {
        hexagonId: this.calculateAvailability(schemas, 'H3_INDEX'),
        zipCode: this.calculateAvailability(schemas, 'ZIP_CODE'),
        displayId: this.calculateAvailability(schemas, 'DISPLAY_ID'),
        overall: geographic.overall
      }
    };
  }
  
  generateAdaptationSummary(schemas: ServiceSchema[]): string {
    const adaptations = this.summarizeAdaptations(schemas);
    
    return `
# Data Quality and Adaptation Summary

## Overall Assessment
${this.generateOverallAssessment(schemas)}

## State-by-State Analysis
${schemas.map(schema => this.generateStateAssessment(schema)).join('\n\n')}

## Field Availability
${this.generateFieldAvailabilitySummary(schemas)}

## Processor Adaptations
${adaptations.processorAdjustments.map(adj => `• ${adj}`).join('\n')}

## Recommendations
${this.generateRecommendations(schemas)}
    `.trim();
  }
  
  private generateOverallAssessment(schemas: ServiceSchema[]): string {
    const avgQuality = schemas.reduce((sum, schema) => sum + schema.qualityScore, 0) / schemas.length;
    const status = this.getQualityStatus(avgQuality);
    
    return `
**Quality Score**: ${(avgQuality * 100).toFixed(1)}% (${status})
**Services Analyzed**: ${schemas.length} states (${schemas.map(s => s.state).join(', ')})
**Total Features**: ${schemas.reduce((sum, s) => sum + s.totalFeatures, 0).toLocaleString()} hexagons
    `.trim();
  }
  
  private generateStateAssessment(schema: ServiceSchema): string {
    const tapestryCount = schema.tapestryFields.filter(f => f.confidence > 0.7).length;
    const demographicCount = schema.demographicFields.filter(f => f.confidence > 0.7).length;
    
    return `
### ${schema.state} Analysis
- **Quality Score**: ${(schema.qualityScore * 100).toFixed(1)}%
- **Features**: ${schema.totalFeatures.toLocaleString()} hexagons
- **Tapestry Segments**: ${tapestryCount}/5 available
- **Demographics**: ${demographicCount} fields mapped
- **Service**: ${schema.serviceUrl}
    `.trim();
  }
}
```

### **User-Friendly Adaptation Interface**

#### **AdaptationStatusComponent.tsx**
```tsx
const DataAdaptationStatus: React.FC<{ qualityReport: QualityReport }> = ({ qualityReport }) => {
  return (
    <div className="data-adaptation-status">
      <Alert variant={qualityReport.overall.status === 'excellent' ? 'default' : 'warning'}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Data Adaptation Status</AlertTitle>
        <AlertDescription>
          <div className="space-y-2">
            <p>
              <strong>Overall Quality:</strong> {(qualityReport.overall.score * 100).toFixed(1)}% 
              ({qualityReport.overall.status})
            </p>
            
            {qualityReport.adaptations.qualityWarnings.length > 0 && (
              <div>
                <strong>Adaptations Applied:</strong>
                <ul className="mt-1 space-y-1">
                  {qualityReport.adaptations.processorAdjustments.map((adaptation, idx) => (
                    <li key={idx} className="text-sm">• {adaptation}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <p className="text-sm text-gray-600">
              {qualityReport.overall.recommendation}
            </p>
          </div>
        </AlertDescription>
      </Alert>
      
      <div className="mt-4 grid grid-cols-3 gap-4">
        <FieldAvailabilityCard 
          title="Tapestry Segments"
          availability={qualityReport.fieldAvailability.tapestrySegments}
        />
        <FieldAvailabilityCard 
          title="Demographics"
          availability={qualityReport.fieldAvailability.demographics}
        />
        <FieldAvailabilityCard 
          title="Geographic"
          availability={qualityReport.fieldAvailability.geographic}
        />
      </div>
    </div>
  );
};

const FieldAvailabilityCard: React.FC<{
  title: string;
  availability: FieldAvailabilityReport;
}> = ({ title, availability }) => {
  const getStatusColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <Card className="p-4">
      <h4 className="font-medium">{title}</h4>
      <div className={`text-2xl font-bold ${getStatusColor(availability.overall)}`}>
        {(availability.overall * 100).toFixed(0)}%
      </div>
      <p className="text-sm text-gray-600">Available</p>
    </Card>
  );
};
```

---

## 🔧 Implementation Integration

### **Update Federated Layer Service**

#### **Enhanced FederatedLayerService.ts**
```typescript
// Add to existing FederatedLayerService
class EnhancedFederatedLayerService extends FederatedLayerService {
  private serviceSchemas: Map<string, ServiceSchema> = new Map();
  private inspector: FeatureServiceInspector = new FeatureServiceInspector();
  private qualityReporter: ServiceQualityReporter = new ServiceQualityReporter();
  
  async initializeServices(serviceUrls: { IL: string; IN: string; WI: string }): Promise<QualityReport> {
    console.log('[FederatedLayer] Inspecting and adapting to actual service schemas...');
    
    // Inspect all services
    const schemas = await Promise.all([
      this.inspector.inspectService(serviceUrls.IL, 'IL'),
      this.inspector.inspectService(serviceUrls.IN, 'IN'),
      this.inspector.inspectService(serviceUrls.WI, 'WI')
    ]);
    
    // Store schemas for later use
    schemas.forEach(schema => {
      this.serviceSchemas.set(schema.state, schema);
    });
    
    // Generate quality report
    const qualityReport = this.qualityReporter.generateQualityReport(schemas);
    
    // Configure adaptive processors
    await this.configureAdaptiveProcessors(schemas);
    
    console.log('[FederatedLayer] Service adaptation complete:', qualityReport);
    return qualityReport;
  }
  
  private async configureAdaptiveProcessors(schemas: ServiceSchema[]): Promise<void> {
    const factory = new AdaptiveProcessorFactory();
    
    schemas.forEach(schema => {
      // Create adapted processors for each state
      const entertainmentProcessor = factory.createEntertainmentProcessor(schema);
      const tapestryProcessor = factory.createTapestryProcessor(schema);
      
      // Register adapted processors
      this.registerProcessor(schema.state, 'entertainment', entertainmentProcessor);
      this.registerProcessor(schema.state, 'tapestry', tapestryProcessor);
    });
  }
  
  getAdaptationStatus(): QualityReport {
    const schemas = Array.from(this.serviceSchemas.values());
    return this.qualityReporter.generateQualityReport(schemas);
  }
}
```

### **Update Claude-Flow Configuration**

#### **Add Adaptive Mapping Workflow**
```json
{
  "adaptive-field-mapping": {
    "description": "Automatically inspect and adapt to actual ArcGIS Feature Service schemas",
    "agents": ["federated-layer-architect", "shap-scoring-engineer"],
    "steps": [
      "Create FeatureServiceInspector for automated schema discovery",
      "Implement intelligent field pattern matching for Tapestry segments",
      "Build AdaptiveProcessorFactory for dynamic processor configuration",
      "Create fallback calculation methods for missing fields",
      "Implement ServiceQualityReporter for data quality assessment",
      "Build user-friendly adaptation status interface",
      "Integrate with existing FederatedLayerService",
      "Add quality warnings and recommendations system"
    ],
    "triggers": ["service-urls-provided", "schema-changes-detected"],
    "outputs": ["field-mappings.json", "quality-report.json", "adapted-processors"]
  }
}
```

---

## 🎯 Benefits of Adaptive System

### **Flexibility**
- **No Rigid Requirements**: Works with whatever field schema is provided
- **Graceful Degradation**: Maintains functionality even with missing data
- **Quality Transparency**: Clear reporting of data availability and limitations

### **Intelligence**
- **Pattern Recognition**: Finds fields using fuzzy matching and common patterns
- **Confidence Scoring**: Quantifies how well discovered fields match expectations
- **Adaptive Calculations**: Adjusts scoring algorithms based on available data

### **User Experience**
- **Clear Communication**: Reports what adaptations were made and why
- **Quality Assessment**: Transparent scoring of data quality by state
- **Actionable Recommendations**: Suggests improvements or alternative approaches

This adaptive system ensures The Doors Documentary analysis will work with whatever actual field schemas are provided, while maintaining transparency about data quality and any necessary adaptations.