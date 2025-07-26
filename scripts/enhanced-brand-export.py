#!/usr/bin/env python3
"""
Enhanced Brand Export Script
Creates comprehensive individual exports for each brand with full SHAP analysis and business context
"""

import json
import requests
import os
import sys
from datetime import datetime
import logging
from typing import Dict, List, Any, Optional

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration
MICROSERVICE_URL = "https://shap-demographic-analytics-v3.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"
OUTPUT_DIR = "../public/data/exports"
BRANDS = {
    "nike": {
        "name": "Nike",
        "target_field": "MP30034A_B_P",
        "canonical_name": "mp30034a_b_p",
        "description": "Nike athletic footwear purchase penetration by postal area",
        "category": "athletic_footwear",
        "market_position": "premium_mainstream"
    },
    "adidas": {
        "name": "Adidas", 
        "target_field": "MP30029A_B_P",
        "canonical_name": "mp30029a_b_p",
        "description": "Adidas athletic footwear purchase penetration by postal area",
        "category": "athletic_footwear",
        "market_position": "premium_mainstream"
    },
    "jordan": {
        "name": "Jordan",
        "target_field": "MP30032A_B_P", 
        "canonical_name": "mp30032a_b_p",
        "description": "Jordan athletic footwear purchase penetration by postal area",
        "category": "athletic_footwear",
        "market_position": "premium_lifestyle"
    },
    "converse": {
        "name": "Converse",
        "target_field": "MP30031A_B_P",
        "canonical_name": "mp30031a_b_p", 
        "description": "Converse footwear purchase penetration by postal area",
        "category": "casual_footwear",
        "market_position": "mainstream_lifestyle"
    },
    "new_balance": {
        "name": "New Balance",
        "target_field": "MP30033A_B_P",
        "canonical_name": "mp30033a_b_p",
        "description": "New Balance athletic footwear purchase penetration by postal area", 
        "category": "athletic_footwear",
        "market_position": "performance_focused"
    },
    "puma": {
        "name": "Puma",
        "target_field": "MP30035A_B_P",
        "canonical_name": "mp30035a_b_p",
        "description": "Puma athletic footwear purchase penetration by postal area",
        "category": "athletic_footwear", 
        "market_position": "performance_lifestyle"
    },
    "reebok": {
        "name": "Reebok",
        "target_field": "MP30036A_B_P",
        "canonical_name": "mp30036a_b_p",
        "description": "Reebok athletic footwear purchase penetration by postal area",
        "category": "athletic_footwear",
        "market_position": "mainstream_fitness"
    },
    "asics": {
        "name": "Asics",
        "target_field": "MP30030A_B_P", 
        "canonical_name": "mp30030a_b_p",
        "description": "Asics athletic footwear purchase penetration by postal area",
        "category": "athletic_footwear",
        "market_position": "performance_running"
    }
}

# Field metadata with business context
FIELD_METADATA = {
    "median_income": {
        "description": "Median household income in the postal area",
        "category": "economic_demographics",
        "data_type": "currency",
        "business_meaning": "Higher income areas typically show different brand preferences and purchasing power",
        "analysis_relevance": "Key predictor of premium brand adoption"
    },
    "disposable_income": {
        "description": "Average disposable household income after essential expenses",
        "category": "economic_demographics", 
        "data_type": "currency",
        "business_meaning": "Directly impacts discretionary spending on footwear brands",
        "analysis_relevance": "Strong predictor of brand loyalty and premium purchases"
    },
    "population_density": {
        "description": "Number of people per square kilometer",
        "category": "geographic_demographics",
        "data_type": "density",
        "business_meaning": "Urban vs suburban vs rural lifestyle patterns affect brand preferences",
        "analysis_relevance": "Urban areas often show higher fashion brand adoption"
    },
    "age_median": {
        "description": "Median age of population in the area",
        "category": "demographic_age",
        "data_type": "years", 
        "business_meaning": "Age strongly correlates with brand preferences and lifestyle choices",
        "analysis_relevance": "Younger demographics prefer different brands than older"
    },
    "education_score": {
        "description": "Composite education attainment score for the area",
        "category": "social_demographics",
        "data_type": "score",
        "business_meaning": "Education level influences brand awareness and purchasing decisions",
        "analysis_relevance": "Higher education correlates with brand consciousness"
    },
    "asian_population": {
        "description": "Percentage of population with Asian ethnicity",
        "category": "ethnic_demographics",
        "data_type": "percentage",
        "business_meaning": "Different ethnic groups have distinct brand preferences and shopping behaviors",
        "analysis_relevance": "Cultural preferences impact brand adoption patterns"
    },
    "black_population": {
        "description": "Percentage of population with Black ethnicity", 
        "category": "ethnic_demographics",
        "data_type": "percentage",
        "business_meaning": "Cultural and community influences on brand preferences",
        "analysis_relevance": "Strong influence on athletic and lifestyle brand choices"
    },
    "hispanic_population": {
        "description": "Percentage of population with Hispanic ethnicity",
        "category": "ethnic_demographics", 
        "data_type": "percentage",
        "business_meaning": "Growing demographic with distinct brand preferences",
        "analysis_relevance": "Important segment for brand growth strategies"
    }
}

