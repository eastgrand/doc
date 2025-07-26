import { createVisualization, getVisualizationFromMode, VisualizationType } from '../utils/visualizations';
import { JointHighVisualization } from '../utils/visualizations/joint-visualization';

describe('Joint High Visualization Registration Tests', () => {
  test('getVisualizationFromMode should return the correct type for joint-high', () => {
    const result = getVisualizationFromMode('joint-high');
    expect(result).toEqual({ type: 'joint-high' as VisualizationType });
  });

  test('createVisualization should create a JointHighVisualization instance', () => {
    const visualization = createVisualization('joint-high');
    expect(visualization).toBeInstanceOf(JointHighVisualization);
  });
});
