import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import type Renderer from "@arcgis/core/renderers/Renderer";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";

// Type for renderer properties that can be used to create ArcGIS renderers
export type RendererProperties = {
  type: string;
  symbol?: {
    type: string;
    color?: number[];
    outline?: {
      color: number[];
      width: number;
    };
    [key: string]: any;
  };
  field?: string;
  valueExpression?: string;
  uniqueValueInfos?: Array<{
    value: string;
    label: string;
    symbol: {
      type: string;
      color: number[];
      outline?: {
        color: number[];
        width: number;
      };
    };
  }>;
  [key: string]: any;
};

/**
 * Get the default renderer for a specific layer
 * @param layerType The type of the layer
 * @param rendererField Optional field name to render by
 * @returns Renderer properties object
 */
export const getDefaultLayerRenderer = (
  layerType: 'point' | 'index' | 'demographic' | 'percentage' | 'feature-service',
  rendererField?: string
): __esri.Renderer => {
  switch (layerType) {
    case 'percentage':
    case 'index':
    case 'demographic':
    case 'feature-service':
      // Create a quartile renderer for data-driven layers
      return new ClassBreaksRenderer({
        field: rendererField || 'thematic_value',
        classBreakInfos: [
          {
            minValue: 0,
            maxValue: 25,
            symbol: new SimpleFillSymbol({
              color: [255, 0, 64, 0.6], // #d73027 - Strong red (lowest values)
              outline: { color: [0, 0, 0, 0], width: 0 }
            }),
            label: '0% - 25% (Lowest)'
          },
          {
            minValue: 25,
            maxValue: 50,
            symbol: new SimpleFillSymbol({
              color: [255, 191, 0, 0.6], // #fdae61 - Orange
              outline: { color: [0, 0, 0, 0], width: 0 }
            }),
            label: '25% - 50% (Low)'
          },
          {
            minValue: 50,
            maxValue: 75,
            symbol: new SimpleFillSymbol({
              color: [0, 255, 64, 0.6], // #a6d96a - Light green
              outline: { color: [0, 0, 0, 0], width: 0 }
            }),
            label: '50% - 75% (High)'
          },
          {
            minValue: 75,
            maxValue: 100,
            symbol: new SimpleFillSymbol({
              color: [0, 255, 128, 0.6], // #1a9850 - Dark green (highest values)
              outline: { color: [0, 0, 0, 0], width: 0 }
            }),
            label: '75% - 100% (Highest)'
          }
        ]
      });
      
    default:
      return new SimpleRenderer({
        symbol: new SimpleFillSymbol({
          color: [0, 120, 255, 0.5],
          outline: { color: [0, 0, 0, 0], width: 0 }
        })
      });
  }
};

/**
 * Creates an ArcGIS Renderer instance from renderer properties
 * @param properties Renderer properties
 * @returns ArcGIS Renderer instance
 */
export const createRenderer = (properties: RendererProperties): Renderer => {
  if (properties.type === 'simple') {
    if (properties.symbol && !(properties.symbol instanceof SimpleMarkerSymbol) && !(properties.symbol instanceof SimpleFillSymbol)) {
      const symbol = new SimpleMarkerSymbol(properties.symbol as any);
      return new SimpleRenderer({ ...properties, symbol } as any);
    }
    return new SimpleRenderer(properties as any);
  } else if (properties.type === 'unique-value') {
    if (properties.uniqueValueInfos) {
      const uniqueValueInfos = properties.uniqueValueInfos.map(info => ({
        ...info,
        symbol: (info.symbol instanceof SimpleMarkerSymbol || info.symbol instanceof SimpleFillSymbol)
          ? info.symbol
          : new SimpleMarkerSymbol(info.symbol as any)
      }));
      return new UniqueValueRenderer({ ...properties, uniqueValueInfos } as any);
    }
    return new UniqueValueRenderer(properties as any);
  }
  
  // Add support for other renderer types as needed
  
  // Default to SimpleRenderer
  return new SimpleRenderer(properties as any);
}; 