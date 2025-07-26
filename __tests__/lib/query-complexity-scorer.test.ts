import { scoreQueryComplexity } from '../../lib/query-complexity-scorer';
import { VisualizationType } from "../../reference/dynamic-layers";

describe('Query Complexity Scorer', () => {
  test('should identify simple queries', () => {
    const simpleQueries = [
      'show me a map of population',
      'display income by county',
      'create a map of stores',
      'visualize crime locations'
    ];
    
    simpleQueries.forEach(query => {
      const result = scoreQueryComplexity(query);
      expect(result.score).toBeLessThanOrEqual(4);
      expect(result.requiresML).toBe(false);
      expect(result.queryType).toBe('simple');
    });
  });
  
  test('should identify complex queries', () => {
    const complexQueries = [
      'show correlation between income, education, and crime rates',
      'visualize the relationship between population density and property values with statistical significance',
      'create a regression analysis of home prices by school district, crime rate, and transit access'
    ];
    
    complexQueries.forEach(query => {
      const result = scoreQueryComplexity(query);
      expect(result.score).toBeGreaterThan(4);
      expect(result.requiresML).toBe(true);
      expect(result.queryType).toBe('complex');
    });
  });
  
  test('should identify predictive queries', () => {
    const predictiveQueries = [
      'predict crime rates for next month',
      'forecast population growth over the next 5 years',
      'show future trends in housing prices',
      'visualize predicted flood zones'
    ];
    
    predictiveQueries.forEach(query => {
      const result = scoreQueryComplexity(query);
      expect(result.requiresML).toBe(true);
      expect(result.queryType).toBe('predictive');
    });
  });
  
  test('should add score for statistical terminology', () => {
    const query = 'show the mean and standard deviation of income by neighborhood';
    const result = scoreQueryComplexity(query);
    
    expect(result.score).toBeGreaterThan(2);
    expect(result.explanation.some(exp => exp.includes('statistical terms'))).toBe(true);
  });
  
  test('should add score for multiple parameters', () => {
    const query = 'compare income, education levels, property values, and crime rates';
    const result = scoreQueryComplexity(query);
    
    expect(result.score).toBeGreaterThan(3);
    expect(result.explanation.some(exp => exp.includes('parameters/variables'))).toBe(true);
  });
  
  test('should add score for spatial complexity', () => {
    const query = 'find properties within 1 mile of schools and overlapping with flood zones';
    const result = scoreQueryComplexity(query);
    
    expect(result.score).toBeGreaterThan(2);
    expect(result.explanation.some(exp => exp.includes('spatial relationships'))).toBe(true);
  });
  
  test('should consider visualization type in scoring', () => {
    // Test with visualization types that typically require more complex analysis
    const complexTypes = [
      VisualizationType.HOTSPOT,
      VisualizationType.MULTIVARIATE,
      VisualizationType.BIVARIATE,
      VisualizationType.NETWORK
    ];
    
    const simpleQuery = 'display map of locations';
    
    // Without visualization type
    const baseResult = scoreQueryComplexity(simpleQuery);
    
    // With complex visualization type
    complexTypes.forEach(vizType => {
      const withVizResult = scoreQueryComplexity(simpleQuery, vizType);
      expect(withVizResult.score).toBeGreaterThan(baseResult.score);
    });
  });
}); 