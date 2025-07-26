import os
import time
import json
import logging
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import xgboost as xgb
import shap
from typing import Dict, Any, List, Optional
import redis
import hashlib
import traceback

# Setup logging
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
CORS(app)

# Load environment variables
API_KEY = os.environ.get('API_KEY')
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
REDIS_URL = os.environ.get('REDIS_URL')
REDIS_TIMEOUT = int(os.environ.get('REDIS_TIMEOUT', '5'))
REDIS_CACHE_TTL = int(os.environ.get('REDIS_CACHE_TTL', '3600'))  # Default 1 hour TTL
CACHE_ENABLED = os.environ.get('CACHE_ENABLED', 'True').lower() == 'true'

# Initialize Redis client for caching if configured
redis_client = None
if REDIS_URL and CACHE_ENABLED:
    try:
        logger.info("Initializing Redis connection...")
        redis_client = redis.from_url(
            REDIS_URL,
            socket_timeout=REDIS_TIMEOUT,
            socket_connect_timeout=REDIS_TIMEOUT,
            decode_responses=True
        )
        redis_client.ping()  # Test the connection
        logger.info("Redis connection successful")
    except Exception as e:
        logger.error(f"Redis connection error: {str(e)}")
        logger.error("Continuing without Redis caching")
        redis_client = None
else:
    logger.warning("Redis URL not configured or caching disabled. Continuing without Redis caching.")

# Model registry
models = {}
feature_maps = {}
shap_explainers = {}

def load_models():
    """Load all XGBoost models into memory"""
    global models, feature_maps, shap_explainers
    
    model_types = [
        'hotspot',
        'multivariate',
        'prediction',
        'anomaly',
        'network',
        'correlation'
    ]
    
    for model_type in model_types:
        try:
            logger.info(f"Loading {model_type} model...")
            
            # In a real implementation, load the model from a file
            # models[model_type] = xgb.Booster()
            # models[model_type].load_model(f"models/{model_type}.model")
            
            # For this skeleton, we'll create a dummy model
            if model_type == 'prediction':
                # Create a simple regressor
                X = np.random.rand(100, 10)
                y = np.random.rand(100) * 10
                dtrain = xgb.DMatrix(X, label=y)
                params = {
                    'max_depth': 3,
                    'eta': 0.1,
                    'objective': 'reg:squarederror',
                    'eval_metric': 'rmse'
                }
                models[model_type] = xgb.train(params, dtrain, num_boost_round=10)
            else:
                # Create a simple classifier
                X = np.random.rand(100, 10)
                y = np.random.randint(0, 2, 100)
                dtrain = xgb.DMatrix(X, label=y)
                params = {
                    'max_depth': 3,
                    'eta': 0.1,
                    'objective': 'binary:logistic',
                    'eval_metric': 'logloss'
                }
                models[model_type] = xgb.train(params, dtrain, num_boost_round=10)
            
            # Create SHAP explainer for the model
            X_shap = pd.DataFrame(X, columns=[f'feature_{i}' for i in range(X.shape[1])])
            feature_maps[model_type] = X_shap.columns.tolist()
            shap_explainers[model_type] = shap.TreeExplainer(models[model_type])
            
            logger.info(f"Successfully loaded {model_type} model")
        except Exception as e:
            logger.error(f"Failed to load {model_type} model: {str(e)}")
            # Log the full traceback for debugging
            logger.error(traceback.format_exc())

def get_feature_vector(input_data: Dict[str, Any], model_type: str) -> pd.DataFrame:
    """
    Convert input data to feature vector for model prediction
    """
    # In a real implementation, this would transform the geospatial data
    # into features the model expects
    
    # For this skeleton, we'll create dummy features
    features = {}
    feature_list = feature_maps.get(model_type, [])
    
    # Create random features for demonstration
    for feature in feature_list:
        features[feature] = np.random.rand()
    
    # Add some basic features from the input
    if 'query' in input_data:
        query = input_data['query'].lower()
        features['query_length'] = len(query)
        features['has_predict'] = 'predict' in query
        features['has_correlation'] = 'correlation' in query
    
    if 'visualizationType' in input_data:
        viz_type = input_data['visualizationType']
        features['is_complex_viz'] = viz_type in ['HOTSPOT', 'MULTIVARIATE', 'BIVARIATE', 'NETWORK']
    
    return pd.DataFrame([features])

def get_model_for_query(input_data: Dict[str, Any]) -> str:
    """
    Determine which model to use based on the query and visualization type
    """
    query = input_data.get('query', '').lower()
    viz_type = input_data.get('visualizationType', '')
    
    # Select model based on query and visualization type
    if 'predict' in query or 'forecast' in query:
        return 'prediction'
    elif 'anomaly' in query or 'outlier' in query:
        return 'anomaly'
    elif 'correlation' in query or 'relationship' in query:
        return 'correlation'
    elif viz_type == 'HOTSPOT':
        return 'hotspot'
    elif viz_type == 'MULTIVARIATE':
        return 'multivariate'
    elif viz_type == 'NETWORK':
        return 'network'
    else:
        return 'multivariate'  # Default model

