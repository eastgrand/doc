#!/usr/bin/env python3
"""
FormulaGenerator - Generate mathematical formulas based on SHAP importance

This module creates data-driven mathematical formulas for scoring algorithms
based on feature importance analysis from SHAP values.
"""

import json
import statistics
from pathlib import Path
from typing import Dict, List, Any, Optional
from importance_analyzer import ImportanceAnalyzer

class DataDrivenFormulaGenerator:
    """Generate mathematical formulas based on SHAP importance"""
    
    def __init__(self, project_root: str = None):
        """Initialize formula generator"""
        self.project_root = Path(project_root) if project_root else Path.cwd()
        self.analyzer = ImportanceAnalyzer(project_root)
        
    def generate_formula(self, analysis_type: str, importance_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create scoring formula from feature importance"""
        
        if not importance_data or 'normalized_weights' not in importance_data:
            print(f"❌ No importance data available for {analysis_type}")
            return {}
            
        print(f"🔧 Generating formula for {analysis_type}...")
        
        normalized_weights = importance_data['normalized_weights']
        field_mappings = importance_data.get('field_mappings', {})
        confidence_metrics = importance_data.get('confidence_metrics', {})
        
        # Generate mathematical formula components
        formula_components = self._create_formula_components(
            analysis_type, normalized_weights, field_mappings, confidence_metrics
        )
        
        # Create weighted formula string
        formula_string = self._create_weighted_formula(formula_components)
        
        # Calculate normalization ranges
        normalization_ranges = self._calculate_normalization_ranges(
            analysis_type, field_mappings
        )
        
        print(f"✅ Generated {len(formula_components)} component formula for {analysis_type}")
        
        return {
            'analysis_type': analysis_type,
            'formula': formula_string,
            'components': formula_components,
            'weights': normalized_weights,
            'field_mappings': field_mappings,
            'normalization_ranges': normalization_ranges,
            'generation_method': 'data_driven_shap',
            'total_components': len(formula_components)
        }
    
    def _create_formula_components(self, analysis_type: str, 
                                 normalized_weights: Dict[str, float], 
                                 field_mappings: Dict[str, Any],
                                 confidence_metrics: Dict[str, float]) -> List[Dict[str, Any]]:
        """Create mathematical formula components from weights"""
        
        components = []
        
        # Sort by weight (highest first)
        sorted_weights = sorted(normalized_weights.items(), key=lambda x: x[1], reverse=True)
        
        for i, (field_name, weight) in enumerate(sorted_weights):
            if weight < 0.01:  # Skip very low weights (< 1%)
                continue
                
            field_info = field_mappings.get(field_name, {})
            confidence = confidence_metrics.get(field_name, 0.5)
            
            # Create component definition
            component = {
                'component_name': f"{analysis_type}_{field_name}_component",
                'field_name': field_name,
                'original_field': field_info.get('original_name', field_name),
                'weight': weight,
                'confidence': confidence,
                'rank': i + 1,
                'normalization_method': self._get_normalization_method(field_name, analysis_type),
                'transformation': self._get_transformation_method(field_name, analysis_type),
                'business_logic': self._get_business_logic(field_name, analysis_type)
            }
            
            components.append(component)
            
        return components
    
    def _create_weighted_formula(self, formula_components: List[Dict[str, Any]]) -> str:
        """Create mathematical formula string from components"""
        
        if not formula_components:
            return "score = 0"
            
        analysis_type = formula_components[0]['component_name'].split('_')[0]
        
        # Create formula string
        formula_parts = []
        
        for component in formula_components:
            weight = component['weight']
            field_name = component['field_name']
            transformation = component['transformation']
            
            # Format component with transformation
            if transformation == 'normalize_0_100':
                component_str = f"({weight:.3f} × {field_name}_normalized)"
            elif transformation == 'log_scale':
                component_str = f"({weight:.3f} × log({field_name}_normalized + 1))"
            elif transformation == 'inverse_scale':
                component_str = f"({weight:.3f} × (100 - {field_name}_normalized))"
            else:
                component_str = f"({weight:.3f} × {field_name}_normalized)"
                
            formula_parts.append(component_str)
        
        # Combine into final formula
        formula = f"{analysis_type}_score = " + " + ".join(formula_parts)
        
        return formula
    
    def _get_normalization_method(self, field_name: str, analysis_type: str) -> str:
        """Determine normalization method for field"""
        
        field_lower = field_name.lower()
        
        # Common normalization patterns
        if any(term in field_lower for term in ['score', 'percentage', 'pct']):
            return 'already_normalized'  # Assume 0-100 scale
        elif any(term in field_lower for term in ['population', 'count', 'total']):
            return 'min_max_scale'  # Scale to 0-100 based on min/max
        elif any(term in field_lower for term in ['income', 'value', 'amount']):
            return 'percentile_scale'  # Scale using percentiles
        elif any(term in field_lower for term in ['rate', 'ratio', 'index']):
            return 'z_score_scale'  # Standardize with z-score
        else:
            return 'min_max_scale'  # Default normalization
    
    def _get_transformation_method(self, field_name: str, analysis_type: str) -> str:
        """Determine transformation method for field"""
        
        field_lower = field_name.lower()
        
        # Transformation patterns based on field type
        if any(term in field_lower for term in ['gap', 'opportunity', 'potential']):
            return 'inverse_scale'  # Higher gap = lower score
        elif any(term in field_lower for term in ['population', 'volume', 'size']):
            return 'log_scale'  # Log transformation for large values
        elif any(term in field_lower for term in ['score', 'advantage', 'strength']):
            return 'normalize_0_100'  # Direct normalization
        else:
            return 'normalize_0_100'  # Default transformation
    
    def _get_business_logic(self, field_name: str, analysis_type: str) -> str:
        """Get business logic explanation for the field"""
        
        field_lower = field_name.lower()
        
        # Business logic patterns
        if 'market' in field_lower and 'share' in field_lower:
            return "Market share indicates competitive position and brand strength"
        elif 'income' in field_lower:
            return "Income levels indicate purchasing power and market opportunity"
        elif 'population' in field_lower:
            return "Population size indicates total market potential"
        elif 'demographic' in field_lower:
            return "Demographic characteristics indicate target market alignment"
        elif 'geographic' in field_lower or 'location' in field_lower:
            return "Geographic factors influence market accessibility and strategy"
        elif 'competition' in field_lower:
            return "Competitive dynamics affect market positioning and opportunity"
        elif 'trend' in field_lower:
            return "Trend indicators show market momentum and future potential"
        else:
            return f"Feature contributes to {analysis_type} analysis through data-driven importance"
    
    def _calculate_normalization_ranges(self, analysis_type: str, 
                                      field_mappings: Dict[str, Any]) -> Dict[str, Dict[str, float]]:
        """Calculate normalization ranges for each field"""
        
        normalization_ranges = {}
        
        for field_name, field_info in field_mappings.items():
            # Default ranges based on field type
            field_lower = field_name.lower()
            
            if any(term in field_lower for term in ['score', 'percentage', 'pct']):
                # Already 0-100 scale
                ranges = {'min': 0, 'max': 100, 'optimal_min': 70, 'optimal_max': 100}
            elif 'population' in field_lower:
                # Population ranges (example)
                ranges = {'min': 0, 'max': 500000, 'optimal_min': 50000, 'optimal_max': 200000}
            elif 'income' in field_lower:
                # Income ranges (example)
                ranges = {'min': 20000, 'max': 200000, 'optimal_min': 60000, 'optimal_max': 150000}
            elif 'share' in field_lower:
                # Market share ranges
                ranges = {'min': 0, 'max': 100, 'optimal_min': 15, 'optimal_max': 40}
            else:
                # Generic ranges
                ranges = {'min': 0, 'max': 100, 'optimal_min': 30, 'optimal_max': 80}
            
            normalization_ranges[field_name] = ranges
            
        return normalization_ranges
    
    def generate_all_formulas(self, importance_matrix: Dict[str, Dict]) -> Dict[str, Dict[str, Any]]:
        """Generate formulas for all analysis types"""
        
        print(f"🔧 Generating formulas for {len(importance_matrix)} analysis types...")
        
        all_formulas = {}
        
        for analysis_type, importance_data in importance_matrix.items():
            formula_config = self.generate_formula(analysis_type, importance_data)
            
            if formula_config:
                all_formulas[analysis_type] = formula_config
                
        print(f"✅ Generated {len(all_formulas)} formula configurations")
        
        return all_formulas
    
    def export_formulas(self, formulas: Dict[str, Dict[str, Any]], 
                       output_path: str = None) -> str:
        """Export formulas to JSON file"""
        
        if not output_path:
            output_path = self.project_root / "scripts" / "scoring" / "generators" / "generated_formulas.json"
        else:
            output_path = Path(output_path)
            
        # Create export data
        export_data = {
            'generation_timestamp': json.dumps({"timestamp": "2025-01-01T00:00:00Z"}),  # Simplified
            'total_formulas': len(formulas),
            'generation_method': 'data_driven_shap_importance',
            'formulas': formulas
        }
        
        # Write to file
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w') as f:
            json.dump(export_data, f, indent=2)
            
        print(f"📄 Exported {len(formulas)} formulas to {output_path}")
        
        return str(output_path)

def main():
    """Test the FormulaGenerator"""
    
    print("🚀 Testing FormulaGenerator...")
    
    generator = DataDrivenFormulaGenerator()
    
    # Test with importance analysis
    print("\n1. Testing importance analysis and formula generation...")
    analyzer = ImportanceAnalyzer()
    importance_matrix = analyzer.analyze_local_shap_importance()
    
    if importance_matrix:
        print(f"✅ Got importance matrix for {len(importance_matrix)} analysis types")
        
        # Test single formula generation
        for analysis_type, importance_data in list(importance_matrix.items())[:2]:
            print(f"\n2. Testing formula generation for {analysis_type}...")
            formula_config = generator.generate_formula(analysis_type, importance_data)
            
            if formula_config:
                print(f"✅ Generated formula for {analysis_type}")
                print(f"   Components: {formula_config.get('total_components', 0)}")
                print(f"   Formula: {formula_config.get('formula', '')[:100]}...")
                
                # Show weights
                weights = formula_config.get('weights', {})
                if weights:
                    top_weight = max(weights.items(), key=lambda x: x[1])
                    print(f"   Top weight: {top_weight[0]} ({top_weight[1]:.3f})")
            
        # Test all formulas generation
        print(f"\n3. Testing generation of all formulas...")
        all_formulas = generator.generate_all_formulas(importance_matrix)
        
        if all_formulas:
            print(f"✅ Generated {len(all_formulas)} formula configurations")
            
            # Test export
            print(f"\n4. Testing formula export...")
            export_path = generator.export_formulas(all_formulas)
            print(f"✅ Exported formulas to {export_path}")
            
    else:
        print("❌ No importance matrix available for testing")
    
    print("\n✅ FormulaGenerator testing complete!")

if __name__ == "__main__":
    main()