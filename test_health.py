import requests
import time

url = "https://nesto-mortgage-analytics.onrender.com/health"
api_key = "HFqkccbN3LV5CaB"  # API key from the code

headers = {
    'User-Agent': 'Mozilla/5.0',
    'Accept': 'application/json',
    'x-api-key': api_key  # Using lowercase header as in the fixed code
}

print(f"Sending authenticated request to {url}...")
print(f"Using API key: {api_key[:3]}...{api_key[-3:]}")
try:
    start_time = time.time()
    r = requests.get(url, headers=headers, timeout=20)
    elapsed = time.time() - start_time
    print(f"Status: {r.status_code}")
    print(f"Response time: {elapsed:.2f} seconds")
    print(f"Response body: {r.text}")
except Exception as e:
    print(f"Error: {e}") 