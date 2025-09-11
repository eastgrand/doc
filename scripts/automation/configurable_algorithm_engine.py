#!/usr/bin/env python3
"""
Configurable Algorithm Engine - Integrates semantic field resolution with scoring algorithms
Part of the Phase 3 implementation for unlimited project type scalability
"""

import json
from pathlib import Path
from typing import Dict, List, Any, Optional, Union
import logging
from datetime import datetime
import pandas as pd
import numpy as np

class ConfigurableAlgorithmEngine:
    """
    Enhanced scoring algorithm engine that uses semantic field resolution
    for unlimited project type scalability
    """
    
    def __init__(self, project_path: str = None):
        self.project_path = Path(project_path) if project_path else None
        self.logger = logging.getLogger(__name__)
        
        # Load semantic field resolver if project path provided
        if self.project_path:
            self.semantic_config = self._load_semantic_config()
            self.project_config = self._load_project_config()
        else:
            self.semantic_config = {}
            self.project_config = {}
            self.logger.warning("No project path provided - using fallback field names")
    
    def _load_semantic_config(self) -> Dict:
        """Load semantic field configuration"""
        config_file = self.project_path / "semantic_field_config.json"
        if config_file.exists():
            try:
                with open(config_file, 'r') as f:
                    data = json.load(f)
                    return data.get('semantic_mappings', {})
            except Exception as e:
                self.logger.error(f"Error loading semantic config: {e}")
        return {}
    
    def _load_project_config(self) -> Dict:
        """Load project-specific business logic configuration"""
        config_file = self.project_path / "project_config.json"
        if config_file.exists():
            try:
                with open(config_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                self.logger.error(f"Error loading project config: {e}")
        
        # Return default configuration
        return self._generate_default_project_config()
    
    def _generate_default_project_config(self) -> Dict:
        """Generate default project configuration"""
        return {
            'business_logic': {
                'demographic_income_target': 75000,
                'demographic_age_target': 35,
                'demographic_household_size_target': 3,
                'competitive_analysis_weight': 0.35,
                'market_opportunity_weight': 0.30,
                'data_reliability_weight': 0.20,
                'market_scale_weight': 0.15
            },
            'algorithm_settings': {
                'volatility_penalty_factor': 0.2,
                'uncertainty_penalty_factor': 15,
                'stability_bonus_factor': 10,
                'market_size_threshold': 50000,
                'income_stability_threshold': 75000
            },
            'project_metadata': {
                'project_type': 'unknown',
                'created_timestamp': datetime.now().isoformat(),
                'version': '1.0'
            }
        }
    
    def get_field(self, semantic_name: str, fallback: str = None) -> Union[str, Dict, List]:
        """
        Resolve semantic field name to actual field name(s)
        
        Args:
            semantic_name: Semantic field name (e.g., 'consumer_income')
            fallback: Fallback field name if semantic resolution fails
            
        Returns:
            Field name, field configuration dict, or list of field names
        """
        
        if semantic_name in self.semantic_config:
            mapping = self.semantic_config[semantic_name]
            
            # Handle different mapping types
            if isinstance(mapping, str):
                return mapping
            elif isinstance(mapping, dict):
                mapping_type = mapping.get('type')
                
                if mapping_type == 'priority':
                    # Return primary field, will handle fallback in extraction
                    return mapping.get('primary', fallback or semantic_name)
                elif mapping_type == 'composite':
                    # Return the mapping dict for composite handling
                    return mapping
                elif mapping_type == 'calculation':
                    # Return the mapping dict for calculation handling
                    return mapping
                elif mapping_type == 'custom':
                    return mapping.get('field', fallback or semantic_name)
                else:
                    return mapping
        
        # Fallback to provided fallback or original semantic name
        return fallback or semantic_name
    
    def extract_field_value(self, record: Dict, semantic_name: str, fallback: str = None) -> float:
        """
        Extract field value using semantic resolution with support for all mapping types
        
        Args:
            record: Data record
            semantic_name: Semantic field name
            fallback: Fallback field name
            
        Returns:
            Extracted numeric value
        """
        
        field_mapping = self.get_field(semantic_name, fallback)
        
        # Handle different mapping types
        if isinstance(field_mapping, str):
            # Simple field mapping
            return self._safe_float(record.get(field_mapping, 0))
            
        elif isinstance(field_mapping, dict):
            mapping_type = field_mapping.get('type')
            
            if mapping_type == 'priority':
                # Try fields in priority order
                for priority_level in ['primary', 'fallback', 'last_resort']:
                    if priority_level in field_mapping:
                        field_name = field_mapping[priority_level]
                        value = record.get(field_name)
                        if value is not None and value != 0:
                            return self._safe_float(value)
                return 0.0
                
            elif mapping_type == 'composite':
                # Combine multiple fields
                fields = field_mapping.get('fields', [])
                method = field_mapping.get('combination_method', 'sum')
                
                values = [self._safe_float(record.get(field, 0)) for field in fields]
                valid_values = [v for v in values if v > 0]  # Only positive values
                
                if not valid_values:
                    return 0.0
                
                if method == 'sum':
                    return sum(valid_values)
                elif method == 'average':
                    return sum(valid_values) / len(valid_values)
                elif method == 'maximum':
                    return max(valid_values)
                elif method == 'minimum':
                    return min(valid_values)
                else:
                    return sum(valid_values)  # Default to sum
                    
            elif mapping_type == 'calculation':
                # Calculate field using formula
                return self._calculate_formula(record, field_mapping)
                
            elif mapping_type == 'custom':
                field_name = field_mapping.get('field', semantic_name)
                return self._safe_float(record.get(field_name, 0))
        
        # Fallback
        return self._safe_float(record.get(fallback or semantic_name, 0))
    
    def _calculate_formula(self, record: Dict, field_mapping: Dict) -> float:
        """Calculate value using formula-based field mapping"""
        
        try:
            formula = field_mapping.get('formula', '')
            required_fields = field_mapping.get('fields', [])
            
            # Create a context with field values
            context = {}
            for field in required_fields:
                context[field] = self._safe_float(record.get(field, 0))
            
            # Simple formula evaluation (secure subset)
            # For security, only allow specific operations
            allowed_ops = ['+', '-', '*', '/', '(', ')', '.', ' ']
            if all(c.isalnum() or c == '_' or c in allowed_ops for c in formula):
                # Replace field names with values
                eval_formula = formula
                for field, value in context.items():
                    eval_formula = eval_formula.replace(field, str(value))
                
                # Safe evaluation of mathematical expressions
                result = eval(eval_formula, {"__builtins__": {}}, {})
                return float(result)
            else:
                self.logger.warning(f"Unsafe formula rejected: {formula}")
                return 0.0
                
        except Exception as e:
            self.logger.error(f"Formula calculation error: {e}")
            return 0.0
    
    def get_business_parameter(self, parameter_name: str, default_value: Any = None) -> Any:
        """Get business logic parameter from project configuration"""
        
        business_logic = self.project_config.get('business_logic', {})
        algorithm_settings = self.project_config.get('algorithm_settings', {})
        
        # Check business logic first, then algorithm settings
        if parameter_name in business_logic:
            return business_logic[parameter_name]
        elif parameter_name in algorithm_settings:
            return algorithm_settings[parameter_name]
        else:
            return default_value
    
    def _safe_float(self, value: Any) -> float:
        """Safely convert value to float"""
        try:
            if value is None:
                return 0.0
            return float(value)
        except (ValueError, TypeError):
            return 0.0


class ConfigurableScoreCalculator:
    """
    Enhanced score calculator that uses configurable algorithm engine
    """
    
    def __init__(self, project_path: str = None):
        self.engine = ConfigurableAlgorithmEngine(project_path)
        self.logger = logging.getLogger(__name__)
    
    def calculate_demographic_scores_configurable(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate demographic scores using semantic field resolution"""
        
        results = []
        
        # Get business parameters
        income_target = self.engine.get_business_parameter('demographic_income_target', 75000)
        age_target = self.engine.get_business_parameter('demographic_age_target', 35)
        household_size_target = self.engine.get_business_parameter('demographic_household_size_target', 3)
        
        for record in endpoint_data['results']:
            # Extract values using semantic field resolution
            total_population = self.engine.extract_field_value(record, 'market_size', 'total_population')
            median_income = self.engine.extract_field_value(record, 'consumer_income', 'median_income')
            median_age = self.engine.extract_field_value(record, 'age_demographics', 'median_age')
            household_size = self.engine.extract_field_value(record, 'household_composition', 'household_size')
            
            # Get demographic composition (try semantic fields first)
            asian_population = self.engine.extract_field_value(record, 'asian_demographics', 'asian_population')
            black_population = self.engine.extract_field_value(record, 'black_demographics', 'black_population')
            
            # Calculate diversity score using configurable parameters
            if total_population > 0:
                diversity_score = (
                    (asian_population / total_population) * 30 +
                    (black_population / total_population) * 20 +
                    min(median_income / income_target, 1) * 25 +
                    max(0, 1 - abs(median_age - age_target) / 20) * 15 +
                    min(household_size / household_size_target, 1) * 10
                ) * 100
            else:
                diversity_score = 0
            
            # Population scale bonus
            population_bonus = min(total_population / 10000, 1) * 20
            demographic_opportunity_score = min(diversity_score + population_bonus, 100)
            
            record_copy = record.copy()
            record_copy['demographic_opportunity_score'] = round(demographic_opportunity_score, 2)
            
            # Add debug information about field resolution
            if self.logger.level <= logging.DEBUG:
                record_copy['_debug_field_resolution'] = {
                    'market_size_field': self.engine.get_field('market_size', 'total_population'),
                    'consumer_income_field': self.engine.get_field('consumer_income', 'median_income'),
                    'age_demographics_field': self.engine.get_field('age_demographics', 'median_age')
                }
            
            results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        
        return endpoint_data_copy
    
    def calculate_competitive_scores_configurable(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate competitive scores using semantic field resolution"""
        
        results = []
        records = endpoint_data['results']
        
        # Get business parameters
        competitive_weight = self.engine.get_business_parameter('competitive_analysis_weight', 0.35)
        
        for record in records:
            # Extract values using semantic field resolution
            target_value = self.engine.extract_field_value(record, 'target_performance', 'target_value')
            median_income = self.engine.extract_field_value(record, 'consumer_income', 'median_income')
            total_population = self.engine.extract_field_value(record, 'market_size', 'total_population')
            wealth_index = self.engine.extract_field_value(record, 'wealth_indicator', 'wealth_index')
            
            if target_value <= 0:
                competitive_advantage_score = 0.0
            else:
                # Market dominance (35% weight) - using configurable target field
                market_dominance = min(target_value * 2, 100)  # Scale target value
                
                # Economic advantage (35% weight) - using semantic fields
                economic_advantage = min((median_income / 100000) * 50 + (wealth_index / 200) * 50, 100)
                
                # Population advantage (30% weight) - using semantic field
                population_advantage = min((total_population / 20000) * 100, 100)
                
                # Calculate weighted competitive advantage
                competitive_advantage_score = (
                    competitive_weight * market_dominance +
                    competitive_weight * economic_advantage +
                    (1 - 2 * competitive_weight) * population_advantage  # Remaining weight
                )
                
                competitive_advantage_score = min(competitive_advantage_score, 100)
            
            record_copy = record.copy()
            record_copy['competitive_advantage_score'] = round(competitive_advantage_score, 2)
            results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        
        return endpoint_data_copy
    
    def calculate_risk_scores_configurable(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate risk scores using semantic field resolution and configurable parameters"""
        
        results = []
        records = endpoint_data['results']
        
        # Get configurable parameters
        volatility_factor = self.engine.get_business_parameter('volatility_penalty_factor', 0.2)
        uncertainty_factor = self.engine.get_business_parameter('uncertainty_penalty_factor', 15)
        stability_bonus_factor = self.engine.get_business_parameter('stability_bonus_factor', 10)
        income_threshold = self.engine.get_business_parameter('income_stability_threshold', 75000)
        market_size_threshold = self.engine.get_business_parameter('market_size_threshold', 50000)
        
        # Calculate dataset risk factors
        target_values = []
        for r in records:
            target_val = self.engine.extract_field_value(r, 'target_performance', 'target_value')
            if target_val > 0:
                target_values.append(target_val)
        
        if not target_values:
            # No valid data - assign neutral risk scores
            for record in records:
                record_copy = record.copy()
                record_copy['risk_adjusted_score'] = 50.0
                results.append(record_copy)
        else:
            # Calculate market risk indicators
            market_volatility = self._calculate_volatility(target_values)
            mean_target = sum(target_values) / len(target_values)
            
            for record in records:
                # Extract values using semantic field resolution
                target_value = self.engine.extract_field_value(record, 'target_performance', 'target_value')
                median_income = self.engine.extract_field_value(record, 'consumer_income', 'median_income')
                total_population = self.engine.extract_field_value(record, 'market_size', 'total_population')
                
                if target_value <= 0:
                    risk_adjusted_score = 0.0
                else:
                    # Base opportunity score
                    base_value = min(target_value, 100)
                    
                    # Risk factors (penalties) - using configurable parameters
                    volatility_penalty = min(market_volatility * volatility_factor, 20)
                    
                    # Uncertainty penalty based on deviation from market mean
                    if mean_target > 0:
                        deviation_ratio = abs(target_value - mean_target) / mean_target
                        uncertainty_penalty = min(deviation_ratio * uncertainty_factor, 15)
                    else:
                        uncertainty_penalty = 0
                    
                    # Stability bonuses (positive factors) - using configurable thresholds
                    stability_bonus = 0
                    
                    # Economic stability bonus
                    if median_income > income_threshold:
                        economic_stability = min((median_income - income_threshold) / 25000 * stability_bonus_factor, 10)
                        stability_bonus += economic_stability
                    
                    # Market size stability bonus  
                    if total_population > market_size_threshold:
                        size_stability = min((total_population - market_size_threshold) / 50000 * 5, 5)
                        stability_bonus += size_stability
                    
                    # Calculate final risk-adjusted score
                    risk_adjusted_score = base_value - volatility_penalty - uncertainty_penalty + stability_bonus
                    risk_adjusted_score = max(0, min(100, risk_adjusted_score))
                
                record_copy = record.copy()
                record_copy['risk_adjusted_score'] = round(risk_adjusted_score, 2)
                
                # Add risk breakdown for transparency
                if target_value > 0:
                    record_copy.update({
                        'market_volatility': round(market_volatility, 2),
                        'volatility_penalty': round(volatility_penalty, 2),
                        'uncertainty_penalty': round(uncertainty_penalty, 2),
                        'stability_bonus': round(stability_bonus, 2)
                    })
                
                results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        
        return endpoint_data_copy
    
    def _calculate_volatility(self, values: List[float]) -> float:
        """Calculate volatility (coefficient of variation) for a set of values"""
        if len(values) < 2:
            return 0.0
            
        try:
            mean_val = sum(values) / len(values)
            if mean_val == 0:
                return 0.0
                
            variance = sum((x - mean_val) ** 2 for x in values) / len(values)
            std_dev = variance ** 0.5
            
            # Coefficient of variation as percentage
            volatility = (std_dev / mean_val) * 100
            return min(volatility, 200)  # Cap at 200% volatility
            
        except Exception as e:
            self.logger.error(f"Error calculating volatility: {e}")
            return 0.0


def create_project_configuration_template(project_path: str, project_type: str = 'retail') -> Dict:
    """Create a project configuration template for a specific project type"""
    
    try:
        # First, try using the plugin registry system (most advanced)
        from project_types.plugin_registry import get_plugin_registry
        
        registry = get_plugin_registry()
        available_plugins = registry.get_available_plugins()
        
        if project_type in available_plugins:
            config = registry.create_project_configuration(project_path, project_type)
            print(f"✅ Created {project_type} project configuration using plugin registry")
            return config
        else:
            print(f"⚠️ Plugin '{project_type}' not found in registry, trying external config loader...")
            
    except ImportError:
        print("⚠️ Plugin registry not available, trying external config loader...")
    
    try:
        # Fallback to external configuration loader
        from project_types.config_loader import ProjectTypeConfigLoader
        
        # Use external configuration files
        loader = ProjectTypeConfigLoader()
        config = loader.create_project_configuration_template(project_path, project_type)
        
        print(f"✅ Created {project_type} project configuration using external config files")
        return config
        
    except ImportError:
        # Final fallback to embedded configurations for backward compatibility
        print("⚠️ External config systems not available, using embedded configurations")
        return _create_project_config_embedded(project_path, project_type)


def _create_project_config_embedded(project_path: str, project_type: str = 'retail') -> Dict:
    """Fallback function with embedded configurations for backward compatibility"""
    
    project_configs = {
        'retail': {
            'business_logic': {
                'demographic_income_target': 75000,  # Target consumer income
                'demographic_age_target': 35,        # Prime shopping age
                'demographic_household_size_target': 3,
                'competitive_analysis_weight': 0.35,
                'market_opportunity_weight': 0.30,
                'data_reliability_weight': 0.20,
                'market_scale_weight': 0.15
            },
            'algorithm_settings': {
                'volatility_penalty_factor': 0.2,
                'uncertainty_penalty_factor': 15,
                'stability_bonus_factor': 10,
                'market_size_threshold': 50000,      # Minimum viable market size
                'income_stability_threshold': 75000  # Income for market stability
            },
            'semantic_field_priorities': {
                'consumer_income': ['household_disposable_income', 'median_income', 'average_income'],
                'market_size': ['total_population', 'consumer_population', 'adult_population'],
                'target_performance': ['brand_share', 'market_penetration', 'sales_performance']
            }
        },
        'real_estate': {
            'business_logic': {
                'demographic_income_target': 85000,  # Homebuyer income target
                'demographic_age_target': 40,        # Prime homebuying age
                'demographic_household_size_target': 2.8,
                'competitive_analysis_weight': 0.25, # Less brand competition in real estate
                'market_opportunity_weight': 0.40,   # More focus on market opportunity
                'data_reliability_weight': 0.20,
                'market_scale_weight': 0.15
            },
            'algorithm_settings': {
                'volatility_penalty_factor': 0.15,   # Real estate is less volatile
                'uncertainty_penalty_factor': 12,
                'stability_bonus_factor': 15,        # Reward stability more
                'market_size_threshold': 25000,      # Smaller viable markets
                'income_stability_threshold': 85000  # Higher income threshold
            },
            'semantic_field_priorities': {
                'consumer_income': ['household_income', 'median_family_income', 'median_income'],
                'market_size': ['household_count', 'total_population', 'family_households'],
                'target_performance': ['property_value_index', 'housing_demand', 'market_activity']
            }
        },
        'healthcare': {
            'business_logic': {
                'demographic_income_target': 65000,  # Healthcare affordability
                'demographic_age_target': 50,        # Healthcare usage peaks
                'demographic_household_size_target': 2.5,
                'competitive_analysis_weight': 0.20, # Provider competition
                'market_opportunity_weight': 0.45,   # High focus on patient needs
                'data_reliability_weight': 0.25,     # Data quality critical
                'market_scale_weight': 0.10
            },
            'algorithm_settings': {
                'volatility_penalty_factor': 0.1,    # Healthcare demand is stable
                'uncertainty_penalty_factor': 10,
                'stability_bonus_factor': 20,        # Highly reward stability
                'market_size_threshold': 15000,      # Smaller service areas viable
                'income_stability_threshold': 65000
            },
            'semantic_field_priorities': {
                'consumer_income': ['household_income', 'insurance_coverage_value', 'median_income'],
                'market_size': ['patient_population', 'total_population', 'adult_population'],
                'target_performance': ['patient_satisfaction', 'health_outcomes', 'service_utilization']
            }
        }
    }
    
    if project_type not in project_configs:
        project_type = 'retail'  # Default fallback
    
    config = project_configs[project_type].copy()
    config['project_metadata'] = {
        'project_type': project_type,
        'created_timestamp': datetime.now().isoformat(),
        'version': '1.0',
        'template_source': f'{project_type}_template'
    }
    
    # Save to project directory
    project_path_obj = Path(project_path)
    config_file = project_path_obj / "project_config.json"
    
    try:
        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2, default=str)
        
        print(f"✅ Created {project_type} project configuration: {config_file}")
        return config
        
    except Exception as e:
        print(f"❌ Error creating project configuration: {e}")
        return config


def main():
    """Main function for testing configurable algorithm engine"""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python configurable_algorithm_engine.py <project_path> [project_type]")
        print("\nExamples:")
        print("python configurable_algorithm_engine.py projects/housing_2025")
        print("python configurable_algorithm_engine.py projects/nike_retail retail")
        sys.exit(1)
    
    project_path = sys.argv[1]
    project_type = sys.argv[2] if len(sys.argv) > 2 else 'retail'
    
    # Setup logging
    logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
    
    print("🔧 CONFIGURABLE ALGORITHM ENGINE")
    print("=" * 60)
    print(f"Project: {project_path}")
    print(f"Type: {project_type}")
    
    try:
        # Create project configuration if it doesn't exist
        config_file = Path(project_path) / "project_config.json"
        if not config_file.exists():
            print(f"\n📝 Creating {project_type} project configuration...")
            create_project_configuration_template(project_path, project_type)
        
        # Initialize engine
        print("\n🚀 Initializing configurable algorithm engine...")
        engine = ConfigurableAlgorithmEngine(project_path)
        
        print(f"✅ Engine initialized")
        print(f"   Semantic fields: {len(engine.semantic_config)}")
        print(f"   Business parameters: {len(engine.project_config.get('business_logic', {}))}")
        
        # Test field resolution
        print(f"\n🔍 Testing semantic field resolution:")
        test_fields = ['consumer_income', 'market_size', 'target_performance', 'age_demographics']
        
        for field in test_fields:
            resolved = engine.get_field(field)
            print(f"   {field:20} → {resolved}")
        
        # Test with sample data if available
        sample_data = {'median_income': 75000, 'total_population': 25000, 'target_value': 45.5}
        print(f"\n📊 Testing field extraction:")
        
        for field in test_fields[:3]:  # Test first 3 fields
            value = engine.extract_field_value(sample_data, field)
            print(f"   {field:20} → {value}")
            
        print(f"\n✅ Configurable algorithm engine ready!")
        print(f"   Ready for semantic field-based scoring algorithms")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        logging.error(f"Error in configurable algorithm engine: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()