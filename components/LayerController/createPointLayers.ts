/**
 * Create specialized point layers for theaters and radio stations
 * with custom icons and coverage visualization
 */

import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Point from '@arcgis/core/geometry/Point';
import Polygon from '@arcgis/core/geometry/Polygon';
import Graphic from '@arcgis/core/Graphic';

// SVG icons for theaters and radio stations
const THEATER_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#8B4513">
  <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
</svg>`;

const RADIO_TOWER_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FF6B6B">
  <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm2 13h-4v-1h4v1zm0-3h-4v-1c0-.55-.45-1-1-1s-1 .45-1 1v1c-1.39-.64-2.35-1.89-2.5-3.36l.9.9c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L6.41 6.73c-.39-.39-1.02-.39-1.41 0s-.39 1.02 0 1.41l.9.9C6.05 9.36 6 9.67 6 10h12c0-.33-.05-.64-.09-.96l.9-.9c.39-.39.39-1.02 0-1.41s-1.02-.39-1.41 0l-1.4 1.4c-.15-1.47-1.11-2.72-2.5-3.36V4c0-.55-.45-1-1-1s-1 .45-1 1v.77C10.11 5.41 9.15 6.66 9 8.13l-1.4-1.4c-.39-.39-1.02-.39-1.41 0z"/>
  <circle cx="12" cy="9" r="2" fill="#FFF"/>
</svg>`;

/**
 * Create a movie theater layer with custom theater icons
 */
export async function createTheaterLayer(
  url: string,
  layerId: string,
  layerName: string
): Promise<FeatureLayer> {
  
  const theaterLayer = new FeatureLayer({
    url: url,
    id: layerId,
    title: layerName,
    outFields: ['*'],
    popupEnabled: false,
    visible: false
  });

  await theaterLayer.load();

  // Create theater icon symbol
  const theaterSymbol = new PictureMarkerSymbol({
    url: `data:image/svg+xml;base64,${btoa(THEATER_ICON_SVG)}`,
    width: 24,
    height: 24
  });

  // Apply theater renderer
  theaterLayer.renderer = new SimpleRenderer({
    symbol: theaterSymbol
  });

  // Set scale visibility
  theaterLayer.minScale = 0;
  theaterLayer.maxScale = 0;
  theaterLayer.opacity = 1.0;

  console.log(`🎭 Created theater layer with custom icon: ${layerName}`);
  return theaterLayer;
}

/**
 * Create a radio station layer with tower icons and coverage radius visualization
 */
