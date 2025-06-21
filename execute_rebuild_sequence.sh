#!/bin/bash

# Enhanced Debugging Code Rebuild and Deployment Sequence
echo "Starting enhanced debugging code rebuild and deployment..."

# Step 1: Navigate to React app directory and clean old build
echo "Step 1: Cleaning old build..."
cd /Users/josephhester/fire-ems-tools/react-app
rm -rf dist

# Step 2: Rebuild React app
echo "Step 2: Rebuilding React app..."
npm run build-no-check

# Step 3: Navigate back to project root
echo "Step 3: Navigating to project root..."
cd /Users/josephhester/fire-ems-tools

# Step 4: Remove old app directory
echo "Step 4: Removing old app directory..."
rm -rf app

# Step 5: Copy new build to app directory
echo "Step 5: Copying new build to app directory..."
cp -r react-app/dist app

# Step 6: Fix HTML script paths
echo "Step 6: Fixing HTML script paths..."
sed -i 's|src="/assets/|src="/app/assets/|g' app/index.html

# Step 7: Verify debugging code is in build
echo "Step 7: Verifying debugging code is in build..."
echo "Searching for NORMALIZE_FUNCTION_CALLED in build files..."
grep -r "NORMALIZE_FUNCTION_CALLED" app/assets/ || echo "Warning: NORMALIZE_FUNCTION_CALLED not found in build"

echo "Rebuild and deployment sequence complete!"
echo "Enhanced debugging code should now be active."