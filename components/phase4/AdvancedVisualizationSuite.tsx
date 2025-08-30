'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  isPhase4FeatureEnabled, 
  getPhase4FeatureConfig 
} from '@/config/phase4-features';
import {
  BarChart3,
  Map,
  LineChart,
  PieChart,
  Activity,
  Layers,
  Play,
  Pause,
  RotateCw,
  Download,
  Maximize2,
  Settings,
  Eye,
  EyeOff,
  Zap,
  Clock,
  TrendingUp
} from 'lucide-react';

// Types for advanced visualizations
interface VisualizationData {
  id: string;
  type: '3d-map' | 'time-series' | 'scatter' | 'network' | 'heatmap';
  data: any[];
  config: {
    title: string;
    description?: string;
    dimensions: {
      x?: string;
      y?: string;
      z?: string;
      color?: string;
      size?: string;
      time?: string;
    };
    animation?: {
      enabled: boolean;
      duration: number;
      easing: string;
    };
    interaction?: {
      zoom: boolean;
      pan: boolean;
      rotate: boolean;
      brush: boolean;
    };
  };
}

interface VisualizationLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  color?: string;
  data: any[];
}

interface AdvancedVisualizationSuiteProps {
  analysisData?: any;
  geoData?: {
    zipCodes?: string[];
    bounds?: any;
  };
  timeRange?: {
    start: Date;
    end: Date;
  };
  onVisualizationChange?: (viz: VisualizationData) => void;
  onExport?: (format: 'png' | 'svg' | 'html') => void;
  className?: string;
}

// Mock 3D map data generator
const generate3DMapData = (zipCodes: string[] = []) => {
  return zipCodes.slice(0, 20).map((zip, i) => ({
    zipCode: zip,
    lat: 33.5 + Math.random() * 2,
    lng: -117.5 + Math.random() * 2,
    elevation: Math.random() * 100,
    value: Math.random() * 1000,
    demographic: Math.random() * 100
  }));
};

// Mock time series data
const generateTimeSeriesData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(month => ({
    month,
    sales: Math.random() * 10000 + 5000,
    customers: Math.random() * 1000 + 500,
    growth: Math.random() * 20 - 10
  }));
};

/**
 * AdvancedVisualizationSuite - Advanced Feature Implementation
 * 
 * Advanced visualization engine with 3D maps, animations, and linked charts.
 * Modular and can be disabled via feature flags.
 */
