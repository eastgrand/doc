#!/usr/bin/env python3
"""
Plugin Registration System - Manages dynamic registration of project types and extensions
Part of the modular semantic field resolution system
"""

import json
import importlib.util
from pathlib import Path
from typing import Dict, List, Optional, Callable, Any
import logging
from datetime import datetime


class ProjectTypePlugin:
    """Base class for project type plugins"""
    
    def __init__(self, name: str, config_path: str = None):
        self.name = name
        self.config_path = config_path
        self.logger = logging.getLogger(__name__)
    
    def get_configuration(self) -> Dict:
        """Get the project type configuration - to be implemented by plugins"""
        raise NotImplementedError("Plugins must implement get_configuration()")
    
    def validate_configuration(self) -> Dict[str, any]:
        """Validate the project type configuration - can be overridden"""
        try:
            config = self.get_configuration()
            
            # Basic validation
            required_sections = ['business_logic', 'algorithm_settings', 'semantic_field_priorities']
            errors = []
            warnings = []
            
            for section in required_sections:
                if section not in config:
                    errors.append(f"Missing required section: {section}")
            
            return {
                'valid': len(errors) == 0,
                'errors': errors,
                'warnings': warnings
            }
            
        except Exception as e:
            return {
                'valid': False,
                'errors': [f"Configuration validation failed: {e}"],
                'warnings': []
            }
    
    def get_metadata(self) -> Dict:
        """Get plugin metadata - can be overridden"""
        return {
            'name': self.name,
            'type': 'project_type',
            'version': '1.0',
            'description': f'Project type plugin for {self.name}'
        }


