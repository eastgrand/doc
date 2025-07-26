#!/bin/bash

# Script to test the SHAP service connectivity using curl with different header combinations

API_ENDPOINT="https://nesto-mortgage-analytics.onrender.com"
API_KEY="HFqkccbN3LV5CaB"
TIMEOUT=15  # 15 seconds timeout

# Log with timestamp
log() {
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $1"
}

# Test with a specific user agent and header combination
test_with_headers() {
  local path=$1
  local user_agent=$2
  shift 2
  local headers=("$@")
  
  # Build header args for curl
  local header_args=()
  for header in "${headers[@]}"; do
    header_args+=("-H" "$header")
  done
  
  # Add User-Agent header
  header_args+=("-H" "User-Agent: $user_agent")
  
  log "Testing $API_ENDPOINT$path with User-Agent: $user_agent"
  log "Headers: ${headers[*]}"
  
  # Run curl with specified headers and timeout
  curl -v --max-time $TIMEOUT "${header_args[@]}" "$API_ENDPOINT$path" 2>&1 | tee /tmp/curl-output.log
  
  # Check if the request timed out
  if grep -q "Operation timed out" /tmp/curl-output.log; then
    log "Request timed out after ${TIMEOUT} seconds"
  elif grep -q "Connection refused" /tmp/curl-output.log; then
    log "Connection refused"
  fi
  
  echo ""
  echo "------------------------------------------------------------------------"
  echo ""
}

# Main function to run all tests
main() {
  log "==== Starting CURL Tests ===="
  log "API Endpoint: $API_ENDPOINT"
  log "API Key: ${API_KEY:0:3}...${API_KEY: -3}"
  log "Timeout: $TIMEOUT seconds"
  echo ""
  
  # Test 1: Ping endpoint with default headers
  log "Test 1: Ping endpoint with default headers"
  test_with_headers "/ping" "curl/7.79.1" "Accept: */*"
  
  # Test 2: Ping endpoint with Firefox User-Agent
  log "Test 2: Ping endpoint with Firefox User-Agent"
  test_with_headers "/ping" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:98.0) Gecko/20100101 Firefox/98.0" "Accept: */*"
  
  # Test 3: Ping endpoint with Chrome User-Agent and JSON Accept
  log "Test 3: Ping endpoint with Chrome User-Agent and JSON Accept"
  test_with_headers "/ping" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36" "Accept: application/json"
  
  # Test 4: Health endpoint with API key
  log "Test 4: Health endpoint with API key"
  test_with_headers "/health" "Nesto-Curl-Test/1.0" "Accept: application/json" "X-API-KEY: $API_KEY"
  
  # Test 5: Health endpoint with different case for API key header
  log "Test 5: Health endpoint with different case for API key header"
  test_with_headers "/health" "Nesto-Curl-Test/1.0" "Accept: application/json" "x-api-key: $API_KEY"
  
  log "==== CURL Tests Complete ===="
}

# Run tests
main 