import subprocess
import os
import time
import sys

def start_server():
    """Start the Flask server in the background."""
    # Check if server is already running
    if os.path.exists("server.pid"):
        try:
            with open("server.pid", "r") as f:
                pid = int(f.read().strip())
            # Check if process is running
            os.kill(pid, 0)  # This will raise an error if the process is not running
            print(f"Server is already running with PID: {pid}")
            print("Access it at: http://localhost:8080/")
            return
        except (ProcessLookupError, ValueError, OSError):
            # Process not running or invalid PID, clean up the file
            os.remove("server.pid")
            print("Cleaned up stale PID file, starting new server...")

    # Choose the server script to use (persistent_server.py for background running)
    server_script = "persistent_server.py"
    
    # Start the server process in the background
    if sys.platform == 'win32':
        # Windows version
        proc = subprocess.Popen(
            ["start", "python", server_script],
            shell=True,
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
    else:
        # Unix/Mac version - using nohup to keep it running after terminal closes
        log_file = open("server.log", "w")
        subprocess.Popen(
            ["nohup", "python3", server_script, "&"],
            stdout=log_file,
            stderr=log_file,
            preexec_fn=os.setpgrp
        )
    
    # Give the server a moment to start
    time.sleep(2)
    
    # Check if the server started successfully
    if os.path.exists("server.pid"):
        with open("server.pid", "r") as f:
            pid = int(f.read().strip())
        print(f"Server started successfully with PID: {pid}")
        print("Access it at: http://localhost:8080/")
        print("To stop the server, run: python stop_server.py")
    else:
        print("Server may have failed to start. Check server.log file for details.")

if __name__ == "__main__":
    start_server()