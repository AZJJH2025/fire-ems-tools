#!/bin/bash
# Script to run visual regression tests for Fire-EMS Tools

# Display help
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
  echo "Visual Regression Testing for Fire-EMS Tools"
  echo ""
  echo "Usage: ./run_visual_regression.sh [options]"
  echo ""
  echo "Options:"
  echo "  --update-baseline    Update baseline screenshots"
  echo "  --pages PAGE1,PAGE2  Test specific pages (comma-separated)"
  echo "  --viewports VIEW1,VIEW2  Test specific viewports (comma-separated)"
  echo "  --threshold VALUE    Set comparison threshold (0.0-1.0)"
  echo "  --browser BROWSER    Set browser (chromium, firefox, webkit)"
  echo "  --url URL            Set application URL"
  echo "  --help, -h           Show this help message"
  echo ""
  exit 0
fi

# Default values
UPDATE_BASELINE=""
PAGES=""
VIEWPORTS=""
THRESHOLD=""
BROWSER=""
URL=""

# Parse command line arguments
while [ "$#" -gt 0 ]; do
  case "$1" in
    --update-baseline)
      UPDATE_BASELINE="--update-baseline"
      ;;
    --pages)
      PAGES="--pages $(echo $2 | tr ',' ' ')"
      shift
      ;;
    --viewports)
      VIEWPORTS="--viewports $(echo $2 | tr ',' ' ')"
      shift
      ;;
    --threshold)
      THRESHOLD="--threshold $2"
      shift
      ;;
    --browser)
      BROWSER="--browser $2"
      shift
      ;;
    --url)
      URL="--url $2"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Run './run_visual_regression.sh --help' for usage information."
      exit 1
      ;;
  esac
  shift
done

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
  echo "Python 3 is not installed. Please install Python 3."
  exit 1
fi

# Check for required Python packages
PACKAGES="playwright opencv-python numpy"
for pkg in $PACKAGES; do
  if ! python3 -c "import $(echo $pkg | cut -d- -f1)" &> /dev/null; then
    echo "Missing Python package: $pkg"
    echo "Installing required packages..."
    pip install $PACKAGES
    break
  fi
done

# Check if Playwright browsers are installed
if ! python3 -c "from playwright.sync_api import sync_playwright; sync_playwright().start()" &> /dev/null; then
  echo "Installing Playwright browsers..."
  python3 -m playwright install
fi

# Start the application server if needed
if [[ -z "$URL" ]]; then
  # Check if server is already running
  if ! curl -s http://localhost:8080 > /dev/null; then
    echo "Starting application server..."
    python3 app.py &
    SERVER_PID=$!
    
    # Wait for server to start
    echo "Waiting for server to start..."
    for i in {1..10}; do
      if curl -s http://localhost:8080 > /dev/null; then
        echo "Server started successfully."
        break
      fi
      if [ $i -eq 10 ]; then
        echo "Failed to start server. Exiting."
        exit 1
      fi
      sleep 1
    done
  else
    echo "Server already running at http://localhost:8080"
  fi
fi

# Run visual regression tests
echo "Running visual regression tests..."
CMD="python3 visual_regression_test.py $UPDATE_BASELINE $PAGES $VIEWPORTS $THRESHOLD $BROWSER $URL"
echo "Executing: $CMD"
$CMD

# Get the exit code
EXIT_CODE=$?

# Stop the server if we started it
if [ -n "$SERVER_PID" ]; then
  echo "Stopping application server..."
  kill $SERVER_PID
fi

# Show report location if tests ran successfully
if [ $EXIT_CODE -eq 0 ]; then
  REPORT=$(ls -t visual_regression/reports/visual_regression_report_*.html | head -n 1)
  if [ -n "$REPORT" ]; then
    echo ""
    echo "Visual regression tests completed successfully!"
    echo "Report available at: $REPORT"
    
    # Try to open the report in the default browser
    if command -v open &> /dev/null; then
      echo "Opening report in browser..."
      open "$REPORT"
    elif command -v xdg-open &> /dev/null; then
      echo "Opening report in browser..."
      xdg-open "$REPORT"
    elif command -v start &> /dev/null; then
      echo "Opening report in browser..."
      start "$REPORT"
    else
      echo "Open the report manually to view results."
    fi
  fi
else
  echo ""
  echo "Visual regression tests failed with exit code $EXIT_CODE"
fi

exit $EXIT_CODE