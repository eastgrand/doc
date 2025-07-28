#!/usr/bin/env python3
"""
Optimized Dataset Export Script
Exports only the specified fields from all microservice endpoints, overwriting original files.
"""

import json
import requests
import time
import os
from typing import Dict, List, Any

# Load the list of fields to keep
def load_fields_to_keep():
    """Load the list of fields to keep from the file."""
    try:
        with open('complete_field_list_keep.txt', 'r') as f:
            fields = [line.strip() for line in f if line.strip()]
        print(f"✅ Loaded {len(fields)} fields to keep")
        return set(fields)  # Use set for faster lookups
    except FileNotFoundError:
        print("❌ complete_field_list_keep.txt not found!")
        return set()

# Configuration - CORRECTED to match working script
MICROSERVICE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"
OUTPUT_DIR = "public/data/endpoints"

# Authentication headers
HEADERS = {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
}

# All brand target variables
ALL_BRAND_FIELDS = [
    "MP30034A_B_P",  # Nike
    "MP30029A_B_P",  # Adidas  
    "MP30032A_B_P",  # Jordan
    "MP30031A_B_P",  # Converse
    "MP30033A_B_P",  # New Balance
    "MP30035A_B_P",  # Puma
    "MP30036A_B_P",  # Reebok
    "MP30030A_B_P"   # Asics
]

def filter_data(data: Dict[str, Any], fields_to_keep: set) -> Dict[str, Any]:
    """Filter response data to only include specified fields plus SHAP fields."""
    filtered_data = {}
    
    # Keep only core fields we want
    core_fields = {'analysis_type', 'feature_importance', 'results', 'success'}
    
    for key, value in data.items():
        if key in core_fields:
            filtered_data[key] = value
    
    # Filter the results records if they exist
    if 'results' in filtered_data and filtered_data['results']:
        filtered_results = []
        for record in filtered_data['results']:
            filtered_record = {}
            
            # Always include SHAP fields (these are the key fields we need)
            shap_fields = {k: v for k, v in record.items() if k.startswith('shap_')}
            filtered_record.update(shap_fields)
            
            # Include the original 191 fields from complete_field_list_keep.txt
            original_fields = {k: v for k, v in record.items() if k in fields_to_keep}
            filtered_record.update(original_fields)
            
            # Exclude unwanted metadata fields
            exclude_fields = {'processing_time', 'timestamp', 'computation_time', 'memory_usage', 
                            'batch_id', 'record_index', 'analysis_id', 'version'}
            final_record = {k: v for k, v in filtered_record.items() if k not in exclude_fields}
            
            filtered_results.append(final_record)
        filtered_data['results'] = filtered_results
    
    return filtered_data

