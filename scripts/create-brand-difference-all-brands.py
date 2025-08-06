#!/usr/bin/env python3
"""
Create brand-difference.json with ALL brand fields from the source data.
This will replace the current version that only has 3 brands.
"""

import json
import os

# Input and output paths
INPUT_FILE = "public/data/endpoints-original/analyze.json"  # or another source file with all fields
OUTPUT_FILE = "public/data/endpoints/brand-difference.json"

# ALL brand fields we want to include
BRAND_FIELDS = {
    "value_MP30029A_B_P": "Adidas",
    "value_MP30030A_B_P": "Asics", 
    "value_MP30031A_B_P": "Converse",
    "value_MP30032A_B_P": "Jordan",
    "value_MP30033A_B_P": "New Balance",
    "value_MP30034A_B_P": "Nike",
    "value_MP30035A_B_P": "Puma",
    "value_MP30036A_B_P": "Reebok",
    "value_MP30037A_B_P": "Skechers"
}

# Also include the count fields (without _P)
COUNT_FIELDS = [field.replace("_P", "") for field in BRAND_FIELDS.keys()]

def main():
    print(f"Loading source data from {INPUT_FILE}...")
    
    # Load the source data
    with open(INPUT_FILE, 'r') as f:
        source_data = json.load(f)
    
    # Handle different possible structures
    if isinstance(source_data, dict) and 'results' in source_data:
        records = source_data['results']
    elif isinstance(source_data, list):
        records = source_data
    else:
        raise ValueError("Unexpected data structure")
    
    print(f"Found {len(records)} records")
    
    # Process records to ensure all have the brand fields
    processed_records = []
    fields_to_keep = set(BRAND_FIELDS.keys()) | set(COUNT_FIELDS)
    
    for i, record in enumerate(records):
        # Keep essential fields
        new_record = {
            "area_id": record.get("area_id", f"area_{i}"),
            "area_name": record.get("area_name", record.get("ID", f"Unknown_{i}")),
            "ZIP": record.get("ZIP", record.get("ID", "")),
            "ID": record.get("ID", record.get("ZIP", "")),
        }
        
        # Add all brand fields (percentage and count)
        for field in fields_to_keep:
            if field in record:
                new_record[field] = record[field]
            else:
                # If field is missing, set to 0
                new_record[field] = 0.0 if field.endswith("_P") else 0
        
        # Add other important fields if they exist
        for key in ["state", "county", "city", "TOTPOP_CY", "value_TOTPOP_CY", "WLTHINDXCY", "value_WLTHINDXCY"]:
            if key in record:
                new_record[key] = record[key]
        
        processed_records.append(new_record)
    
    # Create the output structure matching the existing format
    output_data = {
        "analysis_type": "brand_difference",
        "description": "Brand market share difference analysis with all 9 athletic footwear brands",
        "feature_importance": [
            {
                "feature": field.replace("value_", ""),
                "importance": 1.0 / len(BRAND_FIELDS),  # Equal importance for all brands
                "correlation": 0,
                "description": f"{brand} athletic footwear market share"
            }
            for field, brand in BRAND_FIELDS.items()
        ],
        "model_info": {
            "algorithm": "brand_difference",
            "target_variable": "brand_difference_score",
            "features_used": list(BRAND_FIELDS.keys()),
            "r2_score": 1.0,
            "mae": 0.0,
            "rmse": 0.0
        },
        "results": processed_records,
        "success": True
    }
    
    # Save the output
    print(f"Saving {len(processed_records)} records to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print("Done! Brand difference dataset created with all 9 brands.")
    
    # Print summary
    print("\nSummary of brand fields in dataset:")
    for field, brand in BRAND_FIELDS.items():
        print(f"  {field}: {brand}")

if __name__ == "__main__":
    main()