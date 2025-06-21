#!/bin/bash
# Fixed restart script based on previously working configuration

# Set the port
PORT=5006

echo "Stopping any existing Flask server processes..."

# Find and kill processes using port 5006
echo "Checking for processes using port $PORT..."
PROCESS_IDS=$(lsof -i :$PORT -t 2>/dev/null)

if [ -n "$PROCESS_IDS" ]; then
    echo "Found processes using port $PORT: $PROCESS_IDS"
    echo "Killing these processes..."
    for PID in $PROCESS_IDS; do
        kill -9 $PID 2>/dev/null
        echo "Killed process $PID"
    done
else
    echo "No processes found using port $PORT"
fi

# Kill any Python processes running app.py
echo "Looking for Python processes running app.py..."
PYTHON_PIDS=$(ps aux | grep "python.*app.py" | grep -v grep | awk '{print $2}')

if [ -n "$PYTHON_PIDS" ]; then
    echo "Found Python processes: $PYTHON_PIDS"
    echo "Killing these processes..."
    for PID in $PYTHON_PIDS; do
        kill -9 $PID 2>/dev/null
        echo "Killed process $PID"
    done
else
    echo "No Python processes running app.py found"
fi

# Wait a moment to ensure all processes are terminated
sleep 2

echo ""
echo "Starting Flask server..."
echo "Make sure to keep this terminal window open while using the application."
echo ""
echo "Access URLs:"
echo "- Data Formatter: http://127.0.0.1:$PORT/data-formatter-react"
echo "- Response Time Analyzer: http://127.0.0.1:$PORT/response-time-analyzer"
echo ""
echo "Press Ctrl+C to stop the server when you're done."
echo ""

# Run the Flask application
cd "$(dirname "$0")"
exec python3 app.py