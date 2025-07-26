#!/usr/bin/env python3
"""
Production-scale test for 5000-record datasets
Tests the two working endpoints with maximum production workload
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"
TIMEOUT = 180  # Extended timeout for production loads

def test_production_endpoint(endpoint, payload, description):
    """Test a single endpoint with production-scale payload"""
    print(f"\n{'='*80}")
    print(f"🚀 PRODUCTION SCALE TEST")
    print(f"Endpoint: {endpoint}")
    print(f"Description: {description}")
    print(f"Sample Size: {payload.get('sample_size', 'Not specified')}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*80}")
    
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
    }
    
    start_time = time.time()
    try:
        print(f"📊 Sending request...")
        response = requests.post(
            f"{BASE_URL}{endpoint}",
            headers=headers,
            json=payload,
            timeout=TIMEOUT
        )
        duration = time.time() - start_time
        
        print(f"⏱️  Response time: {duration:.2f} seconds")
        print(f"📈 Status code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                
                # Analyze response structure
                if isinstance(result, dict):
                    print(f"✅ SUCCESS - Response structure:")
                    for key, value in result.items():
                        if isinstance(value, list):
                            print(f"   - {key}: {len(value)} items")
                        elif isinstance(value, dict):
                            print(f"   - {key}: {len(value)} keys")
                        else:
                            print(f"   - {key}: {type(value).__name__}")
                
                return {
                    "success": True,
                    "duration": duration,
                    "status_code": response.status_code,
                    "response_size": len(json.dumps(result)),
                    "error": None
                }
                
            except json.JSONDecodeError as e:
                print(f"❌ JSON decode error: {e}")
                return {
                    "success": False,
                    "duration": duration,
                    "status_code": response.status_code,
                    "error": f"JSON decode error: {e}"
                }
        else:
            error_text = response.text[:500]
            print(f"❌ HTTP {response.status_code} - {error_text}")
            return {
                "success": False,
                "duration": duration,
                "status_code": response.status_code,
                "error": error_text
            }
            
    except requests.exceptions.Timeout:
        duration = time.time() - start_time
        print(f"❌ TIMEOUT after {duration:.2f} seconds")
        return {
            "success": False,
            "duration": duration,
            "error": "Timeout"
        }
    except Exception as e:
        duration = time.time() - start_time
        print(f"❌ ERROR: {e}")
        return {
            "success": False,
            "duration": duration,
            "error": str(e)
        }

def main():
    """Run production-scale tests"""
    
    print("🎯 SHAP Microservice Production Scale Test")
    print("Testing endpoints with 5000-record datasets")
    print("=" * 80)
    
    # Test configurations for production scale
    test_configs = [
        {
            "endpoint": "/outlier-detection",
            "payload": {
                "target_field": "MP30034A_B_P",
                "outlier_threshold": 0.1,
                "sample_size": 5000
            },
            "description": "Outlier detection with full production dataset"
        },
        {
            "endpoint": "/feature-interactions", 
            "payload": {
                "target_field": "MP30034A_B_P",
                "features": ["MP26029", "MP27014", "MP40025", "MP25035"],
                "interaction_threshold": 0.1,
                "sample_size": 5000
            },
            "description": "Feature interactions with full production dataset"
        },
        # Test with intermediate sizes to find the exact limit
        {
            "endpoint": "/outlier-detection",
            "payload": {
                "target_field": "MP30034A_B_P", 
                "outlier_threshold": 0.1,
                "sample_size": 3000
            },
            "description": "Outlier detection with 3000 samples (60% of production)"
        },
        {
            "endpoint": "/feature-interactions",
            "payload": {
                "target_field": "MP30034A_B_P",
                "features": ["MP26029", "MP27014"],
                "interaction_threshold": 0.1,
                "sample_size": 3000
            },
            "description": "Feature interactions with 3000 samples (60% of production)"
        }
    ]
    
    results = []
    
    for config in test_configs:
        result = test_production_endpoint(
            config["endpoint"],
            config["payload"], 
            config["description"]
        )
        
        results.append({
            "endpoint": config["endpoint"],
            "sample_size": config["payload"].get("sample_size"),
            "description": config["description"],
            **result
        })
        
        # Brief pause between tests
        time.sleep(5)
    
    # Summary report
    print(f"\n{'='*80}")
    print("🎯 PRODUCTION SCALE TEST SUMMARY")
    print(f"{'='*80}")
    
    successful_tests = [r for r in results if r["success"]]
    failed_tests = [r for r in results if not r["success"]]
    
    print(f"✅ Successful tests: {len(successful_tests)}/{len(results)}")
    print(f"❌ Failed tests: {len(failed_tests)}/{len(results)}")
    
    if successful_tests:
        print(f"\n🏆 SUCCESSFUL PRODUCTION TESTS:")
        for result in successful_tests:
            print(f"  ✅ {result['endpoint']} ({result['sample_size']} samples): {result['duration']:.1f}s")
    
    if failed_tests:
        print(f"\n💥 FAILED PRODUCTION TESTS:")
        for result in failed_tests:
            print(f"  ❌ {result['endpoint']} ({result['sample_size']} samples): {result['error']}")
    
    # Production readiness assessment
    max_working_size = 0
    for result in successful_tests:
        if result['sample_size'] > max_working_size:
            max_working_size = result['sample_size']
    
    print(f"\n📊 PRODUCTION READINESS ASSESSMENT:")
    print(f"  Maximum confirmed working size: {max_working_size} samples")
    print(f"  Production requirement: 5000 samples")
    
    if max_working_size >= 5000:
        print(f"  🎉 PRODUCTION READY - Can handle full 5000-record datasets!")
    elif max_working_size >= 3000:
        print(f"  ⚠️  PARTIALLY READY - Can handle {max_working_size} samples (needs optimization for full 5000)")
    else:
        print(f"  ❌ NOT READY - Maximum {max_working_size} samples (major optimization needed)")
    
    # Save results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"production_scale_test_{timestamp}.json"
    
    test_summary = {
        "timestamp": timestamp,
        "production_requirement": 5000,
        "max_working_size": max_working_size,
        "total_tests": len(results),
        "successful_tests": len(successful_tests),
        "failed_tests": len(failed_tests),
        "production_ready": max_working_size >= 5000,
        "detailed_results": results
    }
    
    with open(filename, 'w') as f:
        json.dump(test_summary, f, indent=2)
    
    print(f"\n📁 Results saved to: {filename}")
    
    return test_summary

if __name__ == "__main__":
    main() 