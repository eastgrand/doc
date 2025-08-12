#!/usr/bin/env python3
"""
Update existing layers.ts with new semantic grouping
Uses the current layer data but applies the new intelligent grouping system
"""

import json
import re
from pathlib import Path
from intelligent_layer_grouping import IntelligentLayerGrouping
from interactive_category_selector import InteractiveCategorySelector

def extract_current_layers():
    """Extract layer data from current layers.ts"""
    
    layers_file = Path("/Users/voldeck/code/mpiq-ai-chat/config/layers.ts")
    
    if not layers_file.exists():
        print("❌ layers.ts not found!")
        return []
    
    content = layers_file.read_text()
    
    # Extract layer configs using regex (simplified parsing)
    layers = []
    
    # Find all layer objects in baseLayerConfigs
    layer_pattern = r'\{\s*id:\s*[\'"]([^"\']+)[\'"],\s*name:\s*[\'"]([^"\']+)[\'"].*?fields:\s*\[(.*?)\].*?description:\s*[\'"]([^"\']*)[\'"]'
    
    layer_matches = re.findall(layer_pattern, content, re.DOTALL)
    
    for match in layer_matches:
        layer_id, layer_name, fields_text, description = match
        
        # Parse fields from the fields array
        field_pattern = r'\{\s*"name":\s*"([^"]+)",\s*"type":\s*"([^"]+)",\s*"alias":\s*"([^"]*)"\s*\}'
        field_matches = re.findall(field_pattern, fields_text)
        
        fields = []
        for field_match in field_matches:
            field_name, field_type, field_alias = field_match
            fields.append({
                'name': field_name,
                'type': field_type,
                'alias': field_alias
            })
        
        layers.append({
            'id': layer_id,
            'name': layer_name,
            'fields': fields,
            'description': description
        })
    
    print(f"📊 Extracted {len(layers)} layers from current layers.ts")
    return layers

def update_layer_groups():
    """Update layers.ts with new semantic groups"""
    
    print("🔄 UPDATING LAYER GROUPS WITH SEMANTIC CATEGORIES")
    print("=" * 55)
    
    # Extract current layers
    current_layers = extract_current_layers()
    
    if not current_layers:
        print("❌ No layers found to update")
        return False
    
    # Set up semantic categories
    print("\n🏷️  Setting up semantic categories...")
    selector = InteractiveCategorySelector()
    selected_categories = selector.quick_selection('comprehensive')
    
    print(f"✅ Using {len(selected_categories)} categories:")
    for key, cat in selected_categories.items():
        print(f"   • {cat['display_name']}")
    
    # Initialize grouping system
    grouping = IntelligentLayerGrouping(selected_categories)
    
    # Categorize each layer
    print(f"\n📊 Categorizing {len(current_layers)} layers...")
    
    layer_groups = {}
    group_metadata = {}
    
    for layer in current_layers:
        group_key, confidence = grouping.categorize_layer(
            layer['name'],
            layer['fields'],
            layer['description']
        )
        
        # Get display name
        display_name = group_key
        if group_key in selected_categories:
            display_name = selected_categories[group_key]['display_name']
            description = selected_categories[group_key]['description']
        else:
            display_name = "General Data"
            description = "General data layers"
        
        # Add to groups
        if group_key not in layer_groups:
            layer_groups[group_key] = []
            group_metadata[group_key] = {
                'display_name': display_name,
                'description': description,
                'layer_count': 0,
                'total_confidence': 0.0
            }
        
        layer_groups[group_key].append(layer['id'])
        group_metadata[group_key]['layer_count'] += 1
        group_metadata[group_key]['total_confidence'] += confidence
        
        print(f"   🎯 {layer['name'][:40]:<40} → {display_name}")
    
    # Calculate average confidence
    for group_key, meta in group_metadata.items():
        if meta['layer_count'] > 0:
            meta['avg_confidence'] = meta['total_confidence'] / meta['layer_count']
    
    # Generate new TypeScript groups section
    groups_ts = generate_layer_groups_typescript(layer_groups, group_metadata)
    
    # Read current layers.ts
    layers_file = Path("/Users/voldeck/code/mpiq-ai-chat/config/layers.ts")
    content = layers_file.read_text()
    
    # Replace the layerGroups section
    new_content = replace_layer_groups_in_content(content, groups_ts)
    
    # Write updated file
    layers_file.write_text(new_content)
    
    print(f"\n✅ SUCCESS!")
    print(f"📁 Updated: {layers_file}")
    print(f"📊 Created {len(layer_groups)} semantic groups")
    print(f"🎯 Average confidence: {sum(m['avg_confidence'] for m in group_metadata.values()) / len(group_metadata):.2f}")
    
    # Show final groups
    print(f"\n📂 FINAL LAYER GROUPS:")
    print("-" * 30)
    for group_key, layer_ids in layer_groups.items():
        meta = group_metadata[group_key]
        print(f"• {meta['display_name']}: {len(layer_ids)} layers (confidence: {meta['avg_confidence']:.2f})")
    
    return True

def generate_layer_groups_typescript(layer_groups, group_metadata):
    """Generate TypeScript code for layer groups"""
    
    groups_code = "export const layerGroups = {\n"
    
    # Sort groups by layer count (largest first)
    sorted_groups = sorted(layer_groups.items(), 
                          key=lambda x: group_metadata[x[0]]['layer_count'], 
                          reverse=True)
    
    for group_key, layer_ids in sorted_groups:
        meta = group_metadata[group_key]
        layer_ids_str = ",\n    ".join(f"'{layer_id}'" for layer_id in layer_ids)
        
        groups_code += f"""  '{group_key}': {{
    displayName: '{meta['display_name']}',
    description: '{meta['description']}',
    layerCount: {meta['layer_count']},
    confidence: {meta['avg_confidence']:.2f},
    layers: [
      {layer_ids_str}
    ]
  }},
"""
    
    groups_code += "};"
    return groups_code

def replace_layer_groups_in_content(content, new_groups):
    """Replace the layerGroups section in layers.ts content"""
    
    # Find the current layerGroups export
    pattern = r'export const layerGroups = \{.*?\};'
    
    if re.search(pattern, content, re.DOTALL):
        # Replace existing layerGroups
        new_content = re.sub(pattern, new_groups, content, flags=re.DOTALL)
    else:
        # If not found, add before the layers export
        layers_export_pattern = r'(export const layers:)'
        new_content = re.sub(layers_export_pattern, f"{new_groups}\n\n// Export individual layers for direct access\n\\1", content)
    
    return new_content

if __name__ == "__main__":
    success = update_layer_groups()
    if success:
        print("\n🎉 Layer groups successfully updated with semantic categories!")
    else:
        print("\n❌ Failed to update layer groups")