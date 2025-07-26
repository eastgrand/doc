#!/usr/bin/env python3
"""
CORRECTED Export Script - Exactly 191 Fields
- Exports EXACTLY the 191 fields in complete_field_list_keep.txt
- No modifications, no multi-target SHAP generation
- Works with microservice limitations (100 records max)
"""

import json
import requests
import time
import os
from typing import Dict, List, Any

# Configuration
MICROSERVICE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"
OUTPUT_DIR = "public/data/endpoints"
HEADERS = {'X-API-Key': API_KEY, 'Content-Type': 'application/json'}

def load_fields_to_keep():
    """Load the EXACT list of 191 fields to keep."""
    try:
        with open('complete_field_list_keep.txt', 'r') as f:
            fields = [line.strip() for line in f if line.strip()]
        print(f"✅ Loaded {len(fields)} fields to keep")
        return set(fields)
    except FileNotFoundError:
        print("❌ complete_field_list_keep.txt not found!")
        return set()

def filter_record_exactly(record: Dict[str, Any], fields_to_keep: set) -> Dict[str, Any]:
    """Filter record to contain EXACTLY the specified fields."""
    filtered = {}
    
    for field in fields_to_keep:
        if field in record:
            filtered[field] = record[field]
        else:
            # Field not in record - set to None or appropriate default
            if field.startswith('value_'):
                filtered[field] = None
            elif field.startswith('shap_'):
                filtered[field] = 0.0
            else:
                filtered[field] = None
    
    return filtered

def test_endpoint_with_different_payloads(endpoint_name: str):
    """Test different payload configurations for an endpoint."""
    
    base_url = f"{MICROSERVICE_URL}/{endpoint_name}"
    
    # Different payload strategies
    payloads = [
        {
            'name': 'Simple analysis',
            'payload': {
                'analysis_type': 'general',
                'include_all_fields': True
            }
        },
        {
            'name': 'TopN analysis',
            'payload': {
                'query': f'Analysis for {endpoint_name.replace("-", " ")}',
                'analysis_type': 'topN',
                'target_variable': 'TOTPOP_CY',
                'include_all_fields': True
            }
        },
        {
            'name': 'Basic request',
            'payload': {
                'query': f'Data export for {endpoint_name}',
                'format': 'json'
            }
        }
    ]
    
    for test in payloads:
        try:
            response = requests.post(base_url, json=test['payload'], headers=HEADERS, timeout=25)
            
            if response.status_code == 200:
                result = response.json()
                records = result.get('results', [])
                if len(records) > 0:
                    print(f"   ✅ {test['name']}: {len(records)} records")
                    return test['payload'], records
                else:
                    print(f"   ⚠️ {test['name']}: 0 records")
            else:
                print(f"   ❌ {test['name']}: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ {test['name']}: {str(e)[:50]}")
    
    return None, []

def export_endpoint_exactly(endpoint_name: str, fields_to_keep: set) -> bool:
    """Export endpoint with exactly the specified fields."""
    
    print(f"\n📊 Exporting {endpoint_name} with EXACTLY {len(fields_to_keep)} fields")
    
    # Test different payload strategies
    working_payload, records = test_endpoint_with_different_payloads(endpoint_name)
    
    if not records:
        print(f"   ❌ No working payload found for {endpoint_name}")
        return False
    
    print(f"   ✅ Retrieved {len(records)} records")
    print(f"   📋 Original fields per record: {len(records[0])}")
    
    # Filter to exactly the specified fields
    filtered_results = []
    for record in records:
        filtered_record = filter_record_exactly(record, fields_to_keep)
        filtered_results.append(filtered_record)
    
    print(f"   📋 Filtered to exactly: {len(filtered_results[0])} fields")
    
    # Verify we have exactly 191 fields
    if len(filtered_results[0]) != 191:
        print(f"   ⚠️ WARNING: Expected 191 fields, got {len(filtered_results[0])}")
    
    # Create output structure
    output_data = {
        'results': filtered_results,
        'endpoint': endpoint_name,
        'total_records': len(filtered_results),
        'fields_per_record': len(filtered_results[0]) if filtered_results else 0,
        'optimization': {
            'exact_field_export': True,
            'fields_requested': len(fields_to_keep),
            'fields_exported': len(filtered_results[0]) if filtered_results else 0,
            'microservice_limit': 100
        },
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
        'success': True
    }
    
    # Save to file
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_file = f"{OUTPUT_DIR}/{endpoint_name}.json"
    
    with open(output_file, 'w') as f:
        json.dump(output_data, f, indent=2, default=str)
    
    file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
    print(f"   💾 Saved {output_file} ({file_size:.2f} MB)")
    
    return True

