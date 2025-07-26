#!/usr/bin/env python3
"""
Test script with corrected parameter names for Phase 1 fixes
Uses the parameter naming that actually works with the deployed service
"""

import requests
import json
from datetime import datetime

BASE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"
TIMEOUT = 45

def test_endpoint(endpoint, payload, description):
    """Test a single endpoint with specific payload"""
    print(f"\n{'='*60}")
    print(f"Testing: {description}")
    print(f"Endpoint: {endpoint}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    print(f"{'='*60}")
    
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}{endpoint}",
            headers=headers,
            json=payload,
            timeout=TIMEOUT
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ SUCCESS: {description}")
            print(f"Response keys: {list(result.keys())}")
            return True, result
        else:
            print(f"❌ FAILED: {description}")
            try:
                error_data = response.json()
                print(f"Error response: {error_data}")
            except:
                print(f"Error response: {response.text[:200]}...")
            return False, None
            
    except requests.exceptions.Timeout:
        print(f"⏰ TIMEOUT: {description} ({TIMEOUT}s)")
        return False, None
    except Exception as e:
        print(f"❌ ERROR: {description}")
        print(f"Exception: {str(e)}")
        return False, None

def main():
    print("🔧 Phase 1 Fixes Test - Corrected Parameters")
    print(f"URL: {BASE_URL}")
    print(f"Time: {datetime.now()}")
    
    # Test with corrected parameter names
    tests = [
        # Test 1: /feature-interactions (confirmed working with target_field)
        {
            "endpoint": "/feature-interactions",
            "payload": {
                "target_field": "MP30034A_B_P",
                "features": ["MP26029", "MP27014"],
                "interaction_threshold": 0.1
            },
            "description": "Feature Interactions - confirmed working"
        },
        
        # Test 2: /spatial-clusters (confirmed working)
        {
            "endpoint": "/spatial-clusters",
            "payload": {
                "target_field": "MP30034A_B_P",
                "n_clusters": 3,
                "sample_size": 100
            },
            "description": "Spatial Clusters - NaN handling fix working"
        },
        
        # Test 3: /analyze with target_field
        {
            "endpoint": "/analyze",
            "payload": {
                "target_field": "MP30034A_B_P",
                "features": ["MP26029", "MP27014"],
                "max_features": 5
            },
            "description": "Core Analysis - test with target_field"
        },
        
        # Test 4: /outlier-detection with target_field
        {
            "endpoint": "/outlier-detection",
            "payload": {
                "target_field": "MP30034A_B_P",
                "outlier_threshold": 2.0,
                "sample_size": 100
            },
            "description": "Outlier Detection - test with target_field"
        },
        
        # Test 5: /scenario-analysis with target_field
        {
            "endpoint": "/scenario-analysis",
            "payload": {
                "target_field": "MP30034A_B_P",
                "scenarios": [{"MP26029": 50000}],
                "sample_size": 50
            },
            "description": "Scenario Analysis - test with target_field"
        },
        
        # Test 6: /segment-profiling with target_field
        {
            "endpoint": "/segment-profiling",
            "payload": {
                "target_field": "MP30034A_B_P",
                "n_segments": 3,
                "sample_size": 100
            },
            "description": "Segment Profiling - test with target_field"
        },
        
        # Test 7: /comparative-analysis with fields instead of variables
        {
            "endpoint": "/comparative-analysis",
            "payload": {
                "fields": ["MP30034A_B_P", "MP30034A_B_N"],
                "sample_size": 100
            },
            "description": "Comparative Analysis - test with fields parameter"
        }
    ]
    
    results = []
    successful = 0
    
    for i, test in enumerate(tests, 1):
        print(f"\n📊 Test {i}/{len(tests)}")
        success, result = test_endpoint(
            test["endpoint"], 
            test["payload"], 
            test["description"]
        )
        
        results.append({
            "endpoint": test["endpoint"],
            "description": test["description"],
            "success": success,
            "payload": test["payload"]
        })
        
        if success:
            successful += 1
    
    # Summary
    print(f"\n{'='*60}")
    print(f"🎯 CORRECTED PARAMETERS TEST SUMMARY")
    print(f"{'='*60}")
    print(f"Total Tests: {len(tests)}")
    print(f"Successful: {successful}")
    print(f"Failed: {len(tests) - successful}")
    print(f"Success Rate: {(successful/len(tests)*100):.1f}%")
    
    print(f"\n📋 DETAILED RESULTS:")
    for result in results:
        status = "✅" if result["success"] else "❌"
        print(f"{status} {result['endpoint']} - {result['description']}")
    
    # Save results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"corrected_parameters_test_{timestamp}.json"
    
    with open(filename, 'w') as f:
        json.dump({
            "timestamp": timestamp,
            "total_tests": len(tests),
            "successful": successful,
            "success_rate": successful/len(tests)*100,
            "results": results
        }, f, indent=2)
    
    print(f"\n💾 Results saved to: {filename}")

if __name__ == "__main__":
    main() 