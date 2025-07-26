#!/usr/bin/env python3
"""
ML Microservice Test Suite

This script tests the ML microservice for:
1. Redis connectivity
2. API endpoint health and functionality
3. Error handling

It provides detailed reporting on any issues found.
"""

import os
import sys
import time
import json
import requests
import datetime
import subprocess
import threading
import queue
import argparse

# Define constants
DEFAULT_BASE_URL = "http://localhost:5000"
DEFAULT_API_KEY = "your_api_key"  # Replace with real API key when testing
DEFAULT_TIMEOUT = 30

def log(msg):
    """Helper function for logging with timestamps"""
    timestamp = datetime.datetime.now().isoformat()
    print(f"[{timestamp}] {msg}")

def test_redis_connection():
    """Test Redis connectivity using environment variables"""
    try:
        # Check if Redis environment variables are set
        log("Checking Redis environment variables...")
        redis_url = os.environ.get('REDIS_URL')
        redis_timeout = os.environ.get('REDIS_TIMEOUT', '5')
        
        # Log masked Redis URL
        if redis_url:
            parts = redis_url.split('@')
            if len(parts) > 1:
                protocol_and_auth = parts[0].split(':')
                if len(protocol_and_auth) > 2:  # Has username and password
                    masked_url = f"{protocol_and_auth[0]}:{protocol_and_auth[1]}:***@{parts[1]}"
                else:  # Just has password
                    masked_url = f"{protocol_and_auth[0]}:***@{parts[1]}"
            else:
                masked_url = redis_url
        else:
            masked_url = "Not set"
            
        log(f"REDIS_URL: {masked_url}")
        log(f"REDIS_TIMEOUT: {redis_timeout}")
        
        if not redis_url:
            log("⚠️ WARNING: REDIS_URL environment variable is not set")
            return False
        
        # Check if redis module is available
        log("Checking if redis module is installed...")
        try:
            import redis
            log("Redis module is installed.")
        except ImportError:
            log("Redis module not found. Installing...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "redis"])
            import redis
            log("Redis module installed successfully.")
        
        # Create Redis client with timeout handling
        log("Creating Redis client...")
        # Use a thread and queue with timeout to prevent hanging
        result_queue = queue.Queue()
        
        def connect_with_timeout():
            try:
                client = redis.from_url(
                    redis_url,
                    socket_timeout=int(redis_timeout),
                    socket_connect_timeout=int(redis_timeout),
                    decode_responses=True  # Auto-decode responses
                )
                
                # Test PING operation
                log("Testing PING operation...")
                start_ping = time.time()
                ping_result = client.ping()
                ping_time = (time.time() - start_ping) * 1000
                log(f"PING operation completed in {ping_time:.2f}ms. Result: {ping_result}")
                
                # Test SET operation
                log("Testing SET operation...")
                start_set = time.time()
                set_result = client.set('connection_test', f'Connection successful at {datetime.datetime.now().isoformat()}')
                set_time = (time.time() - start_set) * 1000
                log(f"SET operation completed in {set_time:.2f}ms. Result: {set_result}")
                
                # Test GET operation
                log("Testing GET operation...")
                start_get = time.time()
                value = client.get('connection_test')
                get_time = (time.time() - start_get) * 1000
                log(f"GET operation completed in {get_time:.2f}ms. Value: {value}")
                
                # Close the connection
                log("Closing Redis connection...")
                client.close()
                log("Redis connection closed successfully")
                
                # Put success in the queue
                result_queue.put(True)
            except Exception as e:
                # Put the error in the queue
                result_queue.put(e)
        
        # Start the thread
        log("Attempting to connect to Redis with timeout protection...")
        thread = threading.Thread(target=connect_with_timeout)
        thread.daemon = True
        thread.start()
        
        # Wait for result with timeout
        try:
            result = result_queue.get(timeout=15)  # 15 second timeout
            if result is True:
                log("✅ REDIS CONNECTIVITY: Successful")
                return True
            else:
                # If we got an exception, raise it
                raise result
        except queue.Empty:
            raise Exception("Connection test timed out after 15 seconds")
            
    except Exception as error:
        log(f"❌ REDIS ERROR: {str(error)}")
        log("Redis connection test failed")
        return False

def test_endpoint(base_url, endpoint, api_key=None, timeout=DEFAULT_TIMEOUT, method="GET", data=None):
    """Test a specific endpoint with timeout handling"""
    url = f"{base_url}/{endpoint}"
    headers = {
        "User-Agent": "Python/Requests TestClient",
        "Accept": "application/json"
    }
    
    if api_key:
        headers["x-api-key"] = api_key
    
    log(f"Testing {method} {url}")
    log(f"Headers: {headers}")
    log(f"Timeout: {timeout} seconds")
    
    try:
        start_time = time.time()
        
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, timeout=timeout)
        elif method.upper() == "POST":
            response = requests.post(url, headers=headers, json=data, timeout=timeout)
        else:
            log(f"Unsupported method: {method}")
            return False, None, "Unsupported method"
        
        elapsed = time.time() - start_time
        log(f"Response time: {elapsed:.2f} seconds")
        log(f"Status code: {response.status_code}")
        
        try:
            json_response = response.json()
            log(f"Response body: {json.dumps(json_response, indent=2)}")
            return response.status_code < 400, json_response, None  # Return success, data, error
        except Exception as e:
            log(f"Response text: {response.text[:500]}")
            return response.status_code < 400, response.text, None
    
    except requests.exceptions.Timeout:
        error_msg = f"Request timed out after {timeout} seconds"
        log(error_msg)
        return False, None, error_msg
    except requests.exceptions.RequestException as e:
        error_msg = f"Request error: {e}"
        log(error_msg)
        return False, None, error_msg

