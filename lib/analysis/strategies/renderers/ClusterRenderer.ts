import { VisualizationRendererStrategy, ProcessedAnalysisData, VisualizationResult, VisualizationConfig } from '../../types';
import { getQuintileColorScheme, calculateEqualCountQuintiles } from '../../utils/QuintileUtils';

/**
 * ClusterRenderer - Advanced cluster visualization for spatial clustering
 * 
 * Features:
 * - Distinct cluster coloring
 * - Cluster centroid markers
 * - Similarity-based styling
 * - Interactive cluster information
 * - Cluster boundary highlighting
 */
export class ClusterRenderer implements VisualizationRendererStrategy {
  
  supportsType(type: string): boolean {
    return type === 'cluster';
  }

  render(data: ProcessedAnalysisData, config: VisualizationConfig): VisualizationResult {
    console.log('🚨🚨🚨 [ClusterRenderer] UPDATED VERSION EXECUTING - SHOULD USE POLYGON FILLS');
    console.log(`[ClusterRenderer] Rendering ${data.records.length} clustered records`);
    
    // Extract cluster information
    const clusterInfo = this.extractClusterInformation(data);
    
    // Generate cluster colors
    const clusterColors = this.generateClusterColors(clusterInfo.clusterCount);
    
    // Create cluster-based renderer
    const renderer = this.createClusterRenderer(clusterInfo, clusterColors, config);
    
    // Generate cluster popup template
    const popupTemplate = this.createClusterPopupTemplate(data, config);
    
    // Create cluster legend
    const legend = this.createClusterLegend(clusterInfo, clusterColors, data);

    return {
      type: 'cluster',
      config: {
        ...config,
        colorScheme: 'categorical',
        clusterInfo
      },
      renderer,
      popupTemplate,
      legend
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private extractClusterInformation(data: ProcessedAnalysisData): ClusterInfo {
    const clusterMap = new Map<number, ClusterDetails>();
    
    // Analyze each record to build cluster information
    data.records.forEach(record => {
      const clusterId = record.value; // Cluster ID is stored as value
      const similarityScore = record.properties.similarity_score || 0;
      
      if (!clusterMap.has(clusterId)) {
        clusterMap.set(clusterId, {
          id: clusterId,
          label: record.category || `Cluster ${clusterId}`,
          members: [],
          avgSimilarity: 0,
          size: 0,
          centroid: this.calculateCentroid([record]),
          representativeAreas: []
        });
      }
      
      const cluster = clusterMap.get(clusterId)!;
      cluster.members.push(record);
      cluster.size++;
    });
    
    // Calculate final cluster statistics
    Array.from(clusterMap.values()).forEach(cluster => {
      cluster.avgSimilarity = cluster.members.reduce((sum, member) => 
        sum + (member.properties.similarity_score || 0), 0) / cluster.size;
      
      cluster.centroid = this.calculateCentroid(cluster.members);
      
      // Get top 3 most representative areas
      cluster.representativeAreas = cluster.members
        .sort((a, b) => (b.properties.similarity_score || 0) - (a.properties.similarity_score || 0))
        .slice(0, 3)
        .map(member => member.area_name);
    });
    
    return {
      clusters: Array.from(clusterMap.values()),
      clusterCount: clusterMap.size,
      totalMembers: data.records.length,
      avgClusterSize: data.records.length / clusterMap.size
    };
  }

  private generateClusterColors(clusterCount: number): string[] {
    // For 5 or fewer clusters, use standardized quintile colors for consistency
    if (clusterCount <= 5) {
      console.log('[ClusterRenderer] Using quintile colors for', clusterCount, 'clusters');
      const quintileColors = getQuintileColorScheme();
      return quintileColors.slice(0, clusterCount);
    }
    
    // For more than 5 clusters, use distinctive categorical colors
    const baseColors = [
      '#1f77b4', // Blue
      '#ff7f0e', // Orange  
      '#2ca02c', // Green
      '#d62728', // Red
      '#9467bd', // Purple
      '#8c564b', // Brown
      '#e377c2', // Pink
      '#7f7f7f', // Gray
      '#bcbd22', // Olive
      '#17becf', // Cyan
      '#aec7e8', // Light Blue
      '#ffbb78', // Light Orange
      '#98df8a', // Light Green
      '#ff9896', // Light Red
      '#c5b0d5', // Light Purple
      '#c49c94', // Light Brown
      '#f7b6d3', // Light Pink
      '#c7c7c7', // Light Gray
      '#dbdb8d', // Light Olive
      '#9edae5'  // Light Cyan
    ];
    
    const colors = [];
    for (let i = 0; i < clusterCount; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    
    return colors;
  }

  private createClusterRenderer(clusterInfo: ClusterInfo, clusterColors: string[], config: VisualizationConfig): any {
    // Detect geometry type from config or default to polygon for cluster analysis
    const geometryType = (config as any).geometryType || 'polygon';
    console.log('🔍 [ClusterRenderer] Detected geometryType:', geometryType, 'config.geometryType:', (config as any).geometryType);
    // For cluster rendering, always use 'value' field which contains cluster IDs
    // regardless of what targetVariable is configured as
    const valueField = 'value';
    
    // For clustering with polygon data, support both polygon fills and centroid points
    console.log('🔍 [ClusterRenderer] About to check if geometryType === polygon:', geometryType === 'polygon');
    if (geometryType === 'polygon') {
      console.log('✅ [ClusterRenderer] Taking POLYGON branch - should use filled areas');
      // Always use polygon fills for better geographic understanding
      const usePointClusters = false; // Disabled: always show polygons for spatial clusters
      
      if (usePointClusters) {
        console.log('[ClusterRenderer] Using enhanced firefly centroids for cluster point symbols');
        
        // FIREFLY-ENHANCED CLUSTER POINTS
        const fireflyClusterColors = this.getClusterFireflyColors(clusterInfo.clusterCount);
        
        return {
          type: 'unique-value',
          field: valueField, // Use dynamic field from config
          uniqueValueInfos: clusterInfo.clusters.map((cluster, index) => {
            const baseSize = Math.max(12, Math.min(32, cluster.size / 3)); // Larger base sizes
            return {
            value: cluster.id,
            symbol: {
              type: 'simple-marker',
              style: 'circle',
                color: fireflyClusterColors[index],
                size: baseSize,
              outline: {
                  color: fireflyClusterColors[index], // Match outline for seamless blend
                  width: 0
                },
                // CLUSTER FIREFLY ENHANCEMENT
                _fireflyEffect: {
                  glowSize: baseSize + 12,
                  intensity: Math.min(0.9, cluster.size / 20), // Intensity based on cluster size
                  pulseSpeed: 1800 + (index * 300), // Varying speeds per cluster
                  blendMode: 'screen'
              }
            },
            label: cluster.label
            };
          }),
          defaultSymbol: {
            type: 'simple-marker',
            style: 'circle',
            color: [128, 128, 128, 0.3],
            size: 8
          },
          _useCentroids: true,
          _fireflyMode: true,
          _visualEffects: {
            glow: true,
            blend: 'screen',
            animation: 'pulse',
            quality: 'high'
          }
        };
      }
      
      // ENHANCED POLYGON CLUSTER VISUALIZATION
      console.log('🎯 [ClusterRenderer] Using POLYGON renderer - should show filled areas, not circles');
      const enhancedPolygonColors = this.getEnhancedPolygonColors(clusterInfo.clusterCount);
      
        return {
          type: 'unique-value',
          field: valueField, // Use dynamic field from config
          uniqueValueInfos: clusterInfo.clusters.map((cluster, index) => ({
            value: cluster.id,
            symbol: {
              type: 'simple-fill',
            color: enhancedPolygonColors[index].fill,
              outline: {
              color: enhancedPolygonColors[index].outline,
              width: 2,
              style: 'solid'
            },
            // POLYGON ENHANCEMENT PROPERTIES
            _polygonEffects: {
              gradient: true,
              gradientType: 'radial',
              gradientStops: [
                { color: enhancedPolygonColors[index].fill, position: 0 },
                { color: enhancedPolygonColors[index].edge, position: 1 }
              ],
              borderAnimation: 'glow',
              opacity: 0.7,
              texturePattern: cluster.size > 10 ? 'dots' : 'none'
              }
            },
            label: cluster.label
          })),
          defaultSymbol: {
            type: 'simple-fill',
            color: [200, 200, 200, 0.3],
            outline: {
              color: [128, 128, 128, 0.8],
              width: 1
            }
        },
        _polygonMode: true,
        _visualEffects: {
          gradient: true,
          borderGlow: true,
          textureOverlay: true,
          quality: 'high'
          }
        };
    } else {
      console.log('❌ [ClusterRenderer] Taking POINT branch - geometryType was not polygon:', geometryType);
      // ENHANCED POINT GEOMETRY - firefly cluster symbols
      const fireflyClusterColors = this.getClusterFireflyColors(clusterInfo.clusterCount);
      
      return {
        type: 'unique-value',
        field: valueField,
        uniqueValueInfos: clusterInfo.clusters.map((cluster, index) => {
          const baseSize = Math.max(14, Math.min(28, cluster.size / 2));
          return {
          value: cluster.id,
          symbol: {
            type: 'simple-marker',
            style: 'circle',
              color: fireflyClusterColors[index],
              size: baseSize,
            outline: {
                color: fireflyClusterColors[index],
                width: 0
              },
              // CLUSTER FIREFLY ENHANCEMENT
              _fireflyEffect: {
                glowSize: baseSize + 10,
                intensity: Math.min(0.85, cluster.size / 15),
                pulseSpeed: 2000 + (index * 200),
                blendMode: 'screen'
            }
          },
          label: cluster.label
          };
        }),
        _fireflyMode: true,
        _visualEffects: {
          glow: true,
          blend: 'screen',
          animation: 'pulse',
          quality: 'high'
        }
      };
    }
  }

  private createClusterPopupTemplate(data: ProcessedAnalysisData, config: VisualizationConfig): any {
    // Create cluster-specific popup content
    const content = [
      {
        type: 'text',
        text: '<h3>{' + (config.labelField || 'area_name') + '}</h3>'
      },
      {
        type: 'fields',
        fieldInfos: [
          {
            fieldName: config.valueField || 'value',
            label: 'Cluster Value'
          },
          {
            fieldName: 'category',
            label: 'Cluster Type'
          },
          {
            fieldName: 'rank',
            label: 'Similarity Rank'
          },
          {
            fieldName: 'properties.similarity_score',
            label: 'Similarity Score',
            format: {
              digitSeparator: true,
              places: 3
            }
          }
        ]
      }
    ];

    // Add cluster-specific information if available
    if (data.clusterAnalysis) {
      content.push({
        type: 'text',
        text: '<h4>Cluster Information</h4>'
      });
      
      content.push({
        type: 'fields',
        fieldInfos: [
          {
            fieldName: 'properties.cluster_size',
            label: 'Cluster Size'
          },
          {
            fieldName: 'properties.cluster_centroid_distance',
            label: 'Distance to Centroid',
            format: {
              digitSeparator: true,
              places: 2
            }
          }
        ]
      });
    }

    // Add SHAP values if available
    if (data.records.length > 0 && data.records[0].shapValues && Object.keys(data.records[0].shapValues).length > 0) {
      content.push({
        type: 'text',
        text: '<h4>Key Clustering Factors</h4>'
      });
      
      const topShapFields = Object.keys(data.records[0].shapValues)
        .slice(0, 3)
        .map(field => ({
          fieldName: `shapValues.${field}`,
          label: this.formatFieldLabel(field)
        }));
      
      content.push({
        type: 'fields',
        fieldInfos: topShapFields
      });
    }

    return {
      title: 'Cluster Analysis',
      content,
      outFields: ['*'],
      returnGeometry: true
    };
  }

  private createClusterLegend(clusterInfo: ClusterInfo, clusterColors: string[], data: ProcessedAnalysisData): any {
    const legendItems = clusterInfo.clusters.map((cluster, index) => ({
      label: `${cluster.label} (${cluster.size} areas)`,
      color: clusterColors[index],
      value: cluster.id,
      symbol: 'circle',
      description: `Avg similarity: ${(cluster.avgSimilarity * 100).toFixed(1)}%`
    }));

    // Sort by cluster size (largest first)
    legendItems.sort((a, b) => {
      const clusterA = clusterInfo.clusters.find(c => c.id === a.value)!;
      const clusterB = clusterInfo.clusters.find(c => c.id === b.value)!;
      return clusterB.size - clusterA.size;
    });

    return {
      title: `Spatial Clusters (${clusterInfo.clusterCount} groups)`,
      items: legendItems,
      position: 'bottom-right',
      type: 'categorical'
    };
  }

  private calculateCentroid(records: any[]): [number, number] {
    if (records.length === 0) return [0, 0];
    
    const sumLat = records.reduce((sum, record) => sum + (record.coordinates?.[1] || 0), 0);
    const sumLng = records.reduce((sum, record) => sum + (record.coordinates?.[0] || 0), 0);
    
    return [sumLng / records.length, sumLat / records.length];
  }

  private darkenColor(color: string, factor: number): string {
    // Simple color darkening function
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const newR = Math.floor(r * (1 - factor));
    const newG = Math.floor(g * (1 - factor));
    const newB = Math.floor(b * (1 - factor));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    // Handle both hex and rgb colors
    if (hex.startsWith('rgb')) {
      const matches = hex.match(/\d+/g);
      if (matches) {
        return {
          r: parseInt(matches[0]),
          g: parseInt(matches[1]),
          b: parseInt(matches[2])
        };
      }
    }
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  private formatFieldLabel(field: string): string {
    return field
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }

  // ============================================================================
  // CLUSTER CENTROID MARKERS (for enhanced visualization)
  // ============================================================================

  createCentroidMarkers(clusterInfo: ClusterInfo, clusterColors: string[]): any[] {
    return clusterInfo.clusters.map((cluster, index) => ({
      type: 'point',
      geometry: {
        type: 'point',
        longitude: cluster.centroid[0],
        latitude: cluster.centroid[1]
      },
      symbol: {
        type: 'simple-marker',
        style: 'diamond',
        color: clusterColors[index],
        size: Math.max(8, Math.min(16, cluster.size / 2)), // Size based on cluster size
        outline: {
          color: '#FFFFFF',
          width: 2
        }
      },
      attributes: {
        cluster_id: cluster.id,
        cluster_label: cluster.label,
        cluster_size: cluster.size,
        avg_similarity: cluster.avgSimilarity
      }
    }));
  }

  private getClusterFireflyColors(clusterCount: number): string[] {
    // Firefly-inspired colors for cluster points
    const fireflyColors = [
      'rgba(255, 107, 107, 0.85)', // Bright Red
      'rgba(78, 205, 196, 0.85)',  // Teal
      'rgba(150, 206, 180, 0.85)', // Mint Green
      'rgba(255, 238, 173, 0.85)', // Light Yellow
      'rgba(255, 140, 0, 0.85)',   // Orange
      'rgba(147, 112, 219, 0.85)', // Medium Purple
      'rgba(255, 192, 203, 0.85)', // Pink
      'rgba(64, 224, 208, 0.85)',  // Turquoise
      'rgba(255, 165, 0, 0.85)',   // Orange
      'rgba(106, 90, 205, 0.85)',  // Slate Blue
      'rgba(152, 251, 152, 0.85)', // Pale Green
      'rgba(255, 20, 147, 0.85)'   // Deep Pink
    ];
    
    const colors = [];
    for (let i = 0; i < clusterCount; i++) {
      colors.push(fireflyColors[i % fireflyColors.length]);
    }
    return colors;
  }

  private getEnhancedPolygonColors(clusterCount: number): { fill: string; outline: string; edge: string }[] {
    const baseColors = [
      '#ff6b6b', // Red
      '#4ecdc4', // Teal
      '#96ceb4', // Mint
      '#ffeead', // Yellow
      '#ff8c00', // Orange
      '#9370db', // Medium Purple
      '#ffc0cb', // Pink
      '#40e0d0', // Turquoise
      '#ffa500', // Orange
      '#6a5acd', // Slate Blue
      '#98fb98', // Pale Green
      '#ff1493'  // Deep Pink
    ];
    
    const colors = [];
    for (let i = 0; i < clusterCount; i++) {
      const baseFill = baseColors[i % baseColors.length];
      const baseOutline = this.darkenColor(baseFill, 0.3);
      const baseEdge = this.darkenColor(baseFill, 0.5);
      colors.push({ fill: baseFill, outline: baseOutline, edge: baseEdge });
    }
    return colors;
  }
}

// ============================================================================
// INTERFACES
// ============================================================================

interface ClusterInfo {
  clusters: ClusterDetails[];
  clusterCount: number;
  totalMembers: number;
  avgClusterSize: number;
}

interface ClusterDetails {
  id: number;
  label: string;
  members: any[];
  avgSimilarity: number;
  size: number;
  centroid: [number, number];
  representativeAreas: string[];
} 