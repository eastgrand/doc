#!/usr/bin/env python3
"""
ML Service Health Check

This script can be pasted directly into the Render console to check:
1. Redis connectivity
2. Environment variables
3. Service functionality

USAGE:
1. Go to Render dashboard
2. Open your ML Analytics service Shell
3. Copy and paste this entire script
4. Press Enter to run
"""

import os
import sys
import time
import json
import datetime
import subprocess
import threading
import queue
import requests

# Helper function for logging with timestamps
def log(msg):
    timestamp = datetime.datetime.now().isoformat()
    print(f"[{timestamp}] {msg}")

def check_environment_variables():
    """Check critical environment variables"""
    log("Checking environment variables...")
    
    # Critical variables
    critical_vars = ["PORT", "API_KEY", "REDIS_URL"]
    optional_vars = ["REDIS_TIMEOUT", "REDIS_SOCKET_KEEPALIVE", "REDIS_CONNECTION_POOL_SIZE", 
                    "REDIS_HEALTH_CHECK_INTERVAL", "REDIS_CONNECT_TIMEOUT", "REDIS_RETRY_ON_TIMEOUT",
                    "REDIS_CACHE_TTL", "CACHE_ENABLED", "DEBUG"]
    
    # Check critical vars
    missing_critical = []
    for var in critical_vars:
        value = os.environ.get(var)
        if value:
            # Mask sensitive values
            if var in ["API_KEY", "REDIS_URL"]:
                if var == "REDIS_URL" and ":" in value and "@" in value:
                    parts = value.split("@")
                    if len(parts) > 1:
                        masked = f"{parts[0].split(':')[0]}:***@{parts[1]}"
                    else:
                        masked = "***"
                else:
                    masked = "***"
                log(f"✓ {var} is set to: {masked}")
            else:
                log(f"✓ {var} is set to: {value}")
        else:
            missing_critical.append(var)
            log(f"✗ {var} is not set")
    
    # Check optional vars
    for var in optional_vars:
        value = os.environ.get(var)
        if value:
            log(f"✓ {var} is set to: {value}")
        else:
            log(f"- {var} is not set (optional)")
    
    if missing_critical:
        log(f"⚠️ WARNING: Missing critical environment variables: {', '.join(missing_critical)}")
        return False
    
    log("✅ All critical environment variables are set")
    return True

