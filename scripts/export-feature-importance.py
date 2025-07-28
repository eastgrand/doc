#!/usr/bin/env python3
"""
Feature Importance Export Script
Exports feature importance data with per-record SHAP values from the microservice.
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

# Configuration
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

# Feature importance endpoint configuration
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

FEATURE_IMPORTANCE_CONFIG = {
    "endpoint": "/feature-importance-ranking",
    "payload": {
        "query": "Rank feature importance across ALL brand categories using SHAP",
        "analysis_type": "feature_importance",
        "target_field": "MP30034A_B_P",  # Nike as primary
        "target_variables": ALL_BRAND_FIELDS,
        "method": "shap",
        "max_factors": 30,
        "include_all_fields": True,  # Get all fields from microservice
        "calculate_per_record": True,  # Ensure per-record SHAP values
        "per_location_shap": True,  # Calculate unique SHAP values for each location
        "location_specific": True,  # Location-specific feature importance
        "include_shap_values": True,
        "shap_method": "tree_explainer",
        "explainer_mode": "local"  # Local explanations for each record
    }
}

def export_feature_importance() -> bool:
    """Export feature importance data with per-record SHAP values."""
    print(f"\n📊 Exporting Feature Importance Data")
    print("=" * 60)
    
    # Load fields to keep
    fields_to_keep = load_fields_to_keep()
    if not fields_to_keep:
        print("❌ No fields to keep loaded. Exiting.")
        return False
    
    # Convert to list for API call
    fields_list = list(fields_to_keep) if isinstance(fields_to_keep, set) else fields_to_keep
    
    url = f"{MICROSERVICE_URL}{FEATURE_IMPORTANCE_CONFIG['endpoint']}"
    
    # Update payload to get ALL fields from microservice, then filter client-side
    payload = FEATURE_IMPORTANCE_CONFIG['payload'].copy()  
    payload['include_all_fields'] = True  # Get all fields from server
    
    print(f"📋 Will filter to {len(fields_list)} fields client-side")
    print(f"📋 Sample fields to keep: {fields_list[:5]}...")
    
    try:
        print(f"🔄 Making request to {url}")
        print(f"📋 Requesting ALL fields with per-record SHAP values...")
        
        response = requests.post(url, json=payload, headers=HEADERS, timeout=600)
        
        if response.status_code == 200:
            data = response.json()
            
            # Debug: Check raw SHAP values before filtering
            if 'results' in data and len(data['results']) > 0:
                sample_raw = data['results'][0]
                print(f"📊 Raw response fields: {list(sample_raw.keys())[:10]}...")
                shap_count = len([k for k in sample_raw.keys() if k.startswith('shap_')])
                print(f"📊 Raw SHAP fields count: {shap_count}")
                if 'shap_ASIAN_CY_P' in sample_raw:
                    print(f"📊 Raw SHAP before filter - Record 1: shap_ASIAN_CY_P = {sample_raw['shap_ASIAN_CY_P']}")
                    if len(data['results']) > 1:
                        print(f"📊 Raw SHAP before filter - Record 2: shap_ASIAN_CY_P = {data['results'][1]['shap_ASIAN_CY_P']}")
            
            # Filter the data client-side to keep only specified fields
            print(f"🔄 Applying client-side filtering...")
            print(f"   📋 Original fields to keep: {len(fields_to_keep)}")
            if 'results' in data and len(data['results']) > 0:
                sample_raw = data['results'][0]
                shap_count = len([k for k in sample_raw.keys() if k.startswith('shap_')])
                total_raw_fields = len(sample_raw.keys())
                print(f"   📊 Raw response fields: {total_raw_fields}")
                print(f"   📊 SHAP fields in raw: {shap_count}")
            
            filtered_data = filter_data(data, fields_to_keep)
            
            if 'results' in filtered_data and len(filtered_data['results']) > 0:
                sample_filtered = filtered_data['results'][0]
                filtered_shap_count = len([k for k in sample_filtered.keys() if k.startswith('shap_')])
                total_filtered_fields = len(sample_filtered.keys())
                print(f"   ✅ Filtered fields total: {total_filtered_fields}")
                print(f"   ✅ SHAP fields preserved: {filtered_shap_count}")
            
            # Check the results
            if 'results' in filtered_data and filtered_data['results']:
                print(f"✅ Received {len(filtered_data['results'])} records")
                
                # Debug: Check SHAP values after filtering
                if len(filtered_data['results']) > 0 and 'shap_ASIAN_CY_P' in filtered_data['results'][0]:
                    print(f"📊 SHAP after filter - Record 1: shap_ASIAN_CY_P = {filtered_data['results'][0]['shap_ASIAN_CY_P']}")
                    if len(filtered_data['results']) > 1:
                        print(f"📊 SHAP after filter - Record 2: shap_ASIAN_CY_P = {filtered_data['results'][1]['shap_ASIAN_CY_P']}")
                
                # Verify we have per-record SHAP values
                sample_record = filtered_data['results'][0]
                shap_fields = [k for k in sample_record.keys() if k.startswith('shap_')]
                print(f"📊 SHAP fields per record: {len(shap_fields)}")
                
                if len(shap_fields) > 0:
                    print("✅ Confirmed: Per-record SHAP values present")
                    
                    # Show sample SHAP values from first record
                    print("\n📋 Sample SHAP values from first record:")
                    for i, field in enumerate(shap_fields[:5]):
                        print(f"   {field}: {sample_record[field]}")
                    if len(shap_fields) > 5:
                        print(f"   ... and {len(shap_fields) - 5} more SHAP fields")
                else:
                    print("⚠️ Warning: No per-record SHAP values found")
                
                # Save the data
                os.makedirs(OUTPUT_DIR, exist_ok=True)
                output_file = f"{OUTPUT_DIR}/feature-importance-ranking.json"
                
                with open(output_file, 'w') as f:
                    json.dump(filtered_data, f, indent=2, default=str)
                
                file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
                print(f"\n💾 Saved to {output_file} ({file_size:.2f} MB)")
                
                # Display feature importance summary
                if 'feature_importance' in filtered_data:
                    print("\n🏆 Top 10 Important Features:")
                    for i, feature in enumerate(filtered_data['feature_importance'][:10], 1):
                        print(f"   {i}. {feature['feature']}: {feature['importance']:.4f}")
                
                return True
            else:
                print("⚠️ No results in response")
                return False
                
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False

def main():
    """Main export function."""
    print("🚀 Starting Feature Importance Export")
    print("=" * 60)
    print(f"🌐 Microservice: {MICROSERVICE_URL}")
    print(f"🎯 Target: Feature importance with per-record SHAP values")
    print(f"📋 Using client-side field filtering for optimal SHAP calculation")
    
    success = export_feature_importance()
    
    if success:
        print("\n✅ Feature importance export complete!")
        print("📊 Next step: Run feature-importance-scores.js to calculate scores")
    else:
        print("\n❌ Feature importance export failed")
        print("💡 Check microservice logs and ensure it supports per-record SHAP calculations")

if __name__ == "__main__":
    main()