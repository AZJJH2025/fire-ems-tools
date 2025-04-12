#!/bin/bash
# build.sh - Build script for Render deployment

# Exit on error
set -e

echo "Starting build process..."

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Ensure static directory exists at Render's path
echo "Creating static directory..."
mkdir -p /opt/render/project/src/static

# Copy all static files to the Render static directory
echo "Copying static files..."
cp -rv ./static/* /opt/render/project/src/static/

# List contents to verify files were copied
echo "Listing contents of deployed static directory:"
ls -la /opt/render/project/src/static/

echo "Build process completed successfully!"