def check_redis_connection():
    """Test Redis connectivity"""
    log("Testing Redis connectivity...")
    
    redis_url = os.environ.get('REDIS_URL')
    if not redis_url:
        log("❌ REDIS_URL is not set, skipping Redis test")
        return False
    
    # Check if redis module is installed
    try:
        log("Checking if redis package is installed...")
        import redis
        log("✓ Redis package is installed")
    except ImportError:
        log("✗ Redis package not installed, installing...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "redis==4.6.0"])
            import redis
            log("✓ Redis package installed successfully")
        except Exception as e:
            log(f"❌ Failed to install Redis package: {str(e)}")
            return False
    
    # Test Redis connection with timeout handling
    result_queue = queue.Queue()
    
    def connect_with_timeout():
        try:
            # Get connection parameters
            redis_timeout = int(os.environ.get('REDIS_TIMEOUT', '5'))
            
            # Create client
            client = redis.from_url(
                redis_url,
                socket_timeout=redis_timeout,
                socket_connect_timeout=redis_timeout,
                decode_responses=True
            )
            
            # Test connection
            log("Testing PING operation...")
            start = time.time()
            result = client.ping()
            ping_time = (time.time() - start) * 1000
            log(f"✓ PING successful in {ping_time:.2f}ms")
            
            # Test SET/GET
            log("Testing SET/GET operations...")
            start = time.time()
            test_key = f"health_check:{datetime.datetime.now().isoformat()}"
            test_value = f"Service health check at {datetime.datetime.now().isoformat()}"
            
            # SET
            client.setex(test_key, 60, test_value)  # 60 second expiry
            
            # GET
            retrieved = client.get(test_key)
            
            # Verify
            if retrieved == test_value:
                op_time = (time.time() - start) * 1000
                log(f"✓ SET/GET successful in {op_time:.2f}ms")
                # Clean up
                client.delete(test_key)
                result_queue.put(True)
            else:
                log(f"✗ SET/GET failed. Expected '{test_value}', got '{retrieved}'")
                result_queue.put(Exception("SET/GET verification failed"))
        
        except Exception as e:
            log(f"❌ Redis connection error: {str(e)}")
            result_queue.put(e)
    
    # Run the test with timeout protection
    thread = threading.Thread(target=connect_with_timeout)
    thread.daemon = True
    thread.start()
    
    # Wait for result with timeout
    try:
        result = result_queue.get(timeout=15)
        if result is True:
            log("✅ Redis connection test successful")
            return True
        else:
            # If we got an exception, it was already logged
            return False
    except queue.Empty:
        log("❌ Redis connection test timed out after 15 seconds")
        return False

def check_service_health():
    """Check if the service is responding correctly"""
    log("Testing service health endpoints...")
    
    # Determine the base URL
    port = os.environ.get('PORT', '5000')
    base_url = f"http://localhost:{port}"
    
    # Test ping endpoint (should not require auth)
    try:
        log(f"Testing ping endpoint: {base_url}/ping")
        response = requests.get(f"{base_url}/ping", timeout=10)
        if response.status_code == 200:
            log(f"✓ Ping successful. Status code: {response.status_code}")
            log(f"✓ Response: {json.dumps(response.json(), indent=2)}")
        else:
            log(f"✗ Ping failed. Status code: {response.status_code}")
            if response.text:
                log(f"  Response: {response.text[:500]}")
            return False
    except Exception as e:
        log(f"❌ Ping request error: {str(e)}")
        return False
        
    # Test health endpoint
    try:
        log(f"Testing health endpoint: {base_url}/api/health")
        response = requests.get(f"{base_url}/api/health", timeout=10)
        if response.status_code == 200:
            log(f"✓ Health check successful. Status code: {response.status_code}")
            log(f"✓ Response: {json.dumps(response.json(), indent=2)}")
            
            # Check if Redis is reporting as OK in the health check
            health_data = response.json()
            if "redis" in health_data and health_data["redis"]["status"] == "ok":
                log("✓ Redis status reported as OK in health check")
            elif "redis" in health_data:
                log(f"⚠️ Redis status reported as: {health_data['redis']['status']}")
            else:
                log("⚠️ Redis status not included in health check response")
                
            # Check if models are loaded
            if "models" in health_data and health_data["models"]:
                log(f"✓ {len(health_data['models'])} models loaded: {', '.join(health_data['models'])}")
            else:
                log("⚠️ No models reported in health check")
        else:
            log(f"✗ Health check failed. Status code: {response.status_code}")
            if response.text:
                log(f"  Response: {response.text[:500]}")
            return False
    except Exception as e:
        log(f"❌ Health check request error: {str(e)}")
        return False
    
    # If we have an API key, test an authenticated endpoint
    api_key = os.environ.get('API_KEY')
    if api_key:
        try:
            log("Testing prediction endpoint with authentication")
            
            # Prepare test data
            test_data = {
                "query": "predict crime rates for downtown area",
                "visualizationType": "HOTSPOT",
                "layerData": {"type": "FeatureCollection", "features": []},
                "temporalRange": {
                    "start": "2023-01-01",
                    "end": "2023-12-31"
                }
            }
            
            headers = {
                "Content-Type": "application/json",
                "x-api-key": api_key
            }
            
            # Make request with longer timeout
            response = requests.post(
                f"{base_url}/api/predict",
                headers=headers,
                json=test_data,
                timeout=30
            )
            
            if response.status_code == 200:
                log(f"✓ Prediction successful. Status code: {response.status_code}")
                response_data = response.json()
                
                # Log key parts of the response
                if "predictions" in response_data:
                    log(f"✓ Received predictions: {response_data['predictions'][:5]}...")
                if "processing_time" in response_data:
                    log(f"✓ Processing time: {response_data['processing_time']:.2f}s")
                if "model_type" in response_data:
                    log(f"✓ Model used: {response_data['model_type']}")
                if "cached" in response_data:
                    log(f"✓ Response from cache: {response_data['cached']}")
            else:
                log(f"✗ Prediction failed. Status code: {response.status_code}")
                if response.text:
                    log(f"  Response: {response.text[:500]}")
                return False
        except Exception as e:
            log(f"❌ Prediction request error: {str(e)}")
            return False

    # All tests passed
    log("✅ Service health check successful")
    return True

def run_diagnostics():
    """Run all diagnostic checks"""
    log("=== ML SERVICE HEALTH CHECK STARTING ===")
    
    # Get system information
    log("\n=== SYSTEM INFORMATION ===")
    log(f"Python version: {sys.version}")
    log(f"Current working directory: {os.getcwd()}")
    
    # Check environment variables
    log("\n=== ENVIRONMENT VARIABLES ===")
    env_vars_ok = check_environment_variables()
    
    # Check Redis connection
    log("\n=== REDIS CONNECTIVITY ===")
    redis_ok = check_redis_connection()
    
    # Check service health
    log("\n=== SERVICE HEALTH ===")
    service_ok = check_service_health()
    
    # Final summary
    log("\n=== DIAGNOSTIC SUMMARY ===")
    log(f"Environment variables: {'✅ OK' if env_vars_ok else '❌ ISSUES FOUND'}")
    log(f"Redis connectivity: {'✅ OK' if redis_ok else '❌ ISSUES FOUND'}")
    log(f"Service health: {'✅ OK' if service_ok else '❌ ISSUES FOUND'}")
    
    overall_ok = env_vars_ok and redis_ok and service_ok
    log(f"\nOVERALL HEALTH: {'✅ HEALTHY' if overall_ok else '❌ ISSUES DETECTED'}")
    
    # Suggestions if there are issues
    if not overall_ok:
        log("\n=== TROUBLESHOOTING SUGGESTIONS ===")
        
        if not env_vars_ok:
            log("1. Check that all critical environment variables are set in the Render dashboard")
            log("   - Go to Dashboard > Your Service > Environment")
            log("   - Ensure REDIS_URL, API_KEY, and PORT are set correctly")
        
        if not redis_ok:
            log("2. Redis connectivity issues:")
            log("   - Verify the REDIS_URL is correct")
            log("   - Check if Redis server is running and accessible from Render")
            log("   - Try increasing REDIS_TIMEOUT (current value or default: 5 seconds)")
            log("   - Check Upstash dashboard for connection limits or errors")
        
        if not service_ok:
            log("3. Service health issues:")
            log("   - Check application logs for errors")
            log("   - Verify API endpoints are correctly implemented")
            log("   - Ensure all dependencies are installed properly")
            log("   - Try restarting the service")

# Run all diagnostics
if __name__ == "__main__":
    run_diagnostics() 