#!/usr/bin/env python3
"""
Model Utilization Analyzer
Analyze how efficiently we're using all 17 available AI models across 26 endpoints
"""

def analyze_model_utilization():
    """Analyze which models are used and how to maximize value from all 17 models"""
    
    # Define all 17 available models
    all_models = {
        # 6 Specialized Analysis Models
        'strategic_analysis': {'type': 'specialized', 'r2_score': 0.608, 'strength': 'Business strategy insights'},
        'competitive_analysis': {'type': 'specialized', 'r2_score': 0.608, 'strength': 'Market competition analysis'},
        'demographic_analysis': {'type': 'specialized', 'r2_score': 0.608, 'strength': 'Population insights'},
        'correlation_analysis': {'type': 'specialized', 'r2_score': 0.608, 'strength': 'Variable relationships'},
        'predictive_modeling': {'type': 'specialized', 'r2_score': 0.608, 'strength': 'Advanced forecasting'},
        'ensemble': {'type': 'specialized', 'r2_score': 0.879, 'strength': 'Best overall performance'},
        
        # 8 Algorithm Diversity Models
        'xgboost': {'type': 'algorithm', 'r2_score': 0.608, 'strength': 'Gradient boosting, feature importance'},
        'random_forest': {'type': 'algorithm', 'r2_score': 0.513, 'strength': 'Ensemble trees, overfitting resistance'},
        'svr': {'type': 'algorithm', 'r2_score': 0.609, 'strength': 'Non-linear relationships'},
        'linear_regression': {'type': 'algorithm', 'r2_score': 0.297, 'strength': 'Interpretability, speed'},
        'ridge_regression': {'type': 'algorithm', 'r2_score': 0.349, 'strength': 'Regularization, multicollinearity'},
        'lasso_regression': {'type': 'algorithm', 'r2_score': 0.265, 'strength': 'Feature selection, sparsity'},
        'knn': {'type': 'algorithm', 'r2_score': 0.471, 'strength': 'Instance-based, local patterns'},
        'neural_network': {'type': 'algorithm', 'r2_score': 0.284, 'strength': 'Deep learning, complex patterns'},
        
        # 3 Unsupervised Models
        'anomaly_detection': {'type': 'unsupervised', 'r2_score': None, 'strength': 'Outlier identification'},
        'clustering': {'type': 'unsupervised', 'r2_score': None, 'strength': 'Market segmentation'},
        'dimensionality_reduction': {'type': 'unsupervised', 'r2_score': None, 'strength': 'Feature space analysis'}
    }
    
    # Updated model assignments from endpoints (OPTIMIZED)
    current_assignments = {
        # Standard endpoints (19)
        'strategic-analysis': 'strategic_analysis',
        'competitive-analysis': 'competitive_analysis', 
        'demographic-insights': 'demographic_analysis',
        'correlation-analysis': 'correlation_analysis',
        'predictive-modeling': 'predictive_modeling',
        'trend-analysis': 'xgboost',
        'spatial-clusters': 'clustering',
        'anomaly-detection': 'anomaly_detection',
        'scenario-analysis': 'ensemble',
        'segment-profiling': 'clustering',
        'sensitivity-analysis': 'random_forest',
        'feature-interactions': 'xgboost',
        'feature-importance-ranking': 'ensemble',
        'model-performance': 'ensemble',
        'outlier-detection': 'anomaly_detection',
        'analyze': 'ensemble',
        'comparative-analysis': 'ensemble',
        'brand-difference': 'competitive_analysis',
        'customer-profile': 'demographic_analysis',
        
        # Original comprehensive endpoints (7)
        'algorithm-comparison': 'ensemble',  # BUT uses ALL 8 algorithms as secondary
        'ensemble-analysis': 'ensemble',
        'model-selection': 'ensemble',
        'cluster-analysis': 'clustering',
        'anomaly-insights': 'anomaly_detection',
        'dimensionality-insights': 'dimensionality_reduction',
        'consensus-analysis': 'ensemble',
        
        # NEW comprehensive endpoints (6) - UTILIZING ALL PREVIOUSLY UNUSED MODELS  
        'nonlinear-analysis': 'svr',
        'similarity-analysis': 'knn', 
        'feature-selection-analysis': 'lasso_regression',
        'interpretability-analysis': 'ridge_regression',  # Also uses linear_regression as secondary
        'neural-network-analysis': 'neural_network',
        'speed-optimized-analysis': 'linear_regression'
    }
    
    # Count model usage
    model_usage = {}
    for endpoint, model in current_assignments.items():
        model_usage[model] = model_usage.get(model, 0) + 1
    
    # Identify unused models
    used_models = set(current_assignments.values())
    unused_models = set(all_models.keys()) - used_models
    
    # Generate analysis report
    print("🔍 MODEL UTILIZATION ANALYSIS")
    print("=" * 60)
    
    print("\n📊 CURRENT MODEL USAGE:")
    for model, count in sorted(model_usage.items(), key=lambda x: x[1], reverse=True):
        model_info = all_models[model]
        r2_str = f"R² = {model_info['r2_score']:.3f}" if model_info['r2_score'] else "Unsupervised"
        print(f"   {model}: {count} endpoints ({r2_str}) - {model_info['strength']}")
    
    print(f"\n❌ UNUSED MODELS ({len(unused_models)}):")
    for model in sorted(unused_models):
        model_info = all_models[model]
        r2_str = f"R² = {model_info['r2_score']:.3f}" if model_info['r2_score'] else "Unsupervised"
        print(f"   {model}: ({r2_str}) - {model_info['strength']}")
    
    print(f"\n📈 UTILIZATION SUMMARY:")
    print(f"   • Used models: {len(used_models)}/17 ({len(used_models)/17*100:.1f}%)")
    print(f"   • Unused models: {len(unused_models)}/17 ({len(unused_models)/17*100:.1f}%)")
    
    # Performance analysis
    print(f"\n🏆 PERFORMANCE TIER USAGE:")
    excellent_models = [m for m in used_models if all_models[m]['r2_score'] and all_models[m]['r2_score'] >= 0.80]
    good_models = [m for m in used_models if all_models[m]['r2_score'] and 0.60 <= all_models[m]['r2_score'] < 0.80]
    moderate_models = [m for m in used_models if all_models[m]['r2_score'] and 0.40 <= all_models[m]['r2_score'] < 0.60]
    poor_models = [m for m in used_models if all_models[m]['r2_score'] and all_models[m]['r2_score'] < 0.40]
    
    print(f"   • Excellent (R² ≥ 0.80): {len(excellent_models)} models - {excellent_models}")
    print(f"   • Good (0.60 ≤ R² < 0.80): {len(good_models)} models - {good_models}")
    print(f"   • Moderate (0.40 ≤ R² < 0.60): {len(moderate_models)} models - {moderate_models}")
    print(f"   • Poor (R² < 0.40): {len(poor_models)} models - {poor_models}")
    
    return {
        'all_models': all_models,
        'current_assignments': current_assignments,
        'model_usage': model_usage,
        'used_models': used_models,
        'unused_models': unused_models,
        'utilization_rate': len(used_models)/17
    }

