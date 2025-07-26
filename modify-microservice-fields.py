#!/usr/bin/env python3
"""
Script to modify enhanced_analysis_worker.py to return all selected fields
instead of just the current 12 hardcoded fields.
"""

import re

# List of fields to include (from user selection)
SELECTED_FIELDS = [
    'AMERIND_CY', 'AMERIND_CY_P', 'ASIAN_CY', 'ASIAN_CY_P', 'Age', 'BLACK_CY', 'BLACK_CY_P',
    'DESCRIPTION', 'DIVINDX_CY', 'FAMPOP_CY', 'FAMPOP_CY_P', 'GENALPHACY', 'GENALPHACY_P',
    'GENZ_CY', 'GENZ_CY_P', 'HHPOP_CY', 'HHPOP_CY_P', 'HISPAI_CY', 'HISPAI_CY_P',
    'HISPBLK_CY', 'HISPBLK_CY_P', 'HISPOTH_CY', 'HISPOTH_CY_P', 'HISPPI_CY', 'HISPPI_CY_P',
    'HISPWHT_CY', 'HISPWHT_CY_P', 'ID', 'Income', 'MEDDI_CY', 'MILLENN_CY', 'MILLENN_CY_P',
    'MP07109A_B', 'MP07109A_B_P', 'MP07111A_B', 'MP07111A_B_P', 'MP30016A_B', 'MP30016A_B_P',
    'MP30018A_B', 'MP30018A_B_P', 'MP30019A_B', 'MP30019A_B_P', 'MP30021A_B', 'MP30021A_B_P',
    'MP30029A_B', 'MP30029A_B_P', 'MP30030A_B', 'MP30030A_B_P', 'MP30031A_B', 'MP30031A_B_P',
    'MP30032A_B', 'MP30032A_B_P', 'MP30033A_B', 'MP30033A_B_P', 'MP30034A_B', 'MP30034A_B_P',
    'MP30035A_B', 'MP30035A_B_P', 'MP30036A_B', 'MP30036A_B_P', 'MP30037A_B', 'MP30037A_B_P',
    'MP31035A_B', 'MP31035A_B_P', 'MP31042A_B', 'MP31042A_B_P', 'MP33020A_B', 'MP33020A_B_P',
    'MP33031A_B', 'MP33031A_B_P', 'MP33032A_B', 'MP33032A_B_P', 'MP33104A_B', 'MP33104A_B_P',
    'MP33105A_B', 'MP33105A_B_P', 'MP33106A_B', 'MP33106A_B_P', 'MP33107A_B', 'MP33107A_B_P',
    'MP33108A_B', 'MP33108A_B_P', 'MP33119A_B', 'MP33119A_B_P', 'MP33120A_B', 'MP33120A_B_P',
    'OBJECTID', 'OTHRACE_CY', 'OTHRACE_CY_P', 'PACIFIC_CY', 'PACIFIC_CY_P', 'PSIV7UMKVALM',
    'RACE2UP_CY', 'RACE2UP_CY_P', 'TOTPOP_CY', 'WHITE_CY', 'WHITE_CY_P', 'WLTHINDXCY',
    'X9051_X', 'X9051_X_A'
]

def generate_field_extraction_code():
    """Generate Python code to extract all selected fields."""
    lines = []
    
    # Add essential fields first
    lines.append("        result = {")
    lines.append("            'geo_id': str(row['ID']),")
    lines.append("            'ZIP_CODE': str(row['ID']),")
    lines.append("            'ID': str(row['ID'])")
    lines.append("        }")
    lines.append("")
    
    # Add target variable handling
    lines.append("        # Add the target variable with both clean name and target_value")
    lines.append("        target_val = safe_float(row[target_variable])")
    lines.append("        result[clean_field_name] = target_val")
    lines.append("        result['target_value'] = target_val")
    lines.append("")
    
    # Add all selected fields
    lines.append("        # Add all selected demographic and brand fields")
    for field in sorted(SELECTED_FIELDS):
        if field in ['ID']:  # Skip fields already handled
            continue
            
        # Handle different field name patterns
        if field == 'DESCRIPTION':
            lines.append(f"        if 'value_DESCRIPTION' in row and pd.notna(row['value_DESCRIPTION']):")
            lines.append(f"            result['DESCRIPTION'] = str(row['value_DESCRIPTION'])")
        elif field in ['Age', 'Income']:
            # These might be direct fields or value_ prefixed
            lines.append(f"        if '{field}' in row and pd.notna(row['{field}']):")
            lines.append(f"            result['{field.lower()}'] = safe_float(row['{field}'])")
            lines.append(f"        elif 'value_{field}' in row and pd.notna(row['value_{field}']):")
            lines.append(f"            result['{field.lower()}'] = safe_float(row['value_{field}'])")
        else:
            # For most fields, try both direct and value_ prefixed versions
            lines.append(f"        if '{field}' in row and pd.notna(row['{field}']):")
            lines.append(f"            result['{field.lower()}'] = safe_float(row['{field}'])")
            lines.append(f"        elif 'value_{field}' in row and pd.notna(row['value_{field}']):")
            lines.append(f"            result['{field.lower()}'] = safe_float(row['value_{field}'])")
    
    lines.append("")
    lines.append("        # Add combined score if it was calculated")
    lines.append("        if 'combined_score' in row:")
    lines.append("            result['combined_score'] = safe_float(row['combined_score'])")
    lines.append("")
    lines.append("        results.append(result)")
    
    return "\n".join(lines)

