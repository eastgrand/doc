#!/usr/bin/env python3
"""
ImportanceAnalyzer - Analyze SHAP importance from local endpoint data

This module analyzes SHAP feature importance values to create normalized weights
and confidence metrics for data-driven scoring algorithm generation.
"""

import json
import statistics
from pathlib import Path
from typing import Dict, List, Any, Optional
from shap_extractor import LocalSHAPExtractor

class ImportanceAnalyzer:
    """Analyze SHAP importance across all analysis types from local data"""
    
    def __init__(self, project_root: str = None):
        """Initialize analyzer with project root directory"""
        self.project_root = Path(project_root) if project_root else Path.cwd()
        self.extractor = LocalSHAPExtractor(project_root)
        
    def analyze_local_shap_importance(self, shap_data: Dict[str, Any] = None) -> Dict[str, Dict]:
        """Analyze SHAP importance from local endpoint data"""
        
        if not shap_data:
            print("📊 Extracting SHAP data from local endpoints...")
            shap_data = self.extractor.extract_from_endpoints()
            
        if not shap_data or 'top_features' not in shap_data:
            print("❌ No SHAP data available for analysis")
            return {}
            
        print(f"🔍 Analyzing importance for {shap_data['total_features']} features...")
        
        # Get analysis-specific feature rankings
        analysis_rankings = self.extractor.rank_features_by_analysis(shap_data)
        
        # Create importance matrix for each analysis type
        importance_matrix = {}
        
        for analysis_type, ranked_features in analysis_rankings.items():
            if ranked_features:
                importance_matrix[analysis_type] = self._create_importance_weights(
                    analysis_type, ranked_features
                )
                
        print(f"✅ Generated importance matrix for {len(importance_matrix)} analysis types")
        
        return importance_matrix
    
    def _create_importance_weights(self, analysis_type: str, ranked_features: List[Dict]) -> Dict[str, Any]:
        """Create normalized weights and confidence metrics for analysis type"""
        
        if not ranked_features:
            return {}
            
        # Extract importance scores
        importance_scores = [f['weighted_score'] for f in ranked_features]
        raw_importance = [f['importance'] for f in ranked_features]
        
        # Calculate normalization
        total_importance = sum(importance_scores)
        
        if total_importance == 0:
            return {}
            
        # Create normalized weights
        normalized_weights = {}
        field_mappings = {}
        confidence_metrics = {}
        
        for i, feature_data in enumerate(ranked_features):
            feature_name = feature_data['feature']
            importance = feature_data['weighted_score']
            relevance = feature_data['relevance']
            
            # Normalize to percentage (sum to 1.0)
            normalized_weight = importance / total_importance
            
            # Map to clean field name
            clean_field_name = self._clean_field_name(feature_name)
            
            normalized_weights[clean_field_name] = normalized_weight
            field_mappings[clean_field_name] = {
                'original_name': feature_name,
                'importance_score': feature_data['importance'],
                'relevance_score': relevance,
                'rank': i + 1
            }
            
            # Calculate confidence based on importance and relevance
            confidence = min(importance * relevance, 1.0)
            confidence_metrics[clean_field_name] = confidence
        
        # Calculate overall statistics
        analysis_stats = self._calculate_analysis_statistics(
            importance_scores, raw_importance, confidence_metrics
        )
        
        return {
            'analysis_type': analysis_type,
            'normalized_weights': normalized_weights,
            'field_mappings': field_mappings,
            'confidence_metrics': confidence_metrics,
            'statistics': analysis_stats,
            'feature_count': len(ranked_features)
        }
    
    def _clean_field_name(self, feature_name: str) -> str:
        """Clean and standardize field names for algorithm generation"""
        
        # Remove common prefixes and clean the name
        clean_name = feature_name.strip()
        
        # Handle ID-based names (like "32465 (Wewahitchka)")
        if '(' in clean_name and ')' in clean_name:
            # Extract the part in parentheses as the main name
            parts = clean_name.split('(')
            if len(parts) > 1:
                location_name = parts[1].replace(')', '').strip()
                id_part = parts[0].strip()
                clean_name = f"location_{location_name.lower().replace(' ', '_')}"
            else:
                clean_name = clean_name.lower().replace(' ', '_')
        else:
            clean_name = clean_name.lower().replace(' ', '_')
        
        # Remove special characters and ensure valid variable name
        clean_name = ''.join(c if c.isalnum() or c == '_' else '_' for c in clean_name)
        clean_name = clean_name.strip('_')
        
        # Ensure it doesn't start with a number
        if clean_name and clean_name[0].isdigit():
            clean_name = f"field_{clean_name}"
            
        return clean_name or 'unknown_field'
    
    def _calculate_analysis_statistics(self, importance_scores: List[float], 
                                     raw_importance: List[float], 
                                     confidence_metrics: Dict[str, float]) -> Dict[str, float]:
        """Calculate statistical metrics for the analysis"""
        
        if not importance_scores:
            return {}
            
        confidence_values = list(confidence_metrics.values())
        
        return {
            'mean_importance': statistics.mean(importance_scores),
            'median_importance': statistics.median(importance_scores),
            'std_importance': statistics.stdev(importance_scores) if len(importance_scores) > 1 else 0,
            'min_importance': min(importance_scores),
            'max_importance': max(importance_scores),
            'mean_confidence': statistics.mean(confidence_values) if confidence_values else 0,
            'total_features': len(importance_scores),
            'coverage_ratio': len([s for s in importance_scores if s > 0.1]) / len(importance_scores) if importance_scores else 0
        }
    
    def generate_algorithm_weights(self, importance_matrix: Dict[str, Dict]) -> Dict[str, Dict]:
        """Generate algorithm-ready weights for each analysis type"""
        
        print("🔧 Generating algorithm weights from importance matrix...")
        
        algorithm_weights = {}
        
        for analysis_type, analysis_data in importance_matrix.items():
            normalized_weights = analysis_data.get('normalized_weights', {})
            confidence_metrics = analysis_data.get('confidence_metrics', {})
            
            if not normalized_weights:
                continue
                
            # Create algorithm weights with fallback strategy
            algo_weights = self._create_algorithm_weights(
                analysis_type, normalized_weights, confidence_metrics
            )
            
            algorithm_weights[analysis_type] = algo_weights
            
        print(f"✅ Generated algorithm weights for {len(algorithm_weights)} analysis types")
        
        return algorithm_weights
    
    def _create_algorithm_weights(self, analysis_type: str, 
                                 normalized_weights: Dict[str, float], 
                                 confidence_metrics: Dict[str, float]) -> Dict[str, Any]:
        """Create algorithm-ready weights with business logic"""
        
        # Sort features by weight
        sorted_features = sorted(normalized_weights.items(), key=lambda x: x[1], reverse=True)
        
        # Apply analysis-specific weight distribution
        weight_distribution = self._get_weight_distribution(analysis_type)
        
        # Create final algorithm weights
        algorithm_weights = {}
        component_weights = {}
        
        for i, (feature_name, raw_weight) in enumerate(sorted_features):
            if i >= len(weight_distribution):
                break
                
            # Apply business weight distribution
            business_weight = weight_distribution[i]
            
            # Adjust by confidence
            confidence = confidence_metrics.get(feature_name, 0.5)
            final_weight = business_weight * (0.7 + 0.3 * confidence)  # 70% business + 30% confidence
            
            algorithm_weights[feature_name] = final_weight
            
            # Group into components for formula generation
            component = self._classify_component(feature_name, analysis_type)
            if component not in component_weights:
                component_weights[component] = 0
            component_weights[component] += final_weight
        
        # Normalize to sum to 1.0
        total_weight = sum(algorithm_weights.values())
        if total_weight > 0:
            for feature in algorithm_weights:
                algorithm_weights[feature] /= total_weight
        
        # Normalize component weights
        total_component_weight = sum(component_weights.values())
        if total_component_weight > 0:
            for component in component_weights:
                component_weights[component] /= total_component_weight
        
        return {
            'feature_weights': algorithm_weights,
            'component_weights': component_weights,
            'analysis_type': analysis_type,
            'total_features': len(algorithm_weights),
            'weight_distribution_method': 'business_logic_with_confidence'
        }
    
    def _get_weight_distribution(self, analysis_type: str) -> List[float]:
        """Get business-logic weight distribution for analysis type"""
        
        # Define weight distributions based on business importance
        distributions = {
            'strategic': [0.35, 0.30, 0.20, 0.15],  # Top 4 factors for strategic
            'competitive': [0.40, 0.25, 0.20, 0.15],  # Competition focused
            'demographic': [0.30, 0.25, 0.20, 0.15, 0.10],  # Broader demographic factors
            'correlation': [0.50, 0.30, 0.20],  # Strong correlation focus
            'brand_analysis': [0.35, 0.30, 0.20, 0.15],  # Brand metrics
            'market_sizing': [0.40, 0.30, 0.20, 0.10],  # Market opportunity
            'trend_analysis': [0.60, 0.40],  # Simple trend factors
            'anomaly_detection': [0.70, 0.30],  # Anomaly indicators
            'feature_importance': [0.20, 0.15, 0.15, 0.10, 0.10, 0.10, 0.10, 0.05, 0.05],  # Many factors
            'spatial_clustering': [0.40, 0.30, 0.20, 0.10]  # Geographic factors
        }
        
        return distributions.get(analysis_type, [0.40, 0.30, 0.20, 0.10])  # Default distribution
    
    def _classify_component(self, feature_name: str, analysis_type: str) -> str:
        """Classify feature into component for formula generation"""
        
        feature_lower = feature_name.lower()
        
        # Component classification based on feature name patterns
        if any(term in feature_lower for term in ['market', 'share', 'competition']):
            return 'market_component'
        elif any(term in feature_lower for term in ['income', 'economic', 'wealth']):
            return 'economic_component'
        elif any(term in feature_lower for term in ['population', 'demographic', 'age']):
            return 'demographic_component'
        elif any(term in feature_lower for term in ['location', 'geographic', 'spatial']):
            return 'geographic_component'
        else:
            return 'general_component'

