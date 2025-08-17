#!/usr/bin/env python3
"""
AlgorithmValidator - Validate generated scoring algorithms for analysis-specific correctness

This module validates that generated scoring algorithms are appropriate for their
intended analysis type and follow business logic requirements.
"""

import json
from pathlib import Path
from typing import Dict, List, Any, Tuple

class AlgorithmValidator:
    """Validate scoring algorithms for analysis-specific correctness"""
    
    def __init__(self, project_root: str = None):
        """Initialize validator with project root directory"""
        self.project_root = Path(project_root) if project_root else Path.cwd()
        self.validation_rules = self._define_validation_rules()
        
    def _define_validation_rules(self) -> Dict[str, Dict]:
        """Define validation rules for each analysis type (updated for available data)"""
        
        return {
            'strategic_analysis': {
                'min_components': 3,
                'max_components': 7,
                'required_field_types': ['market_penetration', 'thematic_analysis'],
                'preferred_fields': ['mp10', 'thematic', 'genalphacy'],
                'weight_distribution': 'balanced',  # No single component > 40%
                'business_logic': 'Market positioning and strategic opportunity assessment'
            },
            'brand_difference': {
                'min_components': 3,
                'max_components': 5,
                'required_field_types': ['market_penetration'],
                'preferred_fields': ['mp10', 'thematic'],
                'weight_distribution': 'balanced',  # Brand fields should be prominent
                'business_logic': 'Brand comparison and competitive analysis'
            },
            'demographic_insights': {
                'min_components': 3,
                'max_components': 8,
                'required_field_types': ['demographic_data'],
                'preferred_fields': ['genalphacy', 'x14', 'demographic'],
                'weight_distribution': 'balanced',  # Demo fields prioritized
                'business_logic': 'Population and demographic pattern analysis'
            },
            'predictive_modeling': {
                'min_components': 3,
                'max_components': 6,
                'required_field_types': ['market_penetration'],
                'preferred_fields': ['mp10', 'thematic'],
                'weight_distribution': 'balanced',
                'business_logic': 'Forecasting and prediction accuracy assessment'
            },
            'spatial_clusters': {
                'min_components': 3,
                'max_components': 5,
                'required_field_types': ['spatial_data'],
                'preferred_fields': ['shape', 'area', 'location'],
                'weight_distribution': 'balanced',
                'business_logic': 'Geographic clustering and spatial analysis'
            },
            'competitive_analysis': {
                'min_components': 3,
                'max_components': 5,
                'required_field_types': ['market_penetration'],
                'preferred_fields': ['mp10', 'thematic'],
                'weight_distribution': 'balanced',
                'business_logic': 'Competitive landscape and positioning analysis'
            }
        }
    
    def validate_algorithm(self, analysis_type: str, algorithm_config: Dict[str, Any]) -> Dict[str, Any]:
        """Validate a single algorithm configuration"""
        
        validation_result = {
            'analysis_type': analysis_type,
            'is_valid': True,
            'warnings': [],
            'errors': [],
            'recommendations': [],
            'validation_score': 0.0
        }
        
        if analysis_type not in self.validation_rules:
            validation_result['warnings'].append(f"No validation rules defined for {analysis_type}")
            validation_result['validation_score'] = 0.5
            return validation_result
            
        rules = self.validation_rules[analysis_type]
        components = algorithm_config.get('components', [])
        
        # Validate component count
        component_count = len(components)
        if component_count < rules['min_components']:
            validation_result['errors'].append(
                f"Too few components: {component_count} < {rules['min_components']}"
            )
            validation_result['is_valid'] = False
        elif component_count > rules['max_components']:
            validation_result['warnings'].append(
                f"Many components: {component_count} > {rules['max_components']} (may be overfitting)"
            )
            
        # Validate field types
        field_type_score = self._validate_field_types(components, rules, validation_result)
        
        # Validate weight distribution
        weight_dist_score = self._validate_weight_distribution(components, rules, validation_result)
        
        # Validate business logic alignment
        business_score = self._validate_business_logic(components, rules, validation_result)
        
        # Calculate overall validation score
        validation_result['validation_score'] = (field_type_score + weight_dist_score + business_score) / 3
        
        # Add recommendations
        if validation_result['validation_score'] < 0.7:
            validation_result['recommendations'].append("Consider regenerating algorithm with different field selection")
        if not validation_result['errors'] and validation_result['validation_score'] > 0.8:
            validation_result['recommendations'].append("Algorithm meets validation criteria")
            
        return validation_result
    
    def _validate_field_types(self, components: List[Dict], rules: Dict, result: Dict) -> float:
        """Validate that algorithm includes appropriate field types"""
        
        field_names = [comp['field_name'].lower() for comp in components]
        field_text = ' '.join(field_names)
        
        # Check for required field types
        found_types = []
        for required_type in rules['required_field_types']:
            type_patterns = self._get_type_patterns(required_type)
            if any(pattern in field_text for pattern in type_patterns):
                found_types.append(required_type)
                
        missing_types = set(rules['required_field_types']) - set(found_types)
        if missing_types:
            result['warnings'].append(f"Missing field types: {list(missing_types)}")
            
        # Check for preferred fields
        found_preferred = []
        for preferred in rules['preferred_fields']:
            if any(preferred in field_name for field_name in field_names):
                found_preferred.append(preferred)
                
        if len(found_preferred) == 0:
            result['warnings'].append(f"No preferred fields found: {rules['preferred_fields']}")
            
        # Calculate score
        type_score = len(found_types) / len(rules['required_field_types'])
        preferred_score = min(len(found_preferred) / len(rules['preferred_fields']), 1.0)
        
        return (type_score * 0.7 + preferred_score * 0.3)
    
    def _validate_weight_distribution(self, components: List[Dict], rules: Dict, result: Dict) -> float:
        """Validate weight distribution follows expected patterns"""
        
        if not components:
            return 0.0
            
        weights = [comp['weight'] for comp in components]
        max_weight = max(weights)
        min_weight = min(weights)
        weight_range = max_weight - min_weight
        
        distribution_type = rules['weight_distribution']
        
        if distribution_type == 'balanced':
            # No single component should dominate (> 40%)
            if max_weight > 0.4:
                result['warnings'].append(f"Weight distribution unbalanced: max weight {max_weight:.3f} > 0.4")
                return 0.6
            # Weights should be relatively similar
            if weight_range > 0.3:
                result['warnings'].append(f"Large weight variation: range {weight_range:.3f}")
                return 0.7
            return 1.0
            
        elif distribution_type in ['competitive_focused', 'demographic_focused', 'geographic_focused']:
            # Top component should have significant weight but not dominate
            if max_weight < 0.25:
                result['warnings'].append(f"Top component weight too low: {max_weight:.3f} < 0.25")
                return 0.7
            elif max_weight > 0.5:
                result['warnings'].append(f"Top component weight too high: {max_weight:.3f} > 0.5")
                return 0.7
            return 1.0
            
        return 0.8  # Default score for unrecognized distribution type
    
    def _validate_business_logic(self, components: List[Dict], rules: Dict, result: Dict) -> float:
        """Validate that field selection aligns with business logic"""
        
        field_names = [comp['field_name'].lower() for comp in components]
        business_logic = rules['business_logic'].lower()
        
        # Analyze field relevance to business logic
        relevance_score = 0.0
        relevant_fields = 0
        
        for field_name in field_names:
            field_relevance = self._calculate_business_relevance(field_name, business_logic)
            relevance_score += field_relevance
            if field_relevance > 0.5:
                relevant_fields += 1
                
        if relevant_fields == 0:
            result['errors'].append("No fields appear relevant to business logic")
            return 0.0
        elif relevant_fields < len(field_names) / 2:
            result['warnings'].append("Many fields may not be relevant to business logic")
            
        # Average relevance score
        avg_relevance = relevance_score / len(field_names) if field_names else 0.0
        return min(avg_relevance, 1.0)
    
    def _get_type_patterns(self, field_type: str) -> List[str]:
        """Get search patterns for field types (updated for available data)"""
        
        patterns = {
            'market_penetration': ['mp10', 'mp11', 'mp12'],  # Market penetration codes
            'thematic_analysis': ['thematic', 'value'],  # Thematic analysis
            'demographic_data': ['genalphacy', 'x14', 'demographic', 'alpha', 'gen'],  # Demo data
            'spatial_data': ['shape', 'area', 'length', 'lat', 'long', 'coord'],  # Geographic
            'brand_usage': ['mp10', 'brand', 'usage'],  # Brand metrics
            'competitive': ['mp10', 'versus', 'compare'],  # Competitive analysis
            'trend': ['trend', 'growth', 'change'],  # Trend analysis
            'historical': ['historical', 'past', 'baseline'],  # Historical data
            'population': ['pop', 'count', 'size', 'x14']  # Population data
        }
        
        return patterns.get(field_type, [field_type])
    
    def _calculate_business_relevance(self, field_name: str, business_logic: str) -> float:
        """Calculate how relevant a field is to the business logic"""
        
        # Updated relevance scoring for our actual data patterns
        relevance_keywords = {
            'market': ['mp10', 'mp11', 'mp12', 'thematic', 'value'],
            'competitive': ['mp10', 'mp11', 'mp12', 'brand', 'versus'],
            'demographic': ['genalphacy', 'x14', 'alpha', 'gen'],
            'geographic': ['shape', 'area', 'length', 'coord'],
            'strategic': ['mp10', 'thematic', 'value', 'opportunity'],
            'forecasting': ['thematic', 'value', 'mp10', 'trend']
        }
        
        relevance_score = 0.0
        
        for context, keywords in relevance_keywords.items():
            if context in business_logic:
                for keyword in keywords:
                    if keyword in field_name:
                        relevance_score += 0.3
                        
        # Base relevance for our actual data field patterns
        if any(pattern in field_name for pattern in ['mp10', 'mp11', 'mp12']):
            relevance_score += 0.5  # Market penetration codes are highly relevant
        elif any(pattern in field_name for pattern in ['thematic', 'value']):
            relevance_score += 0.4  # Thematic analysis is relevant
        elif any(pattern in field_name for pattern in ['genalphacy', 'x14']):
            relevance_score += 0.4  # Demographic data is relevant
        elif '_p' in field_name:
            relevance_score += 0.3  # Percentage fields are useful
            
        return min(relevance_score, 1.0)
    
    def validate_all_algorithms(self, formulas_config: Dict[str, Dict]) -> Dict[str, Any]:
        """Validate all algorithms in a formulas configuration"""
        
        print(f"🔍 Validating {len(formulas_config)} scoring algorithms...")
        
        validation_summary = {
            'total_algorithms': len(formulas_config),
            'valid_algorithms': 0,
            'algorithms_with_warnings': 0,
            'algorithms_with_errors': 0,
            'average_validation_score': 0.0,
            'detailed_results': {},
            'overall_recommendations': []
        }
        
        total_score = 0.0
        
        for analysis_type, algorithm_config in formulas_config.items():
            validation_result = self.validate_algorithm(analysis_type, algorithm_config)
            validation_summary['detailed_results'][analysis_type] = validation_result
            
            total_score += validation_result['validation_score']
            
            if validation_result['is_valid']:
                validation_summary['valid_algorithms'] += 1
            if validation_result['warnings']:
                validation_summary['algorithms_with_warnings'] += 1
            if validation_result['errors']:
                validation_summary['algorithms_with_errors'] += 1
                
        validation_summary['average_validation_score'] = total_score / len(formulas_config)
        
        # Generate overall recommendations
        if validation_summary['algorithms_with_errors'] > 0:
            validation_summary['overall_recommendations'].append("Some algorithms have critical errors and should be regenerated")
        if validation_summary['average_validation_score'] < 0.7:
            validation_summary['overall_recommendations'].append("Overall validation score is low - consider improving field selection logic")
        elif validation_summary['average_validation_score'] > 0.8:
            validation_summary['overall_recommendations'].append("Algorithms generally meet validation criteria")
            
        print(f"✅ Validation complete: {validation_summary['valid_algorithms']}/{validation_summary['total_algorithms']} algorithms valid")
        print(f"📊 Average score: {validation_summary['average_validation_score']:.3f}")
        
        return validation_summary
    
    def export_validation_report(self, validation_summary: Dict, output_path: str = None) -> str:
        """Export validation results to JSON report"""
        
        if not output_path:
            output_path = self.project_root / "scripts" / "scoring" / "generators" / "validation_report.json"
        else:
            output_path = Path(output_path)
            
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w') as f:
            json.dump(validation_summary, f, indent=2)
            
        print(f"📄 Validation report exported to {output_path}")
        return str(output_path)

