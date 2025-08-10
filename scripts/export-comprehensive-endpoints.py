#!/usr/bin/env python3
"""
Comprehensive Endpoint Export Script - 26 Endpoints
Exports all 19 standard endpoints + 7 new comprehensive model endpoints
Leverages 17-model architecture for maximum analysis flexibility
"""

import requests
import json
import os
from datetime import datetime
import logging
import time
from pathlib import Path
from typing import Dict, List, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Microservice configuration - UPDATE THESE VALUES
MICROSERVICE_URL = "https://your-project-shap.onrender.com"  # Replace with your microservice URL
API_KEY = None  # Set if your microservice requires authentication

# Target variable for HRB project
TARGET_VARIABLE = "MP10128A_B_P"  # H&R Block Online tax preparation usage

# Export configuration
EXPORT_CONFIG = {
    'max_records': 5000,
    'batch_size': 500,
    'timeout': 300,
    'retry_attempts': 3,
    'include_shap': True,
    'output_dir': '../public/data/endpoints'
}

class ComprehensiveEndpointExporter:
    """Export all 26 endpoints from the comprehensive 17-model microservice"""
    
    def __init__(self):
        self.session = requests.Session()
        if API_KEY:
            self.session.headers.update({"Authorization": f"Bearer {API_KEY}"})
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Create output directory
        self.output_dir = Path(EXPORT_CONFIG['output_dir'])
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.results = {}
        self.errors = []
    
    def call_endpoint(self, endpoint: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Call a microservice endpoint with retry logic"""
        
        for attempt in range(EXPORT_CONFIG['retry_attempts']):
            try:
                response = self.session.post(
                    f"{MICROSERVICE_URL}{endpoint}",
                    json=payload,
                    timeout=EXPORT_CONFIG['timeout']
                )
                
                logger.info(f"📡 {endpoint} → Status: {response.status_code} (Attempt {attempt + 1})")
                
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 503:
                    logger.warning(f"⏳ {endpoint} service unavailable, retrying...")
                    time.sleep(10)
                    continue
                else:
                    logger.error(f"❌ {endpoint} failed: {response.status_code} - {response.text}")
                    break
                    
            except Exception as e:
                logger.error(f"❌ {endpoint} error (attempt {attempt + 1}): {str(e)}")
                if attempt < EXPORT_CONFIG['retry_attempts'] - 1:
                    time.sleep(5)
                    
        return None
    
    def export_standard_endpoints(self):
        """Export the original 19 standard endpoints"""
        
        logger.info("📊 Exporting 19 standard endpoints...")
        
        standard_endpoints = {
            'strategic-analysis': {
                'endpoint': '/strategic-analysis', 
                'payload': {
                    "query": "Strategic market analysis for expansion opportunities",
                    "analysis_type": "strategic-analysis",
                    "target_variable": TARGET_VARIABLE,
                    "include_shap": True,
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'competitive-analysis': {
                'endpoint': '/competitive-analysis',
                'payload': {
                    "query": "Brand competition analysis across market areas",
                    "analysis_type": "competitive-analysis", 
                    "target_variable": TARGET_VARIABLE,
                    "include_shap": True,
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'demographic-insights': {
                'endpoint': '/demographic-insights',
                'payload': {
                    "query": "Demographic patterns and population insights",
                    "analysis_type": "demographic-insights",
                    "target_variable": TARGET_VARIABLE,
                    "include_shap": True,
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'correlation-analysis': {
                'endpoint': '/correlation-analysis',
                'payload': {
                    "query": "Statistical correlations and variable relationships",
                    "analysis_type": "correlation-analysis", 
                    "target_variable": TARGET_VARIABLE,
                    "include_shap": True,
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'predictive-modeling': {
                'endpoint': '/predictive-modeling',
                'payload': {
                    "query": "Advanced forecasting and predictive analysis",
                    "analysis_type": "predictive-modeling",
                    "target_variable": TARGET_VARIABLE, 
                    "include_shap": True,
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'anomaly-detection': {
                'endpoint': '/anomaly-detection',
                'payload': {
                    "query": "Statistical outliers and anomaly identification",
                    "analysis_type": "anomaly-detection",
                    "include_shap": False,  # Unsupervised
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'trend-analysis': {
                'endpoint': '/trend-analysis',
                'payload': {
                    "query": "Temporal patterns and trend identification",
                    "analysis_type": "trend-analysis",
                    "target_variable": TARGET_VARIABLE,
                    "include_shap": True,
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'spatial-clusters': {
                'endpoint': '/spatial-clusters', 
                'payload': {
                    "query": "Geographic clustering and spatial patterns",
                    "analysis_type": "spatial-clusters",
                    "include_shap": False,  # Spatial clustering
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'scenario-analysis': {
                'endpoint': '/scenario-analysis',
                'payload': {
                    "query": "What-if scenarios and sensitivity analysis",
                    "analysis_type": "scenario-analysis",
                    "target_variable": TARGET_VARIABLE,
                    "include_shap": True,
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'segment-profiling': {
                'endpoint': '/segment-profiling',
                'payload': {
                    "query": "Market segmentation and customer profiling", 
                    "analysis_type": "segment-profiling",
                    "target_variable": TARGET_VARIABLE,
                    "include_shap": True,
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'sensitivity-analysis': {
                'endpoint': '/sensitivity-analysis',
                'payload': {
                    "query": "Parameter sensitivity and impact analysis",
                    "analysis_type": "sensitivity-analysis",
                    "target_variable": TARGET_VARIABLE,
                    "include_shap": True,
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'feature-interactions': {
                'endpoint': '/feature-interactions',
                'payload': {
                    "query": "Variable interactions and feature combinations",
                    "analysis_type": "feature-interactions", 
                    "target_variable": TARGET_VARIABLE,
                    "include_shap": True,
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'feature-importance-ranking': {
                'endpoint': '/feature-importance-ranking',
                'payload': {
                    "query": "Feature importance rankings and contributions",
                    "analysis_type": "feature-importance-ranking",
                    "target_variable": TARGET_VARIABLE,
                    "include_shap": True,
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'model-performance': {
                'endpoint': '/model-performance',
                'payload': {
                    "query": "ML model metrics and performance evaluation",
                    "analysis_type": "model-performance",
                    "target_variable": TARGET_VARIABLE,
                    "include_shap": True,
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'outlier-detection': {
                'endpoint': '/outlier-detection', 
                'payload': {
                    "query": "Data outliers and exceptional cases",
                    "analysis_type": "outlier-detection",
                    "include_shap": False,  # Outlier detection
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'analyze': {
                'endpoint': '/analyze',
                'payload': {
                    "query": "General comprehensive analysis",
                    "analysis_type": "analyze", 
                    "target_variable": TARGET_VARIABLE,
                    "include_shap": True,
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'comparative-analysis': {
                'endpoint': '/comparative-analysis',
                'payload': {
                    "query": "Geographic and demographic comparisons",
                    "analysis_type": "comparative-analysis",
                    "target_variable": TARGET_VARIABLE,
                    "include_shap": True,
                    "limit": EXPORT_CONFIG['max_records']
                }
            }
        }
        
        # Export each standard endpoint
        for endpoint_name, config in standard_endpoints.items():
            logger.info(f"   📥 Exporting {endpoint_name}...")
            
            result = self.call_endpoint(config['endpoint'], config['payload'])
            
            if result:
                # Add metadata
                result['endpoint_type'] = 'standard'
                result['export_timestamp'] = datetime.now().isoformat()
                
                # Save to file
                output_file = self.output_dir / f"{endpoint_name}.json"
                with open(output_file, 'w') as f:
                    json.dump(result, f, indent=2)
                
                record_count = len(result.get('results', []))
                logger.info(f"   ✅ {endpoint_name}: {record_count} records saved")
                self.results[endpoint_name] = {'status': 'success', 'records': record_count}
            else:
                logger.error(f"   ❌ {endpoint_name}: Export failed")
                self.results[endpoint_name] = {'status': 'failed', 'records': 0}
                self.errors.append(endpoint_name)
    
    def export_comprehensive_endpoints(self):
        """Export the 7 new comprehensive model endpoints"""
        
        logger.info("🧠 Exporting 7 comprehensive model endpoints...")
        
        comprehensive_endpoints = {
            'algorithm-comparison': {
                'endpoint': '/algorithm-comparison',
                'payload': {
                    "query": "Compare performance across 8 supervised algorithms",
                    "analysis_type": "algorithm-comparison",
                    "target_variable": TARGET_VARIABLE,
                    "include_shap": True,
                    "include_confidence": True,
                    "algorithms": ["xgboost", "random_forest", "svr", "linear_regression", 
                                 "knn", "neural_network", "ridge_regression", "lasso_regression"],
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'ensemble-analysis': {
                'endpoint': '/ensemble-analysis', 
                'payload': {
                    "query": "High-accuracy ensemble predictions and analysis",
                    "analysis_type": "ensemble-analysis",
                    "target_variable": TARGET_VARIABLE,
                    "include_shap": True,
                    "include_component_weights": True,
                    "include_confidence_intervals": True,
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'model-selection': {
                'endpoint': '/model-selection',
                'payload': {
                    "query": "Dynamic algorithm recommendations per geographic area",
                    "analysis_type": "model-selection", 
                    "target_variable": TARGET_VARIABLE,
                    "include_performance_metrics": True,
                    "include_recommendations": True,
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'cluster-analysis': {
                'endpoint': '/cluster-analysis',
                'payload': {
                    "query": "Advanced market segmentation through geographic clustering",
                    "analysis_type": "cluster-analysis",
                    "n_clusters": 8,
                    "include_cluster_profiles": True,
                    "include_silhouette_scores": True,
                    "include_centroids": True,
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'anomaly-insights': {
                'endpoint': '/anomaly-insights',
                'payload': {
                    "query": "Enhanced anomaly detection with detailed explanations",
                    "analysis_type": "anomaly-insights", 
                    "contamination": 0.1,
                    "include_anomaly_explanations": True,
                    "include_opportunity_ratings": True,
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'dimensionality-insights': {
                'endpoint': '/dimensionality-insights',
                'payload': {
                    "query": "Feature space analysis and dimensionality reduction",
                    "analysis_type": "dimensionality-insights",
                    "n_components": 10,
                    "include_loadings": True,
                    "include_variance_explained": True,
                    "limit": EXPORT_CONFIG['max_records']
                }
            },
            'consensus-analysis': {
                'endpoint': '/consensus-analysis',
                'payload': {
                    "query": "Multi-model consensus with uncertainty quantification",
                    "analysis_type": "consensus-analysis",
                    "target_variable": TARGET_VARIABLE,
                    "models": ["xgboost", "svr", "random_forest", "ensemble"],
                    "include_voting": True,
                    "include_uncertainty": True,
                    "include_confidence_intervals": True,
                    "limit": EXPORT_CONFIG['max_records']
                }
            }
        }
        
        # Export each comprehensive endpoint
        for endpoint_name, config in comprehensive_endpoints.items():
            logger.info(f"   🧠 Exporting {endpoint_name}...")
            
            result = self.call_endpoint(config['endpoint'], config['payload'])
            
            if result:
                # Add metadata
                result['endpoint_type'] = 'comprehensive'
                result['export_timestamp'] = datetime.now().isoformat()
                result['model_architecture'] = '17-model-comprehensive'
                
                # Save to file
                output_file = self.output_dir / f"{endpoint_name}.json"
                with open(output_file, 'w') as f:
                    json.dump(result, f, indent=2)
                
                record_count = len(result.get('results', []))
                logger.info(f"   ✅ {endpoint_name}: {record_count} records saved")
                self.results[endpoint_name] = {'status': 'success', 'records': record_count}
            else:
                logger.error(f"   ❌ {endpoint_name}: Export failed") 
                self.results[endpoint_name] = {'status': 'failed', 'records': 0}
                self.errors.append(endpoint_name)
    
    def generate_summary_report(self):
        """Generate a comprehensive export summary"""
        
        summary = {
            'export_timestamp': datetime.now().isoformat(),
            'microservice_url': MICROSERVICE_URL,
            'target_variable': TARGET_VARIABLE,
            'total_endpoints': len(self.results),
            'successful_exports': len([r for r in self.results.values() if r['status'] == 'success']),
            'failed_exports': len(self.errors),
            'total_records_exported': sum(r['records'] for r in self.results.values()),
            'endpoint_results': self.results,
            'failed_endpoints': self.errors,
            'export_config': EXPORT_CONFIG,
            'model_architecture': {
                'total_models': 17,
                'supervised_models': 8,
                'unsupervised_models': 3, 
                'specialized_models': 6,
                'ensemble_performance': 'R² = 0.879'
            }
        }
        
        # Save summary
        summary_file = self.output_dir / 'export_summary.json'
        with open(summary_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        # Print summary
        logger.info("📋 Export Summary:")
        logger.info(f"   ✅ Successful: {summary['successful_exports']}/{summary['total_endpoints']} endpoints")
        logger.info(f"   📊 Total records: {summary['total_records_exported']:,}")
        logger.info(f"   ⏱️ Export time: {datetime.now().isoformat()}")
        
        if self.errors:
            logger.warning(f"   ❌ Failed endpoints: {', '.join(self.errors)}")
        
        return summary

def main():
    """Main export function"""
    
    logger.info("🚀 Starting Comprehensive Endpoint Export (26 Endpoints)")
    logger.info(f"   🎯 Target Variable: {TARGET_VARIABLE}")
    logger.info(f"   📡 Microservice: {MICROSERVICE_URL}")
    logger.info(f"   📁 Output Directory: {EXPORT_CONFIG['output_dir']}")
    
    # Validate configuration
    if not MICROSERVICE_URL or MICROSERVICE_URL == "https://your-project-shap.onrender.com":
        logger.error("❌ Please update MICROSERVICE_URL with your actual microservice URL")
        return
    
    exporter = ComprehensiveEndpointExporter()
    
    try:
        # Export all endpoints
        exporter.export_standard_endpoints()
        exporter.export_comprehensive_endpoints()
        
        # Generate summary
        summary = exporter.generate_summary_report()
        
        logger.info("🎉 Comprehensive endpoint export completed!")
        logger.info(f"   📊 {summary['successful_exports']}/{summary['total_endpoints']} endpoints exported successfully")
        logger.info(f"   📁 Files saved to: {EXPORT_CONFIG['output_dir']}")
        
        if summary['failed_exports'] == 0:
            logger.info("✨ All endpoints exported successfully! Ready for client integration.")
        else:
            logger.warning(f"⚠️ {summary['failed_exports']} endpoints failed. Check microservice status.")
            
    except Exception as e:
        logger.error(f"❌ Export failed with error: {str(e)}")
        raise

if __name__ == "__main__":
    main()