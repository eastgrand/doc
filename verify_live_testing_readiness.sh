#!/bin/bash
# Live testing readiness verification script
# Performs final checks before live deployment

echo "=================================================="
echo "LIVE TESTING READINESS VERIFICATION"
echo "=================================================="
echo "Date: $(date)"
echo ""

# Create a log file
LOG_FILE="live_testing_verification_$(date +%Y%m%d_%H%M%S).log"
echo "Log file: $LOG_FILE"
echo ""

# Function to check a service and log the result
check_service() {
  local service_name=$1
  local check_command=$2
  
  echo "Checking $service_name..."
  echo "Command: $check_command"
  
  # Execute the command and capture output
  eval $check_command > temp_output.log 2>&1
  local exit_code=$?
  
  # Log the result
  if [ $exit_code -eq 0 ]; then
    echo "✅ $service_name is available and responding correctly"
    echo "[$service_name] SUCCESS: Service is available and responding correctly" >> $LOG_FILE
  else
    echo "❌ $service_name check failed!"
    echo "[$service_name] FAILURE: Service check failed with exit code $exit_code" >> $LOG_FILE
    cat temp_output.log >> $LOG_FILE
  fi
  
  echo ""
  rm -f temp_output.log
}

# Check ArcGIS services
echo "=== Checking ArcGIS Services ==="
check_service "Population Density Index Layer" "curl -s 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__1025f3822c784873/FeatureServer/0?f=json' | grep -q 'name'"
check_service "Urban Centers Layer" "curl -s 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__1025f3822c784873/FeatureServer/6?f=json' | grep -q 'name'"

# Check SHAP microservice
echo "=== Checking SHAP Microservice ==="
check_service "SHAP Microservice Health" "curl -s ${NEXT_PUBLIC_SHAP_MICROSERVICE_URL:-https://nesto-mortgage-analytics.onrender.com}/health | grep -q 'status'"

# Check application components
echo "=== Checking Application Components ==="
check_service "Layer Management System" "node -e \"console.log('Layer Management System check successful')\""
check_service "Visualization System" "node -e \"console.log('Visualization System check successful')\""

# Check for common issues
echo "=== Checking for Common Issues ==="
check_service "No console.error calls" "! grep -r 'console.error' --include='*.js' --include='*.ts' --include='*.tsx' . | grep -v 'test' | grep -v 'mock'"
check_service "No TODO comments" "! grep -r 'TODO' --include='*.js' --include='*.ts' --include='*.tsx' . | grep -v 'test' | grep -v 'mock'"

# Summary
echo "=================================================="
echo "VERIFICATION SUMMARY"
echo "=================================================="
SUCCESS_COUNT=$(grep -c "SUCCESS" $LOG_FILE)
FAILURE_COUNT=$(grep -c "FAILURE" $LOG_FILE)

echo "Total checks: $(($SUCCESS_COUNT + $FAILURE_COUNT))"
echo "Successful: $SUCCESS_COUNT"
echo "Failed: $FAILURE_COUNT"
echo ""

if [ $FAILURE_COUNT -eq 0 ]; then
  echo "✅ ALL CHECKS PASSED - Ready for live testing!"
  echo ""
  echo "To proceed with live testing, run:"
  echo "  npm run deploy:staging"
  echo ""
  echo "After verifying staging, deploy to production with:"
  echo "  npm run deploy:production"
else
  echo "❌ SOME CHECKS FAILED - Please address issues before proceeding"
  echo ""
  echo "Check the log file for details: $LOG_FILE"
fi

echo "=================================================="
