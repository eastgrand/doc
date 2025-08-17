#!/usr/bin/env python3
"""
LocalSHAPExtractor - Extract SHAP feature importance from existing endpoint data

This module extracts SHAP feature importance values from local endpoint files
and microservice export data to support data-driven scoring algorithm generation.
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import pandas as pd
import numpy as np

class LocalSHAPExtractor:
    """Extract and analyze SHAP feature importance from existing endpoint data"""
    
    def __init__(self, project_root: str = None):
        """Initialize extractor with project root directory"""
        self.project_root = Path(project_root) if project_root else Path.cwd()
        self.endpoints_dir = self.project_root / "public" / "data" / "endpoints"
        self.export_path = self.project_root / "public" / "data" / "microservice-export.json"
        
    def extract_from_endpoints(self, endpoints_dir: str = None) -> Dict[str, Any]:
        """Extract SHAP values from local endpoint files"""
        
        if endpoints_dir:
            endpoints_path = Path(endpoints_dir)
        else:
            endpoints_path = self.endpoints_dir
            
        print(f"🔍 Extracting SHAP data from {endpoints_path}")
        
        # Load feature importance ranking endpoint
        feature_importance_file = endpoints_path / "feature-importance-ranking.json"
        
        if not feature_importance_file.exists():
            print(f"❌ Feature importance file not found: {feature_importance_file}")
            return {}
            
        with open(feature_importance_file, 'r') as f:
            feature_data = json.load(f)
            
        print(f"📊 Loaded {len(feature_data.get('results', []))} feature importance records")
        
        # Extract SHAP importance patterns
        shap_data = self._analyze_feature_importance(feature_data)
        
        return shap_data
    
    def extract_from_microservice_export(self, export_path: str = None) -> Dict[str, Any]:
        """Extract SHAP from nike_factor_importance dataset (EXAMPLE DATA)"""
        
        if export_path:
            export_file = Path(export_path)
        else:
            export_file = self.export_path
            
        print(f"🔍 Extracting example SHAP patterns from {export_file}")
        
        if not export_file.exists():
            print(f"❌ Microservice export not found: {export_file}")
            return {}
            
        with open(export_file, 'r') as f:
            export_data = json.load(f)
            
        # Look for nike_factor_importance dataset (example structure)
        if 'datasets' in export_data and 'nike_factor_importance' in export_data['datasets']:
            nike_factors = export_data['datasets']['nike_factor_importance']
            print(f"📊 Found Nike factor importance dataset with {len(nike_factors.get('results', []))} factors")
            
            # Extract importance patterns (as examples)
            example_patterns = self._analyze_nike_factors(nike_factors)
            return example_patterns
        else:
            print("❌ Nike factor importance dataset not found in export")
            return {}
    
    def _analyze_feature_importance(self, feature_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze feature importance from endpoint data"""
        
        results = feature_data.get('results', [])
        if not results:
            return {}
            
        # Extract importance scores
        importance_scores = []
        feature_names = []
        
        for record in results:
            # Look for SHAP-related fields
            importance_score = record.get('importance_score', 0)
            feature_importance_score = record.get('feature_importance_score', 0)
            
            # Use the higher of the two scores
            final_score = max(importance_score, feature_importance_score)
            
            if final_score > 0:
                importance_scores.append(final_score)
                
                # Extract meaningful field names
                field_name = self._extract_field_name(record)
                feature_names.append(field_name)
        
        # Sort by importance
        sorted_features = sorted(zip(feature_names, importance_scores), 
                                key=lambda x: x[1], reverse=True)
        
        print(f"📈 Found {len(sorted_features)} features with importance scores")
        
        # Create structured importance data
        shap_analysis = {
            'total_features': len(sorted_features),
            'top_features': sorted_features[:20],  # Top 20 most important
            'feature_distribution': self._calculate_distribution(importance_scores),
            'extraction_source': 'local_endpoints'
        }
        
        return shap_analysis
    
    def _analyze_nike_factors(self, nike_factors: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze Nike factor importance as example patterns"""
        
        results = nike_factors.get('results', [])
        if not results:
            return {}
            
        print("📊 Analyzing Nike factor importance patterns (EXAMPLE DATA)")
        
        # Extract factor patterns
        factor_patterns = []
        
        for record in results:
            factor_name = record.get('factor_name', '')
            importance = record.get('importance', 0)
            shap_value = record.get('shap_value', 0)
            
            if importance > 0 or shap_value != 0:
                factor_patterns.append({
                    'factor': factor_name,
                    'importance': importance,
                    'shap_value': abs(shap_value),
                    'pattern_type': self._classify_factor_type(factor_name)
                })
        
        # Sort by importance
        factor_patterns.sort(key=lambda x: x['importance'], reverse=True)
        
        print(f"📈 Found {len(factor_patterns)} factor patterns from Nike data")
        
        # Create pattern analysis
        pattern_analysis = {
            'total_factors': len(factor_patterns),
            'top_patterns': factor_patterns[:15],  # Top 15 patterns
            'pattern_types': self._group_by_pattern_type(factor_patterns),
            'example_target': 'MP30034A_B_P',  # Nike market share (EXAMPLE)
            'model_accuracy': 0.9997,  # From Nike project (EXAMPLE)
            'extraction_source': 'nike_example_data'
        }
        
        return pattern_analysis
    
    def _extract_field_name(self, record: Dict[str, Any]) -> str:
        """Extract meaningful field name from record"""
        
        # Priority order for field identification
        field_candidates = [
            record.get('ID', ''),
            record.get('field_name', ''),
            record.get('variable_name', ''),
            record.get('DESCRIPTION', ''),
            'unknown_field'
        ]
        
        for candidate in field_candidates:
            if candidate and isinstance(candidate, str) and len(candidate) > 0:
                return candidate
                
        return 'unknown_field'
    
    def _classify_factor_type(self, factor_name: str) -> str:
        """Classify factor type for pattern analysis"""
        
        factor_lower = factor_name.lower()
        
        if any(term in factor_lower for term in ['income', 'economic', 'median', 'wealth']):
            return 'economic'
        elif any(term in factor_lower for term in ['age', 'demographic', 'population', 'generational']):
            return 'demographic'
        elif any(term in factor_lower for term in ['market', 'share', 'competition', 'brand']):
            return 'competitive'
        elif any(term in factor_lower for term in ['geographic', 'spatial', 'location', 'area']):
            return 'geographic'
        else:
            return 'other'
    
    def _group_by_pattern_type(self, factor_patterns: List[Dict[str, Any]]) -> Dict[str, List]:
        """Group factors by pattern type"""
        
        pattern_groups = {}
        
        for pattern in factor_patterns:
            pattern_type = pattern['pattern_type']
            if pattern_type not in pattern_groups:
                pattern_groups[pattern_type] = []
            pattern_groups[pattern_type].append(pattern)
        
        return pattern_groups
    
    def _calculate_distribution(self, scores: List[float]) -> Dict[str, float]:
        """Calculate distribution statistics for importance scores"""
        
        if not scores:
            return {}
            
        scores_array = np.array(scores)
        
        return {
            'mean': float(np.mean(scores_array)),
            'median': float(np.median(scores_array)),
            'std': float(np.std(scores_array)),
            'min': float(np.min(scores_array)),
            'max': float(np.max(scores_array)),
            'q25': float(np.percentile(scores_array, 25)),
            'q75': float(np.percentile(scores_array, 75))
        }
    
    def rank_features_by_analysis(self, shap_data: Dict[str, Any]) -> Dict[str, List]:
        """Generate feature rankings for each analysis type from local data"""
        
        if not shap_data or 'top_features' not in shap_data:
            return {}
            
        top_features = shap_data['top_features']
        
        # Create analysis-specific feature rankings
        analysis_rankings = {
            'strategic': self._get_top_features_for_analysis(top_features, 'strategic', 6),
            'competitive': self._get_top_features_for_analysis(top_features, 'competitive', 5),
            'demographic': self._get_top_features_for_analysis(top_features, 'demographic', 8),
            'correlation': self._get_top_features_for_analysis(top_features, 'correlation', 4),
            'brand_analysis': self._get_top_features_for_analysis(top_features, 'brand_analysis', 5),
            'market_sizing': self._get_top_features_for_analysis(top_features, 'market_sizing', 4),
            'trend_analysis': self._get_top_features_for_analysis(top_features, 'trend_analysis', 3),
            'anomaly_detection': self._get_top_features_for_analysis(top_features, 'anomaly_detection', 3),
            'feature_importance': self._get_top_features_for_analysis(top_features, 'feature_importance', 10),
            'spatial_clustering': self._get_top_features_for_analysis(top_features, 'spatial_clustering', 4)
        }
        
        return analysis_rankings
    
    def _get_top_features_for_analysis(self, top_features: List[Tuple], analysis_type: str, limit: int) -> List[Dict]:
        """Get top features relevant to specific analysis type"""
        
        # Filter features based on analysis type relevance
        relevant_features = []
        
        for feature_name, importance_score in top_features:
            relevance_score = self._calculate_analysis_relevance(feature_name, analysis_type)
            
            if relevance_score > 0.3:  # Minimum relevance threshold
                relevant_features.append({
                    'feature': feature_name,
                    'importance': importance_score,
                    'relevance': relevance_score,
                    'weighted_score': importance_score * relevance_score
                })
        
        # Sort by weighted score and return top N
        relevant_features.sort(key=lambda x: x['weighted_score'], reverse=True)
        return relevant_features[:limit]
    
    def _calculate_analysis_relevance(self, feature_name: str, analysis_type: str) -> float:
        """Calculate how relevant a feature is to a specific analysis type"""
        
        feature_lower = feature_name.lower()
        
        # Define relevance patterns for each analysis type
        relevance_patterns = {
            'strategic': ['market', 'share', 'income', 'population', 'demographic', 'competitive'],
            'competitive': ['market', 'share', 'brand', 'competition', 'position'],
            'demographic': ['age', 'income', 'education', 'population', 'demographic'],
            'correlation': ['correlation', 'statistical', 'relationship', 'value'],
            'brand_analysis': ['brand', 'market', 'share', 'competition'],
            'market_sizing': ['population', 'market', 'size', 'opportunity'],
            'trend_analysis': ['trend', 'time', 'growth', 'change'],
            'anomaly_detection': ['anomaly', 'outlier', 'unusual'],
            'feature_importance': ['importance', 'feature', 'significant'],
            'spatial_clustering': ['geographic', 'spatial', 'location', 'cluster']
        }
        
        patterns = relevance_patterns.get(analysis_type, [])
        
        # Calculate relevance score based on pattern matches
        relevance_score = 0.0
        for pattern in patterns:
            if pattern in feature_lower:
                relevance_score += 1.0 / len(patterns)
        
        # Default relevance for all features
        return max(relevance_score, 0.2)

def main():
    """Test the LocalSHAPExtractor"""
    
    print("🚀 Testing LocalSHAPExtractor...")
    
    extractor = LocalSHAPExtractor()
    
    # Test endpoint extraction
    print("\n1. Testing endpoint extraction...")
    endpoint_data = extractor.extract_from_endpoints()
    
    if endpoint_data:
        print(f"✅ Extracted {endpoint_data.get('total_features', 0)} features from endpoints")
        print(f"📊 Top 5 features: {endpoint_data.get('top_features', [])[:5]}")
    
    # Test microservice export extraction
    print("\n2. Testing microservice export extraction...")
    export_data = extractor.extract_from_microservice_export()
    
    if export_data:
        print(f"✅ Extracted {export_data.get('total_factors', 0)} factor patterns from Nike data")
        print(f"📊 Example target: {export_data.get('example_target', 'N/A')}")
    
    # Test analysis rankings
    print("\n3. Testing analysis-specific rankings...")
    if endpoint_data:
        rankings = extractor.rank_features_by_analysis(endpoint_data)
        
        for analysis_type, features in rankings.items():
            if features:
                print(f"   {analysis_type}: {len(features)} relevant features")
                if features:
                    top_feature = features[0]
                    print(f"      Top: {top_feature['feature']} (importance: {top_feature['importance']:.3f})")
    
    print("\n✅ LocalSHAPExtractor testing complete!")

if __name__ == "__main__":
    main()