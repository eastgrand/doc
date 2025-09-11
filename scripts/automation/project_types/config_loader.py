#!/usr/bin/env python3
"""
Project Type Configuration Loader - Manages project type templates and configurations
Part of the modular project configuration system
"""

import json
from pathlib import Path
from typing import Dict, List, Optional
import logging
from datetime import datetime


class ProjectTypeConfigLoader:
    """
    Loads and manages project type configurations from separate files
    """
    
    def __init__(self, config_dir: Optional[str] = None):
        if config_dir:
            self.config_dir = Path(config_dir)
        else:
            # Default to project_types directory relative to this file
            self.config_dir = Path(__file__).parent
        
        self.logger = logging.getLogger(__name__)
        self._configs_cache = {}
    
    def get_available_project_types(self) -> List[str]:
        """Get list of available project type configurations"""
        try:
            config_files = list(self.config_dir.glob("*.json"))
            return [f.stem for f in config_files if f.name != "config_loader.py"]
        except Exception as e:
            self.logger.error(f"Error getting available project types: {e}")
            return []
    
    def load_project_config(self, project_type: str) -> Dict:
        """Load configuration for a specific project type"""
        
        # Check cache first
        if project_type in self._configs_cache:
            return self._configs_cache[project_type]
        
        config_file = self.config_dir / f"{project_type}.json"
        
        if not config_file.exists():
            self.logger.warning(f"Project type '{project_type}' not found, using default retail")
            config_file = self.config_dir / "retail.json"
            
            if not config_file.exists():
                raise FileNotFoundError(f"No configuration found for '{project_type}' and no default retail config")
        
        try:
            with open(config_file, 'r') as f:
                config = json.load(f)
            
            # Cache the configuration
            self._configs_cache[project_type] = config
            return config
            
        except Exception as e:
            self.logger.error(f"Error loading project config for '{project_type}': {e}")
            raise
    
    def create_project_configuration_template(self, project_path: str, project_type: str = 'retail') -> Dict:
        """Create a project configuration template for a specific project type"""
        
        # Load the project type configuration
        template_config = self.load_project_config(project_type)
        
        # Create the final configuration with metadata
        config = {
            'business_logic': template_config.get('business_logic', {}),
            'algorithm_settings': template_config.get('algorithm_settings', {}),
            'semantic_field_priorities': template_config.get('semantic_field_priorities', {}),
            'project_metadata': {
                'project_type': project_type,
                'created_timestamp': datetime.now().isoformat(),
                'version': template_config.get('configuration_metadata', {}).get('version', '1.0'),
                'template_source': f'{project_type}_template',
                'description': template_config.get('description', 'No description available')
            }
        }
        
        # Save to project directory
        project_path_obj = Path(project_path)
        config_file = project_path_obj / "project_config.json"
        
        try:
            project_path_obj.mkdir(parents=True, exist_ok=True)
            
            with open(config_file, 'w') as f:
                json.dump(config, f, indent=2, default=str)
            
            self.logger.info(f"Created project configuration: {config_file}")
            return config
            
        except Exception as e:
            self.logger.error(f"Error creating project configuration: {e}")
            raise
    
    def get_project_config_summary(self, project_type: str) -> Dict:
        """Get a summary of a project type configuration"""
        try:
            config = self.load_project_config(project_type)
            
            return {
                'project_type': project_type,
                'description': config.get('description', 'No description'),
                'target_income': config.get('business_logic', {}).get('demographic_income_target', 'Not specified'),
                'target_age': config.get('business_logic', {}).get('demographic_age_target', 'Not specified'),
                'market_focus': config.get('configuration_metadata', {}).get('industry_focus', 'Not specified'),
                'semantic_fields': list(config.get('semantic_field_priorities', {}).keys())
            }
            
        except Exception as e:
            self.logger.error(f"Error getting project config summary: {e}")
            return {'error': str(e)}
    
    def list_all_project_types(self) -> Dict[str, Dict]:
        """Get summaries for all available project types"""
        available_types = self.get_available_project_types()
        summaries = {}
        
        for project_type in available_types:
            try:
                summaries[project_type] = self.get_project_config_summary(project_type)
            except Exception as e:
                summaries[project_type] = {'error': str(e)}
        
        return summaries
    
    def validate_project_config(self, project_type: str) -> Dict[str, any]:
        """Validate a project type configuration"""
        try:
            config = self.load_project_config(project_type)
            
            validation_result = {
                'valid': True,
                'errors': [],
                'warnings': []
            }
            
            # Required sections
            required_sections = ['business_logic', 'algorithm_settings', 'semantic_field_priorities']
            for section in required_sections:
                if section not in config:
                    validation_result['errors'].append(f"Missing required section: {section}")
                    validation_result['valid'] = False
            
            # Validate business logic parameters
            if 'business_logic' in config:
                business_logic = config['business_logic']
                required_business_params = [
                    'demographic_income_target', 'demographic_age_target', 
                    'competitive_analysis_weight', 'market_opportunity_weight'
                ]
                
                for param in required_business_params:
                    if param not in business_logic:
                        validation_result['warnings'].append(f"Missing business logic parameter: {param}")
            
            # Validate algorithm settings
            if 'algorithm_settings' in config:
                algo_settings = config['algorithm_settings']
                required_algo_params = [
                    'volatility_penalty_factor', 'market_size_threshold'
                ]
                
                for param in required_algo_params:
                    if param not in algo_settings:
                        validation_result['warnings'].append(f"Missing algorithm setting: {param}")
            
            # Validate semantic field priorities
            if 'semantic_field_priorities' in config:
                priorities = config['semantic_field_priorities']
                recommended_fields = ['consumer_income', 'market_size', 'target_performance']
                
                for field in recommended_fields:
                    if field not in priorities:
                        validation_result['warnings'].append(f"Missing recommended semantic field: {field}")
            
            return validation_result
            
        except Exception as e:
            return {
                'valid': False,
                'errors': [f"Configuration validation failed: {e}"],
                'warnings': []
            }


