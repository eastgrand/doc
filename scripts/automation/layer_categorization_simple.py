#!/usr/bin/env python3
"""
Simplified Layer Categorization Post-Processor
Automatically categorizes layers without interactive prompts.
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

class SimpleLayerCategorization:
    """Simplified layer categorization without interactive prompts"""
    
    def __init__(self, project_root: str = "/Users/voldeck/code/mpiq-ai-chat"):
        self.project_root = Path(project_root)
        self.layers_file = self.project_root / "config" / "layers_generated.ts"
        self.config_file = self.project_root / "scripts" / "automation" / "layer_categorization_config.json"
        
        # Default comprehensive categories
        self.default_categories = {
            "Demographics": {
                "keywords": ["age", "population", "household", "income", "education", "demographic"],
                "description": "Population and demographic characteristics"
            },
            "Economic": {
                "keywords": ["income", "economic", "financial", "employment", "business", "economy"],
                "description": "Economic indicators and financial data"
            },
            "Housing": {
                "keywords": ["housing", "home", "residential", "property", "real_estate"],
                "description": "Housing and real estate information"
            },
            "Entertainment": {
                "keywords": ["entertainment", "music", "movie", "concert", "leisure", "cultural"],
                "description": "Entertainment and cultural activities"
            },
            "Consumer": {
                "keywords": ["consumer", "retail", "shopping", "brand", "purchase", "spending"],
                "description": "Consumer behavior and retail patterns"
            },
            "Geographic": {
                "keywords": ["geographic", "boundary", "area", "region", "location", "spatial"],
                "description": "Geographic boundaries and spatial data"
            },
            "Transportation": {
                "keywords": ["transport", "traffic", "commute", "vehicle", "road", "transit"],
                "description": "Transportation and mobility data"
            },
            "Lifestyle": {
                "keywords": ["lifestyle", "social", "community", "activity", "behavior"],
                "description": "Lifestyle and social characteristics"
            }
        }
    
    def extract_layers_from_config(self) -> List[Dict]:
        """Extract layer information from layers_generated.ts"""
        print(f"📄 Reading layers from {self.layers_file}")
        
        if not self.layers_file.exists():
            print(f"❌ layers_generated.ts not found at {self.layers_file}")
            return []
        
        content = self.layers_file.read_text()
        layers = []
        
        # Extract layer objects from TypeScript file
        layer_pattern = r'id:\s*["\']([^"\']+)["\'][^}]*?name:\s*["\']([^"\']*)["\']'
        matches = re.findall(layer_pattern, content, re.DOTALL)
        
        for layer_id, title in matches:
            layers.append({
                'id': layer_id,
                'title': title,
                'description': title
            })
        
        print(f"✅ Extracted {len(layers)} layers")
        return layers
    
    def categorize_layer(self, layer: Dict) -> str:
        """Automatically categorize a layer based on its title and description"""
        text = f"{layer.get('title', '')} {layer.get('description', '')}".lower()
        
        best_category = "Uncategorized"
        best_score = 0
        
        for category, config in self.default_categories.items():
            score = 0
            for keyword in config['keywords']:
                if keyword.lower() in text:
                    score += 1
            
            if score > best_score:
                best_score = score
                best_category = category
        
        return best_category
    
    def process_categorization(self) -> Dict:
        """Process all layers and categorize them"""
        print("🏷️  Starting automatic layer categorization...")
        
        layers = self.extract_layers_from_config()
        if not layers:
            print("❌ No layers found to categorize")
            return {}
        
        categorization_results = {}
        category_counts = {}
        
        for layer in layers:
            category = self.categorize_layer(layer)
            categorization_results[layer['id']] = {
                'category': category,
                'title': layer['title'],
                'auto_assigned': True,
                'confidence': 'auto'
            }
            
            category_counts[category] = category_counts.get(category, 0) + 1
        
        # Save configuration
        config_data = {
            'categories': self.default_categories,
            'layer_assignments': categorization_results,
            'metadata': {
                'created_at': datetime.now().isoformat(),
                'method': 'automatic_categorization',
                'total_layers': len(layers),
                'category_distribution': category_counts
            }
        }
        
        # Create config directory if it doesn't exist
        self.config_file.parent.mkdir(exist_ok=True)
        
        with open(self.config_file, 'w') as f:
            json.dump(config_data, f, indent=2)
        
        print(f"💾 Saved configuration to {self.config_file}")
        print(f"📊 Category distribution:")
        for category, count in sorted(category_counts.items()):
            print(f"   {category}: {count} layers")
        
        return config_data
    
    def update_layers_with_categories(self, categorization_results: Dict):
        """Update the layers.ts file with category information"""
        if not self.layers_file.exists():
            print("❌ layers_generated.ts not found - cannot update with categories")
            return
        
        content = self.layers_file.read_text()
        
        # Add category field to each layer
        updated_content = content
        for layer_id, assignment in categorization_results['layer_assignments'].items():
            category = assignment['category']
            
            # Find and update the layer definition
            pattern = rf'(\{{\s*id:\s*["\']){layer_id}(["\'][^}}]*)\}}'
            replacement = rf'\1{layer_id}\2,\n    category: "{category}"\n  }}'
            
            if re.search(pattern, updated_content):
                updated_content = re.sub(pattern, replacement, updated_content, count=1)
        
        # Write back to file
        self.layers_file.write_text(updated_content)
        print(f"✅ Updated {self.layers_file} with category assignments")


def main():
    """Main function"""
    print("🏷️  SIMPLIFIED LAYER CATEGORIZATION")
    print("=" * 50)
    
    categorizer = SimpleLayerCategorization()
    
    try:
        # Process categorization
        results = categorizer.process_categorization()
        
        if results:
            # Update layers file with categories
            categorizer.update_layers_with_categories(results)
            
            print(f"\n✅ Layer categorization completed successfully!")
            print(f"📁 Configuration saved to: {categorizer.config_file}")
            print(f"📊 Categorized {results['metadata']['total_layers']} layers")
            print(f"🎯 Categories used: {len(results['metadata']['category_distribution'])}")
        else:
            print("❌ Layer categorization failed")
            return 1
            
    except Exception as e:
        print(f"❌ Error during categorization: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())