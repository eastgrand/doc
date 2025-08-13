#!/usr/bin/env python3
"""
Layer Configuration Generator - Auto-generate TypeScript layer configurations
Part of the ArcGIS to Microservice Automation Pipeline

Generates layer list widget configurations, concept mappings, and TypeScript exports
from ArcGIS service metadata and field analysis.
"""

import json
import re
import requests
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from urllib.parse import urlparse, parse_qs
from dataclasses import dataclass
import logging

# Import intelligent grouping system
from intelligent_layer_grouping import IntelligentLayerGrouping
from interactive_category_selector import InteractiveCategorySelector

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass 
class LayerFieldInfo:
    """Represents a single field in a layer"""
    name: str
    type: str
    alias: str
    label: Optional[str] = None

@dataclass
class LayerConfigInfo:
    """Represents configuration information for a single layer"""
    id: str
    name: str
    url: str
    description: str
    layer_id: int
    fields: List[LayerFieldInfo]
    record_count: int
    geometry_type: str
    renderer_field: Optional[str] = None
    group: str = "default"

class LayerConfigGenerator:
    """
    Automatically generates TypeScript layer configurations from ArcGIS services
    """
    
    def __init__(self, project_root: str = "/Users/voldeck/code/mpiq-ai-chat", 
                 selected_categories: Dict = None, interactive_categories: bool = False):
        self.project_root = Path(project_root)
        self.output_dir = self.project_root / "config"
        # Use default concepts instead of parsing broken existing ones
        self.concepts_mapping = self._get_default_concepts()
        
        # Initialize category selection
        self.selected_categories = selected_categories
        if interactive_categories and not selected_categories:
            self.selected_categories = self._interactive_category_selection()
        
        # Initialize intelligent grouping system with selected categories
        self.intelligent_grouping = IntelligentLayerGrouping(self.selected_categories)
        
    def _interactive_category_selection(self) -> Dict[str, Dict]:
        """Interactive category selection for layer grouping"""
        print("\n🏷️  LAYER GROUPING SETUP")
        print("=" * 50)
        print("Choose semantic categories for intelligent layer grouping.")
        
        selector = InteractiveCategorySelector()
        
        # Show quick preset options first
        print("\n🚀 QUICK PRESETS:")
        presets = {
            '1': ('comprehensive', 'All major categories (recommended)'),
            '2': ('financial_focused', 'Financial and investment focused'),
            '3': ('consumer_focused', 'Consumer behavior and demographics'),
            '4': ('minimal', 'Basic categories only'),
            '5': ('interactive', 'Custom interactive selection')
        }
        
        for key, (preset, description) in presets.items():
            print(f"   {key}. {preset.replace('_', ' ').title()} - {description}")
        
        while True:
            choice = input(f"\nSelect preset (1-5): ").strip()
            if choice in presets:
                preset_name, _ = presets[choice]
                if preset_name == 'interactive':
                    return selector.interactive_selection()
                else:
                    selected = selector.quick_selection(preset_name)
                    print(f"\n✅ Using '{preset_name}' preset with {len(selected)} categories")
                    return selected
            else:
                print("Please enter a number from 1-5")
        
    def _load_existing_concepts(self) -> Dict[str, Any]:
        """Load existing concept mappings from layers.ts"""
        try:
            layers_file = self.project_root / "config" / "layers.ts"
            if layers_file.exists():
                content = layers_file.read_text()
                
                # Extract concepts object using regex
                concepts_match = re.search(r'export const concepts = \{(.*?)\};', content, re.DOTALL)
                if concepts_match:
                    # This is a simplified extraction - in production you'd use a proper TS parser
                    logger.info("Found existing concepts mapping")
                    return self._parse_existing_concepts(concepts_match.group(1))
            
            # Default concepts if none found
            return self._get_default_concepts()
            
        except Exception as e:
            logger.warning(f"Could not load existing concepts: {e}")
            return self._get_default_concepts()
    
    def _get_default_concepts(self) -> Dict[str, Any]:
        """Get default concept mappings for Nike project"""
        return {
            'population': {
                'terms': [
                    'population', 'people', 'residents', 'inhabitants', 
                    'demographics', 'age', 'gender', 'household', 'family',
                    'diversity', 'cultural groups'
                ],
                'weight': 10,
            },
            'income': {
                'terms': ['income', 'earnings', 'salary', 'wage', 'affluence', 'wealth', 'disposable'],
                'weight': 25
            },
            'race': {
                'terms': ['race', 'ethnicity', 'diverse', 'diversity', 'racial', 'white', 'black', 'asian', 'american indian', 'pacific islander', 'hispanic'],
                'weight': 20
            },
            'spending': {
                'terms': ['spending', 'purchase', 'bought', 'shopped', 'consumer', 'expense', 'shopping'],
                'weight': 25
            },
            'sports': {
                'terms': ['sports', 'athletic', 'exercise', 'fan', 'participation', 'NBA', 'NFL', 'MLB', 'NHL', 'soccer', 'running', 'jogging', 'yoga', 'weight lifting'],
                'weight': 20
            },
            'brands': {
                'terms': [
                    'brand', 'Nike', 'Adidas', 'Jordan', 'Converse', 'Reebok', 'Puma', 
                    'New Balance', 'Asics', 'Skechers', 'Alo', 'Lululemon', 'On'
                ],
                'weight': 25
            },
            'retail': {
                'terms': ['retail', 'store', 'shop', "Dick's Sporting Goods", 'retail store'],
                'weight': 15
            },
            'clothing': {
                'terms': ['clothing', 'apparel', 'wear', 'workout wear', 'athletic wear', 'shoes', 'footwear', 'sneakers'],
                'weight': 20
            },
            'household': {
                'terms': ['household', 'family', 'home', 'housing', 'residence'],
                'weight': 15
            },
            'trends': {
                'terms': [
                    'trends', 'google', 'search', 'interest', 'popularity', 
                    'search volume', 'search data', 'search analytics', 'trending', 'search patterns',
                    'consumer interest', 'market attention', 'brand awareness', 'search interest',
                    'online demand', 'consumer demand', 'brand popularity', 'search frequency',
                    'search trends', 'search queries', 'google search', 'search index'
                ],
                'weight': 20
            },
            'geographic': {
                'terms': ['ZIP', 'DMA', 'local', 'regional', 'area', 'location', 'zone', 'region'],
                'weight': 15
            }
        }
    
    def _parse_existing_concepts(self, concepts_text: str) -> Dict[str, Any]:
        """Parse existing concepts from TypeScript - simplified version"""
        # This is a simplified parser - in production use a proper TS parser
        concepts = {}
        
        # Extract concept blocks
        concept_blocks = re.findall(r'(\w+):\s*\{(.*?)\}', concepts_text, re.DOTALL)
        
        for concept_name, concept_content in concept_blocks:
            # Extract terms array
            terms_match = re.search(r'terms:\s*\[(.*?)\]', concept_content, re.DOTALL)
            weight_match = re.search(r'weight:\s*(\d+)', concept_content)
            
            if terms_match:
                # Parse terms array
                terms_str = terms_match.group(1)
                terms = re.findall(r"'([^']*)'", terms_str)
                
                concepts[concept_name] = {
                    'terms': terms,
                    'weight': int(weight_match.group(1)) if weight_match else 10
                }
        
        return concepts if concepts else self._get_default_concepts()
    
    def analyze_arcgis_service(self, service_url: str) -> List[LayerConfigInfo]:
        """
        Analyze an ArcGIS Feature Service and extract layer configuration information
        """
        logger.info(f"Analyzing ArcGIS service: {service_url}")
        
        try:
            # Get service metadata
            response = requests.get(f"{service_url}?f=json", timeout=30)
            response.raise_for_status()
            service_info = response.json()
            
            layers = []
            service_name = service_info.get('name', 'Unknown Service')
            
            # Process each layer
            for layer_info in service_info.get('layers', []):
                layer_id = layer_info['id']
                layer_name = layer_info['name']
                
                logger.info(f"Analyzing layer {layer_id}: {layer_name}")
                
                # Get detailed layer information
                layer_details = self._get_layer_details(service_url, layer_id)
                if layer_details:
                    # Create configuration info
                    config_info = LayerConfigInfo(
                        id=f"{self._generate_layer_id(service_name, layer_id)}",
                        name=layer_name,
                        url=f"{service_url}/{layer_id}",
                        description=layer_details.get('description', f"Business Analyst Layer: {layer_name}"),
                        layer_id=layer_id,
                        fields=self._parse_fields(layer_details.get('fields', [])),
                        record_count=layer_details.get('record_count', 0),
                        geometry_type=layer_details.get('geometryType', 'esriGeometryPolygon'),
                        renderer_field=self._determine_renderer_field(layer_details.get('fields', [])),
                        group=self._categorize_layer_intelligent(layer_name, layer_details)
                    )
                    
                    layers.append(config_info)
            
            logger.info(f"Successfully analyzed {len(layers)} layers")
            return layers
            
        except Exception as e:
            logger.error(f"Failed to analyze ArcGIS service: {e}")
            return []
    
    def _get_layer_details(self, service_url: str, layer_id: int) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific layer"""
        try:
            # Get layer metadata
            layer_url = f"{service_url}/{layer_id}"
            response = requests.get(f"{layer_url}?f=json", timeout=30)
            response.raise_for_status()
            layer_info = response.json()
            
            # Get record count
            count_response = requests.get(f"{layer_url}/query", params={
                'where': '1=1',
                'returnCountOnly': 'true',
                'f': 'json'
            }, timeout=30)
            
            record_count = 0
            if count_response.status_code == 200:
                count_data = count_response.json()
                record_count = count_data.get('count', 0)
            
            layer_info['record_count'] = record_count
            return layer_info
            
        except Exception as e:
            logger.warning(f"Could not get details for layer {layer_id}: {e}")
            return None
    
    def _generate_layer_id(self, service_name: str, layer_id: int) -> str:
        """Generate a unique layer ID for the configuration"""
        # Clean service name
        clean_name = re.sub(r'[^a-zA-Z0-9_]', '_', service_name)
        return f"{clean_name}_layer_{layer_id}"
    
    def _parse_fields(self, fields_data: List[Dict]) -> List[LayerFieldInfo]:
        """Parse field information from ArcGIS layer metadata"""
        fields = []
        
        for field_data in fields_data:
            field_info = LayerFieldInfo(
                name=field_data.get('name', ''),
                type=self._convert_esri_type(field_data.get('type', 'esriFieldTypeString')),
                alias=field_data.get('alias', field_data.get('name', '')),
                label=field_data.get('alias', field_data.get('name', ''))
            )
            fields.append(field_info)
        
        return fields
    
    def _convert_esri_type(self, esri_type: str) -> str:
        """Convert Esri field types to our standard types"""
        type_mapping = {
            'esriFieldTypeOID': 'oid',
            'esriFieldTypeString': 'string',
            'esriFieldTypeDouble': 'double',
            'esriFieldTypeInteger': 'integer',
            'esriFieldTypeSmallInteger': 'integer',
            'esriFieldTypeDate': 'date',
            'esriFieldTypeGeometry': 'geometry',
            'esriFieldTypeGUID': 'string'
        }
        return type_mapping.get(esri_type, 'string')
    
    def _determine_renderer_field(self, fields: List[Dict]) -> str:
        """Determine the best field to use for rendering/theming"""
        
        # Look for percentage fields first (best for visualization)
        for field in fields:
            field_name = field.get('name', '')
            if any(pattern in field_name.upper() for pattern in ['_P', '_PCT', '_PERCENT', 'RATE']):
                return field_name
        
        # Look for numeric fields
        for field in fields:
            field_type = field.get('type', '')
            field_name = field.get('name', '')
            if field_type in ['esriFieldTypeDouble', 'esriFieldTypeInteger']:
                if field_name.upper() not in ['OBJECTID', 'ID']:
                    return field_name
        
        # Default fallback
        return 'thematic_value'
    
    def _categorize_layer_intelligent(self, layer_name: str, layer_details: Dict) -> str:
        """Use intelligent grouping system to categorize layers"""
        try:
            # Extract relevant information from layer details
            fields = layer_details.get('fields', [])
            description = layer_details.get('description', '')
            
            # Build metadata dict from available information
            metadata = {
                'type': layer_details.get('type', ''),
                'geometryType': layer_details.get('geometryType', ''),
                'displayField': layer_details.get('displayField', ''),
                'tags': layer_details.get('tags', ''),
                'categories': layer_details.get('categories', ''),
                'typeKeywords': layer_details.get('typeKeywords', ''),
                'copyrightText': layer_details.get('copyrightText', '')
            }
            
            # Use intelligent grouping system
            group_name, confidence = self.intelligent_grouping.categorize_layer(
                layer_name, fields, description, metadata
            )
            
            logger.info(f"📊 Layer '{layer_name}' categorized as '{group_name}' (confidence: {confidence:.2f})")
            
            return group_name
            
        except Exception as e:
            logger.warning(f"Failed to categorize layer '{layer_name}' intelligently: {e}")
            # Fallback to old method
            return self._categorize_layer_fallback(layer_name, layer_details.get('fields', []))
    
    def _categorize_layer_fallback(self, layer_name: str, fields: List[Dict]) -> str:
        """Fallback categorization method - uses general grouping"""
        return "general"
    
    def _detect_layer_type(self, fields: List[LayerFieldInfo]) -> str:
        """Detect the layer type based on field patterns"""
        field_names = [f.name.upper() for f in fields]
        
        # Simple pattern detection without hardcoded rules
        if any(name.endswith('_P') or '_PCT' in name or 'PERCENT' in name for name in field_names):
            return 'percentage'
        elif any(name.endswith('_CY') or '_COUNT' in name or '_TOTAL' in name for name in field_names):
            return 'amount'
        elif any('INDEX' in name or '_IDX' in name or '_SCORE' in name for name in field_names):
            return 'index'
        
        return 'feature-service'  # Default
    
    def _detect_geographic_type(self, fields: List[LayerFieldInfo], layer_name: str) -> str:
        """Detect the geographic type of the layer"""
        all_text = ' '.join([f.name.upper() for f in fields] + [layer_name.upper()])
        
        # Simple geographic type detection without hardcoded rules
        if 'ZIP' in all_text or 'POSTAL' in all_text or 'FSA' in all_text:
            return 'postal'
        elif 'COUNTY' in all_text or 'CNTY' in all_text:
            return 'county'
        elif 'STATE' in all_text or 'PROV' in all_text:
            return 'state'
        elif 'DMA' in all_text or 'MARKET' in all_text:
            return 'dma'
        elif 'TRACT' in all_text or 'CENSUS' in all_text:
            return 'tract'
        elif 'BLOCK' in all_text or 'BLK' in all_text:
            return 'postal'  # Convert block to postal as fallback
        
        return 'postal'  # Default fallback
    
    def generate_typescript_config(self, layers: List[LayerConfigInfo]) -> str:
        """
        Generate TypeScript configuration code for all layers
        """
        logger.info(f"Generating TypeScript configuration for {len(layers)} layers")
        
        # Generate timestamp
        timestamp = datetime.now().isoformat()
        
        # Start building the TypeScript content
        ts_content = f"""// Layer configuration with preserved structure
