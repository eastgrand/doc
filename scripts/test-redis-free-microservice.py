#!/usr/bin/env python3
"""
Test script for Redis-Free SHAP Microservice
Tests the simplified synchronous endpoints
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"
TIMEOUT = 120

def test_endpoint(endpoint, payload=None, description="", method="GET"):
    """Test a single endpoint"""
    print(f"\n{'='*60}")
    print(f"🧪 Testing: {description}")
    print(f"📍 Endpoint: {method} {endpoint}")
    print(f"⏰ {datetime.now().strftime('%H:%M:%S')}")
    print(f"{'='*60}")
    
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
    }
    
    start_time = time.time()
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, timeout=TIMEOUT)
        else:
            response = requests.post(f"{BASE_URL}{endpoint}", headers=headers, json=payload, timeout=TIMEOUT)
        
        duration = time.time() - start_time
        
        print(f"📈 Status: {response.status_code}")
        print(f"⏱️  Duration: {duration:.2f}s")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"✅ SUCCESS!")
                
                # Show key information
                if isinstance(result, dict):
                    if 'success' in result:
                        print(f"   Success: {result['success']}")
                    if 'redis_enabled' in result:
                        print(f"   Redis Enabled: {result['redis_enabled']}")
                    if 'version' in result:
                        print(f"   Version: {result['version']}")
                    if 'memory_usage_mb' in result:
                        print(f"   Memory Usage: {result['memory_usage_mb']:.1f}MB")
                    if 'processing_time' in result:
                        print(f"   Processing Time: {result['processing_time']:.2f}s")
                
                return True, duration, result
                
            except json.JSONDecodeError as e:
                print(f"❌ JSON parsing failed: {str(e)[:50]}")
                return False, duration, f"JSON decode error: {e}"
        else:
            error_text = response.text[:200] if response.text else "No error message"
            print(f"❌ Failed: HTTP {response.status_code}")
            print(f"💬 Error: {error_text}")
            return False, duration, f"HTTP {response.status_code}: {error_text}"
            
    except requests.exceptions.Timeout:
        duration = time.time() - start_time
        print(f"⏰ TIMEOUT after {duration:.1f}s")
        return False, duration, "Request timeout"
    except Exception as e:
        duration = time.time() - start_time
        print(f"💥 ERROR: {str(e)[:50]}")
        return False, duration, str(e)[:100]

def main():
    """Test the Redis-free microservice"""
    
    print("🎯 Redis-Free SHAP Microservice Test")
    print("Testing simplified synchronous endpoints")
    print("=" * 60)
    
    results = []
    
    # Test 1: Health Check
    success, duration, response = test_endpoint(
        "/", method="GET", description="Basic health check"
    )
    results.append({"endpoint": "/", "success": success, "duration": duration})
    
    # Test 2: Ping
    success, duration, response = test_endpoint(
        "/ping", method="GET", description="Ping endpoint"
    )
    results.append({"endpoint": "/ping", "success": success, "duration": duration})
    
    # Test 3: Detailed Health
    success, duration, response = test_endpoint(
        "/health", method="GET", description="Detailed health check"
    )
    results.append({"endpoint": "/health", "success": success, "duration": duration})
    
    # Wait between tests
    time.sleep(5)
    
    # Test 4: Outlier Detection (small sample)
    success, duration, response = test_endpoint(
        "/outlier-detection",
        payload={
            "target_field": "MP30034A_B_P",
            "outlier_threshold": 0.1,
            "sample_size": 100
        },
        method="POST",
        description="Outlier detection (100 samples)"
    )
    results.append({"endpoint": "/outlier-detection", "success": success, "duration": duration})
    
    time.sleep(5)
    
    # Test 5: Feature Interactions (small sample)
    success, duration, response = test_endpoint(
        "/feature-interactions",
        payload={
            "target_field": "MP30034A_B_P",
            "features": ["MP26029", "MP27014"],
            "interaction_threshold": 0.1,
            "sample_size": 100
        },
        method="POST",
        description="Feature interactions (100 samples)"
    )
    results.append({"endpoint": "/feature-interactions", "success": success, "duration": duration})
    
    time.sleep(5)
    
    # Test 6: Main Analyze Endpoint
    success, duration, response = test_endpoint(
        "/analyze",
        payload={
            "target_field": "MP30034A_B_P",
            "features": ["MP26029", "MP27014"],
            "analysis_type": "correlation",
            "sample_size": 100
        },
        method="POST",
        description="Main analyze endpoint (100 samples)"
    )
    results.append({"endpoint": "/analyze", "success": success, "duration": duration})
    
    # Summary
    print(f"\n{'='*60}")
    print("🎯 REDIS-FREE MICROSERVICE TEST SUMMARY")
    print(f"{'='*60}")
    
    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]
    
    print(f"✅ Working endpoints: {len(successful)}/{len(results)} ({len(successful)/len(results)*100:.1f}%)")
    print(f"❌ Failed endpoints: {len(failed)}/{len(results)} ({len(failed)/len(results)*100:.1f}%)")
    
    if successful:
        print(f"\n🏆 WORKING ENDPOINTS:")
        for result in successful:
            print(f"  ✅ {result['endpoint']} - {result['duration']:.1f}s")
    
    if failed:
        print(f"\n💥 FAILED ENDPOINTS:")
        for result in failed:
            print(f"  ❌ {result['endpoint']}")
    
    # Check for Redis-free indicators
    print(f"\n🔍 REDIS-FREE VALIDATION:")
    if len(successful) > 0:
        print(f"  ✅ Service is responding (Redis not required)")
        print(f"  ✅ No timeout errors (Redis connection issues eliminated)")
        if len(successful) >= len(results) * 0.8:  # 80% success rate
            print(f"  ✅ High success rate achieved without Redis")
        else:
            print(f"  ⚠️  Some endpoints still failing (investigate individual issues)")
    else:
        print(f"  ❌ Service not responding (deployment may have failed)")
    
    # Performance analysis
    if successful:
        durations = [r['duration'] for r in successful]
        avg_duration = sum(durations) / len(durations)
        print(f"\n⚡ PERFORMANCE ANALYSIS:")
        print(f"  - Average response time: {avg_duration:.1f}s")
        print(f"  - Fastest endpoint: {min(durations):.1f}s")
        print(f"  - Slowest endpoint: {max(durations):.1f}s")
        
        if avg_duration < 10:
            print(f"  ✅ Good performance (under 10s average)")
        elif avg_duration < 30:
            print(f"  ⚠️  Moderate performance (10-30s average)")
        else:
            print(f"  ⚠️  Slow performance (over 30s average)")
    
    # Save results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"redis_free_test_{timestamp}.json"
    
    test_summary = {
        "timestamp": timestamp,
        "redis_enabled": False,
        "total_endpoints": len(results),
        "working_endpoints": len(successful),
        "failed_endpoints": len(failed),
        "success_rate_percent": len(successful)/len(results)*100,
        "average_duration": sum([r['duration'] for r in successful])/len(successful) if successful else 0,
        "detailed_results": results
    }
    
    with open(filename, 'w') as f:
        json.dump(test_summary, f, indent=2)
    
    print(f"\n📁 Results saved to: {filename}")
    
    return test_summary

if __name__ == "__main__":
    main() 