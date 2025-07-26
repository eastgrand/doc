#!/usr/bin/env python3
"""
Test script for enhanced SHAP microservice endpoints
Tests all 16 analysis endpoints with sample data
"""

import requests
import json
import time
from datetime import datetime
import sys

# Configuration
MICROSERVICE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"

# Headers for all requests
HEADERS = {
    "Content-Type": "application/json",
    "X-API-KEY": API_KEY
}

def test_endpoint(endpoint_path, payload, description):
    """Test a single endpoint with error handling"""
    print(f"\n{'='*60}")
    print(f"Testing: {description}")
    print(f"Endpoint: {endpoint_path}")
    print(f"{'='*60}")
    
    url = f"{MICROSERVICE_URL}{endpoint_path}"
    
    try:
        print(f"Making request to: {url}")
        response = requests.post(url, headers=HEADERS, json=payload, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"✅ SUCCESS: {description}")
                print(f"Response keys: {list(result.keys()) if isinstance(result, dict) else 'Not a dict'}")
                
                # Print summary if available
                if isinstance(result, dict):
                    if 'summary' in result:
                        print(f"Summary: {result['summary'][:200]}...")
                    if 'results' in result:
                        print(f"Results count: {len(result['results']) if isinstance(result['results'], list) else 'Not a list'}")
                    if 'success' in result:
                        print(f"Success flag: {result['success']}")
                
                return True, result
            except json.JSONDecodeError as e:
                print(f"❌ JSON Decode Error: {e}")
                print(f"Raw response: {response.text[:500]}...")
                return False, response.text
        else:
            print(f"❌ FAILED: {description}")
            print(f"Error response: {response.text[:500]}...")
            return False, response.text
            
    except requests.exceptions.Timeout:
        print(f"⏰ TIMEOUT: {description} (30s)")
        return False, "Timeout"
    except requests.exceptions.RequestException as e:
        print(f"🌐 REQUEST ERROR: {e}")
        return False, str(e)
    except Exception as e:
        print(f"💥 UNEXPECTED ERROR: {e}")
        return False, str(e)

def test_health_endpoint():
    """Test the health/root endpoint first"""
    print("Testing service availability...")
    
    # Try different possible paths
    test_paths = ["/", "/health", "/ping"]
    
    for path in test_paths:
        url = f"{MICROSERVICE_URL}{path}"
        try:
            print(f"\nTrying: {url}")
            response = requests.get(url, headers=HEADERS, timeout=10)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                print(f"✅ Service accessible at: {path}")
                try:
                    result = response.json()
                    print(f"Response: {json.dumps(result, indent=2)}")
                except:
                    print(f"Text response: {response.text[:200]}...")
                return True
            else:
                print(f"Response: {response.text[:200]}...")
        except Exception as e:
            print(f"Error: {e}")
    
    print("❌ Service not accessible on standard paths")
    return False