// Auto-generated on {timestamp}
// This file maintains compatibility with existing system components

import {{ LayerConfig }} from '../types/layers';

export type LayerType = 'index' | 'point' | 'percentage' | 'amount';
export type AccessLevel = 'read' | 'write' | 'admin';

export const concepts = {self._generate_concepts_typescript()};

// Helper function to ensure each layer has a DESCRIPTION field
const ensureLayerHasDescriptionField = (layerConfig: LayerConfig): LayerConfig => {{
  // Clone the layer config
  const updatedConfig = {{ ...layerConfig }};
  
  // Check if fields array exists
  if (!updatedConfig.fields) {{
    updatedConfig.fields = [];
  }}
  
  // Check if DESCRIPTION field already exists
  const hasDescription = updatedConfig.fields.some(field => field.name === 'DESCRIPTION');
  
  // If DESCRIPTION field doesn't exist, add it
  if (!hasDescription) {{
    updatedConfig.fields.push({{
      name: 'DESCRIPTION',
      type: 'string',
      alias: 'ZIP Code',
      label: 'ZIP Code'
    }});
  }}
  
  return updatedConfig;
}};

// Helper function to update renderer field to use percentage field when available
const updateRendererFieldForPercentage = (layerConfig: LayerConfig): LayerConfig => {{
  const updatedConfig = {{ ...layerConfig }};
  
  // Check if this layer has percentage fields
  const percentageField = updatedConfig.fields?.find(field => 
    field.name.endsWith('_P') && field.type === 'double'
  );
  
  // If a percentage field exists, use it as the renderer field
  if (percentageField) {{
    updatedConfig.rendererField = percentageField.name;
  }}
  
  return updatedConfig;
}};

