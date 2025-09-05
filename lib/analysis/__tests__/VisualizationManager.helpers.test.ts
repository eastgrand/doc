/* eslint-disable @typescript-eslint/no-explicit-any */
import { attachVisualizationManager } from '@/utils/apply-analysis-visualization';

// Minimal mock map object (compatible with earlier tests)
const createMockMap = () => {
  const layers = {
    items: [] as any[],
    add(layer: any) { this.items.push(layer); },
    removeMany(arr: any[]) { this.items = this.items.filter((l: any) => !arr.includes(l)); },
    find(fn: any) { return this.items.find(fn); },
    filter(fn: any) { const filtered = this.items.filter(fn); (filtered as any).toArray = () => [...filtered]; return filtered as any; },
    toArray() { return [...this.items]; }
  } as any;

  const map = { layers, add: (l: any) => layers.add(l), removeMany: (a: any[]) => layers.removeMany(a) } as any;
  return { map, layers };
};

describe('VisualizationManager helpers', () => {
  test('attachVisualizationManager provides helper APIs and forceReplaceLayer works', async () => {
    const { map } = createMockMap();
    const vm = attachVisualizationManager(map);
    expect(vm).toBeTruthy();
    // Initially no current layer
    expect(vm.getCurrentLayer()).toBeNull();

    // Create a fake layer and force-replace
    const fakeLayer = { id: 'fake-1', __isAnalysisLayer: true } as any;
    const replaced = await vm.forceReplaceLayer(fakeLayer, 'sig-1');
    expect(replaced).toBe(fakeLayer);
    expect(vm.getCurrentLayer()).toBe(fakeLayer);

    // Wait for layer by signature (should return quickly)
    const found = await vm.waitForLayer('sig-1', 500);
    expect(found).toBe(fakeLayer);

    // Cleanup should remove manager reference
    vm.cleanup();
    expect((map as any).__visualizationManager).toBeUndefined();
  });
});
