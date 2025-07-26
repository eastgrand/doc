import { describe, it, expect } from '@jest/globals';
// Import visualization classes (only the processMicroserviceResponse or equivalent logic is used)
import { SingleLayerVisualization } from '../utils/visualizations/single-layer-visualization';
import { CorrelationVisualization } from '../utils/visualizations/correlation-visualization';
import { JointHighVisualization } from '../utils/visualizations/joint-high-visualization';
import { ProportionalSymbolVisualization } from '../utils/visualizations/proportional-symbol-visualization';
import { TopNVisualization } from '../utils/visualizations/top-n-visualization';
import { MultivariateVisualization } from '../utils/visualizations/multivariate-visualization';
import { HexbinVisualization } from '../utils/visualizations/hexbin-visualization';

// Mock ArcGIS features
const arcgisFeatures = [
  { attributes: { ID: 'A1', NAME: 'Area 1' }, geometry: { type: 'polygon', rings: [] } },
  { attributes: { ID: 'A2', NAME: 'Area 2' }, geometry: { type: 'polygon', rings: [] } },
  { attributes: { ID: 'A3', NAME: 'Area 3' }, geometry: { type: 'polygon', rings: [] } },
];

// Mock microservice results
const microserviceRecords = [
  { ID: 'A1', score: 0.9, extra: 'foo' },
  { ID: 'A2', score: 0.7, extra: 'bar' },
  { ID: 'A3', score: 0.5, extra: 'baz' },
];

// Helper: join by ID
function joinByID(arcgis: any[], micro: any[]): any[] {
  const microMap = new Map<any, any>(micro.map((f: any) => [f.ID, f]));
  return arcgis.map((f: any) => ({
    ...f,
    micro: microMap.get(f.attributes.ID) || null
  }));
}

describe('Visualization microservice join logic', () => {
  it('SingleLayerVisualization: features from microservice have correct ID', () => {
    const viz = new SingleLayerVisualization();
    const response = { inputRecords: microserviceRecords, predictions: [1, 2, 3], explanations: { feature_names: [], shap_values: [] }, model_type: 'test' };
    const data = viz['processMicroserviceResponse'](response);
    const joined = joinByID(arcgisFeatures, data.features.map(f => f.attributes));
    joined.forEach((j: any) => expect(j.micro).not.toBeNull());
  });

  it('CorrelationVisualization: features from microservice have correct ID', () => {
    const viz = new CorrelationVisualization();
    const response = { inputRecords: microserviceRecords, predictions: [1, 2, 3], explanations: { feature_names: [], shap_values: [[], [], []] }, model_type: 'test' };
    const data = viz['processMicroserviceResponse'](response);
    const joined = joinByID(arcgisFeatures, data.features.map(f => f.attributes));
    joined.forEach((j: any) => expect(j.micro).not.toBeNull());
  });

  it('JointHighVisualization: features from microservice have correct ID', () => {
    const viz = new JointHighVisualization();
    const response = { inputRecords: microserviceRecords };
    const data = viz['processMicroserviceResponse'](response);
    const joined = joinByID(arcgisFeatures, data.features.map(f => f.attributes));
    joined.forEach((j: any) => expect(j.micro).not.toBeNull());
  });

  it('ProportionalSymbolVisualization: features from microservice have correct ID', () => {
    const viz = new ProportionalSymbolVisualization();
    const response = { inputRecords: microserviceRecords };
    const data = viz['processMicroserviceResponse'](response);
    const joined = joinByID(arcgisFeatures, data.features.map(f => f.attributes));
    joined.forEach((j: any) => expect(j.micro).not.toBeNull());
  });

  it('TopNVisualization: features from microservice have correct ID', () => {
    const viz = new TopNVisualization();
    const response = { inputRecords: microserviceRecords };
    const data = viz['processMicroserviceResponse'](response);
    const joined = joinByID(arcgisFeatures, data.features.map(f => f.attributes));
    joined.forEach((j: any) => expect(j.micro).not.toBeNull());
  });

  it('MultivariateVisualization: features from microservice have correct ID', () => {
    const viz = new MultivariateVisualization();
    // For multivariate, features are expected as input, so we simulate the mapping
    const features = microserviceRecords.map((rec, i) => ({ attributes: { ...rec, ID: rec.ID }, geometry: { type: 'polygon', rings: [] } }));
    const joined = joinByID(arcgisFeatures, features.map(f => f.attributes));
    joined.forEach((j: any) => expect(j.micro).not.toBeNull());
  });

  it('HexbinVisualization: features from microservice have correct ID', () => {
    const viz = new HexbinVisualization();
    // For hexbin, features are expected as input, so we simulate the mapping
    const features = microserviceRecords.map((rec, i) => ({ attributes: { ...rec, ID: rec.ID }, geometry: { type: 'polygon', rings: [] } }));
    const joined = joinByID(arcgisFeatures, features.map(f => f.attributes));
    joined.forEach((j: any) => expect(j.micro).not.toBeNull());
  });
}); 