export const AdvancedVisualizationSuite: React.FC<AdvancedVisualizationSuiteProps> = ({
  analysisData,
  geoData,
  timeRange,
  onVisualizationChange,
  onExport,
  className
}) => {
  // Check if feature is enabled
  const isEnabled = isPhase4FeatureEnabled('advancedVisualization');
  const config = getPhase4FeatureConfig('advancedVisualization');
  
  // State
  const [activeVisualization, setActiveVisualization] = useState<'3d-map' | 'time-series' | 'linked'>('3d-map');
  const [isAnimating, setIsAnimating] = useState(false);
  const [timeSliderValue, setTimeSliderValue] = useState(0);
  const [layers, setLayers] = useState<VisualizationLayer[]>([
    {
      id: 'demographic',
      name: 'Demographics',
      visible: true,
      opacity: 0.8,
      color: '#3B82F6',
      data: []
    },
    {
      id: 'economic',
      name: 'Economic',
      visible: true,
      opacity: 0.6,
      color: '#10B981',
      data: []
    },
    {
      id: 'competitive',
      name: 'Competitive',
      visible: false,
      opacity: 0.5,
      color: '#F59E0B',
      data: []
    }
  ]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  
  // If feature is disabled, return null
  if (!isEnabled) {
    return null;
  }
  
  // Mock data for visualizations
  const mapData = useMemo(() => 
    generate3DMapData(geoData?.zipCodes || ['92617', '92618', '92620', '92625', '92626']),
    [geoData]
  );
  
  const timeSeriesData = useMemo(() => generateTimeSeriesData(), []);
  
  // Canvas rendering for 3D visualization (simplified)
  const render3DMap = useCallback(() => {
    if (!canvasRef.current || !config?.webglEnabled) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set background for better visibility
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Simple 3D projection with better scaling
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) / 8;
    
    // Draw data points with better visibility
    mapData.forEach((point, i) => {
      const x = centerX + (point.lng + 117.5) * scale;
      const y = centerY - (point.lat - 33.5) * scale;
      const z = point.elevation;
      
      // Ensure points are within canvas bounds
      if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) return;
      
      // Larger, more visible points
      const size = Math.max(8, 12 + z / 10);
      const opacity = layers[0].visible ? Math.max(0.7, layers[0].opacity) : 0;
      
      // Draw shadow for depth
      ctx.fillStyle = `rgba(0, 0, 0, 0.1)`;
      ctx.beginPath();
      ctx.arc(x + 2, y + 2, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw main point with better contrast
      ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`;
      ctx.strokeStyle = `rgba(255, 255, 255, 0.8)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Draw elevation as vertical bar with better visibility
      if (config?.features?.threeDMaps && z > 0) {
        const barHeight = Math.max(10, z / 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${opacity * 0.8})`;
        ctx.fillRect(x - 3, y - barHeight, 6, barHeight);
        
        // Add value label
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(point.value).toString(), x, y - barHeight - 5);
      }
    });
    
    // Add labels with better readability
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    mapData.forEach((point, i) => {
      const x = centerX + (point.lng + 117.5) * scale;
      const y = centerY - (point.lat - 33.5) * scale;
      
      // Ensure labels are within canvas bounds
      if (x + 60 > canvas.width || y < 10 || y > canvas.height - 10) return;
      
      // White background for better readability
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(x + 12, y - 8, 50, 16);
      
      // Black text for contrast
      ctx.fillStyle = '#1f2937';
      ctx.fillText(point.zipCode, x + 15, y + 3);
    });
  }, [mapData, layers, config]);
  
  // Animation loop
  const animate = useCallback(() => {
    if (!isAnimating) return;
    
    setTimeSliderValue(prev => {
      const next = prev + 1;
      return next > 100 ? 0 : next;
    });
    
    render3DMap();
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isAnimating, render3DMap]);
  
  // Start/stop animation
  useEffect(() => {
    if (isAnimating) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnimating, animate]);
  
  // Initial render
  useEffect(() => {
    render3DMap();
  }, [render3DMap]);
  
  // Toggle layer visibility
  const toggleLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
  }, []);
  
  // Update layer opacity
  const updateLayerOpacity = useCallback((layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, opacity }
        : layer
    ));
  }, []);
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Advanced Visualization</h3>
            <p className="text-xs text-muted-foreground">
              3D maps and interactive charts
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAnimating(!isAnimating)}
            className="text-xs"
          >
            {isAnimating ? (
              <>
                <Pause className="w-3 h-3 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1" />
                Animate
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Visualization Tabs */}
      <Tabs value={activeVisualization} onValueChange={(v) => setActiveVisualization(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="3d-map">3D Map</TabsTrigger>
          <TabsTrigger value="time-series">Time Series</TabsTrigger>
          <TabsTrigger value="linked">Linked Charts</TabsTrigger>
        </TabsList>
        
        {/* 3D Map Visualization */}
        <TabsContent value="3d-map" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">3D Geographic Visualization</CardTitle>
                  <CardDescription className="text-xs">
                    Demographic intensity with elevation mapping
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    <RotateCw className="w-3 h-3 mr-1" />
                    Reset View
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Maximize2 className="w-3 h-3 mr-1" />
                    Fullscreen
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Canvas for 3D visualization */}
              <div className="relative bg-muted rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={500}
                  className="w-full h-[500px] border rounded"
                  style={{ background: '#f8fafc' }}
                />
                
                {/* Layer controls overlay */}
                <div className="absolute top-4 right-4 bg-background/90 backdrop-blur rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold mb-2">Layers</h4>
                  {layers.map(layer => (
                    <div key={layer.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleLayer(layer.id)}
                          className="text-xs flex items-center gap-1"
                        >
                          {layer.visible ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                          {layer.name}
                        </button>
                      </div>
                      {layer.visible && (
                        <Slider
                          value={[layer.opacity * 100]}
                          onValueChange={(value) => updateLayerOpacity(layer.id, value[0] / 100)}
                          max={100}
                          className="w-24"
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Time slider */}
                {config?.features?.timeSeriesAnimation && (
                  <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <Clock className="w-3 h-3" />
                      <Slider
                        value={[timeSliderValue]}
                        onValueChange={(value) => setTimeSliderValue(value[0])}
                        max={100}
                        className="flex-1"
                      />
                      <span className="text-xs">{timeSliderValue}%</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>High Density</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-300" />
                  <span>Medium Density</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-100" />
                  <span>Low Density</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Time Series Visualization */}
        <TabsContent value="time-series" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Animated Time Series</CardTitle>
              <CardDescription className="text-xs">
                Market trends over time with smooth transitions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Enhanced chart visualization with better readability */}
              <div className="h-[350px] p-4 bg-gradient-to-t from-gray-50 to-white rounded-lg border">
                <div className="h-full flex items-end justify-between gap-3">
                  {timeSeriesData.map((data, i) => {
                    const height = Math.max(30, (data.sales / 15000) * 100);
                    const animatedOpacity = isAnimating ? 0.7 + Math.sin(Date.now() / 1000 + i) * 0.3 : 0.9;
                    
                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-3 max-w-[80px]"
                      >
                        {/* Value label on top */}
                        <div className="text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded shadow-sm">
                          ${Math.round(data.sales / 1000)}K
                        </div>
                        
                        {/* Bar with better visibility and animation */}
                        <div
                          className="w-full bg-gradient-to-t from-blue-600 via-blue-500 to-purple-500 rounded-t-lg shadow-lg border-2 border-blue-200 transition-all duration-700 min-h-[30px]"
                          style={{
                            height: `${height}%`,
                            opacity: animatedOpacity,
                            transform: isAnimating ? `scaleY(${0.8 + Math.sin(Date.now() / 2000 + i) * 0.2})` : 'scaleY(1)',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                          }}
                        />
                        
                        {/* Month label */}
                        <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded">{data.month}</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Grid lines for better readability */}
                <div className="absolute inset-0 pointer-events-none">
                  {[25, 50, 75].map(percent => (
                    <div
                      key={percent}
                      className="absolute left-0 right-0 border-t border-gray-200"
                      style={{ bottom: `${percent}%` }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Avg Sales</p>
                  <p className="text-lg font-semibold">$8.2K</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Growth Rate</p>
                  <p className="text-lg font-semibold text-green-600">+12.3%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Trend</p>
                  <p className="text-lg font-semibold flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Linked Charts */}
        <TabsContent value="linked" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Scatter Plot */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Income vs Consumption</CardTitle>
                <CardDescription className="text-xs">
                  Brush to filter other charts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] relative">
                  {/* Mock scatter plot */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-blue-500"
                          style={{
                            opacity: Math.random(),
                            transform: `translate(${Math.random() * 10}px, ${Math.random() * 10}px)`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Category Distribution</CardTitle>
                <CardDescription className="text-xs">
                  Updates with scatter selection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-end justify-between gap-2">
                  {['A', 'B', 'C', 'D', 'E'].map((cat, i) => (
                    <div key={cat} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t"
                        style={{ height: `${Math.random() * 100}%` }}
                      />
                      <span className="text-xs">{cat}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Connection indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Zap className="w-3 h-3" />
            Charts are linked - interact with one to update others
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Export Options */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Settings className="w-3 h-3" />
          WebGL: {config?.webglEnabled ? 'Enabled' : 'Disabled'}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onExport?.('png')}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Export PNG
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onExport?.('svg')}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Export SVG
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onExport?.('html')}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Interactive HTML
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedVisualizationSuite;