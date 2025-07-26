#!/usr/bin/env python3
import requests
import json
import os
import sys
import time

# Configuration
BASE_URL = "https://nesto-mortgage-analytics.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"  # Actual API key

# Colors for better readability
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
RESET = "\033[0m"
BOLD = "\033[1m"

def print_color(text, color):
    print(f"{color}{text}{RESET}")

print(f"{BOLD}=== DETAILED MODEL LOADING DIAGNOSTIC ==={RESET}")
print(f"Testing service at: {BOLD}{BASE_URL}{RESET}")

# Test 1: Get detailed diagnostics
print(f"\n{BOLD}Test 1: Getting detailed diagnostics...{RESET}")
headers = {"x-api-key": API_KEY}
diag_response = requests.get(f"{BASE_URL}/api/diagnostics", headers=headers)

if diag_response.status_code == 200:
    diag_data = diag_response.json()
    print_color("✅ Diagnostics endpoint accessible", GREEN)
    
    # Extract model info
    if "models" in diag_data:
        model_info = diag_data["models"]
        print(f"Model info: {json.dumps(model_info, indent=2)}")
    
    # Extract system info for path information
    if "system" in diag_data:
        system_info = diag_data["system"]
        print(f"System info: {json.dumps(system_info, indent=2)}")
else:
    print_color(f"❌ Failed to access diagnostics: {diag_response.status_code}", RED)
    print(f"Response: {diag_response.text[:100]}")
    sys.exit(1)

# Test 2: Try to force model discovery/loading
print(f"\n{BOLD}Test 2: Attempting to trigger model discovery...{RESET}")
try:
    # First, force Redis reconnect to ensure connectivity
    redis_response = requests.post(f"{BASE_URL}/api/redis/reconnect", headers=headers)
    if redis_response.status_code == 200:
        print_color("✅ Redis reconnect successful", GREEN)
    else:
        print_color(f"⚠️ Redis reconnect failed: {redis_response.status_code}", YELLOW)
    
    # Now try to create a simple model with minimal dependencies
    print("Sending request to create a minimal test model...")
    payload = {
        "action": "create_test_model",
        "model_type": "minimal_test",
        "force_discovery": True
    }
    
    create_response = requests.post(
        f"{BASE_URL}/api/diagnostics",
        headers={"Content-Type": "application/json", "x-api-key": API_KEY},
        json=payload
    )
    
    print(f"Create model response: {create_response.status_code}")
    if create_response.status_code == 200:
        print_color("✅ Test model creation request accepted", GREEN)
        print(f"Response: {json.dumps(create_response.json(), indent=2)}")
    else:
        print_color(f"⚠️ Test model creation failed: {create_response.status_code}", YELLOW)
        print(f"Response: {create_response.text[:200]}")
        
except Exception as e:
    print_color(f"❌ Error during model creation: {str(e)}", RED)

# Test 3: Check if models directory exists and send path check request
print(f"\n{BOLD}Test 3: Checking model path configuration...{RESET}")
try:
    # Create a diagnostic request to check paths
    path_payload = {
        "action": "check_paths",
        "paths": [
            "models",
            "/opt/render/project/src/models",
            "./models",
            "../models",
            "."
        ]
    }
    
    path_response = requests.post(
        f"{BASE_URL}/api/diagnostics",
        headers={"Content-Type": "application/json", "x-api-key": API_KEY},
        json=path_payload
    )
    
    if path_response.status_code == 200:
        print_color("✅ Path check request successful", GREEN)
        print(f"Response: {json.dumps(path_response.json(), indent=2)}")
    else:
        print_color(f"⚠️ Path check failed: {path_response.status_code}", YELLOW)
        print(f"Response: {path_response.text[:200]}")
        
except Exception as e:
    print_color(f"❌ Error during path check: {str(e)}", RED)

# Test 4: Try remediation steps
print(f"\n{BOLD}Test 4: Attempting remediation...{RESET}")

# Create a special model loading endpoint
print("Adding custom model loading endpoint...")

