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
    
    // Consumer Behavior - PRIORITIZE "Used" behavior first, even if financial
    // This captures usage behavior regardless of the service type
    if (/^used |used.*online|used.*service|used.*app|used.*bank|used.*pay|used.*digital/.test(n)) {
      return 'consumer-behavior';
    }
    
    // Consumer Behavior - Shopping, purchasing, spending, brand preferences, lifestyle activities
    if (/spent|bought|purchase|shopping|sports rec|shopped|consumer|brand|participat|fan|super fan|sports|exercise|running|jogging|yoga|weight lifting|lifestyle|activity|behavior/.test(n)) {
      return 'consumer-behavior';
    }
    
    // Demographics - Population, age, generation, race, ethnicity, household characteristics
    if (/population|total population|diversity|generation|gen |age|white|black|asian|american indian|pacific islander|hispanic|male|female|household|family|residents|demographics/.test(n)) {
      return 'demographics';
    }
    
    // Financial - Banking, credit, investments, income, wealth, financial services
    if (/bank|credit|debt|savings|investment|cryptocurrency|line of credit|checking|money|stocks|bonds|mutual funds|income|disposable|wealth|earnings|salary|median income|financial|pay|turbotax|h&r block|taxes/.test(n)) {
      return 'financial';
    }
    
    // Look for specific financial keywords (Google Pay, Apple Pay, etc.)
    if (/google pay|apple pay|digital payment|payment/.test(n)) {
      return 'financial';
    }
    
    // Fallback to demographics for any unclassified layers
    return 'demographics';
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
      // Use specific titles for our main groups
      let title: string;
      switch (groupId) {
        case 'demographics':
          title = 'Demographics';
          break;
        case 'financial':
          title = 'Financial';
          break;
        case 'consumer-behavior':
          title = 'Consumer Behavior';
          break;
        case 'locations':
          title = 'Locations'; // Top-level group for location-based layers
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

  // Sort groups to put Locations first, then alphabetical order
  const groups: LayerGroup[] = allGroups.sort((a, b) => {
    if (a.id === 'locations') return -1; // Locations goes first
    if (b.id === 'locations') return 1;
    return a.title.localeCompare(b.title); // Alphabetical for the rest
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