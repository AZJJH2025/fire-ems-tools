#!/usr/bin/env python3
"""
Watchdog script to keep the Flask server running.
This script will restart the server if it crashes.
"""
import subprocess
import time
import sys
import os
import signal

def main():
    server_script = "simple_server.py"
    print(f"\n\n========== WATCHDOG STARTED ==========")
    print(f"Monitoring and auto-restarting {server_script}")
    print(f"Press Ctrl+C to stop the watchdog and server\n")
    
    # Register signal handler for graceful shutdown
    def signal_handler(sig, frame):
        print("\nShutting down watchdog and server...")
        if process and process.poll() is None:
            process.terminate()
            process.wait(timeout=5)
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    
    # Keep trying to start the server
    while True:
        print("\n----- Starting Flask server -----")
        
        # Start the server process
        process = subprocess.Popen(
            [sys.executable, server_script],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        # Monitor the server process
        while process.poll() is None:
            # Read output line by line
            line = process.stdout.readline()
            if line:
                print(line.strip())
            time.sleep(0.1)
        
        # Server has stopped
        exit_code = process.returncode
        print(f"\n----- Server stopped with exit code {exit_code} -----")
        print("Restarting server in 3 seconds...")
        time.sleep(3)

if __name__ == "__main__":
    main()