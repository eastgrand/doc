#!/usr/bin/env python3
"""
Comprehensive microservice data export script.
Calls multiple specialized endpoints to get complete data with SHAP values.
FOCUS: Get ALL 1084+ available fields, not just 12!
"""

import requests
import json
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Microservice configuration
MICROSERVICE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"

def call_microservice_endpoint(endpoint, payload):
    """Helper function to call any microservice endpoint"""
    try:
        logger.info(f"📤 Sending to {endpoint}: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            f"{MICROSERVICE_URL}{endpoint}",
            json=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {API_KEY}"
            },
            timeout=300
        )
        
        logger.info(f"📡 {endpoint} → Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            # Debug: Show what we got back
            if result.get('results') and len(result['results']) > 0:
                sample_record = result['results'][0]
                logger.info(f"🔍 Sample record fields: {list(sample_record.keys())}")
                logger.info(f"📊 Total field count in response: {len(sample_record)}")
            return result
        else:
            logger.error(f"❌ {endpoint} failed: {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"❌ {endpoint} error: {str(e)}")
        return None

def export_comprehensive_dataset():
    """Export complete dataset using all microservice endpoints"""
    
    logger.info("🚀 Starting comprehensive microservice data export...")
    logger.info("🎯 GOAL: Get ALL 1084+ available fields!")
    
    # Target variable for analysis
    nike_target = "MP30034A_B_P"
    
    export_data = {
        "export_timestamp": datetime.now().isoformat(),
        "microservice_url": MICROSERVICE_URL,
        "datasets": {}
    }
    
    # 1. Try completely minimal request - let microservice decide what to return
    logger.info("📊 1. Minimal request - let microservice return everything...")
    minimal_payload = {
        "query": "all data",
        "analysis_type": "correlation"
    }
    
    minimal_data = call_microservice_endpoint("/analyze", minimal_payload)
    if minimal_data:
        export_data["datasets"]["minimal_request"] = minimal_data
        logger.info(f"   ✅ Got {len(minimal_data.get('results', []))} records from minimal request")
    
    # 2. Try with explicit request for ALL fields
    logger.info("📊 2. Explicit request for ALL available demographic fields...")
    full_payload = {
        "query": "Export complete demographic dataset with all available socioeconomic, housing, income, education, employment, family structure, transportation, and brand purchase data across all geographic regions",
        "analysis_type": "correlation",
        "target_variable": nike_target,
        "include_all_fields": True,  # Try this flag
        "field_limit": None,  # Explicitly no limit
        "matched_fields": "*"  # Try wildcard
    }
    
    full_data = call_microservice_endpoint("/analyze", full_payload)
    if full_data:
        export_data["datasets"]["full_request"] = full_data
        logger.info(f"   ✅ Got {len(full_data.get('results', []))} records from full request")
    
    # 3. Try without any analysis_type to see raw data
    logger.info("📊 3. Raw data request without analysis type...")
    raw_payload = {
        "query": "raw complete dataset export",
        "export_format": "complete"
    }
    
    raw_data = call_microservice_endpoint("/analyze", raw_payload)
    if raw_data:
        export_data["datasets"]["raw_request"] = raw_data
        logger.info(f"   ✅ Got {len(raw_data.get('results', []))} records from raw request")
    
    # 4. Try a different endpoint that might have more fields
    logger.info("📊 4. Trying different endpoint for bulk export...")
    bulk_payload = {
        "regions": "all",
        "fields": "all",
        "format": "complete"
    }
    
    bulk_data = call_microservice_endpoint("/bulk-export", bulk_payload)
    if bulk_data:
        export_data["datasets"]["bulk_export"] = bulk_data
        logger.info(f"   ✅ Got data from bulk export endpoint")
    
    # 5. Try explicit field request (list specific field patterns)
    logger.info("📊 5. Requesting specific field patterns...")
    pattern_payload = {
        "query": "demographic analysis",
        "analysis_type": "correlation",
        "target_variable": nike_target,
        "matched_fields": [
            # Brand fields
            "MP30034A_B", "MP30034A_B_P", "MP30029A_B", "MP30029A_B_P", 
            # Demographics
            "TOTPOP_CY", "MEDDI_CY", "AVGDI_CY", "MEDHINC_CY", "AVGHINC_CY",
            # All MP fields (brand data)
            "*MP*",
            # All demographic fields
            "*POP*", "*INC*", "*EDU*", "*EMP*", "*HOU*", "*FAM*",
            # All geographic fields
            "*FSA*", "*PROV*", "*REGION*"
        ]
    }
    
    pattern_data = call_microservice_endpoint("/analyze", pattern_payload)
    if pattern_data:
        export_data["datasets"]["pattern_request"] = pattern_data
        logger.info(f"   ✅ Got {len(pattern_data.get('results', []))} records from pattern request")
    
    # 6. Get Nike factor importance with SHAP
    logger.info("🧠 6. Getting Nike factor importance with SHAP...")
    nike_importance_payload = {
        "target_field": nike_target,
        "method": "shap",
        "max_factors": 50  # Get more factors
    }
    
    nike_importance = call_microservice_endpoint("/factor-importance", nike_importance_payload)
    if nike_importance:
        export_data["datasets"]["nike_factor_importance"] = nike_importance
        factors_count = len(nike_importance.get('factors', []))
        logger.info(f"   ✅ Got {factors_count} Nike importance factors with SHAP")
    
    # Save complete export
    output_dir = "../public/data"
    os.makedirs(output_dir, exist_ok=True)
    output_file = f"{output_dir}/microservice-export-all-fields.json"
    
    with open(output_file, 'w') as f:
        json.dump(export_data, f, indent=2)
    
    # Calculate and display summary
    file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
    
    logger.info("🎉 COMPREHENSIVE EXPORT COMPLETED!")
    logger.info(f"📁 File: {output_file}")
    logger.info(f"💾 Size: {file_size:.1f}MB")
    logger.info("📊 Summary:")
    
    total_records = 0
    max_fields = 0
    
    for dataset_name, dataset in export_data["datasets"].items():
        if dataset and dataset.get('results'):
            records = len(dataset['results'])
            total_records += records
            
            if records > 0:
                field_count = len(dataset['results'][0])
                max_fields = max(max_fields, field_count)
                logger.info(f"   • {dataset_name}: {records} records with {field_count} fields each")
            else:
                logger.info(f"   • {dataset_name}: {records} records")
    
    logger.info(f"📈 Total records: {total_records}")
    logger.info(f"🏆 Maximum fields found: {max_fields}")
    
    if max_fields < 100:
        logger.warning("⚠️ Still not getting all fields! Maximum found is only {max_fields}")
        logger.warning("💡 The microservice may be filtering fields automatically")
    
    return True

if __name__ == "__main__":
    success = export_comprehensive_dataset()
    if success:
        print("\n✅ Complete export finished successfully!")
    else:
        print("\n❌ Export failed!") 