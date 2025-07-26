import requests
import time
import sys

BASE_URL = "https://nesto-mortgage-analytics.onrender.com"
API_KEY = "HFqkccbN3LV5CaB"  # The API key from the code

def test_endpoint(endpoint, api_key=None, timeout=30, method="GET", data=None):
    """Test a specific endpoint with timeout handling"""
    url = f"{BASE_URL}/{endpoint}"
    headers = {
        "User-Agent": "Python/Requests TestClient",
        "Accept": "application/json"
    }
    
    if api_key:
        headers["x-api-key"] = api_key
    
    print(f"\n=== Testing {method} {url} ===")
    print(f"Headers: {headers}")
    print(f"Timeout: {timeout} seconds")
    
    try:
        start_time = time.time()
        
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, timeout=timeout)
        elif method.upper() == "POST":
            response = requests.post(url, headers=headers, json=data, timeout=timeout)
        else:
            print(f"Unsupported method: {method}")
            return False
        
        elapsed = time.time() - start_time
        print(f"Response time: {elapsed:.2f} seconds")
        print(f"Status code: {response.status_code}")
        
        try:
            print(f"Response body: {response.json()}")
        except:
            print(f"Response text: {response.text[:500]}")
        
        return response.status_code < 400  # Return True for 2xx and 3xx status codes
    
    except requests.exceptions.Timeout:
        print(f"Request timed out after {timeout} seconds")
        return False
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return False

def run_tests():
    """Run a series of tests against the microservice"""
    successes = 0
    failures = 0
    
    # Test 1: Ping endpoint (no auth required)
    print("\n========== TEST 1: PING ENDPOINT (NO AUTH) ==========")
    if test_endpoint("ping", timeout=10):
        print("✅ Ping test PASSED")
        successes += 1
    else:
        print("❌ Ping test FAILED")
        failures += 1
    
    # Test 2: Health check (auth required)
    print("\n========== TEST 2: HEALTH ENDPOINT (AUTH) ==========")
    if test_endpoint("health", api_key=API_KEY, timeout=45):
        print("✅ Health check PASSED")
        successes += 1
    else:
        print("❌ Health check FAILED")
        failures += 1
    
    # Test 3: Metadata (auth required)
    print("\n========== TEST 3: METADATA ENDPOINT (AUTH) ==========")
    if test_endpoint("metadata", api_key=API_KEY, timeout=45):
        print("✅ Metadata test PASSED")
        successes += 1
    else:
        print("❌ Metadata test FAILED")
        failures += 1
    
    # Test 4: Analyze with minimal data (auth required)
    print("\n========== TEST 4: ANALYZE ENDPOINT (AUTH, POST) ==========")
    data = {
        "target_variable": "property_value",
        "analysis_type": "correlation"
    }
    if test_endpoint("analyze", api_key=API_KEY, method="POST", data=data, timeout=60):
        print("✅ Analyze test PASSED")
        successes += 1
    else:
        print("❌ Analyze test FAILED")
        failures += 1
    
    # Summary
    print("\n========== TEST SUMMARY ==========")
    print(f"Tests passed: {successes}/{successes + failures}")
    print(f"Tests failed: {failures}/{successes + failures}")
    
    return failures == 0  # Return True if all tests passed

if __name__ == "__main__":
    print("Starting microservice connectivity tests...")
    success = run_tests()
    
    if success:
        print("\n🎉 All tests PASSED!")
        sys.exit(0)
    else:
        print("\n❌ Some tests FAILED")
        sys.exit(1) 