def main():
    """Run comprehensive endpoint tests"""
    print("🚀 Enhanced SHAP Microservice Endpoint Test")
    print(f"URL: {MICROSERVICE_URL}")
    print(f"Time: {datetime.now()}")
    
    # Test service availability first
    if not test_health_endpoint():
        print("\n⚠️  Service not accessible. Proceeding with endpoint tests anyway...")
    
    # Base payload for all tests (using correct uppercase field names)
    base_payload = {
        "query": "Test analysis request",
        "target_field": "MP30034A_B_P",  # Nike field
        "matched_fields": ["MP30034A_B_P", "MP30029A_B_P"],  # Nike and Adidas
    }
    
    # Test cases for all 16 endpoints
    test_cases = [
        # Original 8 endpoints
        {
            "path": "/analyze",
            "payload": {
                **base_payload,
                "analysis_type": "correlation"
            },
            "description": "Core Analysis - Nike sales correlation"
        },
        {
            "path": "/factor-importance",
            "payload": {
                **base_payload,
                "target_field": "MP30034A_B_P",
                "top_features": 10
            },
            "description": "Factor Importance - Top 10 Nike factors"
        },
        {
            "path": "/feature-interactions",
            "payload": {
                **base_payload,
                "interaction_features": ["median_income", "total_population"]
            },
            "description": "Feature Interactions - Income and population effects"
        },
        {
            "path": "/outlier-detection",
            "payload": {
                **base_payload,
                "contamination": 0.1
            },
            "description": "Outlier Detection - Nike sales outliers"
        },
        {
            "path": "/scenario-analysis",
            "payload": {
                **base_payload,
                "scenarios": [
                    {"median_income": 75000, "description": "High income scenario"}
                ]
            },
            "description": "Scenario Analysis - High income impact"
        },
        {
            "path": "/threshold-analysis", 
            "payload": {
                **base_payload,
                "features": ["median_income", "total_population"],
                "num_bins": 10
            },
            "description": "Threshold Analysis - Income and population thresholds"
        },
        {
            "path": "/segment-profiling",
            "payload": {
                **base_payload,
                "segment_features": ["median_income", "age_median", "total_population"]
            },
            "description": "Segment Profiling - Demographic segments"
        },
        {
            "path": "/comparative-analysis",
            "payload": {
                **base_payload,
                "comparison_features": ["MP30034A_B_P", "MP30029A_B_P"],
                "comparison_type": "brand_performance"
            },
            "description": "Comparative Analysis - Nike vs Adidas"
        },
        
        # New 8 enhanced endpoints
        {
            "path": "/time-series-analysis",
            "payload": {
                **base_payload,
                "time_periods": ["2021", "2022", "2023", "2024"],
                "trend_threshold": 0.1
            },
            "description": "Time Series Analysis - Nike trend analysis"
        },
        {
            "path": "/brand-affinity",
            "payload": {
                **base_payload,
                "primary_brand": "MP30034A_B_P",
                "comparison_brands": ["MP30029A_B_P", "MP30031A_B_P"],
                "affinity_threshold": 0.5
            },
            "description": "Brand Affinity - Nike purchase patterns"
        },
        {
            "path": "/spatial-clusters",
            "payload": {
                **base_payload,
                "n_clusters": 5,
                "cluster_features": ["median_income", "total_population", "MP30034A_B_P"]
            },
            "description": "Spatial Clusters - Geographic similarity analysis"
        },
        {
            "path": "/competitive-analysis",
            "payload": {
                **base_payload,
                "primary_brand": "MP30034A_B_P",
                "competitor_brands": ["MP30029A_B_P", "MP30031A_B_P"],
                "analysis_dimensions": ["demographic", "geographic", "economic"]
            },
            "description": "Competitive Analysis - Nike competitive landscape"
        },
        {
            "path": "/lifecycle-analysis",
            "payload": {
                **base_payload,
                "lifecycle_features": ["age", "income", "education", "family"]
            },
            "description": "Lifecycle Analysis - Demographic lifecycle patterns"
        },
        {
            "path": "/economic-sensitivity",
            "payload": {
                **base_payload,
                "economic_indicators": ["median_income", "disposable_income"],
                "sensitivity_threshold": 0.3
            },
            "description": "Economic Sensitivity - Economic impact analysis"
        },
        {
            "path": "/penetration-optimization",
            "payload": {
                **base_payload,
                "optimization_target": "market_share",
                "constraint_features": ["median_income", "total_population"]
            },
            "description": "Penetration Optimization - Market improvement opportunities"
        },
        {
            "path": "/market-risk",
            "payload": {
                **base_payload,
                "risk_factors": ["economic_volatility", "competition_intensity"],
                "risk_threshold": 0.7
            },
            "description": "Market Risk - Risk assessment and vulnerability"
        }
    ]
    
    # Run all tests
    results = []
    successful_tests = 0
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📊 Test {i}/{len(test_cases)}")
        success, result = test_endpoint(
            test_case["path"],
            test_case["payload"],
            test_case["description"]
        )
        
        results.append({
            "endpoint": test_case["path"],
            "description": test_case["description"],
            "success": success,
            "result": result
        })
        
        if success:
            successful_tests += 1
        
        # Small delay between requests to be nice to the server
        time.sleep(1)
    
    # Summary
    print(f"\n{'='*60}")
    print(f"🎯 TEST SUMMARY")
    print(f"{'='*60}")
    print(f"Total Tests: {len(test_cases)}")
    print(f"Successful: {successful_tests}")
    print(f"Failed: {len(test_cases) - successful_tests}")
    print(f"Success Rate: {(successful_tests/len(test_cases)*100):.1f}%")
    
    # Detailed results
    print(f"\n📋 DETAILED RESULTS:")
    for result in results:
        status = "✅" if result["success"] else "❌"
        print(f"{status} {result['endpoint']} - {result['description']}")
    
    # Save results to file
    results_file = f"test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    try:
        with open(results_file, 'w') as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "microservice_url": MICROSERVICE_URL,
                "total_tests": len(test_cases),
                "successful_tests": successful_tests,
                "success_rate": successful_tests/len(test_cases)*100,
                "results": results
            }, f, indent=2)
        print(f"\n💾 Results saved to: {results_file}")
    except Exception as e:
        print(f"\n⚠️  Could not save results: {e}")
    
    return successful_tests == len(test_cases)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 