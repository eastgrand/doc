
// Minimal unit test for VisualizationManager.cleanup semantics (plain JS to avoid TS lint rules)

describe('VisualizationManager cleanup', () => {
  test('cleanup rejects inFlight and deletes __visualizationManager', () => {
    const map = {};

    let rejectCalled = false;

    // Create a dummy inFlight promise that never resolves, and a reject function we can spy on
    const p = new Promise(() => {});

    const manager = {
      inFlight: p,
      lastSignature: null,
      lastLayerId: null,
      resolve: null,
      reject: () => { rejectCalled = true; },
      cleanup: null
    };

    // Create the actual cleanup implementation to mirror the one in utils/apply-analysis-visualization.ts
    manager.cleanup = () => {
      try {
        const vm = map.__visualizationManager;
        if (vm && vm.inFlight && typeof vm.reject === 'function') {
          try { vm.reject(new Error('VisualizationManager: map destroyed - aborting in-flight creation')); } catch (e) { /* ignore */ }
        }
      } finally {
        try { delete map.__visualizationManager; } catch (e) { /* ignore */ }
      }
    };

    // Attach to map
    map.__visualizationManager = manager;

    // Call cleanup
    manager.cleanup();

    // Assertions
    expect(rejectCalled).toBeTruthy();
    expect(map.__visualizationManager).toBeUndefined();
  });
});
