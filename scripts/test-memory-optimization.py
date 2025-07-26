#!/usr/bin/env python3
"""
Test script for memory optimization 
Tests endpoints with progressively larger sample sizes to find memory limits
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"
TIMEOUT = 120  # Increased timeout for larger samples

def test_endpoint_with_sample_size(endpoint, payload, description, sample_size):
    """Test a single endpoint with specific sample size"""
    print(f"\n{'='*80}")
    print(f"Testing: {description}")
    print(f"Endpoint: {endpoint}")
    print(f"Sample Size: {sample_size}")
    print(f"{'='*80}")
    
    # Update payload with sample size
    test_payload = payload.copy()
    test_payload['sample_size'] = sample_size
    
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
    }
    
    start_time = time.time()
    
    try:
        response = requests.post(
            f"{BASE_URL}{endpoint}",
            headers=headers,
            json=test_payload,
            timeout=TIMEOUT
        )
        
        end_time = time.time()
        duration = end_time - start_time
        
        print(f"Status Code: {response.status_code}")
        print(f"Duration: {duration:.1f}s")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ SUCCESS: {description} (sample_size={sample_size})")
            
            # Extract key metrics
            if 'outliers' in result:
                print(f"   Found {len(result['outliers'])} outliers")
            elif 'clusters' in result:
                print(f"   Found {len(result['clusters'])} clusters")
            elif 'interactions' in result:
                print(f"   Found {len(result['interactions'])} interactions")
            elif 'shap_analysis' in result:
                print(f"   Analysis complete with SHAP data")
            
            return True, duration, None
        else:
            print(f"❌ FAILED: {description} (sample_size={sample_size})")
            try:
                error_data = response.json()
                error_msg = error_data.get('error', 'Unknown error')
                print(f"   Error: {error_msg}")
                return False, duration, error_msg
            except:
                print(f"   Error response: {response.text[:200]}...")
                return False, duration, response.text[:200]
                
    except requests.exceptions.Timeout:
        print(f"⏰ TIMEOUT: {description} (sample_size={sample_size}) after {TIMEOUT}s")
        return False, TIMEOUT, "Timeout"
    except Exception as e:
        print(f"❌ ERROR: {description} (sample_size={sample_size})")
        print(f"   Exception: {str(e)}")
        return False, 0, str(e)

def find_memory_limit(endpoint, base_payload, description):
    """Find the maximum sample size that works for an endpoint"""
    print(f"\n🔍 Finding memory limit for {endpoint}")
    
    # Test with increasing sample sizes
    sample_sizes = [50, 100, 200, 300, 500, 800, 1000, 1500, 2000]
    results = []
    
    max_working_size = 0
    
    for sample_size in sample_sizes:
        success, duration, error = test_endpoint_with_sample_size(
            endpoint, base_payload, description, sample_size
        )
        
        results.append({
            'sample_size': sample_size,
            'success': success,
            'duration': duration,
            'error': error
        })
        
        if success:
            max_working_size = sample_size
            print(f"   ✅ {sample_size} samples: {duration:.1f}s")
        else:
            print(f"   ❌ {sample_size} samples: {error}")
            # If we hit memory issues, stop testing larger sizes
            if 'memory' in str(error).lower() or 'timeout' in str(error).lower():
                break
        
        # Brief pause between tests
        time.sleep(2)
    
    print(f"\n📊 Maximum working sample size for {endpoint}: {max_working_size}")
    return max_working_size, results

def main():
    print("🧪 Memory Optimization Test Suite")
    print(f"URL: {BASE_URL}")
    print(f"Time: {datetime.now()}")
    print(f"Timeout: {TIMEOUT}s")
    
    # Define test endpoints and their payloads
    endpoints_to_test = [
        {
            'endpoint': '/outlier-detection',
            'payload': {
                'target_field': 'MP30034A_B_P',
                'outlier_threshold': 0.1
            },
            'description': 'Outlier Detection Memory Test'
        },
        {
            'endpoint': '/spatial-clusters',
            'payload': {
                'target_field': 'MP30034A_B_P',
                'n_clusters': 3
            },
            'description': 'Spatial Clusters Memory Test'
        },
        {
            'endpoint': '/scenario-analysis',
            'payload': {
                'target_field': 'MP30034A_B_P',
                'scenarios': [{'MP26029': 50000}]
            },
            'description': 'Scenario Analysis Memory Test'
        },
        {
            'endpoint': '/segment-profiling',
            'payload': {
                'target_field': 'MP30034A_B_P',
                'n_segments': 3
            },
            'description': 'Segment Profiling Memory Test'
        },
        {
            'endpoint': '/feature-interactions',
            'payload': {
                'target_field': 'MP30034A_B_P',
                'features': ['MP26029', 'MP27014'],
                'interaction_threshold': 0.1
            },
            'description': 'Feature Interactions Memory Test'
        }
    ]
    
    # Test each endpoint
    memory_limits = {}
    all_results = {}
    
    for test_config in endpoints_to_test:
        endpoint = test_config['endpoint']
        payload = test_config['payload']
        description = test_config['description']
        
        max_size, results = find_memory_limit(endpoint, payload, description)
        memory_limits[endpoint] = max_size
        all_results[endpoint] = results
    
    # Summary
    print(f"\n{'='*80}")
    print(f"🎯 MEMORY OPTIMIZATION TEST SUMMARY")
    print(f"{'='*80}")
    
    total_endpoints = len(endpoints_to_test)
    working_endpoints = sum(1 for limit in memory_limits.values() if limit > 0)
    
    print(f"Total Endpoints Tested: {total_endpoints}")
    print(f"Working Endpoints: {working_endpoints}")
    print(f"Success Rate: {(working_endpoints/total_endpoints*100):.1f}%")
    
    print(f"\n📋 MEMORY LIMITS BY ENDPOINT:")
    for endpoint, max_size in memory_limits.items():
        if max_size > 0:
            print(f"✅ {endpoint}: {max_size} samples")
        else:
            print(f"❌ {endpoint}: Failed at minimum size")
    
    # Recommendations
    print(f"\n💡 RECOMMENDATIONS:")
    
    avg_limit = sum(limit for limit in memory_limits.values() if limit > 0)
    if working_endpoints > 0:
        avg_limit = avg_limit / working_endpoints
        print(f"• Average working sample size: {avg_limit:.0f}")
        
        if avg_limit < 200:
            print("• ⚠️  Low memory limits detected - consider memory optimization")
        elif avg_limit < 500:
            print("• 📊 Moderate memory capacity - suitable for production with batching")
        else:
            print("• 🚀 Good memory capacity - can handle larger datasets")
    
    # Production readiness assessment
    production_ready = working_endpoints >= 3 and avg_limit >= 100
    print(f"\n🏭 PRODUCTION READINESS: {'✅ READY' if production_ready else '❌ NEEDS WORK'}")
    
    if not production_ready:
        print("   Next steps:")
        print("   1. Implement memory optimization utilities")
        print("   2. Add batch processing for SHAP calculations")
        print("   3. Consider infrastructure upgrade")
    
    # Save detailed results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"memory_optimization_test_{timestamp}.json"
    
    with open(filename, 'w') as f:
        json.dump({
            "timestamp": timestamp,
            "total_endpoints": total_endpoints,
            "working_endpoints": working_endpoints,
            "success_rate": working_endpoints/total_endpoints*100,
            "memory_limits": memory_limits,
            "detailed_results": all_results,
            "production_ready": production_ready
        }, f, indent=2)
    
    print(f"\n💾 Detailed results saved to: {filename}")

if __name__ == "__main__":
    main() 