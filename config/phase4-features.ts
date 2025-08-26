/**
 * Phase 4 Feature Flags Configuration
 * 
 * This configuration file controls which Phase 4 advanced features are enabled.
 * Each feature is modular and can be toggled independently without affecting
 * the core application functionality.
 * 
 * To disable a feature, simply set its flag to false.
 * Features will gracefully degrade when disabled.
 */

export interface Phase4Features {
  // 4.1 - Scholarly Research Integration
  scholarlyResearch: {
    enabled: boolean;
    config: {
      maxResultsPerQuery: number;
      cacheTimeMinutes: number;
      apiEndpoints: {
        googleScholar: boolean;
        pubmed: boolean;
        arxiv: boolean;
        semanticScholar: boolean;
      };
    };
  };

  // 4.2 - Real-Time Data Streams (Economic Focus)
  realTimeDataStreams: {
    enabled: boolean;
    config: {
      updateIntervalSeconds: number;
      maxConcurrentStreams: number;
      dataSources: {
        fred: boolean;  // Federal Reserve Economic Data
        censusEconomic: boolean;  // Census Economic Indicators
        alphaVantage: boolean;  // Financial market data
        newsApi: boolean;  // News sentiment
      };
    };
  };

  // 4.3 - Advanced Visualization Engine
  advancedVisualization: {
    enabled: boolean;
    config: {
      webglEnabled: boolean;
      maxDataPoints: number;
      animationDuration: number;
      features: {
        threeDMaps: boolean;
        timeSeriesAnimation: boolean;
        linkedCharts: boolean;
        aiNarratives: boolean;
      };
    };
  };

  // 4.4 - AI-Powered Insights
  aiInsights: {
    enabled: boolean;
    config: {
      confidenceThreshold: number;
      maxInsightsPerAnalysis: number;
      features: {
        patternDetection: boolean;
        narrativeGeneration: boolean;
        riskAssessment: boolean;
        recommendations: boolean;
      };
    };
  };
}

/**
 * Default Phase 4 Feature Configuration
 * 
 * All features are disabled by default for production safety.
 * Enable features as needed by setting their flags to true.
 */
export const PHASE4_FEATURES: Phase4Features = {
  // 4.1 - Scholarly Research Integration
  scholarlyResearch: {
    enabled: false,  // Set to true to enable scholarly research
    config: {
      maxResultsPerQuery: 10,
      cacheTimeMinutes: 60,
      apiEndpoints: {
        googleScholar: false,  // Requires API key
        pubmed: true,  // Free, no API key required
        arxiv: true,   // Free, no API key required
        semanticScholar: true  // Free with optional API key
      }
    }
  },

  // 4.2 - Real-Time Data Streams
  realTimeDataStreams: {
    enabled: false,  // Set to true to enable live data streams
    config: {
      updateIntervalSeconds: 300,  // 5 minutes
      maxConcurrentStreams: 3,
      dataSources: {
        fred: true,  // Free, requires API key
        censusEconomic: true,  // Free, no key required
        alphaVantage: false,  // Free tier limited
        newsApi: false  // Requires API key
      }
    }
  },

  // 4.3 - Advanced Visualization Engine
  advancedVisualization: {
    enabled: false,  // Set to true to enable advanced visualizations
    config: {
      webglEnabled: true,
      maxDataPoints: 100000,
      animationDuration: 2000,
      features: {
        threeDMaps: true,
        timeSeriesAnimation: true,
        linkedCharts: true,
        aiNarratives: false  // Requires AI insights to be enabled
      }
    }
  },

  // 4.4 - AI-Powered Insights
  aiInsights: {
    enabled: false,  // Set to true to enable AI insights
    config: {
      confidenceThreshold: 0.85,
      maxInsightsPerAnalysis: 5,
      features: {
        patternDetection: true,
        narrativeGeneration: true,
        riskAssessment: true,
        recommendations: true
      }
    }
  }
};

/**
 * Helper function to check if a Phase 4 feature is enabled
 */
export function isPhase4FeatureEnabled(feature: keyof Phase4Features): boolean {
  return PHASE4_FEATURES[feature]?.enabled || false;
}

/**
 * Helper function to get feature configuration
 */
export function getPhase4FeatureConfig<K extends keyof Phase4Features>(
  feature: K
): Phase4Features[K]['config'] | null {
  const featureConfig = PHASE4_FEATURES[feature];
  return featureConfig?.enabled ? featureConfig.config : null;
}

/**
 * Development mode overrides (only active in development)
 */
if (process.env.NODE_ENV === 'development' && process.env.ENABLE_ALL_PHASE4 === 'true') {
  console.log('🚀 Phase 4: All features enabled in development mode');
  Object.keys(PHASE4_FEATURES).forEach((key) => {
    (PHASE4_FEATURES as any)[key].enabled = true;
  });
}

export default PHASE4_FEATURES;