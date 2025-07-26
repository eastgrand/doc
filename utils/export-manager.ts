import { LayerConfig } from '@/types/layers';
import { LayerErrorHandler } from './layer-error-handler';

export interface ExportConfig {
  format: 'csv';
  includeMetadata: boolean;
  includeGeometry: boolean;
  includeAttributes: boolean;
  includeRenderer: boolean;
  includeTimeData: boolean;
  compression: boolean;
  filename: string;
  description?: string;
}

export class ExportManager {
  private static instance: ExportManager;
  private errorHandler: LayerErrorHandler;

  private constructor() {
    this.errorHandler = LayerErrorHandler.getInstance();
  }

  public static getInstance(): ExportManager {
    if (!ExportManager.instance) {
      ExportManager.instance = new ExportManager();
    }
    return ExportManager.instance;
  }

  public async exportLayer(layer: LayerConfig, config: ExportConfig): Promise<Blob> {
    try {
      const data: any = {};

      // Include basic layer information
      data.id = layer.id;
      data.name = layer.name;
      data.type = layer.type;
      data.description = config.description || layer.description;

      // Include metadata if requested
      if (config.includeMetadata && layer.metadata) {
        data.metadata = layer.metadata;
      }

      // Include geometry if requested
      if (config.includeGeometry && layer.type !== 'index') {
        data.geometry = await this.fetchLayerGeometry(layer);
      }

      // Include attributes if requested
      if (config.includeAttributes) {
        data.attributes = await this.fetchLayerAttributes(layer);
      }

      // Include renderer if requested
      if (config.includeRenderer && layer.rendererField) {
        data.renderer = {
          field: layer.rendererField,
          type: layer.type
        };
      }

      // Include time data if requested
      if (config.includeTimeData && layer.metadata?.lastUpdate) {
        data.timeData = {
          lastUpdate: layer.metadata.lastUpdate,
          updateFrequency: layer.metadata.updateFrequency
        };
      }

      // Convert to CSV format
      const blob = await this.convertToCSV(data);

      // Apply compression if requested
      if (config.compression) {
        return await this.compressData(blob);
      }

      return blob;
    } catch (err) {
      await this.errorHandler.handleValidationError('export', err);
      throw err;
    }
  }

  private async fetchLayerGeometry(layer: LayerConfig): Promise<any> {
    // TODO: Implement geometry fetching from ArcGIS REST API
    return {};
  }

  private async fetchLayerAttributes(layer: LayerConfig): Promise<any> {
    // TODO: Implement attribute fetching from ArcGIS REST API
    return {};
  }

  private async convertToCSV(data: any): Promise<Blob> {
    try {
      // Extract all possible fields from the data
      const fields = new Set<string>();
      const rows: any[] = [];

      // Helper function to flatten nested objects
      const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
        return Object.keys(obj).reduce((acc: Record<string, any>, key: string) => {
          const prefixedKey = prefix ? `${prefix}.${key}` : key;
          if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            Object.assign(acc, flattenObject(obj[key], prefixedKey));
          } else {
            acc[prefixedKey] = obj[key];
          }
          return acc;
        }, {});
      };

      // Process the data object
      const flattenedData = flattenObject(data);
      Object.keys(flattenedData).forEach(field => fields.add(field));
      rows.push(flattenedData);

      // Convert to CSV format
      const csvContent = [
        // Header row
        Array.from(fields).join(','),
        // Data rows
        ...rows.map(row => 
          Array.from(fields).map(field => {
            const value = row[field];
            // Handle different value types
            if (value === null || value === undefined) return '';
            if (typeof value === 'string') {
              // Escape quotes and wrap in quotes if contains special characters
              const escaped = value.replace(/"/g, '""');
              return /[",\n\r]/.test(value) ? `"${escaped}"` : escaped;
            }
            if (value instanceof Date) return value.toISOString();
            return String(value);
          }).join(',')
        )
      ].join('\n');

      return new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    } catch (err) {
      await this.errorHandler.handleValidationError('csv-conversion', err);
      throw new Error('Failed to convert data to CSV format');
    }
  }

  private async compressData(blob: Blob): Promise<Blob> {
    // TODO: Implement compression using pako or similar library
    return blob;
  }

  public async saveExportTemplate(config: ExportConfig): Promise<void> {
    try {
      const templates = JSON.parse(localStorage.getItem('exportTemplates') || '[]');
      templates.push({
        ...config,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('exportTemplates', JSON.stringify(templates));
    } catch (err) {
      await this.errorHandler.handleValidationError('export-template', err);
      throw err;
    }
  }

  public async loadExportTemplates(): Promise<ExportConfig[]> {
    try {
      return JSON.parse(localStorage.getItem('exportTemplates') || '[]');
    } catch (err) {
      await this.errorHandler.handleValidationError('export-template', err);
      throw err;
    }
  }

  public async deleteExportTemplate(templateId: string): Promise<void> {
    try {
      const templates = JSON.parse(localStorage.getItem('exportTemplates') || '[]');
      const updatedTemplates = templates.filter((t: any) => t.id !== templateId);
      localStorage.setItem('exportTemplates', JSON.stringify(updatedTemplates));
    } catch (err) {
      await this.errorHandler.handleValidationError('export-template', err);
      throw err;
    }
  }
} 