/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProcessedAnalysisData, VisualizationResult, VisualizationConfig } from '../../types';
import { EnhancedRendererBase, EnhancedVisualizationConfig } from './EnhancedRendererBase';
import { STANDARD_COLOR_SCHEME, STANDARD_OPACITY, standardizeRenderer } from '@/utils/renderer-standardization';

/**
 * ChoroplethRenderer - Enhanced choropleth map visualization with visual effects
 * 
 * Features:
 * - Intelligent color classification methods
 * - Dynamic legend generation
 * - Interactive popup templates
 * - Performance-optimized rendering
 * - Accessibility support
 * - Advanced visual effects (gradients, animations, hover effects)
 * - Firefly particles for high-value areas
 */
export class ChoroplethRenderer extends EnhancedRendererBase {
  
  supportsType(type: string): boolean {
    return type === 'choropleth';
  }

  render(data: ProcessedAnalysisData, config: EnhancedVisualizationConfig): VisualizationResult {
    console.log(`[ChoroplethRenderer] Rendering ${data.records.length} records with enhanced effects`);
    
    // Set default visual effects for choropleth maps
    const enhancedConfig: EnhancedVisualizationConfig = {
      ...config,
      visualEffects: {
        gradients: {
          enabled: true,
          type: 'linear',
          colors: [],
          animated: true
        },
        borders: {
          enabled: true,
          style: 'solid',
          width: 1,
          animated: false,
          color: '#FFFFFF'
        },
        hover: {
          enabled: true,
          scale: 1.05,
          glow: true,
          ripple: true,
          colorShift: true
        },
        fireflies: {
          enabled: true,
          intensity: 0.6,
          color: '#FFD700',
          size: 3,
          speed: 1
        },
        ...config.visualEffects
      },
      animations: {
        entrance: {
          enabled: true,
          duration: 800,
          easing: 'ease-out',
          delay: 0,
          loop: false
        },
        idle: {
          enabled: false,
          duration: 3000,
          easing: 'ease-in-out',
          delay: 0,
          loop: true
        },
        ...config.animations
      }
    };
    
    // Determine optimal classification method
    const classificationMethod = this.determineClassificationMethod(data, enhancedConfig);
    
    // Calculate class breaks
    const classBreaks = this.calculateClassBreaks(data, classificationMethod, enhancedConfig);
    
    // Generate enhanced color scheme
    const colorScheme = this.generateEnhancedColorScheme(data, enhancedConfig, classBreaks.length);
    
    // Create enhanced ArcGIS renderer with visual effects
    const baseRenderer = this.createArcGISRenderer(classBreaks, colorScheme, enhancedConfig);
    const renderer = this.createEnhancedRenderer(baseRenderer, data, enhancedConfig);
    
    // Apply standard color scheme and opacity
    console.log(`[ChoroplethRenderer] 🔍 Before standardizeRenderer:`, {
      rendererType: renderer.type,
      hasClassBreakInfos: !!renderer.classBreakInfos,
      classBreakCount: renderer.classBreakInfos?.length,
      firstClassColor: renderer.classBreakInfos?.[0]?.symbol?.color
    });
    
    const standardizedRenderer = standardizeRenderer(renderer, classBreaks.length - 1);
    
    console.log(`[ChoroplethRenderer] 🔍 After standardizeRenderer:`, {
      rendererType: standardizedRenderer.type,
      hasClassBreakInfos: !!standardizedRenderer.classBreakInfos,
      classBreakCount: standardizedRenderer.classBreakInfos?.length,
      firstClassColor: standardizedRenderer.classBreakInfos?.[0]?.symbol?.color
    });
    
    // Generate enhanced popup template with animations
    const popupTemplate = this.createEnhancedPopupTemplate(data, enhancedConfig);
    
    // Create enhanced legend configuration
    const legend = this.createEnhancedLegendConfig(classBreaks, colorScheme, data);
    
    // Add firefly effect configuration for high-value features
    const fireflyEffect = this.createFireflyEffect(data, enhancedConfig);

    return {
      type: 'choropleth',
      config: {
        ...enhancedConfig,
        colorScheme: enhancedConfig.colorScheme || 'blue-to-red',
        classificationMethod,
        classBreaks
      },
      renderer: standardizedRenderer,
      popupTemplate,
      legend,
      _enhancedEffects: {
        fireflies: fireflyEffect,
        gradients: enhancedConfig.visualEffects?.gradients,
        animations: enhancedConfig.animations
      }
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private determineClassificationMethod(data: ProcessedAnalysisData, config: VisualizationConfig): string {
    // Always use quartiles for equal feature distribution
    // This ensures consistent visualization across all analyses
    return 'quartiles';
  }

  private calculateClassBreaks(data: ProcessedAnalysisData, method: string, config: VisualizationConfig): number[] {
    // Use the correct field specified by the VisualizationRenderer
    const fieldToUse = (config as any).valueField || 'value';
    console.log(`[ChoroplethRenderer] Using field for class breaks: ${fieldToUse}`);
    console.log(`[ChoroplethRenderer] Data type: ${data.type}`);
    console.log(`[ChoroplethRenderer] Record count: ${data.records.length}`);
    
    // Debug first few records
    console.log(`[ChoroplethRenderer] First 3 records structure:`);
    data.records.slice(0, 3).forEach((record, i) => {
      console.log(`  Record ${i + 1}:`, {
        area_name: record.area_name,
        value: record.value,
        [fieldToUse]: (record as any)[fieldToUse],
        hasTargetField: fieldToUse in record,
        targetFieldType: typeof (record as any)[fieldToUse]
      });
    });
    
    const values = data.records.map(r => (r as any)[fieldToUse]).filter(v => v !== undefined && !isNaN(v));
    
    if (values.length === 0) {
      return [0, 1];
    }

    // Use config breaks if provided
    if (config.classBreaks && config.classBreaks.length > 0) {
      return config.classBreaks;
    }

    const numClasses = this.determineOptimalClassCount(values);
    
    switch (method) {
      case 'quartiles':
        return this.calculateQuartileBreaks(values);
      
      case 'natural-breaks':
        return this.calculateJenksBreaks(values, numClasses);
      
      case 'quantile':
        return this.calculateQuantileBreaks(values, numClasses);
      
      case 'equal-interval':
        return this.calculateEqualIntervalBreaks(values, numClasses);
      
      case 'manual':
        return config.classBreaks || this.calculateEqualIntervalBreaks(values, numClasses);
      
      default:
        return this.calculateQuartileBreaks(values);
    }
  }

  /**
   * Calculate quartile breaks using equal feature distribution
   */
  private calculateQuartileBreaks(values: number[]): number[] {
    console.log('[ChoroplethRenderer] Calculating quartile breaks for', values.length, 'values');
    
    if (values.length === 0) {
      console.warn('[ChoroplethRenderer] No values provided for quartile calculation');
      return [0, 1];
    }
    
    // Calculate quartiles (4 classes) instead of quintiles (5 classes)
    const sortedValues = [...values].sort((a, b) => a - b);
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];
    
    // Calculate quartile boundaries for equal feature distribution
    const quartileBreaks = [];
    for (let i = 1; i <= 3; i++) { // 3 internal breaks for 4 quartiles
      const index = Math.floor((i / 4) * sortedValues.length);
      const clampedIndex = Math.min(index, sortedValues.length - 1);
      quartileBreaks.push(sortedValues[clampedIndex]);
    }
    
    // Create proper class break boundaries (need n+1 breaks for n classes)
    const breaks = [min, ...quartileBreaks, max];
    
    console.log('[ChoroplethRenderer] Quartile boundaries:', quartileBreaks);
    console.log('[ChoroplethRenderer] Final class breaks:', breaks);
    return breaks;
  }

  private generateColorScheme(data: ProcessedAnalysisData, config: VisualizationConfig, numClasses: number): string[] {
    // Use standard color scheme from competitive renderer
    return STANDARD_COLOR_SCHEME.slice(0, numClasses);
  }

  private createArcGISRenderer(classBreaks: number[], colors: string[], config: VisualizationConfig): any {
    console.log(`[ChoroplethRenderer] Creating ArcGIS renderer with:`);
    console.log(`[ChoroplethRenderer] Class breaks:`, classBreaks);
    console.log(`[ChoroplethRenderer] Colors:`, colors);
    console.log(`[ChoroplethRenderer] Number of classes: ${classBreaks.length - 1}`);
    
    const classBreakInfos = [];
    
    // ENHANCED POLYGON VISUALIZATION with gradients and effects
    for (let i = 0; i < classBreaks.length - 1; i++) {
      const baseColor = colors[i];
      const intensity = (i + 1) / (classBreaks.length - 1); // 0 to 1 intensity scale
      
      console.log(`[ChoroplethRenderer] Class ${i + 1}: ${classBreaks[i]} - ${classBreaks[i + 1]} -> ${baseColor}`);
      
      // 🔥 FIX: Convert color to array format for ArcGIS
      const rgb = this.hexToRgb(baseColor);
      const symbolColor = [rgb.r, rgb.g, rgb.b, STANDARD_OPACITY]; // Array format required by ArcGIS
      
      console.log(`[ChoroplethRenderer] 🎨 Creating symbol for class ${i + 1}:`, {
        baseColor: baseColor,
        opacity: STANDARD_OPACITY,
        resultingColor: symbolColor,
        rgbObject: rgb,
        arrayFormat: symbolColor,
        intensity: intensity,
        exactRGBAArray: [rgb.r, rgb.g, rgb.b, STANDARD_OPACITY],
        isValidArray: Array.isArray(symbolColor),
        arrayLength: symbolColor.length,
        firstValue: symbolColor[0],
        secondValue: symbolColor[1],
        thirdValue: symbolColor[2],
        fourthValue: symbolColor[3]
      });
      
      classBreakInfos.push({
        minValue: classBreaks[i],
        maxValue: classBreaks[i + 1],
        symbol: {
          type: 'simple-fill',
          color: symbolColor, // Now in correct array format
          outline: {
            color: this.enhanceColorForOutline(baseColor, intensity),
            width: config.strokeWidth || 1.5,
            style: 'solid'
          },
          // POLYGON ENHANCEMENT PROPERTIES
          _polygonEffects: {
            gradient: true,
            gradientType: intensity > 0.7 ? 'radial' : 'linear',
            gradientDirection: 45, // degrees
            gradientStops: [
              { 
                color: this.enhanceColorWithAlpha(baseColor, 0.9), 
                position: 0 
              },
              { 
                color: this.enhanceColorWithAlpha(baseColor, 0.5), 
                position: 0.7 
              },
              { 
                color: this.enhanceColorWithAlpha(this.darkenColorForPolygon(baseColor, 0.2), 0.3), 
                position: 1 
              }
            ],
            borderAnimation: intensity > 0.8 ? 'glow' : 'subtle',
            shadowEffect: intensity > 0.6,
            texturePattern: intensity > 0.9 ? 'crosshatch' : 'none',
            hoverEnhancement: true
          }
        },
        label: this.formatClassLabel(classBreaks[i], classBreaks[i + 1])
      });
    }

    const rendererField = config.valueField || 'value';
    console.log(`[ChoroplethRenderer] 🎯 Creating ArcGIS renderer with field: "${rendererField}"`);
    console.log(`[ChoroplethRenderer] 🎯 Class break count: ${classBreakInfos.length}`);
    console.log(`[ChoroplethRenderer] 🎯 First class break:`, classBreakInfos[0]);
    
    // 🔍 DEBUG: Log all class break colors to verify they're correct
    classBreakInfos.forEach((breakInfo, index) => {
      console.log(`[ChoroplethRenderer] 🎨 Class ${index + 1} final color:`, {
        minValue: breakInfo.minValue,
        maxValue: breakInfo.maxValue,
        symbolColor: breakInfo.symbol.color,
        isArray: Array.isArray(breakInfo.symbol.color),
        colorValues: breakInfo.symbol.color
      });
    });
    
    // 🔥 STRATEGIC ANALYSIS FIX: Ensure field name is exactly correct
    const finalField = rendererField === 'strategic_value_score' ? 'strategic_value_score' : rendererField;
    console.log(`[ChoroplethRenderer] 🎯 Final field name: "${finalField}"`);
    
    return {
      type: 'class-breaks',
      field: finalField,
      classBreakInfos,
      defaultSymbol: {
        type: 'simple-fill',
        color: [200, 200, 200, STANDARD_OPACITY],
        outline: {
          color: '#CCCCCC',
          width: 0.5
        }
      },
      // CHOROPLETH ENHANCEMENT FLAGS
      _polygonMode: true,
      _visualEffects: {
        gradient: true,
        borderEffects: true,
        shadowMapping: true,
        textureOverlay: true,
        hoverAnimations: true,
        quality: 'high'
      }
    };
  }

  private createPopupTemplate(data: ProcessedAnalysisData, config: VisualizationConfig): any {
    // Determine which fields to show in popup
    const popupFields = config.popupFields || this.determinePopupFields(data);
    
    // Create field infos for popup
    const fieldInfos = popupFields.map(field => ({
      fieldName: field,
      label: this.formatFieldLabelForChoropleth(field),
      format: this.getFieldFormatForChoropleth(field)
    }));

    // Create popup content
    const content = this.createPopupContent(data, popupFields);

    return {
      title: '{' + (config.labelField || 'area_name') + '}',
      content,
      fieldInfos,
      outFields: ['*'],
      returnGeometry: true
    };
  }

  private createLegendConfig(classBreaks: number[], colors: string[], data: ProcessedAnalysisData): any {
    const legendItems = [];
    
    for (let i = 0; i < classBreaks.length - 1; i++) {
      legendItems.push({
        label: this.formatClassLabel(classBreaks[i], classBreaks[i + 1]),
        color: colors[i],
        value: (classBreaks[i] + classBreaks[i + 1]) / 2
      });
    }

    return {
      title: this.formatLegendTitle(data),
      items: legendItems,
      position: 'bottom-right'
    };
  }

  // ============================================================================
  // CLASSIFICATION METHODS
  // ============================================================================

  private calculateJenksBreaks(values: number[], numClasses: number): number[] {
    // Simplified Jenks Natural Breaks implementation
    const sortedValues = [...values].sort((a, b) => a - b);
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];
    
    if (numClasses >= sortedValues.length) {
      return [min, max];
    }

    // Use simplified version - for production, consider using a proper Jenks library
    const breaks = [min];
    const step = (max - min) / (numClasses - 1);
    
    for (let i = 1; i < numClasses - 1; i++) {
      breaks.push(min + (step * i));
    }
    
    breaks.push(max);
    return breaks;
  }

