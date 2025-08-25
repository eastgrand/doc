/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useEffect, useRef } from 'react';
import { Users, DollarSign, Building, Info, X } from 'lucide-react';
import Extent from "@arcgis/core/geometry/Extent";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";
import Color from "@arcgis/core/Color";
import Graphic from "@arcgis/core/Graphic";
import Polygon from "@arcgis/core/geometry/Polygon";
import { ACTIVE_COLOR_SCHEME } from '@/utils/renderer-standardization';

// Pre-joined data interfaces
export interface PreJoinedSampleAreasData {
  version: string;
  generated: string;
  project: {
    name: string;
    industry: string;
    primaryBrand?: string;
  };
  areas: SampleAreaData[];
}

export interface SampleAreaData {
  // Geographic Identity
  zipCode: string;
  city: string;
  county: string;
  state: string;
  
  // Geometry
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  bounds: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };
  
  // Statistics
  stats: {
    // Core demographics
    population: number;
    populationDensity: number;
    medianIncome: number;
    medianAge: number;
    
    // Generational data
    genZ_percent: number;
    millennial_percent: number;
    genX_percent: number;
    boomer_percent: number;
    genAlpha_percent?: number;
    
    // Financial behavior
    creditCardDebt_percent: number;
    savingsAccount_percent: number;
    investmentAssets_avg: number;
    bankUsage_percent: number;
    
    // Digital adoption
    applePay_percent: number;
    googlePay_percent: number;
    onlineTax_percent: number;
    cryptoOwnership_percent: number;
    
    // Business/Economic
    businessCount: number;
    businessDensity: number;
    marketOpportunity_score: number;
    
    // Project-specific brand data
    primaryBrand_percent?: number;
    competitor1_percent?: number;
    competitor2_percent?: number;
  };
  
  // Pre-calculated analysis scores
  analysisScores: {
    youngProfessional: number;    // 0-100
    financialOpportunity: number; // 0-100
    digitalAdoption: number;      // 0-100
    growthMarket: number;         // 0-100
    investmentActivity: number;   // 0-100
  };
  
  // Metadata
  dataQuality: number; // 0-1 score
  lastUpdated: string;
}

// Individual ZIP code interface - Red Bull energy drink project data fields
export interface ZipCodeArea {
  zipCode: string;
  city: string;
  // Red Bull project specific demographic data fields
  redBull_percent: number;              // 'Red Bull Drinkers (%)'
  energyDrink_percent: number;          // 'Energy Drink Consumers (%)'
  monsterEnergy_percent: number;        // 'Monster Energy Drinkers (%)'
  fiveHourEnergy_percent: number;       // '5-Hour Energy Drinkers (%)'
  exerciseRegularly_percent: number;    // 'Exercise Regularly Users (%)'
  seekNutritionInfo_percent: number;    // 'Seek Nutrition Info Users (%)'
  sugarFreeFoods_percent: number;       // 'Sugar-Free Foods Buyers (%)'
  genZ_percent: number;                 // 'Generation Z Population (%)'
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  bounds: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };
}

// City grouping interface
export interface DisplaySampleArea {
  id: string;
  name: string;
  zipCodes: ZipCodeArea[];
  combinedBounds: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };
}

interface SampleAreasPanelProps {
  view: __esri.MapView;
  onClose: () => void;
  visible: boolean;
}

// These constants are no longer needed with the simplified approach

// Helper function to safely convert values to numbers for ArcGIS
const safeNumber = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  return isNaN(num) ? 0 : num;
};

