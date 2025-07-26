#!/usr/bin/env python3
"""
Test the working basic /analyze endpoint
"""

import requests
import json

# Configuration
MICROSERVICE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"

headers = {
    "Content-Type": "application/json",
    "X-API-KEY": API_KEY
}

def test_basic_endpoint():
    """Test the basic analyze endpoint that's currently working"""
    
    print("🔍 Testing basic /analyze endpoint...")
    
    payload = {
        "query": "population correlation analysis",
        "analysis_type": "correlation", 
        "target_field": "TOTPOP_CY",
        "matched_fields": ["TOTPOP_CY", "thematic_value"]
    }
    
    try:
        response = requests.post(
            f"{MICROSERVICE_URL}/analyze",
            json=payload,
            headers=headers,
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print(f"✅ SUCCESS: Got {len(result.get('results', []))} results")
                print(f"   Analysis type: {result.get('analysis_type')}")
                print(f"   Available keys: {list(result.keys())}")
                
                # Show sample data
                if result.get('results'):
                    sample = result['results'][0]
                    print(f"   Sample record: {sample}")
                    
                return True
            else:
                print(f"❌ FAILED: {result.get('error')}")
                return False
        else:
            print(f"❌ HTTP Error {response.status_code}: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"💥 ERROR: {e}")
        return False

def test_different_analysis_types():
    """Test different analysis types with the current dataset"""
    
    analysis_types = [
        "correlation",
        "ranking", 
        "statistical",
        "spatial"
    ]
    
    print(f"\n🧪 Testing different analysis types...")
    
    for analysis_type in analysis_types:
        payload = {
            "query": f"test {analysis_type} analysis",
            "analysis_type": analysis_type,
            "target_field": "TOTPOP_CY",
            "matched_fields": ["TOTPOP_CY", "thematic_value"]
        }
        
        try:
            response = requests.post(
                f"{MICROSERVICE_URL}/analyze",
                json=payload,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                success = result.get("success", False)
                count = len(result.get("results", []))
                print(f"   {analysis_type}: {'✅' if success else '❌'} ({count} results)")
            else:
                print(f"   {analysis_type}: ❌ HTTP {response.status_code}")
                
        except Exception as e:
            print(f"   {analysis_type}: 💥 {e}")

if __name__ == "__main__":
    print("🚀 Basic Endpoint Test")
    print(f"URL: {MICROSERVICE_URL}")
    
    if test_basic_endpoint():
        test_different_analysis_types()
    else:
        print("❌ Basic test failed, skipping additional tests") 