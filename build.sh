#!/bin/bash
# build.sh - Build script for Render deployment (Includes Python & React Build)

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting full build process..."
echo "Current working directory: $(pwd)"

# --- Python Backend Setup ---
echo "Installing Python dependencies..."
pip install -r requirements.txt
echo "Python dependencies installed."

# --- React Frontend Build ---
# Verify Node.js and npm are available (Render's Python env usually has them)
echo "Checking Node.js environment..."
node -v
npm -v

# Navigate to the React app directory
# *** IMPORTANT: Verify this path is correct relative to repo root ***
REACT_APP_DIR="./static/js/react-data-formatter"
echo "Navigating to React app directory: ${REACT_APP_DIR}"
cd "${REACT_APP_DIR}"

echo "Installing React app dependencies (npm install)..."
npm install
echo "React dependencies installed."

echo "Building React app (npm run build)..."
npm run build # This usually creates a 'build/' or 'dist/' sub-directory
echo "React app built."

# Navigate back to the project root directory
# *** IMPORTANT: Verify path back to root is correct ***
echo "Navigating back to project root..."
cd ../../..