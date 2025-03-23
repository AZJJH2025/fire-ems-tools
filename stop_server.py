import os
import signal
import sys

PID_FILE = "server.pid"

def stop_server():
    """Stop the Flask server using the PID file."""
    if not os.path.exists(PID_FILE):
        print("Server PID file not found. Server may not be running.")
        return False
    
    try:
        with open(PID_FILE, 'r') as f:
            pid = int(f.read().strip())
        
        print(f"Stopping server with PID: {pid}")
        os.kill(pid, signal.SIGTERM)
        
        # Remove the PID file
        os.remove(PID_FILE)
        print("Server stopped successfully.")
        return True
    except (ValueError, ProcessLookupError) as e:
        print(f"Error stopping server: {e}")
        # Clean up stale PID file
        if os.path.exists(PID_FILE):
            os.remove(PID_FILE)
        return False

if __name__ == "__main__":
    stop_server()