#!/usr/bin/env python3
"""
Semantic Field Resolver - Advanced validation interface for scoring algorithm field mappings
Part of the configurable algorithm engine for multi-project scalability
"""

import json
import pandas as pd
from pathlib import Path
from typing import Dict, List, Any, Optional, Union, Tuple
from datetime import datetime
import logging
import re
from collections import defaultdict

class ScoringAlgorithmFieldResolver:
    """Resolves semantic field names ONLY for scoring algorithms"""
    
    def __init__(self, project_path: str):
        self.project_path = Path(project_path)
        self.logger = logging.getLogger(__name__)
        
        # Load already-mapped field names (from existing field_mappings.json)
        self.available_fields = self._load_available_fields()
        self.raw_field_mappings = self._load_raw_field_mappings()
        self.semantic_config = self._load_or_create_semantic_config()
        
        # Sample data for validation
        self.sample_data = self._load_sample_data()
    
    def get_field(self, semantic_name: str) -> Union[str, List[str], Dict]:
        """Resolve semantic field name to actual field name(s) for scoring algorithms"""
        return self.semantic_config.get(semantic_name, semantic_name)
    
    def _load_available_fields(self) -> List[str]:
        """Load available field names from existing field_mappings.json"""
        mapping_file = self.project_path / "field_mappings.json"
        if mapping_file.exists():
            with open(mapping_file, 'r') as f:
                data = json.load(f)
                # Get the values (mapped field names), not keys (raw field names)
                mappings = data.get('mappings', {})
                if isinstance(mappings, dict) and 'mappings' in mappings:
                    # Handle nested structure
                    return list(mappings['mappings'].values())
                return list(mappings.values())
        return []
    
    def _load_raw_field_mappings(self) -> Dict:
        """Load the complete field mappings for reference"""
        mapping_file = self.project_path / "field_mappings.json"
        if mapping_file.exists():
            with open(mapping_file, 'r') as f:
                return json.load(f)
        return {}
    
    def _load_or_create_semantic_config(self) -> Dict:
        """Load existing semantic config or create empty one"""
        config_file = self.project_path / "semantic_field_config.json"
        if config_file.exists():
            with open(config_file, 'r') as f:
                data = json.load(f)
                return data.get('semantic_mappings', {})
        return {}
    
    def _load_sample_data(self) -> Optional[Dict]:
        """Load sample data for field validation and preview"""
        # Look for endpoint data files to get sample data
        endpoints_dir = self.project_path / "endpoints"
        if endpoints_dir.exists():
            endpoint_files = list(endpoints_dir.glob("*.json"))
            if endpoint_files:
                try:
                    with open(endpoint_files[0], 'r') as f:
                        data = json.load(f)
                        if 'results' in data and len(data['results']) > 0:
                            return data['results'][0]  # First record as sample
                except Exception as e:
                    self.logger.warning(f"Could not load sample data: {e}")
        return None


