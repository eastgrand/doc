#!/usr/bin/env python3
"""
Layer Categorization Post-Processor
Runs AFTER layers.ts is generated to apply semantic categorization with operational enhancements.

Addresses operational requirements:
- Runs after layers.ts is updated in automation pipeline
- Handles uncategorized layers with fallback strategies
- Supports custom category creation
- Automatic 'Locations' category for point layers
- Layer exclusion mechanism
- Category correction/adjustment system
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from datetime import datetime

from enhanced_category_selector import EnhancedCategorySelector
from intelligent_layer_grouping import IntelligentLayerGrouping

@dataclass
class LayerInfo:
    """Information about a single layer extracted from layers.ts"""
    id: str
    name: str
    fields: List[Dict]
    description: str
    geometry_type: str = 'unknown'
    is_point_layer: bool = False

class LayerCategorizationPostProcessor:
    """Post-processes layers.ts to apply enhanced semantic categorization"""
    
    def __init__(self, project_root: str = "/Users/voldeck/code/mpiq-ai-chat"):
        self.project_root = Path(project_root)
        self.layers_file = self.project_root / "config" / "layers.ts"
        self.config_file = self.project_root / "scripts" / "automation" / "layer_categorization_config.json"
        
        # Load or create configuration
        self.category_selector = EnhancedCategorySelector()
        self.selected_categories = self._load_or_create_config()
        
        # Initialize intelligent grouping with enhanced config
        self.intelligent_grouping = IntelligentLayerGrouping(
            selected_categories=self._format_for_grouping_system(self.selected_categories)
        )
        
        # Operational tracking
        self.categorization_results = {}
        self.uncategorized_layers = []
        self.excluded_layers = []
        self.corrections_applied = []
        self.point_layers_found = []
    
    def _load_or_create_config(self) -> Dict[str, Dict]:
        """Load existing config or create new one interactively"""
        if self.config_file.exists():
            print(f"📂 Loading existing categorization configuration...")
            config = self.category_selector.load_configuration(str(self.config_file))
            if config:
                print(f"✅ Loaded configuration with {len([k for k in config.keys() if not k.startswith('_')])} categories")
                return config
        
        print(f"\n🆕 No existing configuration found. Creating new configuration...")
        config = self.category_selector.interactive_selection_with_enhancements()
        
        if config:
            self.category_selector.save_configuration(config, str(self.config_file))
        
        return config
    
    def _format_for_grouping_system(self, enhanced_config: Dict[str, Dict]) -> Dict[str, Dict]:
        """Format enhanced config for the intelligent grouping system"""
        formatted = {}
        
        for key, config in enhanced_config.items():
            if key.startswith('_'):  # Skip metadata
                continue
            
            formatted[key] = {
                'display_name': config.get('display_name', key.title()),
                'description': config.get('description', f'{key} related data'),
                'keywords': config.get('keywords', [key]),
                'confidence_threshold': config.get('confidence_threshold', 0.3)
            }
        
        return formatted
    
    def extract_layers_from_config(self) -> List[LayerInfo]:
        """Extract layer information from layers.ts file"""
        print(f"\n📄 Reading layers from {self.layers_file}")
        
        if not self.layers_file.exists():
            raise FileNotFoundError(f"layers.ts not found at {self.layers_file}")
        
        content = self.layers_file.read_text()
        layers = []
        
        # Extract layer configurations using regex
        layer_pattern = r'{\s*id:\s*[\'"]([^\'"]+)[\'"]\s*,\s*name:\s*[\'"]([^\'"]+)[\'"]\s*,.*?fields:\s*(\[.*?\])\s*,.*?description:\s*[\'"]([^\'"]*)[\'"].*?(?:geometryType:\s*[\'"]([^\'"]*)[\'"])?.*?}'
        
        matches = re.findall(layer_pattern, content, re.DOTALL)
        
        for match in matches:
            layer_id, layer_name, fields_text, description = match[:4]
            geometry_type = match[4] if len(match) > 4 else 'unknown'
            
            # Parse fields array
            try:
                # Clean up the fields text for JSON parsing
                fields_clean = re.sub(r'(\w+):', r'"\1":', fields_text)  # Add quotes to keys
                fields_clean = re.sub(r"'([^']*)'", r'"\1"', fields_clean)  # Convert single quotes to double quotes
                fields = json.loads(fields_clean)
            except json.JSONDecodeError:
                # Fallback regex parsing for fields
                field_pattern = r'"name":\s*"([^"]+)"\s*,\s*"type":\s*"([^"]+)"\s*,\s*"alias":\s*"([^"]*)"'
                field_matches = re.findall(field_pattern, fields_text)
                fields = [
                    {'name': name, 'type': field_type, 'alias': alias}
                    for name, field_type, alias in field_matches
                ]
            
            # Determine if it's a point layer
            is_point_layer = self._is_point_layer(geometry_type, layer_name, fields)
            
            layer_info = LayerInfo(
                id=layer_id,
                name=layer_name,
                fields=fields,
                description=description,
                geometry_type=geometry_type,
                is_point_layer=is_point_layer
            )
            
            layers.append(layer_info)
            
            if is_point_layer:
                self.point_layers_found.append(layer_id)
        
        print(f"✅ Extracted {len(layers)} layers from configuration")
        if self.point_layers_found:
            print(f"📍 Found {len(self.point_layers_found)} point layers")
        
        return layers
    
    def _is_point_layer(self, geometry_type: str, layer_name: str, fields: List[Dict]) -> bool:
        """Determine if a layer represents point data"""
        # Check geometry type
        if 'point' in geometry_type.lower():
            return True
        
        # Check layer name for point indicators
        point_indicators = ['location', 'store', 'branch', 'office', 'poi', 'point', 'address', 'place']
        layer_name_lower = layer_name.lower()
        
        for indicator in point_indicators:
            if indicator in layer_name_lower:
                return True
        
        # Check field names for location indicators
        field_names = [f.get('name', '').lower() for f in fields]
        location_fields = ['lat', 'lon', 'latitude', 'longitude', 'x', 'y', 'address', 'location']
        
        for field_name in field_names:
            for location_field in location_fields:
                if location_field in field_name:
                    return True
        
        return False
    
    def categorize_all_layers(self, layers: List[LayerInfo]) -> Dict[str, Dict]:
        """Categorize all layers with enhanced logic"""
        print(f"\n🏷️  CATEGORIZING {len(layers)} LAYERS")
        print("=" * 50)
        
        layer_groups = {}
        group_metadata = {}
        
        # Get metadata for operational features
        meta = self.selected_categories.get('_meta', {})
        excluded_patterns = meta.get('excluded_layers', [])
        corrections = meta.get('corrections', {})
        locations_auto_enabled = meta.get('locations_auto_enabled', False)
        
        for layer in layers:
            # Check for exclusions first
            if self._is_layer_excluded(layer, excluded_patterns):
                self.excluded_layers.append(layer.id)
                print(f"🚫 {layer.name:<45} → EXCLUDED")
                continue
            
            # Apply manual corrections if any
            if layer.id in corrections:
                corrected_category = corrections[layer.id]
                confidence = 1.0
                self.corrections_applied.append(layer.id)
                print(f"🔧 {layer.name:<45} → {corrected_category} (CORRECTED)")
            else:
                # Check for automatic point layer assignment
                if locations_auto_enabled and layer.is_point_layer and 'locations' in self.selected_categories:
                    corrected_category = 'locations'
                    confidence = 0.95  # High confidence for automatic assignment
                    print(f"📍 {layer.name:<45} → Locations (POINT LAYER)")
                else:
                    # Use intelligent categorization
                    corrected_category, confidence = self.intelligent_grouping.categorize_layer(
                        layer.name, layer.fields, layer.description
                    )
                    
                    # Get display name for output
                    if corrected_category in self.selected_categories:
                        display_name = self.selected_categories[corrected_category].get('display_name', corrected_category)
                    else:
                        display_name = corrected_category
                    
                    print(f"🎯 {layer.name:<45} → {display_name} ({confidence:.2f})")
            
            # Handle uncategorized layers (fallback strategy)
            if confidence < 0.1 or corrected_category == 'general':
                fallback_category = self._apply_fallback_strategy(layer)
                if fallback_category != corrected_category:
                    corrected_category = fallback_category
                    confidence = 0.5  # Moderate confidence for fallback
                    print(f"🔄     └─ Applied fallback: {fallback_category}")
                else:
                    self.uncategorized_layers.append(layer.id)
            
            # Add to groups
            if corrected_category not in layer_groups:
                layer_groups[corrected_category] = []
                group_metadata[corrected_category] = {
                    'display_name': self._get_display_name(corrected_category),
                    'description': self._get_description(corrected_category),
                    'layer_count': 0,
                    'confidences': []
                }
            
            layer_groups[corrected_category].append(layer.id)
            group_metadata[corrected_category]['layer_count'] += 1
            group_metadata[corrected_category]['confidences'].append(confidence)
            
            # Store result for tracking
            self.categorization_results[layer.id] = {
                'category': corrected_category,
                'confidence': confidence,
                'is_point_layer': layer.is_point_layer,
                'was_corrected': layer.id in corrections,
                'used_fallback': confidence < 0.1
            }
        
        # Calculate average confidence for each group
        for group_key, meta in group_metadata.items():
            if meta['confidences']:
                meta['avg_confidence'] = sum(meta['confidences']) / len(meta['confidences'])
            else:
                meta['avg_confidence'] = 0.0
            del meta['confidences']  # Clean up
        
        return self._generate_layer_groups_structure(layer_groups, group_metadata)
    
    def _is_layer_excluded(self, layer: LayerInfo, excluded_patterns: List[str]) -> bool:
        """Check if a layer matches any exclusion patterns"""
        import fnmatch
        
        for pattern in excluded_patterns:
            if fnmatch.fnmatch(layer.name, pattern) or fnmatch.fnmatch(layer.id, pattern):
                return True
        
        return False
    
    def _apply_fallback_strategy(self, layer: LayerInfo) -> str:
        """Apply fallback categorization strategy for uncategorized layers"""
        # Strategy 1: Check if it's a point layer and locations category exists
        if layer.is_point_layer and 'locations' in self.selected_categories:
            return 'locations'
        
        # Strategy 2: Check for common patterns in layer name
        layer_name_lower = layer.name.lower()
        
        # Financial patterns
        if any(word in layer_name_lower for word in ['bank', 'credit', 'loan', 'financial']):
            if 'financial_services' in self.selected_categories:
                return 'financial_services'
        
        # Payment patterns
        if any(word in layer_name_lower for word in ['pay', 'payment', 'apple pay', 'google pay']):
            if 'digital_payments' in self.selected_categories:
                return 'digital_payments'
        
        # Demographic patterns
        if any(word in layer_name_lower for word in ['population', 'age', 'demographic', 'generation']):
            if 'demographics' in self.selected_categories:
                return 'demographics'
        
        # Strategy 3: Default to most general category available
        general_categories = ['business_analyst', 'geographic', 'general']
        for cat in general_categories:
            if cat in self.selected_categories:
                return cat
        
        # Strategy 4: Use first available category
        available_categories = [k for k in self.selected_categories.keys() if not k.startswith('_')]
        if available_categories:
            return available_categories[0]
        
        # Final fallback
        return 'general'
    
    def _get_display_name(self, category_key: str) -> str:
        """Get display name for a category"""
        if category_key in self.selected_categories:
            return self.selected_categories[category_key].get('display_name', category_key.title())
        return category_key.replace('_', ' ').title()
    
    def _get_description(self, category_key: str) -> str:
        """Get description for a category"""
        if category_key in self.selected_categories:
            return self.selected_categories[category_key].get('description', f'{category_key} related data')
        return f'Data layers related to {category_key.replace("_", " ")}'
    
    def _generate_layer_groups_structure(self, layer_groups: Dict[str, List[str]], group_metadata: Dict[str, Dict]) -> Dict[str, Dict]:
        """Generate the layerGroups structure for layers.ts"""
        groups_structure = {}
        
        # Sort groups by layer count (largest first)
        sorted_groups = sorted(layer_groups.items(), 
                              key=lambda x: group_metadata[x[0]]['layer_count'], 
                              reverse=True)
        
        for group_key, layer_ids in sorted_groups:
            meta = group_metadata[group_key]
            
            groups_structure[group_key] = {
                'displayName': meta['display_name'],
                'description': meta['description'],
                'layerCount': meta['layer_count'],
                'confidence': meta['avg_confidence'],
                'layers': layer_ids
            }
        
        return groups_structure
    
    def update_layers_ts_with_categories(self, layer_groups: Dict[str, Dict]) -> bool:
        """Update layers.ts with the new categorization"""
        print(f"\n💾 UPDATING {self.layers_file}")
        print("-" * 40)
        
        try:
            # Read current content
            content = self.layers_file.read_text()
            
            # Generate new layerGroups TypeScript
            new_groups_ts = self._generate_groups_typescript(layer_groups)
            
            # Replace existing layerGroups section
            new_content = self._replace_layer_groups_section(content, new_groups_ts)
            
            # Create backup
            backup_file = self.layers_file.with_suffix('.ts.backup')
            self.layers_file.rename(backup_file)
            print(f"📦 Created backup: {backup_file.name}")
            
            # Write updated content
            self.layers_file.write_text(new_content)
            
            print(f"✅ Updated layers.ts with {len(layer_groups)} semantic groups")
            return True
            
        except Exception as e:
            print(f"❌ Failed to update layers.ts: {e}")
            # Restore backup if it exists
            backup_file = self.layers_file.with_suffix('.ts.backup')
            if backup_file.exists():
                backup_file.rename(self.layers_file)
                print(f"🔄 Restored original file from backup")
            return False
    
    def _generate_groups_typescript(self, layer_groups: Dict[str, Dict]) -> str:
        """Generate TypeScript code for layerGroups"""
        groups_code = "export const layerGroups = {\\n"
        
        for group_key, group_data in layer_groups.items():
            layer_ids_str = ",\\n    ".join(f"'{layer_id}'" for layer_id in group_data['layers'])
            
            groups_code += f"""  '{group_key}': {{
    displayName: '{group_data['displayName']}',
    description: '{group_data['description']}',
    layerCount: {group_data['layerCount']},
    confidence: {group_data['confidence']:.2f},
    layers: [
      {layer_ids_str}
    ]
  }},
