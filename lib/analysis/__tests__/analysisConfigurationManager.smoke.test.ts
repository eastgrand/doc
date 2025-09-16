import { AnalysisConfigurationManager } from '../AnalysisConfigurationManager';

describe('AnalysisConfigurationManager smoke tests', () => {
  test('should expose processorConfig for retail comparative and extract primary metric', () => {
    const cfg = AnalysisConfigurationManager.getInstance();

    // switch to retail explicitly (idempotent)
    cfg.setProjectType('retail');

    const pconfig = cfg.getProcessorSpecificConfig('comparative');
    expect(pconfig).toBeDefined();

    // create a sample record that should match primaryMetric fields in retail context
    const sample = { comparison_score: 82, DESCRIPTION: 'Sample Market', ID: 'mkt-1' };
    const primary = cfg.extractPrimaryMetric(sample);
    expect(typeof primary).toBe('number');
    expect(primary).toBeGreaterThanOrEqual(0);
  });
});