// === AUTO-GENERATED LAYER CONFIGURATIONS ===
export const baseLayerConfigs: LayerConfig[] = [
{self._generate_layer_configs_typescript(layers)}
];

// Apply helper functions to all configurations
export const layerConfigs: LayerConfig[] = baseLayerConfigs
  .map(ensureLayerHasDescriptionField)
  .map(updateRendererFieldForPercentage);

// Group layers by category for easier management
export const layerGroups = {{
{self._generate_layer_groups_typescript(layers)}
}};

// Export individual layers for direct access
export const layers: {{ [key: string]: LayerConfig }} = layerConfigs.reduce((acc, layer) => {{
  acc[layer.id] = layer;
  return acc;
}}, {{}} as {{ [key: string]: LayerConfig }});

// Export layer count for monitoring
export const layerCount = layerConfigs.length;

// Export generation metadata
export const generationMetadata = {{
  generatedAt: '{timestamp}',
  layerCount: {len(layers)},
  groupCount: {len(set(layer.group for layer in layers))},
  automationVersion: '1.0.0'
}};
"""
        
        return ts_content
    
    def _generate_concepts_typescript(self) -> str:
        """Generate TypeScript code for concepts mapping"""
        concepts_code = "{\n"
        
        for concept_name, concept_data in self.concepts_mapping.items():
            terms_str = ",\n      ".join(f"'{term.replace(chr(39), chr(92) + chr(39))}'" for term in concept_data['terms'])
            concepts_code += f"""  {concept_name}: {{
    terms: [
      {terms_str}
    ],
    weight: {concept_data['weight']},
  }},
