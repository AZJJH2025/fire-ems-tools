#!/bin/bash

echo "🔧 Fixing Flask Deployment - Copying Updated Build"
echo "=================================================="

# Navigate to project directory
cd /Users/josephhester/fire-ems-tools

# Show what we're copying
echo "1. Checking source directory (/app/)..."
if [ -d "app" ]; then
    echo "   ✅ Source directory exists"
    echo "   📁 Files in app/: $(ls app/ | wc -l) items"
    echo "   📦 Assets in app/assets/: $(ls app/assets/ | wc -l) files"
else
    echo "   ❌ Source directory not found!"
    exit 1
fi

echo "2. Checking target directory (/react-app/dist/)..."
if [ -d "react-app/dist" ]; then
    echo "   ✅ Target directory exists"
    echo "   📁 Current files in react-app/dist/: $(ls react-app/dist/ | wc -l) items"
else
    echo "   ❌ Target directory not found!"
    exit 1
fi

# Copy the updated build
echo "3. Copying updated build with DataTransformer integration..."
cp -r app/* react-app/dist/

if [ $? -eq 0 ]; then
    echo "   ✅ Copy completed successfully!"
    echo "   📦 New assets in react-app/dist/assets/: $(ls react-app/dist/assets/ | wc -l) files"
else
    echo "   ❌ Copy failed!"
    exit 1
fi

# Verify the key files
echo "4. Verifying critical files..."
if [ -f "react-app/dist/index.html" ]; then
    echo "   ✅ index.html found"
    # Check if it references the new bundle
    if grep -q "index-zpIbafUA.js" react-app/dist/index.html; then
        echo "   ✅ HTML references new bundle: index-zpIbafUA.js"
    else
        echo "   ⚠️  HTML may not reference the correct bundle"
    fi
else
    echo "   ❌ index.html not found!"
fi

if [ -f "react-app/dist/assets/index-zpIbafUA.js" ]; then
    echo "   ✅ New bundle found: index-zpIbafUA.js"
    echo "   📊 Bundle size: $(du -h react-app/dist/assets/index-zpIbafUA.js | cut -f1)"
else
    echo "   ❌ New bundle not found!"
fi

echo ""
echo "🎯 DEPLOYMENT FIX COMPLETE!"
echo "Flask will now serve the updated build with DataTransformer integration"
echo ""
echo "Next steps:"
echo "1. Hard refresh your browser (Cmd+Shift+R)"
echo "2. Go to: http://127.0.0.1:5006/app/response-time-analyzer"
echo "3. Look for debug messages: 🚀 🔧 🔥"
echo "4. Verify incidentTime has actual values (not undefined)"
echo ""