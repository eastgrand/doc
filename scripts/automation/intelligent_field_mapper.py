#!/usr/bin/env python3
"""
Intelligent Field Mapper - ML-based field name mapping and standardization
Part of the ArcGIS to Microservice Automation Pipeline
"""

import pandas as pd
import numpy as np
import json
from typing import Dict, List, Tuple, Optional, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
import re
from datetime import datetime
import logging
from pathlib import Path
from difflib import SequenceMatcher
import unicodedata

class IntelligentFieldMapper:
    """
    Uses machine learning and NLP techniques to intelligently map ArcGIS field names
    to standardized microservice field names with confidence scoring
    """
    
    def __init__(self):
        """Initialize the field mapper with pre-trained patterns and models"""
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Standard field patterns for different domains
        self.standard_patterns = self._load_standard_patterns()
        
        # Initialize TF-IDF vectorizer for semantic matching
        self.vectorizer = TfidfVectorizer(
            analyzer='char',
            ngram_range=(2, 4),
            lowercase=True,
            max_features=10000,
            stop_words=None
        )
        
        # Field classification models
        self.field_categories = {
            'geographic': ['id', 'geoid', 'zip', 'postal', 'fsa', 'area', 'region', 'location'],
            'demographic': ['pop', 'population', 'age', 'income', 'household', 'education', 'density'],
            'brand': ['nike', 'adidas', 'puma', 'reebok', 'jordan', 'new_balance', 'brand', 'market_share'],
            'score': ['score', 'index', 'rank', 'value', 'rating', 'performance', 'strategic'],
            'descriptive': ['name', 'description', 'label', 'title', 'text'],
            'temporal': ['date', 'time', 'year', 'month', 'period', 'timestamp'],
            'financial': ['income', 'revenue', 'sales', 'price', 'cost', 'value', 'dollar'],
            'percentage': ['pct', 'percent', 'rate', 'ratio', 'share', 'proportion']
        }
        
        # Confidence thresholds
        self.confidence_thresholds = {
            'high': 0.8,
            'medium': 0.6,
            'low': 0.4
        }
        
        # Mapping history for learning
        self.mapping_history = []
        
    def _load_standard_patterns(self) -> Dict[str, List[str]]:
        """Load standard field patterns for different analysis types"""
        
        return {
            'strategic_analysis': [
                'strategic_score', 'strategic_value', 'investment_score', 'opportunity_score',
                'market_potential', 'growth_score', 'strategic_rank'
            ],
            'competitive_analysis': [
                'nike_share', 'adidas_share', 'puma_share', 'competition_index',
                'market_dominance', 'brand_performance', 'competitive_advantage'
            ],
            'demographic_analysis': [
                'total_population', 'median_age', 'median_income', 'household_size',
                'education_level', 'population_density', 'demographic_score'
            ],
            'geographic': [
                'geo_id', 'zip_code', 'postal_code', 'area_id', 'region_id',
                'latitude', 'longitude', 'boundary_id'
            ],
            'descriptive': [
                'area_name', 'description', 'region_name', 'city_name', 'label'
            ]
        }
    
    def analyze_field_structure(self, field_data: List[Dict]) -> Dict[str, Any]:
        """
        Analyze the structure and patterns in field names from extracted data
        
        Args:
            field_data: List of field dictionaries from ArcGIS extraction
            
        Returns:
            Analysis results with patterns, categories, and recommendations
        """
        self.logger.info("🔍 Analyzing field structure and patterns...")
        
        field_names = [field['name'] for field in field_data]
        field_types = {field['name']: field['type'] for field in field_data}
        
        # Basic statistics
        analysis = {
            'total_fields': len(field_names),
            'analysis_timestamp': datetime.now().isoformat(),
            'field_length_stats': {
                'min': min(len(name) for name in field_names),
                'max': max(len(name) for name in field_names),
                'avg': np.mean([len(name) for name in field_names])
            },
            'common_prefixes': self._analyze_prefixes(field_names),
            'common_suffixes': self._analyze_suffixes(field_names),
            'naming_patterns': self._detect_naming_patterns(field_names),
            'field_categories': self._categorize_fields(field_names),
            'data_types': self._analyze_data_types(field_types),
            'quality_issues': self._detect_quality_issues(field_names)
        }
        
        self.logger.info(f"📊 Analysis completed: {analysis['total_fields']} fields analyzed")
        return analysis
    
    def generate_intelligent_mappings(self, field_data: List[Dict], 
                                    target_schema: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Generate intelligent field mappings using ML techniques
        
        Args:
            field_data: List of field dictionaries from extraction
            target_schema: Optional target schema to map to
            
        Returns:
            Dictionary with mappings, confidence scores, and recommendations
        """
        self.logger.info("🤖 Generating intelligent field mappings...")
        
        field_names = [field['name'] for field in field_data]
        
        # Use default target schema if none provided
        if not target_schema:
            target_schema = self._generate_default_schema()
        
        # Prepare text corpus for TF-IDF
        all_texts = field_names + list(target_schema.keys())
        
        # Fit TF-IDF vectorizer
        tfidf_matrix = self.vectorizer.fit_transform(all_texts)
        
        # Split matrices
        source_matrix = tfidf_matrix[:len(field_names)]
        target_matrix = tfidf_matrix[len(field_names):]
        
        # Calculate similarity matrix
        similarity_matrix = cosine_similarity(source_matrix, target_matrix)
        
        # Generate mappings
        mappings = {}
        confidence_scores = {}
        mapping_reasons = {}
        
        for i, source_field in enumerate(field_names):
            # Find best matches
            similarities = similarity_matrix[i]
            best_matches = np.argsort(similarities)[::-1][:3]  # Top 3 matches
            
            best_match_idx = best_matches[0]
            best_score = similarities[best_match_idx]
            target_fields = list(target_schema.keys())
            best_target = target_fields[best_match_idx]
            
            # Apply additional scoring factors
            final_score, reasons = self._calculate_final_score(
                source_field, best_target, best_score, field_data[i]
            )
            
            # Only include mappings above minimum threshold
            if final_score >= self.confidence_thresholds['low']:
                mappings[source_field] = best_target
                confidence_scores[source_field] = final_score
                mapping_reasons[source_field] = reasons
        
        # Generate unmapped fields analysis
        unmapped_fields = [
            field['name'] for field in field_data 
            if field['name'] not in mappings
        ]
        
        # Cluster unmapped fields for pattern analysis
        unmapped_analysis = self._analyze_unmapped_fields(unmapped_fields)
        
        result = {
            'mappings': mappings,
            'confidence_scores': confidence_scores,
            'mapping_reasons': mapping_reasons,
            'statistics': {
                'total_fields': len(field_names),
                'mapped_fields': len(mappings),
                'unmapped_fields': len(unmapped_fields),
                'high_confidence': len([s for s in confidence_scores.values() if s >= self.confidence_thresholds['high']]),
                'medium_confidence': len([s for s in confidence_scores.values() if s >= self.confidence_thresholds['medium'] and s < self.confidence_thresholds['high']]),
                'low_confidence': len([s for s in confidence_scores.values() if s >= self.confidence_thresholds['low'] and s < self.confidence_thresholds['medium']])
            },
            'unmapped_fields': unmapped_fields,
            'unmapped_analysis': unmapped_analysis,
            'quality_recommendations': self._generate_quality_recommendations(mappings, confidence_scores)
        }
        
        self.logger.info(f"✅ Generated {len(mappings)} field mappings")
        self.logger.info(f"   🎯 High confidence: {result['statistics']['high_confidence']}")
        self.logger.info(f"   🎯 Medium confidence: {result['statistics']['medium_confidence']}")
        self.logger.info(f"   🎯 Low confidence: {result['statistics']['low_confidence']}")
        self.logger.info(f"   ❓ Unmapped: {len(unmapped_fields)}")
        
        return result
    
    def _calculate_final_score(self, source_field: str, target_field: str, 
                              base_score: float, field_info: Dict) -> Tuple[float, List[str]]:
        """Calculate final confidence score with multiple factors"""
        
        reasons = []
        score_adjustments = []
        
        # 1. Semantic similarity (base score)
        score = base_score
        reasons.append(f"Semantic similarity: {base_score:.2f}")
        
        # 2. Exact substring match boost
        if source_field.lower() in target_field.lower() or target_field.lower() in source_field.lower():
            score += 0.15
            score_adjustments.append("+0.15 (substring match)")
        
        # 3. Category matching
        source_category = self._get_field_category(source_field)
        target_category = self._get_field_category(target_field)
        
        if source_category == target_category:
            score += 0.1
            score_adjustments.append(f"+0.10 (category: {source_category})")
        
        # 4. Data type compatibility
        if self._are_types_compatible(field_info.get('type', ''), target_field):
            score += 0.05
            score_adjustments.append("+0.05 (type compatible)")
        
        # 5. Common abbreviations and synonyms
        if self._are_synonymous(source_field, target_field):
            score += 0.2
            score_adjustments.append("+0.20 (synonym/abbreviation)")
        
        # 6. Length similarity (very different lengths are suspicious)
        length_ratio = min(len(source_field), len(target_field)) / max(len(source_field), len(target_field))
        if length_ratio < 0.3:
            score -= 0.1
            score_adjustments.append("-0.10 (length mismatch)")
        
        # 7. Special patterns (e.g., Nike-specific fields)
        if self._has_domain_pattern(source_field, target_field):
            score += 0.15
            score_adjustments.append("+0.15 (domain pattern)")
        
        # Ensure score stays within [0, 1] range
        score = max(0, min(1, score))
        
        # Combine reasons
        if score_adjustments:
            reasons.extend(score_adjustments)
        reasons.append(f"Final score: {score:.2f}")
        
        return score, reasons
    
    def _get_field_category(self, field_name: str) -> str:
        """Determine the category of a field based on its name"""
        
        field_lower = field_name.lower()
        
        for category, keywords in self.field_categories.items():
            if any(keyword in field_lower for keyword in keywords):
                return category
        
        return 'unknown'
    
    def _are_types_compatible(self, source_type: str, target_field: str) -> bool:
        """Check if source data type is compatible with target field expectations"""
        
        # ArcGIS type mappings
        numeric_types = ['esriFieldTypeDouble', 'esriFieldTypeInteger', 'esriFieldTypeSingle']
        string_types = ['esriFieldTypeString', 'esriFieldTypeText']
        
        target_lower = target_field.lower()
        
        # Fields that should be numeric
        if any(keyword in target_lower for keyword in ['score', 'value', 'count', 'age', 'income', 'population']):
            return source_type in numeric_types
        
        # Fields that should be string
        if any(keyword in target_lower for keyword in ['name', 'description', 'label', 'id']):
            return source_type in string_types or source_type in numeric_types  # IDs can be numeric
        
        return True  # Default to compatible
    
    def _are_synonymous(self, source_field: str, target_field: str) -> bool:
        """Check if fields are synonymous using common abbreviations and patterns"""
        
        synonyms = {
            'pop': ['population', 'people'],
            'hh': ['household', 'house'],
            'inc': ['income', 'earnings'],
            'pct': ['percent', 'percentage'],
            'desc': ['description', 'name'],
            'geo': ['geographic', 'geography'],
            'mp': ['market_share', 'market'],
            'val': ['value', 'amount']
        }
        
        source_lower = source_field.lower()
        target_lower = target_field.lower()
        
        # Check direct synonyms
        for abbrev, full_words in synonyms.items():
            if abbrev in source_lower:
                if any(word in target_lower for word in full_words):
                    return True
            
            for word in full_words:
                if word in source_lower and abbrev in target_lower:
                    return True
        
        return False
    
    def _has_domain_pattern(self, source_field: str, target_field: str) -> bool:
        """Check for domain-specific patterns (e.g., Nike field patterns)"""
        
        # Nike-specific patterns
        nike_patterns = {
            'mp30034a_b_p': 'nike_share',
            'mp30029a_b_p': 'adidas_share',
            'strategic_value': 'strategic_score'
        }
        
        source_lower = source_field.lower()
        target_lower = target_field.lower()
        
        return nike_patterns.get(source_lower) == target_lower
    
    def _analyze_prefixes(self, field_names: List[str]) -> List[Dict]:
        """Analyze common prefixes in field names"""
        
        prefixes = {}
        for name in field_names:
            # Extract potential prefixes (first 2-5 characters before underscore or number)
            matches = re.findall(r'^([a-zA-Z]{2,5})(?:_|\d|[A-Z])', name)
            for match in matches:
                prefixes[match] = prefixes.get(match, 0) + 1
        
        # Sort by frequency
        sorted_prefixes = sorted(prefixes.items(), key=lambda x: x[1], reverse=True)
        
        return [
            {'prefix': prefix, 'count': count, 'percentage': count / len(field_names) * 100}
            for prefix, count in sorted_prefixes[:10]
        ]
    
    def _analyze_suffixes(self, field_names: List[str]) -> List[Dict]:
        """Analyze common suffixes in field names"""
        
        suffixes = {}
        for name in field_names:
            # Extract potential suffixes
            matches = re.findall(r'([a-zA-Z]{2,5})$', name)
            for match in matches:
                suffixes[match.lower()] = suffixes.get(match.lower(), 0) + 1
        
        sorted_suffixes = sorted(suffixes.items(), key=lambda x: x[1], reverse=True)
        
        return [
            {'suffix': suffix, 'count': count, 'percentage': count / len(field_names) * 100}
            for suffix, count in sorted_suffixes[:10]
        ]
    
    def _detect_naming_patterns(self, field_names: List[str]) -> Dict[str, int]:
        """Detect common naming patterns in field names"""
        
        patterns = {
            'underscore_separated': len([n for n in field_names if '_' in n]),
            'camel_case': len([n for n in field_names if re.search(r'[a-z][A-Z]', n)]),
            'all_uppercase': len([n for n in field_names if n.isupper()]),
            'all_lowercase': len([n for n in field_names if n.islower()]),
            'contains_numbers': len([n for n in field_names if re.search(r'\d', n)]),
            'starts_with_number': len([n for n in field_names if n[0].isdigit()]),
            'contains_special_chars': len([n for n in field_names if re.search(r'[^a-zA-Z0-9_]', n)])
        }
        
        return patterns
    
    def _categorize_fields(self, field_names: List[str]) -> Dict[str, List[str]]:
        """Categorize fields by their likely purpose"""
        
        categorized = {category: [] for category in self.field_categories.keys()}
        categorized['unknown'] = []
        
        for field_name in field_names:
            category = self._get_field_category(field_name)
            categorized[category].append(field_name)
        
        return categorized
    
    def _analyze_data_types(self, field_types: Dict[str, str]) -> Dict[str, int]:
        """Analyze the distribution of data types"""
        
        type_counts = {}
        for field_type in field_types.values():
            type_counts[field_type] = type_counts.get(field_type, 0) + 1
        
        return type_counts
    
    def _detect_quality_issues(self, field_names: List[str]) -> List[Dict]:
        """Detect potential quality issues in field names"""
        
        issues = []
        
        # Very long field names
        long_fields = [name for name in field_names if len(name) > 50]
        if long_fields:
            issues.append({
                'type': 'long_field_names',
                'count': len(long_fields),
                'examples': long_fields[:3]
            })
        
        # Fields with special characters
        special_char_fields = [name for name in field_names if re.search(r'[^a-zA-Z0-9_]', name)]
        if special_char_fields:
            issues.append({
                'type': 'special_characters',
                'count': len(special_char_fields),
                'examples': special_char_fields[:3]
            })
        
        # Duplicate field names (case-insensitive)
        lower_names = [name.lower() for name in field_names]
        duplicates = [name for name in field_names if lower_names.count(name.lower()) > 1]
        if duplicates:
            issues.append({
                'type': 'potential_duplicates',
                'count': len(set(duplicates)),
                'examples': list(set(duplicates))[:3]
            })
        
        return issues
    
    def _analyze_unmapped_fields(self, unmapped_fields: List[str]) -> Dict[str, Any]:
        """Analyze unmapped fields to identify patterns and suggest new targets"""
        
        if not unmapped_fields:
            return {'clusters': [], 'suggestions': []}
        
        # Try to cluster unmapped fields
        if len(unmapped_fields) > 3:
            try:
                # Use TF-IDF to cluster similar field names
                tfidf_matrix = self.vectorizer.transform(unmapped_fields)
                
                n_clusters = min(5, len(unmapped_fields) // 2)
                kmeans = KMeans(n_clusters=n_clusters, random_state=42)
                cluster_labels = kmeans.fit_predict(tfidf_matrix.toarray())
                
                # Group fields by cluster
                clusters = {}
                for i, field in enumerate(unmapped_fields):
                    cluster_id = cluster_labels[i]
                    if cluster_id not in clusters:
                        clusters[cluster_id] = []
                    clusters[cluster_id].append(field)
                
                cluster_analysis = [
                    {
                        'cluster_id': cluster_id,
                        'fields': fields,
                        'suggested_pattern': self._suggest_pattern_from_cluster(fields)
                    }
                    for cluster_id, fields in clusters.items()
                ]
                
            except Exception as e:
                self.logger.warning(f"Clustering failed: {str(e)}")
                cluster_analysis = []
        else:
            cluster_analysis = []
        
        # Generate suggestions for new target fields
        suggestions = []
        for field in unmapped_fields:
            category = self._get_field_category(field)
            if category != 'unknown':
                suggestions.append({
                    'source_field': field,
                    'suggested_target': self._generate_target_suggestion(field, category),
                    'category': category,
                    'confidence': 'manual_review'
                })
        
        return {
            'clusters': cluster_analysis,
            'suggestions': suggestions
        }
    
    def _suggest_pattern_from_cluster(self, fields: List[str]) -> str:
        """Suggest a common pattern from a cluster of similar fields"""
        
        # Find common prefixes/suffixes
        if not fields:
            return "unknown"
        
        # Get common parts
        common_prefix = self._find_common_prefix(fields)
        common_suffix = self._find_common_suffix(fields)
        
        if common_prefix:
            return f"prefix: {common_prefix}"
        elif common_suffix:
            return f"suffix: {common_suffix}"
        else:
            return f"similar_pattern: {len(fields)} fields"
    
    def _find_common_prefix(self, strings: List[str]) -> str:
        """Find the longest common prefix among strings"""
        if not strings:
            return ""
        
        prefix = strings[0]
        for string in strings[1:]:
            while not string.startswith(prefix):
                prefix = prefix[:-1]
                if not prefix:
                    break
        
        return prefix if len(prefix) > 2 else ""
    
    def _find_common_suffix(self, strings: List[str]) -> str:
        """Find the longest common suffix among strings"""
        if not strings:
            return ""
        
        # Reverse strings and find common prefix, then reverse result
        reversed_strings = [s[::-1] for s in strings]
        reversed_suffix = self._find_common_prefix(reversed_strings)
        
        return reversed_suffix[::-1] if len(reversed_suffix) > 2 else ""
    
    def _generate_target_suggestion(self, source_field: str, category: str) -> str:
        """Generate a suggested target field name based on category and field name"""
        
        # Clean and normalize the source field
        clean_name = re.sub(r'[^a-zA-Z0-9_]', '_', source_field.lower())
        clean_name = re.sub(r'_+', '_', clean_name).strip('_')
        
        # Category-specific suggestions
        category_mappings = {
            'brand': lambda x: f"{x.replace('mp', '').replace('nike', 'nike').replace('adidas', 'adidas')}_share",
            'demographic': lambda x: f"{x.replace('pop', 'population').replace('hh', 'household')}_value",
            'score': lambda x: f"{x.replace('val', 'value')}_score",
            'geographic': lambda x: f"geo_{x.replace('id', 'identifier')}",
            'percentage': lambda x: f"{x.replace('pct', 'percent')}_rate"
        }
        
        if category in category_mappings:
            return category_mappings[category](clean_name)
        else:
            return f"{category}_{clean_name}"
    
    def _generate_quality_recommendations(self, mappings: Dict[str, str], 
                                        confidence_scores: Dict[str, float]) -> List[str]:
        """Generate recommendations for improving mapping quality"""
        
        recommendations = []
        
        # Low confidence mappings
        low_confidence = [
            field for field, score in confidence_scores.items() 
            if score < self.confidence_thresholds['medium']
        ]
        
        if low_confidence:
            recommendations.append(
                f"Review {len(low_confidence)} low-confidence mappings manually: {low_confidence[:3]}"
            )
        
        # Check for potential many-to-one mappings
        target_counts = {}
        for target in mappings.values():
            target_counts[target] = target_counts.get(target, 0) + 1
        
        many_to_one = [target for target, count in target_counts.items() if count > 1]
        if many_to_one:
            recommendations.append(
                f"Check {len(many_to_one)} targets with multiple mappings: {many_to_one[:3]}"
            )
        
        # Suggest creating custom patterns for unmapped fields
        if len(mappings) < 0.8:  # Less than 80% mapped
            recommendations.append(
                "Consider creating custom field patterns for better mapping coverage"
            )
        
        return recommendations
    
    def _generate_default_schema(self) -> Dict[str, str]:
        """Generate a default target schema based on common microservice patterns"""
        
        schema = {}
        
        # Add all standard patterns
        for analysis_type, fields in self.standard_patterns.items():
            for field in fields:
                schema[field] = f"Standard {analysis_type} field"
        
        return schema
    
    def save_mapping_results(self, mappings: Dict[str, Any], output_file: str) -> None:
        """Save mapping results to JSON file"""
        
        # Add metadata
        mappings['generation_metadata'] = {
            'timestamp': datetime.now().isoformat(),
            'mapper_version': '1.0',
            'total_mappings': len(mappings.get('mappings', {})),
            'confidence_distribution': {
                'high': len([s for s in mappings.get('confidence_scores', {}).values() if s >= 0.8]),
                'medium': len([s for s in mappings.get('confidence_scores', {}).values() if s >= 0.6 and s < 0.8]),
                'low': len([s for s in mappings.get('confidence_scores', {}).values() if s < 0.6])
            }
        }
        
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w') as f:
            json.dump(mappings, f, indent=2, default=str)
        
        self.logger.info(f"💾 Mapping results saved to: {output_path}")
    
    def create_transformation_script(self, mappings: Dict[str, str], 
                                   output_file: str) -> None:
        """Create a Python script to apply the field mappings"""
        
        script_content = f'''#!/usr/bin/env python3
"""
Auto-generated field transformation script
Generated on: {datetime.now().isoformat()}
"""

import pandas as pd
import json
from typing import Dict, Any

def transform_field_names(data: pd.DataFrame) -> pd.DataFrame:
    """
    Apply intelligent field mappings to transform ArcGIS field names
    to standardized microservice field names
    
    Args:
        data: DataFrame with ArcGIS field names
        
    Returns:
        DataFrame with transformed field names
    """
    
    # Field mapping dictionary
    field_mappings = {json.dumps(mappings, indent=8)}
    
    # Apply mappings
    data_transformed = data.rename(columns=field_mappings)
    
    print(f"Transformed {{len(field_mappings)}} field names")
    print(f"Original columns: {{len(data.columns)}}")
    print(f"Transformed columns: {{len(data_transformed.columns)}}")
    
    return data_transformed

def transform_record(record: Dict[str, Any]) -> Dict[str, Any]:
    """Transform a single record with field mappings"""
    
    field_mappings = {json.dumps(mappings, indent=8)}
    
    transformed_record = {{}}
    for old_field, value in record.items():
        new_field = field_mappings.get(old_field, old_field)
        transformed_record[new_field] = value
    
    return transformed_record

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 3:
        print("Usage: python transform_fields.py input.csv output.csv")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    # Load data
    data = pd.read_csv(input_file)
    print(f"Loaded {{len(data)}} records with {{len(data.columns)}} columns")
    
    # Transform
    transformed_data = transform_field_names(data)
    
    # Save
    transformed_data.to_csv(output_file, index=False)
    print(f"Saved transformed data to {{output_file}}")
'''
        
        script_path = Path(output_file)
        script_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(script_path, 'w') as f:
            f.write(script_content)
        
        # Make script executable
        import os
        os.chmod(script_path, 0o755)
        
        self.logger.info(f"🐍 Transformation script created: {script_path}")


def main():
    """Main function for command-line usage"""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python intelligent_field_mapper.py <extraction_summary.json> [output_dir]")
        print("\nExample:")
        print("python intelligent_field_mapper.py extracted_data/extraction_summary.json mapping_results")
        sys.exit(1)
    
    summary_file = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "mapping_results"
    
    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True, parents=True)
    
    # Load extraction summary
    with open(summary_file, 'r') as f:
        extraction_summary = json.load(f)
    
    # Extract field data
    all_fields = []
    for layer_id, layer_info in extraction_summary['layers'].items():
        if layer_info['status'] == 'success':
            layer_file = Path(layer_info['file_path'])
            if layer_file.exists():
                with open(layer_file, 'r') as f:
                    layer_data = json.load(f)
                all_fields.extend(layer_data['fields'])
    
    print(f"🔍 Analyzing {len(all_fields)} fields from extraction data...")
    
    # Initialize mapper
    mapper = IntelligentFieldMapper()
    
    # Analyze field structure
    print("📊 Analyzing field structure...")
    structure_analysis = mapper.analyze_field_structure(all_fields)
    
    # Generate intelligent mappings
    print("🤖 Generating intelligent mappings...")
    mapping_results = mapper.generate_intelligent_mappings(all_fields)
    
    # Save results
    mapper.save_mapping_results(mapping_results, output_path / "field_mappings.json")
    
    with open(output_path / "field_analysis.json", 'w') as f:
        json.dump(structure_analysis, f, indent=2, default=str)
    
    # Create transformation script
    mapper.create_transformation_script(
        mapping_results['mappings'], 
        output_path / "transform_fields.py"
    )
    
    # Print summary
    print(f"\n✅ Field mapping analysis completed!")
    print(f"📊 {len(all_fields)} fields analyzed")
    print(f"🎯 {len(mapping_results['mappings'])} mappings generated")
    print(f"   High confidence: {mapping_results['statistics']['high_confidence']}")
    print(f"   Medium confidence: {mapping_results['statistics']['medium_confidence']}")
    print(f"   Low confidence: {mapping_results['statistics']['low_confidence']}")
    print(f"❓ {len(mapping_results['unmapped_fields'])} unmapped fields")
    print(f"💾 Results saved to: {output_path}")


if __name__ == "__main__":
    main()