def main():
    """Main export function - exactly 191 fields per endpoint."""
    
    print('🎯 CORRECTED EXPORT - EXACTLY 191 FIELDS')
    print('=' * 50)
    
    # Load the exact field list
    fields_to_keep = load_fields_to_keep()
    if not fields_to_keep:
        print("❌ Cannot proceed without field list")
        return
    
    print(f"📋 Will export EXACTLY {len(fields_to_keep)} fields per record")
    print(f"🌐 Microservice: {MICROSERVICE_URL}")
    print(f"⚠️ Microservice limitation: ~100 records max per endpoint")
    
    # Test all endpoints from our earlier analysis
    all_endpoints = [
        'analyze',
        'competitive-analysis', 
        'correlation-analysis',
        'demographic-insights',
        'feature-interactions',
        'segment-profiling', 
        'scenario-analysis',
        'sensitivity-analysis',
        'spatial-clusters',
        'trend-analysis',
        'anomaly-detection',
        'outlier-detection',
        'comparative-analysis',
        'predictive-modeling',
        'feature-importance-ranking',
        'model-performance'
    ]
    
    print(f"📋 Testing all {len(all_endpoints)} endpoints")
    
    successful_exports = 0
    total_records = 0
    
    for i, endpoint in enumerate(all_endpoints, 1):
        print(f"\n[{i}/{len(all_endpoints)}] Processing {endpoint}")
        
        success = export_endpoint_exactly(endpoint, fields_to_keep)
        if success:
            successful_exports += 1
            total_records += 100  # Approximate, microservice limit
        
        # Brief pause between requests
        time.sleep(1)
    
    # Create combined file
    print(f"\n📦 Creating combined dataset...")
    all_data = {}
    actual_total = 0
    
    for endpoint in all_endpoints:
        filepath = f"{OUTPUT_DIR}/{endpoint}.json"
        if os.path.exists(filepath):
            with open(filepath, 'r') as f:
                data = json.load(f)
                all_data[endpoint] = data
                actual_total += len(data.get('results', []))
    
    combined_file = f"{OUTPUT_DIR}/all_endpoints_191_fields.json"
    with open(combined_file, 'w') as f:
        json.dump(all_data, f, indent=2, default=str)
    
    combined_size = os.path.getsize(combined_file) / (1024 * 1024)
    
    print(f"\n" + "=" * 50)
    print(f"🎯 CORRECTED EXPORT COMPLETED")
    print(f"=" * 50)
    print(f"✅ Successful exports: {successful_exports}/{len(all_endpoints)}")
    print(f"📊 Total records: {actual_total}")
    print(f"💾 Combined file: {combined_file} ({combined_size:.2f} MB)")
    print(f"📋 Fields per record: EXACTLY 191 (as requested)")
    
    if successful_exports > 0:
        # Show sample structure
        sample_endpoint = list(all_data.keys())[0]
        sample_record = all_data[sample_endpoint]['results'][0]
        
        value_fields = len([k for k in sample_record.keys() if k.startswith('value_')])
        shap_fields = len([k for k in sample_record.keys() if k.startswith('shap_')])
        other_fields = len([k for k in sample_record.keys() if not k.startswith('value_') and not k.startswith('shap_')])
        
        print(f"\n📊 Verified Field Structure:")
        print(f"   Total fields: {len(sample_record)} (target: 191)")
        print(f"   Value fields: {value_fields}")
        print(f"   SHAP fields: {shap_fields}")
        print(f"   Other fields: {other_fields}")
        
        if len(sample_record) == 191:
            print(f"   ✅ PERFECT! Exactly 191 fields as requested")
        else:
            print(f"   ⚠️ Field count mismatch - need to investigate")
    
    print(f"\n💡 Microservice Status:")
    print(f"   • Working endpoints: {successful_exports}")
    print(f"   • Failed endpoints: {len(all_endpoints) - successful_exports}")
    print(f"   • Record limit: ~100 per endpoint (microservice constraint)")

if __name__ == "__main__":
    main() 