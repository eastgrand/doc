import { AnalysisConfigurationManager } from '../AnalysisConfigurationManager';

describe('AnalysisConfigurationManager real-estate smoke tests', () => {
  test('should expose processorConfig for real-estate comparative and extract primary metric', () => {
    const cfg = AnalysisConfigurationManager.getInstance();

    // switch to real-estate explicitly
    cfg.setProjectType('real-estate');

    const pconfig = cfg.getProcessorSpecificConfig('comparative');
    expect(pconfig).toBeDefined();

    // sample record matching common real-estate primary fields
    const sample = { strategic_score: 68, DESCRIPTION: 'Sample Area', ID: 'area-1' };
    const primary = cfg.extractPrimaryMetric(sample);
    expect(typeof primary).toBe('number');
    expect(primary).toBeGreaterThanOrEqual(0);
  });
});
