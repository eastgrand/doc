/**
 * @jest-environment jsdom
 */

import { ProjectConfigurationManager } from '../services/project-config-manager';
import { ProjectConfiguration } from '../types/project-config';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock window object for browser environment detection
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000'
  },
  writable: true
});

describe('Deployment Functionality', () => {
  let manager: ProjectConfigurationManager;
  let mockConfig: ProjectConfiguration;

  beforeEach(() => {
    manager = ProjectConfigurationManager.getInstance();
    
    // Create a test configuration with multiple groups and layers
    mockConfig = {
      id: 'test-config',
      name: 'Test Configuration',
      description: 'Test configuration for deployment',
      version: '1.0.0',
      layers: {
        'demographics-layer-1': {
          id: 'demographics-layer-1',
          name: 'Population Density',
          type: 'feature-service',
          url: 'https://example.com/demographics1',
          group: 'demographics-group',
          description: 'Population density data',
          status: 'active',
          fields: [
            { name: 'POPULATION', type: 'integer', alias: 'Population' },
            { name: 'DENSITY', type: 'double', alias: 'Density per sq mile' }
          ],
          metadata: {
            provider: 'ArcGIS',
            updateFrequency: 'annual',
            geographicType: 'postal',
            geographicLevel: 'local'
          }
        },
        'demographics-layer-2': {
          id: 'demographics-layer-2',
          name: 'Age Distribution',
          type: 'feature-service',
          url: 'https://example.com/demographics2',
          group: 'demographics-group',
          description: 'Age distribution data',
          status: 'active',
          fields: [
            { name: 'MEDIAN_AGE', type: 'double', alias: 'Median Age' },
            { name: 'AGE_0_17', type: 'integer', alias: 'Age 0-17' }
          ],
          metadata: {
            provider: 'ArcGIS',
            updateFrequency: 'annual',
            geographicType: 'postal',
            geographicLevel: 'local'
          }
        },
        'income-layer-1': {
          id: 'income-layer-1',
          name: 'Household Income',
          type: 'feature-service',
          url: 'https://example.com/income1',
          group: 'income-group',
          description: 'Household income data',
          status: 'active',
          fields: [
            { name: 'MEDIAN_INCOME', type: 'double', alias: 'Median Income' },
            { name: 'INCOME_50K_75K', type: 'integer', alias: 'Income $50K-$75K' }
          ],
          metadata: {
            provider: 'ArcGIS',
            updateFrequency: 'annual',
            geographicType: 'postal',
            geographicLevel: 'local'
          }
        },
        'nesto-layer-1': {
          id: 'nesto-layer-1',
          name: 'Mortgage Applications',
          type: 'feature-service',
          url: 'https://example.com/nesto1',
          group: 'nesto-group',
          description: 'Mortgage application data',
          status: 'active',
          fields: [
            { name: 'APPLICATIONS', type: 'integer', alias: 'Applications' },
            { name: 'APPROVAL_RATE', type: 'double', alias: 'Approval Rate' }
          ],
          metadata: {
            provider: 'Nesto',
            updateFrequency: 'monthly',
            geographicType: 'postal',
            geographicLevel: 'local'
          }
        }
      },
      groups: [
        {
          id: 'demographics-group',
          name: 'Demographics',
          description: 'Population and demographic data',
          layers: ['demographics-layer-1', 'demographics-layer-2'],
          isCollapsed: false,
          priority: 1
        },
        {
          id: 'income-group',
          name: 'Income',
          description: 'Household income data',
          layers: ['income-layer-1'],
          isCollapsed: true,
          priority: 2
        },
        {
          id: 'nesto-group',
          name: 'Nesto',
          description: 'Mortgage related data',
          layers: ['nesto-layer-1'],
          isCollapsed: false,
          priority: 3
        }
      ],
      conceptMappings: {
        layerMappings: {},
        fieldMappings: {},
        synonyms: {},
        weights: {},
        customConcepts: {}
      },
      settings: {
        defaultVisibility: {},
        defaultCollapsed: {
          'demographics-group': false,
          'income-group': true,
          'nesto-group': false
        },
        globalSettings: {
          defaultOpacity: 0.8,
          maxVisibleLayers: 10,
          performanceMode: 'standard' as const,
          autoSave: true,
          previewMode: false
        }
      }
    } as any;

    // Reset fetch mock
    (fetch as jest.Mock).mockReset();
  });

  describe('Browser Environment Detection', () => {
    test('should detect browser environment correctly', () => {
      expect(typeof window !== 'undefined').toBe(true);
    });

    test('should use API deployment in browser environment', async () => {
      // Mock successful API response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          filesUpdated: ['config/layers.ts', 'adapters/layerConfigAdapter.ts'],
          message: 'Deployment successful'
        })
      });

      const result = await manager.deployConfiguration(mockConfig, false);

      expect(fetch).toHaveBeenCalledWith('/api/deploy-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"config"')
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Layer Configuration Generation', () => {
    test('should generate browser-compatible layer configuration', async () => {
      // Mock the internal method to capture generated content
      const generateSpy = jest.spyOn(manager as any, 'generateStructurePreservingLayersConfig');

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, filesUpdated: [] })
      });

      await manager.deployConfiguration(mockConfig, false);

      expect(generateSpy).toHaveBeenCalledWith(mockConfig);
      
      // Verify the generated content contains all layers
      const generatedContent = generateSpy.mock.results[0].value;
      expect(generatedContent).toContain('demographics-layer-1');
      expect(generatedContent).toContain('demographics-layer-2');
      expect(generatedContent).toContain('income-layer-1');
      expect(generatedContent).toContain('nesto-layer-1');
      
      // Verify structure preservation elements
      expect(generatedContent).toContain('export const baseLayerConfigs: LayerConfig[]');
      expect(generatedContent).toContain('export const layers:');
      expect(generatedContent).toContain('export const concepts =');
    });

    test('should normalize field types correctly', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, filesUpdated: [] })
      });

      const generateSpy = jest.spyOn(manager as any, 'generateStructurePreservingLayersConfig');
      await manager.deployConfiguration(mockConfig, false);

      const generatedContent = generateSpy.mock.results[0].value;
      
      // Check that field types are preserved correctly
      expect(generatedContent).toContain('"type": "integer"');
      expect(generatedContent).toContain('"type": "double"');
      expect(generatedContent).toContain('"alias": "Population"');
      expect(generatedContent).toContain('"alias": "Median Income"');
    });

    test('should include all required metadata', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, filesUpdated: [] })
      });

      const generateSpy = jest.spyOn(manager as any, 'generateStructurePreservingLayersConfig');
      await manager.deployConfiguration(mockConfig, false);

      const generatedContent = generateSpy.mock.results[0].value;
      
      // Verify metadata is included
      expect(generatedContent).toContain('"provider": "ArcGIS"');
      expect(generatedContent).toContain('"provider": "Nesto"');
      expect(generatedContent).toContain('"updateFrequency": "annual"');
      expect(generatedContent).toContain('"updateFrequency": "monthly"');
      expect(generatedContent).toContain('"geographicType": "postal"');
      expect(generatedContent).toContain('"geographicLevel": "local"');
    });
  });

  describe('Adapter Configuration Generation', () => {
    test('should generate browser-compatible adapter configuration', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, filesUpdated: [] })
      });

      const generateSpy = jest.spyOn(manager as any, 'generateBrowserCompatibleAdapterConfig');
      await manager.deployConfiguration(mockConfig, false);

      expect(generateSpy).toHaveBeenCalledWith(mockConfig);
      
      const generatedContent = generateSpy.mock.results[0].value;
      
      // Verify adapter structure
      expect(generatedContent).toContain('export function createProjectConfig()');
      expect(generatedContent).toContain('export function adaptLayerConfig');
      expect(generatedContent).toContain('// Dynamically discover all unique groups');
      expect(generatedContent).toContain('// Accept ANY layer ID - no type restrictions');
    });

    test('should create dynamic groups in adapter', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, filesUpdated: [] })
      });

      const generateSpy = jest.spyOn(manager as any, 'generateBrowserCompatibleAdapterConfig');
      await manager.deployConfiguration(mockConfig, false);

      const generatedContent = generateSpy.mock.results[0].value;
      
      // Verify dynamic group creation
      expect(generatedContent).toContain("'demographics-group': 'Demographics'");
      expect(generatedContent).toContain("'income-group': 'Income'");
      expect(generatedContent).toContain("'nesto-group': 'Nesto'");
      
      // Verify group mapping logic
      expect(generatedContent).toContain('const groupTitleMap: Record<string, string>');
      expect(generatedContent).toContain('uniqueGroups.add(layer.group)');
    });
  });

  describe('API Integration', () => {
    test('should send correct payload to deploy API', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, filesUpdated: [] })
      });

      await manager.deployConfiguration(mockConfig, false);

      expect(fetch).toHaveBeenCalledTimes(1);
      
      const [url, options] = (fetch as jest.Mock).mock.calls[0];
      expect(url).toBe('/api/deploy-config');
      expect(options.method).toBe('POST');
      expect(options.headers['Content-Type']).toBe('application/json');
      
      const payload = JSON.parse(options.body);
      expect(payload.config).toEqual(mockConfig);
      expect(payload.generatedFiles).toHaveProperty('config/layers.ts');
      expect(payload.generatedFiles).toHaveProperty('adapters/layerConfigAdapter.ts');
      expect(payload.generatedFiles).toHaveProperty('utils/field-aliases.ts');
      expect(payload.generatedFiles).toHaveProperty('config/concept-map.json');
    });

    test('should handle API deployment failure', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      });

      const result = await manager.deployConfiguration(mockConfig, false);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('API deployment failed: Internal Server Error');
    });

    test('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await manager.deployConfiguration(mockConfig, false);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('Network error');
    });
  });

  describe('Generated Files Content', () => {
    test('should generate all required files', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, filesUpdated: [] })
      });

      await manager.deployConfiguration(mockConfig, false);

      const [, options] = (fetch as jest.Mock).mock.calls[0];
      const payload = JSON.parse(options.body);
      const generatedFiles = payload.generatedFiles;

      // Verify all expected files are generated
      expect(generatedFiles).toHaveProperty('config/layers.ts');
      expect(generatedFiles).toHaveProperty('adapters/layerConfigAdapter.ts');
      expect(generatedFiles).toHaveProperty('utils/field-aliases.ts');
      expect(generatedFiles).toHaveProperty('config/concept-map.json');
      expect(generatedFiles).toHaveProperty('shap-microservice/data/NESTO_FIELD_MAPPING.md');

      // Verify content types
      expect(typeof generatedFiles['config/layers.ts']).toBe('string');
      expect(typeof generatedFiles['adapters/layerConfigAdapter.ts']).toBe('string');
      expect(typeof generatedFiles['utils/field-aliases.ts']).toBe('string');
      expect(typeof generatedFiles['config/concept-map.json']).toBe('string');
    });

    test('should generate valid concept mapping JSON', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, filesUpdated: [] })
      });

      await manager.deployConfiguration(mockConfig, false);

      const [, options] = (fetch as jest.Mock).mock.calls[0];
      const payload = JSON.parse(options.body);
      const conceptMapContent = payload.generatedFiles['config/concept-map.json'];

      // Should be valid JSON
      const parsedConceptMap = JSON.parse(conceptMapContent);
      expect(parsedConceptMap).toEqual(mockConfig.conceptMappings);
    });
  });

  describe('Group Structure Preservation', () => {
    test('should preserve all groups from configuration', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, filesUpdated: [] })
      });

      const generateSpy = jest.spyOn(manager as any, 'generateStructurePreservingLayersConfig');
      await manager.deployConfiguration(mockConfig, false);

      const generatedContent = generateSpy.mock.results[0].value;
      
      // Verify all groups are represented
      mockConfig.groups.forEach(group => {
        expect(generatedContent).toContain(`'${group.id}'`);
      });
      
      // Verify group structure in projectLayerConfig
      expect(generatedContent).toContain('groups: [');
      expect(generatedContent).toContain('id: \'demographics-group\'');
      expect(generatedContent).toContain('id: \'income-group\'');
      expect(generatedContent).toContain('id: \'nesto-group\'');
    });

    test('should assign layers to correct groups', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, filesUpdated: [] })
      });

      const generateSpy = jest.spyOn(manager as any, 'generateStructurePreservingLayersConfig');
      await manager.deployConfiguration(mockConfig, false);

      const generatedContent = generateSpy.mock.results[0].value;
      
      // Check that layers have correct group assignments
      expect(generatedContent).toContain("group: 'demographics-group'");
      expect(generatedContent).toContain("group: 'income-group'");
      expect(generatedContent).toContain("group: 'nesto-group'");
      
      // Verify group filtering logic
      expect(generatedContent).toContain("layers: Object.values(layers).filter(layer => layer.group === 'demographics-group')");
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed configuration gracefully', async () => {
      const malformedConfig = {
        ...mockConfig,
        layers: null // Invalid layers
      } as any;

      const result = await manager.deployConfiguration(malformedConfig, false);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should validate configuration before deployment', async () => {
      const invalidConfig = {
        ...mockConfig,
        layers: {
          'invalid-layer': {
            id: 'invalid-layer',
            // Missing required fields
            type: 'feature-service'
          }
        }
      } as any;

      const result = await manager.deployConfiguration(invalidConfig, false);

      // Should catch validation errors
      expect(result.success).toBe(false);
    });
  });
}); 