"""
        
        concepts_code += "}"
        return concepts_code
    
    def _generate_layer_configs_typescript(self, layers: List[LayerConfigInfo]) -> str:
        """Generate TypeScript code for layer configurations"""
        configs = []
        
        for layer in layers:
            # Generate fields array
            fields_code = "[\n"
            for field in layer.fields:
                fields_code += f"""      {{
            "name": "{field.name}",
            "type": "{field.type}",
            "alias": "{field.alias}"
      }},
"""
            fields_code += "    ]"
            
            # Generate layer configuration with all required properties
            geographic_type = self._detect_geographic_type(layer.fields, layer.name)
            # Fix invalid geographic types
            if geographic_type == 'block':
                geographic_type = 'postal'
            
            config_code = f"""  {{
    id: '{layer.id}',
    name: '{layer.name}',
    type: 'feature-service',
    url: '{layer.url}',
    group: '{layer.group}',
    description: '{layer.description}',
    isVisible: false,
    isPrimary: false,
    skipLayerList: false,
    rendererField: '{layer.renderer_field}',
    status: 'active',
    geographicType: '{geographic_type}',
    geographicLevel: 'local',
    fields: {fields_code},
    metadata: {{
      "provider": "ArcGIS FeatureServer",
      "updateFrequency": "daily",
      "version": "1.0",
      "tags": ["business-analyst", "demographics"],
      "sourceSystems": ["ArcGIS Online"],
      "geographicType": "{geographic_type}",
      "geographicLevel": "local"
    }},
    processing: {{
      "cacheable": true,
      "timeout": 30000,
      "retries": 2
    }},
    caching: {{
      "enabled": true,
      "ttl": 3600,
      "strategy": "memory"
    }},
    performance: {{
      "timeoutMs": 30000
    }},
    security: {{
      "accessLevels": [
            "read"
      ]
    }},
    analysis: {{
      "availableOperations": [
            "query"
      ]
    }}
  }}"""
            
            configs.append(config_code)
        
        return ",\n".join(configs)
    
    def _generate_layer_groups_typescript(self, layers: List[LayerConfigInfo]) -> str:
        """Generate TypeScript code for dynamically learned layer groups"""
        try:
            # Prepare layer data for intelligent grouping
            layer_data = []
            for layer in layers:
                layer_dict = {
                    'id': layer.id,
                    'name': layer.name,
                    'fields': [{'name': f.name, 'type': f.type, 'alias': f.alias} for f in layer.fields],
                    'description': layer.description,
                    'metadata': {}
                }
                layer_data.append(layer_dict)
            
            # Get dynamically learned group structure
            hierarchy = self.intelligent_grouping.get_group_hierarchy(layer_data)
            groups = hierarchy['groups']
            metadata = hierarchy['metadata']
            
            # Generate TypeScript code
            group_code = ""
            
            # Sort groups by average confidence (highest first)
            sorted_groups = sorted(groups.keys(), 
                                 key=lambda g: metadata.get(g, {}).get('avg_confidence', 0), 
                                 reverse=True)
            
            for group_name in sorted_groups:
                layer_ids = groups[group_name]
                group_meta = metadata.get(group_name, {})
                
                if layer_ids:  # Only add non-empty groups
                    layer_ids_str = ",\n    ".join(f"'{layer_id}'" for layer_id in layer_ids)
                    
                    group_code += f"""  '{group_name}': {{
    displayName: '{group_meta.get("display_name", group_name)}',
    description: '{group_meta.get("description", "Data layer group")}',
    layerCount: {group_meta.get('layer_count', len(layer_ids))},
    confidence: {group_meta.get('avg_confidence', 0.0):.2f},
    layers: [
      {layer_ids_str}
    ]
  }},
