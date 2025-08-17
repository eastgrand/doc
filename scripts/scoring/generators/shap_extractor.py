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
    
    def _get_target_variable(self) -> str:
        """Get the target variable from training results"""
        
        # Check for training results in project directories
        possible_paths = [
            self.project_root / "projects" / "HRB_v3" / "trained_models" / "training_results.json",
            self.project_root / "projects" / "HRB_v2" / "trained_models" / "training_results.json", 
            self.project_root / "projects" / "HRB" / "trained_models" / "training_results.json"
        ]
        
        for path in possible_paths:
            if path.exists():
                try:
                    with open(path, 'r') as f:
                        training_data = json.load(f)
                    
                    # Look for target variable in xgboost results
                    if 'xgboost' in training_data:
                        target_var = training_data['xgboost'].get('target_variable')
                        if target_var:
                            print(f"📊 Found target variable from training results: {target_var}")
                            return target_var
                            
                except Exception as e:
                    print(f"⚠️  Error reading training results from {path}: {e}")
                    continue
        
        # Default fallback
        print("⚠️  Using default target variable: MP10128A_B_P")
        return "MP10128A_B_P"
    
    def _analyze_feature_importance(self, feature_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze feature importance from endpoint data"""
        
        results = feature_data.get('results', [])
        if not results:
            return {}
            
        print(f"🔍 Analyzing all available fields from {len(results)} records...")
        
        # Get first record to identify all available fields
        sample_record = results[0]
        all_fields = list(sample_record.keys())
        
        print(f"📊 Found {len(all_fields)} total fields in dataset")
        
        # Filter to numeric fields that could be used for scoring
        numeric_fields = []
        for field_name in all_fields:
            if self._is_numeric_field(sample_record, field_name):
                numeric_fields.append(field_name)
        
        print(f"📈 Identified {len(numeric_fields)} numeric fields for analysis")
        
        # Prefer percentage fields over count fields when both exist
        preferred_fields = self._prefer_percentage_fields(numeric_fields)
        
        # Calculate importance scores for all preferred fields
        field_importance = {}
        target_variable = self._get_target_variable()
        
        for field_name in preferred_fields:
            if field_name == target_variable:
                continue  # Skip target variable to avoid circular scoring
                
            importance_score = self._calculate_field_importance(results, field_name, target_variable)
            if importance_score > 0.1:  # Only include fields with meaningful correlation
                field_importance[field_name] = importance_score
        
        # Sort fields by importance score
        sorted_features = sorted(field_importance.items(), key=lambda x: x[1], reverse=True)
        importance_scores = [score for _, score in sorted_features]
        feature_names = [name for name, _ in sorted_features]
        
        print(f"✅ Calculated importance for {len(sorted_features)} fields")
        
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
        """Extract meaningful field name from record, preferring percentage fields"""
        
        # Look for percentage fields first (better for analysis)
        percentage_fields = [key for key in record.keys() if key.endswith('_P') and isinstance(record[key], (int, float))]
        if percentage_fields:
            # Return the percentage field with highest value (most significant)
            best_pct_field = max(percentage_fields, key=lambda field: record[field])
            return best_pct_field
        
        # Look for MP fields (market penetration codes)
        mp_fields = [key for key in record.keys() if key.startswith('MP') and isinstance(record[key], (int, float))]
        if mp_fields:
            # Return the MP field with highest value
            best_mp_field = max(mp_fields, key=lambda field: record[field])
            return best_mp_field
        
        # Fall back to traditional field identification
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
        
        # Create analysis-specific feature rankings for all 26 endpoint types
        # Use different numbers of features based on analysis complexity
        analysis_rankings = {
            # Strategic analysis needs multiple factors
            'strategic_analysis': self._get_top_features_for_analysis(top_features, 'strategic_analysis', 5),
            'competitive_analysis': self._get_top_features_for_analysis(top_features, 'competitive_analysis', 4),
            'demographic_insights': self._get_top_features_for_analysis(top_features, 'demographic_insights', 6),
            'comparative_analysis': self._get_top_features_for_analysis(top_features, 'comparative_analysis', 4),
            'correlation_analysis': self._get_top_features_for_analysis(top_features, 'correlation_analysis', 3),
            'predictive_modeling': self._get_top_features_for_analysis(top_features, 'predictive_modeling', 5),
            'trend_analysis': self._get_top_features_for_analysis(top_features, 'trend_analysis', 4),
            'spatial_clusters': self._get_top_features_for_analysis(top_features, 'spatial_clusters', 4),
            'anomaly_detection': self._get_top_features_for_analysis(top_features, 'anomaly_detection', 3),
            'scenario_analysis': self._get_top_features_for_analysis(top_features, 'scenario_analysis', 5),
            'segment_profiling': self._get_top_features_for_analysis(top_features, 'segment_profiling', 6),
            'sensitivity_analysis': self._get_top_features_for_analysis(top_features, 'sensitivity_analysis', 4),
            'feature_interactions': self._get_top_features_for_analysis(top_features, 'feature_interactions', 5),
            'feature_importance_ranking': self._get_top_features_for_analysis(top_features, 'feature_importance_ranking', 7),
            'model_performance': self._get_top_features_for_analysis(top_features, 'model_performance', 4),
            'outlier_detection': self._get_top_features_for_analysis(top_features, 'outlier_detection', 3),
            'analyze': self._get_top_features_for_analysis(top_features, 'analyze', 5),
            'brand_difference': self._get_top_features_for_analysis(top_features, 'brand_difference', 4),
            'customer_profile': self._get_top_features_for_analysis(top_features, 'customer_profile', 6),
            'algorithm_comparison': self._get_top_features_for_analysis(top_features, 'algorithm_comparison', 4),
            'ensemble_analysis': self._get_top_features_for_analysis(top_features, 'ensemble_analysis', 5),
            'model_selection': self._get_top_features_for_analysis(top_features, 'model_selection', 4),
            'cluster_analysis': self._get_top_features_for_analysis(top_features, 'cluster_analysis', 5),
            'anomaly_insights': self._get_top_features_for_analysis(top_features, 'anomaly_insights', 4),
            'dimensionality_insights': self._get_top_features_for_analysis(top_features, 'dimensionality_insights', 5),
            'consensus_analysis': self._get_top_features_for_analysis(top_features, 'consensus_analysis', 4)
        }
        
        return analysis_rankings
    
    def _get_top_features_for_analysis(self, top_features: List[Tuple], analysis_type: str, limit: int) -> List[Dict]:
        """Get top features relevant to specific analysis type"""
        
        # Filter features based on analysis type relevance
        relevant_features = []
        
        for feature_name, importance_score in top_features:
            relevance_score = self._calculate_analysis_relevance(feature_name, analysis_type)
            
            if relevance_score > 0.2:  # Lower threshold to include more features
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
        
        # Define optimized relevance patterns based on business purpose (from endpoints.csv)
        relevance_patterns = {
            # MARKET-FOCUSED: Investment potential, market factors, growth indicators
            'strategic_analysis': ['mp10', 'x14060', 'x14068', 'population', 'income', 'market', 'value'],
            
            # COMPETITIVE: Market share potential × brand positioning × competitive advantage
            'competitive_analysis': ['mp10', 'mp11', 'mp12', 'share', 'market', 'competitive', 'brand'],
            
            # DEMOGRAPHIC: Population favorability based on target demographic alignment
            'demographic_insights': ['genalphacy', 'x14060', 'x14068', 'gen', 'age', 'demo', 'population'],
            
            # COMPARATIVE: Relative performance across all key metrics
            'comparative_analysis': ['mp10', 'ratio', 'compare', 'relative', 'versus', 'performance'],
            
            # STATISTICAL: Statistical correlation (limited by static data)
            'correlation_analysis': ['mp10', 'x14', 'correlation', 'statistical', 'value'],
            
            # PREDICTIVE: Future trends (limited by static data)
            'predictive_modeling': ['mp10', 'x14', 'trend', 'value', 'pattern'],
            
            # TREND: Temporal patterns (limited by static data)  
            'trend_analysis': ['mp10', 'value', 'trend', 'pattern', 'growth'],
            
            # SPATIAL: Geographic density × within-cluster similarity
            'spatial_clusters': ['shape', 'area', 'length', 'coord', 'lat', 'long', 'spatial'],
            
            # ANOMALY: Statistical deviation magnitude × outlier significance
            'anomaly_detection': ['mp10', 'x14', 'deviation', 'extreme', 'unusual'],
            
            # SCENARIO: Multiple conditions (ensemble approach)
            'scenario_analysis': ['mp10', 'x14', 'value', 'scenario', 'condition'],
            
            # SEGMENTATION: Segment distinctiveness × profile clarity
            'segment_profiling': ['genalphacy', 'x14', 'demo', 'segment', 'profile', 'group'],
            
            # SENSITIVITY: Parameter impact magnitude × business criticality
            'sensitivity_analysis': ['mp10', 'x14', 'impact', 'critical', 'sensitive'],
            
            # INTERACTIONS: Interaction effect strength × significance
            'feature_interactions': ['mp10', 'x14', 'interaction', 'effect', 'relationship'],
            
            # IMPORTANCE: SHAP value magnitude × model consensus
            'feature_importance_ranking': ['mp10', 'x14', 'genalphacy', 'importance', 'significant'],
            
            # PERFORMANCE: Model accuracy × prediction reliability
            'model_performance': ['mp10', 'x14', 'performance', 'accuracy', 'quality'],
            
            # OUTLIERS: Statistical outliers (different from anomaly)
            'outlier_detection': ['mp10', 'x14', 'outlier', 'statistical', 'extreme'],
            
            # COMPREHENSIVE: Complete analytical overview
            'analyze': ['mp10', 'x14', 'genalphacy', 'value', 'comprehensive'],
            
            # BRAND DIFFERENTIATION: Brand differentiation score × competitive gap
            'brand_difference': ['mp10104', 'mp10128', 'brand', 'difference', 'gap'],
            
            # CUSTOMER FIT: Customer fit score × profile match × lifetime value
            'customer_profile': ['genalphacy', 'x14060', 'x14068', 'customer', 'profile', 'fit'],
            
            # ALGORITHM: Algorithm performance comparison
            'algorithm_comparison': ['mp10', 'x14', 'algorithm', 'performance', 'accuracy'],
            
            # ENSEMBLE: Multi-model consensus
            'ensemble_analysis': ['mp10', 'x14', 'ensemble', 'consensus', 'agreement'],
            
            # MODEL SELECTION: Algorithm suitability × expected performance
            'model_selection': ['mp10', 'x14', 'model', 'suitability', 'optimal'],
            
            # CLUSTERING: Enhanced clustering for market segmentation
            'cluster_analysis': ['mp10', 'x14', 'genalphacy', 'cluster', 'segment'],
            
            # ANOMALY INSIGHTS: Business opportunity focused anomaly detection
            'anomaly_insights': ['mp10', 'x14', 'anomaly', 'opportunity', 'insight'],
            
            # DIMENSIONALITY: PCA variance explanation
            'dimensionality_insights': ['mp10', 'x14', 'genalphacy', 'variance', 'component'],
            
            # CONSENSUS: Multi-model agreement
            'consensus_analysis': ['mp10', 'x14', 'consensus', 'agreement', 'confidence']
        }
        
        patterns = relevance_patterns.get(analysis_type, [])
        
        # Calculate relevance score based on pattern matches
        relevance_score = 0.0
        for pattern in patterns:
            if pattern in feature_lower:
                relevance_score += 1.0 / len(patterns)
        
        # Add specific field type bonuses based on analysis purpose
        relevance_score += self._get_analysis_specific_bonus(feature_name, analysis_type)
        
        # More permissive default relevance - was 0.2, now 0.5
        # This ensures more fields get included for analysis
        return max(relevance_score, 0.5)
    
    def _get_analysis_specific_bonus(self, field_name: str, analysis_type: str) -> float:
        """Apply analysis-specific field bonuses based on business purpose from endpoints.csv"""
        
        field_lower = field_name.lower()
        bonus = 0.0
        
        # STRATEGIC ANALYSIS: "Investment potential weighted by market factors, growth indicators"
        if analysis_type == 'strategic_analysis':
            if field_lower.startswith('mp10') and field_lower.endswith('_p'):
                bonus += 0.3  # Market penetration for investment potential
            elif field_lower.startswith('x14068'):  # Income data for growth indicators
                bonus += 0.3
            elif field_lower.startswith('x14060'):  # Population data for market size
                bonus += 0.2
        
        # COMPETITIVE ANALYSIS: "Market share potential × brand positioning × competitive advantage"
        elif analysis_type == 'competitive_analysis':
            if field_lower.startswith('mp10') and field_lower.endswith('_p'):
                bonus += 0.4  # All MP fields for competitive comparison
        
        # BRAND DIFFERENCE: "Brand differentiation score × competitive gap analysis"
        elif analysis_type == 'brand_difference':
            # Prioritize H&R Block vs TurboTax specifically for gap analysis
            if field_lower in ['mp10128a_b_p', 'mp10104a_b_p']:  # HRB vs TurboTax
                bonus += 0.5
            elif field_lower.startswith('mp10') and field_lower.endswith('_p'):
                bonus += 0.2  # Other competitors for context
        
        # DEMOGRAPHIC INSIGHTS: "Population favorability based on target demographic alignment"
        elif analysis_type == 'demographic_insights':
            if 'genalphacy' in field_lower:
                bonus += 0.4  # Generational alignment
            elif field_lower.startswith('x14060'):  # Population density
                bonus += 0.3
            elif field_lower.startswith('x14068'):  # Income alignment
                bonus += 0.3
        
        # CUSTOMER PROFILE: "Customer fit score × profile match × lifetime value potential"
        elif analysis_type == 'customer_profile':
            if 'genalphacy' in field_lower:
                bonus += 0.4  # Customer demographic fit
            elif field_lower.startswith('x14068'):  # Income for lifetime value
                bonus += 0.3
            elif field_lower.startswith('x14060'):  # Population characteristics
                bonus += 0.2
        
        # SEGMENT PROFILING: "Segment distinctiveness × profile clarity × business value"
        elif analysis_type == 'segment_profiling':
            if 'genalphacy' in field_lower:
                bonus += 0.4  # Demographic segmentation
            elif field_lower.startswith('x14'):
                bonus += 0.3  # Various demographic factors
            elif field_lower.startswith('mp10') and field_lower.endswith('_p'):
                bonus += 0.2  # Usage patterns for segments
        
        # COMPARATIVE ANALYSIS: "Relative performance scoring × comparative advantage"
        elif analysis_type == 'comparative_analysis':
            if field_lower.startswith('mp10') and field_lower.endswith('_p'):
                bonus += 0.3  # Performance metrics for comparison
            elif field_lower.startswith('x14'):
                bonus += 0.2  # Contextual factors
        
        # FEATURE IMPORTANCE RANKING: "SHAP value magnitude × model consensus × business relevance"
        elif analysis_type == 'feature_importance_ranking':
            # Should include diverse field types for comprehensive ranking
            if any(field_lower.startswith(prefix) for prefix in ['mp10', 'x14', 'genalphacy']):
                bonus += 0.2  # Balanced representation
        
        # ENSEMBLE ANALYSIS: "Ensemble confidence × component model agreement"
        elif analysis_type == 'ensemble_analysis':
            # Should use most reliable fields across models
            if field_lower.startswith('mp10') and field_lower.endswith('_p'):
                bonus += 0.2  # Reliable percentage fields
            elif 'genalphacy' in field_lower:
                bonus += 0.2  # Stable demographic data
        
        # ANOMALY DETECTION: "Statistical deviation magnitude × outlier significance"
        elif analysis_type == 'anomaly_detection':
            if field_lower.startswith('mp10') and field_lower.endswith('_p'):
                bonus += 0.3  # Market penetration anomalies
            elif field_lower.startswith('x14068'):  # Income anomalies
                bonus += 0.2
        
        # ANOMALY INSIGHTS: "Opportunity potential × investigation priority × market value"
        elif analysis_type == 'anomaly_insights':
            if field_lower.startswith('mp10') and field_lower.endswith('_p'):
                bonus += 0.3  # Market opportunity anomalies
            elif field_lower.startswith('x14068'):  # Economic opportunity indicators
                bonus += 0.2
        
        # OUTLIER DETECTION: "Statistical outliers that deserve special investigation"
        elif analysis_type == 'outlier_detection':
            # Different from anomaly - focuses on statistical extremes
            if field_lower.startswith('mp10') and field_lower.endswith('_p'):
                bonus += 0.2  # Statistical outliers in usage
            elif field_lower.startswith('x14'):
                bonus += 0.2  # Demographic outliers
        
        # SPATIAL/CLUSTER ANALYSIS: "Cluster cohesion × geographic density × similarity"
        elif analysis_type in ['spatial_clusters', 'cluster_analysis']:
            # Clusters based on business similarity, not geography
            if field_lower.startswith('mp10') and field_lower.endswith('_p'):
                bonus += 0.3  # Business performance similarity
            elif 'genalphacy' in field_lower:
                bonus += 0.2  # Demographic similarity
        
        # SENSITIVITY ANALYSIS: "Parameter impact magnitude × business criticality"
        elif analysis_type == 'sensitivity_analysis':
            if field_lower.startswith('mp10') and field_lower.endswith('_p'):
                bonus += 0.3  # Critical business parameters
            elif field_lower.startswith('x14068'):  # Income sensitivity
                bonus += 0.2
        
        # MODEL PERFORMANCE: "R² score × prediction accuracy × model stability"
        elif analysis_type == 'model_performance':
            # Should use most predictive fields
            if field_lower.startswith('mp10') and field_lower.endswith('_p'):
                bonus += 0.2  # Predictive market fields
            elif 'genalphacy' in field_lower:
                bonus += 0.2  # Stable demographic predictors
        
        # TIME-SERIES LIMITED ENDPOINTS: Use best available static proxies
        elif analysis_type in ['predictive_modeling', 'trend_analysis', 'correlation_analysis']:
            # These need time-series data but we only have static data
            if field_lower.startswith('mp10') and field_lower.endswith('_p'):
                bonus += 0.1  # Lower bonus due to data limitation
        
        # COMPREHENSIVE ANALYSIS: "Complete analytical overview of opportunities and risks"
        elif analysis_type == 'analyze':
            # Should include diverse field types for comprehensive view
            if field_lower.startswith('mp10') and field_lower.endswith('_p'):
                bonus += 0.2  # Market opportunity
            elif 'genalphacy' in field_lower:
                bonus += 0.2  # Demographic context
            elif field_lower.startswith('x14068'):  # Economic context
                bonus += 0.2
        
        # ALGORITHM/MODEL COMPARISON ENDPOINTS: Use diverse fields for robust comparison
        elif analysis_type in ['algorithm_comparison', 'model_selection']:
            if any(field_lower.startswith(prefix) for prefix in ['mp10', 'x14', 'genalphacy']):
                bonus += 0.1  # Diverse field types for algorithm testing
        
        return bonus
    
    def _prefer_percentage_fields(self, numeric_fields: List[str]) -> List[str]:
        """Prefer percentage fields over count fields when both exist"""
        
        preferred_fields = []
        excluded_count_fields = set()
        
        # First pass: identify percentage fields and mark their count equivalents
        for field_name in numeric_fields:
            if field_name.endswith('_P'):
                preferred_fields.append(field_name)
                # Mark the count equivalent for exclusion
                count_equivalent = field_name[:-2]  # Remove '_P'
                excluded_count_fields.add(count_equivalent)
        
        # Second pass: add non-percentage fields that don't have percentage equivalents
        for field_name in numeric_fields:
            if not field_name.endswith('_P') and field_name not in excluded_count_fields:
                preferred_fields.append(field_name)
        
        print(f"📊 Preferred {len(preferred_fields)} fields (excluded {len(excluded_count_fields)} count fields with percentage equivalents)")
        
        return preferred_fields
    
    def _is_numeric_field(self, record: Dict, field_name: str) -> bool:
        """Check if a field contains numeric data suitable for scoring"""
        
        # Skip non-data fields and duplicate/redundant fields
        skip_fields = ['ID', 'DESCRIPTION', 'OBJECTID', 'Creator', 'Editor', 
                      'CreationDate', 'EditDate', 'pointCount', 'thematic_value']
        
        if field_name in skip_fields:
            return False
            
        value = record.get(field_name)
        
        # Check if value is numeric
        try:
            float(value)
            return True
        except (ValueError, TypeError):
            return False
    
    def _calculate_field_importance(self, results: List[Dict], field_name: str, target_variable: str) -> float:
        """Calculate importance score for a field based on correlation with target"""
        
        field_values = []
        target_values = []
        
        for record in results:
            field_val = record.get(field_name, 0)
            target_val = record.get(target_variable, 0)
            
            # Only include records with both values
            if field_val and target_val:
                try:
                    field_values.append(float(field_val))
                    target_values.append(float(target_val))
                except (ValueError, TypeError):
                    continue
        
        if len(field_values) < 10:  # Need minimum data points
            return 0.0
            
        # Calculate simple correlation coefficient
        try:
            import numpy as np
            correlation = abs(np.corrcoef(field_values, target_values)[0, 1])
            
            # Handle NaN correlations
            if np.isnan(correlation):
                return 0.0
                
            return correlation
            
        except Exception:
            # Fallback: use standard deviation as proxy for importance
            try:
                std_dev = np.std(field_values)
                normalized_std = min(std_dev / 100.0, 1.0)  # Normalize to 0-1
                return normalized_std
            except Exception:
                return 0.0

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