def call_microservice_endpoint(endpoint: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Make a request to the microservice and return the response"""
    try:
        url = f"{MICROSERVICE_URL}{endpoint}"
        logger.info(f"Calling {url}")
        
        headers = {
            "Content-Type": "application/json",
            "X-API-KEY": API_KEY
        }
        response = requests.post(url, json=payload, headers=headers, timeout=120)
        response.raise_for_status()
        
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error calling {endpoint}: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error calling {endpoint}: {e}")
        return None

def get_comprehensive_analysis(brand_key: str, brand_info: Dict[str, Any]) -> Dict[str, Any]:
    """Get comprehensive SHAP analysis for a specific brand"""
    target_field = brand_info["target_field"]
    logger.info(f"🔍 Getting comprehensive analysis for {brand_info['name']} ({target_field})")
    
    analysis_results = {}
    
    # 1. Primary geographic and demographic data
    logger.info("📊 Getting primary analysis data...")
    primary_data = call_microservice_endpoint("/analyze", {
        "query": f"Analyze {brand_info['name']} purchase patterns across all geographic regions with demographic data",
        "analysis_type": "topN",
        "target_variable": target_field,
        "limit": 5000
    })
    
    if primary_data and primary_data.get('success'):
        analysis_results["primary_analysis"] = primary_data
        logger.info(f"   ✅ Got {len(primary_data.get('results', []))} primary records")
    else:
        logger.warning(f"   ⚠️ Primary analysis failed for {brand_info['name']}")
        analysis_results["primary_analysis"] = None
    
    # 2. Factor Importance Analysis
    logger.info("🧠 Getting factor importance with SHAP...")
    factor_importance = call_microservice_endpoint("/factor-importance", {
        "target_field": target_field,
        "method": "shap",
        "max_factors": 30
    })
    
    if factor_importance:
        analysis_results["factor_importance"] = factor_importance
        factors_count = len(factor_importance.get('factors', []))
        logger.info(f"   ✅ Got {factors_count} importance factors")
    else:
        logger.warning(f"   ⚠️ Factor importance failed for {brand_info['name']}")
        analysis_results["factor_importance"] = None
    
    # 3. Feature Interactions
    logger.info("🔗 Getting feature interactions...")
    interactions = call_microservice_endpoint("/feature-interactions", {
        "target_field": target_field,
        "max_interactions": 20,
        "interaction_threshold": 0.05
    })
    
    if interactions:
        analysis_results["feature_interactions"] = interactions
        interactions_count = len(interactions.get('interactions', []))
        logger.info(f"   ✅ Got {interactions_count} feature interactions")
    else:
        logger.warning(f"   ⚠️ Feature interactions failed for {brand_info['name']}")
        analysis_results["feature_interactions"] = None
    
    # 4. Outlier Detection  
    logger.info("🎯 Getting outlier analysis...")
    outliers = call_microservice_endpoint("/outlier-detection", {
        "target_field": target_field,
        "method": "isolation_forest",
        "outlier_threshold": 0.1,
        "max_outliers": 20,
        "explain_outliers": True
    })
    
    if outliers:
        analysis_results["outlier_analysis"] = outliers
        outliers_count = len(outliers.get('outliers', []))
        logger.info(f"   ✅ Got {outliers_count} outlier explanations")
    else:
        logger.warning(f"   ⚠️ Outlier analysis failed for {brand_info['name']}")
        analysis_results["outlier_analysis"] = None
    
    # 5. Threshold Analysis
    logger.info("📈 Getting threshold analysis...")
    thresholds = call_microservice_endpoint("/threshold-analysis", {
        "target_field": target_field,
        "num_bins": 10,
        "min_samples_per_bin": 50
    })
    
    if thresholds:
        analysis_results["threshold_analysis"] = thresholds  
        threshold_count = len(thresholds.get('threshold_analysis', []))
        logger.info(f"   ✅ Got threshold analysis for {threshold_count} features")
    else:
        logger.warning(f"   ⚠️ Threshold analysis failed for {brand_info['name']}")
        analysis_results["threshold_analysis"] = None
    
    # 6. Segment Profiling
    logger.info("📊 Getting segment profiling...")
    segments = call_microservice_endpoint("/segment-profiling", {
        "target_field": target_field,
        "method": "percentile", 
        "num_segments": 3,
        "percentile_thresholds": [33, 67]
    })
    
    if segments:
        analysis_results["segment_profiling"] = segments
        segments_count = len(segments.get('segment_profiles', []))
        logger.info(f"   ✅ Got {segments_count} segment profiles")
    else:
        logger.warning(f"   ⚠️ Segment profiling failed for {brand_info['name']}")
        analysis_results["segment_profiling"] = None
    
    return analysis_results

def create_brand_export(brand_key: str, brand_info: Dict[str, Any]) -> Dict[str, Any]:
    """Create comprehensive export for a single brand"""
    logger.info(f"🏷️ Creating comprehensive export for {brand_info['name']}")
    
    # Get comprehensive analysis
    analysis_results = get_comprehensive_analysis(brand_key, brand_info)
    
    # Build the export structure
    export_data = {
        "export_info": {
            "brand_key": brand_key,
            "export_timestamp": datetime.now().isoformat(),
            "microservice_url": MICROSERVICE_URL,
            "export_version": "2.0_enhanced"
        },
        "brand_info": brand_info,
        "field_metadata": FIELD_METADATA,
        "shap_analysis": analysis_results,
        "analysis_summary": {
            "analyses_completed": len([k for k, v in analysis_results.items() if v is not None]),
            "total_analyses_attempted": len(analysis_results),
            "success_rate": len([k for k, v in analysis_results.items() if v is not None]) / len(analysis_results) * 100
        }
    }
    
    return export_data

def export_all_brands():
    """Export comprehensive data for all brands"""
    logger.info("🚀 Starting enhanced brand export for all brands...")
    
    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    export_summary = {
        "export_timestamp": datetime.now().isoformat(),
        "brands_exported": [],
        "export_statistics": {}
    }
    
    for brand_key, brand_info in BRANDS.items():
        try:
            logger.info(f"\n📦 Exporting {brand_info['name']} ({brand_key})...")
            
            # Create comprehensive export
            export_data = create_brand_export(brand_key, brand_info)
            
            # Save to file
            output_file = os.path.join(OUTPUT_DIR, f"{brand_key}-comprehensive.json")
            with open(output_file, 'w') as f:
                json.dump(export_data, f, indent=2, default=str)
            
            # Calculate file size
            file_size_mb = os.path.getsize(output_file) / (1024 * 1024)
            
            logger.info(f"   ✅ Exported to {output_file} ({file_size_mb:.1f}MB)")
            
            # Update summary
            export_summary["brands_exported"].append(brand_key)
            export_summary["export_statistics"][brand_key] = {
                "file_size_mb": round(file_size_mb, 1),
                "analyses_completed": export_data["analysis_summary"]["analyses_completed"],
                "success_rate": export_data["analysis_summary"]["success_rate"]
            }
            
        except Exception as e:
            logger.error(f"   ❌ Failed to export {brand_info['name']}: {e}")
            export_summary["export_statistics"][brand_key] = {
                "error": str(e),
                "success_rate": 0
            }
    
    # Save export summary
    summary_file = os.path.join(OUTPUT_DIR, "export-summary.json")
    with open(summary_file, 'w') as f:
        json.dump(export_summary, f, indent=2, default=str)
    
    # Print final summary
    logger.info(f"\n🎉 Enhanced brand export completed!")
    logger.info(f"📁 Exports saved to: {OUTPUT_DIR}")
    logger.info(f"📊 Brands exported: {len(export_summary['brands_exported'])}/{len(BRANDS)}")
    
    for brand_key, stats in export_summary["export_statistics"].items():
        if "error" not in stats:
            logger.info(f"   • {BRANDS[brand_key]['name']}: {stats['file_size_mb']}MB, {stats['success_rate']:.1f}% analysis success")
        else:
            logger.info(f"   • {BRANDS[brand_key]['name']}: FAILED - {stats['error']}")

if __name__ == "__main__":
    try:
        export_all_brands()
        sys.exit(0)
    except KeyboardInterrupt:
        logger.info("Export interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Export failed: {e}")
        sys.exit(1) 