#!/usr/bin/env python3
import requests
import json
import sys
import time
from datetime import datetime

# Configuration
BASE_URL = "https://nesto-mortgage-analytics.onrender.com"  # Update if different
API_KEY = "UxWPZp6B0JyNe5vT"  # Actual API key

# Colors for terminal output
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
RESET = "\033[0m"
BOLD = "\033[1m"

def print_response(title, response, show_full=False):
    """Format and print response information"""
    status_color = GREEN if response.status_code < 300 else (YELLOW if response.status_code < 400 else RED)
    
    print(f"\n{BOLD}=== {title} ==={RESET}")
    print(f"Status: {status_color}{response.status_code} {response.reason}{RESET}")
    print(f"Time: {response.elapsed.total_seconds():.3f}s")
    
    try:
        data = response.json()
        if show_full:
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            # Print a condensed version
            if isinstance(data, dict):
                if "status" in data:
                    status = data.get("status")
                    status_color = GREEN if status == "ok" else YELLOW
                    print(f"Status: {status_color}{status}{RESET}")
                
                # Show Redis status if present
                if "components" in data and "redis" in data["components"]:
                    redis_status = data["components"]["redis"]["status"]
                    redis_color = GREEN if redis_status == "ok" else (YELLOW if redis_status != "error" else RED)
                    print(f"Redis: {redis_color}{redis_status}{RESET}")
                
                # Show shortened response
                print(f"Response keys: {list(data.keys())}")
            else:
                print(f"Response: {data}")
    except ValueError:
        print(f"Response: {response.text[:100]}")
    
    print(f"{BOLD}{'=' * (len(title) + 8)}{RESET}")
    return response

def test_ping():
    """Test the basic ping endpoint"""
    print("\n🔍 Testing basic ping endpoint...")
    response = requests.get(f"{BASE_URL}/ping")
    return print_response("PING", response, show_full=True)

def test_health():
    """Test the health endpoint"""
    print("\n🔍 Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/api/health")
    return print_response("HEALTH", response, show_full=True)

def test_diagnostics(api_key):
    """Test the diagnostics endpoint"""
    print("\n🔍 Testing diagnostics endpoint...")
    headers = {"x-api-key": api_key} if api_key else {}
    response = requests.get(f"{BASE_URL}/api/diagnostics", headers=headers)
    
    if response.status_code == 401 and not api_key:
        print(f"{YELLOW}Authentication required for diagnostics. Skipping.{RESET}")
        return None
    
    return print_response("DIAGNOSTICS", response, show_full=True)

def test_prediction(api_key):
    """Test the prediction endpoint"""
    print("\n🔍 Testing prediction endpoint...")
    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key
    } if api_key else {"Content-Type": "application/json"}
    
    payload = {
        "query": "predict crime rates for next month in downtown area",
        "visualizationType": "HOTSPOT",
        "layerData": {},
        "temporalRange": {
            "start": "2023-01-01",
            "end": "2023-12-31"
        }
    }
    
    response = requests.post(
        f"{BASE_URL}/api/predict",
        headers=headers,
        json=payload
    )
    
    if response.status_code == 401 and not api_key:
        print(f"{YELLOW}Authentication required for prediction. Skipping.{RESET}")
        return None
    
    return print_response("PREDICTION", response, show_full=True)

def test_redis_reconnect(api_key):
    """Test the Redis reconnect endpoint"""
    print("\n🔍 Testing Redis reconnect endpoint...")
    headers = {"x-api-key": api_key} if api_key else {}
    response = requests.post(f"{BASE_URL}/api/redis/reconnect", headers=headers)
    
    if response.status_code == 401 and not api_key:
        print(f"{YELLOW}Authentication required for Redis reconnect. Skipping.{RESET}")
        return None
    
    return print_response("REDIS RECONNECT", response, show_full=True)

def main():
    """Run all tests"""
    print(f"{BOLD}{GREEN}🚀 TESTING DEPLOYED MICROSERVICE - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{RESET}")
    print(f"Target: {BOLD}{BASE_URL}{RESET}")
    
    # First try all endpoints without API key
    api_key = API_KEY
    
    # Basic tests that should work without authentication
    ping_response = test_ping()
    health_response = test_health()
    
    # Tests that might need authentication
    diag_response = test_diagnostics(api_key)
    pred_response = test_prediction(api_key)
    redis_response = test_redis_reconnect(api_key)
    
    # Check if auth was required but not provided
    auth_required = any(r and r.status_code == 401 for r in [diag_response, pred_response, redis_response])
    
    if auth_required and api_key == "test_key":
        print(f"\n{YELLOW}Some endpoints require authentication.{RESET}")
        api_key = input("Enter API key (or press enter to skip): ").strip()
        
        if api_key:
            print(f"\n{GREEN}Retrying authenticated endpoints...{RESET}")
            if diag_response and diag_response.status_code == 401:
                test_diagnostics(api_key)
            if pred_response and pred_response.status_code == 401:
                test_prediction(api_key)
            if redis_response and redis_response.status_code == 401:
                test_redis_reconnect(api_key)
    
    # Summary
    print(f"\n{BOLD}{GREEN}✅ TEST SUMMARY{RESET}")
    print(f"Basic Health (ping): {'✅' if ping_response.status_code < 300 else '❌'}")
    print(f"Health Check: {'✅' if health_response.status_code < 300 else '❌'}")
    
    # Check if Redis is healthy
    redis_status = "Unknown"
    try:
        health_data = health_response.json()
        if "components" in health_data and "redis" in health_data["components"]:
            redis_status = health_data["components"]["redis"]["status"]
    except:
        pass
    
    print(f"Redis Status: {GREEN if redis_status == 'ok' else YELLOW}{redis_status}{RESET}")
    print(f"\n{BOLD}Tests completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{RESET}")

if __name__ == "__main__":
    main() 