class SemanticFieldSuggestionEngine:
    """Generates initial semantic field suggestions using ML techniques"""
    
    def __init__(self, field_resolver: ScoringAlgorithmFieldResolver):
        self.resolver = field_resolver
        self.available_fields = field_resolver.available_fields
        
        # Scoring algorithms semantic field requirements
        self.semantic_requirements = {
            'consumer_income': {
                'patterns': ['income', 'earnings', 'median', 'household', 'disposable', 'salary'],
                'importance': 'critical',
                'used_by': ['demographic_scores', 'economic_advantage', 'market_sizing', 'housing_correlation'],
                'expected_range': (20000, 300000),
                'description': 'Income measure for consumer spending power analysis'
            },
            'market_size': {
                'patterns': ['population', 'total', 'residents', 'people', 'pop', 'households'],
                'importance': 'critical',
                'used_by': ['demographic_scores', 'market_scale', 'population_advantage', 'market_sizing'],
                'expected_range': (100, 10000000),
                'description': 'Population/market size for market opportunity calculations'
            },
            'target_performance': {
                'patterns': ['target', 'value', 'share', 'performance', 'thematic', 'strategic'],
                'importance': 'critical',
                'used_by': ['ALL_ALGORITHMS'],
                'expected_range': (0, 100),
                'description': 'Primary performance metric that all algorithms analyze'
            },
            'age_demographics': {
                'patterns': ['age', 'median_age', 'avg_age', 'mean_age'],
                'importance': 'high',
                'used_by': ['demographic_scores', 'housing_correlation', 'segment_scores'],
                'expected_range': (18, 85),
                'description': 'Age demographics for target market analysis'
            },
            'geographic_identifier': {
                'patterns': ['geo', 'id', 'region', 'area', 'location', 'zip', 'postal'],
                'importance': 'medium',
                'used_by': ['data_validation', 'geographic_clustering'],
                'expected_range': None,
                'description': 'Geographic identifier for location-based analysis'
            },
            'wealth_indicator': {
                'patterns': ['wealth', 'index', 'affluence', 'prosperity', 'net_worth'],
                'importance': 'high', 
                'used_by': ['competitive_scores', 'economic_advantage'],
                'expected_range': (0, 1000),
                'description': 'Wealth/affluence measure for purchasing power analysis'
            },
            'household_composition': {
                'patterns': ['household', 'family', 'hh', 'composition', 'size'],
                'importance': 'medium',
                'used_by': ['demographic_scores', 'housing_correlation'],
                'expected_range': (1, 8),
                'description': 'Household composition for demographic profiling'
            }
        }
    
    def generate_suggestions(self) -> Dict[str, Any]:
        """Generate semantic field suggestions with confidence scores"""
        
        suggestions = {
            'semantic_mappings': {},
            'confidence_scores': {},
            'alternatives': {},
            'validation_required': [],
            'missing_requirements': []
        }
        
        for semantic_field, requirements in self.semantic_requirements.items():
            matches = self._find_field_matches(requirements['patterns'])
            
            if matches:
                # Sort by confidence score
                matches_sorted = sorted(matches, key=lambda x: x['confidence'], reverse=True)
                best_match = matches_sorted[0]
                
                suggestions['semantic_mappings'][semantic_field] = best_match['field']
                suggestions['confidence_scores'][semantic_field] = best_match['confidence']
                suggestions['alternatives'][semantic_field] = matches_sorted[1:4]  # Top 3 alternatives
                
                # Flag for validation if confidence is low or multiple good options
                if (best_match['confidence'] < 0.8 or 
                    len([m for m in matches_sorted if m['confidence'] > 0.6]) > 1):
                    suggestions['validation_required'].append(semantic_field)
            else:
                # No matches found
                suggestions['missing_requirements'].append(semantic_field)
                suggestions['validation_required'].append(semantic_field)
        
        return suggestions
    
    def _find_field_matches(self, patterns: List[str]) -> List[Dict]:
        """Find field matches based on semantic patterns"""
        matches = []
        
        for field in self.available_fields:
            confidence = self._calculate_field_confidence(field, patterns)
            if confidence > 0.2:  # Minimum threshold
                matches.append({
                    'field': field,
                    'confidence': confidence,
                    'match_reasons': self._get_match_reasons(field, patterns)
                })
        
        return matches
    
    def _calculate_field_confidence(self, field: str, patterns: List[str]) -> float:
        """Calculate confidence score for field match"""
        field_lower = field.lower()
        confidence = 0.0
        
        # Exact matches
        for pattern in patterns:
            if pattern == field_lower:
                confidence += 0.5
            elif pattern in field_lower:
                confidence += 0.3
            elif field_lower in pattern:
                confidence += 0.2
        
        # Partial matches using edit distance
        for pattern in patterns:
            similarity = self._string_similarity(field_lower, pattern)
            if similarity > 0.7:
                confidence += similarity * 0.2
        
        # Bonus for common field naming patterns
        if any(indicator in field_lower for indicator in ['median', 'total', 'avg', 'mean']):
            confidence += 0.1
        
        return min(confidence, 1.0)
    
    def _string_similarity(self, s1: str, s2: str) -> float:
        """Calculate string similarity using Levenshtein-based approach"""
        from difflib import SequenceMatcher
        return SequenceMatcher(None, s1, s2).ratio()
    
    def _get_match_reasons(self, field: str, patterns: List[str]) -> List[str]:
        """Get human-readable reasons for field match"""
        reasons = []
        field_lower = field.lower()
        
        for pattern in patterns:
            if pattern == field_lower:
                reasons.append(f"Exact match: '{pattern}'")
            elif pattern in field_lower:
                reasons.append(f"Contains: '{pattern}'")
        
        return reasons