def run_api_tests(base_url, api_key):
    """Run a series of tests against the microservice API"""
    results = {}
    
    # Test 1: Health check endpoint
    log("\n========== TEST 1: HEALTH ENDPOINT ==========")
    success, data, error = test_endpoint(base_url, "api/health")
    results["health_endpoint"] = {
        "success": success,
        "data": data,
        "error": error
    }
    
    # Test 2: Prediction endpoint with auth
    log("\n========== TEST 2: PREDICT ENDPOINT (AUTH) ==========")
    test_data = {
        "query": "predict crime rates for next month in downtown area",
        "visualizationType": "HOTSPOT",
        "layerData": {"type": "FeatureCollection", "features": []},
        "spatialConstraints": {"bbox": [-122.4, 37.7, -122.3, 37.8]},
        "temporalRange": {
            "start": "2023-01-01",
            "end": "2023-12-31"
        }
    }
    success, data, error = test_endpoint(
        base_url, 
        "api/predict", 
        api_key=api_key, 
        method="POST", 
        data=test_data, 
        timeout=60
    )
    results["predict_endpoint_auth"] = {
        "success": success,
        "data": data,
        "error": error
    }
    
    # Test 3: Prediction endpoint without auth (should fail with 401)
    log("\n========== TEST 3: PREDICT ENDPOINT (NO AUTH) ==========")
    success, data, error = test_endpoint(
        base_url, 
        "api/predict", 
        method="POST", 
        data=test_data,
        timeout=30
    )
    # In this case, we expect a 401, so success should be False
    results["predict_endpoint_no_auth"] = {
        "success": not success,  # This test should fail with 401
        "data": data,
        "error": error
    }
    
    # Test 4: Prediction with different visualization type
    log("\n========== TEST 4: PREDICT WITH DIFFERENT VISUALIZATION ==========")
    test_data["visualizationType"] = "MULTIVARIATE"
    test_data["query"] = "analyze correlation between variables"
    success, data, error = test_endpoint(
        base_url, 
        "api/predict", 
        api_key=api_key, 
        method="POST", 
        data=test_data,
        timeout=60
    )
    results["predict_multivariate"] = {
        "success": success,
        "data": data,
        "error": error
    }
    
    # Count successes and failures
    successes = sum(1 for test in results.values() if test["success"])
    failures = len(results) - successes
    
    # Summary
    log("\n========== API TEST SUMMARY ==========")
    log(f"Tests passed: {successes}/{len(results)}")
    log(f"Tests failed: {failures}/{len(results)}")
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result["success"] else "❌ FAILED"
        log(f"{test_name}: {status}")
        if not result["success"] and result["error"]:
            log(f"  Error: {result['error']}")
    
    return results, failures == 0

def run_all_tests(args):
    """Run all tests and produce a comprehensive report"""
    log("Starting ML microservice test suite...")
    
    test_results = {
        "timestamp": datetime.datetime.now().isoformat(),
        "base_url": args.url,
        "tests": {}
    }
    
    # Test Redis connectivity
    redis_success = test_redis_connection()
    test_results["tests"]["redis_connectivity"] = {
        "success": redis_success
    }
    
    # Test API endpoints
    api_results, api_success = run_api_tests(args.url, args.api_key)
    test_results["tests"]["api"] = api_results
    
    # Overall success/failure
    overall_success = redis_success and api_success
    test_results["overall_success"] = overall_success
    
    log("\n========== FINAL TEST SUMMARY ==========")
    log(f"Redis connectivity: {'✅ PASSED' if redis_success else '❌ FAILED'}")
    log(f"API tests: {'✅ PASSED' if api_success else '❌ FAILED'}")
    log(f"Overall: {'✅ PASSED' if overall_success else '❌ FAILED'}")
    
    # Save report to file
    report_file = "ml_service_test_report.json"
    with open(report_file, "w") as f:
        json.dump(test_results, f, indent=2)
    log(f"Detailed test report saved to {report_file}")
    
    return overall_success

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ML Microservice Test Suite")
    parser.add_argument("--url", default=DEFAULT_BASE_URL, help="Base URL of the microservice")
    parser.add_argument("--api-key", default=DEFAULT_API_KEY, help="API key for authenticated endpoints")
    args = parser.parse_args()
    
    success = run_all_tests(args)
    
    if success:
        log("\n🎉 All tests PASSED!")
        sys.exit(0)
    else:
        log("\n❌ Some tests FAILED - See report for details")
        sys.exit(1) 