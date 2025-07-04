#!/bin/bash
# deploy_react.sh - Deploy the React app to the Flask static directory

# Display current working directory
echo "Current directory: $(pwd)"

# Build the React app
cd /Users/josephhester/fire-ems-tools/react-app
echo "Building React app..."
npm run build-no-check

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "React build failed!"
    exit 1
fi

# Ensure target directories exist
echo "Creating target directories..."
mkdir -p /Users/josephhester/fire-ems-tools/static/react-data-formatter
mkdir -p /Users/josephhester/fire-ems-tools/static/react-response-time-analyzer

# Copy build files to Flask static directories
echo "Copying build files for Data Formatter..."
cp -r /Users/josephhester/fire-ems-tools/react-app/dist/* /Users/josephhester/fire-ems-tools/static/react-data-formatter/

# Check if copy was successful
if [ $? -ne 0 ]; then
    echo "Failed to copy build files for Data Formatter!"
    exit 1
fi

echo "Copying build files for Response Time Analyzer..."
cp -r /Users/josephhester/fire-ems-tools/react-app/dist/* /Users/josephhester/fire-ems-tools/static/react-response-time-analyzer/

# Check if copy was successful
if [ $? -ne 0 ]; then
    echo "Failed to copy build files for Response Time Analyzer!"
    exit 1
fi

echo "React apps deployed successfully to Flask static directories!"
echo "Access the Data Formatter at: http://localhost:5005/data-formatter-react"
echo "Access the Response Time Analyzer at: http://localhost:5005/response-time-analyzer"