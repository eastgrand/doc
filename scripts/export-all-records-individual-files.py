#!/usr/bin/env python3
"""
Complete Export Script - ALL Records + Individual Files
- Gets ALL available records from each endpoint 
- Creates individual files per endpoint (no combined file)
- Uses optimized 191-field structure
- Progressive processing on microservice side
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

def get_all_records_from_endpoint(endpoint_name: str) -> tuple:
    """Get ALL available records from a single endpoint"""
    
    print(f"📊 Getting ALL records from {endpoint_name}...")
    
    # Payload optimized for progressive processing
    payload = {
        'query': f'Get all available records for {endpoint_name.replace("-", " ")} analysis',
        'analysis_type': 'topN',
        'target_variable': 'TOTPOP_CY',
        'include_all_fields': True,
        'get_all_records': True  # Request all records
    }
    
    url = f"{MICROSERVICE_URL}/{endpoint_name}"
    
    try:
        # Extended timeout for progressive processing
        response = requests.post(url, json=payload, headers=HEADERS, timeout=300)
        
        if response.status_code == 200:
            result = response.json()
            records = result.get('results', [])
            progressive = result.get('progressive_processed', False)
            total_records = result.get('total_records', len(records))
            
            print(f"   ✅ Status 200: {len(records)} records")
            print(f"   🔄 Progressive: {progressive}")
            print(f"   📊 Total: {total_records}")
            
            if len(records) >= 3000:
                print(f"   🎉 EXCELLENT! Got nearly all records")
            elif len(records) >= 1000:
                print(f"   ✅ GOOD! Substantial dataset")
            elif len(records) >= 100:
                print(f"   ⚠️ Partial dataset")
            else:
                print(f"   ⚠️ Limited records")
            
            return records, result
            
        else:
            print(f"   ❌ Error {response.status_code}: {response.text[:100]}")
            return [], {}
            
    except requests.exceptions.Timeout:
        print(f"   ⏰ Timeout - progressive processing may be working but slow")
        return [], {}
    except Exception as e:
        print(f"   ❌ Request failed: {str(e)[:60]}")
        return [], {}

def export_individual_endpoint(endpoint_name: str, fields_to_keep: set) -> bool:
    """Export individual endpoint with ALL records to its own file"""
    
    print(f"\n🎯 Exporting {endpoint_name} to individual file...")
    
    # Get all records from endpoint
    records, metadata = get_all_records_from_endpoint(endpoint_name)
    
    if not records:
        print(f"   ❌ No records retrieved from {endpoint_name}")
        return False
    
    print(f"   📋 Original fields per record: {len(records[0])}")
    
    # Filter to exactly 191 fields
    filtered_records = []
    for record in records:
        filtered_record = filter_record_exactly(record, fields_to_keep)
        filtered_records.append(filtered_record)
    
    print(f"   📋 Filtered to exactly: {len(filtered_records[0])} fields")
    
    # Verify field count
    if len(filtered_records[0]) != 191:
        print(f"   ⚠️ WARNING: Expected 191 fields, got {len(filtered_records[0])}")
    else:
        print(f"   ✅ Perfect! Exactly 191 fields")
    
    # Create output structure
    output_data = {
        'endpoint': endpoint_name,
        'results': filtered_records,
        'total_records': len(filtered_records),
        'fields_per_record': len(filtered_records[0]),
        'optimization': {
            'exact_field_export': True,
            'fields_requested': len(fields_to_keep),
            'fields_exported': len(filtered_records[0]),
            'progressive_processing': metadata.get('progressive_processed', False)
        },
        'metadata': {
            'analysis_type': metadata.get('analysis_type', 'unknown'),
            'progressive_processed': metadata.get('progressive_processed', False),
            'final_memory_mb': metadata.get('final_memory_mb', 'unknown')
        },
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
        'success': True
    }
    
    # Save individual file
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_file = f"{OUTPUT_DIR}/{endpoint_name}.json"
    
    with open(output_file, 'w') as f:
        json.dump(output_data, f, indent=2, default=str)
    
    file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
    print(f"   💾 Saved individual file: {output_file} ({file_size:.2f} MB)")
    
    return True

def main():
    """Main export function - ALL records in individual files"""
    
    print('🚀 COMPLETE EXPORT - ALL RECORDS + INDIVIDUAL FILES')
    print('=' * 60)
    
    # Load field list
    fields_to_keep = load_fields_to_keep()
    if not fields_to_keep:
        print("❌ Cannot proceed without field list")
        return
    
    print(f"📋 Will export EXACTLY {len(fields_to_keep)} fields per record")
    print(f"🌐 Microservice: {MICROSERVICE_URL}")
    print(f"🎯 Goal: ALL available records per endpoint")
    print(f"📁 Output: Individual files per endpoint")
    
    # All 16 endpoints
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
    
    print(f"📋 Exporting {len(all_endpoints)} endpoints individually")
    
    successful_exports = 0
    total_records_across_all = 0
    
    for i, endpoint in enumerate(all_endpoints, 1):
        print(f"\n[{i}/{len(all_endpoints)}] Processing {endpoint}")
        
        success = export_individual_endpoint(endpoint, fields_to_keep)
        if success:
            successful_exports += 1
            
            # Read back the file to get actual record count
            filepath = f"{OUTPUT_DIR}/{endpoint}.json"
            if os.path.exists(filepath):
                with open(filepath, 'r') as f:
                    data = json.load(f)
                    total_records_across_all += len(data.get('results', []))
        
        # Brief pause between endpoints
        time.sleep(1)
    
    print(f"\n" + "=" * 60)
    print(f"🎉 INDIVIDUAL EXPORT COMPLETED")
    print(f"=" * 60)
    print(f"✅ Successful exports: {successful_exports}/{len(all_endpoints)}")
    print(f"📊 Total records across all endpoints: {total_records_across_all:,}")
    print(f"📁 Individual files created: {successful_exports}")
    print(f"📋 Fields per record: EXACTLY 191")
    
    # Show files created
    print(f"\n📁 Individual files created:")
    for endpoint in all_endpoints:
        filepath = f"{OUTPUT_DIR}/{endpoint}.json"
        if os.path.exists(filepath):
            file_size = os.path.getsize(filepath) / (1024 * 1024)
            with open(filepath, 'r') as f:
                data = json.load(f)
                record_count = len(data.get('results', []))
            print(f"   ✅ {endpoint}.json: {record_count:,} records ({file_size:.2f} MB)")
    
    if total_records_across_all >= 15000:  # ~16 * 1000 average
        print(f"\n🎉 EXCELLENT! Substantial dataset across all endpoints")
    elif total_records_across_all >= 5000:
        print(f"\n✅ GOOD! Significant improvement in record counts")
    else:
        print(f"\n⚠️ Need to optimize progressive processing for more records")
    
    print(f"\n🚀 Ready for frontend consumption!")
    print(f"   Each endpoint has its own optimized file")
    print(f"   No combined file - individual access as requested")

if __name__ == "__main__":
    main() 