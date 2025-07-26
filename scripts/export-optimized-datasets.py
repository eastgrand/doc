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
            "include_all_fields": False
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
            "include_all_fields": False,
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
            "include_all_fields": False
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
            "include_all_fields": False
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
            "include_all_fields": False
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
            "include_all_fields": False
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
            "include_all_fields": False
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
            "include_all_fields": False
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
            "include_all_fields": False
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
            "include_all_fields": False
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
            "include_all_fields": False
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
            "include_all_fields": False
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
            "matched_fields": ALL_BRAND_FIELDS,
            "include_all_fields": False
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
            "include_all_fields": False
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
            "include_all_fields": False
        }
    }
}

# Process all endpoints that need optimization (the 28MB files)
ENDPOINT_CONFIGS = ENDPOINT_CONFIGS_ORIGINAL  # Use all endpoints instead of just 2

def filter_record(record: Dict[str, Any], fields_to_keep: set) -> Dict[str, Any]:
    """Filter a record to only include the specified fields."""
    return {key: value for key, value in record.items() if key in fields_to_keep}

def export_endpoint_data(endpoint_name: str, config: dict, fields_to_keep: list) -> bool:
    """Export data from a specific endpoint with field filtering, overwriting original files."""
    print(f"\n📊 Exporting optimized data for: {endpoint_name}")
    
    url = f"{MICROSERVICE_URL}{config['endpoint']}"
    headers = {"X-API-Key": API_KEY}
    
    # Update payload to use optimized fields instead of downloading all fields
    payload = config['payload'].copy()
    payload['matched_fields'] = fields_to_keep
    payload['include_all_fields'] = False
    
    try:
        print(f"   🔄 Making request to {url}")
        response = requests.post(url, json=payload, headers=headers, timeout=300)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check the results (microservice should already return only specified fields)
            if 'results' in data and data['results']:
                field_count = len(data['results'][0].keys()) if data['results'] else 0
                print(f"   ✅ Received {field_count} fields (optimized at source)")
                print(f"   📊 Records: {len(data['results'])}")
                
                # Save filtered data (OVERWRITING original file)
                os.makedirs(OUTPUT_DIR, exist_ok=True)
                output_file = f"{OUTPUT_DIR}/{endpoint_name.replace('_', '-')}.json"
                
                with open(output_file, 'w') as f:
                    json.dump(data, f, indent=2, default=str)
                
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
    
    # Convert to list for API call
    fields_list = list(fields_to_keep) if isinstance(fields_to_keep, set) else fields_to_keep
    
    print(f"📋 Will export {len(fields_to_keep)} fields from {len(ENDPOINT_CONFIGS)} endpoints")
    print(f"🌐 Microservice: {MICROSERVICE_URL}")
    print(f"⚠️  Will OVERWRITE existing files in {OUTPUT_DIR}")
    
    successful_exports = 0
    all_data = {}
    
    for i, (endpoint_name, config) in enumerate(ENDPOINT_CONFIGS.items(), 1):
        print(f"\n[{i}/{len(ENDPOINT_CONFIGS)}] Processing {endpoint_name}")
        
        if export_endpoint_data(endpoint_name, config, fields_list):
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