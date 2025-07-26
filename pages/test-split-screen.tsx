import React, { useState } from 'react';
import { VisualizationWrapper } from '@/components/map/VisualizationWrapper';

// Mock visualization data
const mockVisualizationResult = {
  layer: {
    title: 'Test Visualization',
    source: [
      {
        attributes: {
          OBJECTID: 1,
          NAME: 'Test Area 1',
          POPULATION: 100000,
          CATEGORY: 'High'
        },
        geometry: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749]
        }
      },
      {
        attributes: {
          OBJECTID: 2,
          NAME: 'Test Area 2',
          POPULATION: 75000,
          CATEGORY: 'Medium'
        },
        geometry: {
          type: 'Point',
          coordinates: [-122.4094, 37.7849]
        }
      }
    ],
    renderer: {
      field: 'POPULATION',
      type: 'class-breaks'
    }
  }
};

export default function TestSplitScreen() {
  const [hasVisualization, setHasVisualization] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // Track page refreshes
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('🔄 Page is about to refresh!');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const triggerVisualization = () => {
    console.log('🎯 Triggering visualization...');
    setHasVisualization(true);
    setRefreshCount(prev => prev + 1);
  };

  const clearVisualization = () => {
    console.log('🧹 Clearing visualization...');
    setHasVisualization(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Split Screen Test Page</h1>
        
        {/* Test Controls */}
        <div className="mb-4 space-x-2">
          <button
            onClick={triggerVisualization}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Trigger Visualization
          </button>
          <button
            onClick={clearVisualization}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear Visualization
          </button>
        </div>

        {/* Status */}
        <div className="mb-4 p-3 bg-white rounded border">
          <div className="text-sm">
            <div>Visualization Active: <span className={hasVisualization ? 'text-green-600' : 'text-red-600'}>{hasVisualization ? 'Yes' : 'No'}</span></div>
            <div>Refresh Count: <span className="font-mono">{refreshCount}</span></div>
          </div>
        </div>

        {/* Console Output */}
        <div className="mb-4 p-3 bg-black text-green-400 rounded font-mono text-sm">
          <div>Console Output:</div>
          <div>• Open browser dev tools to see [SPLIT] messages</div>
          <div>• If page refreshes, you'll see a beforeunload message</div>
          <div>• Now testing with real Kepler.gl component</div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative" style={{ height: '500px' }}>
        <VisualizationWrapper
          mapView={null}
          containerHeight={500}
          sidebarWidth={300}
          visualizationResult={hasVisualization ? mockVisualizationResult : null}
        >
          {/* Mock ESRI Map */}
          <div className="w-full h-full bg-blue-100 flex items-center justify-center border-2 border-blue-300">
            <div className="text-center">
              <div className="text-2xl mb-2">🗺️</div>
              <div className="text-blue-800 font-semibold">Mock ESRI Map</div>
              <div className="text-sm text-blue-600">This represents the main map view</div>
            </div>
          </div>
        </VisualizationWrapper>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-white m-4 rounded border">
        <h3 className="font-semibold mb-2">Test Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click "Trigger Visualization" to show the split screen</li>
          <li>Look for the drag bar at the right edge of the map</li>
          <li>Drag the bar left to reveal the Kepler.gl placeholder</li>
          <li>Check console for [SPLIT] messages</li>
          <li>Verify the page doesn't refresh (refresh count stays the same)</li>
        </ol>
      </div>
    </div>
  );
} 