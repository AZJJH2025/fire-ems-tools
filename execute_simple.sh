#!/bin/bash

echo "🔄 Starting enhanced debugging rebuild and deployment..."

# Step 1: Clean build cache
echo "1. Cleaning build cache..."
cd /Users/josephhester/fire-ems-tools/react-app

if [ -d "dist" ]; then
    rm -rf dist
    echo "   ✅ Removed dist directory"
fi

if [ -d "node_modules/.vite" ]; then
    rm -rf node_modules/.vite
    echo "   ✅ Removed Vite cache"
fi

# Step 2: Build React app
echo "2. Building React app with enhanced debugging..."
npm run build-no-check

if [ $? -eq 0 ]; then
    echo "   ✅ Build completed successfully!"
else
    echo "   ❌ Build failed!"
    exit 1
fi

# Step 3: Deploy to app directory
echo "3. Deploying to app directory..."
cd /Users/josephhester/fire-ems-tools

if [ -d "app" ]; then
    rm -rf app
    echo "   ✅ Removed old app directory"
fi

cp -r react-app/dist app
echo "   ✅ Copied new build to app directory"

# Step 4: Fix HTML script paths
echo "4. Fixing HTML script paths..."
sed -i '' 's|src="/assets/|src="/app/assets/|g' app/index.html
echo "   ✅ Fixed HTML script paths"

# Step 5: Verify debugging code
echo "5. Verifying enhanced debugging code..."
if grep -r "NORMALIZE FUNCTION CALLED" app/ > /dev/null; then
    echo "   ✅ Enhanced debugging code found in build!"
else
    echo "   ❌ Enhanced debugging code NOT found in build!"
    if grep -r "NORMALIZE FUNCTION CALLED" react-app/src/ > /dev/null; then
        echo "   ⚠️ Code exists in source but not in build - build may have failed"
    else
        echo "   ❌ Code not found in source either!"
    fi
    exit 1
fi

echo ""
echo "🚀 Enhanced debugging deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Restart the Flask server"
echo "2. Send data from Data Formatter to Response Time Analyzer"
echo "3. Check browser console for enhanced debugging output:"
echo "   - 🔍 NORMALIZE FUNCTION CALLED"
echo "   - === FIELD DEBUGGING START ==="
echo "   - Location-related field analysis"