class AdvancedSemanticValidator:
    """Full-featured validation interface with all edit scenarios"""
    
    def __init__(self, field_resolver: ScoringAlgorithmFieldResolver):
        self.resolver = field_resolver
        self.suggestion_engine = SemanticFieldSuggestionEngine(field_resolver)
        self.logger = logging.getLogger(__name__)
    
    def interactive_validation(self) -> Dict:
        """Full-featured validation with all edit scenarios"""
        
        print("\n🔧 SEMANTIC FIELD CONFIGURATION")
        print("=" * 60)
        print("Configure how scoring algorithms map to your project's data fields.")
        print("This ensures accurate calculations across all 18+ scoring algorithms.\n")
        
        # Generate initial suggestions
        print("🤖 Generating AI suggestions...")
        suggestions = self.suggestion_engine.generate_suggestions()
        validated_config = suggestions['semantic_mappings'].copy()
        
        if suggestions['validation_required']:
            print(f"⚠️  {len(suggestions['validation_required'])} fields require validation")
        if suggestions['missing_requirements']:
            print(f"❌ {len(suggestions['missing_requirements'])} critical fields not found automatically")
        
        while True:
            self._display_current_config(validated_config)
            
            print("\nValidation Options:")
            print("1. Approve field mapping")
            print("2. Change field mapping") 
            print("3. Add missing semantic field")
            print("4. Remove semantic field")
            print("5. Create composite field (multiple fields)")
            print("6. Set field priority/fallback")
            print("7. Add field transformation")
            print("8. Add custom semantic field type")
            print("9. Preview field data")
            print("10. Validate configuration")
            print("11. Finish and save configuration")
            print("12. Reset to AI suggestions")
            
            try:
                choice = input(f"\nYour choice (1-12): ").strip()
                
                if choice == "1":
                    self._approve_field_mapping(validated_config)
                elif choice == "2":
                    self._change_field_mapping(validated_config)
                elif choice == "3":
                    self._add_missing_field(validated_config)
                elif choice == "4":
                    self._remove_semantic_field(validated_config)
                elif choice == "5":
                    self._create_composite_field(validated_config)
                elif choice == "6":
                    self._set_field_priority(validated_config)
                elif choice == "7":
                    self._add_field_transformation(validated_config)
                elif choice == "8":
                    self._add_custom_semantic_field(validated_config)
                elif choice == "9":
                    self._preview_field_data()
                elif choice == "10":
                    self._validate_configuration(validated_config)
                elif choice == "11":
                    if self._confirm_save(validated_config):
                        break
                elif choice == "12":
                    validated_config = suggestions['semantic_mappings'].copy()
                    print("✅ Reset to AI suggestions")
                else:
                    print("Invalid choice, please try again")
                    
            except KeyboardInterrupt:
                print("\n\n⏹️  Configuration cancelled")
                return None
            except Exception as e:
                print(f"\n❌ Error: {e}")
                self.logger.error(f"Validation error: {e}")
        
        return self._finalize_configuration(validated_config)
    
    def _display_current_config(self, config: Dict):
        """Display current semantic field configuration"""
        
        print(f"\n📋 Current Configuration ({len(config)} fields):")
        print("-" * 60)
        
        if not config:
            print("  No fields configured yet.")
            return
        
        for semantic_field, mapping in config.items():
            usage_info = self._get_algorithms_using_field(semantic_field)
            usage_str = f"({len(usage_info)} algorithms)" if usage_info else "(unused)"
            
            if isinstance(mapping, str):
                print(f"  {semantic_field:20} → {mapping:25} {usage_str}")
            elif isinstance(mapping, dict):
                if mapping.get('type') == 'composite':
                    fields_str = ', '.join(mapping['fields'])
                    print(f"  {semantic_field:20} → [{fields_str}]")
                elif mapping.get('type') == 'calculation':
                    print(f"  {semantic_field:20} → {mapping['formula']}")
                elif mapping.get('type') == 'priority':
                    primary = mapping['primary']
                    fallback = mapping.get('fallback', 'none')
                    print(f"  {semantic_field:20} → {primary} (fallback: {fallback})")
                else:
                    print(f"  {semantic_field:20} → {mapping}")
    
    def _approve_field_mapping(self, config: Dict):
        """Approve one or more field mappings"""
        
        print("\n✅ Approve Field Mappings")
        print("Select fields to approve (or 'all' for everything):")
        
        fields = list(config.keys())
        for i, field in enumerate(fields, 1):
            print(f"{i}. {field}")
        
        selection = input("Enter numbers (comma-separated) or 'all': ").strip()
        
        if selection.lower() == 'all':
            print(f"✅ Approved all {len(config)} field mappings")
            return
        
        try:
            indices = [int(x.strip()) - 1 for x in selection.split(',')]
            approved_fields = [fields[i] for i in indices if 0 <= i < len(fields)]
            print(f"✅ Approved {len(approved_fields)} field mappings: {', '.join(approved_fields)}")
        except ValueError:
            print("❌ Invalid selection format")
    
    def _change_field_mapping(self, config: Dict):
        """Change an existing field mapping"""
        
        print("\n🔄 Change Field Mapping")
        
        if not config:
            print("No fields to change yet.")
            return
        
        fields = list(config.keys())
        print("Select field to change:")
        for i, field in enumerate(fields, 1):
            current = config[field]
            if isinstance(current, str):
                print(f"{i}. {field} → {current}")
            else:
                print(f"{i}. {field} → {current}")
        
        try:
            choice = int(input("Field number: ").strip()) - 1
            if 0 <= choice < len(fields):
                selected_field = fields[choice]
                print(f"\nChanging: {selected_field}")
                self._display_available_fields()
                
                new_mapping = input("New field name: ").strip()
                if self._validate_field_exists(new_mapping):
                    config[selected_field] = new_mapping
                    print(f"✅ Changed: {selected_field} → {new_mapping}")
                else:
                    print(f"❌ Field '{new_mapping}' not found")
        except (ValueError, IndexError):
            print("❌ Invalid selection")
    
    def _add_missing_field(self, config: Dict):
        """Add semantic field that AI missed"""
        
        print("\n➕ Add Missing Semantic Field")
        
        semantic_name = input("New semantic field name: ").strip()
        if not semantic_name:
            print("❌ Empty field name")
            return
        
        if semantic_name in config:
            print(f"❌ Field '{semantic_name}' already exists")
            return
        
        print(f"\nSelect mapping type for '{semantic_name}':")
        print("1. Single field")
        print("2. Multiple fields (composite)")
        print("3. Calculated field (transformation)")
        print("4. Priority-based (with fallback)")
        
        try:
            choice = input("Choice (1-4): ").strip()
            
            if choice == "1":
                self._display_available_fields()
                field_name = input("Field name: ").strip()
                if self._validate_field_exists(field_name):
                    config[semantic_name] = field_name
                    print(f"✅ Added: {semantic_name} → {field_name}")
                    
            elif choice == "2":
                self._create_composite_field_mapping(config, semantic_name)
                
            elif choice == "3":
                self._create_field_transformation(config, semantic_name)
                
            elif choice == "4":
                self._create_priority_field_mapping(config, semantic_name)
            else:
                print("❌ Invalid choice")
                
        except Exception as e:
            print(f"❌ Error adding field: {e}")
    
    def _remove_semantic_field(self, config: Dict):
        """Remove semantic field entirely"""
        
        print("\n🗑️  Remove Semantic Field")
        
        if not config:
            print("No fields to remove.")
            return
        
        fields = list(config.keys())
        print("Select field to remove:")
        for i, field in enumerate(fields, 1):
            algorithms = self._get_algorithms_using_field(field)
            impact = "⚠️ HIGH IMPACT" if len(algorithms) > 5 else "Low impact"
            print(f"{i}. {field} ({impact})")
        
        try:
            choice = int(input("Field number: ").strip()) - 1
            if 0 <= choice < len(fields):
                selected_field = fields[choice]
                algorithms = self._get_algorithms_using_field(selected_field)
                
                print(f"\n⚠️ Removing '{selected_field}' affects {len(algorithms)} algorithms:")
                for alg in algorithms[:5]:  # Show first 5
                    print(f"   • {alg}")
                if len(algorithms) > 5:
                    print(f"   ... and {len(algorithms) - 5} more")
                
                confirm = input("Confirm removal (y/N): ").strip().lower()
                if confirm == 'y':
                    del config[selected_field]
                    print(f"✅ Removed: {selected_field}")
                else:
                    print("Cancelled")
        except (ValueError, IndexError):
            print("❌ Invalid selection")
    
    def _create_composite_field(self, config: Dict):
        """Create composite field from multiple fields"""
        
        print("\n🔗 Create Composite Field")
        semantic_name = input("Composite field name: ").strip()
        
        if semantic_name in config:
            print(f"❌ Field '{semantic_name}' already exists")
            return
        
        self._create_composite_field_mapping(config, semantic_name)
    
    def _create_composite_field_mapping(self, config: Dict, semantic_name: str):
        """Helper to create composite field mapping"""
        
        print(f"\nCreating composite field: {semantic_name}")
        self._display_available_fields()
        
        fields = []
        print("Add fields one by one (type 'done' to finish):")
        
        while True:
            field = input("Add field: ").strip()
            if field.lower() == 'done':
                break
            if self._validate_field_exists(field):
                fields.append(field)
                print(f"  Added: {field}")
            else:
                print(f"  ❌ Field '{field}' not found")
        
        if fields:
            print("\nCombination method:")
            print("1. Sum (field1 + field2 + ...)")
            print("2. Average (mean of all fields)")
            print("3. Maximum (highest value)")
            print("4. Minimum (lowest value)")
            
            method_choice = input("Choice (1-4): ").strip()
            method_map = {'1': 'sum', '2': 'average', '3': 'maximum', '4': 'minimum'}
            method = method_map.get(method_choice, 'sum')
            
            config[semantic_name] = {
                "type": "composite",
                "fields": fields,
                "combination_method": method,
                "created_timestamp": datetime.now().isoformat()
            }
            print(f"✅ Added composite field: {semantic_name} → [{', '.join(fields)}] ({method})")
        else:
            print("❌ No fields added")
    
    def _set_field_priority(self, config: Dict):
        """Set field priority/fallback system"""
        
        print("\n🎯 Set Field Priority/Fallback")
        semantic_name = input("Semantic field name: ").strip()
        
        if semantic_name in config:
            print(f"Updating existing field: {semantic_name}")
        
        self._create_priority_field_mapping(config, semantic_name)
    
    def _create_priority_field_mapping(self, config: Dict, semantic_name: str):
        """Helper to create priority-based field mapping"""
        
        print(f"\nCreating priority mapping for: {semantic_name}")
        self._display_available_fields()
        
        primary = input("Primary field: ").strip()
        if not self._validate_field_exists(primary):
            print(f"❌ Primary field '{primary}' not found")
            return
        
        fallback = input("Fallback field (optional): ").strip()
        if fallback and not self._validate_field_exists(fallback):
            print(f"❌ Fallback field '{fallback}' not found")
            return
        
        last_resort = input("Last resort field (optional): ").strip()
        if last_resort and not self._validate_field_exists(last_resort):
            print(f"❌ Last resort field '{last_resort}' not found")
            return
        
        priority_config = {
            "type": "priority",
            "primary": primary,
            "created_timestamp": datetime.now().isoformat()
        }
        
        if fallback:
            priority_config["fallback"] = fallback
        if last_resort:
            priority_config["last_resort"] = last_resort
        
        config[semantic_name] = priority_config
        print(f"✅ Added priority field: {semantic_name} → {primary}")
        if fallback:
            print(f"   Fallback: {fallback}")
        if last_resort:
            print(f"   Last resort: {last_resort}")
    
    def _add_field_transformation(self, config: Dict):
        """Add field transformation/calculation"""
        
        print("\n🧮 Add Field Transformation")
        semantic_name = input("Calculated field name: ").strip()
        
        if semantic_name in config:
            print(f"❌ Field '{semantic_name}' already exists")
            return
        
        self._create_field_transformation(config, semantic_name)
    
    def _create_field_transformation(self, config: Dict, semantic_name: str):
        """Create calculated field from other fields"""
        
        print(f"\n🧮 Creating calculated field: {semantic_name}")
        print("Available transformation types:")
        print("1. Simple math: field1 + field2")
        print("2. Ratio: field1 / field2") 
        print("3. Percentage: (field1 / field2) * 100")
        print("4. Scale/multiply: field1 * 1000")
        print("5. Custom formula")
        
        transform_type = input("Choice (1-5): ").strip()
        
        self._display_available_fields()
        
        try:
            if transform_type == "1":
                field1 = input("First field: ").strip()
                field2 = input("Second field: ").strip()
                operator = input("Operator (+, -, *, /): ").strip()
                
                if self._validate_field_exists(field1) and self._validate_field_exists(field2):
                    config[semantic_name] = {
                        "type": "calculation",
                        "formula": f"{field1} {operator} {field2}",
                        "fields": [field1, field2],
                        "created_timestamp": datetime.now().isoformat()
                    }
                    print(f"✅ Added calculated field: {semantic_name}")
                
            elif transform_type == "2":
                numerator = input("Numerator field: ").strip()
                denominator = input("Denominator field: ").strip()
                
                if self._validate_field_exists(numerator) and self._validate_field_exists(denominator):
                    config[semantic_name] = {
                        "type": "calculation",
                        "formula": f"{numerator} / {denominator}",
                        "fields": [numerator, denominator],
                        "created_timestamp": datetime.now().isoformat()
                    }
                    print(f"✅ Added ratio field: {semantic_name}")
                
            elif transform_type == "5":
                formula = input("Custom formula (e.g., field1 * 0.8 + field2): ").strip()
                fields_input = input("Required fields (comma-separated): ").strip()
                fields = [f.strip() for f in fields_input.split(',')]
                
                # Validate all fields exist
                valid_fields = [f for f in fields if self._validate_field_exists(f)]
                if valid_fields:
                    config[semantic_name] = {
                        "type": "calculation", 
                        "formula": formula,
                        "fields": valid_fields,
                        "created_timestamp": datetime.now().isoformat()
                    }
                    print(f"✅ Added calculated field: {semantic_name}")
                else:
                    print("❌ No valid fields found")
            else:
                print("❌ Not implemented yet")
                
        except Exception as e:
            print(f"❌ Error creating transformation: {e}")
    
    def _add_custom_semantic_field(self, config: Dict):
        """Add custom semantic field type for project-specific needs"""
        
        print("\n🎨 Add Custom Semantic Field Type")
        
        semantic_name = input("Custom semantic field name: ").strip()
        if semantic_name in config:
            print(f"❌ Field '{semantic_name}' already exists")
            return
        
        description = input("Field description: ").strip()
        
        print("Which algorithms will use this field?")
        print("1. Specific algorithms (list them)")
        print("2. All demographic algorithms") 
        print("3. All competitive algorithms")
        print("4. Custom usage")
        
        usage_choice = input("Choice (1-4): ").strip()
        
        # For now, just create a simple mapping
        self._display_available_fields()
        field_name = input("Map to field: ").strip()
        
        if self._validate_field_exists(field_name):
            config[semantic_name] = {
                "type": "custom",
                "field": field_name,
                "description": description,
                "usage": usage_choice,
                "created_timestamp": datetime.now().isoformat()
            }
            print(f"✅ Added custom field: {semantic_name} → {field_name}")
    
    def _preview_field_data(self):
        """Preview actual field data for validation"""
        
        print("\n👀 Field Data Preview")
        
        if not self.resolver.sample_data:
            print("❌ No sample data available for preview")
            return
        
        print("Available fields in sample data:")
        sample_fields = list(self.resolver.sample_data.keys())
        
        for i, field in enumerate(sample_fields[:20], 1):  # Show first 20
            value = self.resolver.sample_data[field]
            print(f"{i:2}. {field:25} = {value}")
        
        if len(sample_fields) > 20:
            print(f"... and {len(sample_fields) - 20} more fields")
        
        field_name = input("\nEnter field name to preview: ").strip()
        if field_name in self.resolver.sample_data:
            value = self.resolver.sample_data[field_name]
            print(f"\n{field_name}: {value}")
            print(f"Type: {type(value).__name__}")
            
            # Try to provide more context
            if isinstance(value, (int, float)):
                print(f"Numeric value - suitable for calculations")
            elif isinstance(value, str):
                print(f"String value - may need conversion for calculations")
        else:
            print(f"❌ Field '{field_name}' not found in sample data")
    
    def _validate_configuration(self, config: Dict):
        """Validate the current configuration comprehensively"""
        
        print("\n🔍 Validating Configuration...")
        
        validation_results = {
            'valid': True,
            'errors': [],
            'warnings': [],
            'field_usage': {},
            'algorithm_impact': {}
        }
        
        # Check all referenced fields exist
        for semantic_field, mapping in config.items():
            referenced_fields = self._extract_referenced_fields(mapping)
            
            for field in referenced_fields:
                if not self._validate_field_exists(field):
                    validation_results['errors'].append(
                        f"Field '{field}' referenced in '{semantic_field}' does not exist"
                    )
                    validation_results['valid'] = False
        
        # Check algorithm impact
        for semantic_field in config.keys():
            algorithms_affected = self._get_algorithms_using_field(semantic_field)
            validation_results['algorithm_impact'][semantic_field] = algorithms_affected
            
            if not algorithms_affected:
                validation_results['warnings'].append(
                    f"Semantic field '{semantic_field}' is not used by any algorithms"
                )
        
        # Check for critical missing fields
        critical_fields = ['target_performance', 'consumer_income', 'market_size']
        for field in critical_fields:
            if field not in config:
                validation_results['errors'].append(
                    f"Critical field '{field}' is missing - required by multiple algorithms"
                )
                validation_results['valid'] = False
        
        # Display results
        print(f"\n📊 Validation Results:")
        print(f"Status: {'✅ VALID' if validation_results['valid'] else '❌ INVALID'}")
        print(f"Fields configured: {len(config)}")
        
        if validation_results['errors']:
            print(f"\n❌ Errors ({len(validation_results['errors'])}):")
            for error in validation_results['errors']:
                print(f"   • {error}")
        
        if validation_results['warnings']:
            print(f"\n⚠️ Warnings ({len(validation_results['warnings'])}):")
            for warning in validation_results['warnings']:
                print(f"   • {warning}")
        
        # Algorithm impact summary
        total_algorithms = sum(len(algs) for algs in validation_results['algorithm_impact'].values())
        print(f"\n📈 Algorithm Impact: {total_algorithms} algorithm-field connections")
        
        return validation_results
    
    def _confirm_save(self, config: Dict) -> bool:
        """Confirm saving configuration"""
        
        print(f"\n💾 Save Configuration")
        print(f"Ready to save {len(config)} semantic field mappings.")
        
        # Quick validation
        validation_results = self._validate_configuration(config)
        
        if not validation_results['valid']:
            print("⚠️ Configuration has errors. Save anyway?")
        
        confirm = input("Save configuration? (Y/n): ").strip().lower()
        return confirm != 'n'
    
    def _finalize_configuration(self, validated_config: Dict) -> Dict:
        """Finalize and save the validated configuration"""
        
        final_config = {
            'semantic_mappings': validated_config,
            'validation_status': 'approved',
            'validation_timestamp': datetime.now().isoformat(),
            'project_path': str(self.resolver.project_path),
            'total_fields': len(validated_config),
            'generation_metadata': {
                'resolver_version': '1.0',
                'validation_method': 'interactive',
                'available_fields_count': len(self.resolver.available_fields)
            }
        }
        
        # Save configuration
        config_file = self.resolver.project_path / "semantic_field_config.json"
        try:
            with open(config_file, 'w') as f:
                json.dump(final_config, f, indent=2, default=str)
            
            print(f"\n✅ Configuration saved to: {config_file}")
            print(f"📊 {len(validated_config)} semantic fields configured")
            print("🚀 Scoring algorithms can now use semantic field resolution")
            
        except Exception as e:
            print(f"❌ Error saving configuration: {e}")
            return None
        
        return final_config
    
    def _display_available_fields(self):
        """Display available fields from field mappings"""
        
        print(f"\n📋 Available Fields ({len(self.resolver.available_fields)}):")
        
        if not self.resolver.available_fields:
            print("  No fields available. Check field_mappings.json exists.")
            return
        
        for i, field in enumerate(self.resolver.available_fields[:30], 1):  # Show first 30
            print(f"{i:2}. {field}")
        
        if len(self.resolver.available_fields) > 30:
            print(f"... and {len(self.resolver.available_fields) - 30} more fields")
    
    def _validate_field_exists(self, field_name: str) -> bool:
        """Validate that a field exists in available fields"""
        return field_name in self.resolver.available_fields
    
    def _extract_referenced_fields(self, mapping: Union[str, Dict]) -> List[str]:
        """Extract all field names referenced in a mapping"""
        
        if isinstance(mapping, str):
            return [mapping]
        elif isinstance(mapping, dict):
            fields = []
            if mapping.get('type') == 'composite':
                fields.extend(mapping.get('fields', []))
            elif mapping.get('type') == 'calculation':
                fields.extend(mapping.get('fields', []))
            elif mapping.get('type') == 'priority':
                fields.append(mapping.get('primary', ''))
                if mapping.get('fallback'):
                    fields.append(mapping['fallback'])
                if mapping.get('last_resort'):
                    fields.append(mapping['last_resort'])
            elif mapping.get('type') == 'custom':
                fields.append(mapping.get('field', ''))
            return [f for f in fields if f]  # Filter out empty strings
        
        return []
    
    def _get_algorithms_using_field(self, semantic_field: str) -> List[str]:
        """Get list of algorithms that use a specific semantic field"""
        
        # This would be populated from the semantic requirements
        algorithm_usage = {
            'consumer_income': ['demographic_scores', 'economic_advantage', 'market_sizing', 'housing_correlation'],
            'market_size': ['demographic_scores', 'market_scale', 'population_advantage', 'market_sizing'],
            'target_performance': ['ALL_ALGORITHMS'],
            'age_demographics': ['demographic_scores', 'housing_correlation', 'segment_scores'],
            'geographic_identifier': ['data_validation', 'geographic_clustering'],
            'wealth_indicator': ['competitive_scores', 'economic_advantage'],
            'household_composition': ['demographic_scores', 'housing_correlation']
        }
        
        return algorithm_usage.get(semantic_field, [])


