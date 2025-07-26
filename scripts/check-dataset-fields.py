#!/usr/bin/env python3
"""
Check what fields are available in the live microservice dataset
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

def test_fields():
    """Try to figure out what fields are available"""
    
    # The error message mentioned these columns are available
    known_fields = [
        "CreationDate", "Creator", "DESCRIPTION", "EditDate", "ID", 
        "OBJECTID", "Shape__Area", "Shape__Length", "TOTPOP_CY", "thematic_value"
    ]
    
    print("🔍 Testing known fields...")
    for field in known_fields:
        payload = {
            "query": f"test {field}",
            "analysis_type": "ranking",  # Try ranking instead of correlation
            "target_variable": field,
            "demographic_filters": []
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
                if result.get("success"):
                    print(f"✅ {field} - Works! Got {len(result.get('results', []))} results")
                    if 'results' in result and result['results']:
                        sample_result = result['results'][0]
                        print(f"   Sample data: {list(sample_result.keys())}")
                else:
                    print(f"❌ {field} - Failed: {result.get('error', 'Unknown error')}")
            else:
                print(f"❌ {field} - HTTP {response.status_code}")
                
        except Exception as e:
            print(f"💥 {field} - Error: {e}")
    
    # Try to get some working examples
    print(f"\n🎯 Looking for brand-related fields...")
    
    # Try some common brand field patterns
    brand_patterns = [
        "nike", "adidas", "jordan", "converse", "puma", "reebok", "newbalance", "asics",
        "MP30034A_B_P", "mp30034a_b_p", "Nike_Sales", "nike_sales",
        "MP30029A_B_P", "mp30029a_b_p", "Adidas_Sales", "adidas_sales"
    ]
    
    for pattern in brand_patterns:
        payload = {
            "query": f"test {pattern}",
            "analysis_type": "ranking",
            "target_variable": pattern,
            "demographic_filters": []
        }
        
        try:
            response = requests.post(
                f"{MICROSERVICE_URL}/analyze", 
                json=payload, 
                headers=headers, 
                timeout=5
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    print(f"🏷️ Found brand field: {pattern}")
                    break
            else:
                error_text = response.text[:200] if response.text else "No response"
                if "not found in dataset" in error_text:
                    continue  # Expected for fields that don't exist
                print(f"⚠️ {pattern} - HTTP {response.status_code}: {error_text}")
                
        except Exception as e:
            continue  # Skip timeouts and errors
    
    # Try to find working correlation
    print(f"\n🔗 Testing correlations with available fields...")
    working_combinations = [
        ("TOTPOP_CY", "thematic_value"),
        ("TOTPOP_CY", "Shape__Area"),  
        ("thematic_value", "Shape__Area")
    ]
    
    for target, compare in working_combinations:
        payload = {
            "query": f"correlation between {target} and {compare}",
            "analysis_type": "correlation",
            "target_field": target,
            "matched_fields": [target, compare]
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
                    print(f"✅ Correlation works: {target} vs {compare}")
                    print(f"   Results: {len(result.get('results', []))}")
                    
                    # Show sample data structure
                    if result.get('results'):
                        sample = result['results'][0]
                        print(f"   Sample keys: {list(sample.keys())}")
                        print(f"   Sample values: {dict(list(sample.items())[:3])}")
                else:
                    print(f"❌ Correlation failed: {target} vs {compare} - {result.get('error')}")
            else:
                print(f"❌ HTTP {response.status_code} for {target} vs {compare}")
                
        except Exception as e:
            print(f"💥 Error testing {target} vs {compare}: {e}")

if __name__ == "__main__":
    print("🔍 Checking dataset fields in live microservice...")
    print(f"URL: {MICROSERVICE_URL}")
    test_fields() 