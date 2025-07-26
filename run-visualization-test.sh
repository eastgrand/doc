#!/bin/bash
# Run the visualization flow test and log the output

echo "Running Query-to-Visualization Flow Test..."
echo "Test started at $(date)"

# Create log file with timestamp
LOG_FILE="visualization_flow_test_$(date +%Y%m%d_%H%M%S).log"

# Check if we're using Node.js or another runtime
if command -v node &> /dev/null; then
  echo "Using Node.js to run test..."
  node test-query-visualization-flow.js | tee "$LOG_FILE"
elif command -v ts-node &> /dev/null; then
  echo "Using ts-node to run test..."
  ts-node test-query-visualization-flow.js | tee "$LOG_FILE"
else
  echo "Error: Node.js or ts-node not found. Please install one of them to run the test."
  exit 1
fi

# Check if the test was successful
if grep -q "ALL TESTS PASSED" "$LOG_FILE"; then
  echo "✅ Test completed successfully!"
  echo "Log file: $LOG_FILE"
  echo "Ready for live testing."
else
  echo "❌ Test failed or did not complete successfully."
  echo "Check the log file for details: $LOG_FILE"
  echo "Fix any issues before proceeding with live testing."
fi
