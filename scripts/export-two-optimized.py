#!/usr/bin/env python3
"""
Export optimized segment-profiling and spatial-clusters datasets
Using the field filtering from export-optimized-datasets.py
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

# Just the two endpoints we need
ENDPOINT_CONFIGS = {
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
            "include_all_fields": True
        },
        "description": "Geographic clustering analysis - ALL BRANDS"
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
            "include_all_fields": True
        },
        "description": "Customer segment profiling - ALL BRANDS"
    }
}

def optimize_results(results: List[Dict], fields_to_keep: set) -> List[Dict]:
    """Optimize results by keeping only specified fields."""
    optimized_results = []
    
    for record in results:
        optimized_record = {}
        for field in fields_to_keep:
            if field in record:
                optimized_record[field] = record[field]
        optimized_results.append(optimized_record)
    
    return optimized_results

def fetch_and_optimize_endpoint(endpoint_name: str, config: Dict[str, Any], fields_to_keep: set):
    """Fetch data from an endpoint and optimize it."""
    url = f"{MICROSERVICE_URL}{config['endpoint']}"
    
    print(f"\n📡 Calling {endpoint_name} at {config['endpoint']}...")
    
    try:
        response = requests.post(url, json=config['payload'], headers=HEADERS, timeout=300)
        
        if response.status_code == 200:
            data = response.json()
            
            # Get original size info
            original_results = data.get('results', [])
            if not original_results:
                print(f"❌ No results returned for {endpoint_name}")
                return
            
            original_fields = len(original_results[0]) if original_results else 0
            print(f"✅ Received {len(original_results)} records with {original_fields} fields each")
            
            # Optimize results
            optimized_results = optimize_results(original_results, fields_to_keep)
            data['results'] = optimized_results
            
            optimized_fields = len(optimized_results[0]) if optimized_results else 0
            print(f"🔄 Optimized to {optimized_fields} fields per record")
            
            # Save optimized data
            output_path = os.path.join(OUTPUT_DIR, f"{endpoint_name.replace('_', '-')}.json")
            with open(output_path, 'w') as f:
                json.dump(data, f, indent=2)
            
            # Calculate file size
            file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
            print(f"💾 Saved to {output_path} ({file_size_mb:.2f} MB)")
            
            # Show reduction
            reduction_pct = ((original_fields - optimized_fields) / original_fields) * 100
            print(f"📉 Field reduction: {reduction_pct:.1f}%")
            
        else:
            print(f"❌ {endpoint_name} failed with status {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error processing {endpoint_name}: {str(e)}")

def main():
    """Main execution function."""
    print("🚀 Starting optimized export for segment-profiling and spatial-clusters...")
    
    # Load fields to keep
    fields_to_keep = load_fields_to_keep()
    if not fields_to_keep:
        print("❌ Cannot proceed without field list")
        return
    
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Process each endpoint
    for endpoint_name, config in ENDPOINT_CONFIGS.items():
        fetch_and_optimize_endpoint(endpoint_name, config, fields_to_keep)
        time.sleep(5)  # Rate limiting
    
    print("\n✅ Export complete!")

if __name__ == "__main__":
    main()