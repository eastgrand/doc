#!/usr/bin/env node

/**
 * Market Intelligence Dataset Creation Script
 * 
 * This script combines multiple endpoint JSON files into a single comprehensive
 * market intelligence report dataset. It joins data by ID field and adds
 * geographic boundary information for each record.
 * 
 * Input files:
 * - 9 endpoint analysis files with scoring data
 * - 1 zip boundaries file with geographic data
 * 
 * Output:
 * - Combined market-intelligence-report.json with all scores and geometry
 */

const fs = require('fs').promises;
const path = require('path');

// Configuration
const DATA_DIR = path.join(__dirname, '../public/data');
const ENDPOINTS_DIR = path.join(DATA_DIR, 'endpoints');
const BOUNDARIES_DIR = path.join(DATA_DIR, 'boundaries');

const INPUT_FILES = {
  'strategic': 'strategic-analysis.json',
  'competitive': 'competitive-analysis.json', 
  'brand': 'brand-difference.json',
  'trend': 'trend-analysis.json',
  'predictive': 'predictive-modeling.json',
  'scenario': 'scenario-analysis.json',
  'demographic': 'demographic-insights.json',
  'customer': 'customer-profile.json',
  'feature': 'feature-importance-ranking.json',
  'boundaries': '../boundaries/zip_boundaries.json'
};

const FIELD_MAPPING = {
  // Core identifiers (from strategic-analysis as base)
  core: ['OBJECTID', 'ID', 'DESCRIPTION', 'TOTPOP_CY', 'TOTPOP_FY', 'MEDHINC_CY', 'MEDHINC_FY', 'MEDAGE_CY', 'MEDAGE_FY', 'DIVINDX_CY', 'DIVINDX_FY', 'CreationDate', 'EditDate'],
  
  // Score fields from each endpoint
  strategic: ['strategic_score'],
  competitive: ['competitive_score'],
  brand: ['brand_difference_score'],
  trend: ['trend_score'],
  predictive: ['prediction_score'],
  scenario: ['scenario_score'],
  demographic: ['demographic_insights_score'],
  customer: ['customer_profile_score', 'strategic_value_score', 'lifestyle_score'],
  feature: ['importance_score', 'feature_importance']
};

class MarketIntelligenceDatasetBuilder {
  constructor() {
    this.data = new Map(); // ID -> combined record
    this.boundaries = new Map(); // ID -> geometry data
    this.stats = {
      totalRecords: 0,
      successfulJoins: 0,
      missingGeometry: 0,
      missingScores: {}
    };
  }

  async run() {
    console.log('🚀 Starting Market Intelligence Dataset Creation...');
    
    try {
      // Step 1: Load and process all endpoint files
      await this.loadEndpointData();
      
      // Step 2: Load geographic boundaries
      await this.loadBoundaries();
      
      // Step 3: Combine data and add geometry
      await this.combineDataWithGeometry();
      
      // Step 4: Generate final dataset
      await this.generateFinalDataset();
      
      // Step 5: Print statistics
      this.printStatistics();
      
      console.log('✅ Market Intelligence Dataset Creation Complete!');
      
    } catch (error) {
      console.error('❌ Error creating dataset:', error);
      process.exit(1);
    }
  }

  async loadEndpointData() {
    console.log('📊 Loading endpoint data files...');
    
    // Load strategic analysis as the base dataset (has all core demographic fields)
    const strategicPath = path.join(ENDPOINTS_DIR, INPUT_FILES.strategic);
    const strategicData = await this.loadJsonFile(strategicPath);
    
    // Initialize base records with strategic analysis data
    for (const record of strategicData.results) {
      const id = String(record.ID); // Normalize to string
      if (id) {
        this.data.set(id, {
          // Core fields
          OBJECTID: record.OBJECTID,
          ID: record.ID,
          DESCRIPTION: record.DESCRIPTION,
          
          // Demographics (current year)
          TOTPOP_CY: record.TOTPOP_CY || 0,
          MEDHINC_CY: record.MEDHINC_CY || 0,
          MEDAGE_CY: record.MEDAGE_CY || 0,
          DIVINDX_CY: record.DIVINDX_CY || 0,
          
          // Demographics (forecast year)
          TOTPOP_FY: record.TOTPOP_FY || 0,
          MEDHINC_FY: record.MEDHINC_FY || 0,
          MEDAGE_FY: record.MEDAGE_FY || 0,
          DIVINDX_FY: record.DIVINDX_FY || 0,
          
          // Timestamps
          CreationDate: record.CreationDate,
          EditDate: record.EditDate,
          
          // Score fields (initialize with strategic score)
          strategic_score: record.strategic_score || 0,
          competitive_score: 0,
          brand_difference_score: 0,
          trend_score: 0,
          prediction_score: 0,
          scenario_score: 0,
          demographic_insights_score: 0,
          customer_profile_score: 0,
          strategic_value_score: 0,
          lifestyle_score: 0,
          importance_score: 0,
          feature_importance: [],
          
          // Geometry (to be added later)
          geometry: null,
          center_point: null,
          area_sq_km: 0
        });
      }
    }
    
    this.stats.totalRecords = this.data.size;
    console.log(`✅ Loaded ${this.stats.totalRecords} base records from strategic analysis`);
    
    // Now load and merge other endpoint files
    const endpointPromises = Object.entries(INPUT_FILES)
      .filter(([key]) => key !== 'strategic' && key !== 'boundaries')
      .map(([key, filename]) => this.loadAndMergeEndpoint(key, filename));
    
    await Promise.all(endpointPromises);
  }

