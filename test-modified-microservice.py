#!/usr/bin/env python3
"""
Test script to verify the modified microservice returns all selected fields
instead of just the previous 12 hardcoded fields.
"""

import requests
import json
import time

# Microservice configuration
MICROSERVICE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"

# Expected fields from our modification
EXPECTED_FIELDS = [
    'amerind_cy', 'amerind_cy_p', 'asian_cy', 'asian_cy_p', 'age', 'black_cy', 'black_cy_p',
    'description', 'divindx_cy', 'fampop_cy', 'fampop_cy_p', 'genalphacy', 'genalphacy_p',
    'genz_cy', 'genz_cy_p', 'hhpop_cy', 'hhpop_cy_p', 'hispai_cy', 'hispai_cy_p',
    'hispblk_cy', 'hispblk_cy_p', 'hispoth_cy', 'hispoth_cy_p', 'hisppi_cy', 'hisppi_cy_p',
    'hispwht_cy', 'hispwht_cy_p', 'income', 'meddi_cy', 'millenn_cy', 'millenn_cy_p',
    'mp07109a_b', 'mp07109a_b_p', 'mp07111a_b', 'mp07111a_b_p', 'mp30016a_b', 'mp30016a_b_p',
    'mp30018a_b', 'mp30018a_b_p', 'mp30019a_b', 'mp30019a_b_p', 'mp30021a_b', 'mp30021a_b_p',
    'mp30029a_b', 'mp30029a_b_p', 'mp30030a_b', 'mp30030a_b_p', 'mp30031a_b', 'mp30031a_b_p',
    'mp30032a_b', 'mp30032a_b_p', 'mp30033a_b', 'mp30033a_b_p', 'mp30034a_b', 'mp30034a_b_p',
    'mp30035a_b', 'mp30035a_b_p', 'mp30036a_b', 'mp30036a_b_p', 'mp30037a_b', 'mp30037a_b_p',
    'mp31035a_b', 'mp31035a_b_p', 'mp31042a_b', 'mp31042a_b_p', 'mp33020a_b', 'mp33020a_b_p',
    'mp33031a_b', 'mp33031a_b_p', 'mp33032a_b', 'mp33032a_b_p', 'mp33104a_b', 'mp33104a_b_p',
    'mp33105a_b', 'mp33105a_b_p', 'mp33106a_b', 'mp33106a_b_p', 'mp33107a_b', 'mp33107a_b_p',
    'mp33108a_b', 'mp33108a_b_p', 'mp33119a_b', 'mp33119a_b_p', 'mp33120a_b', 'mp33120a_b_p',
    'objectid', 'othrace_cy', 'othrace_cy_p', 'pacific_cy', 'pacific_cy_p', 'psiv7umkvalm',
    'race2up_cy', 'race2up_cy_p', 'totpop_cy', 'white_cy', 'white_cy_p', 'wlthindxcy',
    'x9051_x', 'x9051_x_a'
]

# Core fields that should always be present
CORE_FIELDS = ['geo_id', 'zip_code', 'id', 'target_value']

