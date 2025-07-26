#!/usr/bin/env python3
"""
Test connection to the SHAP service using Python requests
"""

import os
import sys
import json
import time
import requests
from datetime import datetime

# Configuration
API_ENDPOINT = "https://nesto-mortgage-analytics.onrender.com"
API_KEY = os.environ.get("NEXT_PUBLIC_SHAP_API_KEY", "HFqkccbN3LV5CaB")
TIMEOUT = 30  # seconds

def log(message):
    """Log a message with timestamp"""
    timestamp = datetime.now().isoformat()
    print(f"[{timestamp}] {message}")

def make_request(path, method="GET", headers=None, json_data=None, timeout=TIMEOUT):
    """Make an HTTP request with proper error handling"""
    url = f"{API_ENDPOINT}{path}"
    
    if headers is None:
        headers = {}
    
    # Add default headers
    headers.update({
        "User-Agent": "Nesto-Python-Test/1.0",
        "Accept": "application/json"
    })
    
    # Add API key if not a ping endpoint
    if path != "/ping":
        headers["X-API-KEY"] = API_KEY
    
    log(f"Making {method} request to {url}")
    log(f"Headers: {json.dumps(headers)}")
    
    if json_data:
        log(f"Request body: {json.dumps(json_data)}")
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, timeout=timeout)
        elif method.upper() == "POST":
            response = requests.post(url, headers=headers, json=json_data, timeout=timeout)
        else:
            log(f"Unsupported HTTP method: {method}")
            return None
        
        log(f"Response status: {response.status_code}")
        log(f"Response headers: {dict(response.headers)}")
        
        # Try to parse as JSON
        try:
            result = response.json()
            log(f"Response body (JSON): {json.dumps(result, indent=2)}")
        except:
            log(f"Response body (text): {response.text}")
            result = {"text": response.text}
        
        return {
            "status": response.status_code,
            "headers": dict(response.headers),
            "body": result
        }
    except requests.exceptions.Timeout:
        log(f"Request timed out after {timeout} seconds")
        return None
    except requests.exceptions.RequestException as e:
        log(f"Request failed: {str(e)}")
        return None

def test_ping():
    """Test basic connectivity with /ping endpoint"""
    log("Testing ping endpoint...")
    result = make_request("/ping")
    if result and result["status"] == 200:
        log("Ping test successful!")
        return True
    else:
        log("Ping test failed!")
        return False

def test_health():
    """Test /health endpoint"""
    log("Testing health endpoint with API key...")
    result = make_request("/health")
    if result and result["status"] == 200:
        log("Health check successful!")
        return True
    else:
        log("Health check failed!")
        return False

def test_metadata():
    """Test /metadata endpoint"""
    log("Testing metadata endpoint with API key...")
    result = make_request("/metadata")
    if result and result["status"] == 200:
        log("Metadata check successful!")
        return True
    else:
        log("Metadata check failed!")
        return False

def test_submit_job():
    """Test job submission"""
    log("Testing job submission...")
    
    test_data = {
        "analysis_type": "correlation",
        "target_variable": "property_value",
        "comparison_variable": "mortgage_rate"
    }
    
    result = make_request("/analyze", method="POST", 
                          headers={"Content-Type": "application/json"}, 
                          json_data=test_data)
    
    if result and result["status"] == 202 and "job_id" in result["body"]:
        job_id = result["body"]["job_id"]
        log(f"Job submission successful! Job ID: {job_id}")
        return job_id
    else:
        log("Job submission failed!")
        return None

def main():
    """Main function to run tests"""
    log("==== Starting Python Connection Tests ====")
    log(f"API Endpoint: {API_ENDPOINT}")
    log(f"API Key: {API_KEY[:3]}...{API_KEY[-3:]}")
    
    # Test 1: Basic connectivity
    if test_ping():
        # Test 2: Health check
        test_health()
        
        # Test 3: Metadata
        test_metadata()
        
        # Test 4: Job submission
        job_id = test_submit_job()
        if job_id:
            log(f"Testing job status for job {job_id}...")
            # Would poll for job status here
    else:
        log("Basic connectivity test failed, not continuing with other tests")
    
    log("==== Python Connection Tests Complete ====")

if __name__ == "__main__":
    main() 