  async loadAndMergeEndpoint(endpointKey, filename) {
    try {
      const filePath = path.join(ENDPOINTS_DIR, filename);
      const data = await this.loadJsonFile(filePath);
      const scoreFields = FIELD_MAPPING[endpointKey];
      
      let mergedCount = 0;
      let missingCount = 0;
      
      // Handle different data structures
      let records = [];
      if (Array.isArray(data)) {
        records = data; // customer-profile.json is a direct array
      } else if (data.results && Array.isArray(data.results)) {
        records = data.results;
      } else if (data.features && Array.isArray(data.features)) {
        records = data.features.map(f => f.properties); // GeoJSON format
      }
      
      for (const record of records) {
        const id = String(record.ID); // Normalize to string
        if (id && this.data.has(id)) {
          const existing = this.data.get(id);
          
          // Merge score fields
          for (const field of scoreFields) {
            if (record[field] !== undefined) {
              existing[field] = record[field];
            }
          }
          
          mergedCount++;
        } else {
          missingCount++;
        }
      }
      
      console.log(`✅ ${endpointKey}: merged ${mergedCount} records, ${missingCount} missing IDs`);
      this.stats.missingScores[endpointKey] = missingCount;
      
    } catch (error) {
      console.error(`❌ Error loading ${filename}:`, error.message);
      this.stats.missingScores[endpointKey] = 'file_error';
    }
  }

  async loadBoundaries() {
    console.log('🗺️ Loading geographic boundaries...');
    
    try {
      const boundariesPath = path.join(BOUNDARIES_DIR, 'zip_boundaries.json');
      const boundariesData = await this.loadJsonFile(boundariesPath);
      
      // Index boundaries by ID or other identifier
      for (const feature of boundariesData.features || boundariesData.results || []) {
        // Try multiple possible ID fields
        const id = String(feature.properties?.ID || 
                          feature.properties?.OBJECTID ||
                          feature.id || '');
                  
        if (id && feature.geometry) {
          this.boundaries.set(id, {
            geometry: feature.geometry,
            properties: feature.properties,
            center_point: this.calculateCentroid(feature.geometry),
            area_sq_km: this.calculateArea(feature.geometry)
          });
        }
      }
      
      console.log(`✅ Loaded ${this.boundaries.size} boundary geometries`);
      
    } catch (error) {
      console.error('❌ Error loading boundaries:', error.message);
      console.log('⚠️ Continuing without geometry data');
    }
  }

  async combineDataWithGeometry() {
    console.log('🔗 Combining data with geometry...');
    
    for (const [id, record] of this.data.entries()) {
      if (this.boundaries.has(id)) {
        const boundary = this.boundaries.get(id);
        record.geometry = boundary.geometry;
        record.center_point = boundary.center_point;
        record.area_sq_km = boundary.area_sq_km;
        this.stats.successfulJoins++;
      } else {
        this.stats.missingGeometry++;
      }
    }
    
    console.log(`✅ Added geometry to ${this.stats.successfulJoins} records`);
    if (this.stats.missingGeometry > 0) {
      console.log(`⚠️ ${this.stats.missingGeometry} records missing geometry`);
    }
  }

