import { useEffect, useRef } from 'react';
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Polygon from "@arcgis/core/geometry/Polygon";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";

interface GraphicsManagerProps {
  view: __esri.MapView;
}

const GraphicsManager = ({ view }: GraphicsManagerProps): null => {
  const graphicsLayerRef = useRef<__esri.GraphicsLayer | null>(null);

  useEffect(() => {
    if (!view || view.destroyed) return;

    const tryForceLayerVisibility = () => {
      const forceVisible = () => {
        if (graphicsLayerRef.current) {
          // Force layer visibility
          Object.defineProperty(graphicsLayerRef.current, 'visible', {
            get: () => true,
            set: () => true,
            configurable: true
          });

          // Force all existing graphics to be visible
          graphicsLayerRef.current.graphics.forEach((graphic) => {
            Object.defineProperty(graphic, 'visible', {
              get: () => true,
              set: () => true,
              configurable: true
            });
          });

          // Ensure the layer is in the map
          if (!view.map.layers.includes(graphicsLayerRef.current)) {
            view.map.add(graphicsLayerRef.current);
          }
        }
      };

      // Try forcing visibility multiple times
      forceVisible();
      setTimeout(forceVisible, 100);
      setTimeout(forceVisible, 500);
      setTimeout(forceVisible, 1000);
    };

    // Create new graphics layer if it doesn't exist
    if (!graphicsLayerRef.current) {
      const layer = new GraphicsLayer({
        title: "Sketch Layer",
        listMode: "hide"
      });

      // Save reference and force visibility
      graphicsLayerRef.current = layer;
      tryForceLayerVisibility();

      // Setup a mutation observer to watch for view changes
      const observer = new MutationObserver(() => {
        tryForceLayerVisibility();
      });

      if (view.container) {
        observer.observe(view.container, {
          childList: true,
          subtree: true,
          attributes: true
        });
      }

      // Set up periodic check
      const intervalId = setInterval(tryForceLayerVisibility, 1000);

      // Return cleanup function
      return () => {
        observer.disconnect();
        clearInterval(intervalId);
        if (graphicsLayerRef.current && !view.destroyed) {
          view.map.remove(graphicsLayerRef.current);
          graphicsLayerRef.current.destroy();
          graphicsLayerRef.current = null;
        }
      };
    }
  }, [view]);

  return null;
};

export default GraphicsManager;