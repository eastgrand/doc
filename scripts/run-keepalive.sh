#!/bin/bash

# Kill any existing keep-alive processes
pkill -f "node scripts/keep-alive.js" || true

# Start the keep-alive script in the background with nohup
echo "Starting keep-alive process in the background..."
nohup node scripts/keep-alive.js > keepalive.log 2>&1 &

# Get the PID of the background process
PID=$!
echo "Keep-alive process started with PID: $PID"
echo "Logs are being written to keepalive.log"
echo "To stop the process, run: kill $PID" 