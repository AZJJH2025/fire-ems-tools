#!/bin/bash

# Script to run end-to-end tests for Fire-EMS Tools

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${YELLOW}\n===== $1 =====${NC}\n"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

# Create test results directory if it doesn't exist
mkdir -p e2e/test-results

# Check for Node.js and npm
if ! command -v npm &> /dev/null; then
    print_error "npm could not be found. Please install Node.js and npm."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "e2e/node_modules" ]; then
    print_header "Installing dependencies"
    cd e2e
    npm install
    cd ..
fi

# Parse arguments
BROWSER="chromium"
HEADED=false
DEBUG=false
UI=false

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --browser) BROWSER="$2"; shift ;;
        --headed) HEADED=true ;;
        --debug) DEBUG=true ;;
        --ui) UI=true ;;
        --help) 
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --browser <browser>  Specify browser (chromium, firefox, webkit)"
            echo "  --headed             Run tests with browser visible"
            echo "  --debug              Run tests in debug mode"
            echo "  --ui                 Run tests with Playwright UI"
            echo "  --help               Show this help message"
            exit 0
            ;;
        *) print_error "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Check if using Docker
USE_DOCKER=false
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    if [ -f "docker-compose.yml" ]; then
        USE_DOCKER=true
    fi
fi

if [ "$USE_DOCKER" = true ]; then
    print_header "Running end-to-end tests with Docker"
    
    # Build and start the application
    docker-compose up -d app
    
    # Build and run the e2e tests
    docker-compose build e2e
    
    # Prepare command with options
    CMD="npx playwright test --browser=$BROWSER"
    
    if [ "$HEADED" = true ]; then
        CMD="$CMD --headed"
    fi
    
    if [ "$DEBUG" = true ]; then
        CMD="$CMD --debug"
    fi
    
    if [ "$UI" = true ]; then
        CMD="$CMD --ui"
    fi
    
    # Run tests
    docker-compose run --rm e2e $CMD
    
    # Stop the application
    docker-compose stop app
else
    print_header "Running end-to-end tests locally"
    
    # Start the application in the background
    print_header "Starting the application"
    python app.py & 
    APP_PID=$!
    
    # Wait for the application to start
    echo "Waiting for the application to start..."
    sleep 5
    
    # Change to e2e directory
    cd e2e
    
    # Prepare command with options
    CMD="npx playwright test --browser=$BROWSER"
    
    if [ "$HEADED" = true ]; then
        CMD="$CMD --headed"
    fi
    
    if [ "$DEBUG" = true ]; then
        CMD="$CMD --debug"
    fi
    
    if [ "$UI" = true ]; then
        CMD="$CMD --ui"
    fi
    
    # Run tests
    print_header "Running tests"
    $CMD
    
    # Return to the root directory
    cd ..
    
    # Stop the application
    print_header "Stopping the application"
    kill $APP_PID
fi

print_success "End-to-end tests completed!"