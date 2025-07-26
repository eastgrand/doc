#!/usr/bin/env python3
"""
Test 5 Key SHAP Microservice Endpoints
Quick verification that core functionality works with 5000 records
"""

import requests
import json
import time
from datetime import datetime

MICROSERVICE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"

def test_endpoint(endpoint, payload, description):
    """Test a single endpoint"""
    try:
        print(f"\n🧪 Testing {endpoint}: {description}")
        
        start_time = time.time()
        
        response = requests.post(
            f"{MICROSERVICE_URL}{endpoint}",
            json=payload,
            headers={
                "Content-Type": "application/json",
                "X-API-Key": API_KEY
            },
            timeout=120
        )
        
        duration = time.time() - start_time
        
        print(f"📡 Status: {response.status_code}, Duration: {duration:.2f}s")
        
        if response.status_code == 200:
            result = response.json()
            success = result.get('success', False)
            
            if success:
                results_count = len(result.get('results', []))
                sample_size = result.get('sample_size', 'unknown')
                analysis_type = result.get('analysis_type', 'unknown')
                
                print(f"✅ SUCCESS - {results_count} results, {sample_size} samples, type: {analysis_type}")
                return True
            else:
                error_msg = result.get('error', 'Unknown error')
                print(f"❌ FAILED - Error: {error_msg}")
                return False
        else:
            print(f"❌ FAILED - HTTP {response.status_code}: {response.text[:100]}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def main():
    print("🎯 Testing 5 Key SHAP Microservice Endpoints")
    print(f"🌐 URL: {MICROSERVICE_URL}")
    print(f"🕒 Time: {datetime.now()}")
    
    # Test configurations for 5 key endpoints
    test_configs = [
        {
            "endpoint": "/analyze",
            "payload": {
                "query": "analyze Nike sales",
                "analysis_type": "correlation",
                "sample_size": 5000
            },
            "description": "Core analysis with 5000 records"
        },
        {
            "endpoint": "/feature-interactions",
            "payload": {
                "target_variable": "CONVERSION_RATE",
                "features": ["total_population", "median_income"],
                "sample_size": 5000
            },
            "description": "Feature interactions with 5000 records"
        },
        {
            "endpoint": "/outlier-detection",
            "payload": {
                "target_variable": "CONVERSION_RATE",
                "sample_size": 5000
            },
            "description": "Outlier detection with 5000 records"
        },
        {
            "endpoint": "/spatial-clusters",
            "payload": {
                "target_variable": "CONVERSION_RATE",
                "features": ["total_population", "median_income"],
                "n_clusters": 5,
                "sample_size": 5000
            },
            "description": "Spatial clustering with 5000 records"
        },
        {
            "endpoint": "/competitive-analysis",
            "payload": {
                "target_variable": "CONVERSION_RATE",
                "sample_size": 5000
            },
            "description": "Competitive analysis with 5000 records"
        }
    ]
    
    successful_tests = 0
    
    for i, config in enumerate(test_configs, 1):
        print(f"\n{'='*60}")
        print(f"Test {i}/5: {config['endpoint']}")
        print(f"{'='*60}")
        
        success = test_endpoint(
            config["endpoint"],
            config["payload"],
            config["description"]
        )
        
        if success:
            successful_tests += 1
        
        time.sleep(1)  # Small delay between tests
    
    # Summary
    success_rate = (successful_tests / len(test_configs)) * 100
    
    print(f"\n🎯 FINAL RESULTS:")
    print(f"📊 Success Rate: {successful_tests}/{len(test_configs)} ({success_rate:.1f}%)")
    print(f"🎯 Target Achievement: {'✅ SUCCESS' if success_rate >= 80 else '❌ NEEDS WORK'}")
    
    if success_rate >= 80:
        print("🎉 Excellent! Core endpoints working with 5000-record processing")
    else:
        print("⚠️ Some endpoints need attention")
    
    return success_rate >= 80

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 