# Only process the two endpoints we need
ENDPOINT_CONFIGS_ORIGINAL = {
    "spatial_clusters": {
        "endpoint": "/spatial-clusters", 
        "payload": {
            "query": "Find geographic areas with similar demographic characteristics including ALL brand purchase patterns",
            "analysis_type": "clustering",
            "target_variable": "MP30034A_B_P",
            "target_variables": ALL_BRAND_FIELDS,
            "cluster_count": 8,
            "clustering_method": "kmeans",
            "matched_fields": ALL_BRAND_FIELDS,
            "include_all_fields": True  # Get all fields from server
        }
    },
    "competitive_analysis": {
        "endpoint": "/competitive-analysis",
        "payload": {
            "query": "Competitive analysis across ALL brand categories with Nike vs Adidas focus",
            "analysis_type": "competitive",
            "primary_brand": "MP30034A_B_P",  # Nike
            "competitor_brands": ["MP30029A_B_P"],  # Adidas
            "target_variable": "MP30034A_B_P",
            "target_variables": ALL_BRAND_FIELDS,
            "matched_fields": ALL_BRAND_FIELDS,
            "include_all_fields": True,  # Get all fields from server
            "calculate_shap": True,
            "include_shap_values": True,
            "shap_method": "tree_explainer"
        }
    },
    "correlation_analysis": {
        "endpoint": "/correlation-analysis",
        "payload": {
            "query": "Analyze correlations between demographic variables and ALL brand preferences",
            "analysis_type": "correlation",
            "primary_variable": "MP30034A_B_P",
            "secondary_variables": ALL_BRAND_FIELDS[1:],
            "target_variables": ALL_BRAND_FIELDS,
            "matched_fields": ALL_BRAND_FIELDS,
            "include_all_fields": True  # Get all fields from server
        }
    },
    "demographic_insights": {
        "endpoint": "/demographic-insights",
        "payload": {
            "query": "Deep demographic analysis with ALL brand purchase patterns by region",
            "analysis_type": "demographic",
            "focus_variables": ["age", "income", "lifestyle", "household_size"],
            "target_variables": ALL_BRAND_FIELDS,
            "matched_fields": ALL_BRAND_FIELDS + ["TOTPOP_CY", "MEDDI_CY"],
            "include_segments": True,
            "include_all_fields": True  # Get all fields from server
        }
    },
    "trend_analysis": {
        "endpoint": "/trend-analysis",
        "payload": {
            "query": "Analyze temporal trends across ALL brand categories",
            "analysis_type": "temporal",
            "time_period": "12_months",
            "trend_variables": ALL_BRAND_FIELDS,
            "target_variables": ALL_BRAND_FIELDS,
            "matched_fields": ALL_BRAND_FIELDS,
            "include_all_fields": True  # Get all fields from server
        }
    },
    "anomaly_detection": {
        "endpoint": "/anomaly-detection",
        "payload": {
            "query": "Detect anomalies across ALL brand purchase patterns",
            "analysis_type": "anomaly",
            "target_variables": ALL_BRAND_FIELDS,
            "anomaly_method": "isolation_forest",
            "matched_fields": ALL_BRAND_FIELDS,
            "include_all_fields": True  # Get all fields from server
        }
    },
    "feature_interactions": {
        "endpoint": "/feature-interactions",
        "payload": {
            "query": "Analyze feature interactions across ALL brand categories",
            "analysis_type": "interaction",
            "target_variable": "MP30034A_B_P",
            "target_variables": ALL_BRAND_FIELDS,
            "interaction_depth": 2,
            "matched_fields": ALL_BRAND_FIELDS,
            "include_all_fields": True  # Get all fields from server
        }
    },
    "outlier_detection": {
        "endpoint": "/outlier-detection",
        "payload": {
            "query": "Identify statistical outliers across ALL brand categories",
            "analysis_type": "outlier",
            "target_variables": ALL_BRAND_FIELDS,
            "outlier_method": "zscore",
            "matched_fields": ALL_BRAND_FIELDS,
            "include_all_fields": True  # Get all fields from server
        }
    },
    "comparative_analysis": {
        "endpoint": "/comparative-analysis",
        "payload": {
            "query": "Compare ALL brand variables across geographic regions",
            "analysis_type": "comparison",
            "comparison_variables": ALL_BRAND_FIELDS,
            "comparison_method": "statistical",
            "target_variables": ALL_BRAND_FIELDS,
            "matched_fields": ALL_BRAND_FIELDS,
            "include_all_fields": True  # Get all fields from server
        }
    },
    "predictive_modeling": {
        "endpoint": "/predictive-modeling",
        "payload": {
            "query": "Build predictive models for ALL brand preference forecasting",
            "analysis_type": "prediction",
            "target_variable": "MP30034A_B_P",
            "target_variables": ALL_BRAND_FIELDS,
            "model_type": "xgboost",
            "include_shap": True,
            "matched_fields": ALL_BRAND_FIELDS,
            "include_all_fields": True  # Get all fields from server
        }
    },
    "segment_profiling": {
        "endpoint": "/segment-profiling",
        "payload": {
            "query": "Profile segments across ALL brand categories",
            "analysis_type": "segmentation",
            "segmentation_variables": ["age", "income", "lifestyle"],
            "target_variables": ALL_BRAND_FIELDS,
            "segment_count": 6,
            "matched_fields": ALL_BRAND_FIELDS,
            "include_all_fields": True  # Get all fields from server
        }
    },
    "scenario_analysis": {
        "endpoint": "/scenario-analysis",
        "payload": {
            "query": "What-if scenario modeling across ALL brand categories",
            "analysis_type": "scenario",
            "scenarios": ["optimistic", "realistic", "pessimistic"],
            "target_variable": "MP30034A_B_P",
            "target_variables": ALL_BRAND_FIELDS,
            "matched_fields": ALL_BRAND_FIELDS,
            "include_all_fields": True  # Get all fields from server
        }
    },
    "feature_importance_ranking": {
        "endpoint": "/feature-importance-ranking",
        "payload": {
            "query": "Rank feature importance across ALL brand categories using SHAP",
            "analysis_type": "feature_importance",
            "target_field": "MP30034A_B_P",
            "target_variables": ALL_BRAND_FIELDS,
            "method": "shap",
            "max_factors": 30,
            "include_all_fields": True,  # Get all fields from server  # Use optimized field filter
            "calculate_per_record": True,  # Ensure per-record SHAP values
            "per_location_shap": True,  # Calculate unique SHAP values for each location
            "location_specific": True,  # Location-specific feature importance
            "include_shap_values": True,
            "shap_method": "tree_explainer",
            "explainer_mode": "local",  # Local explanations for each record
            "matched_fields": ALL_BRAND_FIELDS
        }
    },
    "sensitivity_analysis": {
        "endpoint": "/sensitivity-analysis",
        "payload": {
            "query": "Analyze sensitivity of ALL brand variables to demographic changes",
            "analysis_type": "sensitivity",
            "target_variable": "MP30034A_B_P",
            "target_variables": ALL_BRAND_FIELDS,
            "sensitivity_variables": ["TOTPOP_CY", "MEDDI_CY"],
            "matched_fields": ALL_BRAND_FIELDS,
            "include_all_fields": True  # Get all fields from server
        }
    },
    "model_performance": {
        "endpoint": "/model-performance",
        "payload": {
            "query": "Evaluate model performance across ALL brand prediction models",
            "analysis_type": "performance",
            "target_variable": "MP30034A_B_P",
            "target_variables": ALL_BRAND_FIELDS,
            "performance_metrics": ["r2_score", "mae", "rmse"],
            "cross_validation": True,
            "matched_fields": ALL_BRAND_FIELDS,
            "include_all_fields": True  # Get all fields from server
        }
    }
}

