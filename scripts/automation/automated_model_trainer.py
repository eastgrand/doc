#!/usr/bin/env python3
"""
Automated Model Trainer - XGBoost model training with SHAP integration
Part of the ArcGIS to Microservice Automation Pipeline
"""

import pandas as pd
import numpy as np
import json
import xgboost as xgb
import shap
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.ensemble import RandomForestRegressor
import joblib
from typing import Dict, List, Tuple, Any, Optional
from datetime import datetime
import logging
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
warnings.filterwarnings('ignore')

class AutomatedModelTrainer:
    """
    Automated machine learning pipeline for training XGBoost models
    with SHAP integration and comprehensive model evaluation
    """
    
    def __init__(self, output_dir: str = "trained_models"):
        """
        Initialize the automated trainer
        
        Args:
            output_dir: Directory to save trained models and results
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True, parents=True)
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Model training configuration
        self.config = {
            'test_size': 0.2,
            'validation_size': 0.2,
            'random_state': 42,
            'cv_folds': 5,
            'n_jobs': -1
        }
        
        # XGBoost hyperparameter grid
        self.xgb_param_grid = {
            'max_depth': [3, 4, 5, 6],
            'learning_rate': [0.01, 0.05, 0.1, 0.2],
            'n_estimators': [100, 200, 300, 500],
            'subsample': [0.8, 0.9, 1.0],
            'colsample_bytree': [0.8, 0.9, 1.0],
            'reg_alpha': [0, 0.1, 1],
            'reg_lambda': [1, 1.5, 2]
        }
        
        # Model artifacts
        self.models = {}
        self.scalers = {}
        self.label_encoders = {}
        self.feature_importance = {}
        self.shap_values = {}
        self.training_history = []
        
    def train_comprehensive_models(self, data_file: str, 
                                 target_mappings: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Train comprehensive models for different analysis types
        
        Args:
            data_file: Path to the combined CSV data file
            target_mappings: Optional mapping of analysis types to target columns
            
        Returns:
            Training results summary
        """
        self.logger.info("🚀 Starting comprehensive model training pipeline...")
        
        # Load and prepare data
        data = pd.read_csv(data_file)
        self.logger.info(f"📊 Loaded {len(data)} records with {len(data.columns)} columns")
        
        # Define default target mappings if not provided
        if not target_mappings:
            target_mappings = self._detect_target_variables(data)
        
        results = {}
        
        # Train models for each analysis type
        for analysis_type, target_column in target_mappings.items():
            self.logger.info(f"🎯 Training {analysis_type} model with target: {target_column}")
            
            try:
                model_result = self.train_single_model(
                    data, target_column, analysis_type
                )
                results[analysis_type] = model_result
                
                self.logger.info(f"✅ {analysis_type} model completed - R²: {model_result['performance']['r2_score']:.3f}")
                
            except Exception as e:
                self.logger.error(f"❌ Failed to train {analysis_type} model: {str(e)}")
                results[analysis_type] = {
                    'success': False,
                    'error': str(e)
                }
        
        # Generate ensemble models
        self.logger.info("🔗 Creating ensemble models...")
        ensemble_results = self._create_ensemble_models(data, target_mappings)
        results['ensemble_models'] = ensemble_results
        
        # Save comprehensive results
        self._save_training_results(results)
        
        # Create model deployment package
        self._create_deployment_package(results)
        
        self.logger.info(f"🎉 Model training completed! Results saved to: {self.output_dir}")
        
        return results
    
    def train_single_model(self, data: pd.DataFrame, target_column: str, 
                          analysis_type: str) -> Dict[str, Any]:
        """
        Train a single XGBoost model with comprehensive evaluation
        
        Args:
            data: Training data
            target_column: Name of target column
            analysis_type: Type of analysis (for naming)
            
        Returns:
            Model training results
        """
        training_start = datetime.now()
        
        # Validate target column exists and has data
        if target_column not in data.columns:
            raise ValueError(f"Target column '{target_column}' not found in data")
        
        # Remove rows with missing target values
        data_clean = data.dropna(subset=[target_column]).copy()
        if len(data_clean) == 0:
            raise ValueError(f"No valid data for target column '{target_column}'")
        
        self.logger.info(f"   📝 Training data: {len(data_clean)} records (removed {len(data) - len(data_clean)} with missing targets)")
        
        # Prepare features and target
        y = data_clean[target_column].values
        
        # Intelligent feature selection
        feature_columns = self._select_features(data_clean, target_column)
        X = data_clean[feature_columns].copy()
        
        self.logger.info(f"   🎯 Selected {len(feature_columns)} features for training")
        
        # Feature engineering
        X_processed = self._engineer_features(X, analysis_type)
        
        # Handle missing values and encode categorical variables
        X_processed = self._preprocess_features(X_processed, analysis_type)
        
        # Split data
        X_train, X_temp, y_train, y_temp = train_test_split(
            X_processed, y, test_size=self.config['test_size'] + self.config['validation_size'],
            random_state=self.config['random_state']
        )
        
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp, test_size=0.5,
            random_state=self.config['random_state']
        )
        
        self.logger.info(f"   📊 Data split - Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")
        
        # Hyperparameter tuning
        self.logger.info("   🔧 Optimizing hyperparameters...")
        best_params = self._optimize_hyperparameters(X_train, y_train, X_val, y_val)
        
        # Train final model
        self.logger.info("   🎯 Training final model...")
        model = xgb.XGBRegressor(**best_params, random_state=self.config['random_state'])
        model.fit(X_train, y_train)
        
        # Model evaluation
        performance = self._evaluate_model(model, X_test, y_test, X_train, y_train)
        
        # Feature importance analysis
        feature_importance = self._analyze_feature_importance(model, feature_columns)
        
        # SHAP analysis
        self.logger.info("   🔍 Computing SHAP values...")
        shap_analysis = self._compute_shap_values(model, X_train, X_test, feature_columns)
        
        # Cross-validation
        cv_scores = self._cross_validate_model(model, X_processed, y)
        
        # Save model artifacts
        model_artifacts = self._save_model_artifacts(
            model, feature_columns, analysis_type, best_params
        )
        
        training_duration = (datetime.now() - training_start).total_seconds()
        
        return {
            'success': True,
            'analysis_type': analysis_type,
            'target_column': target_column,
            'training_duration_seconds': training_duration,
            'data_info': {
                'total_records': len(data_clean),
                'features_used': len(feature_columns),
                'train_records': len(X_train),
                'test_records': len(X_test)
            },
            'best_hyperparameters': best_params,
            'performance': performance,
            'feature_importance': feature_importance,
            'shap_analysis': shap_analysis,
            'cross_validation': cv_scores,
            'model_artifacts': model_artifacts,
            'feature_columns': feature_columns
        }
    
    def _detect_target_variables(self, data: pd.DataFrame) -> Dict[str, str]:
        """Automatically detect potential target variables for different analysis types"""
        
        target_mappings = {}
        
        # Define patterns for different analysis types
        target_patterns = {
            'strategic_analysis': [
                'strategic_score', 'strategic_value', 'investment_score', 
                'opportunity_score', 'strategic_rank'
            ],
            'competitive_analysis': [
                'nike_share', 'adidas_share', 'puma_share', 'market_share',
                'competition_index', 'competitive_advantage'
            ],
            'demographic_analysis': [
                'demographic_score', 'population_index', 'demo_value',
                'demographic_rank'
            ],
            'correlation_analysis': [
                'correlation_score', 'correlation_value', 'corr_index'
            ],
            'predictive_modeling': [
                'predictive_score', 'forecast_value', 'prediction_index'
            ]
        }
        
        # Find matching columns
        for analysis_type, patterns in target_patterns.items():
            for pattern in patterns:
                matching_cols = [col for col in data.columns if pattern.lower() in col.lower()]
                if matching_cols:
                    # Pick the first matching column with sufficient data
                    for col in matching_cols:
                        if data[col].count() / len(data) > 0.5:  # At least 50% non-null
                            target_mappings[analysis_type] = col
                            break
                    if analysis_type in target_mappings:
                        break
        
        # If no specific targets found, try to find generic score/value columns
        if not target_mappings:
            generic_patterns = ['score', 'value', 'index', 'rank']
            numeric_cols = data.select_dtypes(include=[np.number]).columns
            
            for pattern in generic_patterns:
                matching_cols = [
                    col for col in numeric_cols 
                    if pattern in col.lower() and data[col].count() / len(data) > 0.5
                ]
                if matching_cols:
                    target_mappings['general_analysis'] = matching_cols[0]
                    break
        
        self.logger.info(f"🎯 Detected target variables: {target_mappings}")
        return target_mappings
    
    def _select_features(self, data: pd.DataFrame, target_column: str) -> List[str]:
        """Intelligent feature selection based on correlation and domain knowledge"""
        
        # Exclude target and non-informative columns
        exclude_patterns = [
            'id', 'objectid', '_layer_id', '_layer_name', 'description', 
            'name', target_column.lower()
        ]
        
        potential_features = []
        for col in data.columns:
            if col != target_column:
                col_lower = col.lower()
                if not any(pattern in col_lower for pattern in exclude_patterns):
                    # Only include numeric columns or categorical with reasonable cardinality
                    if pd.api.types.is_numeric_dtype(data[col]):
                        potential_features.append(col)
                    elif data[col].nunique() <= 20:  # Low cardinality categorical
                        potential_features.append(col)
        
        # Correlation-based feature selection
        if len(potential_features) > 50:  # Too many features, select best ones
            numeric_data = data[potential_features + [target_column]].select_dtypes(include=[np.number])
            correlations = numeric_data.corr()[target_column].abs().sort_values(ascending=False)
            
            # Select top correlated features
            top_features = correlations.head(min(50, len(correlations) - 1)).index.tolist()
            if target_column in top_features:
                top_features.remove(target_column)
            
            potential_features = top_features
        
        self.logger.info(f"   📋 Selected {len(potential_features)} features from {len(data.columns)} total columns")
        return potential_features
    
    def _engineer_features(self, X: pd.DataFrame, analysis_type: str) -> pd.DataFrame:
        """Create domain-specific engineered features"""
        
        X_engineered = X.copy()
        
        # Brand analysis specific features
        if analysis_type == 'competitive_analysis':
            brand_columns = [col for col in X.columns if any(brand in col.lower() for brand in ['nike', 'adidas', 'puma'])]
            if len(brand_columns) >= 2:
                # Create brand competition ratios
                for i, col1 in enumerate(brand_columns):
                    for col2 in brand_columns[i+1:]:
                        if pd.api.types.is_numeric_dtype(X[col1]) and pd.api.types.is_numeric_dtype(X[col2]):
                            ratio_name = f"{col1.split('_')[0]}_{col2.split('_')[0]}_ratio"
                            X_engineered[ratio_name] = (X[col1] + 1e-6) / (X[col2] + 1e-6)
        
        # Demographic analysis features
        if analysis_type == 'demographic_analysis':
            demo_columns = [col for col in X.columns if any(demo in col.lower() for demo in ['pop', 'age', 'income', 'household'])]
            if len(demo_columns) >= 2:
                # Create demographic indices
                numeric_demo = X[demo_columns].select_dtypes(include=[np.number])
                if len(numeric_demo.columns) > 1:
                    X_engineered['demo_index'] = numeric_demo.mean(axis=1)
        
        # General feature engineering
        numeric_cols = X_engineered.select_dtypes(include=[np.number]).columns
        
        if len(numeric_cols) >= 2:
            # Create polynomial features for top correlated pairs
            correlations = X_engineered[numeric_cols].corr()
            high_corr_pairs = []
            
            for i, col1 in enumerate(numeric_cols):
                for col2 in numeric_cols[i+1:]:
                    if abs(correlations.loc[col1, col2]) > 0.5:
                        high_corr_pairs.append((col1, col2))
            
            # Create interaction features for top 5 pairs
            for col1, col2 in high_corr_pairs[:5]:
                X_engineered[f"{col1}_x_{col2}"] = X_engineered[col1] * X_engineered[col2]
        
        return X_engineered
    
    def _preprocess_features(self, X: pd.DataFrame, analysis_type: str) -> pd.DataFrame:
        """Preprocess features: handle missing values, encode categoricals, scale"""
        
        X_processed = X.copy()
        
        # Handle missing values
        for col in X_processed.columns:
            if X_processed[col].dtype == 'object':
                # Categorical: fill with mode or 'Unknown'
                mode_val = X_processed[col].mode()
                fill_val = mode_val[0] if len(mode_val) > 0 else 'Unknown'
                X_processed[col].fillna(fill_val, inplace=True)
            else:
                # Numeric: fill with median
                X_processed[col].fillna(X_processed[col].median(), inplace=True)
        
        # Encode categorical variables
        categorical_cols = X_processed.select_dtypes(include=['object']).columns
        
        if len(categorical_cols) > 0:
            if analysis_type not in self.label_encoders:
                self.label_encoders[analysis_type] = {}
            
            for col in categorical_cols:
                if col not in self.label_encoders[analysis_type]:
                    self.label_encoders[analysis_type][col] = LabelEncoder()
                
                X_processed[col] = self.label_encoders[analysis_type][col].fit_transform(X_processed[col].astype(str))
        
        # Scale features (optional for XGBoost, but helps with feature importance interpretation)
        if analysis_type not in self.scalers:
            self.scalers[analysis_type] = StandardScaler()
        
        numeric_cols = X_processed.select_dtypes(include=[np.number]).columns
        X_processed[numeric_cols] = self.scalers[analysis_type].fit_transform(X_processed[numeric_cols])
        
        return X_processed
    
    def _optimize_hyperparameters(self, X_train: pd.DataFrame, y_train: np.ndarray,
                                 X_val: pd.DataFrame, y_val: np.ndarray) -> Dict[str, Any]:
        """Optimize XGBoost hyperparameters using grid search with early stopping"""
        
        # Simplified grid for faster training
        simplified_grid = {
            'max_depth': [3, 4, 5],
            'learning_rate': [0.05, 0.1, 0.2],
            'n_estimators': [100, 200, 300],
            'subsample': [0.8, 1.0],
            'colsample_bytree': [0.8, 1.0]
        }
        
        # Create base model
        base_model = xgb.XGBRegressor(
            random_state=self.config['random_state'],
            n_jobs=self.config['n_jobs']
        )
        
        # Grid search with cross-validation
        grid_search = GridSearchCV(
            estimator=base_model,
            param_grid=simplified_grid,
            cv=3,  # Reduced for speed
            scoring='r2',
            n_jobs=self.config['n_jobs'],
            verbose=0
        )
        
        grid_search.fit(X_train, y_train)
        
        # Validate on validation set
        val_score = grid_search.best_estimator_.score(X_val, y_val)
        
        self.logger.info(f"      Best CV score: {grid_search.best_score_:.3f}")
        self.logger.info(f"      Validation score: {val_score:.3f}")
        
        return grid_search.best_params_
    
    def _evaluate_model(self, model: xgb.XGBRegressor, X_test: pd.DataFrame, y_test: np.ndarray,
                       X_train: pd.DataFrame, y_train: np.ndarray) -> Dict[str, float]:
        """Comprehensive model evaluation"""
        
        # Predictions
        y_pred_test = model.predict(X_test)
        y_pred_train = model.predict(X_train)
        
        # Test set metrics
        test_r2 = r2_score(y_test, y_pred_test)
        test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
        test_mae = mean_absolute_error(y_test, y_pred_test)
        
        # Training set metrics (for overfitting check)
        train_r2 = r2_score(y_train, y_pred_train)
        train_rmse = np.sqrt(mean_squared_error(y_train, y_pred_train))
        
        # Additional metrics
        test_mape = np.mean(np.abs((y_test - y_pred_test) / y_test)) * 100 if np.all(y_test != 0) else float('inf')
        
        return {
            'r2_score': test_r2,
            'rmse': test_rmse,
            'mae': test_mae,
            'mape': test_mape,
            'train_r2': train_r2,
            'train_rmse': train_rmse,
            'overfitting_ratio': train_r2 / test_r2 if test_r2 > 0 else float('inf')
        }
    
    def _analyze_feature_importance(self, model: xgb.XGBRegressor, 
                                  feature_columns: List[str]) -> List[Dict[str, Any]]:
        """Analyze and rank feature importance"""
        
        # Get XGBoost feature importance
        importance_scores = model.feature_importances_
        
        # Create importance rankings
        feature_importance = [
            {
                'feature': feature_columns[i],
                'importance': float(importance_scores[i]),
                'rank': i + 1
            }
            for i in range(len(feature_columns))
        ]
        
        # Sort by importance
        feature_importance.sort(key=lambda x: x['importance'], reverse=True)
        
        # Update ranks
        for i, item in enumerate(feature_importance):
            item['rank'] = i + 1
        
        return feature_importance
    
    def _compute_shap_values(self, model: xgb.XGBRegressor, X_train: pd.DataFrame,
                           X_test: pd.DataFrame, feature_columns: List[str]) -> Dict[str, Any]:
        """Compute SHAP values for model interpretability"""
        
        try:
            # Create SHAP explainer
            explainer = shap.TreeExplainer(model)
            
            # Compute SHAP values for a sample of test data (for speed)
            sample_size = min(100, len(X_test))
            X_sample = X_test.sample(n=sample_size, random_state=42)
            
            shap_values = explainer.shap_values(X_sample)
            
            # Calculate mean absolute SHAP values
            mean_shap_values = np.abs(shap_values).mean(axis=0)
            
            # Create SHAP importance ranking
            shap_importance = [
                {
                    'feature': feature_columns[i],
                    'mean_shap_value': float(mean_shap_values[i]),
                    'rank': i + 1
                }
                for i in range(len(feature_columns))
            ]
            
            # Sort by SHAP importance
            shap_importance.sort(key=lambda x: x['mean_shap_value'], reverse=True)
            
            # Update ranks
            for i, item in enumerate(shap_importance):
                item['rank'] = i + 1
            
            return {
                'shap_importance': shap_importance,
                'sample_size': sample_size,
                'base_value': float(explainer.expected_value)
            }
            
        except Exception as e:
            self.logger.warning(f"SHAP calculation failed: {str(e)}")
            return {
                'error': str(e),
                'shap_importance': []
            }
    
    def _cross_validate_model(self, model: xgb.XGBRegressor, X: pd.DataFrame, 
                             y: np.ndarray) -> Dict[str, float]:
        """Perform cross-validation"""
        
        try:
            cv_scores = cross_val_score(
                model, X, y, 
                cv=self.config['cv_folds'], 
                scoring='r2',
                n_jobs=self.config['n_jobs']
            )
            
            return {
                'mean_cv_score': float(cv_scores.mean()),
                'std_cv_score': float(cv_scores.std()),
                'cv_scores': [float(score) for score in cv_scores]
            }
            
        except Exception as e:
            self.logger.warning(f"Cross-validation failed: {str(e)}")
            return {
                'error': str(e),
                'mean_cv_score': 0.0
            }
    
    def _save_model_artifacts(self, model: xgb.XGBRegressor, feature_columns: List[str],
                            analysis_type: str, hyperparameters: Dict[str, Any]) -> Dict[str, str]:
        """Save all model artifacts"""
        
        model_dir = self.output_dir / f"{analysis_type}_model"
        model_dir.mkdir(exist_ok=True)
        
        # Save model
        model_file = model_dir / "model.joblib"
        joblib.dump(model, model_file)
        
        # Save feature columns
        features_file = model_dir / "features.json"
        with open(features_file, 'w') as f:
            json.dump(feature_columns, f, indent=2)
        
        # Save hyperparameters
        params_file = model_dir / "hyperparameters.json"
        with open(params_file, 'w') as f:
            json.dump(hyperparameters, f, indent=2)
        
        # Save preprocessing objects
        if analysis_type in self.scalers:
            scaler_file = model_dir / "scaler.joblib"
            joblib.dump(self.scalers[analysis_type], scaler_file)
        
        if analysis_type in self.label_encoders:
            encoders_file = model_dir / "label_encoders.joblib"
            joblib.dump(self.label_encoders[analysis_type], encoders_file)
        
        return {
            'model_file': str(model_file),
            'features_file': str(features_file),
            'hyperparameters_file': str(params_file),
            'model_directory': str(model_dir)
        }
    
    def _create_ensemble_models(self, data: pd.DataFrame, 
                              target_mappings: Dict[str, str]) -> Dict[str, Any]:
        """Create ensemble models combining multiple analysis types"""
        
        self.logger.info("   🔗 Training ensemble models...")
        
        # Skip if insufficient models
        if len(target_mappings) < 2:
            return {'message': 'Insufficient models for ensemble creation'}
        
        ensemble_results = {}
        
        # Create multi-target ensemble
        try:
            # Prepare data for multi-target learning
            target_columns = list(target_mappings.values())
            valid_targets = [col for col in target_columns if col in data.columns]
            
            if len(valid_targets) >= 2:
                multi_target_data = data.dropna(subset=valid_targets)
                
                if len(multi_target_data) > 50:  # Minimum data requirement
                    feature_columns = self._select_features(multi_target_data, valid_targets[0])
                    X = multi_target_data[feature_columns]
                    y = multi_target_data[valid_targets]
                    
                    # Simple ensemble: RandomForest for multi-target
                    ensemble_model = RandomForestRegressor(
                        n_estimators=100,
                        random_state=self.config['random_state'],
                        n_jobs=self.config['n_jobs']
                    )
                    
                    X_processed = self._preprocess_features(X, 'ensemble')
                    ensemble_model.fit(X_processed, y)
                    
                    # Save ensemble model
                    ensemble_dir = self.output_dir / "ensemble_model"
                    ensemble_dir.mkdir(exist_ok=True)
                    
                    ensemble_file = ensemble_dir / "ensemble_model.joblib"
                    joblib.dump(ensemble_model, ensemble_file)
                    
                    ensemble_results['multi_target_ensemble'] = {
                        'success': True,
                        'targets': valid_targets,
                        'features': len(feature_columns),
                        'training_records': len(multi_target_data),
                        'model_file': str(ensemble_file)
                    }
        
        except Exception as e:
            self.logger.warning(f"Ensemble model creation failed: {str(e)}")
            ensemble_results['error'] = str(e)
        
        return ensemble_results
    
    def _save_training_results(self, results: Dict[str, Any]) -> None:
        """Save comprehensive training results"""
        
        # Create summary
        summary = {
            'training_timestamp': datetime.now().isoformat(),
            'total_models_trained': len([r for r in results.values() if isinstance(r, dict) and r.get('success')]),
            'models_overview': {}
        }
        
        for analysis_type, result in results.items():
            if isinstance(result, dict) and result.get('success'):
                summary['models_overview'][analysis_type] = {
                    'target_column': result.get('target_column'),
                    'r2_score': result.get('performance', {}).get('r2_score'),
                    'features_used': result.get('data_info', {}).get('features_used'),
                    'training_records': result.get('data_info', {}).get('train_records')
                }
        
        # Save complete results
        results_file = self.output_dir / "training_results.json"
        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        # Save summary
        summary_file = self.output_dir / "training_summary.json"
        with open(summary_file, 'w') as f:
            json.dump(summary, f, indent=2, default=str)
        
        self.logger.info(f"📊 Training results saved to: {results_file}")
    
    def _create_deployment_package(self, results: Dict[str, Any]) -> None:
        """Create a deployment-ready package with all models and metadata"""
        
        deployment_dir = self.output_dir / "deployment_package"
        deployment_dir.mkdir(exist_ok=True)
        
        # Copy all successful models
        successful_models = {}
        
        for analysis_type, result in results.items():
            if isinstance(result, dict) and result.get('success'):
                model_artifacts = result.get('model_artifacts', {})
                if model_artifacts.get('model_directory'):
                    successful_models[analysis_type] = {
                        'model_directory': model_artifacts['model_directory'],
                        'target_column': result.get('target_column'),
                        'feature_columns': result.get('feature_columns'),
                        'performance': result.get('performance')
                    }
        
        # Create deployment manifest
        manifest = {
            'package_version': '1.0',
            'created_timestamp': datetime.now().isoformat(),
            'models': successful_models,
            'deployment_instructions': {
                'requirements': ['xgboost', 'scikit-learn', 'pandas', 'numpy', 'joblib'],
                'model_loading': 'Use joblib.load() to load model.joblib files',
                'preprocessing': 'Apply same scaler and label encoders used in training'
            }
        }
        
        manifest_file = deployment_dir / "deployment_manifest.json"
        with open(manifest_file, 'w') as f:
            json.dump(manifest, f, indent=2, default=str)
        
        self.logger.info(f"📦 Deployment package created: {deployment_dir}")


def main():
    """Main function for command-line usage"""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python automated_model_trainer.py <combined_data.csv> [output_dir]")
        print("\nExample:")
        print("python automated_model_trainer.py extracted_data/combined_data.csv trained_models")
        sys.exit(1)
    
    data_file = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "trained_models"
    
    print(f"🚀 Starting automated model training...")
    print(f"📊 Data file: {data_file}")
    print(f"📁 Output directory: {output_dir}")
    
    # Create trainer and run
    trainer = AutomatedModelTrainer(output_dir)
    results = trainer.train_comprehensive_models(data_file)
    
    # Print summary
    successful_models = [
        name for name, result in results.items() 
        if isinstance(result, dict) and result.get('success')
    ]
    
    print(f"\n✅ Model training completed!")
    print(f"🎯 {len(successful_models)} models trained successfully")
    
    for model_name in successful_models:
        result = results[model_name]
        performance = result.get('performance', {})
        print(f"   📊 {model_name}: R² = {performance.get('r2_score', 0):.3f}")
    
    print(f"💾 All results saved to: {output_dir}")


if __name__ == "__main__":
    main()