  async generateFinalDataset() {
    console.log('📝 Generating final dataset...');
    
    const finalDataset = {
      success: true,
      total_records: this.data.size,
      created_at: new Date().toISOString(),
      source_files: Object.values(INPUT_FILES),
      results: Array.from(this.data.values())
    };
    
    const outputPath = path.join(ENDPOINTS_DIR, 'market-intelligence-report.json');
    await fs.writeFile(outputPath, JSON.stringify(finalDataset, null, 2));
    
    console.log(`✅ Generated final dataset: ${outputPath}`);
    console.log(`📊 Total records: ${finalDataset.total_records}`);
    
    // Generate a sample record for inspection
    if (finalDataset.results.length > 0) {
      const samplePath = path.join(ENDPOINTS_DIR, 'market-intelligence-sample.json');
      const sample = {
        sample_record: finalDataset.results[0],
        field_definitions: this.generateFieldDefinitions()
      };
      await fs.writeFile(samplePath, JSON.stringify(sample, null, 2));
      console.log(`📋 Sample record saved: ${samplePath}`);
    }
  }

  generateFieldDefinitions() {
    return {
      identifiers: {
        OBJECTID: "Unique object identifier",
        ID: "Primary key for joining data", 
        DESCRIPTION: "Geographic area description"
      },
      demographics_current: {
        TOTPOP_CY: "Current year total population",
        MEDHINC_CY: "Current year median household income",
        MEDAGE_CY: "Current year median age",
        DIVINDX_CY: "Current year diversity index"
      },
      demographics_forecast: {
        TOTPOP_FY: "Forecast year total population",
        MEDHINC_FY: "Forecast year median household income", 
        MEDAGE_FY: "Forecast year median age",
        DIVINDX_FY: "Forecast year diversity index"
      },
      performance_scores: {
        strategic_score: "Strategic analysis score (0-100)",
        competitive_score: "Competitive analysis score (0-100)",
        brand_difference_score: "Brand differentiation score (0-100)",
        trend_score: "Market trend score (0-100)",
        prediction_score: "Predictive modeling score (0-100)",
        scenario_score: "Scenario analysis/resilience score (0-100)",
        demographic_insights_score: "Demographic insights score (0-100)"
      },
      customer_analysis: {
        customer_profile_score: "Customer profile fit score (0-100)",
        strategic_value_score: "Strategic value score (0-100)",
        lifestyle_score: "Lifestyle alignment score (0-100)"
      },
      feature_analysis: {
        importance_score: "Overall feature importance score (0-100)",
        feature_importance: "Array of ranked feature importance data"
      },
      geography: {
        geometry: "GeoJSON polygon geometry",
        center_point: "Geographic center [longitude, latitude]",
        area_sq_km: "Area in square kilometers"
      }
    };
  }

  printStatistics() {
    console.log('\n📈 Dataset Creation Statistics:');
    console.log('================================');
    console.log(`Total Records: ${this.stats.totalRecords}`);
    console.log(`Successful Geometry Joins: ${this.stats.successfulJoins}`);
    console.log(`Missing Geometry: ${this.stats.missingGeometry}`);
    console.log('\nScore Field Coverage:');
    
    for (const [endpoint, missing] of Object.entries(this.stats.missingScores)) {
      if (missing === 'file_error') {
        console.log(`  ${endpoint}: ❌ File Error`);
      } else {
        const coverage = ((this.stats.totalRecords - missing) / this.stats.totalRecords * 100).toFixed(1);
        console.log(`  ${endpoint}: ${coverage}% coverage (${missing} missing)`);
      }
    }
    console.log('================================\n');
  }

  // Utility functions
  async loadJsonFile(filePath) {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  }

  calculateCentroid(geometry) {
    // Simple centroid calculation for polygons
    if (!geometry || !geometry.coordinates) return [0, 0];
    
    if (geometry.type === 'Polygon') {
      const coords = geometry.coordinates[0]; // Outer ring
      let x = 0, y = 0;
      for (const [lng, lat] of coords) {
        x += lng;
        y += lat;
      }
      return [x / coords.length, y / coords.length];
    }
    
    return [0, 0];
  }

  calculateArea(geometry) {
    // Rough area calculation (simplified)
    if (!geometry || !geometry.coordinates) return 0;
    
    if (geometry.type === 'Polygon') {
      const coords = geometry.coordinates[0];
      // Very rough approximation - in real implementation would use proper geodesic calculation
      let area = 0;
      for (let i = 0; i < coords.length - 1; i++) {
        const [x1, y1] = coords[i];
        const [x2, y2] = coords[i + 1];
        area += x1 * y2 - x2 * y1;
      }
      return Math.abs(area) / 2 * 111 * 111; // Very rough conversion to sq km
    }
    
    return 0;
  }
}

// Run the script if called directly
if (require.main === module) {
  const builder = new MarketIntelligenceDatasetBuilder();
  builder.run().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = MarketIntelligenceDatasetBuilder;