def create_backup_and_modify():
    """Create backup and modify the microservice file."""
    microservice_file = "/Users/voldeck/code/shap-microservice/enhanced_analysis_worker.py"
    backup_file = f"{microservice_file}.backup-before-field-expansion"
    
    print(f"Creating backup: {backup_file}")
    
    # Read the original file
    with open(microservice_file, 'r') as f:
        content = f.read()
    
    # Create backup
    with open(backup_file, 'w') as f:
        f.write(content)
    
    # Generate the new field extraction code
    new_code = generate_field_extraction_code()
    
    # Pattern to match the current hardcoded result building
    # Looking for the section that starts with "for _, row in df.iterrows():" and builds the result dict
    pattern = r'(for _, row in df\.iterrows\(\):\s+result = \{[^}]+\}.*?results\.append\(result\))'
    
    # Find the section to replace
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        print("ERROR: Could not find the result building section to replace!")
        print("Manual modification required.")
        return False
    
    # Replace the hardcoded section with our new code
    new_content = content[:match.start()] + new_code + content[match.end():]
    
    # Write the modified file
    with open(microservice_file, 'w') as f:
        f.write(new_content)
    
    print(f"Successfully modified {microservice_file}")
    print(f"Backup saved as {backup_file}")
    print(f"Added {len(SELECTED_FIELDS)} selected fields to the microservice output")
    
    return True

def show_modification_summary():
    """Show what fields were added."""
    print("\n=== FIELD MODIFICATION SUMMARY ===")
    print(f"Total selected fields: {len(SELECTED_FIELDS)}")
    print("\nField categories:")
    
    # Categorize fields
    demographics = [f for f in SELECTED_FIELDS if any(x in f for x in ['_CY', 'POP', 'AGE', 'RACE', 'HISP', 'WHITE', 'BLACK', 'ASIAN'])]
    brands = [f for f in SELECTED_FIELDS if f.startswith('MP')]
    core = [f for f in SELECTED_FIELDS if f in ['ID', 'DESCRIPTION', 'OBJECTID']]
    economic = [f for f in SELECTED_FIELDS if any(x in f for x in ['Income', 'MEDDI', 'WLTH', 'DIV'])]
    other = [f for f in SELECTED_FIELDS if f not in demographics + brands + core + economic]
    
    print(f"  Demographics: {len(demographics)} fields")
    print(f"  Brand/Purchase: {len(brands)} fields") 
    print(f"  Core identifiers: {len(core)} fields")
    print(f"  Economic: {len(economic)} fields")
    print(f"  Other: {len(other)} fields")
    
    print("\nExample brand fields included:")
    nike_fields = [f for f in brands if '30034' in f]  # Nike
    adidas_fields = [f for f in brands if '30029' in f]  # Adidas
    print(f"  Nike fields: {nike_fields}")
    print(f"  Adidas fields: {adidas_fields}")

if __name__ == "__main__":
    print("=== MICROSERVICE FIELD EXPANSION ===")
    print("This script will modify enhanced_analysis_worker.py to return")
    print("all selected demographic and brand fields instead of just 12 hardcoded fields.")
    print()
    
    show_modification_summary()
    
    response = input("\nProceed with modification? (y/N): ")
    if response.lower() == 'y':
        success = create_backup_and_modify()
        if success:
            print("\n✅ Modification completed successfully!")
            print("\nNext steps:")
            print("1. Test the modified microservice locally")
            print("2. Deploy to production if tests pass")
            print("3. Verify that exports now include all selected fields")
        else:
            print("\n❌ Modification failed - manual editing required")
    else:
        print("Modification cancelled.") 