def generate_cache_key(input_data: Dict[str, Any], model_type: str) -> str:
    """Generate a unique cache key for the prediction request"""
    # Create a string representation of the input and model type
    key_data = {
        "input": input_data,
        "model_type": model_type
    }
    # Convert to JSON and hash
    json_str = json.dumps(key_data, sort_keys=True)
    return f"pred:{hashlib.md5(json_str.encode()).hexdigest()}"

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Endpoint to make predictions using XGBoost models
    """
    start_time = time.time()
    
    # API key validation in production
    if API_KEY and request.headers.get('x-api-key') != API_KEY:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        # Get input data
        input_data = request.json
        if not input_data:
            return jsonify({'error': 'No input data provided'}), 400
        
        # Determine which model to use
        model_type = get_model_for_query(input_data)
        
        if model_type not in models:
            return jsonify({'error': f'Model {model_type} not available'}), 404
        
        # Check cache if Redis is available
        cache_hit = False
        cached_response = None
        cache_key = None
        
        if redis_client:
            try:
                cache_key = generate_cache_key(input_data, model_type)
                cached_result = redis_client.get(cache_key)
                if cached_result:
                    cached_response = json.loads(cached_result)
                    cache_hit = True
                    logger.info(f"Cache hit for key: {cache_key}")
            except Exception as e:
                logger.warning(f"Error checking cache: {str(e)}")
        
        # If we have a cache hit, return the cached response
        if cache_hit and cached_response:
            # Update the processing time to include cache retrieval
            cached_response['processing_time'] = time.time() - start_time
            cached_response['cached'] = True
            return jsonify(cached_response)
        
        # No cache hit, perform the prediction
        logger.info(f"Cache miss or no Redis. Computing prediction with model: {model_type}")
        
        # Prepare feature vector
        features_df = get_feature_vector(input_data, model_type)
        features_dmatrix = xgb.DMatrix(features_df)
        
        # Make prediction
        prediction = models[model_type].predict(features_dmatrix)
        
        # Generate SHAP explanations
        explainer = shap_explainers.get(model_type)
        shap_values = explainer.shap_values(features_df)
        
        # Format response
        response = {
            'predictions': prediction.tolist(),
            'explanations': {
                'shap_values': shap_values.tolist() if not isinstance(shap_values, list) else shap_values[0].tolist(),
                'feature_names': feature_maps.get(model_type, []),
                'base_value': explainer.expected_value if not isinstance(explainer.expected_value, list) else explainer.expected_value[0]
            },
            'processing_time': time.time() - start_time,
            'model_version': '0.1.0',
            'model_type': model_type,
            'cached': False
        }
        
        # Cache the result if Redis is available
        if redis_client and cache_key:
            try:
                # Don't cache the processing_time as it will vary
                cache_response = response.copy()
                redis_client.setex(
                    cache_key, 
                    REDIS_CACHE_TTL,
                    json.dumps(cache_response)
                )
                logger.info(f"Cached result with key: {cache_key}, TTL: {REDIS_CACHE_TTL}s")
            except Exception as e:
                logger.warning(f"Error caching result: {str(e)}")
        
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        logger.error(traceback.format_exc())  # Log the full traceback
        return jsonify({
            'error': str(e),
            'error_type': type(e).__name__,
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    # Check Redis connectivity if configured
    redis_status = "not_configured"
    if REDIS_URL:
        try:
            if redis_client and redis_client.ping():
                redis_status = "ok"
            else:
                redis_status = "error"
        except Exception:
            redis_status = "error"
    
    response = {
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'models': list(models.keys()),
        'redis': {
            'status': redis_status,
            'cache_enabled': CACHE_ENABLED
        },
        'environment': {
            'debug': DEBUG
        }
    }
    
    return jsonify(response)

@app.route('/ping', methods=['GET'])
def ping():
    """
    Simple ping endpoint with no authentication
    """
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    """
    Endpoint to clear the Redis cache (requires API key)
    """
    # API key validation
    if API_KEY and request.headers.get('x-api-key') != API_KEY:
        return jsonify({'error': 'Unauthorized'}), 401
    
    if not redis_client:
        return jsonify({'error': 'Redis not configured'}), 400
    
    try:
        # Get all keys with the prediction prefix
        keys = redis_client.keys('pred:*')
        if keys:
            redis_client.delete(*keys)
        
        return jsonify({
            'status': 'ok',
            'message': f'Cleared {len(keys)} cache entries',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Cache clear error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Load models at startup
    load_models()
    
    # Start server
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=DEBUG) 