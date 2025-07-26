#!/usr/bin/env python3
"""
Extract complete column list by triggering specific error paths in the microservice
that return list(df.columns) instead of truncated field samples.
"""

import requests
import json
import re

# Microservice configuration
MICROSERVICE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"

def trigger_full_columns_error():
    """Trigger error that returns complete df.columns list"""
    
    print("🎯 Triggering outlier-detection error to get full column list...")
    
    # Try outlier-detection endpoint which has this error pattern:
    # "error": f"Target field '{target_field}' not found in dataset. Available fields: {list(df.columns)}"
    
    response = requests.post(
        f"{MICROSERVICE_URL}/outlier-detection",
        headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},
        json={
            "target_field": "INVALID_FIELD_NAME_TO_TRIGGER_FULL_LIST_ERROR",
            "method": "isolation_forest"
        }
    )
    
    if response.status_code == 400:
        try:
            error_data = response.json()
            error_msg = error_data.get('error', '')
            
            print(f"✅ Got error response: {error_msg[:100]}...")
            
            # Look for pattern: "Available fields: [list, of, fields]"
            match = re.search(r'Available fields:\s*\[(.*?)\]', error_msg)
            if match:
                fields_text = match.group(1)
                print(f"📋 Raw fields text: {fields_text[:200]}...")
                
                # Parse the Python list format - fields are quoted strings
                # Split by comma and clean quotes
                raw_fields = [field.strip().strip("'\"") for field in fields_text.split(',')]
                
                # Clean up field names
                clean_fields = []
                for field in raw_fields:
                    clean_field = field.strip()
                    if clean_field and len(clean_field) > 0:
                        clean_fields.append(clean_field)
                
                return clean_fields
            else:
                print(f"❌ Could not parse fields from error: {error_msg}")
                return []
                
        except json.JSONDecodeError:
            print(f"❌ Response is not JSON: {response.text[:200]}")
            return []
    else:
        print(f"❌ Unexpected response code: {response.status_code}")
        print(f"Response: {response.text[:200]}")
        return []

def try_other_endpoints():
    """Try other endpoints that might return full column lists"""
    
    endpoints_to_try = [
        ("/scenario-analysis", {
            "target_field": "INVALID_FIELD_FOR_FULL_LIST",
            "scenarios": []
        }),
        ("/threshold-analysis", {
            "target_field": "INVALID_FIELD_FOR_FULL_LIST"
        }),
        ("/segment-profiling", {
            "target_field": "INVALID_FIELD_FOR_FULL_LIST"
        }),
        ("/comparative-analysis", {
            "target_field": "INVALID_FIELD_FOR_FULL_LIST",
            "grouping_field": "INVALID_GROUPING_FIELD"
        })
    ]
    
    for endpoint, payload in endpoints_to_try:
        print(f"🧪 Trying {endpoint}...")
        
        response = requests.post(
            f"{MICROSERVICE_URL}{endpoint}",
            headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},
            json=payload
        )
        
        if response.status_code == 400:
            try:
                error_data = response.json()
                error_msg = error_data.get('error', '')
                
                # Look for the full fields list pattern
                match = re.search(r'Available fields:\s*\[(.*?)\]', error_msg)
                if match:
                    print(f"✅ Found full list in {endpoint}!")
                    fields_text = match.group(1)
                    raw_fields = [field.strip().strip("'\"") for field in fields_text.split(',')]
                    return [field.strip() for field in raw_fields if field.strip()]
                else:
                    print(f"   ❌ No full list found")
                    
            except json.JSONDecodeError:
                print(f"   ❌ Not JSON response")
        else:
            print(f"   ❌ Status: {response.status_code}")
    
    return []

def save_complete_field_list(fields):
    """Save the complete field list to files"""
    
    if not fields:
        print("❌ No fields to save")
        return
    
    print(f"💾 Saving {len(fields)} complete fields...")
    
    # Save as simple text list
    with open("../public/data/microservice-complete-fields.txt", "w") as f:
        f.write("# Complete Field List from Microservice\n")
        f.write(f"# Total: {len(fields)} fields\n")
        f.write("# Extracted from df.columns error response\n\n")
        
        for i, field in enumerate(fields, 1):
            f.write(f"{i:4d}. {field}\n")
    
    # Save as JSON
    field_data = {
        "total_fields": len(fields),
        "extraction_method": "df_columns_error_response",
        "fields": sorted(fields)  # Sort for easier reading
    }
    
    with open("../public/data/microservice-complete-fields.json", "w") as f:
        json.dump(field_data, f, indent=2)
    
    print(f"✅ Complete field list saved!")
    print(f"   - ../public/data/microservice-complete-fields.txt")
    print(f"   - ../public/data/microservice-complete-fields.json")

def main():
    print("🚀 COMPLETE MICROSERVICE COLUMN EXTRACTION")
    print("=" * 60)
    
    # Try the outlier-detection endpoint first
    fields = trigger_full_columns_error()
    
    # If that didn't work, try other endpoints
    if not fields:
        print("\n🔄 Trying alternative endpoints...")
        fields = try_other_endpoints()
    
    if fields:
        print(f"\n📊 SUCCESS! Found {len(fields)} total fields")
        print(f"📋 Sample fields:")
        for i, field in enumerate(sorted(fields)[:15]):
            print(f"   {i+1:2d}. {field}")
        
        if len(fields) > 15:
            print(f"   ... and {len(fields) - 15} more fields")
        
        save_complete_field_list(fields)
        
        print(f"\n🎉 All {len(fields)} fields extracted and saved!")
        
    else:
        print("\n❌ Failed to extract complete field list")
        print("   The microservice may have changed its error response format")

if __name__ == "__main__":
    main() 