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

  // Helper to classify a layer into one of the business groups for Red Bull Energy Drinks project
  const classifyGroup = (layerName: string): string => {
    const n = layerName.toLowerCase();
    
    // Energy Drinks - Primary category for Red Bull, Monster, 5-Hour Energy, etc.
    if (/red bull|energy drink|monster|5-hour|energy|drank.*energy|energy.*drink/.test(n)) {
      return 'energy-drinks';
    }
    
    // Consumer Behavior - Food, beverage consumption, lifestyle activities, purchasing
    if (/drank|bought|purchase|shopping|consume|diet|food|beverage|drink|spent|lifestyle|activity|behavior|buy.*food|organic|sugar-free|low.*fat|healthy/.test(n)) {
      return 'consumer-behavior';
    }
    
    // Demographics - Population, age, generation, race, ethnicity, household characteristics  
    if (/population|total population|diversity|generation|gen |age|white|black|asian|american indian|pacific islander|hispanic|male|female|household|family|residents|demographics/.test(n)) {
      return 'demographics';
    }
    
    // Financial - Income, wealth, spending patterns (relevant for energy drink purchasing power)
    if (/income|disposable|wealth|earnings|salary|median income|financial|economic|spending|money/.test(n)) {
      return 'financial';
    }
    
    // Geographic - ZIP codes and location-based data
    if (/zip|postal|geographic|location|boundary/.test(n)) {
      return 'geographic';
    }
    
    // Fallback to consumer behavior for food/beverage related layers
    return 'consumer-behavior';
  };

  for (const layerConfig of Object.values(allLayersConfig)) {
    if (layerConfig && layerConfig.id) {
      // Hide specific layers that should not be displayed
      const layerName = (layerConfig.name || layerConfig.id).toLowerCase();
      if (layerName.includes('h&r block by zip')) {
        console.log(`[LayerAdapter] Hiding layer: ${layerConfig.name}`);
        continue; // Skip this layer - don't add it to adaptedLayers
      }
      
      // Special handling for H&R Block points - move to top level and rename
      if (layerName.includes('h&r block points')) {
        console.log(`[LayerAdapter] Moving H&R Block points to top level and renaming`);
        adaptedLayers[layerConfig.id] = { 
          ...layerConfig, 
          name: 'H&R Block Locations',
          group: 'locations', // Special top-level group
          rendererField: undefined // Remove renderer field so it shows as simple points (correct for point layers)
        } as any;
        continue;
      }
      
      const classifiedGroup = classifyGroup(layerConfig.name || layerConfig.id);
      // Store the lowercase id but human title will capitalize later
      const adaptedLayer = { ...layerConfig, group: classifiedGroup } as any;
      
      // Debug logging to verify renderer fields are preserved
      if (layerConfig.rendererField) {
        console.log(`[LayerAdapter] ✅ Preserved rendererField '${layerConfig.rendererField}' for layer: ${layerConfig.name}`);
      } else {
        console.log(`[LayerAdapter] ⚠️ No rendererField for layer: ${layerConfig.name}`);
      }
      
      adaptedLayers[layerConfig.id] = adaptedLayer;
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
      // Use specific titles for Red Bull Energy Drinks project groups
      let title: string;
      switch (groupId) {
        case 'energy-drinks':
          title = 'Energy Drinks';
          break;
        case 'consumer-behavior':
          title = 'Consumer Behavior';
          break;
        case 'demographics':
          title = 'Demographics';
          break;
        case 'financial':
          title = 'Financial';
          break;
        case 'geographic':
          title = 'Geographic Data';
          break;
        case 'locations':
          title = 'Locations';
          break;
        default:
          // For any other groups, convert ID to title
          title = groupId
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
      }

      groupData[groupId] = {
        title: title,
        layers: [],
      };
    }
    // Add the current layer to its group.
    groupData[groupId].layers.push(layer);
  }

  // Now, transform the collected groupData into the final LayerGroup array.
  // First create all groups
  const allGroups: LayerGroup[] = Object.entries(groupData).map(([id, data]) => ({
    id: id,
    title: data.title,
    description: `${data.title} data`,
    layers: data.layers,
  }));

  // Sort groups with point layers first, then target variable and competitors, then logical order
  const groups: LayerGroup[] = allGroups.sort((a, b) => {
    // Check if groups have point layers (these should always be first)
    const aHasPointLayers = a.layers?.some(layer => layer.type === 'point') || false;
    const bHasPointLayers = b.layers?.some(layer => layer.type === 'point') || false;
    
    if (aHasPointLayers && !bHasPointLayers) return -1; // Point layers first
    if (!aHasPointLayers && bHasPointLayers) return 1;
    
    // If both or neither have point layers, use priority order for project
    const priority: Record<string, number> = {
      'energy-drinks': 1,      // Most important - target variable and competitors
      'consumer-behavior': 2,  // Secondary - related consumption patterns
      'demographics': 3,       // Third - target audience data
      'financial': 4,          // Fourth - purchasing power data
      'geographic': 5,         // Fifth - location data
      'locations': 6           // Last - generic location layers
    };
    
    const aPriority = priority[a.id] || 999;
    const bPriority = priority[b.id] || 999;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // If same priority, sort alphabetically
    return a.title.localeCompare(b.title);
  });

  // Set the default visibility for all layers to hidden.
  const defaultVisibility: { [key: string]: boolean } = {};
  Object.keys(adaptedLayers).forEach(layerId => {
    defaultVisibility[layerId] = false;
  });

  // Set the default collapsed state for all groups to collapsed.
  const defaultCollapsed: Record<string, boolean> = {};
  groups.forEach(group => {
    defaultCollapsed[group.id] = true; // All groups start collapsed
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