#!/usr/bin/env python3
"""
Enhanced Interactive Category Selector for Layer Grouping
Addresses operational requirements:
- Custom category creation
- Layer exclusion mechanism  
- Point layer automatic categorization
- Correction/adjustment system
"""

import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

@dataclass
class CategoryConfig:
    """Configuration for a semantic category"""
    key: str
    display_name: str
    description: str
    keywords: List[str]
    auto_assign_point_layers: bool = False
    confidence_threshold: float = 0.3

class EnhancedCategorySelector:
    """Enhanced category selector with operational improvements"""
    
    def __init__(self):
        self.categories = self._load_predefined_categories()
        self.custom_categories = {}
        self.excluded_layers = set()
        self.corrections = {}  # layer_id -> corrected_category
        
    def _load_predefined_categories(self) -> Dict[str, CategoryConfig]:
        """Load predefined category configurations"""
        categories = {
            'demographics': CategoryConfig(
                key='demographics',
                display_name='Demographics',
                description='Population, age, gender, household characteristics',
                keywords=['population', 'age', 'gender', 'household', 'family', 'residents', 'people', 
                         'demographics', 'generation', 'alpha', 'millennial', 'gen z', 'diversity']
            ),
            'financial_services': CategoryConfig(
                key='financial_services',
                display_name='Financial Services',
                description='Banking, credit, loans, financial institutions',
                keywords=['bank', 'credit', 'loan', 'financial', 'mortgage', 'savings', 'checking',
                         'bank of america', 'wells fargo', 'chase', 'investment', 'portfolio']
            ),
            'digital_payments': CategoryConfig(
                key='digital_payments',
                display_name='Digital Payments',
                description='Digital payment services and mobile payment platforms',
                keywords=['apple pay', 'google pay', 'paypal', 'venmo', 'digital payment', 
                         'mobile payment', 'contactless', 'tap to pay', 'wallet']
            ),
            'investments': CategoryConfig(
                key='investments',
                display_name='Investments & Wealth',
                description='Investment portfolios, stocks, bonds, cryptocurrency',
                keywords=['investment', 'stocks', 'bonds', 'mutual funds', 'crypto', 'cryptocurrency',
                         'portfolio', 'wealth', 'assets', 'retirement', '401k', 'ira']
            ),
            'tax_services': CategoryConfig(
                key='tax_services',
                display_name='Tax Preparation Services',
                description='Tax software, tax preparers, tax services',
                keywords=['tax', 'turbotax', 'h&r block', 'tax preparation', 'tax software',
                         'tax return', 'irs', 'refund', 'tax filing']
            ),
            'consumer_behavior': CategoryConfig(
                key='consumer_behavior',
                display_name='Consumer Behavior',
                description='Shopping patterns, spending habits, consumer preferences',
                keywords=['spending', 'shopping', 'consumer', 'purchase', 'retail', 'behavior',
                         'preferences', 'habits', 'lifestyle', 'brand loyalty']
            ),
            'locations': CategoryConfig(
                key='locations',
                display_name='Locations',
                description='Point-of-interest data, store locations, geographic points',
                keywords=['location', 'store', 'branch', 'office', 'point', 'address', 'place'],
                auto_assign_point_layers=True
            ),
            'business_analyst': CategoryConfig(
                key='business_analyst',
                display_name='Business Intelligence',
                description='Business analysis and market research data',
                keywords=['business', 'market', 'analysis', 'intelligence', 'research', 'data',
                         'analytics', 'insights', 'trends', 'performance']
            ),
            'geographic': CategoryConfig(
                key='geographic',
                display_name='Geographic Data',
                description='Geographic boundaries, regions, postal codes',
                keywords=['zip', 'postal', 'boundary', 'geographic', 'region', 'area', 'territory',
                         'dma', 'county', 'state', 'census']
            ),
            'economic': CategoryConfig(
                key='economic',
                display_name='Economic Indicators',
                description='Income, economic status, financial indicators',
                keywords=['income', 'earnings', 'salary', 'economic', 'affluence', 'wealth',
                         'disposable income', 'purchasing power', 'financial status']
            )
        }
        return categories
    
    def interactive_selection_with_enhancements(self) -> Dict[str, Dict]:
        """Enhanced interactive selection with all operational features"""
        print("\n🏷️  ENHANCED LAYER CATEGORIZATION SETUP")
        print("=" * 60)
        print("Configure semantic categories with operational enhancements:")
        print("• Custom category creation")
        print("• Layer exclusion options")
        print("• Automatic point layer categorization")
        print("• Category correction system")
        print()
        
        # Show presets first
        presets = self._show_presets()
        selected_categories = {}
        
        # Handle preset selection
        while True:
            choice = input("Select preset (1-5) or 'custom' for manual selection: ").strip().lower()
            if choice in ['1', '2', '3', '4']:
                preset_name = list(presets.keys())[int(choice) - 1]
                selected_categories = self._apply_preset(preset_name)
                break
            elif choice == '5' or choice == 'custom':
                selected_categories = self._manual_category_selection()
                break
            elif choice == 'q':
                print("❌ Category selection cancelled")
                return {}
            else:
                print("Please enter 1-5 or 'custom'")
        
        # Enhanced configuration options
        print(f"\n✅ Base categories selected: {len(selected_categories)}")
        
        # Option to add custom categories
        if self._ask_yes_no("\n🆕 Add custom categories?"):
            selected_categories.update(self._create_custom_categories())
        
        # Configure automatic point layer detection
        if self._ask_yes_no("\n📍 Enable automatic 'Locations' category for point layers?"):
            self._configure_point_layer_detection(selected_categories)
        
        # Configure layer exclusions
        if self._ask_yes_no("\n🚫 Configure layer exclusions?"):
            self._configure_layer_exclusions()
        
        # Show final summary
        self._show_final_summary(selected_categories)
        
        return self._format_categories_for_grouping(selected_categories)
    
    def _show_presets(self) -> Dict[str, str]:
        """Show preset category combinations"""
        presets = {
            'comprehensive': 'All major categories (recommended)',
            'financial_focused': 'Financial services and payments focused', 
            'consumer_focused': 'Consumer behavior and demographics',
            'locations_focused': 'Geographic and location data focused'
        }
        
        print("🚀 QUICK PRESETS:")
        for i, (preset, description) in enumerate(presets.items(), 1):
            print(f"   {i}. {preset.replace('_', ' ').title()} - {description}")
        print("   5. Custom - Manual category selection")
        print()
        
        return presets
    
    def _apply_preset(self, preset_name: str) -> Dict[str, CategoryConfig]:
        """Apply a preset category selection"""
        if preset_name == 'comprehensive':
            return dict(self.categories)
        elif preset_name == 'financial_focused':
            return {k: v for k, v in self.categories.items() 
                   if k in ['financial_services', 'digital_payments', 'investments', 'tax_services', 'demographics']}
        elif preset_name == 'consumer_focused':
            return {k: v for k, v in self.categories.items() 
                   if k in ['consumer_behavior', 'demographics', 'economic', 'business_analyst']}
        elif preset_name == 'locations_focused':
            return {k: v for k, v in self.categories.items() 
                   if k in ['locations', 'geographic', 'business_analyst']}
        else:
            return {}
    
    def _manual_category_selection(self) -> Dict[str, CategoryConfig]:
        """Manual category selection"""
        print("\n📋 AVAILABLE CATEGORIES:")
        for i, (key, config) in enumerate(self.categories.items(), 1):
            print(f"   {i:2d}. {config.display_name:<25} - {config.description}")
        print()
        
        selected = {}
        for key, config in self.categories.items():
            if self._ask_yes_no(f"Include '{config.display_name}'?"):
                selected[key] = config
        
        return selected
    
    def _create_custom_categories(self) -> Dict[str, CategoryConfig]:
        """Create custom categories interactively"""
        custom_categories = {}
        
        while True:
            print(f"\n🆕 CUSTOM CATEGORY CREATION")
            print("-" * 30)
            
            # Get category details
            display_name = input("Category display name (or 'done' to finish): ").strip()
            if display_name.lower() == 'done':
                break
                
            if not display_name:
                print("❌ Display name cannot be empty")
                continue
            
            key = display_name.lower().replace(' ', '_').replace('-', '_')
            description = input(f"Description for '{display_name}': ").strip()
            
            # Get keywords
            print(f"Keywords for '{display_name}' (comma-separated):")
            keywords_input = input("Keywords: ").strip()
            keywords = [k.strip() for k in keywords_input.split(',') if k.strip()]
            
            if not keywords:
                print("❌ At least one keyword is required")
                continue
            
            # Create custom category
            custom_config = CategoryConfig(
                key=key,
                display_name=display_name,
                description=description,
                keywords=keywords
            )
            
            custom_categories[key] = custom_config
            print(f"✅ Added custom category: {display_name}")
            
            if not self._ask_yes_no("Add another custom category?"):
                break
        
        if custom_categories:
            print(f"\n✅ Created {len(custom_categories)} custom categories")
            for key, config in custom_categories.items():
                print(f"   • {config.display_name}: {', '.join(config.keywords[:3])}...")
        
        return custom_categories
    
    def _configure_point_layer_detection(self, categories: Dict[str, CategoryConfig]):
        """Configure automatic point layer detection"""
        # Ensure locations category exists
        if 'locations' not in categories:
            print("📍 Adding 'Locations' category for point layers...")
            categories['locations'] = self.categories['locations']
        
        print("✅ Point layers will automatically be assigned to 'Locations' category")
        categories['locations'].auto_assign_point_layers = True
    
    def _configure_layer_exclusions(self):
        """Configure layers to exclude from categorization"""
        print("\n🚫 LAYER EXCLUSION CONFIGURATION")
        print("-" * 35)
        print("Enter layer names or patterns to exclude from categorization:")
        print("Examples: 'test_layer', '*_backup', 'temp_*'")
        print("(Enter 'done' when finished)")
        
        exclusions = []
        while True:
            pattern = input("Exclusion pattern: ").strip()
            if pattern.lower() == 'done':
                break
            if pattern:
                exclusions.append(pattern)
                self.excluded_layers.add(pattern)
                print(f"✅ Will exclude: {pattern}")
        
        if exclusions:
            print(f"\n✅ Configured {len(exclusions)} exclusion patterns")
        else:
            print("ℹ️  No exclusions configured")
    
    def _show_final_summary(self, categories: Dict[str, CategoryConfig]):
        """Show final configuration summary"""
        print(f"\n📊 FINAL CONFIGURATION SUMMARY")
        print("=" * 40)
        print(f"✅ Categories: {len(categories)}")
        for config in categories.values():
            point_marker = " 🎯" if config.auto_assign_point_layers else ""
            print(f"   • {config.display_name}{point_marker}")
        
        if self.custom_categories:
            print(f"✅ Custom categories: {len(self.custom_categories)}")
        
        if self.excluded_layers:
            print(f"🚫 Exclusion patterns: {len(self.excluded_layers)}")
        
        print(f"📍 Point layer auto-assignment: {'Enabled' if any(c.auto_assign_point_layers for c in categories.values()) else 'Disabled'}")
    
    def _format_categories_for_grouping(self, categories: Dict[str, CategoryConfig]) -> Dict[str, Dict]:
        """Format categories for the intelligent grouping system"""
        formatted = {}
        
        for key, config in categories.items():
            formatted[key] = {
                'display_name': config.display_name,
                'description': config.description,
                'keywords': config.keywords,
                'confidence_threshold': config.confidence_threshold,
                'auto_assign_point_layers': config.auto_assign_point_layers
            }
        
        # Add operational metadata
        formatted['_meta'] = {
            'excluded_layers': list(self.excluded_layers),
            'corrections': self.corrections,
            'locations_auto_enabled': any(c.auto_assign_point_layers for c in categories.values()),
            'custom_categories_count': len(self.custom_categories)
        }
        
        return formatted
    
    def apply_corrections(self, layer_categorizations: Dict[str, Tuple[str, float]]) -> Dict[str, Tuple[str, float]]:
        """Apply manual corrections to layer categorizations"""
        corrected = dict(layer_categorizations)
        
        for layer_id, corrected_category in self.corrections.items():
            if layer_id in corrected:
                original_category, original_confidence = corrected[layer_id]
                corrected[layer_id] = (corrected_category, 1.0)  # High confidence for manual corrections
                print(f"🔧 Applied correction: {layer_id} {original_category} → {corrected_category}")
        
        return corrected
    
    def is_layer_excluded(self, layer_name: str, layer_id: str) -> bool:
        """Check if a layer should be excluded from categorization"""
        import fnmatch
        
        for pattern in self.excluded_layers:
            if fnmatch.fnmatch(layer_name, pattern) or fnmatch.fnmatch(layer_id, pattern):
                return True
        
        return False
    
    def add_correction(self, layer_id: str, corrected_category: str):
        """Add a manual correction for a specific layer"""
        self.corrections[layer_id] = corrected_category
        print(f"✅ Added correction: {layer_id} → {corrected_category}")
    
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
    
    def save_configuration(self, config: Dict[str, Dict], output_path: str = None):
        """Save the configuration to a file for later use"""
        if output_path is None:
            output_path = "/Users/voldeck/code/mpiq-ai-chat/scripts/automation/layer_categorization_config.json"
        
        with open(output_path, 'w') as f:
            json.dump(config, f, indent=2)
        
        print(f"💾 Configuration saved: {output_path}")
    
    def load_configuration(self, config_path: str) -> Dict[str, Dict]:
        """Load a previously saved configuration"""
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
            
            # Restore operational settings from metadata
            meta = config.get('_meta', {})
            self.excluded_layers = set(meta.get('excluded_layers', []))
            self.corrections = meta.get('corrections', {})
            
            print(f"✅ Configuration loaded: {config_path}")
            return config
            
        except Exception as e:
            print(f"❌ Failed to load configuration: {e}")
            return {}

def main():
    """Interactive demo of enhanced category selector"""
    print("🧪 ENHANCED CATEGORY SELECTOR DEMO")
    print("=" * 50)
    
    selector = EnhancedCategorySelector()
    config = selector.interactive_selection_with_enhancements()
    
    if config:
        print(f"\n🎉 Configuration complete!")
        
        # Offer to save configuration
        if selector._ask_yes_no("\n💾 Save this configuration for reuse?"):
            selector.save_configuration(config)
        
        print(f"\n📋 You can now use this configuration with:")
        print(f"   from enhanced_category_selector import EnhancedCategorySelector")
        print(f"   selector = EnhancedCategorySelector()")
        print(f"   config = selector.load_configuration('layer_categorization_config.json')")
    else:
        print("\n❌ Configuration cancelled")

if __name__ == "__main__":
    main()