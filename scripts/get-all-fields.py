#!/usr/bin/env python3
"""
Get All Available Fields from Microservice
Triggers an error that lists all 1084+ available demographic fields
"""

import requests
import json
import re
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Microservice configuration
MICROSERVICE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"

def get_all_fields():
    """Trigger error response to get list of all available fields"""
    
    logger.info("🎯 TRIGGERING FIELD LIST ERROR")
    logger.info("=" * 50)
    
    # Send request with invalid field to trigger error listing all available fields
    payload = {
        "query": "Get all demographic data",
        "analysis_type": "correlation",
        "target_variable": "INVALID_FIELD_NAME",  # This will trigger the error
        "matched_fields": ["ANOTHER_INVALID_FIELD"]  # This too
    }
    
    headers = {"X-API-Key": API_KEY, "Content-Type": "application/json"}
    
    try:
        response = requests.post(
            f"{MICROSERVICE_URL}/analyze",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        logger.info(f"📡 Response status: {response.status_code}")
        
        if response.status_code == 400:
            error_text = response.text
            logger.info("✅ Got expected 400 error with field list!")
            
            # Extract available fields from error message
            # Look for pattern: "Available fields include: field1, field2, ..."
            match = re.search(r'Available fields include:\s*([^.]+)', error_text)
            if match:
                fields_text = match.group(1)
                logger.info(f"📋 Raw fields text: {fields_text[:200]}...")
                
                # Parse field names - they're comma separated
                fields = [field.strip() for field in fields_text.split(',')]
                
                # Clean up any trailing text like "(total: X fields)"
                clean_fields = []
                for field in fields:
                    # Remove any parenthetical information
                    clean_field = re.sub(r'\s*\([^)]*\).*$', '', field)
                    if clean_field and not clean_field.startswith('('):
                        clean_fields.append(clean_field)
                
                logger.info(f"🎉 FOUND {len(clean_fields)} AVAILABLE FIELDS!")
                logger.info("📊 Sample fields:")
                for i, field in enumerate(clean_fields[:20]):
                    logger.info(f"   {i+1:2d}. {field}")
                
                if len(clean_fields) > 20:
                    logger.info(f"   ... and {len(clean_fields) - 20} more fields")
                
                # Save all fields to a file
                output_file = "../public/data/all-microservice-fields.json"
                field_data = {
                    "timestamp": "2025-07-15T13:55:00",
                    "total_fields": len(clean_fields),
                    "fields": clean_fields,
                    "source": "microservice_error_response"
                }
                
                with open(output_file, 'w') as f:
                    json.dump(field_data, f, indent=2)
                
                logger.info(f"💾 Saved all fields to: {output_file}")
                
                return clean_fields
            else:
                logger.error("❌ Could not parse field list from error message")
                logger.info(f"Full error text: {error_text}")
                return []
        else:
            logger.error(f"❌ Unexpected response: {response.status_code}")
            logger.info(f"Response: {response.text[:500]}")
            return []
            
    except Exception as e:
        logger.error(f"❌ Exception: {e}")
        return []

if __name__ == "__main__":
    fields = get_all_fields()
    
    if fields:
        logger.info(f"\n🎯 SUCCESS: Retrieved {len(fields)} field names!")
        logger.info("These are ALL the demographic fields available in the microservice.")
        logger.info("Now we can modify our export script to request specific fields.")
    else:
        logger.error("\n❌ FAILED: Could not retrieve field list")
        logger.info("The microservice may have changed its error message format.") 