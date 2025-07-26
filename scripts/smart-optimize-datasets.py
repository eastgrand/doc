#!/usr/bin/env python3
"""
Smart Dataset Optimization
Preserves analysis-specific computed fields while filtering unnecessary raw demographic data
"""

import json
import os
from typing import Dict, Any, Set, List

def load_core_fields() -> Set[str]:
    """Load the core demographic fields to keep from complete_field_list_keep.txt."""
    try:
        with open('complete_field_list_keep.txt', 'r') as f:
            fields = {line.strip() for line in f if line.strip()}
        print(f"✅ Loaded {len(fields)} core demographic fields")
        return fields
    except FileNotFoundError:
        print("❌ complete_field_list_keep.txt not found!")
        return set()

def get_computed_field_patterns() -> Dict[str, List[str]]:
    """Define patterns for computed fields to preserve per analysis type."""
    return {
        'spatial_clusters': [
            'cluster_', 'centroid_', 'distance_', 'spatial_', 'geographic_'
        ],
        'competitive_analysis': [
            'competitive_', 'market_share_', 'brand_comparison_', 'advantage_'
        ],
        'correlation_analysis': [
            'correlation_', 'r_value_', 'p_value_', 'significance_'
        ],
        'demographic_insights': [
            'demographic_', 'population_', 'segment_', 'profile_'
        ],
        'trend_analysis': [
            'trend_', 'slope_', 'direction_', 'velocity_', 'momentum_'
        ],
        'anomaly_detection': [
            'anomaly_', 'outlier_', 'deviation_', 'zscore_', 'isolation_'
        ],
        'feature_interactions': [
            'interaction_', 'synergy_', 'effect_', 'combined_'
        ],
        'feature_importance_ranking': [
            'importance_', 'rank_', 'score_', 'weight_', 'contribution_'
        ],
        'outlier_detection': [
            'outlier_', 'anomaly_', 'deviation_', 'threshold_'
        ],
        'comparative_analysis': [
            'comparison_', 'relative_', 'ratio_', 'difference_'
        ],
        'predictive_modeling': [
            'prediction_', 'forecast_', 'model_', 'accuracy_', 'rmse_', 'mae_'
        ],
        'segment_profiling': [
            'segment_', 'profile_', 'characteristic_', 'persona_'
        ],
        'scenario_analysis': [
            'scenario_', 'simulation_', 'what_if_', 'projected_'
        ],
        'sensitivity_analysis': [
            'sensitivity_', 'elasticity_', 'response_', 'impact_'
        ],
        'model_performance': [
            'performance_', 'accuracy_', 'precision_', 'recall_', 'f1_', 'auc_',
            'rmse_', 'mae_', 'r2_', 'cross_val_'
        ]
    }

def detect_analysis_type(filename: str) -> str:
    """Detect analysis type from filename."""
    # Remove .json extension and convert hyphens to underscores
    base_name = filename.replace('.json', '').replace('-', '_')
    
    # Check for exact matches first
    computed_patterns = get_computed_field_patterns()
    if base_name in computed_patterns:
        return base_name
    
    # Check for partial matches
    for analysis_type in computed_patterns.keys():
        if analysis_type in base_name:
            return analysis_type
    
    # Default fallback
    return 'general'

def get_fields_to_preserve(all_fields: List[str], analysis_type: str, core_fields: Set[str]) -> Set[str]:
    """Determine which fields to preserve based on analysis type."""
    fields_to_keep = set(core_fields)  # Start with core demographic fields
    
    # Always preserve essential metadata fields
    essential_fields = {
        'ID', 'DESCRIPTION', 'FSA_ID', 'ZIP_CODE', 'TOTPOP_CY', 'MEDDI_CY'
    }
    fields_to_keep.update(essential_fields)
    
    # Get computed field patterns for this analysis type
    computed_patterns = get_computed_field_patterns()
    patterns = computed_patterns.get(analysis_type, [])
    
    # Add fields matching computed patterns
    for field in all_fields:
        # Keep any field that matches computed patterns
        for pattern in patterns:
            if pattern.lower() in field.lower():
                fields_to_keep.add(field)
                break
        
        # Keep SHAP values (always important for interpretability)
        if field.startswith('shap_'):
            fields_to_keep.add(field)
        
        # Keep value_ prefixed fields (original values)
        if field.startswith('value_'):
            fields_to_keep.add(field)
        
        # Keep brand fields (MP30xxx patterns)
        if 'MP30' in field and ('_B_P' in field or '_B' in field):
            fields_to_keep.add(field)
    
    return fields_to_keep

