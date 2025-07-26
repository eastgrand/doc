// Export all visualization renderers
export { ChoroplethRenderer } from './ChoroplethRenderer';
export { ClusterRenderer } from './ClusterRenderer';
export { CompetitiveRenderer } from './CompetitiveRenderer';

// TODO: Export additional renderers as they're developed
// export { SymbolRenderer } from './SymbolRenderer';
// export { HeatmapRenderer } from './HeatmapRenderer';
// export { CategoricalRenderer } from './CategoricalRenderer';
// export { NetworkRenderer } from './NetworkRenderer';
// export { BivariateRenderer } from './BivariateRenderer';
// export { GraduatedSymbolRenderer } from './GraduatedSymbolRenderer';
// export { RiskGradientRenderer } from './RiskGradientRenderer';

/**
 * Available renderer types for different visualization needs
 */
export const RENDERER_TYPES = {
  CHOROPLETH: 'choropleth',
  CLUSTER: 'cluster',
  COMPETITIVE: 'competitive',
  MULTI_SYMBOL: 'multi-symbol',
  SYMBOL: 'symbol',
  HEATMAP: 'heatmap',
  CATEGORICAL: 'categorical',
  NETWORK: 'network',
  BIVARIATE: 'bivariate',
  GRADUATED_SYMBOLS: 'graduated-symbols',
  RISK_GRADIENT: 'risk-gradient'
} as const;

/**
 * Renderer registry for mapping visualization types to renderers
 */
export const VISUALIZATION_RENDERER_MAP = {
  'choropleth': 'ChoroplethRenderer',
  'cluster': 'ClusterRenderer', 
  'competitive': 'CompetitiveRenderer',
  'multi-symbol': 'CompetitiveRenderer', // Uses same renderer
  'symbol': 'SymbolRenderer', // TODO: Implement
  'heatmap': 'HeatmapRenderer', // TODO: Implement
  'categorical': 'CategoricalRenderer', // TODO: Implement
  'network': 'NetworkRenderer', // TODO: Implement
  'bivariate': 'BivariateRenderer', // TODO: Implement
  'graduated-symbols': 'GraduatedSymbolRenderer', // TODO: Implement
  'risk-gradient': 'RiskGradientRenderer' // TODO: Implement
} as const; 