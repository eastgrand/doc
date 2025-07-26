// adapters/layerConfigAdapter.ts
import { layers as allLayersConfig } from '../config/layers';
import { ProjectLayerConfig, LayerConfig, LayerGroup } from '../types/layers';

/**
 * Creates and returns the project layer configuration.
 * This function dynamically builds the layer and group structure based on the
 * static configuration defined in `config/layers.ts`. It respects the `group`
 * property on each layer to ensure groups are created as specified.
 *
 * @returns {ProjectLayerConfig} The project's layer configuration.
 */
export function createProjectConfig(): ProjectLayerConfig {
  const adaptedLayers: Record<string, LayerConfig> = {};

  // Helper to classify a layer into one of the business groups
  const classifyGroup = (layerName: string): string => {
    const n = layerName.toLowerCase();
    if (/income|disposable|wealth|earnings|salary|median income/.test(n)) {
      return 'income';
    }
    if (/spent|bought|purchase|shopping|sports rec|shopped/.test(n)) {
      return 'spending';
    }
    if (/participat|fan|super fan|sports|exercise|running|jogging|yoga|weight lifting/.test(n)) {
      return 'participation';
    }
    // Population-related: includes race, age, generation and diversity terms
    if (/population|total population|diversity|generation|gen |age|white|black|asian|american indian|pacific islander|hispanic|male|female/.test(n)) {
      return 'population';
    }
    // Fallback to population
    return 'population';
  };

  for (const layerConfig of Object.values(allLayersConfig)) {
    if (layerConfig && layerConfig.id) {
      const classifiedGroup = classifyGroup(layerConfig.name || layerConfig.id);
      // Store the lowercase id but human title will capitalize later
      adaptedLayers[layerConfig.id] = { ...layerConfig, group: classifiedGroup } as any;
    }
  }

  // Next, discover all unique group IDs from the `group` property of the layers.
  const groupData: Record<string, { title: string; layers: LayerConfig[] }> = {};

  for (const layer of Object.values(adaptedLayers)) {
    const groupId = layer.group;
    if (!groupId) {
      // Skip layers that don't have a group defined.
      continue;
    }

    if (!groupData[groupId]) {
      // This is the first time we've seen this group ID. Initialize it.
      // We'll create a human-readable title from the ID.
      const title = groupId
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());

      groupData[groupId] = {
        title: title,
        layers: [],
      };
    }
    // Add the current layer to its group.
    groupData[groupId].layers.push(layer);
  }

  // Now, transform the collected groupData into the final LayerGroup array.
  const groups: LayerGroup[] = Object.entries(groupData).map(([id, data]) => ({
    id: id,
    title: data.title,
    description: `${data.title} data`,
    layers: data.layers,
  }));

  // Set the default visibility for all layers to hidden.
  const defaultVisibility: { [key: string]: boolean } = {};
  Object.keys(adaptedLayers).forEach(layerId => {
    defaultVisibility[layerId] = false;
  });

  // Set the default collapsed state for all groups to collapsed, except for 'nesto-group'.
  const defaultCollapsed: Record<string, boolean> = {};
  groups.forEach(group => {
    defaultCollapsed[group.id] = group.id !== 'nesto-group';
  });

  // Log the final generated structure for debugging.
  console.log('[Adapter] Final generated config:', {
    layerCount: Object.keys(adaptedLayers).length,
    groupCount: groups.length,
    groups: Object.fromEntries(groups.map(g => [g.id, g.layers?.length ?? 0])),
  });

  return {
    layers: adaptedLayers,
    groups: groups,
    defaultVisibility,
    defaultCollapsed,
    globalSettings: {
      defaultOpacity: 0.8,
      maxVisibleLayers: 10,
      performanceMode: 'standard',
    },
  };
}