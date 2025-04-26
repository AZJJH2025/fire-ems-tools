#!/bin/bash
# build_simple.sh - Simplified build script for Render deployment

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting simplified build process..."
echo "Current working directory: $(pwd)"

# --- Python Setup ---
echo "Installing Python dependencies..."
pip install -r requirements.txt
echo "Python dependencies installed."

# Check for React app directory
if [ -d "./static/js/react-data-formatter" ]; then
  echo "React app directory found, skipping npm build for now."
  # We're skipping the npm build for troubleshooting
  
  # Optional: Try just checking if Node is available without running the build
  if command -v node &> /dev/null && command -v npm &> /dev/null; then
    echo "Node.js and npm are available:"
    node -v
    npm -v
  else
    echo "Node.js or npm are not available. Skipping React build."
  fi
else
  echo "React app directory not found, skipping build."
fi

echo "Build process completed."