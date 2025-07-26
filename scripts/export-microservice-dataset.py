#!/usr/bin/env python3
"""
Comprehensive microservice data export script.
Calls multiple specialized endpoints to get complete data with SHAP values.
"""

import requests
import json
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Microservice configuration
MICROSERVICE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"

def call_microservice_endpoint(endpoint, payload):
    """Helper function to call any microservice endpoint"""
    try:
        response = requests.post(
            f"{MICROSERVICE_URL}{endpoint}",
            json=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {API_KEY}"
            },
            timeout=300
        )
        
        logger.info(f"📡 {endpoint} → Status: {response.status_code}")
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"❌ {endpoint} failed: {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"❌ {endpoint} error: {str(e)}")
        return None

def export_comprehensive_dataset():
    """Export complete dataset using all microservice endpoints"""
    
    logger.info("🚀 Starting comprehensive microservice data export...")
    
    # All brand target variables to include
    brand_targets = {
        "nike": "MP30034A_B_P",
        "adidas": "MP30029A_B_P", 
        "jordan": "MP30032A_B_P",
        "converse": "MP30031A_B_P",
        "new_balance": "MP30033A_B_P",
        "puma": "MP30035A_B_P",
        "reebok": "MP30036A_B_P",
        "asics": "MP30030A_B_P"
    }
    
    export_data = {
        "export_timestamp": datetime.now().isoformat(),
        "microservice_url": MICROSERVICE_URL,
        "datasets": {},
        "brand_targets": brand_targets
    }
    
    # 1. Try to get comprehensive dataset with all brand fields using multiple approaches
    logger.info("📊 1. Getting comprehensive dataset with all brand fields...")
    
    # Try different endpoints and methods to get all brand data
    all_results = None
    correlation_base = None
    all_fields_union = set()
    
    # Method 1: Try comprehensive data endpoint
    try:
        logger.info("   🏷️ Method 1: Trying /comprehensive-data endpoint...")
        comprehensive_data = call_microservice_endpoint("/comprehensive-data", {})
        
        if comprehensive_data and comprehensive_data.get('results'):
            logger.info(f"   ✅ Got {len(comprehensive_data['results'])} comprehensive records")
            all_results = comprehensive_data['results']
            correlation_base = comprehensive_data
            all_fields_union = set(comprehensive_data['results'][0].keys()) if comprehensive_data['results'] else set()
            
            # Check which brand fields are actually present
            sample_record = comprehensive_data['results'][0] if comprehensive_data['results'] else {}
            brand_fields_present = []
            for field_name, field_code in brand_targets.items():
                variations = [field_code, field_code.lower(), field_code.lower().replace('_', '')]
                if any(var in sample_record for var in variations):
                    brand_fields_present.append(field_name)
            logger.info(f"   🏷️ Brand fields found: {len(brand_fields_present)}/{len(brand_targets)} - {brand_fields_present}")
        else:
            raise Exception("No results from comprehensive endpoint")
            
    except Exception as e:
        logger.warning(f"   ⚠️ Method 1 failed: {e}")
        
        # Method 2: Try getting complete dataset with topN analysis
        try:
            logger.info("   🏷️ Method 2: Trying full dataset export with topN...")
            full_dataset_payload = {
                "query": "Export complete demographic and brand purchase dataset for all brands across all regions",
                "analysis_type": "topN",
                "target_variable": brand_targets["nike"],  # Use Nike as base but request all fields
                "matched_fields": list(brand_targets.values()),
                "limit": 5000,  # Get all records
                "include_all_fields": True
            }
            
            full_data = call_microservice_endpoint("/analyze", full_dataset_payload)
            
            if full_data and full_data.get('results'):
                logger.info(f"   ✅ Got {len(full_data['results'])} records from full dataset")
                all_results = full_data['results']
                correlation_base = full_data
                all_fields_union = set(full_data['results'][0].keys()) if full_data['results'] else set()
                
                # Check brand fields
                sample_record = full_data['results'][0] if full_data['results'] else {}
                brand_fields_present = []
                for field_name, field_code in brand_targets.items():
                    variations = [field_code, field_code.lower(), field_code.lower().replace('_', '')]
                    if any(var in sample_record for var in variations):
                        brand_fields_present.append(field_name)
                logger.info(f"   🏷️ Brand fields found: {len(brand_fields_present)}/{len(brand_targets)} - {brand_fields_present}")
            else:
                raise Exception("No results from full dataset export")
                
        except Exception as e2:
            logger.warning(f"   ⚠️ Method 2 failed: {e2}")
            logger.info("   🔄 Method 3: Falling back to individual brand analysis and merging...")
            
            # Method 3: Get analysis for each brand separately and merge
            for brand_name, brand_target in brand_targets.items():
                logger.info(f"   🏷️ Getting analysis for {brand_name.title()}...")
                brand_payload = {
                    "query": f"Analyze {brand_name.title()} brand purchase patterns across all geographic regions with demographic data",
                    "analysis_type": "topN",
                    "target_variable": brand_target,
                    "limit": 5000
                }
            
            brand_data = call_microservice_endpoint("/analyze", brand_payload)
            if brand_data and brand_data.get('results'):
                logger.info(f"      ✅ Got {len(brand_data['results'])} records for {brand_name}")
                
                # Merge results if this is our first successful response
                if all_results is None:
                    all_results = brand_data['results']
                    correlation_base = brand_data  # Keep metadata from first response
                else:
                    # Merge brand fields into existing records by matching geographic identifiers
                    for i, record in enumerate(all_results):
                        if i < len(brand_data['results']):
                            brand_record = brand_data['results'][i]
                            # Add brand-specific fields to the combined record
                            for field, value in brand_record.items():
                                if field.lower().startswith('mp') or field not in record:
                                    record[field] = value
                
                # Track all fields we've seen
                if brand_data['results']:
                    all_fields_union.update(brand_data['results'][0].keys())
    
    # Create final correlation dataset
    if all_results:
        correlation_base['results'] = all_results
        export_data["datasets"]["correlation_analysis"] = correlation_base
        logger.info(f"   ✅ MERGED: {len(all_results)} records with {len(all_fields_union)} unique fields")
        
        # Check which brand fields are actually present
        sample_record = all_results[0] if all_results else {}
        brand_fields_present = []
        for field_name, field_code in brand_targets.items():
            variations = [field_code, field_code.lower(), field_code.lower().replace('_', '')]
            if any(var in sample_record for var in variations):
                brand_fields_present.append(field_name)
        logger.info(f"   🏷️ Brand fields found: {len(brand_fields_present)}/{len(brand_targets)} - {brand_fields_present}")
    else:
        logger.error("   ❌ No correlation data obtained for any brand")
    
    # 2. Get factor importance with SHAP for each brand
    logger.info("🧠 2. Getting factor importance with SHAP for all brands...")
    for brand_name, brand_target in brand_targets.items():
        logger.info(f"   🏷️ Getting {brand_name.title()} factor importance...")
        importance_payload = {
            "target_field": brand_target,
            "method": "shap",
            "max_factors": 30  # Get more factors
        }
        
        importance_data = call_microservice_endpoint("/factor-importance", importance_payload)
        if importance_data:
            export_data["datasets"][f"{brand_name}_factor_importance"] = importance_data
            factors_count = len(importance_data.get('factors', []))
            logger.info(f"      ✅ Got {factors_count} {brand_name.title()} importance factors with SHAP")
        else:
            logger.info(f"      ⚠️ No factor importance data for {brand_name.title()}")
    
    # 3. Get feature interactions for Nike target
    logger.info("🔗 3. Getting feature interactions...")
    interactions_payload = {
        "target_field": brand_targets["nike"],
        "max_interactions": 20,
        "interaction_threshold": 0.05
    }
    
    interactions_data = call_microservice_endpoint("/feature-interactions", interactions_payload)
    if interactions_data:
        export_data["datasets"]["feature_interactions"] = interactions_data
        interactions_count = len(interactions_data.get('interactions', []))
        logger.info(f"   ✅ Got {interactions_count} feature interactions")
    else:
        logger.info("   ⚠️ Feature interactions returned no data")
    
    # 4. Try to get ALL data including all brand fields
    logger.info("📋 4. Getting comprehensive data with ALL brand fields...")
    comprehensive_payload = {
        "query": "Export complete dataset with all available demographic, brand, and socioeconomic fields including Nike, Adidas, Jordan, Puma, New Balance, Reebok, Converse, and Asics data",
        "analysis_type": "correlation", 
        "target_variable": brand_targets["nike"],
        "matched_fields": list(brand_targets.values()) + [
            # Add demographic fields that are commonly available
            "median_income", "total_population", "white_population", 
            "black_population", "asian_population", "hispanic_population"
        ]
    }
    
    comprehensive_data = call_microservice_endpoint("/analyze", comprehensive_payload)
    if comprehensive_data:
        export_data["datasets"]["comprehensive_data"] = comprehensive_data
        records_count = len(comprehensive_data.get('results', []))
        if comprehensive_data.get('results'):
            field_count = len(comprehensive_data['results'][0])
            logger.info(f"   ✅ Got {records_count} comprehensive records with {field_count} fields each")
            # Check which brand fields are actually present in comprehensive data
            sample_record = comprehensive_data['results'][0]
            brand_fields_present = [field for field in brand_targets.values() if field in sample_record or field.lower().replace('_', '') in sample_record]
            logger.info(f"   🏷️ Comprehensive brand fields: {len(brand_fields_present)}/{len(brand_targets)} - {brand_fields_present}")
        else:
            logger.info(f"   ✅ Got {records_count} comprehensive records")
    
    # 5. Get schema to see what fields are actually available
    logger.info("📋 5. Getting microservice schema...")
    schema_data = call_microservice_endpoint("/api/v1/schema", {})
    if schema_data:
        export_data["datasets"]["schema"] = schema_data
        field_count = len(schema_data.get('fields', {}))
        logger.info(f"   ✅ Got schema with {field_count} available fields")
    
    # Save complete export
    output_dir = "../public/data"
    os.makedirs(output_dir, exist_ok=True)
    output_file = f"{output_dir}/microservice-export.json"
    
    with open(output_file, 'w') as f:
        json.dump(export_data, f, indent=2)
    
    # Calculate and display summary
    file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
    
    logger.info("🎉 COMPREHENSIVE EXPORT COMPLETED!")
    logger.info(f"📁 File: {output_file}")
    logger.info(f"💾 Size: {file_size:.1f}MB")
    logger.info("📊 Summary:")
    
    total_records = 0
    shap_datasets = 0
    
    for dataset_name, dataset in export_data["datasets"].items():
        if dataset:
            if dataset_name == "schema":
                field_count = len(dataset.get('fields', {}))
                logger.info(f"   • {dataset_name}: {field_count} field definitions")
                continue
                
            records = len(dataset.get('results', dataset.get('factors', dataset.get('outliers', dataset.get('scenarios', dataset.get('interactions', []))))))
            total_records += records
            
            # Check for SHAP data
            has_shap = bool(
                dataset.get('factors') or 
                dataset.get('shap_values') or 
                dataset.get('interactions') or
                any(outlier.get('shap_explanation') for outlier in dataset.get('outliers', []))
            )
            
            if has_shap:
                shap_datasets += 1
                
            # Show field count for data records
            if dataset.get('results') and len(dataset['results']) > 0:
                field_count = len(dataset['results'][0])
                logger.info(f"   • {dataset_name}: {records} records with {field_count} fields each {'(with SHAP)' if has_shap else ''}")
            else:
                logger.info(f"   • {dataset_name}: {records} records {'(with SHAP)' if has_shap else ''}")
    
    logger.info(f"📈 Total records: {total_records}")
    logger.info(f"🧠 Datasets with SHAP: {shap_datasets}/{len([d for d in export_data['datasets'] if d != 'schema'])}")
    
    return True

if __name__ == "__main__":
    success = export_comprehensive_dataset()
    if success:
        print("\n✅ Complete export finished successfully!")
    else:
        print("\n❌ Export failed!") 