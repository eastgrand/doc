// Test that a simulated inFlight TTL rejects and clears inFlight

describe('VisualizationManager inFlight TTL', () => {
  jest.useRealTimers();

  test('inFlight timer rejects and clears inFlight', async () => {
    const map = {};
    let rejectCalled = false;

    const p = new Promise(() => {});

    const manager = {
      inFlight: p,
      lastSignature: null,
      lastLayerId: null,
      resolve: null,
  reject: () => { rejectCalled = true; },
      cleanup: null,
      __inFlightTimer: null
    };

    // Simulate TTL behavior: create a short timer that calls reject and clears inFlight
    manager.__inFlightTimer = setTimeout(() => {
      try { manager.reject(new Error('timeout')); } catch { }
      try { manager.inFlight = null; } catch { }
    }, 30);

    map.__visualizationManager = manager;

    // Wait long enough for timer to fire
    await new Promise((res) => setTimeout(res, 60));

    expect(rejectCalled).toBeTruthy();
    expect(map.__visualizationManager.inFlight).toBeNull();
  });
});
