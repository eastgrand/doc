import { DataExplorationHandler, dataExplorationHandler } from './data-exploration-handler';
import { chatStateManager } from './chat-state-manager';
import { VisualizationType } from "../reference/dynamic-layers";
import { DataPoint } from './data-exploration-handler';

describe('DataExplorationHandler', () => {
  const sessionId = 'test-session-' + Date.now();
  
  beforeEach(() => {
    // Create a new session for each test with default preferences
    chatStateManager.createSession(sessionId, {
      language: 'en',
      preferredVisualizationTypes: [VisualizationType.SCATTER, VisualizationType.TRENDS],
      preferredMetrics: ['temperature', 'humidity'],
      defaultFilters: { temperature: { min: 0, max: 100 } }
    });
  });
  
  afterEach(() => {
    // Clean up after each test
    chatStateManager.endSession(sessionId);
  });
  
  describe('updateDataContext', () => {
    it('should update data context with new points', () => {
      const points = [
        {
          id: '1',
          coordinates: [37.7749, -122.4194] as [number, number],
          timestamp: new Date('2024-01-01'),
          attributes: { temperature: 72, humidity: 45 }
        },
        {
          id: '2',
          coordinates: [37.7833, -122.4167] as [number, number],
          timestamp: new Date('2024-01-02'),
          attributes: { temperature: 75, humidity: 50 }
        }
      ];
      
      dataExplorationHandler.updateDataContext(sessionId, points);
      
      const state = chatStateManager.getState(sessionId);
      expect(state.dataContext).toBeDefined();
      expect(state.dataContext?.dataSummary.totalPoints).toBe(2);
      expect(state.dataContext?.dataSummary.categories).toEqual([]);
      expect(state.dataContext?.visualizationType).toBe(VisualizationType.TRENDS);
    });
    
    it('should handle empty points array', () => {
      dataExplorationHandler.updateDataContext(sessionId, []);
      
      const state = chatStateManager.getState(sessionId);
      expect(state.dataContext?.dataSummary.totalPoints).toBe(0);
    });
  });
  
  describe('analyzeData', () => {
    it('should analyze data and return insights', async () => {
      const points = [
        {
          id: '1',
          coordinates: [37.7749, -122.4194] as [number, number],
          timestamp: new Date('2024-01-01'),
          attributes: { temperature: 72, humidity: 45 }
        },
        {
          id: '2',
          coordinates: [37.7833, -122.4167] as [number, number],
          timestamp: new Date('2024-01-02'),
          attributes: { temperature: 75, humidity: 50 }
        }
      ];
      
      dataExplorationHandler.updateDataContext(sessionId, points);
      const insights = await dataExplorationHandler.analyzeData(sessionId);
      
      expect(insights).toBeDefined();
      expect(typeof insights).toBe('string');
      
      const state = chatStateManager.getState(sessionId);
      expect(state.messages).toHaveLength(1);
      expect(state.messages[0].content).toBe(insights);
    });
  });
  
  describe('suggestFilters', () => {
    it('should suggest filters based on patterns', () => {
      const points = [
        {
          id: '1',
          coordinates: [37.7749, -122.4194] as [number, number],
          timestamp: new Date('2024-01-01'),
          attributes: { temperature: 72, humidity: 45 }
        },
        {
          id: '2',
          coordinates: [37.7833, -122.4167] as [number, number],
          timestamp: new Date('2024-01-02'),
          attributes: { temperature: 75, humidity: 50 }
        }
      ];
      
      dataExplorationHandler.updateDataContext(sessionId, points);
      const suggestions = dataExplorationHandler.suggestFilters(sessionId);
      
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });
  
  describe('applyFilters', () => {
    it('should apply filters and update context', async () => {
      const points = [
        {
          id: '1',
          coordinates: [37.7749, -122.4194] as [number, number],
          timestamp: new Date('2024-01-01'),
          attributes: { temperature: 72, humidity: 45 }
        },
        {
          id: '2',
          coordinates: [37.7833, -122.4167] as [number, number],
          timestamp: new Date('2024-01-02'),
          attributes: { temperature: 75, humidity: 50 }
        }
      ];
      
      dataExplorationHandler.updateDataContext(sessionId, points);
      
      const filters = { temperature: { min: 70, max: 80 } };
      dataExplorationHandler.applyFilters(sessionId, filters);
      
      const state = chatStateManager.getState(sessionId);
      expect(state.dataContext?.currentFilters).toEqual(filters);
    });
  });

  describe('Statistical Analysis', () => {
    beforeEach(() => {
      const sessionId = chatStateManager.createSession('test-session');

      // Create test data with numeric attributes
      const points: DataPoint[] = [
        {
          id: '1',
          coordinates: [37.7749, -122.4194] as [number, number],
          timestamp: new Date('2024-01-01'),
          attributes: { value: 10, count: 5, score: 85 }
        },
        {
          id: '2',
          coordinates: [37.7750, -122.4195] as [number, number],
          timestamp: new Date('2024-01-02'),
          attributes: { value: 15, count: 8, score: 90 }
        },
        {
          id: '3',
          coordinates: [37.7751, -122.4196] as [number, number],
          timestamp: new Date('2024-01-03'),
          attributes: { value: 20, count: 12, score: 95 }
        }
      ];

      dataExplorationHandler.updateDataContext(sessionId, points);
    });

    it('should calculate enhanced statistics', () => {
      const points = Array.from(dataExplorationHandler['dataPoints'].values());
      const stats = dataExplorationHandler['calculateStatistics'](points);

      // Check value attribute statistics
      expect(stats.value).toBeDefined();
      expect(stats.value.mean).toBeCloseTo(15, 1);
      expect(stats.value.median).toBe(15);
      expect(stats.value.stdDev).toBeCloseTo(5, 1);
      expect(stats.value.q1).toBeCloseTo(12.5, 1);
      expect(stats.value.q3).toBeCloseTo(17.5, 1);
      expect(stats.value.iqr).toBeCloseTo(5, 1);
      expect(stats.value.skewness).toBeCloseTo(0, 1);
      expect(stats.value.distribution).toBeDefined();
    });

    it('should calculate correlations between attributes', () => {
      const points = Array.from(dataExplorationHandler['dataPoints'].values());
      const stats = dataExplorationHandler['calculateStatistics'](points);

      expect(stats.correlations).toBeDefined();
      expect(stats.correlations.value).toBeDefined();
      expect(stats.correlations.value.count).toBeCloseTo(1, 1); // Perfect correlation
      expect(stats.correlations.value.score).toBeCloseTo(1, 1); // Perfect correlation
    });

    it('should calculate distribution histogram', () => {
      const points = Array.from(dataExplorationHandler['dataPoints'].values());
      const stats = dataExplorationHandler['calculateStatistics'](points);

      expect(stats.value.distribution).toBeDefined();
      const distribution = stats.value.distribution;
      expect(Object.keys(distribution).length).toBeGreaterThan(0);
      const values = Object.values(distribution) as number[];
      const totalPoints = values.reduce((sum, count) => sum + count, 0);
      expect(totalPoints).toBe(3); // Total points
    });

    it('should handle empty data points', () => {
      const stats = dataExplorationHandler['calculateStatistics']([]);
      expect(stats).toEqual({});
    });

    it('should handle single data point', () => {
      const points: DataPoint[] = [{
        id: '1',
        attributes: { value: 10 }
      }];
      const stats = dataExplorationHandler['calculateStatistics'](points);
      
      expect(stats.value).toBeDefined();
      expect(stats.value.mean).toBe(10);
      expect(stats.value.median).toBe(10);
      expect(stats.value.stdDev).toBe(0);
    });

    it('should handle non-numeric attributes in statistics', () => {
      const points: DataPoint[] = [{
        id: '1',
        attributes: { 
          value: 10,
          category: 'test',
          isActive: true
        }
      }];
      const stats = dataExplorationHandler['calculateStatistics'](points);
      
      expect(stats.value).toBeDefined();
      expect(stats.category).toBeUndefined();
      expect(stats.isActive).toBeUndefined();
    });

    it('should calculate correct quartiles for even number of points', () => {
      const points: DataPoint[] = [
        { id: '1', attributes: { value: 1 } },
        { id: '2', attributes: { value: 2 } },
        { id: '3', attributes: { value: 3 } },
        { id: '4', attributes: { value: 4 } }
      ];
      const stats = dataExplorationHandler['calculateStatistics'](points);
      
      expect(stats.value.q1).toBe(1.5);
      expect(stats.value.median).toBe(2.5);
      expect(stats.value.q3).toBe(3.5);
    });

    it('should calculate correct quartiles for odd number of points', () => {
      const points: DataPoint[] = [
        { id: '1', attributes: { value: 1 } },
        { id: '2', attributes: { value: 2 } },
        { id: '3', attributes: { value: 3 } },
        { id: '4', attributes: { value: 4 } },
        { id: '5', attributes: { value: 5 } }
      ];
      const stats = dataExplorationHandler['calculateStatistics'](points);
      
      expect(stats.value.q1).toBe(2);
      expect(stats.value.median).toBe(3);
      expect(stats.value.q3).toBe(4);
    });

    it('should handle skewed data correctly', () => {
      const points: DataPoint[] = [
        { id: '1', attributes: { value: 1 } },
        { id: '2', attributes: { value: 2 } },
        { id: '3', attributes: { value: 3 } },
        { id: '4', attributes: { value: 4 } },
        { id: '5', attributes: { value: 20 } } // Outlier
      ];
      const stats = dataExplorationHandler['calculateStatistics'](points);
      
      expect(stats.value.skewness).toBeGreaterThan(0); // Positive skew
      expect(stats.value.kurtosis).toBeGreaterThan(0); // Leptokurtic
    });

    it('should calculate correlations only for significant values', () => {
      const points: DataPoint[] = [
        { id: '1', attributes: { value: 1, unrelated: 100 } },
        { id: '2', attributes: { value: 2, unrelated: 200 } },
        { id: '3', attributes: { value: 3, unrelated: 300 } }
      ];
      const stats = dataExplorationHandler['calculateStatistics'](points);
      
      expect(stats.correlations).toBeDefined();
      expect(stats.correlations.value).toBeDefined();
      expect(stats.correlations.value.unrelated).toBeUndefined(); // Should not be included due to low correlation
    });
  });

  describe('Pattern Detection', () => {
    it('should detect clusters in spatial data', () => {
      const points: DataPoint[] = [
        { id: '1', coordinates: [37.7749, -122.4194], attributes: { value: 1 } },
        { id: '2', coordinates: [37.7749, -122.4195], attributes: { value: 2 } },
        { id: '3', coordinates: [37.7749, -122.4196], attributes: { value: 3 } },
        { id: '4', coordinates: [38.0000, -122.0000], attributes: { value: 4 } } // Far point
      ];
      
      const patterns = dataExplorationHandler['detectClusters'](points);
      expect(patterns.length).toBe(1);
      expect(patterns[0].type).toBe('cluster');
      expect(patterns[0].dataPoints.length).toBe(3);
    });

    it('should detect trends in temporal data', () => {
      const points: DataPoint[] = [
        { id: '1', timestamp: new Date('2024-01-01'), attributes: { value: 1 } },
        { id: '2', timestamp: new Date('2024-01-02'), attributes: { value: 2 } },
        { id: '3', timestamp: new Date('2024-01-03'), attributes: { value: 3 } }
      ];
      
      const patterns = dataExplorationHandler['detectTrends'](points);
      expect(patterns.length).toBe(1);
      expect(patterns[0].type).toBe('trend');
      expect(patterns[0].metrics?.slope).toBeGreaterThan(0);
    });

    it('should detect outliers in numeric data', () => {
      const points: DataPoint[] = [
        { id: '1', attributes: { value: 1 } },
        { id: '2', attributes: { value: 2 } },
        { id: '3', attributes: { value: 3 } },
        { id: '4', attributes: { value: 10 } } // Outlier
      ];
      
      const patterns = dataExplorationHandler['detectOutliers'](points);
      expect(patterns.length).toBe(1);
      expect(patterns[0].type).toBe('outlier');
      expect(patterns[0].dataPoints).toContain('4');
    });
  });

  describe('Statistical Calculations', () => {
    test('calculateQuantile handles edge cases correctly', () => {
      const data = [1, 2, 3, 4, 5];
      expect(dataExplorationHandler['calculateQuantile'](data, 0)).toBe(1);
      expect(dataExplorationHandler['calculateQuantile'](data, 1)).toBe(5);
      expect(dataExplorationHandler['calculateQuantile'](data, 0.5)).toBe(3);
      expect(dataExplorationHandler['calculateQuantile'](data, 0.25)).toBe(2);
      expect(dataExplorationHandler['calculateQuantile'](data, 0.75)).toBe(4);
    });

    test('calculateSkewness returns correct sign', () => {
      const rightSkewed = [1, 2, 2, 3, 4, 5, 6, 7, 8, 9];
      const leftSkewed = [9, 8, 7, 6, 5, 4, 3, 2, 2, 1];
      const symmetric = [1, 2, 3, 4, 5, 5, 6, 7, 8, 9];

      expect(dataExplorationHandler['calculateSkewness'](rightSkewed)).toBeGreaterThan(0);
      expect(dataExplorationHandler['calculateSkewness'](leftSkewed)).toBeLessThan(0);
      expect(Math.abs(dataExplorationHandler['calculateSkewness'](symmetric))).toBeLessThan(0.1);
    });

    test('calculateCorrelations uses correct threshold', () => {
      const points: DataPoint[] = [
        { id: '1', attributes: { x: 1, y: 1, z: 1 } },
        { id: '2', attributes: { x: 2, y: 2, z: 0 } },
        { id: '3', attributes: { x: 3, y: 3, z: 1 } },
        { id: '4', attributes: { x: 4, y: 4, z: 0 } },
        { id: '5', attributes: { x: 5, y: 5, z: 1 } }
      ];

      const correlations = dataExplorationHandler['calculateCorrelations'](points, ['x', 'y', 'z']);
      expect(correlations['x']['y']).toBeGreaterThan(0.7);
      expect(correlations['x']['z']).toBeUndefined();
    });
  });

  describe('Pattern Detection', () => {
    test('detectTrends identifies subtle trends', () => {
      const points: DataPoint[] = [
        { id: '1', timestamp: new Date('2023-01-01'), attributes: { value: 100 } },
        { id: '2', timestamp: new Date('2023-02-01'), attributes: { value: 101 } },
        { id: '3', timestamp: new Date('2023-03-01'), attributes: { value: 102 } },
        { id: '4', timestamp: new Date('2023-04-01'), attributes: { value: 103 } },
        { id: '5', timestamp: new Date('2023-05-01'), attributes: { value: 104 } }
      ];

      const trends = dataExplorationHandler['detectTrends'](points);
      expect(trends.length).toBeGreaterThan(0);
      expect(trends[0].type).toBe('trend');
      expect(trends[0].metrics?.slope).toBeGreaterThan(0);
    });

    test('detectClusters forms meaningful groups', () => {
      const points: DataPoint[] = [
        { id: '1', coordinates: [0, 0], attributes: {} },
        { id: '2', coordinates: [0.01, 0.01], attributes: {} },
        { id: '3', coordinates: [0.02, 0.02], attributes: {} },
        { id: '4', coordinates: [1, 1], attributes: {} },
        { id: '5', coordinates: [1.01, 1.01], attributes: {} },
        { id: '6', coordinates: [1.02, 1.02], attributes: {} }
      ];

      const clusters = dataExplorationHandler['detectClusters'](points);
      expect(clusters.length).toBe(2);
      expect(clusters[0].dataPoints.length).toBe(3);
      expect(clusters[1].dataPoints.length).toBe(3);
    });
  });

  describe('Integration Tests', () => {
    test('analyzeData combines statistical and pattern analysis', async () => {
      const points: DataPoint[] = [
        { 
          id: '1', 
          coordinates: [0, 0], 
          timestamp: new Date('2023-01-01'),
          attributes: { value: 100, category: 'A' }
        },
        { 
          id: '2', 
          coordinates: [0.01, 0.01], 
          timestamp: new Date('2023-02-01'),
          attributes: { value: 101, category: 'A' }
        },
        { 
          id: '3', 
          coordinates: [0.02, 0.02], 
          timestamp: new Date('2023-03-01'),
          attributes: { value: 102, category: 'A' }
        }
      ];

      dataExplorationHandler.updateDataContext('test-session', points);
      const insights = await dataExplorationHandler.analyzeData('test-session');
      
      expect(insights).toContain('trend');
      expect(insights).toContain('cluster');
    });
  });
}); 