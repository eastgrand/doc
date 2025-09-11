#!/usr/bin/env python3
"""
Automated Score Calculator - Port Node.js scoring algorithms to Python
Part of the ArcGIS to Microservice Automation Pipeline
"""

import json
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple, Optional
from datetime import datetime
import logging
from pathlib import Path
import math
from collections import defaultdict

class AutomatedScoreCalculator:
    """
    Automated score calculator that applies all existing scoring algorithms
    to generated endpoint JSON files
    """
    
    def __init__(self, endpoints_dir: str = "generated_endpoints"):
        """
        Initialize score calculator
        
        Args:
            endpoints_dir: Directory containing endpoint JSON files
        """
        self.endpoints_dir = Path(endpoints_dir)
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Brand mappings from existing scripts
        self.BRAND_MAPPINGS = {
            'MP30034A_B_P': 'Nike',
            'MP30029A_B_P': 'Adidas', 
            'MP30032A_B_P': 'Jordan',
            'MP30031A_B_P': 'Converse',
            'MP30035A_B_P': 'Puma',
            'MP30033A_B_P': 'New Balance',
            'MP30030A_B_P': 'Asics',
            'MP30037A_B_P': 'Skechers',
            'MP30036A_B_P': 'Reebok'
        }
        
        # Scoring algorithms registry (19 standard + 7 comprehensive)
        self.scoring_algorithms = {
            # Standard endpoints
            'strategic-analysis': self.calculate_strategic_value_scores,
            'competitive-analysis': self.calculate_competitive_scores,
            'demographic-insights': self.calculate_demographic_scores,
            'comparative-analysis': self.calculate_comparative_scores,
            'correlation-analysis': self.calculate_correlation_scores,
            'spatial-clusters': self.calculate_cluster_scores,
            'anomaly-detection': self.calculate_anomaly_scores,
            'outlier-detection': self.calculate_outlier_scores,
            'predictive-modeling': self.calculate_predictive_scores,
            'trend-analysis': self.calculate_trend_scores,
            'feature-interactions': self.calculate_feature_interaction_scores,
            'feature-importance-ranking': self.calculate_feature_importance_scores,
            'scenario-analysis': self.calculate_scenario_scores,
            'segment-profiling': self.calculate_segment_scores,
            'brand-difference': self.calculate_brand_difference_scores,
            'risk-analysis': self.calculate_risk_scores,
            'market-sizing': self.calculate_market_sizing_scores,
            'housing-correlation': self.calculate_housing_correlation_scores,
            
            # New comprehensive endpoints (7 additional)
            'algorithm-comparison': self.calculate_algorithm_comparison_scores,
            'ensemble-analysis': self.calculate_ensemble_analysis_scores,
            'cluster-analysis': self.calculate_cluster_analysis_scores,
            'anomaly-insights': self.calculate_anomaly_insights_scores,
            'model-selection': self.calculate_model_selection_scores,
            'dimensionality-insights': self.calculate_dimensionality_insights_scores,
            'consensus-analysis': self.calculate_consensus_analysis_scores
        }
        
    def apply_all_scoring_algorithms(self) -> Dict[str, Any]:
        """
        Apply scoring algorithms to all endpoint files
        
        Returns:
            Summary of scoring results
        """
        self.logger.info("🧮 Starting automated score calculation...")
        
        if not self.endpoints_dir.exists():
            raise FileNotFoundError(f"Endpoints directory not found: {self.endpoints_dir}")
        
        results = {
            'scoring_timestamp': datetime.now().isoformat(),
            'endpoints_processed': [],
            'scoring_results': {},
            'statistics': {},
            'errors': []
        }
        
        # Process each endpoint file
        for endpoint_file in self.endpoints_dir.glob("*.json"):
            if endpoint_file.name in ['all_endpoints.json', 'blob-urls.json']:
                continue
                
            endpoint_name = endpoint_file.stem
            self.logger.info(f"📊 Processing {endpoint_name}...")
            
            try:
                # Load endpoint data
                with open(endpoint_file, 'r', encoding='utf-8') as f:
                    endpoint_data = json.load(f)
                
                if not isinstance(endpoint_data, dict) or 'results' not in endpoint_data:
                    self.logger.warning(f"   ⚠️ Invalid format for {endpoint_name}")
                    continue
                
                # Apply appropriate scoring algorithm
                if endpoint_name in self.scoring_algorithms:
                    scored_data = self.scoring_algorithms[endpoint_name](endpoint_data)
                    
                    # Save scored endpoint
                    self._save_scored_endpoint(endpoint_file, scored_data)
                    
                    results['endpoints_processed'].append(endpoint_name)
                    results['scoring_results'][endpoint_name] = {
                        'records_processed': len(scored_data['results']),
                        'scores_added': self._count_added_scores(endpoint_data['results'], scored_data['results']),
                        'status': 'success'
                    }
                    
                    self.logger.info(f"   ✅ {endpoint_name}: {len(scored_data['results'])} records scored")
                else:
                    self.logger.info(f"   ⚠️ No scoring algorithm for {endpoint_name}")
                    
            except Exception as e:
                error_msg = f"Error processing {endpoint_name}: {str(e)}"
                self.logger.error(f"   ❌ {error_msg}")
                results['errors'].append({
                    'endpoint': endpoint_name,
                    'error': error_msg,
                    'timestamp': datetime.now().isoformat()
                })
        
        # Generate statistics
        results['statistics'] = self._generate_scoring_statistics(results)
        
        self.logger.info(f"🎉 Scoring completed: {len(results['endpoints_processed'])} endpoints processed")
        
        return results
    
    def calculate_strategic_value_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate strategic value scores using the documented formula
        
        Strategic Value Score = (
          0.35 × Market Opportunity +
          0.30 × Competitive Position + 
          0.20 × Data Reliability +
          0.15 × Market Scale
        )
        """
        results = []
        
        for record in endpoint_data['results']:
            # Extract component scores
            competitive_score = self._safe_float(record.get('competitive_advantage_score', 0))
            demographic_score = self._safe_float(record.get('demographic_opportunity_score', 0))
            correlation_score = self._safe_float(record.get('correlation_strength_score', 0))
            cluster_score = self._safe_float(record.get('cluster_performance_score', 0))
            
            # Market fundamentals
            target_value = self._safe_float(record.get('target_value', 0))
            median_income = self._safe_float(record.get('median_income', 0))
            total_population = self._safe_float(record.get('total_population', 0))
            nike_share = self._safe_float(record.get('mp30034a_b_p', 0))
            
            # 1. MARKET OPPORTUNITY (35% weight)
            demographic_component = demographic_score
            market_gap = max(0, 100 - nike_share)
            market_opportunity = (0.60 * demographic_component) + (0.40 * market_gap)
            
            # 2. COMPETITIVE POSITION (30% weight)
            competitive_advantage = competitive_score
            brand_positioning = min((nike_share / 50) * 100, 100)
            competitive_position = (0.67 * competitive_advantage) + (0.33 * brand_positioning)
            
            # 3. DATA RELIABILITY (20% weight)
            correlation_component = correlation_score
            cluster_consistency = cluster_score if cluster_score > 0 else min((target_value / 50) * 100, 100) if target_value > 0 else 50
            data_reliability = (0.75 * correlation_component) + (0.25 * cluster_consistency)
            
            # 4. MARKET SCALE (15% weight)
            population_scale = min((total_population / 10000) * 100, 100)
            economic_scale = min((median_income / 100000) * 100, 100)
            market_scale = (0.60 * population_scale) + (0.40 * economic_scale)
            
            # Calculate final strategic value score
            strategic_value_score = (
                0.35 * market_opportunity +
                0.30 * competitive_position +
                0.20 * data_reliability +
                0.15 * market_scale
            )
            
            # Add scores to record
            record_copy = record.copy()
            record_copy.update({
                'strategic_value_score': round(strategic_value_score, 2),
                'market_opportunity': round(market_opportunity, 2),
                'competitive_position': round(competitive_position, 2),
                'data_reliability': round(data_reliability, 2),
                'market_scale': round(market_scale, 2)
            })
            
            results.append(record_copy)
        
        # Update endpoint data
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        
        return endpoint_data_copy
    
    def calculate_competitive_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate competitive advantage scores with SHAP normalization
        """
        results = []
        records = endpoint_data['results']
        
        # Calculate SHAP statistics for normalization
        shap_stats = self._calculate_shap_stats(records)
        
        for record in records:
            # Market dominance (35% weight)
            nike_share = self._safe_float(record.get('value_MP30034A_B_P', 0))
            
            # Calculate competitor shares
            competitor_brands = [
                'MP30029A_B_P', 'MP30032A_B_P', 'MP30031A_B_P', 'MP30035A_B_P',
                'MP30033A_B_P', 'MP30030A_B_P', 'MP30037A_B_P', 'MP30036A_B_P'
            ]
            
            total_competitor_share = sum(
                self._safe_float(record.get(f'value_{brand}', 0)) 
                for brand in competitor_brands
            )
            
            # Market dominance score
            if total_competitor_share > 0:
                market_dominance = min((nike_share / total_competitor_share) * 50, 100)
            else:
                market_dominance = nike_share * 2  # No competitors = high dominance
            
            # SHAP-based demographic advantage (35% weight)
            nike_shap = self._safe_float(record.get('shap_MP30034A_B_P', 0))
            asian_shap = self._safe_float(record.get('shap_ASIAN_CY_P', 0))
            millennial_shap = self._safe_float(record.get('shap_MILLENN_CY', 0))
            gen_z_shap = self._safe_float(record.get('shap_GENZ_CY', 0))
            household_shap = self._safe_float(record.get('shap_HHPOP_CY', 0))
            
            # Normalize SHAP values to 0-100 scale
            normalized_shap = {
                'nike': self._normalize_shap_value(nike_shap, shap_stats.get('nike', {})),
                'asian': self._normalize_shap_value(asian_shap, shap_stats.get('asian', {})),
                'millennial': self._normalize_shap_value(millennial_shap, shap_stats.get('millennial', {})),
                'gen_z': self._normalize_shap_value(gen_z_shap, shap_stats.get('genZ', {})),
                'household': self._normalize_shap_value(household_shap, shap_stats.get('household', {}))
            }
            
            # Calculate demographic advantage
            demographic_advantage = (
                0.30 * normalized_shap['asian'] +
                0.25 * normalized_shap['millennial'] +
                0.20 * normalized_shap['gen_z'] +
                0.15 * normalized_shap['household'] +
                0.10 * normalized_shap['nike']
            )
            
            # Economic factors (20% weight)
            median_income = self._safe_float(record.get('median_income', 0))
            wealth_index = self._safe_float(record.get('value_WLTHINDXCY', 100))
            economic_advantage = min((median_income / 100000) * 50 + (wealth_index / 200) * 50, 100)
            
            # Population density advantage (10% weight)
            total_population = self._safe_float(record.get('total_population', 0))
            population_advantage = min((total_population / 20000) * 100, 100)
            
            # Calculate final competitive advantage score
            competitive_advantage_score = (
                0.35 * market_dominance +
                0.35 * demographic_advantage +
                0.20 * economic_advantage +
                0.10 * population_advantage
            )
            
            # Add scores to record
            record_copy = record.copy()
            record_copy.update({
                'competitive_advantage_score': round(competitive_advantage_score, 2),
                'market_dominance': round(market_dominance, 2),
                'demographic_advantage': round(demographic_advantage, 2),
                'economic_advantage': round(economic_advantage, 2),
                'population_advantage': round(population_advantage, 2)
            })
            
            results.append(record_copy)
        
        # Update endpoint data
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        
        return endpoint_data_copy
    
    def calculate_demographic_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate demographic opportunity scores"""
        results = []
        
        for record in endpoint_data['results']:
            # Population metrics
            total_population = self._safe_float(record.get('total_population', 0))
            asian_population = self._safe_float(record.get('asian_population', 0))
            black_population = self._safe_float(record.get('black_population', 0))
            white_population = self._safe_float(record.get('white_population', 0))
            
            # Economic metrics
            median_income = self._safe_float(record.get('median_income', 0))
            median_age = self._safe_float(record.get('median_age', 0))
            household_size = self._safe_float(record.get('household_size', 0))
            
            # Calculate diversity index
            if total_population > 0:
                diversity_score = (
                    (asian_population / total_population) * 30 +
                    (black_population / total_population) * 20 +
                    min(median_income / 75000, 1) * 25 +
                    max(0, 1 - abs(median_age - 35) / 20) * 15 +
                    min(household_size / 3, 1) * 10
                ) * 100
            else:
                diversity_score = 0
            
            # Population scale bonus
            population_bonus = min(total_population / 10000, 1) * 20
            
            demographic_opportunity_score = min(diversity_score + population_bonus, 100)
            
            # Add scores to record
            record_copy = record.copy()
            record_copy['demographic_opportunity_score'] = round(demographic_opportunity_score, 2)
            
            results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        
        return endpoint_data_copy
    
    def calculate_comparative_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate comparative analysis scores"""
        results = []
        
        # Calculate percentiles for relative comparison
        values = [self._safe_float(record.get('target_value', 0)) for record in endpoint_data['results']]
        values_sorted = sorted([v for v in values if v > 0])
        
        if not values_sorted:
            # Fallback if no target values
            for record in endpoint_data['results']:
                record_copy = record.copy()
                record_copy['comparative_score'] = 50.0  # Neutral score
                results.append(record_copy)
        else:
            for record in endpoint_data['results']:
                target_value = self._safe_float(record.get('target_value', 0))
                
                if target_value > 0:
                    # Calculate percentile rank
                    percentile = (sum(1 for v in values_sorted if v <= target_value) / len(values_sorted)) * 100
                else:
                    percentile = 0
                
                record_copy = record.copy()
                record_copy['comparative_score'] = round(percentile, 2)
                results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        
        return endpoint_data_copy
    
    def calculate_correlation_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate correlation strength scores using proper statistical correlation"""
        results = []
        records = endpoint_data['results']
        
        # Extract key variables for correlation analysis
        target_values = []
        income_values = []
        population_values = []
        
        for record in records:
            target_val = self._safe_float(record.get('target_value', 0))
            income_val = self._safe_float(record.get('median_income', 0))
            pop_val = self._safe_float(record.get('total_population', 0))
            
            if target_val > 0:  # Only include records with valid target values
                target_values.append(target_val)
                income_values.append(income_val)
                population_values.append(pop_val)
        
        # Calculate correlations if we have sufficient data
        if len(target_values) >= 3:  # Need minimum 3 points for correlation
            # Calculate Pearson correlation coefficients
            income_correlation = self._calculate_pearson_correlation(target_values, income_values)
            population_correlation = self._calculate_pearson_correlation(target_values, population_values)
            
            # Calculate demographic correlations using SHAP values if available
            shap_correlations = []
            for record in records:
                for key, value in record.items():
                    if key.startswith('shap_') and isinstance(value, (int, float)):
                        target_val = self._safe_float(record.get('target_value', 0))
                        if target_val > 0:
                            # Correlation between SHAP importance and target value
                            shap_target_corr = abs(self._safe_float(value))
                            shap_correlations.append(shap_target_corr)
                        break  # One SHAP correlation per record
            
            # Calculate composite correlation score for each record
            for record in records:
                target_value = self._safe_float(record.get('target_value', 0))
                
                if target_value <= 0:
                    correlation_strength_score = 0.0
                else:
                    # Multi-factor correlation strength (0-100)
                    
                    # 1. Income correlation factor (40% weight)
                    income_factor = min(abs(income_correlation) * 40, 40) if income_correlation is not None else 0
                    
                    # 2. Population correlation factor (30% weight)
                    pop_factor = min(abs(population_correlation) * 30, 30) if population_correlation is not None else 0
                    
                    # 3. SHAP correlation factor (30% weight)
                    record_shap_values = [abs(self._safe_float(v)) for k, v in record.items() 
                                        if k.startswith('shap_') and isinstance(v, (int, float))]
                    if record_shap_values:
                        avg_shap_importance = sum(record_shap_values) / len(record_shap_values)
                        shap_factor = min(avg_shap_importance * 30, 30)
                    else:
                        shap_factor = 0
                    
                    correlation_strength_score = income_factor + pop_factor + shap_factor
                
                record_copy = record.copy()
                record_copy['correlation_strength_score'] = round(correlation_strength_score, 2)
                results.append(record_copy)
        else:
            # Insufficient data for correlation - use fallback
            for record in records:
                target_value = self._safe_float(record.get('target_value', 0))
                
                # Simple fallback: higher target values get higher correlation scores
                if target_value > 0:
                    correlation_strength_score = min(target_value / 2, 100)  # Scale target value
                else:
                    correlation_strength_score = 0.0
                
                record_copy = record.copy()
                record_copy['correlation_strength_score'] = round(correlation_strength_score, 2)
                results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        
        return endpoint_data_copy
    
    def calculate_cluster_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate spatial cluster scores"""
        results = []
        records = endpoint_data['results']
        
        # Simple k-means-like clustering based on target values and location
        target_values = [self._safe_float(record.get('target_value', 0)) for record in records]
        
        if not any(v > 0 for v in target_values):
            # No valid target values, assign random clusters
            n_clusters = min(5, len(records))
            for i, record in enumerate(records):
                record_copy = record.copy()
                record_copy.update({
                    'cluster_id': i % n_clusters,
                    'cluster_performance_score': 50.0,
                    'cluster_label': f'Cluster {i % n_clusters + 1}'
                })
                results.append(record_copy)
        else:
            # Simple percentile-based clustering
            n_clusters = 5
            percentiles = np.percentile([v for v in target_values if v > 0], 
                                      [20, 40, 60, 80])
            
            for record in records:
                target_value = self._safe_float(record.get('target_value', 0))
                
                # Assign cluster based on percentile
                if target_value <= percentiles[0]:
                    cluster_id, cluster_label, cluster_score = 0, 'Low Performance', 20
                elif target_value <= percentiles[1]:
                    cluster_id, cluster_label, cluster_score = 1, 'Below Average', 40
                elif target_value <= percentiles[2]:
                    cluster_id, cluster_label, cluster_score = 2, 'Average', 60
                elif target_value <= percentiles[3]:
                    cluster_id, cluster_label, cluster_score = 3, 'Above Average', 80
                else:
                    cluster_id, cluster_label, cluster_score = 4, 'High Performance', 100
                
                record_copy = record.copy()
                record_copy.update({
                    'cluster_id': cluster_id,
                    'cluster_performance_score': cluster_score,
                    'cluster_label': cluster_label
                })
                results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        
        return endpoint_data_copy
    
    def calculate_anomaly_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate anomaly detection scores"""
        results = []
        
        # Calculate z-scores for anomaly detection
        target_values = [self._safe_float(record.get('target_value', 0)) for record in endpoint_data['results']]
        valid_values = [v for v in target_values if v > 0]
        
        if len(valid_values) > 1:
            mean_val = np.mean(valid_values)
            std_val = np.std(valid_values)
            
            for record in endpoint_data['results']:
                target_value = self._safe_float(record.get('target_value', 0))
                
                if target_value > 0 and std_val > 0:
                    z_score = abs((target_value - mean_val) / std_val)
                    anomaly_score = min(z_score * 33.33, 100)  # 3 sigma = 100%
                else:
                    anomaly_score = 0
                
                record_copy = record.copy()
                record_copy['anomaly_detection_score'] = round(anomaly_score, 2)
                results.append(record_copy)
        else:
            # Fallback: no anomalies detected
            for record in endpoint_data['results']:
                record_copy = record.copy()
                record_copy['anomaly_detection_score'] = 0.0
                results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        
        return endpoint_data_copy
    
    def calculate_outlier_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate outlier detection scores using IQR method"""
        results = []
        
        target_values = [self._safe_float(record.get('target_value', 0)) for record in endpoint_data['results']]
        valid_values = [v for v in target_values if v > 0]
        
        if len(valid_values) >= 4:
            q1, q3 = np.percentile(valid_values, [25, 75])
            iqr = q3 - q1
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            
            for record in endpoint_data['results']:
                target_value = self._safe_float(record.get('target_value', 0))
                
                if target_value > 0:
                    if target_value < lower_bound or target_value > upper_bound:
                        distance = min(abs(target_value - lower_bound), abs(target_value - upper_bound))
                        outlier_score = min((distance / iqr) * 50, 100)
                    else:
                        outlier_score = 0
                else:
                    outlier_score = 0
                
                record_copy = record.copy()
                record_copy['outlier_detection_score'] = round(outlier_score, 2)
                results.append(record_copy)
        else:
            for record in endpoint_data['results']:
                record_copy = record.copy()
                record_copy['outlier_detection_score'] = 0.0
                results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        
        return endpoint_data_copy
    
    def calculate_predictive_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate predictive modeling scores"""
        results = []
        
        for record in endpoint_data['results']:
            # Combine multiple factors for prediction
            target_value = self._safe_float(record.get('target_value', 0))
            demographic_score = self._safe_float(record.get('demographic_opportunity_score', 0))
            competitive_score = self._safe_float(record.get('competitive_advantage_score', 0))
            
            # Weighted prediction
            if demographic_score > 0 or competitive_score > 0:
                predictive_score = (
                    0.40 * demographic_score +
                    0.35 * competitive_score +
                    0.25 * min(target_value, 100)
                )
            else:
                predictive_score = min(target_value, 100)
            
            record_copy = record.copy()
            record_copy['predictive_modeling_score'] = round(predictive_score, 2)
            results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        
        return endpoint_data_copy
    
    def calculate_trend_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate trend analysis scores using statistical trend detection"""
        results = []
        records = endpoint_data['results']
        
        # Calculate dataset statistics for trend baseline
        target_values = [self._safe_float(r.get('target_value', 0)) for r in records if r.get('target_value', 0) > 0]
        
        if not target_values:
            # If no valid target values, assign neutral scores
            for record in records:
                record_copy = record.copy()
                record_copy['trend_strength_score'] = 50.0
                results.append(record_copy)
        else:
            # Calculate statistical measures for trend analysis
            mean_value = sum(target_values) / len(target_values)
            sorted_values = sorted(target_values)
            median_value = sorted_values[len(sorted_values) // 2]
            
            # Calculate upper and lower quartiles for trend strength
            q1_index = len(sorted_values) // 4
            q3_index = 3 * len(sorted_values) // 4
            q1_value = sorted_values[q1_index] if q1_index < len(sorted_values) else sorted_values[0]
            q3_value = sorted_values[q3_index] if q3_index < len(sorted_values) else sorted_values[-1]
            
            for record in records:
                target_value = self._safe_float(record.get('target_value', 0))
                
                if target_value <= 0:
                    trend_strength_score = 0.0
                else:
                    # Multi-factor trend analysis
                    # 1. Relative to median (40% weight)
                    median_factor = min((target_value / median_value) * 40, 40) if median_value > 0 else 20
                    
                    # 2. Quartile positioning (35% weight)
                    if target_value >= q3_value:
                        quartile_factor = 35  # Strong upward trend
                    elif target_value >= median_value:
                        quartile_factor = 25  # Moderate upward trend
                    elif target_value >= q1_value:
                        quartile_factor = 15  # Moderate trend
                    else:
                        quartile_factor = 5   # Weak trend
                    
                    # 3. Mean deviation factor (25% weight)
                    mean_factor = min((target_value / mean_value) * 25, 25) if mean_value > 0 else 12.5
                    
                    trend_strength_score = min(median_factor + quartile_factor + mean_factor, 100)
                
                record_copy = record.copy()
                record_copy['trend_strength_score'] = round(trend_strength_score, 2)
                results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        
        return endpoint_data_copy
    
    def calculate_feature_interaction_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate feature interaction scores"""
        results = []
        
        for record in endpoint_data['results']:
            # Calculate interaction between demographic and economic factors
            total_population = self._safe_float(record.get('total_population', 0))
            median_income = self._safe_float(record.get('median_income', 0))
            
            if total_population > 0 and median_income > 0:
                # Population-income interaction
                interaction_score = min((total_population / 10000) * (median_income / 75000) * 100, 100)
            else:
                interaction_score = 0
            
            record_copy = record.copy()
            record_copy['feature_interaction_score'] = round(interaction_score, 2)
            results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        
        return endpoint_data_copy
    
    def calculate_feature_importance_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate feature importance scores based on SHAP values"""
        results = []
        
        for record in endpoint_data['results']:
            # Sum all SHAP values for feature importance
            shap_sum = 0
            shap_count = 0
            
            for key, value in record.items():
                if key.startswith('shap_') and isinstance(value, (int, float)):
                    shap_sum += abs(float(value))
                    shap_count += 1
            
            if shap_count > 0:
                feature_importance_score = min((shap_sum / shap_count) * 10, 100)
            else:
                feature_importance_score = 50  # Default
            
            record_copy = record.copy()
            record_copy['feature_importance_score'] = round(feature_importance_score, 2)
            results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        
        return endpoint_data_copy
    
    def calculate_scenario_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate scenario analysis scores using multi-factor scenario modeling"""
        results = []
        records = endpoint_data['results']
        
        # Calculate market condition factors for scenarios
        target_values = [self._safe_float(r.get('target_value', 0)) for r in records if r.get('target_value', 0) > 0]
        
        if not target_values:
            # No valid data - assign neutral scores
            for record in records:
                record_copy = record.copy()
                record_copy['scenario_analysis_score'] = 50.0
                results.append(record_copy)
        else:
            # Calculate market volatility and stability indicators
            mean_target = sum(target_values) / len(target_values)
            volatility = self._calculate_volatility(target_values) if len(target_values) > 1 else 0
            
            for record in records:
                target_value = self._safe_float(record.get('target_value', 0))
                median_income = self._safe_float(record.get('median_income', 0))
                total_population = self._safe_float(record.get('total_population', 0))
                
                if target_value <= 0:
                    scenario_analysis_score = 0.0
                else:
                    # Multi-factor scenario analysis
                    base_performance = min(target_value, 100)
                    
                    # Economic factors for scenario adjustment
                    economic_stability = 1.0  # Default stable
                    if median_income > 0:
                        # Higher income = more economic resilience
                        income_factor = min(median_income / 75000, 1.5)  # Cap at 1.5x boost
                        economic_stability *= income_factor
                    
                    # Market size factor for scenario impact
                    market_size_factor = 1.0
                    if total_population > 0:
                        # Larger markets = more stability but also more competition
                        size_factor = min(total_population / 50000, 1.2)  # Cap at 1.2x
                        market_size_factor = size_factor
                    
                    # Volatility adjustment
                    stability_factor = max(0.5, 1 - (volatility / 100))  # Lower volatility = higher stability
                    
                    # Calculate scenario outcomes
                    optimistic_multiplier = 1.0 + (0.3 * economic_stability * stability_factor)
                    pessimistic_multiplier = max(0.3, 1.0 - (0.4 * volatility / 100) - (0.2 / market_size_factor))
                    
                    # Weighted scenario analysis
                    optimistic_score = min(base_performance * optimistic_multiplier, 100)
                    realistic_score = base_performance
                    pessimistic_score = base_performance * pessimistic_multiplier
                    
                    # Scenario probability weighting based on market conditions
                    if volatility < 20:  # Stable market
                        scenario_weights = (0.20, 0.60, 0.20)  # More weight to realistic
                    elif volatility < 50:  # Moderate volatility
                        scenario_weights = (0.25, 0.50, 0.25)  # Balanced
                    else:  # High volatility
                        scenario_weights = (0.30, 0.40, 0.30)  # More uncertainty
                    
                    scenario_analysis_score = (
                        scenario_weights[0] * optimistic_score +
                        scenario_weights[1] * realistic_score +
                        scenario_weights[2] * pessimistic_score
                    )
                
                record_copy = record.copy()
                record_copy['scenario_analysis_score'] = round(scenario_analysis_score, 2)
                
                # Add scenario details for transparency
                if target_value > 0:
                    record_copy.update({
                        'scenario_optimistic': round(optimistic_score, 2),
                        'scenario_realistic': round(realistic_score, 2),
                        'scenario_pessimistic': round(pessimistic_score, 2),
                        'market_volatility': round(volatility, 2),
                        'economic_stability': round(economic_stability, 2)
                    })
                
                results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        
        return endpoint_data_copy
    
    def calculate_segment_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate market segmentation scores"""
        results = []
        
        # Simple demographic-based segmentation
        for record in endpoint_data['results']:
            total_population = self._safe_float(record.get('total_population', 0))
            median_income = self._safe_float(record.get('median_income', 0))
            median_age = self._safe_float(record.get('median_age', 0))
            
            # Segment score based on target demographics
            if median_age > 0:
                age_score = max(0, 100 - abs(median_age - 35) * 2)  # Target age 35
            else:
                age_score = 50
            
            if median_income > 0:
                income_score = min(median_income / 100000 * 100, 100)
            else:
                income_score = 50
            
            if total_population > 0:
                pop_score = min(total_population / 20000 * 100, 100)
            else:
                pop_score = 50
            
            segment_profiling_score = (age_score + income_score + pop_score) / 3
            
            record_copy = record.copy()
            record_copy['segment_profiling_score'] = round(segment_profiling_score, 2)
            results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        
        return endpoint_data_copy
    
    def calculate_brand_difference_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate brand difference scores (Nike vs Adidas)"""
        results = []
        
        for record in endpoint_data['results']:
            nike_share = self._safe_float(record.get('value_MP30034A_B_P', 0))
            adidas_share = self._safe_float(record.get('value_MP30029A_B_P', 0))
            
            # Brand difference score (-100 to +100)
            if nike_share + adidas_share > 0:
                brand_difference_score = ((nike_share - adidas_share) / (nike_share + adidas_share)) * 100
            else:
                brand_difference_score = 0
            
            record_copy = record.copy()
            record_copy['brand_difference_score'] = round(brand_difference_score, 2)
            results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        
        return endpoint_data_copy
    
    def calculate_risk_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate risk-adjusted scores based on market volatility and uncertainty factors"""
        results = []
        records = endpoint_data['results']
        
        # Calculate dataset risk factors
        target_values = [self._safe_float(r.get('target_value', 0)) for r in records if r.get('target_value', 0) > 0]
        
        if not target_values:
            # No valid data - assign neutral risk scores
            for record in records:
                record_copy = record.copy()
                record_copy['risk_adjusted_score'] = 50.0
                results.append(record_copy)
        else:
            # Calculate market risk indicators
            market_volatility = self._calculate_volatility(target_values)
            mean_target = sum(target_values) / len(target_values)
            
            for record in records:
                target_value = self._safe_float(record.get('target_value', 0))
                median_income = self._safe_float(record.get('median_income', 0))
                total_population = self._safe_float(record.get('total_population', 0))
                
                if target_value <= 0:
                    risk_adjusted_score = 0.0
                else:
                    # Base opportunity score
                    base_value = min(target_value, 100)
                    
                    # Risk factors (penalties)
                    volatility_penalty = min(market_volatility * 0.2, 20)  # Up to 20 point penalty
                    
                    # Uncertainty penalty based on deviation from market mean
                    if mean_target > 0:
                        deviation_ratio = abs(target_value - mean_target) / mean_target
                        uncertainty_penalty = min(deviation_ratio * 15, 15)  # Up to 15 point penalty
                    else:
                        uncertainty_penalty = 0
                    
                    # Stability bonuses (positive factors)
                    stability_bonus = 0
                    
                    # Economic stability bonus
                    if median_income > 75000:  # Above average income = stability
                        economic_stability = min((median_income - 75000) / 25000 * 10, 10)
                        stability_bonus += economic_stability
                    
                    # Market size stability bonus
                    if total_population > 50000:  # Larger markets = more stability
                        size_stability = min((total_population - 50000) / 50000 * 5, 5)
                        stability_bonus += size_stability
                    
                    # SHAP-based predictability bonus
                    record_shap_values = [abs(self._safe_float(v)) for k, v in record.items() 
                                        if k.startswith('shap_') and isinstance(v, (int, float))]
                    if record_shap_values:
                        # Higher SHAP values = more predictable = less risky
                        avg_shap = sum(record_shap_values) / len(record_shap_values)
                        predictability_bonus = min(avg_shap * 5, 5)
                        stability_bonus += predictability_bonus
                    
                    # Calculate final risk-adjusted score
                    risk_adjusted_score = base_value - volatility_penalty - uncertainty_penalty + stability_bonus
                    risk_adjusted_score = max(0, min(100, risk_adjusted_score))
                
                record_copy = record.copy()
                record_copy['risk_adjusted_score'] = round(risk_adjusted_score, 2)
                
                # Add risk breakdown for transparency
                if target_value > 0:
                    record_copy.update({
                        'market_volatility': round(market_volatility, 2),
                        'volatility_penalty': round(volatility_penalty, 2),
                        'uncertainty_penalty': round(uncertainty_penalty, 2),
                        'stability_bonus': round(stability_bonus, 2)
                    })
                
                results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        
        return endpoint_data_copy
    
    def calculate_market_sizing_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate market sizing scores based on population, income, and market potential"""
        results = []
        
        for record in endpoint_data['results']:
            total_population = self._safe_float(record.get('total_population', 0))
            median_income = self._safe_float(record.get('median_income', 0))
            target_value = self._safe_float(record.get('target_value', 0))
            
            if total_population <= 0 or median_income <= 0:
                market_sizing_score = 0.0
                market_category = 'Insufficient Data'
                revenue_potential = 0.0
            else:
                # Revenue potential calculation (geometric mean for balanced scaling)
                revenue_potential = (total_population / 50000) ** 0.5 * (median_income / 80000) ** 0.5 * 100
                revenue_potential = min(revenue_potential, 100)
                
                # Market categorization
                if total_population >= 150000 and median_income >= 80000:
                    market_category = 'Mega Market'
                    category_bonus = 25
                elif total_population >= 100000 and median_income >= 60000:
                    market_category = 'Large Market'
                    category_bonus = 20
                elif total_population >= 75000 or median_income >= 100000:
                    market_category = 'Medium Market'
                    category_bonus = 15
                elif total_population >= 25000 and median_income >= 40000:
                    market_category = 'Small Market'
                    category_bonus = 10
                else:
                    market_category = 'Emerging Market'
                    category_bonus = 5
                
                # Opportunity sizing based on current performance vs potential
                opportunity_factor = 1.0
                if target_value > 0:
                    # Higher current performance = proven market but less upside
                    performance_ratio = min(target_value / 50, 2.0)  # Cap at 2x
                    if performance_ratio > 1.5:
                        opportunity_factor = 0.8  # High performance = lower growth opportunity
                    elif performance_ratio < 0.5:
                        opportunity_factor = 1.3  # Low performance = higher growth opportunity
                
                # Calculate final market sizing score
                base_score = revenue_potential * 0.6 + category_bonus * 0.4
                market_sizing_score = min(base_score * opportunity_factor, 100)
            
            record_copy = record.copy()
            record_copy.update({
                'market_sizing_score': round(market_sizing_score, 2),
                'market_category': market_category,
                'revenue_potential': round(revenue_potential, 2),
                'estimated_households': round(total_population / 2.5, 0) if total_population > 0 else 0
            })
            results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        
        return endpoint_data_copy
    
    def calculate_housing_correlation_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate housing market correlation scores for real estate analysis"""
        results = []
        records = endpoint_data['results']
        
        # Extract housing-related variables for correlation analysis
        target_values = []
        income_values = []
        population_density_values = []
        age_values = []
        
        for record in records:
            target_val = self._safe_float(record.get('target_value', 0))
            income_val = self._safe_float(record.get('median_income', 0))
            pop_val = self._safe_float(record.get('total_population', 0))
            age_val = self._safe_float(record.get('median_age', 0))
            
            if target_val > 0:
                target_values.append(target_val)
                income_values.append(income_val)
                population_density_values.append(pop_val)
                age_values.append(age_val)
        
        # Calculate housing market correlations
        if len(target_values) >= 3:
            income_housing_correlation = self._calculate_pearson_correlation(target_values, income_values)
            density_correlation = self._calculate_pearson_correlation(target_values, population_density_values)
            age_correlation = self._calculate_pearson_correlation(target_values, age_values)
            
            for record in records:
                target_value = self._safe_float(record.get('target_value', 0))
                median_income = self._safe_float(record.get('median_income', 0))
                median_age = self._safe_float(record.get('median_age', 0))
                total_population = self._safe_float(record.get('total_population', 0))
                
                if target_value <= 0:
                    housing_correlation_score = 0.0
                else:
                    # Housing market correlation scoring (0-100)
                    
                    # 1. Income-housing correlation (35% weight)
                    income_factor = abs(income_housing_correlation) * 35 if income_housing_correlation is not None else 0
                    
                    # 2. Population density impact (25% weight)
                    density_factor = abs(density_correlation) * 25 if density_correlation is not None else 0
                    
                    # 3. Age demographics correlation (20% weight)
                    age_factor = abs(age_correlation) * 20 if age_correlation is not None else 0
                    
                    # 4. Economic housing indicators (20% weight)
                    # Ideal housing market: income 60-120K, age 25-45, moderate population
                    economic_housing_score = 0
                    
                    if median_income > 0:
                        # Income sweet spot for housing
                        if 60000 <= median_income <= 120000:
                            income_housing_score = 20
                        elif 40000 <= median_income <= 150000:
                            income_housing_score = 15
                        else:
                            income_housing_score = 10
                        economic_housing_score += income_housing_score * 0.6
                    
                    if median_age > 0:
                        # Age sweet spot for homebuying
                        if 25 <= median_age <= 45:
                            age_housing_score = 20
                        elif 20 <= median_age <= 55:
                            age_housing_score = 15
                        else:
                            age_housing_score = 10
                        economic_housing_score += age_housing_score * 0.4
                    
                    housing_correlation_score = income_factor + density_factor + age_factor + economic_housing_score
                    housing_correlation_score = min(housing_correlation_score, 100)
                
                record_copy = record.copy()
                record_copy.update({
                    'housing_correlation_score': round(housing_correlation_score, 2),
                    'income_housing_correlation': round(income_housing_correlation, 3) if income_housing_correlation is not None else None,
                    'density_correlation': round(density_correlation, 3) if density_correlation is not None else None,
                    'age_correlation': round(age_correlation, 3) if age_correlation is not None else None
                })
                results.append(record_copy)
        else:
            # Insufficient data - use simple heuristic
            for record in records:
                target_value = self._safe_float(record.get('target_value', 0))
                median_income = self._safe_float(record.get('median_income', 0))
                
                if target_value > 0 and median_income > 0:
                    # Simple correlation proxy for housing markets
                    housing_correlation_score = min((target_value / 100) * (median_income / 75000) * 50, 100)
                else:
                    housing_correlation_score = 0.0
                
                record_copy = record.copy()
                record_copy['housing_correlation_score'] = round(housing_correlation_score, 2)
                results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        
        return endpoint_data_copy
    
    def _calculate_shap_stats(self, records: List[Dict]) -> Dict[str, Dict[str, float]]:
        """Calculate SHAP statistics for normalization"""
        shap_values = defaultdict(list)
        
        for record in records:
            shap_values['nike'].append(self._safe_float(record.get('shap_MP30034A_B_P', 0)))
            shap_values['asian'].append(self._safe_float(record.get('shap_ASIAN_CY_P', 0)))
            shap_values['millennial'].append(self._safe_float(record.get('shap_MILLENN_CY', 0)))
            shap_values['genZ'].append(self._safe_float(record.get('shap_GENZ_CY', 0)))
            shap_values['household'].append(self._safe_float(record.get('shap_HHPOP_CY', 0)))
        
        stats = {}
        for key, values in shap_values.items():
            if values:
                stats[key] = {
                    'min': min(values),
                    'max': max(values),
                    'mean': np.mean(values),
                    'std': np.std(values) if len(values) > 1 else 1,
                    'range': max(values) - min(values)
                }
            else:
                stats[key] = {'min': 0, 'max': 1, 'mean': 0, 'std': 1, 'range': 1}
        
        return stats
    
    def _normalize_shap_value(self, value: float, stats: Dict[str, float]) -> float:
        """Normalize SHAP value to 0-100 scale"""
        if not stats or stats.get('range', 0) == 0:
            return 50  # Default neutral value
        
        # Min-max normalization to 0-100
        normalized = ((value - stats['min']) / stats['range']) * 100
        return max(0, min(100, normalized))
    
    def _safe_float(self, value: Any) -> float:
        """Safely convert value to float"""
        try:
            if value is None:
                return 0.0
            return float(value)
        except (ValueError, TypeError):
            return 0.0
    
    def _calculate_pearson_correlation(self, x_values: List[float], y_values: List[float]) -> Optional[float]:
        """Calculate Pearson correlation coefficient between two arrays"""
        if len(x_values) != len(y_values) or len(x_values) < 2:
            return None
            
        try:
            # Remove pairs where either value is 0 (invalid data)
            valid_pairs = [(x, y) for x, y in zip(x_values, y_values) if x > 0 and y > 0]
            
            if len(valid_pairs) < 2:
                return None
                
            x_valid = [pair[0] for pair in valid_pairs]
            y_valid = [pair[1] for pair in valid_pairs]
            
            # Calculate means
            mean_x = sum(x_valid) / len(x_valid)
            mean_y = sum(y_valid) / len(y_valid)
            
            # Calculate correlation components
            numerator = sum((x - mean_x) * (y - mean_y) for x, y in zip(x_valid, y_valid))
            sum_sq_x = sum((x - mean_x) ** 2 for x in x_valid)
            sum_sq_y = sum((y - mean_y) ** 2 for y in y_valid)
            
            # Calculate correlation coefficient
            denominator = (sum_sq_x * sum_sq_y) ** 0.5
            
            if denominator == 0:
                return None
                
            correlation = numerator / denominator
            return max(-1.0, min(1.0, correlation))  # Clamp to [-1, 1]
            
        except Exception as e:
            print(f"Error calculating correlation: {e}")
            return None
    
    def _calculate_volatility(self, values: List[float]) -> float:
        """Calculate volatility (coefficient of variation) for a set of values"""
        if len(values) < 2:
            return 0.0
            
        try:
            mean_val = sum(values) / len(values)
            if mean_val == 0:
                return 0.0
                
            variance = sum((x - mean_val) ** 2 for x in values) / len(values)
            std_dev = variance ** 0.5
            
            # Coefficient of variation as percentage
            volatility = (std_dev / mean_val) * 100
            return min(volatility, 200)  # Cap at 200% volatility
            
        except Exception as e:
            print(f"Error calculating volatility: {e}")
            return 0.0
    
    def _save_scored_endpoint(self, original_file: Path, scored_data: Dict[str, Any]) -> None:
        """Save scored endpoint data back to file"""
        
        # Add scoring metadata
        scored_data['scoring_metadata'] = {
            'scored_timestamp': datetime.now().isoformat(),
            'scoring_version': '1.0',
            'original_record_count': len(scored_data['results'])
        }
        
        # Write back to file
        with open(original_file, 'w', encoding='utf-8') as f:
            json.dump(scored_data, f, indent=2, default=str)
    
    def _count_added_scores(self, original_results: List[Dict], scored_results: List[Dict]) -> int:
        """Count how many new score fields were added"""
        if not original_results or not scored_results:
            return 0
        
        original_fields = set(original_results[0].keys()) if original_results else set()
        scored_fields = set(scored_results[0].keys()) if scored_results else set()
        
        score_fields = [field for field in (scored_fields - original_fields) 
                       if 'score' in field.lower() or field.endswith('_score')]
        
        return len(score_fields)
    
    def _generate_scoring_statistics(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate overall scoring statistics"""
        
        total_records = sum(
            result.get('records_processed', 0) 
            for result in results['scoring_results'].values()
        )
        
        total_scores_added = sum(
            result.get('scores_added', 0)
            for result in results['scoring_results'].values()
        )
        
        return {
            'total_endpoints_processed': len(results['endpoints_processed']),
            'total_records_scored': total_records,
            'total_score_fields_added': total_scores_added,
            'average_scores_per_endpoint': total_scores_added / max(1, len(results['endpoints_processed'])),
            'success_rate': len(results['endpoints_processed']) / max(1, (len(results['endpoints_processed']) + len(results['errors']))),
            'processing_errors': len(results['errors'])
        }


    # Comprehensive endpoint scoring methods (7 new)
    def calculate_algorithm_comparison_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate algorithm comparison scores based on model performance variance"""
        results = []
        
        for record in endpoint_data['results']:
            # Calculate variance across different model predictions
            model_predictions = []
            for key in record:
                if key.startswith('pred_') or key.endswith('_prediction'):
                    model_predictions.append(self._safe_float(record[key]))
            
            if model_predictions:
                variance = np.var(model_predictions)
                agreement = 100 * (1 - min(1, variance))  # Higher agreement = lower variance
            else:
                agreement = 50  # Default neutral score
            
            record_copy = record.copy()
            record_copy['algorithm_agreement_score'] = round(agreement, 2)
            results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        return endpoint_data_copy
    
    def calculate_ensemble_analysis_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate ensemble analysis scores based on prediction confidence"""
        results = []
        
        for record in endpoint_data['results']:
            # Use ensemble prediction confidence
            ensemble_pred = self._safe_float(record.get('ensemble_prediction', 
                                                       record.get('prediction', 0)))
            confidence = self._safe_float(record.get('confidence', 0.5))
            
            # Score combines prediction strength and confidence
            ensemble_score = (abs(ensemble_pred) * confidence * 100)
            
            record_copy = record.copy()
            record_copy['ensemble_strength_score'] = round(min(100, ensemble_score), 2)
            results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        return endpoint_data_copy
    
    def calculate_cluster_analysis_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate cluster analysis scores based on cluster characteristics"""
        results = []
        
        for record in endpoint_data['results']:
            cluster_id = record.get('cluster', 0)
            distance_to_center = self._safe_float(record.get('distance_to_center', 1))
            
            # Score inversely proportional to distance from cluster center
            cluster_score = 100 * (1 / (1 + distance_to_center))
            
            record_copy = record.copy()
            record_copy['cluster_quality_score'] = round(cluster_score, 2)
            results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        return endpoint_data_copy
    
    def calculate_anomaly_insights_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate anomaly insights scores based on anomaly characteristics"""
        results = []
        
        for record in endpoint_data['results']:
            anomaly_score = self._safe_float(record.get('anomaly_score', 0))
            isolation_score = self._safe_float(record.get('isolation_score', 0))
            
            # Combine multiple anomaly indicators
            combined_anomaly = (anomaly_score + isolation_score) / 2
            insight_score = min(100, combined_anomaly * 100)
            
            record_copy = record.copy()
            record_copy['anomaly_insight_score'] = round(insight_score, 2)
            results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        return endpoint_data_copy
    
    def calculate_model_selection_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate model selection scores based on best performing model"""
        results = []
        
        for record in endpoint_data['results']:
            best_model = record.get('best_model', 'unknown')
            model_performance = self._safe_float(record.get('best_model_score', 0))
            
            # Score based on how much better the best model is
            selection_score = min(100, model_performance * 100)
            
            record_copy = record.copy()
            record_copy['model_selection_score'] = round(selection_score, 2)
            results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        return endpoint_data_copy
    
    def calculate_dimensionality_insights_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate dimensionality insights scores based on PCA components"""
        results = []
        
        for record in endpoint_data['results']:
            # Get principal component values
            pc1 = self._safe_float(record.get('pc1', record.get('component_1', 0)))
            pc2 = self._safe_float(record.get('pc2', record.get('component_2', 0)))
            explained_variance = self._safe_float(record.get('explained_variance', 0))
            
            # Score based on position in reduced dimensional space
            dimension_score = min(100, (abs(pc1) + abs(pc2)) * 50 + explained_variance * 100)
            
            record_copy = record.copy()
            record_copy['dimensionality_score'] = round(dimension_score, 2)
            results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        return endpoint_data_copy
    
    def calculate_consensus_analysis_scores(self, endpoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate consensus analysis scores based on model agreement"""
        results = []
        
        for record in endpoint_data['results']:
            # Count models that agree (within threshold)
            predictions = []
            for key in record:
                if 'prediction' in key or key.startswith('pred_'):
                    predictions.append(self._safe_float(record[key]))
            
            if len(predictions) > 1:
                # Calculate standard deviation as measure of disagreement
                std_dev = np.std(predictions)
                consensus = 100 * (1 / (1 + std_dev))
            else:
                consensus = 50  # Default neutral score
            
            record_copy = record.copy()
            record_copy['consensus_score'] = round(consensus, 2)
            results.append(record_copy)
        
        endpoint_data_copy = endpoint_data.copy()
        endpoint_data_copy['results'] = results
        return endpoint_data_copy

def main():
    """Main function for command-line usage"""
    import sys
    
    endpoints_dir = sys.argv[1] if len(sys.argv) > 1 else "generated_endpoints"
    output_file = sys.argv[2] if len(sys.argv) > 2 else "scoring_results.json"
    
    print(f"🧮 Starting automated score calculation...")
    print(f"📂 Endpoints directory: {endpoints_dir}")
    print(f"📄 Results will be saved to: {output_file}")
    print("=" * 60)
    
    # Create calculator and run
    calculator = AutomatedScoreCalculator(endpoints_dir)
    results = calculator.apply_all_scoring_algorithms()
    
    # Save results
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    # Print summary
    stats = results['statistics']
    print(f"\n✅ Scoring completed!")
    print(f"📊 {stats['total_endpoints_processed']} endpoints processed")
    print(f"📈 {stats['total_records_scored']:,} records scored")
    print(f"🎯 {stats['total_score_fields_added']} score fields added")
    print(f"⚡ {stats['average_scores_per_endpoint']:.1f} avg scores per endpoint")
    print(f"✅ {stats['success_rate']:.1%} success rate")
    
    if results['errors']:
        print(f"\n⚠️ {len(results['errors'])} errors occurred:")
        for error in results['errors']:
            print(f"   - {error['endpoint']}: {error['error']}")
    
    print(f"\n💾 Detailed results saved to: {output_file}")


if __name__ == "__main__":
    main()