export default function SampleAreasPanel({ view, onClose, visible }: SampleAreasPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Removed preJoinedData state as we're using simplified mock data
  const [displayAreas, setDisplayAreas] = useState<DisplaySampleArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [choroplethLayers, setChoroplethLayers] = useState<Map<string, __esri.FeatureLayer>>(new Map());
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  // Removed showLegendTooltip - legend now in main header tooltip

  // Widget positioning effect
  useEffect(() => {
    if (!view || !containerRef.current) return;

    const container = containerRef.current;
    
    if (visible) {
      // Add to map UI as widget
      try {
        view.ui.add({
          component: container,
          position: "top-left",
          index: 2
        });
        container.style.display = 'block';
      } catch (error) {
        console.error('Error adding Quick Stats widget to map UI:', error);
      }
    } else {
      // Remove from map UI
      try {
        view.ui.remove(container);
        container.style.display = 'none';
      } catch (error) {
        console.error('Error removing Quick Stats widget from map UI:', error);
      }
    }

    return () => {
      try {
        view.ui.remove(container);
      } catch (error) {
        // Ignore cleanup errors
      }
    };
  }, [view, visible]);

  // Load pre-joined data on mount
  useEffect(() => {
    if (!visible) return;
    loadPreJoinedData();
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // Select random metrics once when component mounts or data changes
  // Red Bull project specific metrics from the actual data
  const selectRandomMetrics = () => {
    const redBullMetricKeys = [
      'redBull_percent',             // 'Red Bull Drinkers (%)'
      'energyDrink_percent',         // 'Energy Drink Consumers (%)'
      'monsterEnergy_percent',       // 'Monster Energy Drinkers (%)'
      'fiveHourEnergy_percent',      // '5-Hour Energy Drinkers (%)'
      'exerciseRegularly_percent',   // 'Exercise Regularly Users (%)'
      'seekNutritionInfo_percent',   // 'Seek Nutrition Info Users (%)'
      'sugarFreeFoods_percent',      // 'Sugar-Free Foods Buyers (%)'
      'genZ_percent'                 // 'Generation Z Population (%)'
    ];
    
    const shuffled = [...redBullMetricKeys].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  };

  const loadPreJoinedData = async () => {
    console.log('[SampleAreasPanel] Loading pre-joined data...');
    setLoading(true);
    
    try {
      // Try to load pre-generated sample areas data (real demographic data)
      const response = await fetch('/data/sample_areas_data_real.json');
      
      if (response.ok) {
        console.log('[SampleAreasPanel] Successfully fetched sample areas data');
        const sampleData = await response.json();
        console.log('[SampleAreasPanel] Sample data loaded, areas count:', sampleData.areas?.length);
        // Convert pre-joined data to display areas
        processRealSampleData(sampleData);
      } else {
        console.log('[SampleAreasPanel] Pre-joined data not found - response not ok');
        setDisplayAreas([]);
      }
    } catch (error) {
      console.error('[SampleAreasPanel] Error loading sample areas data:', error);
      setDisplayAreas([]);
    } finally {
      setLoading(false);
    }
  };

  const processRealSampleData = (sampleData: any) => {
    console.log('[SampleAreasPanel] STEP 1 - Processing real sample areas data:', sampleData.areas?.length, 'areas');
    
    // Select random metrics for this session
    const randomMetrics = selectRandomMetrics();
    setSelectedMetrics(randomMetrics);
    console.log('[SampleAreasPanel] STEP 2 - Selected random metrics:', randomMetrics);
    
    // Group areas by city
    const citiesMap = new Map<string, any[]>();
    
    sampleData.areas.forEach((area: any, index: number) => {
      if (index < 5) {
        console.log(`[SampleAreasPanel] STEP 3a - Sample area ${index}:`, {
          zipCode: area.zipCode,
          city: area.city,
          hasGeometry: !!area.geometry,
          hasDemographics: !!area.demographics,
          demographicsKeys: area.demographics ? Object.keys(area.demographics).length : 0
        });
      }
      
      const cityKey = area.city.toLowerCase();
      if (!citiesMap.has(cityKey)) {
        citiesMap.set(cityKey, []);
      }
      citiesMap.get(cityKey)!.push(area);
    });
    
    console.log('[SampleAreasPanel] STEP 3b - Cities grouped:', Array.from(citiesMap.keys()).map(city => `${city}: ${citiesMap.get(city)?.length} ZIPs`));
    
    // Convert to DisplaySampleArea format
    const areas: DisplaySampleArea[] = [];
    
    citiesMap.forEach((zipAreas, cityKey) => {
      const cityName = zipAreas[0].city;
      console.log(`[SampleAreasPanel] STEP 4a - Processing city ${cityName} with ${zipAreas.length} ZIP codes`);
      
      // Convert areas to ZipCodeArea format with real geometry and demographics
      const zipCodes: ZipCodeArea[] = zipAreas.map((area, index) => {
        const demo = area.demographics;
        
        if (index < 3) {
          console.log(`[DEBUG] ${cityName} ZIP ${area.zipCode}:`);
          console.log('  Demographics keys:', demo ? Object.keys(demo) : 'NO DEMO');
          console.log('  Red Bull value:', demo ? demo['Red Bull Drinkers (%)'] : 'NO DEMO');
          console.log('  Red Bull type:', demo ? typeof demo['Red Bull Drinkers (%)'] : 'NO DEMO');
          console.log('  Energy Drink value:', demo ? demo['Energy Drink Consumers (%)'] : 'NO DEMO');
          console.log('  Energy Drink type:', demo ? typeof demo['Energy Drink Consumers (%)'] : 'NO DEMO');
          console.log('  After safeNumber - Red Bull:', safeNumber(demo['Red Bull Drinkers (%)']));
          console.log('  After safeNumber - Energy Drink:', safeNumber(demo['Energy Drink Consumers (%)']));
        }
        
        return {
          zipCode: area.zipCode,
          city: area.city,
          geometry: area.geometry, // Use real polygon geometry
          bounds: area.bounds,
          // Red Bull project specific fields from the actual data
          redBull_percent: safeNumber(demo['Red Bull Drinkers (%)']),
          energyDrink_percent: safeNumber(demo['Energy Drink Consumers (%)']),
          monsterEnergy_percent: safeNumber(demo['Monster Energy Drinkers (%)']),
          fiveHourEnergy_percent: safeNumber(demo['5-Hour Energy Drinkers (%)']),
          exerciseRegularly_percent: safeNumber(demo['Exercise Regularly Users (%)']),
          seekNutritionInfo_percent: safeNumber(demo['Seek Nutrition Info Users (%)']),
          sugarFreeFoods_percent: safeNumber(demo['Sugar-Free Foods Buyers (%)']),
          genZ_percent: safeNumber(demo['Generation Z Population (%)'])
        };
      });
      
      // Calculate combined bounds
      const combinedBounds = zipCodes.reduce((bounds, zip) => {
        if (!zip.bounds) {
          console.log(`[SampleAreasPanel] WARNING: ZIP ${zip.zipCode} has no bounds`);
          return bounds;
        }
        return {
          xmin: Math.min(bounds.xmin, zip.bounds.xmin),
          ymin: Math.min(bounds.ymin, zip.bounds.ymin),
          xmax: Math.max(bounds.xmax, zip.bounds.xmax),
          ymax: Math.max(bounds.ymax, zip.bounds.ymax)
        };
      }, {
        xmin: Infinity,
        ymin: Infinity,
        xmax: -Infinity,
        ymax: -Infinity
      });
      
      areas.push({
        id: cityKey,
        name: cityName,
        zipCodes,
        combinedBounds
      });
      
      console.log(`[SampleAreasPanel] STEP 4d - ${cityName} final area created with bounds:`, combinedBounds);
    });
    
    setDisplayAreas(() => areas);
    console.log('[SampleAreasPanel] STEP 5 - Created', areas.length, 'display areas from real data');
    console.log('[SampleAreasPanel] STEP 5 - Available cities:', areas.map(a => `${a.name} (${a.zipCodes.length} ZIPs)`));
    
    // Create the choropleth layers on the map
    createChoroplethLayers(areas);
    
    // Don't auto-zoom - let MapClient handle initial view
    // setTimeout(() => zoomToLosAngeles(), 1000);
  };

  // This function is no longer needed with the new simplified approach
  // generateDisplayAreas is replaced by direct mock data creation

  // Mock data generation removed - only real data is used

  const createChoroplethLayers = (areas: DisplaySampleArea[]) => {
    console.log('[SampleAreasPanel] STEP 6 - Creating city-level choropleth layers for', areas.length, 'cities');
    if (!view) {
      console.log('[SampleAreasPanel] No view available for layer creation');
      return;
    }

    // Clear any existing sample area graphics first
    clearAllSamples();

    const newLayers = new Map<string, __esri.FeatureLayer>();
    let globalObjectId = 1;

    // Create separate layer for each city with its own classification
    for (const area of areas) {
      console.log(`[SampleAreasPanel] STEP 6a - Creating layer for ${area.name} with ${area.zipCodes.length} ZIP codes`);
      const cityGraphics: __esri.Graphic[] = [];
      let graphicsCreated = 0;
      let graphicsErrors = 0;
      
      // Collect all graphics for this city
      for (const zipCode of area.zipCodes) {
        try {
          const polygon = new Polygon({
            rings: zipCode.geometry.coordinates,
            spatialReference: { wkid: 4326 }
          });

          const attributes = {
            OBJECTID: globalObjectId++,
            zipCode: zipCode.zipCode,
            city: zipCode.city,
            // Red Bull project specific attributes
            redBull_percent: zipCode.redBull_percent,
            energyDrink_percent: zipCode.energyDrink_percent,
            monsterEnergy_percent: zipCode.monsterEnergy_percent,
            fiveHourEnergy_percent: zipCode.fiveHourEnergy_percent,
            exerciseRegularly_percent: zipCode.exerciseRegularly_percent,
            seekNutritionInfo_percent: zipCode.seekNutritionInfo_percent,
            sugarFreeFoods_percent: zipCode.sugarFreeFoods_percent,
            genZ_percent: zipCode.genZ_percent
          };
          
          // Log first few attributes to see what we're passing to ArcGIS
          if (graphicsCreated < 3) {
            console.log(`[DEBUG] ${area.name} ZIP ${zipCode.zipCode} attributes:`, attributes);
          }

          const graphic = new Graphic({
            geometry: polygon,
            attributes
          });

          cityGraphics.push(graphic);
          graphicsCreated++;
        } catch (error) {
          console.error(`[SampleAreasPanel] STEP 6b - Error creating graphic for ZIP ${zipCode.zipCode}:`, error);
          graphicsErrors++;
        }
      }
      
      console.log(`[SampleAreasPanel] STEP 6c - ${area.name}: ${graphicsCreated} graphics created, ${graphicsErrors} errors`);

      // Skip ArcGIS FeatureLayer validation - just add graphics directly to map with manual styling
      if (cityGraphics.length > 0) {
        console.log(`[SampleAreasPanel] STEP 6d - Adding ${cityGraphics.length} graphics directly to map for ${area.name}`);
        
        // Calculate city-specific quartiles for coloring
        const firstMetric = selectedMetrics[0] || 'redBull_percent';
        const metricValues = area.zipCodes.map(z => z[firstMetric as keyof ZipCodeArea] as number).sort((a, b) => a - b);
        const cityBreaks = calculateMetricQuartiles(metricValues, firstMetric);
        
        // Apply colors directly to graphics based on quartiles
        cityGraphics.forEach(graphic => {
          const value = graphic.attributes[firstMetric];
          let colorIndex = 0;
          if (value > cityBreaks[3]) colorIndex = 3;
          else if (value > cityBreaks[2]) colorIndex = 2;
          else if (value > cityBreaks[1]) colorIndex = 1;
          
          graphic.symbol = new SimpleFillSymbol({
            color: [parseInt(ACTIVE_COLOR_SCHEME[colorIndex].slice(1, 3), 16), 
                   parseInt(ACTIVE_COLOR_SCHEME[colorIndex].slice(3, 5), 16), 
                   parseInt(ACTIVE_COLOR_SCHEME[colorIndex].slice(5, 7), 16), 0.6],
            outline: {
              color: [0, 0, 0, 0],
              width: 0
            }
          });
        });
        
        // Add graphics directly to map view - no FeatureLayer validation
        view.graphics.addMany(cityGraphics);
        console.log(`[SampleAreasPanel] STEP 6e - Added ${cityGraphics.length} graphics directly to map for ${area.name}`);
      } else {
        console.warn(`[SampleAreasPanel] STEP 6f - No graphics created for ${area.name}, skipping`);
      }
    }
    
    console.log(`[SampleAreasPanel] STEP 7 - Layer creation complete. Total layers: ${newLayers.size}`);
    setChoroplethLayers(newLayers);
  };
  
  const zoomToLosAngeles = () => {
    if (!view) return;

    console.log('[zoomToLosAngeles] Looking for Los Angeles in areas:', displayAreas.map(a => a.id));
    
    // Find Los Angeles area in displayAreas
    const losAngelesArea = displayAreas.find(area => area.id === 'los angeles');
    if (losAngelesArea) {
      console.log('[zoomToLosAngeles] Found Los Angeles area, zooming...');
      handleAreaClick(losAngelesArea);
    } else {
      console.log('[zoomToLosAngeles] Los Angeles area not found, using fallback coordinates');
      // Fallback: manually zoom to Los Angeles coordinates
      const losAngelesExtent = new Extent({
        xmin: -118.7,
        ymin: 33.9,
        xmax: -118.0,
        ymax: 34.3,
        spatialReference: { wkid: 4326 }
      });
      
      view.goTo(losAngelesExtent, {
        duration: 2000,
        easing: 'ease-in-out'
      }).catch(error => {
        console.error('Error zooming to Los Angeles:', error);
      });
      
      console.log('[SampleAreasPanel] Zoomed to Los Angeles fallback coordinates');
    }
  };
  
  const zoomToCombinedExtent = (areas: DisplaySampleArea[]) => {
    if (!view || areas.length === 0) return;
    
    // Calculate overall bounds from all cities
    const overallBounds = areas.reduce((bounds, area) => ({
      xmin: Math.min(bounds.xmin, area.combinedBounds.xmin),
      ymin: Math.min(bounds.ymin, area.combinedBounds.ymin),
      xmax: Math.max(bounds.xmax, area.combinedBounds.xmax),
      ymax: Math.max(bounds.ymax, area.combinedBounds.ymax)
    }), {
      xmin: Infinity,
      ymin: Infinity,
      xmax: -Infinity,
      ymax: -Infinity
    });
    
    try {
      const extent = new Extent({
        xmin: overallBounds.xmin,
        ymin: overallBounds.ymin,
        xmax: overallBounds.xmax,
        ymax: overallBounds.ymax,
        spatialReference: { wkid: 4326 }
      });

      view.goTo(extent, {
        duration: 2000,
        easing: 'ease-in-out'
      }).catch(error => {
        console.error('Error zooming to combined extent:', error);
      });
      
      console.log('[SampleAreasPanel] Zoomed to combined extent of all ZIP codes');
    } catch (error) {
      console.error('Error creating combined extent:', error);
    }
  };

// Field creation moved inline to createChoroplethLayers

  const calculateCityQuartiles = (values: number[]) => {
    // Calculate quartile breaks for a city's population values
    if (values.length === 0) return [0, 40000, 60000, 80000, 100000];
    
    const sorted = [...values].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q2Index = Math.floor(sorted.length * 0.5);
    const q3Index = Math.floor(sorted.length * 0.75);
    
    return [
      sorted[0],
      sorted[q1Index],
      sorted[q2Index],
      sorted[q3Index],
      sorted[sorted.length - 1]
    ];
  };

  const calculateMetricQuartiles = (values: number[], metricType: string) => {
    // Calculate quartile breaks appropriate for different metric types
    if (values.length === 0) {
      // Default breaks based on metric type
      if (metricType.includes('_percent')) {
        return [0, 10, 20, 30, 40]; // Percentage defaults
      } else if (metricType === 'investmentAssets_avg') {
        return [0, 10000, 25000, 50000, 100000]; // Dollar amount defaults
      } else {
        return [0, 40000, 60000, 80000, 100000]; // General numeric defaults
      }
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q2Index = Math.floor(sorted.length * 0.5);
    const q3Index = Math.floor(sorted.length * 0.75);
    
    return [
      sorted[0],
      sorted[q1Index],
      sorted[q2Index],
      sorted[q3Index],
      sorted[sorted.length - 1]
    ];
  };

  const createCitySpecificRenderer = (breaks: number[], renderingField: string) => {
    // Use the centralized Firefly color scheme
    const fireflyColors = ACTIVE_COLOR_SCHEME;

    return new ClassBreaksRenderer({
      field: renderingField, // Use the first selected metric instead of hardcoded 'population'
      classBreakInfos: fireflyColors.map((color: string, index: number) => ({
        minValue: index === 0 ? -Infinity : breaks[index],
        maxValue: index === fireflyColors.length - 1 ? Infinity : breaks[index + 1],
        symbol: new SimpleFillSymbol({
          color: [parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16), 0.6], // Direct RGB conversion
          outline: {
            color: [0, 0, 0, 0],
            width: 0
          }
        }),
        label: index === 0 ? `< ${breaks[1].toLocaleString()}` :
               index === fireflyColors.length - 1 ? `> ${breaks[index].toLocaleString()}` :
               `${breaks[index].toLocaleString()} - ${breaks[index + 1].toLocaleString()}`
      }))
    });
  };

  // Removed global createChoroplethRenderer - now using city-specific renderers

  const handleAreaClick = async (area: DisplaySampleArea) => {
    if (!view) return;
    
    setSelectedArea(area.id);

    try {
      // Zoom to combined area bounds
      const bounds = area.combinedBounds;
      const extent = new Extent({
        xmin: bounds.xmin,
        ymin: bounds.ymin,
        xmax: bounds.xmax,
        ymax: bounds.ymax,
        spatialReference: { wkid: 4326 }
      });
      
      // DEBUG: Log the exact extent being used for Los Angeles
      if (area.id === 'los angeles') {
        console.log('[handleAreaClick] Los Angeles extent:', {
          original: bounds,
          used: {
            xmin: extent.xmin,
            ymin: extent.ymin,
            xmax: extent.xmax,
            ymax: extent.ymax
          }
        });
      }

      await view.goTo(extent, {
        duration: 1500,
        easing: 'ease-in-out'
      });
    } catch (error) {
      console.error('Error zooming to area:', error);
    }
  };

  const clearAllSamples = () => {
    // Remove all sample area graphics from map view
    if (view && view.graphics) {
      // Filter out only our sample area graphics (those with zipCode attribute)
      const sampleGraphics = view.graphics.toArray().filter(graphic => 
        graphic.attributes && graphic.attributes.zipCode
      );
      console.log(`[SampleAreasPanel] Removing ${sampleGraphics.length} sample area graphics`);
      view.graphics.removeMany(sampleGraphics);
    }
  setChoroplethLayers(new Map());
  setSelectedArea(null);
  };

  // Store layers in a ref to persist across re-renders
  const persistentLayersRef = useRef<Map<string, __esri.FeatureLayer>>(new Map());
  
  // Sync persistent ref with state
  useEffect(() => {
    persistentLayersRef.current = choroplethLayers;
  }, [choroplethLayers]);
  
  // Clear graphics when panel is closed - but NOT during theme switches
  useEffect(() => {
    // Skip clearing during theme switches or initial mount
    if (!visible && displayAreas.length > 0) {
      // Check if this is a theme switch using multiple methods
      const isThemeSwitch = document.documentElement.hasAttribute('data-theme-switching') || 
                           window.__themeTransitioning === true;
      
      if (!isThemeSwitch) {
        console.log('[SampleAreasPanel] Panel hidden - clearing graphics');
        clearAllSamples();
      } else {
        console.log('[SampleAreasPanel] Theme switching detected - preserving graphics');
      }
    }
  }, [visible]);
  
  // Cleanup only on actual unmount
  useEffect(() => {
    return () => {
      console.log('[SampleAreasPanel] Component unmounting - cleaning up graphics');
      if (view && view.graphics && !view.destroyed) {
        const sampleGraphics = view.graphics.toArray().filter(graphic => 
          graphic.attributes && graphic.attributes.zipCode
        );
        if (sampleGraphics.length > 0) {
          view.graphics.removeMany(sampleGraphics);
          console.log(`[SampleAreasPanel] Removed ${sampleGraphics.length} sample graphics on unmount`);
        }
      }
    };
  }, [view]); // Only depend on view to avoid re-running

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatCurrency = (num: number) => {
    return `$${formatNumber(num)}`;
  };

  // Removed formatPercent as it's no longer used

  const getMetricDisplayName = (metricKey: string) => {
    // Red Bull project specific display names
    const metricDisplayNames: Record<string, string> = {
      redBull_percent: 'Red Bull Drinkers',
      energyDrink_percent: 'Energy Drink Consumers', 
      monsterEnergy_percent: 'Monster Energy Drinkers',
      fiveHourEnergy_percent: '5-Hour Energy Drinkers',
      exerciseRegularly_percent: 'Exercise Regularly',
      seekNutritionInfo_percent: 'Seek Nutrition Info',
      sugarFreeFoods_percent: 'Sugar-Free Foods',
      genZ_percent: 'Generation Z'
    };
    return metricDisplayNames[metricKey] || metricKey;
  };

  const getQuickStats = (area: DisplaySampleArea) => {
    // Red Bull project specific metric calculators
    const metricCalculators: Record<string, { calculate: () => any, label: string, icon: any, format: (val: any) => string }> = {
      redBull_percent: {
        calculate: () => Math.round((area.zipCodes.reduce((sum, zip) => sum + (zip.redBull_percent || 0), 0) / area.zipCodes.length) * 10) / 10,
        label: 'Red Bull %',
        icon: DollarSign,
        format: (val) => `${val}%`
      },
      energyDrink_percent: {
        calculate: () => Math.round((area.zipCodes.reduce((sum, zip) => sum + (zip.energyDrink_percent || 0), 0) / area.zipCodes.length) * 10) / 10,
        label: 'Energy Drinks %',
        icon: DollarSign,
        format: (val) => `${val}%`
      },
      monsterEnergy_percent: {
        calculate: () => Math.round((area.zipCodes.reduce((sum, zip) => sum + (zip.monsterEnergy_percent || 0), 0) / area.zipCodes.length) * 10) / 10,
        label: 'Monster %',
        icon: DollarSign,
        format: (val) => `${val}%`
      },
      fiveHourEnergy_percent: {
        calculate: () => Math.round((area.zipCodes.reduce((sum, zip) => sum + (zip.fiveHourEnergy_percent || 0), 0) / area.zipCodes.length) * 10) / 10,
        label: '5-Hour Energy %',
        icon: DollarSign,
        format: (val) => `${val}%`
      },
      exerciseRegularly_percent: {
        calculate: () => Math.round((area.zipCodes.reduce((sum, zip) => sum + (zip.exerciseRegularly_percent || 0), 0) / area.zipCodes.length) * 10) / 10,
        label: 'Exercise %',
        icon: Users,
        format: (val) => `${val}%`
      },
      seekNutritionInfo_percent: {
        calculate: () => Math.round((area.zipCodes.reduce((sum, zip) => sum + (zip.seekNutritionInfo_percent || 0), 0) / area.zipCodes.length) * 10) / 10,
        label: 'Nutrition Info %',
        icon: Users,
        format: (val) => `${val}%`
      },
      sugarFreeFoods_percent: {
        calculate: () => Math.round((area.zipCodes.reduce((sum, zip) => sum + (zip.sugarFreeFoods_percent || 0), 0) / area.zipCodes.length) * 10) / 10,
        label: 'Sugar-Free %',
        icon: Users,
        format: (val) => `${val}%`
      },
      genZ_percent: {
        calculate: () => Math.round((area.zipCodes.reduce((sum, zip) => sum + (zip.genZ_percent || 0), 0) / area.zipCodes.length) * 10) / 10,
        label: 'Gen Z %',
        icon: Users,
        format: (val) => `${val}%`
      }
    };

    // Use the selectedMetrics to build the stats
    return selectedMetrics.map(metricKey => {
      const calculator = metricCalculators[metricKey];
      if (!calculator) return null;
      
      const value = calculator.calculate();
      return {
        label: calculator.label,
        value: calculator.format(value),
        icon: calculator.icon
      };
    }).filter(Boolean); // Remove any null values
  };

  console.log('[SampleAreasPanel] Final render check:', { visible, displayAreasCount: displayAreas.length, loading });
  
  return (
    <div 
      ref={containerRef}
      className="widget-container esri-widget sample-areas-panel"
      style={{ 
        display: visible ? 'block' : 'none'
      }}
    >
      <div className="esri-widget__content">
        {/* Custom Header */}
        <div 
          className="esri-widget__header"
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--theme-border)',
            backgroundColor: 'var(--theme-bg-primary)',
            minHeight: '40px'
          }}
        >
          <h3 className="esri-widget__heading" style={{ 
            margin: '0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#33a852',
            lineHeight: '1.2',
            flex: '1'
          }}>
            Quick Stats
          </h3>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            flexShrink: 0
          }}>
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                style={{ 
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--theme-text-secondary)',
                  padding: '4px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--theme-bg-tertiary)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                aria-label="Information about Quick Stats"
              >
                <Info className="h-3 w-3" />
              </button>
              {showTooltip && (
                <div 
                  className="absolute z-50 px-3 py-2 text-xs rounded-lg shadow-lg"
                  style={{
                    top: '100%',
                    right: '0',
                    marginTop: '4px',
                    backgroundColor: 'var(--theme-bg-primary)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text-primary)',
                    minWidth: '200px',
                    maxWidth: '250px',
                    whiteSpace: 'normal'
                  }}
                >
                  Statistics for major market areas in your project
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="esri-widget__button esri-widget__button--secondary"
              style={{ 
                border: 'none',
                background: 'transparent',
                color: 'var(--theme-text-secondary)',
                padding: '4px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-bg-tertiary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Close panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="esri-widget__panel" style={{ 
          padding: '0'
        }}>
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>Loading sample areas...</p>
            </div>
          ) : displayAreas.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>No sample areas available</p>
            </div>
          ) : (
            <div style={{ borderTop: '1px solid var(--theme-border)' }}>
              {displayAreas.map((area) => {
                const quickStats = getQuickStats(area);
                const isSelected = selectedArea === area.id;
                
                return (
                  <div
                    key={area.id}
                    className={`p-4 transition-all cursor-pointer`}
                    style={{
                      borderBottom: '1px solid var(--theme-border)',
                      backgroundColor: isSelected ? 'var(--theme-bg-tertiary)' : 'transparent',
                      borderLeft: isSelected ? '4px solid var(--theme-accent-primary)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'var(--theme-bg-tertiary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    onClick={() => handleAreaClick(area)}
                  >
                    {/* Area Header */}
                    <div className="mb-3">
                      <h4 className="text-xs font-medium mb-1" style={{ color: 'var(--theme-text-primary)' }}>
                        {area.name}
                      </h4>
                      <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                        {area.zipCodes.length} ZIP codes
                      </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {quickStats.map((stat, idx) => stat && (
                        <div key={idx} className="flex items-center space-x-1">
                          <stat.icon className="h-3 w-3" style={{ color: 'var(--theme-text-secondary)' }} />
                          <div>
                            <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                              {stat.label}
                            </p>
                            <p className="text-xs font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                              {stat.value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Choropleth Info */}
                    <div className="flex items-center justify-between">
                      <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                        Showing: {getMetricDisplayName(selectedMetrics[0] || 'redBull_percent')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          {selectedMetrics.length > 0 && (
            <div className="p-4" style={{ 
              borderTop: '1px solid var(--theme-border)',
              backgroundColor: 'var(--theme-bg-secondary)'
            }}>
              <h4 className="text-xs font-medium mb-2" style={{ color: 'var(--theme-text-primary)' }}>
                {getMetricDisplayName(selectedMetrics[0] || 'redBull_percent')} Legend
              </h4>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-sm"
                    style={{ 
                      backgroundColor: ACTIVE_COLOR_SCHEME[0], // Red
                      border: '1px solid #ddd',
                      opacity: 1,
                      boxShadow: 'none',
                      backgroundClip: 'padding-box',
                      zIndex: 1,
                      position: 'relative',
                      // Use !important to override any global CSS
                      // @ts-ignore
                      cssText: `background-color: ${ACTIVE_COLOR_SCHEME[0]} !important;`
                    }}
                  ></div>
                  <span className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>Lowest</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-sm"
                    style={{ 
                      backgroundColor: ACTIVE_COLOR_SCHEME[1], // Orange
                      border: '1px solid #ddd',
                      opacity: 1,
                      boxShadow: 'none',
                      backgroundClip: 'padding-box',
                      zIndex: 1,
                      position: 'relative',
                      // Use !important to override any global CSS
                      // @ts-ignore
                      cssText: `background-color: ${ACTIVE_COLOR_SCHEME[1]} !important;`
                    }}
                  ></div>
                  <span className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>Low</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-sm"
                    style={{ 
                      backgroundColor: ACTIVE_COLOR_SCHEME[2], // Light Green
                      border: '1px solid #ddd',
                      opacity: 1,
                      boxShadow: 'none',
                      backgroundClip: 'padding-box',
                      zIndex: 1,
                      position: 'relative',
                      // Use !important to override any global CSS
                      // @ts-ignore
                      cssText: `background-color: ${ACTIVE_COLOR_SCHEME[2]} !important;`
                    }}
                  ></div>
                  <span className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>High</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-sm"
                    style={{ 
                      backgroundColor: ACTIVE_COLOR_SCHEME[3], // Green
                      border: '1px solid #ddd',
                      opacity: 1,
                      boxShadow: 'none',
                      backgroundClip: 'padding-box',
                      zIndex: 1,
                      position: 'relative',
                      // Use !important to override any global CSS
                      // @ts-ignore
                      cssText: `background-color: ${ACTIVE_COLOR_SCHEME[3]} !important;`
                    }}
                  ></div>
                  <span className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>Highest</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}