def optimize_endpoint_file(file_path: str, core_fields: Set[str]) -> bool:
    """Optimize a single endpoint JSON file with analysis-aware field preservation."""
    filename = os.path.basename(file_path)
    analysis_type = detect_analysis_type(filename)
    
    print(f"\n📄 Optimizing: {filename}")
    print(f"   🔍 Analysis type: {analysis_type}")
    
    try:
        # Load the file
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        # Get original file size
        original_size = os.path.getsize(file_path) / (1024 * 1024)  # MB
        
        # Process the results if they exist
        if 'results' in data and data['results']:
            sample_record = data['results'][0]
            all_fields = list(sample_record.keys())
            original_field_count = len(all_fields)
            
            # Determine fields to preserve for this analysis type
            fields_to_preserve = get_fields_to_preserve(all_fields, analysis_type, core_fields)
            
            print(f"   📊 Fields: {original_field_count} → {len(fields_to_preserve)} (preserving {len(fields_to_preserve)}/{original_field_count})")
            
            # Filter each record
            filtered_results = []
            for record in data['results']:
                filtered_record = {key: value for key, value in record.items() 
                                 if key in fields_to_preserve}
                filtered_results.append(filtered_record)
            
            data['results'] = filtered_results
            
            print(f"   📊 Records: {len(filtered_results)}")
            
            # Add optimization metadata
            if 'export_metadata' not in data:
                data['export_metadata'] = {}
            
            data['export_metadata']['smart_optimization'] = {
                'optimized': True,
                'analysis_type': analysis_type,
                'original_fields': original_field_count,
                'preserved_fields': len(fields_to_preserve),
                'core_demographic_fields': len(core_fields),
                'computed_fields_preserved': len(fields_to_preserve) - len(core_fields & fields_to_preserve),
                'optimization_date': '2025-07-26',
                'preserved_field_sample': sorted(list(fields_to_preserve))[:20]  # Sample for debugging
            }
            
            # Save the optimized file (overwrite original)
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2, default=str)
            
            # Get new file size
            new_size = os.path.getsize(file_path) / (1024 * 1024)  # MB
            reduction = ((original_size - new_size) / original_size) * 100
            
            print(f"   💾 Size: {original_size:.1f}MB → {new_size:.1f}MB ({reduction:.1f}% reduction)")
            return True
            
        else:
            print(f"   ⚠️ No results found in {file_path}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error processing {file_path}: {str(e)}")
        return False

def main():
    """Main optimization function."""
    print("🧠 Starting Smart Dataset Optimization")
    print("=" * 60)
    
    # Load core demographic fields
    core_fields = load_core_fields()
    if not core_fields:
        print("❌ No core fields loaded. Exiting.")
        return
    
    # Define the endpoints directory
    endpoints_dir = "public/data/endpoints"
    
    if not os.path.exists(endpoints_dir):
        print(f"❌ Directory {endpoints_dir} not found!")
        return
    
    # Get all JSON files in the endpoints directory (excluding combined files)
    json_files = [f for f in os.listdir(endpoints_dir) 
                  if f.endswith('.json') and f not in ['all_endpoints.json', 'export_summary.json']]
    
    print(f"📁 Found {len(json_files)} endpoint files to optimize")
    print(f"🎯 Core demographic fields: {len(core_fields)}")
    print(f"🧠 Will preserve analysis-specific computed fields per endpoint")
    
    successful_optimizations = 0
    total_original_size = 0
    total_new_size = 0
    analysis_type_counts = {}
    
    # Process each file
    for i, filename in enumerate(sorted(json_files), 1):
        file_path = os.path.join(endpoints_dir, filename)
        original_size = os.path.getsize(file_path) / (1024 * 1024)
        
        analysis_type = detect_analysis_type(filename)
        analysis_type_counts[analysis_type] = analysis_type_counts.get(analysis_type, 0) + 1
        
        print(f"\n[{i}/{len(json_files)}] {filename} ({original_size:.1f}MB)")
        
        if optimize_endpoint_file(file_path, core_fields):
            successful_optimizations += 1
            new_size = os.path.getsize(file_path) / (1024 * 1024)
            total_original_size += original_size
            total_new_size += new_size
    
    # Summary
    total_reduction = ((total_original_size - total_new_size) / total_original_size) * 100 if total_original_size > 0 else 0
    
    print("\n" + "=" * 60)
    print("📊 SMART OPTIMIZATION SUMMARY")
    print("=" * 60)
    print(f"✅ Successfully optimized: {successful_optimizations}/{len(json_files)} files")
    print(f"📋 Core demographic fields: {len(core_fields)}")
    print(f"💾 Total size: {total_original_size:.1f}MB → {total_new_size:.1f}MB")
    print(f"🎯 Overall reduction: {total_reduction:.1f}%")
    print(f"💽 Space saved: {total_original_size - total_new_size:.1f}MB")
    
    print(f"\n🔍 Analysis types processed:")
    for analysis_type, count in sorted(analysis_type_counts.items()):
        print(f"   • {analysis_type}: {count} files")
    
    print("\n🎉 Smart dataset optimization complete!")
    print("🧠 Each endpoint preserved its analysis-specific computed fields")

if __name__ == "__main__":
    main()