#!/usr/bin/env python3
"""
Test script for enhanced spatial analysis features in SHAP microservice
"""

import requests
import json
from typing import Dict, Any

def test_enhanced_analysis(query: str = "What areas have the highest conversion rates?") -> Dict[str, Any]:
    """Test the enhanced analysis endpoint with spatial context"""
    
    url = "http://localhost:8001/analyze"
    
    payload = {
        "query": query,
        "analysis_type": "ranking",
        "conversationContext": "Testing enhanced spatial analysis"
    }
    
    try:
        print(f"🔍 Testing query: '{query}'")
        print("📡 Sending request to SHAP microservice...")
        
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            data = response.json()
            
            print("✅ Request successful!")
            print(f"📊 Analysis type: {data.get('analysisType', 'unknown')}")
            print(f"📈 Results count: {len(data.get('results', []))}")
            print(f"🧠 Feature importance count: {len(data.get('feature_importance', []))}")
            
            # Check for new spatial analysis features
            if 'spatial_analysis' in data:
                spatial = data['spatial_analysis']
                print("\n🗺️ SPATIAL ANALYSIS FOUND:")
                print(f"   Distribution Type: {spatial.get('distribution_type', 'unknown')}")
                print(f"   Clustering Strength: {spatial.get('clustering_strength', 0):.2f}")
                print(f"   Pattern: {spatial.get('pattern_description', 'N/A')}")
            else:
                print("\n❌ No spatial analysis data found")
            
            # Check for regional clusters
            if 'regional_clusters' in data:
                clusters = data['regional_clusters']
                print(f"\n🏘️ REGIONAL CLUSTERS FOUND:")
                print(f"   Cluster Count: {clusters.get('cluster_count', 0)}")
                print(f"   Method: {clusters.get('cluster_method', 'unknown')}")
                for i, cluster in enumerate(clusters.get('clusters', [])[:3]):  # Show first 3
                    print(f"   Cluster {i+1}: {cluster.get('label', 'Unknown')} "
                          f"({cluster.get('area_count', 0)} areas)")
            else:
                print("\n❌ No regional clusters data found")
            
            # Check for geographic context
            if 'geographic_context' in data:
                geo = data['geographic_context']
                print(f"\n🌍 GEOGRAPHIC CONTEXT FOUND:")
                print(f"   Scope: {geo.get('geographic_scope', 'unknown')}")
                print(f"   Area Coverage: {geo.get('area_coverage', 0)} areas")
                print(f"   Context: {geo.get('context_description', 'N/A')[:100]}...")
            else:
                print("\n❌ No geographic context data found")
            
            # Show model info
            model_info = data.get('model_info', {})
            print(f"\n📋 MODEL INFO:")
            print(f"   Target Variable: {model_info.get('target_variable', 'unknown')}")
            print(f"   R² Score: {model_info.get('r2_score', 0):.4f}")
            print(f"   Analysis Scope: {model_info.get('analysis_scope', 'N/A')}")
            
            return data
            
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"Error: {response.text}")
            return {}
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to SHAP microservice at http://localhost:8001")
        print("💡 Make sure the service is running with: python -m uvicorn app:app --reload --port 8001")
        return {}
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return {}

def test_multiple_queries():
    """Test multiple query types to verify spatial analysis"""
    
    test_queries = [
        "What areas have the highest conversion rates?",
        "Show me areas with high diversity and conversion rates",
        "Which regions show clustering of high-income areas?",
        "Analyze the spatial distribution of application rates"
    ]
    
    print("🧪 Testing Enhanced Spatial Analysis Features")
    print("=" * 50)
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n🔍 Test {i}/4:")
        result = test_enhanced_analysis(query)
        
        # Check if all three new features are present
        has_spatial = 'spatial_analysis' in result
        has_clusters = 'regional_clusters' in result
        has_geographic = 'geographic_context' in result
        
        if has_spatial and has_clusters and has_geographic:
            print("✅ All enhanced features present!")
        else:
            print(f"⚠️ Missing features: "
                  f"spatial={has_spatial}, clusters={has_clusters}, geographic={has_geographic}")
        
        print("-" * 30)

if __name__ == "__main__":
    test_multiple_queries() 