#!/bin/bash

echo "🧹 Removing Old Bundle Files That Block DataTransformer Integration"
echo "=================================================================="

cd /Users/josephhester/fire-ems-tools/react-app/dist/assets

echo "1. Current assets directory contents:"
ls -la

echo ""
echo "2. Identifying old bundle files to remove..."

# Remove the old ResponseTimeAnalyzerContainer that's causing conflicts
if [ -f "ResponseTimeAnalyzerContainer-ywcn6mRw.js" ]; then
    echo "   🗑️  Removing old ResponseTimeAnalyzerContainer-ywcn6mRw.js"
    rm "ResponseTimeAnalyzerContainer-ywcn6mRw.js"
    echo "   ✅ Old Response Time Analyzer bundle removed"
else
    echo "   ⚠️  Old ResponseTimeAnalyzerContainer-ywcn6mRw.js not found"
fi

# Keep only the new main bundle and essential assets
echo ""
echo "3. Keeping only new bundle and essential files:"
echo "   ✅ Keeping: index-zpIbafUA.js (NEW BUNDLE WITH DATATRANSFORMER)"
echo "   ✅ Keeping: dataTransformer-sQk0oe6p.js (DATATRANSFORMER SERVICE)"
echo "   ✅ Keeping: Other essential libraries (leaflet, xlsx, etc.)"

echo ""
echo "4. After cleanup - directory contents:"
ls -la

echo ""
echo "🎯 SOLUTION APPLIED!"
echo "The old ResponseTimeAnalyzerContainer bundle has been removed."
echo "Now the browser will be forced to load through the new main bundle"
echo "that contains the DataTransformer integration."
echo ""
echo "Next steps:"
echo "1. Hard refresh browser (Cmd+Shift+R)"
echo "2. Go through Data Formatter → Export → Send to Tool process"
echo "3. Look for debug messages: 🚀 🔧 🔥"
echo "4. Verify incidentTime has actual values (not undefined)"
echo ""