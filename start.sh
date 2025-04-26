#!/bin/bash
# Script to start the Fire EMS Tools server

# Kill any existing servers
pkill -f "python.*app.py" 2>/dev/null

# Start the server
echo "Starting Fire EMS Tools server..."
python app.py

# Keep the script running until the server is stopped
wait