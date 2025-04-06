#!/bin/bash

# Run E2E tests for Fire-EMS Tools
# This script provides an easy way to run Playwright E2E tests

set -e

# Default variables
BROWSER="chromium"
HEADED=false
DEBUG=false
UI=false
BASE_URL="http://localhost:8080"

# Display help message
function show_help {
  echo "Usage: ./run_e2e_tests.sh [options]"
  echo ""
  echo "Options:"
  echo "  --browser=BROWSER   Browser to run tests in (chromium, firefox, webkit)"
  echo "  --headed            Run tests in headed mode (show browser)"
  echo "  --debug             Run tests in debug mode"
  echo "  --ui                Run tests with Playwright UI"
  echo "  --base-url=URL      Base URL for tests (default: http://localhost:8080)"
  echo "  --help              Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./run_e2e_tests.sh --browser=firefox --headed"
  echo "  ./run_e2e_tests.sh --debug"
  echo "  ./run_e2e_tests.sh --ui"
}

# Process command line arguments
for arg in "$@"; do
  case $arg in
    --browser=*)
      BROWSER="${arg#*=}"
      ;;
    --headed)
      HEADED=true
      ;;
    --debug)
      DEBUG=true
      ;;
    --ui)
      UI=true
      ;;
    --base-url=*)
      BASE_URL="${arg#*=}"
      ;;
    --help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $arg"
      show_help
      exit 1
      ;;
  esac
done

# Navigate to e2e directory
cd "$(dirname "$0")/e2e"

# Check if npm is installed
if ! [ -x "$(command -v npm)" ]; then
  echo "Error: npm is not installed. Please install Node.js and npm first."
  exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
  npx playwright install --with-deps
fi

# Build the command
CMD="npx playwright test --project=$BROWSER"

if [ "$HEADED" = true ]; then
  CMD="$CMD --headed"
fi

if [ "$DEBUG" = true ]; then
  CMD="$CMD --debug"
fi

if [ "$UI" = true ]; then
  CMD="$CMD --ui"
fi

# Run the tests
echo "Running E2E tests with browser: $BROWSER"
echo "Base URL: $BASE_URL"
export BASE_URL
eval $CMD

# Check the exit code
if [ $? -eq 0 ]; then
  echo "✅ E2E tests passed successfully!"
else
  echo "❌ E2E tests failed"
  exit 1
fi