#!/usr/bin/env python3
"""
Create just spatial-clusters.json using microservice
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
OUTPUT_DIR = "/Users/voldeck/code/mpiq-ai-chat/public/data/endpoints"

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

config = {
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

if __name__ == "__main__":
    logger.info("🚀 Creating spatial-clusters.json...")
    
    result = call_microservice_endpoint(config["endpoint"], config["payload"])
    
    if result:
        # Add metadata
        result["export_metadata"] = {
            "endpoint_name": "spatial_clusters",
            "endpoint_path": config["endpoint"],
            "description": config["description"],
            "export_timestamp": datetime.now().isoformat(),
            "record_count": len(result.get("results", [])),
            "data_source": "microservice",
            "format_version": "1.0"
        }
        
        output_path = os.path.join(OUTPUT_DIR, "spatial-clusters.json")
        
        with open(output_path, 'w') as f:
            json.dump(result, f, indent=2)
        
        file_size_mb = round(os.path.getsize(output_path) / (1024 * 1024), 2)
        logger.info(f"✅ Created: {file_size_mb}MB → {output_path}")
    else:
        logger.error("❌ Failed to create spatial-clusters.json")