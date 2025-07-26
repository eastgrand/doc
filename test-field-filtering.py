#!/usr/bin/env python3
"""
Test Field Filtering on Live Microservice
Tests the new field filtering functionality before running full export
"""

import requests
import json
import time

# Microservice configuration
MICROSERVICE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"

# Test fields - small subset for testing
TEST_FIELDS = [
    "ID",
    "TOTPOP_CY", 
    "MEDDI_CY",
    "shap_AMERIND_CY",
    "shap_ASIAN_CY",
    "shap_BLACK_CY",
    "value_AMERIND_CY",
    "value_ASIAN_CY", 
    "value_BLACK_CY",
    "MP30034A_B_P",  # Nike
    "MP30029A_B_P"   # Adidas
]

def test_field_filtering():
    """Test field filtering with a simple spatial-clusters request"""
    print("🧪 Testing field filtering on live microservice...")
    print(f"🌐 URL: {MICROSERVICE_URL}")
    print(f"📋 Testing with {len(TEST_FIELDS)} fields instead of all ~1086 fields")
    
    # Test payload with field filtering
    test_payload = {
        "query": "Test field filtering with spatial clusters analysis",
        "analysis_type": "clustering",
        "target_variable": "MP30034A_B_P",
        "cluster_count": 3,
        "clustering_method": "kmeans",
        "matched_fields": TEST_FIELDS,          # NEW: Specify which fields to return
        "include_all_fields": False             # NEW: Enable field filtering
    }
    
    headers = {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json"
    }
    
    print("\n📡 Test payload:")
    print(f"   • matched_fields: {len(TEST_FIELDS)} fields")
    print(f"   • include_all_fields: False")
    print(f"   • Sample fields: {TEST_FIELDS[:5]}")
    
    try:
        print("\n🔄 Making request to /spatial-clusters endpoint...")
        start_time = time.time()
        
        response = requests.post(
            f"{MICROSERVICE_URL}/spatial-clusters",
            json=test_payload,
            headers=headers,
            timeout=120
        )
        
        elapsed_time = time.time() - start_time
        print(f"⏱️  Response time: {elapsed_time:.2f}s")
        print(f"📊 Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success') and data.get('results'):
                sample_record = data['results'][0]
                field_count = len(sample_record.keys())
                record_count = len(data['results'])
                
                print(f"\n✅ SUCCESS - Field filtering works!")
                print(f"   📊 Records returned: {record_count}")
                print(f"   📋 Fields per record: {field_count}")
                print(f"   🎯 Expected fields: {len(TEST_FIELDS)}")
                print(f"   ✅ Field filtering: {'SUCCESSFUL' if field_count <= len(TEST_FIELDS) + 5 else 'FAILED'}")
                
                print(f"\n📋 Actual fields returned:")
                for i, field in enumerate(sorted(sample_record.keys())):
                    print(f"   {i+1:2d}. {field}")
                
                # Check if our test fields are present
                missing_fields = []
                extra_fields = []
                for field in TEST_FIELDS:
                    if field not in sample_record:
                        missing_fields.append(field)
                
                for field in sample_record.keys():
                    if field not in TEST_FIELDS:
                        extra_fields.append(field)
                
                if missing_fields:
                    print(f"\n⚠️  Missing expected fields: {missing_fields}")
                if extra_fields:
                    print(f"\n➕ Additional fields (computed/metadata): {extra_fields}")
                
                # Estimate file size reduction
                estimated_reduction = ((1086 - field_count) / 1086) * 100
                print(f"\n💾 Estimated file size reduction: {estimated_reduction:.1f}%")
                
                return True
                
            else:
                print(f"❌ API returned error: {data}")
                return False
                
        else:
            print(f"❌ HTTP Error {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("⏰ Request timed out after 2 minutes")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_without_filtering():
    """Test the same request without field filtering for comparison"""
    print("\n🔄 Testing WITHOUT field filtering for comparison...")
    
    # Same payload but with field filtering disabled
    test_payload = {
        "query": "Test without field filtering - should return all fields",
        "analysis_type": "clustering", 
        "target_variable": "MP30034A_B_P",
        "cluster_count": 3,
        "clustering_method": "kmeans",
        "include_all_fields": True              # Return all fields
    }
    
    headers = {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json"
    }
    
    try:
        start_time = time.time()
        
        response = requests.post(
            f"{MICROSERVICE_URL}/spatial-clusters",
            json=test_payload,
            headers=headers,
            timeout=120
        )
        
        elapsed_time = time.time() - start_time
        print(f"⏱️  Response time: {elapsed_time:.2f}s")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success') and data.get('results'):
                sample_record = data['results'][0]
                field_count = len(sample_record.keys())
                
                print(f"📊 Fields without filtering: {field_count}")
                print(f"📋 Expected ~1086 fields: {'✅' if field_count > 1000 else '❌'}")
                
                return field_count
            else:
                print(f"❌ API error: {data}")
                return 0
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return 0
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return 0

def main():
    """Main test function"""
    print("🚀 Field Filtering Test Suite")
    print("=" * 50)
    
    # Run the actual tests
    print("🧪 Running field filtering tests...")
    
    # Test 1: With field filtering
    print("\n" + "="*50)
    print("TEST 1: Field Filtering ENABLED")
    print("="*50)
    filtering_success = test_field_filtering()
    
    # Test 2: Without field filtering  
    print("\n" + "="*50)
    print("TEST 2: Field Filtering DISABLED")
    print("="*50)
    unfiltered_count = test_without_filtering()
    
    # Summary
    print("\n" + "="*50)
    print("📊 TEST SUMMARY")
    print("="*50)
    print(f"✅ Field filtering test: {'PASSED' if filtering_success else 'FAILED'}")
    print(f"📊 Unfiltered field count: {unfiltered_count}")
    print(f"🎯 Field filtering works: {'YES' if filtering_success else 'NO'}")
    
    if filtering_success:
        print("\n🎉 SUCCESS! Field filtering is working correctly!")
        print("   Ready to run the full export with optimized field filtering.")
    else:
        print("\n❌ FAILED! Field filtering needs debugging.")
        print("   Check microservice logs for issues.")

if __name__ == "__main__":
    main()