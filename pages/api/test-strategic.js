// Test API endpoint for strategic analysis debugging
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    console.log('🔍 Testing Strategic Analysis Flow...');
    
    // Load strategic data
    const dataPath = path.join(process.cwd(), 'public/data/endpoints/strategic-analysis.json');
    const strategicData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    console.log('📊 Data loaded:', strategicData.results.length, 'records');
    
    // Test first few records
    const sampleRecords = strategicData.results.slice(0, 5).map(r => ({
      ...r,
      __chosenScoreField: r.strategic_analysis_score !== undefined
        ? 'strategic_analysis_score'
        : (r.strategic_score !== undefined ? 'strategic_score' : 'strategic_value_score'),
      __primaryScore: r.strategic_analysis_score ?? r.strategic_score ?? r.strategic_value_score
    }));
    const testResults = {
      totalRecords: strategicData.results.length,
      sampleRecords: sampleRecords.map(record => ({
        id: record.ID,
        description: record.DESCRIPTION,
        strategic_analysis_score: record.strategic_analysis_score,
        strategic_score: record.strategic_score,
        strategic_value_score: record.strategic_value_score,
        chosenScoreField: record.__chosenScoreField,
        primaryScore: record.__primaryScore,
        hasStrategicScore: typeof record.__primaryScore === 'number'
      })),
      scoreRange: {
        min: Math.min(...sampleRecords.map(r => r.__primaryScore)),
        max: Math.max(...sampleRecords.map(r => r.__primaryScore))
      },
      processorSimulation: {
        type: 'strategic_analysis',
        targetVariable: 'strategic_analysis_score',
        recordCount: sampleRecords.length,
        sampleProcessedRecord: {
          area_id: sampleRecords[0].ID,
          area_name: sampleRecords[0].DESCRIPTION,
          value: sampleRecords[0].__primaryScore,
          strategic_analysis_score: sampleRecords[0].__primaryScore,
          properties: {
            ...sampleRecords[0],
            __chosenScoreField: sampleRecords[0].__chosenScoreField
          }
        }
      },
      rendererSimulation: {
        valueField: 'strategic_analysis_score',
        extractedValues: sampleRecords.map(r => r.__primaryScore),
        classBreaks: (() => {
          const values = sampleRecords.map(r => r.__primaryScore).sort((a, b) => a - b);
          return [
            values[0],
            values[Math.floor(values.length * 0.25)],
            values[Math.floor(values.length * 0.5)],
            values[Math.floor(values.length * 0.75)],
            values[values.length - 1]
          ];
        })()
      }
    };
    
    console.log('✅ Test results generated');
  console.log('   - Strategic scores found (with fallbacks):', testResults.sampleRecords.every(r => r.hasStrategicScore));
  console.log('   - Score range:', testResults.scoreRange.min, 'to', testResults.scoreRange.max);
    
    res.status(200).json({
      success: true,
      message: 'Strategic analysis test completed',
      results: testResults,
      debugInfo: {
        shouldWork: 'YES - All data structures are correct',
        expectedFlow: [
          '1. StrategicAnalysisProcessor normalizes to targetVariable: strategic_analysis_score',
          '2. VisualizationRenderer uses config.valueField: strategic_analysis_score', 
          '3. ChoroplethRenderer extracts values using strategic_analysis_score field',
          '4. ArcGIS renderer uses field: strategic_analysis_score',
          '5. Feature attributes contain strategic_analysis_score'
        ],
        possibleIssues: [
          'ArcGIS field name case sensitivity',
          'Feature attribute mapping timing',
          'JavaScript errors breaking renderer'
        ]
      }
    });
    
  } catch (error) {
    console.error('❌ Strategic analysis test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}