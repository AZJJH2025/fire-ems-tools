#!/bin/bash
# build_simple.sh - Build script for Render deployment

set -e  # Exit on any error

echo "🚀 Starting Fire EMS Tools build process..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Build React application
echo "⚛️ Building React application..."
cd react-app

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Build the React app for production
echo "🏗️ Building React app for production..."
npm run build-no-check

# Copy React build to app directory (where Flask serves from)
echo "📁 Copying React build to deployment directory..."
cd ..
rm -rf app/*
cp -r react-app/dist/* app/

echo "✅ Build completed successfully!"
echo "📊 React app deployed to /app directory"
echo "🌐 Ready for Render deployment"