export async function createRadioStationLayer(
  url: string,
  layerId: string,
  layerName: string,
  view: __esri.MapView
): Promise<FeatureLayer> {
  
  const radioLayer = new FeatureLayer({
    url: url,
    id: layerId,
    title: layerName,
    outFields: ['*'],
    popupEnabled: false,
    visible: false
  });

  await radioLayer.load();

  // Create radio tower icon symbol
  const radioTowerSymbol = new PictureMarkerSymbol({
    url: `data:image/svg+xml;base64,${btoa(RADIO_TOWER_ICON_SVG)}`,
    width: 28,
    height: 28
  });

  // Apply radio tower renderer
  radioLayer.renderer = new SimpleRenderer({
    symbol: radioTowerSymbol
  });

  // Set scale visibility
  radioLayer.minScale = 0;
  radioLayer.maxScale = 0;
  radioLayer.opacity = 1.0;

  // Create coverage radius layer
  const coverageGraphics: Graphic[] = [];
  
  // Query all radio station features to get their locations and coverage data
  const query = radioLayer.createQuery();
  query.where = '1=1';
  query.returnGeometry = true;
  query.outFields = ['*'];
  
  try {
    const result = await radioLayer.queryFeatures(query);
    
    // Create coverage circles for each radio station
    result.features.forEach(feature => {
      if (feature.geometry && feature.geometry.type === 'point') {
        const point = feature.geometry as Point;
        
        // Get coverage radius from attributes or use default
        // Check for fields like COVERAGE_RADIUS, SIGNAL_RANGE, or similar
        let radiusInMiles = 50; // Default 50 mile radius
        
        // Check various possible field names for coverage radius
        const possibleRadiusFields = [
          'COVERAGE_RADIUS', 'SIGNAL_RANGE', 'BROADCAST_RANGE', 
          'RADIUS_MILES', 'COVERAGE_MILES', 'RANGE_MILES'
        ];
        
        for (const field of possibleRadiusFields) {
          if (feature.attributes[field] && feature.attributes[field] > 0) {
            radiusInMiles = feature.attributes[field];
            break;
          }
        }
        
        // Create a buffer circle around the point
        const bufferDistance = radiusInMiles * 1609.34; // Convert miles to meters
        const buffer = geometryEngine.geodesicBuffer(point, bufferDistance, 'meters') as Polygon;
        
        if (buffer) {
          // Create graphic for coverage area
          const coverageGraphic = new Graphic({
            geometry: buffer,
            symbol: new SimpleFillSymbol({
              color: [255, 107, 107, 0.4], // Red with 0.4 opacity matching radio tower color
              outline: {
                color: [255, 107, 107, 0.8],
                width: 1.5,
                style: 'dash'
              }
            }),
            attributes: {
              ...feature.attributes,
              COVERAGE_TYPE: 'RADIO_COVERAGE',
              RADIUS_MILES: radiusInMiles
            }
          });
          
          coverageGraphics.push(coverageGraphic);
        }
      }
    });
    
    // Create a separate coverage layer
    if (coverageGraphics.length > 0) {
      const coverageLayer = new FeatureLayer({
        source: coverageGraphics,
        id: `${layerId}_coverage`,
        title: `${layerName} Coverage`,
        objectIdField: 'OBJECTID',
        fields: [
          { name: 'OBJECTID', type: 'oid' },
          { name: 'COVERAGE_TYPE', type: 'string' },
          { name: 'RADIUS_MILES', type: 'double' }
        ],
        geometryType: 'polygon',
        spatialReference: view.spatialReference,
        renderer: new SimpleRenderer({
          symbol: new SimpleFillSymbol({
            color: [255, 107, 107, 0.4], // Red with 0.4 opacity
            outline: {
              color: [255, 107, 107, 0.8],
              width: 1.5,
              style: 'dash'
            }
          })
        }),
        visible: false,
        opacity: 1.0,
        minScale: 0,
        maxScale: 0
      });
      
      // Add coverage layer to map BEFORE the point layer so circles appear behind towers
      view.map.add(coverageLayer, view.map.layers.length);
      
      // Link coverage layer visibility to radio station layer
      radioLayer.watch('visible', (visible) => {
        coverageLayer.visible = visible;
      });
      
      console.log(`📡 Created radio coverage layer with ${coverageGraphics.length} coverage areas`);
    }
    
  } catch (error) {
    console.error('Error creating radio coverage areas:', error);
  }

  console.log(`📻 Created radio station layer with tower icons: ${layerName}`);
  return radioLayer;
}

/**
 * Create enhanced point layers based on type
 */
export async function createEnhancedPointLayer(
  layerConfig: any,
  view: __esri.MapView
): Promise<FeatureLayer | null> {
  
  try {
    if (layerConfig.id === 'movie_theaters') {
      return await createTheaterLayer(layerConfig.url, layerConfig.id, layerConfig.name);
    } else if (layerConfig.id === 'radio_stations') {
      return await createRadioStationLayer(layerConfig.url, layerConfig.id, layerConfig.name, view);
    }
    
    // Fallback to regular feature layer
    const layer = new FeatureLayer({
      url: layerConfig.url,
      id: layerConfig.id,
      title: layerConfig.name,
      outFields: ['*'],
      popupEnabled: false,
      visible: false
    });
    
    await layer.load();
    return layer;
    
  } catch (error) {
    console.error(`Error creating enhanced point layer ${layerConfig.name}:`, error);
    return null;
  }
}