#!/usr/bin/env python3
"""
Legacy Model Cleanup Script
Removes old single-purpose models and consolidates to the new specialized model architecture
"""

import os
import shutil
from pathlib import Path
from datetime import datetime

def cleanup_legacy_models():
    """Remove legacy model files and consolidate to new architecture"""
    
    models_dir = Path("/Users/voldeck/code/shap-microservice/models")
    backup_dir = Path("/Users/voldeck/code/shap-microservice/models_backup_" + datetime.now().strftime("%Y%m%d_%H%M%S"))
    
    if not models_dir.exists():
        print("❌ Models directory not found")
        return
    
    print("🗂️ Starting legacy model cleanup...")
    
    # Create backup directory
    backup_dir.mkdir(exist_ok=True)
    print(f"📦 Created backup directory: {backup_dir}")
    
    # Files to keep (current specialized models)
    keep_directories = {
        'strategic_analysis_model',
        'competitive_analysis_model', 
        'demographic_analysis_model',
        'correlation_analysis_model',
        'predictive_modeling_model',
        'ensemble_model'
    }
    
    keep_files = {
        'training_results.json',
        'training_summary.json'
    }
    
    # Files and directories to remove (legacy models)
    legacy_files = [
        'anomaly.pkl',
        'correlation.pkl', 
        'hotspot.pkl',
        'multivariate.pkl',
        'network.pkl',
        'prediction.pkl',
        'xgboost_model.pkl',
        'xgboost_model_original_543_features.pkl',
        'feature_names.txt',
        'feature_names_backup_20250728_065553.txt',
        'feature_names_corrected.txt', 
        'feature_names_original_543.txt',
        'label_encoders.joblib',
        'scaler.joblib'
    ]
    
    legacy_directories = [
        'general_analysis_model',
        'deployment_package'
    ]
    
    # Backup and remove legacy files
    removed_count = 0
    
    for file_name in legacy_files:
        file_path = models_dir / file_name
        if file_path.exists():
            # Backup first
            shutil.copy2(file_path, backup_dir / file_name)
            # Remove original
            file_path.unlink()
            removed_count += 1
            print(f"🗑️ Removed legacy file: {file_name}")
    
    # Backup and remove legacy directories
    for dir_name in legacy_directories:
        dir_path = models_dir / dir_name
        if dir_path.exists():
            # Backup first
            shutil.copytree(dir_path, backup_dir / dir_name)
            # Remove original
            shutil.rmtree(dir_path)
            removed_count += 1
            print(f"🗑️ Removed legacy directory: {dir_name}")
    
    # Verify specialized models are intact
    kept_count = 0
    for model_dir in keep_directories:
        model_path = models_dir / model_dir
        if model_path.exists():
            kept_count += 1
            print(f"✅ Kept specialized model: {model_dir}")
        else:
            print(f"⚠️ Missing specialized model: {model_dir}")
    
    # Summary
    print(f"\n📊 Cleanup Summary:")
    print(f"   🗑️ Removed {removed_count} legacy items")
    print(f"   ✅ Kept {kept_count} specialized models") 
    print(f"   📦 Backup created at: {backup_dir}")
    
    # Verify the microservice models directory structure
    print(f"\n📂 Final models directory structure:")
    for item in sorted(models_dir.iterdir()):
        if item.is_dir():
            print(f"   📁 {item.name}/")
            # Check if it has the expected files
            expected_files = ['model.joblib', 'features.json', 'hyperparameters.json', 'scaler.joblib', 'label_encoders.joblib']
            for expected_file in expected_files:
                if (item / expected_file).exists():
                    print(f"      ✅ {expected_file}")
                else:
                    print(f"      ❌ {expected_file} (missing)")
        else:
            print(f"   📄 {item.name}")
    
    print("\n🎉 Legacy model cleanup completed!")
    return True

if __name__ == "__main__":
    cleanup_legacy_models()