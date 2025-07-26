#!/usr/bin/env python3
"""
Microservice Field Discovery Script
Explores API endpoints to find how to access all 1084+ demographic fields
"""

import requests
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Microservice configuration
MICROSERVICE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"

def test_endpoint(endpoint_path, payload=None, method="GET"):
    """Test an API endpoint and return response info"""
    url = f"{MICROSERVICE_URL}{endpoint_path}"
    headers = {"X-API-Key": API_KEY, "Content-Type": "application/json"}
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=30)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        logger.info(f"📡 {method} {endpoint_path} -> {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                return {
                    "status": "success",
                    "status_code": response.status_code,
                    "data": data,
                    "size": len(str(data))
                }
            except:
                return {
                    "status": "success", 
                    "status_code": response.status_code,
                    "data": response.text[:500],
                    "size": len(response.text)
                }
        else:
            return {
                "status": "error",
                "status_code": response.status_code,
                "error": response.text[:200]
            }
            
    except Exception as e:
        return {
            "status": "exception",
            "error": str(e)
        }

def explore_api():
    """Explore different API endpoints and methods"""
    
    logger.info("🔍 MICROSERVICE API EXPLORATION")
    logger.info("=" * 50)
    
    # Test common API discovery endpoints
    discovery_endpoints = [
        "/",
        "/docs",
        "/swagger",
        "/openapi.json",
        "/spec",
        "/schema",
        "/info",
        "/health",
        "/status",
        "/fields",
        "/columns",
        "/data-schema",
        "/metadata"
    ]
    
    logger.info("📋 Testing discovery endpoints...")
    for endpoint in discovery_endpoints:
        result = test_endpoint(endpoint)
        if result["status"] == "success":
            logger.info(f"✅ {endpoint}: {result['size']} bytes")
            if endpoint in ["/", "/docs", "/schema", "/fields", "/columns"]:
                logger.info(f"   Content preview: {str(result['data'])[:200]}...")
        else:
            logger.info(f"❌ {endpoint}: {result.get('status_code', 'error')}")
    
    print()
    
    # Test analyze endpoint with different parameters to see available fields
    logger.info("🔬 Testing analyze endpoint variations...")
    
    analyze_tests = [
        # Test 1: Request with no field restrictions
        {
            "name": "No field restrictions",
            "payload": {
                "query": "Get all available demographic data",
                "analysis_type": "correlation",
                "target_variable": "MP30034A_B_P"
            }
        },
        # Test 2: Explicitly request all fields
        {
            "name": "Request all fields",
            "payload": {
                "query": "All demographic fields",
                "analysis_type": "correlation", 
                "target_variable": "MP30034A_B_P",
                "include_all_fields": True,
                "return_all_columns": True
            }
        },
        # Test 3: Request specific field count
        {
            "name": "Request field limit", 
            "payload": {
                "query": "Full dataset",
                "analysis_type": "correlation",
                "target_variable": "MP30034A_B_P",
                "max_fields": 1000,
                "limit": None
            }
        },
        # Test 4: Raw data request
        {
            "name": "Raw data request",
            "payload": {
                "query": "Raw demographic data",
                "analysis_type": "raw_data",
                "include_metadata": True,
                "full_schema": True
            }
        }
    ]
    
    for test in analyze_tests:
        logger.info(f"🧪 Testing: {test['name']}")
        result = test_endpoint("/analyze", test["payload"], "POST")
        
        if result["status"] == "success":
            data = result["data"]
            if "results" in data and len(data["results"]) > 0:
                field_count = len(data["results"][0].keys()) if data["results"][0] else 0
                logger.info(f"   ✅ {field_count} fields returned")
                if field_count > 12:
                    logger.info(f"   🎉 SUCCESS! Got more than 12 fields!")
                    logger.info(f"   Fields: {list(data['results'][0].keys())[:10]}...")
            else:
                logger.info(f"   ⚠️  No results in response")
        else:
            logger.info(f"   ❌ Failed: {result.get('error', 'Unknown error')}")
    
    print()
    
    # Test other endpoints with broader requests
    logger.info("🌐 Testing other endpoints for full data...")
    
    other_endpoints = [
        ("/factor-importance", {
            "query": "All demographic factors",
            "target_variable": "MP30034A_B_P",
            "include_all_features": True,
            "return_full_data": True
        }),
        ("/feature-interactions", {
            "query": "All feature interactions", 
            "include_all_fields": True
        }),
        ("/data-export", {}),
        ("/full-dataset", {}),
        ("/raw-data", {}),
        ("/schema", {}),
        ("/columns", {})
    ]
    
    for endpoint, payload in other_endpoints:
        if payload:
            result = test_endpoint(endpoint, payload, "POST")
        else:
            result = test_endpoint(endpoint, method="GET")
            
        if result["status"] == "success":
            logger.info(f"✅ {endpoint}: {result['size']} bytes")
        else:
            logger.info(f"❌ {endpoint}: {result.get('status_code', 'failed')}")

if __name__ == "__main__":
    explore_api()
    
    logger.info("\n🎯 SUMMARY")
    logger.info("The microservice appears to limit field returns in the /analyze endpoint.")
    logger.info("We need to find an endpoint or parameter that exposes all 1084+ demographic fields.")
    logger.info("Check the output above for any successful endpoints with more fields.") 