#!/usr/bin/env python3
"""
Model Performance Reporter for Automation Pipeline
Generate comprehensive performance reports and interpretations for all trained models
"""

import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


class ModelPerformanceReporter:
    """Generate comprehensive performance reports for trained models"""
    
    def __init__(self, project_name: str, output_dir: Path):
        self.project_name = project_name
        self.output_dir = output_dir
        self.domain = 'geospatial'  # Default domain, could be configurable
        
        # Performance thresholds by domain
        self.thresholds = {
            'geospatial': {'min': 0.40, 'good': 0.60, 'excellent': 0.80},
            'finance': {'min': 0.70, 'good': 0.80, 'excellent': 0.90},
            'social': {'min': 0.30, 'good': 0.50, 'excellent': 0.70},
            'marketing': {'min': 0.35, 'good': 0.55, 'excellent': 0.75},
            'healthcare': {'min': 0.75, 'good': 0.85, 'excellent': 0.95}
        }
    
    def generate_performance_report(self, training_results: Dict, target_variable: str) -> Dict:
        """Generate comprehensive performance report for all models"""
        
        logger.info("📊 Generating Model Performance Report...")
        
        # Extract model performances
        model_performances = self._extract_model_performances(training_results)
        
        # Generate performance interpretations
        interpretations = self._generate_performance_interpretations(model_performances)
        
        # Create performance rankings
        rankings = self._create_performance_rankings(model_performances)
        
        # Generate recommendations
        recommendations = self._generate_usage_recommendations(model_performances)
        
        # Create ensemble analysis
        ensemble_analysis = self._analyze_ensemble_performance(training_results)
        
        # Generate performance report
        performance_report = {
            'project_info': {
                'project_name': self.project_name,
                'target_variable': target_variable,
                'domain': self.domain,
                'generated_at': datetime.now().isoformat(),
                'total_models': len(model_performances)
            },
            'performance_summary': {
                'best_individual_model': rankings['best_individual'],
                'worst_individual_model': rankings['worst_individual'],
                'ensemble_performance': ensemble_analysis,
                'performance_spread': rankings['performance_spread']
            },
            'model_performances': model_performances,
            'interpretations': interpretations,
            'rankings': rankings,
            'usage_recommendations': recommendations,
            'domain_context': self._get_domain_context(),
            'next_steps': self._generate_next_steps(model_performances)
        }
        
        # Save report
        self._save_performance_report(performance_report)
        
        # Generate user-friendly dashboard
        self._generate_performance_dashboard(performance_report)
        
        logger.info(f"✅ Performance report generated for {len(model_performances)} models")
        
        return performance_report
    
    def _extract_model_performances(self, training_results: Dict) -> Dict:
        """Extract R² scores and performance metrics from training results"""
        
        performances = {}
        
        # Extract from individual models
        if 'models' in training_results:
            for model_name, model_data in training_results['models'].items():
                if 'performance' in model_data:
                    performances[model_name] = {
                        'r2_score': model_data['performance'].get('r2_score', 0.0),
                        'rmse': model_data['performance'].get('rmse', float('inf')),
                        'mae': model_data['performance'].get('mae', float('inf')),
                        'training_time': model_data.get('training_time', 0),
                        'model_type': model_data.get('model_type', 'unknown'),
                        'feature_count': len(model_data.get('features', [])),
                        'model_size_mb': model_data.get('model_size_mb', 0)
                    }
        
        # Add ensemble performance if available
        if 'ensemble_performance' in training_results:
            ensemble_perf = training_results['ensemble_performance']
            performances['ensemble_model'] = {
                'r2_score': ensemble_perf.get('r2_score', 0.0),
                'rmse': ensemble_perf.get('rmse', float('inf')),
                'mae': ensemble_perf.get('mae', float('inf')),
                'training_time': ensemble_perf.get('training_time', 0),
                'model_type': 'ensemble',
                'feature_count': ensemble_perf.get('feature_count', 0),
                'model_count': ensemble_perf.get('model_count', 0)
            }
        
        return performances
    
    def _generate_performance_interpretations(self, performances: Dict) -> Dict:
        """Generate human-readable interpretations of model performance"""
        
        interpretations = {}
        thresholds = self.thresholds[self.domain]
        
        for model_name, perf in performances.items():
            r2_score = perf['r2_score']
            
            # Determine performance level
            if r2_score >= thresholds['excellent']:
                level = 'EXCELLENT'
                confidence = 'Very High'
                emoji = '🏆'
                color = 'green'
            elif r2_score >= thresholds['good']:
                level = 'GOOD'
                confidence = 'High'
                emoji = '✅'
                color = 'blue'
            elif r2_score >= thresholds['min']:
                level = 'MODERATE'
                confidence = 'Moderate'
                emoji = '⚠️'
                color = 'orange'
            else:
                level = 'POOR'
                confidence = 'Low'
                emoji = '❌'
                color = 'red'
            
            # Generate interpretation text
            variance_explained = f"{r2_score * 100:.1f}%"
            
            interpretation = {
                'performance_level': level,
                'confidence_level': confidence,
                'emoji': emoji,
                'color': color,
                'variance_explained': variance_explained,
                'interpretation_text': self._generate_interpretation_text(model_name, r2_score, level),
                'business_suitability': self._assess_business_suitability(r2_score, level),
                'recommended_uses': self._get_recommended_uses(r2_score, level),
                'warnings': self._get_performance_warnings(r2_score, level)
            }
            
            interpretations[model_name] = interpretation
        
        return interpretations
    
    def _generate_interpretation_text(self, model_name: str, r2_score: float, level: str) -> str:
        """Generate human-readable interpretation text"""
        
        variance = f"{r2_score * 100:.1f}%"
        
        if level == 'EXCELLENT':
            return f"{model_name} explains {variance} of the variance in your data - this is outstanding performance that you can rely on for important business decisions."
        
        elif level == 'GOOD':
            return f"{model_name} explains {variance} of the variance in your data - this is solid performance suitable for most business applications."
        
        elif level == 'MODERATE':
            return f"{model_name} explains {variance} of the variance in your data - this provides useful insights but should be used with additional validation."
        
        else:  # POOR
            return f"{model_name} explains only {variance} of the variance in your data - this model has limited predictive power and should be used cautiously."
    
    def _assess_business_suitability(self, r2_score: float, level: str) -> Dict:
        """Assess model suitability for different business applications"""
        
        suitability = {
            'strategic_decisions': False,
            'operational_decisions': False,
            'exploratory_analysis': False,
            'automated_systems': False,
            'financial_planning': False,
            'customer_insights': False
        }
        
        if level == 'EXCELLENT':
            suitability = {k: True for k in suitability.keys()}
        elif level == 'GOOD':
            suitability.update({
                'strategic_decisions': True,
                'operational_decisions': True,
                'exploratory_analysis': True,
                'automated_systems': True,
                'customer_insights': True
            })
        elif level == 'MODERATE':
            suitability.update({
                'operational_decisions': True,
                'exploratory_analysis': True,
                'customer_insights': True
            })
        else:  # POOR
            suitability.update({
                'exploratory_analysis': True
            })
        
        return suitability
    
    def _get_recommended_uses(self, r2_score: float, level: str) -> List[str]:
        """Get list of recommended use cases for the model"""
        
        if level == 'EXCELLENT':
            return [
                "Strategic business planning",
                "Automated decision systems",
                "Financial forecasting",
                "Customer segmentation",
                "Resource allocation",
                "Competitive analysis",
                "Risk assessment"
            ]
        elif level == 'GOOD':
            return [
                "Operational decision support",
                "Customer insights (with validation)",
                "Market trend analysis",
                "Performance benchmarking",
                "Comparative analysis"
            ]
        elif level == 'MODERATE':
            return [
                "Exploratory data analysis",
                "Initial hypothesis generation",
                "Trend direction identification",
                "Feature importance ranking",
                "Data quality assessment"
            ]
        else:  # POOR
            return [
                "Baseline model establishment",
                "Feature engineering insights",
                "Data collection guidance",
                "Academic research (with caveats)"
            ]
    
    def _get_performance_warnings(self, r2_score: float, level: str) -> List[str]:
        """Get performance warnings and limitations"""
        
        warnings = []
        
        if level == 'POOR':
            warnings.extend([
                "⚠️ This model explains less than 40% of data variance",
                "❌ NOT recommended for business-critical decisions",
                "🔍 Consider collecting more data or additional features",
                "💡 May indicate underlying data quality issues"
            ])
        elif level == 'MODERATE':
            warnings.extend([
                "⚠️ Use with additional validation and context",
                "🔍 Combine with domain expertise for decisions",
                "📊 Best used for exploratory analysis"
            ])
        elif level == 'GOOD':
            warnings.extend([
                "✅ Solid performance for most business applications",
                "💡 Consider ensemble methods for critical decisions"
            ])
        
        # Universal warnings
        if r2_score < 0.50:
            warnings.append("📈 Model performance may improve with more training data")
        
        return warnings
    
    def _create_performance_rankings(self, performances: Dict) -> Dict:
        """Create performance rankings and statistics"""
        
        # Sort by R² score
        sorted_models = sorted(performances.items(), key=lambda x: x[1]['r2_score'], reverse=True)
        
        r2_scores = [perf['r2_score'] for perf in performances.values()]
        
        rankings = {
            'best_individual': {
                'model_name': sorted_models[0][0],
                'r2_score': sorted_models[0][1]['r2_score'],
                'performance_level': self._get_performance_level(sorted_models[0][1]['r2_score'])
            },
            'worst_individual': {
                'model_name': sorted_models[-1][0],
                'r2_score': sorted_models[-1][1]['r2_score'],
                'performance_level': self._get_performance_level(sorted_models[-1][1]['r2_score'])
            },
            'ranked_models': [
                {
                    'rank': i + 1,
                    'model_name': model_name,
                    'r2_score': perf['r2_score'],
                    'performance_level': self._get_performance_level(perf['r2_score'])
                }
                for i, (model_name, perf) in enumerate(sorted_models)
            ],
            'performance_spread': {
                'max_r2': max(r2_scores),
                'min_r2': min(r2_scores),
                'mean_r2': np.mean(r2_scores),
                'median_r2': np.median(r2_scores),
                'std_r2': np.std(r2_scores)
            },
            'performance_distribution': self._analyze_performance_distribution(r2_scores)
        }
        
        return rankings
    
    def _get_performance_level(self, r2_score: float) -> str:
        """Get performance level for a given R² score"""
        thresholds = self.thresholds[self.domain]
        
        if r2_score >= thresholds['excellent']:
            return 'EXCELLENT'
        elif r2_score >= thresholds['good']:
            return 'GOOD'
        elif r2_score >= thresholds['min']:
            return 'MODERATE'
        else:
            return 'POOR'
    
    def _analyze_performance_distribution(self, r2_scores: List[float]) -> Dict:
        """Analyze the distribution of R² scores"""
        
        thresholds = self.thresholds[self.domain]
        
        excellent_count = sum(1 for score in r2_scores if score >= thresholds['excellent'])
        good_count = sum(1 for score in r2_scores if thresholds['good'] <= score < thresholds['excellent'])
        moderate_count = sum(1 for score in r2_scores if thresholds['min'] <= score < thresholds['good'])
        poor_count = sum(1 for score in r2_scores if score < thresholds['min'])
        
        total = len(r2_scores)
        
        return {
            'excellent': {'count': excellent_count, 'percentage': (excellent_count / total) * 100},
            'good': {'count': good_count, 'percentage': (good_count / total) * 100},
            'moderate': {'count': moderate_count, 'percentage': (moderate_count / total) * 100},
            'poor': {'count': poor_count, 'percentage': (poor_count / total) * 100}
        }
    
    def _generate_usage_recommendations(self, performances: Dict) -> Dict:
        """Generate specific usage recommendations for the model suite"""
        
        recommendations = {
            'primary_model_recommendation': '',
            'ensemble_recommendation': '',
            'use_case_mapping': {},
            'improvement_suggestions': [],
            'deployment_strategy': ''
        }
        
        # Find best models
        best_models = sorted(performances.items(), key=lambda x: x[1]['r2_score'], reverse=True)[:3]
        ensemble_perf = performances.get('ensemble_model', {}).get('r2_score', 0)
        
        # Primary model recommendation
        if ensemble_perf > 0 and ensemble_perf >= best_models[0][1]['r2_score']:
            recommendations['primary_model_recommendation'] = f"Use the ensemble model (R² = {ensemble_perf:.3f}) as your primary model - it combines the strengths of multiple algorithms for optimal performance."
        else:
            best_model_name, best_perf = best_models[0]
            recommendations['primary_model_recommendation'] = f"Use {best_model_name} (R² = {best_perf['r2_score']:.3f}) as your primary model for most applications."
        
        # Ensemble recommendation
        if ensemble_perf > 0:
            recommendations['ensemble_recommendation'] = f"Your ensemble model achieves R² = {ensemble_perf:.3f}, which is {self._get_performance_level(ensemble_perf).lower()} performance for {self.domain} applications."
        
        # Use case mapping
        for model_name, perf in performances.items():
            r2_score = perf['r2_score']
            level = self._get_performance_level(r2_score)
            
            recommendations['use_case_mapping'][model_name] = {
                'r2_score': r2_score,
                'recommended_for': self._get_recommended_uses(r2_score, level),
                'confidence_level': level
            }
        
        # Improvement suggestions
        poor_models = [name for name, perf in performances.items() if perf['r2_score'] < self.thresholds[self.domain]['min']]
        
        if poor_models:
            recommendations['improvement_suggestions'].extend([
                f"Consider improving or replacing models with poor performance: {', '.join(poor_models)}",
                "Collect additional features that might improve predictive power",
                "Increase training data size if possible",
                "Try different algorithms or hyperparameter tuning"
            ])
        
        if len([p for p in performances.values() if p['r2_score'] >= self.thresholds[self.domain]['good']]) < 3:
            recommendations['improvement_suggestions'].append("Consider ensemble methods to combine multiple models for better performance")
        
        return recommendations
    
    def _analyze_ensemble_performance(self, training_results: Dict) -> Dict:
        """Analyze ensemble model performance in detail"""
        
        ensemble_analysis = {}
        
        if 'ensemble_performance' in training_results:
            ensemble_perf = training_results['ensemble_performance']
            ensemble_r2 = ensemble_perf.get('r2_score', 0)
            
            # Compare to individual models
            individual_r2_scores = []
            if 'models' in training_results:
                individual_r2_scores = [
                    model_data['performance']['r2_score'] 
                    for model_data in training_results['models'].values()
                    if 'performance' in model_data and 'r2_score' in model_data['performance']
                ]
            
            if individual_r2_scores:
                best_individual = max(individual_r2_scores)
                improvement = ensemble_r2 - best_individual
                
                ensemble_analysis = {
                    'r2_score': ensemble_r2,
                    'performance_level': self._get_performance_level(ensemble_r2),
                    'best_individual_r2': best_individual,
                    'improvement_over_best': improvement,
                    'improvement_percentage': (improvement / best_individual) * 100 if best_individual > 0 else 0,
                    'model_count': ensemble_perf.get('model_count', 0),
                    'ensemble_effectiveness': 'High' if improvement > 0.05 else 'Moderate' if improvement > 0 else 'Limited'
                }
        
        return ensemble_analysis
    
    def _get_domain_context(self) -> Dict:
        """Provide domain-specific context for performance interpretation"""
        
        domain_info = {
            'geospatial': {
                'description': 'Geospatial and demographic analysis',
                'typical_r2_range': '0.40 - 0.80',
                'factors_affecting_performance': [
                    'Geographic variability',
                    'Demographic complexity',
                    'Data collection methods',
                    'Regional differences',
                    'Temporal stability'
                ],
                'performance_expectations': 'Geospatial models often achieve moderate to good performance due to inherent variability in geographic and demographic data.'
            }
        }
        
        return domain_info.get(self.domain, {})
    
    def _generate_next_steps(self, performances: Dict) -> List[str]:
        """Generate actionable next steps based on performance"""
        
        next_steps = []
        
        # Count performance levels
        excellent_count = sum(1 for perf in performances.values() if self._get_performance_level(perf['r2_score']) == 'EXCELLENT')
        good_count = sum(1 for perf in performances.values() if self._get_performance_level(perf['r2_score']) == 'GOOD')
        poor_count = sum(1 for perf in performances.values() if self._get_performance_level(perf['r2_score']) == 'POOR')
        
        # Deployment recommendations
        if excellent_count > 0:
            next_steps.append("🚀 Deploy your excellent-performing models to production with confidence")
        
        if good_count > 0:
            next_steps.append("✅ Use your good-performing models for business decisions with appropriate validation")
        
        # Improvement recommendations
        if poor_count > 0:
            next_steps.extend([
                "🔧 Investigate poor-performing models - consider feature engineering or different algorithms",
                "📊 Review data quality and completeness for underperforming models"
            ])
        
        # General recommendations
        next_steps.extend([
            "📈 Monitor model performance over time to detect degradation",
            "🧪 Test models on new data before making critical business decisions",
            "📚 Document model assumptions and limitations for end users"
        ])
        
        if 'ensemble_model' in performances:
            next_steps.append("🎯 Consider using the ensemble model as your primary predictor for best overall performance")
        
        return next_steps
    
    def _save_performance_report(self, report: Dict):
        """Save the comprehensive performance report"""
        
        report_file = self.output_dir / "MODEL_PERFORMANCE_REPORT.json"
        
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        logger.info(f"📊 Performance report saved: {report_file}")
    
    def _generate_performance_dashboard(self, report: Dict):
        """Generate user-friendly HTML dashboard"""
        
        dashboard_content = self._create_dashboard_html(report)
        
        dashboard_file = self.output_dir / "MODEL_PERFORMANCE_DASHBOARD.html"
        
        with open(dashboard_file, 'w') as f:
            f.write(dashboard_content)
        
        logger.info(f"📈 Performance dashboard generated: {dashboard_file}")
    
    def _create_dashboard_html(self, report: Dict) -> str:
        """Create HTML dashboard content"""
        
        # Extract key metrics
        project_name = report['project_info']['project_name']
        target_variable = report['project_info']['target_variable']
        total_models = report['project_info']['total_models']
        
        best_model = report['performance_summary']['best_individual_model']
        ensemble = report['performance_summary']['ensemble_performance']
        
        # Generate model cards
        model_cards = []
        for model_name, interpretation in report['interpretations'].items():
            card = f"""
            <div class="model-card {interpretation['color']}-border">
                <div class="model-header">
                    <h3>{interpretation['emoji']} {model_name.replace('_', ' ').title()}</h3>
                    <span class="performance-badge {interpretation['color']}">{interpretation['performance_level']}</span>
                </div>
                <div class="model-metrics">
                    <div class="metric">
                        <div class="metric-value">{interpretation['variance_explained']}</div>
                        <div class="metric-label">Variance Explained</div>
                    </div>
                </div>
                <div class="model-description">
                    <p>{interpretation['interpretation_text']}</p>
                </div>
                <div class="model-recommendations">
                    <h4>Recommended Uses:</h4>
                    <ul>
                        {''.join(f'<li>{use}</li>' for use in interpretation['recommended_uses'][:3])}
                    </ul>
                </div>
                {f'''
                <div class="model-warnings">
                    {''.join(f'<p class="warning">{warning}</p>' for warning in interpretation['warnings'])}
                </div>
                ''' if interpretation['warnings'] else ''}
            </div>
            """
            model_cards.append(card)
        
        # Create full HTML
        html_content = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Model Performance Dashboard - {project_name}</title>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background-color: #f5f7fa;
                    color: #2d3748;
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                    padding: 20px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .summary-grid {{
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }}
                .summary-card {{
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .models-grid {{
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 20px;
                }}
                .model-card {{
                    background: white;
                    border-radius: 10px;
                    padding: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    border-left: 4px solid #cbd5e0;
                }}
                .model-card.green-border {{ border-left-color: #48bb78; }}
                .model-card.blue-border {{ border-left-color: #4299e1; }}
                .model-card.orange-border {{ border-left-color: #ed8936; }}
                .model-card.red-border {{ border-left-color: #f56565; }}
                .model-header {{
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }}
                .performance-badge {{
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                    color: white;
                }}
                .performance-badge.green {{ background-color: #48bb78; }}
                .performance-badge.blue {{ background-color: #4299e1; }}
                .performance-badge.orange {{ background-color: #ed8936; }}
                .performance-badge.red {{ background-color: #f56565; }}
                .metric {{
                    text-align: center;
                    margin-bottom: 15px;
                }}
                .metric-value {{
                    font-size: 2em;
                    font-weight: bold;
                    color: #2b6cb0;
                }}
                .metric-label {{
                    font-size: 0.9em;
                    color: #718096;
                }}
                .model-description {{
                    margin-bottom: 15px;
                    font-size: 0.95em;
                    line-height: 1.4;
                }}
                .model-recommendations h4 {{
                    margin-bottom: 8px;
                    color: #2d3748;
                }}
                .model-recommendations ul {{
                    margin: 0;
                    padding-left: 20px;
                }}
                .model-recommendations li {{
                    margin-bottom: 4px;
                    font-size: 0.9em;
                }}
                .model-warnings {{
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid #e2e8f0;
                }}
                .warning {{
                    margin: 5px 0;
                    padding: 8px;
                    background-color: #fed7d7;
                    border-left: 3px solid #f56565;
                    border-radius: 4px;
                    font-size: 0.9em;
                }}
                .best-model {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }}
                .best-model .metric-value {{
                    color: white;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🤖 Model Performance Dashboard</h1>
                <h2>{project_name}</h2>
                <p><strong>Target Variable:</strong> {target_variable} | <strong>Models Trained:</strong> {total_models}</p>
                <p><em>Generated on {report['project_info']['generated_at'][:19].replace('T', ' ')}</em></p>
            </div>
            
            <div class="summary-grid">
                <div class="summary-card best-model">
                    <h3>🏆 Best Performing Model</h3>
                    <div class="metric">
                        <div class="metric-value">{best_model['r2_score']:.1%}</div>
                        <div class="metric-label">{best_model['model_name'].replace('_', ' ').title()}</div>
                    </div>
                    <p><strong>Performance Level:</strong> {best_model['performance_level']}</p>
                </div>
                
                {'<div class="summary-card">' + f'''
                    <h3>🎯 Ensemble Model</h3>
                    <div class="metric">
                        <div class="metric-value">{ensemble['r2_score']:.1%}</div>
                        <div class="metric-label">Combined Model Performance</div>
                    </div>
                    <p><strong>Improvement:</strong> +{ensemble['improvement_over_best']:.1%} over best individual</p>
                    <p><strong>Models Combined:</strong> {ensemble['model_count']}</p>
                ''' + '</div>' if ensemble else ''}
            </div>
            
            <h2>📊 Individual Model Performance</h2>
            <div class="models-grid">
                {''.join(model_cards)}
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 10px;">
                <h3>💡 Next Steps</h3>
                <ul>
                    {''.join(f'<li>{step}</li>' for step in report['next_steps'])}
                </ul>
            </div>
        </body>
        </html>
        """
        
        return html_content


def main():
    """Command-line interface for model performance reporter"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate model performance report")
    parser.add_argument("--project-name", required=True, help="Project name")
    parser.add_argument("--results-file", required=True, help="Training results JSON file")
    parser.add_argument("--target-variable", default="MP10128A_B_P", help="Target variable name")
    parser.add_argument("--output-dir", help="Output directory for reports")
    
    args = parser.parse_args()
    
    # Load training results
    with open(args.results_file, 'r') as f:
        training_results = json.load(f)
    
    # Initialize reporter
    output_dir = Path(args.output_dir) if args.output_dir else Path.cwd()
    reporter = ModelPerformanceReporter(args.project_name, output_dir)
    
    # Generate report
    report = reporter.generate_performance_report(training_results, args.target_variable)
    
    print(f"\n📊 Performance report generated for {args.project_name}")
    print(f"📁 Reports saved in: {output_dir}")


if __name__ == "__main__":
    main()