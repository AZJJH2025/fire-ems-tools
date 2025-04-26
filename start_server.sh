#!/bin/bash

# Kill any existing Python processes
echo "Checking for existing Python processes..."
pkill -f "python.*app.py" || echo "No Python processes running"

# Wait for ports to clear
echo "Waiting for ports to clear..."
sleep 2

# Try multiple ports
PORT_LIST=(8080 8090 8000 9000 5000 7000 3000)

for PORT in "${PORT_LIST[@]}"; do
    echo "Trying to start server on port $PORT..."
    
    # Check if port is already in use
    if ! lsof -i :$PORT > /dev/null; then
        echo "Port $PORT is available. Starting server..."
        python3 app.py port=$PORT &
        
        # Save process ID
        echo $! > server.pid
        
        # Wait for server to start
        sleep 2
        
        # Check if server is running
        if lsof -i :$PORT > /dev/null; then
            echo "Server started successfully on port $PORT"
            echo "Access at: http://localhost:$PORT/"
            echo "Open Incident Logger at: http://localhost:$PORT/incident-logger"
            echo "For testing, visit: http://localhost:$PORT/medical-test"
            exit 0
        else
            echo "Server failed to start on port $PORT"
        fi
    else
        echo "Port $PORT is in use, trying next port..."
    fi
done

echo "Failed to start server on any port. Please check your network configuration."
exit 1