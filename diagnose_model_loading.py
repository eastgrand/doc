#!/usr/bin/env python3
import requests
import json
import os
import sys

# Configuration
BASE_URL = "https://nesto-mortgage-analytics.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"  # Actual API key

print("=== MODEL LOADING DIAGNOSTIC ===")
print(f"Testing service at: {BASE_URL}")
print(f"Using API key: {API_KEY[:3]}...{API_KEY[-3:]}")

# Step 1: Check if API key is available
if not API_KEY:
    print("⚠️ API_KEY not found in environment variables")
    API_KEY = input("Enter API key (or press enter to skip authenticated tests): ").strip()

# Step 2: Test basic health to check model status
print("\nStep 1: Checking service health...")
health_response = requests.get(f"{BASE_URL}/api/health")
health_data = health_response.json() if health_response.status_code == 200 else None

if not health_data:
    print(f"❌ Failed to get health data: {health_response.status_code}")
    sys.exit(1)

# Extract model information
model_status = "unknown"
model_list = []
if "components" in health_data and "models" in health_data["components"]:
    model_info = health_data["components"]["models"]
    model_status = model_info.get("status", "unknown")
    model_list = model_info.get("loaded_models", [])

print(f"Model status: {model_status}")
print(f"Loaded models: {model_list if model_list else 'None'}")

# Step 3: Check if models directory exists and has files
if API_KEY:
    print("\nStep 2: Checking diagnostics endpoint for model details...")
    diag_response = requests.get(f"{BASE_URL}/api/diagnostics", headers={"x-api-key": API_KEY})
    
    if diag_response.status_code == 200:
        diag_data = diag_response.json()
        if "models" in diag_data:
            print(f"Model info from diagnostics: {json.dumps(diag_data['models'], indent=2)}")
        else:
            print("No detailed model info available in diagnostics response")
    else:
        print(f"❌ Failed to access diagnostics: {diag_response.status_code}")
        print(f"Response: {diag_response.text[:100]}")

# Step 4: Try to force model loading
if API_KEY:
    print("\nStep 3: Attempting to trigger model loading via prediction...")
    try:
        payload = {
            "query": "predict crime rates for next month",
            "visualizationType": "HOTSPOT",
            "forceModelReload": True  # Add this hint to potentially force model loading
        }
        
        pred_response = requests.post(
            f"{BASE_URL}/api/predict",
            headers={"Content-Type": "application/json", "x-api-key": API_KEY},
            json=payload,
            timeout=30  # Allow longer timeout for model loading
        )
        
        print(f"Prediction response: {pred_response.status_code}")
        if pred_response.status_code == 200:
            pred_data = pred_response.json()
            print(f"Model used: {pred_data.get('model_type', 'unknown')}")
            print(f"Prediction successful: {len(pred_data.get('predictions', []))} values returned")
        else:
            print(f"Response: {pred_response.text[:200]}")
    except Exception as e:
        print(f"Error during prediction request: {str(e)}")

# Step 5: Check for errors in load_models function
print("\nStep 4: Diagnosis")
print("Based on the results:")

if model_status == "error" and not model_list:
    print("💡 Problem: Models are not loading at all")
    print("Possible causes:")
    print("1. Models directory is missing or empty")
    print("2. load_models() function is not being called during startup")
    print("3. Exception occurring during model loading")
    print("4. Models might be loaded by a separate worker service")
    
    print("\nSuggested fixes:")
    print("1. Check if models/ directory exists and has proper model files")
    print("2. Verify that load_models() is called in app.py startup code")
    print("3. Check the service logs for Python exceptions during startup")
    print("4. Connect to the worker service to check its status")
elif model_status == "error" and model_list:
    print("💡 Problem: Models are partially loaded, but something went wrong")
    print("Possible causes:")
    print("1. Some model files are missing or corrupted")
    print("2. Insufficient memory for all models")
    print("3. Problems with SHAP explainer initialization")
else:
    print("💡 Unexpected state. See the raw responses above for clues.")

print("\nRemember to check the service logs in the Render dashboard for more details.") 