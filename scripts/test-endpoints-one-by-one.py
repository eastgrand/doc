#!/usr/bin/env python3
"""
Conservative endpoint testing - one at a time with delays
Prevents memory overload by testing endpoints sequentially with recovery time
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"
TIMEOUT = 120  # Extended timeout
DELAY_BETWEEN_TESTS = 15  # 15 second delay between tests

def test_single_endpoint(endpoint, payload, description):
    """Test a single endpoint with conservative approach"""
    print(f"\n{'='*60}")
    print(f"🧪 Testing: {description}")
    print(f"📍 Endpoint: {endpoint}")
    print(f"📊 Sample Size: {payload.get('sample_size', 'Default')}")
    print(f"⏰ {datetime.now().strftime('%H:%M:%S')}")
    print(f"{'='*60}")
    
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
    }
    
    start_time = time.time()
    try:
        print("📤 Sending request...")
        response = requests.post(
            f"{BASE_URL}{endpoint}",
            headers=headers,
            json=payload,
            timeout=TIMEOUT
        )
        duration = time.time() - start_time
        
        print(f"📈 Status: {response.status_code}")
        print(f"⏱️  Duration: {duration:.1f}s")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"✅ SUCCESS!")
                
                # Show response summary
                if isinstance(result, dict):
                    print(f"📦 Response contains {len(result)} keys")
                    for key, value in list(result.items())[:3]:
                        if isinstance(value, list):
                            print(f"   - {key}: {len(value)} items")
                        elif isinstance(value, dict):
                            print(f"   - {key}: {len(value)} properties")
                        else:
                            print(f"   - {key}: {type(value).__name__}")
                
                return {
                    "success": True,
                    "duration": duration,
                    "status_code": response.status_code,
                    "error": None
                }
                
            except json.JSONDecodeError as e:
                print(f"❌ JSON parsing failed: {str(e)[:50]}")
                return {
                    "success": False,
                    "duration": duration,
                    "status_code": response.status_code,
                    "error": f"JSON decode error"
                }
        else:
            error_snippet = response.text[:100] if response.text else "No error message"
            print(f"❌ Failed: HTTP {response.status_code}")
            print(f"💬 Error: {error_snippet}")
            
            return {
                "success": False,
                "duration": duration,
                "status_code": response.status_code,
                "error": f"HTTP {response.status_code}: {error_snippet}"
            }
            
    except requests.exceptions.Timeout:
        duration = time.time() - start_time
        print(f"⏰ TIMEOUT after {duration:.1f}s")
        return {
            "success": False,
            "duration": duration,
            "error": "Request timeout"
        }
    except Exception as e:
        duration = time.time() - start_time
        print(f"💥 ERROR: {str(e)[:50]}")
        return {
            "success": False,
            "duration": duration,
            "error": str(e)[:100]
        }

def main():
    """Test endpoints one by one with conservative approach"""
    
    print("🎯 Conservative SHAP Microservice Testing")
    print("Testing endpoints one at a time to prevent memory overload")
    print("=" * 60)
    
    # Conservative endpoint list - start with known working ones
    test_configs = [
        # Start with previously working endpoints
        {
            "endpoint": "/outlier-detection",
            "payload": {
                "target_field": "MP30034A_B_P",
                "outlier_threshold": 0.1,
                "sample_size": 100  # Small sample
            },
            "description": "Outlier detection (small sample)"
        },
        {
            "endpoint": "/feature-interactions",
            "payload": {
                "target_field": "MP30034A_B_P",
                "features": ["MP26029", "MP27014"],
                "interaction_threshold": 0.1,
                "sample_size": 100
            },
            "description": "Feature interactions (small sample)"
        },
        {
            "endpoint": "/analyze",
            "payload": {
                "target_field": "MP30034A_B_P",
                "features": ["MP26029", "MP27014"], 
                "max_features": 5,
                "sample_size": 100
            },
            "description": "Basic SHAP analysis (small sample)"
        },
        {
            "endpoint": "/spatial-clusters",
            "payload": {
                "target_field": "MP30034A_B_P",
                "features": ["MP26029", "MP27014"],
                "n_clusters": 3,
                "sample_size": 100
            },
            "description": "Spatial clustering (small sample)"
        },
        {
            "endpoint": "/comparative-analysis",
            "payload": {
                "target_field": "MP30034A_B_P",
                "grouping_field": "MP25035",
                "sample_size": 100
            },
            "description": "Comparative analysis (small sample)"
        },
        {
            "endpoint": "/competitive-analysis",
            "payload": {
                "target_field": "MP30034A_B_P",
                "competitor_fields": ["MP30034B_B_P"],
                "sample_size": 100
            },
            "description": "Competitive analysis (small sample)"
        },
        # Additional endpoints with very conservative settings
        {
            "endpoint": "/segment-profiling",
            "payload": {
                "target_field": "MP30034A_B_P",
                "segmentation_features": ["MP25035"],
                "sample_size": 50  # Very small
            },
            "description": "Segment profiling (very small sample)"
        },
        {
            "endpoint": "/scenario-analysis",
            "payload": {
                "target_field": "MP30034A_B_P",
                "scenarios": [
                    {"MP26029": 1.5}
                ],
                "sample_size": 50
            },
            "description": "Scenario analysis (very small sample)"
        }
    ]
    
    results = []
    working_count = 0
    
    for i, config in enumerate(test_configs, 1):
        print(f"\n🔄 [{i}/{len(test_configs)}] Starting test...")
        
        result = test_single_endpoint(
            config["endpoint"],
            config["payload"],
            config["description"]
        )
        
        results.append({
            "endpoint": config["endpoint"],
            "description": config["description"],
            "sample_size": config["payload"].get("sample_size"),
            **result
        })
        
        if result["success"]:
            working_count += 1
            print(f"🎉 Working endpoints so far: {working_count}/{i}")
        else:
            print(f"⚠️  Failed endpoints so far: {i - working_count}/{i}")
        
        # Conservative delay between tests
        if i < len(test_configs):
            print(f"\n⏳ Waiting {DELAY_BETWEEN_TESTS}s before next test...")
            time.sleep(DELAY_BETWEEN_TESTS)
    
    # Final summary
    print(f"\n{'='*60}")
    print("🎯 CONSERVATIVE TEST SUMMARY")
    print(f"{'='*60}")
    
    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]
    
    print(f"✅ Working endpoints: {len(successful)}/{len(results)} ({len(successful)/len(results)*100:.1f}%)")
    print(f"❌ Failed endpoints: {len(failed)}/{len(results)} ({len(failed)/len(results)*100:.1f}%)")
    
    if successful:
        print(f"\n🏆 WORKING ENDPOINTS:")
        for result in successful:
            print(f"  ✅ {result['endpoint']} ({result['sample_size']} samples) - {result['duration']:.1f}s")
    
    if failed:
        print(f"\n💥 FAILED ENDPOINTS:")
        for result in failed:
            print(f"  ❌ {result['endpoint']} - {result['error']}")
    
    # Save results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"conservative_endpoint_test_{timestamp}.json"
    
    test_summary = {
        "timestamp": timestamp,
        "approach": "conservative_one_by_one",
        "delay_between_tests": DELAY_BETWEEN_TESTS,
        "total_endpoints": len(results),
        "working_endpoints": len(successful),
        "failed_endpoints": len(failed),
        "success_rate_percent": len(successful)/len(results)*100,
        "detailed_results": results
    }
    
    with open(filename, 'w') as f:
        json.dump(test_summary, f, indent=2)
    
    print(f"\n📁 Results saved to: {filename}")
    
    if successful:
        print(f"\n🎯 NEXT STEPS:")
        print(f"  - {len(successful)} endpoints are working with small samples")
        print(f"  - Can gradually increase sample sizes for working endpoints")
        print(f"  - Focus on fixing the {len(failed)} failed endpoints")
    
    return test_summary

if __name__ == "__main__":
    main() 