#!/usr/bin/env python3
"""
Comprehensive test for all 16 SHAP microservice endpoints
Uses corrected parameters based on our successful tests and production validation
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"
TIMEOUT = 90  # Reasonable timeout for production testing

def test_endpoint(endpoint, payload, description):
    """Test a single endpoint with specific payload"""
    print(f"\n{'='*70}")
    print(f"Testing: {description}")
    print(f"Endpoint: {endpoint}")
    print(f"Sample Size: {payload.get('sample_size', 'Default')}")
    print(f"{'='*70}")
    
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
    }
    
    start_time = time.time()
    try:
        response = requests.post(
            f"{BASE_URL}{endpoint}",
            headers=headers,
            json=payload,
            timeout=TIMEOUT
        )
        duration = time.time() - start_time
        
        print(f"Status: {response.status_code}")
        print(f"Duration: {duration:.2f}s")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"✅ SUCCESS")
                
                # Show key response structure
                if isinstance(result, dict):
                    key_info = []
                    for key, value in result.items():
                        if isinstance(value, list):
                            key_info.append(f"{key}({len(value)} items)")
                        elif isinstance(value, dict):
                            key_info.append(f"{key}({len(value)} keys)")
                        else:
                            key_info.append(f"{key}")
                    print(f"Response keys: {', '.join(key_info[:5])}...")
                
                return {
                    "success": True,
                    "duration": duration,
                    "status_code": response.status_code,
                    "error": None
                }
                
            except json.JSONDecodeError as e:
                print(f"❌ JSON Error: {str(e)[:100]}")
                return {
                    "success": False,
                    "duration": duration,
                    "status_code": response.status_code,
                    "error": f"JSON decode error: {e}"
                }
        else:
            error_text = response.text[:200] if response.text else "No error message"
            if "502" in error_text or "Bad Gateway" in error_text:
                print(f"❌ 502 BAD GATEWAY - Service error")
                error = "502 Bad Gateway - Service error"
            elif "500" in error_text:
                print(f"❌ 500 INTERNAL ERROR")
                error = "500 Internal Server Error"
            elif "timeout" in error_text.lower():
                print(f"❌ TIMEOUT")
                error = "Timeout"
            else:
                print(f"❌ HTTP {response.status_code}: {error_text}")
                error = f"HTTP {response.status_code}: {error_text}"
            
            return {
                "success": False,
                "duration": duration,
                "status_code": response.status_code,
                "error": error
            }
            
    except requests.exceptions.Timeout:
        duration = time.time() - start_time
        print(f"❌ TIMEOUT after {duration:.2f}s")
        return {
            "success": False,
            "duration": duration,
            "error": "Request timeout"
        }
    except Exception as e:
        duration = time.time() - start_time
        print(f"❌ ERROR: {str(e)[:100]}")
        return {
            "success": False,
            "duration": duration,
            "error": str(e)
        }

def main():
    """Test all 16 endpoints comprehensively"""
    
    print("🎯 Comprehensive SHAP Microservice Endpoint Test")
    print("Testing all 16 endpoints with corrected parameters")
    print("=" * 70)
    
    # All 16 endpoint configurations with corrected parameters
    test_configs = [
        # Core Analysis Endpoints
        {
            "endpoint": "/analyze",
            "payload": {
                "target_field": "MP30034A_B_P",
                "features": ["MP26029", "MP27014"], 
                "max_features": 5,
                "sample_size": 500
            },
            "description": "Basic SHAP analysis"
        },
        {
            "endpoint": "/feature-interactions",
            "payload": {
                "target_field": "MP30034A_B_P",
                "features": ["MP26029", "MP27014"],
                "interaction_threshold": 0.1,
                "sample_size": 500
            },
            "description": "Feature interaction analysis"
        },
        {
            "endpoint": "/comparative-analysis",
            "payload": {
                "target_field": "MP30034A_B_P",
                "grouping_field": "MP25035",
                "sample_size": 500
            },
            "description": "Comparative analysis between groups"
        },
        
        # Advanced Analysis Endpoints  
        {
            "endpoint": "/outlier-detection",
            "payload": {
                "target_field": "MP30034A_B_P",
                "outlier_threshold": 0.1,
                "sample_size": 500
            },
            "description": "Outlier detection with SHAP explanations"
        },
        {
            "endpoint": "/scenario-analysis",
            "payload": {
                "target_field": "MP30034A_B_P",
                "scenarios": [
                    {"MP26029": 1.5, "MP27014": 2.0},
                    {"MP26029": 0.5, "MP27014": 1.0}
                ],
                "sample_size": 500
            },
            "description": "What-if scenario analysis"
        },
        {
            "endpoint": "/segment-profiling",
            "payload": {
                "target_field": "MP30034A_B_P",
                "segmentation_features": ["MP25035", "MP26029"],
                "sample_size": 500
            },
            "description": "Customer segment profiling"
        },
        
        # Clustering and Spatial Endpoints
        {
            "endpoint": "/spatial-clusters",
            "payload": {
                "target_field": "MP30034A_B_P",
                "features": ["MP26029", "MP27014", "MP25035"],
                "n_clusters": 3,
                "sample_size": 500
            },
            "description": "Spatial clustering analysis"
        },
        {
            "endpoint": "/demographic-insights",
            "payload": {
                "target_field": "MP30034A_B_P",
                "demographic_features": ["MP25035", "MP26029"],
                "sample_size": 500
            },
            "description": "Demographic pattern insights"
        },
        {
            "endpoint": "/trend-analysis",
            "payload": {
                "target_field": "MP30034A_B_P",
                "time_features": ["MP27014", "MP26029"],
                "sample_size": 500
            },
            "description": "Temporal trend analysis"
        },
        
        # Advanced Feature Analysis
        {
            "endpoint": "/feature-importance-ranking",
            "payload": {
                "target_field": "MP30034A_B_P",
                "features": ["MP26029", "MP27014", "MP25035", "MP40025"],
                "sample_size": 500
            },
            "description": "Feature importance ranking"
        },
        {
            "endpoint": "/correlation-analysis",
            "payload": {
                "target_field": "MP30034A_B_P",
                "features": ["MP26029", "MP27014", "MP25035"],
                "sample_size": 500
            },
            "description": "Feature correlation analysis"
        },
        {
            "endpoint": "/anomaly-detection",
            "payload": {
                "target_field": "MP30034A_B_P",
                "features": ["MP26029", "MP27014"],
                "anomaly_threshold": 0.1,
                "sample_size": 500
            },
            "description": "Anomaly detection with explanations"
        },
        
        # Business Intelligence Endpoints
        {
            "endpoint": "/predictive-modeling",
            "payload": {
                "target_field": "MP30034A_B_P",
                "features": ["MP26029", "MP27014", "MP25035"],
                "model_type": "regression",
                "sample_size": 500
            },
            "description": "Predictive modeling with SHAP"
        },
        {
            "endpoint": "/sensitivity-analysis",
            "payload": {
                "target_field": "MP30034A_B_P",
                "features": ["MP26029", "MP27014"],
                "perturbation_range": 0.2,
                "sample_size": 500
            },
            "description": "Feature sensitivity analysis"
        },
        {
            "endpoint": "/model-performance",
            "payload": {
                "target_field": "MP30034A_B_P",
                "features": ["MP26029", "MP27014", "MP25035"],
                "validation_split": 0.2,
                "sample_size": 500
            },
            "description": "Model performance evaluation"
        },
        {
            "endpoint": "/competitive-analysis",
            "payload": {
                "target_field": "MP30034A_B_P",
                "competitor_fields": ["MP30034B_B_P", "MP30034C_B_P"],
                "sample_size": 500
            },
            "description": "Competitive brand analysis"
        }
    ]
    
    print(f"Testing {len(test_configs)} endpoints...")
    results = []
    
    for i, config in enumerate(test_configs, 1):
        print(f"\n[{i}/{len(test_configs)}]", end="")
        
        result = test_endpoint(
            config["endpoint"],
            config["payload"],
            config["description"]
        )
        
        results.append({
            "endpoint": config["endpoint"],
            "description": config["description"],
            **result
        })
        
        # Brief pause between tests
        time.sleep(2)
    
    # Comprehensive summary
    print(f"\n{'='*70}")
    print("🎯 COMPREHENSIVE TEST SUMMARY")
    print(f"{'='*70}")
    
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
        error_counts = {}
        for result in failed:
            error_type = result['error'].split(':')[0] if result['error'] else 'Unknown'
            error_counts[error_type] = error_counts.get(error_type, 0) + 1
            print(f"  ❌ {result['endpoint']} - {result['error']}")
        
        print(f"\n📊 FAILURE ANALYSIS:")
        for error_type, count in error_counts.items():
            print(f"  - {error_type}: {count} endpoints")
    
    # Performance analysis
    if successful:
        durations = [r['duration'] for r in successful]
        avg_duration = sum(durations) / len(durations)
        print(f"\n⚡ PERFORMANCE STATS:")
        print(f"  - Average response time: {avg_duration:.1f}s")
        print(f"  - Fastest endpoint: {min(durations):.1f}s")
        print(f"  - Slowest endpoint: {max(durations):.1f}s")
    
    # Save detailed results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"comprehensive_endpoint_test_{timestamp}.json"
    
    test_summary = {
        "timestamp": timestamp,
        "total_endpoints": len(results),
        "working_endpoints": len(successful),
        "failed_endpoints": len(failed),
        "success_rate_percent": len(successful)/len(results)*100,
        "average_duration": sum([r['duration'] for r in successful])/len(successful) if successful else 0,
        "detailed_results": results
    }
    
    with open(filename, 'w') as f:
        json.dump(test_summary, f, indent=2)
    
    print(f"\n📁 Detailed results saved to: {filename}")
    
    return test_summary

if __name__ == "__main__":
    main() 