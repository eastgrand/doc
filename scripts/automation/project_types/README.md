# Project Type Configurations

This directory contains modular project type configuration files for the Semantic Field Resolution System. Each project type has its own JSON configuration file defining business logic, algorithm settings, and semantic field priorities.

## Available Project Types

- **retail.json** - Retail and consumer goods analysis
- **real_estate.json** - Real estate and property analysis  
- **healthcare.json** - Healthcare and medical services analysis

## Configuration Structure

Each project type configuration includes:

```json
{
  "project_type": "...",
  "description": "...",
  "business_logic": {
    "demographic_income_target": 75000,
    "demographic_age_target": 35,
    "competitive_analysis_weight": 0.35,
    ...
  },
  "algorithm_settings": {
    "volatility_penalty_factor": 0.2,
    "market_size_threshold": 50000,
    ...
  },
  "semantic_field_priorities": {
    "consumer_income": ["field1", "field2", ...],
    "market_size": ["field1", "field2", ...],
    ...
  },
  "configuration_metadata": {
    "version": "1.0",
    "industry_focus": "...",
    ...
  }
}
```

## Usage

### Command Line Interface

```bash
# List all available project types
python config_loader.py list

# Validate a specific project type
python config_loader.py validate retail
```

### Programmatic Usage

```python
from project_types.config_loader import ProjectTypeConfigLoader

# Initialize loader
loader = ProjectTypeConfigLoader()

# Create project configuration from template
config = loader.create_project_configuration_template('/path/to/project', 'retail')

# Get available project types
types = loader.get_available_project_types()

# Validate configuration
result = loader.validate_project_config('healthcare')
```

## Adding New Project Types

1. Create a new JSON file in this directory (e.g., `finance.json`)
2. Follow the standard configuration structure
3. Include all required sections: `business_logic`, `algorithm_settings`, `semantic_field_priorities`
4. Test with: `python config_loader.py validate finance`

## Integration

The configurations are automatically loaded by the main `configurable_algorithm_engine.py` through the `create_project_configuration_template()` function. The system falls back to embedded configurations if external files are not available (for backward compatibility).

## Benefits

- **Modularity**: Easy to add/modify project types without changing code
- **Maintainability**: Clear separation of configuration from logic
- **Extensibility**: Simple to add new project types or parameters
- **Validation**: Built-in validation ensures configuration integrity
- **Documentation**: Self-documenting configuration structure