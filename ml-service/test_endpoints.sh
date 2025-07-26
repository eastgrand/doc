#!/bin/bash
# ML Service Endpoint Tester
# This script tests all endpoints of the ML microservice

# Configuration
BASE_URL="${1:-http://localhost:5000}"  # First argument or default to localhost
API_KEY="${2:-your_api_key}"            # Second argument or default
TIMEOUT=30                              # Request timeout in seconds

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
timestamp() {
  date +"%Y-%m-%dT%H:%M:%S.%3N"
}

log() {
  echo -e "${BLUE}[$(timestamp)]${NC} $1"
}

success() {
  echo -e "${GREEN}[✓] $1${NC}"
}

warning() {
  echo -e "${YELLOW}[!] $1${NC}"
}

error() {
  echo -e "${RED}[✗] $1${NC}"
}

# Main test function
test_endpoint() {
  local method=$1
  local endpoint=$2
  local auth=$3
  local data=$4
  local endpoint_name=$5
  
  log "Testing ${endpoint_name}..."
  
  # Build the curl command
  curl_cmd="curl -s -X ${method} -m ${TIMEOUT} -w '%{http_code}|%{time_total}' -H 'Content-Type: application/json'"
  
  # Add auth header if needed
  if [ "$auth" = "yes" ]; then
    curl_cmd="$curl_cmd -H 'x-api-key: ${API_KEY}'"
  fi
  
  # Add data if provided
  if [ -n "$data" ]; then
    curl_cmd="$curl_cmd -d '$data'"
  fi
  
  # Complete the command with the URL
  curl_cmd="$curl_cmd ${BASE_URL}/${endpoint}"
  
  log "Running: $curl_cmd"
  
  # Execute the request
  result=$(eval $curl_cmd)
  
  # Parse the response
  http_code=$(echo $result | sed 's/.*|//')
  time_total=$(echo $result | sed 's/|.*//')
  response_body=$(echo $result | sed 's/|[^|]*$//')
  
  # Check if the request was successful
  if [[ $http_code -ge 200 && $http_code -lt 300 ]]; then
    success "HTTP Status: $http_code (in ${time_total}s)"
    echo "$response_body" | jq . || echo "$response_body"
    return 0
  else
    error "HTTP Status: $http_code (in ${time_total}s)"
    echo "$response_body" | jq . 2>/dev/null || echo "$response_body"
    return 1
  fi
}

# Print banner
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}    ML Service Endpoint Tester        ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""
log "Testing against: $BASE_URL"
log "API Key: ${API_KEY:0:3}...${API_KEY: -3}"

# Check for jq
if ! command -v jq &> /dev/null; then
  warning "jq not found. JSON responses will not be formatted."
fi

# Test 1: Ping endpoint (no auth)
echo ""
echo -e "${BLUE}=== Test 1: Ping Endpoint (No Auth) ===${NC}"
if test_endpoint "GET" "ping" "no" "" "Ping endpoint"; then
  success "Ping test passed"
else
  error "Ping test failed"
fi

# Test 2: Health check endpoint (no auth needed for this one)
echo ""
echo -e "${BLUE}=== Test 2: Health Check ===${NC}"
if test_endpoint "GET" "api/health" "no" "" "Health check endpoint"; then
  success "Health check passed"
else
  error "Health check failed"
fi

# Test 3: Predict endpoint with auth
echo ""
echo -e "${BLUE}=== Test 3: Predict Endpoint (With Auth) ===${NC}"
test_data='{
  "query": "predict crime rates for next month in downtown area",
  "visualizationType": "HOTSPOT",
  "layerData": {
    "type": "FeatureCollection",
    "features": []
  },
  "spatialConstraints": {
    "bbox": [-122.4, 37.7, -122.3, 37.8]
  },
  "temporalRange": {
    "start": "2023-01-01",
    "end": "2023-12-31"
  }
}'
if test_endpoint "POST" "api/predict" "yes" "$test_data" "Prediction endpoint (with auth)"; then
  success "Prediction test passed"
else
  error "Prediction test failed"
fi

# Test 4: Predict endpoint without auth (should fail with 401)
echo ""
echo -e "${BLUE}=== Test 4: Predict Endpoint (No Auth) ===${NC}"
if ! test_endpoint "POST" "api/predict" "no" "$test_data" "Prediction endpoint (no auth)"; then
  success "Auth check passed (unauthorized access correctly rejected)"
else
  error "Auth check failed (service allowed unauthorized access)"
fi

# Test 5: Cache clear endpoint
echo ""
echo -e "${BLUE}=== Test 5: Cache Clear ===${NC}"
if test_endpoint "POST" "api/cache/clear" "yes" "" "Cache clear endpoint"; then
  success "Cache clear test passed"
else
  error "Cache clear test failed"
fi

# Test 6: Different visualization type
echo ""
echo -e "${BLUE}=== Test 6: Different Visualization Type ===${NC}"
test_data='{
  "query": "analyze correlation between crime and income",
  "visualizationType": "MULTIVARIATE",
  "layerData": {
    "type": "FeatureCollection",
    "features": []
  },
  "temporalRange": {
    "start": "2023-01-01",
    "end": "2023-12-31"
  }
}'
if test_endpoint "POST" "api/predict" "yes" "$test_data" "Multivariate prediction"; then
  success "Multivariate test passed"
else
  error "Multivariate test failed"
fi

# Summary
echo ""
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}    Test Suite Complete               ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""
log "Remember to check the actual responses to verify correctness."
log "For Redis connectivity issues, run service_health_check.py" 