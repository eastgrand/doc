#!/usr/bin/env python3
"""
Filter the existing large JSON files to keep only necessary fields
"""

import json
import os

# Load the list of fields to keep
def load_fields_to_keep():
    """Load the list of fields to keep from the file."""
    with open('complete_field_list_keep.txt', 'r') as f:
        fields = [line.strip() for line in f if line.strip()]
    print(f"✅ Loaded {len(fields)} fields to keep")
    return set(fields)

def filter_json_file(input_path, output_path, fields_to_keep):
    """Filter a JSON file to keep only specified fields."""
    print(f"\n📄 Processing {input_path}...")
    
    # Load the JSON file
    with open(input_path, 'r') as f:
        data = json.load(f)
    
    # Get original stats
    if 'results' in data and data['results']:
        original_records = len(data['results'])
        original_fields = len(data['results'][0]) if data['results'] else 0
        print(f"   Original: {original_records} records with {original_fields} fields each")
        
        # Filter each record
        filtered_results = []
        for record in data['results']:
            filtered_record = {k: v for k, v in record.items() if k in fields_to_keep}
            filtered_results.append(filtered_record)
        
        data['results'] = filtered_results
        
        # Get new stats
        new_fields = len(filtered_results[0]) if filtered_results else 0
        print(f"   Filtered: {original_records} records with {new_fields} fields each")
        print(f"   Reduction: {original_fields - new_fields} fields removed ({(1 - new_fields/original_fields)*100:.1f}% reduction)")
    
    # Save the filtered data
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    # Compare file sizes
    original_size = os.path.getsize(input_path) / (1024 * 1024)
    new_size = os.path.getsize(output_path) / (1024 * 1024)
    print(f"   File size: {original_size:.1f}MB → {new_size:.1f}MB ({(1 - new_size/original_size)*100:.1f}% reduction)")

def main():
    print("🚀 Filtering large JSON files to remove unnecessary fields...")
    
    # Load fields to keep
    fields_to_keep = load_fields_to_keep()
    
    # Process the two files
    base_dir = "/Users/voldeck/code/mpiq-ai-chat/public/data/endpoints"
    
    files_to_process = [
        "segment-profiling.json",
        "spatial-clusters.json"
    ]
    
    for filename in files_to_process:
        input_path = os.path.join(base_dir, filename)
        output_path = os.path.join(base_dir, filename)  # Overwrite original
        
        if os.path.exists(input_path):
            filter_json_file(input_path, output_path, fields_to_keep)
        else:
            print(f"❌ File not found: {input_path}")
    
    print("\n✅ Filtering complete!")

if __name__ == "__main__":
    main()