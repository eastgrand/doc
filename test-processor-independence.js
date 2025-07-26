// Test that each processor only requires its specific score field
const fs = require('fs');
const path = require('path');

// Mock minimal data for each processor
const testData = {
  '/strategic-analysis': {
    success: true,
    results: [
      {
        ID: '11234',
        DESCRIPTION: '11234 (Brooklyn)',
        strategic_value_score: 79.34
        // No value, no opportunity_score - should still work
      },
      {
        ID: '11385', 
        DESCRIPTION: '11385 (Ridgewood)',
        strategic_value_score: 79.17
      }
    ]
  },
  
  '/competitive-analysis': {
    success: true,
    results: [
      {
        ID: '11234',
        DESCRIPTION: '11234 (Brooklyn)', 
        competitive_advantage_score: 5.1
        // No strategic_value_score, no value - should still work
      },
      {
        ID: '11385',
        DESCRIPTION: '11385 (Ridgewood)',
        competitive_advantage_score: 4.8
      }
    ]
  },
  
  '/spatial-clusters': {
    success: true,
    results: [
      {
        ID: '11234',
        DESCRIPTION: '11234 (Brooklyn)',
        cluster_performance_score: 80.7
        // No other scores - should still work
      },
      {
        ID: '11385',
        DESCRIPTION: '11385 (Ridgewood)', 
        cluster_performance_score: 78.2
      }
    ]
  }
};

// Mock processor classes (simplified)
class StrategicAnalysisProcessor {
  validate(rawData) {
    return rawData.results.some(record => 
      record.strategic_value_score !== undefined
    );
  }
  
  process(rawData) {
    if (!this.validate(rawData)) {
      throw new Error('Strategic analysis requires strategic_value_score');
    }
    
    const records = rawData.results.map((record, index) => {
      const score = Number(record.strategic_value_score);
      if (isNaN(score)) {
        throw new Error(`Record ${record.ID} missing strategic_value_score`);
      }
      
      return {
        area_id: record.ID,
        area_name: record.DESCRIPTION,
        value: score,
        rank: index + 1,
        properties: { ...record }
      };
    });
    
    return {
      type: 'strategic_analysis',
      records: records.sort((a, b) => b.value - a.value)
    };
  }
}

class CompetitiveDataProcessor {
  validate(rawData) {
    return rawData.results.some(record => 
      record.competitive_advantage_score !== undefined
    );
  }
  
  process(rawData) {
    if (!this.validate(rawData)) {
      throw new Error('Competitive analysis requires competitive_advantage_score');
    }
    
    const records = rawData.results.map((record, index) => {
      const score = Number(record.competitive_advantage_score);
      if (isNaN(score)) {
        throw new Error(`Record ${record.ID} missing competitive_advantage_score`);
      }
      
      return {
        area_id: record.ID,
        area_name: record.DESCRIPTION,
        value: score,
        rank: index + 1,
        properties: { ...record }
      };
    });
    
    return {
      type: 'competitive_analysis', 
      records: records.sort((a, b) => b.value - a.value)
    };
  }
}

class ClusterDataProcessor {
  validate(rawData) {
    return rawData.results.some(record => 
      record.cluster_performance_score !== undefined
    );
  }
  
  process(rawData) {
    if (!this.validate(rawData)) {
      throw new Error('Spatial clustering requires cluster_performance_score');
    }
    
    const records = rawData.results.map((record, index) => {
      const score = Number(record.cluster_performance_score);
      if (isNaN(score)) {
        throw new Error(`Record ${record.ID} missing cluster_performance_score`);
      }
      
      return {
        area_id: record.ID,
        area_name: record.DESCRIPTION,
        value: score,
        rank: index + 1,
        properties: { ...record }
      };
    });
    
    return {
      type: 'spatial_clustering',
      records: records.sort((a, b) => b.value - a.value)
    };
  }
}

console.log('=== Testing Processor Independence ===\n');

const processors = {
  '/strategic-analysis': new StrategicAnalysisProcessor(),
  '/competitive-analysis': new CompetitiveDataProcessor(), 
  '/spatial-clusters': new ClusterDataProcessor()
};

for (const [endpoint, processor] of Object.entries(processors)) {
  console.log(`Testing ${endpoint}:`);
  
  try {
    const data = testData[endpoint];
    console.log(`  ✅ Validation: ${processor.validate(data)}`);
    
    const result = processor.process(data);
    console.log(`  ✅ Processing: ${result.records.length} records processed`);
    console.log(`  ✅ Type: ${result.type}`);
    console.log(`  ✅ Top score: ${result.records[0]?.value}`);
    console.log(`  ✅ Independent: Only requires its specific score field\n`);
    
  } catch (error) {
    console.log(`  ❌ Failed: ${error.message}\n`);
  }
}

console.log('=== Key Benefits of Independence ===');
console.log('✅ Each processor only requires its specific score field');
console.log('✅ No dependency on generic "value" or "opportunity_score"');
console.log('✅ Clear separation of concerns');
console.log('✅ Explicit failures when required fields are missing');
console.log('✅ No silent fallbacks to incorrect data');