def generate_optimization_recommendations(analysis):
    """Generate recommendations for maximizing model utilization"""
    
    print("\n🚀 OPTIMIZATION RECOMMENDATIONS:")
    print("=" * 60)
    
    unused_models = analysis['unused_models']
    all_models = analysis['all_models']
    
    recommendations = []
    
    # 1. Create specialized endpoints for unused high-performance models
    high_perf_unused = [m for m in unused_models if all_models[m]['r2_score'] and all_models[m]['r2_score'] >= 0.50]
    
    if high_perf_unused:
        print(f"\n1. 📊 CREATE NEW ENDPOINTS FOR HIGH-PERFORMANCE UNUSED MODELS:")
        for model in high_perf_unused:
            model_info = all_models[model]
            if model == 'svr':
                print(f"   • SVR Endpoint: Non-linear pattern analysis (R² = {model_info['r2_score']:.3f})")
                recommendations.append({
                    'type': 'new_endpoint',
                    'model': 'svr',
                    'endpoint_name': 'nonlinear-analysis',
                    'description': 'Advanced non-linear pattern detection using Support Vector Regression'
                })
            elif model == 'knn':
                print(f"   • KNN Endpoint: Similarity-based market analysis (R² = {model_info['r2_score']:.3f})")
                recommendations.append({
                    'type': 'new_endpoint', 
                    'model': 'knn',
                    'endpoint_name': 'similarity-analysis',
                    'description': 'Find markets similar to high-performing areas using K-Nearest Neighbors'
                })
    
    # 2. Multi-model endpoints for comprehensive analysis
    print(f"\n2. 🎯 ENHANCE EXISTING ENDPOINTS WITH MULTI-MODEL APPROACH:")
    
    # Algorithm comparison could use all supervised models
    supervised_unused = [m for m in unused_models if all_models[m]['type'] == 'algorithm']
    if supervised_unused:
        print(f"   • Algorithm Comparison: Add {len(supervised_unused)} unused algorithms as secondary models")
        for model in supervised_unused:
            print(f"     - {model}: {all_models[model]['strength']}")
    
    # 3. Performance-based routing
    print(f"\n3. 🧠 INTELLIGENT MODEL SELECTION SYSTEM:")
    print(f"   • High-stakes analysis → ensemble model (R² = 0.879)")
    print(f"   • Speed-critical analysis → linear_regression (fastest)")
    print(f"   • Feature selection → lasso_regression (automatic feature selection)")
    print(f"   • Interpretability focus → ridge_regression (stable coefficients)")
    
    # 4. Specialized use cases
    print(f"\n4. 🎨 SPECIALIZED USE CASE OPTIMIZATION:")
    
    underutilized = [m for m, count in analysis['model_usage'].items() if count == 1]
    if underutilized:
        print(f"   • Underutilized models (used only once):")
        for model in underutilized:
            print(f"     - {model}: Could power additional specialized endpoints")
    
    # 5. Ensemble diversification
    print(f"\n5. 🏆 ENSEMBLE MODEL ENHANCEMENT:")
    print(f"   • Current: Uses top-performing models")
    print(f"   • Opportunity: Include diverse algorithms for robustness")
    print(f"   • Add: neural_network, knn, svr for non-linear patterns")
    
    return recommendations

