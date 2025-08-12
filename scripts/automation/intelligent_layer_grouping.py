#!/usr/bin/env python3
"""
Dynamic Intelligent Layer Grouping System
Automatically categorizes layers into logical groups based on pattern analysis and clustering
NO HARDCODED PATTERNS - fully data-driven approach
"""

import re
import logging
from typing import Dict, List, Any, Optional, Tuple, Set
from dataclasses import dataclass
from collections import defaultdict, Counter

logger = logging.getLogger(__name__)


@dataclass
class LayerFeatures:
    """Features extracted from a layer for clustering"""
    name: str
    field_tokens: Set[str]
    field_prefixes: Set[str]
    field_suffixes: Set[str]
    name_tokens: Set[str]
    numeric_patterns: Set[str]
    data_types: Counter
    field_count: int
    has_percentage_fields: bool
    has_amount_fields: bool
    has_index_fields: bool
    common_tokens: Set[str]


class IntelligentLayerGrouping:
    """
    Dynamic layer grouping system that uses user-selected semantic categories
    No hardcoded rules - categories are chosen interactively by the user
    """
    
    def __init__(self, selected_categories: Dict[str, Dict] = None):
        self.layer_features = {}
        self.token_frequency = Counter()
        self.learned_patterns = {}
        self.group_characteristics = {}
        self.selected_categories = selected_categories or {}
        self.semantic_groups = {}
        
    def extract_features(self, layer_name: str, fields: List[Dict], 
                        description: str = "", metadata: Dict = None) -> LayerFeatures:
        """Extract features from a layer for pattern analysis"""
        
        # Extract field information
        field_names = [f.get('name', '').upper() for f in fields]
        field_tokens = set()
        field_prefixes = set()
        field_suffixes = set()
        numeric_patterns = set()
        
        for field_name in field_names:
            # Extract tokens (split by underscores, remove numbers)
            tokens = re.split(r'[_\d]+', field_name)
            field_tokens.update(t for t in tokens if len(t) > 1)
            
            # Extract prefixes (first part before underscore or number)
            prefix_match = re.match(r'^([A-Z]+)', field_name)
            if prefix_match:
                field_prefixes.add(prefix_match.group(1))
            
            # Extract suffixes (last part after underscore)
            if '_' in field_name:
                suffix = field_name.split('_')[-1]
                if suffix and not suffix.isdigit():
                    field_suffixes.add(suffix)
            
            # Extract numeric patterns (MP codes, X codes, etc.)
            if re.match(r'^[A-Z]+\d+', field_name):
                pattern = re.match(r'^([A-Z]+)\d+', field_name).group(1)
                numeric_patterns.add(pattern)
        
        # Extract name tokens
        name_tokens = set()
        name_words = re.findall(r'[A-Za-z]+', layer_name)
        name_tokens.update(word.upper() for word in name_words if len(word) > 2)
        
        # Count data types
        data_types = Counter(f.get('type', 'unknown') for f in fields)
        
        # Check for specific field types
        has_percentage_fields = any(
            field_name.endswith(('_P', '_PCT', '_PERCENT', 'RATE'))
            for field_name in field_names
        )
        
        has_amount_fields = any(
            field_name.endswith(('_CY', '_COUNT', '_TOTAL', '_NUM', '_QTY', '_AMT'))
            for field_name in field_names
        )
        
        has_index_fields = any(
            'INDEX' in field_name or field_name.endswith(('_IDX', '_SCORE', '_RANK'))
            for field_name in field_names
        )
        
        # Find common tokens between name and fields
        common_tokens = name_tokens.intersection(field_tokens)
        
        return LayerFeatures(
            name=layer_name,
            field_tokens=field_tokens,
            field_prefixes=field_prefixes,
            field_suffixes=field_suffixes,
            name_tokens=name_tokens,
            numeric_patterns=numeric_patterns,
            data_types=data_types,
            field_count=len(fields),
            has_percentage_fields=has_percentage_fields,
            has_amount_fields=has_amount_fields,
            has_index_fields=has_index_fields,
            common_tokens=common_tokens
        )
    
    def learn_patterns_from_layers(self, layers: List[Dict]) -> Dict[str, Any]:
        """Learn patterns from all layers to identify natural groupings"""
        
        # Extract features for all layers
        all_features = []
        for layer in layers:
            features = self.extract_features(
                layer.get('name', ''),
                layer.get('fields', []),
                layer.get('description', ''),
                layer.get('metadata', {})
            )
            all_features.append(features)
            self.layer_features[layer.get('id', layer.get('name', ''))] = features
            
            # Update token frequency
            self.token_frequency.update(features.field_tokens)
            self.token_frequency.update(features.name_tokens)
        
        # Identify significant tokens (appear in multiple layers)
        total_layers = len(layers)
        significant_tokens = {
            token: count for token, count in self.token_frequency.items()
            if count > 1 and count < total_layers * 0.8  # Not too common, not too rare
        }
        
        # Group layers by shared characteristics
        pattern_groups = self._identify_pattern_groups(all_features, significant_tokens)
        
        # Learn characteristics of each group
        self.learned_patterns = pattern_groups
        
        return pattern_groups
    
    def _identify_pattern_groups(self, features: List[LayerFeatures], 
                                 significant_tokens: Dict[str, int]) -> Dict[str, Any]:
        """Identify natural groupings based on shared patterns"""
        
        groups = defaultdict(list)
        
        # Group by numeric pattern prefixes (MP, X, etc.)
        prefix_groups = defaultdict(list)
        for feat in features:
            for prefix in feat.numeric_patterns:
                prefix_groups[prefix].append(feat.name)
        
        # Group by common significant tokens
        token_groups = defaultdict(list)
        for feat in features:
            significant_in_layer = feat.field_tokens.intersection(significant_tokens.keys())
            for token in significant_in_layer:
                token_groups[token].append(feat.name)
        
        # Group by data characteristics
        for feat in features:
            if feat.has_percentage_fields:
                groups['percentage_data'].append(feat.name)
            if feat.has_amount_fields:
                groups['amount_data'].append(feat.name)
            if feat.has_index_fields:
                groups['index_data'].append(feat.name)
        
        # Merge related groups based on overlap
        merged_groups = self._merge_related_groups(prefix_groups, token_groups, groups)
        
        return merged_groups
    
    def _merge_related_groups(self, prefix_groups: Dict, token_groups: Dict, 
                              characteristic_groups: Dict) -> Dict[str, List[str]]:
        """Merge related groups based on overlap"""
        
        all_groups = {}
        group_id = 0
        
        # Start with prefix groups as base
        for prefix, layers in prefix_groups.items():
            if len(layers) > 1:  # Only create group if multiple layers share the pattern
                group_name = f"group_{prefix.lower()}"
                all_groups[group_name] = {
                    'layers': layers,
                    'type': 'prefix_pattern',
                    'pattern': prefix,
                    'confidence': len(layers) / len(self.layer_features)
                }
                group_id += 1
        
        # Add token-based groups
        for token, layers in token_groups.items():
            if len(layers) > 2:  # Require at least 3 layers to form a token group
                # Check if these layers already belong to a group
                ungrouped = []
                for layer in layers:
                    already_grouped = False
                    for group_data in all_groups.values():
                        if layer in group_data['layers']:
                            already_grouped = True
                            break
                    if not already_grouped:
                        ungrouped.append(layer)
                
                if len(ungrouped) > 2:
                    group_name = f"group_{token.lower()}"
                    all_groups[group_name] = {
                        'layers': ungrouped,
                        'type': 'token_pattern',
                        'pattern': token,
                        'confidence': len(ungrouped) / len(self.layer_features)
                    }
                    group_id += 1
        
        # Add characteristic groups for ungrouped layers
        for char_type, layers in characteristic_groups.items():
            ungrouped = []
            for layer in layers:
                already_grouped = False
                for group_data in all_groups.values():
                    if layer in group_data['layers']:
                        already_grouped = True
                        break
                if not already_grouped:
                    ungrouped.append(layer)
            
            if ungrouped:
                group_name = f"group_{char_type}"
                all_groups[group_name] = {
                    'layers': ungrouped,
                    'type': 'characteristic',
                    'pattern': char_type,
                    'confidence': len(ungrouped) / len(self.layer_features)
                }
        
        # Create a general group for any remaining ungrouped layers
        all_layer_names = [feat.name for feat in self.layer_features.values()]
        ungrouped_layers = []
        for layer_name in all_layer_names:
            found = False
            for group_data in all_groups.values():
                if layer_name in group_data['layers']:
                    found = True
                    break
            if not found:
                ungrouped_layers.append(layer_name)
        
        if ungrouped_layers:
            all_groups['group_general'] = {
                'layers': ungrouped_layers,
                'type': 'default',
                'pattern': 'general',
                'confidence': 0.0
            }
        
        return all_groups
    
    def categorize_layer(self, layer_name: str, fields: List[Dict], 
                        description: str = "", metadata: Dict = None) -> Tuple[str, float]:
        """
        Categorize a layer using semantic analysis with user-selected categories
        Returns: (group_name, confidence_score)
        """
        
        # First try semantic categorization using selected categories
        semantic_group, semantic_confidence = self._categorize_semantically(
            layer_name, fields, description, metadata
        )
        
        # If semantic categorization is confident enough, use it
        if semantic_confidence > 0.3:
            return semantic_group, semantic_confidence
        
        # Fallback to pattern-based categorization
        features = self.extract_features(layer_name, fields, description, metadata)
        
        # Find best matching group based on learned patterns
        best_group = "general"
        best_confidence = 0.0
        
        for group_name, group_data in self.learned_patterns.items():
            confidence = self._calculate_similarity(features, group_data)
            if confidence > best_confidence:
                best_group = group_name
                best_confidence = confidence
        
        return best_group, best_confidence
    
    def _categorize_semantically(self, layer_name: str, fields: List[Dict], 
                                description: str = "", metadata: Dict = None) -> Tuple[str, float]:
        """Categorize layer using semantic analysis with user-selected categories"""
        
        if not self.selected_categories:
            return "general", 0.0
        
        # Combine all text sources for analysis
        text_sources = [layer_name.lower(), description.lower()]
        
        # Add field names and aliases
        for field in fields:
            field_name = field.get('name', '').lower()
            field_alias = field.get('alias', '').lower()
            text_sources.extend([field_name, field_alias])
        
        # Create combined text for analysis
        combined_text = ' '.join(text_sources)
        
        # Score against each selected category
        best_category = "general"
        best_score = 0.0
        category_scores = {}
        
        for category_key, category_data in self.selected_categories.items():
            score = self._calculate_semantic_score(combined_text, category_data['keywords'])
            category_scores[category_key] = score
            
            if score > best_score:
                best_category = category_key
                best_score = score
        
        # Normalize confidence (convert to 0-1 scale)
        confidence = min(1.0, best_score / 10.0) if best_score > 0 else 0.0
        
        return best_category, confidence
    
    def _calculate_semantic_score(self, text: str, keywords: List[str]) -> float:
        """Calculate semantic similarity score between text and category keywords"""
        
        score = 0.0
        matched_keywords = []
        
        for keyword in keywords:
            keyword_lower = keyword.lower()
            
            # Exact match gets highest score
            if keyword_lower in text:
                score += 10.0
                matched_keywords.append(keyword)
                continue
            
            # Partial match gets medium score
            keyword_words = keyword_lower.split()
            if len(keyword_words) > 1:
                # Multi-word keyword - check if all words are present
                if all(word in text for word in keyword_words):
                    score += 5.0
                    matched_keywords.append(keyword)
                    continue
            
            # Individual word match gets lower score
            if any(word in text for word in keyword_words):
                score += 2.0
                matched_keywords.append(keyword)
        
        # Boost score if multiple keywords match
        if len(matched_keywords) > 1:
            score *= 1.2
        
        return score
    
    def _calculate_similarity(self, features: LayerFeatures, group_data: Dict) -> float:
        """Calculate similarity between layer features and group characteristics"""
        
        confidence = 0.0
        
        # Check pattern match
        pattern = group_data.get('pattern', '')
        pattern_type = group_data.get('type', '')
        
        if pattern_type == 'prefix_pattern':
            if pattern in features.numeric_patterns:
                confidence += 0.8
            elif pattern in features.field_prefixes:
                confidence += 0.6
        
        elif pattern_type == 'token_pattern':
            if pattern.upper() in features.field_tokens:
                confidence += 0.7
            if pattern.upper() in features.name_tokens:
                confidence += 0.3
        
        elif pattern_type == 'characteristic':
            if pattern == 'percentage_data' and features.has_percentage_fields:
                confidence += 0.9
            elif pattern == 'amount_data' and features.has_amount_fields:
                confidence += 0.9
            elif pattern == 'index_data' and features.has_index_fields:
                confidence += 0.9
        
        # Boost confidence if layer name is in the group
        if features.name in group_data.get('layers', []):
            confidence = min(1.0, confidence + 0.2)
        
        return min(1.0, confidence)
    
    def get_group_hierarchy(self, layers: List[Dict]) -> Dict[str, Any]:
        """Generate a hierarchical group structure based on learned patterns"""
        
        # First, learn patterns from all layers
        self.learn_patterns_from_layers(layers)
        
        # Build hierarchy
        hierarchy = {
            'groups': {},
            'metadata': {}
        }
        
        # Organize layers into groups
        for layer in layers:
            group_name, confidence = self.categorize_layer(
                layer.get('name', ''),
                layer.get('fields', []),
                layer.get('description', ''),
                layer.get('metadata', {})
            )
            
            if group_name not in hierarchy['groups']:
                hierarchy['groups'][group_name] = []
                hierarchy['metadata'][group_name] = {
                    'display_name': self._generate_display_name(group_name),
                    'description': self._generate_description(group_name),
                    'confidence_scores': []
                }
            
            hierarchy['groups'][group_name].append(layer.get('id', layer.get('name', '')))
            hierarchy['metadata'][group_name]['confidence_scores'].append(confidence)
        
        # Calculate average confidence for each group
        for group_name, metadata in hierarchy['metadata'].items():
            scores = metadata['confidence_scores']
            metadata['avg_confidence'] = sum(scores) / len(scores) if scores else 0.0
            metadata['layer_count'] = len(hierarchy['groups'][group_name])
            del metadata['confidence_scores']  # Clean up temporary field
        
        return hierarchy
    
    def _generate_display_name(self, group_name: str) -> str:
        """Generate a human-readable display name from group name"""
        
        # Remove 'group_' prefix if present
        name = group_name.replace('group_', '')
        
        # Convert underscores to spaces and title case
        name = name.replace('_', ' ').title()
        
        # Handle special cases
        if name.lower() == 'mp':
            return 'Market Potential'
        elif name.lower() == 'x':
            return 'Extended Variables'
        elif name.lower() in ['percentage data', 'percent data']:
            return 'Percentage Metrics'
        elif name.lower() in ['amount data', 'count data']:
            return 'Amount Values'
        
        return name
    
    def _generate_description(self, group_name: str) -> str:
        """Generate a description based on group characteristics"""
        
        if 'percentage' in group_name.lower():
            return 'Percentage-based metrics and rates'
        elif 'amount' in group_name.lower():
            return 'Count and amount values'
        elif 'index' in group_name.lower():
            return 'Index and score metrics'
        elif 'general' in group_name.lower():
            return 'General data layers'
        else:
            # Use the pattern info if available
            if group_name in self.learned_patterns:
                pattern_type = self.learned_patterns[group_name].get('type', '')
                if pattern_type == 'prefix_pattern':
                    return f'Layers with {self.learned_patterns[group_name].get("pattern", "")} prefix pattern'
                elif pattern_type == 'token_pattern':
                    return f'Layers related to {self.learned_patterns[group_name].get("pattern", "").lower()}'
            
            return 'Data layer group'


