/* eslint-disable @typescript-eslint/no-explicit-any */
import { extractFeatureId, filterFeaturesBySpatialFilterIds } from '../../utils/spatialFilter';

describe('spatialFilter utils', () => {
  const makeFeature = (props: Record<string, any>) => ({ properties: props });

  test('extractFeatureId: prefers explicit ID fields', () => {
    expect(extractFeatureId(makeFeature({ ID: '12345' }))).toBe('12345');
    expect(extractFeatureId(makeFeature({ id: 'A-9' }))).toBe('A-9');
    expect(extractFeatureId(makeFeature({ area_id: '99999' }))).toBe('99999');
    expect(extractFeatureId(makeFeature({ areaID: '77777' }))).toBe('77777');
    expect(extractFeatureId(makeFeature({ geoid: '06085' }))).toBe('06085');
    expect(extractFeatureId(makeFeature({ GEOID: '36061' }))).toBe('36061');
  });

  test('extractFeatureId: falls back to DESCRIPTION/area_name ZIP parsing', () => {
    expect(extractFeatureId(makeFeature({ DESCRIPTION: '11234 (Brooklyn)' }))).toBe('11234');
    expect(extractFeatureId(makeFeature({ DESCRIPTION: 'ZIP 08544 - Princeton, NJ' }))).toBe('08544');
    expect(extractFeatureId(makeFeature({ area_name: '10001 New York' }))).toBe('10001');
    expect(extractFeatureId(makeFeature({ DESCRIPTION: 'City C - 34567' }))).toBe('34567');
  });

  test('filterFeaturesBySpatialFilterIds: returns original when project scope', () => {
    const features = [makeFeature({ ID: '1' }), makeFeature({ ID: '2' })];
    const filtered = filterFeaturesBySpatialFilterIds(features, ['2'], { analysisScope: 'project' });
    expect(filtered).toHaveLength(2);
  });

  test('filterFeaturesBySpatialFilterIds: filters by provided ids', () => {
    const features = [
      makeFeature({ ID: '1', DESCRIPTION: 'ZIP 11111' }),
      makeFeature({ area_id: '2', DESCRIPTION: 'ZIP 22222' }),
      makeFeature({ DESCRIPTION: 'ZIP 33333 - Town' }),
    ];
    const filtered = filterFeaturesBySpatialFilterIds(features, ['2', '33333']);
    expect(filtered.map(f => f.properties.ID || f.properties.area_id || f.properties.DESCRIPTION)).toEqual([
      '2',
      'ZIP 33333 - Town'
    ]);
  });
});
