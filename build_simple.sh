#!/bin/bash
# build_simple.sh - Build script for Render deployment

echo "🚀 Starting Fire EMS Tools build process..."

# Install Python dependencies (Render already did this)
echo "📦 Python dependencies already installed by Render..."

# Install Node.js dependencies and build React app
echo "⚛️ Building React app with latest changes..."
cd react-app

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Build React app with latest hydrant fixes
echo "🔨 Building React app..."
npm run build

# Copy fresh build to /app directory
echo "📋 Copying fresh build to /app directory..."
cd ..
rm -rf app/assets/*  # Clear old cached files
cp -r react-app/dist/* app/

echo "✅ Build completed successfully!"
echo "📊 React app built and deployed to /app directory"
echo "🌐 Ready for Render deployment with latest hydrant fixes"