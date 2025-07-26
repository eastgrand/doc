import requests
import time

url = "https://nesto-mortgage-analytics.onrender.com/ping"
headers = {
    'User-Agent': 'Mozilla/5.0',
    'Accept': 'application/json'
}

print(f"Sending request to {url}...")
try:
    start_time = time.time()
    r = requests.get(url, headers=headers, timeout=15)
    elapsed = time.time() - start_time
    print(f"Status: {r.status_code}")
    print(f"Response time: {elapsed:.2f} seconds")
    print(f"Response body: {r.text}")
except Exception as e:
    print(f"Error: {e}") 