def generate_implementation_plan(recommendations):
    """Generate actionable implementation plan"""
    
    print(f"\n⚡ IMPLEMENTATION PLAN:")
    print("=" * 60)
    
    print(f"\n🔥 HIGH IMPACT - QUICK WINS:")
    print(f"1. Add 'similarity-analysis' endpoint using KNN model")
    print(f"2. Add 'nonlinear-analysis' endpoint using SVR model") 
    print(f"3. Enhance 'algorithm-comparison' with all 8 supervised models")
    print(f"4. Create 'feature-selection-analysis' endpoint using Lasso model")
    
    print(f"\n⚙️ MEDIUM IMPACT - STRATEGIC IMPROVEMENTS:")
    print(f"1. Add model performance routing to existing endpoints")
    print(f"2. Create 'interpretability-analysis' using Ridge + Linear models")
    print(f"3. Enhance ensemble model with more algorithm diversity")
    print(f"4. Add uncertainty quantification using model agreement")
    
    print(f"\n🎯 LOW IMPACT - NICE TO HAVE:")
    print(f"1. Create specialized neural network endpoint for complex patterns")
    print(f"2. Add multi-model voting system for critical decisions")
    print(f"3. Create model recommendation engine per geographic area")
    
    print(f"\n📋 CODE CHANGES NEEDED:")
    print(f"1. Update comprehensive_endpoint_generator.py endpoint configurations")
    print(f"2. Add new scoring algorithms to automated_score_calculator.py")
    print(f"3. Update analysis prompts for new endpoint types")
    print(f"4. Add model routing logic for performance-based selection")

if __name__ == "__main__":
    print("🤖 ANALYZING MODEL UTILIZATION ACROSS 17 AI MODELS")
    analysis = analyze_model_utilization()
    
    recommendations = generate_optimization_recommendations(analysis)
    generate_implementation_plan(recommendations)
    
    print(f"\n✅ ANALYSIS COMPLETE!")
    print(f"Current utilization: {analysis['utilization_rate']*100:.1f}%")
    print(f"Optimization potential: {(1-analysis['utilization_rate'])*100:.1f}% improvement available")