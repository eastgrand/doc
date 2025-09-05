/* eslint-disable @typescript-eslint/no-explicit-any */
import { applyAnalysisEngineVisualization } from '@/utils/apply-analysis-visualization';

// Virtual mocks for ArcGIS modules used by the visualization util
jest.mock('@arcgis/core/layers/FeatureLayer', () => ({
  __esModule: true,
  default: class FeatureLayer {
    id: string;
    type = 'feature';
    title: string;
    source: any;
    constructor(opts: any) {
      this.id = opts.id;
      this.title = opts.title;
      this.source = opts.source;
    }
  },
}), { virtual: true });

jest.mock('@arcgis/core/Graphic', () => ({
  __esModule: true,
  default: class Graphic {
    geometry: any;
    attributes: any;
    constructor(opts: any) {
      this.geometry = opts.geometry;
      this.attributes = opts.attributes;
    }
  },
}), { virtual: true });

// Helper to create a fresh mocked mapView with layers that behave like ArcGIS Collection
const createMockMapView = () => {
  const layersMock = {
    items: [] as any[],
    add(layer: any) { this.items.push(layer); },
    removeMany(arr: any[]) { this.items = this.items.filter((l: any) => !arr.includes(l)); },
    find(fn: any) { return this.items.find(fn); },
    filter(fn: any) {
      const filtered = this.items.filter(fn);
      (filtered as any).toArray = () => [...filtered];
      return filtered as any;
    },
    toArray() { return [...this.items]; },
  } as any;

  const map = {
    layers: layersMock,
    add: (layer: any) => layersMock.add(layer),
    removeMany: (arr: any[]) => layersMock.removeMany(arr),
  } as any;

  const mapView: any = {
    map,
    goTo: jest.fn().mockResolvedValue(undefined),
  };

  return { mapView, map, layersMock };
};

describe('VisualizationManager concurrency', () => {
  test('multiple concurrent calls create exactly one FeatureLayer and return the same instance', async () => {
    const { mapView, layersMock } = createMockMapView();

    const visualization = {
      renderer: { field: 'value', type: 'class-breaks' },
      config: { autoZoom: false },
    } as any;

    const data = {
      targetVariable: 'value',
      records: [
        { area_id: '1', area_name: 'Area A', geometry: { type: 'Point', coordinates: [-75, 45] }, value: 1 },
      ],
    } as any;

  // Fire multiple concurrent calls
  const callers = Array.from({ length: 5 }).map(() => applyAnalysisEngineVisualization(visualization, data, mapView, undefined, undefined, { callerId: 'test-suite' }));
    const results = await Promise.all(callers);

    // Expect exactly one layer was added
    expect(layersMock.items.length).toBe(1);
    const created = layersMock.items[0];
    // All callers should receive the same layer instance
    results.forEach((r) => expect(r).toBe(created));
  });

  test('concurrent calls with different signatures complete without duplicate layers (final map has single layer)', async () => {
    const { mapView, layersMock } = createMockMapView();

    const visualizationA = { renderer: { field: 'a', type: 'class-breaks' } } as any;
    const visualizationB = { renderer: { field: 'b', type: 'class-breaks' } } as any;

    const dataA = { targetVariable: 'a', records: [{ area_id: '1', area_name: 'A', geometry: { type: 'Point', coordinates: [0, 0] }, a: 1 }] } as any;
    const dataB = { targetVariable: 'b', records: [{ area_id: '2', area_name: 'B', geometry: { type: 'Point', coordinates: [1, 1] }, b: 2 }] } as any;

  // Start both concurrently
  const pA = applyAnalysisEngineVisualization(visualizationA, dataA, mapView, undefined, undefined, { callerId: 'test-suite' });
  const pB = applyAnalysisEngineVisualization(visualizationB, dataB, mapView, undefined, undefined, { callerId: 'test-suite' });

    const [rA, rB] = await Promise.all([pA, pB]);

    // Both calls should complete (may return same or different layer instances), and final map must not contain duplicates
    expect(rA === null || typeof rA === 'object').toBeTruthy();
    expect(rB === null || typeof rB === 'object').toBeTruthy();
    expect(layersMock.items.length).toBe(1);
  });

  test('if map.add throws, all concurrent callers return null', async () => {
    // Create a mock where add throws
    const layersMock = {
      items: [] as any[],
      add(layer: any) { throw new Error('add failed'); },
      removeMany(arr: any[]) { this.items = this.items.filter((l: any) => !arr.includes(l)); },
      find(fn: any) { return this.items.find(fn); },
      filter(fn: any) { const filtered = this.items.filter(fn); (filtered as any).toArray = () => [...filtered]; return filtered as any; },
      toArray() { return [...this.items]; },
    } as any;

    const map = { layers: layersMock, add: (layer: any) => layersMock.add(layer), removeMany: (arr: any[]) => layersMock.removeMany(arr) } as any;
    const mapView: any = { map, goTo: jest.fn().mockResolvedValue(undefined) };

    const visualization = { renderer: { field: 'value', type: 'class-breaks' } } as any;
    const data = { targetVariable: 'value', records: [{ area_id: '1', area_name: 'A', geometry: { type: 'Point', coordinates: [0, 0] }, value: 1 }] } as any;

  const callers = Array.from({ length: 3 }).map(() => applyAnalysisEngineVisualization(visualization, data, mapView, undefined, undefined, { callerId: 'test-suite' }));
    const results = await Promise.all(callers);

    // All callers should return null on failure
    results.forEach((r) => expect(r).toBeNull());
    expect(layersMock.items.length).toBe(0);
  });
});
