#!/usr/bin/env python3
"""
Flask server that proxies requests to the Vite development server.
This combines the reliability of the Flask server with the development features of Vite.
"""
from flask import Flask, request, Response, jsonify
import requests
from requests.exceptions import RequestException
import os
import sys
import subprocess
import time
import threading
import signal
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("formatter_proxy.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Flask app
app = Flask(__name__)

# Vite server info
VITE_PORT = 5173  # Default Vite port
VITE_HOST = "localhost"
VITE_URL = f"http://{VITE_HOST}:{VITE_PORT}"

# Process handle for the Vite server
vite_process = None

def start_vite_server():
    """Start the Vite development server as a subprocess"""
    global vite_process
    
    logger.info("Starting Vite development server...")
    
    # Change to the react-app directory
    react_app_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "react-app")
    
    # Start the Vite server with explicit host and port
    cmd = ["npx", "vite", "--host", "localhost", "--port", str(VITE_PORT)]
    
    try:
        vite_process = subprocess.Popen(
            cmd,
            cwd=react_app_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Log process output in a separate thread
        def log_output():
            while vite_process and vite_process.poll() is None:
                output = vite_process.stdout.readline()
                if output:
                    logger.info(f"Vite: {output.strip()}")
                
                error = vite_process.stderr.readline()
                if error:
                    logger.error(f"Vite error: {error.strip()}")
                
                time.sleep(0.1)
        
        threading.Thread(target=log_output, daemon=True).start()
        
        # Wait for server to start
        logger.info(f"Waiting for Vite server to start on {VITE_URL}...")
        retries = 0
        max_retries = 10
        
        while retries < max_retries:
            try:
                response = requests.get(f"{VITE_URL}/", timeout=1)
                if response.status_code == 200:
                    logger.info(f"Vite server is running at {VITE_URL}")
                    return True
            except RequestException:
                retries += 1
                time.sleep(1)
        
        logger.error(f"Failed to start Vite server after {max_retries} attempts")
        return False
        
    except Exception as e:
        logger.error(f"Error starting Vite server: {str(e)}")
        return False

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def proxy(path):
    """Proxy all requests to the Vite development server"""
    target_url = f"{VITE_URL}/{path}"
    logger.info(f"Proxying request to: {target_url}")
    
    try:
        # Forward the request to the Vite server
        resp = requests.request(
            method=request.method,
            url=target_url,
            headers={key: value for key, value in request.headers if key != 'Host'},
            data=request.get_data(),
            cookies=request.cookies,
            allow_redirects=False,
            timeout=10
        )
        
        # Create a Flask response from the Vite response
        response = Response(resp.content, resp.status_code)
        
        # Copy the headers from the Vite response
        for name, value in resp.headers.items():
            if name.lower() not in ('content-encoding', 'transfer-encoding', 'content-length'):
                response.headers[name] = value
        
        return response
    except RequestException as e:
        logger.error(f"Error proxying request: {str(e)}")
        return jsonify({'error': 'Error connecting to development server'}), 500

def shutdown_vite():
    """Shutdown the Vite server when the Flask server exits"""
    global vite_process
    
    if vite_process:
        logger.info("Shutting down Vite server...")
        try:
            # Try graceful termination first
            vite_process.terminate()
            vite_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            # Force kill if it doesn't terminate gracefully
            vite_process.kill()
            logger.warning("Had to force kill the Vite server")

def signal_handler(sig, frame):
    """Handle SIGINT and SIGTERM to gracefully shutdown the servers"""
    logger.info("Received shutdown signal")
    shutdown_vite()
    sys.exit(0)

if __name__ == '__main__':
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Try to start the Vite server
    if not start_vite_server():
        logger.error("Cannot continue without Vite server")
        sys.exit(1)
    
    # Get the port from command line args or use default
    port = int(os.environ.get("PORT", 7777))
    
    try:
        # Start the Flask app
        logger.info(f"Starting proxy server on port {port}")
        logger.info(f"Access the new data formatter at: http://localhost:{port}/")
        app.run(host='0.0.0.0', port=port, debug=True, use_reloader=False)
    finally:
        # Ensure Vite server is shut down
        shutdown_vite()