def main():
    """Main function for command-line usage"""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python semantic_field_resolver.py <project_path>")
        print("\nExample:")
        print("python semantic_field_resolver.py projects/housing_2025")
        sys.exit(1)
    
    project_path = sys.argv[1]
    
    # Setup logging
    logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
    
    print("🔧 SEMANTIC FIELD RESOLVER")
    print("=" * 60)
    print("Configure semantic field mappings for scoring algorithms")
    print(f"Project: {project_path}\n")
    
    try:
        # Initialize resolver
        field_resolver = ScoringAlgorithmFieldResolver(project_path)
        
        if not field_resolver.available_fields:
            print("❌ No field mappings found. Run automation pipeline first:")
            print("   python run_complete_automation.py")
            sys.exit(1)
        
        print(f"✅ Loaded {len(field_resolver.available_fields)} available fields")
        
        # Run interactive validation
        validator = AdvancedSemanticValidator(field_resolver)
        result = validator.interactive_validation()
        
        if result:
            print(f"\n🎉 Semantic field configuration completed successfully!")
            print(f"✅ {result['total_fields']} fields configured")
            print("\n🚀 Next steps:")
            print("   1. Test scoring algorithms with new field mappings")
            print("   2. Run automated_score_calculator.py to verify results")
        else:
            print("\n⏹️ Configuration cancelled or failed")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        logging.error(f"Fatal error in semantic field resolver: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()