#!/usr/bin/env python3
"""
Update ALL 16 layers with semantic grouping using a more robust approach
"""

from intelligent_layer_grouping import IntelligentLayerGrouping
from interactive_category_selector import InteractiveCategorySelector
import re
from pathlib import Path

def extract_all_layers():
    """Extract ALL 16 layers using a more robust approach"""
    
    layers_file = Path("/Users/voldeck/code/mpiq-ai-chat/config/layers.ts")
    content = layers_file.read_text()
    
    # All 16 layer names from the grep output
    layer_names = [
        'Generation Alpha Pop',
        'Generation Z Pop', 
        'Used Google Pay Digital Payment Svc',
        'Used Apple Pay Digital Payment Svc',
        'Used Bank of America Bank 12 Mo',
        'Own Cryptocurrency Investment',
        'Have Personal Line of Credit',
        'Have Savings Account',
        'Carry Credit Card Balance 3-Usually Always',
        'Used TurboTax Online to Prepare Taxes',
        'Used H&R Block Online to Prepare Taxes',
        'Value of Credit Card Debt',
        'Value of Checking Savings Money Mkt CD',
        'Value of Stocks Bonds Mutual Funds',
        'H&R Block by ZIP',
        'H&R Block points'
    ]
    
    layers = []
    
    for i, layer_name in enumerate(layer_names):
        # Find the layer configuration in the content
        layer_pattern = rf"id: 'Unknown_Service_layer_{i}',\s*name: '{re.escape(layer_name)}'"
        layer_match = re.search(layer_pattern, content)
        
        if layer_match:
            # Extract fields for this layer - look for the next fields array after this layer
            start_pos = layer_match.end()
            fields_pattern = r'fields:\s*\[(.*?)\]'
            fields_match = re.search(fields_pattern, content[start_pos:start_pos+10000], re.DOTALL)
            
            fields = []
            if fields_match:
                fields_text = fields_match.group(1)
                # Extract individual fields
                field_pattern = r'\{\s*"name":\s*"([^"]+)",\s*"type":\s*"([^"]+)",\s*"alias":\s*"([^"]*)"\s*\}'
                field_matches = re.findall(field_pattern, fields_text)
                
                for field_name, field_type, field_alias in field_matches:
                    # Skip system fields, focus on business data fields
                    if field_name not in ['OBJECTID', 'Shape__Area', 'Shape__Length', 'CreationDate', 'Creator', 'EditDate', 'Editor', 'thematic_value']:
                        fields.append({
                            'name': field_name,
                            'type': field_type,
                            'alias': field_alias
                        })
            
            layers.append({
                'id': f'Unknown_Service_layer_{i}',
                'name': layer_name,
                'fields': fields,
                'description': f'Business Analyst Layer: {layer_name}'
            })
            
            print(f"✅ Extracted Layer {i}: {layer_name} ({len(fields)} business fields)")
        else:
            print(f"❌ Failed to find Layer {i}: {layer_name}")
    
    print(f"\n📊 Total layers extracted: {len(layers)}")
    return layers

