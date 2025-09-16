/* eslint-disable @typescript-eslint/no-explicit-any */
import { SensitivityAnalysisProcessor } from '../SensitivityAnalysisProcessor';
import { getPrimaryScoreField } from '../HardcodedFieldDefs';

interface MockRawData {
  success: boolean;
  results: Array<Record<string, any>>;
  feature_importance?: any[];
  metadata?: Record<string, any>;
}

describe('SensitivityAnalysisProcessor validation', () => {
  it('accepts legacy sensitivity_analysis_score field', () => {
    const proc = new SensitivityAnalysisProcessor();
    const mock: MockRawData = {
      success: true,
      results: [ { ID: 'a1', sensitivity_analysis_score: 42 } ],
      feature_importance: []
    };
    expect(() => proc.process(mock as any)).not.toThrow();
  });

  it('accepts configured primary field from getPrimaryScoreField', () => {
    const proc = new SensitivityAnalysisProcessor();
    const primaryField = getPrimaryScoreField('sensitivity-analysis');
    const mock: MockRawData = {
      success: true,
      results: [ { ID: 'a2', [primaryField as string]: 55 } ],
      feature_importance: []
    };
    expect(() => proc.process(mock as any)).not.toThrow();
  });
});