def main():
    """Test the ImportanceAnalyzer"""
    
    print("🚀 Testing ImportanceAnalyzer...")
    
    analyzer = ImportanceAnalyzer()
    
    # Test SHAP importance analysis
    print("\n1. Testing SHAP importance analysis...")
    importance_matrix = analyzer.analyze_local_shap_importance()
    
    if importance_matrix:
        print(f"✅ Generated importance matrix for {len(importance_matrix)} analysis types")
        
        # Show sample analysis
        for analysis_type, data in list(importance_matrix.items())[:3]:
            weights = data.get('normalized_weights', {})
            if weights:
                print(f"   {analysis_type}: {len(weights)} features")
                top_feature = max(weights.items(), key=lambda x: x[1])
                print(f"      Top feature: {top_feature[0]} (weight: {top_feature[1]:.3f})")
    
    # Test algorithm weight generation
    print("\n2. Testing algorithm weight generation...")
    if importance_matrix:
        algorithm_weights = analyzer.generate_algorithm_weights(importance_matrix)
        
        if algorithm_weights:
            print(f"✅ Generated algorithm weights for {len(algorithm_weights)} analysis types")
            
            # Show sample weights
            for analysis_type, weights_data in list(algorithm_weights.items())[:2]:
                feature_weights = weights_data.get('feature_weights', {})
                component_weights = weights_data.get('component_weights', {})
                
                print(f"   {analysis_type}:")
                print(f"      Features: {len(feature_weights)}")
                print(f"      Components: {list(component_weights.keys())}")
                
                if feature_weights:
                    top_feature = max(feature_weights.items(), key=lambda x: x[1])
                    print(f"      Top feature: {top_feature[0]} (weight: {top_feature[1]:.3f})")
    
    print("\n✅ ImportanceAnalyzer testing complete!")

if __name__ == "__main__":
    main()