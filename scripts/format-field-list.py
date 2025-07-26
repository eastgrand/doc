#!/usr/bin/env python3
"""
Format the extracted field list into clean JSON and markdown files
"""

import json

def process_field_list():
    """Process the numbered field list into clean formats"""
    
    # Read the numbered field list
    fields = []
    with open("../public/data/microservice-all-fields.txt", "r") as f:
        for line in f:
            line = line.strip()
            if line and line[0].isdigit():
                # Extract field name after the number
                parts = line.split(None, 1)  # Split on whitespace, max 1 split
                if len(parts) > 1:
                    field_name = parts[1].strip()
                    fields.append(field_name)
    
    print(f"📊 Processed {len(fields)} fields")
    
    # Create clean JSON
    field_data = {
        "total_fields": len(fields),
        "source": "cleaned_data.csv header",
        "extraction_date": "2025-01-15",
        "fields": fields
    }
    
    with open("../public/data/microservice-all-fields.json", "w") as f:
        json.dump(field_data, f, indent=2)
    
    # Create markdown with categorization
    demographics_fields = [f for f in fields if any(term in f.upper() for term in ['POP', 'AGE', 'RACE', 'ETHNIC', 'WHITE', 'BLACK', 'ASIAN', 'HISP', 'AMER'])]
    income_fields = [f for f in fields if any(term in f.upper() for term in ['INCOME', 'MEDDI', 'HINC', 'EARN', 'WAGE'])]
    housing_fields = [f for f in fields if any(term in f.upper() for term in ['HSE', 'HOUSE', 'RENT', 'OWN', 'MORT', 'VAL'])]
    education_fields = [f for f in fields if any(term in f.upper() for term in ['EDUC', 'SCHOOL', 'COLLEGE', 'DEGREE'])]
    employment_fields = [f for f in fields if any(term in f.upper() for term in ['EMPL', 'WORK', 'LABOR', 'OCCUP', 'INDUSTRY', 'JOB'])]
    brand_fields = [f for f in fields if any(term in f.upper() for term in ['MP30', 'BRAND', 'NIKE', 'ADIDAS'])]
    geographic_fields = [f for f in fields if any(term in f.upper() for term in ['ID', 'AREA', 'LENGTH', 'SHAPE', 'GEO', 'COORD'])]
    
    with open("../public/data/microservice-all-fields.md", "w") as f:
        f.write("# Complete Microservice Field List\n\n")
        f.write(f"**Total Fields:** {len(fields)}\n")
        f.write(f"**Source:** cleaned_data.csv\n\n")
        
        categories = [
            ("Geographic/ID Fields", geographic_fields),
            ("Brand/Purchase Fields", brand_fields), 
            ("Demographics", demographics_fields),
            ("Income/Economic", income_fields),
            ("Housing", housing_fields),
            ("Education", education_fields),
            ("Employment", employment_fields)
        ]
        
        for category_name, category_fields in categories:
            if category_fields:
                f.write(f"## {category_name} ({len(category_fields)} fields)\n\n")
                for field in sorted(category_fields):
                    f.write(f"- `{field}`\n")
                f.write("\n")
        
        # All other fields
        categorized = set()
        for _, category_fields in categories:
            categorized.update(category_fields)
        
        other_fields = [f for f in fields if f not in categorized]
        if other_fields:
            f.write(f"## Other Fields ({len(other_fields)} fields)\n\n")
            for field in sorted(other_fields):
                f.write(f"- `{field}`\n")
            f.write("\n")
        
        f.write("## Complete Alphabetical List\n\n")
        for i, field in enumerate(sorted(fields), 1):
            f.write(f"{i:3d}. `{field}`\n")
    
    print(f"✅ Created formatted files:")
    print(f"   - ../public/data/microservice-all-fields.json")
    print(f"   - ../public/data/microservice-all-fields.md")
    
    # Show key categories
    print(f"\n📋 Field Summary:")
    print(f"   - Demographics: {len(demographics_fields)} fields")
    print(f"   - Income/Economic: {len(income_fields)} fields") 
    print(f"   - Housing: {len(housing_fields)} fields")
    print(f"   - Education: {len(education_fields)} fields")
    print(f"   - Employment: {len(employment_fields)} fields")
    print(f"   - Brand/Purchase: {len(brand_fields)} fields")
    print(f"   - Geographic: {len(geographic_fields)} fields")
    print(f"   - Other: {len(other_fields)} fields")
    
    return fields

if __name__ == "__main__":
    process_field_list() 