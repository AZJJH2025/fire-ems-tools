from flask import Flask, send_from_directory, render_template
from flask_cors import CORS
import os
import sys
import subprocess
import signal
import time
import atexit

# Flask Setup
app = Flask(__name__, static_folder="static", static_url_path="/static")
CORS(app)

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

# Home page route
@app.route("/")
def home():
    return render_template("index.html")

# Incident Logger route
@app.route('/incident-logger')
def incident_logger():
    try:
        return render_template('incident-logger.html')
    except Exception as e:
        return f"Error: {str(e)}", 500

# Simple test routes for debugging
@app.route('/simple-test')
def simple_test():
    """Serve a simple test page"""
    return send_from_directory('static', 'simple-test.html')

@app.route('/simple-incident-logger')
def simple_incident_logger():
    """Serve a simplified incident logger page"""
    return send_from_directory('static', 'simple-incident-logger.html')

# API endpoints for Incident Logger
@app.route('/api/incident/list', methods=['GET'])
def list_incidents():
    """List all incidents"""
    incidents_dir = os.path.join('data', 'incidents')
    os.makedirs(incidents_dir, exist_ok=True)
    return {"incidents": []}, 200

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