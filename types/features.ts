export interface GeospatialFeature {
  id: string;
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: Record<string, any>;
  weight?: number;
} 