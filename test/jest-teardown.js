// Jest teardown helper - clears any map-level visualization manager state
// This file is loaded after each test by Jest via setupFilesAfterEnv

const SAFE_KEYS = [
  '__visualizationManager',
  '__lastAnalysisSignature',
  '__lastAnalysisSignatureAt',
  '__lastAnalysisLayerId',
  '__analysisLock',
  '__inFlightTimer'
];

function safeClearManager(obj) {
  try {
    if (!obj || typeof obj !== 'object') return;
    // If it looks like a VisualizationManager, call cleanup
    const vman = obj.__visualizationManager || obj;
    if (vman && typeof vman.cleanup === 'function') {
      try { vman.cleanup(); } catch { /* ignore */ }
    }

    // Clear any timers referenced on the manager
    try {
      if (vman && vman.__inFlightTimer) {
        try { clearTimeout(vman.__inFlightTimer); } catch { /* ignore */ }
        vman.__inFlightTimer = null;
      }
    } catch { /* ignore */ }

    // Remove well-known keys
    SAFE_KEYS.forEach(k => {
      try { if (k in obj) delete obj[k]; } catch { /* ignore */ }
    });
  } catch {
    // swallow
  }
}

// afterEach will run after every test file's tests (setupFilesAfterEnv ensures this file runs once)
afterEach(() => {
  try {
    // If global map instances or map factories are attached to globalThis, try to clean them
    // Common patterns: global.mapView, global.__map, globalThis.__MAP_VIEW
    const candidates = [globalThis.mapView, globalThis.__map, globalThis.__MAP_VIEW, globalThis.map];
    candidates.forEach(c => {
      try { safeClearManager(c); } catch { /* ignore */ }
    });

    // Also try to walk any top-level globals that look like maps (conservative):
    Object.keys(globalThis).forEach(key => {
      try {
        if (typeof key === 'string' && key.toLowerCase().includes('map')) {
          const val = (globalThis)[key];
          safeClearManager(val);
        }
      } catch { /* ignore */ }
    });
  } catch {
    // ignore cleanup errors
  }
});
