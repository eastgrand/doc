#!/usr/bin/env python3
"""
Test script to verify Phase 1 deployment fixes are working
Focuses on the specific endpoints we attempted to fix
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"
TIMEOUT = 45

def test_endpoint(endpoint, payload, description):
    """Test a single endpoint with specific payload"""
    print(f"\n{'='*60}")
    print(f"Testing: {description}")
    print(f"Endpoint: {endpoint}")
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
    print("🔧 Phase 1 Deployment Fixes Test")
    print(f"URL: {BASE_URL}")
    print(f"Time: {datetime.now()}")
    
    # Test the endpoints we specifically fixed
    tests = [
        # Test 1: /analyze endpoint (should work with field_utils import)
        {
            "endpoint": "/analyze",
            "payload": {
                "target_variable": "MP30034A_B_P",
                "features": ["MP26029", "MP27014"],
                "max_features": 5
            },
            "description": "Core Analysis with resolve_field_name fix"
        },
        
        # Test 2: /outlier-detection (missing resolve_field_name - should be fixed)
        {
            "endpoint": "/outlier-detection",
            "payload": {
                "target_variable": "MP30034A_B_P",
                "outlier_threshold": 2.0,
                "sample_size": 100
            },
            "description": "Outlier Detection - resolve_field_name fix"
        },
        
        # Test 3: /scenario-analysis (missing resolve_field_name - should be fixed) 
        {
            "endpoint": "/scenario-analysis",
            "payload": {
                "target_variable": "MP30034A_B_P",
                "scenarios": [{"MP26029": 50000}],
                "sample_size": 50
            },
            "description": "Scenario Analysis - resolve_field_name fix"
        },
        
        # Test 4: /segment-profiling (missing RandomForestRegressor - should be fixed)
        {
            "endpoint": "/segment-profiling",
            "payload": {
                "target_variable": "MP30034A_B_P",
                "n_segments": 3,
                "sample_size": 100
            },
            "description": "Segment Profiling - RandomForestRegressor import fix"
        },
        
        # Test 5: /comparative-analysis (missing grouping field - should be fixed)
        {
            "endpoint": "/comparative-analysis",
            "payload": {
                "variables": ["MP30034A_B_P", "MP30034A_B_N"],
                "sample_size": 100
            },
            "description": "Comparative Analysis - grouping field fix"
        },
        
        # Test 6: /spatial-clusters (NaN handling - should be fixed)
        {
            "endpoint": "/spatial-clusters",
            "payload": {
                "target_variable": "MP30034A_B_P",
                "n_clusters": 3,
                "sample_size": 100
            },
            "description": "Spatial Clusters - NaN handling fix"
        },
        
        # Test 7: /feature-interactions (was working - should still work)
        {
            "endpoint": "/feature-interactions",
            "payload": {
                "target_variable": "MP30034A_B_P",
                "features": ["MP26029", "MP27014"],
                "interaction_threshold": 0.1
            },
            "description": "Feature Interactions - should still work"
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
            "result": result
        })
        
        if success:
            successful += 1
    
    # Summary
    print(f"\n{'='*60}")
    print(f"🎯 PHASE 1 FIXES TEST SUMMARY")
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
    filename = f"phase1_fixes_test_{timestamp}.json"
    
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