#!/usr/bin/env python3
"""
Create the 3 missing datasets using real microservice endpoints
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

# Map missing datasets to real microservice endpoints - ALIGNED WITH WORKING SCRIPT FORMAT
ENDPOINT_CONFIGS = {
    "brand_analysis": {
        "endpoint": "/competitive-analysis",
        "payload": {
            "query": "Brand performance analysis across ALL athletic footwear and apparel brands with competitive positioning",
            "analysis_type": "comparison",
            "target_variables": ALL_BRAND_FIELDS,
            "comparison_type": "multi_brand",
            "matched_fields": ALL_BRAND_FIELDS,
            "include_all_fields": True
        },
        "description": "Brand performance and positioning analysis - ALL BRANDS"
    },
    "market_sizing": {
        "endpoint": "/segment-profiling",
        "payload": {
            "query": "Market size estimation and total addressable market analysis for ALL brand categories",
            "analysis_type": "segmentation",
            "target_variables": ALL_BRAND_FIELDS,
            "segmentation_method": "demographic",
            "segment_count": 8,
            "matched_fields": ALL_BRAND_FIELDS,
            "include_all_fields": True
        },
        "description": "Market sizing and opportunity assessment - ALL BRANDS"
    },
    "real_estate_analysis": {
        "endpoint": "/spatial-clusters",
        "payload": {
            "query": "Real estate location analysis for retail expansion across ALL brand presence markets",
            "analysis_type": "clustering",
            "target_variable": "MP30034A_B_P",
            "target_variables": ALL_BRAND_FIELDS,
            "cluster_count": 8,
            "clustering_method": "kmeans",
            "matched_fields": ALL_BRAND_FIELDS,
            "include_all_fields": True
        },
        "description": "Real estate and location analysis - ALL BRANDS"
    }
}

def call_microservice_endpoint(endpoint, payload):
    """Call microservice endpoint with error handling and retries - ALIGNED WITH WORKING SCRIPT"""
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

def add_export_metadata(result, endpoint_name, config):
    """Add metadata aligned with working script format"""
    if not result:
        return None
        
    # Add metadata exactly like working script
    result["export_metadata"] = {
        "endpoint_name": endpoint_name,
        "endpoint_path": config["endpoint"],
        "description": config["description"],
        "export_timestamp": datetime.now().isoformat(),
        "record_count": len(result.get("results", [])),
        "data_source": "microservice",
        "format_version": "1.0"
    }
    
    # Add brand field coverage metadata like working script
    if result.get("results") and len(result["results"]) > 0:
        sample_record = result["results"][0]
        present_brand_fields = []
        
        for brand_field in ALL_BRAND_FIELDS:
            variations = [brand_field, brand_field.lower(), brand_field.lower().replace('_', '')]
            if any(var in sample_record for var in variations):
                present_brand_fields.append(brand_field)
        
        result['export_metadata']['brand_field_coverage'] = {
            'total_brand_fields': len(ALL_BRAND_FIELDS),
            'present_brand_fields': len(present_brand_fields),
            'coverage_percentage': round(len(present_brand_fields) / len(ALL_BRAND_FIELDS) * 100, 1),
            'available_brands': present_brand_fields,
            'missing_brands': [field for field in ALL_BRAND_FIELDS if field not in present_brand_fields]
        }
        
        logger.info(f"   📊 {endpoint_name}: Brand coverage {result['export_metadata']['brand_field_coverage']['coverage_percentage']}%")
    
    return result

if __name__ == "__main__":
    logger.info("🚀 Creating missing datasets using real microservice endpoints...")
    
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    success_count = 0
    for endpoint_name, config in ENDPOINT_CONFIGS.items():
        logger.info(f"\n📊 {endpoint_name.upper()}: {config['description']}")
        
        # Call the endpoint
        result = call_microservice_endpoint(config["endpoint"], config["payload"])
        
        if result:
            # Add metadata exactly like working script
            result = add_export_metadata(result, endpoint_name, config)
            
            # Save individual endpoint file with proper naming (dashes not underscores)
            output_filename = endpoint_name.replace('_', '-')
            individual_filepath = os.path.join(OUTPUT_DIR, f"{output_filename}.json")
            
            with open(individual_filepath, 'w') as f:
                json.dump(result, f, indent=2)
            
            file_size_mb = round(os.path.getsize(individual_filepath) / (1024 * 1024), 2)
            logger.info(f"   ✅ Individual dataset: {file_size_mb}MB → {individual_filepath}")
            
            success_count += 1
        else:
            logger.error(f"   ❌ Failed to export {endpoint_name}")
        
        # Rate limiting
        time.sleep(5)
    
    logger.info(f"\n✅ Dataset creation complete: {success_count}/{len(ENDPOINT_CONFIGS)} successful")