"""
        
        groups_code += "};"
        return groups_code
    
    def _replace_layer_groups_section(self, content: str, new_groups: str) -> str:
        """Replace the layerGroups section in layers.ts content"""
        # Find and replace the entire layerGroups export
        pattern = r'export const layerGroups = \\{.*?\\};'
        
        if re.search(pattern, content, re.DOTALL):
            new_content = re.sub(pattern, new_groups, content, flags=re.DOTALL)
            return new_content
        else:
            # If not found, add before the layers export
            layers_export_pattern = r'(// Export individual layers for direct access\\nexport const layers:)'
            new_content = re.sub(layers_export_pattern, f"{new_groups}\\n\\n\\\\1", content)
            return new_content
    
    def generate_categorization_report(self) -> str:
        """Generate a comprehensive categorization report"""
        report = f"""# Layer Categorization Report

## Processing Summary
- **Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- **Configuration**: {self.config_file}
- **Layers Processed**: {len(self.categorization_results)}
- **Layers Excluded**: {len(self.excluded_layers)}
- **Corrections Applied**: {len(self.corrections_applied)}
- **Point Layers Found**: {len(self.point_layers_found)}
- **Uncategorized Layers**: {len(self.uncategorized_layers)}

## Categorization Results
"""
        
        # Group results by category
        by_category = {}
        for layer_id, result in self.categorization_results.items():
            category = result['category']
            if category not in by_category:
                by_category[category] = []
            by_category[category].append((layer_id, result))
        
        for category, layers in sorted(by_category.items(), key=lambda x: len(x[1]), reverse=True):
            display_name = self._get_display_name(category)
            avg_confidence = sum(r[1]['confidence'] for r in layers) / len(layers)
            
            report += f"\n### {display_name} ({len(layers)} layers, avg confidence: {avg_confidence:.2f})\n"
            
            for layer_id, result in layers:
                confidence = result['confidence']
                flags = []
                if result['is_point_layer']:
                    flags.append('POINT')
                if result['was_corrected']:
                    flags.append('CORRECTED')
                if result['used_fallback']:
                    flags.append('FALLBACK')
                
                flag_str = f" [{', '.join(flags)}]" if flags else ""
                report += f"- {layer_id} (confidence: {confidence:.2f}){flag_str}\\n"
        
        # Add operational sections
        if self.excluded_layers:
            report += f"\n## Excluded Layers ({len(self.excluded_layers)})\n"
            for layer_id in self.excluded_layers:
                report += f"- {layer_id}\\n"
        
        if self.uncategorized_layers:
            report += f"\n## Uncategorized Layers ({len(self.uncategorized_layers)})\n"
            report += "These layers had low confidence scores and may need manual review:\\n"
            for layer_id in self.uncategorized_layers:
                report += f"- {layer_id}\\n"
        
        if self.point_layers_found:
            report += f"\n## Point Layers Auto-Assignment ({len(self.point_layers_found)})\n"
            for layer_id in self.point_layers_found:
                report += f"- {layer_id}\\n"
        
        report += f"\n## Configuration Used\n"
        categories_count = len([k for k in self.selected_categories.keys() if not k.startswith('_')])
        report += f"- **Total Categories**: {categories_count}\\n"
        
        for key, config in self.selected_categories.items():
            if not key.startswith('_'):
                report += f"- **{config.get('display_name', key)}**: {config.get('description', 'No description')}\\n"
        
        return report
    
    def run_complete_post_processing(self) -> bool:
        """Run the complete post-processing pipeline"""
        print("🚀 LAYER CATEGORIZATION POST-PROCESSOR")
        print("=" * 60)
        print("Enhanced semantic categorization with operational features:")
        print("• Runs after layers.ts generation")
        print("• Handles uncategorized layers")
        print("• Supports custom categories")
        print("• Auto-assigns point layers")
        print("• Applies exclusions and corrections")
        print()
        
        try:
            # Step 1: Extract layers from layers.ts
            layers = self.extract_layers_from_config()
            
            if not layers:
                print("❌ No layers found to categorize")
                return False
            
            # Step 2: Categorize all layers
            layer_groups = self.categorize_all_layers(layers)
            
            if not layer_groups:
                print("❌ No categorization results generated")
                return False
            
            # Step 3: Update layers.ts
            success = self.update_layers_ts_with_categories(layer_groups)
            
            if not success:
                return False
            
            # Step 4: Generate report
            print(f"\n📊 CATEGORIZATION RESULTS:")
            print("-" * 30)
            total_layers = sum(group['layerCount'] for group in layer_groups.values())
            avg_confidence = sum(group['confidence'] for group in layer_groups.values()) / len(layer_groups)
            
            print(f"✅ Processed: {total_layers} layers")
            print(f"📁 Groups: {len(layer_groups)}")
            print(f"🎯 Avg Confidence: {avg_confidence:.2f}")
            print(f"📍 Point Layers: {len(self.point_layers_found)}")
            print(f"🚫 Excluded: {len(self.excluded_layers)}")
            print(f"🔧 Corrected: {len(self.corrections_applied)}")
            print(f"❓ Uncategorized: {len(self.uncategorized_layers)}")
            
            # Show groups summary
            print(f"\n📂 SEMANTIC GROUPS:")
            for group_key, group_data in sorted(layer_groups.items(), key=lambda x: x[1]['layerCount'], reverse=True):
                print(f"  • {group_data['displayName']}: {group_data['layerCount']} layers ({group_data['confidence']:.2f})")
            
            # Save detailed report
            report = self.generate_categorization_report()
            report_file = self.project_root / "scripts" / "automation" / "layer_categorization_report.md"
            report_file.write_text(report)
            print(f"\n📄 Detailed report: {report_file}")
            
            print(f"\n🎉 LAYER CATEGORIZATION COMPLETE!")
            print(f"✅ layers.ts updated with enhanced semantic categorization")
            
            return True
            
        except Exception as e:
            print(f"❌ Post-processing failed: {e}")
            return False

def main():
    """Main function for command-line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Layer Categorization Post-Processor")
    parser.add_argument("--project-root", default="/Users/voldeck/code/mpiq-ai-chat", help="Project root directory")
    parser.add_argument("--interactive", action="store_true", help="Run in interactive mode for new configuration")
    parser.add_argument("--report-only", action="store_true", help="Generate report without updating files")
    
    args = parser.parse_args()
    
    processor = LayerCategorizationPostProcessor(args.project_root)
    
    if args.report_only:
        # Just analyze and report, don't update files
        layers = processor.extract_layers_from_config()
        layer_groups = processor.categorize_all_layers(layers)
        report = processor.generate_categorization_report()
        print("📊 ANALYSIS COMPLETE (no files modified)")
        print(report)
    else:
        # Run complete processing
        success = processor.run_complete_post_processing()
        if not success:
            exit(1)

if __name__ == "__main__":
    main()