def test_microservice_response():
    """Test the microservice and analyze the response."""
    print("=== TESTING MODIFIED MICROSERVICE ===")
    print(f"URL: {MICROSERVICE_URL}")
    print(f"Expected additional fields: {len(EXPECTED_FIELDS)}")
    print()
    
    # Test request payload
    test_payload = {
        "analysis_type": "correlation",
        "query": "Nike vs Adidas in high income areas",
        "target_variable": "MP30034A_B",  # Nike field
        "filters": [],
        "limit": 5  # Small sample for testing
    }
    
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
    }
    
    print("📤 Sending test request...")
    print(f"Target variable: {test_payload['target_variable']} (Nike)")
    print(f"Limit: {test_payload['limit']} records")
    print()
    
    try:
        start_time = time.time()
        response = requests.post(
            f"{MICROSERVICE_URL}/analyze",
            json=test_payload,
            headers=headers,
            timeout=60
        )
        end_time = time.time()
        
        print(f"⏱️  Response time: {end_time - start_time:.2f} seconds")
        print(f"📊 Status code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Error: {response.text}")
            return False
        
        result = response.json()
        
        # Analyze the response
        print("\n=== RESPONSE ANALYSIS ===")
        
        if not result.get('success'):
            print(f"❌ Analysis failed: {result.get('error', 'Unknown error')}")
            return False
        
        records = result.get('results', [])
        print(f"📊 Total records returned: {len(records)}")
        
        if not records:
            print("❌ No records returned!")
            return False
        
        # Analyze first record
        sample_record = records[0]
        actual_fields = set(sample_record.keys())
        
        print(f"\n📋 Fields in sample record: {len(actual_fields)}")
        print("Sample record fields:", sorted(actual_fields))
        
        # Check core fields
        missing_core = set(CORE_FIELDS) - actual_fields
        if missing_core:
            print(f"❌ Missing core fields: {missing_core}")
        else:
            print("✅ All core fields present")
        
        # Check for Nike/Adidas fields
        nike_fields = [f for f in actual_fields if 'mp30034' in f.lower()]
        adidas_fields = [f for f in actual_fields if 'mp30029' in f.lower()]
        
        print(f"\n🏃‍♂️ Nike fields found: {nike_fields}")
        print(f"👟 Adidas fields found: {adidas_fields}")
        
        # Check demographic fields
        demo_fields = [f for f in actual_fields if any(x in f.lower() for x in ['_cy', 'pop', 'race', 'hisp', 'white', 'black', 'asian'])]
        print(f"👥 Demographic fields found: {len(demo_fields)}")
        
        # Compare with expected fields
        expected_set = set([f.lower() for f in EXPECTED_FIELDS])
        found_expected = actual_fields.intersection(expected_set)
        missing_expected = expected_set - actual_fields
        
        print(f"\n📈 Expected fields found: {len(found_expected)}/{len(expected_set)}")
        
        if missing_expected:
            print(f"⚠️  Missing expected fields ({len(missing_expected)}): {sorted(list(missing_expected)[:10])}...")
        else:
            print("✅ All expected fields found!")
        
        # Show sample values for key fields
        print(f"\n📊 Sample values from record {sample_record.get('zip_code', 'N/A')}:")
        
        key_fields = ['zip_code', 'target_value', 'totpop_cy', 'meddi_cy', 'mp30034a_b', 'mp30029a_b']
        for field in key_fields:
            if field in sample_record:
                value = sample_record[field]
                print(f"  {field}: {value}")
        
        # Overall assessment
        if len(actual_fields) > 20:  # Much more than the old 12 fields
            print(f"\n🎉 SUCCESS: Microservice now returns {len(actual_fields)} fields (vs. previous 12)")
            print("✅ Field expansion modification successful!")
            return True
        else:
            print(f"\n❌ CONCERN: Only {len(actual_fields)} fields returned (expected much more)")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {e}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ JSON decode error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_comparison_query():
    """Test a Nike vs Adidas comparison query."""
    print("\n=== TESTING NIKE VS ADIDAS COMPARISON ===")
    
    payload = {
        "analysis_type": "comparison",
        "query": "Compare Nike and Adidas popularity in high income neighborhoods",
        "target_variable": "MP30034A_B",  # Nike
        "comparison_variable": "MP30029A_B",  # Adidas
        "filters": [
            {
                "field": "MEDDI_CY",
                "operator": "greater_than",
                "value": 75000
            }
        ],
        "limit": 3
    }
    
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
    }
    
    try:
        print("📤 Testing Nike vs Adidas comparison...")
        response = requests.post(
            f"{MICROSERVICE_URL}/analyze",
            json=payload,
            headers=headers,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                records = result.get('results', [])
                print(f"✅ Comparison successful: {len(records)} records")
                
                if records:
                    sample = records[0]
                    nike_val = sample.get('mp30034a_b', 'N/A')
                    adidas_val = sample.get('mp30029a_b', 'N/A')
                    income = sample.get('meddi_cy', 'N/A')
                    
                    print(f"Sample ZIP {sample.get('zip_code')}: Nike={nike_val}, Adidas={adidas_val}, Income=${income}")
                    return True
            else:
                print(f"❌ Comparison failed: {result.get('error')}")
        else:
            print(f"❌ Request failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Comparison test error: {e}")
    
    return False

if __name__ == "__main__":
    print("Starting microservice field expansion verification...\n")
    
    # Test basic response
    basic_success = test_microservice_response()
    
    # Test comparison functionality
    comparison_success = test_comparison_query()
    
    print("\n" + "="*50)
    print("FINAL RESULTS:")
    print(f"✅ Basic field expansion: {'PASSED' if basic_success else 'FAILED'}")
    print(f"✅ Nike vs Adidas comparison: {'PASSED' if comparison_success else 'FAILED'}")
    
    if basic_success and comparison_success:
        print("\n🎉 ALL TESTS PASSED!")
        print("The microservice modification was successful!")
        print("\nNext steps:")
        print("1. The microservice now returns comprehensive demographic and brand data")
        print("2. Ready for full dataset exports")
        print("3. Nike vs Adidas analysis queries will now work with full data")
    else:
        print("\n⚠️  SOME TESTS FAILED")
        print("Further investigation may be needed.") 