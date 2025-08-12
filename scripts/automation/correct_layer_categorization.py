#!/usr/bin/env python3
"""
Layer Categorization Correction Tool
Allows manual correction and adjustment of layer categorizations after initial processing.
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from datetime import datetime

from enhanced_category_selector import EnhancedCategorySelector
from layer_categorization_post_processor import LayerCategorizationPostProcessor

class LayerCategorizationCorrector:
    """Tool for correcting layer categorizations"""
    
    def __init__(self, project_root: str = "/Users/voldeck/code/mpiq-ai-chat"):
        self.project_root = Path(project_root)
        self.layers_file = self.project_root / "config" / "layers.ts"
        self.config_file = self.project_root / "scripts" / "automation" / "layer_categorization_config.json"
        self.corrections_file = self.project_root / "scripts" / "automation" / "layer_corrections.json"
        
        # Load current configuration and corrections
        self.category_selector = EnhancedCategorySelector()
        self.current_config = self._load_current_config()
        self.current_corrections = self._load_corrections()
        
    def _load_current_config(self) -> Dict[str, Dict]:
        """Load current categorization configuration"""
        if self.config_file.exists():
            return self.category_selector.load_configuration(str(self.config_file))
        return {}
    
    def _load_corrections(self) -> Dict[str, str]:
        """Load existing corrections"""
        if self.corrections_file.exists():
            try:
                with open(self.corrections_file, 'r') as f:
                    data = json.load(f)
                return data.get('corrections', {})
            except:
                pass
        return {}
    
    def _save_corrections(self):
        """Save corrections to file"""
        corrections_data = {
            'corrections': self.current_corrections,
            'last_updated': datetime.now().isoformat(),
            'total_corrections': len(self.current_corrections)
        }
        
        with open(self.corrections_file, 'w') as f:
            json.dump(corrections_data, f, indent=2)
    
    def extract_current_categorizations(self) -> Dict[str, Dict]:
        """Extract current layer categorizations from layers.ts"""
        if not self.layers_file.exists():
            print(f"❌ layers.ts not found at {self.layers_file}")
            return {}
        
        content = self.layers_file.read_text()
        current_categorizations = {}
        
        # Extract layerGroups section
        groups_pattern = r'export const layerGroups = \\{(.*?)\\};'
        groups_match = re.search(groups_pattern, content, re.DOTALL)
        
        if not groups_match:
            print("❌ No layerGroups found in layers.ts")
            return {}
        
        groups_content = groups_match.group(1)
        
        # Extract individual groups
        group_pattern = r"'([^']+)':\\s*\\{[^\\}]*layers:\\s*\\[([^\\]]+)\\]"
        group_matches = re.findall(group_pattern, groups_content, re.DOTALL)
        
        for category, layers_str in group_matches:
            # Extract layer IDs
            layer_ids = re.findall(r"'([^']+)'", layers_str)
            
            for layer_id in layer_ids:
                current_categorizations[layer_id] = {
                    'category': category,
                    'display_name': self._get_display_name(category)
                }
        
        return current_categorizations
    
    def _get_display_name(self, category_key: str) -> str:
        """Get display name for a category"""
        if category_key in self.current_config:
            return self.current_config[category_key].get('display_name', category_key.title())
        return category_key.replace('_', ' ').title()
    
    def show_current_categorizations(self) -> Dict[str, Dict]:
        """Show current categorizations in an organized way"""
        categorizations = self.extract_current_categorizations()
        
        if not categorizations:
            return {}
        
        # Group by category
        by_category = {}
        for layer_id, data in categorizations.items():
            category = data['category']
            if category not in by_category:
                by_category[category] = []
            by_category[category].append((layer_id, data))
        
        print(f"\\n📊 CURRENT LAYER CATEGORIZATIONS ({len(categorizations)} layers)")
        print("=" * 60)
        
        for category, layers in sorted(by_category.items(), key=lambda x: len(x[1]), reverse=True):
            display_name = layers[0][1]['display_name']
            print(f"\\n📂 {display_name} ({len(layers)} layers)")
            print("-" * 40)
            
            for i, (layer_id, data) in enumerate(layers, 1):
                correction_marker = " 🔧" if layer_id in self.current_corrections else ""
                print(f"   {i:2d}. {layer_id}{correction_marker}")
        
        return by_category
    
    def interactive_correction_session(self):
        """Run an interactive session to correct layer categorizations"""
        print("🔧 LAYER CATEGORIZATION CORRECTION TOOL")
        print("=" * 50)
        print("Interactively correct layer categorizations.")
        print("Changes will be applied to your layer categorization configuration.")
        print()
        
        # Show current categorizations
        by_category = self.show_current_categorizations()
        
        if not by_category:
            print("❌ No categorizations found to correct")
            return
        
        # Show available categories
        available_categories = list(self.current_config.keys())
        available_categories = [cat for cat in available_categories if not cat.startswith('_')]
        
        print(f"\\n🏷️  AVAILABLE CATEGORIES:")
        for i, cat in enumerate(available_categories, 1):
            display_name = self._get_display_name(cat)
            print(f"   {i:2d}. {cat} ({display_name})")
        
        print(f"\\n💡 CORRECTION OPTIONS:")
        print(f"   • Enter layer ID to correct (e.g., 'Unknown_Service_layer_0')")
        print(f"   • Enter category number to see all layers in that category")
        print(f"   • Enter 'add' to add a new custom category")
        print(f"   • Enter 'list' to show current categorizations again")
        print(f"   • Enter 'save' to save corrections and exit")
        print(f"   • Enter 'quit' to exit without saving")
        
        while True:
            print()
            user_input = input("🔧 Enter layer ID, category number, or command: ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() == 'quit':
                print("❌ Exiting without saving corrections")
                break
            
            elif user_input.lower() == 'save':
                self._apply_corrections_to_config()
                print("✅ Corrections saved and applied!")
                break
            
            elif user_input.lower() == 'list':
                self.show_current_categorizations()
                continue
            
            elif user_input.lower() == 'add':
                self._add_custom_category()
                continue
            
            elif user_input.isdigit():
                # Show layers in specific category
                cat_index = int(user_input) - 1
                if 0 <= cat_index < len(available_categories):
                    self._show_category_layers(available_categories[cat_index], by_category)
                else:
                    print(f"❌ Invalid category number. Enter 1-{len(available_categories)}")
                continue
            
            else:
                # Assume it's a layer ID
                self._correct_single_layer(user_input, available_categories)
    
    def _show_category_layers(self, category: str, by_category: Dict):
        """Show all layers in a specific category"""
        if category not in by_category:
            print(f"❌ No layers found in category '{category}'")
            return
        
        display_name = self._get_display_name(category)
        layers = by_category[category]
        
        print(f"\\n📂 {display_name} ({len(layers)} layers):")
        for i, (layer_id, data) in enumerate(layers, 1):
            correction_marker = " 🔧" if layer_id in self.current_corrections else ""
            print(f"   {i:2d}. {layer_id}{correction_marker}")
    
    def _correct_single_layer(self, layer_id: str, available_categories: List[str]):
        """Correct a single layer's categorization"""
        # Check if layer exists
        categorizations = self.extract_current_categorizations()
        
        if layer_id not in categorizations:
            print(f"❌ Layer '{layer_id}' not found")
            return
        
        current_category = categorizations[layer_id]['category']
        current_display = categorizations[layer_id]['display_name']
        
        print(f"\\n🔧 CORRECTING: {layer_id}")
        print(f"   Current category: {current_display} ({current_category})")
        
        # Show correction options
        print(f"\\n🏷️  Select new category:")
        for i, cat in enumerate(available_categories, 1):
            display_name = self._get_display_name(cat)
            current_marker = " (CURRENT)" if cat == current_category else ""
            print(f"   {i:2d}. {cat} ({display_name}){current_marker}")
        
        while True:
            choice = input(f"\\nEnter category number (1-{len(available_categories)}) or 'cancel': ").strip()
            
            if choice.lower() == 'cancel':
                print("❌ Correction cancelled")
                break
            
            if choice.isdigit():
                cat_index = int(choice) - 1
                if 0 <= cat_index < len(available_categories):
                    new_category = available_categories[cat_index]
                    new_display = self._get_display_name(new_category)
                    
                    if new_category == current_category:
                        print(f"ℹ️  Layer is already in '{new_display}' category")
                        break
                    
                    # Apply correction
                    self.current_corrections[layer_id] = new_category
                    print(f"✅ Correction added: {layer_id} → {new_display}")
                    print(f"💡 Use 'save' command to apply corrections")
                    break
                else:
                    print(f"❌ Invalid choice. Enter 1-{len(available_categories)}")
            else:
                print(f"❌ Please enter a number from 1-{len(available_categories)} or 'cancel'")
    
    def _add_custom_category(self):
        """Add a new custom category"""
        print(f"\\n🆕 ADD CUSTOM CATEGORY")
        print("-" * 25)
        
        display_name = input("Category display name: ").strip()
        if not display_name:
            print("❌ Display name cannot be empty")
            return
        
        key = display_name.lower().replace(' ', '_').replace('-', '_')
        description = input(f"Description for '{display_name}': ").strip()
        
        keywords_input = input("Keywords (comma-separated): ").strip()
        keywords = [k.strip() for k in keywords_input.split(',') if k.strip()]
        
        if not keywords:
            print("❌ At least one keyword is required")
            return
        
        # Add to current config
        self.current_config[key] = {
            'display_name': display_name,
            'description': description,
            'keywords': keywords,
            'confidence_threshold': 0.3
        }
        
        print(f"✅ Added custom category: {display_name}")
        print(f"💡 Use 'save' command to apply changes")
    
    def _apply_corrections_to_config(self):
        """Apply corrections to the configuration file"""
        if not self.current_corrections:
            print("ℹ️  No corrections to apply")
            return
        
        # Update configuration with corrections
        meta = self.current_config.get('_meta', {})
        meta['corrections'] = self.current_corrections
        meta['last_correction_update'] = datetime.now().isoformat()
        self.current_config['_meta'] = meta
        
        # Save updated configuration
        self.category_selector.save_configuration(self.current_config, str(self.config_file))
        
        # Save corrections separately for tracking
        self._save_corrections()
        
        print(f"✅ Applied {len(self.current_corrections)} corrections to configuration")
        print(f"💾 Configuration updated: {self.config_file}")
        print(f"📋 Corrections logged: {self.corrections_file}")
    
    def apply_corrections_to_layers(self) -> bool:
        """Apply corrections by re-running the post-processor"""
        if not self.current_corrections:
            print("ℹ️  No corrections to apply")
            return True
        
        print(f"\\n🔄 APPLYING {len(self.current_corrections)} CORRECTIONS TO LAYERS.TS")
        print("=" * 60)
        
        try:
            # Re-run post-processor with corrections
            processor = LayerCategorizationPostProcessor(str(self.project_root))
            success = processor.run_complete_post_processing()
            
            if success:
                print(f"✅ Corrections successfully applied to layers.ts")
                return True
            else:
                print(f"❌ Failed to apply corrections")
                return False
                
        except Exception as e:
            print(f"❌ Error applying corrections: {e}")
            return False
    
    def show_correction_summary(self):
        """Show summary of current corrections"""
        if not self.current_corrections:
            print("ℹ️  No corrections currently configured")
            return
        
        print(f"\\n📋 CORRECTION SUMMARY ({len(self.current_corrections)} corrections)")
        print("=" * 50)
        
        for layer_id, corrected_category in self.current_corrections.items():
            display_name = self._get_display_name(corrected_category)
            print(f"🔧 {layer_id} → {display_name} ({corrected_category})")
    
    def run_correction_workflow(self):
        """Run the complete correction workflow"""
        print("🔧 COMPLETE LAYER CATEGORIZATION CORRECTION WORKFLOW")
        print("=" * 65)
        
        # Step 1: Show current state
        print("\\n📊 Step 1: Current categorization state")
        self.show_current_categorizations()
        
        # Step 2: Show existing corrections
        print("\\n📋 Step 2: Existing corrections")
        self.show_correction_summary()
        
        # Step 3: Interactive correction session
        print("\\n🔧 Step 3: Interactive correction session")
        print("Make corrections to layer categorizations...")
        self.interactive_correction_session()
        
        # Step 4: Apply corrections if any were made
        if self.current_corrections:
            print("\\n🔄 Step 4: Apply corrections to layers.ts")
            if self._ask_yes_no("Apply corrections to layers.ts now?"):
                success = self.apply_corrections_to_layers()
                if success:
                    print("\\n🎉 CORRECTION WORKFLOW COMPLETE!")
                    print("✅ All corrections applied successfully")
                else:
                    print("\\n❌ Correction workflow failed during application")
            else:
                print("\\n💾 Corrections saved but not applied to layers.ts")
                print("   Run this script again to apply them later")
        else:
            print("\\n✅ No corrections made - workflow complete")
    
    def _ask_yes_no(self, question: str) -> bool:
        """Ask a yes/no question"""
        while True:
            answer = input(f"{question} (y/n): ").strip().lower()
            if answer in ['y', 'yes']:
                return True
            elif answer in ['n', 'no']:
                return False
            else:
                print("Please enter 'y' or 'n'")

def main():
    """Main function for command-line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Layer Categorization Correction Tool")
    parser.add_argument("--project-root", default="/Users/voldeck/code/mpiq-ai-chat", help="Project root directory")
    parser.add_argument("--show-only", action="store_true", help="Show current categorizations without making changes")
    parser.add_argument("--apply-existing", action="store_true", help="Apply existing corrections without interactive session")
    
    args = parser.parse_args()
    
    corrector = LayerCategorizationCorrector(args.project_root)
    
    if args.show_only:
        corrector.show_current_categorizations()
        corrector.show_correction_summary()
    elif args.apply_existing:
        corrector.apply_corrections_to_layers()
    else:
        corrector.run_correction_workflow()

if __name__ == "__main__":
    main()