class JSONProjectTypePlugin(ProjectTypePlugin):
    """Plugin implementation for JSON-based project types"""
    
    def __init__(self, name: str, json_file_path: str):
        super().__init__(name, json_file_path)
        self.json_file = Path(json_file_path)
    
    def get_configuration(self) -> Dict:
        """Load configuration from JSON file"""
        if not self.json_file.exists():
            raise FileNotFoundError(f"JSON configuration file not found: {self.json_file}")
        
        try:
            with open(self.json_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            raise ValueError(f"Error loading JSON configuration: {e}")
    
    def get_metadata(self) -> Dict:
        """Get metadata from JSON configuration"""
        try:
            config = self.get_configuration()
            metadata = super().get_metadata()
            
            # Extract metadata from configuration
            config_metadata = config.get('configuration_metadata', {})
            metadata.update({
                'description': config.get('description', metadata['description']),
                'version': config_metadata.get('version', metadata['version']),
                'industry_focus': config_metadata.get('industry_focus', 'Not specified'),
                'target_demographics': config_metadata.get('target_demographics', 'Not specified')
            })
            
            return metadata
            
        except Exception as e:
            self.logger.error(f"Error getting metadata for {self.name}: {e}")
            return super().get_metadata()


class PluginRegistry:
    """
    Registry for managing project type plugins and extensions
    """
    
    def __init__(self, plugin_dir: Optional[str] = None):
        if plugin_dir:
            self.plugin_dir = Path(plugin_dir)
        else:
            # Default to current directory (project_types)
            self.plugin_dir = Path(__file__).parent
        
        self.logger = logging.getLogger(__name__)
        self.plugins: Dict[str, ProjectTypePlugin] = {}
        self.plugin_hooks: Dict[str, List[Callable]] = {}
        
        # Auto-register plugins on initialization
        self._auto_register_plugins()
    
    def _auto_register_plugins(self):
        """Automatically register plugins from JSON files and Python modules"""
        
        # Register JSON-based plugins
        json_files = list(self.plugin_dir.glob("*.json"))
        for json_file in json_files:
            if json_file.name not in ['README.md', 'config_loader.py', 'plugin_registry.py']:
                project_type = json_file.stem
                self.register_json_plugin(project_type, str(json_file))
        
        # Register Python-based plugins (for future extensibility)
        self._discover_python_plugins()
    
    def _discover_python_plugins(self):
        """Discover and register Python-based plugins"""
        plugin_files = list(self.plugin_dir.glob("*_plugin.py"))
        
        for plugin_file in plugin_files:
            try:
                module_name = plugin_file.stem
                spec = importlib.util.spec_from_file_location(module_name, plugin_file)
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                
                # Look for plugin classes
                if hasattr(module, 'get_plugin'):
                    plugin = module.get_plugin()
                    if isinstance(plugin, ProjectTypePlugin):
                        self.register_plugin(plugin.name, plugin)
                        self.logger.info(f"Registered Python plugin: {plugin.name}")
                
            except Exception as e:
                self.logger.error(f"Error loading Python plugin {plugin_file}: {e}")
    
    def register_plugin(self, name: str, plugin: ProjectTypePlugin):
        """Register a project type plugin"""
        if not isinstance(plugin, ProjectTypePlugin):
            raise ValueError("Plugin must inherit from ProjectTypePlugin")
        
        self.plugins[name] = plugin
        self.logger.info(f"Registered plugin: {name}")
        
        # Trigger registration hooks
        self._trigger_hooks('plugin_registered', plugin)
    
    def register_json_plugin(self, name: str, json_file_path: str):
        """Register a JSON-based project type plugin"""
        plugin = JSONProjectTypePlugin(name, json_file_path)
        self.register_plugin(name, plugin)
    
    def get_plugin(self, name: str) -> Optional[ProjectTypePlugin]:
        """Get a registered plugin by name"""
        return self.plugins.get(name)
    
    def get_available_plugins(self) -> List[str]:
        """Get list of available plugin names"""
        return list(self.plugins.keys())
    
    def get_plugin_configuration(self, name: str) -> Dict:
        """Get configuration for a specific plugin"""
        plugin = self.get_plugin(name)
        if not plugin:
            raise ValueError(f"Plugin '{name}' not found")
        
        return plugin.get_configuration()
    
    def get_plugin_metadata(self, name: str) -> Dict:
        """Get metadata for a specific plugin"""
        plugin = self.get_plugin(name)
        if not plugin:
            raise ValueError(f"Plugin '{name}' not found")
        
        return plugin.get_metadata()
    
    def validate_plugin(self, name: str) -> Dict[str, any]:
        """Validate a specific plugin"""
        plugin = self.get_plugin(name)
        if not plugin:
            return {
                'valid': False,
                'errors': [f"Plugin '{name}' not found"],
                'warnings': []
            }
        
        return plugin.validate_configuration()
    
    def list_plugins(self) -> Dict[str, Dict]:
        """Get summary information for all plugins"""
        plugin_info = {}
        
        for name, plugin in self.plugins.items():
            try:
                metadata = plugin.get_metadata()
                validation = plugin.validate_configuration()
                
                plugin_info[name] = {
                    'metadata': metadata,
                    'valid': validation['valid'],
                    'errors': validation.get('errors', []),
                    'warnings': validation.get('warnings', [])
                }
                
            except Exception as e:
                plugin_info[name] = {
                    'error': str(e),
                    'valid': False
                }
        
        return plugin_info
    
    def add_hook(self, event: str, callback: Callable):
        """Add a hook for plugin events"""
        if event not in self.plugin_hooks:
            self.plugin_hooks[event] = []
        
        self.plugin_hooks[event].append(callback)
    
    def _trigger_hooks(self, event: str, *args, **kwargs):
        """Trigger hooks for a specific event"""
        if event in self.plugin_hooks:
            for callback in self.plugin_hooks[event]:
                try:
                    callback(*args, **kwargs)
                except Exception as e:
                    self.logger.error(f"Error in hook callback for '{event}': {e}")
    
    def create_project_configuration(self, project_path: str, plugin_name: str) -> Dict:
        """Create a project configuration using a registered plugin"""
        plugin = self.get_plugin(plugin_name)
        if not plugin:
            raise ValueError(f"Plugin '{plugin_name}' not found")
        
        # Get the base configuration from the plugin
        base_config = plugin.get_configuration()
        
        # Create the final project configuration
        config = {
            'business_logic': base_config.get('business_logic', {}),
            'algorithm_settings': base_config.get('algorithm_settings', {}),
            'semantic_field_priorities': base_config.get('semantic_field_priorities', {}),
            'project_metadata': {
                'project_type': plugin_name,
                'created_timestamp': datetime.now().isoformat(),
                'version': base_config.get('configuration_metadata', {}).get('version', '1.0'),
                'template_source': f'{plugin_name}_plugin',
                'description': base_config.get('description', 'No description available'),
                'plugin_metadata': plugin.get_metadata()
            }
        }
        
        # Save to project directory
        project_path_obj = Path(project_path)
        project_path_obj.mkdir(parents=True, exist_ok=True)
        
        config_file = project_path_obj / "project_config.json"
        
        try:
            with open(config_file, 'w') as f:
                json.dump(config, f, indent=2, default=str)
            
            self.logger.info(f"Created project configuration: {config_file}")
            
            # Trigger configuration creation hooks
            self._trigger_hooks('project_config_created', plugin_name, project_path, config)
            
            return config
            
        except Exception as e:
            self.logger.error(f"Error creating project configuration: {e}")
            raise


# Global registry instance
_registry = None

def get_plugin_registry(plugin_dir: Optional[str] = None) -> PluginRegistry:
    """Get the global plugin registry instance"""
    global _registry
    if _registry is None:
        _registry = PluginRegistry(plugin_dir)
    return _registry

def register_project_type_plugin(name: str, plugin: ProjectTypePlugin):
    """Convenience function to register a plugin"""
    registry = get_plugin_registry()
    registry.register_plugin(name, plugin)

def get_available_project_types() -> List[str]:
    """Convenience function to get available project types"""
    registry = get_plugin_registry()
    return registry.get_available_plugins()

def create_project_configuration_from_plugin(project_path: str, plugin_name: str) -> Dict:
    """Convenience function to create project configuration from plugin"""
    registry = get_plugin_registry()
    return registry.create_project_configuration(project_path, plugin_name)


if __name__ == "__main__":
    import sys
    
    registry = PluginRegistry()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "list":
            print("Registered Project Type Plugins:")
            print("=" * 60)
            
            plugins_info = registry.list_plugins()
            for name, info in plugins_info.items():
                if 'error' in info:
                    print(f"❌ {name}: {info['error']}")
                else:
                    metadata = info['metadata']
                    status = "✅" if info['valid'] else "⚠️"
                    print(f"{status} {name.upper()}")
                    print(f"   Description: {metadata.get('description', 'No description')}")
                    print(f"   Version: {metadata.get('version', 'Unknown')}")
                    print(f"   Industry Focus: {metadata.get('industry_focus', 'Not specified')}")
                    
                    if info['errors']:
                        print(f"   Errors: {', '.join(info['errors'])}")
                    if info['warnings']:
                        print(f"   Warnings: {', '.join(info['warnings'])}")
                    print()
        
        elif command == "validate":
            if len(sys.argv) > 2:
                plugin_name = sys.argv[2]
                result = registry.validate_plugin(plugin_name)
                
                print(f"Plugin Validation: {plugin_name}")
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
                print("Usage: python plugin_registry.py validate <plugin_name>")
        
        elif command == "info":
            if len(sys.argv) > 2:
                plugin_name = sys.argv[2]
                try:
                    metadata = registry.get_plugin_metadata(plugin_name)
                    config = registry.get_plugin_configuration(plugin_name)
                    
                    print(f"Plugin Information: {plugin_name}")
                    print("=" * 50)
                    print(f"Description: {metadata.get('description')}")
                    print(f"Version: {metadata.get('version')}")
                    print(f"Industry Focus: {metadata.get('industry_focus', 'Not specified')}")
                    
                    # Show business logic summary
                    if 'business_logic' in config:
                        bl = config['business_logic']
                        print(f"\nBusiness Logic:")
                        print(f"  Income Target: ${bl.get('demographic_income_target', 'Not set'):,}")
                        print(f"  Age Target: {bl.get('demographic_age_target', 'Not set')}")
                        print(f"  Competition Weight: {bl.get('competitive_analysis_weight', 'Not set')}")
                    
                    # Show semantic fields
                    if 'semantic_field_priorities' in config:
                        print(f"\nSemantic Fields:")
                        for field, priorities in config['semantic_field_priorities'].items():
                            print(f"  {field}: {', '.join(priorities[:3])}...")
                    
                except Exception as e:
                    print(f"Error getting plugin info: {e}")
            else:
                print("Usage: python plugin_registry.py info <plugin_name>")
        
        else:
            print("Usage: python plugin_registry.py [list|validate <plugin>|info <plugin>]")
    
    else:
        print("Plugin Registry System")
        print("=" * 30)
        available = registry.get_available_plugins()
        print(f"Available plugins: {len(available)}")
        for plugin_name in available:
            print(f"  • {plugin_name}")
        
        print("\nCommands:")
        print("  list     - Show all plugins with details")
        print("  validate - Validate a specific plugin")
        print("  info     - Show detailed plugin information")