def main():
    """Test the AlgorithmValidator"""
    
    print("🚀 Testing AlgorithmValidator...")
    
    validator = AlgorithmValidator()
    
    # Load generated formulas for testing
    formulas_path = Path("generated_formulas.json")
    if not formulas_path.exists():
        print("❌ No generated formulas found for testing")
        return
        
    with open(formulas_path, 'r') as f:
        formulas_data = json.load(f)
        
    formulas_config = formulas_data.get('formulas', {})
    
    if formulas_config:
        print(f"\n1. Testing validation of {len(formulas_config)} algorithms...")
        validation_summary = validator.validate_all_algorithms(formulas_config)
        
        # Show detailed results for a few algorithms
        print("\n2. Sample validation results:")
        for i, (analysis_type, result) in enumerate(list(validation_summary['detailed_results'].items())[:3]):
            print(f"\n   {analysis_type}:")
            print(f"      Valid: {result['is_valid']}")
            print(f"      Score: {result['validation_score']:.3f}")
            if result['warnings']:
                print(f"      Warnings: {len(result['warnings'])}")
            if result['errors']:
                print(f"      Errors: {len(result['errors'])}")
                
        # Export validation report
        print(f"\n3. Testing report export...")
        report_path = validator.export_validation_report(validation_summary)
        print(f"✅ Exported validation report to {report_path}")
        
    else:
        print("❌ No formulas configuration found for testing")
    
    print("\n✅ AlgorithmValidator testing complete!")

if __name__ == "__main__":
    main()