#!/usr/bin/env python3
"""
Complete Dataset Export Script
Gets ALL available demographic fields (548+) with SHAP analysis for every record
Focus: East Coast US zip codes with full demographic data
"""

import requests
import json
import re
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Microservice configuration
MICROSERVICE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"

def get_all_available_fields():
    """Get complete list of all available demographic fields"""
    logger.info("🔍 Discovering all available fields...")
    
    # Trigger error to get field list
    response = requests.post(
        f"{MICROSERVICE_URL}/analyze",
        headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},
        json={"query": "test", "matched_fields": ["INVALID_FIELD"]}
    )
    
    if response.status_code == 400:
        error_text = response.text
        logger.info(f"Got field discovery response: {len(error_text)} chars")
        
        # Extract field names from error message
        match = re.search(r'Available fields include: ([^"]+)', error_text)
        if match:
            field_text = match.group(1)
            # Parse field names (comma separated, truncated with ...)
            fields = [field.strip() for field in field_text.split(',')]
            fields = [f for f in fields if f and not f.endswith('...')]
            
            logger.info(f"✅ Discovered {len(fields)} field names from error response")
            return fields
        else:
            logger.error("Could not parse field names from error response")
            return []
    else:
        logger.error(f"Unexpected response: {response.status_code}")
        return []

def export_complete_dataset():
    """Export complete dataset with ALL available fields"""
    
    logger.info("🚀 COMPLETE DATASET EXPORT")
    logger.info("=" * 60)
    
    # Get all available fields
    available_fields = get_all_available_fields()
    if not available_fields:
        logger.error("❌ Could not discover available fields")
        return
    
    logger.info(f"📊 Will request {len(available_fields)} demographic fields")
    logger.info(f"Sample fields: {available_fields[:10]}")
    
    # Make comprehensive request for ALL fields
    logger.info("📤 Requesting complete dataset...")
    
    payload = {
        "query": "Complete demographic analysis for all East Coast regions",
        "analysis_type": "correlation", 
        "matched_fields": available_fields  # Request ALL discovered fields
    }
    
    try:
        response = requests.post(
            f"{MICROSERVICE_URL}/analyze",
            headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},
            json=payload,
            timeout=120  # Long timeout for comprehensive request
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success') and data.get('results'):
                results = data['results']
                logger.info(f"✅ SUCCESS: Got {len(results)} geographic records")
                
                # Check how many fields we actually got
                if results:
                    field_count = len(results[0].keys())
                    logger.info(f"📊 Fields per record: {field_count}")
                    logger.info(f"Sample record keys: {list(results[0].keys())[:15]}")
                
                # Save complete dataset
                output_file = "../public/data/complete-microservice-export.json"
                export_data = {
                    "export_info": {
                        "timestamp": datetime.now().isoformat(),
                        "total_records": len(results),
                        "fields_per_record": field_count if results else 0,
                        "requested_fields": len(available_fields),
                        "geographic_scope": "East Coast US Zip Codes",
                        "data_type": "Complete Demographic Dataset"
                    },
                    "complete_dataset": results
                }
                
                with open(output_file, 'w') as f:
                    json.dump(export_data, f, indent=2)
                
                file_size = round(len(json.dumps(export_data)) / (1024*1024), 1)
                logger.info(f"💾 Saved complete dataset: {output_file}")
                logger.info(f"📁 File size: {file_size}MB")
                logger.info(f"🎯 {len(results)} records × {field_count} fields = {len(results) * field_count:,} data points")
                
            else:
                logger.error(f"❌ No results returned: {data.get('error', 'Unknown error')}")
                
        else:
            logger.error(f"❌ HTTP {response.status_code}: {response.text[:200]}")
            
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Request failed: {e}")

def get_shap_analysis_for_all():
    """Get SHAP analysis for every record (not just 30 summary records)"""
    
    logger.info("🧠 GETTING SHAP ANALYSIS FOR ALL RECORDS")
    logger.info("=" * 60)
    
    # Request factor importance with SHAP values for all records
    payload = {
        "query": "SHAP analysis for all demographic factors",
        "analysis_type": "factor_importance",
        "return_all_records": True  # Try to get SHAP for every record
    }
    
    try:
        response = requests.post(
            f"{MICROSERVICE_URL}/factor-importance",
            headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},
            json=payload,
            timeout=120
        )
        
        if response.status_code == 200:
            data = response.json()
            logger.info(f"✅ SHAP Response: {len(data.get('results', []))} records")
            
            # Save SHAP data
            with open("../public/data/shap-analysis-all-records.json", 'w') as f:
                json.dump(data, f, indent=2)
                
            logger.info("💾 Saved SHAP analysis for all records")
            
        else:
            logger.error(f"❌ SHAP request failed: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ SHAP request failed: {e}")

if __name__ == "__main__":
    export_complete_dataset()
    get_shap_analysis_for_all()
    
    logger.info("🎉 EXPORT COMPLETE!")
    logger.info("Files created:")
    logger.info("  - ../public/data/complete-microservice-export.json")
    logger.info("  - ../public/data/shap-analysis-all-records.json") 