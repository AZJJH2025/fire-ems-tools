#!/bin/bash
# hash-check-bundle.sh - Enhanced script to verify served bundle matches disk files

# Configuration
SERVER_URL=${1:-"http://localhost:5005"}
VERBOSE=${2:-"true"}

echo "======= Data Formatter Bundle Integrity Check ======="
echo "Server URL: $SERVER_URL"
echo "Timestamp: $(date)"
echo ""

# Run the Python script for full diagnostics
if [ -f bundle_integrity.py ]; then
  # Use the enhanced script when available
  if [ "$VERBOSE" == "true" ]; then
    python3 bundle_integrity.py --url "$SERVER_URL" --verbose --test-all --output bundle_check_results.json
  else
    python3 bundle_integrity.py --url "$SERVER_URL" --output bundle_check_results.json
  fi
  RESULT=$?
else
  # Fallback to basic test when script not available
  echo "Enhanced bundle_integrity.py not found, using basic check"
  
  # Check both potential locations
  if [ -f static/js/data-formatter-bundle.js ]; then
    echo "Found bundle in js directory"
    DISK_HASH=$(shasum -a 256 static/js/data-formatter-bundle.js | cut -d' ' -f1)
    DISK_PATH="static/js/data-formatter-bundle.js"
  elif [ -f static/data-formatter-bundle.js ]; then
    echo "Found bundle in static directory"
    DISK_HASH=$(shasum -a 256 static/data-formatter-bundle.js | cut -d' ' -f1)
    DISK_PATH="static/data-formatter-bundle.js"
  else
    echo "ERROR: Bundle not found on disk in expected locations"
    exit 1
  fi
  
  # Get served file
  echo "Fetching bundle from server..."
  SERVED_DATA=$(curl -s "$SERVER_URL/static/data-formatter-bundle.js")
  SERVED_HASH=$(echo "$SERVED_DATA" | shasum -a 256 | cut -d' ' -f1)
  
  # Compare hashes
  if [ "$DISK_HASH" != "$SERVED_HASH" ]; then
    echo "ERROR: Bundle hash mismatch!"
    echo "Disk hash ($DISK_PATH):    $DISK_HASH"
    echo "Served hash:               $SERVED_HASH"
    RESULT=1
  else
    echo "SUCCESS: Bundle integrity verified"
    echo "Hash: $DISK_HASH"
    echo "Path: $DISK_PATH"
    RESULT=0
  fi
fi

# Add timestamp to results for logging
echo "" 
echo "Check completed at $(date)"
echo "Exit code: $RESULT"

exit $RESULT