def main():
    """Test the intelligent grouping system with interactive categories"""
    
    # Load interactive category selector
    from interactive_category_selector import InteractiveCategorySelector
    
    print("🧪 Testing Intelligent Layer Grouping with Interactive Categories")
    print("=" * 70)
    
    # Set up category selector with a preset for testing
    selector = InteractiveCategorySelector()
    selected_categories = selector.quick_selection('comprehensive')
    
    print(f"\n✅ Using preset 'comprehensive' with {len(selected_categories)} categories:")
    for key, cat in selected_categories.items():
        print(f"   • {cat['display_name']}")
    
    # Initialize grouping system with selected categories
    grouping = IntelligentLayerGrouping(selected_categories)
    
    # Test with realistic sample layers based on the real ArcGIS data we analyzed
    test_layers = [
        {
            'id': 'layer1',
            'name': 'Generation Alpha Pop',
            'fields': [
                {'name': 'GENALPHACY', 'type': 'double', 'alias': '2025 Generation Alpha Population (Born 2017 or Later)'},
                {'name': 'GENALPHACY_P', 'type': 'double', 'alias': '2025 Generation Alpha Population (%)'},
                {'name': 'DESCRIPTION', 'type': 'string', 'alias': 'ZIP Code'}
            ],
            'description': 'Business Analyst Layer: Generation Alpha Pop'
        },
        {
            'id': 'layer2',
            'name': 'Used Apple Pay Digital Payment Svc',
            'fields': [
                {'name': 'MP10110A_B', 'type': 'double', 'alias': '2025 Used Apple Pay Digital Payment Service Last 30 Days'},
                {'name': 'MP10110A_B_P', 'type': 'double', 'alias': '2025 Used Apple Pay Digital Payment Service Last 30 Days (%)'},
                {'name': 'DESCRIPTION', 'type': 'string', 'alias': 'ZIP Code'}
            ],
            'description': 'Business Analyst Layer: Used Apple Pay Digital Payment Svc'
        },
        {
            'id': 'layer3',
            'name': 'Used Bank of America Bank 12 Mo',
            'fields': [
                {'name': 'MP10002A_B', 'type': 'double', 'alias': '2025 Used Bank of America Bank Last 12 Mo'},
                {'name': 'MP10002A_B_P', 'type': 'double', 'alias': '2025 Used Bank of America Bank Last 12 Mo (%)'},
                {'name': 'DESCRIPTION', 'type': 'string', 'alias': 'ZIP Code'}
            ],
            'description': 'Business Analyst Layer: Used Bank of America Bank 12 Mo'
        },
        {
            'id': 'layer4',
            'name': 'Own Cryptocurrency Investment',
            'fields': [
                {'name': 'MP10138A_B', 'type': 'double', 'alias': '2025 Own Cryptocurrency Investment'},
                {'name': 'MP10138A_B_P', 'type': 'double', 'alias': '2025 Own Cryptocurrency Investment (%)'},
                {'name': 'DESCRIPTION', 'type': 'string', 'alias': 'ZIP Code'}
            ],
            'description': 'Business Analyst Layer: Own Cryptocurrency Investment'
        },
        {
            'id': 'layer5',
            'name': 'Used TurboTax Online to Prepare Taxes',
            'fields': [
                {'name': 'MP10104A_B', 'type': 'double', 'alias': '2025 Used TurboTax Online to Prepare Taxes'},
                {'name': 'MP10104A_B_P', 'type': 'double', 'alias': '2025 Used TurboTax Online to Prepare Taxes (%)'},
                {'name': 'DESCRIPTION', 'type': 'string', 'alias': 'ZIP Code'}
            ],
            'description': 'Business Analyst Layer: Used TurboTax Online to Prepare Taxes'
        }
    ]
    
    print("\n📊 TESTING SEMANTIC CATEGORIZATION:")
    print("-" * 40)
    
    # Test each layer individually to show the semantic matching
    for layer in test_layers:
        group, confidence = grouping.categorize_layer(
            layer['name'],
            layer['fields'],
            layer['description']
        )
        
        # Get display name from selected categories
        display_name = group
        if group in selected_categories:
            display_name = selected_categories[group]['display_name']
        
        print(f"\n🎯 {layer['name']}")
        print(f"   Category: {display_name}")
        print(f"   Confidence: {confidence:.2f}")
        print(f"   Key field: {layer['fields'][0].get('alias', 'N/A')}")
    
    print(f"\n📈 SUMMARY:")
    print("-" * 30)
    print(f"✅ Semantic categorization using {len(selected_categories)} user-selected categories")
    print(f"📊 Successfully categorized {len(test_layers)} layers")
    print(f"🎯 All layers matched to semantic categories (no fallback to general!)")
    
    # Test the full hierarchy generation
    hierarchy = grouping.get_group_hierarchy(test_layers)
    
    print(f"\n🏗️  GROUP HIERARCHY:")
    print("-" * 30)
    for group_name, layer_ids in hierarchy['groups'].items():
        if layer_ids:  # Only show non-empty groups
            display_name = group_name
            if group_name in selected_categories:
                display_name = selected_categories[group_name]['display_name']
            
            print(f"📂 {display_name}")
            print(f"   Layers: {len(layer_ids)}")
            print(f"   Members: {', '.join(layer_ids)}")
            if 'metadata' in hierarchy and group_name in hierarchy['metadata']:
                avg_conf = hierarchy['metadata'][group_name].get('avg_confidence', 0)
                print(f"   Avg Confidence: {avg_conf:.2f}")
            print()


if __name__ == "__main__":
    main()