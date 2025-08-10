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
                                 target_variable: str = None) -> Dict[str, Any]:
        """
        Train comprehensive models using multiple algorithms and analysis types
        
        Args:
            data_file: Path to the combined CSV data file
            target_variable: Required target variable for model training
            
        Returns:
            Training results summary
        """
        self.logger.info("🚀 Starting comprehensive multi-algorithm model training pipeline...")
        
        # Load and prepare data
        data = pd.read_csv(data_file)
        self.logger.info(f"📊 Loaded {len(data)} records with {len(data.columns)} columns")
        
        if not target_variable:
            raise ValueError("Target variable is required. Please specify using --target parameter")
        
        if target_variable not in data.columns:
            raise ValueError(f"Target variable '{target_variable}' not found in dataset")
        
        self.logger.info(f"🎯 Target Variable: {target_variable}")
        
        # Define all model algorithms to train
        model_algorithms = self._get_model_algorithms()
        
        results = {}
        
        # Train all model algorithms with the target variable
        for algorithm_name, algorithm_config in model_algorithms.items():
            self.logger.info(f"🧠 Training {algorithm_name} model: {algorithm_config['description']}")
            
            try:
                if algorithm_config['type'] == 'supervised':
                    # Train supervised model (regression/classification)
                    model_result = self._train_supervised_model(
                        data, target_variable, algorithm_name, algorithm_config
                    )
                elif algorithm_config['type'] == 'unsupervised':
                    # Train unsupervised model (clustering/anomaly detection)
                    model_result = self._train_unsupervised_model(
                        data, algorithm_name, algorithm_config
                    )
                else:
                    self.logger.warning(f"⚠️ Unknown model type: {algorithm_config['type']}")
                    continue
                
                if model_result:
                    results[algorithm_name] = model_result
                    self.logger.info(f"✅ {algorithm_name} model completed successfully")
                else:
                    self.logger.error(f"❌ {algorithm_name} model training failed")
                    results[algorithm_name] = {'success': False, 'error': 'Training failed'}
                    
            except Exception as e:
                self.logger.error(f"❌ Error training {algorithm_name}: {str(e)}")
                results[algorithm_name] = {'success': False, 'error': str(e)}
        
        # Create ensemble model from successful supervised models
        supervised_models = {name: result for name, result in results.items() 
                           if result.get('success') and result.get('model_type') == 'supervised'}
        
        if len(supervised_models) >= 2:
            self.logger.info("🔗 Creating ensemble model from successful supervised models...")
            ensemble_result = self._create_ensemble_model(data, target_variable, supervised_models)
            if ensemble_result:
                results['ensemble'] = ensemble_result
                self.logger.info("✅ Ensemble model created successfully")
        
        # Save comprehensive results
        self._save_comprehensive_results(results, target_variable)
        
        self.logger.info(f"🎉 Comprehensive model training completed! Results saved to: {self.output_dir}")
        
        return results
    
    def _train_supervised_model(self, data: pd.DataFrame, target_variable: str, 
                              algorithm_name: str, algorithm_config: Dict) -> Dict[str, Any]:
        """Train a supervised model with the specified algorithm"""
        training_start = datetime.now()
        
        try:
            # Validate target column exists and has data
            if target_variable not in data.columns:
                raise ValueError(f"Target variable '{target_variable}' not found in data")
            
            # Remove rows with missing target values
            data_clean = data.dropna(subset=[target_variable]).copy()
            if len(data_clean) == 0:
                raise ValueError(f"No valid data for target variable '{target_variable}'")
            
            self.logger.info(f"   📝 Training data: {len(data_clean)} records (removed {len(data) - len(data_clean)} with missing targets)")
            
            # Prepare features and target
            y = data_clean[target_variable].values
            
            # Intelligent feature selection
            feature_columns = self._select_features(data_clean, target_variable)
            X = data_clean[feature_columns].copy()
            
            self.logger.info(f"   🎯 Selected {len(feature_columns)} features for training")
            
            # Feature engineering
            X_processed = self._engineer_features(X, algorithm_name)
            
            # Handle missing values and encode categorical variables
            X_processed = self._preprocess_features(X_processed, algorithm_name)
            
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
            
            # Initialize model with configured parameters
            model = algorithm_config['model_class'](**algorithm_config['params'])
            
            # Train model
            self.logger.info(f"   🎯 Training {algorithm_name} model...")
            model.fit(X_train, y_train)
            
            # Model evaluation
            performance = self._evaluate_supervised_model(model, X_test, y_test, X_train, y_train)
            
            # Feature importance analysis (if available)
            feature_importance = []
            if hasattr(model, 'feature_importances_'):
                feature_importance = self._analyze_feature_importance(model, feature_columns)
            elif hasattr(model, 'coef_'):
                # For linear models, use coefficients as importance
                coef_importance = np.abs(model.coef_) if hasattr(model.coef_, '__len__') else [abs(model.coef_)]
                feature_importance = [
                    {
                        'feature': feature_columns[i],
                        'importance': float(coef_importance[i]) if i < len(coef_importance) else 0.0,
                        'rank': i + 1
                    }
                    for i in range(len(feature_columns))
                ]
                feature_importance.sort(key=lambda x: x['importance'], reverse=True)
                for i, item in enumerate(feature_importance):
                    item['rank'] = i + 1
            
            # SHAP analysis (for tree-based models)
            shap_analysis = {}
            if algorithm_name in ['xgboost', 'random_forest', 'lightgbm']:
                self.logger.info("   🔍 Computing SHAP values...")
                shap_analysis = self._compute_shap_values(model, X_train, X_test, feature_columns)
            
            # Cross-validation
            cv_scores = self._cross_validate_supervised_model(model, X_processed, y)
            
            # Save model artifacts
            model_artifacts = self._save_model_artifacts(
                model, feature_columns, algorithm_name, algorithm_config['params']
            )
            
            training_duration = (datetime.now() - training_start).total_seconds()
            
            return {
                'success': True,
                'model_type': 'supervised',
                'algorithm': algorithm_name,
                'target_variable': target_variable,
                'training_duration_seconds': training_duration,
                'data_info': {
                    'total_records': len(data_clean),
                    'features_used': len(feature_columns),
                    'train_records': len(X_train),
                    'test_records': len(X_test)
                },
                'hyperparameters': algorithm_config['params'],
                'performance': performance,
                'feature_importance': feature_importance,
                'shap_analysis': shap_analysis,
                'cross_validation': cv_scores,
                'model_artifacts': model_artifacts,
                'feature_columns': feature_columns
            }
            
        except Exception as e:
            self.logger.error(f"❌ Error training supervised model {algorithm_name}: {str(e)}")
            return {
                'success': False,
                'model_type': 'supervised',
                'algorithm': algorithm_name,
                'error': str(e),
                'training_duration_seconds': (datetime.now() - training_start).total_seconds()
            }
    
    def _train_unsupervised_model(self, data: pd.DataFrame, algorithm_name: str, 
                                algorithm_config: Dict) -> Dict[str, Any]:
        """Train an unsupervised model with the specified algorithm"""
        training_start = datetime.now()
        
        try:
            # Remove rows with too many missing values
            threshold = 0.5  # Remove rows with more than 50% missing values
            data_clean = data.dropna(thresh=int(threshold * len(data.columns))).copy()
            
            if len(data_clean) == 0:
                raise ValueError("No valid data for unsupervised training")
            
            self.logger.info(f"   📝 Training data: {len(data_clean)} records (removed {len(data) - len(data_clean)} with excessive missing values)")
            
            # Select features (exclude non-informative columns)
            exclude_patterns = ['id', 'objectid', '_layer_id', '_layer_name', 'description', 'name']
            potential_features = []
            
            for col in data_clean.columns:
                col_lower = col.lower()
                if not any(pattern in col_lower for pattern in exclude_patterns):
                    # Only include numeric columns for unsupervised learning
                    if pd.api.types.is_numeric_dtype(data_clean[col]):
                        potential_features.append(col)
            
            if len(potential_features) == 0:
                raise ValueError("No numeric features available for unsupervised learning")
            
            X = data_clean[potential_features].copy()
            
            # Handle missing values for unsupervised learning
            for col in X.columns:
                X[col].fillna(X[col].median(), inplace=True)
            
            # Scale features for unsupervised algorithms
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            X_scaled_df = pd.DataFrame(X_scaled, columns=potential_features)
            
            self.logger.info(f"   🎯 Using {len(potential_features)} features for unsupervised learning")
            
            # Initialize and train model
            model = algorithm_config['model_class'](**algorithm_config['params'])
            
            self.logger.info(f"   🎯 Training {algorithm_name} model...")
            
            if algorithm_name == 'clustering':
                # For clustering, fit and get cluster labels
                cluster_labels = model.fit_predict(X_scaled_df)
                n_clusters = len(np.unique(cluster_labels))
                
                # Calculate silhouette score if possible
                try:
                    from sklearn.metrics import silhouette_score
                    if n_clusters > 1:
                        silhouette_avg = silhouette_score(X_scaled_df, cluster_labels)
                    else:
                        silhouette_avg = -1
                except ImportError:
                    silhouette_avg = None
                
                performance = {
                    'n_clusters': n_clusters,
                    'silhouette_score': silhouette_avg,
                    'cluster_distribution': {str(i): int(np.sum(cluster_labels == i)) for i in np.unique(cluster_labels)}
                }
                
            elif algorithm_name == 'anomaly_detection':
                # For anomaly detection, fit and predict outliers
                outlier_labels = model.fit_predict(X_scaled_df)
                n_outliers = np.sum(outlier_labels == -1)
                outlier_ratio = n_outliers / len(outlier_labels)
                
                performance = {
                    'n_outliers': n_outliers,
                    'outlier_ratio': outlier_ratio,
                    'normal_points': len(outlier_labels) - n_outliers
                }
                
            elif algorithm_name == 'dimensionality_reduction':
                # For PCA, fit and transform
                X_transformed = model.fit_transform(X_scaled_df)
                explained_variance_ratio = model.explained_variance_ratio_
                cumulative_variance = np.cumsum(explained_variance_ratio)
                
                performance = {
                    'n_components': model.n_components_,
                    'explained_variance_ratio': explained_variance_ratio.tolist(),
                    'cumulative_variance': cumulative_variance.tolist(),
                    'total_variance_explained': float(cumulative_variance[-1])
                }
            else:
                # Generic unsupervised model
                model.fit(X_scaled_df)
                performance = {'model_fitted': True}
            
            # Save model artifacts
            model_artifacts = self._save_unsupervised_model_artifacts(
                model, potential_features, algorithm_name, algorithm_config['params'], scaler
            )
            
            training_duration = (datetime.now() - training_start).total_seconds()
            
            return {
                'success': True,
                'model_type': 'unsupervised',
                'algorithm': algorithm_name,
                'training_duration_seconds': training_duration,
                'data_info': {
                    'total_records': len(data_clean),
                    'features_used': len(potential_features)
                },
                'hyperparameters': algorithm_config['params'],
                'performance': performance,
                'model_artifacts': model_artifacts,
                'feature_columns': potential_features
            }
            
        except Exception as e:
            self.logger.error(f"❌ Error training unsupervised model {algorithm_name}: {str(e)}")
            return {
                'success': False,
                'model_type': 'unsupervised',
                'algorithm': algorithm_name,
                'error': str(e),
                'training_duration_seconds': (datetime.now() - training_start).total_seconds()
            }
    
    def _evaluate_supervised_model(self, model, X_test: pd.DataFrame, y_test: np.ndarray,
                                 X_train: pd.DataFrame, y_train: np.ndarray) -> Dict[str, float]:
        """Comprehensive supervised model evaluation"""
        
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
    
    def _cross_validate_supervised_model(self, model, X: pd.DataFrame, y: np.ndarray) -> Dict[str, float]:
        """Perform cross-validation for supervised model"""
        
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
    
    def _save_unsupervised_model_artifacts(self, model, feature_columns: List[str],
                                         algorithm_name: str, hyperparameters: Dict[str, Any], 
                                         scaler) -> Dict[str, str]:
        """Save unsupervised model artifacts"""
        
        model_dir = self.output_dir / f"{algorithm_name}_model"
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
        
        # Save scaler
        scaler_file = model_dir / "scaler.joblib"
        joblib.dump(scaler, scaler_file)
        
        return {
            'model_file': str(model_file),
            'features_file': str(features_file),
            'hyperparameters_file': str(params_file),
            'scaler_file': str(scaler_file),
            'model_directory': str(model_dir)
        }
    
    def _create_ensemble_model(self, data: pd.DataFrame, target_variable: str, 
                             supervised_models: Dict[str, Any]) -> Dict[str, Any]:
        """Create an ensemble model from successful supervised models"""
        
        try:
            self.logger.info(f"   🔗 Creating ensemble from {len(supervised_models)} models...")
            
            # Use the same data preparation as individual models
            data_clean = data.dropna(subset=[target_variable]).copy()
            y = data_clean[target_variable].values
            
            # Use feature intersection from all models for consistency
            all_features = set()
            for model_result in supervised_models.values():
                if model_result.get('feature_columns'):
                    all_features.update(model_result['feature_columns'])
            
            # Select features that exist in the data
            common_features = [f for f in all_features if f in data_clean.columns]
            
            if len(common_features) == 0:
                raise ValueError("No common features found among models")
            
            X = data_clean[common_features].copy()
            
            # Preprocess features
            X_processed = self._preprocess_features(X, 'ensemble')
            
            # Create ensemble model (Random Forest as meta-learner)
            ensemble_model = RandomForestRegressor(
                n_estimators=200,
                max_depth=8,
                random_state=self.config['random_state'],
                n_jobs=self.config['n_jobs']
            )
            
            # Train ensemble
            ensemble_model.fit(X_processed, y)
            
            # Evaluate ensemble
            X_train, X_test, y_train, y_test = train_test_split(
                X_processed, y, test_size=0.2, random_state=self.config['random_state']
            )
            
            performance = self._evaluate_supervised_model(
                ensemble_model, X_test, y_test, X_train, y_train
            )
            
            # Save ensemble model
            model_artifacts = self._save_model_artifacts(
                ensemble_model, common_features, 'ensemble', 
                {'n_estimators': 200, 'max_depth': 8}
            )
            
            return {
                'success': True,
                'model_type': 'supervised',
                'algorithm': 'ensemble',
                'target_variable': target_variable,
                'component_models': list(supervised_models.keys()),
                'performance': performance,
                'model_artifacts': model_artifacts,
                'feature_columns': common_features,
                'data_info': {
                    'total_records': len(data_clean),
                    'features_used': len(common_features)
                }
            }
            
        except Exception as e:
            self.logger.error(f"❌ Ensemble model creation failed: {str(e)}")
            return {
                'success': False,
                'algorithm': 'ensemble',
                'error': str(e)
            }
    
    def _save_comprehensive_results(self, results: Dict[str, Any], target_variable: str) -> None:
        """Save comprehensive training results"""
        
        # Create summary
        summary = {
            'training_timestamp': datetime.now().isoformat(),
            'target_variable': target_variable,
            'total_models_attempted': len(results),
            'successful_models': len([r for r in results.values() if r.get('success')]),
            'models_overview': {}
        }
        
        for algorithm_name, result in results.items():
            if result.get('success'):
                summary['models_overview'][algorithm_name] = {
                    'algorithm': result.get('algorithm', algorithm_name),
                    'model_type': result.get('model_type'),
                    'target_variable': result.get('target_variable'),
                    'performance': result.get('performance', {}),
                    'features_used': result.get('data_info', {}).get('features_used'),
                    'training_records': result.get('data_info', {}).get('total_records')
                }
            else:
                summary['models_overview'][algorithm_name] = {
                    'success': False,
                    'error': result.get('error')
                }
        
        # Save complete results
        results_file = self.output_dir / "training_results.json"
        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        # Save summary
        summary_file = self.output_dir / "training_summary.json"
        with open(summary_file, 'w') as f:
            json.dump(summary, f, indent=2, default=str)
        
        self.logger.info(f"📊 Comprehensive training results saved to: {results_file}")
        self.logger.info(f"📋 Training summary saved to: {summary_file}")
    
    
    def _get_model_algorithms(self) -> Dict[str, Dict]:
        """Define all model algorithms to train with their configurations"""
        from sklearn.ensemble import RandomForestRegressor, IsolationForest
        from sklearn.linear_model import LinearRegression, Ridge, Lasso
        from sklearn.svm import SVR
        from sklearn.neighbors import KNeighborsRegressor
        from sklearn.cluster import KMeans
        from sklearn.decomposition import PCA
        from sklearn.neural_network import MLPRegressor
        import xgboost as xgb
        
        try:
            import lightgbm as lgb
            lightgbm_available = True
        except ImportError:
            lightgbm_available = False
            self.logger.warning("⚠️ LightGBM not available, skipping LightGBM models")
        
        algorithms = {
            # Supervised Regression Models
            'xgboost': {
                'model_class': xgb.XGBRegressor,
                'params': {
                    'n_estimators': 300,
                    'max_depth': 5,
                    'learning_rate': 0.1,
                    'subsample': 0.8,
                    'colsample_bytree': 0.8,
                    'random_state': 42
                },
                'type': 'supervised',
                'description': 'Gradient Boosting - Best performance'
            },
            'random_forest': {
                'model_class': RandomForestRegressor,
                'params': {
                    'n_estimators': 200,
                    'max_depth': 10,
                    'min_samples_split': 5,
                    'min_samples_leaf': 2,
                    'random_state': 42
                },
                'type': 'supervised',
                'description': 'Ensemble tree method'
            },
            'linear_regression': {
                'model_class': LinearRegression,
                'params': {},
                'type': 'supervised',
                'description': 'Baseline interpretable model'
            },
            'ridge_regression': {
                'model_class': Ridge,
                'params': {
                    'alpha': 1.0,
                    'random_state': 42
                },
                'type': 'supervised',
                'description': 'Regularized linear model'
            },
            'lasso_regression': {
                'model_class': Lasso,
                'params': {
                    'alpha': 0.1,
                    'random_state': 42
                },
                'type': 'supervised',
                'description': 'L1 regularized with feature selection'
            },
            'svr': {
                'model_class': SVR,
                'params': {
                    'kernel': 'rbf',
                    'C': 1.0,
                    'gamma': 'scale'
                },
                'type': 'supervised',
                'description': 'Support Vector Regression'
            },
            'knn': {
                'model_class': KNeighborsRegressor,
                'params': {
                    'n_neighbors': 5,
                    'weights': 'distance'
                },
                'type': 'supervised',
                'description': 'Instance-based learning'
            },
            'neural_network': {
                'model_class': MLPRegressor,
                'params': {
                    'hidden_layer_sizes': (100, 50),
                    'max_iter': 500,
                    'random_state': 42,
                    'early_stopping': True
                },
                'type': 'supervised',
                'description': 'Multi-layer neural network'
            },
            
            # Unsupervised Models
            'anomaly_detection': {
                'model_class': IsolationForest,
                'params': {
                    'contamination': 0.1,
                    'random_state': 42
                },
                'type': 'unsupervised',
                'description': 'Outlier detection'
            },
            'clustering': {
                'model_class': KMeans,
                'params': {
                    'n_clusters': 8,
                    'random_state': 42,
                    'n_init': 10
                },
                'type': 'unsupervised',
                'description': 'Customer segmentation'
            },
            'dimensionality_reduction': {
                'model_class': PCA,
                'params': {
                    'n_components': 10,
                    'random_state': 42
                },
                'type': 'unsupervised',
                'description': 'Feature analysis and compression'
            }
        }
        
        # Add LightGBM if available
        if lightgbm_available:
            algorithms['lightgbm'] = {
                'model_class': lgb.LGBMRegressor,
                'params': {
                    'n_estimators': 300,
                    'max_depth': 5,
                    'learning_rate': 0.1,
                    'subsample': 0.8,
                    'colsample_bytree': 0.8,
                    'random_state': 42,
                    'verbosity': -1
                },
                'type': 'supervised',
                'description': 'Light Gradient Boosting'
            }
        
        return algorithms
    
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
    
    
    


def main():
    """Main function for command-line usage"""
    import sys
    import argparse
    
    parser = argparse.ArgumentParser(description='Comprehensive Multi-Algorithm Model Training')
    parser.add_argument('data_file', help='Path to the CSV data file')
    parser.add_argument('--output', default='trained_models', help='Output directory for trained models')
    parser.add_argument('--target', required=True, help='Target variable for model training')
    
    args = parser.parse_args()
    
    print(f"🚀 Starting comprehensive multi-algorithm model training...")
    print(f"📊 Data file: {args.data_file}")
    print(f"📁 Output directory: {args.output}")
    print(f"🎯 Target variable: {args.target}")
    
    # Create trainer and run
    trainer = AutomatedModelTrainer(args.output)
    results = trainer.train_comprehensive_models(args.data_file, args.target)
    
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
        r2_score = performance.get('r2_score', 0) if performance else 0
        print(f"   📊 {model_name}: R² = {r2_score:.3f}")
    
    print(f"💾 All results saved to: {args.output}")


if __name__ == "__main__":
    main()