# Convenience functions for backward compatibility
def get_project_config_loader(config_dir: Optional[str] = None) -> ProjectTypeConfigLoader:
    """Get a project configuration loader instance"""
    return ProjectTypeConfigLoader(config_dir)

def create_project_configuration_template(project_path: str, project_type: str = 'retail') -> Dict:
    """Create a project configuration template - backward compatible function"""
    loader = ProjectTypeConfigLoader()
    return loader.create_project_configuration_template(project_path, project_type)

def get_available_project_types() -> List[str]:
    """Get list of available project types - convenience function"""
    loader = ProjectTypeConfigLoader()
    return loader.get_available_project_types()


if __name__ == "__main__":
    import sys
    
    loader = ProjectTypeConfigLoader()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "list":
            print("Available Project Types:")
            print("=" * 50)
            summaries = loader.list_all_project_types()
            
            for project_type, summary in summaries.items():
                if 'error' in summary:
                    print(f"❌ {project_type}: {summary['error']}")
                else:
                    print(f"✅ {project_type.upper()}")
                    print(f"   Description: {summary['description']}")
                    print(f"   Target Income: ${summary['target_income']:,}")
                    print(f"   Target Age: {summary['target_age']}")
                    print(f"   Industry Focus: {summary['market_focus']}")
                    print(f"   Semantic Fields: {', '.join(summary['semantic_fields'])}")
                    print()
        
        elif command == "validate":
            if len(sys.argv) > 2:
                project_type = sys.argv[2]
                result = loader.validate_project_config(project_type)
                
                print(f"Validation Results for '{project_type}':")
                print("=" * 50)
                print(f"Valid: {'✅' if result['valid'] else '❌'}")
                
                if result['errors']:
                    print("\nErrors:")
                    for error in result['errors']:
                        print(f"  ❌ {error}")
                
                if result['warnings']:
                    print("\nWarnings:")
                    for warning in result['warnings']:
                        print(f"  ⚠️ {warning}")
            else:
                print("Usage: python config_loader.py validate <project_type>")
        
        else:
            print("Usage: python config_loader.py [list|validate <project_type>]")
    
    else:
        print("Available Project Types:")
        types = loader.get_available_project_types()
        for project_type in types:
            print(f"  • {project_type}")