"""
            
            return group_code
            
        except Exception as e:
            logger.warning(f"Failed to generate dynamic groups, falling back to simple groups: {e}")
            return self._generate_simple_layer_groups_typescript(layers)
    
    def _generate_simple_layer_groups_typescript(self, layers: List[LayerConfigInfo]) -> str:
        """Fallback: Generate simple TypeScript code for layer groups"""
        groups = {}
        
        # Group layers by category
        for layer in layers:
            if layer.group not in groups:
                groups[layer.group] = []
            groups[layer.group].append(layer.id)
        
        # Generate TypeScript code
        group_code = ""
        for group_name, layer_ids in groups.items():
            layer_ids_str = ",\n    ".join(f"'{layer_id}'" for layer_id in layer_ids)
            group_code += f"""  '{group_name}': [
    {layer_ids_str}
  ],
"""
        
        return group_code
    
    def save_layer_configuration(self, layers: List[LayerConfigInfo], output_file: str = "layers.ts") -> bool:
        """
        Save generated layer configuration to TypeScript file
        """
        try:
            # Generate TypeScript configuration
            ts_content = self.generate_typescript_config(layers)
            
            # Save to file
            output_path = self.output_dir / output_file
            
            # Backup existing file if it exists
            if output_path.exists():
                backup_path = output_path.with_suffix('.ts.backup')
                output_path.rename(backup_path)
                logger.info(f"Backed up existing file to {backup_path}")
            
            # Write new configuration
            output_path.write_text(ts_content)
            logger.info(f"Saved layer configuration to {output_path}")
            
            # Generate summary report
            self._generate_summary_report(layers, output_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to save layer configuration: {e}")
            return False
    
    def _generate_summary_report(self, layers: List[LayerConfigInfo], output_path: Path):
        """Generate a summary report of the generated configuration"""
        
        # Count statistics
        total_layers = len(layers)
        total_fields = sum(len(layer.fields) for layer in layers)
        groups = set(layer.group for layer in layers)
        
        # Group analysis
        group_stats = {}
        for layer in layers:
            if layer.group not in group_stats:
                group_stats[layer.group] = 0
            group_stats[layer.group] += 1
        
        # Generate report
        report_path = output_path.parent / "layer_generation_report.md"
        
        report_content = f"""# Layer Configuration Generation Report

