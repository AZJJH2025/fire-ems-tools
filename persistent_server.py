import os
import sys
import subprocess
import signal
import time
import atexit

# Import the Flask app from app.py
from app import app

# Create a PID file to track the server process
PID_FILE = "server.pid"

def write_pid():
    """Write the current process ID to a file."""
    with open(PID_FILE, 'w') as f:
        f.write(str(os.getpid()))

def cleanup():
    """Remove PID file on exit."""
    if os.path.exists(PID_FILE):
        os.remove(PID_FILE)

# Register cleanup function to run on exit
atexit.register(cleanup)

if __name__ == "__main__":
    # Write PID to file for later reference
    write_pid()
    
    # Print helpful message
    print("=" * 50)
    print("Persistent Flask Server")
    print("=" * 50)
    print(f"Process ID: {os.getpid()}")
    print("Server running at: http://localhost:8080/")
    print("To stop the server: python stop_server.py")
    print("=" * 50)
    
    # Run the app with increased timeout
    app.run(host="0.0.0.0", port=8080, debug=True, use_reloader=False)