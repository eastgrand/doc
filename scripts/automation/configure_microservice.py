#!/usr/bin/env python3
"""
Automated Microservice Configuration Script

Automates the previously manual steps:
1. Copy data to shap-microservice
2. Update project configuration 
3. Handle YAML and other project-specific files
4. Prepare for deployment

Usage: python configure_microservice.py PROJECT_NAME TARGET_VARIABLE
"""

import os
import shutil
import json
from pathlib import Path
import argparse
import logging

class MicroserviceConfigurator:
    def __init__(self, project_name: str, target_variable: str):
        self.project_name = project_name
        self.target_variable = target_variable
        
        # Paths
        self.mpiq_root = Path(__file__).parent.parent.parent
        self.project_path = self.mpiq_root / "projects" / project_name
        self.microservice_path = self.mpiq_root.parent / "shap-microservice"
        
        # Verify paths exist
        if not self.project_path.exists():
            raise FileNotFoundError(f"Project not found: {self.project_path}")
        if not self.microservice_path.exists():
            raise FileNotFoundError(f"Microservice not found: {self.microservice_path}")
    
    def copy_training_data(self):
        """Copy enhanced dataset to microservice"""
        source_data = self.project_path / "microservice_package" / "data" / "training_data.csv"
        target_data = self.microservice_path / "data" / "training_data.csv"
        
        if not source_data.exists():
            # Fallback to merged dataset
            source_data = self.project_path / "merged_dataset.csv"
        
        print(f"📋 Copying training data: {source_data} -> {target_data}")
        shutil.copy2(source_data, target_data)
        
        # Verify target variable exists in data
        with open(target_data, 'r') as f:
            headers = f.readline().strip().split(',')
            if self.target_variable not in headers:
                print(f"⚠️  Warning: Target variable '{self.target_variable}' not found in data headers")
                print(f"   Available columns: {', '.join(headers[:10])}...")
    
    def update_project_config(self):
        """Update microservice project configuration"""
        config_file = self.microservice_path / "project_config.py"
        
        if not config_file.exists():
            print(f"⚠️  project_config.py not found, creating...")
            self.create_project_config()
            return
        
        # Read current config
        with open(config_file, 'r') as f:
            content = f.read()
        
        # Update target variable
        import re
        content = re.sub(
            r'TARGET_VARIABLE:\s*str\s*=\s*["\'][^"\']*["\']',
            f'TARGET_VARIABLE: str = "{self.target_variable}"',
            content
        )
        
        # Update project name and description
        project_display = self.project_name.replace('_', ' ').title()
        content = re.sub(
            r'PROJECT_NAME\s*=\s*["\'][^"\']*["\']',
            f'PROJECT_NAME = "{project_display} Analysis"',
            content
        )
        
        content = re.sub(
            r'PROJECT_DESCRIPTION\s*=\s*["\'][^"\']*["\']',
            f'PROJECT_DESCRIPTION = "AI-powered analysis for {project_display} market optimization"',
            content
        )
        
        with open(config_file, 'w') as f:
            f.write(content)
        
        print(f"✅ Updated project configuration")
    
    def create_project_config(self):
        """Create project configuration if it doesn't exist"""
        config_file = self.microservice_path / "project_config.py"
        project_display = self.project_name.replace('_', ' ').title()
        
        config_content = f'''# Project Configuration
TARGET_VARIABLE: str = "{self.target_variable}"
PROJECT_NAME = "{project_display} Analysis"
PROJECT_DESCRIPTION = "AI-powered analysis for {project_display} market optimization"

# Model Configuration
MODELS_TO_TRAIN = [
    "linear_regression", "lasso_regression", "ridge_regression",
    "random_forest", "xgboost", "neural_network", "knn", "svr"
]

# Feature Selection
MAX_FEATURES = 50
FEATURE_SELECTION_METHOD = "shap"

# Training Configuration
TEST_SIZE = 0.2
VALIDATION_SIZE = 0.2
RANDOM_STATE = 42
'''
        
        with open(config_file, 'w') as f:
            f.write(config_content)
        
        print(f"✅ Created project configuration")
    
    def update_yaml_files(self):
        """Update YAML configuration files"""
        yaml_files = list(self.microservice_path.glob("*.yml")) + list(self.microservice_path.glob("*.yaml"))
        
        for yaml_file in yaml_files:
            print(f"📝 Updating YAML file: {yaml_file.name}")
            
            with open(yaml_file, 'r') as f:
                content = f.read()
            
            # Update common YAML fields for Render Blueprint
            import re
            content = re.sub(r'name:\s*.*-microservice', f'name: {self.project_name}-microservice', content)
            content = re.sub(r'TARGET_VARIABLE:\s*.*', f'TARGET_VARIABLE: {self.target_variable}', content)
            
            # Update service description
            project_display = self.project_name.replace('_', ' ').title()
            content = re.sub(r'# .*Analysis.*SHAP Microservice', f'# {project_display} Analysis SHAP Microservice', content)
            content = re.sub(r'value: ".*Analysis.*SHAP Microservice"', f'value: "{project_display} Analysis SHAP Microservice"', content)
            
            with open(yaml_file, 'w') as f:
                f.write(content)
    
    def copy_models(self):
        """Copy trained models if they exist"""
        source_models = self.project_path / "microservice_package" / "trained_models"
        target_models = self.microservice_path / "models"
        
        if source_models.exists():
            if target_models.exists():
                shutil.rmtree(target_models)
            shutil.copytree(source_models, target_models)
            print(f"✅ Copied trained models")
        else:
            print(f"ℹ️  No trained models found to copy")
    
    def run_configuration(self):
        """Run complete microservice configuration"""
        print(f"🚀 Configuring microservice for {self.project_name}...")
        print(f"   Target Variable: {self.target_variable}")
        print(f"   Microservice Path: {self.microservice_path}")
        
        try:
            self.copy_training_data()
            self.update_project_config()
            self.update_yaml_files()
            self.copy_models()
            
            print(f"\n✅ Microservice configuration completed!")
            print(f"📁 Ready for deployment from: {self.microservice_path}")
            print(f"\n📝 IMPORTANT: Set up project-specific GitHub repository")
            print(f"   Each project needs its own microservice repository to avoid overwriting existing deployments.")
            print(f"\nNext steps:")
            print(f"  1. Create GitHub repository: https://github.com/new")
            print(f"     Suggested name: {self.project_name}-microservice")
            print(f"  2. cd {self.microservice_path}")
            print(f"  3. git remote set-url origin https://github.com/YOUR_USERNAME/{self.project_name}-microservice.git")
            print(f"  4. Deploy: git add . && git commit -m 'Deploy {self.project_name}' && git push")
            print(f"  5. Go to https://dashboard.render.com → New → Blueprint")
            print(f"  6. Select your {self.project_name}-microservice repository")
            print(f"  7. Render will auto-deploy using render.yaml blueprint")
            print(f"\n📋 Render Blueprint (render.yaml) includes:")
            print(f"   - Web service with gunicorn")
            print(f"   - Environment variables for {self.target_variable}")
            print(f"   - Automatic dependency installation")
            print(f"\n⚠️  Do NOT use the existing microservice repository - create a new one!")
            
        except Exception as e:
            print(f"❌ Configuration failed: {e}")
            raise

def main():
    parser = argparse.ArgumentParser(description="Configure microservice for deployment")
    parser.add_argument("project_name", help="Project name (e.g., doors_documentary)")
    parser.add_argument("target_variable", help="Target variable name (e.g., doors_audience_score)")
    
    args = parser.parse_args()
    
    configurator = MicroserviceConfigurator(args.project_name, args.target_variable)
    configurator.run_configuration()

if __name__ == "__main__":
    main()