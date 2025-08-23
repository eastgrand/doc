import { getZip, resolveAreaName, resolveRegionName, extractCityFromDescription } from './AreaName';

describe('AreaName utilities', () => {
  test('getZip extracts 5-digit ZIP from DESCRIPTION and pads 4-digit', () => {
    expect(getZip({ DESCRIPTION: '11234 (Brooklyn)' })).toBe('11234');
    expect(getZip({ DESCRIPTION: '1234 (Test City)' })).toBe('01234');
  });

  test('getZip supports direct fields and Canadian FSA', () => {
    expect(getZip({ zip_code: '08544' })).toBe('08544');
    expect(getZip({ ID: 'M5V' })).toBe('M5V');
  });

  test('extractCityFromDescription parses parentheses', () => {
    expect(extractCityFromDescription('10001 (New York)')).toBe('New York');
    expect(extractCityFromDescription('Queens')).toBe('Queens');
  });

  test('resolveAreaName full/cityOnly/zipCity modes', () => {
    const rec = { DESCRIPTION: '10001 (New York)' };
    expect(resolveAreaName(rec, { mode: 'full' })).toBe('10001 (New York)');
    expect(resolveAreaName(rec, { mode: 'cityOnly' })).toBe('New York');
    expect(resolveAreaName(rec, { mode: 'zipCity' })).toBe('10001 (New York)');
  });

  test('resolveAreaName falls back to ZIP when no description', () => {
    const rec = { zip_code: '90210' };
    expect(resolveAreaName(rec, { mode: 'cityOnly' })).toBe('ZIP 90210');
  });

  test('resolveRegionName picks first valid name or neutral', () => {
    const features = [
      { properties: { DESCRIPTION: '11234 (Brooklyn)' } },
      { properties: { DESCRIPTION: '10001 (New York)' } },
    ];
    expect(resolveRegionName(features, '112', { neutralFallback: 'Region 112' })).toBe('11234 (Brooklyn)');
    expect(resolveRegionName([], '999', { neutralFallback: 'Region 999' })).toBe('Region 999');
  });
});
