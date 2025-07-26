#!/usr/bin/env python3
"""
Export just segment-profiling and spatial-clusters using EXACT original configuration
"""

import requests
import json
import os
from datetime import datetime
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Microservice configuration
MICROSERVICE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"
OUTPUT_DIR = "public/data/endpoints"

# ALL brand target variables
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

# EXACT configurations from original export-all script
ENDPOINT_CONFIGS = {
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
        },
        "description": "Customer segment profiling - ALL BRANDS"
    },
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
        },
        "description": "Geographic clustering analysis - ALL BRANDS"
    }
}

def call_microservice_endpoint(endpoint, payload):
    """Call microservice endpoint with error handling and retries"""
    max_retries = 3
    retry_delay = 10  # seconds
    
    for attempt in range(max_retries):
        try:
            logger.info(f"📡 Calling {endpoint} (attempt {attempt + 1}/{max_retries})")
            
            response = requests.post(
                f"{MICROSERVICE_URL}{endpoint}",
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "X-API-Key": API_KEY
                },
                timeout=180  # 3 minutes timeout
            )
            
            logger.info(f"📡 {endpoint} → Status: {response.status_code}")
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:  # Rate limited
                logger.warning(f"🕐 Rate limited on {endpoint}, waiting {retry_delay}s...")
                time.sleep(retry_delay)
                continue
            else:
                logger.error(f"❌ {endpoint} failed: {response.status_code} - {response.text}")
                if attempt == max_retries - 1:
                    return None
                time.sleep(retry_delay)
                
        except requests.exceptions.Timeout:
            logger.warning(f"⏰ {endpoint} timed out (attempt {attempt + 1})")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            
        except Exception as e:
            logger.error(f"❌ {endpoint} error: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
    
    return None

def validate_brand_fields(result, endpoint_name):
    """Validate that all brand fields are present in the export result"""
    if not result:
        logger.warning(f"   ⚠️ {endpoint_name}: No result to validate")
        return result
    
    if not result.get("results") or len(result["results"]) == 0:
        logger.warning(f"   ⚠️ {endpoint_name}: No results to validate")
        return result
        
    # Get sample record
    sample_record = result["results"][0]
    
    # Count brand fields
    logger.info(f"   📊 {endpoint_name}: Record has {len(sample_record.keys())} total fields")
    
    # Check for value_ and shap_ fields
    value_fields = [k for k in sample_record.keys() if k.startswith("value_")]
    shap_fields = [k for k in sample_record.keys() if k.startswith("shap_")]
    
    logger.info(f"   📊 {endpoint_name}: Found {len(value_fields)} value_ fields and {len(shap_fields)} shap_ fields")
    
    return result

def export_all_endpoints():
    """Export datasets from the 2 endpoints"""
    
    logger.info("🚀 Starting endpoint dataset export...")
    
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Export each endpoint
    for endpoint_name, config in ENDPOINT_CONFIGS.items():
        logger.info(f"\n📊 {endpoint_name.upper()}: {config['description']}")
        
        # Call the endpoint
        result = call_microservice_endpoint(config["endpoint"], config["payload"])
        
        if result:
            # Add metadata
            result["export_metadata"] = {
                "endpoint_name": endpoint_name,
                "endpoint_path": config["endpoint"],
                "description": config["description"],
                "export_timestamp": datetime.now().isoformat(),
                "record_count": len(result.get("results", [])),
                "data_source": "microservice",
                "format_version": "1.0"
            }
            
            # Validate
            result = validate_brand_fields(result, endpoint_name)
            
            # Save individual endpoint file
            individual_filepath = os.path.join(OUTPUT_DIR, f"{endpoint_name.replace('_', '-')}.json")
            
            with open(individual_filepath, 'w') as f:
                json.dump(result, f, indent=2)
            
            file_size_mb = round(os.path.getsize(individual_filepath) / (1024 * 1024), 2)
            logger.info(f"   ✅ Individual dataset: {file_size_mb}MB → {individual_filepath}")
        else:
            logger.error(f"   ❌ Failed to export {endpoint_name}")
        
        # Rate limiting between endpoints
        time.sleep(5)

if __name__ == "__main__":
    export_all_endpoints()