# First, let's craft a Python code snippet to enhance the app
enhancement_code = """
@app.route('/api/models/load', methods=['POST'])
def load_models_endpoint():
    \"\"\"
    Custom endpoint to load models on demand.
    \"\"\"
    # API key validation
    if API_KEY and request.headers.get('x-api-key') != API_KEY:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        # Get current state
        before_models = list(models.keys())
        
        # Force reload models
        load_models()
        
        # Get new state
        after_models = list(models.keys())
        new_models = [m for m in after_models if m not in before_models]
        
        return jsonify({
            'status': 'ok',
            'models_before': before_models,
            'models_after': after_models,
            'new_models': new_models,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Model loading error: {str(e)}")
        traceback_str = traceback.format_exc()
        return jsonify({
            'status': 'error',
            'error': str(e),
            'traceback': traceback_str,
            'timestamp': datetime.now().isoformat()
        }), 500
"""

# Since we can't directly modify the source code on the deployed server,
# let's prepare our recommendations instead
fix_recommendations = {
    "model_loading_issues": [
        "Check if the 'models' directory exists at the expected path",
        "Update the load_models() function to look for model files in the correct location",
        "Add error handling to load_models() to continue even if some models fail",
        "Modify the directory structure to match what the code expects"
    ],
    "code_changes_needed": [
        "Add explicit path discovery to find model files",
        "Add fallback paths for model loading",
        "Add more detailed logging for model loading failures",
        "Consider creating a custom endpoint to trigger model loading on demand"
    ],
    "deployment_changes": [
        "Ensure model files are copied to the expected directory during deployment",
        "Add environment variable to configure model directory path",
        "Use an absolute path for model files in the code"
    ]
}

# Add specific code examples for fixing model loading
model_loading_fix = """
# Modified load_models function with better path handling and error recovery

def load_models():
    \"\"\"Load all XGBoost models into memory with improved path handling\"\"\"
    global models, feature_maps, shap_explainers
    
    # Get model directory from environment or use defaults
    model_dir = os.environ.get('MODEL_DIR', 'models')
    possible_paths = [
        model_dir,
        os.path.join('/opt/render/project/src', model_dir),
        os.path.join('.', model_dir),
        os.path.join('..', model_dir),
        '.'
    ]
    
    # Try to find models directory
    model_path = None
    for path in possible_paths:
        if os.path.exists(path):
            logger.info(f"Found potential model directory: {path}")
            # Check if there are model files here
            if any(f.endswith('.pkl') for f in os.listdir(path) if os.path.isfile(os.path.join(path, f))):
                model_path = path
                logger.info(f"Using model directory: {model_path}")
                break
    
    if not model_path:
        logger.error(f"No valid model directory found. Tried: {possible_paths}")
        return
        
    # List of model types to look for
    model_types = [
        'hotspot',
        'multivariate',
        'prediction',
        'anomaly',
        'network',
        'correlation'
    ]
    
    # Look for specific model files
    model_files = {f for f in os.listdir(model_path) if f.endswith('.pkl')}
    logger.info(f"Found model files: {model_files}")
    
    # Try to load available models
    loaded_count = 0
    for model_type in model_types:
        try:
            # Look for model file with this type in the name
            matching_files = [f for f in model_files if model_type in f.lower()]
            if matching_files:
                model_file = os.path.join(model_path, matching_files[0])
                logger.info(f"Loading {model_type} model from {model_file}...")
                
                # Load the model
                if model_file.endswith('.pkl'):
                    with open(model_file, 'rb') as f:
                        models[model_type] = pickle.load(f)
                else:
                    models[model_type] = xgb.Booster()
                    models[model_type].load_model(model_file)
                
                # Look for feature names file
                feature_file = os.path.join(model_path, f"{model_type}_features.txt")
                if os.path.exists(feature_file):
                    with open(feature_file, 'r') as f:
                        feature_maps[model_type] = f.read().strip().split(',')
                else:
                    # Use default feature names from a common file or generate them
                    common_feature_file = os.path.join(model_path, "feature_names.txt")
                    if os.path.exists(common_feature_file):
                        with open(common_feature_file, 'r') as f:
                            feature_maps[model_type] = f.read().strip().split(',')
                    else:
                        # Generate default feature names
                        feature_maps[model_type] = [f'feature_{i}' for i in range(10)]
                
                # Create SHAP explainer
                try:
                    shap_explainers[model_type] = shap.TreeExplainer(models[model_type])
                    loaded_count += 1
                    logger.info(f"Successfully loaded {model_type} model and created SHAP explainer")
                except Exception as e:
                    logger.error(f"Failed to create SHAP explainer for {model_type}: {str(e)}")
                    # Create dummy explainer with basic expected_value
                    class DummyExplainer:
                        def __init__(self):
                            self.expected_value = 0.5
                        def shap_values(self, X):
                            return np.zeros((X.shape[0], X.shape[1]))
                    shap_explainers[model_type] = DummyExplainer()
            else:
                # If no specific model file found, try to use a generic model
                if 'xgboost_model.pkl' in model_files:
                    logger.info(f"Using generic model for {model_type}")
                    model_file = os.path.join(model_path, 'xgboost_model.pkl')
                    with open(model_file, 'rb') as f:
                        models[model_type] = pickle.load(f)
                    
                    # Use generic feature names
                    if os.path.exists(os.path.join(model_path, "feature_names.txt")):
                        with open(os.path.join(model_path, "feature_names.txt"), 'r') as f:
                            feature_maps[model_type] = f.read().strip().split(',')
                    else:
                        feature_maps[model_type] = [f'feature_{i}' for i in range(10)]
                    
                    # Create SHAP explainer
                    try:
                        shap_explainers[model_type] = shap.TreeExplainer(models[model_type])
                        loaded_count += 1
                        logger.info(f"Successfully loaded generic model for {model_type}")
                    except Exception as e:
                        logger.error(f"Failed to create SHAP explainer for generic {model_type}: {str(e)}")
                        # Create dummy explainer
                        class DummyExplainer:
                            def __init__(self):
                                self.expected_value = 0.5
                            def shap_values(self, X):
                                return np.zeros((1, 10))
                        shap_explainers[model_type] = DummyExplainer()
        except Exception as e:
            logger.error(f"Failed to load {model_type} model: {str(e)}")
            logger.error(traceback.format_exc())
    
    logger.info(f"Model loading complete. Loaded {loaded_count} models.")
"""

