'use client';

import React, { useState, useEffect } from 'react';
import { testQueries, TestQuery, runTestQuery, TestResult } from '@/utils/test-queries';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { layers } from '@/config/layers';

const createLayerFromConfig = (config: any) => {
  return new FeatureLayer({
    url: config.url,
    title: config.name,
    visible: config.isVisible,
    outFields: ['*']
  });
};

export default function TestRunner() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<TestQuery | null>(null);
  const [mapView, setMapView] = useState<__esri.MapView | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Create a new map
        const map = new Map({
          basemap: "topo-vector",
          layers: Object.values(layers).map(createLayerFromConfig)
        });

        // Create a new map view
        const view = new MapView({
          container: "mapView",
          map: map,
          constraints: {
            snapToZoom: false,
            minZoom: 0,
            maxZoom: 24
          }
        });

        // Wait for the view to be ready
        await view.when();
        setMapView(view);
        setMapError(null);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize map. Please refresh the page.');
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (mapView) {
        mapView.destroy();
      }
    };
  }, [mapView]);

  const runAllTests = async () => {
    if (!mapView) {
      setResults((prev: any) => [...prev, {
        query: 'All Tests',
        layers: [],
        visualization: '',
        timestamp: new Date().toISOString(),
        error: 'Map not initialized. Please wait for map to load.'
      }]);
      return;
    }

    setIsRunning(true);
    setResults([]);
    
    for (const query of testQueries) {
      setCurrentQuery(query);
      await new Promise<void>((resolve, reject) => {
        runTestQuery(
          query,
          mapView,
          (result) => {
            setResults((prev: any) => [...prev, result]);
            resolve();
          },
          (error) => {
            setResults((prev: any) => [...prev, {
              query: query.query,
              layers: [],
              visualization: '',
              timestamp: new Date().toISOString(),
              error: error.message
            }]);
            reject(error);
          }
        );
      });
    }
    
    setIsRunning(false);
    setCurrentQuery(null);
  };

  const runSingleTest = async (query: TestQuery) => {
    if (!mapView) {
      setResults((prev: any) => [...prev, {
        query: query.query,
        layers: [],
        visualization: '',
        timestamp: new Date().toISOString(),
        error: 'Map not initialized. Please wait for map to load.'
      }]);
      return;
    }

    setIsRunning(true);
    setCurrentQuery(query);
    
    await new Promise<void>((resolve, reject) => {
      runTestQuery(
        query,
        mapView,
        (result) => {
          setResults((prev: any) => [...prev, result]);
          resolve();
        },
        (error) => {
          setResults((prev: any) => [...prev, {
            query: query.query,
            layers: [],
            visualization: '',
            timestamp: new Date().toISOString(),
            error: error.message
          }]);
          reject(error);
        }
      );
    });
    
    setIsRunning(false);
    setCurrentQuery(null);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Query Test Runner</h2>
      
      {mapError && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {mapError}
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={runAllTests}
          disabled={isRunning || !mapView}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>

      {currentQuery && (
        <div className="mb-4 p-4 bg-yellow-100 rounded">
          <h3 className="font-bold">Currently Running:</h3>
          <p>{currentQuery.query}</p>
          <p className="text-sm text-gray-600">{currentQuery.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-xl font-bold mb-2">Test Queries</h3>
          <div className="space-y-2">
            {testQueries.map((query, index) => (
              <div
                key={index}
                className={`p-4 border rounded hover:bg-gray-50 cursor-pointer ${
                  !mapView ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => mapView && runSingleTest(query)}
              >
                <p className="font-medium">{query.query}</p>
                <p className="text-sm text-gray-600">{query.description}</p>
                <div className="mt-2">
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                    {query.complexity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-2">Test Results</h3>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 border rounded ${
                  result.error ? 'bg-red-50' : 'bg-green-50'
                }`}
              >
                <p className="font-medium">{result.query}</p>
                {result.error ? (
                  <p className="text-red-600">{result.error}</p>
                ) : (
                  <>
                    <p className="text-sm">
                      Layers: {result.layers.join(', ')}
                    </p>
                    <p className="text-sm">
                      Visualization: {result.visualization}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleString()}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="mapView" className="mt-4 h-[400px] w-full rounded-lg border"></div>
    </div>
  );
} 