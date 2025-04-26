#!/bin/bash

echo "Stopping server..."

if [ -f server.pid ]; then
    PID=$(cat server.pid)
    if ps -p $PID > /dev/null; then
        echo "Killing process $PID"
        kill $PID
        rm server.pid
        echo "Server stopped"
    else
        echo "Process $PID not found"
        pkill -f "python.*app.py" || echo "No Python processes running"
        rm server.pid
    fi
else
    echo "No PID file found, trying to find Python processes"
    pkill -f "python.*app.py" || echo "No Python processes running"
fi

echo "Server shutdown complete"