**Generated**: {datetime.now().isoformat()}
**Output File**: `{output_path.name}`

## Summary Statistics

- **Total Layers**: {total_layers}
- **Total Fields**: {total_fields}
- **Layer Groups**: {len(groups)}
- **Average Fields per Layer**: {total_fields / total_layers:.1f}

## Layer Groups

{self._format_group_stats(group_stats)}

## Generated Layers

{self._format_layer_list(layers)}

## Integration Instructions

1. **Update imports**: Ensure all components import from the new layer configuration
2. **Test layer loading**: Verify all layers load correctly in the application
3. **Validate field mappings**: Check that field names match expected patterns
4. **Review group categorization**: Adjust group assignments if needed

## Next Steps

- [ ] Test layer configuration in development environment
- [ ] Validate field access patterns
- [ ] Update any hardcoded layer references
- [ ] Deploy to staging for integration testing
"""
        
        report_path.write_text(report_content)
        logger.info(f"Generated summary report: {report_path}")
    
    def _format_group_stats(self, group_stats: Dict[str, int]) -> str:
        """Format group statistics for the report"""
        lines = []
        for group, count in sorted(group_stats.items()):
            lines.append(f"- **{group}**: {count} layers")
        return "\n".join(lines)
    
    def _format_layer_list(self, layers: List[LayerConfigInfo]) -> str:
        """Format layer list for the report"""
        lines = []
        for layer in layers:
            lines.append(f"- **{layer.name}** (`{layer.id}`) - {len(layer.fields)} fields, {layer.record_count:,} records")
        return "\n".join(lines)


def main():
    """Main function for command-line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate TypeScript layer configurations from ArcGIS services")
    parser.add_argument("service_url", help="ArcGIS Feature Service URL")
    parser.add_argument("--output", default="layers_generated.ts", help="Output TypeScript file name")
    parser.add_argument("--project-root", default="/Users/voldeck/code/mpiq-ai-chat", help="Project root directory")
    
    args = parser.parse_args()
    
    print(f"🔧 Generating layer configurations from: {args.service_url}")
    print(f"📁 Project root: {args.project_root}")
    print(f"📄 Output file: {args.output}")
    print("=" * 60)
    
    # Initialize generator
    generator = LayerConfigGenerator(args.project_root)
    
    # Analyze service
    layers = generator.analyze_arcgis_service(args.service_url)
    
    if not layers:
        print("❌ No layers found or service analysis failed")
        return False
    
    # Generate configuration
    success = generator.save_layer_configuration(layers, args.output)
    
    if success:
        print(f"\n✅ Successfully generated configuration for {len(layers)} layers")
        print(f"📄 Saved to: config/{args.output}")
        print(f"📋 Summary report: config/layer_generation_report.md")
    else:
        print("\n❌ Failed to generate configuration")
        return False
    
    return True


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)