#!/bin/bash
# build.sh - Build script for Render deployment

# Exit on error
set -e

echo "Starting build process..."

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Prepare static directory
echo "Checking static directory paths..."
REPO_ROOT=$(pwd)
STATIC_SRC="${REPO_ROOT}/static"
STATIC_DEST="/opt/render/project/src/static"

# Ensure static directory exists
mkdir -p "${STATIC_DEST}"

# Check if source and destination are different before copying
if [ "$(realpath ${STATIC_SRC})" != "$(realpath ${STATIC_DEST})" ]; then
  echo "Copying static files from ${STATIC_SRC} to ${STATIC_DEST}..."
  cp -rv "${STATIC_SRC}/"* "${STATIC_DEST}/"
else
  echo "Static source and destination are the same, skipping copy operation"
  echo "Static files are already at the correct location: ${STATIC_DEST}"
fi

# List contents to verify files exist
echo "Listing contents of static directory:"
ls -la "${STATIC_DEST}"

# Verify critical CSS file exists
echo "Verifying critical CSS file exists:"
ls -la "${STATIC_DEST}/fireems-framework.css" 2>/dev/null || echo "WARNING: fireems-framework.css not found!"

echo "Build process completed successfully!"