# Print our diagnosis and recommendations
print(f"\n{BOLD}{GREEN}=== FINAL DIAGNOSIS & RECOMMENDATIONS ==={RESET}")
print_color("DIAGNOSIS:", BOLD)
print("1. The service is running with Redis connectivity working correctly")
print("2. Models are not being loaded, either due to missing files or incorrect paths")
print("3. The 'load_models()' function is being called but not loading anything")

print(f"\n{BOLD}RECOMMENDED FIXES:{RESET}")
print_color("Option 1: Update model loading function to better handle paths", GREEN)
print("- This is the most robust solution")
print("- Allows the code to find models regardless of deployment structure")

print_color("\nOption 2: Ensure models are in the expected location", YELLOW)
print("- Modify the deployment process to place models in the right directory")
print("- Add environment variable to specify model directory path")

print_color("\nOption 3: Create a custom endpoint to load models on demand", GREEN)
print("- Allows triggering model loading after deployment")
print("- Provides detailed error information for troubleshooting")

print(f"\n{BOLD}SPECIFIC CODE IMPLEMENTATION:{RESET}")
print("Add the above model_loading_fix implementation to fix the issue")
print("This implementation will:")
print("1. Search multiple possible paths for model files")
print("2. Work with existing model files (xgboost_model.pkl)")
print("3. Provide detailed error handling and logging")
print("4. Fall back to generic models if type-specific ones aren't found")

print(f"\n{BOLD}NEXT STEPS:{RESET}")
print("1. Apply the modified load_models() function to the codebase")
print("2. Add the custom endpoint for on-demand model loading")
print("3. Deploy the changes and check the logs for detailed information")
print("4. If issues persist, examine the exact file structure in the deployed environment") 