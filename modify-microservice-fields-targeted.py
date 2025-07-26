#!/usr/bin/env python3
"""
Targeted script to modify enhanced_analysis_worker.py to return all selected fields
instead of just the current 12 hardcoded fields.
"""

import os
import shutil

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

def create_new_field_code():
    """Create the new field extraction code."""
    lines = []
    
    # Core fields setup
    lines.append("        # Add the target variable with both clean name and target_value")
    lines.append("        target_val = safe_float(row[target_variable])")
    lines.append("        result[clean_field_name] = target_val")
    lines.append("        result['target_value'] = target_val")
    lines.append("")
    
    # Add all selected fields
    lines.append("        # Add all selected demographic and brand fields")
    for field in sorted(SELECTED_FIELDS):
        if field in ['ID']:  # Skip fields already in base result
            continue
            
        # Handle different field name patterns
        if field == 'DESCRIPTION':
            lines.append("        if 'value_DESCRIPTION' in row and pd.notna(row['value_DESCRIPTION']):")
            lines.append("            result['description'] = str(row['value_DESCRIPTION'])")
        elif field in ['Age', 'Income']:
            # These might be direct fields or value_ prefixed
            lines.append(f"        if '{field}' in row and pd.notna(row['{field}']):")
            lines.append(f"            result['{field.lower()}'] = safe_float(row['{field}'])")
            lines.append(f"        elif 'value_{field}' in row and pd.notna(row['value_{field}']):")
            lines.append(f"            result['{field.lower()}'] = safe_float(row['value_{field}'])")
        else:
            # For most fields, try both direct and value_ prefixed versions
            field_lower = field.lower()
            lines.append(f"        if '{field}' in row and pd.notna(row['{field}']):")
            lines.append(f"            result['{field_lower}'] = safe_float(row['{field}'])")
            lines.append(f"        elif 'value_{field}' in row and pd.notna(row['value_{field}']):")
            lines.append(f"            result['{field_lower}'] = safe_float(row['value_{field}'])")
    
    lines.append("")
    lines.append("        # Add combined score if it was calculated")
    lines.append("        if 'combined_score' in row:")
    lines.append("            result['combined_score'] = safe_float(row['combined_score'])")
    
    return "\n".join(lines)

# Old code that we want to replace (the hardcoded field extraction)
OLD_CODE = '''        # Add the target variable with both clean name and target_value
        target_val = safe_float(row[target_variable])
        result[clean_field_name] = target_val
        result['target_value'] = target_val
        
        # Add commonly useful fields if they exist in the data
        if 'TOTPOP_CY' in row:
            result['total_population'] = safe_float(row['TOTPOP_CY'])
        
        if 'value_MEDDI_CY' in row:
            result['median_income'] = safe_float(row['value_MEDDI_CY'])
        
        if 'value_WHITE_CY' in row:
            result['white_population'] = safe_float(row['value_WHITE_CY'])
        
        if 'value_ASIAN_CY' in row:
            result['asian_population'] = safe_float(row['value_ASIAN_CY'])
        
        if 'value_BLACK_CY' in row:
            result['black_population'] = safe_float(row['value_BLACK_CY'])
        
        # Add combined score if it was calculated
        if 'combined_score' in row:
            result['combined_score'] = safe_float(row['combined_score'])'''

def modify_microservice():
    """Modify the microservice file."""
    microservice_file = "/Users/voldeck/code/shap-microservice/enhanced_analysis_worker.py"
    backup_file = f"{microservice_file}.backup-{os.getpid()}"
    
    print(f"Backing up original file to: {backup_file}")
    shutil.copy2(microservice_file, backup_file)
    
    # Read the file
    with open(microservice_file, 'r') as f:
        content = f.read()
    
    # Check if the old code exists
    if OLD_CODE not in content:
        print("ERROR: Could not find the expected hardcoded field section!")
        print("The microservice may have been modified already or have a different structure.")
        return False
    
    # Replace with new code
    new_field_code = create_new_field_code()
    new_content = content.replace(OLD_CODE, new_field_code)
    
    # Write back
    with open(microservice_file, 'w') as f:
        f.write(new_content)
    
    print(f"✅ Successfully modified {microservice_file}")
    print(f"📦 Backup saved as {backup_file}")
    print(f"📊 Added {len(SELECTED_FIELDS)} selected fields to microservice output")
    
    return True

def show_field_summary():
    """Show summary of fields being added."""
    print("=== MICROSERVICE FIELD EXPANSION ===")
    print(f"Adding {len(SELECTED_FIELDS)} selected fields to microservice output")
    print()
    
    # Categorize fields
    demographics = [f for f in SELECTED_FIELDS if any(x in f for x in ['_CY', 'POP', 'RACE', 'HISP', 'WHITE', 'BLACK', 'ASIAN', 'PACIFIC', 'AMERIND'])]
    brands = [f for f in SELECTED_FIELDS if f.startswith('MP')]
    core = [f for f in SELECTED_FIELDS if f in ['ID', 'DESCRIPTION', 'OBJECTID']]
    economic = [f for f in SELECTED_FIELDS if any(x in f for x in ['Income', 'MEDDI', 'WLTH', 'DIV'])]
    
    print("Field categories:")
    print(f"  🏛️  Demographics: {len(demographics)} fields")
    print(f"  👟  Brand/Purchase: {len(brands)} fields")
    print(f"  🔑  Core identifiers: {len(core)} fields") 
    print(f"  💰  Economic: {len(economic)} fields")
    print()
    
    # Show key brand examples
    nike_fields = [f for f in brands if '30034' in f]
    adidas_fields = [f for f in brands if '30029' in f]
    print("Key brand fields:")
    print(f"  Nike: {nike_fields}")
    print(f"  Adidas: {adidas_fields}")
    print()

if __name__ == "__main__":
    show_field_summary()
    
    print("This will replace the current 12 hardcoded fields with all selected fields.")
    print("The microservice will then return comprehensive demographic and brand data.")
    print()
    
    response = input("Proceed with modification? (y/N): ").strip().lower()
    
    if response == 'y':
        try:
            success = modify_microservice()
            if success:
                print()
                print("🎉 Modification completed successfully!")
                print()
                print("Next steps:")
                print("1. Test the modified microservice locally")
                print("2. Deploy to production if tests pass")
                print("3. Run export scripts to verify all fields are included")
                print("4. Test with Nike vs Adidas queries to confirm brand data")
            else:
                print("❌ Modification failed!")
        except Exception as e:
            print(f"❌ Error during modification: {e}")
    else:
        print("Modification cancelled.") 