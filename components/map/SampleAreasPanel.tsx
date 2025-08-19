import React, { useState, useEffect, useRef } from 'react';
import { Users, DollarSign, Building, Info, X } from 'lucide-react';
import Extent from "@arcgis/core/geometry/Extent";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";
import Color from "@arcgis/core/Color";
import Graphic from "@arcgis/core/Graphic";
import Polygon from "@arcgis/core/geometry/Polygon";

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

// Individual ZIP code interface
export interface ZipCodeArea {
  zipCode: string;
  city: string;
  population: number;
  medianIncome: number;
  genZ_percent: number;
  applePay_percent: number;
  businessCount: number;
  // Additional available metrics
  millennial_percent?: number;
  genX_percent?: number;
  boomer_percent?: number;
  creditCardDebt_percent?: number;
  savingsAccount_percent?: number;
  investmentAssets_avg?: number;
  googlePay_percent?: number;
  onlineTax_percent?: number;
  marketOpportunity_score?: number;
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

export default function SampleAreasPanel({ view, onClose, visible }: SampleAreasPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Removed preJoinedData state as we're using simplified mock data
  const [displayAreas, setDisplayAreas] = useState<DisplaySampleArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [choroplethLayers, setChoroplethLayers] = useState<Map<string, __esri.FeatureLayer>>(new Map());
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [showLegendTooltip, setShowLegendTooltip] = useState(false);

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
  }, [visible]);

  // Select random metrics once when component mounts or data changes
  const selectRandomMetrics = () => {
    const allMetricKeys = [
      'genZ_percent', 'applePay_percent', 'googlePay_percent', 'onlineTax_percent',
      'creditCardDebt_percent', 'savingsAccount_percent', 'investmentAssets_avg',
      'marketOpportunity_score', 'population', 'medianIncome', 'businessCount'
    ];
    
    const shuffled = [...allMetricKeys].sort(() => 0.5 - Math.random());
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
        // Fallback: generate mock data for demonstration
        console.log('[SampleAreasPanel] Pre-joined data not found, generating mock data');
        generateMockData();
        // Auto-zoom to Jacksonville area after data loads
        setTimeout(() => zoomToJacksonville(), 500);
      }
    } catch (error) {
      console.error('[SampleAreasPanel] Error loading sample areas data:', error);
      generateMockData();
      // Auto-zoom to Jacksonville area even on error
      setTimeout(() => zoomToJacksonville(), 500);
    } finally {
      setLoading(false);
    }
  };

  const processRealSampleData = (sampleData: any) => {
    console.log('[SampleAreasPanel] Processing real sample areas data:', sampleData.areas.length, 'areas');
    
    // Select random metrics for this session
    const randomMetrics = selectRandomMetrics();
    setSelectedMetrics(randomMetrics);
    console.log('[SampleAreasPanel] Selected random metrics:', randomMetrics);
    
    // Group areas by city
    const citiesMap = new Map<string, any[]>();
    
    sampleData.areas.forEach((area: any) => {
      const cityKey = area.city.toLowerCase();
      if (!citiesMap.has(cityKey)) {
        citiesMap.set(cityKey, []);
      }
      citiesMap.get(cityKey)!.push(area);
    });
    
    // Convert to DisplaySampleArea format
    const areas: DisplaySampleArea[] = [];
    
    citiesMap.forEach((zipAreas, cityKey) => {
      const cityName = zipAreas[0].city;
      
      // Convert areas to ZipCodeArea format with real geometry and demographics
      const zipCodes: ZipCodeArea[] = zipAreas.map(area => {
        const demo = area.demographics;
        return {
          zipCode: area.zipCode,
          city: area.city,
          geometry: area.geometry, // Use real polygon geometry
          bounds: area.bounds,
          // Map real demographic data to expected fields
          population: Math.round((demo['Generation Z Population'] || 0) / (demo['Generation Z Population (%)'] || 20) * 100) || 50000,
          medianIncome: 60000, // Not in current data, use default
          genZ_percent: demo['Generation Z Population (%)'] || 20.0,
          applePay_percent: demo['Apple Pay Users (%)'] || 30.0,
          businessCount: 2000, // Not in current data, use default
          // Additional metrics from real data
          millennial_percent: 28.0, // Not in current data, use default
          genX_percent: 22.0, // Not in current data, use default
          boomer_percent: 18.0, // Not in current data, use default
          creditCardDebt_percent: demo['Credit Card Balance Carriers (%)'] || 35.0,
          savingsAccount_percent: demo['Savings Account Holders (%)'] || 50.0,
          investmentAssets_avg: demo['Investment Assets Value (Avg)'] || 25000,
          googlePay_percent: demo['Google Pay Users (%)'] || 25.0,
          onlineTax_percent: (demo['TurboTax Users (%)'] || 0) + (demo['H&R Block Online Users (%)'] || 0),
          marketOpportunity_score: demo['Digital Financial Engagement Score'] || 50.0
        };
      });
      
      // Calculate combined bounds
      const combinedBounds = zipCodes.reduce((bounds, zip) => ({
        xmin: Math.min(bounds.xmin, zip.bounds.xmin),
        ymin: Math.min(bounds.ymin, zip.bounds.ymin),
        xmax: Math.max(bounds.xmax, zip.bounds.xmax),
        ymax: Math.max(bounds.ymax, zip.bounds.ymax)
      }), {
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
    });
    
    setDisplayAreas(areas);
    console.log('[SampleAreasPanel] Created', areas.length, 'display areas from real data');
    console.log('[SampleAreasPanel] Available cities:', areas.map(a => a.id));
    
    // Create the choropleth layers on the map
    createChoroplethLayers(areas);
    
    // Auto-zoom to Jacksonville area after data loads
    setTimeout(() => zoomToJacksonville(), 1000);
  };

  // This function is no longer needed with the new simplified approach
  // generateDisplayAreas is replaced by direct mock data creation

  const generateMockData = () => {
    console.log('[SampleAreasPanel] Generating mock ZIP code data for 5 Florida cities');
    
    // Select random metrics for this session
    const randomMetrics = selectRandomMetrics();
    setSelectedMetrics(randomMetrics);
    console.log('[SampleAreasPanel] Selected random metrics:', randomMetrics);
    
    // Generate individual ZIP codes with realistic geometries
    const generateZipCodes = (cityId: string, cityName: string, zipCodes: string[], baseLat: number, baseLng: number, baseStats: any) => {
      return zipCodes.map((zip, index) => {
        // Offset each ZIP code slightly from the base city coordinates
        const latOffset = (Math.random() - 0.5) * 0.1;
        const lngOffset = (Math.random() - 0.5) * 0.1;
        const centerLat = baseLat + latOffset;
        const centerLng = baseLng + lngOffset;
        
        // Create rectangular ZIP code boundary
        const size = 0.02 + Math.random() * 0.03; // Random size between 0.02 and 0.05 degrees
        const coordinates = [[
          [centerLng - size, centerLat - size],
          [centerLng + size, centerLat - size], 
          [centerLng + size, centerLat + size],
          [centerLng - size, centerLat + size],
          [centerLng - size, centerLat - size] // Close the polygon
        ]];
        
        return {
          zipCode: zip,
          city: cityName,
          population: Math.floor(baseStats.avgPopulation * (0.8 + Math.random() * 0.4)), // Vary ±20%
          medianIncome: Math.floor(baseStats.avgIncome * (0.9 + Math.random() * 0.2)), // Vary ±10%
          genZ_percent: Math.round((baseStats.genZ * (0.8 + Math.random() * 0.4)) * 10) / 10,
          applePay_percent: Math.round((baseStats.applePay * (0.8 + Math.random() * 0.4)) * 10) / 10,
          businessCount: Math.floor(baseStats.businesses * (0.7 + Math.random() * 0.6)), // Vary ±30%
          geometry: {
            type: 'Polygon' as const,
            coordinates
          },
          bounds: {
            xmin: centerLng - size,
            ymin: centerLat - size,
            xmax: centerLng + size,
            ymax: centerLat + size
          }
        };
      });
    };
    
    const calculateCombinedBounds = (zipCodes: ZipCodeArea[]) => {
      return zipCodes.reduce((bounds, zip) => ({
        xmin: Math.min(bounds.xmin, zip.bounds.xmin),
        ymin: Math.min(bounds.ymin, zip.bounds.ymin),
        xmax: Math.max(bounds.xmax, zip.bounds.xmax),
        ymax: Math.max(bounds.ymax, zip.bounds.ymax)
      }), {
        xmin: Infinity,
        ymin: Infinity,
        xmax: -Infinity,
        ymax: -Infinity
      });
    };
    
    const cityData = [
      {
        id: 'jacksonville',
        name: 'Jacksonville',
        zipCodes: generateZipCodes('jacksonville', 'Jacksonville', ['32204', '32205', '32207', '32210', '32225'], 30.35, -81.65, {
          avgPopulation: 57000, avgIncome: 58600, genZ: 23.8, applePay: 37.2, businesses: 2500
        }),
        combinedBounds: { xmin: 0, ymin: 0, xmax: 0, ymax: 0 } // Will be calculated
      },
      {
        id: 'miami',
        name: 'Miami',
        zipCodes: generateZipCodes('miami', 'Miami', ['33131', '33132', '33134', '33135', '33137'], 25.79, -80.19, {
          avgPopulation: 91000, avgIncome: 72300, genZ: 21.4, applePay: 45.8, businesses: 3750
        }),
        combinedBounds: { xmin: 0, ymin: 0, xmax: 0, ymax: 0 }
      },
      {
        id: 'orlando',
        name: 'Orlando',
        zipCodes: generateZipCodes('orlando', 'Orlando', ['32801', '32803', '32804', '32806', '32807'], 28.54, -81.38, {
          avgPopulation: 57000, avgIncome: 61200, genZ: 25.9, applePay: 42.3, businesses: 2900
        }),
        combinedBounds: { xmin: 0, ymin: 0, xmax: 0, ymax: 0 }
      },
      {
        id: 'stpetersburg',
        name: 'St. Petersburg',
        zipCodes: generateZipCodes('stpetersburg', 'St. Petersburg', ['33701', '33702', '33703', '33704', '33705'], 27.77, -82.68, {
          avgPopulation: 51000, avgIncome: 54800, genZ: 20.1, applePay: 34.6, businesses: 1950
        }),
        combinedBounds: { xmin: 0, ymin: 0, xmax: 0, ymax: 0 }
      },
      {
        id: 'tampa',
        name: 'Tampa',
        zipCodes: generateZipCodes('tampa', 'Tampa', ['33602', '33603', '33604', '33605', '33606'], 27.97, -82.49, {
          avgPopulation: 64000, avgIncome: 59400, genZ: 24.7, applePay: 39.1, businesses: 2650
        }),
        combinedBounds: { xmin: 0, ymin: 0, xmax: 0, ymax: 0 }
      }
    ];
    
    // Calculate combined bounds for each city
    cityData.forEach(city => {
      city.combinedBounds = calculateCombinedBounds(city.zipCodes);
    });

    setDisplayAreas(cityData);
    createChoroplethLayers(cityData);
  };

  const createChoroplethLayers = (areas: DisplaySampleArea[]) => {
    console.log('[SampleAreasPanel] Creating city-level choropleth layers');
    if (!view) {
      console.log('[SampleAreasPanel] No view available for layer creation');
      return;
    }

    const newLayers = new Map<string, __esri.FeatureLayer>();
    let globalObjectId = 1;

    // Create separate layer for each city with its own classification
    for (const area of areas) {
      const cityGraphics: __esri.Graphic[] = [];
      
      // Collect all graphics for this city
      for (const zipCode of area.zipCodes) {
        try {
          const polygon = new Polygon({
            rings: zipCode.geometry.coordinates,
            spatialReference: { wkid: 4326 }
          });

          const graphic = new Graphic({
            geometry: polygon,
            attributes: {
              OBJECTID: globalObjectId++,
              zipCode: zipCode.zipCode,
              city: zipCode.city,
              population: zipCode.population,
              medianIncome: zipCode.medianIncome,
              genZ_percent: zipCode.genZ_percent,
              applePay_percent: zipCode.applePay_percent,
              businessCount: zipCode.businessCount
            }
          });

          cityGraphics.push(graphic);
        } catch (error) {
          console.error(`Error creating graphic for ZIP ${zipCode.zipCode}:`, error);
        }
      }

      // Create layer for this city with city-specific classification
      if (cityGraphics.length > 0) {
        try {
          // Calculate city-specific quartiles
          const cityPopulations = area.zipCodes.map(z => z.population).sort((a, b) => a - b);
          const cityBreaks = calculateCityQuartiles(cityPopulations);
          
          const layer = new FeatureLayer({
            source: cityGraphics,
            objectIdField: 'OBJECTID',
            fields: [
              { name: 'OBJECTID', type: 'oid' as const },
              { name: 'zipCode', type: 'string' as const },
              { name: 'city', type: 'string' as const },
              { name: 'population', type: 'integer' as const },
              { name: 'medianIncome', type: 'integer' as const },
              { name: 'genZ_percent', type: 'double' as const },
              { name: 'applePay_percent', type: 'double' as const },
              { name: 'businessCount', type: 'integer' as const },
              // Additional fields for rendering options
              { name: 'millennial_percent', type: 'double' as const },
              { name: 'genX_percent', type: 'double' as const },
              { name: 'boomer_percent', type: 'double' as const },
              { name: 'creditCardDebt_percent', type: 'double' as const },
              { name: 'savingsAccount_percent', type: 'double' as const },
              { name: 'investmentAssets_avg', type: 'integer' as const },
              { name: 'googlePay_percent', type: 'double' as const },
              { name: 'onlineTax_percent', type: 'double' as const },
              { name: 'marketOpportunity_score', type: 'double' as const }
            ],
            renderer: createCitySpecificRenderer(cityBreaks, selectedMetrics[0] || 'population'),
            visible: true,
            opacity: 0.6,
            title: `${area.name} ZIP Codes`,
            popupTemplate: {
              title: 'ZIP Code {zipCode}',
              content: `
                <div style="padding: 10px;">
                  <p><strong>City:</strong> {city}</p>
                  <hr style="margin: 10px 0;">
                  <p><strong>Population:</strong> {population}</p>
                  <p><strong>Median Income:</strong> ${'{medianIncome}'}</p>
                  <p><strong>Gen Z:</strong> {genZ_percent}%</p>
                  <p><strong>Apple Pay Usage:</strong> {applePay_percent}%</p>
                  <p><strong>Businesses:</strong> {businessCount}</p>
                </div>
              `
            }
          });

          view.map.add(layer);
          newLayers.set(area.id, layer);
          console.log(`[SampleAreasPanel] Created layer for ${area.name} with ${cityGraphics.length} ZIP codes`);
        } catch (error) {
          console.error(`Error creating layer for ${area.name}:`, error);
        }
      }
    }
    
    // Zoom to combined extent of all areas
    if (areas.length > 0) {
      zoomToCombinedExtent(areas);
    }

    setChoroplethLayers(newLayers);
  };
  
  const zoomToJacksonville = () => {
    if (!view) return;

    console.log('[zoomToJacksonville] Looking for Jacksonville in areas:', displayAreas.map(a => a.id));
    
    // Find Jacksonville area in displayAreas
    const jacksonvilleArea = displayAreas.find(area => area.id === 'jacksonville');
    if (jacksonvilleArea) {
      console.log('[zoomToJacksonville] Found Jacksonville area, zooming...');
      handleAreaClick(jacksonvilleArea);
    } else {
      console.log('[zoomToJacksonville] Jacksonville area not found, using fallback coordinates');
      // Fallback: manually zoom to Jacksonville coordinates
      const jacksonvilleExtent = new Extent({
        xmin: -81.9,
        ymin: 30.1,
        xmax: -81.3,
        ymax: 30.6,
        spatialReference: { wkid: 4326 }
      });
      
      view.goTo(jacksonvilleExtent.expand(1.2), {
        duration: 2000,
        easing: 'ease-in-out'
      }).catch(error => {
        console.error('Error zooming to Jacksonville:', error);
      });
      
      console.log('[SampleAreasPanel] Zoomed to Jacksonville fallback coordinates');
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

      view.goTo(extent.expand(1.2), {
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

  const createCitySpecificRenderer = (breaks: number[], renderingField: string) => {
    // Use Firefly quartile color scheme
    const fireflyColors = [
      '#ff0040', // Firefly Deep Pink (lowest values)
      '#ffbf00', // Firefly Orange 
      '#00ff40', // Firefly Lime Green
      '#00ff80'  // Firefly Bright Green (highest values)
    ];

    return new ClassBreaksRenderer({
      field: renderingField, // Use the first selected metric instead of hardcoded 'population'
      classBreakInfos: fireflyColors.map((color, index) => ({
        minValue: index === 0 ? -Infinity : breaks[index],
        maxValue: index === fireflyColors.length - 1 ? Infinity : breaks[index + 1],
        symbol: new SimpleFillSymbol({
          color: new Color(color),
          outline: {
            color: new Color([0, 0, 0, 0]),
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

      await view.goTo(extent.expand(1.3), {
        duration: 1500,
        easing: 'ease-in-out'
      });
    } catch (error) {
      console.error('Error zooming to area:', error);
    }
  };

  const clearAllSamples = () => {
    // Remove all choropleth layers
    choroplethLayers.forEach(layer => {
      view.map.remove(layer);
    });
    setChoroplethLayers(new Map());
    setDisplayAreas([]);
    setSelectedArea(null);
  };

  // Clear layers when panel is closed
  useEffect(() => {
    if (!visible) {
      clearAllSamples();
    }
  }, [visible]);

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
    const metricDisplayNames: Record<string, string> = {
      population: 'Population',
      medianIncome: 'Median Income',
      businessCount: 'Business Count',
      genZ_percent: 'Gen Z %',
      millennial_percent: 'Millennials %',
      genX_percent: 'Gen X %',
      boomer_percent: 'Boomers %',
      creditCardDebt_percent: 'Credit Debt %',
      savingsAccount_percent: 'Savings %',
      investmentAssets_avg: 'Investment Assets',
      applePay_percent: 'Apple Pay %',
      googlePay_percent: 'Google Pay %',
      onlineTax_percent: 'Online Tax %',
      marketOpportunity_score: 'Market Opportunity'
    };
    return metricDisplayNames[metricKey] || metricKey;
  };

  const getQuickStats = (area: DisplaySampleArea) => {
    // Define metric calculators and metadata
    const metricCalculators: Record<string, { calculate: () => any, label: string, icon: any, format: (val: any) => string }> = {
      population: {
        calculate: () => area.zipCodes.reduce((sum, zip) => sum + zip.population, 0),
        label: 'Population',
        icon: Users,
        format: (val) => formatNumber(val)
      },
      medianIncome: {
        calculate: () => Math.round(area.zipCodes.reduce((sum, zip) => sum + zip.medianIncome, 0) / area.zipCodes.length),
        label: 'Avg Income',
        icon: DollarSign,
        format: (val) => formatCurrency(val)
      },
      businessCount: {
        calculate: () => area.zipCodes.reduce((sum, zip) => sum + zip.businessCount, 0),
        label: 'Businesses',
        icon: Building,
        format: (val) => formatNumber(val)
      },
      genZ_percent: {
        calculate: () => Math.round((area.zipCodes.reduce((sum, zip) => sum + zip.genZ_percent, 0) / area.zipCodes.length) * 10) / 10,
        label: 'Gen Z %',
        icon: Users,
        format: (val) => `${val}%`
      },
      millennial_percent: {
        calculate: () => Math.round((area.zipCodes.reduce((sum, zip) => sum + (zip.millennial_percent || 0), 0) / area.zipCodes.length) * 10) / 10,
        label: 'Millennials %',
        icon: Users,
        format: (val) => `${val}%`
      },
      genX_percent: {
        calculate: () => Math.round((area.zipCodes.reduce((sum, zip) => sum + (zip.genX_percent || 0), 0) / area.zipCodes.length) * 10) / 10,
        label: 'Gen X %',
        icon: Users,
        format: (val) => `${val}%`
      },
      boomer_percent: {
        calculate: () => Math.round((area.zipCodes.reduce((sum, zip) => sum + (zip.boomer_percent || 0), 0) / area.zipCodes.length) * 10) / 10,
        label: 'Boomers %',
        icon: Users,
        format: (val) => `${val}%`
      },
      creditCardDebt_percent: {
        calculate: () => Math.round((area.zipCodes.reduce((sum, zip) => sum + (zip.creditCardDebt_percent || 0), 0) / area.zipCodes.length) * 10) / 10,
        label: 'Credit Debt %',
        icon: DollarSign,
        format: (val) => `${val}%`
      },
      savingsAccount_percent: {
        calculate: () => Math.round((area.zipCodes.reduce((sum, zip) => sum + (zip.savingsAccount_percent || 0), 0) / area.zipCodes.length) * 10) / 10,
        label: 'Savings %',
        icon: DollarSign,
        format: (val) => `${val}%`
      },
      investmentAssets_avg: {
        calculate: () => Math.round(area.zipCodes.reduce((sum, zip) => sum + (zip.investmentAssets_avg || 0), 0) / area.zipCodes.length),
        label: 'Avg Investment',
        icon: DollarSign,
        format: (val) => formatCurrency(val)
      },
      applePay_percent: {
        calculate: () => Math.round((area.zipCodes.reduce((sum, zip) => sum + zip.applePay_percent, 0) / area.zipCodes.length) * 10) / 10,
        label: 'Apple Pay %',
        icon: DollarSign,
        format: (val) => `${val}%`
      },
      googlePay_percent: {
        calculate: () => Math.round((area.zipCodes.reduce((sum, zip) => sum + (zip.googlePay_percent || 0), 0) / area.zipCodes.length) * 10) / 10,
        label: 'Google Pay %',
        icon: DollarSign,
        format: (val) => `${val}%`
      },
      onlineTax_percent: {
        calculate: () => Math.round((area.zipCodes.reduce((sum, zip) => sum + (zip.onlineTax_percent || 0), 0) / area.zipCodes.length) * 10) / 10,
        label: 'Online Tax %',
        icon: DollarSign,
        format: (val) => `${val}%`
      },
      marketOpportunity_score: {
        calculate: () => Math.round((area.zipCodes.reduce((sum, zip) => sum + (zip.marketOpportunity_score || 0), 0) / area.zipCodes.length) * 10) / 10,
        label: 'Market Opp',
        icon: Building,
        format: (val) => `${val}`
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

  console.log('[SampleAreasPanel] Render check:', { visible, displayAreasCount: displayAreas.length, loading });
  
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
                    maxWidth: '200px',
                    whiteSpace: 'normal'
                  }}
                >
                  Random statistics for major market areas in your project
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
          maxHeight: '300px',
          overflowY: 'auto',
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
                      <div className="flex items-center gap-1">
                        <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                          Showing: {getMetricDisplayName(selectedMetrics[0] || 'population')}
                        </p>
                        <div className="relative">
                          <button
                            onMouseEnter={() => setShowLegendTooltip(true)}
                            onMouseLeave={() => setShowLegendTooltip(false)}
                            style={{ 
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--theme-text-secondary)',
                              padding: '2px',
                              borderRadius: '2px',
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
                            aria-label="Legend information"
                          >
                            <Info className="h-2 w-2" />
                          </button>
                          {showLegendTooltip && (
                            <div 
                              className="absolute z-50 px-2 py-1 text-xs rounded shadow-lg"
                              style={{
                                top: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                marginTop: '4px',
                                backgroundColor: 'var(--theme-bg-primary)',
                                border: '1px solid var(--theme-border)',
                                color: 'var(--theme-text-primary)',
                                minWidth: '120px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <div style={{ fontSize: '11px', marginBottom: '4px', fontWeight: '600' }}>Legend:</div>
                              <div style={{ fontSize: '10px', lineHeight: '1.2' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                  <div 
                                    style={{ 
                                      width: '10px', 
                                      height: '10px',
                                      border: '5px solid #ff0040',
                                      borderRadius: '1px'
                                    }}
                                  />
                                  <span>Lowest</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                  <div 
                                    style={{ 
                                      width: '10px', 
                                      height: '10px',
                                      border: '5px solid #ffbf00',
                                      borderRadius: '1px'
                                    }}
                                  />
                                  <span>Low</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                  <div 
                                    style={{ 
                                      width: '10px', 
                                      height: '10px',
                                      border: '5px solid #00ff40',
                                      borderRadius: '1px'
                                    }}
                                  />
                                  <span>High</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <div 
                                    style={{ 
                                      width: '10px', 
                                      height: '10px',
                                      border: '5px solid #00ff80',
                                      borderRadius: '1px'
                                    }}
                                  />
                                  <span>Highest</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}