  private calculateQuantileBreaks(values: number[], numClasses: number): number[] {
    const sortedValues = [...values].sort((a, b) => a - b);
    const breaks = [];
    
    for (let i = 0; i <= numClasses; i++) {
      const position = (i / numClasses) * (sortedValues.length - 1);
      const index = Math.round(position);
      breaks.push(sortedValues[Math.min(index, sortedValues.length - 1)]);
    }
    
    return Array.from(new Set(breaks)).sort((a, b) => a - b); // Remove duplicates
  }

  private calculateEqualIntervalBreaks(values: number[], numClasses: number): number[] {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const interval = (max - min) / numClasses;
    
    const breaks = [];
    for (let i = 0; i <= numClasses; i++) {
      breaks.push(min + (interval * i));
    }
    
    return breaks;
  }

  private calculateNaturalBreaks(values: number[], numClasses: number): number[] {
    // Fallback to equal interval for now
    return this.calculateEqualIntervalBreaks(values, numClasses);
  }

  // ============================================================================
  // COLOR GENERATION
  // ============================================================================

  private interpolateColors(startColor: string, endColor: string, steps: number): string[] {
    const start = this.hexToRgb(startColor);
    const end = this.hexToRgb(endColor);
    
    const colors = [];
    
    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1);
      const r = Math.round(start.r + (end.r - start.r) * ratio);
      const g = Math.round(start.g + (end.g - start.g) * ratio);
      const b = Math.round(start.b + (end.b - start.b) * ratio);
      