def update_all_layer_groups():
    """Update all 16 layers with semantic grouping"""
    
    print("🔄 UPDATING ALL 16 LAYERS WITH SEMANTIC CATEGORIES")
    print("=" * 60)
    
    # Extract all layers
    all_layers = extract_all_layers()
    
    if len(all_layers) != 16:
        print(f"⚠️  Warning: Expected 16 layers, found {len(all_layers)}")
    
    # Set up semantic categories
    print(f"\n🏷️  Setting up semantic categories...")
    selector = InteractiveCategorySelector()
    selected_categories = selector.quick_selection('comprehensive')
    
    print(f"✅ Using {len(selected_categories)} categories:")
    for key, cat in selected_categories.items():
        print(f"   • {cat['display_name']}")
    
    # Initialize grouping system
    grouping = IntelligentLayerGrouping(selected_categories)
    
    # Categorize each layer
    print(f"\n📊 Categorizing all {len(all_layers)} layers:")
    print("-" * 50)
    
    layer_groups = {}
    group_metadata = {}
    
    for layer in all_layers:
        group_key, confidence = grouping.categorize_layer(
            layer['name'],
            layer['fields'],
            layer['description']
        )
        
        # Get display name
        display_name = group_key
        description = "General data layers"
        
        if group_key in selected_categories:
            display_name = selected_categories[group_key]['display_name']
            description = selected_categories[group_key]['description']
        
        # Add to groups
        if group_key not in layer_groups:
            layer_groups[group_key] = []
            group_metadata[group_key] = {
                'display_name': display_name,
                'description': description,
                'layer_count': 0,
                'confidences': []
            }
        
        layer_groups[group_key].append(layer['id'])
        group_metadata[group_key]['layer_count'] += 1
        group_metadata[group_key]['confidences'].append(confidence)
        
        print(f"🎯 {layer['name'][:45]:<45} → {display_name} ({confidence:.2f})")
    
    # Calculate average confidence
    for group_key, meta in group_metadata.items():
        if meta['confidences']:
            meta['avg_confidence'] = sum(meta['confidences']) / len(meta['confidences'])
        else:
            meta['avg_confidence'] = 0.0
        del meta['confidences']  # Clean up
    
    # Generate TypeScript groups
    groups_ts = generate_comprehensive_groups_ts(layer_groups, group_metadata)
    
    # Update the file
    layers_file = Path("/Users/voldeck/code/mpiq-ai-chat/config/layers.ts")
    content = layers_file.read_text()
    
    # Replace layerGroups section
    new_content = replace_layer_groups_section(content, groups_ts)
    
    # Write updated file
    layers_file.write_text(new_content)
    
    # Show results
    print(f"\n✅ SUCCESS! Updated all {len(all_layers)} layers")
    print(f"📁 Updated: {layers_file}")
    print(f"📊 Created {len(layer_groups)} semantic groups")
    
    total_layers = sum(meta['layer_count'] for meta in group_metadata.values())
    avg_confidence = sum(meta['avg_confidence'] for meta in group_metadata.values()) / len(group_metadata)
    print(f"🎯 Total layers: {total_layers}, Average confidence: {avg_confidence:.2f}")
    
    print(f"\n📂 FINAL SEMANTIC GROUPS:")
    print("-" * 40)
    for group_key, layer_ids in sorted(layer_groups.items(), key=lambda x: len(x[1]), reverse=True):
        meta = group_metadata[group_key]
        print(f"• {meta['display_name']}: {len(layer_ids)} layers (confidence: {meta['avg_confidence']:.2f})")
        for layer_id in layer_ids:
            layer_name = next((l['name'] for l in all_layers if l['id'] == layer_id), layer_id)
            print(f"    - {layer_name}")
    
    return True

def generate_comprehensive_groups_ts(layer_groups, group_metadata):
    """Generate comprehensive TypeScript for all groups"""
    
    groups_code = "export const layerGroups = {\n"
    
    # Sort groups by layer count (largest first) 
    sorted_groups = sorted(layer_groups.items(), 
                          key=lambda x: group_metadata[x[0]]['layer_count'], 
                          reverse=True)
    
    for group_key, layer_ids in sorted_groups:
        meta = group_metadata[group_key]
        layer_ids_str = ",\n      ".join(f"'{layer_id}'" for layer_id in layer_ids)
        
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

def replace_layer_groups_section(content, new_groups):
    """Replace the layerGroups section completely"""
    
    # Find and replace the entire layerGroups export
    pattern = r'export const layerGroups = \{.*?\};'
    
    if re.search(pattern, content, re.DOTALL):
        new_content = re.sub(pattern, new_groups, content, flags=re.DOTALL)
        return new_content
    else:
        # If not found, add before the layers export
        layers_export_pattern = r'(// Export individual layers for direct access\nexport const layers:)'
        new_content = re.sub(layers_export_pattern, f"{new_groups}\n\n\\1", content)
        return new_content

if __name__ == "__main__":
    success = update_all_layer_groups()
    if success:
        print("\n🎉 ALL 16 LAYERS SUCCESSFULLY UPDATED WITH SEMANTIC CATEGORIES!")
    else:
        print("\n❌ Failed to update all layers")