# Process all endpoints that need optimization (the 28MB files)
# Use all endpoints - aligned with working SHAP implementation
ENDPOINT_CONFIGS = ENDPOINT_CONFIGS_ORIGINAL

def filter_record(record: Dict[str, Any], fields_to_keep: set) -> Dict[str, Any]:
    """Filter a record to only include the specified fields."""
    return {key: value for key, value in record.items() if key in fields_to_keep}

def export_endpoint_data(endpoint_name: str, config: dict, fields_to_keep: set) -> bool:
    """Export data from a specific endpoint with client-side field filtering."""
    print(f"\n📊 Exporting optimized data for: {endpoint_name}")
    
    url = f"{MICROSERVICE_URL}{config['endpoint']}"
    
    # Update payload to get ALL fields from microservice, then filter client-side
    payload = config['payload'].copy()
    payload['include_all_fields'] = True  # Get all fields from server
    print(f"   📋 Will filter to {len(fields_to_keep)} fields client-side")
    
    try:
        print(f"   🔄 Making request to {url}")
        print(f"   📋 Requesting ALL fields from microservice...")
        response = requests.post(url, json=payload, headers=HEADERS, timeout=600)
        
        if response.status_code == 200:
            data = response.json()
            
            # Debug: Check raw response before filtering
            if 'results' in data and len(data['results']) > 0:
                sample_raw = data['results'][0]
                shap_count = len([k for k in sample_raw.keys() if k.startswith('shap_')])
                total_raw_fields = len(sample_raw.keys())
                print(f"   📊 Raw response fields: {total_raw_fields}")
                print(f"   📊 SHAP fields in raw: {shap_count}")
            
            # Filter the data client-side to keep only specified fields
            print(f"   🔄 Applying client-side filtering...")
            filtered_data = filter_data(data, fields_to_keep)
            
            if 'results' in filtered_data and len(filtered_data['results']) > 0:
                sample_filtered = filtered_data['results'][0]
                filtered_shap_count = len([k for k in sample_filtered.keys() if k.startswith('shap_')])
                total_filtered_fields = len(sample_filtered.keys())
                print(f"   ✅ Filtered fields total: {total_filtered_fields}")
                print(f"   ✅ SHAP fields preserved: {filtered_shap_count}")
            
            # Check the results
            if 'results' in filtered_data and filtered_data['results']:
                print(f"   ✅ Received {len(filtered_data['results'])} records")
                
                # Save filtered data (OVERWRITING original file)
                os.makedirs(OUTPUT_DIR, exist_ok=True)
                output_file = f"{OUTPUT_DIR}/{endpoint_name.replace('_', '-')}.json"
                
                with open(output_file, 'w') as f:
                    json.dump(filtered_data, f, indent=2, default=str)
                
                file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
                print(f"   💾 Overwritten {output_file} ({file_size:.2f} MB)")
                return True
            else:
                print(f"   ⚠️ No results in response")
                return False
                
        else:
            print(f"   ❌ Error {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def main():
    """Main export function."""
    print("🚀 Starting Optimized Dataset Export (Overwriting Originals)")
    print("=" * 60)
    
    # Load fields to keep
    fields_to_keep = load_fields_to_keep()
    if not fields_to_keep:
        print("❌ No fields to keep loaded. Exiting.")
        return
    
    print(f"📋 Will export {len(fields_to_keep)} fields from {len(ENDPOINT_CONFIGS)} endpoints")
    print(f"🌐 Microservice: {MICROSERVICE_URL}")
    print(f"📋 Using client-side field filtering for optimal SHAP calculation")
    print(f"⚠️  Will OVERWRITE existing files in {OUTPUT_DIR}")
    
    successful_exports = 0
    all_data = {}
    
    for i, (endpoint_name, config) in enumerate(ENDPOINT_CONFIGS.items(), 1):
        print(f"\n[{i}/{len(ENDPOINT_CONFIGS)}] Processing {endpoint_name}")
        
        if export_endpoint_data(endpoint_name, config, fields_to_keep):
            successful_exports += 1
            
            # Load the saved data for combined export
            try:
                with open(f"{OUTPUT_DIR}/{endpoint_name}.json", 'r') as f:
                    endpoint_data = json.load(f)
                    all_data[endpoint_name] = endpoint_data
                    
            except Exception as e:
                print(f"   ⚠️ Could not load saved data: {e}")
        
        # Rate limiting
        if i < len(ENDPOINT_CONFIGS):
            print("   ⏳ Waiting 2 seconds...")
            time.sleep(2)
    
    # Create combined dataset (overwrite original)
    print(f"\n📦 Creating combined optimized dataset...")
    combined_file = f"{OUTPUT_DIR}/all_endpoints.json"
    
    with open(combined_file, 'w') as f:
        json.dump(all_data, f, indent=2, default=str)
    
    combined_size = os.path.getsize(combined_file) / (1024 * 1024)  # MB
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 OPTIMIZED EXPORT SUMMARY")
    print("=" * 60)
    print(f"✅ Successful exports: {successful_exports}/{len(ENDPOINT_CONFIGS)}")
    print(f"📋 Fields exported: {len(fields_to_keep)} (reduced from 1,084)")
    print(f"💾 Combined file: {combined_file} ({combined_size:.2f} MB)")
    print(f"🎯 Field reduction: ~{((1084 - len(fields_to_keep)) / 1084) * 100:.1f}% fewer fields")
    print(f"⚠️  Original files have been OVERWRITTEN with optimized data")
    print("\n🎉 Optimized export complete!")
    
    # Show sample of kept fields
    print(f"\n📋 Sample of exported fields:")
    sample_fields = sorted(list(fields_to_keep))[:10]
    for field in sample_fields:
        print(f"   • {field}")
    if len(fields_to_keep) > 10:
        print(f"   ... and {len(fields_to_keep) - 10} more")

if __name__ == "__main__":
    main() 