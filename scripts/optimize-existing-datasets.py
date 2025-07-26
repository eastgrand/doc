#!/usr/bin/env python3
"""
Optimize Existing Dataset Files
Filters existing endpoint JSON files to only include fields from complete_field_list_keep.txt
"""

import json
import os
from typing import Dict, Any, Set

def load_fields_to_keep() -> Set[str]:
    """Load the list of fields to keep from the file."""
    try:
        with open('complete_field_list_keep.txt', 'r') as f:
            fields = {line.strip() for line in f if line.strip()}
        print(f"✅ Loaded {len(fields)} fields to keep")
        return fields
    except FileNotFoundError:
        print("❌ complete_field_list_keep.txt not found!")
        return set()

def filter_record(record: Dict[str, Any], fields_to_keep: Set[str]) -> Dict[str, Any]:
    """Filter a record to only include the specified fields."""
    return {key: value for key, value in record.items() if key in fields_to_keep}

def optimize_endpoint_file(file_path: str, fields_to_keep: Set[str]) -> bool:
    """Optimize a single endpoint JSON file by filtering fields."""
    print(f"\n📄 Optimizing: {os.path.basename(file_path)}")
    
    try:
        # Load the file
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        # Get original file size
        original_size = os.path.getsize(file_path) / (1024 * 1024)  # MB
        
        # Filter the results if they exist
        if 'results' in data and data['results']:
            original_field_count = len(data['results'][0].keys()) if data['results'] else 0
            
            # Filter each record
            filtered_results = []
            for record in data['results']:
                filtered_record = filter_record(record, fields_to_keep)
                filtered_results.append(filtered_record)
            
            data['results'] = filtered_results
            
            filtered_field_count = len(filtered_results[0].keys()) if filtered_results else 0
            print(f"   📊 Fields: {original_field_count} → {filtered_field_count}")
            print(f"   📊 Records: {len(filtered_results)}")
            
            # Add optimization metadata
            if 'export_metadata' not in data:
                data['export_metadata'] = {}
            
            data['export_metadata']['optimization'] = {
                'optimized': True,
                'original_fields': original_field_count,
                'filtered_fields': filtered_field_count,
                'fields_kept': list(fields_to_keep),
                'optimization_date': '2025-07-26'
            }
            
            # Save the optimized file (overwrite original)
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2, default=str)
            
            # Get new file size
            new_size = os.path.getsize(file_path) / (1024 * 1024)  # MB
            reduction = ((original_size - new_size) / original_size) * 100
            
            print(f"   💾 Size: {original_size:.1f}MB → {new_size:.1f}MB ({reduction:.1f}% reduction)")
            return True
            
        else:
            print(f"   ⚠️ No results found in {file_path}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error processing {file_path}: {str(e)}")
        return False

def main():
    """Main optimization function."""
    print("🔧 Starting Dataset Optimization")
    print("=" * 50)
    
    # Load fields to keep
    fields_to_keep = load_fields_to_keep()
    if not fields_to_keep:
        print("❌ No fields to keep loaded. Exiting.")
        return
    
    # Define the endpoints directory
    endpoints_dir = "public/data/endpoints"
    
    if not os.path.exists(endpoints_dir):
        print(f"❌ Directory {endpoints_dir} not found!")
        return
    
    # Get all JSON files in the endpoints directory (excluding combined files)
    json_files = [f for f in os.listdir(endpoints_dir) 
                  if f.endswith('.json') and f not in ['all_endpoints.json', 'export_summary.json']]
    
    print(f"📁 Found {len(json_files)} endpoint files to optimize")
    print(f"🎯 Will keep {len(fields_to_keep)} fields per record")
    
    successful_optimizations = 0
    total_original_size = 0
    total_new_size = 0
    
    # Process each file
    for i, filename in enumerate(sorted(json_files), 1):
        file_path = os.path.join(endpoints_dir, filename)
        original_size = os.path.getsize(file_path) / (1024 * 1024)
        
        print(f"\n[{i}/{len(json_files)}] {filename} ({original_size:.1f}MB)")
        
        if optimize_endpoint_file(file_path, fields_to_keep):
            successful_optimizations += 1
            new_size = os.path.getsize(file_path) / (1024 * 1024)
            total_original_size += original_size
            total_new_size += new_size
    
    # Summary
    total_reduction = ((total_original_size - total_new_size) / total_original_size) * 100 if total_original_size > 0 else 0
    
    print("\n" + "=" * 50)
    print("📊 OPTIMIZATION SUMMARY")
    print("=" * 50)
    print(f"✅ Successfully optimized: {successful_optimizations}/{len(json_files)} files")
    print(f"📋 Fields per record: {len(fields_to_keep)} (reduced from ~1,086)")
    print(f"💾 Total size: {total_original_size:.1f}MB → {total_new_size:.1f}MB")
    print(f"🎯 Overall reduction: {total_reduction:.1f}%")
    print(f"💽 Space saved: {total_original_size - total_new_size:.1f}MB")
    print("\n🎉 Dataset optimization complete!")
    
    # Show sample of kept fields
    print(f"\n📋 Sample of fields kept in each record:")
    sample_fields = sorted(list(fields_to_keep))[:10]
    for field in sample_fields:
        print(f"   • {field}")
    if len(fields_to_keep) > 10:
        print(f"   ... and {len(fields_to_keep) - 10} more")

if __name__ == "__main__":
    main()