      colors.push(`rgb(${r}, ${g}, ${b})`);
    }
    
    return colors;
  }

  private getViridisColors(numClasses: number): string[] {
    // Simplified viridis color scheme
    const viridisBase = ['#440154', '#3b528b', '#21908c', '#5dc863', '#fde725'];
    return this.interpolateColorScheme(viridisBase, numClasses);
  }

  private getPlasmaColors(numClasses: number): string[] {
    // Simplified plasma color scheme
    const plasmaBase = ['#0d0887', '#6a00a8', '#b12a90', '#e16462', '#fca636'];
    return this.interpolateColorScheme(plasmaBase, numClasses);
  }

  private getCategoricalColors(numClasses: number): string[] {
    const categoricalColors = [
      '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
      '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
    ];
    
    const colors = [];
    for (let i = 0; i < numClasses; i++) {
      colors.push(categoricalColors[i % categoricalColors.length]);
    }
    
    return colors;
  }

  private interpolateColorScheme(baseColors: string[], targetLength: number): string[] {
    if (targetLength <= baseColors.length) {
      return baseColors.slice(0, targetLength);
    }
    
    const colors = [];
    const step = (baseColors.length - 1) / (targetLength - 1);
    
    for (let i = 0; i < targetLength; i++) {
      const position = i * step;
      const lowerIndex = Math.floor(position);
      const upperIndex = Math.ceil(position);
      const ratio = position - lowerIndex;
      
      if (lowerIndex === upperIndex) {
        colors.push(baseColors[lowerIndex]);
      } else {
        colors.push(this.blendColors(baseColors[lowerIndex], baseColors[upperIndex], ratio));
      }
    }
    
    return colors;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private hasOutliers(values: number[]): boolean {
    if (values.length < 4) return false;
    
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return values.some(v => v < lowerBound || v > upperBound);
  }

  private isNormallyDistributed(values: number[]): boolean {
    // Simplified normality test - check if mean ≈ median
    if (values.length < 10) return false;
    
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    
    const ratio = Math.abs(mean - median) / Math.abs(mean);
    return ratio < 0.1; // Within 10%
  }

  private determineOptimalClassCount(values: number[]): number {
    // Always use 4 classes (quartiles) to match static layers
    return 4;
  }

  private determinePopupFields(data: ProcessedAnalysisData): string[] {
    if (data.records.length === 0) return ['area_name', 'value'];
    
    const sampleRecord = data.records[0];
    const fields = ['area_name', 'value', 'rank', 'category'];
    
    // Add important property fields
    const propertyKeys = Object.keys(sampleRecord.properties || {});
    const importantFields = propertyKeys.filter(key => 
      !key.includes('_raw') && 
      !key.includes('_id') && 
      typeof sampleRecord.properties[key] !== 'object'
    ).slice(0, 5); // Limit to 5 additional fields
    
    return [...fields, ...importantFields];
  }

  private createPopupContent(data: ProcessedAnalysisData, fields: string[]): any[] {
    const content = [];
    
    // Add main content
    content.push({
      type: 'fields',
      fieldInfos: fields.map(field => ({
        fieldName: field,
        label: this.formatFieldLabelForChoropleth(field)
      }))
    });

    // Add SHAP values if available
    if (data.records.length > 0 && data.records[0].shapValues && Object.keys(data.records[0].shapValues).length > 0) {
      content.push({
        type: 'text',
        text: '<h4>Feature Importance</h4>'
      });
      
      content.push({
        type: 'fields',
        fieldInfos: Object.keys(data.records[0].shapValues).slice(0, 3).map(field => ({
          fieldName: `shapValues.${field}`,
          label: this.formatFieldLabelForChoropleth(field)
        }))
      });
    }

    return content;
  }

  private formatClassLabel(min: number, max: number): string {
    return `${this.formatNumber(min)} - ${this.formatNumber(max)}`;
  }

  private formatFieldLabelForChoropleth(field: string): string {
    return field
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }

  private formatLegendTitle(data: ProcessedAnalysisData): string {
    const variable = data.targetVariable || 'Value';
    return this.formatFieldLabelForChoropleth(variable);
  }

  private formatNumber(value: number): string {
    if (Math.abs(value) >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (Math.abs(value) >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    } else if (value % 1 === 0) {
      return value.toString();
    } else {
      return value.toFixed(2);
    }
  }

  private getFieldFormatForChoropleth(fieldName: string): any {
    if (fieldName === 'value' || fieldName.includes('score') || fieldName.includes('rate')) {
      return {
        digitSeparator: true,
        places: 2
      };
    }
    
    if (fieldName.includes('percent') || fieldName.includes('ratio')) {
      return {
        digitSeparator: true,
        places: 1
      };
    }
    
    return null;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  private blendColors(color1: string, color2: string, ratio: number): string {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    
    const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
    const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
    const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  private enhanceColorWithAlpha(color: string, alpha: number): string {
    const rgb = this.hexToRgb(color);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  private enhanceColorForOutline(color: string, intensity: number): string {
    const rgb = this.hexToRgb(color);
    const enhancedR = Math.round(rgb.r * (1 + intensity * 0.5));
    const enhancedG = Math.round(rgb.g * (1 + intensity * 0.5));
    const enhancedB = Math.round(rgb.b * (1 + intensity * 0.5));
    return `rgba(${enhancedR}, ${enhancedG}, ${enhancedB}, 1)`;
  }

  private darkenColorForPolygon(color: string, factor: number): string {
    const rgb = this.hexToRgb(color);
    const darkenedR = Math.round(rgb.r * (1 - factor));
    const darkenedG = Math.round(rgb.g * (1 - factor));
    const darkenedB = Math.round(rgb.b * (1 - factor));
    return `rgba(${darkenedR}, ${darkenedG}, ${darkenedB}, 1)`;
  }

  // ============================================================================
  // ENHANCED VISUAL EFFECTS METHODS
  // ============================================================================

  /**
   * Generate enhanced color scheme with visual effects
   */
  private generateEnhancedColorScheme(data: ProcessedAnalysisData, config: EnhancedVisualizationConfig, numClasses: number): string[] {
    // Use quartile colors (4 classes) to match static layers: red -> orange -> light green -> dark green
    const quartileColors = [
      '#d73027', // Strong red (lowest values)
      '#fdae61', // Orange
      '#a6d96a', // Light green
      '#1a9850'  // Dark green (highest values)
    ];
    
    console.log(`[ChoroplethRenderer] Generating quartile color scheme for ${numClasses} classes`);
    console.log(`[ChoroplethRenderer] Quartile colors:`, quartileColors);
    
    // Always return exactly 4 quartile colors to match static layers
    return quartileColors;
  }

  /**
   * Create enhanced legend configuration with visual effects
   */
  private createEnhancedLegendConfig(classBreaks: number[], colorScheme: string[], data: ProcessedAnalysisData): any {
    const baseLegend = this.createLegendConfig(classBreaks, colorScheme, data);
    
    return {
      ...baseLegend,
      _enhancedEffects: {
        animated: true,
        glowEffect: true,
        hoverHighlight: true
      }
    };
  }
} 