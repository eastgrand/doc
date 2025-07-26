import MapView from '@arcgis/core/views/MapView';

export function createMockMapView(): __esri.MapView {
  return {
    container: document.createElement('div'),
    center: { longitude: -118.2437, latitude: 34.0522 },
    zoom: 10,
    scale: 100000,
    spatialReference: { wkid: 4326 },
    extent: {
      xmin: -118.5,
      ymin: 33.8,
      xmax: -118.0,
      ymax: 34.3,
      spatialReference: { wkid: 4326 }
    },
    goTo: jest.fn(),
    when: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    off: jest.fn(),
    destroy: jest.fn()
  } as unknown as __esri.MapView;
} 