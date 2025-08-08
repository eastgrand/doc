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
        
        # Scoring algorithms registry
        self.scoring_algorithms = {
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
            'brand-difference': self.calculate_brand_difference_scores
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
        """Calculate correlation strength scores"""
        results = []
        
        for record in endpoint_data['results']:
            # Use existing correlation score if available
            if 'correlation_score' in record and record['correlation_score'] is not None:
                correlation_strength_score = self._safe_float(record['correlation_score'])
            else:
                # Calculate based on available metrics
                target_value = self._safe_float(record.get('target_value', 0))
                median_income = self._safe_float(record.get('median_income', 0))
                total_population = self._safe_float(record.get('total_population', 0))
                
                # Simple correlation proxy
                if target_value > 0 and median_income > 0:
                    correlation_strength_score = min((target_value * median_income / 1000000), 100)
                else:
                    correlation_strength_score = 0
            
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
        """Calculate trend analysis scores"""
        results = []
        
        # Simple trend based on current vs baseline
        for record in endpoint_data['results']:
            target_value = self._safe_float(record.get('target_value', 0))
            
            # Assume baseline of 50 for trend analysis
            baseline = 50
            trend_strength_score = max(0, min((target_value / baseline) * 50, 100))
            
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
        """Calculate scenario analysis scores"""
        results = []
        
        for record in endpoint_data['results']:
            target_value = self._safe_float(record.get('target_value', 0))
            
            # Different scenarios: optimistic, realistic, pessimistic
            base_score = min(target_value, 100)
            
            scenario_analysis_score = (
                0.25 * (base_score * 1.2) +  # Optimistic
                0.50 * base_score +           # Realistic  
                0.25 * (base_score * 0.8)     # Pessimistic
            )
            
            record_copy = record.copy()
            record_copy['scenario_analysis_score'] = round(min(scenario_analysis_score, 100), 2)
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